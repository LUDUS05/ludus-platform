const AdminRole = require('../models/AdminRole');

// Middleware to check if user has required admin role
const requireAdminRole = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if user has admin role
      if (user.role !== 'admin' || !user.adminRole) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      // If no specific roles required, any admin role is sufficient
      if (requiredRoles.length === 0) {
        return next();
      }

      // Check if user has one of the required roles
      if (!requiredRoles.includes(user.adminRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions for this operation'
        });
      }

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

// Middleware to check specific resource permissions
const requirePermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Super Admin has all permissions
      if (user.adminRole === 'SA') {
        return next();
      }

      // Check if user has the required permission
      const hasPermission = await AdminRole.checkUserPermission(user.id, resource, action);
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `You don't have permission to ${action} ${resource}`
        });
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

// Middleware to check if user can access specific partner data
const requirePartnerAccess = async (req, res, next) => {
  try {
    const user = req.user;
    const partnerId = req.params.partnerId || req.body.partnerId;

    if (!user || !partnerId) {
      return res.status(400).json({
        success: false,
        message: 'User authentication and partner ID required'
      });
    }

    // Super Admin and Admin of Partnerships have access to all partners
    if (['SA', 'ADMIN_PARTNERSHIPS'].includes(user.adminRole)) {
      return next();
    }

    // PSM and PSA can only access assigned partners
    if (['PSM', 'PSA'].includes(user.adminRole)) {
      if (!user.assignedPartners.includes(partnerId)) {
        return res.status(403).json({
          success: false,
          message: 'You can only access partners assigned to you'
        });
      }
      return next();
    }

    // Other roles don't have partner access
    res.status(403).json({
      success: false,
      message: 'You don\'t have permission to access partner data'
    });

  } catch (error) {
    console.error('Partner access middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Permission check failed'
    });
  }
};

// Helper function to get user permissions
const getUserPermissions = async (userId) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user || !user.adminRole) {
      return [];
    }

    const role = await AdminRole.findOne({ name: user.adminRole, isActive: true });
    if (!role) {
      return [];
    }

    return role.permissions;
  } catch (error) {
    console.error('Get user permissions error:', error);
    return [];
  }
};

// Helper function to check if user can perform action on resource
const canPerformAction = async (userId, resource, action) => {
  try {
    return await AdminRole.checkUserPermission(userId, resource, action);
  } catch (error) {
    console.error('Can perform action error:', error);
    return false;
  }
};

// Role hierarchy helper
const roleHierarchy = {
  'SA': 1,
  'PLATFORM_MANAGER': 2,
  'MODERATOR': 3,
  'ADMIN_PARTNERSHIPS': 4,
  'PSM': 5,
  'PSA': 6
};

const hasHigherOrEqualRole = (userRole, requiredRole) => {
  return roleHierarchy[userRole] <= roleHierarchy[requiredRole];
};

module.exports = {
  requireAdminRole,
  requirePermission,
  requirePartnerAccess,
  getUserPermissions,
  canPerformAction,
  hasHigherOrEqualRole,
  roleHierarchy
};