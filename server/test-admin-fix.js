#!/usr/bin/env node

/**
 * Test Admin Fix Script
 * 
 * This script tests if the admin role fix is working by making API calls
 * to the onboarding admin config endpoint.
 */

const axios = require('axios');

const API_BASE_URL = 'https://ludus-backend-gf1g.onrender.com/api';

// Test credentials (you'll need to replace with actual admin credentials)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ludusapp.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

const testAdminFix = async () => {
  try {
    console.log('🧪 Testing admin role fix...');

    // Step 1: Login as admin
    console.log('📝 Step 1: Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }

    const { accessToken } = loginResponse.data.data;
    console.log('✅ Login successful');

    // Step 2: Test onboarding admin config endpoint
    console.log('📝 Step 2: Testing onboarding admin config endpoint...');
    const configResponse = await axios.get(`${API_BASE_URL}/onboarding/admin/config`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (configResponse.data.success) {
      console.log('✅ Onboarding admin config endpoint working!');
      console.log('📊 Config data:', JSON.stringify(configResponse.data.config, null, 2));
    } else {
      console.log('❌ Onboarding admin config endpoint failed:', configResponse.data.message);
    }

    // Step 3: Test admin dashboard
    console.log('📝 Step 3: Testing admin dashboard...');
    const dashboardResponse = await axios.get(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (dashboardResponse.data.success) {
      console.log('✅ Admin dashboard working!');
      console.log('📊 Dashboard stats:', JSON.stringify(dashboardResponse.data.data, null, 2));
    } else {
      console.log('❌ Admin dashboard failed:', dashboardResponse.data.message);
    }

    console.log('🎉 Admin role fix test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      console.log('🔍 403 Forbidden - The admin role fix may not be working yet');
    } else if (error.response?.status === 401) {
      console.log('🔍 401 Unauthorized - Check admin credentials');
    }
  }
};

// Run the test
if (require.main === module) {
  testAdminFix()
    .then(() => {
      console.log('✅ Test script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test script failed:', error);
      process.exit(1);
    });
}

module.exports = testAdminFix;
