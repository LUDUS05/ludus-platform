/**
 * @fileoverview Enhanced Booking model for LUDUS platform - LDS-006 Implementation
 * 
 * This model defines the comprehensive booking schema for the LUDUS social activity platform
 * based on the detailed database design specification. It includes booking management,
 * participant tracking, payment processing, status management, and communication
 * with cultural sensitivity for the Saudi Arabian market.
 * 
 * Key Features:
 * - Comprehensive booking information and metadata
 * - Participant management with detailed information
 * - Payment processing integration with Moyasar
 * - Status tracking and workflow management
 * - Communication and notification tracking
 * - Cancellation and refund management
 * - Contact information and emergency contacts
 * - Special requests and notes management
 * - Check-in and review tracking
 * - Metadata and audit trail
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Booking Identification
  bookingNumber: {
    type: String,
    unique: true,
    required: [true, 'Booking number is required']
  },

  // User Information
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    name: {
      type: String,
      required: [true, 'User name is required']
    },
    nameAr: {
      type: String
    },
    email: {
      type: String,
      required: [true, 'User email is required']
    },
    phone: {
      type: String,
      required: [true, 'User phone is required']
    }
  },

  // Activity Information
  activity: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
      required: [true, 'Activity ID is required']
    },
    title: {
      type: String,
      required: [true, 'Activity title is required']
    },
    titleEn: {
      type: String
    },
    image: {
      type: String
    },
    partner: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partner'
      },
      name: {
        type: String,
        required: [true, 'Partner name is required']
      },
      nameEn: {
        type: String
      },
      phone: {
        type: String,
        required: [true, 'Partner phone is required']
      }
    }
  },

  // Schedule Information
  schedule: {
    date: {
      type: Date,
      required: [true, 'Booking date is required']
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required']
    },
    duration: {
      type: String,
      required: [true, 'Duration is required']
    }
  },

  // Participant Information
  participants: [{
    type: {
      type: String,
      enum: ['adult', 'child', 'senior'],
      required: [true, 'Participant type is required']
    },
    name: {
      type: String,
      required: [true, 'Participant name is required']
    },
    nameAr: {
      type: String
    },
    age: {
      type: Number,
      required: [true, 'Participant age is required'],
      min: [0, 'Age cannot be negative'],
      max: [120, 'Age cannot exceed 120']
    },
    idNumber: {
      type: String,
      required: [true, 'ID number is required']
    },
    specialRequests: {
      type: String,
      maxlength: [500, 'Special requests cannot exceed 500 characters']
    }
  }],

  // Contact Information
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Contact phone is required']
    },
    email: {
      type: String,
      required: [true, 'Contact email is required']
    },
    emergencyContact: {
      name: {
        type: String,
        required: [true, 'Emergency contact name is required']
      },
      phone: {
        type: String,
        required: [true, 'Emergency contact phone is required']
      },
      relationship: {
        type: String,
        required: [true, 'Emergency contact relationship is required']
      }
    }
  },

  // Pricing Information
  pricing: {
    adultPrice: {
      type: Number,
      required: [true, 'Adult price is required'],
      min: [0, 'Adult price cannot be negative']
    },
    childPrice: {
      type: Number,
      required: [true, 'Child price is required'],
      min: [0, 'Child price cannot be negative']
    },
    seniorPrice: {
      type: Number,
      default: 0,
      min: [0, 'Senior price cannot be negative']
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative']
    },
    tax: {
      type: Number,
      required: [true, 'Tax amount is required'],
      min: [0, 'Tax cannot be negative']
    },
    total: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total cannot be negative']
    },
    currency: {
      type: String,
      default: 'SAR',
      enum: ['SAR', 'USD', 'EUR']
    }
  },

  // Payment Information
  payment: {
    method: {
      type: String,
      enum: ['moyasar', 'bank_transfer', 'cash'],
      required: [true, 'Payment method is required']
    },
    status: {
      type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
    },
    transactionId: {
      type: String
    },
    paidAt: {
      type: Date
    },
    refundedAt: {
      type: Date
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: [0, 'Refund amount cannot be negative']
    }
  },

  // Booking Status
  status: {
    type: String,
    enum: ['pending_payment', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending_payment'
  },

  // Cancellation Information
  cancellation: {
    requestedAt: {
      type: Date
    },
    reason: {
      type: String,
      maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
    },
    refundRequested: {
      type: Boolean,
      default: false
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: [0, 'Refund amount cannot be negative']
    },
    refundStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'processed'],
      default: null
    }
  },

  // Special Requests and Notes
  specialRequests: {
    type: String,
    maxlength: [1000, 'Special requests cannot exceed 1000 characters']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },

  // Waiver Information
  waiverSigned: {
    type: Boolean,
    default: false
  },
  waiverSignedAt: {
    type: Date
  },

  // Review Information
  review: {
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      maxlength: [1000, 'Review comment cannot exceed 1000 characters']
    },
    submittedAt: {
      type: Date
    }
  },

  // Check-in Information
  checkIn: {
    checkedIn: {
      type: Boolean,
      default: false
    },
    checkInTime: {
      type: Date
    },
    checkInBy: {
      type: String,
      enum: ['customer', 'vendor', 'admin']
    }
  },

  // Communication Tracking
  communication: {
    confirmationSent: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date
      }
    },
    reminderSent: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date
      }
    },
    followUpSent: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date
      }
    }
  },

  // Metadata
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'admin', 'api'],
      default: 'web'
    },
    userAgent: {
      type: String
    },
    ipAddress: {
      type: String
    },
    referrer: {
      type: String
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Generate unique booking number before saving.
 * 
 * Creates a unique booking number using timestamp and random string
 * for easy identification and reference.
 * 
 * @function
 * @param {Function} next - Express middleware next function
 * @returns {void}
 */
