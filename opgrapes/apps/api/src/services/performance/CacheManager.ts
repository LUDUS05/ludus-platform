import { createClient, RedisClientType } from 'redis';
import winston from 'winston';

export interface CacheStrategy {
  ttl: number;
  maxSize: number;
  evictionPolicy: 'lru' | 'lfu' | 'fifo';
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
  memoryUsage: number;
  keyCount: number;
}

export class CacheManager {
  private redis!: RedisClientType;
  private logger!: winston.Logger;
  private stats: Map<string, { hits: number; misses: number }> = new Map();

  constructor() {
    this.initializeRedis();
    this.initializeLogger();
  }

  private async initializeRedis(): Promise<void> {
    try {
      this.redis = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      this.redis.on('error', (err) => {
        console.error('CacheManager Redis Client Error:', err);
      });

      this.redis.on('connect', () => {
        console.log('CacheManager Redis Client Connected');
      });

      await this.redis.connect();
    } catch (error) {
      console.error('Failed to initialize CacheManager Redis:', error);
    }
  }

  private initializeLogger(): void {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'cache-manager' },
      transports: [
        new winston.transports.File({ filename: 'logs/cache-manager-error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/cache-manager-combined.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  /**
   * Cache activity data with smart invalidation
   */
  async setActivityCache(activityId: string, data: any, ttl: number = 3600): Promise<void> {
    try {
      const cacheKey = `activity:${activityId}`;
      await this.redis.setEx(cacheKey, ttl, JSON.stringify(data));
      
      // Track cache stats
      this.updateStats(cacheKey, 'set');
      
      this.logger.info('Activity cached', { activityId, ttl });
    } catch (error) {
      this.logger.error('Failed to cache activity', { error, activityId });
    }
  }

  /**
   * Get cached activity data
   */
  async getActivityCache(activityId: string): Promise<any | null> {
    try {
      const cacheKey = `activity:${activityId}`;
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        this.updateStats(cacheKey, 'hit');
        return JSON.parse(cached);
      } else {
        this.updateStats(cacheKey, 'miss');
        return null;
      }
    } catch (error) {
      this.logger.error('Failed to get activity cache', { error, activityId });
      return null;
    }
  }

  /**
   * Cache user recommendations with personalized TTL
   */
  async setUserRecommendations(userId: string, recommendations: any[], ttl: number = 1800): Promise<void> {
    try {
      const cacheKey = `recommendations:${userId}`;
      await this.redis.setEx(cacheKey, ttl, JSON.stringify(recommendations));
      
      // Track cache stats
      this.updateStats(cacheKey, 'set');
      
      this.logger.info('User recommendations cached', { userId, ttl, count: recommendations.length });
    } catch (error) {
      this.logger.error('Failed to cache user recommendations', { error, userId });
    }
  }

  /**
   * Get cached user recommendations
   */
  async getUserRecommendations(userId: string): Promise<any[] | null> {
    try {
      const cacheKey = `recommendations:${userId}`;
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        this.updateStats(cacheKey, 'hit');
        return JSON.parse(cached);
      } else {
        this.updateStats(cacheKey, 'miss');
        return null;
      }
    } catch (error) {
      this.logger.error('Failed to get user recommendations cache', { error, userId });
      return null;
    }
  }

  /**
   * Cache search results with query-based keys
   */
  async setSearchCache(query: string, filters: Record<string, any>, results: any[], ttl: number = 900): Promise<void> {
    try {
      const queryHash = this.generateQueryHash(query, filters);
      const cacheKey = `search:${queryHash}`;
      
      await this.redis.setEx(cacheKey, ttl, JSON.stringify({
        query,
        filters,
        results,
        timestamp: new Date().toISOString()
      }));
      
      this.updateStats(cacheKey, 'set');
      this.logger.info('Search results cached', { query, filters, ttl, resultCount: results.length });
    } catch (error) {
      this.logger.error('Failed to cache search results', { error, query });
    }
  }

  /**
   * Get cached search results
   */
  async getSearchCache(query: string, filters: Record<string, any>): Promise<any | null> {
    try {
      const queryHash = this.generateQueryHash(query, filters);
      const cacheKey = `search:${queryHash}`;
      
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        this.updateStats(cacheKey, 'hit');
        return JSON.parse(cached);
      } else {
        this.updateStats(cacheKey, 'miss');
        return null;
      }
    } catch (error) {
      this.logger.error('Failed to get search cache', { error, query });
      return null;
    }
  }

  /**
   * Cache vendor data with business logic TTL
   */
  async setVendorCache(vendorId: string, data: any, ttl: number = 7200): Promise<void> {
    try {
      const cacheKey = `vendor:${vendorId}`;
      await this.redis.setEx(cacheKey, ttl, JSON.stringify(data));
      
      this.updateStats(cacheKey, 'set');
      this.logger.info('Vendor data cached', { vendorId, ttl });
    } catch (error) {
      this.logger.error('Failed to cache vendor data', { error, vendorId });
    }
  }

