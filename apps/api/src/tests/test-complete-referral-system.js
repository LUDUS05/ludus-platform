const axios = require('axios');
require('dotenv').config();

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const USER_TOKEN = process.env.USER_TOKEN;

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function recordTest(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`PASS: ${testName}`, 'success');
  } else {
    testResults.failed++;
    log(`FAIL: ${testName} - ${details}`, 'error');
  }
  testResults.details.push({ name: testName, passed, details });
}

// Test Phase 1: Core Referral System
async function testCoreReferralSystem() {
  log('🧪 Testing Phase 1: Core Referral System');
  
  try {
    // Test referral code generation
    const codeResponse = await axios.post(`${API_BASE_URL}/api/referrals/generate-code`, {}, {
      headers: { Authorization: `Bearer ${USER_TOKEN}` }
    });
    recordTest('Referral Code Generation', codeResponse.status === 200, `Status: ${codeResponse.status}`);
    
    const referralCode = codeResponse.data.data.code;
    
    // Test referral code validation
    const validationResponse = await axios.post(`${API_BASE_URL}/api/referrals/validate-code`, {
      code: referralCode
    });
    recordTest('Referral Code Validation', validationResponse.status === 200, `Status: ${validationResponse.status}`);
    
    // Test referral code retrieval
    const codesResponse = await axios.get(`${API_BASE_URL}/api/referrals/codes`, {
      headers: { Authorization: `Bearer ${USER_TOKEN}` }
    });
    recordTest('Referral Codes Retrieval', codesResponse.status === 200, `Status: ${codesResponse.status}`);
    
    return referralCode;
  } catch (error) {
    recordTest('Core Referral System', false, error.message);
    throw error;
  }
}

// Test Phase 2: User Registration & Referral Processing
async function testReferralRegistration(referralCode) {
  log('🧪 Testing Phase 2: User Registration & Referral Processing');
  
  try {
    // Test user registration with referral code
    const registrationData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      referralCode: referralCode
    };
    
    const registrationResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, registrationData);
    recordTest('User Registration with Referral', registrationResponse.status === 201, `Status: ${registrationResponse.status}`);
    
    // Test referral record creation
    const referralsResponse = await axios.get(`${API_BASE_URL}/api/referrals`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    recordTest('Referral Record Creation', referralsResponse.status === 200, `Status: ${referralsResponse.status}`);
    
    return registrationResponse.data.data.user.id;
  } catch (error) {
    recordTest('Referral Registration', false, error.message);
    throw error;
  }
}

