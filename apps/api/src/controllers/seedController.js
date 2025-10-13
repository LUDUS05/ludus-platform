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
        contactPerson: 'سعد الأحمد',
        contactInfo: {
          email: 'sports@perfect.com',
          phone: '+966501234567'
        },
        location: {
          country: 'Saudi Arabia',
          city: 'Riyadh',
          address: 'شارع الملك فهد، الرياض'
        },
        businessType: 'sports_club',
        description: 'نادي رياضي متكامل',
        descriptionEn: 'Complete sports club',
        isActive: true,
        isVerified: true
      },
      {
        businessName: 'مركز الثقافة والفنون',
        businessNameEn: 'Culture & Arts Center',
        contactPerson: 'نورا الخالدي',
        contactInfo: {
          email: 'culture@arts.com',
          phone: '+966507654321'
        },
        location: {
          country: 'Saudi Arabia',
          city: 'Jeddah',
          address: 'كورنيش جدة، جدة'
        },
        businessType: 'cultural_center',
        description: 'مركز للفنون والثقافة',
        descriptionEn: 'Arts and culture center',
        isActive: true,
        isVerified: true
      }
    ];
    
    const vendors = [];
    for (const vendorInfo of vendorData) {
      const vendor = await Vendor.findOneAndUpdate(
        { 'contactInfo.email': vendorInfo.contactInfo.email },
        vendorInfo,
        { upsert: true, new: true }
      );
      vendors.push(vendor);
    }
    console.log('✅ Created/updated vendors:', vendors.length);

    // Create or find sample activities
    const activityData = [
      {
        title: 'كرة القدم الأسبوعية',
        titleEn: 'Weekly Football',
        description: 'مباراة كرة قدم أسبوعية',
        descriptionEn: 'Weekly football match',
        category: categories[0]._id,
        partner: vendors[0]._id,
        location: {
          name: 'ملعب النادي المثالي',
          nameEn: 'Perfect Club Stadium',
          address: 'شارع الملك فهد، الرياض',
          coordinates: { lat: 24.7136, lng: 46.6753 }
        },
        price: 50,
        currency: 'SAR',
        maxParticipants: 22,
        minParticipants: 10,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
        status: 'published',
        isActive: true
      },
      {
        title: 'ورشة الرسم',
        titleEn: 'Painting Workshop',
        description: 'ورشة تعليم الرسم للمبتدئين',
        descriptionEn: 'Beginner painting workshop',
        category: categories[1]._id,
        partner: vendors[1]._id,
        location: {
          name: 'مركز الثقافة والفنون',
          nameEn: 'Culture & Arts Center',
          address: 'كورنيش جدة، جدة',
          coordinates: { lat: 21.4858, lng: 39.1925 }
        },
        price: 100,
        currency: 'SAR',
        maxParticipants: 15,
        minParticipants: 5,
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
        status: 'published',
        isActive: true
      },
      {
        title: 'حفلة موسيقية',
        titleEn: 'Music Concert',
        description: 'حفلة موسيقية للفنانين المحليين',
        descriptionEn: 'Local artists music concert',
        category: categories[2]._id,
        partner: vendors[1]._id,
        location: {
          name: 'قاعة الحفلات',
          nameEn: 'Concert Hall',
          address: 'كورنيش جدة، جدة',
          coordinates: { lat: 21.4858, lng: 39.1925 }
        },
        price: 200,
        currency: 'SAR',
        maxParticipants: 100,
        minParticipants: 20,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
        status: 'published',
        isActive: true
      }
    ];
    
    const activities = [];
    for (const activityInfo of activityData) {
      const activity = await Activity.findOneAndUpdate(
        { title: activityInfo.title },
        activityInfo,
        { upsert: true, new: true }
      );
      activities.push(activity);
    }
    console.log('✅ Created/updated activities:', activities.length);

    // Create or find sample bookings
    const bookingData = [
      {
        user: users[0]._id,
        activity: activities[0]._id,
        participants: 1,
        totalAmount: 50,
        currency: 'SAR',
        status: 'confirmed',
        paymentStatus: 'paid',
        bookingDate: new Date()
      },
      {
        user: users[1]._id,
        activity: activities[1]._id,
        participants: 1,
        totalAmount: 100,
        currency: 'SAR',
        status: 'confirmed',
        paymentStatus: 'paid',
        bookingDate: new Date()
      },
      {
        user: users[2]._id,
        activity: activities[2]._id,
        participants: 2,
        totalAmount: 400,
        currency: 'SAR',
        status: 'pending',
        paymentStatus: 'pending',
        bookingDate: new Date()
      }
    ];
    
    const bookings = [];
    for (const bookingInfo of bookingData) {
      const booking = await Booking.findOneAndUpdate(
        { 
          user: bookingInfo.user, 
          activity: bookingInfo.activity 
        },
        bookingInfo,
        { upsert: true, new: true }
      );
      bookings.push(booking);
    }
    console.log('✅ Created/updated bookings:', bookings.length);

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
