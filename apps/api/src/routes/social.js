// frontend/src/routes/social.js - Social interaction routes with animation triggers
const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
  joinEvent,
  leaveEvent,
  toggleLike,
  getEventAttendees,
  getUserLikes
} = require('../controllers/socialController');

// @desc    Join an event
// @route   POST /api/social/join
// @access  Private
router.post('/join', authenticate, joinEvent);

// @desc    Leave an event
// @route   POST /api/social/leave
// @access  Private
router.post('/leave', authenticate, leaveEvent);

// @desc    Toggle like on content
// @route   POST /api/social/like
// @access  Private
router.post('/like', authenticate, toggleLike);

// @desc    Get event attendees
// @route   GET /api/social/events/:eventId/attendees
// @access  Public
router.get('/events/:eventId/attendees', optionalAuth, getEventAttendees);

// @desc    Get user likes
// @route   GET /api/social/likes
// @access  Private
router.get('/likes', authenticate, getUserLikes);

module.exports = router;
