const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const {
  getActivities,
  getActivityById,
  searchActivities,
  getPopularActivities,
  getActivitiesByCategory
} = require('../controllers/activityController');

// @desc    Search activities (must be before /:id route)
// @route   GET /api/activities/search
// @access  Public
router.get('/search', optionalAuth, searchActivities);

// @desc    Get popular activities
// @route   GET /api/activities/popular
// @access  Public
router.get('/popular', optionalAuth, getPopularActivities);

// @desc    Get activities by category
// @route   GET /api/activities/category/:category
// @access  Public
router.get('/category/:category', optionalAuth, getActivitiesByCategory);

// @desc    Get all activities
// @route   GET /api/activities
// @access  Public
router.get('/', optionalAuth, getActivities);

// @desc    Get single activity
// @route   GET /api/activities/:id
// @access  Public
router.get('/:id', optionalAuth, getActivityById);

module.exports = router;