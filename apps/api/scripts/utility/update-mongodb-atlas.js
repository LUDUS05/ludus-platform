/**
 * @fileoverview MongoDB Atlas Connection Update Script for LUDUS Platform
 *
 * Purpose: This script helps update the LUDUS platform with a real MongoDB Atlas
 * connection string and tests the connection.
 *
 * Business Context: Essential for connecting the LUDUS platform to a production
 * MongoDB Atlas cluster for reliable database operations.
 *
 * @version 1.0.0
 * @since 2025-01-08
 * @author LUDUS Development Team
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { connectAtlas, healthCheck } = require('./src/config/mongodb-atlas');

/**
 * Update MongoDB Atlas connection string
 *
 * @param {string} connectionString - MongoDB Atlas connection string
 * @returns {Promise<boolean>} Update success status
 */
async function updateMongoDBAtlas(connectionString) {
  console.log('🔧 Updating MongoDB Atlas connection...');

  try {
    // Read current .env file
    const envPath = path.join(__dirname, '.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Update MONGODB_URI
    const mongoUriRegex = /^MONGODB_URI=.*$/m;
    const newMongoUri = `MONGODB_URI=${connectionString}`;

    if (mongoUriRegex.test(envContent)) {
      envContent = envContent.replace(mongoUriRegex, newMongoUri);
    } else {
      envContent += `\n${newMongoUri}`;
    }

    // Update MONGODB_DEV_URI
    const mongoDevUriRegex = /^MONGODB_DEV_URI=.*$/m;
    const newMongoDevUri = `MONGODB_DEV_URI=${connectionString}`;

    if (mongoDevUriRegex.test(envContent)) {
      envContent = envContent.replace(mongoDevUriRegex, newMongoDevUri);
    } else {
      envContent += `\n${newMongoDevUri}`;
    }

    // Write updated .env file
    fs.writeFileSync(envPath, envContent);

    // Update process.env
    process.env.MONGODB_URI = connectionString;
    process.env.MONGODB_DEV_URI = connectionString;

    console.log('✅ MongoDB Atlas connection updated successfully!');
    return true;
  } catch (error) {
    console.error(
      '❌ Failed to update MongoDB Atlas connection:',
      error.message
    );
    return false;
  }
}

/**
 * Test MongoDB Atlas connection
 *
 * @param {string} connectionString - MongoDB Atlas connection string
 * @returns {Promise<boolean>} Connection success status
 */
async function testMongoDBAtlasConnection(connectionString) {
  console.log('\n🔍 Testing MongoDB Atlas connection...');

  try {
    // Test direct connection
    const conn = await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 15000,
    });

    console.log('✅ MongoDB Atlas connection successful!');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Host: ${conn.connection.host}`);
    console.log(`🌐 Cluster: ${conn.connection.host.split('.')[0]}`);

    // Test database operations
    const db = conn.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📁 Collections: ${collections.length}`);

    // Test basic query
    const pingResult = await db.admin().ping();
    console.log(`🏓 Ping result: ${pingResult.ok ? 'OK' : 'Failed'}`);

    // Disconnect
    await mongoose.connection.close();

    return true;
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed!');
    console.error(`🚨 Error: ${error.message}`);

    // Try to disconnect if connected
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      // Ignore close errors
    }

    return false;
  }
}

/**
 * Test Atlas connection function
 *
 * @returns {Promise<boolean>} Connection success status
 */
async function testAtlasConnectionFunction() {
  console.log('\n🌐 Testing Atlas connection function...');

  try {
    const connected = await connectAtlas();

    if (connected) {
      console.log('✅ Atlas connection function working!');

      // Test health check
      const healthResult = await healthCheck();
      console.log(`🏥 Health check: ${healthResult.status}`);
      console.log(`⏱️  Response time: ${healthResult.responseTime}ms`);

      return true;
    } else {
      console.log('❌ Atlas connection function failed!');
      return false;
    }
  } catch (error) {
    console.error('❌ Atlas connection function error:', error.message);
    return false;
  }
}

/**
 * Run comprehensive Atlas tests
 *
 * @param {string} connectionString - MongoDB Atlas connection string
 * @returns {Promise<void>}
 */
async function runAtlasTests(connectionString) {
  console.log('\n🧪 Running comprehensive Atlas tests...');

  const results = {
    directConnection: false,
    atlasFunction: false,
    healthCheck: false,
  };

  // Test direct connection
  results.directConnection = await testMongoDBAtlasConnection(connectionString);

  // Test Atlas connection function
  results.atlasFunction = await testAtlasConnectionFunction();

  // Test health check
  try {
    const healthResult = await healthCheck();
    results.healthCheck = healthResult.status === 'healthy';
  } catch (error) {
    results.healthCheck = false;
  }

  // Print results
  console.log('\n📊 Atlas Test Results:');
  console.log('======================');
  console.log(
    `✅ Direct Connection: ${results.directConnection ? 'PASS' : 'FAIL'}`
  );
  console.log(`✅ Atlas Function: ${results.atlasFunction ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Health Check: ${results.healthCheck ? 'PASS' : 'FAIL'}`);

  const allPassed = Object.values(results).every(result => result);

  if (allPassed) {
    console.log(
      '\n🎉 All Atlas tests passed! MongoDB Atlas is ready for LUDUS platform.'
    );
  } else {
    console.log(
      '\n⚠️  Some Atlas tests failed. Please check your configuration.'
    );
  }

  return allPassed;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const connectionString = args[0];

  console.log('🚀 LUDUS MongoDB Atlas Setup');
  console.log('============================');

  if (!connectionString) {
    console.log(
      '\n📋 Usage: node update-mongodb-atlas.js "mongodb+srv://username:password@cluster.mongodb.net/database"'
    );
    console.log('\n💡 Example:');
    console.log(
      'node update-mongodb-atlas.js "mongodb+srv://ludus-dev:password@ludus-cluster.abc123.mongodb.net/ludus_development?retryWrites=true&w=majority"'
    );
    return;
  }

  try {
    // Update connection string
    const updated = await updateMongoDBAtlas(connectionString);

    if (updated) {
      // Run comprehensive tests
      const allTestsPassed = await runAtlasTests(connectionString);

      if (allTestsPassed) {
        console.log('\n🎉 MongoDB Atlas setup completed successfully!');
        console.log('✅ LUDUS platform is now connected to MongoDB Atlas.');
        console.log(
          '🚀 You can now run the platform with full database connectivity.'
        );
      } else {
        console.log('\n⚠️  MongoDB Atlas setup completed with some issues.');
        console.log('🔧 Please check the test results and fix any problems.');
      }
    } else {
      console.log('\n❌ Failed to update MongoDB Atlas connection.');
      console.log('🔧 Please check your connection string and try again.');
    }
  } catch (error) {
    console.error('\n💥 MongoDB Atlas setup failed:', error.message);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  updateMongoDBAtlas,
  testMongoDBAtlasConnection,
  testAtlasConnectionFunction,
  runAtlasTests,
};
