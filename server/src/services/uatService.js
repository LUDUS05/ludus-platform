const { performanceMonitor } = require('../middleware/performance');
const { CacheService } = require('./cache');
const { queryOptimizer } = require('./queryOptimizer');

class UATService {
  constructor() {
    this.testResults = new Map();
    this.testScenarios = this.defineTestScenarios();
    this.acceptanceCriteria = this.defineAcceptanceCriteria();
    this.cacheService = new CacheService();
    this.currentTestRun = null;
  }

  // Define comprehensive UAT scenarios
  defineTestScenarios() {
    return {
      // Core User Journeys
      userRegistration: {
        name: 'User Registration Flow',
        description: 'Complete user registration process from start to finish',
        priority: 'critical',
        steps: [
          'Navigate to registration page',
          'Fill registration form with valid data',
          'Submit registration form',
          'Verify email verification sent',
          'Complete email verification',
          'Verify user can log in',
          'Verify user profile creation'
        ],
        expectedOutcome: 'User successfully registered and verified',
        successCriteria: ['Registration form submission', 'Email verification', 'Profile creation', 'Login access']
      },

      userLogin: {
        name: 'User Login Flow',
        description: 'User authentication and login process',
        priority: 'critical',
        steps: [
          'Navigate to login page',
          'Enter valid credentials',
          'Submit login form',
          'Verify successful authentication',
          'Verify JWT token generation',
          'Verify user session creation',
          'Verify redirect to dashboard'
        ],
        expectedOutcome: 'User successfully authenticated and logged in',
        successCriteria: ['Authentication success', 'Token generation', 'Session creation', 'Dashboard access']
      },

      activityBrowsing: {
        name: 'Activity Browsing Experience',
        description: 'Users browsing and discovering activities',
        priority: 'high',
        steps: [
          'Browse activity listings',
          'Apply filters and search',
          'View activity details',
          'Check activity availability',
          'View activity images and descriptions',
          'Read reviews and ratings',
          'Navigate between activities'
        ],
        expectedOutcome: 'Smooth activity discovery and browsing experience',
        successCriteria: ['Fast loading times', 'Accurate search results', 'Complete activity information', 'Responsive navigation']
      },

      activityBooking: {
        name: 'Activity Booking Process',
        description: 'Complete booking workflow from selection to confirmation',
        priority: 'critical',
        steps: [
          'Select activity for booking',
          'Choose date and time',
          'Select number of participants',
          'Review booking details',
          'Proceed to payment',
          'Complete payment process',
          'Receive booking confirmation',
          'Verify booking in user dashboard'
        ],
        expectedOutcome: 'Successful activity booking with payment confirmation',
        successCriteria: ['Date/time selection', 'Participant count', 'Payment processing', 'Confirmation generation', 'Dashboard update']
      },

      paymentProcessing: {
        name: 'Payment System Integration',
        description: 'Moyasar payment gateway integration and processing',
        priority: 'critical',
        steps: [
          'Initiate payment process',
          'Select payment method',
          'Enter payment details',
          'Process payment through Moyasar',
          'Verify payment success',
          'Generate payment receipt',
          'Update booking status',
          'Send confirmation email'
        ],
        expectedOutcome: 'Successful payment processing with confirmation',
        successCriteria: ['Payment initiation', 'Gateway integration', 'Success confirmation', 'Receipt generation', 'Status update']
      },

      vendorManagement: {
        name: 'Vendor Management System',
        description: 'Vendor registration, profile management, and activity creation',
        priority: 'high',
        steps: [
          'Vendor registration process',
          'Business verification',
          'Profile management',
          'Activity creation interface',
          'Activity editing capabilities',
          'Revenue tracking',
          'Analytics dashboard'
        ],
        expectedOutcome: 'Comprehensive vendor management capabilities',
        successCriteria: ['Registration workflow', 'Profile management', 'Activity creation', 'Revenue tracking', 'Analytics access']
      },

      adminPanel: {
        name: 'Admin Panel Functionality',
        description: 'Administrative tools and platform management',
        priority: 'high',
        steps: [
          'Admin authentication',
          'User management',
          'Activity moderation',
          'Vendor verification',
          'Content management',
          'System monitoring',
          'Performance analytics'
        ],
        expectedOutcome: 'Full administrative control and oversight',
        successCriteria: ['Admin access', 'User management', 'Content moderation', 'System monitoring', 'Analytics access']
      },

      contentManagement: {
        name: 'Content Management System',
        description: 'CMS functionality for content creation and management',
        priority: 'high',
        steps: [
          'Page creation interface',
          'Rich content editing',
          'Multilingual support',
          'SEO optimization',
          'Content publishing',
          'Version control',
          'Live preview'
        ],
        expectedOutcome: 'Professional content management capabilities',
        successCriteria: ['Content creation', 'Multilingual support', 'SEO features', 'Publishing workflow', 'Version control']
      },

      mobileExperience: {
        name: 'Mobile Responsiveness',
        description: 'Platform functionality on mobile devices',
        priority: 'high',
        steps: [
          'Mobile navigation',
          'Touch interactions',
          'Responsive layouts',
          'Mobile forms',
          'Image optimization',
          'Performance on mobile',
          'Cross-device consistency'
        ],
        expectedOutcome: 'Excellent mobile user experience',
        successCriteria: ['Responsive design', 'Touch optimization', 'Fast loading', 'Consistent experience', 'Cross-device compatibility']
      },

      internationalization: {
        name: 'Internationalization Support',
        description: 'English and Arabic language support with RTL layout',
        priority: 'medium',
        steps: [
          'Language switching',
          'RTL layout support',
          'Arabic content display',
          'Currency localization',
          'Date formatting',
          'Cultural adaptations',
          'Translation accuracy'
        ],
        expectedOutcome: 'Full bilingual support with cultural adaptations',
        successCriteria: ['Language switching', 'RTL support', 'Arabic content', 'Localization', 'Cultural accuracy']
      },

      performanceOptimization: {
        name: 'Performance and Optimization',
        description: 'Platform performance and optimization features',
        priority: 'medium',
        steps: [
          'Response time testing',
          'Caching effectiveness',
          'Database performance',
          'Image optimization',
          'Load testing',
          'Performance monitoring',
          'Optimization recommendations'
        ],
        expectedOutcome: 'High-performance platform with optimization features',
        successCriteria: ['Fast response times', 'Effective caching', 'Database optimization', 'Image optimization', 'Performance monitoring']
      }
    };
  }

