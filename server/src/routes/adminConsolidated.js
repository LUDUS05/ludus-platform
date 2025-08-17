const express = require('express');
const { authenticate, authorize, requireRole } = require('../middleware/auth');
const { requireAdminRole, requirePermission } = require('../middleware/rbac');

// Import all controllers
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
dashboardRoutes.get('/overview', requireAdminRole(), getAdminDashboardOverview);

router.use('/dashboard', dashboardRoutes);

// ==============================================
// VENDOR MANAGEMENT ROUTES
// ==============================================
const vendorRoutes = express.Router();
vendorRoutes.use(authorize('admin'));

vendorRoutes.get('/', getVendors);
vendorRoutes.post('/', validateVendorCreation, createVendor);
vendorRoutes.put('/:id', validateObjectId, updateVendor);
vendorRoutes.delete('/:id', validateObjectId, deleteVendor);

router.use('/vendors', vendorRoutes);

// ==============================================
// ACTIVITY MANAGEMENT ROUTES
// ==============================================
const activityRoutes = express.Router();
activityRoutes.use(authorize('admin'));

activityRoutes.get('/', getActivities);
activityRoutes.post('/', validateActivityCreation, createActivity);
activityRoutes.put('/:id', validateObjectId, updateActivity);
activityRoutes.delete('/:id', validateObjectId, deleteActivity);

router.use('/activities', activityRoutes);

// ==============================================
// BOOKING MANAGEMENT ROUTES
// ==============================================
const bookingRoutes = express.Router();
bookingRoutes.use(authorize('admin'));

bookingRoutes.get('/', getBookings);
bookingRoutes.put('/:id/status', validateObjectId, updateBookingStatus);

router.use('/bookings', bookingRoutes);

// ==============================================
// PAGE MANAGEMENT ROUTES
// ==============================================
const pageRoutes = express.Router();
pageRoutes.use(authorize('admin'));

pageRoutes.get('/', getPages);
pageRoutes.get('/:id', validateObjectId, getPage);
pageRoutes.post('/', createPage);
pageRoutes.put('/:id', validateObjectId, updatePage);
pageRoutes.delete('/:id', validateObjectId, deletePage);
pageRoutes.post('/:id/duplicate', validateObjectId, duplicatePage);
pageRoutes.get('/:id/analytics', validateObjectId, getPageAnalytics);

router.use('/pages', pageRoutes);

// ==============================================
// TRANSLATION MANAGEMENT ROUTES
// ==============================================
const translationRoutes = express.Router();
translationRoutes.use(requireRole('admin'));

translationRoutes.get('/:language/:namespace', getTranslations);
translationRoutes.put('/:language/:namespace', updateTranslations);

router.use('/translations', translationRoutes);

// ==============================================
// CATEGORY MANAGEMENT ROUTES
// ==============================================
const categoryRoutes = express.Router();
categoryRoutes.use(requireRole('admin'));

categoryRoutes.get('/', getCategories);
categoryRoutes.post('/', createCategory);
categoryRoutes.put('/:id', updateCategory);
categoryRoutes.delete('/:id', deleteCategory);
categoryRoutes.put('/reorder', reorderCategories);
categoryRoutes.put('/:id/status', updateCategoryStatus);

router.use('/categories', categoryRoutes);

// ==============================================
// SYSTEM SETTINGS ROUTES
// ==============================================
const settingsRoutes = express.Router();
settingsRoutes.use(requireRole('admin'));

settingsRoutes.get('/', getSystemSettings);
settingsRoutes.put('/', updateSystemSettings);

router.use('/settings', settingsRoutes);

// ==============================================
// ADMIN TEAM MANAGEMENT ROUTES (High-level admin only)
// ==============================================
const teamRoutes = express.Router();

// Admin role management routes
teamRoutes.get('/roles', requireAdminRole(['SA']), getAdminRoles);
teamRoutes.post('/roles/initialize', requireAdminRole(['SA']), initializeAdminRoles);

// Admin team management routes
teamRoutes.get('/', requireAdminRole(['SA', 'ADMIN_PARTNERSHIPS']), getAdminTeam);
teamRoutes.post('/assign', requireAdminRole(['SA']), assignAdminRole);
teamRoutes.put('/:userId', requireAdminRole(['SA', 'ADMIN_PARTNERSHIPS']), updateAdminUser);
teamRoutes.delete('/:userId', requireAdminRole(['SA']), removeAdminRole);

router.use('/team', teamRoutes);

module.exports = router;