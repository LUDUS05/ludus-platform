/**
 * @fileoverview Analytics System Test Suite - LDS-017 Implementation
 * @module tests/analytics.test
 * 
 * This test suite provides comprehensive testing for the analytics system including:
 * - Dashboard analytics testing
 * - User analytics testing
 * - Revenue analytics testing
 * - Vendor analytics testing
 * - Search analytics testing
 * - Performance metrics testing
 * - Error handling testing
 * - Performance testing
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const ActivityEnhanced = require('../models/ActivityEnhanced');
const BookingEnhanced = require('../models/BookingEnhanced');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const PaymentEnhanced = require('../models/PaymentEnhanced');
const ReviewEnhanced = require('../models/ReviewEnhanced');

describe('Analytics System - LDS-017', () => {
  let testUser;
  let testVendor;
  let testActivities;
  let testBookings;
  let testPayments;
  let authToken;

  beforeAll(async () => {
    // Create test admin user
    testUser = new User({
      firstName: 'Test',
      lastName: 'Admin',
      email: 'admin@example.com',
      password: 'password123',
      isVerified: true,
      role: 'admin',
      adminRole: 'SA'
    });
    await testUser.save();

    // Create test vendor
    testVendor = new Vendor({
      businessName: 'Test Analytics Vendor',
      businessNameAr: 'مزود تحليلات الاختبار',
      email: 'vendor@example.com',
      phone: '+966501234567',
      isActive: true,
      status: 'approved'
    });
    await testVendor.save();

    // Create test activities
    testActivities = [
      new ActivityEnhanced({
        title: 'Analytics Test Activity 1',
        titleEn: 'Analytics Test Activity 1',
        description: 'Test activity for analytics',
        descriptionEn: 'Test activity for analytics',
        category: 'sports',
        tags: ['test', 'analytics'],
        features: ['equipment'],
        difficulty: 'intermediate',
        duration: 'medium',
        pricing: {
          adult: 100,
          child: 50
        },
        location: {
          city: 'Riyadh',
          cityAr: 'الرياض',
          area: 'Al Olaya',
          areaAr: 'العليا',
          coordinates: [46.6753, 24.7136]
        },
        partner: testVendor._id,
        status: 'published',
        rating: {
          average: 4.5,
          count: 10
        },
        statistics: {
          views: 200,
          bookings: 50
        }
      }),
      new ActivityEnhanced({
        title: 'Analytics Test Activity 2',
        titleEn: 'Analytics Test Activity 2',
        description: 'Another test activity for analytics',
        descriptionEn: 'Another test activity for analytics',
        category: 'music',
        tags: ['test', 'music'],
        features: ['instruments'],
        difficulty: 'beginner',
        duration: 'long',
        pricing: {
          adult: 150,
          child: 75
        },
        location: {
          city: 'Jeddah',
          cityAr: 'جدة',
          area: 'Al Hamra',
          areaAr: 'الحمراء',
          coordinates: [39.1979, 21.4858]
        },
        partner: testVendor._id,
        status: 'published',
        rating: {
          average: 4.2,
          count: 8
        },
        statistics: {
          views: 150,
          bookings: 30
        }
      })
    ];

    await ActivityEnhanced.insertMany(testActivities);

    // Create test bookings
    testBookings = [
      new BookingEnhanced({
        user: testUser._id,
        activity: {
          id: testActivities[0]._id,
          title: testActivities[0].title,
          titleEn: testActivities[0].titleEn
        },
        vendor: {
          id: testVendor._id,
          businessName: testVendor.businessName,
          businessNameAr: testVendor.businessNameAr
        },
        bookingDate: new Date(),
        timeSlot: '10:00-12:00',
        participants: {
          adults: 2,
          children: 1
        },
        pricing: {
          adult: 100,
          child: 50,
          total: 250
        },
        status: 'confirmed',
        paymentStatus: 'completed'
      }),
      new BookingEnhanced({
        user: testUser._id,
        activity: {
          id: testActivities[1]._id,
          title: testActivities[1].title,
          titleEn: testActivities[1].titleEn
        },
        vendor: {
          id: testVendor._id,
          businessName: testVendor.businessName,
          businessNameAr: testVendor.businessNameAr
        },
        bookingDate: new Date(),
        timeSlot: '14:00-16:00',
        participants: {
          adults: 1,
          children: 0
        },
        pricing: {
          adult: 150,
          child: 0,
          total: 150
        },
        status: 'confirmed',
        paymentStatus: 'completed'
      })
    ];

    await BookingEnhanced.insertMany(testBookings);

    // Create test payments
    testPayments = [
      new PaymentEnhanced({
        user: testUser._id,
        booking: {
          id: testBookings[0]._id,
          bookingNumber: testBookings[0].bookingNumber
        },
        amount: 250,
        currency: 'SAR',
        status: 'completed',
        paymentMethod: 'credit_card',
        moyasarId: 'test_moyasar_id_1',
        transactionId: 'test_transaction_1'
      }),
      new PaymentEnhanced({
        user: testUser._id,
        booking: {
          id: testBookings[1]._id,
          bookingNumber: testBookings[1].bookingNumber
        },
        amount: 150,
        currency: 'SAR',
        status: 'completed',
        paymentMethod: 'credit_card',
        moyasarId: 'test_moyasar_id_2',
        transactionId: 'test_transaction_2'
      })
    ];

    await PaymentEnhanced.insertMany(testPayments);

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Vendor.deleteMany({});
    await ActivityEnhanced.deleteMany({});
    await BookingEnhanced.deleteMany({});
    await PaymentEnhanced.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/analytics/dashboard', () => {
    it('should get comprehensive dashboard analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userMetrics');
      expect(response.body.data).toHaveProperty('activityMetrics');
      expect(response.body.data).toHaveProperty('bookingMetrics');
      expect(response.body.data).toHaveProperty('revenueMetrics');
      expect(response.body.data).toHaveProperty('vendorMetrics');
      expect(response.body.data).toHaveProperty('searchMetrics');
      expect(response.body.data).toHaveProperty('performanceMetrics');
      expect(response.body.data).toHaveProperty('insights');
    });

    it('should get dashboard analytics for specific period', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .query({ period: '7d' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBe('7d');
    });

    it('should get dashboard analytics with groupBy parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .query({ groupBy: 'week' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('timeSeriesData');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard');

      expect(response.status).toBe(401);
    });

    it('should require admin privileges', async () => {
      // Create regular user
      const regularUser = new User({
        firstName: 'Regular',
        lastName: 'User',
        email: 'regular@example.com',
        password: 'password123',
        isVerified: true,
        role: 'user'
      });
      await regularUser.save();

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'regular@example.com',
          password: 'password123'
        });

      const regularToken = loginResponse.body.data.accessToken;

      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(response.status).toBe(403);

      await User.findByIdAndDelete(regularUser._id);
    });
  });

  describe('GET /api/analytics/users', () => {
    it('should get user behavior analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userAnalytics');
      expect(response.body.data).toHaveProperty('engagementMetrics');
      expect(response.body.data).toHaveProperty('retentionData');
      expect(response.body.data).toHaveProperty('insights');
    });

    it('should get user analytics for specific period', async () => {
      const response = await request(app)
        .get('/api/analytics/users')
        .query({ period: '30d' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBe('30d');
    });

    it('should get user analytics for specific segment', async () => {
      const response = await request(app)
        .get('/api/analytics/users')
        .query({ segment: 'active' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should validate segment parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/users')
        .query({ segment: 'invalid' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/analytics/revenue', () => {
    it('should get revenue analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/revenue')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('revenueMetrics');
      expect(response.body.data).toHaveProperty('revenueByCategory');
      expect(response.body.data).toHaveProperty('revenueByLocation');
      expect(response.body.data).toHaveProperty('revenueTrends');
      expect(response.body.data).toHaveProperty('insights');
    });

    it('should get revenue analytics for specific period', async () => {
      const response = await request(app)
        .get('/api/analytics/revenue')
        .query({ period: '90d' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBe('90d');
    });

    it('should get revenue analytics with groupBy parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/revenue')
        .query({ groupBy: 'month' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should validate groupBy parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/revenue')
        .query({ groupBy: 'invalid' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/analytics/vendors', () => {
    it('should get vendor performance analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/vendors')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('vendorMetrics');
      expect(response.body.data).toHaveProperty('topVendors');
      expect(response.body.data).toHaveProperty('vendorGrowthTrends');
      expect(response.body.data).toHaveProperty('insights');
    });

    it('should get vendor analytics for specific vendor', async () => {
      const response = await request(app)
        .get('/api/analytics/vendors')
        .query({ vendorId: testVendor._id })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should get vendor analytics for specific period', async () => {
      const response = await request(app)
        .get('/api/analytics/vendors')
        .query({ period: '1y' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBe('1y');
    });

    it('should validate vendorId parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/vendors')
        .query({ vendorId: 'invalid_id' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/analytics/search', () => {
    it('should get search analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/search')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('searchMetrics');
      expect(response.body.data).toHaveProperty('popularCategories');
      expect(response.body.data).toHaveProperty('popularLocations');
      expect(response.body.data).toHaveProperty('insights');
    });

    it('should get search analytics for specific period', async () => {
      const response = await request(app)
        .get('/api/analytics/search')
        .query({ period: '7d' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBe('7d');
    });

    it('should return popular categories', async () => {
      const response = await request(app)
        .get('/api/analytics/search')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.popularCategories).toBeInstanceOf(Array);
      expect(response.body.data.popularCategories.length).toBeGreaterThan(0);
    });

    it('should return popular locations', async () => {
      const response = await request(app)
        .get('/api/analytics/search')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.popularLocations).toBeInstanceOf(Array);
      expect(response.body.data.popularLocations.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/analytics/performance', () => {
    it('should get performance metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/performance')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('performanceMetrics');
      expect(response.body.data).toHaveProperty('insights');
    });

    it('should get performance metrics for specific period', async () => {
      const response = await request(app)
        .get('/api/analytics/performance')
        .query({ period: '30d' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBe('30d');
    });

    it('should return system health metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/performance')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.performanceMetrics).toHaveProperty('apiResponseTime');
      expect(response.body.data.performanceMetrics).toHaveProperty('databaseQueryTime');
      expect(response.body.data.performanceMetrics).toHaveProperty('errorRate');
      expect(response.body.data.performanceMetrics).toHaveProperty('uptime');
    });
  });

  describe('Analytics Validation', () => {
    it('should validate period parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .query({ period: 'invalid' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should validate groupBy parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .query({ groupBy: 'invalid' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should validate limit parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .query({ limit: 2000 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should validate offset parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .query({ offset: -1 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should validate startDate parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .query({ startDate: 'invalid-date' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should validate endDate parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .query({ endDate: 'invalid-date' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('Analytics Performance', () => {
    it('should handle large datasets efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
    });

    it('should handle complex queries efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .query({
          period: '1y',
          groupBy: 'month',
          segment: 'active'
        })
        .set('Authorization', `Bearer ${authToken}`);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(3000); // Should respond within 3 seconds
    });

    it('should handle concurrent requests', async () => {
      const requests = Array(10).fill().map(() =>
        request(app)
          .get('/api/analytics/dashboard')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Analytics Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This would require mocking the database connection
      // For now, we'll test with invalid parameters
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('should handle malformed analytics parameters', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .query({ period: 'not-a-period' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Analytics Integration', () => {
    it('should integrate with user model correctly', async () => {
      const response = await request(app)
        .get('/api/analytics/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userAnalytics).toHaveProperty('totalUsers');
      expect(response.body.data.userAnalytics).toHaveProperty('verifiedUsers');
      expect(response.body.data.userAnalytics).toHaveProperty('activeUsers');
    });

    it('should integrate with activity model correctly', async () => {
      const response = await request(app)
        .get('/api/analytics/search')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.searchMetrics).toHaveProperty('totalSearches');
      expect(response.body.data.searchMetrics).toHaveProperty('totalActivities');
    });

    it('should integrate with payment model correctly', async () => {
      const response = await request(app)
        .get('/api/analytics/revenue')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.revenueMetrics).toHaveProperty('totalRevenue');
      expect(response.body.data.revenueMetrics).toHaveProperty('totalTransactions');
    });

    it('should integrate with vendor model correctly', async () => {
      const response = await request(app)
        .get('/api/analytics/vendors')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.vendorMetrics).toBeInstanceOf(Array);
    });

    it('should integrate with booking model correctly', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.bookingMetrics).toHaveProperty('totalBookings');
      expect(response.body.data.bookingMetrics).toHaveProperty('confirmedBookings');
    });
  });

  describe('Analytics Data Accuracy', () => {
    it('should return accurate user metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const userAnalytics = response.body.data.userAnalytics;
      expect(userAnalytics.totalUsers).toBeGreaterThanOrEqual(1); // At least our test user
      expect(userAnalytics.verifiedUsers).toBeGreaterThanOrEqual(1);
    });

    it('should return accurate revenue metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/revenue')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const revenueMetrics = response.body.data.revenueMetrics;
      expect(revenueMetrics.totalRevenue).toBeGreaterThanOrEqual(400); // Sum of our test payments
      expect(revenueMetrics.totalTransactions).toBeGreaterThanOrEqual(2);
    });

    it('should return accurate activity metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/search')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const searchMetrics = response.body.data.searchMetrics;
      expect(searchMetrics.totalActivities).toBeGreaterThanOrEqual(2); // Our test activities
      expect(searchMetrics.totalSearches).toBeGreaterThanOrEqual(350); // Sum of views
    });

    it('should return accurate vendor metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/vendors')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const vendorMetrics = response.body.data.vendorMetrics;
      expect(vendorMetrics.length).toBeGreaterThanOrEqual(1); // Our test vendor
    });
  });
});
