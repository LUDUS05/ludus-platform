#!/usr/bin/env node

/**
 * @fileoverview Create admin credentials for LUDUS platform.
 * 
 * Purpose: Creates admin user accounts for the LUDUS platform with proper
 * authentication and role-based access control.
 * 
 * Usage: node create-admin-credentials.js
 * 
 * @version 1.0.0
 * @since 2025-01-13
 * @author LUDUS Development Team
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import the User model
const User = require('./apps/api/src/models/User');

/**
 * Create admin user with secure credentials
 */
async function createAdminUser() {
  try {
    console.log('🚀 Creating admin credentials for LUDUS platform...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: 'admin@letsludus.com' },
        { role: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log('\n🔑 To reset password, delete the existing admin and run this script again.\n');
      return;
    }

    // Generate secure password
    const adminPassword = 'LUDUS_Admin_2025!';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const adminUser = new User({
      firstName: 'LUDUS',
      lastName: 'Administrator',
      email: 'admin@letsludus.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      location: {
        address: 'Riyadh, Saudi Arabia',
        city: 'Riyadh',
        state: 'Riyadh Province',
        zipCode: '11564',
        coordinates: [46.6753, 24.7136] // [longitude, latitude] for Riyadh
      },
      preferences: {
        categories: ['fitness', 'arts', 'food', 'outdoor', 'unique', 'wellness'],
        priceRange: {
          min: 0,
          max: 1000
        },
        radius: 50
      },
      adminPermissions: {
        canManageUsers: true,
        canManageActivities: true,
        canManageVendors: true,
        canManageBookings: true,
        canManagePayments: true,
        canManageContent: true,
        canViewAnalytics: true,
        canManageSettings: true
      }
    });

    await adminUser.save();
    
    console.log('🎉 Admin user created successfully!\n');
    console.log('📋 ADMIN CREDENTIALS:');
    console.log('===================');
    console.log(`📧 Email: admin@letsludus.com`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`👤 Name: ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`🎭 Role: ${adminUser.role}`);
    console.log(`📍 Location: ${adminUser.location.address}`);
    console.log(`✅ Email Verified: ${adminUser.isEmailVerified}`);
    console.log(`🔐 Active: ${adminUser.isActive}`);
    
    console.log('\n🌐 LOGIN URLS:');
    console.log('==============');
    console.log('🔗 Frontend: https://app.letsludus.com/login');
    console.log('🔗 Admin Panel: https://app.letsludus.com/admin');
    console.log('🔗 API Health: https://ludus-backend-jzc5.onrender.com/health');
    
    console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
    console.log('============================');
    console.log('1. Change the default password immediately after first login');
    console.log('2. Enable 2FA if available');
    console.log('3. Use a strong, unique password');
    console.log('4. Keep these credentials secure');
    
    console.log('\n✅ Admin setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

/**
 * Create additional admin users if needed
 */
async function createAdditionalAdmins() {
  const additionalAdmins = [
    {
      firstName: 'Support',
      lastName: 'Admin',
      email: 'support@letsludus.com',
      password: 'Support_Admin_2025!'
    },
    {
      firstName: 'Content',
      lastName: 'Manager',
      email: 'content@letsludus.com',
      password: 'Content_Manager_2025!'
    }
  ];

  for (const adminData of additionalAdmins) {
    try {
      const existingAdmin = await User.findOne({ email: adminData.email });
      if (existingAdmin) {
        console.log(`⚠️  ${adminData.email} already exists, skipping...`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(adminData.password, 12);
      const adminUser = new User({
        ...adminData,
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
        location: {
          address: 'Riyadh, Saudi Arabia',
          city: 'Riyadh',
          state: 'Riyadh Province',
          zipCode: '11564',
          coordinates: [46.6753, 24.7136]
        },
        preferences: {
          categories: ['fitness', 'arts', 'food', 'outdoor', 'unique', 'wellness'],
          priceRange: { min: 0, max: 1000 },
          radius: 50
        },
        adminPermissions: {
          canManageUsers: true,
          canManageActivities: true,
          canManageVendors: true,
          canManageBookings: true,
          canManagePayments: true,
          canManageContent: true,
          canViewAnalytics: true,
          canManageSettings: true
        }
      });

      await adminUser.save();
      console.log(`✅ Created admin: ${adminData.email} / ${adminData.password}`);
    } catch (error) {
      console.error(`❌ Error creating ${adminData.email}:`, error.message);
    }
  }
}

// Main execution
async function main() {
  try {
    await createAdminUser();
    
    // Ask if user wants to create additional admins
    const args = process.argv.slice(2);
    if (args.includes('--additional') || args.includes('-a')) {
      console.log('\n🔄 Creating additional admin users...');
      await createAdditionalAdmins();
    }
    
    console.log('\n🎊 Admin credentials setup completed!');
    console.log('🚀 You can now login to the LUDUS admin panel.');
    
  } catch (error) {
    console.error('💥 Failed to create admin credentials:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { createAdminUser, createAdditionalAdmins };
