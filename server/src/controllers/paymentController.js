const moyasarService = require('../services/moyasarService');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Activity = require('../models/Activity');

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

const savePaymentMethod = async (req, res) => {
  try {
    const { cardData, isDefault } = req.body;
    const userId = req.user.id;

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

// Helper functions for webhook processing
const handlePaymentSuccess = async (payment) => {
  const booking = await Booking.findOne({
    'payment.moyasarPaymentId': payment.id
  }).populate('activity user');

  if (booking) {
    booking.payment.status = 'paid';
    booking.payment.paidAt = new Date();
    booking.status = 'confirmed';
    await booking.save();

    // TODO: Send confirmation email
    console.log(`Payment successful for booking ${booking.bookingId}`);
  }
};

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

module.exports = {
  createPayment,
  confirmPayment,
  getPaymentStatus,
  processRefund,
  savePaymentMethod,
  getUserPaymentMethods,
  handleWebhook
};