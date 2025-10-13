require('dotenv').config();

const testConfig = {
  // API Configuration
  api: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:5000',
    timeout: 30000, // 30 seconds
    retries: 3
  },

  // Authentication
  auth: {
    adminToken: process.env.ADMIN_TOKEN,
    userToken: process.env.USER_TOKEN,
    testUser: {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'TestPassword123!'
    }
  },

  // Database
  database: {
    testDb: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    cleanupAfterTests: true,
    seedTestData: true
  },

  // Test Settings
  test: {
    parallel: false,
    timeout: 60000, // 1 minute per test
    retryFailed: true,
    maxRetries: 2,
    generateReports: true,
    reportFormat: 'html', // html, json, xml
    screenshots: false
  },

  // Performance Testing
  performance: {
    concurrentUsers: 10,
    rampUpTime: 30, // seconds
    testDuration: 300, // 5 minutes
    acceptableResponseTime: 2000, // 2 seconds
    acceptableErrorRate: 5 // 5%
  },

  // Test Data
  testData: {
    referralCodes: [
      'TEST001',
      'TEST002',
      'TEST003',
      'TEST004',
      'TEST005'
    ],
    users: [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        password: 'TestPassword123!'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
        password: 'TestPassword123!'
      },
      {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@test.com',
        password: 'TestPassword123!'
      }
    ],
    activities: [
      {
        title: 'Test Activity 1',
        description: 'This is a test activity for testing purposes',
        category: 'test',
        price: 100
      },
      {
        title: 'Test Activity 2',
        description: 'Another test activity for testing purposes',
        category: 'test',
        price: 150
      }
    ]
  },

  // Email Testing
  email: {
    enabled: process.env.EMAIL_TESTING_ENABLED === 'true',
    testEmail: process.env.TEST_EMAIL || 'test@example.com',
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }
  },

  // Payment Testing
  payment: {
    enabled: process.env.PAYMENT_TESTING_ENABLED === 'true',
    testMode: true,
    moyasar: {
      apiKey: process.env.MOYASAR_API_KEY,
      testKey: process.env.MOYASAR_TEST_KEY
    }
  },

  // Notification Testing
  notifications: {
    email: true,
    push: false,
    sms: false
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'test.log',
    console: true
  },

  // Cleanup
  cleanup: {
    deleteTestUsers: true,
    deleteTestReferrals: true,
    deleteTestActivities: true,
    resetTestData: true
  }
};

// Validation
function validateConfig() {
  const errors = [];

  if (!testConfig.auth.adminToken) {
    errors.push('ADMIN_TOKEN is required for testing');
  }

  if (!testConfig.auth.userToken) {
    errors.push('USER_TOKEN is required for testing');
  }

  if (!testConfig.database.testDb) {
    errors.push('TEST_DATABASE_URL or DATABASE_URL is required for testing');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }

  return true;
}

// Helper functions
function getTestUser(index = 0) {
  return testConfig.testData.users[index] || testConfig.testData.users[0];
}

function getReferralCode(index = 0) {
  return testConfig.testData.referralCodes[index] || testConfig.testData.referralCodes[0];
}

function getActivity(index = 0) {
  return testConfig.testData.activities[index] || testConfig.testData.activities[0];
}

function generateTestEmail() {
  return `test-${Date.now()}@example.com`;
}

function generateTestPhone() {
  return `+9665${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
}

// Export
module.exports = {
  config: testConfig,
  validateConfig,
  getTestUser,
  getReferralCode,
  getActivity,
  generateTestEmail,
  generateTestPhone
};
