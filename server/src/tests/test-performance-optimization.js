/**
 * Performance Optimization Services Test Script
 * 
 * This script tests all the performance optimization services:
 * - Rate Limiting Service
 * - Caching Service
 * - Database Optimization Service
 * - QR Code Optimization Service
 * - Performance Monitoring Integration Service
 * 
 * Run with: npm run test:performance
 */

const axios = require('axios');
const { config, validateConfig } = require('./test-config');

const TEST_CONFIG = {
  baseURL: config.api.baseURL,
  timeout: config.test.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.auth.adminToken}`
  }
};

const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// ===== UTILITY FUNCTIONS =====

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function logTestResult(testName, success, details = '') {
  testResults.total++;
  if (success) {
    testResults.passed++;
    log(`PASS: ${testName}`, 'success');
    if (details) log(`  Details: ${details}`, 'info');
  } else {
    testResults.failed++;
    log(`FAIL: ${testName}`, 'error');
    if (details) log(`  Details: ${details}`, 'error');
  }
}

function logError(testName, error) {
  testResults.errors.push({ testName, error: error.message });
  log(`ERROR in ${testName}: ${error.message}`, 'error');
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== RATE LIMITING SERVICE TESTS =====

async function testRateLimitingService() {
  log('Testing Rate Limiting Service...', 'info');
  
  try {
    // Test basic health check
    const healthResponse = await axios.get(`${TEST_CONFIG.baseURL}/monitoring/health/detailed`);
    if (healthResponse.data.services?.rateLimiting) {
      logTestResult('Rate Limiting Health Check', true, 'Service is healthy');
    } else {
      logTestResult('Rate Limiting Health Check', false, 'Service health not available');
    }
    
    // Test rate limit configuration
    const configResponse = await axios.get(`${TEST_CONFIG.baseURL}/monitoring/config`);
    if (configResponse.data.rateLimiting) {
      logTestResult('Rate Limiting Configuration', true, 'Configuration retrieved');
    } else {
      logTestResult('Rate Limiting Configuration', false, 'Configuration not available');
    }
    
    // Test rate limit statistics
    const statsResponse = await axios.get(`${TEST_CONFIG.baseURL}/monitoring/performance`);
    if (statsResponse.data.rateLimiting) {
      logTestResult('Rate Limiting Statistics', true, 'Statistics retrieved');
    } else {
      logTestResult('Rate Limiting Statistics', false, 'Statistics not available');
    }
    
  } catch (error) {
    logError('Rate Limiting Service Tests', error);
  }
}

// ===== CACHING SERVICE TESTS =====

async function testCachingService() {
  log('Testing Caching Service...', 'info');
  
  try {
    // Test cache health check
    const healthResponse = await axios.get(`${TEST_CONFIG.baseURL}/monitoring/health/detailed`);
    if (healthResponse.data.services?.caching) {
      logTestResult('Caching Health Check', true, 'Service is healthy');
    } else {
      logTestResult('Caching Health Check', false, 'Service health not available');
    }
    
    // Test cache statistics
    const statsResponse = await axios.get(`${TEST_CONFIG.baseURL}/monitoring/performance`);
    if (statsResponse.data.caching) {
      logTestResult('Caching Statistics', true, 'Statistics retrieved');
    } else {
      logTestResult('Caching Statistics', false, 'Statistics not available');
    }
    
    // Test cache configuration
    const configResponse = await axios.get(`${TEST_CONFIG.baseURL}/monitoring/config`);
    if (configResponse.data.caching) {
      logTestResult('Caching Configuration', true, 'Configuration retrieved');
    } else {
      logTestResult('Caching Configuration', false, 'Configuration not available');
    }
    
  } catch (error) {
    logError('Caching Service Tests', error);
  }
}

// ===== DATABASE OPTIMIZATION SERVICE TESTS =====

async function testDatabaseOptimizationService() {
  log('Testing Database Optimization Service...', 'info');
  
  try {
    // Test database health check
    const healthResponse = await axios.get(`${TEST_CONFIG.baseURL}/monitoring/health/detailed`);
    if (healthResponse.data.services?.database) {
      logTestResult('Database Health Check', true, 'Service is healthy');
    } else {
      logTestResult('Database Health Check', false, 'Service health not available');
    }
    
    // Test database performance metrics
    const performanceResponse = await axios.get(`${TEST_CONFIG.baseURL}/monitoring/performance`);
    if (performanceResponse.data.database) {
      logTestResult('Database Performance Metrics', true, 'Metrics retrieved');
    } else {
      logTestResult('Database Performance Metrics', false, 'Metrics not available');
    }
    
    // Test database connection status
    const connectionResponse = await axios.get(`${TEST_CONFIG.baseURL}/monitoring/health/services`);
    if (connectionResponse.data.database) {
      logTestResult('Database Connection Status', true, 'Connection status retrieved');
    } else {
      logTestResult('Database Connection Status', false, 'Connection status not available');
    }
    
  } catch (error) {
    logError('Database Optimization Service Tests', error);
  }
}

// ===== QR CODE OPTIMIZATION SERVICE TESTS =====

async function testQRCodeOptimizationService() {
  log('Testing QR Code Optimization Service...', 'info');
  
  try {
    // Test QR code service health check
    const healthResponse = await axios.get(`${TEST_CONFIG.baseURL}/monitoring/health/detailed`);
    if (healthResponse.data.services?.qrCode) {
      logTestResult('QR Code Service Health Check', true, 'Service is healthy');
    } else {
      logTestResult('QR Code Service Health Check', false, 'Service health not available');
    }
    
    // Test QR code generation (if endpoint exists)
    try {
      const qrResponse = await axios.post(`${TEST_CONFIG.baseURL}/referrals/generate-qr`, {
        referralCode: 'TEST123',
        options: { size: 'medium', format: 'png' }
      });
      logTestResult('QR Code Generation', true, 'QR code generated successfully');
    } catch (error) {
      if (error.response?.status === 404) {
        logTestResult('QR Code Generation', false, 'Endpoint not implemented yet');
      } else {
        logTestResult('QR Code Generation', false, `Error: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // Test QR code statistics
    const statsResponse = await axios.get(`${TEST_CONFIG.baseURL}/monitoring/performance`);
    if (statsResponse.data.qrCode) {
      logTestResult('QR Code Statistics', true, 'Statistics retrieved');
    } else {
      logTestResult('QR Code Statistics', false, 'Statistics not available');
    }
    
  } catch (error) {
    logError('QR Code Optimization Service Tests', error);
  }
}

