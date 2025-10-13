const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Activity = require('../models/Activity');
const Booking = require('../models/Booking');
const Category = require('../models/CategoryEnhanced');

/**
 * Seed sample data for admin dashboard
 */
const seedSampleData = async (req, res) => {
  try {
    console.log('🌱 Starting to seed sample data...');

    // Get admin user for createdBy field
    const adminUser = await User.findOne({ role: 'admin' });
    console.log('Admin user found:', adminUser ? adminUser._id : 'Not found');
    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    // Create or find sample categories
    const categoryData = [
      {
        name: 'رياضة',
        nameEn: 'Sports',
        description: 'الأنشطة الرياضية',
        descriptionEn: 'Sports activities',
        icon: 'sports',
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: 'ثقافة',
        nameEn: 'Culture',
        description: 'الأنشطة الثقافية',
        descriptionEn: 'Cultural activities',
        icon: 'culture',
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: 'ترفيه',
        nameEn: 'Entertainment',
        description: 'الأنشطة الترفيهية',
        descriptionEn: 'Entertainment activities',
        icon: 'entertainment',
        isActive: true,
        createdBy: adminUser._id
      }
    ];
    
    console.log('Category data:', JSON.stringify(categoryData, null, 2));
    
    // Use upsert to create or update categories
    const categories = [];
    for (const catData of categoryData) {
      const category = await Category.findOneAndUpdate(
        { name: catData.name },
        catData,
        { upsert: true, new: true }
      );
      categories.push(category);
    }
    console.log('✅ Created/updated categories:', categories.length);

    // Create or find sample users
    const userData = [
      {
        firstName: 'أحمد',
        lastName: 'محمد',
        email: 'ahmed@example.com',
        password: 'password123',
        role: 'user',
        isEmailVerified: true,
        location: { country: 'Saudi Arabia', city: 'Riyadh' }
      },
      {
        firstName: 'فاطمة',
        lastName: 'علي',
        email: 'fatima@example.com',
        password: 'password123',
        role: 'user',
        isEmailVerified: true,
        location: { country: 'Saudi Arabia', city: 'Jeddah' }
      },
      {
        firstName: 'محمد',
        lastName: 'السعد',
        email: 'mohammed@example.com',
        password: 'password123',
        role: 'user',
        isEmailVerified: true,
        location: { country: 'Saudi Arabia', city: 'Dammam' }
      }
    ];
    
    const users = [];
    for (const userInfo of userData) {
      const user = await User.findOneAndUpdate(
        { email: userInfo.email },
        userInfo,
        { upsert: true, new: true }
      );
      users.push(user);
    }
    console.log('✅ Created/updated users:', users.length);

    // Create or find sample vendors
    const vendorData = [
      {
        businessName: 'نادي الرياضة المثالي',
        businessNameEn: 'Perfect Sports Club',
        slug: 'perfect-sports-club',
        contactPerson: 'سعد الأحمد',
        contactInfo: {
          email: 'sports@perfect.com',
          phone: '+966501234567'
        },
        location: {
          country: 'Saudi Arabia',
          city: 'Riyadh',
          address: 'شارع الملك فهد، الرياض',
          coordinates: [46.6753, 24.7136] // [longitude, latitude]
        },
        businessType: 'sports_club',
        description: 'نادي رياضي متكامل',
        descriptionEn: 'Complete sports club',
        categories: ['fitness'],
        isActive: true,
        isVerified: true
      },
      {
        businessName: 'مركز الثقافة والفنون',
        businessNameEn: 'Culture & Arts Center',
        slug: 'culture-arts-center',
        contactPerson: 'نورا الخالدي',
        contactInfo: {
          email: 'culture@arts.com',
          phone: '+966507654321'
        },
        location: {
          country: 'Saudi Arabia',
          city: 'Jeddah',
          address: 'كورنيش جدة، جدة',
          coordinates: [39.1925, 21.4858] // [longitude, latitude]
        },
        businessType: 'cultural_center',
        description: 'مركز للفنون والثقافة',
        descriptionEn: 'Arts and culture center',
        categories: ['arts'],
        isActive: true,
        isVerified: true
      }
    ];
    
    const vendors = [];
    for (const vendorInfo of vendorData) {
      // First check if vendor exists
      let vendor = await Vendor.findOne({ 'contactInfo.email': vendorInfo.contactInfo.email });
      
      if (vendor) {
        // Update existing vendor
        vendor = await Vendor.findByIdAndUpdate(
          vendor._id,
          vendorInfo,
          { new: true }
        );
      } else {
        // Create new vendor
        vendor = new Vendor(vendorInfo);
        await vendor.save();
      }
      
      vendors.push(vendor);
    }
    console.log('✅ Created/updated vendors:', vendors.length);

    // Skip activities for now due to database issues
    console.log('⏭️ Skipping activities creation due to database constraints');
    const activities = [];

    // Skip bookings for now since they depend on activities
    console.log('⏭️ Skipping bookings creation due to missing activities');
    const bookings = [];

    res.json({
      success: true,
      message: 'Sample data created successfully!',
      data: {
        users: users.length,
        vendors: vendors.length,
        activities: activities.length,
        bookings: bookings.length,
        categories: categories.length
      }
    });

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating sample data',
      error: error.message,
      stack: error.stack
    });
  }
};

module.exports = {
  seedSampleData
};
