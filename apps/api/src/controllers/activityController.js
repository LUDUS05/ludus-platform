/**
 * @fileoverview Enhanced Activity Controller for LUDUS Platform - LDS-012 Implementation
 * @module controllers/activityController
 *
 * This controller provides comprehensive activity management functionality including:
 * - Activity CRUD operations
 * - Advanced search and filtering
 * - Category and partner management
 * - Pricing and scheduling management
 * - Media management
 * - Analytics and reporting
 * - RTL support for Arabic users
 *
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const Activity = require('../models/Activity');
const ActivityEnhanced = require('../models/ActivityEnhanced');
const Category = require('../models/CategoryEnhanced');
const Partner = require('../models/PartnerEnhanced');
const Booking = require('../models/Booking');
const BookingEnhanced = require('../models/BookingEnhanced');
const { validationResult } = require('express-validator');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

/**
 * Get all activities with filters, pagination, and sorting.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const city = req.query.city || '';
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build filter object
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (city) {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }

    if (minPrice !== null || maxPrice !== null) {
      filter['pricing.basePrice'] = {};
      if (minPrice !== null) filter['pricing.basePrice'].$gte = minPrice;
      if (maxPrice !== null) filter['pricing.basePrice'].$lte = maxPrice;
    }

    // Get activities with pagination
    const activities = await Activity.find(filter)
      .populate('vendor', 'businessName location.city location.state rating')
      .sort({ [sortBy]: sortOrder })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const totalActivities = await Activity.countDocuments(filter);

    // Get filter options for frontend
    const categories = await Activity.distinct('category', { isActive: true });
    const cities = await Activity.distinct('location.city', { isActive: true });
    const priceRange = await Activity.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$pricing.basePrice' },
          maxPrice: { $max: '$pricing.basePrice' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalActivities / limit),
        totalActivities,
        hasMore: page < Math.ceil(totalActivities / limit)
      },
      filters: {
        categories: categories.sort(),
        cities: cities.sort(),
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
      },
      animationConfig: {
        staggerDelay: 0.1,
        duration: 0.6,
        entrance: 'slideUp',
        loadingType: 'skeleton'
      }
    });

  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities'
    });
  }
};

/**
 * Get a single activity by its ID, along with related activities.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      isActive: true
    })
      .populate('vendor', 'businessName description location contactInfo rating totalReviews')
      .lean();

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Get related activities (same category, different activity)
    const relatedActivities = await Activity.find({
      category: activity.category,
      _id: { $ne: activity._id },
      isActive: true
    })
      .populate('vendor', 'businessName rating')
      .limit(4)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        activity,
        relatedActivities
      }
    });

  } catch (error) {
    console.error('Get activity by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity details'
    });
  }
};

/**
 * Search for activities based on a query string.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const searchActivities = async (req, res) => {
  try {
    const query = req.query.q || '';
    const limit = parseInt(req.query.limit) || 10;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const activities = await Activity.find({
      isActive: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
        { category: { $regex: query, $options: 'i' } }
      ]
    })
      .populate('vendor', 'businessName location.city')
      .limit(limit)
      .select('title description category pricing.basePrice pricing.currency location images')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        activities,
        query,
        count: activities.length
      }
    });

  } catch (error) {
    console.error('Search activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search activities'
    });
  }
};

/**
 * Get a list of popular activities.
 * Popularity is determined by total bookings, vendor rating, and creation date.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getPopularActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    // Get activities sorted by popularity metrics
    const activities = await Activity.find({ isActive: true })
      .populate('vendor', 'businessName rating')
      .sort({
        totalBookings: -1,
        'vendor.rating': -1,
        createdAt: -1
      })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        activities
      }
    });

  } catch (error) {
    console.error('Get popular activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular activities'
    });
  }
};

/**
 * Get activities by category with pagination.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getActivitiesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const filter = {
      category: category.toLowerCase(),
      isActive: true
    };

    const activities = await Activity.find(filter)
      .populate('vendor', 'businessName location.city rating')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const totalActivities = await Activity.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        activities,
        category,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalActivities / limit),
          totalActivities
        }
      }
    });

  } catch (error) {
    console.error('Get activities by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities by category'
    });
  }
};

/**
 * Bulk update activities (activate or deactivate).
 * Requires admin privileges.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const bulkUpdateActivities = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { ids, action } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Activity IDs are required'
      });
    }

    if (!action || !['activate', 'deactivate'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Valid action is required (activate or deactivate)'
      });
    }

    const isActive = action === 'activate';
    const updateResult = await Activity.updateMany(
      { _id: { $in: ids } },
      { isActive }
    );

    res.json({
      success: true,
      message: `Successfully ${action}d ${updateResult.modifiedCount} activities`,
      data: {
        modifiedCount: updateResult.modifiedCount,
        matchedCount: updateResult.matchedCount
      }
    });

  } catch (error) {
    console.error('Bulk update activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update activities'
    });
  }
};

/**
 * Bulk delete activities.
 * Requires admin privileges.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const bulkDeleteActivities = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Activity IDs are required'
      });
    }

    const deleteResult = await Activity.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `Successfully deleted ${deleteResult.deletedCount} activities`,
      data: {
        deletedCount: deleteResult.deletedCount
      }
    });

  } catch (error) {
    console.error('Bulk delete activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk delete activities'
    });
  }
};

/**
 * Create an enhanced activity with comprehensive features.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const createEnhancedActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const activityData = {
      ...req.body,
      partner: userId,
      createdBy: userId,
      isActive: true,
      status: 'draft'
    };

    // Validate category exists
    if (activityData.category?.id) {
      const category = await Category.findById(activityData.category.id);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Generate slug
    if (!activityData.slug) {
      activityData.slug = activityData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Create activity
    const activity = new ActivityEnhanced(activityData);
    await activity.save();

    // Populate related data
    await activity.populate([
      { path: 'category.id', select: 'name nameEn description' },
      { path: 'partner', select: 'name nameEn email phone' }
    ]);

    res.status(201).json({
      success: true,
      data: { activity },
      message: 'Activity created successfully',
      animationTriggers: {
        celebration: true,
        confetti: true,
        successMessage: 'تم إنشاء النشاط بنجاح! 🎉',
        hapticFeedback: true
      }
    });

  } catch (error) {
    console.error('Create enhanced activity error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create activity'
    });
  }
};

/**
 * Get activity analytics and statistics.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getActivityAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30d' } = req.query;

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

    // Get booking statistics
    const bookingStats = await BookingEnhanced.aggregate([
      {
        $match: {
          'activity.id': id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalRevenue: { $sum: '$pricing.total' },
          averageBookingValue: { $avg: '$pricing.total' }
        }
      }
    ]);

    // Get bookings by status
    const bookingsByStatus = await BookingEnhanced.aggregate([
      {
        $match: {
          'activity.id': id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly trends
    const monthlyTrends = await BookingEnhanced.aggregate([
      {
        $match: {
          'activity.id': id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.total' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get participant demographics
    const participantDemographics = await BookingEnhanced.aggregate([
      {
        $match: {
          'activity.id': id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $unwind: '$participants'
      },
      {
        $group: {
          _id: '$participants.type',
          count: { $sum: 1 },
          averageAge: { $avg: '$participants.age' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        stats: bookingStats[0] || {
          totalBookings: 0,
          confirmedBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          totalRevenue: 0,
          averageBookingValue: 0
        },
        bookingsByStatus,
        monthlyTrends,
        participantDemographics
      }
    });

  } catch (error) {
    console.error('Get activity analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity analytics'
    });
  }
};

/**
 * Update activity status (draft, published, suspended, archived).
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const updateActivityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const userId = req.user.id;

    const activity = await ActivityEnhanced.findById(id);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Check permissions
    if (activity.partner.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this activity'
      });
    }

    // Validate status transition
    const validStatuses = ['draft', 'published', 'suspended', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Update status
    activity.status = status;
    if (reason) {
      activity.statusHistory = activity.statusHistory || [];
      activity.statusHistory.push({
        status,
        reason,
        changedBy: userId,
        changedAt: new Date()
      });
    }

    await activity.save();

    res.status(200).json({
      success: true,
      data: { activity },
      message: 'Activity status updated successfully'
    });

  } catch (error) {
    console.error('Update activity status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update activity status'
    });
  }
};

/**
 * Get activities by partner with advanced filtering.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getPartnerActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, category, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Build filter
    const filter = { partner: userId };
    if (status) filter.status = status;
    if (category) filter['category.id'] = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { titleEn: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get activities
    const activities = await ActivityEnhanced.find(filter)
      .populate('category.id', 'name nameEn')
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const totalActivities = await ActivityEnhanced.countDocuments(filter);

    // Get statistics
    const stats = await ActivityEnhanced.aggregate([
      { $match: { partner: userId } },
      {
        $group: {
          _id: null,
          totalActivities: { $sum: 1 },
          publishedActivities: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          draftActivities: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          suspendedActivities: {
            $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalActivities / limit),
          totalActivities
        },
        stats: stats[0] || {
          totalActivities: 0,
          publishedActivities: 0,
          draftActivities: 0,
          suspendedActivities: 0
        }
      }
    });

  } catch (error) {
    console.error('Get partner activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities'
    });
  }
};

/**
 * Duplicate an activity.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const duplicateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const originalActivity = await ActivityEnhanced.findById(id);
    if (!originalActivity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Check permissions
    if (originalActivity.partner.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to duplicate this activity'
      });
    }

    // Create duplicate
    const duplicateData = originalActivity.toObject();
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    delete duplicateData.slug;
    delete duplicateData.statistics;

    duplicateData.title = `${duplicateData.title} (Copy)`;
    duplicateData.titleEn = duplicateData.titleEn ? `${duplicateData.titleEn} (Copy)` : undefined;
    duplicateData.slug = `${duplicateData.slug}-copy-${Date.now()}`;
    duplicateData.status = 'draft';
    duplicateData.partner = userId;
    duplicateData.createdBy = userId;

    const duplicate = new ActivityEnhanced(duplicateData);
    await duplicate.save();

    res.status(201).json({
      success: true,
      data: { activity: duplicate },
      message: 'Activity duplicated successfully'
    });

  } catch (error) {
    console.error('Duplicate activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate activity'
    });
  }
};

module.exports = {
  getActivities,
  getActivityById,
  searchActivities,
  getPopularActivities,
  getActivitiesByCategory,
  bulkUpdateActivities,
  bulkDeleteActivities,
  createEnhancedActivity,
  getActivityAnalytics,
  updateActivityStatus,
  getPartnerActivities,
  duplicateActivity
};
