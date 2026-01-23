/**
 * @fileoverview MongoDB Connection Setup Script for LUDUS Platform
 *
 * Purpose: This script helps set up and test MongoDB connections for the LUDUS platform.
 * It can work with both local MongoDB instances and MongoDB Atlas clusters.
 *
 * Business Context: Critical for establishing database connectivity for all platform
 * operations including user management, activity listings, booking systems, and more.
 *
 * Usage:
 * 1. For local MongoDB: node setup-mongodb-connection.js --local
 * 2. For MongoDB Atlas: node setup-mongodb-connection.js --atlas
 * 3. For testing: node setup-mongodb-connection.js --test
 *
 * @version 1.0.0
 * @since 2025-01-08
 * @author LUDUS Development Team
 */

const mongoose = require('mongoose');
const { connectAtlas, healthCheck } = require('./src/config/mongodb-atlas');
require('dotenv').config();

/**
 * MongoDB Connection Configuration
 */
const CONNECTION_CONFIGS = {
  local: {
    uri: 'mongodb://localhost:27017/ludus_development',
    name: 'Local MongoDB',
    description: 'Local MongoDB instance for development',
  },
  atlas: {
    uri:
      process.env.MONGODB_URI ||
      'mongodb+srv://username:password@cluster.mongodb.net/ludus_development',
    name: 'MongoDB Atlas',
    description: 'MongoDB Atlas cloud cluster',
  },
  test: {
    uri: 'mongodb://localhost:27017/ludus_test',
    name: 'Test MongoDB',
    description: 'Test MongoDB instance for testing',
  },
};

/**
 * Test MongoDB connection
 *
 * @param {string} uri - MongoDB connection string
 * @param {string} name - Connection name
 * @returns {Promise<Object>} Connection test result
 */
async function testConnection(uri, name) {
  console.log(`\n🔍 Testing ${name} connection...`);
  console.log(`📍 URI: ${uri.replace(/\/\/.*@/, '//***:***@')}`);

  const startTime = Date.now();

  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    const responseTime = Date.now() - startTime;

    // Test basic operations
    const db = conn.connection.db;
    const collections = await db.listCollections().toArray();

    // Test a simple query
    const testResult = await db.admin().ping();

    console.log(`✅ ${name} connection successful!`);
    console.log(`📊 Response time: ${responseTime}ms`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    console.log(`🔗 Host: ${conn.connection.host}`);
    console.log(`📁 Collections: ${collections.length}`);
    console.log(`🏓 Ping result: ${testResult.ok ? 'OK' : 'Failed'}`);

    // Disconnect
    await mongoose.connection.close();

    return {
      success: true,
      responseTime,
      database: conn.connection.name,
      host: conn.connection.host,
      collections: collections.length,
      ping: testResult.ok,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    console.log(`❌ ${name} connection failed!`);
    console.log(`⏱️  Response time: ${responseTime}ms`);
    console.log(`🚨 Error: ${error.message}`);

    // Try to disconnect if connected
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      // Ignore close errors
    }

    return {
      success: false,
      responseTime,
      error: error.message,
    };
  }
}

/**
 * Setup MongoDB Atlas connection
 *
 * @returns {Promise<void>}
 */
async function setupAtlasConnection() {
  console.log('\n🚀 Setting up MongoDB Atlas connection...');

  // Check if MONGODB_URI is set
  if (
    !process.env.MONGODB_URI ||
    process.env.MONGODB_URI.includes('placeholder')
  ) {
    console.log('⚠️  MONGODB_URI not properly configured!');
    console.log('\n📋 To set up MongoDB Atlas:');
    console.log('1. Go to https://cloud.mongodb.com/');
    console.log('2. Create a new cluster or use existing one');
    console.log('3. Create a database user with read/write permissions');
    console.log('4. Get the connection string');
    console.log('5. Update MONGODB_URI in your .env file');
    console.log('\n📝 Example connection string:');
    console.log(
      'MONGODB_URI=mongodb+srv://username:password@cluster.abc123.mongodb.net/ludus_development?retryWrites=true&w=majority'
    );
    return;
  }

  // Test Atlas connection
  const result = await testConnection(process.env.MONGODB_URI, 'MongoDB Atlas');

  if (result.success) {
    console.log('\n✅ MongoDB Atlas connection is ready!');
    console.log(
      '🎉 You can now run the LUDUS platform with database connectivity.'
    );
  } else {
    console.log('\n❌ MongoDB Atlas connection failed!');
    console.log('🔧 Please check your connection string and try again.');
  }
}

