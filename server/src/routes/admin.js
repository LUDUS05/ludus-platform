const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminManagementController = require('../controllers/adminManagementController');
const { authenticate, authorize } = require('../middleware/auth');
const { requireAdminRole } = require('../middleware/rbac');

// Apply authentication to all admin routes
router.use(authenticate);

// Dashboard routes
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/overview', adminController.getDashboardOverview);

// User management routes
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Vendor management routes
router.get('/vendors', adminController.getVendors);
router.get('/vendors/:id', adminController.getVendorById);
router.put('/vendors/:id', adminController.updateVendor);
router.delete('/vendors/:id', adminController.deleteVendor);

// Activity management routes
router.get('/activities', adminController.getActivities);
router.get('/activities/:id', adminController.getActivityById);
router.put('/activities/:id', adminController.updateActivity);
router.delete('/activities/:id', adminController.deleteActivity);

// Booking management routes
router.get('/bookings', adminController.getBookings);
router.get('/bookings/:id', adminController.getBookingById);
router.put('/bookings/:id', adminController.updateBooking);
router.delete('/bookings/:id', adminController.deleteBooking);

// Payment management routes
router.get('/payments', adminController.getPayments);
router.get('/payments/:id', adminController.getPaymentById);

// Analytics routes
router.get('/analytics/overview', adminController.getAnalyticsOverview);
router.get('/analytics/users', adminController.getUserAnalytics);
router.get('/analytics/activities', adminController.getActivityAnalytics);
router.get('/analytics/bookings', adminController.getBookingAnalytics);

// Admin team management routes (require admin role)
router.use(requireAdminRole());

router.get('/team', adminManagementController.getAdminTeam);
router.post('/team/assign', adminManagementController.assignAdminRole);
router.put('/team/:userId', adminManagementController.updateAdminUser);
router.delete('/team/:userId', adminManagementController.removeAdminUser);

// Fix admin role endpoint (temporary - for fixing existing admin users)
router.post('/fix-admin-role', async (req, res) => {
  try {
    const User = require('../models/User');
    const AdminRole = require('../models/AdminRole');
    
    // Only allow if user is already an admin (even without adminRole)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin users can access this endpoint'
      });
    }

    // Find admin users without adminRole
    const adminUsersWithoutRole = await User.find({
      role: 'admin',
      adminRole: { $exists: false }
    });

    if (adminUsersWithoutRole.length === 0) {
      return res.json({
        success: true,
        message: 'All admin users already have adminRole set',
        updated: 0
      });
    }

    // Ensure AdminRole collection has default roles
    await AdminRole.seedDefaultRoles();

    // Update each admin user
    let updatedCount = 0;
    for (const user of adminUsersWithoutRole) {
      user.adminRole = 'SA'; // Assign Super Admin role
      user.adminMetadata = {
        assignedBy: user._id, // Self-assigned for existing admins
        assignedAt: new Date(),
        lastActiveAt: new Date()
      };

      await user.save();
      updatedCount++;
    }

    res.json({
      success: true,
      message: `Successfully updated ${updatedCount} admin users with SA role`,
      updated: updatedCount
    });

  } catch (error) {
    console.error('Fix admin role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix admin roles',
      error: error.message
    });
  }
});

module.exports = router;