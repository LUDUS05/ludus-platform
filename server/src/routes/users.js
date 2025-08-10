const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
  getUserBookings,
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  getDashboardStats,
  searchUsers
} = require('../controllers/userController');
const { requireAdminRole } = require('../middleware/rbac');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', authenticate, getUserProfile);

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', authenticate, updateUserProfile);

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
router.put('/preferences', authenticate, updateUserPreferences);

// @desc    Get user bookings
// @route   GET /api/users/bookings
// @access  Private
router.get('/bookings', authenticate, getUserBookings);

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
router.get('/favorites', authenticate, getUserFavorites);

// @desc    Add activity to favorites
// @route   POST /api/users/favorites/:activityId
// @access  Private
router.post('/favorites/:activityId', authenticate, addToFavorites);

// @desc    Remove activity from favorites
// @route   DELETE /api/users/favorites/:activityId
// @access  Private
router.delete('/favorites/:activityId', authenticate, removeFromFavorites);

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard-stats
// @access  Private
router.get('/dashboard-stats', authenticate, getDashboardStats);

// @desc    Search users (Admin only)
// @route   GET /api/users/search
// @access  Private (Admin)
router.get('/search', authenticate, requireAdminRole(), searchUsers);

module.exports = router;