  // Define acceptance criteria for each scenario
  defineAcceptanceCriteria() {
    return {
      userRegistration: {
        performance: { maxResponseTime: 2000, maxPageLoadTime: 3000 },
        functionality: { successRate: 100, errorRate: 0 },
        userExperience: { easeOfUse: 5, clarity: 5, feedback: 5 },
        security: { dataValidation: true, emailVerification: true, passwordStrength: true }
      },

      userLogin: {
        performance: { maxResponseTime: 1500, maxPageLoadTime: 2000 },
        functionality: { successRate: 100, errorRate: 0 },
        userExperience: { easeOfUse: 5, clarity: 5, feedback: 5 },
        security: { authentication: true, sessionManagement: true, tokenSecurity: true }
      },

      activityBrowsing: {
        performance: { maxResponseTime: 1000, maxPageLoadTime: 2000 },
        functionality: { successRate: 95, errorRate: 5 },
        userExperience: { easeOfUse: 4, clarity: 5, feedback: 4 },
        security: { dataIntegrity: true, accessControl: true }
      },

      activityBooking: {
        performance: { maxResponseTime: 3000, maxPageLoadTime: 5000 },
        functionality: { successRate: 95, errorRate: 5 },
        userExperience: { easeOfUse: 4, clarity: 5, feedback: 5 },
        security: { paymentSecurity: true, dataValidation: true, confirmation: true }
      },

      paymentProcessing: {
        performance: { maxResponseTime: 5000, maxPageLoadTime: 8000 },
        functionality: { successRate: 98, errorRate: 2 },
        userExperience: { easeOfUse: 4, clarity: 5, feedback: 5 },
        security: { gatewaySecurity: true, encryption: true, fraudProtection: true }
      },

      vendorManagement: {
        performance: { maxResponseTime: 2000, maxPageLoadTime: 3000 },
        functionality: { successRate: 95, errorRate: 5 },
        userExperience: { easeOfUse: 4, clarity: 5, feedback: 4 },
        security: { businessVerification: true, dataProtection: true, accessControl: true }
      },

      adminPanel: {
        performance: { maxResponseTime: 1500, maxPageLoadTime: 2500 },
        functionality: { successRate: 100, errorRate: 0 },
        userExperience: { easeOfUse: 4, clarity: 5, feedback: 4 },
        security: { adminAccess: true, auditLogging: true, dataProtection: true }
      },

      contentManagement: {
        performance: { maxResponseTime: 2000, maxPageLoadTime: 4000 },
        functionality: { successRate: 95, errorRate: 5 },
        userExperience: { easeOfUse: 4, clarity: 5, feedback: 4 },
        security: { contentValidation: true, accessControl: true, versionControl: true }
      },

      mobileExperience: {
        performance: { maxResponseTime: 1500, maxPageLoadTime: 3000 },
        functionality: { successRate: 95, errorRate: 5 },
        userExperience: { easeOfUse: 5, clarity: 5, feedback: 4 },
        security: { mobileSecurity: true, dataProtection: true }
      },

      internationalization: {
        performance: { maxResponseTime: 1000, maxPageLoadTime: 2000 },
        functionality: { successRate: 95, errorRate: 5 },
        userExperience: { easeOfUse: 5, clarity: 5, feedback: 5 },
        security: { culturalAccuracy: true, dataIntegrity: true }
      },

      performanceOptimization: {
        performance: { maxResponseTime: 800, maxPageLoadTime: 1500 },
        functionality: { successRate: 98, errorRate: 2 },
        userExperience: { easeOfUse: 5, clarity: 5, feedback: 5 },
        security: { monitoring: true, optimization: true, security: true }
      }
    };
  }

