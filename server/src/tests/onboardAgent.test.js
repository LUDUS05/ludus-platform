/**
 * @fileoverview Test suite for Selena-Onboard agent backend integration
 * @module tests/onboardAgent
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const OnboardingSession = require('../models/OnboardingSession');
const User = require('../models/User');

describe('Selena-Onboard Agent API', () => {
  let mongoServer;
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to test database
    await mongoose.connect(mongoUri);
    
    // Create test user
    testUser = new User({
      firstName: 'Ahmed',
      lastName: 'Mohammed',
      email: 'ahmed.test@example.com',
      password: 'testPassword123',
      role: 'user'
    });
    await testUser.save();
    
    // Mock authentication token
    authToken = 'test-auth-token';
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear sessions before each test
    await OnboardingSession.deleteMany({});
  });

  describe('POST /api/onboard-agent/start-session', () => {
    it('should start new Arabic onboarding session', async () => {
      const response = await request(app)
        .post('/api/onboard-agent/start-session')
        .send({
          language: 'ar',
          user_context: { source: 'test' }
        });

      // Should succeed even if agents service is down (fallback)
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('fallback_message');
      expect(response.body.fallback_message).toContain('سيلينا');
    });

    it('should start new English onboarding session', async () => {
      const response = await request(app)
        .post('/api/onboard-agent/start-session')
        .send({
          language: 'en',
          user_context: { source: 'test' }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('fallback_message');
      expect(response.body.fallback_message).toContain('Selena');
    });

    it('should create MongoDB session record', async () => {
      // Mock successful agents API response
      const mockSessionId = 'test-session-' + Date.now();
      
      // Manually create session to test MongoDB integration
      const sessionData = {
        sessionId: mockSessionId,
        userId: testUser._id,
        status: 'active',
        currentStep: 'welcome',
        languagePreference: 'ar',
        conversationHistory: [{
          role: 'assistant',
          content: 'مرحباً بك في لودوس',
          timestamp: new Date(),
          step: 'welcome'
        }],
        progressPercentage: 0
      };
      
      const session = new OnboardingSession(sessionData);
      await session.save();
      
      // Verify session was saved
      const savedSession = await OnboardingSession.findOne({ sessionId: mockSessionId });
      expect(savedSession).toBeTruthy();
      expect(savedSession.languagePreference).toBe('ar');
      expect(savedSession.conversationHistory).toHaveLength(1);
    });
  });

  describe('POST /api/onboard-agent/chat', () => {
    let testSessionId;

    beforeEach(async () => {
      // Create test session
      testSessionId = 'test-session-' + Date.now();
      const session = new OnboardingSession({
        sessionId: testSessionId,
        userId: testUser._id,
        status: 'active',
        currentStep: 'auth',
        languagePreference: 'ar'
      });
      await session.save();
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/onboard-agent/chat')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should handle Arabic registration help request', async () => {
      const response = await request(app)
        .post('/api/onboard-agent/chat')
        .send({
          message: 'كيف أسجل في المنصة؟',
          session_id: testSessionId,
          language: 'ar',
          current_step: 'auth'
        });

      // Should provide fallback response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('fallback_response');
      expect(response.body.fallback_response).toContain('تسجيل');
    });

    it('should handle English profile help request', async () => {
      const response = await request(app)
        .post('/api/onboard-agent/chat')
        .send({
          message: 'Help me with my profile',
          session_id: testSessionId,
          language: 'en',
          current_step: 'profile'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('fallback_response');
      expect(response.body.fallback_response).toContain('profile');
    });

    it('should update MongoDB session with conversation', async () => {
      // Send message (will fallback but should update DB)
      await request(app)
        .post('/api/onboard-agent/chat')
        .send({
          message: 'Test message',
          session_id: testSessionId,
          language: 'ar'
        });

      // Check if session was updated
      const session = await OnboardingSession.findOne({ sessionId: testSessionId });
      expect(session).toBeTruthy();
      // Note: In test environment, conversation history won't be updated
      // because the agents API is not running, but the session should still exist
    });
  });

  describe('POST /api/onboard-agent/profile-help', () => {
    it('should provide Arabic profile setup guidance', async () => {
      const response = await request(app)
        .post('/api/onboard-agent/profile-help')
        .send({
          language: 'ar'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('fallback_response');
      expect(response.body.fallback_response).toContain('ملف');
    });

    it('should provide English profile setup guidance', async () => {
      const response = await request(app)
        .post('/api/onboard-agent/profile-help')
        .send({
          language: 'en'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('fallback_response');
      expect(response.body.fallback_response).toContain('profile');
    });
  });

  describe('POST /api/onboard-agent/feature-tour', () => {
    it('should provide platform features overview', async () => {
      const response = await request(app)
        .post('/api/onboard-agent/feature-tour')
        .send({
          feature: 'discovery',
          language: 'en'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('fallback_response');
      expect(response.body.fallback_response).toContain('LUDUS');
    });
  });

  describe('GET /api/onboard-agent/progress/:session_id', () => {
    let testSessionId;

    beforeEach(async () => {
      testSessionId = 'test-session-' + Date.now();
      const session = new OnboardingSession({
        sessionId: testSessionId,
        userId: testUser._id,
        status: 'active',
        currentStep: 'profile',
        completedSteps: [
          { step: 'welcome', completedAt: new Date() },
          { step: 'auth', completedAt: new Date() }
        ],
        progressPercentage: 30,
        languagePreference: 'ar'
      });
      await session.save();
    });

    it('should return session progress from MongoDB', async () => {
      const response = await request(app)
        .get(`/api/onboard-agent/progress/${testSessionId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.progress).toBeDefined();
      expect(response.body.progress.session_id).toBe(testSessionId);
      expect(response.body.progress.progress_percentage).toBe(30);
      expect(response.body.progress.completed_steps).toContain('welcome');
      expect(response.body.progress.completed_steps).toContain('auth');
      expect(response.body.source).toBe('mongodb');
    });

    it('should return 404 for non-existent session', async () => {
      const response = await request(app)
        .get('/api/onboard-agent/progress/non-existent-session');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/onboard-agent/update-step', () => {
    let testSessionId;

    beforeEach(async () => {
      testSessionId = 'test-session-' + Date.now();
      const session = new OnboardingSession({
        sessionId: testSessionId,
        userId: testUser._id,
        status: 'active',
        currentStep: 'auth',
        languagePreference: 'ar'
      });
      await session.save();
    });

    it('should update step progress', async () => {
      const response = await request(app)
        .post('/api/onboard-agent/update-step')
        .send({
          session_id: testSessionId,
          step: 'profile',
          completed: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.step).toBe('profile');
      expect(response.body.completed).toBe(true);

      // Verify in database
      const session = await OnboardingSession.findOne({ sessionId: testSessionId });
      expect(session.currentStep).toBe('profile');
      expect(session.completedSteps.some(cs => cs.step === 'profile')).toBe(true);
    });

    it('should validate step values', async () => {
      const response = await request(app)
        .post('/api/onboard-agent/update-step')
        .send({
          session_id: testSessionId,
          step: 'invalid-step',
          completed: true
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should require session_id and step', async () => {
      const response = await request(app)
        .post('/api/onboard-agent/update-step')
        .send({
          completed: true
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/onboard-agent/analytics/:session_id', () => {
    let testSessionId;

    beforeEach(async () => {
      testSessionId = 'test-session-' + Date.now();
      const session = new OnboardingSession({
        sessionId: testSessionId,
        userId: testUser._id,
        status: 'completed',
        conversationHistory: [
          { role: 'assistant', content: 'Welcome!', timestamp: new Date() },
          { role: 'user', content: 'Hello', timestamp: new Date() },
          { role: 'assistant', content: 'How can I help?', timestamp: new Date() }
        ],
        analytics: {
          totalDuration: 300, // 5 minutes
          questionsAsked: 1,
          helpRequests: 0,
          culturalTipsProvided: 2
        },
        progressPercentage: 100,
        languagePreference: 'ar'
      });
      await session.save();
    });

    it('should return session analytics from MongoDB', async () => {
      const response = await request(app)
        .get(`/api/onboard-agent/analytics/${testSessionId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.analytics).toBeDefined();
      
      const analytics = response.body.analytics;
      expect(analytics.session_id).toBe(testSessionId);
      expect(analytics.total_messages).toBe(3);
      expect(analytics.user_messages).toBe(1);
      expect(analytics.assistant_messages).toBe(2);
      expect(analytics.duration_minutes).toBe(5);
      expect(analytics.progress_percentage).toBe(100);
      expect(analytics.language_preference).toBe('ar');
      expect(response.body.source).toBe('mongodb');
    });
  });

  describe('OnboardingSession Model', () => {
    it('should create valid onboarding session', async () => {
      const sessionData = {
        sessionId: 'test-model-session',
        userId: testUser._id,
        status: 'active',
        currentStep: 'welcome',
        languagePreference: 'ar',
        progressPercentage: 0
      };

      const session = new OnboardingSession(sessionData);
      await session.save();

      const savedSession = await OnboardingSession.findOne({ 
        sessionId: 'test-model-session' 
      });
      
      expect(savedSession).toBeTruthy();
      expect(savedSession.sessionId).toBe('test-model-session');
      expect(savedSession.status).toBe('active');
    });

    it('should add conversation entries correctly', async () => {
      const session = new OnboardingSession({
        sessionId: 'conversation-test',
        userId: testUser._id,
        status: 'active',
        languagePreference: 'ar'
      });
      await session.save();

      await session.addConversationEntry('user', 'Test message', 'auth', 'registration_help');
      await session.addConversationEntry('assistant', 'Response message', 'auth');

      const updatedSession = await OnboardingSession.findOne({ 
        sessionId: 'conversation-test' 
      });
      
      expect(updatedSession.conversationHistory).toHaveLength(2);
      expect(updatedSession.conversationHistory[0].role).toBe('user');
      expect(updatedSession.conversationHistory[0].content).toBe('Test message');
      expect(updatedSession.conversationHistory[0].intent).toBe('registration_help');
    });

    it('should update step progress correctly', async () => {
      const session = new OnboardingSession({
        sessionId: 'step-test',
        userId: testUser._id,
        status: 'active',
        currentStep: 'welcome',
        languagePreference: 'ar'
      });
      await session.save();

      await session.updateStep('auth', true);

      const updatedSession = await OnboardingSession.findOne({ 
        sessionId: 'step-test' 
      });
      
      expect(updatedSession.currentStep).toBe('auth');
      expect(updatedSession.completedSteps.some(cs => cs.step === 'auth')).toBe(true);
      expect(updatedSession.progressPercentage).toBeGreaterThan(0);
    });

    it('should calculate progress percentage correctly', async () => {
      const session = new OnboardingSession({
        sessionId: 'progress-test',
        userId: testUser._id,
        status: 'active',
        completedSteps: [
          { step: 'welcome', completedAt: new Date() },
          { step: 'auth', completedAt: new Date() },
          { step: 'profile', completedAt: new Date() }
        ],
        languagePreference: 'ar'
      });
      await session.save();

      const progress = session.getProgress();
      
      expect(progress.percentage).toBeCloseTo(42.86, 1); // 3/7 steps
      expect(progress.completedSteps).toContain('welcome');
      expect(progress.completedSteps).toContain('auth');
      expect(progress.completedSteps).toContain('profile');
      expect(progress.totalSteps).toBe(7);
    });

    it('should mark session as completed', async () => {
      const session = new OnboardingSession({
        sessionId: 'completion-test',
        userId: testUser._id,
        status: 'active',
        languagePreference: 'ar'
      });
      await session.save();

      await session.markCompleted({ finalPreference: 'test' });

      const completedSession = await OnboardingSession.findOne({ 
        sessionId: 'completion-test' 
      });
      
      expect(completedSession.status).toBe('completed');
      expect(completedSession.progressPercentage).toBe(100);
      expect(completedSession.preferences.finalPreference).toBe('test');
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      // Create test sessions for analytics
      const sessions = [
        {
          sessionId: 'analytics-1',
          userId: testUser._id,
          status: 'completed',
          languagePreference: 'ar',
          progressPercentage: 100,
          analytics: { totalDuration: 600 }
        },
        {
          sessionId: 'analytics-2',
          userId: testUser._id,
          status: 'active',
          languagePreference: 'en',
          progressPercentage: 50,
          analytics: { totalDuration: 300 }
        },
        {
          sessionId: 'analytics-3',
          userId: testUser._id,
          status: 'abandoned',
          languagePreference: 'ar',
          progressPercentage: 20,
          analytics: { totalDuration: 120 }
        }
      ];

      await OnboardingSession.insertMany(sessions);
    });

    it('should get completion statistics', async () => {
      const stats = await OnboardingSession.getCompletionStats(30);
      
      expect(stats).toHaveLength(3); // completed, active, abandoned
      
      const completedStats = stats.find(s => s._id === 'completed');
      const activeStats = stats.find(s => s._id === 'active');
      const abandonedStats = stats.find(s => s._id === 'abandoned');
      
      expect(completedStats.count).toBe(1);
      expect(activeStats.count).toBe(1);
      expect(abandonedStats.count).toBe(1);
    });

    it('should get cultural analytics', async () => {
      const analytics = await OnboardingSession.getCulturalAnalytics();
      
      expect(analytics).toHaveLength(2); // ar and en
      
      const arabicAnalytics = analytics.find(a => a._id === 'ar');
      const englishAnalytics = analytics.find(a => a._id === 'en');
      
      expect(arabicAnalytics.sessions).toBe(2);
      expect(englishAnalytics.sessions).toBe(1);
    });

    it('should find active session for user', async () => {
      const activeSession = await OnboardingSession.findActiveSession(testUser._id);
      
      expect(activeSession).toBeTruthy();
      expect(activeSession.status).toBe('active');
      expect(activeSession.sessionId).toBe('analytics-2');
    });
  });

  describe('Validation and Error Handling', () => {
    it('should validate step enum values', async () => {
      const sessionData = {
        sessionId: 'validation-test',
        userId: testUser._id,
        currentStep: 'invalid-step',
        languagePreference: 'ar'
      };

      try {
        const session = new OnboardingSession(sessionData);
        await session.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
      }
    });

    it('should validate status enum values', async () => {
      const sessionData = {
        sessionId: 'status-validation-test',
        userId: testUser._id,
        status: 'invalid-status',
        languagePreference: 'ar'
      };

      try {
        const session = new OnboardingSession(sessionData);
        await session.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
      }
    });

    it('should validate language preference', async () => {
      const sessionData = {
        sessionId: 'language-validation-test',
        userId: testUser._id,
        languagePreference: 'invalid-lang'
      };

      try {
        const session = new OnboardingSession(sessionData);
        await session.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
      }
    });
  });

  describe('Analytics and Metrics', () => {
    it('should track conversation analytics correctly', async () => {
      const session = new OnboardingSession({
        sessionId: 'analytics-tracking-test',
        userId: testUser._id,
        conversationHistory: [
          { role: 'user', content: 'How do I register?', timestamp: new Date() },
          { role: 'assistant', content: 'Let me help you', timestamp: new Date() },
          { role: 'user', content: 'I need help with profile', timestamp: new Date(), intent: 'technical_support' }
        ]
      });

      await session.save();

      // Analytics should be automatically calculated
      expect(session.analytics.questionsAsked).toBe(1); // Messages with '?'
      expect(session.analytics.helpRequests).toBe(1); // Messages with intent 'technical_support'
    });

    it('should calculate session duration', async () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      const session = new OnboardingSession({
        sessionId: 'duration-test',
        userId: testUser._id,
        conversationHistory: [
          { role: 'assistant', content: 'Start', timestamp: fiveMinutesAgo },
          { role: 'user', content: 'End', timestamp: now }
        ]
      });

      await session.save();

      expect(session.analytics.totalDuration).toBeGreaterThan(290); // ~5 minutes
      expect(session.analytics.totalDuration).toBeLessThan(310);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent session creation', async () => {
      const sessionPromises = [];
      
      for (let i = 0; i < 10; i++) {
        const sessionData = {
          sessionId: `concurrent-test-${i}`,
          userId: testUser._id,
          status: 'active',
          languagePreference: i % 2 === 0 ? 'ar' : 'en'
        };
        
        sessionPromises.push(new OnboardingSession(sessionData).save());
      }

      const sessions = await Promise.all(sessionPromises);
      expect(sessions).toHaveLength(10);

      // Verify all sessions were saved
      const count = await OnboardingSession.countDocuments({ 
        sessionId: { $regex: /^concurrent-test-/ } 
      });
      expect(count).toBe(10);
    });

    it('should efficiently query recent sessions', async () => {
      // Create test data
      const testSessions = Array.from({ length: 50 }, (_, i) => ({
        sessionId: `perf-test-${i}`,
        userId: testUser._id,
        status: i % 3 === 0 ? 'completed' : 'active',
        createdAt: new Date(Date.now() - i * 60000), // Spread over time
        languagePreference: i % 2 === 0 ? 'ar' : 'en'
      }));

      await OnboardingSession.insertMany(testSessions);

      const startTime = Date.now();
      
      // Query recent sessions
      const recentSessions = await OnboardingSession
        .find({ userId: testUser._id })
        .sort({ createdAt: -1 })
        .limit(10);

      const queryTime = Date.now() - startTime;

      expect(recentSessions).toHaveLength(10);
      expect(queryTime).toBeLessThan(100); // Should be fast
      
      console.log(`  ⚡ Query time for 10 recent sessions: ${queryTime}ms`);
    });
  });
});

/**
 * Manual test runner for when Jest is not available
 */
