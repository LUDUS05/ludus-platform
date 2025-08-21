const Redis = require('ioredis');
const { performanceMonitor } = require('../middleware/performance');

class CacheService {
  constructor() {
    this.redis = null;
    this.isConnected = false;
    this.defaultTTL = 3600; // 1 hour default
    this.connectionRetries = 0;
    this.maxRetries = 3;
    
    this.init();
  }

  // Initialize Redis connection
  async init() {
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL, {
          retryDelayOnFailover: 100,
          enableReadyCheck: false,
          maxRetriesPerRequest: 3,
          lazyConnect: true
        });
      } else if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
        this.redis = new Redis({
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
          password: process.env.REDIS_PASSWORD,
          db: process.env.REDIS_DB || 0,
          retryDelayOnFailover: 100,
          enableReadyCheck: false,
          maxRetriesPerRequest: 3,
          lazyConnect: true
        });
      } else {
        console.log('⚠️  Redis not configured, using in-memory cache fallback');
        this.useMemoryCache();
        return;
      }

      // Set up Redis event handlers
      this.redis.on('connect', () => {
        console.log('✅ Redis connected');
        this.isConnected = true;
        this.connectionRetries = 0;
      });

      this.redis.on('error', (error) => {
        console.error('❌ Redis error:', error.message);
        this.isConnected = false;
        
        if (this.connectionRetries < this.maxRetries) {
          this.connectionRetries++;
          console.log(`🔄 Redis reconnection attempt ${this.connectionRetries}/${this.maxRetries}`);
          setTimeout(() => this.init(), 5000);
        } else {
          console.log('⚠️  Redis connection failed, falling back to in-memory cache');
          this.useMemoryCache();
        }
      });

      this.redis.on('close', () => {
        console.log('⚠️  Redis connection closed');
        this.isConnected = false;
      });

      // Test connection
      await this.redis.ping();
      
    } catch (error) {
      console.error('❌ Redis initialization failed:', error.message);
      this.useMemoryCache();
    }
  }

  // Fallback to in-memory cache
  useMemoryCache() {
    this.redis = null;
    this.memoryCache = new Map();
    this.isConnected = false;
    
    // Clean up expired items every 5 minutes
    setInterval(() => this.cleanupMemoryCache(), 300000);
  }

  // Clean up expired in-memory cache items
  cleanupMemoryCache() {
    if (!this.memoryCache) return;
    
    const now = Date.now();
    for (const [key, value] of this.memoryCache.entries()) {
      if (value.expiresAt && value.expiresAt < now) {
        this.memoryCache.delete(key);
      }
    }
  }

  // Generate cache key
  generateKey(prefix, identifier, params = {}) {
    const paramString = Object.keys(params).length > 0 
      ? '_' + JSON.stringify(params)
      : '';
    return `${prefix}:${identifier}${paramString}`;
  }

  // Set cache value
  async set(key, value, ttl = this.defaultTTL) {
    try {
      if (this.redis && this.isConnected) {
        await this.redis.setex(key, ttl, JSON.stringify(value));
        performanceMonitor.recordCacheHit();
      } else if (this.memoryCache) {
        this.memoryCache.set(key, {
          value: JSON.stringify(value),
          expiresAt: Date.now() + (ttl * 1000)
        });
      }
      return true;
    } catch (error) {
      console.error('❌ Cache set error:', error.message);
      return false;
    }
  }

  // Get cache value
  async get(key) {
    try {
      if (this.redis && this.isConnected) {
        const value = await this.redis.get(key);
        if (value) {
          performanceMonitor.recordCacheHit();
          return JSON.parse(value);
        }
        performanceMonitor.recordCacheMiss();
        return null;
      } else if (this.memoryCache) {
        const item = this.memoryCache.get(key);
        if (item && (!item.expiresAt || item.expiresAt > Date.now())) {
          performanceMonitor.recordCacheHit();
          return JSON.parse(item.value);
        }
        if (item && item.expiresAt < Date.now()) {
          this.memoryCache.delete(key);
        }
        performanceMonitor.recordCacheMiss();
        return null;
      }
      return null;
    } catch (error) {
      console.error('❌ Cache get error:', error.message);
      return null;
    }
  }

  // Delete cache key
  async del(key) {
    try {
      if (this.redis && this.isConnected) {
        await this.redis.del(key);
      } else if (this.memoryCache) {
        this.memoryCache.delete(key);
      }
      return true;
    } catch (error) {
      console.error('❌ Cache delete error:', error.message);
      return false;
    }
  }

  // Delete multiple keys by pattern
  async delPattern(pattern) {
    try {
      if (this.redis && this.isConnected) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else if (this.memoryCache) {
        for (const key of this.memoryCache.keys()) {
          if (key.includes(pattern.replace('*', ''))) {
            this.memoryCache.delete(key);
          }
        }
      }
      return true;
    } catch (error) {
      console.error('❌ Cache pattern delete error:', error.message);
      return false;
    }
  }

  // Check if key exists
  async exists(key) {
    try {
      if (this.redis && this.isConnected) {
        return await this.redis.exists(key);
      } else if (this.memoryCache) {
        const item = this.memoryCache.get(key);
        return item && (!item.expiresAt || item.expiresAt > Date.now()) ? 1 : 0;
      }
      return 0;
    } catch (error) {
      console.error('❌ Cache exists error:', error.message);
      return 0;
    }
  }

  // Set cache with hash (for complex objects)
  async hset(hash, field, value, ttl = this.defaultTTL) {
    try {
      if (this.redis && this.isConnected) {
        await this.redis.hset(hash, field, JSON.stringify(value));
        await this.redis.expire(hash, ttl);
        performanceMonitor.recordCacheHit();
      } else if (this.memoryCache) {
        const key = `${hash}:${field}`;
        this.memoryCache.set(key, {
          value: JSON.stringify(value),
          expiresAt: Date.now() + (ttl * 1000)
        });
      }
      return true;
    } catch (error) {
      console.error('❌ Cache hset error:', error.message);
      return false;
    }
  }

  // Get cache from hash
  async hget(hash, field) {
    try {
      if (this.redis && this.isConnected) {
        const value = await this.redis.hget(hash, field);
        if (value) {
          performanceMonitor.recordCacheHit();
          return JSON.parse(value);
        }
        performanceMonitor.recordCacheMiss();
        return null;
      } else if (this.memoryCache) {
        const key = `${hash}:${field}`;
        const item = this.memoryCache.get(key);
        if (item && (!item.expiresAt || item.expiresAt > Date.now())) {
          performanceMonitor.recordCacheHit();
          return JSON.parse(item.value);
        }
        performanceMonitor.recordCacheMiss();
        return null;
      }
      return null;
    } catch (error) {
      console.error('❌ Cache hget error:', error.message);
      return null;
    }
  }

  // Increment counter
  async incr(key, ttl = this.defaultTTL) {
    try {
      if (this.redis && this.isConnected) {
        const value = await this.redis.incr(key);
        await this.redis.expire(key, ttl);
        return value;
      } else if (this.memoryCache) {
        const item = this.memoryCache.get(key);
        const value = item ? parseInt(item.value) + 1 : 1;
        this.memoryCache.set(key, {
          value: value.toString(),
          expiresAt: Date.now() + (ttl * 1000)
        });
        return value;
      }
      return 0;
    } catch (error) {
      console.error('❌ Cache increment error:', error.message);
      return 0;
    }
  }

  // Get cache statistics
  async getStats() {
    try {
      if (this.redis && this.isConnected) {
        const info = await this.redis.info();
        const keys = await this.redis.dbsize();
        return {
          type: 'redis',
          connected: true,
          keys,
          info: info.split('\r\n').reduce((acc, line) => {
            if (line.includes(':')) {
              const [key, value] = line.split(':');
              acc[key] = value;
            }
            return acc;
          }, {})
        };
      } else {
        return {
          type: 'memory',
          connected: false,
          keys: this.memoryCache ? this.memoryCache.size : 0,
          info: {}
        };
      }
    } catch (error) {
      return {
        type: 'unknown',
        connected: false,
        keys: 0,
        error: error.message
      };
    }
  }

  // Clear all cache
  async clear() {
    try {
      if (this.redis && this.isConnected) {
        await this.redis.flushdb();
      } else if (this.memoryCache) {
        this.memoryCache.clear();
      }
      return true;
    } catch (error) {
      console.error('❌ Cache clear error:', error.message);
      return false;
    }
  }

  // Health check
  async health() {
    try {
      if (this.redis && this.isConnected) {
        await this.redis.ping();
        return { status: 'healthy', type: 'redis' };
      } else if (this.memoryCache) {
        return { status: 'healthy', type: 'memory' };
      } else {
        return { status: 'unhealthy', type: 'none' };
      }
    } catch (error) {
      return { status: 'unhealthy', type: 'redis', error: error.message };
    }
  }

  // Graceful shutdown
  async shutdown() {
    try {
      if (this.redis) {
        await this.redis.quit();
      }
      return true;
    } catch (error) {
      console.error('❌ Cache shutdown error:', error.message);
      return false;
    }
  }
}

