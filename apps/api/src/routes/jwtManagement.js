/**
 * @fileoverview JWT Management Routes for LUDUS Platform
 *
 * Purpose: Administrative routes for managing JWT tokens, user sessions,
 * and security operations across the LUDUS platform.
 *
 * Business Context: Provides admin tools for managing user authentication,
 * monitoring security events, and maintaining platform security standards.
 *
 * Implementation Notes:
 * - Admin-only access controls
 * - Comprehensive JWT management endpoints
 * - Security audit and monitoring
 * - Rate limiting management
 * - Token validation and testing
 *
 * Dependencies:
 * - jwtController for business logic
 * - jwtAuth middleware for authentication
 * - Express router for routing
 *
 * Evolution: Created for comprehensive JWT management and security monitoring
 *
 * @version 1.0.0
 * @since 2025-01-08
 * @author LUDUS Development Team
 */

const express = require('express');
const router = express.Router();
const {
  revokeUserTokens,
  revokeRefreshToken,
  getUserSessions,
  getJWTStats,
  clearIPRateLimit,
  getSecurityAuditLog,
  forceLogoutAllUsers,
  validateToken
} = require('../controllers/jwtController');
const { requireAdminRole } = require('../middleware/jwtAuth');

// All routes require admin authentication
router.use(requireAdminRole('SA', 'ADMIN')); // Super Admin or Admin

/**
 * @route POST /api/jwt/revoke-user-tokens/:userId
 * @desc Revoke all tokens for a specific user
 * @access Admin only
 */
router.post('/revoke-user-tokens/:userId', revokeUserTokens);

/**
 * @route POST /api/jwt/revoke-refresh-token
 * @desc Revoke a specific refresh token
 * @access Admin only
 */
router.post('/revoke-refresh-token', revokeRefreshToken);

/**
 * @route GET /api/jwt/user-sessions/:userId
 * @desc Get user's active sessions
 * @access Admin only
 */
router.get('/user-sessions/:userId', getUserSessions);

/**
 * @route GET /api/jwt/stats
 * @desc Get JWT service statistics
 * @access Admin only
 */
router.get('/stats', getJWTStats);

/**
 * @route POST /api/jwt/clear-rate-limit/:ip
 * @desc Clear rate limiting for specific IP
 * @access Admin only
 */
router.post('/clear-rate-limit/:ip', clearIPRateLimit);

/**
 * @route GET /api/jwt/security-audit
 * @desc Get security audit log
 * @access Admin only
 */
router.get('/security-audit', getSecurityAuditLog);

/**
 * @route POST /api/jwt/force-logout-all
 * @desc Force logout all users (emergency function)
 * @access Super Admin only
 */
router.post('/force-logout-all', requireAdminRole('SA'), forceLogoutAllUsers);

/**
 * @route POST /api/jwt/validate-token
 * @desc Validate JWT token (for testing)
 * @access Admin only
 */
router.post('/validate-token', validateToken);

module.exports = router;

