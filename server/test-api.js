const axios = require('axios');
require('dotenv').config();

const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;

class APITester {
  constructor() {
    this.authToken = null;
  }

  async testHealthCheck() {
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Health Check:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Health Check Failed:', error.message);
      return false;
    }
  }

  async testAdminLogin() {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
      
      this.authToken = response.data.data.token;
      console.log('✅ Admin Login Success:', {
        user: response.data.data.user.email,
        role: response.data.data.user.role
      });
      return true;
    } catch (error) {
      console.error('❌ Admin Login Failed:', error.response?.data || error.message);
      return false;
    }
  }

  async testGetActivities() {
    try {
      const response = await axios.get(`${BASE_URL}/api/activities`);
      console.log('✅ Get Activities:', {
        count: response.data.data?.length || 0,
        sample: response.data.data?.[0]?.title || 'No activities'
      });
      return true;
    } catch (error) {
      console.error('❌ Get Activities Failed:', error.response?.data || error.message);
      return false;
    }
  }

  async testGetVendors() {
    try {
      const response = await axios.get(`${BASE_URL}/api/vendors`);
      console.log('✅ Get Vendors:', {
        count: response.data.data?.length || 0,
        sample: response.data.data?.[0]?.businessName || 'No vendors'
      });
      return true;
    } catch (error) {
      console.error('❌ Get Vendors Failed:', error.response?.data || error.message);
      return false;
    }
  }

  async testProtectedEndpoint() {
    if (!this.authToken) {
      console.error('❌ No auth token available for protected endpoint test');
      return false;
    }

    try {
      const response = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      console.log('✅ Protected Endpoint (Auth Me):', {
        user: response.data.data.email,
        role: response.data.data.role
      });
      return true;
    } catch (error) {
      console.error('❌ Protected Endpoint Failed:', error.response?.data || error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🧪 Starting API Tests...\n');
    
    const tests = [
      { name: 'Health Check', fn: () => this.testHealthCheck() },
      { name: 'Admin Login', fn: () => this.testAdminLogin() },
      { name: 'Get Activities', fn: () => this.testGetActivities() },
      { name: 'Get Vendors', fn: () => this.testGetVendors() },
      { name: 'Protected Endpoint', fn: () => this.testProtectedEndpoint() }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      console.log(`\n🔍 Testing: ${test.name}`);
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    }

    console.log('\n📊 Test Results:');
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

    if (failed === 0) {
      console.log('\n🎉 All tests passed! API is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the server logs and database connection.');
    }

    return failed === 0;
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new APITester();
  
  tester.runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = APITester;