const Activity = require('../models/Activity');

// @desc    Get all activities with filters
// @route   GET /api/activities
// @access  Public
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
      data: {
        activities,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalActivities / limit),
          totalActivities
        },
        filters: {
          categories: categories.sort(),
          cities: cities.sort(),
          priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
        }
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

// @desc    Get single activity
// @route   GET /api/activities/:id
// @access  Public
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

// @desc    Search activities
// @route   GET /api/activities/search
// @access  Public
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

// @desc    Get popular activities
// @route   GET /api/activities/popular
// @access  Public
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

// @desc    Get activities by category
// @route   GET /api/activities/category/:category
// @access  Public
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

module.exports = {
  getActivities,
  getActivityById,
  searchActivities,
  getPopularActivities,
  getActivitiesByCategory
};