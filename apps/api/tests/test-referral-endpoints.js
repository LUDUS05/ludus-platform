/**
 * Test script to verify referral endpoints are working
 * Run this after backend redeployment to check referral system
 */

const axios = require('axios');

const BASE_URL = 'https://ludus-backend-gf1g.onrender.com';

async function testReferralEndpoints() {
  console.log('🧪 Testing Referral System Endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log(`✅ Health: ${healthResponse.data.version}`);
    
    // Test 2: Referral stats endpoint (should return auth error, not 500)
    console.log('\n2️⃣ Testing referral stats endpoint...');
    try {
      await axios.get(`${BASE_URL}/api/referrals/stats/test-user`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Referral stats: Properly protected (401 Unauthorized)');
      } else if (error.response?.status === 500) {
        console.log('❌ Referral stats: Still returning 500 error');
      } else {
        console.log(`⚠️ Referral stats: Unexpected status ${error.response?.status}`);
      }
    }

    // Test 3: Generate referral code endpoint (should return auth error, not 500)
    console.log('\n3️⃣ Testing generate referral code endpoint...');
    try {
      await axios.post(`${BASE_URL}/api/referrals/generate-code`, {
        userId: 'test-user'
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Generate code: Properly protected (401 Unauthorized)');
      } else if (error.response?.status === 500) {
        console.log('❌ Generate code: Still returning 500 error');
      } else {
        console.log(`⚠️ Generate code: Unexpected status ${error.response?.status}`);
      }
    }

    // Test 4: Check if referral routes are loaded
    console.log('\n4️⃣ Testing referral routes availability...');
    try {
      const routesResponse = await axios.get(`${BASE_URL}/api/referrals`);
      console.log('✅ Referral routes are accessible');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️ Referral routes not found (404)');
      } else {
        console.log(`⚠️ Referral routes: ${error.response?.status || 'Unknown error'}`);
      }
    }

    console.log('\n🎉 Referral system endpoint testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests if called directly
if (require.main === module) {
  testReferralEndpoints()
    .then(() => {
      console.log('\n🚀 All tests finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Tests failed:', error);
      process.exit(1);
    });
}

module.exports = testReferralEndpoints;
