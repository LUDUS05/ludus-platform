/**
 * @fileoverview Enhanced JWT Authentication Middleware for LUDUS Platform
 *
 * Purpose: Advanced JWT authentication middleware with comprehensive security features
 * including rate limiting, audit logging, token validation, and role-based access control.
 *
 * Business Context: Critical for securing all API endpoints and ensuring proper
 * user authentication and authorization across the LUDUS platform.
 *
 * Implementation Notes:
 * - Comprehensive token validation
 * - Rate limiting for authentication attempts
 * - Audit logging for security monitoring
 * - Role-based access control
 * - Token blacklisting support
 * - Performance optimization with caching
 *
 * Dependencies:
 * - jwtService for token operations
 * - User model for user validation
 * - Rate limiting utilities
 *
 * Evolution: Enhanced from basic JWT middleware to enterprise-grade security system
 *
 * @version 2.0.0
 * @since 2024-01-01
 * @modified 2025-01-08 - Added comprehensive security features
 * @author LUDUS Development Team
 */

const jwtService = require('../services/jwtService');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Rate limiting for authentication attempts
 */
const authAttempts = new Map();
const AUTH_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 failed attempts per window
  blockDuration: 30 * 60 * 1000 // 30 minutes block duration
};

/**
 * Enhanced JWT Authentication Middleware
 *
 * @param {Object} options - Middleware options
 * @param {boolean} options.requireAuth - Whether authentication is required
 * @param {Array} options.allowedRoles - Allowed user roles
 * @param {Array} options.allowedAdminRoles - Allowed admin roles
 * @param {boolean} options.requireEmailVerification - Whether email verification is required
 * @param {boolean} options.auditLog - Whether to log authentication attempts
 * @returns {Function} Express middleware function
 */
const jwtAuth = (options = {}) => {
  const {
    requireAuth = true,
    allowedRoles = [],
    allowedAdminRoles = [],
    requireEmailVerification = false,
    auditLog = true
  } = options;

  return async (req, res, next) => {
    try {
      const startTime = Date.now();
      const clientIP = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Unknown';

      // Extract token from Authorization header
      const authHeader = req.header('Authorization');
      if (!authHeader) {
        if (requireAuth) {
          return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.',
            code: 'NO_TOKEN'
          });
        }
        return next();
      }

      const token = authHeader.replace('Bearer ', '');
      if (!token) {
        if (requireAuth) {
          return res.status(401).json({
            success: false,
            message: 'Access denied. Invalid token format.',
            code: 'INVALID_TOKEN_FORMAT'
          });
        }
        return next();
      }

      // Rate limiting check
      if (requireAuth && !checkAuthRateLimit(clientIP)) {
        if (auditLog) {
          logger.warn({
            clientIP,
            userAgent,
            action: 'rate_limited',
            timestamp: new Date().toISOString()
          }, 'Authentication rate limit exceeded');
        }

        return res.status(429).json({
          success: false,
          message: 'Too many authentication attempts. Please try again later.',
          code: 'RATE_LIMITED',
          retryAfter: AUTH_RATE_LIMIT.blockDuration / 1000
        });
      }

      // Verify token
      const decoded = await jwtService.verifyToken(token, 'access');

      // Get user information
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        if (auditLog) {
          logger.warn({
            userId: decoded.userId,
            clientIP,
            userAgent,
            action: 'user_not_found',
            timestamp: new Date().toISOString()
          }, 'Token valid but user not found');
        }

        return res.status(401).json({
          success: false,
          message: 'Invalid token. User not found.',
          code: 'USER_NOT_FOUND'
        });
      }

      // Check if user is active
      if (user.status && user.status !== 'active') {
        if (auditLog) {
          logger.warn({
            userId: user._id,
            clientIP,
            userAgent,
            action: 'user_inactive',
            userStatus: user.status,
            timestamp: new Date().toISOString()
          }, 'Authentication attempt with inactive user');
        }

        return res.status(401).json({
          success: false,
          message: 'Account is inactive. Please contact support.',
          code: 'USER_INACTIVE'
        });
      }

      // Check email verification requirement
      if (requireEmailVerification && !user.isEmailVerified) {
        if (auditLog) {
          logger.warn({
            userId: user._id,
            clientIP,
            userAgent,
            action: 'email_not_verified',
            timestamp: new Date().toISOString()
          }, 'Authentication attempt with unverified email');
        }

        return res.status(403).json({
          success: false,
          message: 'Email verification required.',
          code: 'EMAIL_NOT_VERIFIED'
        });
      }

      // Role-based access control
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        if (auditLog) {
          logger.warn({
            userId: user._id,
            clientIP,
            userAgent,
            action: 'insufficient_role',
            userRole: user.role,
            requiredRoles: allowedRoles,
            timestamp: new Date().toISOString()
          }, 'Authentication attempt with insufficient role');
        }

        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.',
          code: 'INSUFFICIENT_ROLE'
        });
      }

      // Admin role access control
      if (allowedAdminRoles.length > 0) {
        if (user.role !== 'admin' || !user.adminRole || !allowedAdminRoles.includes(user.adminRole)) {
          if (auditLog) {
            logger.warn({
              userId: user._id,
              clientIP,
              userAgent,
              action: 'insufficient_admin_role',
              userRole: user.role,
              adminRole: user.adminRole,
              requiredAdminRoles: allowedAdminRoles,
              timestamp: new Date().toISOString()
            }, 'Authentication attempt with insufficient admin role');
          }

          return res.status(403).json({
            success: false,
            message: 'Access denied. Insufficient admin permissions.',
            code: 'INSUFFICIENT_ADMIN_ROLE'
          });
        }
      }

      // Set user information in request
      req.user = {
        id: user._id,
        _id: user._id, // For backward compatibility
        role: user.role,
        adminRole: user.adminRole,
        isEmailVerified: user.isEmailVerified,
        status: user.status,
        tokenId: decoded.tokenId
      };

      // Set full user object if needed
      if (options.includeFullUser) {
        req.user = user;
      }

      // Log successful authentication
      if (auditLog) {
        const duration = Date.now() - startTime;
        logger.info({
          userId: user._id,
          clientIP,
          userAgent,
          action: 'authentication_success',
          duration,
          userRole: user.role,
          adminRole: user.adminRole,
          timestamp: new Date().toISOString()
        }, 'Successful authentication');
      }

      next();

    } catch (error) {
      const clientIP = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Unknown';

      // Log authentication failure
      if (auditLog) {
        logger.warn({
          clientIP,
          userAgent,
          action: 'authentication_failed',
          error: error.message,
          timestamp: new Date().toISOString()
        }, 'Authentication failed');
      }

      // Update rate limiting
      if (requireAuth) {
        updateAuthRateLimit(clientIP);
      }

      // Handle specific JWT errors
      if (error.message === 'Token has been revoked') {
        return res.status(401).json({
          success: false,
          message: 'Token has been revoked. Please log in again.',
          code: 'TOKEN_REVOKED'
        });
      }

      if (error.message === 'jwt expired') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please refresh your token.',
          code: 'TOKEN_EXPIRED'
        });
      }

      if (error.message === 'Invalid token type') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token type.',
          code: 'INVALID_TOKEN_TYPE'
        });
      }

      // Generic error response
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
        code: 'INVALID_TOKEN'
      });
    }
  };
};