// ===== PERFORMANCE MONITORING INTEGRATION TESTS =====

async function testPerformanceMonitoringIntegration() {
  log('Testing Performance Monitoring Integration...', 'info');
  
  try {
    // Test overall system status
    const systemResponse = await axios.get(`${TEST_CONFIG.baseURL}/monitoring/health/detailed`);
    if (systemResponse.data.services) {
      logTestResult('System Status Integration', true, 'All services status retrieved');
    } else {
      logTestResult('System Status Integration', false, 'Services status not available');
    }
    
    // Test performance summary
    const summaryResponse = await axios.get(`${TEST_CONFIG.baseURL}/monitoring/performance`);
    if (summaryResponse.data) {
      logTestResult('Performance Summary Integration', true, 'Performance summary retrieved');
    } else {
      logTestResult('Performance Summary Integration', false, 'Performance summary not available');
    }
    
    // Test alerts system
    const alertsResponse = await axios.get(`${TEST_CONFIG.baseURL}/monitoring/alerts`);
    if (alertsResponse.data) {
      logTestResult('Alerts System Integration', true, 'Alerts retrieved');
    } else {
      logTestResult('Alerts System Integration', false, 'Alerts not available');
    }
    
    // Test monitoring configuration
    const configResponse = await axios.get(`${TEST_CONFIG.baseURL}/monitoring/config`);
    if (configResponse.data) {
      logTestResult('Monitoring Configuration Integration', true, 'Configuration retrieved');
    } else {
      logTestResult('Monitoring Configuration Integration', false, 'Configuration not available');
    }
    
  } catch (error) {
    logError('Performance Monitoring Integration Tests', error);
  }
}

// ===== PERFORMANCE STRESS TESTS =====