  /**
   * Get cached vendor data
   */
  async getVendorCache(vendorId: string): Promise<any | null> {
    try {
      const cacheKey = `vendor:${vendorId}`;
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        this.updateStats(cacheKey, 'hit');
        return JSON.parse(cached);
      } else {
        this.updateStats(cacheKey, 'miss');
        return null;
      }
    } catch (error) {
      this.logger.error('Failed to get vendor cache', { error, vendorId });
      return null;
    }
  }

  /**
   * Smart cache invalidation based on business rules
   */
  async invalidateCache(pattern: string, reason: string = 'manual'): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      
      if (keys.length > 0) {
        await this.redis.del(keys as string[]);
        this.logger.info('Cache invalidated', { pattern, keyCount: keys.length, reason });
      } else {
        this.logger.info('No cache keys found for pattern', { pattern, reason });
      }
    } catch (error) {
      this.logger.error('Failed to invalidate cache', { error, pattern, reason });
    }
  }

  /**
   * Invalidate activity-related caches when activity is updated
   */
  async invalidateActivityCaches(activityId: string): Promise<void> {
    try {
      const patterns = [
        `activity:${activityId}`,
        `search:*`, // Invalidate all search caches as they might contain this activity
        `recommendations:*` // Invalidate recommendations as they might be affected
      ];

      for (const pattern of patterns) {
        await this.invalidateCache(pattern, 'activity_update');
      }

      this.logger.info('Activity caches invalidated', { activityId });
    } catch (error) {
      this.logger.error('Failed to invalidate activity caches', { error, activityId });
    }
  }

  /**
   * Invalidate vendor-related caches when vendor is updated
   */
  async invalidateVendorCaches(vendorId: string): Promise<void> {
    try {
      const patterns = [
        `vendor:${vendorId}`,
        `activity:*`, // Invalidate activity caches as they contain vendor info
        `search:*`, // Invalidate search caches
        `recommendations:*` // Invalidate recommendations
      ];

      for (const pattern of patterns) {
        await this.invalidateCache(pattern, 'vendor_update');
      }

      this.logger.info('Vendor caches invalidated', { vendorId });
    } catch (error) {
      this.logger.error('Failed to invalidate vendor caches', { error, vendorId });
    }
  }

  /**
   * Prefetch frequently accessed data
   */
  async prefetchData(): Promise<void> {
    try {
      // Get list of popular activities
      const popularActivities = await this.getPopularActivities();
      
      // Prefetch popular activity data
      for (const activityId of popularActivities) {
        // This would typically trigger a background job to fetch and cache data
        this.logger.info('Prefetching activity data', { activityId });
      }

      this.logger.info('Data prefetching completed');
    } catch (error) {
      this.logger.error('Failed to prefetch data', { error });
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<CacheStats> {
    try {
      const stats: CacheStats = {
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalRequests: 0,
        memoryUsage: 0,
        keyCount: 0
      };

      // Calculate stats from tracked data
      for (const [key, data] of this.stats) {
        stats.hits += data.hits;
        stats.misses += data.misses;
      }

      stats.totalRequests = stats.hits + stats.misses;
      stats.hitRate = stats.totalRequests > 0 ? (stats.hits / stats.totalRequests) * 100 : 0;

      // Get Redis memory info
      const info = await this.redis.info('memory');
      const memoryMatch = info.match(/used_memory_human:(\d+)/);
      stats.memoryUsage = memoryMatch ? parseInt(memoryMatch[1]) : 0;

      // Get key count
      stats.keyCount = await this.redis.dbSize();

      return stats;
    } catch (error) {
      this.logger.error('Failed to get cache stats', { error });
      return {
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalRequests: 0,
        memoryUsage: 0,
        keyCount: 0
      };
    }
  }

  /**
   * Update cache statistics
   */
  private updateStats(key: string, type: 'hit' | 'miss' | 'set'): void {
    if (!this.stats.has(key)) {
      this.stats.set(key, { hits: 0, misses: 0 });
    }

    const keyStats = this.stats.get(key)!;
    if (type === 'hit') {
      keyStats.hits++;
    } else if (type === 'miss') {
      keyStats.misses++;
    }
  }

  /**
   * Generate hash for search queries
   */
  private generateQueryHash(query: string, filters: Record<string, any>): string {
    const queryString = JSON.stringify({ query, filters });
    return Buffer.from(queryString).toString('base64').substring(0, 16);
  }

  /**
   * Get popular activities for prefetching
   */
  private async getPopularActivities(): Promise<string[]> {
    try {
      // This would typically query your analytics system for popular activities
      // For now, return an empty array
      return [];
    } catch (error) {
      this.logger.error('Failed to get popular activities', { error });
      return [];
    }
  }

  /**
   * Cleanup old cache data
   */
  async cleanupOldCache(): Promise<void> {
    try {
      // Redis handles TTL automatically, but we can add custom cleanup logic here
      this.logger.info('Cache cleanup completed');
    } catch (error) {
      this.logger.error('Failed to cleanup old cache', { error });
    }
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.quit();
      }
      this.logger.info('CacheManager closed');
    } catch (error) {
      this.logger.error('Failed to close CacheManager', { error });
    }
  }
}

export default CacheManager;
