/**
 * @fileoverview MongoDB Atlas configuration and connection management for LUDUS platform.
 *
 * Purpose: Manages MongoDB Atlas production database connections with optimized
 * configuration for the LUDUS social activity platform serving the Saudi Arabian market.
 *
 * Business Context: This module ensures reliable database connectivity for all
 * platform operations including user management, activity listings, booking systems,
 * payment processing, and referral tracking. It's designed for production workloads
 * with high availability and performance optimization.
 *
 * Implementation Notes:
 * - Production-ready MongoDB Atlas connection
 * - Optimized connection pooling for Render deployment
 * - Comprehensive error handling and logging
 * - Automatic index creation for performance
 * - Health check endpoints for monitoring
 * - Graceful shutdown handling
 *
 * Dependencies:
 * - Mongoose for MongoDB ODM
 * - Environment variables for configuration
 * - MongoDB Atlas cluster (M30 tier)
 *
 * Evolution: Created specifically for production MongoDB Atlas deployment
 * with comprehensive monitoring and performance optimization.
 *
 * @version 1.0.0
 * @since 2025-10-06
 * @modified 2025-10-06 - Initial implementation for LDS-005
 */

const mongoose = require('mongoose');

/**
 * MongoDB Atlas connection configuration optimized for production.
 *
 * Purpose: Establishes connection to MongoDB Atlas cluster with production-ready
 * settings including connection pooling, timeouts, and error handling.
 *
 * Business Context: Critical for all platform functionality including user authentication,
 * activity management, booking systems, payment processing, and referral tracking.
 * The connection strategy is optimized for high availability and performance.
 *
 * Configuration:
 * - Connection pooling for concurrent requests
 * - Optimized timeouts for Render deployment
 * - Automatic reconnection on failures
 * - Comprehensive error handling
 *
 * @type {Object}
 */
const atlasConfig = {
  // Connection options optimized for production
  options: {
    maxPoolSize: 10,                    // Maximum number of connections in pool
    minPoolSize: 2,                     // Minimum number of connections in pool
    maxIdleTimeMS: 30000,              // Close connections after 30s of inactivity
    serverSelectionTimeoutMS: 5000,    // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000,            // Close sockets after 45s of inactivity
    connectTimeoutMS: 10000,           // Connection timeout
    retryWrites: true,                 // Enable retryable writes
    w: 'majority',                     // Write concern
    readPreference: 'primary',         // Read from primary replica
    compressors: ['zlib'],             // Enable compression
    zlibCompressionLevel: 6            // Compression level
  },

  // Connection string template
  uriTemplate: 'mongodb+srv://{username}:{password}@{cluster}.mongodb.net/{database}?retryWrites=true&w=majority',

  // Health check configuration
  healthCheck: {
    timeout: 5000,                     // Health check timeout
    interval: 30000,                   // Health check interval (30s)
    retries: 3                         // Number of retries before marking as unhealthy
  },

  // Monitoring configuration
  monitoring: {
    slowQueryThreshold: 100,           // Log queries slower than 100ms
    connectionPoolThreshold: 0.8,      // Alert when pool usage > 80%
    memoryThreshold: 0.9,              // Alert when memory usage > 90%
    cpuThreshold: 0.8                  // Alert when CPU usage > 80%
  }
};

/**
 * Connection state tracking for monitoring and health checks.
 *
 * Purpose: Tracks connection state and performance metrics for monitoring
 * and alerting systems.
 *
 * @type {Object}
 */
let connectionState = {
  isConnected: false,
  lastConnected: null,
  lastError: null,
  connectionCount: 0,
  errorCount: 0,
  slowQueries: 0,
  startTime: Date.now()
};

