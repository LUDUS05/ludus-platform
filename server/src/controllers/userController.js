const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
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

// @desc    Get user bookings
// @route   GET /api/users/bookings
// @access  Private
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

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
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

// @desc    Add activity to favorites
// @route   POST /api/users/favorites/:activityId
// @access  Private
const addToFavorites = async (req, res) => {
  try {
    const { activityId } = req.params;
    
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

// @desc    Remove activity from favorites
// @route   DELETE /api/users/favorites/:activityId
// @access  Private
const removeFromFavorites = async (req, res) => {
  try {
    const { activityId } = req.params;
    
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

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard-stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

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

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserBookings,
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  getDashboardStats
};