/**
 * Rate Limiting Middleware
 * 
 * This middleware integrates with the rate limiting service to:
 * - Apply rate limits to API endpoints
 * - Extract identifiers (user ID, IP address) from requests
 * - Return appropriate rate limit headers and responses
 * - Handle rate limit violations gracefully
 */

const rateLimitingService = require('../services/rateLimitingService');
const logger = require('../utils/logger');

/**
 * Create rate limiting middleware for a specific endpoint
 */
function createRateLimitMiddleware(endpoint, identifierExtractor = null) {
  return async (req, res, next) => {
    try {
      // Extract identifier (user ID, IP address, etc.)
      let identifier;
      
      if (identifierExtractor) {
        identifier = identifierExtractor(req);
      } else {
        // Default identifier extraction
        identifier = req.user?.id || req.ip || req.connection.remoteAddress || 'anonymous';
      }
      
      if (!identifier) {
        identifier = 'anonymous';
      }
      
      // Check rate limit
      const rateLimitResult = await rateLimitingService.isAllowed(identifier, endpoint);
      
      // Add rate limit headers to response
      const headers = rateLimitingService.generateRateLimitHeaders(rateLimitResult);
      Object.keys(headers).forEach(key => {
        res.set(key, headers[key]);
      });
      
      // Check if request is allowed
      if (!rateLimitResult.allowed) {
        logger.warn(`Rate limit exceeded for ${identifier}:${endpoint}`);
        
        // Return rate limit response
        const rateLimitResponse = rateLimitingService.generateRateLimitResponse(rateLimitResult);
        
        // Set Retry-After header
        res.set('Retry-After', rateLimitResponse.retryAfter);
        
        return res.status(429).json(rateLimitResponse);
      }
      
      // Request allowed, continue
      next();
      
    } catch (error) {
      logger.error(`Rate limiting middleware error for ${endpoint}:`, error);
      // On error, allow request to continue (fail open)
      next();
    }
  };
}

/**
 * Rate limiting middleware for referral system endpoints
 */
const referralRateLimiting = {
  // Referral code generation
  generateCode: createRateLimitMiddleware('referral:generate_code', (req) => req.user?.id),
  
  // Referral registration processing
  processRegistration: createRateLimitMiddleware('referral:process_registration', (req) => req.ip),
  
  // Referral booking processing
  processBooking: createRateLimitMiddleware('referral:process_booking', (req) => req.user?.id),
  
  // QR code generation
  generateQR: createRateLimitMiddleware('qr:generate', (req) => req.user?.id),
  
  // QR code download
  downloadQR: createRateLimitMiddleware('qr:download', (req) => req.ip),
  
  // Social sharing
  socialShare: createRateLimitMiddleware('social:share', (req) => req.user?.id),
  
  // Analytics API
  analytics: createRateLimitMiddleware('api:analytics', (req) => req.user?.id),
  
  // Reports API
  reports: createRateLimitMiddleware('api:reports', (req) => req.user?.id),
  
  // General referrals API
  referrals: createRateLimitMiddleware('api:referrals', (req) => req.user?.id || req.ip),
  
  // Admin actions
  adminAnalytics: createRateLimitMiddleware('admin:analytics', (req) => req.user?.id),
  adminReports: createRateLimitMiddleware('admin:reports', (req) => req.user?.id),
  adminConfig: createRateLimitMiddleware('admin:config', (req) => req.user?.id),
  
  // User actions
  userLogin: createRateLimitMiddleware('user:login', (req) => req.ip),
  userRegister: createRateLimitMiddleware('user:register', (req) => req.ip),
  userPasswordReset: createRateLimitMiddleware('user:password_reset', (req) => req.ip),
  
  // Monitoring
  monitoringHealth: createRateLimitMiddleware('monitoring:health', (req) => req.ip),
  monitoringMetrics: createRateLimitMiddleware('monitoring:metrics', (req) => req.user?.id || req.ip)
};

/**
 * Dynamic rate limiting middleware that can be configured per route
 */
function dynamicRateLimit(endpoint, identifierExtractor = null) {
  return createRateLimitMiddleware(endpoint, identifierExtractor);
}

/**
 * Bulk rate limiting for multiple endpoints
 */
function bulkRateLimit(endpoints) {
  return async (req, res, next) => {
    try {
      const identifier = req.user?.id || req.ip || req.connection.remoteAddress || 'anonymous';
      
      // Check all endpoints
      for (const endpoint of endpoints) {
        const result = await rateLimitingService.isAllowed(identifier, endpoint);
        
        if (!result.allowed) {
          logger.warn(`Rate limit exceeded for ${identifier}:${endpoint}`);
          
          const rateLimitResponse = rateLimitingService.generateRateLimitResponse(result);
          const headers = rateLimitingService.generateRateLimitHeaders(result);
          
          Object.keys(headers).forEach(key => {
            res.set(key, headers[key]);
          });
          
          res.set('Retry-After', rateLimitResponse.retryAfter);
          return res.status(429).json(rateLimitResponse);
        }
      }
      
      // All checks passed
      next();
      
    } catch (error) {
      logger.error('Bulk rate limiting error:', error);
      next();
    }
  };
}

/**
 * Rate limiting middleware for referral system with custom limits
 */
function referralSystemRateLimit(customLimits = {}) {
  return async (req, res, next) => {
    try {
      const identifier = req.user?.id || req.ip || req.connection.remoteAddress || 'anonymous';
      const path = req.path;
      
      // Determine endpoint based on path
      let endpoint;
      if (path.includes('/referrals/generate-code')) {
        endpoint = 'referral:generate_code';
      } else if (path.includes('/referrals/process-registration')) {
        endpoint = 'referral:process_registration';
      } else if (path.includes('/referrals/process-booking')) {
        endpoint = 'referral:process_booking';
      } else if (path.includes('/qr/generate')) {
        endpoint = 'qr:generate';
      } else if (path.includes('/qr/download')) {
        endpoint = 'qr:download';
      } else if (path.includes('/social/share')) {
        endpoint = 'social:share';
      } else if (path.includes('/analytics')) {
        endpoint = 'api:analytics';
      } else if (path.includes('/reports')) {
        endpoint = 'api:reports';
      } else {
        endpoint = 'api:referrals';
      }
      
      // Check rate limit
      const result = await rateLimitingService.isAllowed(identifier, endpoint);
      
      // Add headers
      const headers = rateLimitingService.generateRateLimitHeaders(result);
      Object.keys(headers).forEach(key => {
        res.set(key, headers[key]);
      });
      
      if (!result.allowed) {
        const rateLimitResponse = rateLimitingService.generateRateLimitResponse(result);
        res.set('Retry-After', rateLimitResponse.retryAfter);
        return res.status(429).json(rateLimitResponse);
      }
      
      next();
      
    } catch (error) {
      logger.error('Referral system rate limiting error:', error);
      next();
    }
  };
}

module.exports = {
  createRateLimitMiddleware,
  referralRateLimiting,
  dynamicRateLimit,
  bulkRateLimit,
  referralSystemRateLimit
};
