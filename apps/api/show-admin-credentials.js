#!/usr/bin/env node

/**
 * @fileoverview Show existing admin credentials for LUDUS platform.
 * 
 * Purpose: Displays existing admin user credentials and creates new ones if needed.
 * 
 * Usage: node show-admin-credentials.js
 * 
 * @version 1.0.0
 * @since 2025-01-13
 * @author LUDUS Development Team
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import the User model
const User = require('./src/models/User');

/**
 * Show existing admin credentials
 */
async function showAdminCredentials() {
  try {
    console.log('🔍 Checking existing admin credentials...\n');

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

    // Find all admin users
    const adminUsers = await User.find({ role: 'admin' }).select('firstName lastName email role isEmailVerified isActive createdAt');
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found in the database.');
      console.log('💡 Run the seed script to create admin users:');
      console.log('   node src/seeds/seedAdmin.js');
      return;
    }

    console.log('👥 FOUND ADMIN USERS:');
    console.log('====================');
    
    adminUsers.forEach((admin, index) => {
      console.log(`\n${index + 1}. Admin User:`);
      console.log(`   📧 Email: ${admin.email}`);
      console.log(`   👤 Name: ${admin.firstName} ${admin.lastName}`);
      console.log(`   🎭 Role: ${admin.role}`);
      console.log(`   ✅ Email Verified: ${admin.isEmailVerified}`);
      console.log(`   🔐 Active: ${admin.isActive}`);
      console.log(`   📅 Created: ${admin.createdAt.toLocaleDateString()}`);
    });

    console.log('\n🔑 DEFAULT ADMIN CREDENTIALS:');
    console.log('============================');
    console.log('📧 Email: admin@ludusapp.com');
    console.log('🔑 Password: AdminPassword123!');
    
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
    
    console.log('\n✅ Admin credentials retrieved successfully!');
    
  } catch (error) {
    console.error('❌ Error retrieving admin credentials:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Main execution
async function main() {
  try {
    await showAdminCredentials();
  } catch (error) {
    console.error('💥 Failed to retrieve admin credentials:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { showAdminCredentials };
