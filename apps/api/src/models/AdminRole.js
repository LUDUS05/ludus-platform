const mongoose = require('mongoose');

const adminRoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: [
      'SA',                    // Super Admin
      'PLATFORM_MANAGER',      // Platform Manager
      'MODERATOR',            // Moderator
      'ADMIN_PARTNERSHIPS',   // Admin of Partnerships
      'PSM',                  // Partner Success Manager
      'PSA'                   // Partner Success Associate
    ]
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  permissions: [{
    resource: {
      type: String,
      required: true,
      enum: [
        'users',
        'partners',
        'activities',
        'bookings',
        'payments',
        'ratings',
        'content',
        'analytics',
        'system',
        'roles'
      ]
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'manage']
    }]
  }],
  hierarchy: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for performance
// `name` is already declared with `unique: true` in the schema definition.
// Avoid duplicating that index here.
adminRoleSchema.index({ hierarchy: 1 });

// Static method to seed default roles
adminRoleSchema.statics.seedDefaultRoles = async function() {
  const defaultRoles = [
    {
      name: 'SA',
      displayName: 'Super Admin',
      description: 'Full unrestricted access to all platform data, settings, and user accounts. The highest level of authority.',
      hierarchy: 1,
      permissions: [
        { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'] },
        { resource: 'partners', actions: ['create', 'read', 'update', 'delete', 'manage'] },
        { resource: 'activities', actions: ['create', 'read', 'update', 'delete', 'manage'] },
        { resource: 'bookings', actions: ['create', 'read', 'update', 'delete', 'manage'] },
        { resource: 'payments', actions: ['create', 'read', 'update', 'delete', 'manage'] },
        { resource: 'ratings', actions: ['create', 'read', 'update', 'delete', 'manage'] },
        { resource: 'content', actions: ['create', 'read', 'update', 'delete', 'manage'] },
        { resource: 'analytics', actions: ['read', 'manage'] },
        { resource: 'system', actions: ['manage'] },
        { resource: 'roles', actions: ['create', 'read', 'update', 'delete', 'manage'] }
      ]
    },
    {
      name: 'PLATFORM_MANAGER',
      displayName: 'Platform Manager',
      description: 'Manages all public-facing content, including static pages, promotional banners, and platform-wide announcements.',
      hierarchy: 2,
      permissions: [
        { resource: 'content', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'analytics', actions: ['read'] },
        { resource: 'users', actions: ['read'] }
      ]
    },
    {
      name: 'MODERATOR',
      displayName: 'Moderator',
      description: 'Ensures community health. Can view and modify user data/profiles, review and act on flagged content.',
      hierarchy: 3,
      permissions: [
        { resource: 'users', actions: ['read', 'update'] },
        { resource: 'ratings', actions: ['read', 'update', 'delete'] },
        { resource: 'content', actions: ['read', 'update'] },
        { resource: 'analytics', actions: ['read'] }
      ]
    },
    {
      name: 'ADMIN_PARTNERSHIPS',
      displayName: 'Admin of Partnerships',
      description: 'Manages the entire partnership team and has oversight of all Partner accounts.',
      hierarchy: 4,
      permissions: [
        { resource: 'partners', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'activities', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'analytics', actions: ['read'] },
        { resource: 'users', actions: ['read'] }
      ]
    },
    {
      name: 'PSM',
      displayName: 'Partner Success Manager',
      description: 'Primary point of contact for Partners. Responsible for activating new Partner accounts and managing the relationship.',
      hierarchy: 5,
      permissions: [
        { resource: 'partners', actions: ['read', 'update'] },
        { resource: 'activities', actions: ['create', 'read', 'update'] },
        { resource: 'bookings', actions: ['read'] },
        { resource: 'analytics', actions: ['read'] }
      ]
    },
    {
      name: 'PSA',
      displayName: 'Partner Success Associate',
      description: 'Supports PSMs. Can add and modify Partner data, including creating and updating Activity listings.',
      hierarchy: 6,
      permissions: [
        { resource: 'partners', actions: ['read', 'update'] },
        { resource: 'activities', actions: ['create', 'read', 'update'] },
        { resource: 'analytics', actions: ['read'] }
      ]
    }
  ];

  for (const roleData of defaultRoles) {
    await this.findOneAndUpdate(
      { name: roleData.name },
      roleData,
      { upsert: true, new: true }
    );
  }
};

// Method to check if role has permission
adminRoleSchema.methods.hasPermission = function(resource, action) {
  const permission = this.permissions.find(p => p.resource === resource);
  if (!permission) return false;
  
  return permission.actions.includes(action) || permission.actions.includes('manage');
};

// Static method to check user permissions
adminRoleSchema.statics.checkUserPermission = async function(userId, resource, action) {
  const User = mongoose.model('User');
  const user = await User.findById(userId);
  
  if (!user || !user.adminRole) return false;
  
  const role = await this.findOne({ name: user.adminRole, isActive: true });
  if (!role) return false;
  
  return role.hasPermission(resource, action);
};

module.exports = mongoose.model('AdminRole', adminRoleSchema);