/**
 * @fileoverview Environment Configuration Script for LUDUS Platform
 *
 * Purpose: This script configures environment variables for the LUDUS platform
 * development environment, including MongoDB Atlas connection setup.
 *
 * Business Context: Essential for setting up the development environment
 * with proper database connectivity and service configurations.
 *
 * @version 1.0.0
 * @since 2025-01-08
 * @author LUDUS Development Team
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Generate secure random string
 *
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
function generateSecureString(length) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Environment configuration template
 */
const ENV_CONFIG = {
  // Core Application
  NODE_ENV: 'development',
  PORT: '5001',
  CLIENT_URL: 'http://localhost:3000',
  API_URL: 'http://localhost:5001',

  // Database Configuration
  MONGODB_URI:
    'mongodb+srv://ludus-dev:ludus-dev-password@ludus-cluster.abc123.mongodb.net/ludus_development?retryWrites=true&w=majority',
  MONGODB_DEV_URI:
    'mongodb+srv://ludus-dev:ludus-dev-password@ludus-cluster.abc123.mongodb.net/ludus_development?retryWrites=true&w=majority',

  // JWT Configuration (Generated secure secrets)
  JWT_SECRET: generateSecureString(32),
  JWT_REFRESH_SECRET: generateSecureString(32),
  JWT_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',

  // Password Hashing
  BCRYPT_SALT_ROUNDS: '12',

  // Payment Gateway (Test Mode)
  MOYASAR_SECRET_KEY: 'sk_test_placeholder_moyasar_secret_key',
  MOYASAR_PUBLISHABLE_KEY: 'pk_test_placeholder_moyasar_publishable_key',
  MOYASAR_WEBHOOK_SECRET: generateSecureString(32),
  MOYASAR_SANDBOX_MODE: 'true',

  // Social Authentication (Placeholder)
  GOOGLE_CLIENT_ID: 'placeholder_google_client_id',
  GOOGLE_CLIENT_SECRET: 'placeholder_google_client_secret',
  GOOGLE_CALLBACK_URL: 'http://localhost:5001/api/auth/google/callback',

  FACEBOOK_APP_ID: 'placeholder_facebook_app_id',
  FACEBOOK_APP_SECRET: 'placeholder_facebook_app_secret',
  FACEBOOK_CALLBACK_URL: 'http://localhost:5001/api/auth/facebook/callback',

  // Email Service (Placeholder)
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '587',
  SMTP_SECURE: 'false',
  SMTP_USER: 'placeholder-email@gmail.com',
  SMTP_PASS: 'placeholder-app-password',
  EMAIL_FROM: 'noreply@letsludus.com',
  EMAIL_FROM_NAME: 'LUDUS Platform',

  // SMS Service (Placeholder)
  TWILIO_ACCOUNT_SID: 'placeholder_twilio_account_sid',
  TWILIO_AUTH_TOKEN: 'placeholder_twilio_auth_token',
  TWILIO_PHONE_NUMBER: '+1234567890',

  // File Storage (Placeholder)
  CLOUDINARY_CLOUD_NAME: 'placeholder_cloudinary_cloud_name',
  CLOUDINARY_API_KEY: 'placeholder_cloudinary_api_key',
  CLOUDINARY_API_SECRET: 'placeholder_cloudinary_api_secret',
  CLOUDINARY_FOLDER: 'ludus-development',

  // Redis Configuration
  REDIS_URL: 'redis://localhost:6379',
  REDIS_PASSWORD: generateSecureString(16),
  REDIS_DB: '0',

  // Monitoring (Placeholder)
  SENTRY_DSN: 'placeholder_sentry_dsn_here',
  SENTRY_ORG: 'placeholder_sentry_org',
  SENTRY_PROJECT: 'placeholder_sentry_project',
  SENTRY_AUTH_TOKEN: 'placeholder_sentry_auth_token',

  GOOGLE_ANALYTICS_ID: 'GA-PLACEHOLDER',

  // External APIs (Placeholder)
  GOOGLE_MAPS_API_KEY: 'placeholder_google_maps_api_key',
  UNSPLASH_ACCESS_KEY: 'placeholder_unsplash_access_key',
  UNSPLASH_SECRET_KEY: 'placeholder_unsplash_secret_key',

  // Render.com (Placeholder)
  RENDER_ENVIRONMENT: 'development',
  RENDER_API_TOKEN: 'placeholder_render_api_token',
  RENDER_SERVICE_ID: 'placeholder_render_service_id',

  // Security Configuration
  CORS_ORIGIN: 'http://localhost:3000',
  CORS_CREDENTIALS: 'true',
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX_REQUESTS: '100',

  // Feature Flags
  ANIMATION_ENABLED: 'true',
  RTL_SUPPORT: 'true',
  PERFORMANCE_MONITORING: 'true',
  DEBUG_MODE: 'true',
  MAINTENANCE_MODE: 'false',

  // Logging
  LOG_LEVEL: 'debug',
  LOG_FORMAT: 'combined',
  LOG_FILE: 'logs/app.log',

  // Backup (Disabled for development)
  BACKUP_ENABLED: 'false',
  BACKUP_SCHEDULE: '0 2 * * *',
  BACKUP_RETENTION_DAYS: '7',
  BACKUP_S3_BUCKET: 'placeholder-backup-bucket',
  BACKUP_S3_REGION: 'us-east-1',
  BACKUP_S3_ACCESS_KEY: 'placeholder_s3_access_key',
  BACKUP_S3_SECRET_KEY: 'placeholder_s3_secret_key',
};

