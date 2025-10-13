const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env.production' });

// Import the User model
const User = require('./src/models/User');

/**
 * Update user role to admin
 */
async function updateUserRole() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Find the admin user
    const user = await User.findOne({ email: 'admin@ludus.com' });
    if (!user) {
      throw new Error('Admin user not found');
    }

    console.log('📋 Current user data:');
    console.log('   ID:', user._id);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Admin Role:', user.adminRole);

    // Update the user role to admin
    user.role = 'admin';
    user.adminRole = 'SA'; // Super Admin
    user.adminMetadata = {
      assignedBy: user._id, // Self-assigned
      assignedAt: new Date(),
      lastActiveAt: new Date()
    };

    await user.save();

    console.log('✅ User role updated successfully!');
    console.log('📋 Updated user data:');
    console.log('   Role:', user.role);
    console.log('   Admin Role:', user.adminRole);
    console.log('   Admin Metadata:', user.adminMetadata);

  } catch (error) {
    console.error('❌ Error updating user role:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  updateUserRole();
}

module.exports = updateUserRole;
