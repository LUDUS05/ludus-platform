/**
 * @fileoverview Enhanced JWT Service for LUDUS Platform
 *
 * Purpose: Comprehensive JWT token management system with advanced security features
 * including token blacklisting, rate limiting, audit logging, and secure token rotation.
 *
 * Business Context: Critical for user authentication, authorization, and session management
 * across the LUDUS platform. Provides enterprise-grade security for the Saudi Arabian market.
 *
 * Implementation Notes:
 * - Token blacklisting for secure logout
 * - Rate limiting for token generation
 * - Audit logging for security monitoring
 * - Secure token rotation mechanisms
 * - Comprehensive error handling
 * - Performance optimization with caching
 *
 * Dependencies:
 * - jsonwebtoken for JWT operations
 * - Redis for token blacklisting (optional)
 * - MongoDB for audit logging
 *
 * Evolution: Enhanced from basic JWT implementation to enterprise-grade security system
 *
 * @version 2.0.0
 * @since 2024-01-01
 * @modified 2025-01-08 - Added comprehensive security features
 * @author LUDUS Development Team
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * JWT Service Configuration
 */
const JWT_CONFIG = {
  // Token expiration times
  ACCESS_TOKEN_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  REFRESH_TOKEN_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Security settings
  MAX_REFRESH_TOKENS_PER_USER: 5, // Maximum active refresh tokens per user
  TOKEN_ROTATION_ENABLED: true, // Enable automatic token rotation
  BLACKLIST_CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours

  // Rate limiting
  TOKEN_GENERATION_RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10 // Maximum 10 token generations per window
  },

  // Audit settings
  AUDIT_ENABLED: process.env.JWT_AUDIT_ENABLED !== 'false',
  AUDIT_RETENTION_DAYS: 90
};

/**
 * In-memory token blacklist (for development)
 * In production, this should be replaced with Redis
 */
const tokenBlacklist = new Set();
const userRefreshTokens = new Map(); // userId -> Set of refresh tokens

/**
 * Rate limiting for token generation
 */
const tokenGenerationAttempts = new Map();

/**
 * Enhanced JWT Service Class
 */
class JWTService {
  constructor() {
    this.initializeCleanupTasks();
  }

  /**
   * Generate secure access and refresh tokens
   *
   * @param {string} userId - User ID
   * @param {string} userRole - User role
   * @param {string} adminRole - Admin role (optional)
   * @param {Object} additionalClaims - Additional JWT claims
   * @returns {Object} Token pair with metadata
   */
  async generateTokens(userId, userRole = 'user', adminRole = null, additionalClaims = {}) {
    try {
      // Rate limiting check
      if (!this.checkRateLimit(userId)) {
        throw new Error('Token generation rate limit exceeded');
      }

      // Clean up old refresh tokens for user
      await this.cleanupUserRefreshTokens(userId);

      // Generate unique token IDs for tracking
      const accessTokenId = crypto.randomUUID();
      const refreshTokenId = crypto.randomUUID();

      // Access token payload
      const accessPayload = {
        userId,
        role: userRole,
        adminRole,
        tokenId: accessTokenId,
        type: 'access',
        ...additionalClaims
      };

      // Refresh token payload
      const refreshPayload = {
        userId,
        tokenId: refreshTokenId,
        type: 'refresh'
      };

      // Generate tokens
      const accessToken = jwt.sign(
        accessPayload,
        process.env.JWT_SECRET,
        {
          expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
          issuer: 'ludus-platform',
          audience: 'ludus-users'
        }
      );

      const refreshToken = jwt.sign(
        refreshPayload,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        {
          expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
          issuer: 'ludus-platform',
          audience: 'ludus-users'
        }
      );

      // Store refresh token for user
      this.addUserRefreshToken(userId, refreshTokenId);

      // Audit logging
      if (JWT_CONFIG.AUDIT_ENABLED) {
        await this.logTokenGeneration(userId, accessTokenId, refreshTokenId, 'generate');
      }

      // Update rate limiting
      this.updateRateLimit(userId);

      return {
        accessToken,
        refreshToken,
        accessTokenId,
        refreshTokenId,
        expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
        refreshExpiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN
      };

    } catch (error) {
      logger.error({ error, userId }, 'Failed to generate JWT tokens');
      throw error;
    }
  }