/**
 * Set environment variables
 *
 * @param {Object} config - Environment configuration
 */
function setEnvironmentVariables(config) {
  console.log('🔧 Setting environment variables...');

  Object.entries(config).forEach(([key, value]) => {
    process.env[key] = value;
    console.log(
      `✅ ${key}=${
        key.includes('SECRET') ||
        key.includes('PASSWORD') ||
        key.includes('KEY')
          ? '***'
          : value
      }`
    );
  });
}

/**
 * Create .env file
 *
 * @param {Object} config - Environment configuration
 * @param {string} filePath - Path to .env file
 */
function createEnvFile(config, filePath) {
  console.log(`📝 Creating .env file at ${filePath}...`);

  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  try {
    fs.writeFileSync(filePath, envContent);
    console.log('✅ .env file created successfully!');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
  }
}

/**
 * Test MongoDB connection with current environment
 *
 * @returns {Promise<boolean>} Connection success status
 */
async function testMongoDBConnection() {
  console.log('\n🔍 Testing MongoDB connection...');

  try {
    const mongoose = require('mongoose');

    // Test connection
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    console.log('✅ MongoDB connection successful!');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Host: ${conn.connection.host}`);

    // Test basic operations
    const db = conn.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📁 Collections: ${collections.length}`);

    // Disconnect
    await mongoose.connection.close();

    return true;
  } catch (error) {
    console.log('❌ MongoDB connection failed!');
    console.log(`🚨 Error: ${error.message}`);
    return false;
  }
}

/**
 * Main configuration function
 */
async function main() {
  console.log('🚀 LUDUS Environment Configuration');
  console.log('==================================');

  try {
    // Set environment variables
    setEnvironmentVariables(ENV_CONFIG);

    // Create .env file in current directory
    const envPath = path.join(__dirname, '.env');
    createEnvFile(ENV_CONFIG, envPath);

    // Test MongoDB connection
    const mongoConnected = await testMongoDBConnection();

    if (mongoConnected) {
      console.log('\n🎉 Environment configuration completed successfully!');
      console.log('✅ All systems are ready for development.');
    } else {
      console.log(
        '\n⚠️  Environment configured but MongoDB connection failed.'
      );
      console.log('🔧 Please check your MongoDB Atlas connection string.');
      console.log('\n📋 To fix MongoDB connection:');
      console.log('1. Go to https://cloud.mongodb.com/');
      console.log('2. Create a new cluster or use existing one');
      console.log('3. Create a database user with read/write permissions');
      console.log('4. Get the connection string');
      console.log('5. Update MONGODB_URI in the .env file');
    }
  } catch (error) {
    console.error('\n💥 Configuration failed:', error.message);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  setEnvironmentVariables,
  createEnvFile,
  testMongoDBConnection,
  ENV_CONFIG,
};
