const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

const seedAdmin = async () => {
  try {
    console.log('🌱 Starting admin user seeding...');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      email: process.env.ADMIN_EMAIL 
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const adminUser = new User({
      firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
      lastName: process.env.ADMIN_LAST_NAME || 'User',
      email: process.env.ADMIN_EMAIL || 'admin@ludusapp.com',
      password: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
      role: 'admin',
      adminRole: 'SA', // Super Admin role
      adminMetadata: {
        assignedBy: null, // Self-created admin
        assignedAt: new Date(),
        lastActiveAt: new Date()
      },
      isEmailVerified: true,
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
      }
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully:');
    console.log('   Email:', adminUser.email);
    console.log('   Role:', adminUser.role);
    console.log('   Name:', adminUser.fullName);
    
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    throw error;
  }
};

// Run seeding if called directly
if (require.main === module) {
  (async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB');
      
      await seedAdmin();
      
      console.log('🎉 Admin seeding completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('💥 Admin seeding failed:', error);
      process.exit(1);
    } finally {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
    }
  })();
}

module.exports = seedAdmin;