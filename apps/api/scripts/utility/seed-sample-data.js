const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env.production' });

// Import models
const User = require('./src/models/User');
const Vendor = require('./src/models/Vendor');
const Activity = require('./src/models/Activity');
const Booking = require('./src/models/Booking');
const Category = require('./src/models/CategoryEnhanced');

/**
 * Create sample data for admin dashboard
 */
async function seedSampleData() {
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

    // Create sample categories
    const categories = await Category.create([
      {
        name: 'رياضة',
        nameEn: 'Sports',
        description: 'الأنشطة الرياضية',
        descriptionEn: 'Sports activities',
        icon: 'sports',
        isActive: true
      },
      {
        name: 'ثقافة',
        nameEn: 'Culture',
        description: 'الأنشطة الثقافية',
        descriptionEn: 'Cultural activities',
        icon: 'culture',
        isActive: true
      },
      {
        name: 'ترفيه',
        nameEn: 'Entertainment',
        description: 'الأنشطة الترفيهية',
        descriptionEn: 'Entertainment activities',
        icon: 'entertainment',
        isActive: true
      }
    ]);
    console.log('✅ Created categories:', categories.length);

    // Create sample users
    const users = await User.create([
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
    ]);
    console.log('✅ Created users:', users.length);

    // Create sample vendors
    const vendors = await Vendor.create([
      {
        businessName: 'نادي الرياضة المثالي',
        businessNameEn: 'Perfect Sports Club',
        contactPerson: 'سعد الأحمد',
        email: 'sports@perfect.com',
        phone: '+966501234567',
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
        email: 'culture@arts.com',
        phone: '+966507654321',
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
    ]);
    console.log('✅ Created vendors:', vendors.length);

    // Create sample activities
    const activities = await Activity.create([
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
    ]);
    console.log('✅ Created activities:', activities.length);

    // Create sample bookings
    const bookings = await Booking.create([
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
    ]);
    console.log('✅ Created bookings:', bookings.length);

    console.log('🎉 Sample data created successfully!');
    console.log('📊 Dashboard should now show:');
    console.log('   - Users:', users.length);
    console.log('   - Vendors:', vendors.length);
    console.log('   - Activities:', activities.length);
    console.log('   - Bookings:', bookings.length);

  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  seedSampleData();
}

module.exports = seedSampleData;
