/**
 * @fileoverview Comprehensive test suite for payment system
 * @module tests/payment.test
 * 
 * This test suite covers all payment functionality including:
 * - Payment creation and processing
 * - Payment confirmation and status tracking
 * - Refund processing
 * - Payment method management
 * - Webhook handling
 * - Error scenarios and edge cases
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
const Booking = require('../models/Booking');
const BookingEnhanced = require('../models/BookingEnhanced');
const PaymentEnhanced = require('../models/PaymentEnhanced');
const Activity = require('../models/Activity');
const Vendor = require('../models/Vendor');

describe('Payment System Tests', () => {
  let testUser;
  let testVendor;
  let testActivity;
  let testBooking;
  let authToken;

  beforeAll(async () => {
    // Create test user
    testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'TestPassword123!',
      phone: '+966501234567',
      isEmailVerified: true
    });
    await testUser.save();

    // Create test vendor
    testVendor = new Vendor({
      businessName: 'Test Vendor',
      description: 'Test vendor description',
      contactInfo: {
        email: 'vendor@example.com',
        phone: '+966501234568'
      },
      location: {
        address: 'Test Address',
        city: 'Riyadh',
        state: 'Riyadh',
        zipCode: '12345'
      },
      categories: ['fitness']
    });
    await testVendor.save();

    // Create test activity
    testActivity = new Activity({
      title: 'Test Activity',
      description: 'Test activity description',
      shortDescription: 'Short description',
      vendor: testVendor._id,
      category: 'fitness',
      pricing: {
        basePrice: 100,
        currency: 'SAR'
      },
      capacity: {
        max: 10
      },
      duration: 60,
      difficulty: 'beginner'
    });
    await testActivity.save();

    // Create test booking
    testBooking = new Booking({
      user: testUser._id,
      activity: testActivity._id,
      vendor: testVendor._id,
      bookingDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      timeSlot: {
        startTime: '10:00',
        endTime: '11:00'
      },
      participants: {
        count: 1
      },
      contactInfo: {
        email: testUser.email,
        phone: testUser.phone
      },
      pricing: {
        basePrice: 100,
        totalPrice: 100,
        currency: 'SAR'
      },
      status: 'pending'
    });
    await testBooking.save();

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'TestPassword123!'
      });
    
    authToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: 'testuser@example.com' });
    await Vendor.deleteMany({ 'contactInfo.email': 'vendor@example.com' });
    await Activity.deleteMany({ title: 'Test Activity' });
    await Booking.deleteMany({ user: testUser._id });
    await PaymentEnhanced.deleteMany({ 'user.id': testUser._id });
    await mongoose.connection.close();
  });

  describe('Payment Creation', () => {
    test('should create payment with credit card', async () => {
      const paymentData = {
        bookingId: testBooking._id,
        paymentMethod: 'credit_card',
        cardData: {
          name: 'Test User',
          number: '4111111111111111',
          month: '12',
          year: '2025',
          cvc: '123'
        }
      };

      const response = await request(app)
        .post('/api/payments/create-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('paymentId');
      expect(response.body.data).toHaveProperty('status');
    });

    test('should create payment with saved token', async () => {
      // First save a payment method
      const saveResponse = await request(app)
        .post('/api/payments/save-method')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cardData: {
            name: 'Test User',
            number: '4111111111111111',
            month: '12',
            year: '2025',
            cvc: '123'
          },
          isDefault: true
        });

      expect(saveResponse.status).toBe(200);

      // Get saved methods
      const methodsResponse = await request(app)
        .get('/api/payments/methods')
        .set('Authorization', `Bearer ${authToken}`);

      expect(methodsResponse.status).toBe(200);
      expect(methodsResponse.body.data).toHaveLength(1);

      // Create payment with saved token
      const paymentData = {
        bookingId: testBooking._id,
        paymentMethod: 'credit_card',
        savedTokenId: methodsResponse.body.data[0].id
      };

      const response = await request(app)
        .post('/api/payments/create-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should fail with invalid booking ID', async () => {
      const paymentData = {
        bookingId: new mongoose.Types.ObjectId(),
        paymentMethod: 'credit_card',
        cardData: {
          name: 'Test User',
          number: '4111111111111111',
          month: '12',
          year: '2025',
          cvc: '123'
        }
      };

      const response = await request(app)
        .post('/api/payments/create-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should fail with invalid card data', async () => {
      const paymentData = {
        bookingId: testBooking._id,
        paymentMethod: 'credit_card',
        cardData: {
          name: 'Test User',
          number: '1234', // Invalid card number
          month: '12',
          year: '2025',
          cvc: '123'
        }
      };

      const response = await request(app)
        .post('/api/payments/create-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Payment Method Management', () => {
    test('should save payment method', async () => {
      const paymentMethodData = {
        cardData: {
          name: 'Test User',
          number: '4111111111111111',
          month: '12',
          year: '2025',
          cvc: '123'
        },
        isDefault: true
      };

      const response = await request(app)
        .post('/api/payments/save-method')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentMethodData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('last4');
      expect(response.body.data).toHaveProperty('brand');
    });

    test('should get user payment methods', async () => {
      const response = await request(app)
        .get('/api/payments/methods')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should delete payment method', async () => {
      // First get saved methods
      const methodsResponse = await request(app)
        .get('/api/payments/methods')
        .set('Authorization', `Bearer ${authToken}`);

      if (methodsResponse.body.data.length > 0) {
        const methodId = methodsResponse.body.data[0].id;

        const response = await request(app)
          .delete(`/api/payments/methods/${methodId}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });

    test('should set default payment method', async () => {
      // First save a payment method
      const saveResponse = await request(app)
        .post('/api/payments/save-method')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cardData: {
            name: 'Test User',
            number: '4111111111111111',
            month: '12',
            year: '2025',
            cvc: '123'
          }
        });

      if (saveResponse.status === 200) {
        const methodId = saveResponse.body.data.id;

        const response = await request(app)
          .put(`/api/payments/methods/${methodId}/default`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('Payment History', () => {
    test('should get payment history', async () => {
      const response = await request(app)
        .get('/api/payments/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('payments');
      expect(response.body.data).toHaveProperty('pagination');
    });

    test('should get payment history with filters', async () => {
      const response = await request(app)
        .get('/api/payments/history?status=completed&method=credit_card&page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Payment Analytics', () => {
    test('should get payment analytics', async () => {
      const response = await request(app)
        .get('/api/payments/analytics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data).toHaveProperty('methodBreakdown');
      expect(response.body.data).toHaveProperty('trends');
    });

    test('should get payment analytics with date filters', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get(`/api/payments/analytics?startDate=${startDate}&endDate=${endDate}&groupBy=day`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Payment Methods Configuration', () => {
    test('should get payment methods configuration', async () => {
      const response = await request(app)
        .get('/api/payments/config');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('methods');
      expect(response.body.data).toHaveProperty('currency');
      expect(response.body.data).toHaveProperty('supportedCurrencies');
    });
  });

  describe('Payment Status', () => {
    test('should get payment status', async () => {
      // First create a payment
      const paymentData = {
        bookingId: testBooking._id,
        paymentMethod: 'credit_card',
        cardData: {
          name: 'Test User',
          number: '4111111111111111',
          month: '12',
          year: '2025',
          cvc: '123'
        }
      };

      const createResponse = await request(app)
        .post('/api/payments/create-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      if (createResponse.status === 200) {
        const paymentId = createResponse.body.data.paymentId;

        const response = await request(app)
          .get(`/api/payments/${paymentId}/status`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('status');
      }
    });
  });

  describe('Refund Processing', () => {
    test('should process refund', async () => {
      // First create and complete a payment
      const paymentData = {
        bookingId: testBooking._id,
        paymentMethod: 'credit_card',
        cardData: {
          name: 'Test User',
          number: '4111111111111111',
          month: '12',
          year: '2025',
          cvc: '123'
        }
      };

      const createResponse = await request(app)
        .post('/api/payments/create-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      if (createResponse.status === 200) {
        // Simulate payment completion by updating booking status
        await Booking.findByIdAndUpdate(testBooking._id, {
          status: 'confirmed',
          'payment.status': 'paid',
          'payment.paidAt': new Date()
        });

        const response = await request(app)
          .post(`/api/payments/refund/${testBooking._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            reason: 'Test refund'
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('refundId');
      }
    });

    test('should fail refund for unpaid booking', async () => {
      const response = await request(app)
        .post(`/api/payments/refund/${testBooking._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Test refund'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Webhook Handling', () => {
    test('should handle payment success webhook', async () => {
      const webhookData = {
        type: 'payment_paid',
        data: {
          object: {
            id: 'test_payment_id',
            status: 'paid',
            amount: 10000, // 100 SAR in halalas
            currency: 'SAR'
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/webhook')
        .send(webhookData);

      expect(response.status).toBe(200);
      expect(response.body.received).toBe(true);
    });

    test('should handle payment failed webhook', async () => {
      const webhookData = {
        type: 'payment_failed',
        data: {
          object: {
            id: 'test_payment_id',
            status: 'failed',
            amount: 10000,
            currency: 'SAR'
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/webhook')
        .send(webhookData);

      expect(response.status).toBe(200);
      expect(response.body.received).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/api/payments/history');

      expect(response.status).toBe(401);
    });

    test('should handle invalid payment method', async () => {
      const paymentData = {
        bookingId: testBooking._id,
        paymentMethod: 'invalid_method',
        cardData: {
          name: 'Test User',
          number: '4111111111111111',
          month: '12',
          year: '2025',
          cvc: '123'
        }
      };

      const response = await request(app)
        .post('/api/payments/create-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should handle missing required fields', async () => {
      const paymentData = {
        bookingId: testBooking._id,
        paymentMethod: 'credit_card'
        // Missing cardData
      };

      const response = await request(app)
        .post('/api/payments/create-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    test('should handle rate limiting', async () => {
      const paymentData = {
        bookingId: testBooking._id,
        paymentMethod: 'credit_card',
        cardData: {
          name: 'Test User',
          number: '4111111111111111',
          month: '12',
          year: '2025',
          cvc: '123'
        }
      };

      // Make multiple requests to test rate limiting
      const promises = Array(10).fill().map(() =>
        request(app)
          .post('/api/payments/create-payment')
          .set('Authorization', `Bearer ${authToken}`)
          .send(paymentData)
      );

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
