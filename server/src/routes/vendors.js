const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const {
  getVendorProfile,
  getVendorActivities,
  getVendors,
  getVendorReviews
} = require('../controllers/vendorController');

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

module.exports = router;