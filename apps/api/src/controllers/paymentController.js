/**
 * @fileoverview Enhanced Controller for handling payments with Moyasar integration.
 * @module controllers/paymentController
 * 
 * This controller provides comprehensive payment processing capabilities including:
 * - Payment creation and processing
 * - Payment confirmation and status tracking
 * - Refund processing
 * - Payment method management
 * - Webhook handling
 * - Payment analytics and reporting
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const moyasarService = require('../services/moyasarService');
const emailService = require('../services/emailService');
const Booking = require('../models/Booking');
const BookingEnhanced = require('../models/BookingEnhanced');
const User = require('../models/User');
const UserEnhanced = require('../models/UserEnhanced');
const Vendor = require('../models/Vendor');
const PaymentEnhanced = require('../models/PaymentEnhanced');

/**
 * Create a new payment for a booking.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const createPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, cardData, savedTokenId } = req.body;
    const userId = req.user.id;

    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate('activity')
      .populate('user');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify booking belongs to user
    if (booking.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to process payment for this booking'
      });
    }

    // Verify booking is in pending status
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking is not in pending status'
      });
    }

    // Create payment source based on method
    let paymentSource;
    
    switch (paymentMethod) {
      case 'credit_card':
        if (savedTokenId) {
          paymentSource = moyasarService.createTokenSource(savedTokenId);
        } else if (cardData) {
          paymentSource = moyasarService.createCardSource(cardData);
        } else {
          return res.status(400).json({
            success: false,
            message: 'Card data or saved token required for credit card payment'
          });
        }
        break;
      
      case 'apple_pay':
        if (!req.body.applePayToken) {
          return res.status(400).json({
            success: false,
            message: 'Apple Pay token required'
          });
        }
        paymentSource = moyasarService.createApplePaySource(req.body.applePayToken);
        break;
      
      case 'stc_pay':
        if (!req.body.mobile) {
          return res.status(400).json({
            success: false,
            message: 'Mobile number required for STC Pay'
          });
        }
        paymentSource = moyasarService.createSTCPaySource(req.body.mobile);
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method'
        });
    }

    // Create payment with Moyasar
    const paymentData = {
      amount: booking.pricing.totalPrice,
      description: `Booking for ${booking.activity.title}`,
      callbackUrl: `${process.env.CLIENT_URL}/payment/callback`,
      source: paymentSource,
      bookingId: booking._id,
      userId: userId,
      activityId: booking.activity._id,
      metadata: {
        booking_reference: booking.bookingId,
        activity_title: booking.activity.title,
        booking_date: booking.bookingDate,
        participants: booking.participants.count
      }
    };

    const moyasarPayment = await moyasarService.createPayment(paymentData);

    // Update booking with payment information
    booking.payment.moyasarPaymentId = moyasarPayment.id;
    booking.payment.method = paymentMethod;
    booking.payment.status = moyasarService.getPaymentStatus(moyasarPayment.status);
    
    if (moyasarPayment.source?.company || moyasarPayment.source?.brand) {
      booking.payment.brand = moyasarPayment.source.company || moyasarPayment.source.brand;
    }
    
    if (moyasarPayment.source?.last_four) {
      booking.payment.last4 = moyasarPayment.source.last_four;
    }

    await booking.save();

    // If payment is immediately successful, update booking status
    if (moyasarPayment.status === 'paid') {
      booking.status = 'confirmed';
      booking.payment.paidAt = new Date();
      await booking.save();
    }

    res.status(200).json({
      success: true,
      data: {
        paymentId: moyasarPayment.id,
        status: moyasarPayment.status,
        amount: moyasarService.parseAmount(moyasarPayment.amount),
        currency: moyasarPayment.currency,
        booking: {
          id: booking._id,
          status: booking.status,
          bookingId: booking.bookingId
        }
      }
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({
      success: false,
      message: moyasarService.getErrorMessage(error)
    });
  }
};

/**
 * Confirm a payment after a redirect.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Retrieve payment from Moyasar
    const moyasarPayment = await moyasarService.retrievePayment(paymentId);

    // Find booking
    const booking = await Booking.findOne({
      'payment.moyasarPaymentId': paymentId
    }).populate('activity user');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found for this payment'
      });
    }

    // Update booking based on payment status
    const newStatus = moyasarService.getPaymentStatus(moyasarPayment.status);
    booking.payment.status = newStatus;

    if (moyasarPayment.status === 'paid') {
      booking.status = 'confirmed';
      booking.payment.paidAt = new Date();
      
      // Send booking confirmation email
  try {
  const _vendor = await Vendor.findById(booking.vendor);
        const populatedBooking = await Booking.findById(booking._id)
          .populate('activity')
          .populate('vendor')
          .populate('user');
        
        await emailService.sendBookingConfirmationEmail(
          populatedBooking,
          populatedBooking.activity,
          populatedBooking.vendor
        );
        console.log(`✅ Booking confirmation email sent to ${booking.user.email}`);
  } catch (emailError) {
        console.error('Failed to send booking confirmation email:', emailError);
        // Don't fail the payment confirmation if email fails
      }
    } else if (moyasarPayment.status === 'failed') {
      booking.status = 'cancelled';
    }

    await booking.save();

    res.status(200).json({
      success: true,
      data: {
        paymentId: moyasarPayment.id,
        status: moyasarPayment.status,
        booking: {
          id: booking._id,
          status: booking.status,
          bookingId: booking.bookingId
        }
      }
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: moyasarService.getErrorMessage(error)
    });
  }
};

/**
 * Get the status of a payment.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const moyasarPayment = await moyasarService.retrievePayment(paymentId);

    res.status(200).json({
      success: true,
      data: {
        id: moyasarPayment.id,
        status: moyasarPayment.status,
        amount: moyasarService.parseAmount(moyasarPayment.amount),
        currency: moyasarPayment.currency,
        created: moyasarPayment.created_at,
        description: moyasarPayment.description
      }
    });

  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({
      success: false,
      message: moyasarService.getErrorMessage(error)
    });
  }
};

/**
 * Process a refund for a booking.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const processRefund = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    // Find booking
    const booking = await Booking.findById(bookingId)
      .populate('activity user');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify booking can be refunded
    if (booking.payment.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Booking payment is not in paid status'
      });
    }

    // Calculate refund amount based on cancellation policy
    const refundAmount = booking.getRefundAmount();
    
    if (refundAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Booking is not eligible for refund based on cancellation policy'
      });
    }

    // Process refund with Moyasar
    const refundData = {
      amount: refundAmount,
      reason: reason || 'Booking cancellation'
    };

    const moyasarRefund = await moyasarService.refundPayment(
      booking.payment.moyasarPaymentId,
      refundData
    );

    // Update booking
    booking.payment.status = 'refunded';
    booking.payment.refundedAt = new Date();
    booking.payment.refundAmount = refundAmount;
    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: req.user.id,
      reason: reason,
      refundAmount: refundAmount,
      refundProcessed: true
    };

    await booking.save();

    res.status(200).json({
      success: true,
      data: {
        refundId: moyasarRefund.id,
        amount: refundAmount,
        currency: 'SAR',
        booking: {
          id: booking._id,
          status: booking.status,
          bookingId: booking.bookingId
        }
      }
    });

  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({
      success: false,
      message: moyasarService.getErrorMessage(error)
    });
  }
};

/**
 * Save a new payment method for the authenticated user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const savePaymentMethod = async (req, res) => {
  try {
    const { cardData, isDefault } = req.body;
    const userId = req.user.id;

    // Check if payment methods are enabled in site settings
    const SiteSettings = require('../models/SiteSettings');
    const settings = await SiteSettings.getSettings();
    
    // Determine payment method type and check if it's enabled
    let paymentMethodType = 'creditCard'; // Default to credit card
    if (cardData.brand) {
      const brand = cardData.brand.toLowerCase();
      if (brand.includes('mada')) paymentMethodType = 'mada';
      else if (brand.includes('apple')) paymentMethodType = 'applePay';
      else if (brand.includes('stc')) paymentMethodType = 'stcPay';
      else if (brand.includes('sadad')) paymentMethodType = 'sadad';
    }
    
    const methodEnabledKey = `${paymentMethodType}Enabled`;
    if (!settings.paymentMethodControls?.[methodEnabledKey]) {
      return res.status(403).json({
        success: false,
        message: `${paymentMethodType} payments are currently disabled`
      });
    }

    // Tokenize card with Moyasar
    const tokenResponse = await moyasarService.tokenizeCard(cardData);

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If this is default, set all others to non-default
    if (isDefault) {
      user.paymentMethods.forEach(method => {
        method.isDefault = false;
      });
    }

    // Add payment method
    const paymentMethod = {
      moyasarTokenId: tokenResponse.id,
      last4: tokenResponse.last_four,
      brand: tokenResponse.brand || tokenResponse.company,
      isDefault: isDefault || user.paymentMethods.length === 0
    };

    user.paymentMethods.push(paymentMethod);
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: paymentMethod._id,
        last4: paymentMethod.last4,
        brand: paymentMethod.brand,
        isDefault: paymentMethod.isDefault
      }
    });

  } catch (error) {
    console.error('Save payment method error:', error);
    res.status(500).json({
      success: false,
      message: moyasarService.getErrorMessage(error)
    });
  }
};

/**
 * Get all saved payment methods for the authenticated user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getUserPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('paymentMethods');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const paymentMethods = user.paymentMethods.map(method => ({
      id: method._id,
      last4: method.last4,
      brand: method.brand,
      isDefault: method.isDefault,
      createdAt: method.createdAt
    }));

    res.status(200).json({
      success: true,
      data: paymentMethods
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment methods'
    });
  }
};

/**
 * Handle incoming webhooks from Moyasar.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-moyasar-signature'];
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    if (!moyasarService.verifyWebhookSignature(payload, signature)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = req.body;

    switch (event.type) {
      case 'payment_paid':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'payment_refunded':
        await handlePaymentRefunded(event.data.object);
        break;
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(400).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

/**
 * Handle a successful payment event from a webhook.
 * @param {object} payment - The payment object from the webhook.
 * @returns {Promise<void>}
 */
