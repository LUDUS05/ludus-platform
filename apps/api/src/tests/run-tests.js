#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { config, validateConfig } = require('./test-config');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  log(`${colors.bright}${colors.cyan}${message}${colors.reset}`);
  log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
}

function logSection(message) {
  log(`\n${colors.bright}${colors.blue}${message}${colors.reset}`);
  log(`${colors.blue}${'-'.repeat(message.length)}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Test execution functions
async function runTest(testFile, options = {}) {
  return new Promise((resolve, reject) => {
    const testPath = path.join(__dirname, testFile);
    
    if (!fs.existsSync(testPath)) {
      reject(new Error(`Test file not found: ${testPath}`));
      return;
    }

    logInfo(`Running test: ${testFile}`);
    
    const env = {
      ...process.env,
      NODE_ENV: 'test',
      ...options.env
    };

    const child = spawn('node', [testPath], {
      stdio: 'pipe',
      env,
      cwd: process.cwd()
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
      process.stderr.write(data);
    });

    child.on('close', (code) => {
      if (code === 0) {
        logSuccess(`Test completed successfully: ${testFile}`);
        resolve({ success: true, stdout, stderr, code });
      } else {
        logError(`Test failed: ${testFile} (exit code: ${code})`);
        resolve({ success: false, stdout, stderr, code });
      }
    });

    child.on('error', (error) => {
      logError(`Test execution error: ${testFile}`);
      reject(error);
    });

    // Set timeout
    setTimeout(() => {
      child.kill('SIGTERM');
      logWarning(`Test timed out: ${testFile}`);
      resolve({ success: false, stdout, stderr, code: -1, timeout: true });
    }, config.test.timeout);
  });
}

async function runTestSuite(testFiles, options = {}) {
  const results = [];
  
  for (const testFile of testFiles) {
    try {
      const result = await runTest(testFile, options);
      results.push({ file: testFile, ...result });
      
      if (!result.success && !options.continueOnFailure) {
        logError(`Test suite stopped due to failure in: ${testFile}`);
        break;
      }
    } catch (error) {
      logError(`Error running test: ${testFile}`);
      logError(error.message);
      results.push({ file: testFile, success: false, error: error.message });
      
      if (!options.continueOnFailure) {
        break;
      }
    }
  }
  
  return results;
}

// Test file discovery
function discoverTestFiles() {
  const testDir = __dirname;
  const testFiles = [];
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.test.js') || item.endsWith('.spec.js') || 
                 (item.startsWith('test-') && item.endsWith('.js'))) {
        testFiles.push(path.relative(testDir, fullPath));
      }
    }
  }
  
  scanDirectory(testDir);
  return testFiles.sort();
}

// Report generation
function generateTestReport(results, options = {}) {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;
  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0;
  
  logHeader('TEST EXECUTION REPORT');
  
  logSection('Summary');
  log(`Total Tests: ${totalTests}`);
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : successRate >= 60 ? 'yellow' : 'red');
  
  if (failedTests > 0) {
    logSection('Failed Tests');
    results
      .filter(r => !r.success)
      .forEach(result => {
        log(`❌ ${result.file}`, 'red');
        if (result.error) {
          log(`   Error: ${result.error}`, 'red');
        }
        if (result.timeout) {
          log(`   Timeout after ${config.test.timeout}ms`, 'yellow');
        }
      });
  }
  
  logSection('All Test Results');
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const color = result.success ? 'green' : 'red';
    log(`${status} ${result.file}`, color);
  });
  
  // Save report to file if enabled
  if (config.test.generateReports) {
    saveReportToFile(results, options);
  }
  
  return {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    successRate: parseFloat(successRate),
    results
  };
}

function saveReportToFile(results, options) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportDir = path.join(process.cwd(), 'test-reports');
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportFile = path.join(reportDir, `test-report-${timestamp}.json`);
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      successRate: results.length > 0 ? ((results.filter(r => r.success).length / results.length) * 100).toFixed(2) : 0
    },
    results: results.map(r => ({
      file: r.file,
      success: r.success,
      code: r.code,
      timeout: r.timeout || false,
      error: r.error || null,
      stdout: r.stdout || '',
      stderr: r.stderr || ''
    }))
  };
  
  fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
  logInfo(`Test report saved to: ${reportFile}`);
}

// Main execution
async function main() {
  try {
    logHeader('REFERRAL SYSTEM TEST SUITE RUNNER');
    
    // Validate configuration
    logSection('Configuration Validation');
    try {
      validateConfig();
      logSuccess('Configuration validated successfully');
    } catch (error) {
      logError(`Configuration validation failed: ${error.message}`);
      process.exit(1);
    }
    
    // Discover test files
    logSection('Test Discovery');
    const testFiles = discoverTestFiles();
    if (testFiles.length === 0) {
      logWarning('No test files found');
      return;
    }
    
    logInfo(`Found ${testFiles.length} test files:`);
    testFiles.forEach(file => log(`  - ${file}`));
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const options = {
      continueOnFailure: args.includes('--continue-on-failure') || args.includes('-c'),
      parallel: args.includes('--parallel') || args.includes('-p'),
      specificTests: args.filter(arg => !arg.startsWith('--') && !arg.startsWith('-')),
      env: {}
    };
    
    // Filter tests if specific ones are requested
    let testsToRun = testFiles;
    if (options.specificTests.length > 0) {
      testsToRun = testFiles.filter(file => 
        options.specificTests.some(test => file.includes(test))
      );
      logInfo(`Running specific tests: ${testsToRun.join(', ')}`);
    }
    
    // Run tests
    logSection('Test Execution');
    const results = await runTestSuite(testsToRun, options);
    
    // Generate report
    logSection('Report Generation');
    const report = generateTestReport(results, options);
    
    // Final summary
    logHeader('EXECUTION COMPLETE');
    if (report.failed === 0) {
      logSuccess('🎉 All tests passed successfully!');
      process.exit(0);
    } else {
      logError(`⚠️  ${report.failed} test(s) failed`);
      process.exit(1);
    }
    
  } catch (error) {
    logError(`Test runner failed: ${error.message}`);
    process.exit(1);
  }
}

// Command line interface
if (require.main === module) {
  // Show help if requested
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Referral System Test Suite Runner

Usage: node run-tests.js [options] [test-files...]

Options:
  --help, -h              Show this help message
  --continue-on-failure, -c  Continue running tests even if some fail
  --parallel, -p          Run tests in parallel (experimental)
  --timeout <ms>          Set test timeout in milliseconds
  --env <key>=<value>     Set environment variables

Examples:
  node run-tests.js                           # Run all tests
  node run-tests.js test-referral-system.js   # Run specific test
  node run-tests.js --continue-on-failure     # Continue on failure
  node run-tests.js --env NODE_ENV=test       # Set environment variable

Test files are automatically discovered in the tests directory.
Files matching these patterns are considered test files:
  - *.test.js
  - *.spec.js
  - test-*.js
`);
    process.exit(0);
  }
  
  main();
}

module.exports = {
  runTest,
  runTestSuite,
  discoverTestFiles,
  generateTestReport,
  main
};