async function testPerformanceStress() {
  log('Testing Performance Under Stress...', 'info');
  
  try {
    const startTime = Date.now();
    const concurrentRequests = 10;
    const requestPromises = [];
    
    // Make multiple concurrent requests to test performance
    for (let i = 0; i < concurrentRequests; i++) {
      requestPromises.push(
        axios.get(`${TEST_CONFIG.baseURL}/monitoring/health`)
          .catch(error => ({ error: error.message }))
      );
    }
    
    const results = await Promise.allSettled(requestPromises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const successfulRequests = results.filter(r => r.status === 'fulfilled' && !r.value.error).length;
    const failedRequests = results.length - successfulRequests;
    
    if (successfulRequests >= concurrentRequests * 0.8) { // 80% success rate
      logTestResult('Performance Stress Test', true, 
        `${successfulRequests}/${concurrentRequests} requests successful in ${duration}ms`);
    } else {
      logTestResult('Performance Stress Test', false, 
        `${successfulRequests}/${concurrentRequests} requests successful, ${failedRequests} failed`);
    }
    
  } catch (error) {
    logError('Performance Stress Tests', error);
  }
}

// ===== CACHE PERFORMANCE TESTS =====

async function testCachePerformance() {
  log('Testing Cache Performance...', 'info');
  
  try {
    // Test cache hit rate by making repeated requests
    const startTime = Date.now();
    
    // First request (cache miss)
    const firstResponse = await axios.get(`${TEST_CONFIG.baseURL}/monitoring/health`);
    const firstTime = Date.now() - startTime;
    
    // Second request (should be cached)
    const secondStart = Date.now();
    const secondResponse = await axios.get(`${TEST_CONFIG.baseURL}/monitoring/health`);
    const secondTime = Date.now() - secondStart;
    
    if (secondTime < firstTime * 0.8) { // Second request should be significantly faster
      logTestResult('Cache Performance Test', true, 
        `First request: ${firstTime}ms, Second request: ${secondTime}ms (cached)`);
    } else {
      logTestResult('Cache Performance Test', false, 
        `Cache not working effectively. First: ${firstTime}ms, Second: ${secondTime}ms`);
    }
    
  } catch (error) {
    logError('Cache Performance Tests', error);
  }
}

// ===== RATE LIMITING PERFORMANCE TESTS =====

async function testRateLimitingPerformance() {
  log('Testing Rate Limiting Performance...', 'info');
  
  try {
    // Test rate limiting by making rapid requests
    const requests = [];
    const rapidRequests = 20;
    
    for (let i = 0; i < rapidRequests; i++) {
      requests.push(
        axios.get(`${TEST_CONFIG.baseURL}/monitoring/health`)
          .then(response => ({ success: true, status: response.status }))
          .catch(error => ({ success: false, status: error.response?.status }))
      );
      
      // Small delay between requests
      await wait(50);
    }
    
    const results = await Promise.all(requests);
    const successfulRequests = results.filter(r => r.success).length;
    const rateLimitedRequests = results.filter(r => r.status === 429).length;
    
    if (rateLimitedRequests > 0) {
      logTestResult('Rate Limiting Performance Test', true, 
        `${successfulRequests} successful, ${rateLimitedRequests} rate limited`);
    } else {
      logTestResult('Rate Limiting Performance Test', false, 
        'No rate limiting detected. All requests successful');
    }
    
  } catch (error) {
    logError('Rate Limiting Performance Tests', error);
  }
}

// ===== MAIN TEST EXECUTION =====

async function runAllTests() {
  log('🚀 Starting Performance Optimization Services Tests...', 'info');
  log(`Base URL: ${TEST_CONFIG.baseURL}`, 'info');
  log(`Timeout: ${TEST_CONFIG.timeout}ms`, 'info');
  
  try {
    // Validate configuration
    if (!validateConfig()) {
      log('❌ Configuration validation failed', 'error');
      return;
    }
    
    // Run all test suites
    await testRateLimitingService();
    await wait(1000); // Wait between test suites
    
    await testCachingService();
    await wait(1000);
    
    await testDatabaseOptimizationService();
    await wait(1000);
    
    await testQRCodeOptimizationService();
    await wait(1000);
    
    await testPerformanceMonitoringIntegration();
    await wait(1000);
    
    await testPerformanceStress();
    await wait(1000);
    
    await testCachePerformance();
    await wait(1000);
    
    await testRateLimitingPerformance();
    
  } catch (error) {
    log(`❌ Test execution failed: ${error.message}`, 'error');
  }
  
  // Generate test report
  generateTestReport();
}

function generateTestReport() {
  log('\n📊 PERFORMANCE OPTIMIZATION SERVICES TEST REPORT', 'info');
  log('='.repeat(60), 'info');
  
  log(`Total Tests: ${testResults.total}`, 'info');
  log(`Passed: ${testResults.passed} ✅`, 'success');
  log(`Failed: ${testResults.failed} ❌`, testResults.failed > 0 ? 'error' : 'info');
  
  const successRate = testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(1) : 0;
  log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'success' : 'warning');
  
  if (testResults.errors.length > 0) {
    log('\n❌ Errors:', 'error');
    testResults.errors.forEach((error, index) => {
      log(`  ${index + 1}. ${error.testName}: ${error.error}`, 'error');
    });
  }
  
  if (testResults.failed === 0) {
    log('\n🎉 All performance optimization services tests passed!', 'success');
  } else {
    log(`\n⚠️  ${testResults.failed} tests failed. Please review the errors above.`, 'warning');
  }
  
  log('\n' + '='.repeat(60), 'info');
}

// ===== EXPORTS =====

module.exports = {
  runAllTests,
  testRateLimitingService,
  testCachingService,
  testDatabaseOptimizationService,
  testQRCodeOptimizationService,
  testPerformanceMonitoringIntegration,
  testPerformanceStress,
  testCachePerformance,
  testRateLimitingPerformance
};

// ===== CLI EXECUTION =====

if (require.main === module) {
  runAllTests().catch(error => {
    log(`❌ Test execution failed: ${error.message}`, 'error');
    process.exit(1);
  });
}
