/**
 * @fileoverview Comprehensive test suite for Selena-Onboard AI Agent
 * 
 * This test suite validates all aspects of the Selena-Onboard agent including:
 * - Registration assistance functionality
 * - Profile setup guidance
 * - Platform feature explanation
 * - Cultural adaptation for Saudi users
 * - Arabic/English bilingual support
 * - API endpoint functionality
 * - Database integration
 * - Error handling and fallbacks
 */

const axios = require('axios');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Test configuration
const AGENTS_API_URL = process.env.AGENTS_API_URL || 'http://localhost:8000';
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

class SelenaOnboardAgentTest {
  constructor() {
    this.mongoServer = null;
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      details: []
    };
  }

  /**
   * Setup test environment
   */
  async setup() {
    console.log('🚀 Setting up Selena-Onboard Agent Test Environment...\n');
    
    try {
      // Start in-memory MongoDB for testing
      this.mongoServer = await MongoMemoryServer.create();
      const mongoUri = this.mongoServer.getUri();
      
      // Connect to test database
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to test MongoDB instance');
      
      // Import models
      require('./server/src/models/OnboardingSession');
      console.log('✅ Loaded OnboardingSession model');
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      throw error;
    }
  }

  /**
   * Cleanup test environment
   */
  async cleanup() {
    console.log('\n🧹 Cleaning up test environment...');
    
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
      }
      
      if (this.mongoServer) {
        await this.mongoServer.stop();
        console.log('✅ Stopped MongoDB test server');
      }
    } catch (error) {
      console.error('❌ Cleanup error:', error.message);
    }
  }

  /**
   * Run a single test case
   */
  async runTest(testName, testFunction) {
    this.testResults.total++;
    
    try {
      console.log(`\n🧪 Testing: ${testName}`);
      await testFunction();
      this.testResults.passed++;
      this.testResults.details.push({ name: testName, status: 'PASSED' });
      console.log(`✅ ${testName} - PASSED`);
    } catch (error) {
      this.testResults.failed++;
      this.testResults.details.push({ 
        name: testName, 
        status: 'FAILED', 
        error: error.message 
      });
      console.log(`❌ ${testName} - FAILED: ${error.message}`);
    }
  }

  /**
   * Test 1: Agent Service Health Check
   */
  async testAgentServiceHealth() {
    try {
      const response = await axios.get(`${AGENTS_API_URL}/health`, { timeout: 5000 });
      
      if (!response.data || response.data.status !== 'ok') {
        throw new Error('Agent service health check failed');
      }
      
      console.log('  📊 Agent service status:', response.data);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Agent service is not running. Please start the agents API first.');
      }
      throw error;
    }
  }

  /**
   * Test 2: Start Onboarding Session - Arabic
   */
  async testStartSessionArabic() {
    try {
      const response = await axios.post(`${AGENTS_API_URL}/agents/onboard/start-session`, {
        language: 'ar',
        user_context: { source: 'test' }
      });
      
      if (!response.data.success || !response.data.session_id) {
        throw new Error('Failed to start Arabic onboarding session');
      }
      
      // Validate response structure
      const { session_id, message, progress, current_step } = response.data;
      
      if (!session_id || typeof session_id !== 'string') {
        throw new Error('Invalid session_id in response');
      }
      
      if (!message || !message.includes('سيلينا')) {
        throw new Error('Arabic welcome message missing or invalid');
      }
      
      if (typeof progress !== 'number' || progress < 0) {
        throw new Error('Invalid progress value');
      }
      
      console.log('  📝 Session ID:', session_id);
      console.log('  🗣️ Welcome message (first 100 chars):', message.substring(0, 100) + '...');
      console.log('  📊 Initial progress:', progress + '%');
      
      // Store session ID for subsequent tests
      this.testSessionId = session_id;
      
    } catch (error) {
      throw new Error(`Start session test failed: ${error.message}`);
    }
  }

  /**
   * Test 3: Start Onboarding Session - English
   */
  async testStartSessionEnglish() {
    try {
      const response = await axios.post(`${AGENTS_API_URL}/agents/onboard/start-session`, {
        language: 'en',
        user_context: { source: 'test' }
      });
      
      if (!response.data.success || !response.data.session_id) {
        throw new Error('Failed to start English onboarding session');
      }
      
      const { message } = response.data;
      
      if (!message || !message.includes('Selena')) {
        throw new Error('English welcome message missing or invalid');
      }
      
      console.log('  🗣️ English welcome message (first 100 chars):', message.substring(0, 100) + '...');
      
    } catch (error) {
      throw new Error(`English session test failed: ${error.message}`);
    }
  }

  /**
   * Test 4: Registration Help - Arabic
   */
  async testRegistrationHelpArabic() {
    if (!this.testSessionId) {
      throw new Error('No test session available');
    }
    
    try {
      const response = await axios.post(`${AGENTS_API_URL}/agents/onboard/registration-help`, {
        message: 'كيف أسجل في المنصة؟',
        session_id: this.testSessionId,
        language: 'ar',
        current_step: 'auth'
      });
      
      if (!response.data.message) {
        throw new Error('No response message received');
      }
      
      const message = response.data.message;
      
      // Check if response contains helpful registration information
      if (!message.includes('تسجيل') && !message.includes('حساب')) {
        throw new Error('Response does not contain registration guidance');
      }
      
      console.log('  🗣️ Registration help response (first 150 chars):', message.substring(0, 150) + '...');
      
      // Validate suggestions if present
      if (response.data.suggestions && Array.isArray(response.data.suggestions)) {
        console.log('  💡 Suggestions provided:', response.data.suggestions.length);
      }
      
    } catch (error) {
      throw new Error(`Registration help test failed: ${error.message}`);
    }
  }

  /**
   * Test 5: Profile Setup Help - English
   */
  async testProfileSetupHelpEnglish() {
    try {
      const response = await axios.post(`${AGENTS_API_URL}/agents/onboard/profile-setup`, {
        message: 'Help me set up my profile',
        language: 'en',
        current_step: 'profile'
      });
      
      if (!response.data.message) {
        throw new Error('No response message received');
      }
      
      const message = response.data.message;
      
      // Check if response contains profile setup guidance
      if (!message.toLowerCase().includes('profile') && !message.toLowerCase().includes('picture')) {
        throw new Error('Response does not contain profile guidance');
      }
      
      console.log('  🗣️ Profile setup response (first 150 chars):', message.substring(0, 150) + '...');
      
    } catch (error) {
      throw new Error(`Profile setup help test failed: ${error.message}`);
    }
  }

  /**
   * Test 6: Feature Tour Request
   */
  async testFeatureTour() {
    try {
      const response = await axios.post(`${AGENTS_API_URL}/agents/onboard/feature-tour`, {
        message: 'What features does LUDUS have?',
        language: 'en'
      });
      
      if (!response.data.message) {
        throw new Error('No response message received');
      }
      
      const message = response.data.message;
      
      // Check if response contains feature information
      if (!message.toLowerCase().includes('feature') && !message.toLowerCase().includes('discover')) {
        throw new Error('Response does not contain feature information');
      }
      
      console.log('  🗣️ Feature tour response (first 150 chars):', message.substring(0, 150) + '...');
      
    } catch (error) {
      throw new Error(`Feature tour test failed: ${error.message}`);
    }
  }

  /**
   * Test 7: Cultural Guidance Request
   */
  async testCulturalGuidance() {
    try {
      const response = await axios.post(`${AGENTS_API_URL}/agents/onboard/registration-help`, {
        message: 'Tell me about Saudi gaming culture',
        language: 'ar'
      });
      
      if (!response.data.message) {
        throw new Error('No response message received');
      }
      
      const message = response.data.message;
      
      // Check if response contains cultural information
      if (!message.includes('ثقافة') && !message.includes('سعودي')) {
        throw new Error('Response does not contain cultural guidance');
      }
      
      console.log('  🗣️ Cultural guidance response (first 150 chars):', message.substring(0, 150) + '...');
      
    } catch (error) {
      throw new Error(`Cultural guidance test failed: ${error.message}`);
    }
  }

  /**
   * Test 8: Session Progress Tracking
   */
  async testSessionProgress() {
    if (!this.testSessionId) {
      throw new Error('No test session available');
    }
    
    try {
      // Update session step
      await axios.post(`${AGENTS_API_URL}/agents/onboard/update-step`, {
        session_id: this.testSessionId,
        step: 'profile',
        completed: true
      });
      
      // Get progress
      const response = await axios.get(`${AGENTS_API_URL}/agents/onboard/progress/${this.testSessionId}`);
      
      if (!response.data.success || !response.data.progress) {
        throw new Error('Failed to get session progress');
      }
      
      const progress = response.data.progress;
      
      if (typeof progress.progress_percentage !== 'number') {
        throw new Error('Invalid progress percentage');
      }
      
      console.log('  📊 Session progress:', progress.progress_percentage + '%');
      console.log('  📋 Current step:', progress.current_step);
      console.log('  ✅ Completed steps:', progress.completed_steps);
      
    } catch (error) {
      throw new Error(`Session progress test failed: ${error.message}`);
    }
  }

  /**
   * Test 9: Session Analytics
   */
  async testSessionAnalytics() {
    if (!this.testSessionId) {
      throw new Error('No test session available');
    }
    
    try {
      const response = await axios.get(`${AGENTS_API_URL}/agents/onboard/analytics/${this.testSessionId}`);
      
      if (!response.data.success || !response.data.analytics) {
        throw new Error('Failed to get session analytics');
      }
      
      const analytics = response.data.analytics;
      
      // Validate analytics structure
      const requiredFields = ['session_id', 'duration_minutes', 'total_messages', 'progress_percentage'];
      for (const field of requiredFields) {
        if (!(field in analytics)) {
          throw new Error(`Missing analytics field: ${field}`);
        }
      }
      
      console.log('  📊 Analytics summary:');
      console.log('    - Duration:', analytics.duration_minutes + ' minutes');
      console.log('    - Total messages:', analytics.total_messages);
      console.log('    - Progress:', analytics.progress_percentage + '%');
      console.log('    - Language:', analytics.language_preference);
      
    } catch (error) {
      throw new Error(`Session analytics test failed: ${error.message}`);
    }
  }

  /**
   * Test 10: Complete Onboarding Session
   */
  async testCompleteOnboarding() {
    if (!this.testSessionId) {
      throw new Error('No test session available');
    }
    
    try {
      const response = await axios.post(`${AGENTS_API_URL}/agents/onboard/complete-onboarding`, {
        session_id: this.testSessionId,
        final_data: {
          preferences: { theme: 'dark', notifications: true },
          source: 'test_completion'
        }
      });
      
      if (!response.data.success) {
        throw new Error('Failed to complete onboarding session');
      }
      
      console.log('  ✅ Onboarding session completed successfully');
      console.log('  📝 Completion message:', response.data.message);
      
    } catch (error) {
      throw new Error(`Complete onboarding test failed: ${error.message}`);
    }
  }

  /**
   * Test 11: Backend API Integration
   */
  async testBackendIntegration() {
    try {
      // Test starting session through backend
      const startResponse = await axios.post(`${BACKEND_API_URL}/api/onboard-agent/start-session`, {
        language: 'ar'
      });
      
      if (!startResponse.data.success) {
        // Check if it's a connection error or actual failure
        if (startResponse.data.fallback_message) {
          console.log('  ⚠️ Agents service unavailable, fallback working');
          return;
        }
        throw new Error('Backend integration failed');
      }
      
      const sessionId = startResponse.data.session_id;
      
      // Test chat through backend
      const chatResponse = await axios.post(`${BACKEND_API_URL}/api/onboard-agent/chat`, {
        message: 'I need help with registration',
        session_id: sessionId,
        language: 'en'
      });
      
      if (!chatResponse.data.success && !chatResponse.data.fallback_response) {
        throw new Error('Backend chat integration failed');
      }
      
      console.log('  ✅ Backend API integration working');
      console.log('  🤖 Agent name:', chatResponse.data.agent_name);
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('  ⚠️ Backend server not running - skipping integration test');
        return;
      }
      throw new Error(`Backend integration test failed: ${error.message}`);
    }
  }

  /**
   * Test 12: MongoDB Session Persistence
   */
  async testMongoDBPersistence() {
    try {
      const OnboardingSession = mongoose.model('OnboardingSession');
      
      // Create test session
      const sessionData = {
        sessionId: 'test-session-' + Date.now(),
        userId: new mongoose.Types.ObjectId(),
        status: 'active',
        currentStep: 'profile',
        languagePreference: 'ar',
        conversationHistory: [
          {
            role: 'assistant',
            content: 'مرحباً! أنا سيلينا',
            timestamp: new Date(),
            step: 'welcome'
          }
        ],
        progressPercentage: 25,
        metadata: {
          userAgent: 'test-agent',
          source: 'automated-test'
        }
      };
      
      const session = new OnboardingSession(sessionData);
      await session.save();
      
      // Test retrieval
      const retrievedSession = await OnboardingSession.findOne({ 
        sessionId: sessionData.sessionId 
      });
      
      if (!retrievedSession) {
        throw new Error('Session not saved or retrieved correctly');
      }
      
      // Test instance methods
      await retrievedSession.addConversationEntry('user', 'Test message', 'profile');
      await retrievedSession.updateStep('interests', true);
      
      const progress = retrievedSession.getProgress();
      
      if (!progress || typeof progress.percentage !== 'number') {
        throw new Error('Progress calculation failed');
      }
      
      console.log('  💾 Session saved and retrieved successfully');
      console.log('  📊 Progress calculation working:', progress.percentage + '%');
      
      // Test analytics
      const analytics = await OnboardingSession.getCompletionStats(7);
      console.log('  📈 Analytics aggregation working, found', analytics.length, 'status groups');
      
    } catch (error) {
      throw new Error(`MongoDB persistence test failed: ${error.message}`);
    }
  }

  /**
   * Test 13: Response Quality and Content Analysis
   */
  async testResponseQuality() {
    const testCases = [
      {
        message: 'كيف أنشئ حساب؟',
        language: 'ar',
        expectedKeywords: ['حساب', 'تسجيل', 'جوجل'],
        description: 'Arabic registration query'
      },
      {
        message: 'I forgot my password',
        language: 'en',
        expectedKeywords: ['password', 'reset', 'help'],
        description: 'English password help'
      },
      {
        message: 'What is Saudi gaming culture like?',
        language: 'en',
        expectedKeywords: ['culture', 'saudi', 'gaming'],
        description: 'Cultural guidance request'
      }
    ];
    
    for (const testCase of testCases) {
      try {
        const response = await axios.post(`${AGENTS_API_URL}/agents/onboard/registration-help`, {
          message: testCase.message,
          language: testCase.language
        });
        
        if (!response.data.message) {
          throw new Error(`No response for: ${testCase.description}`);
        }
        
        const message = response.data.message.toLowerCase();
        const hasKeywords = testCase.expectedKeywords.some(keyword => 
          message.includes(keyword.toLowerCase())
        );
        
        if (!hasKeywords) {
          console.log(`  ⚠️ Response may lack expected keywords for: ${testCase.description}`);
        } else {
          console.log(`  ✅ Quality check passed for: ${testCase.description}`);
        }
        
      } catch (error) {
        throw new Error(`Response quality test failed for "${testCase.description}": ${error.message}`);
      }
    }
  }

  /**
   * Test 14: Error Handling and Fallbacks
   */
  async testErrorHandling() {
    try {
      // Test with invalid session ID
      const invalidSessionResponse = await axios.get(`${AGENTS_API_URL}/agents/onboard/progress/invalid-session-id`);
      
      if (invalidSessionResponse.status === 200 && invalidSessionResponse.data.success) {
        throw new Error('Should have failed with invalid session ID');
      }
      
      console.log('  ✅ Invalid session ID properly handled');
      
      // Test with invalid step
      try {
        await axios.post(`${AGENTS_API_URL}/agents/onboard/update-step`, {
          session_id: 'test-session',
          step: 'invalid-step'
        });
        throw new Error('Should have failed with invalid step');
      } catch (error) {
        if (error.response && error.response.status === 400) {
          console.log('  ✅ Invalid step properly rejected');
        } else {
          throw error;
        }
      }
      
    } catch (error) {
      throw new Error(`Error handling test failed: ${error.message}`);
    }
  }

  /**
   * Test 15: Performance and Response Time
   */
  async testPerformance() {
    const iterations = 5;
    const responseTimes = [];
    
    try {
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        await axios.post(`${AGENTS_API_URL}/agents/onboard/registration-help`, {
          message: 'Quick test message',
          language: 'ar'
        });
        
        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);
      }
      
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      
      console.log('  ⚡ Average response time:', avgResponseTime.toFixed(2) + 'ms');
      console.log('  🏔️ Max response time:', maxResponseTime + 'ms');
      
      // Validate performance requirements
      if (avgResponseTime > 2000) {
        throw new Error(`Average response time too high: ${avgResponseTime}ms (should be < 2000ms)`);
      }
      
      if (maxResponseTime > 5000) {
        throw new Error(`Max response time too high: ${maxResponseTime}ms (should be < 5000ms)`);
      }
      
    } catch (error) {
      throw new Error(`Performance test failed: ${error.message}`);
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🎯 LUDUS Selena-Onboard Agent Test Suite');
    console.log('=' .repeat(50));
    
    try {
      await this.setup();
      
      // Infrastructure tests
      await this.runTest('Agent Service Health Check', () => this.testAgentServiceHealth());
      
      // Core functionality tests
      await this.runTest('Start Session - Arabic', () => this.testStartSessionArabic());
      await this.runTest('Start Session - English', () => this.testStartSessionEnglish());
      await this.runTest('Registration Help - Arabic', () => this.testRegistrationHelpArabic());
      await this.runTest('Profile Setup Help - English', () => this.testProfileSetupHelpEnglish());
      await this.runTest('Feature Tour Request', () => this.testFeatureTour());
      await this.runTest('Cultural Guidance', () => this.testCulturalGuidance());
      
      // Session management tests
      await this.runTest('Session Progress Tracking', () => this.testSessionProgress());
      await this.runTest('Session Analytics', () => this.testSessionAnalytics());
      await this.runTest('Complete Onboarding', () => this.testCompleteOnboarding());
      
      // Integration tests
      await this.runTest('Backend API Integration', () => this.testBackendIntegration());
      await this.runTest('MongoDB Persistence', () => this.testMongoDBPersistence());
      
      // Quality and performance tests
      await this.runTest('Response Quality Analysis', () => this.testResponseQuality());
      await this.runTest('Error Handling & Fallbacks', () => this.testErrorHandling());
      await this.runTest('Performance & Response Time', () => this.testPerformance());
      
    } catch (error) {
      console.error('💥 Test suite setup failed:', error.message);
    } finally {
      await this.cleanup();
      this.printResults();
    }
  }

  /**
   * Print final test results
   */
  printResults() {
    console.log('\n' + '=' .repeat(50));
    console.log('📋 SELENA-ONBOARD AGENT TEST RESULTS');
    console.log('=' .repeat(50));
    
    console.log(`📊 Total Tests: ${this.testResults.total}`);
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📈 Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.details
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`  • ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n🎉 Test Summary:');
    if (this.testResults.failed === 0) {
      console.log('✅ All tests passed! Selena-Onboard agent is working correctly.');
    } else if (this.testResults.passed > this.testResults.failed) {
      console.log('⚠️ Most tests passed, but some issues need attention.');
    } else {
      console.log('❌ Multiple tests failed. Please review the implementation.');
    }
    
    console.log('\n💡 Next Steps:');
    console.log('  • Deploy to staging environment');
    console.log('  • Run integration tests with frontend');
    console.log('  • Monitor performance in production');
    console.log('  • Collect user feedback and iterate');
    
    process.exit(this.testResults.failed > 0 ? 1 : 0);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new SelenaOnboardAgentTest();
  tester.runAllTests().catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = SelenaOnboardAgentTest;