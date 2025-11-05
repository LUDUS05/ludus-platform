/**
 * @fileoverview Comprehensive Health Check for LUDUS Platform
 *
 * Purpose: This script performs a comprehensive health check of the LUDUS platform
 * including database connectivity, JWT configuration, and all critical services.
 *
 * Business Context: Essential for verifying that all platform components are
 * working correctly and ready for development or production use.
 *
 * @version 1.0.0
 * @since 2025-01-08
 * @author LUDUS Development Team
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { connectAtlas, healthCheck } = require('./src/config/mongodb-atlas');
const { generateTokens, verifyToken } = require('./src/utils/generateTokens');
require('dotenv').config();

/**
 * Health Check Results
 */
let healthResults = {
  overall: 'unknown',
  score: 0,
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  details: [],
};

/**
 * Add health check result
 *
 * @param {string} category - Category name
 * @param {string} test - Test name
 * @param {boolean} success - Test success status
 * @param {string} message - Test message
 * @param {string} level - Result level (pass, fail, warning)
 */
function addResult(category, test, success, message, level = 'pass') {
  healthResults.total++;

  if (success) {
    healthResults.passed++;
  } else if (level === 'warning') {
    healthResults.warnings++;
  } else {
    healthResults.failed++;
  }

  healthResults.details.push({
    category,
    test,
    success,
    message,
    level,
    timestamp: new Date().toISOString(),
  });

  const status = success ? '✅' : level === 'warning' ? '⚠️' : '❌';
  console.log(`${status} ${category}: ${test} - ${message}`);
}

/**
 * Test environment variables
 */
function testEnvironmentVariables() {
  console.log('\n🔧 Testing Environment Variables...');

  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'CLIENT_URL',
    'API_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'JWT_EXPIRES_IN',
    'JWT_REFRESH_EXPIRES_IN',
    'BCRYPT_SALT_ROUNDS',
  ];

  const optionalVars = [
    'MONGODB_URI',
    'MOYASAR_SECRET_KEY',
    'GOOGLE_CLIENT_ID',
    'SMTP_HOST',
    'REDIS_URL',
  ];

  // Test required variables
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    const success = value && value !== 'undefined' && value !== '';
    addResult(
      'Environment',
      `Required: ${varName}`,
      success,
      success ? `Set (${value.length} chars)` : 'Not set or empty',
      success ? 'pass' : 'fail'
    );
  });

  // Test optional variables
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    const success =
      value &&
      value !== 'undefined' &&
      value !== '' &&
      !value.includes('placeholder');
    addResult(
      'Environment',
      `Optional: ${varName}`,
      success,
      success ? `Set (${value.length} chars)` : 'Not set or placeholder',
      success ? 'pass' : 'warning'
    );
  });
}

/**
 * Test JWT configuration
 */
function testJWTConfiguration() {
  console.log('\n🔐 Testing JWT Configuration...');

  try {
    // Test JWT secret presence
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

    addResult(
      'JWT',
      'JWT Secret Present',
      !!jwtSecret && jwtSecret.length >= 32,
      jwtSecret
        ? `Present (${jwtSecret.length} chars)`
        : 'Missing or too short',
      jwtSecret && jwtSecret.length >= 32 ? 'pass' : 'fail'
    );

    addResult(
      'JWT',
      'JWT Refresh Secret Present',
      !!jwtRefreshSecret && jwtRefreshSecret.length >= 32,
      jwtRefreshSecret
        ? `Present (${jwtRefreshSecret.length} chars)`
        : 'Missing or too short',
      jwtRefreshSecret && jwtRefreshSecret.length >= 32 ? 'pass' : 'fail'
    );

    // Test JWT token generation
    if (jwtSecret && jwtRefreshSecret) {
      try {
        const testPayload = { userId: 'test-user', role: 'user' };
        const token = jwt.sign(testPayload, jwtSecret, { expiresIn: '15m' });

        addResult(
          'JWT',
          'Token Generation',
          !!token,
          token ? 'Success' : 'Failed',
          'pass'
        );

        // Test JWT token verification
        const decoded = jwt.verify(token, jwtSecret);
        addResult(
          'JWT',
          'Token Verification',
          decoded.userId === 'test-user',
          decoded.userId === 'test-user' ? 'Success' : 'Failed',
          'pass'
        );
      } catch (error) {
        addResult(
          'JWT',
          'Token Operations',
          false,
          `Error: ${error.message}`,
          'fail'
        );
      }
    }
  } catch (error) {
    addResult(
      'JWT',
      'JWT Configuration',
      false,
      `Error: ${error.message}`,
      'fail'
    );
  }
}

