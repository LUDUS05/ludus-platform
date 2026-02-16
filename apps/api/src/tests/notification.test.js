/**
 * @fileoverview Comprehensive test suite for notification system
 * 
 * This test suite covers all notification functionality including
 * CRUD operations, analytics, preferences, and delivery management
 * with RTL support testing for the Saudi Arabian market.
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Notification = require('../models/Notification');
const NotificationEnhanced = require('../models/NotificationEnhanced');
const User = require('../models/User');

describe('Notification System Tests', () => {
  let testUser;
  let testAdmin;
  let authToken;
  let adminToken;

  beforeAll(async () => {
    // Create test user
    testUser = new User({
      firstName: 'Ahmed',
      lastName: 'Al-Rashid',
      email: 'ahmed@test.com',
      password: 'TestPassword123!',
      role: 'user',
      notificationPreferences: {
        email: { booking: true, payment: true, promotion: false, system: true },
        sms: { booking: false, payment: true, promotion: false, system: false },
        push: { booking: true, payment: true, promotion: true, system: true },
        frequency: 'immediate',
        quietHours: { enabled: false, start: '22:00', end: '08:00' }
      }
    });
    await testUser.save();

    // Create test admin
    testAdmin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: 'AdminPassword123!',
      role: 'admin'
    });
    await testAdmin.save();

    // Get auth tokens
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ahmed@test.com', password: 'TestPassword123!' });
    authToken = userLogin.body.data.token;

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'AdminPassword123!' });
    adminToken = adminLogin.body.data.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Notification.deleteMany({});
    await NotificationEnhanced.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up notifications before each test
    await Notification.deleteMany({});
    await NotificationEnhanced.deleteMany({});
  });

  describe('Basic Notification Operations', () => {
    test('should get notifications for authenticated user', async () => {
      // Create test notification
      const notification = new Notification({
        userId: testUser._id,
        type: 'booking_confirmed',
        title: 'Booking Confirmed',
        content: 'Your booking has been confirmed',
        priority: 'normal'
      });
      await notification.save();

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications).toHaveLength(1);
      expect(response.body.data.notifications[0].title).toBe('Booking Confirmed');
    });

    test('should get unread count', async () => {
      // Create unread notifications
      const notifications = [
        {
          userId: testUser._id,
          type: 'booking_confirmed',
          title: 'Booking 1',
          content: 'Content 1',
          status: 'unread'
        },
        {
          userId: testUser._id,
          type: 'payment_success',
          title: 'Payment 1',
          content: 'Content 2',
          status: 'unread'
        }
      ];
      await Notification.insertMany(notifications);

      const response = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.unreadCount).toBe(2);
    });

    test('should mark notification as read', async () => {
      const notification = new Notification({
        userId: testUser._id,
        type: 'booking_confirmed',
        title: 'Test Notification',
        content: 'Test content',
        status: 'unread'
      });
      await notification.save();

      const response = await request(app)
        .put(`/api/notifications/${notification._id}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Notification marked as read');

      // Verify notification is marked as read
      const updatedNotification = await Notification.findById(notification._id);
      expect(updatedNotification.status).toBe('read');
      expect(updatedNotification.readAt).toBeDefined();
    });

    test('should mark all notifications as read', async () => {
      // Create multiple unread notifications
      const notifications = [
        {
          userId: testUser._id,
          type: 'booking_confirmed',
          title: 'Booking 1',
          content: 'Content 1',
          status: 'unread'
        },
        {
          userId: testUser._id,
          type: 'payment_success',
          title: 'Payment 1',
          content: 'Content 2',
          status: 'unread'
        }
      ];
      await Notification.insertMany(notifications);

      const response = await request(app)
        .put('/api/notifications/mark-all-read')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.modifiedCount).toBe(2);

      // Verify all notifications are marked as read
      const updatedNotifications = await Notification.find({ userId: testUser._id });
      updatedNotifications.forEach(notif => {
        expect(notif.status).toBe('read');
      });
    });

    test('should delete notification', async () => {
      const notification = new Notification({
        userId: testUser._id,
        type: 'booking_confirmed',
        title: 'Test Notification',
        content: 'Test content'
      });
      await notification.save();

      const response = await request(app)
        .delete(`/api/notifications/${notification._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Notification deleted successfully');

      // Verify notification is deleted
      const deletedNotification = await Notification.findById(notification._id);
      expect(deletedNotification).toBeNull();
    });
  });

  describe('Enhanced Notification Operations', () => {
    test('should create enhanced notification', async () => {
      const notificationData = {
        user: testUser._id,
        type: 'booking_confirmed',
        title: 'Enhanced Notification',
        titleAr: 'إشعار محسن',
        message: 'Your booking has been confirmed',
        messageAr: 'تم تأكيد حجزك',
        priority: 'high',
        isUrgent: false,
        channels: { email: true, sms: false, push: true },
        data: { bookingId: '123', amount: 150 }
      };

      const response = await request(app)
        .post('/api/notifications/enhanced')
        .set('Authorization', `Bearer ${authToken}`)
        .send(notificationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Enhanced Notification');
      expect(response.body.data.titleAr).toBe('إشعار محسن');
      expect(response.body.data.priority).toBe('high');
    });

    test('should get notification analytics', async () => {
      // Create test notifications
      const notifications = [
        {
          user: testUser._id,
          type: 'booking_confirmed',
          title: 'Booking 1',
          message: 'Content 1',
          priority: 'high',
          isRead: false,
          channels: { email: { sent: true }, sms: { sent: false }, push: { sent: true } }
        },
        {
          user: testUser._id,
          type: 'payment_success',
          title: 'Payment 1',
          message: 'Content 2',
          priority: 'normal',
          isRead: true,
          channels: { email: { sent: true }, sms: { sent: true }, push: { sent: false } }
        }
      ];
      await NotificationEnhanced.insertMany(notifications);

      const response = await request(app)
        .get('/api/notifications/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ period: '30d', groupBy: 'type' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.analytics).toHaveLength(2);
      expect(response.body.data.channelAnalytics).toBeDefined();
    });

    test('should update delivery status', async () => {
      const notification = new NotificationEnhanced({
        user: testUser._id,
        type: 'booking_confirmed',
        title: 'Test Notification',
        message: 'Test content',
        channels: { email: { sent: false }, sms: { sent: false }, push: { sent: false } }
      });
      await notification.save();

      const response = await request(app)
        .put(`/api/notifications/${notification._id}/delivery`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ channel: 'email', sent: true })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify delivery status is updated
      const updatedNotification = await NotificationEnhanced.findById(notification._id);
      expect(updatedNotification.channels.email.sent).toBe(true);
      expect(updatedNotification.channels.email.sentAt).toBeDefined();
    });
  });

  describe('Notification Preferences', () => {
    test('should get notification preferences', async () => {
      const response = await request(app)
        .get('/api/notifications/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.preferences).toBeDefined();
      expect(response.body.data.preferences.email).toBeDefined();
      expect(response.body.data.preferences.sms).toBeDefined();
      expect(response.body.data.preferences.push).toBeDefined();
    });

    test('should update notification preferences', async () => {
      const newPreferences = {
        email: { booking: true, payment: false, promotion: true, system: true },
        sms: { booking: true, payment: true, promotion: false, system: false },
        push: { booking: true, payment: true, promotion: true, system: true },
        frequency: 'hourly',
        quietHours: { enabled: true, start: '23:00', end: '07:00' }
      };

      const response = await request(app)
        .put('/api/notifications/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ preferences: newPreferences })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.preferences.frequency).toBe('hourly');
      expect(response.body.data.preferences.quietHours.enabled).toBe(true);

      // Verify preferences are saved
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.notificationPreferences.frequency).toBe('hourly');
    });
  });

  describe('Admin Operations', () => {
    test('should create system notification (admin only)', async () => {
      const systemNotification = {
        title: 'System Announcement',
        content: 'Important system update',
        priority: 'high',
        category: 'system',
        targetUsers: 'all'
      };

      const response = await request(app)
        .post('/api/notifications/system')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(systemNotification)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notificationsCreated).toBeGreaterThan(0);
    });

    test('should create bulk notifications (admin only)', async () => {
      const bulkData = {
        userIds: [testUser._id],
        type: 'system_announcement',
        title: 'Bulk Notification',
        message: 'This is a bulk notification',
        priority: 'normal',
        channels: { email: true, sms: false, push: true }
      };

      const response = await request(app)
        .post('/api/notifications/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bulkData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notificationsCreated).toBe(1);
    });

    test('should reject system notification creation for non-admin', async () => {
      const systemNotification = {
        title: 'System Announcement',
        content: 'Important system update',
        priority: 'high',
        category: 'system',
        targetUsers: 'all'
      };

      const response = await request(app)
        .post('/api/notifications/system')
        .set('Authorization', `Bearer ${authToken}`)
        .send(systemNotification)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. Admin only.');
    });
  });

  describe('RTL Support and Arabic Content', () => {
    test('should handle Arabic notification content', async () => {
      const notificationData = {
        user: testUser._id,
        type: 'booking_confirmed',
        title: 'Booking Confirmed',
        titleAr: 'تم تأكيد الحجز',
        message: 'Your booking has been confirmed',
        messageAr: 'تم تأكيد حجزك بنجاح',
        priority: 'normal',
        metadata: { language: 'ar' }
      };

      const response = await request(app)
        .post('/api/notifications/enhanced')
        .set('Authorization', `Bearer ${authToken}`)
        .send(notificationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.titleAr).toBe('تم تأكيد الحجز');
      expect(response.body.data.messageAr).toBe('تم تأكيد حجزك بنجاح');
    });

    test('should get display title and message based on language', async () => {
      const notification = new NotificationEnhanced({
        user: testUser._id,
        type: 'booking_confirmed',
        title: 'Booking Confirmed',
        titleAr: 'تم تأكيد الحجز',
        message: 'Your booking has been confirmed',
        messageAr: 'تم تأكيد حجزك بنجاح',
        metadata: { language: 'ar' }
      });
      await notification.save();

      // Test Arabic display
      const arabicTitle = notification.getDisplayTitle('ar');
      const arabicMessage = notification.getDisplayMessage('ar');
      expect(arabicTitle).toBe('تم تأكيد الحجز');
      expect(arabicMessage).toBe('تم تأكيد حجزك بنجاح');

      // Test English display
      const englishTitle = notification.getDisplayTitle('en');
      const englishMessage = notification.getDisplayMessage('en');
      expect(englishTitle).toBe('Booking Confirmed');
      expect(englishMessage).toBe('Your booking has been confirmed');
    });
  });

  describe('Validation and Error Handling', () => {
    test('should validate enhanced notification data', async () => {
      const invalidData = {
        user: 'invalid-id',
        type: 'invalid_type',
        title: '',
        message: 'x'.repeat(600) // Too long
      };

      const response = await request(app)
        .post('/api/notifications/enhanced')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should validate bulk notification data', async () => {
      const invalidBulkData = {
        userIds: [], // Empty array
        type: 'invalid_type',
        title: '',
        message: ''
      };

      const response = await request(app)
        .post('/api/notifications/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidBulkData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should handle non-existent notification', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/notifications/${fakeId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Notification not found');
    });

    test('should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle large number of notifications efficiently', async () => {
      // Create 100 notifications
      const notifications = Array.from({ length: 100 }, (_, i) => ({
        userId: testUser._id,
        type: 'booking_confirmed',
        title: `Notification ${i}`,
        content: `Content ${i}`,
        priority: 'normal'
      }));
      await Notification.insertMany(notifications);

      const startTime = Date.now();
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 20 })
        .expect(200);
      const endTime = Date.now();

      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications).toHaveLength(20);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });

    test('should handle analytics aggregation efficiently', async () => {
      // Create test data
      const notifications = Array.from({ length: 50 }, (_, i) => ({
        user: testUser._id,
        type: i % 2 === 0 ? 'booking_confirmed' : 'payment_success',
        title: `Notification ${i}`,
        message: `Content ${i}`,
        priority: i % 3 === 0 ? 'high' : 'normal',
        isRead: i % 4 === 0,
        channels: { email: { sent: true }, sms: { sent: false }, push: { sent: true } }
      }));
      await NotificationEnhanced.insertMany(notifications);

      const startTime = Date.now();
      const response = await request(app)
        .get('/api/notifications/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ period: '30d', groupBy: 'type' })
        .expect(200);
      const endTime = Date.now();

      expect(response.body.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete in less than 2 seconds
    });
  });

  describe('Notification Statistics', () => {
    test('should get notification statistics', async () => {
      // Create test notifications
      const notifications = [
        {
          userId: testUser._id,
          type: 'booking_confirmed',
          title: 'Booking 1',
          content: 'Content 1',
          status: 'unread',
          priority: 'high'
        },
        {
          userId: testUser._id,
          type: 'payment_success',
          title: 'Payment 1',
          content: 'Content 2',
          status: 'read',
          priority: 'normal'
        },
        {
          userId: testUser._id,
          type: 'system_announcement',
          title: 'System 1',
          content: 'Content 3',
          status: 'archived',
          priority: 'low'
        }
      ];
      await Notification.insertMany(notifications);

      const response = await request(app)
        .get('/api/notifications/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ period: '30d' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overview.total).toBe(3);
      expect(response.body.data.overview.unread).toBe(1);
      expect(response.body.data.overview.read).toBe(1);
      expect(response.body.data.overview.archived).toBe(1);
    });
  });
});