const handlePaymentSuccess = async (payment) => {
  const booking = await Booking.findOne({
    'payment.moyasarPaymentId': payment.id
  }).populate('activity user vendor');

  if (booking) {
    booking.payment.status = 'paid';
    booking.payment.paidAt = new Date();
    booking.status = 'confirmed';
    await booking.save();

    // Send booking confirmation email
    try {
      await emailService.sendBookingConfirmationEmail(
        booking,
        booking.activity,
        booking.vendor
      );
      console.log(`✅ Booking confirmation email sent to ${booking.user.email}`);
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError);
    }

    console.log(`Payment successful for booking ${booking.bookingId}`);
  }
};

/**
 * Handle a failed payment event from a webhook.
 * @param {object} payment - The payment object from the webhook.
 * @returns {Promise<void>}
 */
const handlePaymentFailed = async (payment) => {
  const booking = await Booking.findOne({
    'payment.moyasarPaymentId': payment.id
  });

  if (booking) {
    booking.payment.status = 'failed';
    booking.status = 'cancelled';
    await booking.save();

    console.log(`Payment failed for booking ${booking.bookingId}`);
  }
};

/**
 * Handle a refunded payment event from a webhook.
 * @param {object} payment - The payment object from the webhook.
 * @returns {Promise<void>}
 */
