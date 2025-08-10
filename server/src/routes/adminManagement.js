const express = require('express');
const router = express.Router();
const {
  getAdminRoles,
  getAdminTeam,
  assignAdminRole,
  updateAdminUser,
  removeAdminRole,
  getAdminDashboardOverview,
  initializeAdminRoles
} = require('../controllers/adminManagementController');
const { requireAdminRole, requirePermission } = require('../middleware/rbac');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Admin role management routes
router.get('/roles', requireAdminRole(['SA']), getAdminRoles);
router.post('/roles/initialize', requireAdminRole(['SA']), initializeAdminRoles);

// Admin team management routes
router.get('/team', requireAdminRole(['SA', 'ADMIN_PARTNERSHIPS']), getAdminTeam);
router.post('/team/assign', requireAdminRole(['SA']), assignAdminRole);
router.put('/team/:userId', requireAdminRole(['SA', 'ADMIN_PARTNERSHIPS']), updateAdminUser);
router.delete('/team/:userId', requireAdminRole(['SA']), removeAdminRole);

// Dashboard overview
router.get('/dashboard/overview', requireAdminRole(), getAdminDashboardOverview);

module.exports = router;