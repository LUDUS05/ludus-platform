const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdminRole } = require('../middleware/rbac');
const {
  validateEnhancedBooking,
  validateBookingCancellation,
  validateBookingReview,
  validateCheckIn,
  validateObjectId
} = require('../middleware/validation');
const {
  createBooking,
  createEnhancedBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
  addBookingReview,
  getBookingAnalytics,
  checkInBooking,
  getBookingAvailability,
  sendBookingConfirmation
} = require('../controllers/bookingController');

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
router.get('/', authenticate, getUserBookings);

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
router.post('/', authenticate, createBooking);

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', authenticate, getBookingById);

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', authenticate, cancelBooking);

// @desc    Update booking status (for vendors/admin)
// @route   PUT /api/bookings/:id/status
// @access  Private
router.put('/:id/status', authenticate, updateBookingStatus);

// @desc    Add review to booking
// @route   POST /api/bookings/:id/review
// @access  Private
router.post('/:id/review', authenticate, addBookingReview);

// @desc    Create enhanced booking
// @route   POST /api/bookings/enhanced
// @access  Private
router.post('/enhanced', authenticate, validateEnhancedBooking, createEnhancedBooking);

// @desc    Get booking analytics
// @route   GET /api/bookings/analytics
// @access  Private
router.get('/analytics', authenticate, getBookingAnalytics);

// @desc    Check in to booking
// @route   POST /api/bookings/:id/check-in
// @access  Private
router.post('/:id/check-in', authenticate, validateObjectId('id'), validateCheckIn, checkInBooking);

// @desc    Get booking availability
// @route   GET /api/bookings/availability/:activityId
// @access  Public
router.get('/availability/:activityId', validateObjectId('activityId'), getBookingAvailability);

// @desc    Send booking confirmation email
// @route   POST /api/bookings/:id/send-confirmation
// @access  Private
router.post('/:id/send-confirmation', authenticate, validateObjectId('id'), sendBookingConfirmation);

// @desc    Cancel booking with reason
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', authenticate, validateObjectId('id'), validateBookingCancellation, cancelBooking);

// @desc    Add review to booking
// @route   POST /api/bookings/:id/review
// @access  Private
router.post('/:id/review', authenticate, validateObjectId('id'), validateBookingReview, addBookingReview);

module.exports = router;