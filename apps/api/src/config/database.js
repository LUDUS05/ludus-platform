/**
 * @fileoverview Database configuration and connection management for LUDUS platform.
 *
 * Purpose: Manages MongoDB database connections with support for both production
 * (MongoDB Atlas) and development/testing (in-memory) environments, optimized
 * for the LUDUS social activity platform serving the Saudi Arabian market.
 *
 * Business Context: This module ensures reliable database connectivity for all
 * platform operations including user management, activity listings, booking systems,
 * payment processing, and referral tracking. It's designed to handle both production
 * workloads and development/testing scenarios efficiently.
 *
 * Implementation Notes:
 * - Automatic environment detection (production vs development/testing)
 * - In-memory MongoDB for development and testing
 * - Connection timeout optimization for Render deployment
 * - Automatic index creation for performance optimization
 * - Graceful shutdown handling
 * - Comprehensive error handling and logging
 *
 * Dependencies:
 * - Mongoose for MongoDB ODM
 * - MongoDB Memory Server for testing
 * - Environment variables for configuration
 *
 * Evolution: Originally simple connection setup, evolved to include comprehensive
 * environment handling, performance optimization, and testing support.
 *
 * @version 1.0.0
 * @since 2024-01-01
 * @modified 2025-01-08 - Added performance optimization and comprehensive error handling
 */

const mongoose = require('mongoose');
const { connectAtlas, disconnectAtlas, healthCheck } = require('./mongodb-atlas');

let mongoServer;

/**
 * Establishes database connection with environment-specific configuration.
 *
 * Purpose: Connects to MongoDB database using appropriate configuration based on
 * the current environment (production, development, or testing), ensuring optimal
 * performance and reliability for the LUDUS platform operations.
 *
 * Business Context: Critical for all platform functionality including user authentication,
 * activity management, booking systems, payment processing, and referral tracking.
 * The connection strategy adapts to different deployment scenarios while maintaining
 * data integrity and performance.
 *
 * Parameters:
 * @returns {Promise<boolean>} Promise that resolves to true if connection successful,
 * false if connection failed. In production, returns false to allow server to continue
 * without database (graceful degradation).
 *
 * Implementation Notes:
 * - Environment detection for connection strategy
 * - In-memory MongoDB for development/testing
 * - Production MongoDB Atlas connection
 * - Optimized timeouts for Render deployment
 * - Automatic index creation for performance
 * - Graceful error handling with fallback
 *
 * Dependencies:
 * - Mongoose for MongoDB connection
 * - MongoDB Memory Server for testing
 * - Environment variables for configuration
 *
 * Evolution: Originally simple connection, evolved to include environment-specific
 * handling, performance optimization, and comprehensive error management.
 *
 * @async
 * @function connectDB
 * @returns {Promise<boolean>} Connection success status
 *
 * @example
 * // Connect to database during server startup
 * const connected = await connectDB();
 * if (connected) {
 *   console.log('Database connected successfully');
 * }
 *
 * @since 2024-01-01
 * @modified 2025-01-08 - Added environment-specific handling and performance optimization
 */
const connectDB = async () => {
  try {
    // Use MongoDB Atlas for production and development
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
      if (process.env.MONGODB_URI) {
        console.log('🚀 Connecting to MongoDB Atlas...');

        // Set up query optimization
        mongoose.set('maxTimeMS', 10000); // 10 second query timeout

        return await connectAtlas();
      } else {
        console.error('MONGODB_URI environment variable not set');
        return false;
      }
    }

    // Use in-memory MongoDB for testing
    if (process.env.NODE_ENV === 'test') {
      console.log('Starting in-memory MongoDB for testing...');
      // Only import mongodb-memory-server when needed to avoid production dependency issues
      // eslint-disable-next-line node/no-extraneous-require
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();

      const conn = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log(`✅ In-memory MongoDB Connected: ${conn.connection.host}`);
      await createIndexes();
      return true;
    }

    console.error('Invalid NODE_ENV or missing MONGODB_URI');
    return false;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('⚠️  Server will continue without database connection');
    return false;
  }
};

const createIndexes = async () => {
  try {
    // Wait for connection to be ready
    if (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => mongoose.connection.once('open', resolve));
    }

    const db = mongoose.connection.db;

    // Users indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ "location.coordinates": "2dsphere" });

    // Activities indexes
    await db.collection('activities').createIndex({ "location.coordinates": "2dsphere" });
    await db.collection('activities').createIndex({ category: 1, isActive: 1 });
    await db.collection('activities').createIndex({ featured: 1, isActive: 1 });
    await db.collection('activities').createIndex({
      title: "text",
      description: "text",
      tags: "text"
    });

    // Bookings indexes
    await db.collection('bookings').createIndex({ user: 1, bookingDate: -1 });
    await db.collection('bookings').createIndex({ activity: 1, bookingDate: 1 });
    await db.collection('bookings').createIndex({ status: 1, createdAt: -1 });

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

// Cleanup function for graceful shutdown
const disconnectDB = async () => {
  try {
    if (process.env.NODE_ENV === 'test' && mongoServer) {
      await mongoServer.stop();
      console.log('✅ In-memory MongoDB stopped');
    } else {
      await disconnectAtlas();
    }
  } catch (error) {
    console.error('Error during database cleanup:', error);
  }
};

module.exports = { connectDB, disconnectDB, healthCheck };
