/**
 * Database Optimization Service
 * 
 * This service provides:
 * - Query performance analysis
 * - Index optimization
 * - Aggregation pipeline optimization
 * - Database connection pooling
 * - Query caching strategies
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

class DatabaseOptimizationService {
  constructor() {
    this.queryStats = new Map();
    this.slowQueryThreshold = 1000; // 1 second
    this.connectionPoolSize = 10;
    this.maxQueryTime = 5000; // 5 seconds
    
    // Initialize optimization
    this.initializeOptimization();
  }

  // ===== INITIALIZATION =====

  /**
   * Initialize database optimization
   */
  async initializeOptimization() {
    try {
      logger.info('Initializing database optimization...');
      
      // Set connection pool size
      await this.optimizeConnectionPool();
      
      // Create and optimize indexes
      await this.createOptimizedIndexes();
      
      // Enable query profiling in development
      if (process.env.NODE_ENV === 'development') {
        this.enableQueryProfiling();
      }
      
      logger.info('Database optimization initialized successfully');
      
    } catch (error) {
      logger.error('Failed to initialize database optimization:', error);
      throw error;
    }
  }

  /**
   * Optimize connection pool
   */
  async optimizeConnectionPool() {
    try {
      const connection = mongoose.connection;
      
      // Set connection pool options
      connection.db.admin().command({
        setParameter: 1,
        maxTransactionLockRequestTimeoutMillis: 5000
      });
      
      // Set connection pool size
      await mongoose.connect(process.env.DATABASE_URL, {
        maxPoolSize: this.connectionPoolSize,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        bufferCommands: false
      });
      
      logger.info(`Connection pool optimized with size: ${this.connectionPoolSize}`);
      
    } catch (error) {
      logger.error('Failed to optimize connection pool:', error);
      throw error;
    }
  }

  // ===== INDEX OPTIMIZATION =====

  /**
   * Create optimized indexes for referral system
   */
  async createOptimizedIndexes() {
    try {
      logger.info('Creating optimized indexes...');
      
      // Referral indexes
      await this.createReferralIndexes();
      
      // ReferralCode indexes
      await this.createReferralCodeIndexes();
      
      // Invitation indexes
      await this.createInvitationIndexes();
      
      // Notification indexes
      await this.createNotificationIndexes();
      
      // User indexes
      await this.createUserIndexes();
      
      // Wallet indexes
      await this.createWalletIndexes();
      
      logger.info('All optimized indexes created successfully');
      
    } catch (error) {
      logger.error('Failed to create optimized indexes:', error);
      throw error;
    }
  }

  /**
   * Create referral collection indexes
   */
  async createReferralIndexes() {
    try {
      const Referral = require('../models/Referral');
      const collection = Referral.collection;
      
      // Compound index for referrer queries
      await collection.createIndex(
        { referrerId: 1, createdAt: -1 },
        { 
          name: 'referrer_created_desc',
          background: true,
          partialFilterExpression: { status: { $exists: true } }
        }
      );
      
      // Compound index for referred user queries
      await collection.createIndex(
        { referredUserId: 1, createdAt: -1 },
        { 
          name: 'referred_created_desc',
          background: true
        }
      );
      
      // Index for status-based queries
      await collection.createIndex(
        { status: 1, createdAt: -1 },
        { 
          name: 'status_created_desc',
          background: true
        }
      );
      
      // Index for reward tracking
      await collection.createIndex(
        { rewardStatus: 1, createdAt: -1 },
        { 
          name: 'reward_status_created',
          background: true
        }
      );
      
      // Text index for search functionality
      await collection.createIndex(
        { 
          referrerId: 'text', 
          referredUserId: 'text',
          status: 'text'
        },
        { 
          name: 'referral_text_search',
          background: true,
          weights: {
            referrerId: 10,
            referredUserId: 10,
            status: 5
          }
        }
      );
      
      logger.info('Referral indexes created successfully');
      
    } catch (error) {
      logger.error('Failed to create referral indexes:', error);
      throw error;
    }
  }

  /**
   * Create referral code indexes
   */
  async createReferralCodeIndexes() {
    try {
      const ReferralCode = require('../models/ReferralCode');
      const collection = ReferralCode.collection;
      
      // Unique index for code
      await collection.createIndex(
        { code: 1 },
        { 
          unique: true,
          name: 'code_unique',
          background: true
        }
      );
      
      // Index for user queries
      await collection.createIndex(
        { userId: 1, isActive: 1 },
        { 
          name: 'user_active_codes',
          background: true
        }
      );
      
      // Index for expiration queries
      await collection.createIndex(
        { expiresAt: 1 },
        { 
          name: 'expiration_index',
          background: true,
          expireAfterSeconds: 0
        }
      );
      
      // Compound index for analytics
      await collection.createIndex(
        { userId: 1, createdAt: -1, usageCount: -1 },
        { 
          name: 'user_created_usage',
          background: true
        }
      );
      
      logger.info('ReferralCode indexes created successfully');
      
    } catch (error) {
      logger.error('Failed to create referral code indexes:', error);
      throw error;
    }
  }

  /**
   * Create invitation indexes
   */
  async createInvitationIndexes() {
    try {
      const Invitation = require('../models/Invitation');
      const collection = Invitation.collection;
      
      // Index for referrer queries
      await collection.createIndex(
        { referrerId: 1, createdAt: -1 },
        { 
          name: 'invitation_referrer_created',
          background: true
        }
      );
      
      // Index for tracking metrics
      await collection.createIndex(
        { 
          referrerId: 1, 
          status: 1, 
          createdAt: -1 
        },
        { 
          name: 'invitation_referrer_status_created',
          background: true
        }
      );
      
      // Index for UTM tracking
      await collection.createIndex(
        { 
          'metadata.utm_source': 1, 
          'metadata.utm_campaign': 1,
          createdAt: -1
        },
        { 
          name: 'invitation_utm_tracking',
          background: true
        }
      );
      
      // Index for performance metrics
      await collection.createIndex(
        { 
          referrerId: 1, 
          'performance.conversionRate': -1,
          createdAt: -1
        },
        { 
          name: 'invitation_performance_ranking',
          background: true
        }
      );
      
      logger.info('Invitation indexes created successfully');
      
    } catch (error) {
      logger.error('Failed to create invitation indexes:', error);
      throw error;
    }
  }

  /**
   * Create notification indexes
   */
  async createNotificationIndexes() {
    try {
      const Notification = require('../models/Notification');
      const collection = Notification.collection;
      
      // Index for user queries
      await collection.createIndex(
        { userId: 1, status: 1, createdAt: -1 },
        { 
          name: 'notification_user_status_created',
          background: true
        }
      );
      
      // Index for type-based queries
      await collection.createIndex(
        { type: 1, priority: -1, createdAt: -1 },
        { 
          name: 'notification_type_priority_created',
          background: true
        }
      );
      
      // Index for expiration
      await collection.createIndex(
        { expiresAt: 1 },
        { 
          name: 'notification_expiration',
          background: true,
          expireAfterSeconds: 0
        }
      );
      
      // Index for delivery tracking
      await collection.createIndex(
        { 
          userId: 1, 
          'delivery.status': 1, 
          createdAt: -1 
        },
        { 
          name: 'notification_delivery_status',
          background: true
        }
      );
      
      logger.info('Notification indexes created successfully');
      
    } catch (error) {
      logger.error('Failed to create notification indexes:', error);
      throw error;
    }
  }

  /**
   * Create user indexes
   */
  async createUserIndexes() {
    try {
      const User = require('../models/User');
      const collection = User.collection;
      
      // Index for email queries
      await collection.createIndex(
        { email: 1 },
        { 
          unique: true,
          name: 'user_email_unique',
          background: true
        }
      );
      
      // Index for referral queries
      await collection.createIndex(
        { 'referralStats.totalReferrals': -1, createdAt: -1 },
        { 
          name: 'user_referral_ranking',
          background: true
        }
      );
      
      // Index for wallet queries
      await collection.createIndex(
        { 'wallet.balance': -1 },
        { 
          name: 'user_wallet_balance',
          background: true
        }
      );
      
      logger.info('User indexes created successfully');
      
    } catch (error) {
      logger.error('Failed to create user indexes:', error);
      throw error;
    }
  }

  /**
   * Create wallet indexes
   */
  async createWalletIndexes() {
    try {
      const Wallet = require('../models/Wallet');
      const collection = Wallet.collection;
      
      // Index for user queries
      await collection.createIndex(
        { userId: 1 },
        { 
          unique: true,
          name: 'wallet_user_unique',
          background: true
        }
      );
      
      // Index for transaction queries
      await collection.createIndex(
        { userId: 1, 'transactions.createdAt': -1 },
        { 
          name: 'wallet_user_transactions',
          background: true
        }
      );
      
      // Index for balance queries
      await collection.createIndex(
        { balance: -1, updatedAt: -1 },
        { 
          name: 'wallet_balance_ranking',
          background: true
        }
      );
      
      logger.info('Wallet indexes created successfully');
      
    } catch (error) {
      logger.error('Failed to create wallet indexes:', error);
      throw error;
    }
  }

  // ===== QUERY OPTIMIZATION =====

  /**
   * Optimize referral queries
   */
  optimizeReferralQueries() {
    return {
      // Get referrals by referrer with pagination
      getReferralsByReferrer: (referrerId, page = 1, limit = 10) => {
        const skip = (page - 1) * limit;
        return {
          filter: { referrerId },
          options: {
            sort: { createdAt: -1 },
            skip,
            limit,
            lean: true, // Return plain JavaScript objects
            projection: {
              referrerId: 1,
              referredUserId: 1,
              status: 1,
              rewardStatus: 1,
              createdAt: 1,
              rewardAmount: 1
            }
          }
        };
      },

      // Get referral statistics with aggregation
      getReferralStats: (referrerId, period = '30d') => {
        const dateFilter = this.getDateFilter(period);
        
        return [
          { $match: { referrerId, createdAt: dateFilter } },
          {
            $group: {
              _id: null,
              totalReferrals: { $sum: 1 },
              successfulReferrals: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
              },
              totalRewards: { $sum: '$rewardAmount' },
              avgRewardAmount: { $avg: '$rewardAmount' }
            }
          },
          {
            $project: {
              _id: 0,
              totalReferrals: 1,
              successfulReferrals: 1,
              totalRewards: 1,
              avgRewardAmount: { $round: ['$avgRewardAmount', 2] },
              conversionRate: {
                $multiply: [
                  { $divide: ['$successfulReferrals', '$totalReferrals'] },
                  100
                ]
              }
            }
          }
        ];
      },

      // Get top referrers with aggregation
      getTopReferrers: (limit = 10, period = '30d') => {
        const dateFilter = this.getDateFilter(period);
        
        return [
          { $match: { createdAt: dateFilter, status: 'completed' } },
          {
            $group: {
              _id: '$referrerId',
              totalReferrals: { $sum: 1 },
              totalRewards: { $sum: '$rewardAmount' }
            }
          },
          { $sort: { totalReferrals: -1, totalRewards: -1 } },
          { $limit: limit },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user',
              pipeline: [
                { $project: { name: 1, email: 1, avatar: 1 } }
              ]
            }
          },
          { $unwind: '$user' },
          {
            $project: {
              _id: 1,
              user: 1,
              totalReferrals: 1,
              totalRewards: 1
            }
          }
        ];
      }
    };
  }

  /**
   * Optimize invitation queries
   */
  optimizeInvitationQueries() {
    return {
      // Get invitation analytics with aggregation
      getInvitationAnalytics: (referrerId, period = '30d') => {
        const dateFilter = this.getDateFilter(period);
        
        return [
          { $match: { referrerId, createdAt: dateFilter } },
          {
            $group: {
              _id: null,
              totalInvitations: { $sum: 1 },
              totalClicks: { $sum: '$tracking.clicks' },
              totalConversions: { $sum: '$tracking.conversions' },
              avgClickThroughRate: {
                $avg: {
                  $cond: [
                    { $gt: ['$tracking.clicks', 0] },
                    { $divide: ['$tracking.conversions', '$tracking.clicks'] },
                    0
                  ]
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              totalInvitations: 1,
              totalClicks: 1,
              totalConversions: 1,
              avgClickThroughRate: { $round: ['$avgClickThroughRate', 4] },
              clickThroughRate: {
                $multiply: [
                  { $divide: ['$totalClicks', '$totalInvitations'] },
                  100
                ]
              },
              conversionRate: {
                $multiply: [
                  { $divide: ['$totalConversions', '$totalClicks'] },
                  100
                ]
              }
            }
          }
        ];
      },

      // Get geographic analytics
      getGeographicAnalytics: (referrerId, period = '30d') => {
        const dateFilter = this.getDateFilter(period);
        
        return [
          { $match: { referrerId, createdAt: dateFilter } },
          {
            $group: {
              _id: '$metadata.geographic.country',
              invitations: { $sum: 1 },
              clicks: { $sum: '$tracking.clicks' },
              conversions: { $sum: '$tracking.conversions' }
            }
          },
          { $sort: { invitations: -1 } },
          {
            $project: {
              country: '$_id',
              invitations: 1,
              clicks: 1,
              conversions: 1,
              clickThroughRate: {
                $multiply: [
                  { $divide: ['$clicks', '$invitations'] },
                  100
                ]
              },
              conversionRate: {
                $multiply: [
                  { $divide: ['$conversions', '$clicks'] },
                  100
                ]
              }
            }
          }
        ];
      }
    };
  }

  /**
   * Get date filter for time periods
   */
  getDateFilter(period) {
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    return { $gte: startDate };
  }

  // ===== QUERY PERFORMANCE MONITORING =====

  /**
   * Track query performance
   */
  trackQueryPerformance(queryName, executionTime, success = true) {
    if (!this.queryStats.has(queryName)) {
      this.queryStats.set(queryName, {
        totalExecutions: 0,
        totalTime: 0,
        avgTime: 0,
        slowQueries: 0,
        failedQueries: 0,
        lastExecution: null
      });
    }
    
    const stats = this.queryStats.get(queryName);
    stats.totalExecutions++;
    stats.totalTime += executionTime;
    stats.avgTime = stats.totalTime / stats.totalExecutions;
    stats.lastExecution = new Date();
    
    if (executionTime > this.slowQueryThreshold) {
      stats.slowQueries++;
      logger.warn(`Slow query detected: ${queryName} took ${executionTime}ms`);
    }
    
    if (!success) {
      stats.failedQueries++;
    }
    
    this.queryStats.set(queryName, stats);
  }

  /**
   * Get query performance statistics
   */
  getQueryPerformanceStats() {
    const stats = {};
    
    for (const [queryName, queryStats] of this.queryStats) {
      stats[queryName] = {
        ...queryStats,
        successRate: ((queryStats.totalExecutions - queryStats.failedQueries) / queryStats.totalExecutions) * 100,
        slowQueryRate: (queryStats.slowQueries / queryStats.totalExecutions) * 100
      };
    }
    
    return stats;
  }

  /**
   * Get slow queries
   */
  getSlowQueries() {
    const slowQueries = [];
    
    for (const [queryName, queryStats] of this.queryStats) {
      if (queryStats.slowQueries > 0) {
        slowQueries.push({
          queryName,
          ...queryStats
        });
      }
    }
    
    return slowQueries.sort((a, b) => b.slowQueries - a.slowQueries);
  }

  // ===== QUERY PROFILING =====

  /**
   * Enable query profiling (development only)
   */
  enableQueryProfiling() {
    try {
      const db = mongoose.connection.db;
      
      // Set profiling level to 2 (log all operations)
      db.admin().command({ profile: 2, slowms: 100 });
      
      logger.info('Query profiling enabled (development mode)');
      
    } catch (error) {
      logger.warn('Failed to enable query profiling:', error.message);
    }
  }

  /**
   * Disable query profiling
   */
  disableQueryProfiling() {
    try {
      const db = mongoose.connection.db;
      
      // Set profiling level to 0 (disabled)
      db.admin().command({ profile: 0 });
      
      logger.info('Query profiling disabled');
      
    } catch (error) {
      logger.warn('Failed to disable query profiling:', error.message);
    }
  }

  // ===== DATABASE MAINTENANCE =====

  /**
   * Analyze database performance
   */
  async analyzeDatabasePerformance() {
    try {
      const db = mongoose.connection.db;
      
      // Get collection statistics
      const collections = await db.listCollections().toArray();
      const stats = {};
      
      for (const collection of collections) {
        const collectionStats = await db.collection(collection.name).stats();
        stats[collection.name] = {
          count: collectionStats.count,
          size: collectionStats.size,
          avgObjSize: collectionStats.avgObjSize,
          indexes: collectionStats.nindexes,
          totalIndexSize: collectionStats.totalIndexSize
        };
      }
      
      return stats;
      
    } catch (error) {
      logger.error('Failed to analyze database performance:', error);
      throw error;
    }
  }

  /**
   * Compact collections (if supported)
   */
  async compactCollections() {
    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      
      for (const collection of collections) {
        try {
          await db.collection(collection.name).compact();
          logger.info(`Collection ${collection.name} compacted successfully`);
        } catch (error) {
          logger.warn(`Failed to compact collection ${collection.name}:`, error.message);
        }
      }
      
    } catch (error) {
      logger.error('Failed to compact collections:', error);
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Get database connection status
   */
  getConnectionStatus() {
    const connection = mongoose.connection;
    
    return {
      readyState: connection.readyState,
      host: connection.host,
      port: connection.port,
      name: connection.name,
      poolSize: connection.poolSize,
      maxPoolSize: connection.maxPoolSize
    };
  }

  /**
   * Get index information
   */
  async getIndexInformation() {
    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      const indexInfo = {};
      
      for (const collection of collections) {
        const indexes = await db.collection(collection.name).indexes();
        indexInfo[collection.name] = indexes.map(index => ({
          name: index.name,
          key: index.key,
          unique: index.unique || false,
          background: index.background || false
        }));
      }
      
      return indexInfo;
      
    } catch (error) {
      logger.error('Failed to get index information:', error);
      throw error;
    }
  }
}

// Create singleton instance
const databaseOptimizationService = new DatabaseOptimizationService();

module.exports = databaseOptimizationService;
