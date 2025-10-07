/**
 * @fileoverview Enhanced Payment model for LUDUS platform - LDS-006 Implementation
 * 
 * This model defines the comprehensive payment schema for the LUDUS social activity platform
 * based on the detailed database design specification. It includes payment processing,
 * transaction management, refund handling, and gateway integration with Moyasar
 * for the Saudi Arabian market.
 * 
 * Key Features:
 * - Payment processing with Moyasar integration
 * - Transaction tracking and status management
 * - Refund processing and management
 * - Multiple payment methods support
 * - Gateway response handling
 * - Fee calculation and tracking
 * - Metadata and audit trail
 * - Security and fraud prevention
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Payment Identification
  paymentNumber: {
    type: String,
    unique: true,
    required: [true, 'Payment number is required'],
    index: true
  },

  // Related Entities
  booking: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required'],
      index: true
    },
    bookingNumber: {
      type: String,
      required: [true, 'Booking number is required']
    }
  },
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'User name is required']
    },
    email: {
      type: String,
      required: [true, 'User email is required']
    }
  },

  // Payment Amount
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'SAR',
    enum: ['SAR', 'USD', 'EUR']
  },

  // Payment Method
  method: {
    type: String,
    enum: ['moyasar', 'bank_transfer', 'cash'],
    required: [true, 'Payment method is required']
  },

  // Gateway Information
  gateway: {
    provider: {
      type: String,
      enum: ['moyasar', 'stripe', 'paypal'],
      required: [true, 'Payment gateway provider is required']
    },
    transactionId: {
      type: String,
      index: true
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    fees: {
      type: Number,
      default: 0,
      min: [0, 'Gateway fees cannot be negative']
    },
    netAmount: {
      type: Number,
      min: [0, 'Net amount cannot be negative']
    }
  },

  // Payment Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },

  // Refund Information
  refund: {
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Refund amount cannot be negative']
    },
    reason: {
      type: String,
      maxlength: [500, 'Refund reason cannot exceed 500 characters']
    },
    processedAt: {
      type: Date
    },
    gatewayRefundId: {
      type: String
    },
    refundMethod: {
      type: String,
      enum: ['original', 'bank_transfer', 'cash']
    }
  },

  // Payment Details
  paymentDetails: {
    cardLast4: {
      type: String,
      maxlength: 4
    },
    cardBrand: {
      type: String,
      enum: ['visa', 'mastercard', 'mada', 'amex']
    },
    cardExpiryMonth: {
      type: String,
      maxlength: 2
    },
    cardExpiryYear: {
      type: String,
      maxlength: 4
    },
    bankName: {
      type: String
    },
    bankAccount: {
      type: String
    }
  },

  // Timestamps
  processedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  failedAt: {
    type: Date
  },

  // Metadata
  metadata: {
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    deviceInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    source: {
      type: String,
      enum: ['web', 'mobile', 'admin', 'api'],
      default: 'web'
    }
  },

  // Error Information
  error: {
    code: {
      type: String
    },
    message: {
      type: String
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Generate unique payment number before saving.
 * 
 * Creates a unique payment number using timestamp and random string
 * for easy identification and reference.
 * 
 * @function
 * @param {Function} next - Express middleware next function
 * @returns {void}
 */
