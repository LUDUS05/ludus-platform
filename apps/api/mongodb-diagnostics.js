/**
 * @fileoverview MongoDB Atlas Connection Diagnostics for LUDUS Platform
 *
 * Purpose: This script helps diagnose MongoDB Atlas connection issues
 * and provides solutions for common problems.
 *
 * Business Context: Essential for troubleshooting database connectivity
 * issues in the LUDUS platform development environment.
 *
 * @version 1.0.0
 * @since 2025-01-08
 * @author LUDUS Development Team
 */

const dns = require('dns');
const { promisify } = require('util');
const mongoose = require('mongoose');

const dnsLookup = promisify(dns.lookup);

/**
 * Test DNS resolution for MongoDB Atlas cluster
 *
 * @param {string} hostname - MongoDB Atlas hostname
 * @returns {Promise<boolean>} DNS resolution success
 */
async function testDNSResolution(hostname) {
  console.log(`\n🔍 Testing DNS resolution for ${hostname}...`);

  try {
    const result = await dnsLookup(hostname);
    console.log(`✅ DNS resolution successful!`);
    console.log(`📊 IP Address: ${result.address}`);
    console.log(`🔗 Family: IPv${result.family}`);
    return true;
  } catch (error) {
    console.log(`❌ DNS resolution failed!`);
    console.log(`🚨 Error: ${error.message}`);
    return false;
  }
}

/**
 * Test MongoDB Atlas connection with detailed error reporting
 *
 * @param {string} connectionString - MongoDB Atlas connection string
 * @returns {Promise<boolean>} Connection success
 */
async function testMongoDBConnection(connectionString) {
  console.log(`\n🔍 Testing MongoDB Atlas connection...`);
  console.log(
    `📍 Connection String: ${connectionString.replace(
      /\/\/[^:]+:[^@]+@/,
      '//***:***@'
    )}`
  );

  try {
    const conn = await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 20000,
      socketTimeoutMS: 30000,
    });

    console.log(`✅ MongoDB Atlas connection successful!`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Host: ${conn.connection.host}`);
    console.log(`🌐 Cluster: ${conn.connection.host.split('.')[0]}`);

    // Test basic operations
    const db = conn.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📁 Collections: ${collections.length}`);

    // Test ping
    const pingResult = await db.admin().ping();
    console.log(`🏓 Ping result: ${pingResult.ok ? 'OK' : 'Failed'}`);

    // Disconnect
    await mongoose.connection.close();

    return true;
  } catch (error) {
    console.log(`❌ MongoDB Atlas connection failed!`);
    console.log(`🚨 Error Type: ${error.name}`);
    console.log(`🚨 Error Message: ${error.message}`);

    // Provide specific error guidance
    if (error.message.includes('ETIMEOUT')) {
      console.log(`\n💡 ETIMEOUT Error Solutions:`);
      console.log(
        `1. Check if your IP address is whitelisted in MongoDB Atlas`
      );
      console.log(`2. Verify network access settings in MongoDB Atlas console`);
      console.log(`3. Try connecting from a different network`);
      console.log(`4. Check if your firewall is blocking MongoDB connections`);
    } else if (error.message.includes('ENOTFOUND')) {
      console.log(`\n💡 ENOTFOUND Error Solutions:`);
      console.log(`1. Check if the cluster hostname is correct`);
      console.log(`2. Verify the cluster is running in MongoDB Atlas`);
      console.log(`3. Check your internet connection`);
    } else if (error.message.includes('authentication')) {
      console.log(`\n💡 Authentication Error Solutions:`);
      console.log(`1. Verify your username and password`);
      console.log(`2. Check if the database user has proper permissions`);
      console.log(`3. Ensure the user exists in MongoDB Atlas`);
    }

    return false;
  }
}

/**
 * Test network connectivity to MongoDB Atlas
 *
 * @param {string} hostname - MongoDB Atlas hostname
 * @param {number} port - MongoDB port (usually 27017)
 * @returns {Promise<boolean>} Network connectivity success
 */
