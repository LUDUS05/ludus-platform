/**
 * Monitoring System Test Suite
 * 
 * Tests the complete monitoring infrastructure including:
 * - Performance monitoring service
 * - Error tracking service
 * - Health check endpoints
 * - Monitoring API routes
 * - Alert system
 * - Configuration management
 */

const axios = require('axios');
const { config, validateConfig } = require('./test-config');

// Test configuration
const TEST_CONFIG = {
  baseURL: config.api.baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.auth.adminToken}`
  }
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  startTime: Date.now()
};

// ===== UTILITY FUNCTIONS =====

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function logTestResult(testName, success, details = '') {
  if (success) {
    testResults.passed++;
    log(`PASS: ${testName}`, 'success');
  } else {
    testResults.failed++;
    log(`FAIL: ${testName}`, 'error');
    if (details) log(`Details: ${details}`, 'error');
  }
}

function logError(testName, error) {
  testResults.failed++;
  testResults.errors.push({ test: testName, error: error.message });
  log(`ERROR: ${testName}`, 'error');
  log(`Error details: ${error.message}`, 'error');
  if (error.response) {
    log(`Response status: ${error.response.status}`, 'error');
    log(`Response data: ${JSON.stringify(error.response.data, null, 2)}`, 'error');
  }
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== TEST FUNCTIONS =====

/**
 * Test 1: Configuration Validation
 */
async function testConfigurationValidation() {
  try {
    log('Testing configuration validation...');
    
    // Validate test config
    validateConfig();
    logTestResult('Configuration Validation', true);
    
    // Test monitoring config
    const monitoringConfig = require('../monitoring/monitoring-config');
    monitoringConfig.validateConfig();
    logTestResult('Monitoring Configuration Validation', true);
    
  } catch (error) {
    logError('Configuration Validation', error);
  }
}

/**
 * Test 2: Basic Health Check
 */
async function testBasicHealthCheck() {
  try {
    log('Testing basic health check endpoint...');
    
    const response = await axios.get('/health', TEST_CONFIG);
    
    if (response.status === 200 && response.data.status) {
      logTestResult('Basic Health Check', true);
      log(`System status: ${response.data.status}`, 'info');
      log(`Environment: ${response.data.environment}`, 'info');
      log(`Version: ${response.data.version}`, 'info');
    } else {
      logTestResult('Basic Health Check', false, 'Invalid response format');
    }
    
  } catch (error) {
    logError('Basic Health Check', error);
  }
}

/**
 * Test 3: Detailed Health Check
 */
async function testDetailedHealthCheck() {
  try {
    log('Testing detailed health check endpoint...');
    
    const response = await axios.get('/api/monitoring/health/detailed', TEST_CONFIG);
    
    if (response.status === 200 && response.data.checks) {
      logTestResult('Detailed Health Check', true);
      
      // Log individual service status
      Object.entries(response.data.checks).forEach(([service, check]) => {
        log(`${service}: ${check.status}`, check.status === 'healthy' ? 'success' : 'warning');
      });
      
    } else {
      logTestResult('Detailed Health Check', false, 'Invalid response format');
    }
    
  } catch (error) {
    logError('Detailed Health Check', error);
  }
}

/**
 * Test 4: Service Health Check
 */
async function testServiceHealthCheck() {
  try {
    log('Testing individual service health checks...');
    
    const response = await axios.get('/api/monitoring/health/services', TEST_CONFIG);
    
    if (response.status === 200 && response.data.data) {
      logTestResult('Service Health Check', true);
      
      // Log individual service status
      Object.entries(response.data.data).forEach(([service, check]) => {
        log(`${service}: ${check.status}`, check.status === 'healthy' ? 'success' : 'warning');
      });
      
    } else {
      logTestResult('Service Health Check', false, 'Invalid response format');
    }
    
  } catch (error) {
    logError('Service Health Check', error);
  }
}

/**
 * Test 5: Performance Monitoring
 */
async function testPerformanceMonitoring() {
  try {
    log('Testing performance monitoring endpoints...');
    
    // Test basic performance metrics
    const response = await axios.get('/api/monitoring/performance', TEST_CONFIG);
    
    if (response.status === 200 && response.data.data) {
      logTestResult('Performance Monitoring - Basic', true);
      
      const metrics = response.data.data;
      if (metrics.requests) {
        log(`Total requests: ${metrics.requests.total || 0}`, 'info');
        log(`Response time P95: ${metrics.responseTime?.p95 || 0}ms`, 'info');
      }
      
    } else {
      logTestResult('Performance Monitoring - Basic', false, 'Invalid response format');
    }
    
    // Test real-time metrics
    const realtimeResponse = await axios.get('/api/monitoring/performance/realtime', TEST_CONFIG);
    
    if (realtimeResponse.status === 200 && realtimeResponse.data.data) {
      logTestResult('Performance Monitoring - Real-time', true);
    } else {
      logTestResult('Performance Monitoring - Real-time', false, 'Invalid response format');
    }
    
  } catch (error) {
    logError('Performance Monitoring', error);
  }
}

/**
 * Test 6: Error Tracking
 */
async function testErrorTracking() {
  try {
    log('Testing error tracking endpoints...');
    
    // Test error statistics
    const response = await axios.get('/api/monitoring/errors', TEST_CONFIG);
    
    if (response.status === 200 && response.data.data) {
      logTestResult('Error Tracking - Statistics', true);
      
      const stats = response.data.data;
      log(`Total errors: ${stats.totalErrors || 0}`, 'info');
      log(`Error rate: ${stats.errorRate || 0}%`, 'info');
      
    } else {
      logTestResult('Error Tracking - Statistics', false, 'Invalid response format');
    }
    
    // Test error history
    const historyResponse = await axios.get('/api/monitoring/errors/history?limit=10', TEST_CONFIG);
    
    if (historyResponse.status === 200 && historyResponse.data.data) {
      logTestResult('Error Tracking - History', true);
    } else {
      logTestResult('Error Tracking - History', false, 'Invalid response format');
    }
    
  } catch (error) {
    logError('Error Tracking', error);
  }
}

/**
 * Test 7: Monitoring Configuration
 */
async function testMonitoringConfiguration() {
  try {
    log('Testing monitoring configuration endpoints...');
    
    // Test get configuration
    const response = await axios.get('/api/monitoring/config', TEST_CONFIG);
    
    if (response.status === 200 && response.data.data) {
      logTestResult('Monitoring Configuration - Get', true);
      
      const config = response.data.data;
      if (config.performance && config.errors) {
        log('Configuration retrieved successfully', 'info');
      }
      
    } else {
      logTestResult('Monitoring Configuration - Get', false, 'Invalid response format');
    }
    
    // Test update configuration (read-only for now)
    log('Monitoring Configuration - Update (read-only)', 'warning');
    
  } catch (error) {
    logError('Monitoring Configuration', error);
  }
}

/**
 * Test 8: Alert System
 */
async function testAlertSystem() {
  try {
    log('Testing alert system endpoints...');
    
    // Test get alerts
    const response = await axios.get('/api/monitoring/alerts', TEST_CONFIG);
    
    if (response.status === 200 && response.data.data) {
      logTestResult('Alert System - Get Alerts', true);
      
      const alerts = response.data.data;
      log(`Active alerts: ${alerts.length}`, 'info');
      
    } else {
      logTestResult('Alert System - Get Alerts', false, 'Invalid response format');
    }
    
    // Test acknowledge alert (placeholder)
    log('Alert System - Acknowledge (placeholder)', 'warning');
    
  } catch (error) {
    logError('Alert System', error);
  }
}

/**
 * Test 9: Performance Data Export
 */
async function testPerformanceDataExport() {
  try {
    log('Testing performance data export...');
    
    // Test JSON export
    const jsonResponse = await axios.get('/api/monitoring/performance/export?format=json&period=1h', TEST_CONFIG);
    
    if (jsonResponse.status === 200 && jsonResponse.data.data) {
      logTestResult('Performance Export - JSON', true);
    } else {
      logTestResult('Performance Export - JSON', false, 'Invalid response format');
    }
    
    // Test CSV export
    const csvResponse = await axios.get('/api/monitoring/performance/export?format=csv&period=1h', TEST_CONFIG);
    
    if (csvResponse.status === 200 && csvResponse.headers['content-type']?.includes('text/csv')) {
      logTestResult('Performance Export - CSV', true);
    } else {
      logTestResult('Performance Export - CSV', false, 'Invalid CSV response');
    }
    
  } catch (error) {
    logError('Performance Data Export', error);
  }
}

/**
 * Test 10: Error Data Export
 */
async function testErrorDataExport() {
  try {
    log('Testing error data export...');
    
    // Test JSON export
    const jsonResponse = await axios.get('/api/monitoring/errors/export?format=json&period=1h', TEST_CONFIG);
    
    if (jsonResponse.status === 200 && jsonResponse.data.data) {
      logTestResult('Error Export - JSON', true);
    } else {
      logTestResult('Error Export - JSON', false, 'Invalid response format');
    }
    
    // Test CSV export
    const csvResponse = await axios.get('/api/monitoring/errors/export?format=csv&period=1h', TEST_CONFIG);
    
    if (csvResponse.status === 200 && csvResponse.headers['content-type']?.includes('text/csv')) {
      logTestResult('Error Export - CSV', true);
    } else {
      logTestResult('Error Export - CSV', false, 'Invalid CSV response');
    }
    
  } catch (error) {
    logError('Error Data Export', error);
  }
}

/**
 * Test 11: Monitoring Service Integration
 */
async function testMonitoringServiceIntegration() {
  try {
    log('Testing monitoring service integration...');
    
    // Test that monitoring services are working together
    const healthResponse = await axios.get('/api/monitoring/health/detailed', TEST_CONFIG);
    const performanceResponse = await axios.get('/api/monitoring/performance', TEST_CONFIG);
    const errorResponse = await axios.get('/api/monitoring/errors', TEST_CONFIG);
    
    if (healthResponse.status === 200 && performanceResponse.status === 200 && errorResponse.status === 200) {
      logTestResult('Monitoring Service Integration', true);
      log('All monitoring services are responding correctly', 'success');
    } else {
      logTestResult('Monitoring Service Integration', false, 'Some services are not responding');
    }
    
  } catch (error) {
    logError('Monitoring Service Integration', error);
  }
}

/**
 * Test 12: Stress Testing
 */
async function testStressTesting() {
  try {
    log('Testing monitoring system under stress...');
    
    // Make multiple concurrent requests to test system stability
    const concurrentRequests = 5;
    const promises = [];
    
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        axios.get('/api/monitoring/performance', TEST_CONFIG)
          .catch(error => ({ error: true, message: error.message }))
      );
    }
    
    const results = await Promise.all(promises);
    const successfulRequests = results.filter(result => !result.error).length;
    
    if (successfulRequests === concurrentRequests) {
      logTestResult('Stress Testing', true);
      log(`All ${concurrentRequests} concurrent requests succeeded`, 'success');
    } else {
      logTestResult('Stress Testing', false, `${concurrentRequests - successfulRequests} requests failed`);
    }
    
  } catch (error) {
    logError('Stress Testing', error);
  }
}

// ===== MAIN TEST EXECUTION =====

async function runAllTests() {
  log('🚀 Starting Monitoring System Test Suite', 'info');
  log(`Base URL: ${TEST_CONFIG.baseURL}`, 'info');
  log(`Admin Token: ${TEST_CONFIG.headers.Authorization ? 'Present' : 'Missing'}`, 'info');
  log('', 'info');
  
  try {
    // Run all tests
    await testConfigurationValidation();
    await wait(1000);
    
    await testBasicHealthCheck();
    await wait(1000);
    
    await testDetailedHealthCheck();
    await wait(1000);
    
    await testServiceHealthCheck();
    await wait(1000);
    
    await testPerformanceMonitoring();
    await wait(1000);
    
    await testErrorTracking();
    await wait(1000);
    
    await testMonitoringConfiguration();
    await wait(1000);
    
    await testAlertSystem();
    await wait(1000);
    
    await testPerformanceDataExport();
    await wait(1000);
    
    await testErrorDataExport();
    await wait(1000);
    
    await testMonitoringServiceIntegration();
    await wait(1000);
    
    await testStressTesting();
    await wait(1000);
    
  } catch (error) {
    log(`Unexpected error during test execution: ${error.message}`, 'error');
  }
  
  // Generate test report
  generateTestReport();
}

function generateTestReport() {
  const endTime = Date.now();
  const duration = endTime - testResults.startTime;
  
  log('', 'info');
  log('📊 MONITORING SYSTEM TEST RESULTS', 'info');
  log('================================', 'info');
  log(`Total Tests: ${testResults.passed + testResults.failed}`, 'info');
  log(`Passed: ${testResults.passed}`, 'success');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success');
  log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`, 'info');
  log(`Duration: ${(duration / 1000).toFixed(2)}s`, 'info');
  
  if (testResults.errors.length > 0) {
    log('', 'info');
    log('❌ ERROR DETAILS:', 'error');
    testResults.errors.forEach((error, index) => {
      log(`${index + 1}. ${error.test}: ${error.error}`, 'error');
    });
  }
  
  log('', 'info');
  if (testResults.failed === 0) {
    log('🎉 ALL TESTS PASSED! Monitoring system is working correctly.', 'success');
  } else {
    log(`⚠️  ${testResults.failed} test(s) failed. Please review the errors above.`, 'warning');
  }
  
  log('', 'info');
  log('Test suite completed.', 'info');
}

// ===== EXPORT FOR MODULE USAGE =====

module.exports = {
  runAllTests,
  testConfigurationValidation,
  testBasicHealthCheck,
  testDetailedHealthCheck,
  testServiceHealthCheck,
  testPerformanceMonitoring,
  testErrorTracking,
  testMonitoringConfiguration,
  testAlertSystem,
  testPerformanceDataExport,
  testErrorDataExport,
  testMonitoringServiceIntegration,
  testStressTesting
};

// ===== CLI EXECUTION =====

if (require.main === module) {
  // Validate configuration before running tests
  try {
    validateConfig();
    log('Configuration validated successfully', 'success');
  } catch (error) {
    log(`Configuration validation failed: ${error.message}`, 'error');
    process.exit(1);
  }
  
  // Run tests
  runAllTests().catch(error => {
    log(`Test execution failed: ${error.message}`, 'error');
    process.exit(1);
  });
}
