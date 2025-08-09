const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getBookings,
  updateBookingStatus
} = require('../controllers/adminController');
const {
  getPages,
  getPage,
  createPage,
  updatePage,
  deletePage,
  duplicatePage,
  getPageAnalytics
} = require('../controllers/pageController');
const { 
  validateVendorCreation,
  validateActivityCreation,
  validateObjectId
} = require('../middleware/validation');
const {
  validateCreatePage,
  validateUpdatePage,
  validateDuplicatePage,
  validatePageId
} = require('../middleware/pageValidation');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);

// Vendor management routes
router.get('/vendors', getVendors);
router.post('/vendors', validateVendorCreation, createVendor);
router.put('/vendors/:id', validateObjectId('id'), updateVendor);
router.delete('/vendors/:id', validateObjectId('id'), deleteVendor);

// Activity management routes
router.get('/activities', getActivities);
router.post('/activities', validateActivityCreation, createActivity);
router.put('/activities/:id', validateObjectId('id'), updateActivity);
router.delete('/activities/:id', validateObjectId('id'), deleteActivity);

// Booking management routes
router.get('/bookings', getBookings);
router.put('/bookings/:id/status', validateObjectId('id'), updateBookingStatus);

// Page management routes
router.get('/pages', getPages);
router.post('/pages', validateCreatePage, createPage);
router.get('/pages/analytics', getPageAnalytics);
router.get('/pages/:id', validatePageId, getPage);
router.put('/pages/:id', validatePageId, validateUpdatePage, updatePage);
router.delete('/pages/:id', validatePageId, deletePage);
router.post('/pages/:id/duplicate', validatePageId, validateDuplicatePage, duplicatePage);

module.exports = router;