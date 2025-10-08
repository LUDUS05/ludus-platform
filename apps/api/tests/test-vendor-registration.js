const axios = require('axios');

const BASE_URL = 'https://ludus-backend-gf1g.onrender.com';

async function testVendorRegistration() {
  console.log('🧪 Testing Vendor Registration...\n');

  try {
    // Test vendor registration with unique email
    const timestamp = Date.now();
    const vendorData = {
      contactName: 'Test User',
      companyName: `Test Company ${timestamp}`,
      email: `test${timestamp}@example.com`,
      phone: '+966501234567',
      website: 'https://test.com',
      description: 'This is a test vendor registration for testing purposes.'
    };

    console.log('📝 Testing with email:', vendorData.email);
    
    const vendorResponse = await axios.post(`${BASE_URL}/api/vendors`, vendorData);
    console.log('✅ Vendor registration successful:', vendorResponse.data.success);
    console.log('📝 Response:', vendorResponse.data.message);
    console.log('📄 Vendor ID:', vendorResponse.data.data?.vendor?.id);
    
  } catch (error) {
    console.log('❌ Vendor registration failed:', error.response?.status);
    console.log('📝 Error:', error.response?.data?.message);
    if (error.response?.data?.error) {
      console.log('🔍 Details:', error.response.data.error);
    }
  }
}

testVendorRegistration();
