/**
 * @fileoverview Enhanced Controller for handling user-related operations.
 * @module controllers/userController
 * 
 * This controller provides comprehensive user management capabilities including:
 * - User profile management
 * - User preferences and settings
 * - User statistics and analytics
 * - User search and discovery
 * - User favorites and bookmarks
 * - User dashboard data
 * - Admin user management
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const User = require('../models/User');
const UserEnhanced = require('../models/UserEnhanced');
const Booking = require('../models/Booking');
const BookingEnhanced = require('../models/BookingEnhanced');
const PaymentEnhanced = require('../models/PaymentEnhanced');
const Like = require('../models/Like');

/**
 * Get the profile of the authenticated user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
};

/**
 * Update the profile of the authenticated user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      location,
      preferences,
      profileImage
    } = req.body;

    // Build update object with only provided fields
    const updateData = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (location !== undefined) updateData.location = location;
    if (preferences !== undefined) updateData.preferences = preferences;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    // Validate required fields if provided
    if (firstName !== undefined && firstName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'First name cannot be empty'
      });
    }

    if (lastName !== undefined && lastName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Last name cannot be empty'
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user: updatedUser },
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update user profile error:', error);

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
      message: 'Failed to update user profile'
    });
  }
};

/**
 * Update the preferences of the authenticated user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;

    if (!preferences) {
      return res.status(400).json({
        success: false,
        message: 'Preferences data is required'
      });
    }

    // Update user preferences
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { preferences },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update user preferences error:', error);

    // Handle validation errors
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
      message: 'Failed to update user preferences'
    });
  }
};

/**
 * Get all bookings for the authenticated user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || '';

    // Build filter
    success: false,
      message: 'Failed to fetch dashboard statistics'
  });
}
};

/**
 * Search for users (admin only).
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const searchUsers = async (req, res) => {
  try {
    const { q, role = 'user', limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    // Build search query
    const searchRegex = new RegExp(q.trim(), 'i');
    const filter = {
      $or: [
        { firstName: { $regex: searchRegex } },
        { lastName: { $regex: searchRegex } },
        { email: { $regex: searchRegex } }
      ]
    };

    // Filter by role if specified
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select('firstName lastName email role adminRole createdAt')
      .limit(parseInt(limit))
      .sort({ firstName: 1, lastName: 1 });

    res.status(200).json({
      success: true,
      data: {
        users,
        count: users.length
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
};

/**
 * Get user statistics and analytics.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Get user statistics
    const [
      totalBookings,
      completedBookings,
      totalSpent,
      favoriteActivities,
      recentActivity
    ] = await Promise.all([
      Booking.countDocuments({ user: userId, ...dateFilter }),
      Booking.countDocuments({ user: userId, status: 'completed', ...dateFilter }),
      PaymentEnhanced.aggregate([
        { $match: { 'user.id': userId, status: 'completed', ...dateFilter } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // TODO: Implement favorites when favorites system is ready
      Promise.resolve([]),
      Booking.find({ user: userId })
        .populate('activity', 'title category')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const stats = {
      totalBookings: totalBookings || 0,
      completedBookings: completedBookings || 0,
      totalSpent: totalSpent[0]?.total || 0,
      favoriteActivities: favoriteActivities.length,
      recentActivity: recentActivity.map(booking => ({
        id: booking._id,
        activityTitle: booking.activity?.title || 'Unknown Activity',
        category: booking.activity?.category || 'Unknown',
        status: booking.status,
        createdAt: booking.createdAt
      }))
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
};

/**
 * Update user profile image.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user: updatedUser },
      message: 'Profile image updated successfully'
    });

  } catch (error) {
    console.error('Update profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile image'
    });
  }
};

/**
 * Get user activity history.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getUserActivityHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, category } = req.query;

    // Build filter
    const filter = { user: userId };
    if (status) filter.status = status;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get bookings with pagination
    const bookings = await Booking.find(filter)
      .populate('activity', 'title category description images')
      .populate('vendor', 'businessName contactInfo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter by category if specified
    let filteredBookings = bookings;
    if (category) {
      filteredBookings = bookings.filter(booking =>
        booking.activity?.category === category
      );
    }

    // Get total count
    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        activities: filteredBookings.map(booking => ({
          id: booking._id,
          activity: {
            id: booking.activity?._id,
            title: booking.activity?.title,
            category: booking.activity?.category,
            description: booking.activity?.description,
            images: booking.activity?.images
          },
          vendor: {
            id: booking.vendor?._id,
            businessName: booking.vendor?.businessName,
            contactInfo: booking.vendor?.contactInfo
          },
          status: booking.status,
          bookingDate: booking.bookingDate,
          timeSlot: booking.timeSlot,
          participants: booking.participants,
          pricing: booking.pricing,
          createdAt: booking.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get user activity history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity history'
    });
  }
};

/**
 * Get user preferences with detailed options.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('preferences');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get available preference options
    const preferenceOptions = {
      categories: [
        { value: 'fitness', label: 'Fitness & Sports' },
        { value: 'arts', label: 'Arts & Culture' },
        { value: 'food', label: 'Food & Dining' },
        { value: 'outdoor', label: 'Outdoor Adventures' },
        { value: 'unique', label: 'Unique Experiences' },
        { value: 'wellness', label: 'Wellness & Health' }
      ],
      activityTypes: [
        { value: 'indoor', label: 'Indoor' },
        { value: 'outdoor', label: 'Outdoor' },
        { value: 'physical', label: 'Physical' },
        { value: 'mental', label: 'Mental' },
        { value: 'social', label: 'Social' },
        { value: 'solo', label: 'Solo' },
        { value: 'group', label: 'Group' }
      ],
      preferredTimes: [
        { value: 'weekday-morning', label: 'Weekday Morning' },
        { value: 'weekday-afternoon', label: 'Weekday Afternoon' },
        { value: 'weekday-evening', label: 'Weekday Evening' },
        { value: 'weekend-morning', label: 'Weekend Morning' },
        { value: 'weekend-afternoon', label: 'Weekend Afternoon' },
        { value: 'weekend-evening', label: 'Weekend Evening' }
      ],
      languages: [
        { value: 'ar', label: 'Arabic' },
        { value: 'en', label: 'English' },
        { value: 'fr', label: 'French' },
        { value: 'es', label: 'Spanish' },
        { value: 'ur', label: 'Urdu' },
        { value: 'hi', label: 'Hindi' },
        { value: 'tr', label: 'Turkish' },
        { value: 'fa', label: 'Persian' }
      ]
    };

    res.status(200).json({
      success: true,
      data: {
        preferences: user.preferences,
        options: preferenceOptions
      }
    });

  } catch (error) {
    console.error('Get user preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user preferences'
    });
  }
};

/**
 * Update user location.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const updateUserLocation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { city, region, coordinates, address } = req.body;

    if (!city || !region) {
      return res.status(400).json({
        success: false,
        message: 'City and region are required'
      });
    }

    const locationData = {
      city,
      region,
      address: address || null
    };

    if (coordinates && coordinates.length === 2) {
      locationData.coordinates = {
        type: 'Point',
        coordinates: [coordinates[0], coordinates[1]]
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { location: locationData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user: updatedUser },
      message: 'Location updated successfully'
    });

  } catch (error) {
    console.error('Update user location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user location'
    });
  }
};

/**
 * Get user dashboard data with comprehensive statistics.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30d' } = req.query;

    // Calculate date range based on period
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
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get comprehensive dashboard data
    const [
      user,
      totalBookings,
      upcomingBookings,
      completedBookings,
      totalSpent,
      recentBookings,
      favoriteCategories
    ] = await Promise.all([
      User.findById(userId).select('firstName lastName email profileImage preferences stats'),
      Booking.countDocuments({ user: userId }),
      Booking.countDocuments({
        user: userId,
        status: 'confirmed',
        bookingDate: { $gte: now }
      }),
      Booking.countDocuments({
        user: userId,
        status: 'completed',
        createdAt: { $gte: startDate }
      }),
      PaymentEnhanced.aggregate([
        { $match: { 'user.id': userId, status: 'completed', createdAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Booking.find({ user: userId })
        .populate('activity', 'title category images')
        .populate('vendor', 'businessName')
        .sort({ createdAt: -1 })
        .limit(5),
      Booking.aggregate([
        { $match: { user: userId, status: 'completed' } },
        { $lookup: { from: 'activities', localField: 'activity', foreignField: '_id', as: 'activity' } },
        { $unwind: '$activity' },
        { $group: { _id: '$activity.category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    const dashboardData = {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage,
        preferences: user.preferences,
        stats: user.stats
      },
      statistics: {
        totalBookings: totalBookings || 0,
        upcomingBookings: upcomingBookings || 0,
        completedBookings: completedBookings || 0,
        totalSpent: totalSpent[0]?.total || 0,
        period
      },
      recentActivity: recentBookings.map(booking => ({
        id: booking._id,
        activity: {
          id: booking.activity?._id,
          title: booking.activity?.title,
          category: booking.activity?.category,
          images: booking.activity?.images
        },
        vendor: {
          id: booking.vendor?._id,
          businessName: booking.vendor?.businessName
        },
        status: booking.status,
        bookingDate: booking.bookingDate,
        createdAt: booking.createdAt
      })),
      favoriteCategories: favoriteCategories.map(cat => ({
        category: cat._id,
        count: cat.count
      })),
      quickActions: [
        { id: 'book-activity', label: 'Book Activity', icon: '🎯', href: '/activities' },
        { id: 'view-bookings', label: 'View Bookings', icon: '📅', href: '/bookings' },
        { id: 'edit-profile', label: 'Edit Profile', icon: '👤', href: '/profile/edit' },
        { id: 'settings', label: 'Settings', icon: '⚙️', href: '/settings' }
      ]
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};

/**
 * Search users with advanced filters.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const searchUsersAdvanced = async (req, res) => {
  try {
    const {
      q,
      city,
      interests,
      ageRange,
      gender,
      language,
      page = 1,
      limit = 20
    } = req.query;

    // Build search query
    const searchQuery = {};

    // Text search
    if (q && q.trim().length >= 2) {
      searchQuery.$or = [
        { firstName: { $regex: q.trim(), $options: 'i' } },
        { lastName: { $regex: q.trim(), $options: 'i' } },
        { email: { $regex: q.trim(), $options: 'i' } }
      ];
    }

    // Location filter
    if (city) {
      searchQuery['location.city'] = { $regex: city, $options: 'i' };
    }

    // Interests filter
    if (interests) {
      const interestArray = Array.isArray(interests) ? interests : [interests];
      searchQuery['preferences.categories'] = { $in: interestArray };
    }

    // Age range filter
    if (ageRange) {
      const [minAge, maxAge] = ageRange.split('-').map(Number);
      const now = new Date();
      const maxDate = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());
      const minDate = new Date(now.getFullYear() - maxAge, now.getMonth(), now.getDate());
      searchQuery.dateOfBirth = { $gte: minDate, $lte: maxDate };
    }

    // Gender filter
    if (gender) {
      searchQuery.gender = gender;
    }

    // Language filter
    if (language) {
      searchQuery['preferences.language'] = language;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute search
    const users = await User.find(searchQuery)
      .select('firstName lastName email profileImage location preferences stats')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImage: user.profileImage,
          location: user.location,
          preferences: user.preferences,
          stats: user.stats
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Search users advanced error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
  getUserBookings,
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  getDashboardStats,
  searchUsers,
  getUserStats,
  updateProfileImage,
  getUserActivityHistory,
  getUserPreferences,
  updateUserLocation,
  getDashboardData,
  searchUsersAdvanced
};