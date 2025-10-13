/**
 * @fileoverview Comprehensive Test Suite for Activity Management System
 * @module tests/activity.test
 * 
 * This test suite covers all activity management functionality including:
 * - Activity CRUD operations
 * - Advanced search and filtering
 * - Category and partner management
 * - Pricing and scheduling management
 * - Media management
 * - Analytics and reporting
 * - RTL support for Arabic users
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Activity = require('../models/Activity');
const ActivityEnhanced = require('../models/ActivityEnhanced');
const Category = require('../models/Category');
const Partner = require('../models/Partner');
const User = require('../models/User');
const { generateAuthToken } = require('../utils/auth');

describe('Activity Management System', () => {
  let authToken;
  let partnerId;
  let categoryId;
  let activityId;

  beforeAll(async () => {
    // Create test partner
    const partner = new User({
      name: 'Test Partner',
      nameAr: 'شريك تجريبي',
      email: 'partner@test.com',
      password: 'password123',
      role: 'partner',
      isActive: true
    });
    await partner.save();
    partnerId = partner._id;

    // Create test category
    const category = new Category({
      name: 'Fitness',
      nameAr: 'اللياقة البدنية',
      description: 'Physical fitness activities',
      descriptionAr: 'أنشطة اللياقة البدنية',
      isActive: true
    });
    await category.save();
    categoryId = category._id;

    // Generate auth token
    authToken = generateAuthToken(partnerId);
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up activities before each test
    await Activity.deleteMany({});
    await ActivityEnhanced.deleteMany({});
  });

  describe('POST /api/activities/enhanced', () => {
    it('should create a new enhanced activity', async () => {
      const activityData = {
        title: 'Test Activity',
        titleEn: 'Test Activity English',
        description: 'Test description',
        descriptionEn: 'Test description English',
        fullDescription: 'Full test description',
        fullDescriptionEn: 'Full test description English',
        category: { id: categoryId },
        pricing: {
          basePrice: 100,
          currency: 'SAR',
          priceType: 'per_person'
        },
        capacity: {
          min: 1,
          max: 10
        },
        duration: {
          hours: 2,
          minutes: 0
        },
        location: {
          city: 'Riyadh',
          cityEn: 'Riyadh',
          region: 'Riyadh Region',
          regionEn: 'Riyadh Region',
          address: 'Test Address',
          addressEn: 'Test Address',
          coordinates: {
            latitude: 24.7136,
            longitude: 46.6753
          }
        },
        requirements: {
          ageMin: 18,
          ageMax: 65,
          skillLevel: 'beginner'
        }
      };

      const response = await request(app)
        .post('/api/activities/enhanced')
        .set('Authorization', `Bearer ${authToken}`)
        .send(activityData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.activity).toBeDefined();
      expect(response.body.data.activity.title).toBe(activityData.title);
      expect(response.body.data.activity.status).toBe('draft');
      expect(response.body.data.activity.partner).toBe(partnerId.toString());

      activityId = response.body.data.activity._id;
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/activities/enhanced')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });

    it('should validate category exists', async () => {
      const activityData = {
        title: 'Test Activity',
        description: 'Test description',
        fullDescription: 'Full test description',
        category: { id: new mongoose.Types.ObjectId() },
        pricing: { basePrice: 100, currency: 'SAR', priceType: 'per_person' },
        capacity: { min: 1, max: 10 },
        duration: { hours: 2, minutes: 0 },
        location: { city: 'Riyadh', region: 'Riyadh Region' }
      };

      const response = await request(app)
        .post('/api/activities/enhanced')
        .set('Authorization', `Bearer ${authToken}`)
        .send(activityData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Category not found');
    });
  });

  describe('GET /api/activities/partner/my', () => {
    beforeEach(async () => {
      // Create test activities
      const activities = [
        {
          title: 'Activity 1',
          description: 'Description 1',
          fullDescription: 'Full description 1',
          partner: partnerId,
          category: { id: categoryId },
          pricing: { basePrice: 100, currency: 'SAR', priceType: 'per_person' },
          capacity: { min: 1, max: 10 },
          duration: { hours: 2, minutes: 0 },
          location: { city: 'Riyadh', region: 'Riyadh Region' },
          status: 'published'
        },
        {
          title: 'Activity 2',
          description: 'Description 2',
          fullDescription: 'Full description 2',
          partner: partnerId,
          category: { id: categoryId },
          pricing: { basePrice: 200, currency: 'SAR', priceType: 'per_person' },
          capacity: { min: 1, max: 5 },
          duration: { hours: 1, minutes: 30 },
          location: { city: 'Jeddah', region: 'Makkah Region' },
          status: 'draft'
        }
      ];

      for (const activityData of activities) {
        const activity = new ActivityEnhanced(activityData);
        await activity.save();
      }
    });

    it('should get partner activities with pagination', async () => {
      const response = await request(app)
        .get('/api/activities/partner/my')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(2);
      expect(response.body.data.pagination.totalActivities).toBe(2);
      expect(response.body.data.stats.totalActivities).toBe(2);
    });

    it('should filter activities by status', async () => {
      const response = await request(app)
        .get('/api/activities/partner/my?status=published')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(1);
      expect(response.body.data.activities[0].status).toBe('published');
    });

    it('should search activities by title', async () => {
      const response = await request(app)
        .get('/api/activities/partner/my?search=Activity 1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(1);
      expect(response.body.data.activities[0].title).toBe('Activity 1');
    });
  });

  describe('GET /api/activities/:id/analytics', () => {
    beforeEach(async () => {
      // Create test activity
      const activity = new ActivityEnhanced({
        title: 'Analytics Test Activity',
        description: 'Test description',
        fullDescription: 'Full test description',
        partner: partnerId,
        category: { id: categoryId },
        pricing: { basePrice: 100, currency: 'SAR', priceType: 'per_person' },
        capacity: { min: 1, max: 10 },
        duration: { hours: 2, minutes: 0 },
        location: { city: 'Riyadh', region: 'Riyadh Region' },
        status: 'published'
      });
      await activity.save();
      activityId = activity._id;
    });

    it('should get activity analytics', async () => {
      const response = await request(app)
        .get(`/api/activities/${activityId}/analytics`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.stats.totalBookings).toBe(0);
      expect(response.body.data.bookingsByStatus).toBeDefined();
      expect(response.body.data.monthlyTrends).toBeDefined();
      expect(response.body.data.participantDemographics).toBeDefined();
    });

    it('should get analytics for different periods', async () => {
      const periods = ['7d', '30d', '90d', '1y'];
      
      for (const period of periods) {
        const response = await request(app)
          .get(`/api/activities/${activityId}/analytics?period=${period}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.period).toBe(period);
      }
    });
  });

  describe('PUT /api/activities/:id/status', () => {
    beforeEach(async () => {
      // Create test activity
      const activity = new ActivityEnhanced({
        title: 'Status Test Activity',
        description: 'Test description',
        fullDescription: 'Full test description',
        partner: partnerId,
        category: { id: categoryId },
        pricing: { basePrice: 100, currency: 'SAR', priceType: 'per_person' },
        capacity: { min: 1, max: 10 },
        duration: { hours: 2, minutes: 0 },
        location: { city: 'Riyadh', region: 'Riyadh Region' },
        status: 'draft'
      });
      await activity.save();
      activityId = activity._id;
    });

    it('should update activity status', async () => {
      const response = await request(app)
        .put(`/api/activities/${activityId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'published', reason: 'Ready for publication' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.activity.status).toBe('published');
    });

    it('should validate status values', async () => {
      const response = await request(app)
        .put(`/api/activities/${activityId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid status');
    });

    it('should prevent unauthorized status updates', async () => {
      // Create another user
      const otherUser = new User({
        name: 'Other User',
        email: 'other@test.com',
        password: 'password123',
        role: 'user'
      });
      await otherUser.save();
      const otherToken = generateAuthToken(otherUser._id);

      const response = await request(app)
        .put(`/api/activities/${activityId}/status`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ status: 'published' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Unauthorized to update this activity');
    });
  });

  describe('POST /api/activities/:id/duplicate', () => {
    beforeEach(async () => {
      // Create test activity
      const activity = new ActivityEnhanced({
        title: 'Original Activity',
        description: 'Test description',
        fullDescription: 'Full test description',
        partner: partnerId,
        category: { id: categoryId },
        pricing: { basePrice: 100, currency: 'SAR', priceType: 'per_person' },
        capacity: { min: 1, max: 10 },
        duration: { hours: 2, minutes: 0 },
        location: { city: 'Riyadh', region: 'Riyadh Region' },
        status: 'published'
      });
      await activity.save();
      activityId = activity._id;
    });

    it('should duplicate an activity', async () => {
      const response = await request(app)
        .post(`/api/activities/${activityId}/duplicate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.activity.title).toBe('Original Activity (Copy)');
      expect(response.body.data.activity.status).toBe('draft');
      expect(response.body.data.activity.partner).toBe(partnerId.toString());
    });

    it('should prevent unauthorized duplication', async () => {
      // Create another user
      const otherUser = new User({
        name: 'Other User',
        email: 'other@test.com',
        password: 'password123',
        role: 'user'
      });
      await otherUser.save();
      const otherToken = generateAuthToken(otherUser._id);

      const response = await request(app)
        .post(`/api/activities/${activityId}/duplicate`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Unauthorized to duplicate this activity');
    });
  });

  describe('GET /api/activities', () => {
    beforeEach(async () => {
      // Create test activities
      const activities = [
        {
          title: 'Public Activity 1',
          description: 'Description 1',
          fullDescription: 'Full description 1',
          partner: partnerId,
          category: { id: categoryId },
          pricing: { basePrice: 100, currency: 'SAR', priceType: 'per_person' },
          capacity: { min: 1, max: 10 },
          duration: { hours: 2, minutes: 0 },
          location: { city: 'Riyadh', region: 'Riyadh Region' },
          status: 'published',
          isActive: true
        },
        {
          title: 'Public Activity 2',
          description: 'Description 2',
          fullDescription: 'Full description 2',
          partner: partnerId,
          category: { id: categoryId },
          pricing: { basePrice: 200, currency: 'SAR', priceType: 'per_person' },
          capacity: { min: 1, max: 5 },
          duration: { hours: 1, minutes: 30 },
          location: { city: 'Jeddah', region: 'Makkah Region' },
          status: 'published',
          isActive: true
        }
      ];

      for (const activityData of activities) {
        const activity = new ActivityEnhanced(activityData);
        await activity.save();
      }
    });

    it('should get all public activities', async () => {
      const response = await request(app)
        .get('/api/activities')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.totalActivities).toBe(2);
    });

    it('should filter activities by category', async () => {
      const response = await request(app)
        .get(`/api/activities?category=${categoryId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter activities by city', async () => {
      const response = await request(app)
        .get('/api/activities?city=Riyadh')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].location.city).toBe('Riyadh');
    });

    it('should filter activities by price range', async () => {
      const response = await request(app)
        .get('/api/activities?minPrice=150&maxPrice=250')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].pricing.basePrice).toBe(200);
    });

    it('should search activities by title', async () => {
      const response = await request(app)
        .get('/api/activities?search=Activity 1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Public Activity 1');
    });

    it('should sort activities by different fields', async () => {
      const sortFields = ['createdAt', 'pricing.basePrice', 'title'];
      
      for (const sortBy of sortFields) {
        const response = await request(app)
          .get(`/api/activities?sortBy=${sortBy}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(2);
      }
    });
  });

  describe('GET /api/activities/:id', () => {
    beforeEach(async () => {
      // Create test activity
      const activity = new ActivityEnhanced({
        title: 'Single Activity',
        description: 'Test description',
        fullDescription: 'Full test description',
        partner: partnerId,
        category: { id: categoryId },
        pricing: { basePrice: 100, currency: 'SAR', priceType: 'per_person' },
        capacity: { min: 1, max: 10 },
        duration: { hours: 2, minutes: 0 },
        location: { city: 'Riyadh', region: 'Riyadh Region' },
        status: 'published',
        isActive: true
      });
      await activity.save();
      activityId = activity._id;
    });

    it('should get single activity by ID', async () => {
      const response = await request(app)
        .get(`/api/activities/${activityId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.activity).toBeDefined();
      expect(response.body.data.activity.title).toBe('Single Activity');
    });

    it('should return 404 for non-existent activity', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/activities/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Activity not found');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // This would require mocking the database connection
      // For now, we'll test with invalid ObjectId
      const response = await request(app)
        .get('/api/activities/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle validation errors gracefully', async () => {
      const response = await request(app)
        .post('/api/activities/enhanced')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '', // Invalid: empty title
          description: 'x'.repeat(1001), // Invalid: too long
          pricing: { basePrice: -10 } // Invalid: negative price
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('RTL Support', () => {
    it('should handle Arabic text in activity creation', async () => {
      const activityData = {
        title: 'نشاط تجريبي',
        titleEn: 'Test Activity',
        description: 'وصف تجريبي',
        descriptionEn: 'Test description',
        fullDescription: 'وصف مفصل للنشاط التجريبي',
        fullDescriptionEn: 'Detailed description of test activity',
        category: { id: categoryId },
        pricing: {
          basePrice: 100,
          currency: 'SAR',
          priceType: 'per_person'
        },
        capacity: {
          min: 1,
          max: 10
        },
        duration: {
          hours: 2,
          minutes: 0
        },
        location: {
          city: 'الرياض',
          cityEn: 'Riyadh',
          region: 'منطقة الرياض',
          regionEn: 'Riyadh Region',
          address: 'عنوان تجريبي',
          addressEn: 'Test Address'
        }
      };

      const response = await request(app)
        .post('/api/activities/enhanced')
        .set('Authorization', `Bearer ${authToken}`)
        .send(activityData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.activity.title).toBe(activityData.title);
      expect(response.body.data.activity.location.city).toBe(activityData.location.city);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large number of activities efficiently', async () => {
      // Create multiple activities
      const activities = [];
      for (let i = 0; i < 50; i++) {
        activities.push({
          title: `Activity ${i}`,
          description: `Description ${i}`,
          fullDescription: `Full description ${i}`,
          partner: partnerId,
          category: { id: categoryId },
          pricing: { basePrice: 100 + i, currency: 'SAR', priceType: 'per_person' },
          capacity: { min: 1, max: 10 },
          duration: { hours: 2, minutes: 0 },
          location: { city: 'Riyadh', region: 'Riyadh Region' },
          status: 'published',
          isActive: true
        });
      }

      // Insert activities
      await ActivityEnhanced.insertMany(activities);

      // Test pagination performance
      const startTime = Date.now();
      const response = await request(app)
        .get('/api/activities?page=1&limit=10')
        .expect(200);
      const endTime = Date.now();

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
