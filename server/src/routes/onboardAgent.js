const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticate } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');
const OnboardingSession = require('../models/OnboardingSession');

// Agent service URL from environment
const AGENTS_API_URL = process.env.AGENTS_API_URL || 'http://localhost:8000';

/**
 * Start a new onboarding session with Selena
 */
router.post('/start-session', async (req, res) => {
  try {
    const { language = 'ar', user_context = {} } = req.body;
    const user_id = req.user?.id; // Optional, might be anonymous
    
    // Call the Python agents API
    const response = await axios.post(`${AGENTS_API_URL}/agents/onboard/start-session`, {
      user_id,
      language,
      user_context: {
        ...user_context,
        source: 'ludus_backend',
        timestamp: new Date().toISOString()
      }
    });
    
    // Also create MongoDB session record for persistence
    const sessionData = {
      sessionId: response.data.session_id,
      userId: user_id,
      status: 'active',
      currentStep: response.data.current_step,
      languagePreference: language,
      preferences: user_context,
      conversationHistory: [{
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date(),
        step: response.data.current_step
      }],
      progressPercentage: response.data.progress || 0,
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        ...user_context
      }
    };
    
    const session = new OnboardingSession(sessionData);
    await session.save();
    
    res.json({
      success: true,
      session_id: response.data.session_id,
      message: response.data.message,
      progress: response.data.progress,
      current_step: response.data.current_step,
      agent_name: 'Selena'
    });
    
  } catch (error) {
    console.error('Start onboarding session error:', error);
    
    // Fallback response if agents service is down
    const fallbackMessage = language === 'ar' ? 
      'مرحباً! أنا سيلينا، مرشدتك في لودوس. كيف يمكنني مساعدتك في التسجيل؟' :
      'Hello! I\'m Selena, your LUDUS guide. How can I help you with registration?';
    
    res.status(500).json({
      success: false,
      message: 'Failed to start onboarding session',
      fallback_message: fallbackMessage,
      error: error.message
    });
  }
});

/**
 * Send message to Selena for onboarding help
 */
router.post('/chat', [
  body('message').notEmpty().trim(),
  body('session_id').optional().isString(),
  body('language').optional().isIn(['ar', 'en']),
  body('current_step').optional().isIn(['welcome', 'socialProof', 'auth', 'profile', 'referral', 'interests', 'preferences'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { message, session_id, language = 'ar', current_step, user_context = {} } = req.body;
    const user_id = req.user?.id;
    
    // Call the Python agents API
    const response = await axios.post(`${AGENTS_API_URL}/agents/onboard/registration-help`, {
      message,
      session_id,
      user_id,
      language,
      current_step,
      user_context: {
        ...user_context,
        source: 'ludus_backend',
        authenticated: !!user_id
      }
    });
    
    // Update MongoDB session if it exists
    if (session_id) {
      try {
        const session = await OnboardingSession.findOne({ sessionId: session_id });
        if (session) {
          await session.addConversationEntry('user', message, current_step, null, user_context);
          await session.addConversationEntry('assistant', response.data.message, current_step);
        }
      } catch (dbError) {
        console.error('Error updating session in MongoDB:', dbError);
        // Continue even if DB update fails
      }
    }
    
    res.json({
      success: true,
      ...response.data,
      agent_name: 'Selena'
    });
    
  } catch (error) {
    console.error('Onboard chat error:', error);
    
    // Provide intelligent fallback based on message content
    const message_lower = req.body.message?.toLowerCase() || '';
    const language = req.body.language || 'ar';
    
    let fallbackResponse = '';
    
    if (message_lower.includes('تسجيل') || message_lower.includes('register')) {
      fallbackResponse = language === 'ar' ?
        'أفهم أنك تحتاج مساعدة في التسجيل. يمكنك النقر على "إنشاء حساب" لبدء العملية، أو استخدام حساب جوجل للتسجيل السريع.' :
        'I understand you need help with registration. You can click "Create Account" to start the process, or use Google account for quick registration.';
    } else if (message_lower.includes('ملف') || message_lower.includes('profile')) {
      fallbackResponse = language === 'ar' ?
        'لإعداد ملفك الشخصي، أضف صورة مناسبة واكتب نبذة مختصرة عن اهتماماتك. هذا يساعد الآخرين في التعرف عليك.' :
        'To set up your profile, add an appropriate photo and write a brief bio about your interests. This helps others get to know you.';
    } else {
      fallbackResponse = language === 'ar' ?
        'أعتذر، أواجه صعوبة فنية مؤقتة. يمكنك المتابعة مع خطوات التسجيل أو المحاولة مرة أخرى لاحقاً.' :
        'Sorry, I\'m experiencing temporary technical difficulties. You can continue with registration steps or try again later.';
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to get onboarding help',
      fallback_response: fallbackResponse,
      error: error.message
    });
  }
});

