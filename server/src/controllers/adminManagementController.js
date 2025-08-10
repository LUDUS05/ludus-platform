const User = require('../models/User');
const AdminRole = require('../models/AdminRole');
const { hasHigherOrEqualRole } = require('../middleware/rbac');

// @desc    Get all admin roles
// @route   GET /api/admin/roles
// @access  Private (SA only)
const getAdminRoles = async (req, res) => {
  try {
    const roles = await AdminRole.find({ isActive: true }).sort({ hierarchy: 1 });
    
    res.json({
      success: true,
      data: { roles }
    });
  } catch (error) {
    console.error('Get admin roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin roles'
    });
  }
};

// @desc    Get all admin users
// @route   GET /api/admin/team
// @access  Private (SA, ADMIN_PARTNERSHIPS)
const getAdminTeam = async (req, res) => {
  try {
    const { page = 1, limit = 20, role: filterRole } = req.query;
    const skip = (page - 1) * limit;

    const filter = { 
      role: 'admin',
      adminRole: { $ne: null }
    };

    if (filterRole) {
      filter.adminRole = filterRole;
    }

    const adminUsers = await User.find(filter)
      .select('firstName lastName email adminRole assignedPartners adminMetadata createdAt')
      .populate('assignedPartners', 'name businessInfo.businessName')
      .populate('adminMetadata.assignedBy', 'firstName lastName')
      .sort({ 'adminMetadata.assignedAt': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        adminUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get admin team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin team'
    });
  }
};

// @desc    Assign admin role to user
// @route   POST /api/admin/team/assign
// @access  Private (SA only)
const assignAdminRole = async (req, res) => {
  try {
    const { userId, adminRole, assignedPartners = [] } = req.body;
    const assignerId = req.user.id;

    if (!userId || !adminRole) {
      return res.status(400).json({
        success: false,
        message: 'User ID and admin role are required'
      });
    }

    // Verify admin role exists
    const roleExists = await AdminRole.findOne({ name: adminRole, isActive: true });
    if (!roleExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin role'
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user role
    user.role = 'admin';
    user.adminRole = adminRole;
    user.assignedPartners = assignedPartners;
    user.adminMetadata = {
      assignedBy: assignerId,
      assignedAt: new Date(),
      lastActiveAt: new Date()
    };

    await user.save();

    // Populate for response
    await user.populate([
      { path: 'assignedPartners', select: 'name businessInfo.businessName' },
      { path: 'adminMetadata.assignedBy', select: 'firstName lastName' }
    ]);

    res.json({
      success: true,
      message: 'Admin role assigned successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Assign admin role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign admin role'
    });
  }
};

// @desc    Update admin role or assignments
// @route   PUT /api/admin/team/:userId
// @access  Private (SA, ADMIN_PARTNERSHIPS for PSM/PSA)
const updateAdminUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { adminRole, assignedPartners } = req.body;
    const updaterId = req.user.id;

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    // Check if requester can update this user
    if (req.user.adminRole !== 'SA') {
      // ADMIN_PARTNERSHIPS can only update PSM and PSA
      if (req.user.adminRole === 'ADMIN_PARTNERSHIPS') {
        if (!['PSM', 'PSA'].includes(user.adminRole)) {
          return res.status(403).json({
            success: false,
            message: 'You can only update PSM and PSA users'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }
    }

    // Update fields
    if (adminRole && adminRole !== user.adminRole) {
      const roleExists = await AdminRole.findOne({ name: adminRole, isActive: true });
      if (!roleExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid admin role'
        });
      }
      user.adminRole = adminRole;
    }

    if (assignedPartners !== undefined) {
      user.assignedPartners = assignedPartners;
    }

    user.adminMetadata.lastActiveAt = new Date();
    await user.save();

    // Populate for response
    await user.populate([
      { path: 'assignedPartners', select: 'name businessInfo.businessName' },
      { path: 'adminMetadata.assignedBy', select: 'firstName lastName' }
    ]);

    res.json({
      success: true,
      message: 'Admin user updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update admin user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin user'
    });
  }
};

// @desc    Remove admin role from user
// @route   DELETE /api/admin/team/:userId
// @access  Private (SA only)
const removeAdminRole = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow removing SA role from the last SA user
    if (user.adminRole === 'SA') {
      const saCount = await User.countDocuments({ adminRole: 'SA' });
      if (saCount === 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove the last Super Admin'
        });
      }
    }

    // Reset user to regular user
    user.role = 'user';
    user.adminRole = null;
    user.assignedPartners = [];
    user.adminMetadata = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Admin role removed successfully',
      data: { user: { id: user._id, firstName: user.firstName, lastName: user.lastName } }
    });
  } catch (error) {
    console.error('Remove admin role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove admin role'
    });
  }
};

// @desc    Get admin dashboard overview
// @route   GET /api/admin/dashboard/overview
// @access  Private (Admin)
const getAdminDashboardOverview = async (req, res) => {
  try {
    const userRole = req.user.adminRole;

    // Base statistics available to all admin roles
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    let dashboardData = {
      totalUsers,
      totalAdmins,
      userRole,
      permissions: []
    };

    // Get user's permissions
    const role = await AdminRole.findOne({ name: userRole });
    if (role) {
      dashboardData.permissions = role.permissions;
    }

    // Role-specific data
    if (['SA', 'ADMIN_PARTNERSHIPS'].includes(userRole)) {
      const Vendor = require('../models/Vendor');
      const Activity = require('../models/Activity');
      const Booking = require('../models/Booking');
      
      dashboardData.totalPartners = await Vendor.countDocuments();
      dashboardData.totalActivities = await Activity.countDocuments();
      dashboardData.totalBookings = await Booking.countDocuments();
    }

    if (['PSM', 'PSA'].includes(userRole)) {
      // Show data only for assigned partners
      const assignedPartnerIds = req.user.assignedPartners;
      if (assignedPartnerIds.length > 0) {
        const Activity = require('../models/Activity');
        const Booking = require('../models/Booking');
        
        dashboardData.assignedPartners = assignedPartnerIds.length;
        dashboardData.assignedActivities = await Activity.countDocuments({
          vendor: { $in: assignedPartnerIds }
        });
        dashboardData.assignedBookings = await Booking.countDocuments({
          'vendor': { $in: assignedPartnerIds }
        });
      }
    }

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get admin dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard overview'
    });
  }
};

// @desc    Initialize default admin roles
// @route   POST /api/admin/roles/initialize
// @access  Private (SA only)
const initializeAdminRoles = async (req, res) => {
  try {
    await AdminRole.seedDefaultRoles();
    
    res.json({
      success: true,
      message: 'Admin roles initialized successfully'
    });
  } catch (error) {
    console.error('Initialize admin roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize admin roles'
    });
  }
};

module.exports = {
  getAdminRoles,
  getAdminTeam,
  assignAdminRole,
  updateAdminUser,
  removeAdminRole,
  getAdminDashboardOverview,
  initializeAdminRoles
};