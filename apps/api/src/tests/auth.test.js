const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const { generateTokens } = require('../utils/generateTokens');

describe('Authentication Controller - Password Security Tests', () => {
  let testUser;
  let accessToken;

  beforeEach(async () => {
    // Create a test user
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'ValidPassword123!',
      role: 'user'
    });

    // Generate access token for authenticated requests
    const tokens = generateTokens(testUser._id, testUser.role, testUser.adminRole);
    accessToken = tokens.accessToken;
  });

  afterEach(async () => {
    // Clean up test data
    await User.deleteMany({});
  });

  describe('changePassword function', () => {
    it('should reject weak passwords (SECURITY FIXED)', async () => {
      // This test confirms that weak passwords are now properly rejected
      
      const weakPasswords = [
        { password: '123', expectedError: 'Password must be at least 8 characters long' },
        { password: 'password', expectedError: 'Password is too common and easily guessable' },
        { password: '12345678', expectedError: 'Password must contain at least one uppercase letter' },
        { password: 'abcdefgh', expectedError: 'Password must contain at least one number' },
        { password: 'PASSWORD', expectedError: 'Password must contain at least one lowercase letter' },
        { password: 'password123', expectedError: 'Password is too common and easily guessable' },
        { password: 'a', expectedError: 'Password must be at least 8 characters long' },
        { password: 'ValidPassword123', expectedError: 'Password must contain at least one special character' },
        { password: 'ValidPassword!', expectedError: 'Password must contain at least one number' },
        { password: 'validpassword123!', expectedError: 'Password must contain at least one uppercase letter' },
        { password: 'VALIDPASSWORD123!', expectedError: 'Password must contain at least one lowercase letter' },
        { password: 'aaaa1234!', expectedError: 'Password cannot contain more than 3 consecutive identical characters' },
      ];

      // Test empty/whitespace passwords separately (they get caught by required validation)
      const emptyPasswords = [
        { password: '', expectedError: 'Current password and new password are required' },
        { password: '   ', expectedError: 'Current password and new password are required' },
      ];

      // Test weak passwords that should be caught by password strength validation
      for (const { password, expectedError } of weakPasswords) {
        const response = await request(app)
          .put('/api/auth/change-password')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            currentPassword: 'ValidPassword123!',
            newPassword: password
          });

        // SECURITY FIXED: This should now fail with proper validation
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain(expectedError);

        console.log(`✅ SECURITY FIXED: Weak password "${password}" was properly rejected`);
      }

      // Test empty/whitespace passwords that should be caught by required validation
      for (const { password, expectedError } of emptyPasswords) {
        const response = await request(app)
          .put('/api/auth/change-password')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            currentPassword: 'ValidPassword123!',
            newPassword: password
          });

        // These should fail with required validation
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(expectedError);

        console.log(`✅ SECURITY FIXED: Empty password "${password}" was properly rejected`);
      }
    });

    it('should reject change password request without current password', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          newPassword: 'NewPassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Current password and new password are required');
    });

    it('should reject change password request without new password', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'ValidPassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Current password and new password are required');
    });

    it('should reject change password with incorrect current password', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Current password is incorrect');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .send({
          currentPassword: 'ValidPassword123!',
          newPassword: 'NewPassword123!'
        });

      expect(response.status).toBe(401);
    });

    it('should reject new password that is same as current password', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'ValidPassword123!',
          newPassword: 'ValidPassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('New password must be different from current password');
    });

    it('should successfully change password with valid strong password', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'ValidPassword123!',
          newPassword: 'NewStrongPassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password changed successfully');

      // Verify the new password works
      const updatedUser = await User.findById(testUser._id).select('+password');
      const isNewPasswordValid = await updatedUser.comparePassword('NewStrongPassword123!');
      expect(isNewPasswordValid).toBe(true);

      // Verify old password no longer works
      const isOldPasswordValid = await updatedUser.comparePassword('ValidPassword123!');
      expect(isOldPasswordValid).toBe(false);
    });
  });

  describe('User Model Password Validation', () => {
    it('should enforce minimum password length on user creation', async () => {
      // This test shows that the User model DOES have password validation
      // but it's not being used in the changePassword function
      
      try {
        await User.create({
          firstName: 'Test',
          lastName: 'User',
          email: 'test2@example.com',
          password: '123' // Too short
        });
        
        // This should fail due to minlength validation
        fail('User creation should have failed with short password');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
        expect(error.errors.password.message).toContain('minimum');
      }
    });

    it('should allow strong passwords on user creation', async () => {
      const user = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test3@example.com',
        password: 'StrongPassword123!'
      });

      expect(user._id).toBeDefined();
      expect(user.email).toBe('test3@example.com');
    });
  });
});
