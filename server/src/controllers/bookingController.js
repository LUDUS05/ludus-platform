const Booking = require('../models/Booking');
const Activity = require('../models/Activity');
const Vendor = require('../models/Vendor');
const User = require('../models/User');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      activity: activityId,
      vendor: vendorId,
      bookingDate,
      timeSlot,
      participants,
      pricing,
      contactInfo,
      specialRequests,
      waiverSigned,
      waiverSignedAt
    } = req.body;

    // Validate activity exists and is active
    const activity = await Activity.findById(activityId);
    if (!activity || !activity.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found or inactive'
      });
    }

    // Validate vendor exists and is active
    const vendor = await Vendor.findById(vendorId);
    if (!vendor || !vendor.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found or inactive'
      });
    }

    // Check if booking date is in the future
    const bookingDateTime = new Date(bookingDate);
    if (bookingDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Booking date must be in the future'
      });
    }

    // Check activity capacity
    if (participants.count > activity.capacity?.max) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${activity.capacity.max} participants allowed`
      });
    }

    if (participants.count < activity.capacity?.min) {
      return res.status(400).json({
        success: false,
        message: `Minimum ${activity.capacity.min} participants required`
      });
    }

    // TODO: Check availability for the specific date and time slot
    // This would involve checking existing bookings against the activity's schedule

    // Calculate total price
    const calculatedTotalPrice = pricing.basePrice * participants.count;
    
    // Create booking object
    const bookingData = {
      user: userId,
      activity: activityId,
      vendor: vendorId,
      bookingDate: bookingDateTime,
      timeSlot,
      participants,
      pricing: {
        ...pricing,
        totalPrice: calculatedTotalPrice
      },
      contactInfo,
      specialRequests,
      waiverSigned,
      waiverSignedAt: waiverSigned ? waiverSignedAt || new Date() : null,
      status: 'pending',
      payment: {
        status: 'pending'
      }
    };

    const booking = new Booking(bookingData);
    await booking.save();

    // Populate the booking with related data
    await booking.populate([
      { path: 'activity', select: 'title category pricing images' },
      { path: 'vendor', select: 'businessName location contactInfo' },
      { path: 'user', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      success: true,
      data: { booking },
      message: 'Booking created successfully'
    });

  } catch (error) {
    console.error('Create booking error:', error);
    
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
      message: 'Failed to create booking'
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
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

    // Get bookings with pagination
    const bookings = await Booking.find(filter)
      .populate('activity', 'title category pricing images')
      .populate('vendor', 'businessName location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const totalBookings = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        bookings,
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
      message: 'Failed to fetch bookings'
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      _id: id,
      user: userId
    })
      .populate('activity', 'title category pricing images location duration')
      .populate('vendor', 'businessName location contactInfo')
      .populate('user', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { booking }
    });

  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking details'
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    const booking = await Booking.findOne({
      _id: id,
      user: userId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be cancelled
    if (!booking.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled (less than 24 hours before activity)'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    // Calculate refund amount
    const refundAmount = booking.getRefundAmount();

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: userId,
      reason,
      refundAmount,
      refundProcessed: false
    };

    await booking.save();

    // TODO: Process refund if refundAmount > 0
    // This would involve calling the payment service to process the refund

    res.status(200).json({
      success: true,
      data: { booking },
      message: `Booking cancelled successfully${refundAmount > 0 ? `. Refund of ${refundAmount} SAR will be processed.` : ''}`
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
};

// @desc    Update booking status (for vendors/admin)
// @route   PUT /api/bookings/:id/status
// @access  Private (Admin/Vendor)
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findById(id)
      .populate('vendor');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions (admin or vendor owner)
    const isAdmin = req.user.role === 'admin';
    const isVendorOwner = booking.vendor.createdBy.toString() === userId;

    if (!isAdmin && !isVendorOwner) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this booking'
      });
    }

    // Validate status transition
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking status'
      });
    }

    booking.status = status;
    
    if (notes) {
      if (isAdmin) {
        booking.notes.admin = notes;
      } else {
        booking.notes.vendor = notes;
      }
    }

    await booking.save();

    res.status(200).json({
      success: true,
      data: { booking },
      message: 'Booking status updated successfully'
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status'
    });
  }
};

// @desc    Add review to booking
// @route   POST /api/bookings/:id/review
// @access  Private
const addBookingReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    const booking = await Booking.findOne({
      _id: id,
      user: userId
    }).populate('activity');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    // Check if already reviewed
    if (booking.review.rating) {
      return res.status(400).json({
        success: false,
        message: 'Booking already reviewed'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Add review to booking
    booking.review = {
      rating,
      comment,
      submittedAt: new Date()
    };

    await booking.save();

    // Add review to activity
    const activity = await Activity.findById(booking.activity._id);
    activity.reviews.push({
      user: userId,
      rating,
      comment,
      date: new Date(),
      isVerified: true // Since it's from a completed booking
    });

    // Update activity rating
    await activity.updateRating(rating);

    res.status(200).json({
      success: true,
      data: { booking },
      message: 'Review added successfully'
    });

  } catch (error) {
    console.error('Add booking review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review'
    });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
  addBookingReview
};