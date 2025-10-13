/**
 * @fileoverview Enhanced Schemas Test Suite - LDS-006 Implementation
 * 
 * This test suite validates all enhanced database schemas for the LUDUS platform
 * with comprehensive testing of validation rules, relationships, and functionality.
 * 
 * Key Features:
 * - Comprehensive schema validation testing
 * - Arabic/English text validation
 * - Geospatial functionality testing
 * - Business logic validation
 * - Performance testing
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
const {
  validateUser,
  validateActivity,
  validateBooking,
  validateSaudiPhone,
  validateEmail,
  validateCoordinates,
  validateArabicText
} = require('../utils/validation');

describe('Enhanced Schemas Test Suite', () => {
  beforeAll(async () => {
    // Connect to test database
    process.env.NODE_ENV = 'test';
    await connectDB();
  });

  afterAll(async () => {
    // Clean up test database
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up collections before each test
    await Promise.all([
      UserEnhanced.deleteMany({}),
      ActivityEnhanced.deleteMany({}),
      BookingEnhanced.deleteMany({}),
      ReviewEnhanced.deleteMany({}),
      PartnerEnhanced.deleteMany({}),
      CategoryEnhanced.deleteMany({}),
      PaymentEnhanced.deleteMany({}),
      NotificationEnhanced.deleteMany({}),
      LocationEnhanced.deleteMany({})
    ]);
  });

  describe('UserEnhanced Schema', () => {
    test('should create a valid user with Arabic support', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        profile: {
          firstName: 'أحمد',
          lastName: 'محمد',
          firstNameAr: 'أحمد',
          lastNameAr: 'محمد',
          phone: '+966501234567',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male'
        },
        location: {
          city: 'الرياض',
          cityAr: 'الرياض',
          region: 'الرياض',
          regionAr: 'الرياض',
          coordinates: {
            type: 'Point',
            coordinates: [46.6753, 24.7136]
          }
        },
        preferences: {
          language: 'ar',
          timezone: 'Asia/Riyadh'
        }
      };

      const user = new UserEnhanced(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.profile.firstName).toBe(userData.profile.firstName);
      expect(savedUser.profile.firstNameAr).toBe(userData.profile.firstNameAr);
      expect(savedUser.preferences.language).toBe('ar');
    });

    test('should validate Saudi phone number', () => {
      expect(validateSaudiPhone('+966501234567')).toBe(true);
      expect(validateSaudiPhone('+96650123456')).toBe(false);
      expect(validateSaudiPhone('966501234567')).toBe(false);
    });

    test('should validate email format', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
    });

    test('should validate Arabic text', () => {
      expect(validateArabicText('أحمد محمد')).toBe(true);
      expect(validateArabicText('Ahmad Mohammed')).toBe(false);
      expect(validateArabicText('أحمد Ahmad')).toBe(true);
    });

    test('should hash password before saving', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
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

      const user = new UserEnhanced(userData);
      await user.save();

      expect(user.password).not.toBe('password123');
      expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash pattern
    });

    test('should compare password correctly', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
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

      const user = new UserEnhanced(userData);
      await user.save();

      const isValid = await user.comparePassword('password123');
      expect(isValid).toBe(true);

      const isInvalid = await user.comparePassword('wrongpassword');
      expect(isInvalid).toBe(false);
    });

    test('should get display name based on language preference', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        profile: {
          firstName: 'أحمد',
          lastName: 'محمد',
          firstNameAr: 'أحمد',
          lastNameAr: 'محمد',
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
        },
        preferences: {
          language: 'ar'
        }
      };

      const user = new UserEnhanced(userData);
      await user.save();

      expect(user.getFullName('ar')).toBe('أحمد محمد');
      expect(user.getFullName('en')).toBe('أحمد محمد');
    });
  });

  describe('ActivityEnhanced Schema', () => {
    let category, location, partner;

    beforeEach(async () => {
      // Create test data
      category = await CategoryEnhanced.create({
        name: 'الرياضة',
        nameEn: 'Sports',
        description: 'أنشطة رياضية',
        descriptionEn: 'Sports activities',
        icon: 'sports',
        isActive: true,
        createdBy: new mongoose.Types.ObjectId()
      });

      location = await LocationEnhanced.create({
        name: 'الرياض',
        nameEn: 'Riyadh',
        type: 'city',
        coordinates: {
          type: 'Point',
          coordinates: [46.6753, 24.7136]
        },
        isActive: true,
        createdBy: new mongoose.Types.ObjectId()
      });

      partner = await PartnerEnhanced.create({
        businessInfo: {
          name: 'مركز الرياضة',
          nameEn: 'Sports Center',
          description: 'مركز متخصص في الرياضة',
          descriptionEn: 'Specialized sports center',
          businessType: 'company'
        },
        contact: {
          email: 'info@sports.com',
          phone: '+966501234567'
        },
        location: {
          city: 'الرياض',
          region: 'الرياض',
          address: 'شارع الملك فهد',
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
      });
    });

    test('should create a valid activity with Arabic support', async () => {
      const activityData = {
        title: 'جلسة يوغا',
        titleEn: 'Yoga Session',
        description: 'جلسة يوغا صباحية',
        descriptionEn: 'Morning yoga session',
        fullDescription: 'جلسة يوغا صباحية شاملة',
        fullDescriptionEn: 'Comprehensive morning yoga session',
        category: {
          id: category._id,
          name: category.name,
          nameEn: category.nameEn
        },
        partner: {
          id: partner._id,
          name: partner.businessInfo.name,
          nameEn: partner.businessInfo.nameEn,
          phone: partner.contact.phone
        },
        location: {
          city: 'الرياض',
          cityEn: 'Riyadh',
          region: 'الرياض',
          regionEn: 'Riyadh',
          address: 'شارع الملك فهد',
          addressEn: 'King Fahd Street',
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
          tags: ['يوغا', 'صباح'],
          tagsEn: ['yoga', 'morning']
        },
        status: 'active',
        createdBy: new mongoose.Types.ObjectId()
      };

      const activity = new ActivityEnhanced(activityData);
      const savedActivity = await activity.save();

      expect(savedActivity._id).toBeDefined();
      expect(savedActivity.title).toBe(activityData.title);
      expect(savedActivity.titleEn).toBe(activityData.titleEn);
      expect(savedActivity.pricing.adult).toBe(100);
      expect(savedActivity.pricing.currency).toBe('SAR');
    });

    test('should validate coordinates', () => {
      expect(validateCoordinates(46.6753, 24.7136)).toBe(true);
      expect(validateCoordinates(200, 24.7136)).toBe(false);
      expect(validateCoordinates(46.6753, 100)).toBe(false);
    });

    test('should update rating correctly', async () => {
      const activity = new ActivityEnhanced({
        title: 'Test Activity',
        titleEn: 'Test Activity',
        description: 'Test description',
        descriptionEn: 'Test description',
        fullDescription: 'Test full description',
        fullDescriptionEn: 'Test full description',
        category: {
          id: category._id,
          name: category.name,
          nameEn: category.nameEn
        },
        partner: {
          id: partner._id,
          name: partner.businessInfo.name,
          nameEn: partner.businessInfo.nameEn,
          phone: partner.contact.phone
        },
        location: {
          city: 'الرياض',
          region: 'الرياض',
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
          isBookable: true
        },
        status: 'active',
        createdBy: new mongoose.Types.ObjectId()
      });

      await activity.save();

      // Update rating
      await activity.updateRating(4.5);
      expect(activity.stats.averageRating).toBe(4.5);
      expect(activity.stats.reviewCount).toBe(1);

      // Update rating again
      await activity.updateRating(3.5);
      expect(activity.stats.averageRating).toBe(4.0);
      expect(activity.stats.reviewCount).toBe(2);
    });

    test('should check availability correctly', async () => {
      const activity = new ActivityEnhanced({
        title: 'Test Activity',
        titleEn: 'Test Activity',
        description: 'Test description',
        descriptionEn: 'Test description',
        fullDescription: 'Test full description',
        fullDescriptionEn: 'Test full description',
        category: {
          id: category._id,
          name: category.name,
          nameEn: category.nameEn
        },
        partner: {
          id: partner._id,
          name: partner.businessInfo.name,
          nameEn: partner.businessInfo.nameEn,
          phone: partner.contact.phone
        },
        location: {
          city: 'الرياض',
          region: 'الرياض',
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
          endTime: '09:00',
          availableDates: [{
            date: new Date('2025-02-01'),
            timeSlots: [{
              time: '08:00',
              available: true,
              maxParticipants: 10
            }]
          }]
        },
        capacity: {
          minParticipants: 5,
          maxParticipants: 20,
          currentBookings: 0
        },
        features: {
          isBookable: true
        },
        status: 'active',
        createdBy: new mongoose.Types.ObjectId()
      });

      await activity.save();

      const isAvailable = activity.checkAvailability(new Date('2025-02-01'), '08:00');
      expect(isAvailable).toBe(true);

      const slots = activity.getAvailableSlots(new Date('2025-02-01'));
      expect(slots).toHaveLength(1);
      expect(slots[0].time).toBe('08:00');
    });
  });

  describe('BookingEnhanced Schema', () => {
    let user, activity, partner;

    beforeEach(async () => {
      // Create test data
      user = await UserEnhanced.create({
        email: 'user@example.com',
        password: 'password123',
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
      });

      const category = await CategoryEnhanced.create({
        name: 'الرياضة',
        nameEn: 'Sports',
        description: 'أنشطة رياضية',
        descriptionEn: 'Sports activities',
        icon: 'sports',
        isActive: true,
        createdBy: new mongoose.Types.ObjectId()
      });

      partner = await PartnerEnhanced.create({
        businessInfo: {
          name: 'مركز الرياضة',
          nameEn: 'Sports Center',
          description: 'مركز متخصص في الرياضة',
          descriptionEn: 'Specialized sports center',
          businessType: 'company'
        },
        contact: {
          email: 'info@sports.com',
          phone: '+966501234567'
        },
        location: {
          city: 'الرياض',
          region: 'الرياض',
          address: 'شارع الملك فهد',
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
      });

      activity = await ActivityEnhanced.create({
        title: 'جلسة يوغا',
        titleEn: 'Yoga Session',
        description: 'جلسة يوغا صباحية',
        descriptionEn: 'Morning yoga session',
        fullDescription: 'جلسة يوغا صباحية شاملة',
        fullDescriptionEn: 'Comprehensive morning yoga session',
        category: {
          id: category._id,
          name: category.name,
          nameEn: category.nameEn
        },
        partner: {
          id: partner._id,
          name: partner.businessInfo.name,
          nameEn: partner.businessInfo.nameEn,
          phone: partner.contact.phone
        },
        location: {
          city: 'الرياض',
          region: 'الرياض',
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
          isBookable: true
        },
        status: 'active',
        createdBy: new mongoose.Types.ObjectId()
      });
    });

    test('should create a valid booking', async () => {
      const bookingData = {
        user: {
          id: user._id,
          name: user.profile.firstName + ' ' + user.profile.lastName,
          email: user.email,
          phone: user.profile.phone
        },
        activity: {
          id: activity._id,
          title: activity.title,
          titleEn: activity.titleEn,
          image: null,
          partner: {
            id: partner._id,
            name: partner.businessInfo.name,
            nameEn: partner.businessInfo.nameEn,
            phone: partner.contact.phone
          }
        },
        schedule: {
          date: new Date('2025-02-01'),
          timeSlot: '08:00',
          duration: '1 hour'
        },
        participants: [{
          type: 'adult',
          name: 'أحمد محمد',
          nameAr: 'أحمد محمد',
          age: 30,
          idNumber: '1234567890'
        }],
        contactInfo: {
          phone: '+966501234567',
          email: 'user@example.com',
          emergencyContact: {
            name: 'محمد أحمد',
            phone: '+966501234568',
            relationship: 'أخ'
          }
        },
        pricing: {
          adultPrice: 100,
          childPrice: 50,
          seniorPrice: 0,
          subtotal: 100,
          tax: 15,
          total: 115,
          currency: 'SAR'
        },
        payment: {
          method: 'moyasar',
          status: 'pending'
        },
        status: 'pending_payment'
      };

      const booking = new BookingEnhanced(bookingData);
      const savedBooking = await booking.save();

      expect(savedBooking._id).toBeDefined();
      expect(savedBooking.bookingNumber).toBeDefined();
      expect(savedBooking.user.id).toEqual(user._id);
      expect(savedBooking.activity.id).toEqual(activity._id);
      expect(savedBooking.pricing.total).toBe(115);
    });

    test('should calculate total price correctly', async () => {
      const booking = new BookingEnhanced({
        user: {
          id: user._id,
          name: 'Test User',
          email: 'user@example.com',
          phone: '+966501234567'
        },
        activity: {
          id: activity._id,
          title: 'Test Activity',
          partner: {
            id: partner._id,
            name: 'Test Partner',
            phone: '+966501234567'
          }
        },
        schedule: {
          date: new Date('2025-02-01'),
          timeSlot: '08:00',
          duration: '1 hour'
        },
        participants: [{
          type: 'adult',
          name: 'Test User',
          age: 30,
          idNumber: '1234567890'
        }],
        contactInfo: {
          phone: '+966501234567',
          email: 'user@example.com',
          emergencyContact: {
            name: 'Emergency Contact',
            phone: '+966501234568',
            relationship: 'Brother'
          }
        },
        pricing: {
          adultPrice: 100,
          childPrice: 50,
          seniorPrice: 0,
          subtotal: 100,
          tax: 15,
          total: 115,
          currency: 'SAR'
        },
        payment: {
          method: 'moyasar',
          status: 'pending'
        },
        status: 'pending_payment'
      });

      const totalPrice = booking.calculateTotalPrice();
      expect(totalPrice).toBe(115);
    });

    test('should check cancellation eligibility correctly', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2); // 2 days from now

      const booking = new BookingEnhanced({
        user: {
          id: user._id,
          name: 'Test User',
          email: 'user@example.com',
          phone: '+966501234567'
        },
        activity: {
          id: activity._id,
          title: 'Test Activity',
          partner: {
            id: partner._id,
            name: 'Test Partner',
            phone: '+966501234567'
          }
        },
        schedule: {
          date: futureDate,
          timeSlot: '08:00',
          duration: '1 hour'
        },
        participants: [{
          type: 'adult',
          name: 'Test User',
          age: 30,
          idNumber: '1234567890'
        }],
        contactInfo: {
          phone: '+966501234567',
          email: 'user@example.com',
          emergencyContact: {
            name: 'Emergency Contact',
            phone: '+966501234568',
            relationship: 'Brother'
          }
        },
        pricing: {
          adultPrice: 100,
          childPrice: 50,
          seniorPrice: 0,
          subtotal: 100,
          tax: 15,
          total: 115,
          currency: 'SAR'
        },
        payment: {
          method: 'moyasar',
          status: 'pending'
        },
        status: 'pending_payment'
      });

      const canCancel = booking.canBeCancelled();
      expect(canCancel).toBe(true);

      const refundAmount = booking.getRefundAmount();
      expect(refundAmount).toBe(115); // Full refund for 2 days advance
    });
  });

  describe('ReviewEnhanced Schema', () => {
    let user, activity, booking;

    beforeEach(async () => {
      // Create test data
      user = await UserEnhanced.create({
        email: 'user@example.com',
        password: 'password123',
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
      });

      const category = await CategoryEnhanced.create({
        name: 'الرياضة',
        nameEn: 'Sports',
        description: 'أنشطة رياضية',
        descriptionEn: 'Sports activities',
        icon: 'sports',
        isActive: true,
        createdBy: new mongoose.Types.ObjectId()
      });

      const partner = await PartnerEnhanced.create({
        businessInfo: {
          name: 'مركز الرياضة',
          nameEn: 'Sports Center',
          description: 'مركز متخصص في الرياضة',
          descriptionEn: 'Specialized sports center',
          businessType: 'company'
        },
        contact: {
          email: 'info@sports.com',
          phone: '+966501234567'
        },
        location: {
          city: 'الرياض',
          region: 'الرياض',
          address: 'شارع الملك فهد',
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
      });

      activity = await ActivityEnhanced.create({
        title: 'جلسة يوغا',
        titleEn: 'Yoga Session',
        description: 'جلسة يوغا صباحية',
        descriptionEn: 'Morning yoga session',
        fullDescription: 'جلسة يوغا صباحية شاملة',
        fullDescriptionEn: 'Comprehensive morning yoga session',
        category: {
          id: category._id,
          name: category.name,
          nameEn: category.nameEn
        },
        partner: {
          id: partner._id,
          name: partner.businessInfo.name,
          nameEn: partner.businessInfo.nameEn,
          phone: partner.contact.phone
        },
        location: {
          city: 'الرياض',
          region: 'الرياض',
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
          isBookable: true
        },
        status: 'active',
        createdBy: new mongoose.Types.ObjectId()
      });

      booking = await BookingEnhanced.create({
        user: {
          id: user._id,
          name: user.profile.firstName + ' ' + user.profile.lastName,
          email: user.email,
          phone: user.profile.phone
        },
        activity: {
          id: activity._id,
          title: activity.title,
          titleEn: activity.titleEn,
          partner: {
            id: partner._id,
            name: partner.businessInfo.name,
            nameEn: partner.businessInfo.nameEn,
            phone: partner.contact.phone
          }
        },
        schedule: {
          date: new Date('2025-02-01'),
          timeSlot: '08:00',
          duration: '1 hour'
        },
        participants: [{
          type: 'adult',
          name: 'أحمد محمد',
          age: 30,
          idNumber: '1234567890'
        }],
        contactInfo: {
          phone: '+966501234567',
          email: 'user@example.com',
          emergencyContact: {
            name: 'محمد أحمد',
            phone: '+966501234568',
            relationship: 'أخ'
          }
        },
        pricing: {
          adultPrice: 100,
          childPrice: 50,
          seniorPrice: 0,
          subtotal: 100,
          tax: 15,
          total: 115,
          currency: 'SAR'
        },
        payment: {
          method: 'moyasar',
          status: 'pending'
        },
        status: 'pending_payment'
      });
    });

    test('should create a valid review with Arabic support', async () => {
      const reviewData = {
        user: {
          id: user._id,
          name: user.profile.firstName + ' ' + user.profile.lastName,
          nameAr: user.profile.firstNameAr + ' ' + user.profile.lastNameAr,
          avatar: null
        },
        activity: {
          id: activity._id,
          title: activity.title,
          titleEn: activity.titleEn
        },
        booking: {
          id: booking._id,
          bookingNumber: booking.bookingNumber
        },
        rating: {
          overall: 4,
          categories: {
            value: 4,
            service: 5,
            location: 3,
            communication: 4
          }
        },
        comment: 'تجربة رائعة جداً',
        commentAr: 'تجربة رائعة جداً',
        isVerified: true
      };

      const review = new ReviewEnhanced(reviewData);
      const savedReview = await review.save();

      expect(savedReview._id).toBeDefined();
      expect(savedReview.rating.overall).toBe(4);
      expect(savedReview.comment).toBe(reviewData.comment);
      expect(savedReview.commentAr).toBe(reviewData.commentAr);
      expect(savedReview.isVerified).toBe(true);
    });

    test('should calculate average category rating correctly', async () => {
      const review = new ReviewEnhanced({
        user: {
          id: user._id,
          name: 'Test User',
          avatar: null
        },
        activity: {
          id: activity._id,
          title: 'Test Activity'
        },
        booking: {
          id: booking._id,
          bookingNumber: 'TEST-123'
        },
        rating: {
          overall: 4,
          categories: {
            value: 4,
            service: 5,
            location: 3,
            communication: 4
          }
        },
        comment: 'Great experience',
        isVerified: true
      });

      const averageRating = review.calculateAverageCategoryRating();
      expect(averageRating).toBe(4.0); // (4+5+3+4)/4 = 4.0
    });

    test('should add helpful vote correctly', async () => {
      const review = new ReviewEnhanced({
        user: {
          id: user._id,
          name: 'Test User',
          avatar: null
        },
        activity: {
          id: activity._id,
          title: 'Test Activity'
        },
        booking: {
          id: booking._id,
          bookingNumber: 'TEST-123'
        },
        rating: {
          overall: 4,
          categories: {
            value: 4,
            service: 5,
            location: 3,
            communication: 4
          }
        },
        comment: 'Great experience',
        isVerified: true
      });

      await review.save();

      const anotherUser = new mongoose.Types.ObjectId();
      await review.addHelpfulVote(anotherUser);

      expect(review.helpful.count).toBe(1);
      expect(review.helpful.users).toContain(anotherUser.toString());
    });

    test('should add partner response correctly', async () => {
      const review = new ReviewEnhanced({
        user: {
          id: user._id,
          name: 'Test User',
          avatar: null
        },
        activity: {
          id: activity._id,
          title: 'Test Activity'
        },
        booking: {
          id: booking._id,
          bookingNumber: 'TEST-123'
        },
        rating: {
          overall: 4,
          categories: {
            value: 4,
            service: 5,
            location: 3,
            communication: 4
          }
        },
        comment: 'Great experience',
        isVerified: true
      });

      await review.save();

      const partnerInfo = {
        id: new mongoose.Types.ObjectId(),
        name: 'Test Partner',
        nameAr: 'شريك تجريبي'
      };

      await review.addPartnerResponse(partnerInfo, 'Thank you for your feedback', 'شكراً لك على تعليقك');

      expect(review.response.partner.id).toEqual(partnerInfo.id);
      expect(review.response.comment).toBe('Thank you for your feedback');
      expect(review.response.commentAr).toBe('شكراً لك على تعليقك');
      expect(review.response.respondedAt).toBeDefined();
    });
  });

  describe('Validation Functions', () => {
    test('should validate user data correctly', () => {
      const validUserData = {
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
          coordinates: {
            type: 'Point',
            coordinates: [46.6753, 24.7136]
          }
        }
      };

      const validation = validateUser(validUserData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should validate activity data correctly', () => {
      const validActivityData = {
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

      const validation = validateActivity(validActivityData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should validate booking data correctly', () => {
      const validBookingData = {
        user: { id: new mongoose.Types.ObjectId() },
        activity: { id: new mongoose.Types.ObjectId() },
        schedule: { date: new Date('2025-02-01') },
        participants: [{
          name: 'Test User',
          type: 'adult',
          age: 30
        }],
        pricing: { total: 100 }
      };

      const validation = validateBooking(validBookingData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Performance Tests', () => {
    test('should handle large datasets efficiently', async () => {
      const startTime = Date.now();
      
      // Create multiple users
      const users = [];
      for (let i = 0; i < 100; i++) {
        const user = new UserEnhanced({
          email: `user${i}@example.com`,
          password: 'password123',
          profile: {
            firstName: `User${i}`,
            lastName: 'Test',
            phone: `+966501234${i.toString().padStart(3, '0')}`,
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
        });
        users.push(user);
      }
      
      await UserEnhanced.insertMany(users);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      
      // Verify all users were created
      const count = await UserEnhanced.countDocuments();
      expect(count).toBe(100);
    });
  });
});