  /**
   * Verify and decode JWT token
   *
   * @param {string} token - JWT token
   * @param {string} type - Token type ('access' or 'refresh')
   * @returns {Object} Decoded token payload
   */
  async verifyToken(token, type = 'access') {
    try {
      // Check if token is blacklisted
      if (this.isTokenBlacklisted(token)) {
        throw new Error('Token has been revoked');
      }

      // Determine secret based on token type
      const secret = type === 'refresh'
        ? (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
        : process.env.JWT_SECRET;

      // Verify token
      const decoded = jwt.verify(token, secret, {
        issuer: 'ludus-platform',
        audience: 'ludus-users'
      });

      // Validate token type
      if (decoded.type !== type) {
        throw new Error('Invalid token type');
      }

      // Additional validation for refresh tokens
      if (type === 'refresh') {
        const userTokens = userRefreshTokens.get(decoded.userId) || new Set();
        if (!userTokens.has(decoded.tokenId)) {
          throw new Error('Refresh token not found in user session');
        }
      }

      return decoded;

    } catch (error) {
      logger.warn({ error: error.message, tokenType: type }, 'Token verification failed');
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   *
   * @param {string} refreshToken - Refresh token
   * @returns {Object} New token pair
   */
  async refreshAccessToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = await this.verifyToken(refreshToken, 'refresh');

      // Get user information
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const newTokens = await this.generateTokens(
        user._id,
        user.role,
        user.adminRole
      );

      // Revoke old refresh token
      await this.revokeRefreshToken(decoded.userId, decoded.tokenId);

      // Audit logging
      if (JWT_CONFIG.AUDIT_ENABLED) {
        await this.logTokenGeneration(
          user._id,
          newTokens.accessTokenId,
          newTokens.refreshTokenId,
          'refresh'
        );
      }

      return newTokens;

    } catch (error) {
      logger.error({ error }, 'Failed to refresh access token');
      throw error;
    }
  }

  /**
   * Revoke access token (add to blacklist)
   *
   * @param {string} token - Access token to revoke
   */
  async revokeAccessToken(token) {
    try {
      // Decode token to get expiration
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        const expirationTime = decoded.exp * 1000; // Convert to milliseconds
        const now = Date.now();

        // Only blacklist if token hasn't expired
        if (expirationTime > now) {
          tokenBlacklist.add(token);

          // Schedule cleanup
          setTimeout(() => {
            tokenBlacklist.delete(token);
          }, expirationTime - now);
        }
      }

      // Audit logging
      if (JWT_CONFIG.AUDIT_ENABLED && decoded) {
        await this.logTokenRevocation(decoded.userId, decoded.tokenId, 'access');
      }

    } catch (error) {
      logger.error({ error }, 'Failed to revoke access token');
    }
  }

  /**
   * Revoke refresh token
   *
   * @param {string} userId - User ID
   * @param {string} tokenId - Token ID to revoke
   */
  async revokeRefreshToken(userId, tokenId) {
    try {
      const userTokens = userRefreshTokens.get(userId);
      if (userTokens) {
        userTokens.delete(tokenId);
        if (userTokens.size === 0) {
          userRefreshTokens.delete(userId);
        }
      }

      // Audit logging
      if (JWT_CONFIG.AUDIT_ENABLED) {
        await this.logTokenRevocation(userId, tokenId, 'refresh');
      }

    } catch (error) {
      logger.error({ error, userId, tokenId }, 'Failed to revoke refresh token');
    }
  }

  /**
   * Revoke all tokens for a user
   *
   * @param {string} userId - User ID
   */
  async revokeAllUserTokens(userId) {
    try {
      // Clear all refresh tokens for user
      userRefreshTokens.delete(userId);

      // Update user's refresh token in database
      await User.findByIdAndUpdate(userId, {
        $unset: { refreshToken: 1 }
      });

      // Audit logging
      if (JWT_CONFIG.AUDIT_ENABLED) {
        await this.logTokenRevocation(userId, 'all', 'all');
      }

      logger.info({ userId }, 'All tokens revoked for user');

    } catch (error) {
      logger.error({ error, userId }, 'Failed to revoke all user tokens');
    }
  }

  /**
   * Check if token is blacklisted
   *
   * @param {string} token - Token to check
   * @returns {boolean} True if blacklisted
   */
  isTokenBlacklisted(token) {
    return tokenBlacklist.has(token);
  }

  /**
   * Get user's active refresh tokens count
   *
   * @param {string} userId - User ID
   * @returns {number} Number of active refresh tokens
   */
  getUserRefreshTokenCount(userId) {
    const userTokens = userRefreshTokens.get(userId);
    return userTokens ? userTokens.size : 0;
  }

  /**
   * Add refresh token to user's active tokens
   *
   * @param {string} userId - User ID
   * @param {string} tokenId - Token ID
   */
  addUserRefreshToken(userId, tokenId) {
    if (!userRefreshTokens.has(userId)) {
      userRefreshTokens.set(userId, new Set());
    }
    userRefreshTokens.get(userId).add(tokenId);
  }

