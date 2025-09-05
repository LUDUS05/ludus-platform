# Referral System Testing Suite

This directory contains comprehensive testing tools and scripts for the LUDUS Referral System.

## 🚀 Quick Start

### 1. Setup Test Environment

```bash
# Copy the environment template
cp env.test.example .env.test

# Edit .env.test with your test configuration
nano .env.test
```

### 2. Run All Tests

```bash
# Run the complete test suite
npm run test:referral

# Run with continue on failure
npm run test:referral:all

# Run specific test
npm run test:referral:system
```

### 3. Run Individual Tests

```bash
# Run specific test files
node src/tests/test-complete-referral-system.js
node src/tests/test-reward-system.js
node src/tests/test-analytics-system.js

# Use the test runner
node src/tests/run-tests.js test-complete-referral-system.js
```

## 📁 Test Files

### Core Test Files

- **`test-complete-referral-system.js`** - Comprehensive testing of all referral system phases
- **`test-reward-system.js`** - Focused testing of the reward distribution system
- **`test-analytics-system.js`** - Testing of analytics and reporting functionality

### Test Infrastructure

- **`run-tests.js`** - Main test runner with reporting and configuration
- **`test-config.js`** - Test configuration and environment management
- **`env.test.example`** - Environment configuration template

## 🧪 Test Phases

### Phase 1: Core Referral System
- ✅ Referral code generation
- ✅ Code validation
- ✅ Code retrieval

### Phase 2: User Registration & Referral Processing
- ✅ User registration with referral codes
- ✅ Referral record creation
- ✅ Referral tracking

### Phase 3: Wallet Integration & Rewards
- ✅ Wallet creation and management
- ✅ Referral reward configuration
- ✅ Transaction history

### Phase 4: Social Sharing & QR Codes
- ✅ QR code generation
- ✅ Referral link generation
- ✅ Social sharing functionality

### Phase 5: Invitation & Notification System
- ✅ Invitation creation and tracking
- ✅ Click tracking
- ✅ Notification system

### Phase 6: Analytics & Reporting
- ✅ Referral analytics
- ✅ Funnel analysis
- ✅ Geographic analytics
- ✅ Source performance
- ✅ ROI calculations
- ✅ Report generation
- ✅ Data export

### Phase 7: Testing & Quality Assurance
- ✅ Unit testing
- ✅ Integration testing
- ✅ Performance testing
- ✅ Error handling
- ✅ Edge case testing

## ⚙️ Configuration

### Environment Variables

Required:
- `ADMIN_TOKEN` - JWT token for admin user
- `USER_TOKEN` - JWT token for regular user
- `API_BASE_URL` - Base URL for the API server

Optional:
- `TEST_DATABASE_URL` - Test database connection string
- `EMAIL_TESTING_ENABLED` - Enable email testing
- `PAYMENT_TESTING_ENABLED` - Enable payment testing

### Test Configuration

The `test-config.js` file contains:
- API settings (timeout, retries)
- Test parameters (timeout, parallel execution)
- Performance testing settings
- Test data templates
- Cleanup preferences

## 📊 Test Execution

### Command Line Options

```bash
# Basic usage
node run-tests.js

# Continue on failure
node run-tests.js --continue-on-failure

# Run specific tests
node run-tests.js test-complete-referral-system.js

# Set environment variables
node run-tests.js --env NODE_ENV=test

# Show help
node run-tests.js --help
```

### Test Discovery

The test runner automatically discovers test files matching these patterns:
- `*.test.js`
- `*.spec.js`
- `test-*.js`

### Parallel Execution

```bash
# Run tests in parallel (experimental)
node run-tests.js --parallel
```

## 📈 Reporting

### Test Reports

Test results are automatically saved to:
- `test-reports/test-report-{timestamp}.json`

### Report Contents

Each report includes:
- Test execution summary
- Pass/fail statistics
- Success rate calculation
- Detailed results for each test
- Error messages and stack traces
- Performance metrics

### Console Output

Real-time output includes:
- ✅ Passed tests
- ❌ Failed tests
- ⚠️ Warnings
- ℹ️ Information
- 🧪 Test progress
- 📊 Final summary

## 🔧 Customization

### Adding New Tests

1. Create a new test file following the naming convention
2. Export test functions
3. Add to the main test suite if needed
4. Update configuration if required

### Test Data

Modify `test-config.js` to:
- Add new test users
- Create test activities
- Define test scenarios
- Set performance thresholds

### Test Configuration

Adjust test behavior in `test-config.js`:
- Timeout values
- Retry settings
- Performance parameters
- Cleanup preferences

## 🚨 Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Ensure `.env.test` is properly configured
   - Check that required tokens are valid

2. **Database Connection Issues**
   - Verify database is running
   - Check connection string format
   - Ensure test database exists

3. **Authentication Failures**
   - Verify JWT tokens are valid
   - Check token expiration
   - Ensure user roles are correct

4. **Test Timeouts**
   - Increase timeout values in configuration
   - Check server performance
   - Verify network connectivity

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug node run-tests.js
```

### Verbose Output

For detailed test execution:
```bash
node run-tests.js --verbose
```

## 📚 Test Examples

### Basic Test Structure

```javascript
async function testFeature() {
  try {
    // Test implementation
    const result = await apiCall();
    
    // Assertions
    if (result.status === 200) {
      recordTest('Feature Test', true);
    } else {
      recordTest('Feature Test', false, `Status: ${result.status}`);
    }
    
    return true;
  } catch (error) {
    recordTest('Feature Test', false, error.message);
    throw error;
  }
}
```

### Test with Configuration

```javascript
const { config } = require('./test-config');

async function testWithConfig() {
  const testUser = config.testData.users[0];
  const referralCode = config.testData.referralCodes[0];
  
  // Use configuration in tests
  // ...
}
```

## 🔄 Continuous Integration

### GitHub Actions

Add to your workflow:
```yaml
- name: Run Referral System Tests
  run: |
    cd server
    npm run test:referral:all
  env:
    ADMIN_TOKEN: ${{ secrets.ADMIN_TOKEN }}
    USER_TOKEN: ${{ secrets.USER_TOKEN }}
    API_BASE_URL: ${{ secrets.API_BASE_URL }}
```

### Pre-commit Hooks

Run tests before commits:
```bash
# Add to package.json scripts
"precommit": "npm run test:referral"
```

## 📞 Support

For testing issues:
1. Check the troubleshooting section
2. Review test configuration
3. Verify environment setup
4. Check server logs
5. Review test reports

## 📝 Contributing

When adding new tests:
1. Follow existing naming conventions
2. Include proper error handling
3. Add configuration options if needed
4. Update documentation
5. Ensure tests are idempotent

## 🎯 Best Practices

1. **Test Isolation**: Each test should be independent
2. **Cleanup**: Clean up test data after tests
3. **Error Handling**: Proper error handling and reporting
4. **Configuration**: Use configuration files for flexibility
5. **Documentation**: Document test purpose and requirements
6. **Performance**: Monitor test execution time
7. **Reliability**: Ensure tests are consistent and reliable
