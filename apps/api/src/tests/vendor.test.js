/**
 * @fileoverview Comprehensive Test Suite for Vendor Management System
 * @module tests/vendor.test
 * 
 * This test suite covers all vendor management functionality including:
 * - Vendor CRUD operations
 * - Advanced search and filtering
 * - Analytics and reporting
 * - Status management and approval workflow
 * - Document management
 * - RTL support for Arabic users
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Vendor = require('../models/Vendor');
const Activity = require('../models/Activity');
const ActivityEnhanced = require('../models/ActivityEnhanced');
const Booking = require('../models/Booking');
const BookingEnhanced = require('../models/BookingEnhanced');
const User = require('../models/User');
const { generateAuthToken } = require('../utils/auth');

describe('Vendor Management System', () => {
  let authToken;
  let adminToken;
  let vendorId;
  let userId;

  beforeAll(async () => {
    // Create test user
    const user = new User({
      name: 'Test User',
      nameAr: 'مستخدم تجريبي',
      email: 'user@test.com',
      password: 'password123',
      role: 'user',
      isActive: true
    });
    await user.save();
    userId = user._id;

    // Create test admin
    const admin = new User({
      name: 'Test Admin',
      nameAr: 'مدير تجريبي',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
      isActive: true
    });
    await admin.save();

    // Generate auth tokens
    authToken = generateAuthToken(userId);
    adminToken = generateAuthToken(admin._id);
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up vendors before each test
    await Vendor.deleteMany({});
    await Activity.deleteMany({});
    await ActivityEnhanced.deleteMany({});
    await Booking.deleteMany({});
    await BookingEnhanced.deleteMany({});
  });

  describe('POST /api/vendors', () => {
    it('should register a new vendor', async () => {
      const vendorData = {
        contactName: 'John Doe',
        companyName: 'Test Company',
        email: 'vendor@test.com',
        phone: '+966501234567',
        website: 'https://testcompany.com',
        description: 'A test company for activities'
      };

      const response = await request(app)
        .post('/api/vendors')
        .send(vendorData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vendor).toBeDefined();
      expect(response.body.data.vendor.businessName).toBe(vendorData.companyName);
      expect(response.body.data.vendor.email).toBe(vendorData.email);

      vendorId = response.body.data.vendor.id;
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/vendors')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Missing required fields');
    });

    it('should prevent duplicate email registration', async () => {
      const vendorData = {
        contactName: 'John Doe',
        companyName: 'Test Company',
        email: 'vendor@test.com',
        phone: '+966501234567',
        description: 'A test company'
      };

      // First registration
      await request(app)
        .post('/api/vendors')
        .send(vendorData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/vendors')
        .send(vendorData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email already exists');
    });
  });

  describe('GET /api/vendors', () => {
    beforeEach(async () => {
      // Create test vendors
      const vendors = [
        {
          businessName: 'Vendor 1',
          description: 'Description 1',
          contactInfo: {
            email: 'vendor1@test.com',
            phone: '+966501234567'
          },
          location: {
            city: 'Riyadh',
            state: 'Riyadh Region'
          },
          categories: ['fitness'],
          statusHistory: [{
            status: 'active',
            timestamp: new Date()
          }],
          isActive: true
        },
        {
          businessName: 'Vendor 2',
          description: 'Description 2',
          contactInfo: {
            email: 'vendor2@test.com',
            phone: '+966501234568'
          },
          location: {
            city: 'Jeddah',
            state: 'Makkah Region'
          },
          categories: ['arts'],
          statusHistory: [{
            status: 'pending',
            timestamp: new Date()
          }],
          isActive: false
        }
      ];

      for (const vendorData of vendors) {
        const vendor = new Vendor(vendorData);
        await vendor.save();
      }
    });

    it('should get all vendors with pagination', async () => {
      const response = await request(app)
        .get('/api/vendors')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.totalVendors).toBe(2);
    });

    it('should filter vendors by status', async () => {
      const response = await request(app)
        .get('/api/vendors?status=active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].statusHistory[0].status).toBe('active');
    });

    it('should filter vendors by category', async () => {
      const response = await request(app)
        .get('/api/vendors?category=fitness')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].categories).toContain('fitness');
    });

    it('should filter vendors by city', async () => {
      const response = await request(app)
        .get('/api/vendors?city=Riyadh')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].location.city).toBe('Riyadh');
    });

    it('should search vendors by business name', async () => {
      const response = await request(app)
        .get('/api/vendors?search=Vendor 1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].businessName).toBe('Vendor 1');
    });
  });

  describe('GET /api/vendors/:id/analytics', () => {
    beforeEach(async () => {
      // Create test vendor
      const vendor = new Vendor({
        businessName: 'Analytics Test Vendor',
        description: 'Test description',
        contactInfo: {
          email: 'analytics@test.com',
          phone: '+966501234567'
        },
        location: {
          city: 'Riyadh',
          state: 'Riyadh Region'
        },
        categories: ['fitness'],
        statusHistory: [{
          status: 'active',
          timestamp: new Date()
        }],
        isActive: true
      });
      await vendor.save();
      vendorId = vendor._id;

      // Create test activities
      const activity = new ActivityEnhanced({
        title: 'Test Activity',
        description: 'Test activity description',
        partner: vendorId,
        category: { id: new mongoose.Types.ObjectId() },
        pricing: { basePrice: 100, currency: 'SAR', priceType: 'per_person' },
        capacity: { min: 1, max: 10 },
        duration: { hours: 2, minutes: 0 },
        location: { city: 'Riyadh', region: 'Riyadh Region' },
        status: 'published',
        isActive: true
      });
      await activity.save();

      // Create test bookings
      const bookings = [
        {
          user: userId,
          activity: { id: activity._id },
          vendor: { id: vendorId },
          status: 'confirmed',
          pricing: { total: 100 },
          createdAt: new Date()
        },
        {
          user: userId,
          activity: { id: activity._id },
          vendor: { id: vendorId },
          status: 'completed',
          pricing: { total: 150 },
          createdAt: new Date()
        }
      ];

      for (const bookingData of bookings) {
        const booking = new BookingEnhanced(bookingData);
        await booking.save();
      }
    });

    it('should get vendor analytics', async () => {
      const response = await request(app)
        .get(`/api/vendors/${vendorId}/analytics`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vendor).toBeDefined();
      expect(response.body.data.bookingStats).toBeDefined();
      expect(response.body.data.activityStats).toBeDefined();
      expect(response.body.data.monthlyTrends).toBeDefined();
      expect(response.body.data.topActivities).toBeDefined();
    });

    it('should get analytics for different periods', async () => {
      const periods = ['7d', '30d', '90d', '1y'];
      
      for (const period of periods) {
        const response = await request(app)
          .get(`/api/vendors/${vendorId}/analytics?period=${period}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.period).toBe(period);
      }
    });

    it('should return 404 for non-existent vendor', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/vendors/${fakeId}/analytics`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Vendor not found');
    });
  });

  describe('PUT /api/vendors/:id/status', () => {
    beforeEach(async () => {
      // Create test vendor
      const vendor = new Vendor({
        businessName: 'Status Test Vendor',
        description: 'Test description',
        contactInfo: {
          email: 'status@test.com',
          phone: '+966501234567'
        },
        location: {
          city: 'Riyadh',
          state: 'Riyadh Region'
        },
        categories: ['fitness'],
        statusHistory: [{
          status: 'pending',
          timestamp: new Date()
        }],
        isActive: false
      });
      await vendor.save();
      vendorId = vendor._id;
    });

    it('should update vendor status', async () => {
      const response = await request(app)
        .put(`/api/vendors/${vendorId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'active',
          reason: 'Approved after review',
          adminNotes: 'All documents verified'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vendor.isActive).toBe(true);
      expect(response.body.data.vendor.statusHistory).toHaveLength(2);
    });

    it('should validate status values', async () => {
      const response = await request(app)
        .put(`/api/vendors/${vendorId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid status');
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .put(`/api/vendors/${vendorId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'active' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('admin role required');
    });
  });

  describe('POST /api/vendors/:id/documents', () => {
    beforeEach(async () => {
      // Create test vendor
      const vendor = new Vendor({
        businessName: 'Document Test Vendor',
        description: 'Test description',
        contactInfo: {
          email: 'document@test.com',
          phone: '+966501234567'
        },
        location: {
          city: 'Riyadh',
          state: 'Riyadh Region'
        },
        categories: ['fitness'],
        statusHistory: [{
          status: 'pending',
          timestamp: new Date()
        }],
        isActive: false,
        createdBy: userId
      });
      await vendor.save();
      vendorId = vendor._id;
    });

    it('should upload vendor document', async () => {
      // Mock file upload
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: Buffer.from('test file content')
      };

      const response = await request(app)
        .post(`/api/vendors/${vendorId}/documents`)
        .set('Authorization', `Bearer ${authToken}`)
        .field('documentType', 'license')
        .field('documentName', 'Business License')
        .attach('file', mockFile.buffer, 'test.pdf')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.document).toBeDefined();
      expect(response.body.data.document.type).toBe('license');
    });

    it('should require file upload', async () => {
      const response = await request(app)
        .post(`/api/vendors/${vendorId}/documents`)
        .set('Authorization', `Bearer ${authToken}`)
        .field('documentType', 'license')
        .field('documentName', 'Business License')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No file uploaded');
    });

    it('should prevent unauthorized document upload', async () => {
      const otherUser = new User({
        name: 'Other User',
        email: 'other@test.com',
        password: 'password123',
        role: 'user'
      });
      await otherUser.save();
      const otherToken = generateAuthToken(otherUser._id);

      const response = await request(app)
        .post(`/api/vendors/${vendorId}/documents`)
        .set('Authorization', `Bearer ${otherToken}`)
        .field('documentType', 'license')
        .field('documentName', 'Business License')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });
  });

  describe('GET /api/vendors/dashboard', () => {
    beforeEach(async () => {
      // Create test vendor
      const vendor = new Vendor({
        businessName: 'Dashboard Test Vendor',
        description: 'Test description',
        contactInfo: {
          email: 'dashboard@test.com',
          phone: '+966501234567'
        },
        location: {
          city: 'Riyadh',
          state: 'Riyadh Region'
        },
        categories: ['fitness'],
        statusHistory: [{
          status: 'active',
          timestamp: new Date()
        }],
        isActive: true,
        createdBy: userId,
        rating: { average: 4.5, count: 10 }
      });
      await vendor.save();
      vendorId = vendor._id;

      // Create test activities
      const activities = [
        {
          title: 'Activity 1',
          description: 'Test activity 1',
          partner: userId,
          category: { id: new mongoose.Types.ObjectId() },
          pricing: { basePrice: 100, currency: 'SAR', priceType: 'per_person' },
          capacity: { min: 1, max: 10 },
          duration: { hours: 2, minutes: 0 },
          location: { city: 'Riyadh', region: 'Riyadh Region' },
          status: 'published',
          isActive: true
        },
        {
          title: 'Activity 2',
          description: 'Test activity 2',
          partner: userId,
          category: { id: new mongoose.Types.ObjectId() },
          pricing: { basePrice: 150, currency: 'SAR', priceType: 'per_person' },
          capacity: { min: 1, max: 5 },
          duration: { hours: 1, minutes: 30 },
          location: { city: 'Riyadh', region: 'Riyadh Region' },
          status: 'draft',
          isActive: true
        }
      ];

      for (const activityData of activities) {
        const activity = new ActivityEnhanced(activityData);
        await activity.save();
      }

      // Create test bookings
      const bookings = [
        {
          user: userId,
          activity: { id: activities[0]._id },
          vendor: { id: vendorId },
          status: 'confirmed',
          pricing: { total: 100 },
          bookingNumber: 'BK001',
          createdAt: new Date()
        },
        {
          user: userId,
          activity: { id: activities[1]._id },
          vendor: { id: vendorId },
          status: 'completed',
          pricing: { total: 150 },
          bookingNumber: 'BK002',
          createdAt: new Date()
        }
      ];

      for (const bookingData of bookings) {
        const booking = new BookingEnhanced(bookingData);
        await booking.save();
      }
    });

    it('should get vendor dashboard data', async () => {
      const response = await request(app)
        .get('/api/vendors/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vendor).toBeDefined();
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.recentActivities).toBeDefined();
      expect(response.body.data.recentBookings).toBeDefined();
    });

    it('should return 404 if vendor profile not found', async () => {
      const otherUser = new User({
        name: 'Other User',
        email: 'other@test.com',
        password: 'password123',
        role: 'user'
      });
      await otherUser.save();
      const otherToken = generateAuthToken(otherUser._id);

      const response = await request(app)
        .get('/api/vendors/dashboard')
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Vendor profile not found');
    });
  });

  describe('GET /api/vendors/:id', () => {
    beforeEach(async () => {
      // Create test vendor
      const vendor = new Vendor({
        businessName: 'Profile Test Vendor',
        description: 'Test description',
        contactInfo: {
          email: 'profile@test.com',
          phone: '+966501234567'
        },
        location: {
          city: 'Riyadh',
          state: 'Riyadh Region'
        },
        categories: ['fitness'],
        statusHistory: [{
          status: 'active',
          timestamp: new Date()
        }],
        isActive: true,
        rating: { average: 4.5, count: 10 }
      });
      await vendor.save();
      vendorId = vendor._id;
    });

    it('should get vendor profile by ID', async () => {
      const response = await request(app)
        .get(`/api/vendors/${vendorId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vendor).toBeDefined();
      expect(response.body.data.vendor.businessName).toBe('Profile Test Vendor');
    });

    it('should return 404 for non-existent vendor', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/vendors/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Vendor not found');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // This would require mocking the database connection
      // For now, we'll test with invalid ObjectId
      const response = await request(app)
        .get('/api/vendors/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle validation errors gracefully', async () => {
      const response = await request(app)
        .post('/api/vendors')
        .send({
          contactName: '', // Invalid: empty name
          companyName: 'x'.repeat(101), // Invalid: too long
          email: 'invalid-email' // Invalid: email format
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('RTL Support', () => {
    it('should handle Arabic text in vendor registration', async () => {
      const vendorData = {
        contactName: 'أحمد محمد',
        companyName: 'شركة تجريبية',
        email: 'arabic@test.com',
        phone: '+966501234567',
        description: 'وصف تجريبي للشركة'
      };

      const response = await request(app)
        .post('/api/vendors')
        .send(vendorData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vendor.businessName).toBe(vendorData.companyName);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large number of vendors efficiently', async () => {
      // Create multiple vendors
      const vendors = [];
      for (let i = 0; i < 50; i++) {
        vendors.push({
          businessName: `Vendor ${i}`,
          description: `Description ${i}`,
          contactInfo: {
            email: `vendor${i}@test.com`,
            phone: `+96650123456${i}`
          },
          location: {
            city: i % 2 === 0 ? 'Riyadh' : 'Jeddah',
            state: i % 2 === 0 ? 'Riyadh Region' : 'Makkah Region'
          },
          categories: [i % 2 === 0 ? 'fitness' : 'arts'],
          statusHistory: [{
            status: i % 3 === 0 ? 'active' : 'pending',
            timestamp: new Date()
          }],
          isActive: i % 3 === 0
        });
      }

      // Insert vendors
      await Vendor.insertMany(vendors);

      // Test pagination performance
      const startTime = Date.now();
      const response = await request(app)
        .get('/api/vendors?page=1&limit=10')
        .expect(200);
      const endTime = Date.now();

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
