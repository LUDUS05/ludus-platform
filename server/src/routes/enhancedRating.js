const express = require('express');
const router = express.Router();
const {
  getRatingSystemConfig,
  updateRatingSystemConfig,
  getUserRatingProfile,
  createRatingAssignments,
  getUserRatingAssignments,
  getRatingAssignment,
  submitRating,
  getUserRatings,
  getRatingsByUser,
  getRatingStatistics,
  getTopRatedUsers,
  flagRating,
  reviewRating,
  getFlaggedRatings,
  processMonthlyBonuses,
  getRatingSystemHealth
} = require('../controllers/enhancedRatingController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/top-users', getTopRatedUsers);

// Protected routes (require authentication)
router.use(authenticate);

// User rating profile routes
router.get('/profile/:userId', getUserRatingProfile);

// Rating assignment routes
router.get('/assignments', getUserRatingAssignments);
router.get('/assignments/:assignmentId', getRatingAssignment);

// Rating submission routes
router.post('/ratings', submitRating);

// Rating retrieval routes
router.get('/ratings/user/:userId', getUserRatings);
router.get('/ratings/by/:userId', getRatingsByUser);

// Rating flagging routes
router.post('/ratings/:ratingId/flag', flagRating);

// Admin routes (require admin role)
router.use(authorize('admin'));

// Configuration management
router.get('/config', getRatingSystemConfig);
router.put('/config', updateRatingSystemConfig);

// Assignment management
router.post('/assignments/:eventId', createRatingAssignments);

// Statistics and analytics
router.get('/statistics', getRatingStatistics);
router.get('/health', getRatingSystemHealth);

// Rating moderation
router.get('/ratings/flagged', getFlaggedRatings);
router.post('/ratings/:ratingId/review', reviewRating);

// System maintenance
router.post('/process-bonuses', processMonthlyBonuses);

module.exports = router;
