/**
 * @fileoverview JWT Management Controller for LUDUS Platform
 *
 * Purpose: Administrative controller for managing JWT tokens, user sessions,
 * and security operations across the LUDUS platform.
 *
 * Business Context: Provides admin tools for managing user authentication,
 * monitoring security events, and maintaining platform security standards.
 *
 * Implementation Notes:
 * - Token revocation and management
 * - User session monitoring
 * - Security audit and reporting
 * - Rate limiting management
 * - Token statistics and analytics
 *
 * Dependencies:
 * - jwtService for token operations
 * - User model for user management
 * - Audit logging utilities
 *
 * Evolution: Created for comprehensive JWT management and security monitoring
 *
 * @version 1.0.0
 * @since 2025-01-08
 * @author LUDUS Development Team
 */

const jwtService = require('../services/jwtService');
const User = require('../models/User');
const { clearRateLimit, getAuthStats } = require('../middleware/jwtAuth');
const logger = require('../utils/logger');

/**
 * Revoke all tokens for a specific user
 *
 * @param {import('express').Request} req - The Express request object
 * @param {import('express').Response} res - The Express response object
 * @param {import('express').NextFunction} next - The Express next middleware function
 * @returns {Promise<void>}
 */
const revokeUserTokens = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Revoke all tokens for user
    await jwtService.revokeAllUserTokens(userId);

    logger.info({
      userId,
      adminId: req.user.id,
      action: 'revoke_all_tokens'
    }, 'All tokens revoked for user by admin');

    res.json({
      success: true,
      message: 'All tokens revoked successfully',
      data: {
        userId,
        revokedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error({ error, userId: req.params.userId }, 'Failed to revoke user tokens');
    next(error);
  }
};

/**
 * Revoke a specific refresh token
 *
 * @param {import('express').Request} req - The Express request object
 * @param {import('express').Response} res - The Express response object
 * @param {import('express').NextFunction} next - The Express next middleware function
 * @returns {Promise<void>}
 */
const revokeRefreshToken = async (req, res, next) => {
  try {
    const { userId, tokenId } = req.body;

    if (!userId || !tokenId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Token ID are required'
      });
    }

    // Revoke specific refresh token
    await jwtService.revokeRefreshToken(userId, tokenId);

    logger.info({
      userId,
      tokenId,
      adminId: req.user.id,
      action: 'revoke_refresh_token'
    }, 'Refresh token revoked by admin');

    res.json({
      success: true,
      message: 'Refresh token revoked successfully',
      data: {
        userId,
        tokenId,
        revokedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error({ error, userId: req.body.userId }, 'Failed to revoke refresh token');
    next(error);
  }
};

/**
 * Get user's active sessions
 *
 * @param {import('express').Request} req - The Express request object
 * @param {import('express').Response} res - The Express response object
 * @param {import('express').NextFunction} next - The Express next middleware function
 * @returns {Promise<void>}
 */
const getUserSessions = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's active refresh token count
    const activeRefreshTokens = jwtService.getUserRefreshTokenCount(userId);

    res.json({
      success: true,
      data: {
        userId,
        activeRefreshTokens,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        isEmailVerified: user.isEmailVerified,
        status: user.status
      }
    });

  } catch (error) {
    logger.error({ error, userId: req.params.userId }, 'Failed to get user sessions');
    next(error);
  }
};

/**
 * Get JWT service statistics
 *
 * @param {import('express').Request} req - The Express request object
 * @param {import('express').Response} res - The Express response object
 * @param {import('express').NextFunction} next - The Express next middleware function
 * @returns {Promise<void>}
 */
const getJWTStats = async (req, res, next) => {
  try {
    const stats = getAuthStats();

    res.json({
      success: true,
      data: {
        jwt: stats.jwtStats,
        authentication: {
          rateLimitedIPs: stats.rateLimitedIPs,
          totalRateLimitedIPs: stats.totalRateLimitedIPs
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error({ error }, 'Failed to get JWT statistics');
    next(error);
  }
};

/**
 * Clear rate limiting for specific IP
 *
 * @param {import('express').Request} req - The Express request object
 * @param {import('express').Response} res - The Express response object
 * @param {import('express').NextFunction} next - The Express next middleware function
 * @returns {Promise<void>}
 */
const clearIPRateLimit = async (req, res, next) => {
  try {
    const { ip } = req.params;

    if (!ip) {
      return res.status(400).json({
        success: false,
        message: 'IP address is required'
      });
    }

    // Clear rate limiting for IP
    clearRateLimit(ip);

    logger.info({
      ip,
      adminId: req.user.id,
      action: 'clear_rate_limit'
    }, 'Rate limit cleared for IP by admin');

    res.json({
      success: true,
      message: 'Rate limit cleared successfully',
      data: {
        ip,
        clearedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error({ error, ip: req.params.ip }, 'Failed to clear IP rate limit');
    next(error);
  }
};

/**
 * Get security audit log
 *
 * @param {import('express').Request} req - The Express request object
 * @param {import('express').Response} res - The Express response object
 * @param {import('express').NextFunction} next - The Express next middleware function
 * @returns {Promise<void>}
 */
const getSecurityAuditLog = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      userId,
      action,
      startDate,
      endDate
    } = req.query;

    // In a real implementation, this would query an audit log database
    // For now, we'll return a mock response
    const auditLog = {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 0,
      data: []
    };

    logger.info({
      adminId: req.user.id,
      action: 'get_security_audit_log',
      filters: { userId, action, startDate, endDate }
    }, 'Security audit log requested by admin');

    res.json({
      success: true,
      data: auditLog
    });

  } catch (error) {
    logger.error({ error }, 'Failed to get security audit log');
    next(error);
  }
};

/**
 * Force logout all users (emergency function)
 *
 * @param {import('express').Request} req - The Express request object
 * @param {import('express').Response} res - The Express response object
 * @param {import('express').NextFunction} next - The Express next middleware function
 * @returns {Promise<void>}
 */
const forceLogoutAllUsers = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required for force logout'
      });
    }

    // Clear all refresh tokens from database
    await User.updateMany(
      {},
      { $unset: { refreshToken: 1 } }
    );

    // Clear all user refresh tokens from memory
    // This would need to be implemented in jwtService

    logger.warn({
      adminId: req.user.id,
      action: 'force_logout_all_users',
      reason
    }, 'Force logout all users executed by admin');

    res.json({
      success: true,
      message: 'All users have been logged out',
      data: {
        reason,
        executedAt: new Date().toISOString(),
        executedBy: req.user.id
      }
    });

  } catch (error) {
    logger.error({ error }, 'Failed to force logout all users');
    next(error);
  }
};

/**
 * Validate JWT token (for testing)
 *
 * @param {import('express').Request} req - The Express request object
 * @param {import('express').Response} res - The Express response object
 * @param {import('express').NextFunction} next - The Express next middleware function
 * @returns {Promise<void>}
 */
const validateToken = async (req, res, next) => {
  try {
    const { token, type = 'access' } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    try {
      const decoded = await jwtService.verifyToken(token, type);

      res.json({
        success: true,
        data: {
          valid: true,
          decoded,
          type
        }
      });

    } catch (error) {
      res.json({
        success: true,
        data: {
          valid: false,
          error: error.message,
          type
        }
      });
    }

  } catch (error) {
    logger.error({ error }, 'Failed to validate token');
    next(error);
  }
};

module.exports = {
  revokeUserTokens,
  revokeRefreshToken,
  getUserSessions,
  getJWTStats,
  clearIPRateLimit,
  getSecurityAuditLog,
  forceLogoutAllUsers,
  validateToken
};

