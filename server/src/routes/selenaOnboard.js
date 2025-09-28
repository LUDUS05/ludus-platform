/**
 * @fileoverview API routes for Selena-Onboard AI agent integration.
 * 
 * Purpose: Provides RESTful API endpoints for the Selena-Onboard AI agent,
 * integrating with the existing LUDUS onboarding system while adding
 * AI-powered assistance for new users.
 * 
 * Business Context: These routes enable the frontend to communicate with
 * the Selena-Onboard Python agent service, providing personalized onboarding
 * assistance for Saudi Arabian users with cultural sensitivity and bilingual support.
 * 
 * @version 1.0.0
 * @since 2025-09-28
 * @author LUDUS Development Team - Selena-Onboard Implementation
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const axios = require('axios');
const OnboardingSession = require('../models/OnboardingSession');
const User = require('../models/User');
const logger = require('../utils/logger');

// Agent service configuration
const AGENTS_API_URL = process.env.AGENTS_API_URL || 'https://ludus-agents-api.onrender.com';

/**
 * Start a new Selena-Onboard session
 * 
 * Creates a new onboarding session with the AI agent and initializes
 * session tracking in both Redis (agent service) and MongoDB (backend).
 * 
 * @route POST /api/selena/start-session
 * @access Public (no authentication required for anonymous sessions)
 */
