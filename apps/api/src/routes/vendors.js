const express = require('express');
const router = express.Router();
const { optionalAuth, authenticate } = require('../middleware/auth');
const { requireAdminRole } = require('../middleware/rbac');
const {
  validateObjectId
} = require('../middleware/validation');
const {
  getVendorProfile,
  getVendorActivities,
  getVendors,
  getVendorReviews,
  registerVendor,
  getVendorAnalytics,
  updateVendorStatus,
  uploadVendorDocument,
  getVendorDashboard
} = require('../controllers/vendorController');

// @desc    Register new vendor
// @route   POST /api/vendors
// @access  Public
router.post('/', registerVendor);

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Public
router.get('/', optionalAuth, getVendors);

// @desc    Get vendor reviews
// @route   GET /api/vendors/:id/reviews
// @access  Public
router.get('/:id/reviews', optionalAuth, getVendorReviews);

// @desc    Get vendor activities
// @route   GET /api/vendors/:id/activities
// @access  Public
router.get('/:id/activities', optionalAuth, getVendorActivities);

// @desc    Get vendor profile
// @route   GET /api/vendors/:id
// @access  Public
router.get('/:id', optionalAuth, getVendorProfile);

// @desc    Get vendor analytics
// @route   GET /api/vendors/:id/analytics
// @access  Private (Vendor/Admin)
router.get('/:id/analytics', authenticate, validateObjectId('id'), getVendorAnalytics);

// @desc    Update vendor status
// @route   PUT /api/vendors/:id/status
// @access  Private (Admin)
router.put('/:id/status', authenticate, requireAdminRole, validateObjectId('id'), updateVendorStatus);

// @desc    Upload vendor document
// @route   POST /api/vendors/:id/documents
// @access  Private (Vendor/Admin)
router.post('/:id/documents', authenticate, validateObjectId('id'), uploadVendorDocument);

// @desc    Get vendor dashboard
// @route   GET /api/vendors/dashboard
// @access  Private (Vendor)
router.get('/dashboard', authenticate, getVendorDashboard);

module.exports = router;