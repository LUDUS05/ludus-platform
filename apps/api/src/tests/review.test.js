/**
 * @fileoverview Review System Test Suite for LUDUS Platform - LDS-015 Implementation
 * @module tests/review.test
 * 
 * This test suite provides comprehensive testing for the review system including:
 * - Review CRUD operations
 * - Review validation and business logic
 * - Partner response management
 * - Review analytics and reporting
 * - Helpful votes and social features
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const ReviewEnhanced = require('../models/ReviewEnhanced');
const ActivityEnhanced = require('../models/ActivityEnhanced');
const BookingEnhanced = require('../models/BookingEnhanced');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

describe('Review System API Tests', () => {
  let authToken;
  let userId;
  let activityId;
  let bookingId;
  let vendorId;
  let reviewId;

  beforeAll(async () => {
    // Create test user
    const user = new User({
      name: 'Test User',
      nameAr: 'مستخدم تجريبي',
      email: 'testuser@example.com',
      password: 'password123',
      phone: '+966501234567',
      role: 'user'
    });
    await user.save();
    userId = user._id;

    // Create test vendor
    const vendor = new Vendor({
      businessName: 'Test Vendor',
      businessNameAr: 'بائع تجريبي',
      email: 'vendor@example.com',
      phone: '+966501234568',
      createdBy: userId,
      statusHistory: [{ status: 'active', timestamp: new Date() }]
    });
    await vendor.save();
    vendorId = vendor._id;

    // Create test activity
    const activity = new ActivityEnhanced({
      title: 'Test Activity',
      titleEn: 'Test Activity',
      description: 'Test activity description',
      partner: vendorId,
      status: 'published',
      pricing: {
        adult: 100,
        child: 50,
        senior: 80
      }
    });
    await activity.save();
    activityId = activity._id;

    // Create test booking
    const booking = new BookingEnhanced({
      user: userId,
      activity: {
        id: activityId,
        title: 'Test Activity'
      },
      vendor: {
        id: vendorId,
        businessName: 'Test Vendor'
      },
      schedule: {
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        timeSlot: '10:00'
      },
      participants: [{
        type: 'adult',
        name: 'Test Participant',
        age: 25,
        idNumber: '1234567890'
      }],
      contactInfo: {
        phone: '+966501234567',
        email: 'testuser@example.com',
        emergencyContact: {
          name: 'Emergency Contact',
          phone: '+966501234569',
          relationship: 'Friend'
        }
      },
      pricing: {
        adult: 100,
        total: 100
      },
      status: 'completed',
      bookingNumber: 'LDS-TEST-001'
    });
    await booking.save();
    bookingId = booking._id;

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    // Clean up test data
    await ReviewEnhanced.deleteMany({});
    await ActivityEnhanced.deleteMany({});
    await BookingEnhanced.deleteMany({});
    await Vendor.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/reviews', () => {
    it('should create a new review successfully', async () => {
      const reviewData = {
        activityId,
        bookingId,
        rating: {
          overall: 5,
          value: 4,
          service: 5,
          location: 4,
          communication: 5
        },
        comment: 'Great activity! Highly recommended.',
        commentAr: 'نشاط رائع! أنصح به بشدة.',
        images: [{
          url: 'https://example.com/image1.jpg',
          caption: 'Activity photo',
          captionAr: 'صورة النشاط'
        }]
      };

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.rating.overall).toBe(5);
      expect(response.body.data.comment).toBe('Great activity! Highly recommended.');
      expect(response.body.data.isVerified).toBe(true);
      expect(response.body.data.status).toBe('approved');

      reviewId = response.body.data._id;
    });

    it('should fail to create review without required fields', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should fail to create review with invalid rating', async () => {
      const reviewData = {
        activityId,
        bookingId,
        rating: {
          overall: 6 // Invalid rating
        }
      };

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail to create duplicate review for same activity', async () => {
      const reviewData = {
        activityId,
        bookingId,
        rating: {
          overall: 4
        }
      };

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already reviewed');
    });
  });

  describe('GET /api/reviews/activity/:activityId', () => {
    it('should get reviews for an activity', async () => {
      const response = await request(app)
        .get(`/api/reviews/activity/${activityId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('reviews');
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data).toHaveProperty('statistics');
      expect(response.body.data.reviews).toHaveLength(1);
      expect(response.body.data.statistics.totalReviews).toBe(1);
    });

    it('should filter reviews by rating', async () => {
      const response = await request(app)
        .get(`/api/reviews/activity/${activityId}?rating=5`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toHaveLength(1);
    });

    it('should filter reviews by verified status', async () => {
      const response = await request(app)
        .get(`/api/reviews/activity/${activityId}?verified=true`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toHaveLength(1);
    });
  });

  describe('GET /api/reviews/user', () => {
    it('should get user reviews', async () => {
      const response = await request(app)
        .get('/api/reviews/user')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('reviews');
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.reviews).toHaveLength(1);
    });
  });

  describe('PUT /api/reviews/:reviewId', () => {
    it('should update a review successfully', async () => {
      const updateData = {
        rating: {
          overall: 4,
          value: 4,
          service: 4,
          location: 4,
          communication: 4
        },
        comment: 'Updated review comment'
      };

      const response = await request(app)
        .put(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.rating.overall).toBe(4);
      expect(response.body.data.comment).toBe('Updated review comment');
    });

    it('should fail to update review by different user', async () => {
      // Create another user
      const anotherUser = new User({
        name: 'Another User',
        email: 'another@example.com',
        password: 'password123',
        phone: '+966501234570',
        role: 'user'
      });
      await anotherUser.save();

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'another@example.com',
          password: 'password123'
        });

      const anotherAuthToken = loginResponse.body.data.accessToken;

      const updateData = {
        comment: 'Unauthorized update'
      };

      const response = await request(app)
        .put(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${anotherAuthToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('own reviews');

      // Clean up
      await User.findByIdAndDelete(anotherUser._id);
    });
  });

  describe('POST /api/reviews/:reviewId/helpful', () => {
    it('should add helpful vote to review', async () => {
      const response = await request(app)
        .post(`/api/reviews/${reviewId}/helpful`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.helpfulCount).toBe(1);
    });

    it('should not add duplicate helpful vote', async () => {
      const response = await request(app)
        .post(`/api/reviews/${reviewId}/helpful`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.helpfulCount).toBe(1); // Should remain 1
    });
  });

  describe('DELETE /api/reviews/:reviewId/helpful', () => {
    it('should remove helpful vote from review', async () => {
      const response = await request(app)
        .delete(`/api/reviews/${reviewId}/helpful`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.helpfulCount).toBe(0);
    });
  });

  describe('POST /api/reviews/:reviewId/response', () => {
    it('should add partner response to review', async () => {
      // Login as vendor
      const vendorLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'vendor@example.com',
          password: 'password123'
        });

      const vendorAuthToken = vendorLoginResponse.body.data.accessToken;

      const responseData = {
        comment: 'Thank you for your review!',
        commentAr: 'شكراً لك على تقييمك!'
      };

      const response = await request(app)
        .post(`/api/reviews/${reviewId}/response`)
        .set('Authorization', `Bearer ${vendorAuthToken}`)
        .send(responseData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.response.comment).toBe('Thank you for your review!');
    });

    it('should fail to add response by non-partner', async () => {
      const responseData = {
        comment: 'Unauthorized response'
      };

      const response = await request(app)
        .post(`/api/reviews/${reviewId}/response`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(responseData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('only respond to reviews for your activities');
    });
  });

  describe('GET /api/reviews/analytics', () => {
    it('should get review analytics', async () => {
      const response = await request(app)
        .get('/api/reviews/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('statistics');
      expect(response.body.data).toHaveProperty('ratingDistribution');
      expect(response.body.data).toHaveProperty('categoryRatings');
      expect(response.body.data.statistics.totalReviews).toBe(1);
    });
  });

  describe('Admin Routes', () => {
    let adminToken;

    beforeAll(async () => {
      // Create admin user
      const admin = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        phone: '+966501234571',
        role: 'admin'
      });
      await admin.save();

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123'
        });

      adminToken = loginResponse.body.data.accessToken;
    });

    describe('GET /api/reviews/pending', () => {
      it('should get pending reviews for moderation', async () => {
        const response = await request(app)
          .get('/api/reviews/pending')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('reviews');
        expect(response.body.data).toHaveProperty('pagination');
      });
    });

    describe('PUT /api/reviews/:reviewId/moderate', () => {
      it('should moderate a review', async () => {
        const moderationData = {
          status: 'rejected',
          notes: 'Inappropriate content'
        };

        const response = await request(app)
          .put(`/api/reviews/${reviewId}/moderate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(moderationData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('rejected successfully');
      });
    });
  });

  describe('DELETE /api/reviews/:reviewId', () => {
    it('should delete a review successfully', async () => {
      const response = await request(app)
        .delete(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
    });

    it('should fail to delete non-existent review', async () => {
      const fakeReviewId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/reviews/${fakeReviewId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid review ID format', async () => {
      const response = await request(app)
        .get('/api/reviews/activity/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/api/reviews/user')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Performance Tests', () => {
    it('should handle multiple concurrent review creation', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        const reviewData = {
          activityId,
          bookingId: new mongoose.Types.ObjectId(), // Different booking ID
          rating: {
            overall: Math.floor(Math.random() * 5) + 1
          },
          comment: `Test review ${i}`
        };
        
        promises.push(
          request(app)
            .post('/api/reviews')
            .set('Authorization', `Bearer ${authToken}`)
            .send(reviewData)
        );
      }

      const responses = await Promise.all(promises);
      const successfulResponses = responses.filter(r => r.status === 201);
      
      // At least some should succeed (depending on duplicate handling)
      expect(successfulResponses.length).toBeGreaterThan(0);
    });
  });
});