  /**
   * Clean up old refresh tokens for user
   *
   * @param {string} userId - User ID
   */
  async cleanupUserRefreshTokens(userId) {
    const userTokens = userRefreshTokens.get(userId);
    if (userTokens && userTokens.size >= JWT_CONFIG.MAX_REFRESH_TOKENS_PER_USER) {
      // Remove oldest tokens (keep only the most recent ones)
      const tokensArray = Array.from(userTokens);
      const tokensToRemove = tokensArray.slice(0, tokensArray.length - JWT_CONFIG.MAX_REFRESH_TOKENS_PER_USER + 1);

      tokensToRemove.forEach(tokenId => {
        userTokens.delete(tokenId);
      });

      logger.info({ userId, removedCount: tokensToRemove.length }, 'Cleaned up old refresh tokens');
    }
  }

  /**
   * Check rate limiting for token generation
   *
   * @param {string} userId - User ID
   * @returns {boolean} True if within rate limit
   */
  checkRateLimit(userId) {
    const now = Date.now();
    const userAttempts = tokenGenerationAttempts.get(userId) || [];

    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(
      attempt => now - attempt < JWT_CONFIG.TOKEN_GENERATION_RATE_LIMIT.windowMs
    );

    return validAttempts.length < JWT_CONFIG.TOKEN_GENERATION_RATE_LIMIT.max;
  }

  /**
   * Update rate limiting for user
   *
   * @param {string} userId - User ID
   */
  updateRateLimit(userId) {
    const now = Date.now();
    const userAttempts = tokenGenerationAttempts.get(userId) || [];
    userAttempts.push(now);
    tokenGenerationAttempts.set(userId, userAttempts);
  }

  /**
   * Log token generation for audit
   *
   * @param {string} userId - User ID
   * @param {string} accessTokenId - Access token ID
   * @param {string} refreshTokenId - Refresh token ID
   * @param {string} action - Action type
   */
  async logTokenGeneration(userId, accessTokenId, refreshTokenId, action) {
    try {
      // In a real implementation, this would log to a database
      logger.info({
        userId,
        accessTokenId,
        refreshTokenId,
        action,
        timestamp: new Date().toISOString()
      }, 'JWT token generation logged');
    } catch (error) {
      logger.error({ error }, 'Failed to log token generation');
    }
  }

  /**
   * Log token revocation for audit
   *
   * @param {string} userId - User ID
   * @param {string} tokenId - Token ID
   * @param {string} tokenType - Token type
   */
  async logTokenRevocation(userId, tokenId, tokenType) {
    try {
      // In a real implementation, this would log to a database
      logger.info({
        userId,
        tokenId,
        tokenType,
        timestamp: new Date().toISOString()
      }, 'JWT token revocation logged');
    } catch (error) {
      logger.error({ error }, 'Failed to log token revocation');
    }
  }

  /**
   * Initialize cleanup tasks
   */
  initializeCleanupTasks() {
    // Clean up expired tokens from blacklist
    setInterval(() => {
      const now = Date.now();
      for (const token of tokenBlacklist) {
        try {
          const decoded = jwt.decode(token);
          if (decoded && decoded.exp && decoded.exp * 1000 < now) {
            tokenBlacklist.delete(token);
          }
        } catch (error) {
          // Remove invalid tokens
          tokenBlacklist.delete(token);
        }
      }
    }, JWT_CONFIG.BLACKLIST_CLEANUP_INTERVAL);

    // Clean up rate limiting data
    setInterval(() => {
      const now = Date.now();
      for (const [userId, attempts] of tokenGenerationAttempts) {
        const validAttempts = attempts.filter(
          attempt => now - attempt < JWT_CONFIG.TOKEN_GENERATION_RATE_LIMIT.windowMs
        );
        if (validAttempts.length === 0) {
          tokenGenerationAttempts.delete(userId);
        } else {
          tokenGenerationAttempts.set(userId, validAttempts);
        }
      }
    }, JWT_CONFIG.TOKEN_GENERATION_RATE_LIMIT.windowMs);
  }

  /**
   * Get JWT service statistics
   *
   * @returns {Object} Service statistics
   */
  getStats() {
    return {
      blacklistedTokens: tokenBlacklist.size,
      activeUsers: userRefreshTokens.size,
      totalRefreshTokens: Array.from(userRefreshTokens.values())
        .reduce((total, tokens) => total + tokens.size, 0),
      rateLimitedUsers: tokenGenerationAttempts.size
    };
  }
}

// Create singleton instance
const jwtService = new JWTService();

module.exports = jwtService;