// Cache decorator for functions
function cacheable(prefix, ttl = 3600, keyGenerator = null) {
  return function(target, propertyName, descriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function(...args) {
      const cache = new CacheService();
      const key = keyGenerator 
        ? keyGenerator(prefix, ...args)
        : cache.generateKey(prefix, propertyName, args);
      
      // Try to get from cache first
      let result = await cache.get(key);
      if (result !== null) {
        return result;
      }
      
      // If not in cache, execute method and cache result
      result = await method.apply(this, args);
      if (result !== null && result !== undefined) {
        await cache.set(key, result, ttl);
      }
      
      return result;
    };
    
    return descriptor;
  };
}

// Export cache service and decorator
module.exports = {
  CacheService,
  cacheable,
  
  // Convenience functions
  createCache: () => new CacheService(),
  
  // Predefined cache keys
  CACHE_KEYS: {
    ACTIVITIES: 'activities',
    VENDORS: 'vendors',
    PAGES: 'pages',
    USER_PROFILE: 'user_profile',
    SEARCH_RESULTS: 'search_results',
    ADMIN_STATS: 'admin_stats'
  },
  
  // Predefined TTL values
  TTL: {
    SHORT: 300,      // 5 minutes
    MEDIUM: 1800,    // 30 minutes
    LONG: 3600,      // 1 hour
    VERY_LONG: 86400 // 24 hours
  }
};