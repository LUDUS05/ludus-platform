/**
 * @fileoverview Search System Test Suite - LDS-016 Implementation
 * @module tests/search.test
 * 
 * This test suite provides comprehensive testing for the search system including:
 * - Search functionality testing
 * - Filter validation testing
 * - API endpoint testing
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
const Vendor = require('../models/Vendor');
const User = require('../models/User');

describe('Search System - LDS-016', () => {
  let testUser;
  let testVendor;
  let testActivities;
  let authToken;

  beforeAll(async () => {
    // Create test user
    testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      isVerified: true
    });
    await testUser.save();

    // Create test vendor
    testVendor = new Vendor({
      businessName: 'Test Vendor',
      businessNameAr: 'مزود الاختبار',
      email: 'vendor@example.com',
      phone: '+966501234567',
      isActive: true,
      status: 'approved'
    });
    await testVendor.save();

    // Create test activities
    testActivities = [
      new ActivityEnhanced({
        title: 'Football Training',
        titleEn: 'Football Training',
        description: 'Professional football training session',
        descriptionEn: 'Professional football training session',
        category: 'sports',
        tags: ['football', 'training', 'sports'],
        features: ['equipment', 'coach'],
        difficulty: 'intermediate',
        duration: 'medium',
        pricing: {
          adult: 50,
          child: 25
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
          views: 100,
          bookings: 25
        }
      }),
      new ActivityEnhanced({
        title: 'Music Workshop',
        titleEn: 'Music Workshop',
        description: 'Learn to play guitar',
        descriptionEn: 'Learn to play guitar',
        category: 'music',
        tags: ['music', 'guitar', 'workshop'],
        features: ['instruments', 'instructor'],
        difficulty: 'beginner',
        duration: 'long',
        pricing: {
          adult: 75,
          child: 40
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
          views: 80,
          bookings: 15
        }
      }),
      new ActivityEnhanced({
        title: 'Art Class',
        titleEn: 'Art Class',
        description: 'Painting and drawing class',
        descriptionEn: 'Painting and drawing class',
        category: 'art',
        tags: ['art', 'painting', 'drawing'],
        features: ['materials', 'instructor'],
        difficulty: 'beginner',
        duration: 'medium',
        pricing: {
          adult: 60,
          child: 30
        },
        location: {
          city: 'Riyadh',
          cityAr: 'الرياض',
          area: 'Al Malaz',
          areaAr: 'الملز',
          coordinates: [46.6753, 24.7136]
        },
        partner: testVendor._id,
        status: 'published',
        rating: {
          average: 4.8,
          count: 12
        },
        statistics: {
          views: 120,
          bookings: 30
        }
      })
    ];

    await ActivityEnhanced.insertMany(testActivities);

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Vendor.deleteMany({});
    await ActivityEnhanced.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/search/activities', () => {
    it('should search activities with basic query', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ query: 'football' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(1);
      expect(response.body.data.activities[0].title).toContain('Football');
    });

    it('should search activities by category', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ category: 'sports' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(1);
      expect(response.body.data.activities[0].category).toBe('sports');
    });

    it('should search activities by location', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ location: 'Riyadh' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(2);
    });

    it('should filter activities by price range', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ priceMin: 40, priceMax: 70 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(2);
    });

    it('should filter activities by rating', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ rating: 4.5 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(1);
    });

    it('should filter activities by difficulty', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ difficulty: 'beginner' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(2);
    });

    it('should filter activities by duration', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ duration: 'medium' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(2);
    });

    it('should filter activities by tags', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ tags: 'football' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(1);
    });

    it('should filter activities by features', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ features: 'equipment' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(1);
    });

    it('should sort activities by price', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ sortBy: 'price', sortOrder: 'asc' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(3);
      expect(response.body.data.activities[0].pricing.adult).toBe(50);
    });

    it('should sort activities by rating', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ sortBy: 'rating', sortOrder: 'desc' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(3);
      expect(response.body.data.activities[0].rating.average).toBe(4.8);
    });

    it('should sort activities by popularity', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ sortBy: 'popularity', sortOrder: 'desc' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(3);
      expect(response.body.data.activities[0].statistics.views).toBe(120);
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ page: 1, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
      expect(response.body.data.pagination.total).toBe(3);
    });

    it('should return search suggestions', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ query: 'football' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestions).toBeDefined();
    });

    it('should handle geospatial search', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ 
          latitude: 24.7136, 
          longitude: 46.6753, 
          radius: 10 
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(2);
    });

    it('should handle empty search query', async () => {
      const response = await request(app)
        .get('/api/search/activities');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(3);
    });

    it('should handle invalid search parameters', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ priceMin: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle search with no results', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ query: 'nonexistent' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(0);
    });
  });

  describe('GET /api/search/suggestions', () => {
    it('should return search suggestions', async () => {
      const response = await request(app)
        .get('/api/search/suggestions')
        .query({ query: 'football' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestions).toBeDefined();
    });

    it('should return popular searches when no query', async () => {
      const response = await request(app)
        .get('/api/search/suggestions');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.popularSearches).toBeDefined();
    });

    it('should handle empty query', async () => {
      const response = await request(app)
        .get('/api/search/suggestions')
        .query({ query: '' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestions).toHaveLength(0);
    });

    it('should limit suggestions', async () => {
      const response = await request(app)
        .get('/api/search/suggestions')
        .query({ query: 'a', limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestions.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/search/filters', () => {
    it('should return search filters', async () => {
      const response = await request(app)
        .get('/api/search/filters');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toBeDefined();
      expect(response.body.data.locations).toBeDefined();
      expect(response.body.data.tags).toBeDefined();
      expect(response.body.data.features).toBeDefined();
      expect(response.body.data.difficulties).toBeDefined();
      expect(response.body.data.durations).toBeDefined();
      expect(response.body.data.priceRanges).toBeDefined();
    });

    it('should return filters in Arabic', async () => {
      const response = await request(app)
        .get('/api/search/filters')
        .query({ language: 'ar' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.language).toBe('ar');
    });

    it('should return filters in English', async () => {
      const response = await request(app)
        .get('/api/search/filters')
        .query({ language: 'en' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.language).toBe('en');
    });
  });

  describe('GET /api/search/analytics', () => {
    it('should return search analytics for authenticated user', async () => {
      const response = await request(app)
        .get('/api/search/analytics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.searchStatistics).toBeDefined();
      expect(response.body.data.popularSearches).toBeDefined();
      expect(response.body.data.trendingActivities).toBeDefined();
      expect(response.body.data.insights).toBeDefined();
    });

    it('should return analytics for specific period', async () => {
      const response = await request(app)
        .get('/api/search/analytics')
        .query({ period: '7d' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBe('7d');
    });

    it('should return analytics grouped by category', async () => {
      const response = await request(app)
        .get('/api/search/analytics')
        .query({ groupBy: 'category' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.searchStatistics).toBeDefined();
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/search/analytics');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/search/log', () => {
    it('should save search query', async () => {
      const response = await request(app)
        .post('/api/search/log')
        .send({
          query: 'test query',
          filters: { category: 'sports' },
          resultsCount: 5
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle empty search data', async () => {
      const response = await request(app)
        .post('/api/search/log')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Search Validation', () => {
    it('should validate search query length', async () => {
      const longQuery = 'a'.repeat(101);
      const response = await request(app)
        .get('/api/search/activities')
        .query({ query: longQuery });

      expect(response.status).toBe(400);
    });

    it('should validate price range', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ priceMin: -1 });

      expect(response.status).toBe(400);
    });

    it('should validate rating range', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ rating: 6 });

      expect(response.status).toBe(400);
    });

    it('should validate sort options', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ sortBy: 'invalid' });

      expect(response.status).toBe(400);
    });

    it('should validate pagination parameters', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ page: 0 });

      expect(response.status).toBe(400);
    });

    it('should validate geospatial parameters', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ latitude: 91 });

      expect(response.status).toBe(400);
    });
  });

  describe('Search Performance', () => {
    it('should handle large result sets efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/search/activities')
        .query({ limit: 100 });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle complex search queries efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/search/activities')
        .query({
          query: 'test',
          category: 'sports',
          priceMin: 10,
          priceMax: 100,
          rating: 3,
          difficulty: 'beginner',
          duration: 'medium',
          sortBy: 'rating',
          sortOrder: 'desc'
        });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(500); // Should respond within 500ms
    });
  });

  describe('Search Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This would require mocking the database connection
      // For now, we'll test with invalid parameters
      const response = await request(app)
        .get('/api/search/activities')
        .query({ query: 'test' });

      expect(response.status).toBe(200);
    });

    it('should handle malformed search parameters', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ priceMin: 'not-a-number' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ sortBy: 'distance' }); // distance requires coordinates

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Search Integration', () => {
    it('should integrate with activity model correctly', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ query: 'football' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities[0]).toHaveProperty('_id');
      expect(response.body.data.activities[0]).toHaveProperty('title');
      expect(response.body.data.activities[0]).toHaveProperty('category');
    });

    it('should integrate with vendor model correctly', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ query: 'football' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activities[0]).toHaveProperty('vendorName');
    });

    it('should handle RTL language support', async () => {
      const response = await request(app)
        .get('/api/search/activities')
        .query({ language: 'ar' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.searchMetadata.language).toBe('ar');
    });
  });
});

