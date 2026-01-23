const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const REFERRAL_CODE = 'TEST123'; // This should be a valid referral code from your system

// Test data
const testUsers = [];
const testReferrals = [];

// Helper functions
const log = (message, data = null) => {
  console.log(`\n🔍 ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

const logSuccess = (message) => console.log(`✅ ${message}`);
const logError = (message, error) => console.log(`❌ ${message}:`, error?.response?.data || error?.message || error);
const logWarning = (message) => console.log(`⚠️  ${message}`);

// Test 1: Verify Referral Rewards Configuration
async function testReferralRewardsConfig() {
  log('Testing Referral Rewards Configuration...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/referrals/rewards`, {
      headers: { 'Authorization': `Bearer ${process.env.ADMIN_TOKEN}` }
    });
    
    if (response.data.success) {
      const rewards = response.data.data;
      logSuccess('Referral rewards configuration retrieved successfully');
      
      // Verify default rewards exist
      const registrationReward = rewards.find(r => r.rewardType === 'registration');
      const firstBookingReward = rewards.find(r => r.rewardType === 'first-booking');
      
      if (registrationReward && firstBookingReward) {
        logSuccess(`Registration reward: ${registrationReward.amount} ${registrationReward.currency}`);
        logSuccess(`First booking reward: ${firstBookingReward.amount} ${firstBookingReward.currency}`);
      } else {
        logWarning('Default rewards not found - check seeding');
      }
      
      return rewards;
    }
  } catch (error) {
    logError('Failed to retrieve referral rewards configuration', error);
    return null;
  }
}

// Test 2: Test User Registration with Referral Code
async function testReferralRegistration() {
  log('Testing User Registration with Referral Code...');
  
  try {
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: TEST_EMAIL,
      password: 'TestPassword123!',
      referralCode: REFERRAL_CODE
    };
    
    const response = await axios.post(`${BASE_URL}/api/auth/register`, userData);
    
    if (response.data.success) {
      const user = response.data.data.user;
      logSuccess(`User registered successfully with ID: ${user.id}`);
      logSuccess(`Referral processed: ${response.data.data.referralProcessed}`);
      
      testUsers.push({
        id: user.id,
        email: user.email,
        referralCode: userData.referralCode
      });
      
      return user;
    }
  } catch (error) {
    logError('Failed to register user with referral code', error);
    return null;
  }
}

// Test 3: Verify Referral Record Creation
async function testReferralRecordCreation() {
  log('Testing Referral Record Creation...');
  
  if (testUsers.length === 0) {
    logWarning('No test users available for referral verification');
    return null;
  }
  
  const testUser = testUsers[0];
  
  try {
    // Get referral stats for the referrer (you'll need to provide a valid referrer ID)
    const referrerId = process.env.TEST_REFERRER_ID; // Set this in your environment
    
    if (!referrerId) {
      logWarning('TEST_REFERRER_ID not set - skipping referral verification');
      return null;
    }
    
    const response = await axios.get(`${BASE_URL}/api/referrals/stats/${referrerId}`, {
      headers: { 'Authorization': `Bearer ${process.env.TEST_TOKEN}` }
    });
    
    if (response.data.success) {
      const stats = response.data.data;
      logSuccess('Referral statistics retrieved successfully');
      logSuccess(`Total referrals: ${stats.totalReferrals}`);
      logSuccess(`Total earnings: ${stats.totalEarnings}`);
      
      return stats;
    }
  } catch (error) {
    logError('Failed to verify referral record creation', error);
    return null;
  }
}

// Test 4: Test First Booking Reward System
async function testFirstBookingReward() {
  log('Testing First Booking Reward System...');
  
  if (testUsers.length === 0) {
    logWarning('No test users available for booking test');
    return null;
  }
  
  const testUser = testUsers[0];
  
  try {
    // First, create a test activity (if not exists)
    const activityData = {
      title: 'Test Activity for Referral',
      description: 'Test activity to verify first booking rewards',
      price: 100,
      category: 'Test',
      maxParticipants: 10
    };
    
    const activityResponse = await axios.post(`${BASE_URL}/api/activities`, activityData, {
      headers: { 'Authorization': `Bearer ${process.env.ADMIN_TOKEN}` }
    });
    
    let activityId;
    if (activityResponse.data.success) {
      activityId = activityResponse.data.data._id;
      logSuccess(`Test activity created with ID: ${activityId}`);
    } else {
      // Try to find existing test activity
      const activitiesResponse = await axios.get(`${BASE_URL}/api/activities`);
      const testActivity = activitiesResponse.data.data.find(a => a.title.includes('Test'));
      if (testActivity) {
        activityId = testActivity._id;
        logSuccess(`Using existing test activity: ${activityId}`);
      }
    }
    
    if (!activityId) {
      logWarning('No test activity available for booking');
      return null;
    }
    
    // Create a test booking
    const bookingData = {
      activityId: activityId,
      participants: 1,
      totalPrice: 100,
      bookingDate: new Date().toISOString().split('T')[0]
    };
    
    const bookingResponse = await axios.post(`${BASE_URL}/api/bookings`, bookingData, {
      headers: { 'Authorization': `Bearer ${process.env.TEST_TOKEN}` }
    });
    
    if (bookingResponse.data.success) {
      const booking = bookingResponse.data.data;
      logSuccess(`Test booking created successfully with ID: ${booking._id}`);
      
      // Now test the referral booking processing
      const referralResponse = await axios.post(`${BASE_URL}/api/referrals/process-booking`, {
        userId: testUser.id
      }, {
        headers: { 'Authorization': `Bearer ${process.env.TEST_TOKEN}` }
      });
      
      if (referralResponse.data.success) {
        logSuccess('Referral booking processed successfully');
        logSuccess(`Reward amount: ${referralResponse.data.data.rewardAmount}`);
        logSuccess(`Reward type: ${referralResponse.data.data.rewardType}`);
        
        return referralResponse.data.data;
      }
    }
  } catch (error) {
    logError('Failed to test first booking reward system', error);
    return null;
  }
}

