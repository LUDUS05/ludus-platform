module.exports = {
  // Test Environment Configuration
  environments: {
    development: {
      baseUrl: 'http://localhost:5000',
      timeout: 10000,
      retries: 1
    },
    staging: {
      baseUrl: process.env.STAGING_URL || 'https://staging.ludus.com',
      timeout: 15000,
      retries: 2
    },
    production: {
      baseUrl: process.env.PRODUCTION_URL || 'https://api.ludus.com',
      timeout: 20000,
      retries: 3
    }
  },

  // Test Data Configuration
  testData: {
    users: {
      admin: {
        email: process.env.ADMIN_EMAIL || 'admin@ludus.com',
        password: process.env.ADMIN_PASSWORD || 'AdminPass123!'
      },
      regular: {
        email: process.env.TEST_USER_EMAIL || 'test@ludus.com',
        password: process.env.TEST_USER_PASSWORD || 'TestPass123!'
      }
    },
    activities: {
      sampleIds: [
        '65f1a2b3c4d5e6f7a8b9c0d1',
        '65f1a2b3c4d5e6f7a8b9c0d2',
        '65f1a2b3c4d5e6f7a8b9c0d3'
      ]
    },
    vendors: {
      sampleIds: [
        '65f1a2b3c4d5e6f7a8b9c0d4',
        '65f1a2b3c4d5e6f7a8b9c0d5',
        '65f1a2b3c4d5e6f7a8b9c0d6'
      ]
    }
  },

  // Performance Test Configuration
  performance: {
    concurrentRequests: 10,
    largeDataSetLimit: 100,
    acceptableResponseTime: 2000, // 2 seconds
    acceptableConcurrentTime: 5000 // 5 seconds for 10 concurrent requests
  },

  // Test Categories and Priorities
  testCategories: {
    critical: ['auth', 'activities', 'payments'],
    high: ['vendors', 'admin', 'bookings'],
    medium: ['content', 'translations', 'ratings'],
    low: ['uploads', 'wallet', 'site-settings']
  },

  // Skip Conditions
  skipConditions: {
    skipPaymentTests: process.env.SKIP_PAYMENT_TESTS === 'true',
    skipAdminTests: process.env.SKIP_ADMIN_TESTS === 'true',
    skipPerformanceTests: process.env.SKIP_PERFORMANCE_TESTS === 'true'
  },

  // Expected Response Patterns
  expectedResponses: {
    success: {
      status: 'success',
      message: 'string',
      data: 'object'
    },
    error: {
      status: 'error',
      message: 'string',
      error: 'string'
    }
  },

  // API Rate Limiting
  rateLimiting: {
    requestsPerMinute: 60,
    burstLimit: 10,
    retryAfter: 60
  },

  // Test Timeouts
  timeouts: {
    individualTest: 10000,
    testSuite: 300000, // 5 minutes
    performanceTest: 60000 // 1 minute
  },

  // Output Configuration
  output: {
    saveResults: true,
    resultsFile: 'production-api-test-results.json',
    detailedLogging: process.env.DETAILED_LOGGING === 'true',
    exportFormat: 'json' // json, csv, html
  }
};