/**
 * @fileoverview Controller for handling vendor-related operations.
 * @module controllers/vendorController
 */

const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');
const Activity = require('../models/Activity');

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

module.exports = {
  getVendorProfile,
  getVendorActivities,
  getVendors,
  getVendorReviews,
  registerVendor
};