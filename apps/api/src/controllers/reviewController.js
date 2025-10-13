/**
 * @fileoverview Enhanced Review Controller for LUDUS Platform - LDS-015 Implementation
 * @module controllers/reviewController
 * 
 * This controller provides comprehensive review management functionality including:
 * - Activity review CRUD operations
 * - Review moderation and approval workflow
 * - Partner response management
 * - Review analytics and reporting
 * - Helpful votes and social features
 * - RTL support for Arabic users
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const mongoose = require('mongoose');
const ReviewEnhanced = require('../models/ReviewEnhanced');
const Activity = require('../models/Activity');
const ActivityEnhanced = require('../models/ActivityEnhanced');
const Booking = require('../models/Booking');
const BookingEnhanced = require('../models/BookingEnhanced');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

/**
 * Create a new review for an activity.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      activityId,
      bookingId,
      rating,
      comment,
      commentAr,
      images = [],
      helpful = false
    } = req.body;

    // Validate required fields
    if (!activityId || !bookingId || !rating || !rating.overall) {
      return res.status(400).json({
        success: false,
        message: 'Activity ID, booking ID, and overall rating are required'
      });
    }

    // Check if user has already reviewed this activity
    const existingReview = await ReviewEnhanced.findOne({
      'user.id': userId,
      'activity.id': activityId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this activity'
      });
    }

    // Verify booking belongs to user and is completed
    const booking = await BookingEnhanced.findById(bookingId);
    if (!booking || booking.user.toString() !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or does not belong to you'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed bookings'
      });
    }

    // Get activity and user information
    const [activity, user] = await Promise.all([
      ActivityEnhanced.findById(activityId).populate('partner', 'businessName businessNameAr'),
      User.findById(userId).select('name nameAr avatar')
    ]);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Process images if provided
    const processedImages = [];
    for (const image of images) {
      if (image.url) {
        processedImages.push({
          url: image.url,
          caption: image.caption || '',
          captionAr: image.captionAr || '',
          uploadedAt: new Date()
        });
      }
    }

    // Create review
    const review = new ReviewEnhanced({
      user: {
        id: userId,
        name: user.name,
        nameAr: user.nameAr,
        avatar: user.avatar
      },
      activity: {
        id: activityId,
        title: activity.title,
        titleEn: activity.titleEn
      },
      booking: {
        id: bookingId,
        bookingNumber: booking.bookingNumber
      },
      rating: {
        overall: rating.overall,
        categories: {
          value: rating.value || rating.overall,
          service: rating.service || rating.overall,
          location: rating.location || rating.overall,
          communication: rating.communication || rating.overall
        }
      },
      comment: comment || '',
      commentAr: commentAr || '',
      images: processedImages,
      isVerified: true, // Auto-verify reviews from completed bookings
      status: 'approved', // Auto-approve verified reviews
      metadata: {
        source: 'web',
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    });

    await review.save();

    // Update activity rating
    await updateActivityRating(activityId);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
};

/**
 * Get reviews for an activity.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getActivityReviews = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      rating,
      verified,
      hasImages
    } = req.query;

    const query = { 'activity.id': activityId, status: 'approved' };

    // Apply filters
    if (rating) {
      query['rating.overall'] = parseInt(rating);
    }
    if (verified === 'true') {
      query.isVerified = true;
    }
    if (hasImages === 'true') {
      query.images = { $exists: true, $not: { $size: 0 } };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [reviews, total] = await Promise.all([
      ReviewEnhanced.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ReviewEnhanced.countDocuments(query)
    ]);

    // Calculate rating statistics
    const ratingStats = await ReviewEnhanced.aggregate([
      { $match: { 'activity.id': mongoose.Types.ObjectId(activityId), status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating.overall' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating.overall'
          }
        }
      }
    ]);

    const stats = ratingStats[0] || {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: []
    };

    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats.ratingDistribution.forEach(rating => {
      distribution[rating] = (distribution[rating] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        statistics: {
          averageRating: Math.round(stats.averageRating * 10) / 10,
          totalReviews: stats.totalReviews,
          ratingDistribution: distribution
        }
      }
    });

  } catch (error) {
    console.error('Get activity reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity reviews',
      error: error.message
    });
  }
};

/**
 * Get user's reviews.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status = 'all' } = req.query;

    const query = { 'user.id': userId };
    if (status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      ReviewEnhanced.find(query)
        .populate('activity.id', 'title titleEn images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ReviewEnhanced.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user reviews',
      error: error.message
    });
  }
};

/**
 * Update a review.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const { rating, comment, commentAr, images } = req.body;

    const review = await ReviewEnhanced.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.user.id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    // Update review fields
    if (rating) {
      review.rating = {
        overall: rating.overall || review.rating.overall,
        categories: {
          value: rating.value || review.rating.categories.value,
          service: rating.service || review.rating.categories.service,
          location: rating.location || review.rating.categories.location,
          communication: rating.communication || review.rating.categories.communication
        }
      };
    }

    if (comment !== undefined) review.comment = comment;
    if (commentAr !== undefined) review.commentAr = commentAr;

    if (images) {
      // Process new images
      const processedImages = [];
      for (const image of images) {
        if (image.url) {
          processedImages.push({
            url: image.url,
            caption: image.caption || '',
            captionAr: image.captionAr || '',
            uploadedAt: new Date()
          });
        }
      }
      review.images = processedImages;
    }

    await review.save();

    // Update activity rating
    await updateActivityRating(review.activity.id);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
};

/**
 * Delete a review.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await ReviewEnhanced.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review or is admin
    if (review.user.id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    // Delete images from Cloudinary
    for (const image of review.images) {
      if (image.url) {
        try {
          await deleteFromCloudinary(image.url);
        } catch (error) {
          console.error('Error deleting image from Cloudinary:', error);
        }
      }
    }

    await ReviewEnhanced.findByIdAndDelete(reviewId);

    // Update activity rating
    await updateActivityRating(review.activity.id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};

/**
 * Add helpful vote to a review.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const addHelpfulVote = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await ReviewEnhanced.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.addHelpfulVote(userId);

    res.status(200).json({
      success: true,
      message: 'Helpful vote added successfully',
      data: {
        helpfulCount: review.helpful.count
      }
    });

  } catch (error) {
    console.error('Add helpful vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add helpful vote',
      error: error.message
    });
  }
};

/**
 * Remove helpful vote from a review.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const removeHelpfulVote = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await ReviewEnhanced.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.removeHelpfulVote(userId);

    res.status(200).json({
      success: true,
      message: 'Helpful vote removed successfully',
      data: {
        helpfulCount: review.helpful.count
      }
    });

  } catch (error) {
    console.error('Remove helpful vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove helpful vote',
      error: error.message
    });
  }
};

/**
 * Add partner response to a review.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const addPartnerResponse = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment, commentAr } = req.body;
    const userId = req.user.id;

    const review = await ReviewEnhanced.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Get activity to verify partner
    const activity = await ActivityEnhanced.findById(review.activity.id);
    if (!activity || activity.partner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only respond to reviews for your activities'
      });
    }

    // Get partner information
    const partner = await Vendor.findById(userId).select('businessName businessNameAr');
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const partnerInfo = {
      id: userId,
      name: partner.businessName,
      nameAr: partner.businessNameAr
    };

    await review.addPartnerResponse(partnerInfo, comment, commentAr);

    res.status(200).json({
      success: true,
      message: 'Partner response added successfully',
      data: review
    });

  } catch (error) {
    console.error('Add partner response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add partner response',
      error: error.message
    });
  }
};

/**
 * Get review analytics.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getReviewAnalytics = async (req, res) => {
  try {
    const { period = '30d', activityId } = req.query;
    const userId = req.user.id;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const matchQuery = {
      createdAt: { $gte: startDate, $lte: now },
      status: 'approved'
    };

    if (activityId) {
      matchQuery['activity.id'] = mongoose.Types.ObjectId(activityId);
    }

    // Get review statistics
    const reviewStats = await ReviewEnhanced.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating.overall' },
          verifiedReviews: { $sum: { $cond: ['$isVerified', 1, 0] } },
          reviewsWithImages: { $sum: { $cond: [{ $gt: [{ $size: '$images' }, 0] }, 1, 0] } },
          reviewsWithResponses: { $sum: { $cond: [{ $ne: ['$response.comment', null] }, 1, 0] } },
          totalHelpfulVotes: { $sum: '$helpful.count' }
        }
      }
    ]);

    // Get rating distribution
    const ratingDistribution = await ReviewEnhanced.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$rating.overall',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get category ratings
    const categoryRatings = await ReviewEnhanced.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          averageValue: { $avg: '$rating.categories.value' },
          averageService: { $avg: '$rating.categories.service' },
          averageLocation: { $avg: '$rating.categories.location' },
          averageCommunication: { $avg: '$rating.categories.communication' }
        }
      }
    ]);

    // Get monthly trends
    const monthlyTrends = await ReviewEnhanced.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          averageRating: { $avg: '$rating.overall' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const stats = reviewStats[0] || {
      totalReviews: 0,
      averageRating: 0,
      verifiedReviews: 0,
      reviewsWithImages: 0,
      reviewsWithResponses: 0,
      totalHelpfulVotes: 0
    };

    const categories = categoryRatings[0] || {
      averageValue: 0,
      averageService: 0,
      averageLocation: 0,
      averageCommunication: 0
    };

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate: now },
        statistics: {
          totalReviews: stats.totalReviews,
          averageRating: Math.round(stats.averageRating * 10) / 10,
          verifiedReviews: stats.verifiedReviews,
          reviewsWithImages: stats.reviewsWithImages,
          reviewsWithResponses: stats.reviewsWithResponses,
          totalHelpfulVotes: stats.totalHelpfulVotes,
          verificationRate: stats.totalReviews > 0 ? Math.round((stats.verifiedReviews / stats.totalReviews) * 100) : 0,
          responseRate: stats.totalReviews > 0 ? Math.round((stats.reviewsWithResponses / stats.totalReviews) * 100) : 0
        },
        ratingDistribution: ratingDistribution.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        categoryRatings: {
          value: Math.round(categories.averageValue * 10) / 10,
          service: Math.round(categories.averageService * 10) / 10,
          location: Math.round(categories.averageLocation * 10) / 10,
          communication: Math.round(categories.averageCommunication * 10) / 10
        },
        monthlyTrends
      }
    });

  } catch (error) {
    console.error('Get review analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get review analytics',
      error: error.message
    });
  }
};

/**
 * Moderate a review (admin only).
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const moderateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status, notes } = req.body;
    const moderatorId = req.user.id;

    const review = await ReviewEnhanced.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.updateStatus(status, moderatorId, notes);

    res.status(200).json({
      success: true,
      message: `Review ${status} successfully`,
      data: review
    });

  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate review',
      error: error.message
    });
  }
};

/**
 * Get pending reviews for moderation (admin only).
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getPendingReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'pending' } = req.query;

    const query = { status };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      ReviewEnhanced.find(query)
        .populate('activity.id', 'title titleEn')
        .populate('user.id', 'name nameAr')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ReviewEnhanced.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending reviews',
      error: error.message
    });
  }
};

/**
 * Update activity rating based on reviews.
 * @param {string} activityId - The activity ID
 * @returns {Promise<void>}
 */