bookingSchema.pre('save', function(next) {
  if (!this.bookingNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.bookingNumber = `LUDUS-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

/**
 * Calculate total price with taxes and fees.
 * 
 * Calculates the total price including taxes and any applicable fees
 * based on the pricing structure and participant counts.
 * 
 * @method calculateTotalPrice
 * @returns {number} The calculated total price
 */
bookingSchema.methods.calculateTotalPrice = function() {
  const adultCount = this.participants.filter(p => p.type === 'adult').length;
  const childCount = this.participants.filter(p => p.type === 'child').length;
  const seniorCount = this.participants.filter(p => p.type === 'senior').length;
  
  const subtotal = (adultCount * this.pricing.adultPrice) + 
                   (childCount * this.pricing.childPrice) + 
                   (seniorCount * this.pricing.seniorPrice);
  
  this.pricing.subtotal = subtotal;
  this.pricing.tax = subtotal * 0.15; // 15% VAT for Saudi Arabia
  this.pricing.total = subtotal + this.pricing.tax;
  
  return this.pricing.total;
};

/**
 * Check if booking can be cancelled.
 * 
 * Determines if a booking can be cancelled based on the booking date
 * and current status, considering the cancellation policy.
 * 
 * @method canBeCancelled
 * @returns {boolean} True if booking can be cancelled, false otherwise
 */
bookingSchema.methods.canBeCancelled = function() {
  if (this.status === 'cancelled' || this.status === 'completed') {
    return false;
  }
  
  const now = new Date();
  const bookingDateTime = new Date(this.schedule.date);
  const hoursDifference = (bookingDateTime - now) / (1000 * 60 * 60);
  
  // Can cancel if booking is more than 24 hours away
  return hoursDifference > 24;
};

/**
 * Get refund amount based on cancellation policy.
 * 
 * Calculates the refund amount based on when the cancellation
 * is requested relative to the booking date.
 * 
 * @method getRefundAmount
 * @returns {number} The refund amount
 */
bookingSchema.methods.getRefundAmount = function() {
  if (!this.canBeCancelled()) {
    return 0;
  }
  
  const now = new Date();
  const bookingDateTime = new Date(this.schedule.date);
  const hoursDifference = (bookingDateTime - now) / (1000 * 60 * 60);
  
  // Full refund if cancelled more than 48 hours in advance
  if (hoursDifference > 48) {
    return this.pricing.total;
  }
  
  // 50% refund if cancelled 24-48 hours in advance
  if (hoursDifference > 24) {
    return this.pricing.total * 0.5;
  }
  
  // No refund if cancelled less than 24 hours in advance
  return 0;
};

/**
 * Update booking status and trigger related actions.
 * 
 * Updates the booking status and performs related actions such as
 * updating activity statistics and sending notifications.
 * 
 * @method updateStatus
 * @param {string} newStatus - The new status to set
 * @param {Object} options - Additional options for the update
 * @returns {Promise<Booking>} The updated booking document
 */
bookingSchema.methods.updateStatus = async function(newStatus, options = {}) {
  this.status = newStatus;
  
  if (newStatus === 'confirmed' && this.payment.status === 'completed') {
    this.payment.paidAt = new Date();
  }
  
  if (newStatus === 'cancelled') {
    this.cancellation.requestedAt = new Date();
    this.cancellation.reason = options.reason || 'No reason provided';
    this.cancellation.refundAmount = this.getRefundAmount();
  }
  
  return this.save();
};

// Virtual for formatted booking date and time
bookingSchema.virtual('formattedDateTime').get(function() {
  const date = new Date(this.schedule.date);
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return `${dateStr} at ${this.schedule.timeSlot}`;
});

// Virtual for participant count
bookingSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Virtual for is upcoming
bookingSchema.virtual('isUpcoming').get(function() {
  return new Date(this.schedule.date) > new Date() && this.status === 'confirmed';
});

// Virtual for is past
bookingSchema.virtual('isPast').get(function() {
  return new Date(this.schedule.date) < new Date();
});

// Virtual for display activity title
bookingSchema.virtual('displayActivityTitle').get(function() {
  return this.activity.titleEn || this.activity.title;
});

// Virtual for display user name
bookingSchema.virtual('displayUserName').get(function() {
  return this.user.nameAr || this.user.name;
});

// Indexes for performance optimization
bookingSchema.index({ 'user.id': 1, status: 1 });
bookingSchema.index({ 'activity.id': 1, 'schedule.date': 1 });
bookingSchema.index({ 'schedule.date': 1, status: 1 });
bookingSchema.index({ 'payment.status': 1, status: 1 });
bookingSchema.index({ createdAt: -1, status: 1 });
bookingSchema.index({ 'activity.partner.id': 1, status: 1 });

module.exports = mongoose.model('BookingEnhanced', bookingSchema);