// Test Phase 3: Wallet Integration & Rewards
async function testWalletIntegration(userId, referralCode) {
  log('🧪 Testing Phase 3: Wallet Integration & Rewards');
  
  try {
    // Test wallet creation
    const walletResponse = await axios.get(`${API_BASE_URL}/api/wallet`, {
      headers: { Authorization: `Bearer ${USER_TOKEN}` }
    });
    recordTest('Wallet Retrieval', walletResponse.status === 200, `Status: ${walletResponse.status}`);
    
    // Test referral rewards configuration
    const rewardsResponse = await axios.get(`${API_BASE_URL}/api/admin/referrals/rewards`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    recordTest('Referral Rewards Configuration', rewardsResponse.status === 200, `Status: ${rewardsResponse.status}`);
    
    // Test wallet transaction history
    const transactionsResponse = await axios.get(`${API_BASE_URL}/api/wallet/transactions`, {
      headers: { Authorization: `Bearer ${USER_TOKEN}` }
    });
    recordTest('Wallet Transaction History', transactionsResponse.status === 200, `Status: ${transactionsResponse.status}`);
    
    return true;
  } catch (error) {
    recordTest('Wallet Integration', false, error.message);
    throw error;
  }
}

// Test Phase 4: Social Sharing & QR Codes
async function testSocialSharingAndQR(referralCode) {
  log('🧪 Testing Phase 4: Social Sharing & QR Codes');
  
  try {
    // Test QR code generation
    const qrResponse = await axios.get(`${API_BASE_URL}/api/referrals/${referralCode}/qr-code`, {
      headers: { Authorization: `Bearer ${USER_TOKEN}` }
    });
    recordTest('QR Code Generation', qrResponse.status === 200, `Status: ${qrResponse.status}`);
    
    // Test referral link generation
    const linkResponse = await axios.get(`${API_BASE_URL}/api/referrals/${referralCode}/link`, {
      headers: { Authorization: `Bearer ${USER_TOKEN}` }
    });
    recordTest('Referral Link Generation', linkResponse.status === 200, `Status: ${linkResponse.status}`);
    
    // Test social sharing
    const shareResponse = await axios.post(`${API_BASE_URL}/api/referrals/${referralCode}/share`, {
      platform: 'whatsapp',
      message: 'Check out this amazing platform!'
    }, {
      headers: { Authorization: `Bearer ${USER_TOKEN}` }
    });
    recordTest('Social Sharing', shareResponse.status === 200, `Status: ${shareResponse.status}`);
    
    return true;
  } catch (error) {
    recordTest('Social Sharing & QR Codes', false, error.message);
    throw error;
  }
}

// Test Phase 5: Invitation & Notification System
async function testInvitationAndNotifications(referralCode) {
  log('🧪 Testing Phase 5: Invitation & Notification System');
  
  try {
    // Test invitation creation
    const invitationData = {
      invitationType: 'activity-share',
      platform: 'whatsapp',
      metadata: {
        source: 'test',
        userAgent: 'test-agent'
      }
    };
    
    const invitationResponse = await axios.post(`${API_BASE_URL}/api/invitations`, invitationData, {
      headers: { Authorization: `Bearer ${USER_TOKEN}` }
    });
    recordTest('Invitation Creation', invitationResponse.status === 201, `Status: ${invitationResponse.status}`);
    
    const invitationId = invitationResponse.data.data.id;
    
    // Test invitation click tracking
    const clickResponse = await axios.post(`${API_BASE_URL}/api/invitations/${invitationId}/click`, {
      userAgent: 'test-agent',
      ipAddress: '127.0.0.1'
    });
    recordTest('Invitation Click Tracking', clickResponse.status === 200, `Status: ${clickResponse.status}`);
    
    // Test notifications
    const notificationsResponse = await axios.get(`${API_BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${USER_TOKEN}` }
    });
    recordTest('Notifications Retrieval', notificationsResponse.status === 200, `Status: ${notificationsResponse.status}`);
    
    // Test unread count
    const unreadResponse = await axios.get(`${API_BASE_URL}/api/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${USER_TOKEN}` }
    });
    recordTest('Unread Notifications Count', unreadResponse.status === 200, `Status: ${unreadResponse.status}`);
    
    return invitationId;
  } catch (error) {
    recordTest('Invitation & Notifications', false, error.message);
    throw error;
  }
}

