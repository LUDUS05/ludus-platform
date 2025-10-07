const express = require('express');
const { authenticate: protect, authorize } = require('../middleware/auth');
const {
  getReferralAnalytics,
  getReferralFunnel,
  getGeographicAnalytics,
  getSourcePerformance,
  getROIAnalytics
} = require('../controllers/analyticsController');

const router = express.Router();

// All routes require authentication and admin privileges
router.use(protect);
router.use(authorize('admin'));

// Get comprehensive referral analytics
router.get('/referrals', getReferralAnalytics);

// Get referral funnel analysis
router.get('/funnel', getReferralFunnel);

// Get geographic analytics
router.get('/geographic', getGeographicAnalytics);

// Get source performance analytics
router.get('/sources', getSourcePerformance);

// Get ROI and performance metrics
router.get('/roi', getROIAnalytics);

module.exports = router;