// Test 5: Verify Wallet Integration
async function testWalletIntegration() {
  log('Testing Wallet Integration...');
  
  if (testUsers.length === 0) {
    logWarning('No test users available for wallet test');
    return null;
  }
  
  const testUser = testUsers[0];
  
  try {
    // Get wallet balance
    const response = await axios.get(`${BASE_URL}/api/wallet/balance`, {
      headers: { 'Authorization': `Bearer ${process.env.TEST_TOKEN}` }
    });
    
    if (response.data.success) {
      const wallet = response.data.data;
      logSuccess('Wallet balance retrieved successfully');
      logSuccess(`Current balance: ${wallet.balance} ${wallet.currency}`);
      logSuccess(`Total earned: ${wallet.totalEarned} ${wallet.currency}`);
      
      // Check transaction history
      const transactionsResponse = await axios.get(`${BASE_URL}/api/wallet/transactions`, {
        headers: { 'Authorization': `Bearer ${process.env.TEST_TOKEN}` }
      });
      
      if (transactionsResponse.data.success) {
        const transactions = transactionsResponse.data.data;
        logSuccess(`Transaction history retrieved: ${transactions.length} transactions`);
        
        // Look for referral rewards
        const referralTransactions = transactions.filter(t => 
          t.type === 'referral' || t.description.includes('referral')
        );
        
        if (referralTransactions.length > 0) {
          logSuccess(`Found ${referralTransactions.length} referral reward transactions`);
          referralTransactions.forEach(t => {
            logSuccess(`- ${t.description}: ${t.amount} ${t.currency}`);
          });
        } else {
          logWarning('No referral reward transactions found in wallet');
        }
      }
      
      return wallet;
    }
  } catch (error) {
    logError('Failed to test wallet integration', error);
    return null;
  }
}

// Test 6: Test Referral Analytics
async function testReferralAnalytics() {
  log('Testing Referral Analytics...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/referrals/analytics`, {
      headers: { 'Authorization': `Bearer ${process.env.ADMIN_TOKEN}` }
    });
    
    if (response.data.success) {
      const analytics = response.data.data;
      logSuccess('Referral analytics retrieved successfully');
      logSuccess(`Total referrals: ${analytics.totalReferrals}`);
      logSuccess(`Total rewards paid: ${analytics.totalRewardsPaid}`);
      logSuccess(`Conversion rate: ${analytics.conversionRate}%`);
      
      if (analytics.monthlyTrends) {
        logSuccess(`Monthly trends available: ${analytics.monthlyTrends.length} months`);
      }
      
      return analytics;
    }
  } catch (error) {
    logError('Failed to test referral analytics', error);
    return null;
  }
}

// Test 7: Test Top Inviters Leaderboard
async function testTopInvitersLeaderboard() {
  log('Testing Top Inviters Leaderboard...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/referrals/top-inviters`, {
      headers: { 'Authorization': `Bearer ${process.env.ADMIN_TOKEN}` }
    });
    
    if (response.data.success) {
      const topInviters = response.data.data;
      logSuccess('Top inviters leaderboard retrieved successfully');
      logSuccess(`Total top inviters: ${topInviters.length}`);
      
      if (topInviters.length > 0) {
        const topInviter = topInviters[0];
        logSuccess(`Top inviter: ${topInviter.userName} with ${topInviter.totalReferrals} referrals`);
        logSuccess(`Total earnings: ${topInviter.totalEarnings} ${topInviter.currency}`);
      }
      
      return topInviters;
    }
  } catch (error) {
    logError('Failed to test top inviters leaderboard', error);
    return null;
  }
}

