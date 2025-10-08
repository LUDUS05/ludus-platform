/**
 * @fileoverview Enhanced Controller for handling bookings - LDS-011 Implementation
 * @module controllers/bookingController
 * 
 * This controller provides comprehensive booking management functionality including:
 * - Booking creation and validation
 * - Booking retrieval and filtering
 * - Booking status management
 * - Payment integration
 * - Cancellation and refund handling
 * - Review and rating system
 * - Check-in functionality
 * - Analytics and reporting
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const Booking = require('../models/Booking');
const BookingEnhanced = require('../models/BookingEnhanced');
const Activity = require('../models/Activity');
const ActivityEnhanced = require('../models/ActivityEnhanced');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const UserEnhanced = require('../models/UserEnhanced');
const { paymentService } = require('../services/moyasarService');
const { sendEmail } = require('../utils/email');
const { generateQRCode } = require('../utils/qrCode');

/**
 * Create a new booking.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
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
      message: 'Booking created successfully',
      animationTriggers: {
        celebration: true,
        confetti: true,
        successMessage: 'تم تأكيد الحجز بنجاح! 🎉',
        hapticFeedback: true
      }
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

/**
 * Get all bookings for the authenticated user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
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

/**
 * Get a single booking by its ID.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
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

/**
 * Cancel a booking.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
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

/**
 * Update the status of a booking (for vendors/admin).
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
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

/**
 * Add a review to a booking.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
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

/**
 * Create an enhanced booking with comprehensive features.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const createEnhancedBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      activityId,
      schedule,
      participants,
      contactInfo,
      specialRequests,
      waiverSigned,
      paymentMethod,
      savePaymentMethod
    } = req.body;

    // Validate activity exists and is active
    const activity = await ActivityEnhanced.findById(activityId)
      .populate('partner', 'name nameEn phone email');
    
    if (!activity || !activity.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found or inactive'
      });
    }

    // Validate user exists
    const user = await UserEnhanced.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate booking date is in the future
    const bookingDateTime = new Date(schedule.date);
    if (bookingDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Booking date must be in the future'
      });
    }

    // Check activity availability
    const existingBookings = await BookingEnhanced.countDocuments({
      'activity.id': activityId,
      'schedule.date': bookingDateTime,
      'schedule.timeSlot': schedule.timeSlot,
      status: { $in: ['confirmed', 'pending_payment'] }
    });

    if (existingBookings >= activity.capacity?.max) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is fully booked'
      });
    }

    // Validate participant count
    if (participants.length > activity.capacity?.max) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${activity.capacity.max} participants allowed`
      });
    }

    if (participants.length < activity.capacity?.min) {
      return res.status(400).json({
        success: false,
        message: `Minimum ${activity.capacity.min} participants required`
      });
    }

    // Calculate pricing
    const adultCount = participants.filter(p => p.type === 'adult').length;
    const childCount = participants.filter(p => p.type === 'child').length;
    const seniorCount = participants.filter(p => p.type === 'senior').length;

    const pricing = {
      adultPrice: activity.pricing?.adultPrice || activity.pricing?.basePrice || 0,
      childPrice: activity.pricing?.childPrice || 0,
      seniorPrice: activity.pricing?.seniorPrice || 0,
      subtotal: (adultCount * (activity.pricing?.adultPrice || activity.pricing?.basePrice || 0)) +
                (childCount * (activity.pricing?.childPrice || 0)) +
                (seniorCount * (activity.pricing?.seniorPrice || 0)),
      tax: 0,
      total: 0,
      currency: 'SAR'
    };

    // Calculate tax (15% VAT for Saudi Arabia)
    pricing.tax = pricing.subtotal * 0.15;
    pricing.total = pricing.subtotal + pricing.tax;

    // Create booking data
    const bookingData = {
      user: {
        id: userId,
        name: user.profile?.firstName + ' ' + user.profile?.lastName,
        nameAr: user.profile?.firstNameAr + ' ' + user.profile?.lastNameAr,
        email: user.email,
        phone: user.profile?.phone
      },
      activity: {
        id: activityId,
        title: activity.title,
        titleEn: activity.titleEn,
        image: activity.images?.[0]?.url,
        partner: {
          id: activity.partner?._id,
          name: activity.partner?.name,
          nameEn: activity.partner?.nameEn,
          phone: activity.partner?.phone
        }
      },
      schedule: {
        date: bookingDateTime,
        timeSlot: schedule.timeSlot,
        duration: activity.duration?.hours ? `${activity.duration.hours} hours` : '2 hours'
      },
      participants,
      contactInfo,
      pricing,
      payment: {
        method: paymentMethod || 'moyasar',
        status: 'pending'
      },
      status: 'pending_payment',
      specialRequests,
      waiverSigned: waiverSigned || false,
      waiverSignedAt: waiverSigned ? new Date() : null,
      metadata: {
        source: 'web',
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    };

    // Create booking
    const booking = new BookingEnhanced(bookingData);
    await booking.save();

    // Generate QR code for booking
    const qrCodeData = await generateQRCode({
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      activityId: activityId,
      date: schedule.date,
      timeSlot: schedule.timeSlot
    });

    // Populate booking with related data
    await booking.populate([
      { path: 'activity.id', select: 'title titleEn images duration' },
      { path: 'activity.partner.id', select: 'name nameEn phone email' }
    ]);

    res.status(201).json({
      success: true,
      data: { 
        booking,
        qrCode: qrCodeData,
        paymentRequired: true
      },
      message: 'Booking created successfully',
      animationTriggers: {
        celebration: true,
        confetti: true,
        successMessage: 'تم إنشاء الحجز بنجاح! 🎉',
        hapticFeedback: true
      }
    });

  } catch (error) {
    console.error('Create enhanced booking error:', error);
    
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

/**
 * Get booking analytics and statistics.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getBookingAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get booking statistics
    const stats = await BookingEnhanced.aggregate([
      {
        $match: {
          'user.id': userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          averageBookingValue: { $avg: '$pricing.total' }
        }
      }
    ]);

    // Get bookings by status
    const bookingsByStatus = await BookingEnhanced.aggregate([
      {
        $match: {
          'user.id': userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get bookings by category
    const bookingsByCategory = await BookingEnhanced.aggregate([
      {
        $match: {
          'user.id': userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'activities',
          localField: 'activity.id',
          foreignField: '_id',
          as: 'activityData'
        }
      },
      {
        $unwind: '$activityData'
      },
      {
        $group: {
          _id: '$activityData.category',
          count: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' }
        }
      }
    ]);

    // Get monthly booking trends
    const monthlyTrends = await BookingEnhanced.aggregate([
      {
        $match: {
          'user.id': userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        stats: stats[0] || {
          totalBookings: 0,
          totalSpent: 0,
          confirmedBookings: 0,
          cancelledBookings: 0,
          completedBookings: 0,
          averageBookingValue: 0
        },
        bookingsByStatus,
        bookingsByCategory,
        monthlyTrends
      }
    });

  } catch (error) {
    console.error('Get booking analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking analytics'
    });
  }
};

/**
 * Check in to a booking.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const checkInBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { checkInBy = 'customer' } = req.body;

    const booking = await BookingEnhanced.findOne({
      _id: id,
      'user.id': userId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed bookings can be checked in'
      });
    }

    if (booking.checkIn.checkedIn) {
      return res.status(400).json({
        success: false,
        message: 'Booking already checked in'
      });
    }

    // Check if check-in is within reasonable time window
    const now = new Date();
    const bookingDateTime = new Date(booking.schedule.date);
    const timeDifference = Math.abs(now - bookingDateTime) / (1000 * 60 * 60); // hours

    if (timeDifference > 2) { // Allow check-in within 2 hours of booking time
      return res.status(400).json({
        success: false,
        message: 'Check-in window has expired'
      });
    }

    // Update check-in status
    booking.checkIn = {
      checkedIn: true,
      checkInTime: now,
      checkInBy
    };

    await booking.save();

    res.status(200).json({
      success: true,
      data: { booking },
      message: 'Check-in successful',
      animationTriggers: {
        celebration: true,
        successMessage: 'تم تسجيل الحضور بنجاح! ✅',
        hapticFeedback: true
      }
    });

  } catch (error) {
    console.error('Check-in booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in'
    });
  }
};

/**
 * Get booking availability for a specific activity and date.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getBookingAvailability = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    const activity = await ActivityEnhanced.findById(activityId);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    const requestedDate = new Date(date);
    const startOfDay = new Date(requestedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(requestedDate.setHours(23, 59, 59, 999));

    // Get existing bookings for the date
    const existingBookings = await BookingEnhanced.find({
      'activity.id': activityId,
      'schedule.date': {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['confirmed', 'pending_payment'] }
    });

    // Get available time slots
    const availableSlots = [];
    const timeSlots = activity.schedule?.timeSlots || [
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
    ];

    for (const timeSlot of timeSlots) {
      const bookingsForSlot = existingBookings.filter(
        booking => booking.schedule.timeSlot === timeSlot
      );

      const availableSpots = (activity.capacity?.max || 10) - bookingsForSlot.length;
      
      if (availableSpots > 0) {
        availableSlots.push({
          timeSlot,
          availableSpots,
          totalCapacity: activity.capacity?.max || 10,
          isAvailable: availableSpots > 0
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        activityId,
        date: requestedDate,
        availableSlots,
        capacity: activity.capacity
      }
    });

  } catch (error) {
    console.error('Get booking availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch availability'
    });
  }
};

/**
 * Send booking confirmation email.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const sendBookingConfirmation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await BookingEnhanced.findOne({
      _id: id,
      'user.id': userId
    }).populate('activity.id');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Send confirmation email
    await sendEmail({
      to: booking.user.email,
      subject: `Booking Confirmation - ${booking.bookingNumber}`,
      template: 'booking-confirmation',
      data: {
        booking,
        user: booking.user,
        activity: booking.activity
      }
    });

    // Update communication status
    booking.communication.confirmationSent = {
      sent: true,
      sentAt: new Date()
    };
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Confirmation email sent successfully'
    });

  } catch (error) {
    console.error('Send booking confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send confirmation email'
    });
  }
};

module.exports = {
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
};