  // Start a new UAT test run
  async startTestRun(testRunId = null) {
    const runId = testRunId || `uat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentTestRun = {
      id: runId,
      startTime: new Date(),
      status: 'running',
      results: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        performance: {},
        userExperience: {},
        security: {},
        functionality: {}
      }
    };

    console.log(`🚀 Starting UAT Test Run: ${runId}`);
    return this.currentTestRun;
  }

  // Execute a specific test scenario
  async executeTestScenario(scenarioKey, testData = {}) {
    if (!this.currentTestRun) {
      throw new Error('No active test run. Call startTestRun() first.');
    }

    const scenario = this.testScenarios[scenarioKey];
    if (!scenario) {
      throw new Error(`Unknown test scenario: ${scenarioKey}`);
    }

    const testResult = {
      scenarioKey,
      scenarioName: scenario.name,
      startTime: new Date(),
      status: 'running',
      steps: [],
      performance: {},
      userExperience: {},
      security: {},
      functionality: {},
      errors: [],
      warnings: [],
      recommendations: []
    };

    console.log(`🧪 Executing UAT Scenario: ${scenario.name}`);

    try {
      // Execute scenario steps
      for (let i = 0; i < scenario.steps.length; i++) {
        const step = scenario.steps[i];
        const stepResult = await this.executeTestStep(scenarioKey, step, i, testData);
        testResult.steps.push(stepResult);
        
        if (stepResult.status === 'failed') {
          testResult.status = 'failed';
          break;
        }
      }

      // Evaluate acceptance criteria
      const criteria = this.acceptanceCriteria[scenarioKey];
      if (criteria) {
        testResult.performance = this.evaluatePerformanceCriteria(testResult, criteria.performance);
        testResult.userExperience = this.evaluateUserExperienceCriteria(testResult, criteria.userExperience);
        testResult.security = this.evaluateSecurityCriteria(testResult, criteria.security);
        testResult.functionality = this.evaluateFunctionalityCriteria(testResult, criteria.functionality);
      }

      // Determine overall test status
      testResult.status = this.determineTestStatus(testResult);
      testResult.endTime = new Date();
      testResult.duration = testResult.endTime - testResult.startTime;

      // Store test result
      this.currentTestRun.results[scenarioKey] = testResult;
      this.updateTestRunSummary(testResult);

      console.log(`✅ UAT Scenario Completed: ${scenario.name} - ${testResult.status.toUpperCase()}`);
      return testResult;

    } catch (error) {
      testResult.status = 'failed';
      testResult.errors.push({
        step: 'execution',
        error: error.message,
        timestamp: new Date()
      });
      testResult.endTime = new Date();
      testResult.duration = testResult.endTime - testResult.startTime;

      this.currentTestRun.results[scenarioKey] = testResult;
      this.updateTestRunSummary(testResult);

      console.error(`❌ UAT Scenario Failed: ${scenario.name}`, error);
      return testResult;
    }
  }

  // Execute individual test step
  async executeTestStep(scenarioKey, step, stepIndex, testData) {
    const stepResult = {
      step: step,
      stepIndex: stepIndex,
      startTime: new Date(),
      status: 'running',
      details: {},
      errors: [],
      warnings: [],
      performance: {}
    };

    try {
      // Simulate step execution (in real UAT, this would involve actual user interactions)
      const stepExecution = await this.simulateStepExecution(scenarioKey, step, testData);
      
      stepResult.details = stepExecution.details;
      stepResult.performance = stepExecution.performance;
      stepResult.status = stepExecution.success ? 'passed' : 'failed';
      
      if (stepExecution.errors) {
        stepResult.errors = stepExecution.errors;
      }
      
      if (stepExecution.warnings) {
        stepResult.warnings = stepExecution.warnings;
      }

    } catch (error) {
      stepResult.status = 'failed';
      stepResult.errors.push({
        error: error.message,
        timestamp: new Date()
      });
    }

    stepResult.endTime = new Date();
    stepResult.duration = stepResult.endTime - stepResult.startTime;
    
    return stepResult;
  }

  // Simulate step execution (placeholder for actual UAT implementation)
  async simulateStepExecution(scenarioKey, step, testData) {
    // This is a simulation - in real UAT, this would involve:
    // - Browser automation (Selenium, Playwright, etc.)
    // - API testing
    // - User interaction simulation
    // - Performance measurement
    
    const startTime = Date.now();
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 100));
    
    const executionTime = Date.now() - startTime;
    
    // Simulate success/failure based on step complexity
    const success = Math.random() > 0.1; // 90% success rate for simulation
    
    return {
      success,
      details: {
        simulated: true,
        step: step,
        executionTime: executionTime,
        testData: testData
      },
      performance: {
        responseTime: executionTime,
        success: success
      },
      errors: success ? [] : [`Simulated failure for step: ${step}`],
      warnings: []
    };
  }

  // Evaluate performance criteria
  evaluatePerformanceCriteria(testResult, criteria) {
    const evaluation = {
      passed: true,
      score: 0,
      details: {},
      recommendations: []
    };

    let totalScore = 0;
    let criteriaCount = 0;

    // Check response time criteria
    if (criteria.maxResponseTime) {
      criteriaCount++;
      const avgResponseTime = this.calculateAverageResponseTime(testResult);
      const passed = avgResponseTime <= criteria.maxResponseTime;
      
      evaluation.details.responseTime = {
        expected: criteria.maxResponseTime,
        actual: avgResponseTime,
        passed: passed
      };
      
      if (passed) {
        totalScore += 1;
      } else {
        evaluation.passed = false;
        evaluation.recommendations.push(`Response time ${avgResponseTime}ms exceeds limit of ${criteria.maxResponseTime}ms`);
      }
    }

    // Check page load time criteria
    if (criteria.maxPageLoadTime) {
      criteriaCount++;
      const avgPageLoadTime = this.calculateAveragePageLoadTime(testResult);
      const passed = avgPageLoadTime <= criteria.maxPageLoadTime;
      
      evaluation.details.pageLoadTime = {
        expected: criteria.maxPageLoadTime,
        actual: avgPageLoadTime,
        passed: passed
      };
      
      if (passed) {
        totalScore += 1;
      } else {
        evaluation.passed = false;
        evaluation.recommendations.push(`Page load time ${avgPageLoadTime}ms exceeds limit of ${criteria.maxPageLoadTime}ms`);
      }
    }

    evaluation.score = criteriaCount > 0 ? (totalScore / criteriaCount) * 100 : 100;
    return evaluation;
  }

  // Evaluate user experience criteria
  evaluateUserExperienceCriteria(testResult, criteria) {
    const evaluation = {
      passed: true,
      score: 0,
      details: {},
      recommendations: []
    };

    let totalScore = 0;
    let criteriaCount = 0;

    // Check ease of use
    if (criteria.easeOfUse) {
      criteriaCount++;
      const easeOfUseScore = this.calculateEaseOfUseScore(testResult);
      const passed = easeOfUseScore >= criteria.easeOfUse;
      
      evaluation.details.easeOfUse = {
        expected: criteria.easeOfUse,
        actual: easeOfUseScore,
        passed: passed
      };
      
      if (passed) {
        totalScore += easeOfUseScore;
      } else {
        evaluation.passed = false;
        evaluation.recommendations.push(`Ease of use score ${easeOfUseScore} below threshold ${criteria.easeOfUse}`);
      }
    }

    // Check clarity
    if (criteria.clarity) {
      criteriaCount++;
      const clarityScore = this.calculateClarityScore(testResult);
      const passed = clarityScore >= criteria.clarity;
      
      evaluation.details.clarity = {
        expected: criteria.clarity,
        actual: clarityScore,
        passed: passed
      };
      
      if (passed) {
        totalScore += clarityScore;
      } else {
        evaluation.passed = false;
        evaluation.recommendations.push(`Clarity score ${clarityScore} below threshold ${criteria.clarity}`);
      }
    }

    // Check feedback
    if (criteria.feedback) {
      criteriaCount++;
      const feedbackScore = this.calculateFeedbackScore(testResult);
      const passed = feedbackScore >= criteria.feedback;
      
      evaluation.details.feedback = {
        expected: criteria.feedback,
        actual: feedbackScore,
        passed: passed
      };
      
      if (passed) {
        totalScore += feedbackScore;
      } else {
        evaluation.passed = false;
        evaluation.recommendations.push(`Feedback score ${feedbackScore} below threshold ${criteria.feedback}`);
      }
    }

    evaluation.score = criteriaCount > 0 ? (totalScore / criteriaCount) : 0;
    return evaluation;
  }

  // Evaluate security criteria
  evaluateSecurityCriteria(testResult, criteria) {
    const evaluation = {
      passed: true,
      score: 0,
      details: {},
      recommendations: []
    };

    let totalScore = 0;
    let criteriaCount = 0;

    // Check each security criterion
    Object.entries(criteria).forEach(([criterion, expected]) => {
      if (typeof expected === 'boolean') {
        criteriaCount++;
        const actual = this.checkSecurityCriterion(testResult, criterion);
        const passed = actual === expected;
        
        evaluation.details[criterion] = {
          expected: expected,
          actual: actual,
          passed: passed
        };
        
        if (passed) {
          totalScore += 1;
        } else {
          evaluation.passed = false;
          evaluation.recommendations.push(`Security criterion '${criterion}' failed: expected ${expected}, got ${actual}`);
        }
      }
    });

    evaluation.score = criteriaCount > 0 ? (totalScore / criteriaCount) * 100 : 100;
    return evaluation;
  }

  // Evaluate functionality criteria
  evaluateFunctionalityCriteria(testResult, criteria) {
    const evaluation = {
      passed: true,
      score: 0,
      details: {},
      recommendations: []
    };

    let totalScore = 0;
    let criteriaCount = 0;

    // Check success rate
    if (criteria.successRate) {
      criteriaCount++;
      const actualSuccessRate = this.calculateSuccessRate(testResult);
      const passed = actualSuccessRate >= criteria.successRate;
      
      evaluation.details.successRate = {
        expected: criteria.successRate,
        actual: actualSuccessRate,
        passed: passed
      };
      
      if (passed) {
        totalScore += 1;
      } else {
        evaluation.passed = false;
        evaluation.recommendations.push(`Success rate ${actualSuccessRate}% below threshold ${criteria.successRate}%`);
      }
    }

    // Check error rate
    if (criteria.errorRate) {
      criteriaCount++;
      const actualErrorRate = this.calculateErrorRate(testResult);
      const passed = actualErrorRate <= criteria.errorRate;
      
      evaluation.details.errorRate = {
        expected: criteria.errorRate,
        actual: actualErrorRate,
        passed: passed
      };
      
      if (passed) {
        totalScore += 1;
      } else {
        evaluation.passed = false;
        evaluation.recommendations.push(`Error rate ${actualErrorRate}% above threshold ${criteria.errorRate}%`);
      }
    }

    evaluation.score = criteriaCount > 0 ? (totalScore / criteriaCount) * 100 : 100;
    return evaluation;
  }

  // Helper methods for calculations
  calculateAverageResponseTime(testResult) {
    const responseTimes = testResult.steps
      .filter(step => step.performance && step.performance.responseTime)
      .map(step => step.performance.responseTime);
    
    if (responseTimes.length === 0) return 0;
    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }

  calculateAveragePageLoadTime(testResult) {
    // This would be calculated from actual page load measurements
    return Math.random() * 2000 + 500; // Simulated value
  }

  calculateEaseOfUseScore(testResult) {
    // This would be calculated from user feedback and interaction metrics
    return Math.random() * 2 + 3; // Simulated score between 3-5
  }

  calculateClarityScore(testResult) {
    // This would be calculated from user feedback and clarity metrics
    return Math.random() * 2 + 3; // Simulated score between 3-5
  }

  calculateFeedbackScore(testResult) {
    // This would be calculated from user feedback metrics
    return Math.random() * 2 + 3; // Simulated score between 3-5
  }

  checkSecurityCriterion(testResult, criterion) {
    // This would check actual security implementations
    // For simulation, return random boolean with high success rate
    return Math.random() > 0.1; // 90% success rate
  }

  calculateSuccessRate(testResult) {
    const totalSteps = testResult.steps.length;
    const successfulSteps = testResult.steps.filter(step => step.status === 'passed').length;
    return totalSteps > 0 ? (successfulSteps / totalSteps) * 100 : 0;
  }

  calculateErrorRate(testResult) {
    const totalSteps = testResult.steps.length;
    const failedSteps = testResult.steps.filter(step => step.status === 'failed').length;
    return totalSteps > 0 ? (failedSteps / totalSteps) * 100 : 0;
  }

  // Determine overall test status
  determineTestStatus(testResult) {
    if (testResult.steps.some(step => step.status === 'failed')) {
      return 'failed';
    }
    
    if (testResult.performance && !testResult.performance.passed) {
      return 'performance_issues';
    }
    
    if (testResult.security && !testResult.security.passed) {
      return 'security_issues';
    }
    
    if (testResult.functionality && !testResult.functionality.passed) {
      return 'functionality_issues';
    }
    
    return 'passed';
  }

  // Update test run summary
  updateTestRunSummary(testResult) {
    const summary = this.currentTestRun.summary;
    summary.total++;
    
    switch (testResult.status) {
      case 'passed':
        summary.passed++;
        break;
      case 'failed':
        summary.failed++;
        break;
      default:
        summary.skipped++;
        break;
    }
  }

  // Complete the current test run
  async completeTestRun() {
    if (!this.currentTestRun) {
      throw new Error('No active test run to complete');
    }

    this.currentTestRun.endTime = new Date();
    this.currentTestRun.duration = this.currentTestRun.endTime - this.currentTestRun.startTime;
    this.currentTestRun.status = 'completed';

    // Calculate overall scores
    this.calculateOverallScores();

    // Generate recommendations
    this.generateOverallRecommendations();

    console.log(`🏁 UAT Test Run Completed: ${this.currentTestRun.id}`);
    console.log(`📊 Results: ${this.currentTestRun.summary.passed}/${this.currentTestRun.summary.total} passed`);
    
    return this.currentTestRun;
  }

  // Calculate overall scores for the test run
  calculateOverallScores() {
    const results = Object.values(this.currentTestRun.results);
    
    this.currentTestRun.summary.performance = {
      averageResponseTime: this.calculateAverageResponseTime(results),
      averagePageLoadTime: this.calculateAveragePageLoadTime(results),
      performanceScore: this.calculatePerformanceScore(results)
    };
    
    this.currentTestRun.summary.userExperience = {
      easeOfUseScore: this.calculateAverageEaseOfUseScore(results),
      clarityScore: this.calculateAverageClarityScore(results),
      feedbackScore: this.calculateAverageFeedbackScore(results)
    };
    
    this.currentTestRun.summary.security = {
      securityScore: this.calculateSecurityScore(results)
    };
    
    this.currentTestRun.summary.functionality = {
      successRate: this.calculateOverallSuccessRate(results),
      errorRate: this.calculateOverallErrorRate(results)
    };
  }

  // Generate overall recommendations
  generateOverallRecommendations() {
    const recommendations = [];
    const results = Object.values(this.currentTestRun.results);
    
    // Performance recommendations
    const performanceIssues = results.filter(r => r.status === 'performance_issues');
    if (performanceIssues.length > 0) {
      recommendations.push({
        category: 'Performance',
        priority: 'high',
        description: `${performanceIssues.length} scenarios have performance issues`,
        actions: ['Review response times', 'Optimize database queries', 'Implement caching strategies']
      });
    }
    
    // Security recommendations
    const securityIssues = results.filter(r => r.status === 'security_issues');
    if (securityIssues.length > 0) {
      recommendations.push({
        category: 'Security',
        priority: 'critical',
        description: `${securityIssues.length} scenarios have security issues`,
        actions: ['Review authentication', 'Validate input data', 'Check access controls']
      });
    }
    
    // Functionality recommendations
    const functionalityIssues = results.filter(r => r.status === 'functionality_issues');
    if (functionalityIssues.length > 0) {
      recommendations.push({
        category: 'Functionality',
        priority: 'high',
        description: `${functionalityIssues.length} scenarios have functionality issues`,
        actions: ['Review user flows', 'Test edge cases', 'Validate business logic']
      });
    }
    
    this.currentTestRun.recommendations = recommendations;
  }

  // Helper methods for overall calculations
  calculateAverageResponseTime(results) {
    const responseTimes = results.flatMap(r => 
      r.steps.filter(s => s.performance && s.performance.responseTime)
        .map(s => s.performance.responseTime)
    );
    
    if (responseTimes.length === 0) return 0;
    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }

  calculateAveragePageLoadTime(results) {
    // Simulated calculation
    return Math.random() * 2000 + 500;
  }

  calculatePerformanceScore(results) {
    const scores = results
      .filter(r => r.performance && r.performance.score)
      .map(r => r.performance.score);
    
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  calculateAverageEaseOfUseScore(results) {
    const scores = results
      .filter(r => r.userExperience && r.userExperience.score)
      .map(r => r.userExperience.score);
    
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  calculateAverageClarityScore(results) {
    const scores = results
      .filter(r => r.userExperience && r.userExperience.score)
      .map(r => r.userExperience.score);
    
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  calculateAverageFeedbackScore(results) {
    const scores = results
      .filter(r => r.userExperience && r.userExperience.score)
      .map(r => r.userExperience.score);
    
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  calculateSecurityScore(results) {
    const scores = results
      .filter(r => r.security && r.security.score)
      .map(r => r.security.score);
    
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  calculateOverallSuccessRate(results) {
    const totalSteps = results.reduce((sum, r) => sum + r.steps.length, 0);
    const successfulSteps = results.reduce((sum, r) => 
      sum + r.steps.filter(s => s.status === 'passed').length, 0
    );
    
    return totalSteps > 0 ? (successfulSteps / totalSteps) * 100 : 0;
  }

  calculateOverallErrorRate(results) {
    const totalSteps = results.reduce((sum, r) => sum + r.steps.length, 0);
    const failedSteps = results.reduce((sum, r) => 
      sum + r.steps.filter(s => s.status === 'failed').length, 0
    );
    
    return totalSteps > 0 ? (failedSteps / totalSteps) * 100 : 0;
  }

  // Get test run results
  getTestRunResults() {
    return this.currentTestRun;
  }

  // Get all test scenarios
  getTestScenarios() {
    return this.testScenarios;
  }

  // Get acceptance criteria
  getAcceptanceCriteria() {
    return this.acceptanceCriteria;
  }

  // Export test results
  exportTestResults(format = 'json') {
    if (!this.currentTestRun) {
      throw new Error('No test run results to export');
    }

    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(this.currentTestRun, null, 2);
      case 'csv':
        return this.convertToCSV(this.currentTestRun);
      case 'html':
        return this.convertToHTML(this.currentTestRun);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Convert results to CSV format
  convertToCSV(testRun) {
    const csv = [];
    
    // Header
    csv.push('Scenario,Status,Duration,Performance Score,User Experience Score,Security Score,Functionality Score');
    
    // Data rows
    Object.entries(testRun.results).forEach(([key, result]) => {
      csv.push([
        result.scenarioName,
        result.status,
        result.duration,
        result.performance?.score || 0,
        result.userExperience?.score || 0,
        result.security?.score || 0,
        result.functionality?.score || 0
      ].join(','));
    });
    
    return csv.join('\n');
  }

  // Convert results to HTML format
  convertToHTML(testRun) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>UAT Test Results - ${testRun.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
            .summary { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .scenario { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
            .passed { border-left: 5px solid #4caf50; }
            .failed { border-left: 5px solid #f44336; }
            .performance_issues { border-left: 5px solid #ff9800; }
            .security_issues { border-left: 5px solid #e91e63; }
            .functionality_issues { border-left: 5px solid #9c27b0; }
            .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 15px 0; }
            .metric { background: #f9f9f9; padding: 10px; border-radius: 3px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>UAT Test Results</h1>
            <p><strong>Test Run ID:</strong> ${testRun.id}</p>
            <p><strong>Start Time:</strong> ${testRun.startTime}</p>
            <p><strong>End Time:</strong> ${testRun.endTime}</p>
            <p><strong>Duration:</strong> ${testRun.duration}ms</p>
          </div>
          
          <div class="summary">
            <h2>Test Summary</h2>
            <div class="metrics">
              <div class="metric">
                <strong>Total:</strong> ${testRun.summary.total}
              </div>
              <div class="metric">
                <strong>Passed:</strong> ${testRun.summary.passed}
              </div>
              <div class="metric">
                <strong>Failed:</strong> ${testRun.summary.failed}
              </div>
              <div class="metric">
                <strong>Skipped:</strong> ${testRun.summary.skipped}
              </div>
            </div>
          </div>
          
          <h2>Test Scenarios</h2>
          ${Object.entries(testRun.results).map(([key, result]) => `
            <div class="scenario ${result.status}">
              <h3>${result.scenarioName}</h3>
              <p><strong>Status:</strong> ${result.status.toUpperCase()}</p>
              <p><strong>Duration:</strong> ${result.duration}ms</p>
              <div class="metrics">
                <div class="metric">
                  <strong>Performance:</strong> ${result.performance?.score || 0}%
                </div>
                <div class="metric">
                  <strong>User Experience:</strong> ${result.userExperience?.score || 0}%
                </div>
                <div class="metric">
                  <strong>Security:</strong> ${result.security?.score || 0}%
                </div>
                <div class="metric">
                  <strong>Functionality:</strong> ${result.functionality?.score || 0}%
                </div>
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `;
  }

  // Cleanup
  destroy() {
    this.currentTestRun = null;
    this.testResults.clear();
    console.log('✅ UAT Service destroyed');
  }
}

// Create singleton instance
const uatService = new UATService();

// Export the service and class
module.exports = {
  UATService,
  uatService,
  
  // Convenience functions
  startTestRun: (id) => uatService.startTestRun(id),
  executeTestScenario: (scenario, data) => uatService.executeTestScenario(scenario, data),
  completeTestRun: () => uatService.completeTestRun(),
  getTestRunResults: () => uatService.getTestRunResults(),
  getTestScenarios: () => uatService.getTestScenarios(),
  getAcceptanceCriteria: () => uatService.getAcceptanceCriteria(),
  exportTestResults: (format) => uatService.exportTestResults(format)
};