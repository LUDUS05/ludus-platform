const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { validatePayment, validateRefund, validateSavePaymentMethod } = require('../middleware/validation');
// Moyasar webhook verification handled inside controller's handler

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

// Delete payment method
router.delete('/methods/:methodId', authenticate, deletePaymentMethod);

// Set default payment method
router.put('/methods/:methodId/default', authenticate, setDefaultPaymentMethod);

// Get payment history
router.get('/history', authenticate, getPaymentHistory);

// Get payment analytics (admin only)
router.get('/analytics', authenticate, getPaymentAnalytics);

// Get payment methods configuration
router.get('/config', getPaymentMethodsConfig);

// Moyasar webhook endpoint (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;