/**
 * Setup local MongoDB connection
 *
 * @returns {Promise<void>}
 */
async function setupLocalConnection() {
  console.log('\n🏠 Setting up local MongoDB connection...');

  // Test local connection
  const result = await testConnection(
    CONNECTION_CONFIGS.local.uri,
    'Local MongoDB'
  );

  if (result.success) {
    console.log('\n✅ Local MongoDB connection is ready!');
    console.log('🎉 You can now run the LUDUS platform with local database.');
  } else {
    console.log('\n❌ Local MongoDB connection failed!');
    console.log('🔧 Please make sure MongoDB is running locally:');
    console.log(
      '   - Install MongoDB: https://docs.mongodb.com/manual/installation/'
    );
    console.log('   - Start MongoDB: mongod');
    console.log('   - Or use Docker: docker run -d -p 27017:27017 mongo');
  }
}

/**
 * Run comprehensive connection tests
 *
 * @returns {Promise<void>}
 */
async function runComprehensiveTests() {
  console.log('\n🧪 Running comprehensive MongoDB connection tests...');

  const results = {};

  // Test local MongoDB
  results.local = await testConnection(
    CONNECTION_CONFIGS.local.uri,
    'Local MongoDB'
  );

  // Test Atlas if configured
  if (
    process.env.MONGODB_URI &&
    !process.env.MONGODB_URI.includes('placeholder')
  ) {
    results.atlas = await testConnection(
      process.env.MONGODB_URI,
      'MongoDB Atlas'
    );
  } else {
    console.log('\n⏭️  Skipping Atlas test (MONGODB_URI not configured)');
  }

  // Test using the Atlas connection function
  try {
    console.log('\n🔧 Testing Atlas connection function...');
    const atlasResult = await connectAtlas();
    results.atlasFunction = {
      success: atlasResult,
      message: atlasResult
        ? 'Atlas connection function working'
        : 'Atlas connection function failed',
    };
  } catch (error) {
    results.atlasFunction = {
      success: false,
      error: error.message,
    };
  }

  // Test health check
  try {
    console.log('\n🏥 Testing health check function...');
    const healthResult = await healthCheck();
    results.healthCheck = {
      success: healthResult.status === 'healthy',
      message: healthResult.message,
      responseTime: healthResult.responseTime,
    };
  } catch (error) {
    results.healthCheck = {
      success: false,
      error: error.message,
    };
  }

  // Print summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');

  Object.entries(results).forEach(([test, result]) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(
      `${status} ${test}: ${result.message || result.error || 'Unknown'}`
    );
  });

  // Determine overall status
  const allPassed = Object.values(results).every(result => result.success);

  if (allPassed) {
    console.log('\n🎉 All tests passed! MongoDB connection is ready.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration.');
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🚀 LUDUS MongoDB Connection Setup');
  console.log('==================================');

  try {
    switch (command) {
      case '--local':
        await setupLocalConnection();
        break;
      case '--atlas':
        await setupAtlasConnection();
        break;
      case '--test':
        await runComprehensiveTests();
        break;
      default:
        console.log('\n📋 Available commands:');
        console.log('  --local  : Setup local MongoDB connection');
        console.log('  --atlas  : Setup MongoDB Atlas connection');
        console.log('  --test   : Run comprehensive connection tests');
        console.log('\n💡 Example: node setup-mongodb-connection.js --test');
        break;
    }
  } catch (error) {
    console.error('\n💥 Setup failed:', error.message);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  testConnection,
  setupAtlasConnection,
  setupLocalConnection,
  runComprehensiveTests,
};