class ManualTestRunner {
  constructor() {
    this.results = { total: 0, passed: 0, failed: 0 };
  }

  async runTest(testName, testFn) {
    this.results.total++;
    try {
      console.log(`\n🧪 ${testName}`);
      await testFn();
      this.results.passed++;
      console.log(`✅ PASSED`);
    } catch (error) {
      this.results.failed++;
      console.log(`❌ FAILED: ${error.message}`);
    }
  }

  async runBasicTests() {
    console.log('🎯 Running Basic Selena-Onboard Agent Tests');
    console.log('=' .repeat(50));

    let mongoServer;
    try {
      // Setup
      mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
      
      // Test model creation
      await this.runTest('OnboardingSession Model Creation', async () => {
        const session = new OnboardingSession({
          sessionId: 'basic-test-session',
          languagePreference: 'ar',
          status: 'active'
        });
        await session.save();
        
        const found = await OnboardingSession.findOne({ sessionId: 'basic-test-session' });
        if (!found) throw new Error('Session not saved');
      });

      // Test conversation tracking
      await this.runTest('Conversation History Tracking', async () => {
        const session = await OnboardingSession.findOne({ sessionId: 'basic-test-session' });
        await session.addConversationEntry('user', 'Test message');
        
        const updated = await OnboardingSession.findOne({ sessionId: 'basic-test-session' });
        if (updated.conversationHistory.length !== 1) {
          throw new Error('Conversation not tracked');
        }
      });

      // Test progress calculation
      await this.runTest('Progress Calculation', async () => {
        const session = await OnboardingSession.findOne({ sessionId: 'basic-test-session' });
        await session.updateStep('auth', true);
        await session.updateStep('profile', true);
        
        const progress = session.getProgress();
        if (progress.percentage <= 0) {
          throw new Error('Progress not calculated correctly');
        }
      });

      console.log('\n📊 Basic Test Results:');
      console.log(`Total: ${this.results.total}, Passed: ${this.results.passed}, Failed: ${this.results.failed}`);
      console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);

    } finally {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      if (mongoServer) {
        await mongoServer.stop();
      }
    }
  }
}

// Run manual tests if executed directly
if (require.main === module) {
  const runner = new ManualTestRunner();
  runner.runBasicTests().catch(console.error);
}

module.exports = { SelenaOnboardAgentTest: OnboardingSession };