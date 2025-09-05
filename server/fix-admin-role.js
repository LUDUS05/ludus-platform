#!/usr/bin/env node

/**
 * Fix Admin Role Script
 * 
 * This script fixes existing admin users who have role: 'admin' but no adminRole set.
 * It assigns them the 'SA' (Super Admin) role to maintain full access.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const AdminRole = require('./src/models/AdminRole');

const fixAdminRoles = async () => {
  try {
    console.log('🔧 Starting admin role fix...');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Find admin users without adminRole
    const adminUsersWithoutRole = await User.find({
      role: 'admin',
      adminRole: { $exists: false }
    });

    console.log(`📊 Found ${adminUsersWithoutRole.length} admin users without adminRole`);

    if (adminUsersWithoutRole.length === 0) {
      console.log('✅ All admin users already have adminRole set');
      return;
    }

    // Ensure AdminRole collection has default roles
    await AdminRole.seedDefaultRoles();
    console.log('✅ AdminRole collection seeded');

    // Update each admin user
    for (const user of adminUsersWithoutRole) {
      console.log(`🔧 Updating user: ${user.email}`);
      
      user.adminRole = 'SA'; // Assign Super Admin role
      user.adminMetadata = {
        assignedBy: user._id, // Self-assigned for existing admins
        assignedAt: new Date(),
        lastActiveAt: new Date()
      };

      await user.save();
      console.log(`✅ Updated ${user.email} with SA role`);
    }

    console.log('🎉 Admin role fix completed successfully!');
    
    // Verify the fix
    const updatedUsers = await User.find({ role: 'admin' });
    console.log('\n📋 Current admin users:');
    updatedUsers.forEach(user => {
      console.log(`  - ${user.email}: role=${user.role}, adminRole=${user.adminRole}`);
    });

  } catch (error) {
    console.error('❌ Error fixing admin roles:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

// Run the fix
if (require.main === module) {
  fixAdminRoles()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = fixAdminRoles;
