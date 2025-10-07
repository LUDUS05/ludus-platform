/**
 * @fileoverview Enhanced Database Schema Initialization Script - LDS-006 Implementation
 * 
 * This script initializes all enhanced database schemas for the LUDUS platform
 * with comprehensive indexes, validation rules, and sample data. It ensures
 * the database is properly configured for production use with optimal performance.
 * 
 * Key Features:
 * - Enhanced schema initialization
 * - Comprehensive index creation
 * - Sample data seeding
 * - Performance optimization
 * - Validation testing
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const mongoose = require('mongoose');
const { connectDB } = require('../config/database');

// Import enhanced models
const {
  UserEnhanced,
  ActivityEnhanced,
  BookingEnhanced,
  ReviewEnhanced,
  PartnerEnhanced,
  CategoryEnhanced,
  PaymentEnhanced,
  NotificationEnhanced,
  LocationEnhanced
} = require('../models');

// Import validation utilities
const { validateUser, validateActivity, validateBooking } = require('../utils/validation');

/**
 * Initialize enhanced database schemas
 * 
 * This function initializes all enhanced schemas with proper indexes,
 * validation rules, and sample data for the LUDUS platform.
 * 
 * @async
 * @function initializeEnhancedSchemas
 * @returns {Promise<Object>} Initialization result
 */
async function initializeEnhancedSchemas() {
  try {
    console.log('🚀 Starting enhanced database schema initialization...');
    
    // Connect to database
    const connected = await connectDB();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }
    
    console.log('✅ Database connected successfully');
    
    // Initialize schemas
    const results = {
      schemas: {},
      indexes: {},
      sampleData: {},
      errors: []
    };
    
    // Initialize each schema
    await initializeUserSchema(results);
    await initializeCategorySchema(results);
    await initializeLocationSchema(results);
    await initializePartnerSchema(results);
    await initializeActivitySchema(results);
    await initializeBookingSchema(results);
    await initializeReviewSchema(results);
    await initializePaymentSchema(results);
    await initializeNotificationSchema(results);
    
    // Create comprehensive indexes
    await createComprehensiveIndexes(results);
    
    // Seed sample data
    await seedSampleData(results);
    
    // Validate schemas
    await validateSchemas(results);
    
    console.log('✅ Enhanced database schema initialization completed successfully');
    return results;
    
  } catch (error) {
    console.error('❌ Error initializing enhanced schemas:', error);
    throw error;
  }
}

/**
 * Initialize User schema
 */
async function initializeUserSchema(results) {
  try {
    console.log('📝 Initializing User schema...');
    
    // Create indexes
    await UserEnhanced.collection.createIndex({ email: 1 }, { unique: true });
    await UserEnhanced.collection.createIndex({ 'profile.phone': 1 }, { unique: true });
    await UserEnhanced.collection.createIndex({ 'social.referralCode': 1 }, { unique: true, sparse: true });
    await UserEnhanced.collection.createIndex({ 'location.coordinates': '2dsphere' });
    await UserEnhanced.collection.createIndex({ 'location.city': 1, 'preferences.interests': 1 });
    await UserEnhanced.collection.createIndex({ 'stats.totalBookings': -1, createdAt: -1 });
    await UserEnhanced.collection.createIndex({ role: 1, status: 1 });
    await UserEnhanced.collection.createIndex({ 'preferences.language': 1 });
    
    // Text index for search
    await UserEnhanced.collection.createIndex({ 
      'profile.firstName': 'text', 
      'profile.lastName': 'text', 
      'profile.firstNameAr': 'text',
      'profile.lastNameAr': 'text',
      email: 'text' 
    });
    
    results.schemas.User = 'initialized';
    results.indexes.User = 'created';
    
    console.log('✅ User schema initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing User schema:', error);
    results.errors.push({ schema: 'User', error: error.message });
  }
}

/**
 * Initialize Category schema
 */
async function initializeCategorySchema(results) {
  try {
    console.log('📝 Initializing Category schema...');
    
    // Create indexes
    await CategoryEnhanced.collection.createIndex({ name: 1 }, { unique: true });
    await CategoryEnhanced.collection.createIndex({ nameEn: 1 }, { unique: true });
    await CategoryEnhanced.collection.createIndex({ parent: 1, isActive: 1 });
    await CategoryEnhanced.collection.createIndex({ level: 1, sortOrder: 1 });
    await CategoryEnhanced.collection.createIndex({ path: 1 });
    await CategoryEnhanced.collection.createIndex({ isActive: 1, sortOrder: 1 });
    await CategoryEnhanced.collection.createIndex({ activityCount: -1 });
    
    // Text index for search
    await CategoryEnhanced.collection.createIndex({ 
      name: 'text', 
      nameEn: 'text',
      description: 'text',
      descriptionEn: 'text'
    });
    
    results.schemas.Category = 'initialized';
    results.indexes.Category = 'created';
    
    console.log('✅ Category schema initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing Category schema:', error);
    results.errors.push({ schema: 'Category', error: error.message });
  }
}