// Test Phase 6: Analytics & Reporting
async function testAnalyticsAndReporting() {
  log('🧪 Testing Phase 6: Analytics & Reporting');
  
  try {
    // Test referral analytics
    const analyticsResponse = await axios.get(`${API_BASE_URL}/api/analytics/referrals`, {
      params: { period: '30d' },
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    recordTest('Referral Analytics', analyticsResponse.status === 200, `Status: ${analyticsResponse.status}`);
    
    // Test funnel analysis
    const funnelResponse = await axios.get(`${API_BASE_URL}/api/analytics/funnel`, {
      params: { period: '30d' },
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    recordTest('Funnel Analysis', analyticsResponse.status === 200, `Status: ${funnelResponse.status}`);
    
    // Test geographic analytics
    const geographicResponse = await axios.get(`${API_BASE_URL}/api/analytics/geographic`, {
      params: { period: '30d' },
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    recordTest('Geographic Analytics', geographicResponse.status === 200, `Status: ${geographicResponse.status}`);
    
    // Test source performance
    const sourceResponse = await axios.get(`${API_BASE_URL}/api/analytics/sources`, {
      params: { period: '30d' },
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    recordTest('Source Performance Analytics', sourceResponse.status === 200, `Status: ${sourceResponse.status}`);
    
    // Test ROI analytics
    const roiResponse = await axios.get(`${API_BASE_URL}/api/analytics/roi`, {
      params: { period: '30d' },
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    recordTest('ROI Analytics', roiResponse.status === 200, `Status: ${roiResponse.status}`);
    
    // Test report templates
    const templatesResponse = await axios.get(`${API_BASE_URL}/api/reports/templates`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    recordTest('Report Templates', templatesResponse.status === 200, `Status: ${templatesResponse.status}`);
    
    // Test report generation
    const reportResponse = await axios.post(`${API_BASE_URL}/api/reports/generate`, {
      reportType: 'comprehensive',
      period: '30d',
      format: 'json'
    }, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    recordTest('Report Generation', reportResponse.status === 200, `Status: ${reportResponse.status}`);
    
    // Test data export
    const exportResponse = await axios.post(`${API_BASE_URL}/api/reports/export`, {
      dataType: 'referrals',
      format: 'csv',
      period: '30d'
    }, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    recordTest('Data Export', exportResponse.status === 200, `Status: ${exportResponse.status}`);
    
    return true;
  } catch (error) {
    recordTest('Analytics & Reporting', false, error.message);
    throw error;
  }
}

// Test Admin Dashboard Features
async function testAdminDashboard() {
  log('🧪 Testing Admin Dashboard Features');
  
  try {
    // Test referral statistics
    const statsResponse = await axios.get(`${API_BASE_URL}/api/admin/referrals/stats`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    recordTest('Referral Statistics', statsResponse.status === 200, `Status: ${statsResponse.status}`);
    
    // Test top inviters leaderboard
    const leaderboardResponse = await axios.get(`${API_BASE_URL}/api/admin/referrals/leaderboard`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    recordTest('Top Inviters Leaderboard', leaderboardResponse.status === 200, `Status: ${leaderboardResponse.status}`);
    
    // Test reward amount updates
    const updateResponse = await axios.put(`${API_BASE_URL}/api/admin/referrals/rewards`, {
      registrationReward: 50,
      bookingReward: 100
    }, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    recordTest('Reward Amount Updates', updateResponse.status === 200, `Status: ${updateResponse.status}`);
    
    return true;
  } catch (error) {
    recordTest('Admin Dashboard', false, error.message);
    throw error;
  }
}

// Test User Dashboard Features
async function testUserDashboard() {
  log('🧪 Testing User Dashboard Features');
  
  try {
    // Test user referral statistics
    const userStatsResponse = await axios.get(`${API_BASE_URL}/api/referrals/stats`, {
      headers: { Authorization: `Bearer ${USER_TOKEN}` }
    });
    recordTest('User Referral Statistics', userStatsResponse.status === 200, `Status: ${userStatsResponse.status}`);
    
    // Test referral history
    const historyResponse = await axios.get(`${API_BASE_URL}/api/referrals/history`, {
      headers: { Authorization: `Bearer ${USER_TOKEN}` }
    });
    recordTest('User Referral History', historyResponse.status === 200, `Status: ${historyResponse.status}`);
    
    // Test earnings summary
    const earningsResponse = await axios.get(`${API_BASE_URL}/api/referrals/earnings`, {
      headers: { Authorization: `Bearer ${USER_TOKEN}` }
    });
    recordTest('User Earnings Summary', earningsResponse.status === 200, `Status: ${earningsResponse.status}`);
    
    return true;
  } catch (error) {
    recordTest('User Dashboard', false, error.message);
    throw error;
  }
}

// Test Error Handling & Edge Cases
async function testErrorHandling() {
  log('🧪 Testing Error Handling & Edge Cases');
  
  try {
    // Test invalid referral code
    try {
      await axios.post(`${API_BASE_URL}/api/referrals/validate-code`, {
        code: 'INVALID_CODE'
      });
      recordTest('Invalid Referral Code Handling', false, 'Should have returned error');
    } catch (error) {
      recordTest('Invalid Referral Code Handling', error.response?.status === 400, `Status: ${error.response?.status}`);
    }
    
    // Test duplicate referral code usage
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, {
        firstName: 'Test',
        lastName: 'User2',
        email: `test2-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        referralCode: 'DUPLICATE_CODE'
      });
      recordTest('Duplicate Referral Code Handling', false, 'Should have returned error');
    } catch (error) {
      recordTest('Duplicate Referral Code Handling', error.response?.status === 400, `Status: ${error.response?.status}`);
    }
    
    // Test unauthorized access
    try {
      await axios.get(`${API_BASE_URL}/api/admin/referrals/stats`);
      recordTest('Unauthorized Access Handling', false, 'Should have returned 401');
    } catch (error) {
      recordTest('Unauthorized Access Handling', error.response?.status === 401, `Status: ${error.response?.status}`);
    }
    
    return true;
  } catch (error) {
    recordTest('Error Handling', false, error.message);
    throw error;
  }
}

// Performance Testing
async function testPerformance() {
  log('🧪 Testing Performance & Load Handling');
  
  try {
    const startTime = Date.now();
    
    // Test multiple concurrent requests
    const promises = Array(10).fill().map(() => 
      axios.get(`${API_BASE_URL}/api/referrals/stats`, {
        headers: { Authorization: `Bearer ${USER_TOKEN}` }
      })
    );
    
    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const allSuccessful = responses.every(response => response.status === 200);
    recordTest('Concurrent Request Handling', allSuccessful, `Response time: ${responseTime}ms`);
    
    // Test response time
    const isAcceptable = responseTime < 5000; // 5 seconds
    recordTest('Response Time Performance', isAcceptable, `Response time: ${responseTime}ms`);
    
    return true;
  } catch (error) {
    recordTest('Performance Testing', false, error.message);
    throw error;
  }
}

// Main test runner
async function runAllTests() {
  log('🚀 Starting Comprehensive Referral System Testing Suite');
  log(`📡 API Base URL: ${API_BASE_URL}`);
  
  try {
    // Check environment
    if (!ADMIN_TOKEN || !USER_TOKEN) {
      throw new Error('Missing required environment variables: ADMIN_TOKEN and USER_TOKEN');
    }
    
    // Run all test phases
    const referralCode = await testCoreReferralSystem();
    const userId = await testReferralRegistration(referralCode);
    await testWalletIntegration(userId, referralCode);
    await testSocialSharingAndQR(referralCode);
    const invitationId = await testInvitationAndNotifications(referralCode);
    await testAnalyticsAndReporting();
    await testAdminDashboard();
    await testUserDashboard();
    await testErrorHandling();
    await testPerformance();
    
    // Generate test report
    generateTestReport();
    
  } catch (error) {
    log(`❌ Test suite failed: ${error.message}`, 'error');
    generateTestReport();
    process.exit(1);
  }
}

// Generate comprehensive test report
function generateTestReport() {
  log('\n📊 TEST RESULTS SUMMARY');
  log('=' * 50);
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
  
  log(`Total Tests: ${testResults.total}`);
  log(`Passed: ${testResults.passed} ✅`);
  log(`Failed: ${testResults.failed} ❌`);
  log(`Success Rate: ${successRate}%`);
  
  if (testResults.failed > 0) {
    log('\n❌ FAILED TESTS:');
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => {
        log(`  - ${test.name}: ${test.details}`);
      });
  }
  
  log('\n✅ PASSED TESTS:');
  testResults.details
    .filter(test => test.passed)
    .forEach(test => {
      log(`  - ${test.name}`);
    });
  
  log('\n' + '=' * 50);
  
  if (testResults.failed === 0) {
    log('🎉 ALL TESTS PASSED! Referral system is working correctly.');
  } else {
    log('⚠️  Some tests failed. Please review the failed tests above.');
  }
}

// Export for use in other test files
module.exports = {
  runAllTests,
  testCoreReferralSystem,
  testReferralRegistration,
  testWalletIntegration,
  testSocialSharingAndQR,
  testInvitationAndNotifications,
  testAnalyticsAndReporting,
  testAdminDashboard,
  testUserDashboard,
  testErrorHandling,
  testPerformance
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    log(`❌ Test suite execution failed: ${error.message}`, 'error');
    process.exit(1);
  });
}