/**
 * Check authentication rate limit
 *
 * @param {string} clientIP - Client IP address
 * @returns {boolean} True if within rate limit
 */
function checkAuthRateLimit(clientIP) {
  const now = Date.now();
  const attempts = authAttempts.get(clientIP) || [];

  // Remove old attempts outside the window
  const validAttempts = attempts.filter(
    attempt => now - attempt < AUTH_RATE_LIMIT.windowMs
  );

  // Check if user is blocked
  const lastAttempt = validAttempts[validAttempts.length - 1];
  if (lastAttempt && now - lastAttempt < AUTH_RATE_LIMIT.blockDuration) {
    return false;
  }

  return validAttempts.length < AUTH_RATE_LIMIT.max;
}

/**
 * Update authentication rate limit
 *
 * @param {string} clientIP - Client IP address
 */
function updateAuthRateLimit(clientIP) {
  const now = Date.now();
  const attempts = authAttempts.get(clientIP) || [];
  attempts.push(now);
  authAttempts.set(clientIP, attempts);
}

/**
 * Role-based authorization middleware
 *
 * @param {...string} roles - Allowed roles
 * @returns {Function} Express middleware function
 */
const requireRole = (...roles) => {
  return jwtAuth({
    requireAuth: true,
    allowedRoles: roles,
    auditLog: true
  });
};

/**
 * Admin role authorization middleware
 *
 * @param {...string} adminRoles - Allowed admin roles
 * @returns {Function} Express middleware function
 */
const requireAdminRole = (...adminRoles) => {
  return jwtAuth({
    requireAuth: true,
    allowedRoles: ['admin'],
    allowedAdminRoles: adminRoles,
    auditLog: true
  });
};

/**
 * Email verification required middleware
 *
 * @returns {Function} Express middleware function
 */
const requireEmailVerification = () => {
  return jwtAuth({
    requireAuth: true,
    requireEmailVerification: true,
    auditLog: true
  });
};

/**
 * Optional authentication middleware
 *
 * @returns {Function} Express middleware function
 */
const optionalAuth = () => {
  return jwtAuth({
    requireAuth: false,
    auditLog: false
  });
};

/**
 * Full user authentication middleware
 *
 * @returns {Function} Express middleware function
 */
const requireFullUser = () => {
  return jwtAuth({
    requireAuth: true,
    includeFullUser: true,
    auditLog: true
  });
};

/**
 * Clear rate limiting for IP (admin function)
 *
 * @param {string} clientIP - Client IP address
 */
const clearRateLimit = (clientIP) => {
  authAttempts.delete(clientIP);
  logger.info({ clientIP }, 'Rate limit cleared for IP');
};

/**
 * Get authentication statistics
 *
 * @returns {Object} Authentication statistics
 */
const getAuthStats = () => {
  const now = Date.now();
  const activeAttempts = Array.from(authAttempts.entries())
    .map(([ip, attempts]) => ({
      ip,
      attempts: attempts.filter(attempt => now - attempt < AUTH_RATE_LIMIT.windowMs).length
    }))
    .filter(entry => entry.attempts > 0);

  return {
    rateLimitedIPs: activeAttempts.length,
    totalRateLimitedIPs: authAttempts.size,
    jwtStats: jwtService.getStats()
  };
};

module.exports = {
  jwtAuth,
  requireRole,
  requireAdminRole,
  requireEmailVerification,
  optionalAuth,
  requireFullUser,
  clearRateLimit,
  getAuthStats
};

