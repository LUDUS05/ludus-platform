const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getUserWallet,
  getWalletTransactions,
  depositFunds,
  confirmDeposit,
  withdrawFunds,
  payWithWallet,
  processRefund,
  updateWalletSettings,
  getWalletStats
} = require('../controllers/walletController');

// All wallet routes require authentication
router.use(authenticate);

// @desc    Get user wallet
// @route   GET /api/wallet
// @access  Private
router.get('/', getUserWallet);

// @desc    Get wallet transaction history
// @route   GET /api/wallet/transactions
// @access  Private
router.get('/transactions', getWalletTransactions);

// @desc    Get wallet statistics
// @route   GET /api/wallet/stats
// @access  Private
router.get('/stats', getWalletStats);

// @desc    Add funds to wallet
// @route   POST /api/wallet/deposit
// @access  Private
router.post('/deposit', depositFunds);

// @desc    Confirm deposit (webhook/callback)
// @route   POST /api/wallet/deposit/confirm
// @access  Private
router.post('/deposit/confirm', confirmDeposit);

// @desc    Withdraw funds from wallet
// @route   POST /api/wallet/withdraw
// @access  Private
router.post('/withdraw', withdrawFunds);

// @desc    Pay with wallet funds
// @route   POST /api/wallet/pay
// @access  Private
router.post('/pay', payWithWallet);

// @desc    Process refund to wallet
// @route   POST /api/wallet/refund
// @access  Private
router.post('/refund', processRefund);

// @desc    Update wallet settings
// @route   PUT /api/wallet/settings
// @access  Private
router.put('/settings', updateWalletSettings);

module.exports = router;