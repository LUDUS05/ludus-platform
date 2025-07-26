const express = require('express');
const router = express.Router();
const {
  createPayment,
  confirmPayment,
  getPaymentStatus,
  processRefund,
  savePaymentMethod,
  getUserPaymentMethods,
  handleWebhook
} = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { validatePayment, validateRefund, validateSavePaymentMethod } = require('../middleware/validation');
const { verifyMoyasarWebhook } = require('../middleware/moyasarWebhook');

// Create payment for booking
router.post('/create-payment', authenticate, validatePayment, createPayment);

// Confirm payment status (for callback handling)
router.post('/confirm-payment/:paymentId', authenticate, confirmPayment);

// Get payment status
router.get('/:paymentId/status', authenticate, getPaymentStatus);

// Process refund
router.post('/refund/:bookingId', authenticate, validateRefund, processRefund);

// Save payment method (tokenize card)
router.post('/save-method', authenticate, validateSavePaymentMethod, savePaymentMethod);

// Get user's saved payment methods
router.get('/methods', authenticate, getUserPaymentMethods);

// Moyasar webhook endpoint (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;