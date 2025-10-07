const express = require('express');
const { authenticate: protect, authorize } = require('../middleware/auth');
const {
  generateReferralReport,
  exportReferralData,
  getReportTemplates
} = require('../controllers/reportingController');

const router = express.Router();

// All routes require authentication and admin privileges
router.use(protect);
router.use(authorize('admin'));

// Get available report templates
router.get('/templates', getReportTemplates);

// Generate referral reports
router.post('/generate', generateReferralReport);

// Export referral data
router.post('/export', exportReferralData);

module.exports = router;
