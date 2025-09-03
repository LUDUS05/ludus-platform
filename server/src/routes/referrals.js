const express = require('express');
const router = express.Router();
const { authenticate: protect } = require('../middleware/auth');
const {
  generateReferralCode,
  processReferralRegistration,
  processReferralBooking,
  getReferralStats,
  getReferralHistory
} = require('../controllers/referralController');

// @route   POST /api/referrals/generate-code
// @desc    Generate unique referral code for authenticated user
// @access  Private
router.post('/generate-code', protect, generateReferralCode);

// @route   POST /api/referrals/process-registration
// @desc    Process referral during user registration
// @access  Public (called during registration)
router.post('/process-registration', processReferralRegistration);

// @route   POST /api/referrals/process-booking
// @desc    Process referral reward for first booking
// @access  Private (called when user makes first booking)
router.post('/process-booking', protect, processReferralBooking);

// @route   GET /api/referrals/stats/:userId
// @desc    Get referral statistics for user
// @access  Private
router.get('/stats/:userId', protect, getReferralStats);

// @route   GET /api/referrals/history/:userId
// @desc    Get referral history for user
// @access  Private
router.get('/history/:userId', protect, getReferralHistory);

module.exports = router;
