const express = require('express');
const router = express.Router();
const { optionalAuth, authenticate } = require('../middleware/auth');
const { requireAdminRole } = require('../middleware/rbac');
const {
  validateActivityCreation,
  validateObjectId
} = require('../middleware/validation');
const {
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

// @desc    Create enhanced activity
// @route   POST /api/activities/enhanced
// @access  Private (Partners)
router.post('/enhanced', authenticate, validateActivityCreation, createEnhancedActivity);

// @desc    Get activity analytics
// @route   GET /api/activities/:id/analytics
// @access  Private (Partner/Admin)
router.get('/:id/analytics', authenticate, validateObjectId('id'), getActivityAnalytics);

// @desc    Update activity status
// @route   PUT /api/activities/:id/status
// @access  Private (Partner/Admin)
router.put('/:id/status', authenticate, validateObjectId('id'), updateActivityStatus);

// @desc    Get partner activities
// @route   GET /api/activities/partner/my
// @access  Private (Partners)
router.get('/partner/my', authenticate, getPartnerActivities);

// @desc    Duplicate activity
// @route   POST /api/activities/:id/duplicate
// @access  Private (Partner/Admin)
router.post('/:id/duplicate', authenticate, validateObjectId('id'), duplicateActivity);

module.exports = router;