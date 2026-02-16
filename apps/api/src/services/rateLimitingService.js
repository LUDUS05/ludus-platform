/**
 * Rate Limiting Service
 * 
 * This service provides:
 * - Redis-based rate limiting for distributed systems
 * - In-memory rate limiting as fallback
 * - Configurable limits for different endpoints
 * - Rate limiting strategies (sliding window, fixed window)
 * - Rate limit headers and responses
 * - Rate limit analytics and monitoring
 */

const Redis = require('ioredis');
const logger = require('../utils/logger');

class RateLimitingService {
  constructor() {
    this.redis = null;
    this.memoryLimits = new Map();
    this.rateLimitStats = {
      totalRequests: 0,
      rateLimited: 0,
      allowed: 0,
      errors: 0
    };
    
    // Rate limiting configuration
    this.config = {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB || 1, // Use different DB for rate limiting
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3
      },
      memory: {
        maxEntries: 10000,
        cleanupInterval: 60000 // 1 minute
      },
      defaultStrategy: 'sliding_window',
      prefix: 'rate_limit:',
      
      // Default rate limits
      limits: {
        // API endpoints
        'api:referrals': { requests: 100, window: 3600 },      // 100 requests per hour
        'api:analytics': { requests: 50, window: 3600 },       // 50 requests per hour
        'api:reports': { requests: 20, window: 3600 },         // 20 requests per hour
        
        // Referral system
        'referral:generate_code': { requests: 10, window: 3600 },    // 10 codes per hour
        'referral:process_registration': { requests: 5, window: 300 }, // 5 registrations per 5 minutes
        'referral:process_booking': { requests: 5, window: 300 },    // 5 bookings per 5 minutes
        
        // User actions
        'user:login': { requests: 5, window: 300 },            // 5 login attempts per 5 minutes
        'user:register': { requests: 3, window: 600 },         // 3 registrations per 10 minutes
        'user:password_reset': { requests: 3, window: 3600 },  // 3 password resets per hour
        
        // QR code generation
        'qr:generate': { requests: 20, window: 3600 },         // 20 QR codes per hour
        'qr:download': { requests: 50, window: 3600 },         // 50 downloads per hour
        
        // Social sharing
        'social:share': { requests: 30, window: 3600 },        // 30 shares per hour
        
        // Admin actions
        'admin:analytics': { requests: 200, window: 3600 },    // 200 requests per hour
        'admin:reports': { requests: 100, window: 3600 },      // 100 requests per hour
        'admin:config': { requests: 50, window: 3600 },        // 50 requests per hour
        
        // Monitoring
        'monitoring:health': { requests: 100, window: 300 },   // 100 health checks per 5 minutes
        'monitoring:metrics': { requests: 200, window: 300 },  // 200 metric requests per 5 minutes
      }
    };
    
