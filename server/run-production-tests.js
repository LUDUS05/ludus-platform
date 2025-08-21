#!/usr/bin/env node

const ProductionAPITester = require('./test-production-api');
const config = require('./test-config');
const fs = require('fs');
const path = require('path');

class ProductionTestRunner {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.config = config.environments[this.environment];
    this.results = [];
  }

  async runTests() {
    console.log('🚀 LUDUS Production API Test Runner');
    console.log('=' .repeat(50));
    console.log(`Environment: ${this.environment.toUpperCase()}`);
    console.log(`Base URL: ${this.config.baseUrl}`);
    console.log(`Timeout: ${this.config.timeout}ms`);
    console.log(`Retries: ${this.config.retries}`);
    console.log('');

    // Check if server is running
    if (!(await this.checkServerHealth())) {
      console.error('❌ Server is not responding. Please start the server first.');
      process.exit(1);
    }

    // Run tests based on environment
    switch (this.environment) {
      case 'development':
        await this.runDevelopmentTests();
        break;
      case 'staging':
        await this.runStagingTests();
        break;
      case 'production':
        await this.runProductionTests();
        break;
      default:
        console.error('❌ Unknown environment:', this.environment);
        process.exit(1);
    }

    // Generate comprehensive report
    await this.generateReport();
  }

  async checkServerHealth() {
    try {
      const axios = require('axios');
      const response = await axios.get(`${this.config.baseUrl}/health`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async runDevelopmentTests() {
    console.log('🔧 Running Development Environment Tests...\n');
    
    const tester = new ProductionAPITester();
    tester.config = this.config;
    
    // Run all test suites
    const success = await tester.runAllTests();
    this.results.push({
      environment: 'development',
      timestamp: new Date().toISOString(),
      success,
      results: tester.testResults
    });
  }

  async runStagingTests() {
    console.log('🧪 Running Staging Environment Tests...\n');
    
    const tester = new ProductionAPITester();
    tester.config = this.config;
    
    // Run critical and high priority tests
    await tester.testAuthenticationEndpoints();
    await tester.testActivityEndpoints();
    await tester.testVendorEndpoints();
    await tester.testAdminEndpoints();
    await tester.testPaymentEndpoints();
    
    // Generate report for staging
    tester.generateReport();
    this.results.push({
      environment: 'staging',
      timestamp: new Date().toISOString(),
      success: tester.testResults.summary.failed === 0,
      results: tester.testResults
    });
  }

  async runProductionTests() {
    console.log('🚀 Running Production Environment Tests...\n');
    
    const tester = new ProductionAPITester();
    tester.config = this.config;
    
    // Run all tests with production settings
    const success = await tester.runAllTests();
    this.results.push({
      environment: 'production',
      timestamp: new Date().toISOString(),
      success,
      results: tester.testResults
    });
  }

  async generateReport() {
    console.log('\n📊 COMPREHENSIVE TEST REPORT');
    console.log('=' .repeat(60));

    // Summary across all environments
    const totalTests = this.results.reduce((sum, result) => 
      sum + result.results.summary.total, 0
    );
    const totalPassed = this.results.reduce((sum, result) => 
      sum + result.results.summary.passed, 0
    );
    const totalFailed = this.results.reduce((sum, result) => 
      sum + result.results.summary.failed, 0
    );

    console.log('📈 OVERALL SUMMARY:');
    console.log(`   Total Tests Run: ${totalTests}`);
    console.log(`   ✅ Passed: ${totalPassed}`);
    console.log(`   ❌ Failed: ${totalFailed}`);
    console.log(`   📊 Success Rate: ${Math.round((totalPassed / totalTests) * 100)}%`);
    console.log('');

    // Environment-specific results
    this.results.forEach(result => {
      console.log(`🌍 ${result.environment.toUpperCase()} ENVIRONMENT:`);
      console.log(`   Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`   Tests: ${result.results.summary.passed}/${result.results.summary.total} passed`);
      console.log(`   Performance: ${result.results.performance.averageResponseTime.toFixed(2)}ms avg`);
      console.log('');
    });

    // Performance analysis
    const allResponseTimes = this.results.flatMap(result => 
      result.results.tests
        .filter(test => test.status === 'passed')
        .map(test => test.responseTime)
    );

    if (allResponseTimes.length > 0) {
      const avgResponseTime = allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length;
      const maxResponseTime = Math.max(...allResponseTimes);
      const minResponseTime = Math.min(...allResponseTimes);

      console.log('🚀 PERFORMANCE ANALYSIS:');
      console.log(`   Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`   Fastest Response: ${minResponseTime}ms`);
      console.log(`   Slowest Response: ${maxResponseTime}ms`);
      console.log(`   Performance Grade: ${this.getPerformanceGrade(avgResponseTime)}`);
      console.log('');
    }

    // Recommendations
    console.log('💡 RECOMMENDATIONS:');
    if (totalFailed === 0) {
      console.log('   ✅ All tests passed! API is production-ready.');
    } else {
      console.log('   ⚠️  Some tests failed. Review and fix issues before production deployment.');
    }

    if (this.results.some(r => r.results.performance.averageResponseTime > config.performance.acceptableResponseTime)) {
      console.log('   🐌 Some endpoints are slow. Consider performance optimization.');
    }

    console.log('   📋 Run tests regularly to maintain quality standards.');
    console.log('');

    // Save comprehensive results
    await this.saveComprehensiveResults();
  }

  getPerformanceGrade(avgResponseTime) {
    if (avgResponseTime < 500) return 'A+ (Excellent)';
    if (avgResponseTime < 1000) return 'A (Very Good)';
    if (avgResponseTime < 2000) return 'B (Good)';
    if (avgResponseTime < 3000) return 'C (Acceptable)';
    return 'D (Needs Improvement)';
  }

  async saveComprehensiveResults() {
    const filename = `comprehensive-test-results-${new Date().toISOString().split('T')[0]}.json`;
    const data = {
      summary: {
        totalEnvironments: this.results.length,
        totalTests: this.results.reduce((sum, result) => sum + result.results.summary.total, 0),
        overallSuccess: this.results.every(result => result.success),
        timestamp: new Date().toISOString()
      },
      environments: this.results,
      config: this.config
    };

    try {
      fs.writeFileSync(filename, JSON.stringify(data, null, 2));
      console.log(`📁 Comprehensive results saved to: ${filename}`);
    } catch (error) {
      console.error('❌ Failed to save comprehensive results:', error.message);
    }
  }
}

// CLI argument parsing
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {};

  args.forEach(arg => {
    if (arg.startsWith('--env=')) {
      options.environment = arg.split('=')[1];
    } else if (arg.startsWith('--timeout=')) {
      options.timeout = parseInt(arg.split('=')[1]);
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
  });

  return options;
}

function showHelp() {
  console.log(`
🚀 LUDUS Production API Test Runner

Usage: node run-production-tests.js [options]

Options:
  --env=<environment>    Set test environment (development|staging|production)
  --timeout=<ms>        Set custom timeout in milliseconds
  --help, -h            Show this help message

Examples:
  node run-production-tests.js --env=staging
  node run-production-tests.js --env=production --timeout=30000

Environment Variables:
  NODE_ENV              Default environment (defaults to development)
  ADMIN_EMAIL           Admin email for testing
  ADMIN_PASSWORD        Admin password for testing
  TEST_USER_EMAIL       Test user email
  TEST_USER_PASSWORD    Test user password
  PRODUCTION_URL        Production API URL
  STAGING_URL           Staging API URL
  SKIP_PAYMENT_TESTS    Skip payment-related tests
  SKIP_ADMIN_TESTS      Skip admin-only tests
  SKIP_PERFORMANCE_TESTS Skip performance tests
  DETAILED_LOGGING      Enable detailed logging
`);
}

// Main execution
async function main() {
  try {
    const options = parseArguments();
    
    if (options.environment) {
      process.env.NODE_ENV = options.environment;
    }
    
    if (options.timeout) {
      config.environments[process.env.NODE_ENV || 'development'].timeout = options.timeout;
    }

    const runner = new ProductionTestRunner();
    await runner.runTests();
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ProductionTestRunner;