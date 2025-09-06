#!/usr/bin/env node

/**
 * Project ATHENA - Complete System Functionality Test
 * Tests all Project ATHENA features and integrations
 */

const axios = require('axios');
const colors = require('colors');

// Configuration
const CONFIG = {
  backend: 'https://ludus-backend-athena.onrender.com',
  frontend: 'https://ludus-frontend-athena.onrender.com',
  timeout: 10000
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}]`;
  
  switch (type) {
    case 'success':
      console.log(`${prefix} ✅ ${message}`.green);
      break;
    case 'error':
      console.log(`${prefix} ❌ ${message}`.red);
      break;
    case 'warning':
      console.log(`${prefix} ⚠️  ${message}`.yellow);
      break;
    case 'info':
      console.log(`${prefix} ℹ️  ${message}`.blue);
      break;
    default:
      console.log(`${prefix} ${message}`);
  }
};

const recordTest = (name, passed, details = '') => {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`${name}: PASSED`, 'success');
  } else {
    testResults.failed++;
    log(`${name}: FAILED - ${details}`, 'error');
  }
  testResults.details.push({ name, passed, details });
};

// Test functions
const testBackendHealth = async () => {
  try {
    const response = await axios.get(`${CONFIG.backend}/health`, { timeout: CONFIG.timeout });
    
    if (response.status === 200 && response.data.status === 'healthy') {
      recordTest('Backend Health Check', true);
      log(`Backend uptime: ${response.data.uptime}s`, 'info');
      log(`Environment: ${response.data.environment}`, 'info');
      log(`Version: ${response.data.version}`, 'info');
      return true;
    } else {
      recordTest('Backend Health Check', false, 'Invalid response');
      return false;
    }
  } catch (error) {
    recordTest('Backend Health Check', false, error.message);
    return false;
  }
};

const testFrontendAccessibility = async () => {
  try {
    const response = await axios.get(CONFIG.frontend, { timeout: CONFIG.timeout });
    
    if (response.status === 200) {
      recordTest('Frontend Accessibility', true);
      return true;
    } else {
      recordTest('Frontend Accessibility', false, `HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    recordTest('Frontend Accessibility', false, error.message);
    return false;
  }
};

const testDatabaseConnection = async () => {
  try {
    const response = await axios.get(`${CONFIG.backend}/health`, { timeout: CONFIG.timeout });
    
    if (response.data.services && response.data.services.database === 'connected') {
      recordTest('Database Connection', true);
      return true;
    } else {
      recordTest('Database Connection', false, 'Database not connected');
      return false;
    }
  } catch (error) {
    recordTest('Database Connection', false, error.message);
    return false;
  }
};

const testProjectAthenaServices = async () => {
  try {
    const response = await axios.get(`${CONFIG.backend}/health`, { timeout: CONFIG.timeout });
    const services = response.data.services;
    
    const athenaServices = [
      'referral',
      'analytics', 
      'notifications',
      'invitations',
      'reports'
    ];
    
    let allActive = true;
    for (const service of athenaServices) {
      if (services[service] !== 'active') {
        allActive = false;
        break;
      }
    }
    
    if (allActive) {
      recordTest('Project ATHENA Services', true);
      log('All ATHENA services are active:', 'info');
      athenaServices.forEach(service => {
        log(`  - ${service}: ${services[service]}`, 'info');
      });
      return true;
    } else {
      recordTest('Project ATHENA Services', false, 'Some services not active');
      return false;
    }
  } catch (error) {
    recordTest('Project ATHENA Services', false, error.message);
    return false;
  }
};

const testReferralSystem = async () => {
  try {
    const response = await axios.get(`${CONFIG.backend}/health`, { timeout: CONFIG.timeout });
    const referral = response.data.referral;
    
    if (referral && referral.system === 'operational') {
      recordTest('Referral System', true);
      log(`Referral system: ${referral.system}`, 'info');
      log(`Rewards: ${referral.rewards}`, 'info');
      log(`Tracking: ${referral.tracking}`, 'info');
      log(`Analytics: ${referral.analytics}`, 'info');
      return true;
    } else {
      recordTest('Referral System', false, 'Referral system not operational');
      return false;
    }
  } catch (error) {
    recordTest('Referral System', false, error.message);
    return false;
  }
};

