const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BASE_URL = process.env.PRODUCTION_URL || `http://localhost:${process.env.PORT || 5000}`;
const TEST_RESULTS_FILE = 'production-api-test-results.json';

class ProductionAPITester {
  constructor() {
    this.authToken = null;
    this.adminToken = null;
    this.testResults = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      baseUrl: BASE_URL,
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      },
      tests: [],
      performance: {
        averageResponseTime: 0,
        slowestEndpoint: null,
        fastestEndpoint: null
      },
      errors: []
    };
  }

  // Utility methods
  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '🔍';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async measureResponseTime(fn) {
    const start = Date.now();
    try {
      const result = await fn();
      const responseTime = Date.now() - start;
      return { success: true, result, responseTime };
    } catch (error) {
      const responseTime = Date.now() - start;
      return { success: false, error, responseTime };
    }
  }

  // Authentication Tests
  async testAuthenticationEndpoints() {
    this.log('Testing Authentication Endpoints...', 'info');
    
    const authTests = [
      {
        name: 'User Registration',
        endpoint: '/api/auth/register',
        method: 'POST',
        data: {
          email: `test-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'User',
          phone: '+966501234567'
        },
        expectedStatus: 201
      },
      {
        name: 'User Login',
        endpoint: '/api/auth/login',
        method: 'POST',
        data: {
          email: process.env.TEST_USER_EMAIL || 'test@example.com',
          password: process.env.TEST_USER_PASSWORD || 'TestPassword123!'
        },
        expectedStatus: 200,
        saveToken: 'authToken'
      },
      {
        name: 'Admin Login',
        endpoint: '/api/auth/login',
        method: 'POST',
        data: {
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD
        },
        expectedStatus: 200,
        saveToken: 'adminToken'
      },
      {
        name: 'Get Current User',
        endpoint: '/api/auth/me',
        method: 'GET',
        requiresAuth: true,
        expectedStatus: 200
      },
      {
        name: 'Refresh Token',
        endpoint: '/api/auth/refresh',
        method: 'POST',
        requiresAuth: true,
        expectedStatus: 200
      },
      {
        name: 'Forgot Password',
        endpoint: '/api/auth/forgot-password',
        method: 'POST',
        data: {
          email: process.env.TEST_USER_EMAIL || 'test@example.com'
        },
        expectedStatus: 200
      }
    ];

    for (const test of authTests) {
      await this.runTest(test);
    }
  }

  // Activity Management Tests
  async testActivityEndpoints() {
    this.log('Testing Activity Endpoints...', 'info');
    
    const activityTests = [
      {
        name: 'Get All Activities',
        endpoint: '/api/activities',
        method: 'GET',
        expectedStatus: 200
      },
      {
        name: 'Get Activities with Pagination',
        endpoint: '/api/activities?page=1&limit=10',
        method: 'GET',
        expectedStatus: 200
      },
      {
        name: 'Get Activities with Filters',
        endpoint: '/api/activities?category=adventure&maxPrice=500',
        method: 'GET',
        expectedStatus: 200
      },
      {
        name: 'Search Activities',
        endpoint: '/api/activities/search?q=adventure',
        method: 'GET',
        expectedStatus: 200
      },
      {
        name: 'Get Single Activity',
        endpoint: '/api/activities/65f1a2b3c4d5e6f7a8b9c0d1', // Sample ID
        method: 'GET',
        expectedStatus: 200
      }
    ];

    for (const test of activityTests) {
      await this.runTest(test);
    }
  }

  // Vendor Management Tests
  async testVendorEndpoints() {
    this.log('Testing Vendor Endpoints...', 'info');
    
    const vendorTests = [
      {
        name: 'Get All Vendors',
        endpoint: '/api/vendors',
        method: 'GET',
        expectedStatus: 200
      },
      {
        name: 'Get Vendors with Pagination',
        endpoint: '/api/vendors?page=1&limit=10',
        method: 'GET',
        expectedStatus: 200
      },
      {
        name: 'Get Single Vendor',
        endpoint: '/api/vendors/65f1a2b3c4d5e6f7a8b9c0d1', // Sample ID
        method: 'GET',
        expectedStatus: 200
      },
      {
        name: 'Get Vendor Activities',
        endpoint: '/api/vendors/65f1a2b3c4d5e6f7a8b9c0d1/activities',
        method: 'GET',
        expectedStatus: 200
      }
    ];

    for (const test of vendorTests) {
      await this.runTest(test);
    }
  }

  // Admin Endpoints Tests
  async testAdminEndpoints() {
    this.log('Testing Admin Endpoints...', 'info');
    
    if (!this.adminToken) {
      this.log('Skipping admin tests - no admin token available', 'warning');
      return;
    }

    const adminTests = [
      {
        name: 'Admin Dashboard Stats',
        endpoint: '/api/admin/dashboard/stats',
        method: 'GET',
        requiresAuth: true,
        requiresAdmin: true,
        expectedStatus: 200
      },
      {
        name: 'Get All Bookings',
        endpoint: '/api/admin/bookings',
        method: 'GET',
        requiresAuth: true,
        requiresAdmin: true,
        expectedStatus: 200
      },
      {
        name: 'Get All Users',
        endpoint: '/api/admin/users',
        method: 'GET',
        requiresAuth: true,
        requiresAdmin: true,
        expectedStatus: 200
      },
      {
        name: 'Create Vendor (Admin)',
        endpoint: '/api/admin/vendors',
        method: 'POST',
        requiresAuth: true,
        requiresAdmin: true,
        data: {
          businessName: `Test Vendor ${Date.now()}`,
          email: `vendor-${Date.now()}@example.com`,
          phone: '+966501234567',
          address: 'Test Address, Riyadh',
          category: 'adventure'
        },
        expectedStatus: 201
      }
    ];

    for (const test of adminTests) {
      await this.runTest(test);
    }
  }

  // Payment System Tests
  async testPaymentEndpoints() {
    this.log('Testing Payment Endpoints...', 'info');
    
    const paymentTests = [
      {
        name: 'Create Payment Intent',
        endpoint: '/api/payments/create',
        method: 'POST',
        requiresAuth: true,
        data: {
          amount: 10000, // 100 SAR in halalas
          currency: 'SAR',
          activityId: '65f1a2b3c4d5e6f7a8b9c0d1',
          bookingId: '65f1a2b3c4d5e6f7a8b9c0d1'
        },
        expectedStatus: 200
      },
      {
        name: 'Confirm Payment',
        endpoint: '/api/payments/confirm',
        method: 'POST',
        requiresAuth: true,
        data: {
          paymentId: 'test-payment-id',
          status: 'completed'
        },
        expectedStatus: 200
      }
    ];

    for (const test of paymentTests) {
      await this.runTest(test);
    }
  }

  // Content Management Tests
  async testContentEndpoints() {
    this.log('Testing Content Management Endpoints...', 'info');
    
    const contentTests = [
      {
        name: 'Get All Pages',
        endpoint: '/api/pages',
        method: 'GET',
        expectedStatus: 200
      },
      {
        name: 'Get Page by Slug',
        endpoint: '/api/pages/about',
        method: 'GET',
        expectedStatus: 200
      },
      {
        name: 'Get Translations',
        endpoint: '/api/translations',
        method: 'GET',
        expectedStatus: 200
      },
      {
        name: 'Get Site Settings',
        endpoint: '/api/site-settings',
        method: 'GET',
        expectedStatus: 200
      }
    ];

    for (const test of contentTests) {
      await this.runTest(test);
    }
  }

  // Performance and Load Tests
  async testPerformance() {
    this.log('Testing API Performance...', 'info');
    
    const performanceTests = [
      {
        name: 'Concurrent Activity Requests',
        endpoint: '/api/activities',
        method: 'GET',
        concurrent: 10,
        expectedStatus: 200
      },
      {
        name: 'Large Data Set Handling',
        endpoint: '/api/activities?limit=100',
        method: 'GET',
        expectedStatus: 200
      }
    ];

    for (const test of performanceTests) {
      await this.runPerformanceTest(test);
    }
  }

  // Individual test execution
  async runTest(testConfig) {
    const testResult = {
      name: testConfig.name,
      endpoint: testConfig.endpoint,
      method: testConfig.method,
      status: 'pending',
      responseTime: 0,
      error: null,
      timestamp: new Date().toISOString()
    };

    try {
      const headers = {};
      if (testConfig.requiresAuth) {
        const token = testConfig.requiresAdmin ? this.adminToken : this.authToken;
        if (!token) {
          testResult.status = 'skipped';
          testResult.error = 'No authentication token available';
          this.testResults.summary.skipped++;
          this.testResults.tests.push(testResult);
          this.log(`⏭️  Skipped: ${testConfig.name} - No auth token`, 'warning');
          return;
        }
        headers.Authorization = `Bearer ${token}`;
      }

      const config = {
        method: testConfig.method,
        url: `${BASE_URL}${testConfig.endpoint}`,
        headers,
        timeout: 10000
      };

      if (testConfig.data) {
        if (testConfig.method === 'GET') {
          config.params = testConfig.data;
        } else {
          config.data = testConfig.data;
        }
      }

      const { success, result, responseTime } = await this.measureResponseTime(() => 
        axios(config)
      );

      testResult.responseTime = responseTime;

      if (success) {
        const response = result;
        
        if (response.status === testConfig.expectedStatus) {
          testResult.status = 'passed';
          this.testResults.summary.passed++;
          
          // Save token if specified
          if (testConfig.saveToken && response.data?.data?.token) {
            this[testConfig.saveToken] = response.data.data.token;
          }
          
          this.log(`✅ Passed: ${testConfig.name} (${responseTime}ms)`, 'success');
        } else {
          testResult.status = 'failed';
          testResult.error = `Expected status ${testConfig.expectedStatus}, got ${response.status}`;
          this.testResults.summary.failed++;
          this.log(`❌ Failed: ${testConfig.name} - Status mismatch`, 'error');
        }
      } else {
        testResult.status = 'failed';
        testResult.error = result.error.message;
        this.testResults.summary.failed++;
        this.log(`❌ Failed: ${testConfig.name} - ${result.error.message}`, 'error');
      }

    } catch (error) {
      testResult.status = 'failed';
      testResult.error = error.message;
      this.testResults.summary.failed++;
      this.log(`❌ Failed: ${testConfig.name} - ${error.message}`, 'error');
    }

    this.testResults.tests.push(testResult);
    this.testResults.summary.total++;
  }

  // Performance test execution
  async runPerformanceTest(testConfig) {
    if (testConfig.concurrent) {
      const promises = [];
      const startTime = Date.now();
      
      for (let i = 0; i < testConfig.concurrent; i++) {
        promises.push(this.runTest(testConfig));
      }
      
      await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      this.log(`🚀 Concurrent test completed: ${testConfig.concurrent} requests in ${totalTime}ms`, 'info');
    } else {
      await this.runTest(testConfig);
    }
  }

  // Calculate performance metrics
  calculatePerformanceMetrics() {
    const responseTimes = this.testResults.tests
      .filter(test => test.status === 'passed')
      .map(test => test.responseTime);

    if (responseTimes.length > 0) {
      this.testResults.performance.averageResponseTime = 
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      this.testResults.performance.slowestEndpoint = Math.max(...responseTimes);
      this.testResults.performance.fastestEndpoint = Math.min(...responseTimes);
    }
  }

  // Save test results
  saveTestResults() {
    try {
      fs.writeFileSync(TEST_RESULTS_FILE, JSON.stringify(this.testResults, null, 2));
      this.log(`📊 Test results saved to ${TEST_RESULTS_FILE}`, 'success');
    } catch (error) {
      this.log(`❌ Failed to save test results: ${error.message}`, 'error');
    }
  }

  // Generate test report
  generateReport() {
    this.calculatePerformanceMetrics();
    
    console.log('\n📊 PRODUCTION API TEST REPORT');
    console.log('=' .repeat(50));
    console.log(`Environment: ${this.testResults.environment}`);
    console.log(`Base URL: ${this.testResults.baseUrl}`);
    console.log(`Timestamp: ${this.testResults.timestamp}`);
    console.log('');
    
    console.log('📈 SUMMARY:');
    console.log(`   Total Tests: ${this.testResults.summary.total}`);
    console.log(`   ✅ Passed: ${this.testResults.summary.passed}`);
    console.log(`   ❌ Failed: ${this.testResults.summary.failed}`);
    console.log(`   ⏭️  Skipped: ${this.testResults.summary.skipped}`);
    console.log(`   📊 Success Rate: ${Math.round((this.testResults.summary.passed / this.testResults.summary.total) * 100)}%`);
    
    console.log('\n🚀 PERFORMANCE:');
    console.log(`   Average Response Time: ${this.testResults.performance.averageResponseTime.toFixed(2)}ms`);
    console.log(`   Fastest Response: ${this.testResults.performance.fastestEndpoint}ms`);
    console.log(`   Slowest Response: ${this.testResults.performance.slowestEndpoint}ms`);
    
    if (this.testResults.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.testResults.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }
    
    console.log('\n' + '=' .repeat(50));
    
    if (this.testResults.summary.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! API is production-ready.');
    } else {
      console.log('⚠️  Some tests failed. Review the results above.');
    }
  }

  // Main test execution
  async runAllTests() {
    this.log('🚀 Starting Production API Testing Suite...', 'info');
    this.log(`Target Environment: ${BASE_URL}`, 'info');
    
    try {
      // Run all test suites
      await this.testAuthenticationEndpoints();
      await this.testActivityEndpoints();
      await this.testVendorEndpoints();
      await this.testAdminEndpoints();
      await this.testPaymentEndpoints();
      await this.testContentEndpoints();
      await this.testPerformance();
      
      // Generate and save report
      this.generateReport();
      this.saveTestResults();
      
      return this.testResults.summary.failed === 0;
      
    } catch (error) {
      this.log(`💥 Test suite execution failed: ${error.message}`, 'error');
      this.testResults.errors.push(error.message);
      return false;
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new ProductionAPITester();
  
  tester.runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Production test runner failed:', error);
      process.exit(1);
    });
}

module.exports = ProductionAPITester;