/**
 * Initialize Location schema
 */
async function initializeLocationSchema(results) {
  try {
    console.log('📝 Initializing Location schema...');
    
    // Create indexes
    await LocationEnhanced.collection.createIndex({ name: 1 });
    await LocationEnhanced.collection.createIndex({ nameEn: 1 });
    await LocationEnhanced.collection.createIndex({ parent: 1, isActive: 1 });
    await LocationEnhanced.collection.createIndex({ level: 1, sortOrder: 1 });
    await LocationEnhanced.collection.createIndex({ path: 1 });
    await LocationEnhanced.collection.createIndex({ type: 1, isActive: 1 });
    await LocationEnhanced.collection.createIndex({ activityCount: -1 });
    await LocationEnhanced.collection.createIndex({ 'coordinates.coordinates': '2dsphere' });
    
    // Text index for search
    await LocationEnhanced.collection.createIndex({ 
      name: 'text', 
      nameEn: 'text',
      description: 'text',
      descriptionEn: 'text'
    });
    
    results.schemas.Location = 'initialized';
    results.indexes.Location = 'created';
    
    console.log('✅ Location schema initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing Location schema:', error);
    results.errors.push({ schema: 'Location', error: error.message });
  }
}

/**
 * Initialize Partner schema
 */
async function initializePartnerSchema(results) {
  try {
    console.log('📝 Initializing Partner schema...');
    
    // Create indexes
    await PartnerEnhanced.collection.createIndex({ 'contact.email': 1 }, { unique: true });
    await PartnerEnhanced.collection.createIndex({ 'businessInfo.registrationNumber': 1 }, { unique: true, sparse: true });
    await PartnerEnhanced.collection.createIndex({ 'businessInfo.taxNumber': 1 }, { unique: true, sparse: true });
    await PartnerEnhanced.collection.createIndex({ 'location.city': 1, 'verification.isVerified': 1 });
    await PartnerEnhanced.collection.createIndex({ 'stats.averageRating': -1, 'stats.reviewCount': -1 });
    await PartnerEnhanced.collection.createIndex({ 'location.coordinates': '2dsphere' });
    await PartnerEnhanced.collection.createIndex({ status: 1, 'verification.verificationLevel': 1 });
    
    // Text index for search
    await PartnerEnhanced.collection.createIndex({ 
      'businessInfo.name': 'text', 
      'businessInfo.nameEn': 'text',
      'businessInfo.description': 'text',
      'businessInfo.descriptionEn': 'text'
    });
    
    results.schemas.Partner = 'initialized';
    results.indexes.Partner = 'created';
    
    console.log('✅ Partner schema initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing Partner schema:', error);
    results.errors.push({ schema: 'Partner', error: error.message });
  }
}

/**
 * Initialize Activity schema
 */
async function initializeActivitySchema(results) {
  try {
    console.log('📝 Initializing Activity schema...');
    
    // Create indexes
    await ActivityEnhanced.collection.createIndex({ 'category.id': 1, 'location.city': 1, status: 1 });
    await ActivityEnhanced.collection.createIndex({ 'partner.id': 1, status: 1 });
    await ActivityEnhanced.collection.createIndex({ 'location.coordinates': '2dsphere' });
    await ActivityEnhanced.collection.createIndex({ 'schedule.availableDates.date': 1, status: 1 });
    await ActivityEnhanced.collection.createIndex({ 'stats.averageRating': -1, 'stats.reviewCount': -1 });
    await ActivityEnhanced.collection.createIndex({ 'features.isFeatured': 1, 'features.isPopular': 1, status: 1 });
    await ActivityEnhanced.collection.createIndex({ status: 1, createdAt: -1 });
    
    // Text index for search
    await ActivityEnhanced.collection.createIndex({ 
      title: 'text', 
      titleEn: 'text',
      description: 'text', 
      descriptionEn: 'text',
      'features.tags': 'text',
      'features.tagsEn': 'text'
    });
    
    results.schemas.Activity = 'initialized';
    results.indexes.Activity = 'created';
    
    console.log('✅ Activity schema initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing Activity schema:', error);
    results.errors.push({ schema: 'Activity', error: error.message });
  }
}