paymentSchema.pre('save', function(next) {
  if (!this.paymentNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.paymentNumber = `PAY-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

/**
 * Calculate net amount after fees.
 * 
 * Calculates the net amount after deducting gateway fees
 * from the payment amount.
 * 
 * @method calculateNetAmount
 * @returns {number} The net amount after fees
 */
paymentSchema.methods.calculateNetAmount = function() {
  this.gateway.netAmount = this.amount - this.gateway.fees;
  return this.gateway.netAmount;
};

/**
 * Update payment status and timestamps.
 * 
 * Updates the payment status and sets appropriate timestamps
 * based on the new status.
 * 
 * @method updateStatus
 * @param {string} newStatus - The new payment status
 * @param {Object} options - Additional options for the update
 * @returns {Promise<Payment>} The updated payment document
 */
paymentSchema.methods.updateStatus = function(newStatus, options = {}) {
  this.status = newStatus;
  
  switch (newStatus) {
    case 'processing':
      this.processedAt = new Date();
      break;
    case 'completed':
      this.completedAt = new Date();
      break;
    case 'failed':
      this.failedAt = new Date();
      if (options.error) {
        this.error = options.error;
      }
      break;
    case 'refunded':
      this.refund.processedAt = new Date();
      break;
  }
  
  return this.save();
};

/**
 * Process refund for payment.
 * 
 * Processes a refund for the payment with the specified amount
 * and reason.
 * 
 * @method processRefund
 * @param {number} amount - Refund amount
 * @param {string} reason - Refund reason
 * @param {string} method - Refund method
 * @returns {Promise<Payment>} The updated payment document
 */
paymentSchema.methods.processRefund = function(amount, reason, method = 'original') {
  if (amount > this.amount) {
    throw new Error('Refund amount cannot exceed payment amount');
  }
  
  this.refund.amount = amount;
  this.refund.reason = reason;
  this.refund.refundMethod = method;
  this.refund.processedAt = new Date();
  this.status = 'refunded';
  
  return this.save();
};

/**
 * Check if payment can be refunded.
 * 
 * Determines if the payment can be refunded based on its
 * current status and age.
 * 
 * @method canBeRefunded
 * @returns {boolean} True if payment can be refunded, false otherwise
 */
paymentSchema.methods.canBeRefunded = function() {
  if (this.status !== 'completed') {
    return false;
  }
  
  if (this.refund.amount > 0) {
    return false; // Already refunded
  }
  
  // Check if payment is within refund window (30 days)
  const refundWindow = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  const paymentAge = Date.now() - this.completedAt.getTime();
  
  return paymentAge <= refundWindow;
};

/**
 * Get maximum refund amount.
 * 
 * Calculates the maximum amount that can be refunded
 * for this payment.
 * 
 * @method getMaxRefundAmount
 * @returns {number} The maximum refund amount
 */
paymentSchema.methods.getMaxRefundAmount = function() {
  if (this.status !== 'completed') {
    return 0;
  }
  
  const alreadyRefunded = this.refund.amount || 0;
  return Math.max(0, this.amount - alreadyRefunded);
};

/**
 * Check if payment is successful.
 * 
 * Determines if the payment was successful based on
 * its current status.
 * 
 * @method isSuccessful
 * @returns {boolean} True if payment is successful, false otherwise
 */
paymentSchema.methods.isSuccessful = function() {
  return this.status === 'completed';
};

/**
 * Check if payment is failed.
 * 
 * Determines if the payment failed based on
 * its current status.
 * 
 * @method isFailed
 * @returns {boolean} True if payment failed, false otherwise
 */
paymentSchema.methods.isFailed = function() {
  return this.status === 'failed';
};

/**
 * Check if payment is pending.
 * 
 * Determines if the payment is still pending based on
 * its current status.
 * 
 * @method isPending
 * @returns {boolean} True if payment is pending, false otherwise
 */
paymentSchema.methods.isPending = function() {
  return this.status === 'pending' || this.status === 'processing';
};

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return `${this.amount.toFixed(2)} ${this.currency}`;
});

// Virtual for formatted net amount
paymentSchema.virtual('formattedNetAmount').get(function() {
  const netAmount = this.gateway.netAmount || this.amount;
  return `${netAmount.toFixed(2)} ${this.currency}`;
});

// Virtual for is refunded
paymentSchema.virtual('isRefunded').get(function() {
  return this.status === 'refunded' && this.refund.amount > 0;
});

// Virtual for refund amount remaining
paymentSchema.virtual('refundAmountRemaining').get(function() {
  return this.getMaxRefundAmount();
});

// Indexes for performance optimization
paymentSchema.index({ paymentNumber: 1 });
paymentSchema.index({ 'booking.id': 1 });
paymentSchema.index({ 'user.id': 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ 'gateway.transactionId': 1 });
paymentSchema.index({ 'gateway.provider': 1, status: 1 });
paymentSchema.index({ processedAt: -1 });
paymentSchema.index({ completedAt: -1 });

module.exports = mongoose.model('PaymentEnhanced', paymentSchema);