router.post('/start-session', [
  body('language').optional().isIn(['ar', 'en']),
  body('cultural_context').optional().isIn(['saudi', 'international'])
], async (req, res) => {
  try {
    const { language = 'ar', cultural_context = 'saudi' } = req.body;
    const user_id = req.user?.id || null;
    
    // Call Selena-Onboard agent service
    const agentResponse = await axios.post(`${AGENTS_API_URL}/agents/onboard/start-session`, {
      user_id,
      language,
      cultural_context
    }, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    const sessionData = agentResponse.data;
    
    // Store session in MongoDB for tracking
    const onboardingSession = new OnboardingSession({
      sessionId: sessionData.session_id,
      userId: user_id,
      language,
      culturalContext: cultural_context,
      currentStep: sessionData.current_step,
      completedSteps: [],
      totalInteractions: 1,
      lastInteractionAt: new Date()
    });
    
    await onboardingSession.save();
    
    logger.info({
      sessionId: sessionData.session_id,
      userId: user_id,
      language,
      step: sessionData.current_step
    }, 'Selena-Onboard session started');
    
    res.json({
      success: true,
      session: sessionData,
      analytics: {
        sessionId: sessionData.session_id,
        progressPercentage: sessionData.progress_percentage,
        currentStep: sessionData.current_step
      }
    });
    
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to start Selena-Onboard session');
    
    // Fallback response if agent service is unavailable
    const fallbackMessage = language === 'ar' 
      ? 'مرحباً بك في لودوس! أنا سيلينا، مساعدتك في إعداد الحساب. كيف يمكنني مساعدتك؟'
      : 'Welcome to LUDUS! I\'m Selena, your onboarding assistant. How can I help you?';
    
    res.json({
      success: true,
      session: {
        session_id: `fallback_${Date.now()}`,
        message: fallbackMessage,
        suggestions: language === 'ar' ? ['إنشاء حساب', 'المساعدة'] : ['Create account', 'Get help'],
        current_step: 'welcome',
        progress_percentage: 10,
        fallback: true
      }
    });
  }
});

/**
 * Get registration assistance from Selena
 * 
 * Provides step-by-step registration guidance including password requirements,
 * email validation, and error resolution with cultural sensitivity.
 * 
 * @route POST /api/selena/registration-help
 * @access Public
 */
router.post('/registration-help', [
  body('message').notEmpty().withMessage('Message is required'),
  body('session_id').notEmpty().withMessage('Session ID is required'),
  body('language').optional().isIn(['ar', 'en'])
], async (req, res) => {
  try {
    const { message, session_id, language = 'ar' } = req.body;
    
    // Call Selena-Onboard agent service
    const agentResponse = await axios.post(`${AGENTS_API_URL}/agents/onboard/registration-help`, {
      message,
      session_id,
      language
    }, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    const responseData = agentResponse.data;
    
    // Update MongoDB session tracking
    await OnboardingSession.updateOne(
      { sessionId: session_id },
      { 
        $set: {
          currentStep: responseData.current_step,
          lastInteractionAt: new Date(),
          language
        },
        $inc: { totalInteractions: 1 },
        $push: {
          'analytics.helpTopicsRequested': {
            topic: 'registration',
            requestedAt: new Date(),
            language
          }
        }
      }
    );
    
    logger.info({
      sessionId: session_id,
      step: responseData.current_step,
      language,
      helpTopic: 'registration'
    }, 'Registration help provided by Selena');
    
    res.json({
      success: true,
      response: responseData
    });
    
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to get registration help from Selena');
    
    const fallbackMessage = language === 'ar'
      ? 'أعتذر، أواجه صعوبة في الوصول لخدمة المساعدة حالياً. يمكنك المحاولة مرة أخرى أو التواصل مع الدعم الفني.'
      : 'Sorry, I\'m having trouble accessing the help service right now. You can try again or contact technical support.';
    
    res.status(500).json({
      success: false,
      message: fallbackMessage,
      error: 'Agent service unavailable'
    });
  }
});

/**
 * Get profile setup assistance from Selena
 * 
 * Provides guidance for profile creation, photo upload, preferences setup,
 * and privacy configuration with cultural considerations.
 * 
 * @route POST /api/selena/profile-setup  
 * @access Public (session-based)
 */
router.post('/profile-setup', [
  body('message').notEmpty().withMessage('Message is required'),
  body('session_id').notEmpty().withMessage('Session ID is required'),
  body('language').optional().isIn(['ar', 'en'])
], async (req, res) => {
  try {
    const { message, session_id, language = 'ar' } = req.body;
    
    // Call Selena-Onboard agent service
    const agentResponse = await axios.post(`${AGENTS_API_URL}/agents/onboard/profile-setup`, {
      message,
      session_id,
      language
    }, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    const responseData = agentResponse.data;
    
    // Update MongoDB session tracking
    await OnboardingSession.updateOne(
      { sessionId: session_id },
      { 
        $set: {
          currentStep: responseData.current_step,
          lastInteractionAt: new Date()
        },
        $inc: { totalInteractions: 1 },
        $addToSet: { completedSteps: 'profile_setup' },
        $push: {
          'analytics.helpTopicsRequested': {
            topic: 'profile_setup',
            requestedAt: new Date(),
            language
          }
        }
      }
    );
    
    logger.info({
      sessionId: session_id,
      step: responseData.current_step,
      language,
      helpTopic: 'profile_setup'
    }, 'Profile setup help provided by Selena');
    
    res.json({
      success: true,
      response: responseData
    });
    
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to get profile setup help from Selena');
    
    const fallbackMessage = language === 'ar'
      ? 'أعتذر، أواجه صعوبة في تقديم المساعدة حالياً. يمكنك ملء الملف الشخصي يدوياً أو المحاولة مرة أخرى.'
      : 'Sorry, I\'m having trouble providing help right now. You can fill out the profile manually or try again.';
    
    res.status(500).json({
      success: false,
      message: fallbackMessage,
      error: 'Agent service unavailable'
    });
  }
});

/**
 * Get platform feature tour from Selena
 * 
 * Provides comprehensive walkthrough of LUDUS platform features including
 * activity search, booking system, rewards program, and community features.
 * 
 * @route POST /api/selena/feature-tour
 * @access Public (session-based)
 */
router.post('/feature-tour', [
  body('message').optional().isString(),
  body('session_id').notEmpty().withMessage('Session ID is required'),
  body('language').optional().isIn(['ar', 'en'])
], async (req, res) => {
  try {
    const { message = '', session_id, language = 'ar' } = req.body;
    
    // Call Selena-Onboard agent service
    const agentResponse = await axios.post(`${AGENTS_API_URL}/agents/onboard/feature-tour`, {
      message,
      session_id,
      language
    }, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    const responseData = agentResponse.data;
    
    // Update MongoDB session tracking
    await OnboardingSession.updateOne(
      { sessionId: session_id },
      { 
        $set: {
          currentStep: responseData.current_step,
          lastInteractionAt: new Date()
        },
        $inc: { totalInteractions: 1 },
        $addToSet: { completedSteps: 'feature_tour' },
        $push: {
          'analytics.helpTopicsRequested': {
            topic: 'feature_tour',
            requestedAt: new Date(),
            language
          }
        }
      }
    );
    
    logger.info({
      sessionId: session_id,
      step: responseData.current_step,
      language,
      helpTopic: 'feature_tour'
    }, 'Feature tour provided by Selena');
    
    res.json({
      success: true,
      response: responseData
    });
    
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to get feature tour from Selena');
    
    const fallbackMessage = language === 'ar'
      ? 'أعتذر، لا أستطيع تقديم الجولة حالياً. يمكنك استكشاف المنصة بنفسك أو زيارة صفحة "كيف تعمل المنصة".'
      : 'Sorry, I can\'t provide the tour right now. You can explore the platform yourself or visit the "How it Works" page.';
    
    res.status(500).json({
      success: false,
      message: fallbackMessage,
      error: 'Agent service unavailable'
    });
  }
});

/**
 * Get cultural guidance from Selena
 * 
 * Provides Saudi Arabia-specific cultural guidance for activities,
 * prayer time considerations, family-friendly options, and local customs.
 * 
 * @route POST /api/selena/cultural-guidance
 * @access Public (session-based)
 */
router.post('/cultural-guidance', [
  body('message').optional().isString(),
  body('session_id').notEmpty().withMessage('Session ID is required'),
  body('language').optional().isIn(['ar', 'en'])
], async (req, res) => {
  try {
    const { message = '', session_id, language = 'ar' } = req.body;
    
    // Call Selena-Onboard agent service
    const agentResponse = await axios.post(`${AGENTS_API_URL}/agents/onboard/cultural-guidance`, {
      message,
      session_id,
      language
    }, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    const responseData = agentResponse.data;
    
    // Update MongoDB session tracking
    await OnboardingSession.updateOne(
      { sessionId: session_id },
      { 
        $set: {
          currentStep: responseData.current_step,
          lastInteractionAt: new Date()
        },
        $inc: { totalInteractions: 1 },
        $addToSet: { completedSteps: 'cultural_orientation' },
        $push: {
          'analytics.helpTopicsRequested': {
            topic: 'cultural_guidance',
            requestedAt: new Date(),
            language
          }
        }
      }
    );
    
    logger.info({
      sessionId: session_id,
      step: responseData.current_step,
      language,
      helpTopic: 'cultural_guidance'
    }, 'Cultural guidance provided by Selena');
    
    res.json({
      success: true,
      response: responseData
    });
    
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to get cultural guidance from Selena');
    
    const fallbackMessage = language === 'ar'
      ? 'أعتذر، لا أستطيع تقديم التوجيه الثقافي حالياً. جميع أنشطة لودوس مناسبة للثقافة السعودية وتراعي أوقات الصلاة.'
      : 'Sorry, I can\'t provide cultural guidance right now. All LUDUS activities are culturally appropriate for Saudi Arabia and respect prayer times.';
    
    res.status(500).json({
      success: false,
      message: fallbackMessage,
      error: 'Agent service unavailable'
    });
  }
});

/**
 * Complete onboarding with Selena
 * 
 * Finalizes the onboarding process, awards welcome bonuses,
 * and integrates with the existing user onboarding system.
 * 
 * @route POST /api/selena/complete-onboarding
 * @access Public (session-based, optional authentication)
 */
router.post('/complete-onboarding', [
  body('session_id').notEmpty().withMessage('Session ID is required'),
  body('final_data').optional().isObject(),
  body('language').optional().isIn(['ar', 'en'])
], async (req, res) => {
  try {
    const { session_id, final_data = {}, language = 'ar' } = req.body;
    const user_id = req.user?.id || null;
    
    // Call Selena-Onboard agent service
    const agentResponse = await axios.post(`${AGENTS_API_URL}/agents/onboard/complete-onboarding`, {
      session_id,
      final_data,
      language
    }, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    const responseData = agentResponse.data;
    
    // Update MongoDB session as completed
    const session = await OnboardingSession.findOneAndUpdate(
      { sessionId: session_id },
      { 
        $set: {
          isCompleted: true,
          completedAt: new Date(),
          currentStep: 'completion',
          finalData: final_data,
          mongodbSyncStatus: 'synced'
        },
        $inc: { totalInteractions: 1 }
      },
      { new: true }
    );
    
    // If user is authenticated, update their onboarding status
    if (user_id && session) {
      const user = await User.findById(user_id);
      if (user) {
        // Mark onboarding as completed
        user.onboardingCompleted = true;
        user.onboardingCompletedAt = new Date();
        
        // Award Selena-assisted onboarding bonus
        user.onboardingGamification = user.onboardingGamification || { points: 0, badges: [] };
        user.onboardingGamification.points += 150; // Bonus for AI-assisted onboarding
        
        if (!user.onboardingGamification.badges.includes('ai_onboarding_complete')) {
          user.onboardingGamification.badges.push('ai_onboarding_complete');
        }
        
        // Apply final preferences if provided
        if (final_data.preferences) {
          user.preferences = { ...user.preferences, ...final_data.preferences };
        }
        
        await user.save();
        
        logger.info({
          userId: user_id,
          sessionId: session_id,
          completionTime: session.completionDuration,
          language
        }, 'User completed AI-assisted onboarding');
      }
    }
    
    res.json({
      success: true,
      response: responseData,
      analytics: {
        completionTime: session?.completionDuration,
        totalInteractions: session?.totalInteractions,
        progressPercentage: 100
      }
    });
    
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to complete onboarding with Selena');
    
    const fallbackMessage = language === 'ar'
      ? 'تهانينا! تم إكمال الإعداد بنجاح. مرحباً بك في مجتمع لودوس!'
      : 'Congratulations! Setup completed successfully. Welcome to the LUDUS community!';
    
    res.json({
      success: true,
      response: {
        message: fallbackMessage,
        current_step: 'completed',
        progress_percentage: 100
      },
      fallback: true
    });
  }
});

/**
 * Get onboarding progress for a user
 * 
 * Retrieves comprehensive onboarding progress including steps completed,
 * time spent, and analytics data from both agent service and local database.
 * 
 * @route GET /api/selena/progress/:user_id
 * @access Private (requires authentication or admin access)
 */
router.get('/progress/:user_id', [
  param('user_id').isMongoId().withMessage('Valid user ID is required')
], authenticate, async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // Check permission (user can only see their own progress, admins can see any)
    if (req.user.id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this progress'
      });
    }
    
    // Get progress from agent service
    let agentProgress = null;
    try {
      const agentResponse = await axios.get(`${AGENTS_API_URL}/agents/onboard/progress/${user_id}`, {
        timeout: 5000
      });
      agentProgress = agentResponse.data?.progress;
    } catch (error) {
      logger.warn({ userId: user_id, error: error.message }, 'Could not fetch progress from agent service');
    }
    
    // Get progress from MongoDB
    const sessions = await OnboardingSession.find({ userId: user_id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    const latestSession = sessions[0];
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.isCompleted).length;
    
    // Get user's current onboarding status
    const user = await User.findById(user_id)
      .select('onboardingCompleted onboardingCompletedAt onboardingProgress onboardingGamification');
    
    const progressData = {
      user: {
        onboardingCompleted: user?.onboardingCompleted || false,
        onboardingCompletedAt: user?.onboardingCompletedAt,
        gamification: user?.onboardingGamification
      },
      sessions: {
        total: totalSessions,
        completed: completedSessions,
        latest: latestSession ? {
          sessionId: latestSession.sessionId,
          currentStep: latestSession.currentStep,
          progressPercentage: latestSession.progressPercentage,
          language: latestSession.language,
          totalInteractions: latestSession.totalInteractions,
          isCompleted: latestSession.isCompleted,
          completionDuration: latestSession.completionDuration
        } : null
      },
      agentService: agentProgress
    };
    
    res.json({
      success: true,
      progress: progressData
    });
    
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to get onboarding progress');
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve onboarding progress'
    });
  }
});

/**
 * Get onboarding analytics (admin only)
 * 
 * Provides comprehensive analytics about the Selena-Onboard agent performance
 * including completion rates, average time, language distribution, and step analysis.
 * 
 * @route GET /api/selena/analytics
 * @access Private (admin only)
 */
router.get('/analytics', authenticate, async (req, res) => {
  try {
    // Check admin permission
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    const { timeframe = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }
    
    // Get analytics from MongoDB
    const analytics = await Promise.all([
      OnboardingSession.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          completedSessions: { $sum: { $cond: ['$isCompleted', 1, 0] } },
          averageInteractions: { $avg: '$totalInteractions' },
          averageCompletionTime: { 
            $avg: { 
              $cond: [
                { $and: ['$isCompleted', { $ne: ['$completionDuration', null] }] },
                '$completionDuration',
                null
              ]
            }
          }
        }}
      ]),
      
      OnboardingSession.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$language', count: { $sum: 1 } } }
      ]),
      
      OnboardingSession.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { 
          _id: '$currentStep',
          count: { $sum: 1 },
          completed: { $sum: { $cond: ['$isCompleted', 1, 0] } }
        }},
        { $addFields: {
          dropoffRate: { 
            $cond: [
              { $eq: ['$count', 0] },
              0,
              { $multiply: [{ $divide: [{ $subtract: ['$count', '$completed'] }, '$count'] }, 100] }
            ]
          }
        }}
      ])
    ]);
    
    const [overallStats, languageDistribution, stepAnalysis] = analytics;
    
    const analyticsData = {
      timeframe,
      period: {
        startDate: startDate.toISOString(),
        endDate: now.toISOString()
      },
      overall: overallStats[0] || {
        totalSessions: 0,
        completedSessions: 0,
        averageInteractions: 0,
        averageCompletionTime: 0
      },
      language: languageDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      steps: stepAnalysis,
      performance: {
        completionRate: overallStats[0] ? 
          ((overallStats[0].completedSessions / overallStats[0].totalSessions) * 100).toFixed(1) + '%' : 
          '0%',
        averageTime: overallStats[0]?.averageCompletionTime ? 
          Math.round(overallStats[0].averageCompletionTime) + ' minutes' : 
          'N/A'
      }
    };
    
    logger.info({
      timeframe,
      totalSessions: analyticsData.overall.totalSessions,
      completionRate: analyticsData.performance.completionRate
    }, 'Selena-Onboard analytics requested');
    
    res.json({
      success: true,
      analytics: analyticsData
    });
    
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to get Selena-Onboard analytics');
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics'
    });
  }
});

