const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ludusapp:ludusapp123@ac-ptjrijo-shard-00-01.kdxn9gc.mongodb.net/ludus?retryWrites=true&w=majority');
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      email: 'admin@ludusapp.com' 
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:', existingAdmin.email);
      console.log('   Role:', existingAdmin.role);
      console.log('   Admin Role:', existingAdmin.adminRole);
      
      // Update to admin if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        existingAdmin.adminRole = 'SA'; // Super Admin
        await existingAdmin.save();
        console.log('✅ Updated user to admin role');
      }
      return;
    }

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@ludusapp.com',
      password: 'AdminPassword123!',
      role: 'admin',
      adminRole: 'SA', // Super Admin
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
    console.log('   Admin Role:', adminUser.adminRole);
    console.log('   Name:', adminUser.firstName, adminUser.lastName);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run the script
createAdminUser()
  .then(() => {
    console.log('🎉 Admin user creation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Admin user creation failed:', error);
    process.exit(1);
  });
