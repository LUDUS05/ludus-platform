/**
 * @fileoverview Enhanced Booking Service for LUDUS Platform
 * @module services/bookingService
 * 
 * This service provides comprehensive booking management functionality including:
 * - Booking creation and management
 * - Availability checking
 * - Payment processing
 * - Check-in functionality
 * - Analytics and reporting
 * - RTL support for Arabic users
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

import api from './api';

const bookingService = {
  /**
   * Create a new enhanced booking
   * @param {Object} bookingData - The booking data
   * @returns {Promise<Object>} The created booking
   */
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings/enhanced', bookingData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create booking');
    }
  },

  /**
   * Get user's bookings with pagination and filtering
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} User's bookings
   */
  getUserBookings: async (params = {}) => {
    try {
      const response = await api.get('/bookings', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
    }
  },

  /**
   * Get a specific booking by ID
   * @param {string} bookingId - The booking ID
   * @returns {Promise<Object>} The booking details
   */
  getBookingById: async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch booking');
    }
  },

  /**
   * Cancel a booking
   * @param {string} bookingId - The booking ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Cancellation result
   */
  cancelBooking: async (bookingId, reason) => {
    try {
      const response = await api.put(`/bookings/${bookingId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel booking');
    }
  },

  /**
   * Add a review to a completed booking
   * @param {string} bookingId - The booking ID
   * @param {Object} reviewData - Review data
   * @returns {Promise<Object>} Review result
   */
  addBookingReview: async (bookingId, reviewData) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/review`, reviewData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add review');
    }
  },

  /**
   * Get booking analytics and statistics
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Booking analytics
   */
  getBookingAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/bookings/analytics', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
    }
  },

  /**
   * Check in to a booking
   * @param {string} bookingId - The booking ID
   * @param {string} checkInBy - Who is checking in
   * @returns {Promise<Object>} Check-in result
   */
  checkInBooking: async (bookingId, checkInBy = 'customer') => {
    try {
      const response = await api.post(`/bookings/${bookingId}/check-in`, { checkInBy });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to check in');
    }
  },

  /**
   * Get booking availability for an activity
   * @param {string} activityId - The activity ID
   * @param {string} date - The date to check
   * @returns {Promise<Object>} Availability data
   */
  getBookingAvailability: async (activityId, date) => {
    try {
      const response = await api.get(`/bookings/availability/${activityId}`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch availability');
    }
  },

  /**
   * Send booking confirmation email
   * @param {string} bookingId - The booking ID
   * @returns {Promise<Object>} Email result
   */
  sendBookingConfirmation: async (bookingId) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/send-confirmation`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send confirmation');
    }
  },

  /**
   * Validate booking data before submission
   * @param {Object} bookingData - The booking data to validate
   * @returns {Object} Validation result
   */
  validateBookingData: (bookingData) => {
    const errors = {};

    // Validate activity ID
    if (!bookingData.activityId) {
      errors.activityId = 'Activity ID is required';
    }

    // Validate schedule
    if (!bookingData.schedule?.date) {
      errors.schedule = 'Booking date is required';
    } else {
      const bookingDate = new Date(bookingData.schedule.date);
      const now = new Date();
      if (bookingDate <= now) {
        errors.schedule = 'Booking date must be in the future';
      }
    }

    if (!bookingData.schedule?.timeSlot) {
      errors.timeSlot = 'Time slot is required';
    }

    // Validate participants
    if (!bookingData.participants || bookingData.participants.length === 0) {
      errors.participants = 'At least one participant is required';
    } else {
      bookingData.participants.forEach((participant, index) => {
        if (!participant.name) {
          errors[`participant_${index}_name`] = 'Participant name is required';
        }
        if (!participant.age || participant.age < 0 || participant.age > 120) {
          errors[`participant_${index}_age`] = 'Valid age is required';
        }
        if (!participant.idNumber) {
          errors[`participant_${index}_idNumber`] = 'ID number is required';
        }
      });
    }

    // Validate contact info
    if (!bookingData.contactInfo?.phone) {
      errors.contactPhone = 'Contact phone is required';
    } else if (!/^\+966[0-9]{9}$/.test(bookingData.contactInfo.phone)) {
      errors.contactPhone = 'Phone must be a valid Saudi number (+966XXXXXXXXX)';
    }

    if (!bookingData.contactInfo?.email) {
      errors.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.contactInfo.email)) {
      errors.contactEmail = 'Valid email is required';
    }

    // Validate emergency contact
    if (!bookingData.contactInfo?.emergencyContact?.name) {
      errors.emergencyName = 'Emergency contact name is required';
    }
    if (!bookingData.contactInfo?.emergencyContact?.phone) {
      errors.emergencyPhone = 'Emergency contact phone is required';
    } else if (!/^\+966[0-9]{9}$/.test(bookingData.contactInfo.emergencyContact.phone)) {
      errors.emergencyPhone = 'Emergency contact phone must be a valid Saudi number';
    }
    if (!bookingData.contactInfo?.emergencyContact?.relationship) {
      errors.emergencyRelationship = 'Emergency contact relationship is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Format booking data for display
   * @param {Object} booking - The booking object
   * @param {string} language - The language (ar/en)
   * @returns {Object} Formatted booking data
   */
  formatBookingForDisplay: (booking, language = 'ar') => {
    const isArabic = language === 'ar';
    
    return {
      id: booking._id,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      activity: {
        title: isArabic ? booking.activity.title : (booking.activity.titleEn || booking.activity.title),
        image: booking.activity.image,
        partner: {
          name: isArabic ? booking.activity.partner.name : (booking.activity.partner.nameEn || booking.activity.partner.name),
          phone: booking.activity.partner.phone
        }
      },
      schedule: {
        date: new Date(booking.schedule.date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US'),
        timeSlot: booking.schedule.timeSlot,
        duration: booking.schedule.duration
      },
      participants: booking.participants.map(p => ({
        name: isArabic ? p.nameAr || p.name : p.name,
        type: p.type,
        age: p.age
      })),
      pricing: {
        subtotal: booking.pricing.subtotal,
        tax: booking.pricing.tax,
        total: booking.pricing.total,
        currency: booking.pricing.currency
      },
      payment: {
        method: booking.payment.method,
        status: booking.payment.status
      },
      checkIn: booking.checkIn,
      review: booking.review,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    };
  },

  /**
   * Get booking status color and text
   * @param {string} status - The booking status
   * @param {string} language - The language (ar/en)
   * @returns {Object} Status styling information
   */
  getBookingStatusInfo: (status, language = 'ar') => {
    const isArabic = language === 'ar';
    
    const statusMap = {
      'pending_payment': {
        color: 'yellow',
        text: isArabic ? 'في انتظار الدفع' : 'Pending Payment',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800'
      },
      'confirmed': {
        color: 'green',
        text: isArabic ? 'مؤكد' : 'Confirmed',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800'
      },
      'cancelled': {
        color: 'red',
        text: isArabic ? 'ملغي' : 'Cancelled',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800'
      },
      'completed': {
        color: 'blue',
        text: isArabic ? 'مكتمل' : 'Completed',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800'
      },
      'no_show': {
        color: 'gray',
        text: isArabic ? 'لم يحضر' : 'No Show',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800'
      }
    };

    return statusMap[status] || {
      color: 'gray',
      text: isArabic ? 'غير معروف' : 'Unknown',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800'
    };
  },

  /**
   * Calculate booking total with taxes
   * @param {Object} pricing - The pricing object
   * @returns {Object} Calculated pricing
   */
  calculateBookingTotal: (pricing) => {
    const subtotal = pricing.subtotal || 0;
    const taxRate = 0.15; // 15% VAT for Saudi Arabia
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return {
      subtotal,
      tax,
      total,
      currency: 'SAR'
    };
  },

  /**
   * Format currency for display
   * @param {number} amount - The amount to format
   * @param {string} currency - The currency code
   * @param {string} language - The language (ar/en)
   * @returns {string} Formatted currency string
   */
  formatCurrency: (amount, currency = 'SAR', language = 'ar') => {
    const isArabic = language === 'ar';
    
    if (isArabic) {
      return `${amount.toFixed(2)} ${currency === 'SAR' ? 'ريال' : currency}`;
    } else {
      return `${currency} ${amount.toFixed(2)}`;
    }
  },

  /**
   * Get available time slots for a date
   * @param {Array} availableSlots - Available slots from API
   * @param {string} language - The language (ar/en)
   * @returns {Array} Formatted time slots
   */
  formatTimeSlots: (availableSlots, language = 'ar') => {
    return availableSlots.map(slot => ({
      ...slot,
      displayTime: slot.timeSlot,
      isAvailable: slot.availableSpots > 0,
      spotsText: language === 'ar' 
        ? `${slot.availableSpots} من ${slot.totalCapacity} متاح`
        : `${slot.availableSpots} of ${slot.totalCapacity} available`
    }));
  },

  /**
   * Check if booking can be cancelled
   * @param {Object} booking - The booking object
   * @returns {boolean} Whether booking can be cancelled
   */
  canCancelBooking: (booking) => {
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return false;
    }

    const now = new Date();
    const bookingDate = new Date(booking.schedule.date);
    const hoursDifference = (bookingDate - now) / (1000 * 60 * 60);

    return hoursDifference > 24;
  },

  /**
   * Get cancellation policy text
   * @param {Object} booking - The booking object
   * @param {string} language - The language (ar/en)
   * @returns {string} Cancellation policy text
   */
  getCancellationPolicy: (booking, language = 'ar') => {
    const now = new Date();
    const bookingDate = new Date(booking.schedule.date);
    const hoursDifference = (bookingDate - now) / (1000 * 60 * 60);

    if (language === 'ar') {
      if (hoursDifference > 48) {
        return 'إلغاء مجاني حتى 48 ساعة قبل النشاط';
      } else if (hoursDifference > 24) {
        return 'استرداد 50% عند الإلغاء قبل 24 ساعة';
      } else {
        return 'لا يمكن الإلغاء قبل أقل من 24 ساعة';
      }
    } else {
      if (hoursDifference > 48) {
        return 'Free cancellation up to 48 hours before activity';
      } else if (hoursDifference > 24) {
        return '50% refund when cancelled before 24 hours';
      } else {
        return 'Cannot cancel less than 24 hours before activity';
      }
    }
  },

  /**
   * Generate QR code data for booking
   * @param {Object} booking - The booking object
   * @returns {Object} QR code data
   */
  generateQRCodeData: (booking) => {
    return {
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      activityId: booking.activity.id,
      date: booking.schedule.date,
      timeSlot: booking.schedule.timeSlot,
      checkInCode: `${booking.bookingNumber}-${booking._id.slice(-6)}`
    };
  },

  /**
   * Get booking analytics summary
   * @param {Object} analytics - Analytics data from API
   * @param {string} language - The language (ar/en)
   * @returns {Object} Formatted analytics summary
   */
  formatAnalyticsSummary: (analytics, language = 'ar') => {
    const isArabic = language === 'ar';
    const stats = analytics.stats || {};

    return {
      totalBookings: stats.totalBookings || 0,
      totalSpent: stats.totalSpent || 0,
      confirmedBookings: stats.confirmedBookings || 0,
      cancelledBookings: stats.cancelledBookings || 0,
      completedBookings: stats.completedBookings || 0,
      averageBookingValue: stats.averageBookingValue || 0,
      completionRate: stats.totalBookings > 0 
        ? Math.round((stats.completedBookings / stats.totalBookings) * 100) 
        : 0,
      displayText: {
        totalBookings: isArabic ? 'إجمالي الحجوزات' : 'Total Bookings',
        totalSpent: isArabic ? 'إجمالي المبلغ المنفق' : 'Total Spent',
        completionRate: isArabic ? 'معدل الإكمال' : 'Completion Rate'
      }
    };
  }
};

export { bookingService };