    // Initialize rate limiting
    this.initializeRateLimiting();
  }

  // ===== INITIALIZATION =====

  /**
   * Initialize rate limiting service
   */
  async initializeRateLimiting() {
    try {
      logger.info('Initializing rate limiting service...');
      
      // Initialize Redis connection
      await this.initializeRedis();
      
      // Initialize memory rate limiting
      this.initializeMemoryRateLimiting();
      
      // Start cleanup process
      this.startCleanupProcess();
      
      logger.info('Rate limiting service initialized successfully');
      
    } catch (error) {
      logger.error('Failed to initialize rate limiting service:', error);
      // Continue with memory-only rate limiting
      this.initializeMemoryRateLimiting();
      this.startCleanupProcess();
    }
  }

  /**
   * Initialize Redis connection
   */
  async initializeRedis() {
    try {
      this.redis = new Redis({
        host: this.config.redis.host,
        port: this.config.redis.port,
        password: this.config.redis.password,
        db: this.config.redis.db,
        retryDelayOnFailover: this.config.redis.retryDelayOnFailover,
        maxRetriesPerRequest: this.config.redis.maxRetriesPerRequest,
        lazyConnect: true,
        maxLoadingTimeout: 10000
      });

      // Handle Redis events
      this.redis.on('connect', () => {
        logger.info('Redis connected for rate limiting');
      });

      this.redis.on('error', (error) => {
        logger.error('Redis rate limiting error:', error);
        this.rateLimitStats.errors++;
      });

      this.redis.on('close', () => {
        logger.warn('Redis rate limiting connection closed');
      });

      // Test connection
      await this.redis.ping();
      logger.info('Redis rate limiting connection tested successfully');
      
    } catch (error) {
      logger.error('Failed to initialize Redis for rate limiting:', error);
      this.redis = null;
      throw error;
    }
  }

  /**
   * Initialize memory rate limiting
   */
  initializeMemoryRateLimiting() {
    this.memoryLimits = new Map();
    logger.info('Memory rate limiting initialized');
  }

  /**
   * Start cleanup process
   */
  startCleanupProcess() {
    setInterval(() => {
      this.cleanupMemoryRateLimits();
    }, this.config.memory.cleanupInterval);
    
    logger.info('Rate limiting cleanup process started');
  }

  // ===== RATE LIMITING OPERATIONS =====

  /**
   * Check if request is allowed
   */
  async isAllowed(identifier, endpoint, strategy = this.config.defaultStrategy) {
    try {
      const limit = this.getLimit(endpoint);
      if (!limit) {
        logger.warn(`No rate limit configured for endpoint: ${endpoint}`);
        return { allowed: true, remaining: -1, resetTime: null };
      }

      let result;
      
      if (strategy === 'sliding_window') {
        result = await this.checkSlidingWindow(identifier, endpoint, limit);
      } else if (strategy === 'fixed_window') {
        result = await this.checkFixedWindow(identifier, endpoint, limit);
      } else {
        result = await this.checkSlidingWindow(identifier, endpoint, limit);
      }

      // Update statistics
      this.rateLimitStats.totalRequests++;
      if (result.allowed) {
        this.rateLimitStats.allowed++;
      } else {
        this.rateLimitStats.rateLimited++;
      }

      return result;
      
    } catch (error) {
      logger.error(`Rate limiting check failed for ${identifier}:${endpoint}:`, error);
      this.rateLimitStats.errors++;
      // Allow request on error (fail open)
      return { allowed: true, remaining: -1, resetTime: null, error: error.message };
    }
  }

  /**
   * Check rate limit using sliding window strategy
   */
  async checkSlidingWindow(identifier, endpoint, limit) {
    const key = this.getRateLimitKey(identifier, endpoint);
    const now = Date.now();
    const windowMs = limit.window * 1000;
    
    try {
      if (this.redis && this.redis.status === 'ready') {
        return await this.checkSlidingWindowRedis(key, now, windowMs, limit.requests);
      } else {
        return this.checkSlidingWindowMemory(key, now, windowMs, limit.requests);
      }
    } catch (error) {
      logger.error('Sliding window check failed, falling back to memory:', error);
      return this.checkSlidingWindowMemory(key, now, windowMs, limit.requests);
    }
  }

  /**
   * Check sliding window using Redis
   */
  async checkSlidingWindowRedis(key, now, windowMs, maxRequests) {
    const pipeline = this.redis.pipeline();
    
    // Remove expired entries
    pipeline.zremrangebyscore(key, 0, now - windowMs);
    
    // Count current requests
    pipeline.zcard(key);
    
    // Add current request
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    
    // Set expiry
    pipeline.expire(key, Math.ceil(windowMs / 1000));
    
    const results = await pipeline.exec();
    const currentRequests = results[1][1];
    
    if (currentRequests >= maxRequests) {
      // Get oldest request time to calculate reset time
      const oldestRequest = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
      const resetTime = oldestRequest.length > 0 ? parseInt(oldestRequest[0].split('-')[0]) + windowMs : now + windowMs;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(resetTime),
        limit: maxRequests,
        window: windowMs / 1000
      };
    }
    
    return {
      allowed: true,
      remaining: maxRequests - currentRequests - 1,
      resetTime: new Date(now + windowMs),
      limit: maxRequests,
      window: windowMs / 1000
    };
  }

  /**
   * Check sliding window using memory
   */
  checkSlidingWindowMemory(key, now, windowMs, maxRequests) {
    if (!this.memoryLimits.has(key)) {
      this.memoryLimits.set(key, []);
    }
    
    const requests = this.memoryLimits.get(key);
    
    // Remove expired requests
    const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
    
    if (validRequests.length >= maxRequests) {
      const oldestRequest = Math.min(...validRequests);
      const resetTime = oldestRequest + windowMs;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(resetTime),
        limit: maxRequests,
        window: windowMs / 1000
      };
    }
    
    // Add current request
    validRequests.push(now);
    this.memoryLimits.set(key, validRequests);
    
    return {
      allowed: true,
      remaining: maxRequests - validRequests.length,
      resetTime: new Date(now + windowMs),
      limit: maxRequests,
      window: windowMs / 1000
    };
  }

  /**
   * Check rate limit using fixed window strategy
   */
  async checkFixedWindow(identifier, endpoint, limit) {
    const key = this.getRateLimitKey(identifier, endpoint);
    const now = Date.now();
    const windowMs = limit.window * 1000;
    const windowStart = Math.floor(now / windowMs) * windowMs;
    
    try {
      if (this.redis && this.redis.status === 'ready') {
        return await this.checkFixedWindowRedis(key, windowStart, limit.requests);
      } else {
        return this.checkFixedWindowMemory(key, windowStart, limit.requests);
      }
    } catch (error) {
      logger.error('Fixed window check failed, falling back to memory:', error);
      return this.checkFixedWindowMemory(key, windowStart, limit.requests);
    }
  }

  /**
   * Check fixed window using Redis
   */
  async checkFixedWindowRedis(key, windowStart, maxRequests) {
    const windowKey = `${key}:${windowStart}`;
    
    const pipeline = this.redis.pipeline();
    pipeline.incr(windowKey);
    pipeline.expire(windowKey, Math.ceil(this.config.limits[Object.keys(this.config.limits)[0]].window));
    
    const results = await pipeline.exec();
    const currentRequests = results[0][1];
    
    if (currentRequests > maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(windowStart + this.config.limits[Object.keys(this.config.limits)[0]].window * 1000),
        limit: maxRequests,
        window: this.config.limits[Object.keys(this.config.limits)[0]].window
      };
    }
    
    return {
      allowed: true,
      remaining: maxRequests - currentRequests,
      resetTime: new Date(windowStart + this.config.limits[Object.keys(this.config.limits)[0]].window * 1000),
      limit: maxRequests,
      window: this.config.limits[Object.keys(this.config.limits)[0]].window
    };
  }

  /**
   * Check fixed window using memory
   */
  checkFixedWindowMemory(key, windowStart, maxRequests) {
    const windowKey = `${key}:${windowStart}`;
    
    if (!this.memoryLimits.has(windowKey)) {
      this.memoryLimits.set(windowKey, 0);
    }
    
    const currentRequests = this.memoryLimits.get(windowKey) + 1;
    this.memoryLimits.set(windowKey, currentRequests);
    
    if (currentRequests > maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(windowStart + this.config.limits[Object.keys(this.config.limits)[0]].window * 1000),
        limit: maxRequests,
        window: this.config.limits[Object.keys(this.config.limits)[0]].window
      };
    }
    
    return {
      allowed: true,
      remaining: maxRequests - currentRequests,
      resetTime: new Date(windowStart + this.config.limits[Object.keys(this.config.limits)[0]].window * 1000),
      limit: maxRequests,
      window: this.config.limits[Object.keys(this.config.limits)[0]].window
    };
  }

  // ===== REFERRAL SYSTEM SPECIFIC RATE LIMITING =====

  /**
   * Check referral code generation rate limit
   */
  async checkReferralCodeGeneration(userId) {
    return await this.isAllowed(userId, 'referral:generate_code');
  }

  /**
   * Check referral registration rate limit
   */
  async checkReferralRegistration(ipAddress) {
    return await this.isAllowed(ipAddress, 'referral:process_registration');
  }

  /**
   * Check referral booking rate limit
   */
  async checkReferralBooking(userId) {
    return await this.isAllowed(userId, 'referral:process_booking');
  }

  /**
   * Check QR code generation rate limit
   */
  async checkQRCodeGeneration(userId) {
    return await this.isAllowed(userId, 'qr:generate');
  }

  /**
   * Check QR code download rate limit
   */
  async checkQRCodeDownload(ipAddress) {
    return await this.isAllowed(ipAddress, 'qr:download');
  }

  /**
   * Check social sharing rate limit
   */
  async checkSocialSharing(userId) {
    return await this.isAllowed(userId, 'social:share');
  }

  /**
   * Check analytics API rate limit
   */
  async checkAnalyticsAPI(userId) {
    return await this.isAllowed(userId, 'api:analytics');
  }

  /**
   * Check reports API rate limit
   */
  async checkReportsAPI(userId) {
    return await this.isAllowed(userId, 'api:reports');
  }

  // ===== RATE LIMIT HEADERS =====

  /**
   * Generate rate limit headers
   */
  generateRateLimitHeaders(result) {
    return {
      'X-RateLimit-Limit': result.limit,
      'X-RateLimit-Remaining': result.remaining,
      'X-RateLimit-Reset': Math.floor(result.resetTime.getTime() / 1000),
      'X-RateLimit-Window': result.window
    };
  }

  /**
   * Generate rate limit response
   */
  generateRateLimitResponse(result) {
    return {
      success: false,
      error: 'Rate limit exceeded',
      message: `Too many requests. Limit: ${result.limit} requests per ${result.window} seconds`,
      rateLimit: {
        limit: result.limit,
        remaining: result.remaining,
        resetTime: result.resetTime,
        window: result.window
      },
      retryAfter: Math.ceil((result.resetTime.getTime() - Date.now()) / 1000)
    };
  }

  // ===== UTILITY METHODS =====

  /**
   * Get rate limit configuration for endpoint
   */
  getLimit(endpoint) {
    return this.config.limits[endpoint] || this.config.limits['api:referrals'];
  }

  /**
   * Get rate limit key
   */
  getRateLimitKey(identifier, endpoint) {
    return `${this.config.prefix}${endpoint}:${identifier}`;
  }

  /**
   * Cleanup expired memory rate limits
   */
  cleanupMemoryRateLimits() {
    try {
      const now = Date.now();
      let cleanedCount = 0;
      
      for (const [key, value] of this.memoryLimits) {
        if (Array.isArray(value)) {
          // Sliding window
          const validRequests = value.filter(timestamp => now - timestamp < 3600000); // 1 hour
          if (validRequests.length === 0) {
            this.memoryLimits.delete(key);
            cleanedCount++;
          } else if (validRequests.length !== value.length) {
            this.memoryLimits.set(key, validRequests);
          }
        } else {
          // Fixed window
          const windowStart = parseInt(key.split(':').pop());
          if (now - windowStart > 3600000) { // 1 hour
            this.memoryLimits.delete(key);
            cleanedCount++;
          }
        }
      }
      
      if (cleanedCount > 0) {
        logger.debug(`Cleaned up ${cleanedCount} expired rate limit entries`);
      }
      
    } catch (error) {
      logger.error('Failed to cleanup memory rate limits:', error);
    }
  }

  /**
   * Reset rate limit for identifier and endpoint
   */
  async resetRateLimit(identifier, endpoint) {
    try {
      const key = this.getRateLimitKey(identifier, endpoint);
      
      // Clear from memory
      this.memoryLimits.delete(key);
      
      // Clear from Redis if available
      if (this.redis && this.redis.status === 'ready') {
        const keys = await this.redis.keys(`${key}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
      
      logger.info(`Rate limit reset for ${identifier}:${endpoint}`);
      return true;
      
    } catch (error) {
      logger.error(`Failed to reset rate limit for ${identifier}:${endpoint}:`, error);
      return false;
    }
  }

  /**
   * Get current rate limit status
   */
  async getRateLimitStatus(identifier, endpoint) {
    try {
      const limit = this.getLimit(endpoint);
      const key = this.getRateLimitKey(identifier, endpoint);
      
      let currentRequests = 0;
      
      if (this.redis && this.redis.status === 'ready') {
        // Get from Redis
        const keys = await this.redis.keys(`${key}*`);
        for (const k of keys) {
          if (k.includes(':')) {
            // Fixed window
            currentRequests += await this.redis.get(k) || 0;
          } else {
            // Sliding window
            currentRequests = await this.redis.zcard(k);
          }
        }
      } else {
        // Get from memory
        if (this.memoryLimits.has(key)) {
          const value = this.memoryLimits.get(key);
          currentRequests = Array.isArray(value) ? value.length : value;
        }
      }
      
      return {
        identifier,
        endpoint,
        currentRequests,
        limit: limit.requests,
        remaining: Math.max(0, limit.requests - currentRequests),
        window: limit.window,
        resetTime: new Date(Date.now() + limit.window * 1000)
      };
      
    } catch (error) {
      logger.error(`Failed to get rate limit status for ${identifier}:${endpoint}:`, error);
      return null;
    }
  }

  // ===== STATISTICS AND MONITORING =====

  /**
   * Get rate limiting statistics
   */
  getRateLimitStats() {
    return {
      ...this.rateLimitStats,
      successRate: this.rateLimitStats.totalRequests > 0 
        ? ((this.rateLimitStats.totalRequests - this.rateLimitStats.rateLimited) / this.rateLimitStats.totalRequests) * 100 
        : 0,
      memoryEntries: this.memoryLimits.size,
      redisStatus: this.redis ? this.redis.status : 'unavailable'
    };
  }

  /**
   * Reset rate limiting statistics
   */
  resetRateLimitStats() {
    this.rateLimitStats = {
      totalRequests: 0,
      rateLimited: 0,
      allowed: 0,
      errors: 0
    };
    
    logger.info('Rate limiting statistics reset');
  }

  // ===== CONFIGURATION MANAGEMENT =====

  /**
   * Update rate limit configuration
   */
  updateRateLimitConfig(newConfig) {
    try {
      if (newConfig.limits) {
        Object.assign(this.config.limits, newConfig.limits);
      }
      
      if (newConfig.defaultStrategy) {
        this.config.defaultStrategy = newConfig.defaultStrategy;
      }
      
      logger.info('Rate limit configuration updated');
      return true;
      
    } catch (error) {
      logger.error('Failed to update rate limit configuration:', error);
      return false;
    }
  }

  /**
   * Get current rate limit configuration
   */
  getRateLimitConfig() {
    return {
      ...this.config,
      redis: {
        host: this.config.redis.host,
        port: this.config.redis.port,
        db: this.config.redis.db,
        status: this.redis ? this.redis.status : 'unavailable'
      }
    };
  }

  // ===== HEALTH CHECK =====

  /**
   * Check rate limiting service health
   */
  async getHealth() {
    try {
      const health = {
        status: 'healthy',
        memory: {
          status: 'healthy',
          entries: this.memoryLimits.size,
          maxEntries: this.config.memory.maxEntries
        },
        redis: {
          status: 'unavailable',
          connection: null
        },
        stats: this.getRateLimitStats()
      };
      
      // Check Redis health
      if (this.redis && this.redis.status === 'ready') {
        try {
          await this.redis.ping();
          health.redis.status = 'healthy';
          health.redis.connection = {
            host: this.config.redis.host,
            port: this.config.redis.port,
            db: this.config.redis.db
          };
        } catch (error) {
          health.redis.status = 'error';
          health.redis.error = error.message;
        }
      }
      
      // Overall status
      if (health.redis.status === 'error' && health.memory.entries >= health.memory.maxEntries * 0.9) {
        health.status = 'warning';
      } else if (health.redis.status === 'error' && health.memory.status === 'healthy') {
        health.status = 'degraded';
      }
      
      return health;
      
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
const rateLimitingService = new RateLimitingService();

module.exports = rateLimitingService;