// Test 8: Test Reward Amount Updates
async function testRewardAmountUpdates() {
  log('Testing Reward Amount Updates...');
  
  try {
    const currentRewards = await testReferralRewardsConfig();
    if (!currentRewards) return null;
    
    const newRewards = {
      registration: currentRewards.find(r => r.rewardType === 'registration').amount + 10,
      firstBooking: currentRewards.find(r => r.rewardType === 'first-booking').amount + 20
    };
    
    const response = await axios.put(`${BASE_URL}/api/admin/referrals/rewards`, newRewards, {
      headers: { 'Authorization': `Bearer ${process.env.ADMIN_TOKEN}` }
    });
    
    if (response.data.success) {
      logSuccess('Reward amounts updated successfully');
      logSuccess(`New registration reward: ${newRewards.registration} SAR`);
      logSuccess(`New first booking reward: ${newRewards.firstBooking} SAR`);
      
      // Verify the update
      const updatedRewards = await testReferralRewardsConfig();
      if (updatedRewards) {
        const updatedRegistration = updatedRewards.find(r => r.rewardType === 'registration');
        const updatedFirstBooking = updatedRewards.find(r => r.rewardType === 'first-booking');
        
        if (updatedRegistration.amount === newRewards.registration && 
            updatedFirstBooking.amount === newRewards.firstBooking) {
          logSuccess('Reward amounts verified successfully');
        } else {
          logWarning('Reward amounts not updated correctly');
        }
      }
      
      return response.data.data;
    }
  } catch (error) {
    logError('Failed to test reward amount updates', error);
    return null;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Referral System Reward Tests...\n');
  console.log('=' .repeat(60));
  
  const results = {
    rewardsConfig: false,
    referralRegistration: false,
    referralRecord: false,
    firstBookingReward: false,
    walletIntegration: false,
    analytics: false,
    leaderboard: false,
    rewardUpdates: false
  };
  
  try {
    // Test 1: Referral Rewards Configuration
    const rewardsConfig = await testReferralRewardsConfig();
    results.rewardsConfig = !!rewardsConfig;
    
    // Test 2: User Registration with Referral
    const registeredUser = await testReferralRegistration();
    results.referralRegistration = !!registeredUser;
    
    // Test 3: Referral Record Verification
    const referralRecord = await testReferralRecordCreation();
    results.referralRecord = !!referralRecord;
    
    // Test 4: First Booking Reward
    const bookingReward = await testFirstBookingReward();
    results.firstBookingReward = !!bookingReward;
    
    // Test 5: Wallet Integration
    const wallet = await testWalletIntegration();
    results.walletIntegration = !!wallet;
    
    // Test 6: Referral Analytics
    const analytics = await testReferralAnalytics();
    results.analytics = !!analytics;
    
    // Test 7: Top Inviters Leaderboard
    const leaderboard = await testTopInvitersLeaderboard();
    results.leaderboard = !!leaderboard;
    
    // Test 8: Reward Amount Updates
    const rewardUpdates = await testRewardAmountUpdates();
    results.rewardUpdates = !!rewardUpdates;
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
  
  // Test Results Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} - ${testName}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log('\n' + '=' .repeat(60));
  console.log(`🎯 OVERALL SUCCESS RATE: ${successRate}% (${passedTests}/${totalTests})`);
  console.log('=' .repeat(60));
  
  if (successRate >= 80) {
    console.log('🎉 Excellent! The referral reward system is working well!');
  } else if (successRate >= 60) {
    console.log('⚠️  Good progress, but some issues need attention.');
  } else {
    console.log('❌ Several critical issues detected. Review and fix before proceeding.');
  }
  
  return results;
}

// Environment check
function checkEnvironment() {
  console.log('🔍 Checking test environment...\n');
  
  const required = ['ADMIN_TOKEN', 'TEST_TOKEN'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.log('❌ Missing required environment variables:');
    missing.forEach(key => console.log(`   - ${key}`));
    console.log('\nPlease set these variables before running tests.');
    console.log('Example:');
    console.log('export ADMIN_TOKEN="your_admin_jwt_token"');
    console.log('export TEST_TOKEN="your_test_user_jwt_token"');
    console.log('export TEST_REFERRER_ID="valid_referrer_user_id"');
    return false;
  }
  
  console.log('✅ Environment variables configured');
  console.log(`🌐 API Base URL: ${BASE_URL}`);
  return true;
}

// Run tests if this file is executed directly
if (require.main === module) {
  if (checkEnvironment()) {
    runAllTests().catch(console.error);
  }
}

module.exports = {
  runAllTests,
  testReferralRewardsConfig,
  testReferralRegistration,
  testReferralRecordCreation,
  testFirstBookingReward,
  testWalletIntegration,
  testReferralAnalytics,
  testTopInvitersLeaderboard,
  testRewardAmountUpdates
};