/**
 * Chat directly with Selena-Onboard agent
 * 
 * Provides direct chat interface with the Selena-Onboard agent for
 * flexible onboarding assistance and general queries.
 * 
 * @route POST /api/selena/chat
 * @access Public
 */
router.post('/chat', [
  body('message').notEmpty().withMessage('Message is required'),
  body('session_id').optional().isString(),
  body('language').optional().isIn(['ar', 'en'])
], async (req, res) => {
  try {
    const { message, session_id, language = 'ar' } = req.body;
    
    // Call general chat endpoint with onboard agent type
    const chatResponse = await axios.post(`${AGENTS_API_URL}/chat`, {
      message,
      session_id,
      language,
      agent_type: 'onboard'
    }, {
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    const responseData = chatResponse.data;
    
    // Update session tracking if session_id provided
    if (session_id) {
      await OnboardingSession.updateOne(
        { sessionId: session_id },
        { 
          $set: { lastInteractionAt: new Date() },
          $inc: { totalInteractions: 1 }
        }
      );
    }
    
    logger.info({
      sessionId: session_id || 'new',
      language,
      messageLength: message.length
    }, 'Selena chat interaction');
    
    res.json({
      success: true,
      response: {
        reply: responseData.reply,
        session_id: responseData.session_id,
        language: responseData.language,
        agent_type: responseData.agent_type
      }
    });
    
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to chat with Selena');
    
    const fallbackMessage = language === 'ar'
      ? 'مرحباً! أنا سيلينا، مساعدتك في لودوس. أعتذر، أواجه صعوبة تقنية حالياً. كيف يمكنني مساعدتك؟'
      : 'Hello! I\'m Selena, your LUDUS assistant. Sorry, I\'m having technical difficulties right now. How can I help you?';
    
    res.json({
      success: true,
      response: {
        reply: fallbackMessage,
        session_id: session_id || `fallback_${Date.now()}`,
        language,
        agent_type: 'onboard',
        fallback: true
      }
    });
  }
});

/**
 * Get session details
 * 
 * Retrieves detailed information about a specific onboarding session
 * including progress, interactions, and analytics.
 * 
 * @route GET /api/selena/session/:session_id
 * @access Public (session-based)
 */
router.get('/session/:session_id', [
  param('session_id').notEmpty().withMessage('Session ID is required')
], async (req, res) => {
  try {
    const { session_id } = req.params;
    
    // Get session from MongoDB
    const session = await OnboardingSession.findOne({ sessionId: session_id });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    // Prepare session data
    const sessionData = {
      sessionId: session.sessionId,
      userId: session.userId,
      language: session.language,
      culturalContext: session.culturalContext,
      currentStep: session.currentStep,
      completedSteps: session.completedSteps,
      progressPercentage: session.progressPercentage,
      totalInteractions: session.totalInteractions,
      isCompleted: session.isCompleted,
      completedAt: session.completedAt,
      completionDuration: session.completionDuration,
      createdAt: session.createdAt,
      analytics: {
        helpTopicsCount: session.analytics?.helpTopicsRequested?.length || 0,
        languageSwitches: session.analytics?.languageSwitches?.length || 0,
        errorEncounters: session.analytics?.errorEncounters?.length || 0
      }
    };
    
    res.json({
      success: true,
      session: sessionData
    });
    
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to get session details');
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve session details'
    });
  }
});

module.exports = router;