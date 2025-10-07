const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
  addBookingReview
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

module.exports = router;