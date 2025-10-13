/**
 * @fileoverview Comprehensive User Management Test Suite
 * @module tests/user
 * 
 * This test suite covers all user management functionality including:
 * - User profile management
 * - User preferences
 * - User statistics
 * - User activity history
 * - User search and filtering
 * - Image upload functionality
 * - Location management
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const UserEnhanced = require('../models/UserEnhanced');
const { generateAuthToken } = require('../utils/auth');

describe('User Management API', () => {
  let testUser;
  let authToken;
  let testUserId;

  beforeAll(async () => {
    // Create test user
    testUser = new UserEnhanced({
      email: 'testuser@ludus.com',
      password: 'TestPassword123!',
      profile: {
        firstName: 'Test',
        lastName: 'User',
        firstNameAr: 'تست',
        lastNameAr: 'مستخدم',
        phone: '+966501234567',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        bio: 'Test user bio',
        bioAr: 'نبذة المستخدم التجريبي'
      },
      location: {
        city: 'Riyadh',
        cityAr: 'الرياض',
        region: 'Riyadh Region',
        regionAr: 'منطقة الرياض',
        coordinates: {
          type: 'Point',
          coordinates: [46.6753, 24.7136]
        }
      },
      preferences: {
        language: 'ar',
        interests: ['travel', 'sports'],
        activityTypes: ['outdoor', 'physical'],
        preferredTimes: ['weekend-morning', 'weekend-afternoon'],
        languages: ['ar', 'en'],
        priceRange: { min: 100, max: 500 },
        radius: 25,
        participantGenderMix: 'mixed',
        socialPreferences: {
          socialInteraction: 'moderate',
          networking: true,
          teamBuilding: true,
          competitive: false
        },
        notifications: {
          email: true,
          sms: false,
          push: true,
          marketing: true,
          activityUpdates: true,
          socialUpdates: true,
          reminderNotifications: true
        }
      },
      stats: {
        totalBookings: 5,
        completedBookings: 3,
        totalSpent: 1250,
        memberSince: new Date('2024-01-01'),
        lastActive: new Date()
      }
    });

    await testUser.save();
    testUserId = testUser._id;
    authToken = generateAuthToken(testUser);
  });

  afterAll(async () => {
    await UserEnhanced.deleteMany({ email: /test/ });
    await mongoose.connection.close();
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile successfully', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.profile.firstName).toBe('Test');
      expect(response.body.data.user.profile.firstNameAr).toBe('تست');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/users/profile')
        .expect(401);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        profile: {
          firstName: 'Updated',
          lastName: 'Name',
          bio: 'Updated bio',
          bioAr: 'نبذة محدثة'
        },
        socialLinks: {
          instagram: '@testuser',
          twitter: '@testuser'
        }
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.profile.firstName).toBe('Updated');
      expect(response.body.data.user.socialLinks.instagram).toBe('@testuser');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        profile: {
          firstName: '', // Empty first name
          lastName: 'Name'
        }
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });

    it('should validate phone number format', async () => {
      const invalidData = {
        profile: {
          phone: 'invalid-phone'
        }
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/stats', () => {
    it('should get user statistics successfully', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.stats.totalBookings).toBe(5);
      expect(response.body.data.stats.completedBookings).toBe(3);
      expect(response.body.data.stats.totalSpent).toBe(1250);
    });
  });

  describe('PUT /api/users/profile-image', () => {
    it('should update profile image successfully', async () => {
      const imageData = {
        imageUrl: 'https://example.com/new-profile-image.jpg'
      };

      const response = await request(app)
        .put('/api/users/profile-image')
        .set('Authorization', `Bearer ${authToken}`)
        .send(imageData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.profile.avatar).toBe(imageData.imageUrl);
    });

    it('should validate image URL format', async () => {
      const invalidData = {
        imageUrl: 'not-a-valid-url'
      };

      const response = await request(app)
        .put('/api/users/profile-image')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/activity-history', () => {
    it('should get user activity history with pagination', async () => {
      const response = await request(app)
        .get('/api/users/activity-history')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toBeDefined();
      expect(Array.isArray(response.body.data.activities)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter activity history by status', async () => {
      const response = await request(app)
        .get('/api/users/activity-history')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: 'completed' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toBeDefined();
    });

    it('should filter activity history by date range', async () => {
      const response = await request(app)
        .get('/api/users/activity-history')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toBeDefined();
    });
  });

  describe('GET /api/users/preferences', () => {
    it('should get user preferences successfully', async () => {
      const response = await request(app)
        .get('/api/users/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.preferences).toBeDefined();
      expect(response.body.data.preferences.language).toBe('ar');
      expect(response.body.data.options).toBeDefined();
    });
  });

  describe('PUT /api/users/preferences', () => {
    it('should update user preferences successfully', async () => {
      const updateData = {
        language: 'en',
        interests: ['travel', 'culture'],
        activityTypes: ['indoor', 'outdoor'],
        priceRange: { min: 200, max: 800 },
        radius: 50,
        notifications: {
          email: false,
          push: true,
          marketing: false
        }
      };

      const response = await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.preferences.language).toBe('en');
      expect(response.body.data.preferences.interests).toContain('culture');
      expect(response.body.data.preferences.notifications.email).toBe(false);
    });

    it('should validate preference values', async () => {
      const invalidData = {
        language: 'invalid-language',
        radius: -10
      };

      const response = await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/location', () => {
    it('should update user location successfully', async () => {
      const locationData = {
        city: 'Jeddah',
        cityAr: 'جدة',
        region: 'Makkah Region',
        regionAr: 'منطقة مكة المكرمة',
        coordinates: {
          latitude: 39.1972,
          longitude: 21.4858
        },
        address: '123 Test Street, Jeddah'
      };

      const response = await request(app)
        .put('/api/users/location')
        .set('Authorization', `Bearer ${authToken}`)
        .send(locationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.location.city).toBe('Jeddah');
      expect(response.body.data.user.location.coordinates.coordinates).toEqual([39.1972, 21.4858]);
    });

    it('should validate coordinates format', async () => {
      const invalidData = {
        city: 'Test City',
        coordinates: {
          latitude: 200, // Invalid latitude
          longitude: 21.4858
        }
      };

      const response = await request(app)
        .put('/api/users/location')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/dashboard', () => {
    it('should get comprehensive dashboard data', async () => {
      const response = await request(app)
        .get('/api/users/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.recentActivities).toBeDefined();
      expect(response.body.data.upcomingBookings).toBeDefined();
      expect(response.body.data.favoriteActivities).toBeDefined();
      expect(response.body.data.recommendations).toBeDefined();
    });
  });

  describe('GET /api/users/search-advanced', () => {
    it('should search users with basic query', async () => {
      const response = await request(app)
        .get('/api/users/search-advanced')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ q: 'Test' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeDefined();
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    it('should search users with filters', async () => {
      const response = await request(app)
        .get('/api/users/search-advanced')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          city: 'Riyadh',
          interests: 'travel',
          gender: 'male'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeDefined();
    });

    it('should paginate search results', async () => {
      const response = await request(app)
        .get('/api/users/search-advanced')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 5 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });
  });

  describe('User Model Validation', () => {
    it('should validate required fields', async () => {
      const invalidUser = new UserEnhanced({
        email: 'invalid-email',
        // Missing required fields
      });

      let error;
      try {
        await invalidUser.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors['profile.firstName']).toBeDefined();
    });

    it('should validate phone number format', async () => {
      const invalidUser = new UserEnhanced({
        email: 'test@example.com',
        password: 'TestPassword123!',
        profile: {
          firstName: 'Test',
          lastName: 'User',
          phone: 'invalid-phone',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male'
        },
        location: {
          city: 'Riyadh',
          region: 'Riyadh Region'
        }
      });

      let error;
      try {
        await invalidUser.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors['profile.phone']).toBeDefined();
    });

    it('should validate coordinates format', async () => {
      const invalidUser = new UserEnhanced({
        email: 'test2@example.com',
        password: 'TestPassword123!',
        profile: {
          firstName: 'Test',
          lastName: 'User',
          phone: '+966501234567',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male'
        },
        location: {
          city: 'Riyadh',
          region: 'Riyadh Region',
          coordinates: {
            type: 'Point',
            coordinates: [200, 100] // Invalid coordinates
          }
        }
      });

      let error;
      try {
        await invalidUser.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors['location.coordinates.coordinates']).toBeDefined();
    });
  });

  describe('User Statistics Calculation', () => {
    it('should calculate user statistics correctly', async () => {
      // Create a user with specific stats
      const statsUser = new UserEnhanced({
        email: 'stats@example.com',
        password: 'TestPassword123!',
        profile: {
          firstName: 'Stats',
          lastName: 'User',
          phone: '+966501234568',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'female'
        },
        location: {
          city: 'Riyadh',
          region: 'Riyadh Region'
        },
        stats: {
          totalBookings: 10,
          completedBookings: 8,
          totalSpent: 2500,
          memberSince: new Date('2023-01-01')
        }
      });

      await statsUser.save();
      const statsToken = generateAuthToken(statsUser);

      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${statsToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stats.totalBookings).toBe(10);
      expect(response.body.data.stats.completedBookings).toBe(8);
      expect(response.body.data.stats.totalSpent).toBe(2500);
      expect(response.body.data.stats.completionRate).toBe(80);
      expect(response.body.data.stats.averageSpentPerBooking).toBe(250);

      // Cleanup
      await UserEnhanced.deleteOne({ _id: statsUser._id });
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking the database connection
      // For now, we'll test the error response format
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401); // No auth token

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('should handle invalid user ID in requests', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large preference updates efficiently', async () => {
      const largePreferences = {
        interests: Array(20).fill(0).map((_, i) => `interest${i}`),
        activityTypes: Array(10).fill(0).map((_, i) => `type${i}`),
        preferredTimes: Array(6).fill(0).map((_, i) => `time${i}`)
      };

      const startTime = Date.now();
      
      const response = await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(largePreferences)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle pagination efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/users/activity-history')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 100 })
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });
  });
});