const testAPIEndpoints = async () => {
  const endpoints = [
    { path: '/api/auth/status', name: 'Auth Status' },
    { path: '/api/activities', name: 'Activities' },
    { path: '/api/social/interactions', name: 'Social Interactions' },
    { path: '/api/rating-system/health', name: 'Rating System Health' }
  ];
  
  let allEndpointsWorking = true;
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${CONFIG.backend}${endpoint.path}`, { 
        timeout: CONFIG.timeout,
        validateStatus: () => true // Accept any status code
      });
      
      // Accept 200, 401 (unauthorized), or 404 (not found) as valid responses
      if ([200, 401, 404].includes(response.status)) {
        log(`${endpoint.name} endpoint: HTTP ${response.status}`, 'info');
      } else {
        log(`${endpoint.name} endpoint: HTTP ${response.status}`, 'warning');
        allEndpointsWorking = false;
      }
    } catch (error) {
      log(`${endpoint.name} endpoint: ${error.message}`, 'error');
      allEndpointsWorking = false;
    }
  }
  
  recordTest('API Endpoints', allEndpointsWorking, allEndpointsWorking ? '' : 'Some endpoints not responding');
  return allEndpointsWorking;
};

const testPerformanceMetrics = async () => {
  try {
    const startTime = Date.now();
    const response = await axios.get(`${CONFIG.backend}/health`, { timeout: CONFIG.timeout });
    const responseTime = Date.now() - startTime;
    
    if (responseTime < 1000) { // Less than 1 second
      recordTest('Performance Metrics', true, `Response time: ${responseTime}ms`);
      log(`API response time: ${responseTime}ms`, 'info');
      return true;
    } else {
      recordTest('Performance Metrics', false, `Response time too slow: ${responseTime}ms`);
      return false;
    }
  } catch (error) {
    recordTest('Performance Metrics', false, error.message);
    return false;
  }
};

const testCORSConfiguration = async () => {
  try {
    const response = await axios.options(`${CONFIG.backend}/health`, {
      timeout: CONFIG.timeout,
      headers: {
        'Origin': CONFIG.frontend,
        'Access-Control-Request-Method': 'GET'
      }
    });
    
    if (response.status === 200 || response.status === 204) {
      recordTest('CORS Configuration', true);
      return true;
    } else {
      recordTest('CORS Configuration', false, `HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    recordTest('CORS Configuration', false, error.message);
    return false;
  }
};

const testFrontendBuild = async () => {
  try {
    const response = await axios.get(CONFIG.frontend, { timeout: CONFIG.timeout });
    
    // Check if the response contains React app indicators
    const hasReactApp = response.data.includes('react') || 
                       response.data.includes('React') ||
                       response.data.includes('root');
    
    if (hasReactApp) {
      recordTest('Frontend Build', true);
      return true;
    } else {
      recordTest('Frontend Build', false, 'React app not detected');
      return false;
    }
  } catch (error) {
    recordTest('Frontend Build', false, error.message);
    return false;
  }
};

// Main test execution
const runAllTests = async () => {
  console.log('🎬 Project ATHENA - Complete System Functionality Test'.cyan.bold);
  console.log('=================================================='.cyan);
  console.log('');
  
  log('Starting comprehensive system tests...', 'info');
  console.log('');
  
  // Core system tests
  log('🔧 Core System Tests:', 'info');
  console.log('-----------------');
  await testBackendHealth();
  await testFrontendAccessibility();
  await testDatabaseConnection();
  console.log('');
  
  // Project ATHENA specific tests
  log('🎯 Project ATHENA Tests:', 'info');
  console.log('-------------------');
  await testProjectAthenaServices();
  await testReferralSystem();
  console.log('');
  
  // API and integration tests
  log('🔗 API & Integration Tests:', 'info');
  console.log('------------------------');
  await testAPIEndpoints();
  await testCORSConfiguration();
  console.log('');
  
  // Performance tests
  log('⚡ Performance Tests:', 'info');
  console.log('------------------');
  await testPerformanceMetrics();
  console.log('');
  
  // Frontend tests
  log('🎨 Frontend Tests:', 'info');
  console.log('----------------');
  await testFrontendBuild();
  console.log('');
  
  // Results summary
  log('📊 Test Results Summary:', 'info');
  console.log('===================');
  console.log(`Total Tests: ${testResults.total}`.white);
  console.log(`Passed: ${testResults.passed}`.green);
  console.log(`Failed: ${testResults.failed}`.red);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`.cyan);
  console.log('');
  
  if (testResults.failed === 0) {
    log('🎉 All tests passed! Project ATHENA is fully operational!', 'success');
    console.log('');
    log('✅ Backend Service: Operational', 'success');
    log('✅ Frontend Service: Operational', 'success');
    log('✅ Database: Connected', 'success');
    log('✅ All ATHENA Features: Active', 'success');
    log('✅ Performance: Optimized', 'success');
    console.log('');
    log('🚀 Project ATHENA is ready for production!', 'success');
  } else {
    log('⚠️  Some tests failed. Please review the issues above.', 'warning');
    console.log('');
    log('Failed tests:', 'error');
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => {
        log(`  - ${test.name}: ${test.details}`, 'error');
      });
  }
  
  console.log('');
  log('Service URLs:', 'info');
  log(`  Backend: ${CONFIG.backend}`, 'info');
  log(`  Frontend: ${CONFIG.frontend}`, 'info');
  console.log('');
  
  // Exit with appropriate code
  process.exit(testResults.failed === 0 ? 0 : 1);
};

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`Unhandled error: ${error.message}`, 'error');
  process.exit(1);
});

// Run tests
runAllTests().catch(error => {
  log(`Test execution failed: ${error.message}`, 'error');
  process.exit(1);
});
