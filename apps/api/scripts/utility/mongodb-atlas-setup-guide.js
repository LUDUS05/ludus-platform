/**
 * @fileoverview Interactive MongoDB Atlas Setup Guide for LUDUS Platform
 *
 * Purpose: This interactive guide walks users through setting up MongoDB Atlas
 * for the LUDUS platform with step-by-step instructions and validation.
 *
 * Business Context: Essential for establishing production database connectivity
 * for the LUDUS social activity platform serving the Saudi Arabian market.
 *
 * @version 1.0.0
 * @since 2025-01-08
 * @author LUDUS Development Team
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

/**
 * Create readline interface
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Ask a question and return the answer
 *
 * @param {string} question - Question to ask
 * @returns {Promise<string>} User's answer
 */
function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer.trim());
    });
  });
}

/**
 * Display step header
 *
 * @param {number} step - Step number
 * @param {string} title - Step title
 */
function displayStepHeader(step, title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 STEP ${step}: ${title}`);
  console.log(`${'='.repeat(60)}`);
}

/**
 * Display MongoDB Atlas setup instructions
 */
function displayAtlasInstructions() {
  console.log('\n🌐 MongoDB Atlas Setup Instructions:');
  console.log('=====================================');
  console.log('1. Go to: https://cloud.mongodb.com/');
  console.log('2. Sign up or log in to your account');
  console.log('3. Click "Build a Database"');
  console.log('4. Choose "FREE" tier (M0) for development');
  console.log('5. Select "AWS" as cloud provider');
  console.log('6. Choose "Middle East (Bahrain)" region');
  console.log('7. Name your cluster: "ludus-cluster"');
  console.log('8. Click "Create Cluster"');
  console.log('\n🔐 Database Access Setup:');
  console.log('==========================');
  console.log('1. Go to "Database Access" in left sidebar');
  console.log('2. Click "Add New Database User"');
  console.log('3. Username: "ludus-dev"');
  console.log('4. Password: Generate strong password (save it!)');
  console.log('5. Database User Privileges: "Read and write to any database"');
  console.log('6. Click "Add User"');
  console.log('\n🌍 Network Access Setup:');
  console.log('=========================');
  console.log('1. Go to "Network Access" in left sidebar');
  console.log('2. Click "Add IP Address"');
  console.log('3. Click "Allow Access from Anywhere" (0.0.0.0/0)');
  console.log('4. Click "Confirm"');
  console.log('\n🔗 Get Connection String:');
  console.log('==========================');
  console.log('1. Go to "Clusters" in left sidebar');
  console.log('2. Click "Connect" on your cluster');
  console.log('3. Choose "Connect your application"');
  console.log('4. Driver: "Node.js"');
  console.log('5. Version: "4.1 or later"');
  console.log('6. Copy the connection string');
  console.log('7. Replace <password> with your actual password');
  console.log('8. Add database name: /ludus_development');
}

/**
 * Validate connection string format
 *
 * @param {string} connectionString - Connection string to validate
 * @returns {boolean} Is valid format
 */
function validateConnectionString(connectionString) {
  const atlasPattern =
    /^mongodb\+srv:\/\/[^:]+:[^@]+@[^/]+\/[^?]+\?retryWrites=true&w=majority$/;
  return atlasPattern.test(connectionString);
}

/**
 * Test MongoDB Atlas connection
 *
 * @param {string} connectionString - Connection string to test
 * @returns {Promise<boolean>} Connection success
 */
async function testConnection(connectionString) {
  console.log('\n🔍 Testing MongoDB Atlas connection...');

  try {
    const mongoose = require('mongoose');

    const conn = await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 15000,
    });

    console.log('✅ Connection successful!');
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
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

/**
 * Update environment configuration
 *
 * @param {string} connectionString - MongoDB Atlas connection string
 * @returns {Promise<boolean>} Update success
 */
async function updateEnvironment(connectionString) {
  console.log('\n🔧 Updating environment configuration...');

  try {
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

    console.log('✅ Environment configuration updated!');
    return true;
  } catch (error) {
    console.error('❌ Failed to update environment:', error.message);
    return false;
  }
}

/**
 * Main interactive setup function
 */
async function main() {
  console.log('🚀 LUDUS MongoDB Atlas Setup Guide');
  console.log('===================================');
  console.log(
    'This guide will help you set up MongoDB Atlas for the LUDUS platform.'
  );
  console.log('Follow the steps below to configure your database connection.');

  try {
    // Step 1: Display instructions
    displayStepHeader(1, 'MongoDB Atlas Setup Instructions');
    displayAtlasInstructions();

    const continueSetup = await askQuestion(
      '\n❓ Have you completed the MongoDB Atlas setup? (y/n): '
    );

    if (continueSetup.toLowerCase() !== 'y') {
      console.log(
        '\n⏸️  Please complete the MongoDB Atlas setup first, then run this guide again.'
      );
      rl.close();
      return;
    }

    // Step 2: Get connection string
    displayStepHeader(2, 'Connection String Configuration');
    console.log('\n📋 Please provide your MongoDB Atlas connection string.');
    console.log(
      '💡 Format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority'
    );

    let connectionString = await askQuestion(
      '\n🔗 Enter your MongoDB Atlas connection string: '
    );

    // Validate connection string
    if (!validateConnectionString(connectionString)) {
      console.log('\n❌ Invalid connection string format!');
      console.log('💡 Please check your connection string and try again.');
      console.log(
        '📝 Example: mongodb+srv://ludus-dev:password@ludus-cluster.abc123.mongodb.net/ludus_development?retryWrites=true&w=majority'
      );
      rl.close();
      return;
    }

    // Step 3: Test connection
    displayStepHeader(3, 'Connection Testing');
    const connectionSuccess = await testConnection(connectionString);

    if (!connectionSuccess) {
      console.log('\n❌ Connection test failed!');
      console.log('🔧 Please check your connection string and try again.');
      rl.close();
      return;
    }

    // Step 4: Update environment
    displayStepHeader(4, 'Environment Configuration');
    const updateSuccess = await updateEnvironment(connectionString);

    if (!updateSuccess) {
      console.log('\n❌ Failed to update environment configuration!');
      rl.close();
      return;
    }

    // Step 5: Final verification
    displayStepHeader(5, 'Final Verification');
    console.log('\n🧪 Running final health check...');

    // Run health check
    try {
      const { runComprehensiveTests } = require('./comprehensive-health-check');
      await runComprehensiveTests();
    } catch (error) {
      console.log('⚠️  Health check not available, but connection is working.');
    }

    // Success message
    console.log('\n🎉 MongoDB Atlas Setup Completed Successfully!');
    console.log('==============================================');
    console.log('✅ MongoDB Atlas cluster configured');
    console.log('✅ Database connection established');
    console.log('✅ Environment variables updated');
    console.log('✅ LUDUS platform ready for development');
    console.log('\n🚀 Next steps:');
    console.log('- Run: npm run dev (to start development server)');
    console.log(
      '- Run: node comprehensive-health-check.js (to verify system health)'
    );
    console.log('- Deploy to Render.com when ready for production');
  } catch (error) {
    console.error('\n💥 Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  displayAtlasInstructions,
  validateConnectionString,
  testConnection,
  updateEnvironment,
};
