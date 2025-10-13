/**
 * @fileoverview Comprehensive authentication system tests for LUDUS platform.
 * 
 * This test suite covers all authentication functionality including:
 * - User registration and validation
 * - User login and logout
 * - Password reset and change
 * - Email verification
 * - Social authentication
 * - JWT token management
 * - Security measures and rate limiting
 * 
 * @version 1.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const { connectDB, disconnectDB } = require('../config/database');

// Test data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'TestPassword123!',
  phone: '+966501234567'
};

const adminUser = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@ludusapp.com',
  password: 'AdminPassword123!',
  role: 'admin',
  adminRole: 'SA'
};

describe('Authentication System Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await connectDB();
  });

  afterAll(async () => {
    // Clean up and disconnect
    await User.deleteMany({});
    await disconnectDB();
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
  });

  describe('User Registration', () => {
    test('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.firstName).toBe(testUser.firstName);
      expect(response.body.data.user.lastName).toBe(testUser.lastName);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    test('should fail to register with duplicate email', async () => {
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('should fail to register with invalid email', async () => {
      const invalidUser = { ...testUser, email: 'invalid-email' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should fail to register with weak password', async () => {
      const weakPasswordUser = { ...testUser, password: '123' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should register with referral code', async () => {
      // Create referrer user
      const referrer = await User.create({
        ...testUser,
        email: 'referrer@example.com',
        referralCode: 'REF123'
      });

      const newUser = {
        ...testUser,
        email: 'newuser@example.com',
        referralCode: 'REF123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.referralProcessed).toBe(true);
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Create test user
      await User.create(testUser);
    });

    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.accessToken).toBeDefined();
    });

    test('should fail to login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should fail to login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should set refresh token cookie on login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('refreshToken');
    });
  });

  describe('Token Management', () => {
    let accessToken;
    let refreshToken;

    beforeEach(async () => {
      // Create and login user
      const user = await User.create(testUser);
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      accessToken = loginResponse.body.data.accessToken;
      refreshToken = loginResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];
    });

    test('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    test('should fail to get current user without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });

    test('should fail to get current user with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });

    test('should refresh access token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    test('should fail to refresh with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', 'refreshToken=invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid refresh token');
    });
  });

  describe('Password Management', () => {
    let user;
    let accessToken;

    beforeEach(async () => {
      // Create and login user
      user = await User.create(testUser);
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      accessToken = loginResponse.body.data.accessToken;
    });

    test('should change password successfully', async () => {
      const newPassword = 'NewPassword123!';
      
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: newPassword
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password changed successfully');
    });

    test('should fail to change password with wrong current password', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'NewPassword123!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Current password is incorrect');
    });

    test('should fail to change password with weak new password', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: '123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should send forgot password email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password reset email sent');
    });

    test('should fail forgot password with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User not found');
    });
  });

  describe('Social Authentication', () => {
    test('should handle social login with valid token', async () => {
      // Mock social token verification
      const mockUserInfo = {
        id: 'google123',
        email: 'social@example.com',
        name: 'Social User',
        picture: 'https://example.com/avatar.jpg'
      };

      // Mock the social auth service
      jest.doMock('../services/socialAuthService', () => ({
        verifySocialToken: jest.fn().mockResolvedValue(mockUserInfo)
      }));

      const response = await request(app)
        .post('/api/auth/social-login')
        .send({
          provider: 'google',
          token: 'mock-google-token'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(mockUserInfo.email);
    });

    test('should fail social login with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/social-login')
        .send({
          provider: 'google',
          token: 'invalid-token'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid social token');
    });
  });

  describe('Admin User Creation', () => {
    test('should create admin user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/create-admin')
        .send(adminUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe('admin');
      expect(response.body.data.adminRole).toBe('SA');
    });

    test('should update existing user to admin', async () => {
      // Create regular user first
      await User.create(testUser);

      const response = await request(app)
        .post('/api/auth/create-admin')
        .send({
          ...adminUser,
          email: testUser.email
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('Logout', () => {
    let accessToken;

    beforeEach(async () => {
      // Create and login user
      await User.create(testUser);
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      accessToken = loginResponse.body.data.accessToken;
    });

    test('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out successfully');
    });

    test('should clear refresh token on logout', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('refreshToken=;');
    });
  });

  describe('Security Tests', () => {
    test('should rate limit login attempts', async () => {
      // Create test user
      await User.create(testUser);

      // Make multiple failed login attempts
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: 'wrongpassword'
          });
      }

      // Should be rate limited
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(429);

      expect(response.body.message).toContain('Too many requests');
    });

    test('should validate input data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: '', // Empty first name
          lastName: 'User',
          email: 'invalid-email',
          password: '123' // Weak password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should sanitize user input', async () => {
      const maliciousUser = {
        ...testUser,
        firstName: '<script>alert("xss")</script>',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(maliciousUser)
        .expect(201);

      // Check that script tags are not stored as-is
      expect(response.body.data.user.firstName).not.toContain('<script>');
    });
  });

  describe('Email Verification', () => {
    test('should verify email with valid token', async () => {
      // Create user with verification token
      const user = await User.create({
        ...testUser,
        emailVerificationToken: 'valid-token',
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      // Mock JWT verification
      jest.doMock('../utils/generateTokens', () => ({
        verifyToken: jest.fn().mockReturnValue({
          userId: user._id,
          email: user.email,
          type: 'email_verification'
        })
      }));

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'valid-token' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Email verified successfully');
    });

    test('should fail email verification with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'invalid-token' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});