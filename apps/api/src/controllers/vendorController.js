/**
 * @fileoverview Enhanced Vendor Controller for LUDUS Platform - LDS-013 Implementation
 * @module controllers/vendorController
 * 
 * This controller provides comprehensive vendor management functionality including:
 * - Vendor CRUD operations
 * - Advanced search and filtering
 * - Vendor analytics and reporting
 * - Status management and approval workflow
 * - Document and credential management
 * - RTL support for Arabic users
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');
const Activity = require('../models/Activity');
const ActivityEnhanced = require('../models/ActivityEnhanced');
const Booking = require('../models/Booking');
const BookingEnhanced = require('../models/BookingEnhanced');
const User = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

/**
 * Register a new vendor.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const registerVendor = async (req, res) => {
  try {
    const {
      contactName,
      companyName,
      email,
      phone,
      website,
      description
    } = req.body;

    // Validate required fields
    if (!contactName || !companyName || !email || !phone || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: contactName, companyName, email, phone, description'
      });
    }

    // Check if vendor with this email already exists
    const existingVendor = await Vendor.findOne({ 'contactInfo.email': email });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: 'A vendor with this email already exists'
      });
    }

    // Create new vendor with required fields and sensible defaults
    const vendor = new Vendor({
      businessName: companyName,
      description,
      contactInfo: {
        email,
        phone,
        website: website || undefined
      },
      location: {
        address: 'Address to be provided',
        city: 'City to be provided',
        state: 'State to be provided',
        zipCode: '00000',
        coordinates: [0, 0] // Default coordinates, will be updated later
      },
      categories: ['unique'], // Default category
      isActive: false, // Not active until approved
      isFeatured: false,
      statusHistory: [{
        status: 'inactive', // Use valid enum value
        note: 'Vendor registration submitted - pending admin approval',
        timestamp: new Date(),
        admin: 'System' // Default admin value
      }],
      createdBy: new mongoose.Types.ObjectId(), // Generate a valid ObjectId
      bankingInfo: {
        accountStatus: 'pending'
      }
    });

    await vendor.save();

    res.status(201).json({
      success: true,
      message: 'Vendor registration submitted successfully. Awaiting admin approval.',
      data: {
        vendor: {
          id: vendor._id,
          businessName: vendor.businessName,
          email: vendor.contactInfo.email,
          status: vendor.statusHistory[0].status
        }
      }
    });

  } catch (error) {
    console.error('Vendor registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register vendor'
    });
  }
};

/**
 * Get a vendor's profile by their ID or slug.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getVendorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by MongoDB ObjectId first, then by slug
    let vendor;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      vendor = await Vendor.findById(id);
    } else {
      vendor = await Vendor.findOne({ slug: id });
    }

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Get vendor statistics
    const activities = await Activity.find({ vendor: vendor._id, isActive: true });
    const totalActivities = activities.length;
    const avgActivityPrice = activities.length > 0 
      ? activities.reduce((sum, activity) => sum + activity.pricing.basePrice, 0) / activities.length
      : 0;

    // Get vendor reviews (from activities)
    const allReviews = activities.reduce((reviews, activity) => {
      return reviews.concat(activity.reviews || []);
    }, []);

    const recentReviews = allReviews
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        vendor: {
          ...vendor.toObject(),
          statistics: {
            ...vendor.statistics,
            totalActivities,
            avgActivityPrice,
            totalReviews: allReviews.length
          }
        },
        recentReviews
      }
    });

  } catch (error) {
    console.error('Get vendor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor profile'
    });
  }
};

/**
 * Get all activities for a specific vendor.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getVendorActivities = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const category = req.query.category || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Find vendor
    let vendor;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      vendor = await Vendor.findById(id);
    } else {
      vendor = await Vendor.findOne({ slug: id });
    }

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Build filter
    const filter = { 
      vendor: vendor._id, 
      isActive: true 
    };
    
    if (category) {
      filter.category = category;
    }

    // Get activities with pagination
    const activities = await Activity.find(filter)
      .populate('vendor', 'businessName location.city rating')
      .sort({ [sortBy]: sortOrder })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const totalActivities = await Activity.countDocuments(filter);

    // Get available categories for this vendor
    const categories = await Activity.distinct('category', { 
      vendor: vendor._id, 
      isActive: true 
    });

    res.status(200).json({
      success: true,
      data: {
        activities,
        vendor: {
          _id: vendor._id,
          businessName: vendor.businessName,
          slug: vendor.slug
        },
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalActivities / limit),
          totalActivities
        },
        filters: {
          categories: categories.sort()
        }
      }
    });

  } catch (error) {
    console.error('Get vendor activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor activities'
    });
  }
};

/**
 * Get all vendors with filtering and pagination.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const city = req.query.city || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build filter object
    const filter = { isActive: true };
    
    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.categories = category;
    }
    
    if (city) {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }

    // Get vendors with pagination
    const vendors = await Vendor.find(filter)
      .sort({ [sortBy]: sortOrder })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const totalVendors = await Vendor.countDocuments(filter);

    // Get filter options
    const categories = await Vendor.distinct('categories', { isActive: true });
    const cities = await Vendor.distinct('location.city', { isActive: true });

    res.status(200).json({
      success: true,
      data: {
        vendors,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalVendors / limit),
          totalVendors
        },
        filters: {
          categories: [...new Set(categories)].sort(),
          cities: cities.sort()
        }
      }
    });

  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendors'
    });
  }
};

/**
 * Get all reviews for a specific vendor.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getVendorReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Find vendor
    let vendor;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      vendor = await Vendor.findById(id);
    } else {
      vendor = await Vendor.findOne({ slug: id });
    }

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Get all activities for this vendor
    const activities = await Activity.find({ 
      vendor: vendor._id, 
      isActive: true 
    }).populate('reviews.user', 'firstName lastName');

    // Collect all reviews from all activities
    const allReviews = [];
    activities.forEach(activity => {
      if (activity.reviews && activity.reviews.length > 0) {
        activity.reviews.forEach(review => {
          allReviews.push({
            ...review.toObject(),
            activity: {
              _id: activity._id,
              title: activity.title
            }
          });
        });
      }
    });

    // Sort by date (most recent first)
    allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Paginate reviews
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReviews = allReviews.slice(startIndex, endIndex);

    // Calculate rating breakdown
    const ratingBreakdown = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    
    allReviews.forEach(review => {
      ratingBreakdown[review.rating] = (ratingBreakdown[review.rating] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        reviews: paginatedReviews,
        vendor: {
          _id: vendor._id,
          businessName: vendor.businessName,
          rating: vendor.rating
        },
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(allReviews.length / limit),
          totalReviews: allReviews.length
        },
        ratingBreakdown
      }
    });

  } catch (error) {
    console.error('Get vendor reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor reviews'
    });
  }
};

/**
 * Get vendor analytics and comprehensive statistics.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getVendorAnalytics = async (req, res) => {
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

    // Get vendor
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Get booking statistics
    const bookingStats = await BookingEnhanced.aggregate([
      {
        $match: {
          'vendor.id': id,
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

    // Get activity statistics
    const activityStats = await ActivityEnhanced.aggregate([
      {
        $match: {
          partner: id,
          createdAt: { $gte: startDate }
        }
      },
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

    // Get monthly trends
    const monthlyTrends = await BookingEnhanced.aggregate([
      {
        $match: {
          'vendor.id': id,
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

    // Get top activities by bookings
    const topActivities = await BookingEnhanced.aggregate([
      {
        $match: {
          'vendor.id': id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$activity.id',
          bookingCount: { $sum: 1 },
          revenue: { $sum: '$pricing.total' }
        }
      },
      {
        $lookup: {
          from: 'activities',
          localField: '_id',
          foreignField: '_id',
          as: 'activity'
        }
      },
      {
        $unwind: '$activity'
      },
      {
        $project: {
          activityId: '$_id',
          activityTitle: '$activity.title',
          bookingCount: 1,
          revenue: 1
        }
      },
      {
        $sort: { bookingCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        vendor: {
          id: vendor._id,
          businessName: vendor.businessName,
          status: vendor.statusHistory[vendor.statusHistory.length - 1]?.status || 'inactive'
        },
        bookingStats: bookingStats[0] || {
          totalBookings: 0,
          confirmedBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          totalRevenue: 0,
          averageBookingValue: 0
        },
        activityStats: activityStats[0] || {
          totalActivities: 0,
          publishedActivities: 0,
          draftActivities: 0,
          suspendedActivities: 0
        },
        monthlyTrends,
        topActivities
      }
    });

  } catch (error) {
    console.error('Get vendor analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor analytics'
    });
  }
};

/**
 * Update vendor status with approval workflow.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const updateVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, adminNotes } = req.body;
    const adminId = req.user.id;

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Validate status transition
    const validStatuses = ['pending', 'active', 'suspended', 'inactive', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Update status
    vendor.statusHistory = vendor.statusHistory || [];
    vendor.statusHistory.push({
      status,
      reason,
      adminNotes,
      timestamp: new Date(),
      admin: adminId
    });

    // Update isActive based on status
    vendor.isActive = status === 'active';

    await vendor.save();

    res.status(200).json({
      success: true,
      data: { vendor },
      message: 'Vendor status updated successfully'
    });

  } catch (error) {
    console.error('Update vendor status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vendor status'
    });
  }
};

/**
 * Upload vendor documents and credentials.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const uploadVendorDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType, documentName } = req.body;
    const userId = req.user.id;

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Check permissions
    if (vendor.createdBy.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to upload documents for this vendor'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file, {
      folder: `vendors/${id}/documents`,
      resource_type: 'auto'
    });

    // Add to vendor documents
    const document = {
      type: documentType,
      name: documentName,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      uploadedAt: new Date(),
      uploadedBy: userId
    };

    vendor.documents = vendor.documents || [];
    vendor.documents.push(document);

    await vendor.save();

    res.status(200).json({
      success: true,
      data: { document },
      message: 'Document uploaded successfully'
    });

  } catch (error) {
    console.error('Upload vendor document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document'
    });
  }
};

/**
 * Get vendor dashboard data.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Get vendor
    const vendor = await Vendor.findOne({ createdBy: vendorId });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    // Get recent activities
    const recentActivities = await ActivityEnhanced.find({ partner: vendorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title titleEn status createdAt')
      .lean();

    // Get recent bookings
    const recentBookings = await BookingEnhanced.find({ 'vendor.id': vendorId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email')
      .populate('activity.id', 'title titleEn')
      .select('bookingNumber status pricing.total createdAt')
      .lean();

    // Get statistics
    const stats = await Promise.all([
      // Total activities
      ActivityEnhanced.countDocuments({ partner: vendorId }),
      
      // Published activities
      ActivityEnhanced.countDocuments({ partner: vendorId, status: 'published' }),
      
      // Total bookings
      BookingEnhanced.countDocuments({ 'vendor.id': vendorId }),
      
      // Confirmed bookings
      BookingEnhanced.countDocuments({ 'vendor.id': vendorId, status: 'confirmed' }),
      
      // Total revenue
      BookingEnhanced.aggregate([
        { $match: { 'vendor.id': vendorId, status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ])
    ]);

    const [totalActivities, publishedActivities, totalBookings, confirmedBookings, revenueResult] = stats;
    const totalRevenue = revenueResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        vendor: {
          id: vendor._id,
          businessName: vendor.businessName,
          status: vendor.statusHistory[vendor.statusHistory.length - 1]?.status || 'inactive',
          rating: vendor.rating?.average || 0,
          reviewCount: vendor.rating?.count || 0
        },
        stats: {
          totalActivities,
          publishedActivities,
          totalBookings,
          confirmedBookings,
          totalRevenue,
          conversionRate: totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0
        },
        recentActivities,
        recentBookings
      }
    });

  } catch (error) {
    console.error('Get vendor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor dashboard'
    });
  }
};

module.exports = {
  getVendorProfile,
  getVendorActivities,
  getVendors,
  getVendorReviews,
  registerVendor,
  getVendorAnalytics,
  updateVendorStatus,
  uploadVendorDocument,
  getVendorDashboard
};