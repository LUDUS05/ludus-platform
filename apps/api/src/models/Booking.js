const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    startTime: {
      type: String,
      required: true // HH:MM format
    },
    endTime: {
      type: String,
      required: true // HH:MM format
    }
  },
  participants: {
    count: {
      type: Number,
      required: true,
      min: 1
    },
    details: [{
      name: {
        type: String,
        required: true
      },
      age: Number,
      email: String,
      phone: String,
      specialRequirements: String
    }]
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    },
    discount: {
      amount: { type: Number, default: 0 },
      reason: String
    },
    taxes: {
      amount: { type: Number, default: 0 },
      rate: { type: Number, default: 0 }
    },
    fees: {
      platform: { type: Number, default: 0 },
      processing: { type: Number, default: 0 }
    }
  },
  payment: {
    moyasarPaymentId: {
      type: String,
      required: true
    },
    moyasarInvoiceId: String, // Optional for invoice-based payments
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['credit_card', 'mada', 'apple_pay', 'stc_pay', 'sadad'],
      required: true
    },
    last4: String, // Last 4 digits of card (if applicable)
    brand: String, // Payment method brand
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  communication: {
    confirmationSent: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false },
    followUpSent: { type: Boolean, default: false }
  },
  contactInfo: {
    email: {
      type: String,
      required: true
    },
    phone: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  notes: {
    customer: String,
    vendor: String,
    admin: String
  },
  specialRequests: String,
  waiverSigned: {
    type: Boolean,
    default: false
  },
  waiverSignedAt: Date,
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    refundAmount: Number,
    refundProcessed: { type: Boolean, default: false }
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  },
  checkIn: {
    checkedIn: { type: Boolean, default: false },
    checkInTime: Date,
    checkInBy: String // 'customer' or 'vendor'
  },
  notifications: {
    confirmationEmail: { sent: Boolean, sentAt: Date },
    reminderEmail: { sent: Boolean, sentAt: Date },
    reminderSMS: { sent: Boolean, sentAt: Date },
    followUpEmail: { sent: Boolean, sentAt: Date }
  },
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'admin', 'api'],
      default: 'web'
    },
    userAgent: String,
    ipAddress: String,
    referrer: String
  }
}, {
  timestamps: true
});

// Generate unique booking ID
bookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.bookingId = `LDS-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Calculate total price with taxes and fees
bookingSchema.methods.calculateTotalPrice = function() {
  const subtotal = this.pricing.basePrice - this.pricing.discount.amount;
  const taxAmount = subtotal * (this.pricing.taxes.rate / 100);
  const totalFees = this.pricing.fees.platform + this.pricing.fees.processing;
  
  this.pricing.taxes.amount = taxAmount;
  this.pricing.totalPrice = subtotal + taxAmount + totalFees;
  
  return this.pricing.totalPrice;
};

// Check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  if (this.status === 'cancelled' || this.status === 'completed') {
    return false;
  }
  
  const now = new Date();
  const bookingDateTime = new Date(this.bookingDate);
  const hoursDifference = (bookingDateTime - now) / (1000 * 60 * 60);
  
  // Can cancel if booking is more than 24 hours away
  return hoursDifference > 24;
};

// Get refund amount based on cancellation policy
bookingSchema.methods.getRefundAmount = function() {
  if (!this.canBeCancelled()) {
    return 0;
  }
  
  const now = new Date();
  const bookingDateTime = new Date(this.bookingDate);
  const hoursDifference = (bookingDateTime - now) / (1000 * 60 * 60);
  
  // Full refund if cancelled more than 48 hours in advance
  if (hoursDifference > 48) {
    return this.pricing.totalPrice;
  }
  
  // 50% refund if cancelled 24-48 hours in advance
  if (hoursDifference > 24) {
    return this.pricing.totalPrice * 0.5;
  }
  
  // No refund if cancelled less than 24 hours in advance
  return 0;
};

// Check if booking is upcoming
bookingSchema.virtual('isUpcoming').get(function() {
  return new Date(this.bookingDate) > new Date() && this.status === 'confirmed';
});

// Check if booking is past
bookingSchema.virtual('isPast').get(function() {
  return new Date(this.bookingDate) < new Date();
});

// Get formatted booking date and time
bookingSchema.virtual('formattedDateTime').get(function() {
  const date = new Date(this.bookingDate);
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return `${dateStr} at ${this.timeSlot.startTime}`;
});

// Update activity booking statistics
bookingSchema.post('save', async function() {
  if (this.status === 'confirmed' && this.payment.status === 'paid') {
    await mongoose.model('Activity').findByIdAndUpdate(
      this.activity,
      {
        $inc: {
          'statistics.totalBookings': 1,
          'statistics.totalRevenue': this.pricing.totalPrice
        }
      }
    );
    
    await mongoose.model('Vendor').findByIdAndUpdate(
      this.vendor,
      {
        $inc: {
          'statistics.totalBookings': 1,
          'statistics.totalRevenue': this.pricing.totalPrice
        }
      }
    );
  }
});

module.exports = mongoose.model('Booking', bookingSchema);