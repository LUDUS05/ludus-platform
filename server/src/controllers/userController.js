/**
 * @fileoverview Controller for handling user-related operations.
 * @module controllers/userController
 */

const User = require('../models/User');

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
    const filter = { user: userId };
    if (status) {
      filter.status = status;
    }

    // For now, return mock data since Booking model might not have full implementation
    const mockBookings = [];
    const totalBookings = 0;

    res.status(200).json({
      success: true,
      data: {
        bookings: mockBookings,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalBookings / limit),
          totalBookings
        }
      }
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user bookings'
    });
  }
};

/**
 * Get all favorite activities for the authenticated user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getUserFavorites = async (req, res) => {
  try {
    // For now, return empty array since favorites feature is not implemented yet
    res.status(200).json({
      success: true,
      data: {
        favorites: []
      }
    });

  } catch (error) {
    console.error('Get user favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user favorites'
    });
  }
};

/**
 * Add an activity to the authenticated user's favorites.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const addToFavorites = async (req, res) => {
  try {
  const { activityId: _activityId } = req.params;
    
    // TODO: Implement favorites functionality
    res.status(200).json({
      success: true,
      message: 'Activity added to favorites'
    });

  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add activity to favorites'
    });
  }
};

/**
 * Remove an activity from the authenticated user's favorites.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const removeFromFavorites = async (req, res) => {
  try {
  const { activityId: _activityId } = req.params;
    
    // TODO: Implement favorites functionality
    res.status(200).json({
      success: true,
      message: 'Activity removed from favorites'
    });

  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove activity from favorites'
    });
  }
};

/**
 * Get dashboard statistics for the authenticated user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getDashboardStats = async (req, res) => {
  try {
    const _userId = req.user.id;

    // For now, return mock stats since booking system is not fully implemented
    const stats = {
      totalBookings: 0,
      upcomingBookings: 0,
      completedBookings: 0,
      totalSpent: 0,
      favoriteActivities: 0
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
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

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
  getUserBookings,
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  getDashboardStats,
  searchUsers
};