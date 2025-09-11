/**
 * @fileoverview Comprehensive Caching Service
 * 
 * This service provides:
 * - Redis integration for distributed caching
 * - In-memory caching for fast access
 * - Cache invalidation strategies
 * - Cache warming and preloading
 * - Cache statistics and monitoring
 * @module services/cachingService
 */

const Redis = require('ioredis');
const logger = require('../utils/logger');

class CachingService {
  /**
   * Creates an instance of CachingService.
   */
  constructor() {
    this.redis = null;
    this.memoryCache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0
    };
    
    // Cache configuration
    this.config = {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB || 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3
      },
      memory: {
        maxSize: 1000,
        ttl: 300000, // 5 minutes default
        cleanupInterval: 60000 // 1 minute
      },
      defaultTTL: 300, // 5 minutes in seconds
      prefix: 'ludus:referral:'
    };
    
    // Initialize caching
    this.initializeCaching();
  }

  // ===== INITIALIZATION =====

  /**
   * Initialize caching service.
   * @returns {Promise<void>}
   */
  async initializeCaching() {
    try {
      logger.info('Initializing caching service...');
      
      // Initialize Redis connection
      await this.initializeRedis();
      
      // Initialize memory cache
      this.initializeMemoryCache();
      
      // Start cache cleanup
      this.startCacheCleanup();
      
      logger.info('Caching service initialized successfully');
      
    } catch (error) {
      logger.error('Failed to initialize caching service:', error);
      // Continue without Redis, using memory cache only
      this.initializeMemoryCache();
      this.startCacheCleanup();
    }
  }

  /**
   * Initialize Redis connection.
   * @returns {Promise<void>}
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
        logger.info('Redis connected successfully');
      });

      this.redis.on('error', (error) => {
        logger.error('Redis error:', error);
        this.cacheStats.errors++;
      });

      this.redis.on('close', () => {
        logger.warn('Redis connection closed');
      });

      this.redis.on('reconnecting', () => {
        logger.info('Redis reconnecting...');
      });

      // Test connection
      await this.redis.ping();
      logger.info('Redis connection tested successfully');
      
    } catch (error) {
      logger.error('Failed to initialize Redis:', error);
      this.redis = null;
      throw error;
    }
  }

  /**
   * Initialize memory cache.
   */
  initializeMemoryCache() {
    this.memoryCache = new Map();
    logger.info('Memory cache initialized');
  }

  /**
   * Start cache cleanup process.
   */
  startCacheCleanup() {
    setInterval(() => {
      this.cleanupMemoryCache();
    }, this.config.memory.cleanupInterval);
    
    logger.info('Cache cleanup process started');
  }

  // ===== CACHE OPERATIONS =====

  /**
   * Set a value in the cache.
   * @param {string} key - The cache key.
   * @param {*} value - The value to cache.
   * @param {number} [ttl=this.config.defaultTTL] - The time-to-live in seconds.
   * @returns {Promise<boolean>} A promise that resolves to true if the value was set successfully, false otherwise.
   */
  async set(key, value, ttl = this.config.defaultTTL) {
    try {
      const fullKey = this.getFullKey(key);
      
      // Set in memory cache
      this.setMemoryCache(fullKey, value, ttl);
      
      // Set in Redis if available
      if (this.redis && this.redis.status === 'ready') {
        const serializedValue = this.serializeValue(value);
        await this.redis.setex(fullKey, ttl, serializedValue);
      }
      
      this.cacheStats.sets++;
      logger.debug(`Cache set: ${fullKey} (TTL: ${ttl}s)`);
      
      return true;
      
    } catch (error) {
      logger.error(`Failed to set cache for key ${key}:`, error);
      this.cacheStats.errors++;
      return false;
    }
  }

  /**
   * Get a value from the cache.
   * @param {string} key - The cache key.
   * @returns {Promise<*>} A promise that resolves to the cached value, or null if not found.
   */
  async get(key) {
    try {
      const fullKey = this.getFullKey(key);
      
      // Try memory cache first
      let value = this.getMemoryCache(fullKey);
      
      if (value !== null) {
        this.cacheStats.hits++;
        logger.debug(`Cache hit (memory): ${fullKey}`);
        return value;
      }
      
      // Try Redis if available
      if (this.redis && this.redis.status === 'ready') {
        const redisValue = await this.redis.get(fullKey);
        
        if (redisValue !== null) {
          value = this.deserializeValue(redisValue);
          
          // Update memory cache
          this.setMemoryCache(fullKey, value, this.config.defaultTTL);
          
          this.cacheStats.hits++;
          logger.debug(`Cache hit (Redis): ${fullKey}`);
          return value;
        }
      }
      
      this.cacheStats.misses++;
      logger.debug(`Cache miss: ${fullKey}`);
      return null;
      
    } catch (error) {
      logger.error(`Failed to get cache for key ${key}:`, error);
      this.cacheStats.errors++;
      return null;
    }
  }

  /**
   * Delete a value from the cache.
   * @param {string} key - The cache key.
   * @returns {Promise<boolean>} A promise that resolves to true if the value was deleted successfully, false otherwise.
   */
  async delete(key) {
    try {
      const fullKey = this.getFullKey(key);
      
      // Delete from memory cache
      this.deleteMemoryCache(fullKey);
      
      // Delete from Redis if available
      if (this.redis && this.redis.status === 'ready') {
        await this.redis.del(fullKey);
      }
      
      this.cacheStats.deletes++;
      logger.debug(`Cache deleted: ${fullKey}`);
      
      return true;
      
    } catch (error) {
      logger.error(`Failed to delete cache for key ${key}:`, error);
      this.cacheStats.errors++;
      return false;
    }
  }

  /**
   * Check if a key exists in the cache.
   * @param {string} key - The cache key.
   * @returns {Promise<boolean>} A promise that resolves to true if the key exists, false otherwise.
   */
  async exists(key) {
    try {
      const fullKey = this.getFullKey(key);
      
      // Check memory cache
      if (this.memoryCache.has(fullKey)) {
        return true;
      }
      
      // Check Redis if available
      if (this.redis && this.redis.status === 'ready') {
        const exists = await this.redis.exists(fullKey);
        return exists === 1;
      }
      
      return false;
      
    } catch (error) {
      logger.error(`Failed to check cache existence for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get multiple values from the cache.
   * @param {string[]} keys - An array of cache keys.
   * @returns {Promise<object>} A promise that resolves to an object of key-value pairs.
   */
  async mget(keys) {
    try {
      const fullKeys = keys.map(key => this.getFullKey(key));
      const results = {};
      
      // Get from memory cache
      for (const key of keys) {
        const fullKey = this.getFullKey(key);
        const value = this.getMemoryCache(fullKey);
        
        if (value !== null) {
          results[key] = value;
          this.cacheStats.hits++;
        }
      }
      
      // Get remaining from Redis if available
      if (this.redis && this.redis.status === 'ready') {
        const missingKeys = keys.filter(key => !(key in results));
        const missingFullKeys = missingKeys.map(key => this.getFullKey(key));
        
        if (missingFullKeys.length > 0) {
          const redisValues = await this.redis.mget(missingFullKeys);
          
          for (let i = 0; i < missingKeys.length; i++) {
            const key = missingKeys[i];
            const value = redisValues[i];
            
            if (value !== null) {
              const deserializedValue = this.deserializeValue(value);
              results[key] = deserializedValue;
              
              // Update memory cache
              this.setMemoryCache(this.getFullKey(key), deserializedValue, this.config.defaultTTL);
              
              this.cacheStats.hits++;
            } else {
              this.cacheStats.misses++;
            }
          }
        }
      } else {
        // Count misses for keys not in memory
        const missingKeys = keys.filter(key => !(key in results));
        this.cacheStats.misses += missingKeys.length;
      }
      
      return results;
      
    } catch (error) {
      logger.error('Failed to get multiple cache values:', error);
      this.cacheStats.errors++;
      return {};
    }
  }

  /**
   * Set multiple values in the cache.
   * @param {object} keyValuePairs - An object of key-value pairs to set.
   * @param {number} [ttl=this.config.defaultTTL] - The time-to-live in seconds.
   * @returns {Promise<object>} A promise that resolves to an object of keys and their set status.
   */
  async mset(keyValuePairs, ttl = this.config.defaultTTL) {
    try {
      const results = {};
      
      for (const [key, value] of Object.entries(keyValuePairs)) {
        const success = await this.set(key, value, ttl);
        results[key] = success;
      }
      
      return results;
      
    } catch (error) {
      logger.error('Failed to set multiple cache values:', error);
      this.cacheStats.errors++;
      return {};
    }
  }

  // ===== MEMORY CACHE OPERATIONS =====

  /**
   * Set a value in the memory cache.
   * @param {string} key - The cache key.
   * @param {*} value - The value to cache.
   * @param {number} ttl - The time-to-live in seconds.
   */
  setMemoryCache(key, value, ttl) {
    try {
      // Check cache size limit
      if (this.memoryCache.size >= this.config.memory.maxSize) {
        this.evictOldestFromMemory();
      }
      
      const expiry = Date.now() + (ttl * 1000);
      this.memoryCache.set(key, {
        value,
        expiry,
        accessed: Date.now()
      });
      
    } catch (error) {
      logger.error('Failed to set memory cache:', error);
    }
  }

  /**
   * Get a value from the memory cache.
   * @param {string} key - The cache key.
   * @returns {*} The cached value, or null if not found or expired.
   */
  getMemoryCache(key) {
    try {
      const item = this.memoryCache.get(key);
      
      if (!item) {
        return null;
      }
      
      // Check if expired
      if (Date.now() > item.expiry) {
        this.memoryCache.delete(key);
        return null;
      }
      
      // Update access time
      item.accessed = Date.now();
      this.memoryCache.set(key, item);
      
      return item.value;
      
    } catch (error) {
      logger.error('Failed to get from memory cache:', error);
      return null;
    }
  }

  /**
   * Delete a value from the memory cache.
   * @param {string} key - The cache key.
   */
  deleteMemoryCache(key) {
    try {
      this.memoryCache.delete(key);
    } catch (error) {
      logger.error('Failed to delete from memory cache:', error);
    }
  }

  /**
   * Evict the oldest item from the memory cache.
   */
  evictOldestFromMemory() {
    try {
      let oldestKey = null;
      let oldestAccess = Date.now();
      
      for (const [key, item] of this.memoryCache) {
        if (item.accessed < oldestAccess) {
          oldestAccess = item.accessed;
          oldestKey = key;
        }
      }
      
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
        logger.debug(`Evicted oldest item from memory cache: ${oldestKey}`);
      }
      
    } catch (error) {
      logger.error('Failed to evict oldest item from memory cache:', error);
    }
  }

  /**
   * Cleanup expired items from the memory cache.
   */
  cleanupMemoryCache() {
    try {
      const now = Date.now();
      let cleanedCount = 0;
      
      for (const [key, item] of this.memoryCache) {
        if (now > item.expiry) {
          this.memoryCache.delete(key);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        logger.debug(`Cleaned up ${cleanedCount} expired items from memory cache`);
      }
      
    } catch (error) {
      logger.error('Failed to cleanup memory cache:', error);
    }
  }

  // ===== REFERRAL SYSTEM SPECIFIC CACHING =====

  /**
   * Cache referral statistics.
   * @param {string} userId - The ID of the user.
   * @param {string} period - The time period for the stats (e.g., '24h', '7d').
   * @param {object} stats - The statistics object to cache.
   * @returns {Promise<boolean>} A promise that resolves to true if the stats were cached successfully.
   */
  async cacheReferralStats(userId, period, stats) {
    const key = `referral_stats:${userId}:${period}`;
    const ttl = this.getTTLForPeriod(period);
    
    return await this.set(key, stats, ttl);
  }

  /**
   * Get cached referral statistics.
   * @param {string} userId - The ID of the user.
   * @param {string} period - The time period for the stats.
   * @returns {Promise<object|null>} A promise that resolves to the cached stats, or null if not found.
   */
  async getCachedReferralStats(userId, period) {
    const key = `referral_stats:${userId}:${period}`;
    return await this.get(key);
  }

  /**
   * Cache the referral leaderboard.
   * @param {string} period - The time period for the leaderboard.
   * @param {object} leaderboard - The leaderboard data to cache.
   * @returns {Promise<boolean>} A promise that resolves to true if the leaderboard was cached successfully.
   */
  async cacheReferralLeaderboard(period, leaderboard) {
    const key = `referral_leaderboard:${period}`;
    const ttl = this.getTTLForPeriod(period);
    
    return await this.set(key, leaderboard, ttl);
  }

  /**
   * Get the cached referral leaderboard.
   * @param {string} period - The time period for the leaderboard.
   * @returns {Promise<object|null>} A promise that resolves to the cached leaderboard, or null if not found.
   */
  async getCachedReferralLeaderboard(period) {
    const key = `referral_leaderboard:${period}`;
    return await this.get(key);
  }

  /**
   * Cache invitation analytics.
   * @param {string} userId - The ID of the user.
   * @param {string} period - The time period for the analytics.
   * @param {object} analytics - The analytics data to cache.
   * @returns {Promise<boolean>} A promise that resolves to true if the analytics were cached successfully.
   */
  async cacheInvitationAnalytics(userId, period, analytics) {
    const key = `invitation_analytics:${userId}:${period}`;
    const ttl = this.getTTLForPeriod(period);
    
    return await this.set(key, analytics, ttl);
  }

  /**
   * Get cached invitation analytics.
   * @param {string} userId - The ID of the user.
   * @param {string} period - The time period for the analytics.
   * @returns {Promise<object|null>} A promise that resolves to the cached analytics, or null if not found.
   */
  async getCachedInvitationAnalytics(userId, period) {
    const key = `invitation_analytics:${userId}:${period}`;
    return await this.get(key);
  }

  /**
   * Cache QR code data.
   * @param {string} code - The referral code.
   * @param {*} data - The QR code data to cache.
   * @returns {Promise<boolean>} A promise that resolves to true if the data was cached successfully.
   */
  async cacheQRCodeData(code, data) {
    const key = `qr_code:${code}`;
    const ttl = 3600; // 1 hour
    
    return await this.set(key, data, ttl);
  }

  /**
   * Get cached QR code data.
   * @param {string} code - The referral code.
   * @returns {Promise<*|null>} A promise that resolves to the cached QR code data, or null if not found.
   */
  async getCachedQRCodeData(code) {
    const key = `qr_code:${code}`;
    return await this.get(key);
  }

  // ===== CACHE INVALIDATION =====

  /**
   * Invalidate cache entries by a pattern.
   * @param {string} pattern - The pattern to match against cache keys.
   * @returns {Promise<boolean>} A promise that resolves to true if the invalidation was successful.
   */
  async invalidateByPattern(pattern) {
    try {
      const fullPattern = this.getFullKey(pattern);
      
      // Clear memory cache entries matching pattern
      for (const key of this.memoryCache.keys()) {
        if (key.includes(pattern)) {
          this.memoryCache.delete(key);
        }
      }
      
      // Clear Redis entries matching pattern if available
      if (this.redis && this.redis.status === 'ready') {
        const keys = await this.redis.keys(fullPattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
      
      logger.info(`Cache invalidated for pattern: ${pattern}`);
      return true;
      
    } catch (error) {
      logger.error(`Failed to invalidate cache for pattern ${pattern}:`, error);
      return false;
    }
  }

  /**
   * Invalidate all cache entries for a specific user.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<void>}
   */
  async invalidateUserCache(userId) {
    const patterns = [
      `referral_stats:${userId}:*`,
      `invitation_analytics:${userId}:*`,
      `user_profile:${userId}`,
      `user_wallet:${userId}`
    ];
    
    for (const pattern of patterns) {
      await this.invalidateByPattern(pattern);
    }
    
    logger.info(`Cache invalidated for user: ${userId}`);
  }

  /**
   * Invalidate all cache entries for the referral system.
   * @returns {Promise<void>}
   */
  async invalidateReferralCache() {
    const patterns = [
      'referral_leaderboard:*',
      'referral_stats:*',
      'invitation_analytics:*',
      'qr_code:*'
    ];
    
    for (const pattern of patterns) {
      await this.invalidateByPattern(pattern);
    }
    
    logger.info('Referral system cache invalidated');
  }

  // ===== CACHE WARMING =====

  /**
   * Warm up the cache with frequently accessed data.
   * @returns {Promise<void>}
   */
  async warmCache() {
    try {
      logger.info('Starting cache warming...');
      
      // Warm up referral leaderboards
      await this.warmReferralLeaderboards();
      
      // Warm up system statistics
      await this.warmSystemStats();
      
      logger.info('Cache warming completed');
      
    } catch (error) {
      logger.error('Cache warming failed:', error);
    }
  }

  /**
   * Warm up the referral leaderboards.
   * @returns {Promise<void>}
   */
  async warmReferralLeaderboards() {
    try {
      const periods = ['24h', '7d', '30d'];
      
      for (const period of periods) {
        // This would typically call your analytics service
        // For now, we'll just log the intention
        logger.debug(`Warming referral leaderboard for period: ${period}`);
      }
      
    } catch (error) {
      logger.error('Failed to warm referral leaderboards:', error);
    }
  }

  /**
   * Warm up system statistics.
   * @returns {Promise<void>}
   */
  async warmSystemStats() {
    try {
      // Warm up common system statistics
      logger.debug('Warming system statistics');
      
    } catch (error) {
      logger.error('Failed to warm system statistics:', error);
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Get the full cache key with a prefix.
   * @param {string} key - The cache key.
   * @returns {string} The full cache key.
   */
  getFullKey(key) {
    return `${this.config.prefix}${key}`;
  }

  /**
   * Serialize a value for Redis storage.
   * @param {*} value - The value to serialize.
   * @returns {string} The serialized value.
   */
  serializeValue(value) {
    try {
      return JSON.stringify(value);
    } catch (error) {
      logger.error('Failed to serialize value:', error);
      return JSON.stringify({ error: 'Serialization failed' });
    }
  }

  /**
   * Deserialize a value from Redis storage.
   * @param {string} value - The value to deserialize.
   * @returns {*|null} The deserialized value, or null if deserialization fails.
   */
  deserializeValue(value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      logger.error('Failed to deserialize value:', error);
      return null;
    }
  }

  /**
   * Get the TTL for a specific time period.
   * @param {string} period - The time period (e.g., '24h', '7d').
   * @returns {number} The TTL in seconds.
   */
  getTTLForPeriod(period) {
    const ttlMap = {
      '24h': 300,    // 5 minutes
      '7d': 1800,    // 30 minutes
      '30d': 3600,   // 1 hour
      '90d': 7200,   // 2 hours
      '1y': 14400    // 4 hours
    };
    
    return ttlMap[period] || this.config.defaultTTL;
  }

  // ===== STATISTICS AND MONITORING =====

  /**
   * Get cache statistics.
   * @returns {object} An object containing cache statistics.
   */
  getCacheStats() {
    const hitRate = this.cacheStats.hits + this.cacheStats.misses > 0 
      ? (this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses)) * 100 
      : 0;
    
    return {
      ...this.cacheStats,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryCacheSize: this.memoryCache.size,
      redisStatus: this.redis ? this.redis.status : 'unavailable'
    };
  }

  /**
   * Reset cache statistics.
   */
  resetCacheStats() {
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0
    };
    
    logger.info('Cache statistics reset');
  }

  /**
   * Get information about the memory cache.
   * @returns {object} An object containing memory cache information.
   */
  getMemoryCacheInfo() {
    const now = Date.now();
    const items = [];
    
    for (const [key, item] of this.memoryCache) {
      items.push({
        key,
        size: JSON.stringify(item.value).length,
        age: now - item.accessed,
        expiresIn: item.expiry - now
      });
    }
    
    return {
      totalItems: items.length,
      totalSize: items.reduce((sum, item) => sum + item.size, 0),
      items: items.sort((a, b) => b.age - a.age)
    };
  }

  // ===== HEALTH CHECK =====

  /**
   * Check the health of the cache service.
   * @returns {Promise<object>} A promise that resolves to an object containing the health status.
   */
  async getHealth() {
    try {
      const health = {
        status: 'healthy',
        memory: {
          status: 'healthy',
          size: this.memoryCache.size,
          maxSize: this.config.memory.maxSize
        },
        redis: {
          status: 'unavailable',
          connection: null
        },
        stats: this.getCacheStats()
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
      if (health.redis.status === 'error' && health.memory.size >= health.memory.maxSize * 0.9) {
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
const cachingService = new CachingService();

module.exports = cachingService;
