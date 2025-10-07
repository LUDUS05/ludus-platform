#!/usr/bin/env node

/**
 * @fileoverview MongoDB Atlas connection and performance test script.
 * 
 * Purpose: Tests MongoDB Atlas connectivity, performance, and configuration
 * for the LUDUS platform to ensure production readiness.
 * 
 * Business Context: Critical for validating database setup before production
 * deployment. Tests connection, performance, security, and monitoring features.
 * 
 * Usage: node test-mongodb-atlas.js
 * 
 * @version 1.0.0
 * @since 2025-10-06
 */

const mongoose = require('mongoose');
const { connectAtlas, healthCheck, getConnectionState } = require('./apps/api/src/config/mongodb-atlas');

// Test configuration
const testConfig = {
  timeout: 30000, // 30 seconds
  retries: 3,
  performanceThreshold: 100, // ms
  memoryThreshold: 100 * 1024 * 1024 // 100MB
};

/**
 * Test MongoDB Atlas connection and basic operations.
 */
async function testConnection() {
  console.log('🔌 Testing MongoDB Atlas connection...');
  
  try {
    const connected = await connectAtlas();
    if (connected) {
      console.log('✅ MongoDB Atlas connection successful');
      return true;
    } else {
      console.log('❌ MongoDB Atlas connection failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

/**
 * Test database health check functionality.
 */
async function testHealthCheck() {
  console.log('🏥 Testing database health check...');
  
  try {
    const health = await healthCheck();
    console.log('📊 Health check result:', {
      status: health.status,
      responseTime: health.responseTime,
      timestamp: health.timestamp
    });
    
    return health.status === 'healthy';
  } catch (error) {
    console.error('❌ Health check error:', error.message);
    return false;
  }
}

/**
 * Test basic database operations.
 */
async function testBasicOperations() {
  console.log('📝 Testing basic database operations...');
  
  try {
    const db = mongoose.connection.db;
    
    // Test collection listing
    const collections = await db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name));
    
    // Test basic query
    const startTime = Date.now();
    const result = await db.admin().ping();
    const queryTime = Date.now() - startTime;
    
    console.log('🏓 Ping result:', result);
    console.log(`⏱️  Query time: ${queryTime}ms`);
    
    return queryTime < testConfig.performanceThreshold;
  } catch (error) {
    console.error('❌ Basic operations error:', error.message);
    return false;
  }
}

/**
 * Test geospatial queries (important for LUDUS location features).
 */
async function testGeospatialQueries() {
  console.log('🌍 Testing geospatial queries...');
  
  try {
    const db = mongoose.connection.db;
    
    // Test geospatial index
    const startTime = Date.now();
    const result = await db.collection('users').find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [46.6753, 24.7136] // Riyadh coordinates
          },
          $maxDistance: 10000 // 10km radius
        }
      }
    }).limit(5).toArray();
    
    const queryTime = Date.now() - startTime;
    console.log(`📍 Geospatial query completed in ${queryTime}ms`);
    console.log(`📊 Results found: ${result.length}`);
    
    return queryTime < testConfig.performanceThreshold;
  } catch (error) {
    console.error('❌ Geospatial query error:', error.message);
    return false;
  }
}

/**
 * Test text search functionality.
 */
async function testTextSearch() {
  console.log('🔍 Testing text search...');
  
  try {
    const db = mongoose.connection.db;
    
    const startTime = Date.now();
    const result = await db.collection('activities').find({
      $text: { $search: 'رياضة' } // Arabic text search
    }).limit(5).toArray();
    
    const queryTime = Date.now() - startTime;
    console.log(`🔍 Text search completed in ${queryTime}ms`);
    console.log(`📊 Results found: ${result.length}`);
    
    return queryTime < testConfig.performanceThreshold;
  } catch (error) {
    console.error('❌ Text search error:', error.message);
    return false;
  }
}

/**
 * Test connection state monitoring.
 */
async function testConnectionMonitoring() {
  console.log('📊 Testing connection monitoring...');
  
  try {
    const connectionState = getConnectionState();
    console.log('📈 Connection state:', {
      isConnected: connectionState.isConnected,
      connectionCount: connectionState.connectionCount,
      errorCount: connectionState.errorCount,
      uptime: connectionState.uptime,
      mongooseState: connectionState.mongooseState
    });
    
    return connectionState.isConnected;
  } catch (error) {
    console.error('❌ Connection monitoring error:', error.message);
    return false;
  }
}

/**
 * Test memory usage and performance.
 */
async function testPerformance() {
  console.log('⚡ Testing performance metrics...');
  
  try {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    console.log('💾 Memory usage:', {
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      external: Math.round(memoryUsage.external / 1024 / 1024) + 'MB'
    });
    
    console.log('⏱️  Uptime:', Math.round(uptime) + 's');
    
    return memoryUsage.heapUsed < testConfig.memoryThreshold;
  } catch (error) {
    console.error('❌ Performance test error:', error.message);
    return false;
  }
}

/**
 * Run all tests and generate report.
 */
async function runAllTests() {
  console.log('🚀 Starting MongoDB Atlas tests...\n');
  
  const tests = [
    { name: 'Connection Test', fn: testConnection },
    { name: 'Health Check Test', fn: testHealthCheck },
    { name: 'Basic Operations Test', fn: testBasicOperations },
    { name: 'Geospatial Queries Test', fn: testGeospatialQueries },
    { name: 'Text Search Test', fn: testTextSearch },
    { name: 'Connection Monitoring Test', fn: testConnectionMonitoring },
    { name: 'Performance Test', fn: testPerformance }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n🧪 Running ${test.name}...`);
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
      console.log(result ? '✅ PASSED' : '❌ FAILED');
    } catch (error) {
      results.push({ name: test.name, passed: false, error: error.message });
      console.log('❌ FAILED -', error.message);
    }
  }
  
  // Generate report
  console.log('\n📊 Test Report:');
  console.log('================');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log(`\n📈 Summary: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! MongoDB Atlas is ready for production.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review the configuration.');
    process.exit(1);
  }
}

/**
 * Cleanup function.
 */
async function cleanup() {
  try {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  } catch (error) {
    console.error('❌ Cleanup error:', error.message);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Test interrupted by user');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Test terminated');
  await cleanup();
  process.exit(0);
});

// Run tests
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log('✅ Test suite completed');
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('❌ Test suite failed:', error.message);
      await cleanup();
      process.exit(1);
    });
}

module.exports = {
  testConnection,
  testHealthCheck,
  testBasicOperations,
  testGeospatialQueries,
  testTextSearch,
  testConnectionMonitoring,
  testPerformance,
  runAllTests
};
