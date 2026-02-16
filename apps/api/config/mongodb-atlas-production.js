/**
 * MongoDB Atlas Production Configuration
 * LUDUS Platform - Production Database Setup
 */

const mongoose = require('mongoose');
const { createLogger } = require('../utils/logger');

const logger = createLogger('mongodb-atlas-production');

// Production MongoDB Atlas Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ludus_app:SecurePassword123!@ludus-production.abc123.mongodb.net/ludus_production?retryWrites=true&w=majority&authSource=admin';

// Connection options for production
const connectionOptions = {
  // Connection pool settings
  maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 20,
  minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE) || 5,
  maxIdleTimeMS: parseInt(process.env.MONGODB_MAX_IDLE_TIME) || 30000,
  
  // Timeout settings
  serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT) || 5000,
  connectTimeoutMS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT) || 10000,
  socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT) || 45000,
  
  // Retry settings
  retryWrites: true,
  retryReads: true,
  
  // SSL/TLS settings
  ssl: process.env.MONGODB_SSL === 'true' || true,
  sslValidate: process.env.MONGODB_SSL_VALIDATE === 'true' || true,
  
  // Write concern
  writeConcern: {
    w: 'majority',
    j: true,
    wtimeout: 10000
  },
  
  // Read preference
  readPreference: 'primary',
  
  // Compression
  compressors: ['zlib'],
  
  // Buffer commands
  bufferCommands: false,
  bufferMaxEntries: 0
};

// Connection event handlers
const setupConnectionHandlers = () => {
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB Atlas Production: Connected successfully');
    logger.info(`Database: ${mongoose.connection.db.databaseName}`);
    logger.info(`Host: ${mongoose.connection.host}`);
    logger.info(`Port: ${mongoose.connection.port}`);
  });

  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB Atlas Production: Connection error', error);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB Atlas Production: Disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB Atlas Production: Reconnected');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      logger.info('MongoDB Atlas Production: Connection closed through app termination');
      process.exit(0);
    } catch (error) {
      logger.error('MongoDB Atlas Production: Error during connection close', error);
      process.exit(1);
    }
  });
};

// Connect to MongoDB Atlas Production
const connectAtlas = async () => {
  try {
    logger.info('MongoDB Atlas Production: Attempting to connect...');
    
    // Set up connection handlers
    setupConnectionHandlers();
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, connectionOptions);
    
    // Verify connection
    await mongoose.connection.db.admin().ping();
    logger.info('MongoDB Atlas Production: Ping successful');
    
    return true;
  } catch (error) {
    logger.error('MongoDB Atlas Production: Connection failed', error);
    throw error;
  }
};

// Create production indexes
const createProductionIndexes = async () => {
  try {
    logger.info('MongoDB Atlas Production: Creating indexes...');
    
    const db = mongoose.connection.db;
    
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ 'preferences.location.coordinates': '2dsphere' });
    await db.collection('users').createIndex({ role: 1, isActive: 1 });
    await db.collection('users').createIndex({ createdAt: -1 });
    
    // Activities collection indexes
    await db.collection('activities').createIndex({ 'location.coordinates': '2dsphere' });
    await db.collection('activities').createIndex({ category: 1, status: 1, isActive: 1 });
    await db.collection('activities').createIndex({ 
      'title.ar': 'text', 
      'title.en': 'text', 
      'description.ar': 'text', 
      'description.en': 'text' 
    });
    await db.collection('activities').createIndex({ 'schedule.startDate': 1, 'schedule.endDate': 1 });
    await db.collection('activities').createIndex({ 'partner.id': 1, status: 1 });
    await db.collection('activities').createIndex({ 'pricing.adult': 1 });
    await db.collection('activities').createIndex({ createdAt: -1 });
    
    // Bookings collection indexes
    await db.collection('bookings').createIndex({ 'user.id': 1, createdAt: -1 });
    await db.collection('bookings').createIndex({ 'activity.id': 1, status: 1 });
    await db.collection('bookings').createIndex({ 'payment.id': 1 });
    await db.collection('bookings').createIndex({ qrCode: 1 }, { unique: true });
    await db.collection('bookings').createIndex({ status: 1, createdAt: -1 });
    
    // Reviews collection indexes
    await db.collection('reviews').createIndex({ 'activity.id': 1, isActive: 1 });
    await db.collection('reviews').createIndex({ 'user.id': 1, createdAt: -1 });
    await db.collection('reviews').createIndex({ rating: 1, isActive: 1 });
    await db.collection('reviews').createIndex({ isVerified: 1, createdAt: -1 });
    
    // Payments collection indexes
    await db.collection('payments').createIndex({ bookingId: 1 });
    await db.collection('payments').createIndex({ status: 1, createdAt: -1 });
    await db.collection('payments').createIndex({ transactionId: 1 }, { unique: true });
    
    // TTL indexes
    await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await db.collection('analytics').createIndex({ createdAt: 1 }, { expireAfterSeconds: 31536000 });
    
    logger.info('MongoDB Atlas Production: Indexes created successfully');
  } catch (error) {
    logger.error('MongoDB Atlas Production: Error creating indexes', error);
    throw error;
  }
};

// Health check for production database
const healthCheck = async () => {
  try {
    // Ping the database
    await mongoose.connection.db.admin().ping();
    
    // Check connection state
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      status: state === 1 ? 'healthy' : 'unhealthy',
      state: states[state],
      database: mongoose.connection.db.databaseName,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('MongoDB Atlas Production: Health check failed', error);
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Setup monitoring for production
const setupHealthMonitoring = () => {
  // Monitor connection health every 30 seconds
  setInterval(async () => {
    try {
      const health = await healthCheck();
      if (health.status !== 'healthy') {
        logger.warn('MongoDB Atlas Production: Health check failed', health);
      }
    } catch (error) {
      logger.error('MongoDB Atlas Production: Health monitoring error', error);
    }
  }, 30000);
  
  // Monitor slow queries
  mongoose.connection.db.setProfilingLevel(2, { slowms: 100 });
  
  logger.info('MongoDB Atlas Production: Health monitoring enabled');
};

module.exports = {
  connectAtlas,
  createProductionIndexes,
  healthCheck,
  setupHealthMonitoring,
  connectionOptions
};