/**
 * Get specific help for profile setup
 */
router.post('/profile-help', [
  body('message').optional().isString(),
  body('session_id').optional().isString(),
  body('language').optional().isIn(['ar', 'en'])
], async (req, res) => {
  try {
    const { message = 'I need help with profile setup', session_id, language = 'ar' } = req.body;
    const user_id = req.user?.id;
    
    const response = await axios.post(`${AGENTS_API_URL}/agents/onboard/profile-setup`, {
      message,
      session_id,
      user_id,
      language,
      user_context: {
        source: 'profile_help',
        authenticated: !!user_id
      }
    });
    
    res.json({
      success: true,
      ...response.data,
      agent_name: 'Selena'
    });
    
  } catch (error) {
    console.error('Profile help error:', error);
    
    const language = req.body.language || 'ar';
    const fallbackResponse = language === 'ar' ?
      'لإعداد ملف شخصي رائع: أضف صورة واضحة، اكتب نبذة مختصرة، وشارك اهتماماتك. يمكنك دائماً تعديل معلوماتك لاحقاً.' :
      'To create a great profile: add a clear photo, write a brief bio, and share your interests. You can always edit your information later.';
    
    res.status(500).json({
      success: false,
      message: 'Failed to get profile help',
      fallback_response: fallbackResponse,
      error: error.message
    });
  }
});

/**
 * Get platform features tour
 */
router.post('/feature-tour', [
  body('feature').optional().isString(),
  body('session_id').optional().isString(),
  body('language').optional().isIn(['ar', 'en'])
], async (req, res) => {
  try {
    const { feature, session_id, language = 'ar' } = req.body;
    const user_id = req.user?.id;
    
    const message = feature ? 
      `Tell me about ${feature}` : 
      'Show me the platform features';
    
    const response = await axios.post(`${AGENTS_API_URL}/agents/onboard/feature-tour`, {
      message,
      session_id,
      user_id,
      language,
      user_context: {
        source: 'feature_tour',
        requested_feature: feature
      }
    });
    
    res.json({
      success: true,
      ...response.data,
      agent_name: 'Selena'
    });
    
  } catch (error) {
    console.error('Feature tour error:', error);
    
    const language = req.body.language || 'ar';
    const fallbackResponse = language === 'ar' ?
      'لودوس يتيح لك اكتشاف أنشطة متنوعة، والحجز بأمان، والتواصل مع مجتمع رائع. ابدأ بتصفح الأنشطة القريبة منك!' :
      'LUDUS lets you discover diverse activities, book securely, and connect with an amazing community. Start by browsing activities near you!';
    
    res.status(500).json({
      success: false,
      message: 'Failed to get feature tour',
      fallback_response: fallbackResponse,
      error: error.message
    });
  }
});

/**
 * Complete onboarding session
 */
router.post('/complete', [
  body('session_id').notEmpty().isString(),
  body('final_data').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { session_id, final_data = {} } = req.body;
    
    // Call the Python agents API
    const response = await axios.post(`${AGENTS_API_URL}/agents/onboard/complete-onboarding`, {
      session_id,
      final_data
    });
    
    // Update MongoDB session
    try {
      const session = await OnboardingSession.findOne({ sessionId: session_id });
      if (session) {
        await session.markCompleted(final_data);
      }
    } catch (dbError) {
      console.error('Error updating completed session in MongoDB:', dbError);
    }
    
    res.json({
      success: true,
      ...response.data,
      agent_name: 'Selena'
    });
    
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete onboarding session',
      error: error.message
    });
  }
});

/**
 * Get onboarding progress
 */