/**
 * Initialize Booking schema
 */
async function initializeBookingSchema(results) {
  try {
    console.log('📝 Initializing Booking schema...');
    
    // Create indexes
    await BookingEnhanced.collection.createIndex({ bookingNumber: 1 }, { unique: true });
    await BookingEnhanced.collection.createIndex({ 'user.id': 1, status: 1 });
    await BookingEnhanced.collection.createIndex({ 'activity.id': 1, 'schedule.date': 1 });
    await BookingEnhanced.collection.createIndex({ 'schedule.date': 1, status: 1 });
    await BookingEnhanced.collection.createIndex({ 'payment.status': 1, status: 1 });
    await BookingEnhanced.collection.createIndex({ createdAt: -1, status: 1 });
    await BookingEnhanced.collection.createIndex({ 'activity.partner.id': 1, status: 1 });
    
    results.schemas.Booking = 'initialized';
    results.indexes.Booking = 'created';
    
    console.log('✅ Booking schema initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing Booking schema:', error);
    results.errors.push({ schema: 'Booking', error: error.message });
  }
}

/**
 * Initialize Review schema
 */
async function initializeReviewSchema(results) {
  try {
    console.log('📝 Initializing Review schema...');
    
    // Create indexes
    await ReviewEnhanced.collection.createIndex({ 'user.id': 1 });
    await ReviewEnhanced.collection.createIndex({ 'activity.id': 1 });
    await ReviewEnhanced.collection.createIndex({ 'rating.overall': -1 });
    await ReviewEnhanced.collection.createIndex({ status: 1, createdAt: -1 });
    await ReviewEnhanced.collection.createIndex({ isVerified: 1, status: 1 });
    await ReviewEnhanced.collection.createIndex({ 'helpful.count': -1 });
    await ReviewEnhanced.collection.createIndex({ 'response.partner.id': 1 });
    
    // Text index for search
    await ReviewEnhanced.collection.createIndex({ 
      comment: 'text', 
      commentAr: 'text'
    });
    
    results.schemas.Review = 'initialized';
    results.indexes.Review = 'created';
    
    console.log('✅ Review schema initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing Review schema:', error);
    results.errors.push({ schema: 'Review', error: error.message });
  }
}

/**
 * Initialize Payment schema
 */
async function initializePaymentSchema(results) {
  try {
    console.log('📝 Initializing Payment schema...');
    
    // Create indexes
    await PaymentEnhanced.collection.createIndex({ paymentNumber: 1 }, { unique: true });
    await PaymentEnhanced.collection.createIndex({ 'booking.id': 1 });
    await PaymentEnhanced.collection.createIndex({ 'user.id': 1 });
    await PaymentEnhanced.collection.createIndex({ status: 1, createdAt: -1 });
    await PaymentEnhanced.collection.createIndex({ 'gateway.transactionId': 1 });
    await PaymentEnhanced.collection.createIndex({ 'gateway.provider': 1, status: 1 });
    await PaymentEnhanced.collection.createIndex({ processedAt: -1 });
    await PaymentEnhanced.collection.createIndex({ completedAt: -1 });
    
    results.schemas.Payment = 'initialized';
    results.indexes.Payment = 'created';
    
    console.log('✅ Payment schema initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing Payment schema:', error);
    results.errors.push({ schema: 'Payment', error: error.message });
  }
}

/**
 * Initialize Notification schema
 */
async function initializeNotificationSchema(results) {
  try {
    console.log('📝 Initializing Notification schema...');
    
    // Create indexes
    await NotificationEnhanced.collection.createIndex({ user: 1, isRead: 1 });
    await NotificationEnhanced.collection.createIndex({ user: 1, createdAt: -1 });
    await NotificationEnhanced.collection.createIndex({ type: 1, createdAt: -1 });
    await NotificationEnhanced.collection.createIndex({ priority: 1, isUrgent: 1 });
    await NotificationEnhanced.collection.createIndex({ expiresAt: 1 });
    await NotificationEnhanced.collection.createIndex({ 'relatedEntity.type': 1, 'relatedEntity.id': 1 });
    await NotificationEnhanced.collection.createIndex({ isDelivered: 1, createdAt: -1 });
    
    // TTL index for automatic cleanup
    await NotificationEnhanced.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    
    results.schemas.Notification = 'initialized';
    results.indexes.Notification = 'created';
    
    console.log('✅ Notification schema initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing Notification schema:', error);
    results.errors.push({ schema: 'Notification', error: error.message });
  }
}

/**
 * Create comprehensive indexes for performance optimization
 */
