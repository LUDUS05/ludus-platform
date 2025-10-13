/**
 * @fileoverview Controller for handling user authentication.
 * @module controllers/authController
 */

const User = require('../models/User');
const { generateTokens, verifyToken, generatePasswordResetToken } = require('../utils/generateTokens');
const { setRefreshTokenCookie, clearRefreshTokenCookie, getRefreshTokenFromCookie } = require('../utils/cookieHelpers');
const { verifySocialToken } = require('../services/socialAuthService');
const emailService = require('../services/emailService');
const crypto = require('crypto');

// Import referral processing function
const { processReferralRegistration } = require('./referralController');

/**
 * Register a new user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password
    });

    // Process referral if provided
    let referralProcessed = false;
    if (req.body.referralCode) {
      try {
        // Process referral registration
        const referralResult = await processReferralRegistration({
          body: {
            referralCode: req.body.referralCode,
            newUserId: user._id,
            source: req.body.referralSource || 'direct-link',
            platform: req.body.referralPlatform || 'unknown',
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip || req.connection.remoteAddress
          }
        }, res);
        
        if (referralResult) {
          referralProcessed = true;
          console.log(`✅ Referral processed for user ${user._id} with code ${req.body.referralCode}`);
        }
      } catch (referralError) {
        console.error('Failed to process referral during registration:', referralError);
        // Don't fail registration if referral processing fails
      }
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role, user.adminRole);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as HttpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    // Generate email verification token
  // email verification token generation moved to email workflow when needed
    
    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user);
      console.log(`✅ Welcome email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
              data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified
          },
          accessToken,
          referralProcessed
          // refreshToken no longer sent in response body for security
        }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login an existing user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role, user.adminRole);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as HttpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        accessToken
        // refreshToken no longer sent in response body for security
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh the access token using a refresh token.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} _next - The Express next middleware function (unused).
 * @returns {Promise<void>}
 */