const updateActivityRating = async (activityId) => {
  try {
    const ratingStats = await ReviewEnhanced.aggregate([
      { $match: { 'activity.id': mongoose.Types.ObjectId(activityId), status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating.overall' },
          totalReviews: { $sum: 1 },
          categoryRatings: {
            $avg: {
              value: '$rating.categories.value',
              service: '$rating.categories.service',
              location: '$rating.categories.location',
              communication: '$rating.categories.communication'
            }
          }
        }
      }
    ]);

    if (ratingStats.length > 0) {
      const stats = ratingStats[0];
      await ActivityEnhanced.findByIdAndUpdate(activityId, {
        'rating.average': Math.round(stats.averageRating * 10) / 10,
        'rating.count': stats.totalReviews,
        'rating.categories': {
          value: Math.round(stats.categoryRatings.value * 10) / 10,
          service: Math.round(stats.categoryRatings.service * 10) / 10,
          location: Math.round(stats.categoryRatings.location * 10) / 10,
          communication: Math.round(stats.categoryRatings.communication * 10) / 10
        }
      });
    }
  } catch (error) {
    console.error('Update activity rating error:', error);
  }
};

module.exports = {
  createReview,
  getActivityReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  addHelpfulVote,
  removeHelpfulVote,
  addPartnerResponse,
  getReviewAnalytics,
  moderateReview,
  getPendingReviews
};