async function createComprehensiveIndexes(results) {
  try {
    console.log('📊 Creating comprehensive indexes...');
    
    // Compound indexes for complex queries
    await UserEnhanced.collection.createIndex({ 
      'location.city': 1, 
      'preferences.interests': 1, 
      status: 1 
    });
    
    await ActivityEnhanced.collection.createIndex({ 
      'category.id': 1, 
      'location.city': 1, 
      'features.isFeatured': 1, 
      status: 1 
    });
    
    await BookingEnhanced.collection.createIndex({ 
      'user.id': 1, 
      'schedule.date': 1, 
      status: 1 
    });
    
    await ReviewEnhanced.collection.createIndex({ 
      'activity.id': 1, 
      'rating.overall': -1, 
      status: 1 
    });
    
    results.indexes.comprehensive = 'created';
    console.log('✅ Comprehensive indexes created successfully');
    
  } catch (error) {
    console.error('❌ Error creating comprehensive indexes:', error);
    results.errors.push({ operation: 'comprehensive_indexes', error: error.message });
  }
}

/**
 * Seed sample data for testing
 */
async function seedSampleData(results) {
  try {
    console.log('🌱 Seeding sample data...');
    
    // Seed categories
    const categories = await seedCategories();
    results.sampleData.categories = categories.length;
    
    // Seed locations
    const locations = await seedLocations();
    results.sampleData.locations = locations.length;
    
    // Seed partners
    const partners = await seedPartners();
    results.sampleData.partners = partners.length;
    
    // Seed activities
    const activities = await seedActivities(categories, locations, partners);
    results.sampleData.activities = activities.length;
    
    console.log('✅ Sample data seeded successfully');
    
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    results.errors.push({ operation: 'sample_data', error: error.message });
  }
}

/**
 * Seed sample categories
 */
async function seedCategories() {
  const categories = [
    {
      name: 'الرياضة واللياقة',
      nameEn: 'Sports & Fitness',
      description: 'أنشطة رياضية ولياقة بدنية',
      descriptionEn: 'Sports and fitness activities',
      icon: 'sports',
      color: '#3B82F6',
      isActive: true,
      sortOrder: 1,
      createdBy: new mongoose.Types.ObjectId()
    },
    {
      name: 'الفنون والثقافة',
      nameEn: 'Arts & Culture',
      description: 'أنشطة فنية وثقافية',
      descriptionEn: 'Arts and cultural activities',
      icon: 'arts',
      color: '#8B5CF6',
      isActive: true,
      sortOrder: 2,
      createdBy: new mongoose.Types.ObjectId()
    },
    {
      name: 'الطعام والشراب',
      nameEn: 'Food & Drink',
      description: 'أنشطة الطعام والشراب',
      descriptionEn: 'Food and drink activities',
      icon: 'food',
      color: '#F59E0B',
      isActive: true,
      sortOrder: 3,
      createdBy: new mongoose.Types.ObjectId()
    }
  ];
  
  return await CategoryEnhanced.insertMany(categories);
}

/**
 * Seed sample locations
 */
async function seedLocations() {
  const locations = [
    {
      name: 'الرياض',
      nameEn: 'Riyadh',
      description: 'عاصمة المملكة العربية السعودية',
      descriptionEn: 'Capital of Saudi Arabia',
      type: 'city',
      coordinates: {
        type: 'Point',
        coordinates: [46.6753, 24.7136]
      },
      timezone: 'Asia/Riyadh',
      country: 'Saudi Arabia',
      countryCode: 'SA',
      isActive: true,
      sortOrder: 1,
      createdBy: new mongoose.Types.ObjectId()
    },
    {
      name: 'جدة',
      nameEn: 'Jeddah',
      description: 'مدينة جدة على البحر الأحمر',
      descriptionEn: 'Jeddah city on the Red Sea',
      type: 'city',
      coordinates: {
        type: 'Point',
        coordinates: [39.1728, 21.4858]
      },
      timezone: 'Asia/Riyadh',
      country: 'Saudi Arabia',
      countryCode: 'SA',
      isActive: true,
      sortOrder: 2,
      createdBy: new mongoose.Types.ObjectId()
    }
  ];
  
  return await LocationEnhanced.insertMany(locations);
}

/**
 * Seed sample partners
 */
