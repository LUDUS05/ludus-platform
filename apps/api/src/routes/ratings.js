const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  submitRating,
  getUserCommunityRating,
  getEventRatings,
  getMyRatings,
  checkRatingStatus,
  getAdminRatingStats
} = require('../controllers/ratingController');

// @desc    Submit post-event rating
// @route   POST /api/ratings
// @access  Private
router.post('/', authenticate, submitRating);

// @desc    Get user's submitted ratings
// @route   GET /api/ratings/my-ratings
// @access  Private
router.get('/my-ratings', authenticate, getMyRatings);

// @desc    Check if user needs to rate an event
// @route   GET /api/ratings/check/:eventId
// @access  Private
router.get('/check/:eventId', authenticate, checkRatingStatus);

// @desc    Get user's community rating
// @route   GET /api/ratings/community/:userId
// @access  Public
router.get('/community/:userId', getUserCommunityRating);

// @desc    Get event rating statistics
// @route   GET /api/ratings/event/:eventId
// @access  Public
router.get('/event/:eventId', getEventRatings);

// @desc    Get rating statistics for admin
// @route   GET /api/ratings/admin/stats
// @access  Private (Admin only)
router.get('/admin/stats', authenticate, getAdminRatingStats);

module.exports = router;