/**
 * Test MongoDB connection
 */
async function testMongoDBConnection() {
  console.log('\n🗄️ Testing MongoDB Connection...');

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri || mongoUri.includes('placeholder')) {
    addResult(
      'Database',
      'MongoDB URI',
      false,
      'MONGODB_URI not configured or contains placeholder',
      'warning'
    );
    return;
  }

  try {
    // Test connection
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    addResult(
      'Database',
      'MongoDB Connection',
      true,
      `Connected to ${conn.connection.name}`,
      'pass'
    );

    // Test database operations
    const db = conn.connection.db;
    const collections = await db.listCollections().toArray();

    addResult(
      'Database',
      'Database Operations',
      true,
      `Found ${collections.length} collections`,
      'pass'
    );

    // Test basic query
    const pingResult = await db.admin().ping();
    addResult(
      'Database',
      'Database Ping',
      pingResult.ok === 1,
      pingResult.ok === 1 ? 'Success' : 'Failed',
      'pass'
    );

    // Disconnect
    await mongoose.connection.close();
  } catch (error) {
    addResult(
      'Database',
      'MongoDB Connection',
      false,
      `Error: ${error.message}`,
      'fail'
    );
  }
}

/**
 * Test Atlas connection function
 */
async function testAtlasConnectionFunction() {
  console.log('\n🌐 Testing Atlas Connection Function...');

  try {
    const connected = await connectAtlas();
    addResult(
      'Atlas',
      'Atlas Connection Function',
      connected,
      connected ? 'Success' : 'Failed',
      connected ? 'pass' : 'fail'
    );

    if (connected) {
      // Test health check
      const healthResult = await healthCheck();
      addResult(
        'Atlas',
        'Atlas Health Check',
        healthResult.status === 'healthy',
        healthResult.message,
        healthResult.status === 'healthy' ? 'pass' : 'fail'
      );
    }
  } catch (error) {
    addResult(
      'Atlas',
      'Atlas Connection Function',
      false,
      `Error: ${error.message}`,
      'fail'
    );
  }
}

/**
 * Test payment gateway configuration
 */
function testPaymentGateway() {
  console.log('\n💳 Testing Payment Gateway Configuration...');

  const moyasarSecret = process.env.MOYASAR_SECRET_KEY;
  const moyasarPublic = process.env.MOYASAR_PUBLISHABLE_KEY;

  addResult(
    'Payment',
    'Moyasar Secret Key',
    !!moyasarSecret && !moyasarSecret.includes('placeholder'),
    moyasarSecret ? 'Configured' : 'Not configured or placeholder',
    moyasarSecret && !moyasarSecret.includes('placeholder') ? 'pass' : 'warning'
  );

  addResult(
    'Payment',
    'Moyasar Public Key',
    !!moyasarPublic && !moyasarPublic.includes('placeholder'),
    moyasarPublic ? 'Configured' : 'Not configured or placeholder',
    moyasarPublic && !moyasarPublic.includes('placeholder') ? 'pass' : 'warning'
  );
}

/**
 * Test email service configuration
 */