async function seedPartners() {
  const partners = [
    {
      businessInfo: {
        name: 'مركز الرياضة واللياقة',
        nameEn: 'Sports & Fitness Center',
        description: 'مركز متخصص في الرياضة واللياقة البدنية',
        descriptionEn: 'Specialized sports and fitness center',
        businessType: 'company',
        registrationNumber: '1234567890',
        taxNumber: '123456789012345'
      },
      contact: {
        email: 'info@sportscenter.com',
        phone: '+966501234567'
      },
      location: {
        city: 'الرياض',
        cityEn: 'Riyadh',
        region: 'الرياض',
        regionEn: 'Riyadh',
        address: 'شارع الملك فهد، الرياض',
        addressEn: 'King Fahd Street, Riyadh',
        coordinates: {
          type: 'Point',
          coordinates: [46.6753, 24.7136]
        }
      },
      verification: {
        isVerified: true,
        verificationLevel: 'verified'
      },
      status: 'active',
      createdBy: new mongoose.Types.ObjectId()
    }
  ];
  
  return await PartnerEnhanced.insertMany(partners);
}

/**
 * Seed sample activities
 */
async function seedActivities(categories, locations, partners) {
  const activities = [
    {
      title: 'جلسة يوغا صباحية',
      titleEn: 'Morning Yoga Session',
      description: 'جلسة يوغا صباحية للاسترخاء واللياقة',
      descriptionEn: 'Morning yoga session for relaxation and fitness',
      fullDescription: 'جلسة يوغا صباحية شاملة للاسترخاء واللياقة البدنية',
      fullDescriptionEn: 'Comprehensive morning yoga session for relaxation and physical fitness',
      category: {
        id: categories[0]._id,
        name: categories[0].name,
        nameEn: categories[0].nameEn
      },
      partner: {
        id: partners[0]._id,
        name: partners[0].businessInfo.name,
        nameEn: partners[0].businessInfo.nameEn,
        phone: partners[0].contact.phone
      },
      location: {
        city: 'الرياض',
        cityEn: 'Riyadh',
        region: 'الرياض',
        regionEn: 'Riyadh',
        address: 'شارع الملك فهد، الرياض',
        addressEn: 'King Fahd Street, Riyadh',
        coordinates: {
          type: 'Point',
          coordinates: [46.6753, 24.7136]
        }
      },
      pricing: {
        adult: 100,
        child: 50,
        currency: 'SAR'
      },
      schedule: {
        duration: '1 hour',
        startTime: '08:00',
        endTime: '09:00'
      },
      capacity: {
        minParticipants: 5,
        maxParticipants: 20,
        currentBookings: 0
      },
      features: {
        isBookable: true,
        isFeatured: true,
        tags: ['يوغا', 'صباح', 'استرخاء'],
        tagsEn: ['yoga', 'morning', 'relaxation']
      },
      status: 'active',
      createdBy: new mongoose.Types.ObjectId()
    }
  ];
  
  return await ActivityEnhanced.insertMany(activities);
}

/**
 * Validate all schemas
 */
async function validateSchemas(results) {
  try {
    console.log('🔍 Validating schemas...');
    
    // Test User validation
    const testUser = {
      email: 'test@example.com',
      profile: {
        firstName: 'أحمد',
        lastName: 'محمد',
        phone: '+966501234567',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male'
      },
      location: {
        city: 'الرياض',
        region: 'الرياض',
        coordinates: {
          type: 'Point',
          coordinates: [46.6753, 24.7136]
        }
      }
    };
    
    const userValidation = validateUser(testUser);
    if (!userValidation.isValid) {
      results.errors.push({ schema: 'User', validation: userValidation.errors });
    }
    
    // Test Activity validation
    const testActivity = {
      title: 'Test Activity',
      description: 'Test description',
      category: { id: new mongoose.Types.ObjectId() },
      partner: { id: new mongoose.Types.ObjectId() },
      location: {
        city: 'الرياض',
        coordinates: {
          type: 'Point',
          coordinates: [46.6753, 24.7136]
        }
      },
      pricing: {
        adult: 100,
        child: 50
      },
      capacity: {
        minParticipants: 1,
        maxParticipants: 10
      }
    };
    
    const activityValidation = validateActivity(testActivity);
    if (!activityValidation.isValid) {
      results.errors.push({ schema: 'Activity', validation: activityValidation.errors });
    }
    
    results.validation = 'completed';
    console.log('✅ Schema validation completed');
    
  } catch (error) {
    console.error('❌ Error validating schemas:', error);
    results.errors.push({ operation: 'validation', error: error.message });
  }
}

// Run initialization if called directly
if (require.main === module) {
  initializeEnhancedSchemas()
    .then((results) => {
      console.log('🎉 Enhanced database initialization completed!');
      console.log('Results:', JSON.stringify(results, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Enhanced database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = {
  initializeEnhancedSchemas,
  seedCategories,
  seedLocations,
  seedPartners,
  seedActivities
};