async function testNetworkConnectivity(hostname, port = 27017) {
  console.log(`\n🌐 Testing network connectivity to ${hostname}:${port}...`);

  try {
    const net = require('net');
    const socket = new net.Socket();

    const connectPromise = new Promise((resolve, reject) => {
      socket.setTimeout(10000);

      socket.on('connect', () => {
        console.log(`✅ Network connectivity successful!`);
        socket.destroy();
        resolve(true);
      });

      socket.on('timeout', () => {
        console.log(`❌ Network connectivity timeout!`);
        socket.destroy();
        reject(new Error('Connection timeout'));
      });

      socket.on('error', error => {
        console.log(`❌ Network connectivity failed!`);
        console.log(`🚨 Error: ${error.message}`);
        socket.destroy();
        reject(error);
      });
    });

    socket.connect(port, hostname);

    const result = await connectPromise;
    return result;
  } catch (error) {
    console.log(`❌ Network connectivity test failed!`);
    console.log(`🚨 Error: ${error.message}`);
    return false;
  }
}

/**
 * Extract hostname from MongoDB connection string
 *
 * @param {string} connectionString - MongoDB connection string
 * @returns {string} Hostname
 */
function extractHostname(connectionString) {
  const match = connectionString.match(/mongodb\+srv:\/\/[^@]+@([^/]+)/);
  return match ? match[1] : null;
}

/**
 * Run comprehensive diagnostics
 *
 * @param {string} connectionString - MongoDB Atlas connection string
 * @returns {Promise<void>}
 */
async function runDiagnostics(connectionString) {
  console.log(`🚀 MongoDB Atlas Connection Diagnostics`);
  console.log(`=====================================`);

  const hostname = extractHostname(connectionString);

  if (!hostname) {
    console.log(`❌ Invalid connection string format!`);
    return;
  }

  console.log(`\n📋 Connection Details:`);
  console.log(`🔗 Hostname: ${hostname}`);
  console.log(`🌐 Protocol: MongoDB SRV`);
  console.log(
    `📊 Database: ${connectionString.split('/').pop().split('?')[0]}`
  );

  const results = {
    dnsResolution: false,
    networkConnectivity: false,
    mongoConnection: false,
  };

  // Test DNS resolution
  results.dnsResolution = await testDNSResolution(hostname);

  if (results.dnsResolution) {
    // Test network connectivity
    results.networkConnectivity = await testNetworkConnectivity(hostname);

    if (results.networkConnectivity) {
      // Test MongoDB connection
      results.mongoConnection = await testMongoDBConnection(connectionString);
    }
  }

  // Print summary
  console.log(`\n📊 Diagnostics Summary:`);
  console.log(`=======================`);
  console.log(`✅ DNS Resolution: ${results.dnsResolution ? 'PASS' : 'FAIL'}`);
  console.log(
    `✅ Network Connectivity: ${results.networkConnectivity ? 'PASS' : 'FAIL'}`
  );
  console.log(
    `✅ MongoDB Connection: ${results.mongoConnection ? 'PASS' : 'FAIL'}`
  );

  if (results.mongoConnection) {
    console.log(
      `\n🎉 All diagnostics passed! MongoDB Atlas is working correctly.`
    );
  } else {
    console.log(
      `\n⚠️  Some diagnostics failed. Please check the error messages above.`
    );

    if (!results.dnsResolution) {
      console.log(`\n🔧 DNS Resolution Issues:`);
      console.log(`- Check your internet connection`);
      console.log(`- Try using a different DNS server (8.8.8.8, 1.1.1.1)`);
      console.log(`- Verify the cluster hostname is correct`);
    }

    if (!results.networkConnectivity) {
      console.log(`\n🔧 Network Connectivity Issues:`);
      console.log(`- Check if your IP address is whitelisted in MongoDB Atlas`);
      console.log(`- Verify network access settings in MongoDB Atlas console`);
      console.log(`- Check if your firewall is blocking MongoDB connections`);
      console.log(`- Try connecting from a different network`);
    }
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const connectionString = args[0];

  if (!connectionString) {
    console.log(
      `📋 Usage: node mongodb-diagnostics.js "mongodb+srv://username:password@cluster.mongodb.net/database"`
    );
    console.log(`\n💡 Example:`);
    console.log(
      `node mongodb-diagnostics.js "mongodb+srv://lds:password@ludus-mvp.kdxn9gc.mongodb.net/ludus_development?retryWrites=true&w=majority&appName=ludus-mvp"`
    );
    return;
  }

  try {
    await runDiagnostics(connectionString);
  } catch (error) {
    console.error(`\n💥 Diagnostics failed:`, error.message);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  testDNSResolution,
  testMongoDBConnection,
  testNetworkConnectivity,
  extractHostname,
  runDiagnostics,
};