const refreshToken = async (req, res, _next) => {
  try {
    // Get refresh token from HttpOnly cookie
    const token = getRefreshTokenFromCookie(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    // Find user and check if refresh token matches
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== token) {
      clearRefreshTokenCookie(res); // Clear invalid cookie
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens (includes role to avoid DB lookup in middleware)
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id, user.role, user.adminRole);

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new refresh token cookie
    setRefreshTokenCookie(res, newRefreshToken);

    res.json({
      success: true,
      data: {
        accessToken
        // refreshToken no longer sent in response body for security
      }
    });
  } catch (error) {
    clearRefreshTokenCookie(res); // Clear invalid cookie
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

/**
 * Logout the current user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const logout = async (req, res, next) => {
  try {
    // Clear refresh token from database
    await User.findByIdAndUpdate(req.user.id || req.user._id, { 
      $unset: { refreshToken: 1 } 
    });

    // Clear refresh token cookie
    clearRefreshTokenCookie(res);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get the currently authenticated user's profile.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const getMe = async (req, res, next) => {
  try {
    // Use req.user from middleware instead of additional DB query
    // If full user object is needed, middleware already provides it
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify a user's email address using a token.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    if (decoded.type !== 'email_verification') {
      return res.status(400).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Find and update user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.email !== decoded.email) {
      return res.status(400).json({
        success: false,
        message: 'Token email mismatch'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle a forgot password request.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Generate password reset token
    const resetToken = generatePasswordResetToken(user._id, user.email);
    
    // Save reset token and expiry to user
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send password reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken, resetUrl);
      console.log(`✅ Password reset email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Reset the user's token since email failed
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again later.'
      });
    }

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset a user's password using a reset token.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }

    // Hash token and find user
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined; // Invalidate existing sessions
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change the password for an authenticated user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || !currentPassword.trim() || !newPassword.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is different from current password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Update password
    user.password = newPassword;
    user.refreshToken = undefined; // Invalidate existing sessions
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    // Handle Mongoose validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Password validation failed',
        errors: validationErrors
      });
    }
    next(error);
  }
};

/**
 * Helper function to validate the strength of a password.
 * @param {string} password - The password to validate.
 * @returns {{isValid: boolean, message: string}} An object indicating if the password is valid and a message.
 */
const validatePasswordStrength = (password) => {
  const errors = [];

  // Check minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Check maximum length (prevent DoS attacks)
  if (password.length > 128) {
    errors.push('Password must be no more than 128 characters long');
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common and easily guessable');
  }

  // Check for repeated characters (more than 3 in a row)
  if (/(.)\1{3,}/.test(password)) {
    errors.push('Password cannot contain more than 3 consecutive identical characters');
  }

  return {
    isValid: errors.length === 0,
    message: errors.length === 0 ? 'Password is valid' : errors.join('. ')
  };
};

/**
 * Handle social login (Google, Facebook, Apple).
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const socialLogin = async (req, res, next) => {
  try {
    const { provider, token, referralCode, referralSource, referralPlatform } = req.body;
    
    console.log('🔐 Social login attempt:', {
      provider,
      tokenLength: token ? token.length : 'No token',
      referralCode,
      referralSource,
      referralPlatform
    });

    if (!provider || !token) {
      console.log('❌ Missing provider or token');
      return res.status(400).json({
        success: false,
        message: 'Provider and token are required'
      });
    }

    // Verify token using social auth service
    console.log('🔍 Verifying social token...');
    const userInfo = await verifySocialToken(provider, token);

    if (!userInfo) {
      return res.status(401).json({
        success: false,
        message: 'Invalid social token'
      });
    }

    // Check if user exists with social ID
    let user = await User.findOne({
      $or: [
        { [`social.${provider}.id`]: userInfo.id },
        { email: userInfo.email }
      ]
    });

    let isNewUser = false;

    if (user) {
      // Update social info if not already linked
      if (!user.social[provider]) {
        user.social[provider] = {
          id: userInfo.id,
          email: userInfo.email
        };
        await user.save();
      }
    } else {
      // Create new user with social info
      // Split name into first and last name
      const nameParts = userInfo.name.split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || '';

      user = await User.create({
        firstName,
        lastName,
        email: userInfo.email,
        profileImage: userInfo.picture || userInfo.avatar,
        isEmailVerified: true, // Social accounts are pre-verified
        social: {
          [provider]: {
            id: userInfo.id,
            email: userInfo.email
          }
        },
        referredBy: referralCode || null // Store referral code if provided
      });
      
      isNewUser = true;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role, user.adminRole);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as HttpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    // Process referral if this is a new user and referral code was provided
    let referralProcessed = false;
    if (isNewUser && referralCode) {
      try {
        // Import referral controller function
        const { processReferralRegistration } = require('./referralController');
        
        // Process referral registration
        const referralResult = await processReferralRegistration({
          body: {
            referralCode,
            newUserId: user._id,
            source: referralSource || 'direct-link',
            platform: referralPlatform || 'unknown',
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip || req.connection.remoteAddress
          }
        }, res);
        
        if (referralResult) {
          referralProcessed = true;
          console.log(`✅ Referral processed for new social user ${user._id} with code ${referralCode}`);
        }
      } catch (referralError) {
        console.error('Failed to process referral during social login:', referralError);
        // Don't fail login if referral processing fails
      }
    }

    // Remove sensitive data
    user.password = undefined;
    user.refreshToken = undefined;

    res.json({
      success: true,
      message: 'Social login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        accessToken,
        referralProcessed
        // refreshToken no longer sent in response body for security
      }
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Create an admin user (for development/setup purposes)
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const createAdminUser = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      email: email || 'admin@ludusapp.com' 
    });

    if (existingAdmin) {
      // Update to admin if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        existingAdmin.adminRole = 'SA'; // Super Admin
        await existingAdmin.save();
        console.log('✅ Updated user to admin role');
      }
      
      return res.json({
        success: true,
        message: 'Admin user already exists',
        data: {
          email: existingAdmin.email,
          role: existingAdmin.role,
          adminRole: existingAdmin.adminRole
        }
      });
    }

    // Create admin user
    const adminUser = new User({
      firstName: firstName || 'Admin',
      lastName: lastName || 'User',
      email: email || 'admin@ludusapp.com',
      password: password || 'AdminPassword123!',
      role: 'admin',
      adminRole: 'SA', // Super Admin
      isEmailVerified: true,
      location: {
        address: 'Riyadh, Saudi Arabia',
        city: 'Riyadh',
        state: 'Riyadh Province',
        zipCode: '11564',
        coordinates: [46.6753, 24.7136] // [longitude, latitude] for Riyadh
      },
      preferences: {
        categories: ['fitness', 'arts', 'food', 'outdoor', 'unique', 'wellness'],
        priceRange: {
          min: 0,
          max: 1000
        },
        radius: 50
      }
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully:', adminUser.email);
    
    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        email: adminUser.email,
        role: adminUser.role,
        adminRole: adminUser.adminRole,
        name: adminUser.firstName + ' ' + adminUser.lastName
      }
    });
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  socialLogin,
  createAdminUser
};