/**
 * System Integration Test - LUDUS Referral System
 * Tests all phases working together seamlessly
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
  errors: [],
  phases: {}
};

// Initialize phase tracking
['Phase 1 - Core Referral', 'Phase 2 - User Registration', 'Phase 3 - Wallet Integration',
 'Phase 4 - Social Sharing & QR', 'Phase 5 - Invitations & Notifications', 
 'Phase 6 - Analytics & Reporting', 'Phase 7 - Admin & User Dashboards',
 'Phase 8 - Deployment & Monitoring', 'Phase 9 - Performance Optimization'].forEach(phase => {
  testResults.phases[phase] = { passed: 0, failed: 0, total: 0 };
});

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function logTestResult(testName, success, details = '', phase = 'General') {
  testResults.total++;
  
  if (success) {
    testResults.passed++;
    if (phase && testResults.phases[phase]) {
      testResults.phases[phase].passed++;
      testResults.phases[phase].total++;
    }
    log(`PASS: ${testName}`, 'success');
    if (details) log(`  Details: ${details}`, 'info');
  } else {
    testResults.failed++;
    if (phase && testResults.phases[phase]) {
      testResults.phases[phase].failed++;
      testResults.phases[phase].total++;
    }
    log(`FAIL: ${testName}`, 'error');
    if (details) log(`  Details: ${details}`, 'error');
  }
}

function logError(testName, error, phase = 'General') {
  testResults.errors.push({ testName, error: error.message, phase });
  log(`ERROR in ${testName}: ${error.message}`, 'error');
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== PHASE TESTS =====

async function testPhase1CoreReferral() {
  log('🧪 Testing Phase 1: Core Referral System...', 'info');
  
  try {
    const generateResponse = await axios.post(`${TEST_CONFIG.baseURL}/referrals/generate-code`, {
      userId: config.test.testUserId
    });
    
    if (generateResponse.data.success && generateResponse.data.referralCode) {
      logTestResult('Referral Code Generation', true, 'Code generated successfully', 'Phase 1 - Core Referral');
      
      const validateResponse = await axios.post(`${TEST_CONFIG.baseURL}/referrals/validate-code`, {
        code: generateResponse.data.referralCode.code
      });
      
      if (validateResponse.data.valid) {
        logTestResult('Referral Code Validation', true, 'Code validated successfully', 'Phase 1 - Core Referral');
      } else {
        logTestResult('Referral Code Validation', false, 'Code validation failed', 'Phase 1 - Core Referral');
      }
    } else {
      logTestResult('Referral Code Generation', false, 'Code generation failed', 'Phase 1 - Core Referral');
    }
    
  } catch (error) {
    logError('Phase 1 Core Referral Tests', error, 'Phase 1 - Core Referral');
  }
}

async function testPhase2UserRegistration() {
  log('🧪 Testing Phase 2: User Registration Integration...', 'info');
  
  try {
    const registrationResponse = await axios.post(`${TEST_CONFIG.baseURL}/referrals/process-registration`, {
      referralCode: 'TEST123',
      userData: {
        email: `test${Date.now()}@example.com`,
        name: 'Test User',
        password: 'TestPassword123!'
      }
    });
    
    if (registrationResponse.data.success) {
      logTestResult('Referral Registration Processing', true, 'Registration processed successfully', 'Phase 2 - User Registration');
    } else {
      logTestResult('Referral Registration Processing', false, 'Registration processing failed', 'Phase 2 - User Registration');
    }
    
  } catch (error) {
    logError('Phase 2 User Registration Tests', error, 'Phase 2 - User Registration');
  }
}

async function testPhase3WalletIntegration() {
  log('🧪 Testing Phase 3: Wallet Integration...', 'info');
  
  try {
    const rewardResponse = await axios.post(`${TEST_CONFIG.baseURL}/referrals/process-booking`, {
      referralId: 'test-referral-id',
      bookingData: {
        amount: 100,
        activityId: 'test-activity-id'
      }
    });
    
    if (rewardResponse.data.success) {
      logTestResult('Referral Booking Processing', true, 'Booking processed successfully', 'Phase 3 - Wallet Integration');
    } else {
      logTestResult('Referral Booking Processing', false, 'Booking processing failed', 'Phase 3 - Wallet Integration');
    }
    
  } catch (error) {
    logError('Phase 3 Wallet Integration Tests', error, 'Phase 3 - Wallet Integration');
  }
}

async function testPhase4SocialSharing() {
  log('🧪 Testing Phase 4: Social Sharing & QR Codes...', 'info');
  
  try {
    const qrResponse = await axios.post(`${TEST_CONFIG.baseURL}/referrals/generate-qr`, {
      referralCode: 'TEST123',
      options: { size: 'medium', format: 'png' }
    });
    
    if (qrResponse.data.success) {
      logTestResult('QR Code Generation', true, 'QR code generated successfully', 'Phase 4 - Social Sharing & QR');
    } else {
      logTestResult('QR Code Generation', false, 'QR code generation failed', 'Phase 4 - Social Sharing & QR');
    }
    
  } catch (error) {
    logError('Phase 4 Social Sharing Tests', error, 'Phase 4 - Social Sharing & QR');
  }
}

async function testPhase5InvitationsNotifications() {
  log('🧪 Testing Phase 5: Invitations & Notifications...', 'info');
  
  try {
    const invitationResponse = await axios.post(`${TEST_CONFIG.baseURL}/invitations`, {
      referrerId: config.test.testUserId,
      activityId: 'test-activity-id',
      type: 'referral',
      platform: 'email'
    });
    
    if (invitationResponse.data.success) {
      logTestResult('Invitation Creation', true, 'Invitation created successfully', 'Phase 5 - Invitations & Notifications');
    } else {
      logTestResult('Invitation Creation', false, 'Invitation creation failed', 'Phase 5 - Invitations & Notifications');
    }
    
  } catch (error) {
    logError('Phase 5 Invitations & Notifications Tests', error, 'Phase 5 - Invitations & Notifications');
  }
}

async function testPhase6AnalyticsReporting() {
  log('🧪 Testing Phase 6: Analytics & Reporting...', 'info');
  
  try {
    const analyticsResponse = await axios.get(`${TEST_CONFIG.baseURL}/analytics/referrals?period=30d`);
    
    if (analyticsResponse.data.success) {
      logTestResult('Referral Analytics', true, 'Analytics retrieved successfully', 'Phase 6 - Analytics & Reporting');
    } else {
      logTestResult('Referral Analytics', false, 'Analytics retrieval failed', 'Phase 6 - Analytics & Reporting');
    }
    
  } catch (error) {
    logError('Phase 6 Analytics & Reporting Tests', error, 'Phase 6 - Analytics & Reporting');
  }
}

async function testPhase7Dashboards() {
  log('🧪 Testing Phase 7: Admin & User Dashboards...', 'info');
  
  try {
    const adminDashboardResponse = await axios.get(`${TEST_CONFIG.baseURL}/admin/dashboard`);
    
    if (adminDashboardResponse.data.success) {
      logTestResult('Admin Dashboard', true, 'Admin dashboard data retrieved successfully', 'Phase 7 - Admin & User Dashboards');
    } else {
      logTestResult('Admin Dashboard', false, 'Admin dashboard data retrieval failed', 'Phase 7 - Admin & User Dashboards');
    }
    
  } catch (error) {
    logError('Phase 7 Dashboards Tests', error, 'Phase 7 - Admin & User Dashboards');
  }
}

async function testPhase8DeploymentMonitoring() {
  log('🧪 Testing Phase 8: Deployment & Monitoring...', 'info');
  
  try {
    const healthResponse = await axios.get(`${TEST_CONFIG.baseURL}/health`);
    
    if (healthResponse.data.status === 'healthy') {
      logTestResult('System Health Check', true, 'System is healthy', 'Phase 8 - Deployment & Monitoring');
    } else {
      logTestResult('System Health Check', false, 'System health check failed', 'Phase 8 - Deployment & Monitoring');
    }
    
  } catch (error) {
    logError('Phase 8 Deployment & Monitoring Tests', error, 'Phase 8 - Deployment & Monitoring');
  }
}

async function testPhase9PerformanceOptimization() {
  log('🧪 Testing Phase 9: Performance Optimization...', 'info');
  
  try {
    const healthResponse = await axios.get(`${TEST_CONFIG.baseURL}/monitoring/health/detailed`);
    
    if (healthResponse.data.services?.rateLimiting) {
      logTestResult('Rate Limiting Service', true, 'Rate limiting service is healthy', 'Phase 9 - Performance Optimization');
    } else {
      logTestResult('Rate Limiting Service', false, 'Rate limiting service health check failed', 'Phase 9 - Performance Optimization');
    }
    
  } catch (error) {
    logError('Phase 9 Performance Optimization Tests', error, 'Phase 9 - Performance Optimization');
  }
}

// ===== MAIN TEST EXECUTION =====

async function runAllTests() {
  log('🚀 Starting LUDUS Referral System Integration Tests...', 'info');
  
  try {
    if (!validateConfig()) {
      log('❌ Configuration validation failed', 'error');
      return;
    }
    
    // Run all phase tests
    await testPhase1CoreReferral();
    await wait(1000);
    
    await testPhase2UserRegistration();
    await wait(1000);
    
    await testPhase3WalletIntegration();
    await wait(1000);
    
    await testPhase4SocialSharing();
    await wait(1000);
    
    await testPhase5InvitationsNotifications();
    await wait(1000);
    
    await testPhase6AnalyticsReporting();
    await wait(1000);
    
    await testPhase7Dashboards();
    await wait(1000);
    
    await testPhase8DeploymentMonitoring();
    await wait(1000);
    
    await testPhase9PerformanceOptimization();
    
  } catch (error) {
    log(`❌ Test execution failed: ${error.message}`, 'error');
  }
  
  generateIntegrationTestReport();
}

function generateIntegrationTestReport() {
  log('\n📊 LUDUS REFERRAL SYSTEM INTEGRATION TEST REPORT', 'info');
  log('='.repeat(70), 'info');
  
  log(`Total Tests: ${testResults.total}`, 'info');
  log(`Passed: ${testResults.passed} ✅`, 'success');
  log(`Failed: ${testResults.failed} ❌`, testResults.failed > 0 ? 'error' : 'info');
  
  const successRate = testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(1) : 0;
  log(`Overall Success Rate: ${successRate}%`, successRate >= 80 ? 'success' : 'warning');
  
  // Phase-by-phase breakdown
  log('\n📋 PHASE-BY-PHASE RESULTS:', 'info');
  Object.entries(testResults.phases).forEach(([phase, stats]) => {
    if (stats.total > 0) {
      const phaseSuccessRate = ((stats.passed / stats.total) * 100).toFixed(1);
      const status = phaseSuccessRate >= 80 ? '✅' : phaseSuccessRate >= 60 ? '⚠️' : '❌';
      log(`${status} ${phase}: ${stats.passed}/${stats.total} (${phaseSuccessRate}%)`, 
        phaseSuccessRate >= 80 ? 'success' : phaseSuccessRate >= 60 ? 'warning' : 'error');
    }
  });
  
  if (testResults.failed === 0) {
    log('\n🎉 All integration tests passed! The LUDUS Referral System is ready for production!', 'success');
  } else {
    log(`\n⚠️  ${testResults.failed} tests failed. Please review the errors above before production deployment.`, 'warning');
  }
  
  log('\n' + '='.repeat(70), 'info');
}

module.exports = {
  runAllTests,
  testPhase1CoreReferral,
  testPhase2UserRegistration,
  testPhase3WalletIntegration,
  testPhase4SocialSharing,
  testPhase5InvitationsNotifications,
  testPhase6AnalyticsReporting,
  testPhase7Dashboards,
  testPhase8DeploymentMonitoring,
  testPhase9PerformanceOptimization
};

if (require.main === module) {
  runAllTests().catch(error => {
    log(`❌ Test execution failed: ${error.message}`, 'error');
    process.exit(1);
  });
}