router.get('/progress/:session_id', [
  param('session_id').notEmpty().isString()
], async (req, res) => {
  try {
    const { session_id } = req.params;
    
    // Try to get from Python agents API first
    try {
      const response = await axios.get(`${AGENTS_API_URL}/agents/onboard/progress/${session_id}`);
      return res.json({
        success: true,
        ...response.data,
        source: 'agents_api'
      });
    } catch (agentError) {
      console.warn('Agents API unavailable, falling back to MongoDB:', agentError.message);
    }
    
    // Fallback to MongoDB
    const session = await OnboardingSession.findOne({ sessionId: session_id });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    const progress = session.getProgress();
    
    res.json({
      success: true,
      progress: {
        session_id: session.sessionId,
        user_id: session.userId,
        status: session.status,
        current_step: session.currentStep,
        completed_steps: session.completedSteps.map(cs => cs.step),
        progress_percentage: session.progressPercentage,
        language_preference: session.languagePreference,
        created_at: session.createdAt,
        updated_at: session.updatedAt
      },
      source: 'mongodb'
    });
    
  } catch (error) {
    console.error('Get onboard progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get onboarding progress',
      error: error.message
    });
  }
});

/**
 * Update onboarding step progress
 */
router.post('/update-step', [
  body('session_id').notEmpty().isString(),
  body('step').isIn(['welcome', 'socialProof', 'auth', 'profile', 'referral', 'interests', 'preferences']),
  body('completed').optional().isBoolean(),
  body('step_data').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { session_id, step, completed = false, step_data = {} } = req.body;
    
    // Update both Redis (via agents API) and MongoDB
    try {
      await axios.post(`${AGENTS_API_URL}/agents/onboard/update-step`, {
        session_id,
        step,
        completed
      });
    } catch (agentError) {
      console.warn('Agents API update failed:', agentError.message);
    }
    
    // Update MongoDB session
    const session = await OnboardingSession.findOne({ sessionId: session_id });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    await session.updateStep(step, completed);
    
    res.json({
      success: true,
      message: 'Step updated successfully',
      session_id,
      step,
      completed,
      progress: session.getProgress()
    });
    
  } catch (error) {
    console.error('Update onboard step error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update onboarding step',
      error: error.message
    });
  }
});

/**
 * Get onboarding analytics
 */
router.get('/analytics/:session_id', [
  param('session_id').notEmpty().isString()
], async (req, res) => {
  try {
    const { session_id } = req.params;
    
    // Try agents API first
    try {
      const response = await axios.get(`${AGENTS_API_URL}/agents/onboard/analytics/${session_id}`);
      return res.json({
        success: true,
        ...response.data,
        source: 'agents_api'
      });
    } catch (agentError) {
      console.warn('Agents API analytics unavailable:', agentError.message);
    }
    
    // Fallback to MongoDB analytics
    const session = await OnboardingSession.findOne({ sessionId: session_id });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    const analytics = {
      session_id: session.sessionId,
      duration_minutes: session.analytics.totalDuration / 60,
      total_messages: session.conversationHistory.length,
      user_messages: session.conversationHistory.filter(msg => msg.role === 'user').length,
      assistant_messages: session.conversationHistory.filter(msg => msg.role === 'assistant').length,
      progress_percentage: session.progressPercentage,
      completed_steps: session.completedSteps.length,
      language_preference: session.languagePreference,
      status: session.status,
      questions_asked: session.analytics.questionsAsked,
      help_requests: session.analytics.helpRequests,
      cultural_tips_provided: session.analytics.culturalTipsProvided
    };
    
    res.json({
      success: true,
      analytics,
      source: 'mongodb'
    });
    
  } catch (error) {
    console.error('Get onboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get onboarding analytics',
      error: error.message
    });
  }
});

/**
 * Get all onboarding sessions analytics (admin only)
 */