/**
 * Establishes MongoDB Atlas connection with production-ready configuration.
 *
 * Purpose: Connects to MongoDB Atlas cluster using optimized configuration
 * for production workloads with comprehensive error handling and monitoring.
 *
 * Business Context: Critical for all platform functionality. The connection
 * strategy ensures high availability and performance for the LUDUS platform.
 *
 * Parameters:
 * @returns {Promise<boolean>} Promise that resolves to true if connection successful,
 * false if connection failed. In production, returns false to allow graceful degradation.
 *
 * Implementation Notes:
 * - Production MongoDB Atlas connection
 * - Optimized connection pooling
 * - Comprehensive error handling
 * - Automatic index creation
 * - Health monitoring setup
 *
 * Dependencies:
 * - Mongoose for MongoDB connection
 * - Environment variables for configuration
 * - MongoDB Atlas cluster
 *
 * @async
 * @function connectAtlas
 * @returns {Promise<boolean>} Connection success status
 *
 * @example
 * // Connect to MongoDB Atlas during server startup
 * const connected = await connectAtlas();
 * if (connected) {
 *   console.log('MongoDB Atlas connected successfully');
 * }
 *
 * @since 2025-10-06
 */
const connectAtlas = async () => {
  try {
    // Validate required environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    console.log('🚀 Connecting to MongoDB Atlas...');
    console.log(`📍 Cluster: ${extractClusterInfo(process.env.MONGODB_URI)}`);

    // Connect to MongoDB Atlas
    const conn = await mongoose.connect(process.env.MONGODB_URI, atlasConfig.options);

    // Update connection state
    connectionState.isConnected = true;
    connectionState.lastConnected = new Date();
    connectionState.connectionCount++;
    connectionState.lastError = null;

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Connection Pool: ${conn.connection.readyState === 1 ? 'Active' : 'Inactive'}`);

    // Set up connection event listeners
    setupConnectionListeners(conn);

    // Create production indexes in the background (non-blocking)
    createProductionIndexes().catch(err => {
      console.error('⚠️  Background index creation failed:', err.message);
    });

    // Set up health monitoring
    setupHealthMonitoring();

    return true;
  } catch (error) {
    // Update connection state
    connectionState.isConnected = false;
    connectionState.lastError = error.message;
    connectionState.errorCount++;

    console.error('❌ MongoDB Atlas connection error:', error.message);

    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Production server will continue without database connection');
      return false;
    } else {
      throw error;
    }
  }
};

/**
 * Sets up connection event listeners for monitoring and error handling.
 *
 * Purpose: Monitors connection events and updates connection state for
 * health checks and alerting systems.
 *
 * @param {Object} connection - Mongoose connection object
 * @since 2025-10-06
 */
const setupConnectionListeners = (connection) => {
  // Connection events
  const conn = mongoose.connection; // use the singleton connection
  conn.on('connected', () => {
    console.log('🟢 MongoDB Atlas connection established');
    connectionState.isConnected = true;
    connectionState.lastConnected = new Date();
  });

  conn.on('disconnected', () => {
    console.log('🔴 MongoDB Atlas connection lost');
    connectionState.isConnected = false;
  });

  conn.on('reconnected', () => {
    console.log('🟡 MongoDB Atlas connection restored');
    connectionState.isConnected = true;
    connectionState.lastConnected = new Date();
  });

  conn.on('error', (error) => {
    console.error('❌ MongoDB Atlas connection error:', error.message);
    connectionState.isConnected = false;
    connectionState.lastError = error.message;
    connectionState.errorCount++;
  });

  // Query monitoring
  mongoose.set('debug', (collectionName, method, query, doc) => {
    const queryTime = Date.now() - connectionState.startTime;
    if (queryTime > atlasConfig.monitoring.slowQueryThreshold) {
      console.warn(`🐌 Slow query detected: ${collectionName}.${method} (${queryTime}ms)`, query);
      connectionState.slowQueries++;
    }
  });
};

/**
 * Creates production-optimized indexes for all collections.
 *
 * Purpose: Creates comprehensive indexes for optimal query performance
 * in production environment with focus on LUDUS platform use cases.
 *
 * Business Context: Critical for platform performance including user searches,
 * activity discovery, booking management, and analytics. Indexes are optimized
 * for common query patterns and geospatial operations.
 *
 * Implementation Notes:
 * - Compound indexes for complex queries
 * - Geospatial indexes for location-based searches
 * - Text indexes for full-text search
 * - Unique indexes for data integrity
 *
 * Dependencies:
 * - Mongoose connection
 * - Database collections
 *
 * @async
 * @function createProductionIndexes
 * @returns {Promise<void>}
 *
 * @since 2025-10-06
 */
const createProductionIndexes = async () => {
  // Allow skipping index creation in health checks or constrained environments
  if (process.env.SKIP_INDEX_BUILD === '1') {
    console.log('⏭️  Skipping production index creation (SKIP_INDEX_BUILD=1)');
    return;
  }
  try {
    console.log('📊 Creating production indexes...');

    const db = mongoose.connection.db;

    // Users Collection Indexes
    // Note: email and phone are usually indexed via schema unique:true
    await db.collection('users').createIndex({ "location.coordinates": "2dsphere" }, { background: true });
    await db.collection('users').createIndex({ "profile.firstName": "text", "profile.lastName": "text", email: "text" }, { background: true });
    await db.collection('users').createIndex({ "location.city": 1, "preferences.interests": 1 }, { background: true });
    await db.collection('users').createIndex({ "stats.totalBookings": -1, "createdAt": -1 }, { background: true });

    // Partners Collection Indexes
    // Note: contact.email and registrationNumber are usually indexed via schema unique:true
    await db.collection('partners').createIndex({ "location.coordinates": "2dsphere" }, { background: true });
    await db.collection('partners').createIndex({ "location.city": 1, "verification.isVerified": 1 }, { background: true });
    await db.collection('partners').createIndex({ "stats.averageRating": -1, "stats.reviewCount": -1 }, { background: true });
    await db.collection('partners').createIndex({ "businessInfo.name": "text", "businessInfo.description": "text" }, { background: true });

    // Activities Collection Indexes
    await db.collection('activities').createIndex({ "location.coordinates": "2dsphere" }, { background: true });
    await db.collection('activities').createIndex({ "category.id": 1, "location.city": 1, "status": 1 }, { background: true });
    await db.collection('activities').createIndex({ "partner.id": 1, "status": 1 }, { background: true });
    await db.collection('activities').createIndex({ "schedule.availableDates.date": 1, "status": 1 }, { background: true });
    await db.collection('activities').createIndex({ "stats.averageRating": -1, "stats.reviewCount": -1 }, { background: true });
    await db.collection('activities').createIndex({ "features.isFeatured": 1, "features.isPopular": 1, "status": 1 }, { background: true });
    // Text search index for activities
    // Use background creation to avoid blocking
    await db.collection('activities').createIndex({ "title": "text", "description": "text", "tags": "text" }, { background: true, name: "activities_text" });

    // Bookings Collection Indexes
    // Note: bookingNumber is usually indexed via schema unique:true
    await db.collection('bookings').createIndex({ "user.id": 1, "status": 1 }, { background: true });
    await db.collection('bookings').createIndex({ "activity.id": 1, "schedule.date": 1 }, { background: true });
    await db.collection('bookings').createIndex({ "schedule.date": 1, "status": 1 }, { background: true });
    await db.collection('bookings').createIndex({ "payment.status": 1, "status": 1 }, { background: true });
    await db.collection('bookings').createIndex({ "createdAt": -1, "status": 1 }, { background: true });

    // Reviews Collection Indexes
    await db.collection('reviews').createIndex({ "activity.id": 1, "rating.overall": -1 }, { background: true });
    await db.collection('reviews').createIndex({ "user.id": 1, "createdAt": -1 }, { background: true });
    await db.collection('reviews').createIndex({ "status": 1, "createdAt": -1 }, { background: true });

    // Payments Collection Indexes
    // Note: paymentNumber is usually indexed via schema unique:true
    await db.collection('payments').createIndex({ "booking.id": 1 }, { background: true });
    await db.collection('payments').createIndex({ "user.id": 1, "status": 1 }, { background: true });
    await db.collection('payments').createIndex({ "status": 1, "createdAt": -1 }, { background: true });

    // Notifications Collection Indexes
    await db.collection('notifications').createIndex({ "user": 1, "isRead": 1 }, { background: true });
    await db.collection('notifications').createIndex({ "type": 1, "createdAt": -1 }, { background: true });
    await db.collection('notifications').createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0, background: true });

    // Optimize slow notification queries
    await db.collection('notificationenhanceds').createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0, background: true });
    await db.collection('notificationenhanceds').createIndex({ "user": 1, "isRead": 1, "createdAt": -1 }, { background: true });

    // Analytics Collection Indexes
    await db.collection('analytics').createIndex({ "date": 1, "type": 1 }, { background: true });
    await db.collection('analytics').createIndex({ "createdAt": -1 }, { background: true });

    // Optimize slow page queries
    await db.collection('pages').createIndex({ "status": 1, "placement": 1 }, { background: true });
    await db.collection('pages').createIndex({ "status": 1, "placement": 1, "publishDate": -1 }, { background: true });

    // Optimize slow user queries
    await db.collection('users').createIndex({ "role": 1, "status": 1 }, { background: true });

    console.log('✅ Production indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating production indexes:', error);
    throw error;
  }
};

/**
 * Sets up health monitoring for the database connection.
 *
 * Purpose: Monitors database health and performance metrics for alerting
 * and monitoring systems.
 *
 * @since 2025-10-06
 */
const setupHealthMonitoring = () => {
  // Health check interval
  setInterval(async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        // Test basic query
        await mongoose.connection.db.admin().ping();
        connectionState.isConnected = true;
      } else {
        connectionState.isConnected = false;
      }
    } catch (error) {
      connectionState.isConnected = false;
      connectionState.lastError = error.message;
    }
  }, atlasConfig.healthCheck.interval);
};

/**
 * Extracts cluster information from MongoDB URI for logging.
 *
 * Purpose: Extracts cluster name and database from connection string
 * for logging and monitoring purposes.
 *
 * @param {string} uri - MongoDB connection string
 * @returns {string} Cluster information
 * @since 2025-10-06
 */
const extractClusterInfo = (uri) => {
  try {
    const match = uri.match(/mongodb\+srv:\/\/[^@]+@([^.]+)\.mongodb\.net\/([^?]+)/);
    if (match) {
      return `${match[1]} (${match[2]})`;
    }
    return 'Unknown cluster';
  } catch (error) {
    return 'Unknown cluster';
  }
};

/**
 * Gets current connection state for health checks and monitoring.
 *
 * Purpose: Provides current connection state and performance metrics
 * for health check endpoints and monitoring systems.
 *
 * @returns {Object} Connection state and metrics
 * @since 2025-10-06
 */
const getConnectionState = () => {
  return {
    ...connectionState,
    uptime: Date.now() - connectionState.startTime,
    mongooseState: mongoose.connection.readyState,
    poolSize: mongoose.connection.db?.s?.topology?.s?.pool?.size || 0,
    activeConnections: mongoose.connection.db?.s?.topology?.s?.pool?.availableConnections || 0
  };
};

/**
 * Performs health check on the database connection.
 *
 * Purpose: Tests database connectivity and performance for health check
 * endpoints and monitoring systems.
 *
 * @returns {Promise<Object>} Health check result
 * @since 2025-10-06
 */
const healthCheck = async () => {
  const startTime = Date.now();

  try {
    if (mongoose.connection.readyState !== 1) {
      return {
        status: 'unhealthy',
        message: 'Database not connected',
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }

    // Test basic query
    await mongoose.connection.db.admin().ping();

    return {
      status: 'healthy',
      message: 'Database connection successful',
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      connectionState: getConnectionState()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error.message,
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      connectionState: getConnectionState()
    };
  }
};

/**
 * Gracefully disconnects from MongoDB Atlas.
 *
 * Purpose: Closes database connection gracefully during server shutdown
 * to prevent data corruption and ensure clean shutdown.
 *
 * @returns {Promise<void>}
 * @since 2025-10-06
 */
const disconnectAtlas = async () => {
  try {
    await mongoose.connection.close();
    connectionState.isConnected = false;
    console.log('✅ MongoDB Atlas connection closed gracefully');
  } catch (error) {
    console.error('❌ Error during MongoDB Atlas cleanup:', error);
  }
};

module.exports = {
  connectAtlas,
  disconnectAtlas,
  getConnectionState,
  healthCheck,
  atlasConfig
};