const handlePaymentRefunded = async (payment) => {
  const booking = await Booking.findOne({
    'payment.moyasarPaymentId': payment.id
  });

  if (booking) {
    booking.payment.status = 'refunded';
    booking.payment.refundedAt = new Date();
    await booking.save();

    console.log(`Payment refunded for booking ${booking.bookingId}`);
  }
};

/**
 * Get payment history for a user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, method } = req.query;

    // Build query
    const query = { 'user.id': userId };
    if (status) query.status = status;
    if (method) query.method = method;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get payments with pagination
    const payments = await PaymentEnhanced.find(query)
      .populate('booking.id', 'bookingNumber activity.title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await PaymentEnhanced.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        payments: payments.map(payment => ({
          id: payment._id,
          paymentNumber: payment.paymentNumber,
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
          status: payment.status,
          createdAt: payment.createdAt,
          completedAt: payment.completedAt,
          booking: payment.booking
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment history'
    });
  }
};

/**
 * Get payment analytics for admin.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getPaymentAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Get payment statistics
    const pipeline = [
      { $match: { ...dateFilter } },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          completedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
          },
          failedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          refundedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] }
          },
          refundedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, '$refund.amount', 0] }
          }
        }
      }
    ];

    const stats = await PaymentEnhanced.aggregate(pipeline);

    // Get payment methods breakdown
    const methodBreakdown = await PaymentEnhanced.aggregate([
      { $match: { ...dateFilter } },
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Get daily/weekly/monthly trends
    let groupFormat;
    switch (groupBy) {
      case 'day':
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case 'week':
        groupFormat = { $dateToString: { format: '%Y-%U', date: '$createdAt' } };
        break;
      case 'month':
        groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
      default:
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }

    const trends = await PaymentEnhanced.aggregate([
      { $match: { ...dateFilter } },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: stats[0] || {
          totalPayments: 0,
          totalAmount: 0,
          completedPayments: 0,
          completedAmount: 0,
          failedPayments: 0,
          refundedPayments: 0,
          refundedAmount: 0
        },
        methodBreakdown,
        trends
      }
    });

  } catch (error) {
    console.error('Get payment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment analytics'
    });
  }
};

/**
 * Delete a saved payment method.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const deletePaymentMethod = async (req, res) => {
  try {
    const { methodId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find and remove the payment method
    const methodIndex = user.paymentMethods.findIndex(
      method => method._id.toString() === methodId
    );

    if (methodIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    user.paymentMethods.splice(methodIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Payment method deleted successfully'
    });

  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment method'
    });
  }
};

/**
 * Set default payment method.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const setDefaultPaymentMethod = async (req, res) => {
  try {
    const { methodId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the payment method
    const method = user.paymentMethods.find(
      method => method._id.toString() === methodId
    );

    if (!method) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    // Set all methods to non-default
    user.paymentMethods.forEach(m => m.isDefault = false);
    
    // Set selected method as default
    method.isDefault = true;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Default payment method updated successfully'
    });

  } catch (error) {
    console.error('Set default payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update default payment method'
    });
  }
};

/**
 * Get payment methods configuration.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getPaymentMethodsConfig = async (req, res) => {
  try {
    const SiteSettings = require('../models/SiteSettings');
    const settings = await SiteSettings.getSettings();

    const paymentMethods = [
      {
        id: 'creditcard',
        name: 'Credit/Debit Card',
        icon: '💳',
        enabled: settings.paymentMethodControls?.creditCardEnabled || true
      },
      {
        id: 'mada',
        name: 'MADA',
        icon: '🏦',
        enabled: settings.paymentMethodControls?.madaEnabled || true
      },
      {
        id: 'applepay',
        name: 'Apple Pay',
        icon: '🍎',
        enabled: settings.paymentMethodControls?.applePayEnabled || true
      },
      {
        id: 'stcpay',
        name: 'STC Pay',
        icon: '📱',
        enabled: settings.paymentMethodControls?.stcPayEnabled || true
      },
      {
        id: 'sadad',
        name: 'SADAD',
        icon: '🏪',
        enabled: settings.paymentMethodControls?.sadadEnabled || true
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        methods: paymentMethods.filter(method => method.enabled),
        currency: 'SAR',
        supportedCurrencies: ['SAR', 'USD', 'EUR']
      }
    });

  } catch (error) {
    console.error('Get payment methods config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment methods configuration'
    });
  }
};

module.exports = {
  createPayment,
  confirmPayment,
  getPaymentStatus,
  processRefund,
  savePaymentMethod,
  getUserPaymentMethods,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  getPaymentHistory,
  getPaymentAnalytics,
  getPaymentMethodsConfig,
  handleWebhook
};