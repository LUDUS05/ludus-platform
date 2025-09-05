const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

// Import all controllers
const {
  getDashboardStats,
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  getBookings,
  updateBookingStatus,
  getUsers,
  updateUserStatus,
  bulkUpdateUsers,
  bulkDeleteUsers
} = require('../controllers/adminController');

const {
  bulkUpdateActivities,
  bulkDeleteActivities
} = require('../controllers/activityController');

const {
  // Translation Management
  getTranslations,
  updateTranslations,

  // Category Management
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  updateCategoryStatus,

  // System Settings
  getSystemSettings,
  updateSystemSettings
} = require('../controllers/adminEnhancedController');

const {
  getAdminRoles,
  getAdminTeam,
  assignAdminRole,
  updateAdminUser,
  removeAdminRole,
  getAdminDashboardOverview,
  initializeAdminRoles
} = require('../controllers/adminManagementController');

const {
  getReferralStats,
  getTopInviters,
  getReferralRewards,
  updateReferralRewards,
  getReferralAnalytics,
  exportReferralData
} = require('../controllers/adminReferralController');

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
  validateVendorUpdate,
  validateActivityCreation,
  validateObjectId
} = require('../middleware/validation');

// Create main router
const router = express.Router();

// Apply authentication to all admin routes
router.use(authenticate);

// ==============================================
// DASHBOARD ROUTES
// ==============================================
const dashboardRoutes = express.Router();
dashboardRoutes.use(authorize('admin'));

dashboardRoutes.get('/stats', getDashboardStats);
dashboardRoutes.get('/overview', getAdminDashboardOverview);

router.use('/dashboard', dashboardRoutes);

// ==============================================
// USER MANAGEMENT ROUTES
// ==============================================
const userRoutes = express.Router();
userRoutes.use(authorize('admin'));

userRoutes.get('/', getUsers);
userRoutes.put('/:id/status', validateObjectId('id'), updateUserStatus);

// Bulk operations
userRoutes.put('/bulk', bulkUpdateUsers);
userRoutes.delete('/bulk', bulkDeleteUsers);

router.use('/users', userRoutes);

// ==============================================
// VENDOR MANAGEMENT ROUTES
// ==============================================
const vendorRoutes = express.Router();
vendorRoutes.use(authorize('admin'));

vendorRoutes.get('/', getVendors);
vendorRoutes.get('/:id', validateObjectId('id'), getVendor);
vendorRoutes.post('/', validateVendorCreation, createVendor);
vendorRoutes.put('/:id', validateObjectId('id'), validateVendorUpdate, updateVendor);
vendorRoutes.delete('/:id', validateObjectId('id'), deleteVendor);

router.use('/vendors', vendorRoutes);

// ==============================================
// ACTIVITY MANAGEMENT ROUTES
// ==============================================
const activityRoutes = express.Router();
activityRoutes.use(authorize('admin'));

activityRoutes.get('/', getActivities);
activityRoutes.get('/:id', validateObjectId('id'), getActivity); // Add this line
activityRoutes.post('/', validateActivityCreation, createActivity);
activityRoutes.put('/:id', validateObjectId('id'), updateActivity);
activityRoutes.delete('/:id', validateObjectId('id'), deleteActivity);

// Bulk operations
activityRoutes.put('/bulk', bulkUpdateActivities);
activityRoutes.delete('/bulk', bulkDeleteActivities);

router.use('/activities', activityRoutes);

// ==============================================
// BOOKING MANAGEMENT ROUTES
// ==============================================
const bookingRoutes = express.Router();
bookingRoutes.use(authorize('admin'));

bookingRoutes.get('/', getBookings);
bookingRoutes.put('/:id/status', validateObjectId('id'), updateBookingStatus);

router.use('/bookings', bookingRoutes);

// ==============================================
// PAGE MANAGEMENT ROUTES
// ==============================================
const pageRoutes = express.Router();
pageRoutes.use(authorize('admin'));

pageRoutes.get('/', getPages);
pageRoutes.get('/:id', validateObjectId('id'), getPage);
pageRoutes.post('/', createPage);
pageRoutes.put('/:id', validateObjectId('id'), updatePage);
pageRoutes.delete('/:id', validateObjectId('id'), deletePage);
pageRoutes.post('/:id/duplicate', validateObjectId('id'), duplicatePage);
pageRoutes.get('/:id/analytics', validateObjectId('id'), getPageAnalytics);

router.use('/pages', pageRoutes);

// ==============================================
// TRANSLATION MANAGEMENT ROUTES
// ==============================================
const translationRoutes = express.Router();
translationRoutes.use(authorize('admin'));

translationRoutes.get('/:language/:namespace', getTranslations);
translationRoutes.put('/:language/:namespace', updateTranslations);

router.use('/translations', translationRoutes);

// ==============================================
// CATEGORY MANAGEMENT ROUTES
// ==============================================
const categoryRoutes = express.Router();
categoryRoutes.use(authorize('admin'));

categoryRoutes.get('/', getCategories);
categoryRoutes.post('/', createCategory);
categoryRoutes.put('/:id', validateObjectId('id'), updateCategory);
categoryRoutes.delete('/:id', validateObjectId('id'), deleteCategory);
categoryRoutes.put('/reorder', reorderCategories);
categoryRoutes.put('/:id/status', validateObjectId('id'), updateCategoryStatus);

router.use('/categories', categoryRoutes);

// ==============================================
// SYSTEM SETTINGS ROUTES
// ==============================================
const settingsRoutes = express.Router();
settingsRoutes.use(authorize('admin'));

settingsRoutes.get('/', getSystemSettings);
settingsRoutes.put('/', updateSystemSettings);

router.use('/settings', settingsRoutes);

// ==============================================
// ADMIN TEAM MANAGEMENT ROUTES (High-level admin only)
// ==============================================
const teamRoutes = express.Router();
teamRoutes.use(authorize('admin')); // Basic admin auth for all team routes

// Admin role management routes (commented out complex RBAC for now)
teamRoutes.get('/roles', getAdminRoles);
teamRoutes.post('/roles/initialize', initializeAdminRoles);

// Admin team management routes
teamRoutes.get('/', getAdminTeam);
teamRoutes.post('/assign', assignAdminRole);
teamRoutes.put('/:userId', validateObjectId('userId'), updateAdminUser);
teamRoutes.delete('/:userId', validateObjectId('userId'), removeAdminRole);

router.use('/team', teamRoutes);

// ==============================================
// REFERRAL MANAGEMENT ROUTES
// ==============================================
const referralRoutes = express.Router();
referralRoutes.use(authorize('admin'));

referralRoutes.get('/stats', getReferralStats);
referralRoutes.get('/top-inviters', getTopInviters);
referralRoutes.get('/rewards', getReferralRewards);
referralRoutes.put('/rewards', updateReferralRewards);
referralRoutes.get('/analytics', getReferralAnalytics);
referralRoutes.get('/export', exportReferralData);

router.use('/referrals', referralRoutes);

module.exports = router;