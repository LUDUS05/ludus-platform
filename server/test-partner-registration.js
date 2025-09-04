const axios = require('axios');

const BASE_URL = 'https://ludus-backend-gf1g.onrender.com';

async function testPartnerRegistration() {
  console.log('🧪 Testing Partner Registration System...\n');

  try {
    // Test 1: Check if partner terms page exists
    console.log('1️⃣ Testing partner terms page...');
    try {
      const termsResponse = await axios.get(`${BASE_URL}/api/pages/by-url/partner-terms-and-conditions`);
      console.log('✅ Partner terms page found:', termsResponse.data.success);
    } catch (error) {
      console.log('❌ Partner terms page not found:', error.response?.status, error.response?.data?.message);
    }

    // Test 2: Test vendor registration endpoint
    console.log('\n2️⃣ Testing vendor registration endpoint...');
    try {
      const vendorData = {
        contactName: 'Test User',
        companyName: 'Test Company',
        email: 'test@example.com',
        phone: '+966501234567',
        website: 'https://test.com',
        description: 'This is a test vendor registration for testing purposes.'
      };

      const vendorResponse = await axios.post(`${BASE_URL}/api/vendors`, vendorData);
      console.log('✅ Vendor registration successful:', vendorResponse.data.success);
      console.log('📝 Response:', vendorResponse.data.message);
    } catch (error) {
      console.log('❌ Vendor registration failed:', error.response?.status);
      console.log('📝 Error:', error.response?.data?.message);
      if (error.response?.data?.error) {
        console.log('🔍 Details:', error.response.data.error);
      }
    }

    // Test 3: Check if partner registration route exists
    console.log('\n3️⃣ Testing partner registration route...');
    try {
      const routeResponse = await axios.get(`${BASE_URL}/partner-registration`);
      console.log('✅ Partner registration route accessible');
    } catch (error) {
      console.log('❌ Partner registration route not accessible:', error.response?.status);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPartnerRegistration();