router.get('/admin/analytics', authenticate, async (req, res) => {
  try {
    const { days = 7, language, status } = req.query;
    
    // Build query filters
    const filters = {};
    if (language) filters.languagePreference = language;
    if (status) filters.status = status;
    
    // Date range filter
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    filters.createdAt = { $gte: startDate };
    
    // Get completion statistics
    const completionStats = await OnboardingSession.getCompletionStats(parseInt(days));
    const culturalAnalytics = await OnboardingSession.getCulturalAnalytics();
    
    // Get detailed session data
    const sessions = await OnboardingSession.find(filters)
      .select('sessionId status progressPercentage languagePreference analytics createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(100);
    
    const analytics = {
      period: `${days} days`,
      total_sessions: sessions.length,
      completion_stats: completionStats,
      cultural_analytics: culturalAnalytics,
      avg_progress: sessions.reduce((sum, s) => sum + s.progressPercentage, 0) / sessions.length || 0,
      language_distribution: {
        arabic: sessions.filter(s => s.languagePreference === 'ar').length,
        english: sessions.filter(s => s.languagePreference === 'en').length
      },
      status_distribution: {
        active: sessions.filter(s => s.status === 'active').length,
        completed: sessions.filter(s => s.status === 'completed').length,
        abandoned: sessions.filter(s => s.status === 'abandoned').length
      },
      recent_sessions: sessions.slice(0, 10).map(s => ({
        session_id: s.sessionId,
        status: s.status,
        progress: s.progressPercentage,
        language: s.languagePreference,
        created_at: s.createdAt,
        duration_minutes: s.analytics.totalDuration / 60
      }))
    };
    
    res.json({
      success: true,
      analytics
    });
    
  } catch (error) {
    console.error('Get admin onboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get onboarding analytics',
      error: error.message
    });
  }
});

/**
 * Get cultural insights from onboarding sessions (admin only)
 */
router.get('/admin/cultural-insights', authenticate, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Aggregate cultural insights
    const insights = await OnboardingSession.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['completed', 'active'] }
        }
      },
      {
        $group: {
          _id: '$languagePreference',
          sessions: { $sum: 1 },
          avgProgress: { $avg: '$progressPercentage' },
          avgDuration: { $avg: '$analytics.totalDuration' },
          avgCulturalTips: { $avg: '$analytics.culturalTipsProvided' },
          avgQuestions: { $avg: '$analytics.questionsAsked' },
          completionRate: {
            $avg: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);
    
    // Get most common help topics
    const helpTopics = await OnboardingSession.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          'conversationHistory.intent': { $exists: true }
        }
      },
      {
        $unwind: '$conversationHistory'
      },
      {
        $match: {
          'conversationHistory.role': 'user',
          'conversationHistory.intent': { $exists: true }
        }
      },
      {
        $group: {
          _id: {
            intent: '$conversationHistory.intent',
            language: '$languagePreference'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 20
      }
    ]);
    
    res.json({
      success: true,
      insights: {
        period: `${days} days`,
        language_insights: insights,
        help_topics: helpTopics,
        recommendations: {
          ar: insights.find(i => i._id === 'ar')?.avgCulturalTips > 2 ? 
            'المستخدمون العرب يطلبون نصائح ثقافية أكثر، يُنصح بتوسيع المحتوى الثقافي' :
            'مستوى النصائح الثقافية مناسب للمستخدمين العرب',
          en: insights.find(i => i._id === 'en')?.avgDuration > 600 ? 
            'English users take longer to complete onboarding, consider simplifying steps' :
            'English onboarding duration is within acceptable range'
        }
      }
    });
    
  } catch (error) {
    console.error('Get cultural insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cultural insights',
      error: error.message
    });
  }
});

/**
 * Reset onboarding session (admin only)
 */
router.post('/admin/reset-session', authenticate, [
  body('session_id').notEmpty().isString()
], async (req, res) => {
  try {
    const { session_id } = req.body;
    
    const session = await OnboardingSession.findOne({ sessionId: session_id });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    // Reset session state
    session.status = 'active';
    session.currentStep = 'welcome';
    session.completedSteps = [];
    session.progressPercentage = 0;
    session.conversationHistory = [];
    session.analytics = {
      stepDurations: new Map(),
      totalDuration: 0,
      questionsAsked: 0,
      helpRequests: 0,
      dropOffPoints: [],
      culturalTipsProvided: 0,
      languageSwitches: 0
    };
    
    await session.save();
    
    res.json({
      success: true,
      message: 'Onboarding session reset successfully',
      session_id
    });
    
  } catch (error) {
    console.error('Reset onboarding session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset onboarding session',
      error: error.message
    });
  }
});

module.exports = router;