function testEmailService() {
  console.log('\n📧 Testing Email Service Configuration...');

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  addResult(
    'Email',
    'SMTP Host',
    !!smtpHost && smtpHost !== 'smtp.gmail.com',
    smtpHost ? `Configured: ${smtpHost}` : 'Not configured',
    smtpHost && smtpHost !== 'smtp.gmail.com' ? 'pass' : 'warning'
  );

  addResult(
    'Email',
    'SMTP Credentials',
    !!smtpUser && !!smtpPass && !smtpUser.includes('placeholder'),
    smtpUser ? 'Configured' : 'Not configured or placeholder',
    smtpUser && !smtpUser.includes('placeholder') ? 'pass' : 'warning'
  );
}

/**
 * Test Redis configuration
 */
function testRedisConfiguration() {
  console.log('\n🔴 Testing Redis Configuration...');

  const redisUrl = process.env.REDIS_URL;

  addResult(
    'Redis',
    'Redis URL',
    !!redisUrl,
    redisUrl ? `Configured: ${redisUrl}` : 'Not configured',
    redisUrl ? 'pass' : 'warning'
  );
}

/**
 * Calculate overall health score
 */
function calculateHealthScore() {
  const total = healthResults.total;
  const passed = healthResults.passed;
  const warnings = healthResults.warnings;
  const failed = healthResults.failed;

  // Calculate score (passed = 1, warnings = 0.5, failed = 0)
  const score = ((passed + warnings * 0.5) / total) * 100;
  healthResults.score = Math.round(score);

  // Determine overall status
  if (score >= 90) {
    healthResults.overall = 'excellent';
  } else if (score >= 75) {
    healthResults.overall = 'good';
  } else if (score >= 50) {
    healthResults.overall = 'fair';
  } else {
    healthResults.overall = 'poor';
  }
}

/**
 * Print health check summary
 */
function printSummary() {
  console.log('\n📊 Health Check Summary');
  console.log('========================');
  console.log(`Overall Status: ${healthResults.overall.toUpperCase()}`);
  console.log(`Health Score: ${healthResults.score}%`);
  console.log(`Total Tests: ${healthResults.total}`);
  console.log(`✅ Passed: ${healthResults.passed}`);
  console.log(`⚠️  Warnings: ${healthResults.warnings}`);
  console.log(`❌ Failed: ${healthResults.failed}`);

  // Print recommendations
  console.log('\n💡 Recommendations:');

  if (healthResults.failed > 0) {
    console.log('🔧 Fix failed tests to improve system stability');
  }

  if (healthResults.warnings > 0) {
    console.log('⚙️  Address warnings to optimize system performance');
  }

  if (healthResults.score >= 90) {
    console.log('🎉 System is in excellent condition!');
  } else if (healthResults.score >= 75) {
    console.log(
      '👍 System is in good condition with minor improvements needed'
    );
  } else if (healthResults.score >= 50) {
    console.log('⚠️  System needs attention to improve reliability');
  } else {
    console.log('🚨 System requires immediate attention');
  }
}

/**
 * Main health check function
 */
async function main() {
  console.log('🏥 LUDUS Platform Health Check');
  console.log('===============================');

  try {
    // Run all health checks
    testEnvironmentVariables();
    testJWTConfiguration();
    await testMongoDBConnection();
    await testAtlasConnectionFunction();
    testPaymentGateway();
    testEmailService();
    testRedisConfiguration();

    // Calculate and print results
    calculateHealthScore();
    printSummary();

    // Exit with appropriate code
    if (healthResults.overall === 'poor') {
      process.exit(1);
    } else if (healthResults.overall === 'fair') {
      process.exit(2);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('\n💥 Health check failed:', error.message);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  testEnvironmentVariables,
  testJWTConfiguration,
  testMongoDBConnection,
  testAtlasConnectionFunction,
  testPaymentGateway,
  testEmailService,
  testRedisConfiguration,
  healthResults,
};
