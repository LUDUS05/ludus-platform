/**
 * @fileoverview Discover routes for Selena-Discover AI Agent integration.
 * 
 * This module handles routing for the intelligent discovery system,
 * integrating with the Python-based Selena-Discover AI agent.
 * 
 * Features:
 * - Intelligent search with NLP processing
 * - Personalized recommendations
 * - Cultural context awareness
 * - Geographic proximity calculations
 * - Search analytics and learning
 * 
 * @version 1.0.0
 * @author LUDUS Development Team - Selena-Discover AI Agent
 * @since 2025-09-28
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const Activity = require('../models/Activity');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const SearchHistory = require('../models/SearchHistory');
const VenuePopularityMetrics = require('../models/VenuePopularityMetrics');
const UserSearchPreferences = require('../models/UserSearchPreferences');

// Selena-Discover AI Agent base URL
const AGENTS_API_URL = process.env.AGENTS_API_URL || 'http://localhost:8001';

/**
 * @desc    Intelligent AI-powered activity search
 * @route   POST /api/discover/search
 * @access  Public (with optional auth for personalization)
 */
router.post('/search', optionalAuth, async (req, res) => {
  try {
    const {
      query,
      location,
      price_range,
      date_preference,
      group_size,
      activity_types,
      cultural_preferences,
      language = 'ar'
    } = req.body;

    // Validate required fields
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: language.startsWith('ar') ? 
          'استعلام البحث مطلوب' : 
          'Search query is required'
      });
    }

    // Prepare user context
    const user_context = {
      user_id: req.user ? req.user._id.toString() : 'anonymous',
      location: req.user?.location,
      preferences: req.user?.preferences,
      search_history: []
    };

    // Get user's recent search history for personalization
    if (req.user) {
      const recentSearches = await SearchHistory.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      user_context.search_history = recentSearches;
    }

    // Call Selena-Discover AI agent
    const agentResponse = await axios.post(`${AGENTS_API_URL}/discover/search`, {
      query,
      location,
      price_range,
      date_preference,
      group_size,
      activity_types,
      cultural_preferences,
      user_context,
      language
    }, {
      params: { user_id: user_context.user_id },
      timeout: 10000
    });

    const discoveryData = agentResponse.data;

    // Enrich results with real database data
    const enrichedResults = await enrichSearchResults(discoveryData.results, language);

    // Save search history
    if (req.user) {
      await saveSearchHistory(req.user._id, {
        originalQuery: query,
        language,
        appliedFilters: {
          location,
          priceRange: price_range ? { min: price_range[0], max: price_range[1] } : null,
          datePreference: date_preference,
          groupSize: group_size,
          activityCategories: activity_types
        },
        searchResults: {
          totalResults: discoveryData.total_count,
          returnedResults: enrichedResults.length,
          resultIds: enrichedResults.map((result, index) => ({
            activity: result._id,
            rankPosition: index + 1,
            relevanceScore: result.relevance_score || 0,
            culturalFitScore: result.cultural_fit_score || 0
          }))
        },
        performanceMetrics: {
          searchTime: discoveryData.search_time_ms
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        search_id: discoveryData.search_id,
        activities: enrichedResults,
        total_count: discoveryData.total_count,
        search_time_ms: discoveryData.search_time_ms,
        personalized_insights: discoveryData.personalized_insights,
        cultural_recommendations: discoveryData.cultural_recommendations,
        trending_activities: discoveryData.trending_activities,
        search_suggestions: discoveryData.search_suggestions,
        geographic_clusters: discoveryData.geographic_clusters
      },
      meta: {
        query_analysis: discoveryData.query_analysis,
        filters_applied: discoveryData.filters_applied,
        agent: 'selena-discover',
        version: '1.0.0'
      }
    });

  } catch (error) {
    console.error('Discover search error:', error);
    
    // Fallback to traditional search if AI agent fails
    try {
      const fallbackResults = await performFallbackSearch(req.body, req.user);
      
      res.status(200).json({
        success: true,
        data: fallbackResults,
        meta: {
          agent: 'fallback-search',
          message: req.body.language?.startsWith('ar') ? 
            'تم استخدام البحث التقليدي' : 
            'Using traditional search fallback'
        }
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: req.body.language?.startsWith('ar') ? 
          'فشل في البحث عن الأنشطة' : 
          'Failed to search activities',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

/**
 * @desc    Get personalized recommendations
 * @route   POST /api/discover/recommend
 * @access  Private (requires authentication for personalization)
 */
router.post('/recommend', requireAuth, async (req, res) => {
  try {
    const {
      preferred_categories,
      location,
      language = 'ar',
      context_hint
    } = req.body;

    // Get user preferences
    const userPreferences = await UserSearchPreferences.findOne({ user: req.user._id });
    
    // Prepare recommendation context
    const user_context = {
      user_id: req.user._id.toString(),
      preferences: userPreferences,
      profile: {
        age: req.user.dateOfBirth ? 
          Math.floor((new Date() - new Date(req.user.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
        location: req.user.location,
        interests: req.user.preferences?.interests || []
      }
    };

    // Call AI agent for recommendations
    const agentResponse = await axios.post(`${AGENTS_API_URL}/discover/recommend`, {
      preferred_categories,
      location,
      language,
      user_context,
      query: context_hint || (language.startsWith('ar') ? 'اقترح لي أنشطة' : 'recommend activities for me')
    }, {
      params: { user_id: user_context.user_id },
      timeout: 10000
    });

    const recommendationData = agentResponse.data;

    // Enrich recommendations with real database data
    const enrichedRecommendations = await enrichSearchResults(
      recommendationData.recommendations.results, 
      language
    );

    // Update user preferences based on recommendation request
    if (userPreferences) {
      await updateUserPreferencesFromRequest(userPreferences, req.body);
    }

    res.status(200).json({
      success: true,
      data: {
        recommendations: enrichedRecommendations,
        trending_insights: recommendationData.trending_insights,
        personalization_applied: recommendationData.personalization_applied,
        cultural_context: recommendationData.recommendations.cultural_recommendations
      },
      meta: {
        agent: 'selena-discover',
        recommendation_type: 'personalized',
        user_id: req.user._id
      }
    });

  } catch (error) {
    console.error('Discover recommend error:', error);
    res.status(500).json({
      success: false,
      message: req.body.language?.startsWith('ar') ? 
        'فشل في الحصول على التوصيات' : 
        'Failed to get recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @desc    Get trending activities with cultural insights
 * @route   GET /api/discover/trending
 * @access  Public
 */
router.get('/trending', optionalAuth, async (req, res) => {
  try {
    const { language = 'ar', location } = req.query;

    // Call AI agent for trending data
    const agentResponse = await axios.get(`${AGENTS_API_URL}/discover/trending`, {
      params: { language, location },
      timeout: 5000
    });

    const trendingData = agentResponse.data;

    // Enrich with real database trending data
    const dbTrendingActivities = await Activity.find({ isActive: true })
      .populate('vendor', 'businessName location.city rating')
      .sort({ 
        'statistics.totalBookings': -1,
        'rating.average': -1,
        isFeatured: -1,
        createdAt: -1 
      })
      .limit(10)
      .lean();

    // Combine AI insights with database trends
    const enhancedTrending = {
      ...trendingData,
      database_trending: dbTrendingActivities,
      real_time_insights: await generateRealTimeInsights(language)
    };

    res.status(200).json({
      success: true,
      data: enhancedTrending,
      meta: {
        agent: 'selena-discover',
        data_source: 'hybrid_ai_database',
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Discover trending error:', error);
    res.status(500).json({
      success: false,
      message: req.query.language?.startsWith('ar') ? 
        'فشل في الحصول على الأنشطة الشائعة' : 
        'Failed to get trending activities'
    });
  }
});

/**
 * @desc    Discover activities near a location
 * @route   GET /api/discover/nearby/:location
 * @access  Public
 */
router.get('/nearby/:location', optionalAuth, async (req, res) => {
  try {
    const { location } = req.params;
    const { radius = 10, language = 'ar' } = req.query;
    const user_id = req.user ? req.user._id.toString() : 'anonymous';

    // Call AI agent for nearby discovery
    const agentResponse = await axios.get(`${AGENTS_API_URL}/discover/nearby/${location}`, {
      params: { radius: parseFloat(radius), language, user_id },
      timeout: 8000
    });

    const nearbyData = agentResponse.data;

    // Enrich with precise database location data
    const enrichedNearby = await enrichNearbyResults(nearbyData, location, radius);

    res.status(200).json({
      success: true,
      data: enrichedNearby,
      meta: {
        search_location: location,
        search_radius: parseFloat(radius),
        agent: 'selena-discover'
      }
    });

  } catch (error) {
    console.error('Discover nearby error:', error);
    res.status(500).json({
      success: false,
      message: req.query.language?.startsWith('ar') ? 
        'فشل في البحث عن الأنشطة القريبة' : 
        'Failed to find nearby activities'
    });
  }
});

/**
 * @desc    Save user search preferences
 * @route   POST /api/discover/preferences
 * @access  Private
 */
router.post('/preferences', requireAuth, async (req, res) => {
  try {
    const {
      activity_preferences,
      price_preferences,
      location_preferences,
      cultural_preferences,
      time_preferences,
      language = 'ar'
    } = req.body;

    // Update or create user search preferences
    const updatedPreferences = await UserSearchPreferences.findOneAndUpdate(
      { user: req.user._id },
      {
        activityPreferences: activity_preferences,
        pricePreferences: price_preferences,
        locationPreferences: location_preferences,
        culturalPreferences: cultural_preferences,
        timePreferences: time_preferences,
        'learningData.lastModelUpdate': new Date()
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    // Notify AI agent about preference update
    try {
      await axios.post(`${AGENTS_API_URL}/discover/save-preferences`, req.body, {
        params: { user_id: req.user._id.toString() },
        timeout: 5000
      });
    } catch (agentError) {
      console.warn('Failed to sync preferences with AI agent:', agentError.message);
    }

    res.status(200).json({
      success: true,
      message: language.startsWith('ar') ? 
        'تم حفظ تفضيلاتك بنجاح' : 
        'Your preferences have been saved successfully',
      data: {
        preferences_id: updatedPreferences._id,
        learning_data: updatedPreferences.learningData
      }
    });

  } catch (error) {
    console.error('Save preferences error:', error);
    res.status(500).json({
      success: false,
      message: req.body.language?.startsWith('ar') ? 
        'فشل في حفظ التفضيلات' : 
        'Failed to save preferences'
    });
  }
});

/**
 * @desc    Get user's discovery analytics
 * @route   GET /api/discover/analytics
 * @access  Private
 */
router.get('/analytics', requireAuth, async (req, res) => {
  try {
    const { days = 30, language = 'ar' } = req.query;
    const user_id = req.user._id.toString();

    // Get analytics from AI agent
    const agentResponse = await axios.get(`${AGENTS_API_URL}/discover/analytics/${user_id}`, {
      params: { days: parseInt(days) },
      timeout: 5000
    });

    // Get database analytics
    const dbAnalytics = await getDiscoveryAnalyticsFromDB(req.user._id, parseInt(days));

    // Combine AI and database analytics
    const combinedAnalytics = {
      ...agentResponse.data,
      database_analytics: dbAnalytics,
      insights: await generateAnalyticsInsights(agentResponse.data, dbAnalytics, language)
    };

    res.status(200).json({
      success: true,
      data: combinedAnalytics,
      meta: {
        user_id,
        analysis_period_days: parseInt(days),
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Discovery analytics error:', error);
    res.status(500).json({
      success: false,
      message: req.query.language?.startsWith('ar') ? 
        'فشل في الحصول على تحليلات البحث' : 
        'Failed to get search analytics'
    });
  }
});

/**
 * @desc    Natural language chat with discovery agent
 * @route   POST /api/discover/chat
 * @access  Public (with optional auth for personalization)
 */
router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const {
      message,
      language = 'ar',
      session_id
    } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: language.startsWith('ar') ? 
          'الرسالة مطلوبة' : 
          'Message is required'
      });
    }

    // Prepare user context
    const user_context = req.user ? {
      user_id: req.user._id.toString(),
      profile: {
        name: `${req.user.firstName} ${req.user.lastName}`,
        location: req.user.location,
        preferences: req.user.preferences,
        age: req.user.dateOfBirth ? 
          Math.floor((new Date() - new Date(req.user.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : null
      }
    } : {};

    // Call Selena-Discover AI agent chat interface
    const agentResponse = await axios.post(`${AGENTS_API_URL}/discover/chat`, {
      message,
      language,
      user_context
    }, {
      params: { user_id: user_context.user_id || 'anonymous' },
      timeout: 15000
    });

    const chatResponse = agentResponse.data;

    // Learn from user interaction if authenticated
    if (req.user && chatResponse.response) {
      await learnFromChatInteraction(req.user._id, message, chatResponse.response, language);
    }

    res.status(200).json({
      success: true,
      data: {
        response: chatResponse.response,
        agent: 'selena-discover',
        language: chatResponse.language,
        session_id: session_id || chatResponse.user_id
      },
      meta: {
        processing_time_ms: Date.now() - new Date(req.body.timestamp || Date.now()).getTime(),
        user_authenticated: !!req.user
      }
    });

  } catch (error) {
    console.error('Discover chat error:', error);
    res.status(500).json({
      success: false,
      message: req.body.language?.startsWith('ar') ? 
        'فشل في معالجة الرسالة' : 
        'Failed to process message'
    });
  }
});

/**
 * @desc    Get user's search history
 * @route   GET /api/discover/history
 * @access  Private
 */
router.get('/history', requireAuth, async (req, res) => {
  try {
    const { limit = 20, language = 'ar' } = req.query;

    const searchHistory = await SearchHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('searchResults.resultIds.activity', 'title description category pricing')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        search_history: searchHistory,
        total_searches: searchHistory.length,
        insights: await generateSearchHistoryInsights(searchHistory, language)
      }
    });

  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({
      success: false,
      message: req.query.language?.startsWith('ar') ? 
        'فشل في الحصول على تاريخ البحث' : 
        'Failed to get search history'
    });
  }
});

/**
 * @desc    Track user interaction with search results
 * @route   POST /api/discover/track
 * @access  Private
 */
router.post('/track', requireAuth, async (req, res) => {
  try {
    const {
      activity_id,
      interaction_type, // 'view', 'click', 'save', 'book', 'rate'
      metadata = {},
      search_id
    } = req.body;

    // Update user preferences based on interaction
    let userPreferences = await UserSearchPreferences.findOne({ user: req.user._id });
    if (!userPreferences) {
      userPreferences = new UserSearchPreferences({ user: req.user._id });
      await userPreferences.save();
    }

    // Get activity details
    const activity = await Activity.findById(activity_id).lean();
    if (activity) {
      await userPreferences.updateCategoryPreference(activity.category, interaction_type, metadata);
    }

    // Update venue popularity metrics
    if (activity?.vendor) {
      await updateVenuePopularityMetrics(activity.vendor, activity_id, interaction_type, metadata);
    }

    // Notify AI agent about interaction
    try {
      await axios.post(`${AGENTS_API_URL}/discover/save-preferences`, {
        interaction_type,
        activity_id,
        metadata,
        user_context: {
          user_id: req.user._id.toString()
        }
      }, {
        params: { user_id: req.user._id.toString() },
        timeout: 3000
      });
    } catch (agentError) {
      console.warn('Failed to sync interaction with AI agent:', agentError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Interaction tracked successfully'
    });

  } catch (error) {
    console.error('Track interaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track interaction'
    });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Enrich AI agent search results with real database data
 */
async function enrichSearchResults(aiResults, language = 'ar') {
  try {
    const activityIds = aiResults.map(result => result.activity_id).filter(id => id);
    
    if (activityIds.length === 0) {
      return [];
    }

    // Get real activities from database
    const dbActivities = await Activity.find({
      _id: { $in: activityIds },
      isActive: true
    })
    .populate('vendor', 'businessName location rating')
    .lean();

    // Create a map for quick lookup
    const dbActivityMap = {};
    dbActivities.forEach(activity => {
      dbActivityMap[activity._id.toString()] = activity;
    });

    // Enrich AI results with database data
    const enrichedResults = [];
    for (const aiResult of aiResults) {
      const dbActivity = dbActivityMap[aiResult.activity_id];
      if (dbActivity) {
        enrichedResults.push({
          ...dbActivity,
          ai_scores: {
            relevance_score: aiResult.relevance_score,
            cultural_fit_score: aiResult.cultural_fit_score,
            popularity_score: aiResult.popularity_score,
            distance_km: aiResult.distance_km
          },
          recommendations_reason: aiResult.recommendations_reason,
          discover_ranking: enrichedResults.length + 1
        });
      }
    }

    return enrichedResults;
  } catch (error) {
    console.error('Error enriching search results:', error);
    return [];
  }
}

/**
 * Perform fallback search using traditional MongoDB queries
 */
async function performFallbackSearch(searchData, user = null) {
  const { query, location, price_range, activity_types } = searchData;
  
  const filter = { isActive: true };
  
  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }
  
  if (location) {
    filter['location.city'] = { $regex: location, $options: 'i' };
  }
  
  if (price_range && price_range.length === 2) {
    filter['pricing.basePrice'] = { $gte: price_range[0], $lte: price_range[1] };
  }
  
  if (activity_types && activity_types.length > 0) {
    filter.category = { $in: activity_types };
  }

  const activities = await Activity.find(filter)
    .populate('vendor', 'businessName location rating')
    .sort({ 'rating.average': -1, 'statistics.totalBookings': -1 })
    .limit(10)
    .lean();

  return {
    activities,
    total_count: activities.length,
    search_type: 'fallback',
    agent: 'traditional-search'
  };
}

/**
 * Save search history to database
 */
async function saveSearchHistory(userId, searchData) {
  try {
    const searchHistory = new SearchHistory({
      user: userId,
      searchQuery: {
        originalQuery: searchData.originalQuery,
        language: searchData.language
      },
      appliedFilters: searchData.appliedFilters,
      searchResults: searchData.searchResults,
      performanceMetrics: searchData.performanceMetrics,
      contextData: {
        timeContext: {
          searchTime: new Date(),
          localTimeZone: 'Asia/Riyadh'
        }
      }
    });

    await searchHistory.save();
    return searchHistory;
  } catch (error) {
    console.error('Error saving search history:', error);
    return null;
  }
}

/**
 * Update venue popularity metrics
 */
async function updateVenuePopularityMetrics(venueId, activityId, interactionType, metadata) {
  try {
    let metrics = await VenuePopularityMetrics.findOne({
      $or: [{ venue: venueId }, { activity: activityId }]
    });

    if (!metrics) {
      metrics = new VenuePopularityMetrics({
        venue: venueId,
        activity: activityId
      });
    }

    // Update metrics based on interaction
    await metrics.updatePopularityMetrics({
      type: interactionType,
      userDemographics: metadata.userDemographics,
      timestamp: new Date()
    });

    return metrics;
  } catch (error) {
    console.error('Error updating venue popularity metrics:', error);
    return null;
  }
}

/**
 * Generate real-time insights from database
 */
async function generateRealTimeInsights(language = 'ar') {
  try {
    const insights = {
      most_booked_today: [],
      peak_search_categories: [],
      location_hotspots: []
    };

    // Get most booked activities in last 24 hours
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recentSearches = await SearchHistory.find({
      createdAt: { $gte: today }
    }).lean();

    // Analyze search patterns
    const categoryCount = {};
    const locationCount = {};

    recentSearches.forEach(search => {
      // Count categories
      const categories = search.appliedFilters?.activityCategories || [];
      categories.forEach(cat => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });

      // Count locations
      const city = search.appliedFilters?.location?.city;
      if (city) {
        locationCount[city] = (locationCount[city] || 0) + 1;
      }
    });

    // Get top categories
    const topCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category, count]) => ({ category, searches: count }));

    insights.peak_search_categories = topCategories;

    return insights;
  } catch (error) {
    console.error('Error generating real-time insights:', error);
    return {};
  }
}

/**
 * Generate analytics insights from search data
 */
async function generateAnalyticsInsights(aiAnalytics, dbAnalytics, language = 'ar') {
  const insights = [];

  if (language.startsWith('ar')) {
    if (aiAnalytics.total_searches > 10) {
      insights.push(`لديك ${aiAnalytics.total_searches} عملية بحث - مستخدم نشط!`);
    }
    
    if (aiAnalytics.avg_search_time > 500) {
      insights.push('ننصح بتحسين استعلامات البحث للحصول على نتائج أسرع');
    }
    
    if (dbAnalytics.category_preferences) {
      const topCategory = Object.keys(dbAnalytics.category_preferences)[0];
      insights.push(`اهتمامك الأساسي: ${topCategory}`);
    }
  } else {
    if (aiAnalytics.total_searches > 10) {
      insights.push(`You have ${aiAnalytics.total_searches} searches - active user!`);
    }
    
    if (aiAnalytics.avg_search_time > 500) {
      insights.push('Consider refining search queries for faster results');
    }
    
    if (dbAnalytics.category_preferences) {
      const topCategory = Object.keys(dbAnalytics.category_preferences)[0];
      insights.push(`Your main interest: ${topCategory}`);
    }
  }

  return insights;
}

/**
 * Get discovery analytics from database
 */
async function getDiscoveryAnalyticsFromDB(userId, days) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await SearchHistory.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSearches: { $sum: 1 },
          avgSearchTime: { $avg: '$performanceMetrics.searchTime' },
          languages: { $push: '$searchQuery.language' },
          categories: { $push: '$appliedFilters.activityCategories' },
          locations: { $push: '$appliedFilters.location.city' }
        }
      }
    ]);

    return analytics[0] || {};
  } catch (error) {
    console.error('Error getting DB analytics:', error);
    return {};
  }
}

/**
 * Learn from chat interactions
 */
async function learnFromChatInteraction(userId, userMessage, agentResponse, language) {
  try {
    // Extract learning signals from conversation
    const learningData = {
      message_type: 'chat',
      user_query: userMessage,
      agent_response: agentResponse,
      language,
      timestamp: new Date()
    };

    // Update user preferences based on chat interaction
    const userPreferences = await UserSearchPreferences.findOne({ user: userId });
    if (userPreferences) {
      userPreferences.learningData.trainingDataPoints += 1;
      userPreferences.searchBehavior.averageQueryLength = 
        (userPreferences.searchBehavior.averageQueryLength + userMessage.length) / 2;
      
      await userPreferences.save();
    }
  } catch (error) {
    console.error('Error learning from chat interaction:', error);
  }
}

/**
 * Update user preferences from recommendation request
 */
async function updateUserPreferencesFromRequest(userPreferences, requestData) {
  try {
    // Update category preferences
    if (requestData.preferred_categories) {
      for (const category of requestData.preferred_categories) {
        await userPreferences.updateCategoryPreference(category, 'request', {});
      }
    }

    // Update location preferences
    if (requestData.location) {
      const locationMap = userPreferences.locationPreferences.preferredCities;
      const currentData = locationMap.get(requestData.location) || {
        visitCount: 0,
        satisfaction: 0.5,
        lastVisit: new Date(),
        travelWillingness: 0.5
      };
      
      currentData.visitCount += 1;
      currentData.lastVisit = new Date();
      locationMap.set(requestData.location, currentData);
    }

    await userPreferences.save();
  } catch (error) {
    console.error('Error updating user preferences from request:', error);
  }
}

/**
 * Enrich nearby results with precise location data
 */
async function enrichNearbyResults(aiData, location, radius) {
  try {
    // Get activities within radius using geospatial query
    const dbNearbyActivities = await Activity.find({
      isActive: true,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [46.6753, 24.7136] // Default to Riyadh center - should be dynamic
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    })
    .populate('vendor', 'businessName location rating')
    .limit(20)
    .lean();

    return {
      ...aiData,
      database_nearby: dbNearbyActivities,
      precise_location_data: true
    };
  } catch (error) {
    console.error('Error enriching nearby results:', error);
    return aiData;
  }
}

/**
 * Generate insights from search history
 */
async function generateSearchHistoryInsights(searchHistory, language = 'ar') {
  const insights = [];
  
  if (searchHistory.length === 0) {
    return language.startsWith('ar') ? 
      ['لا يوجد تاريخ بحث بعد'] : 
      ['No search history yet'];
  }

  // Analyze search patterns
  const categoryFreq = {};
  const locationFreq = {};
  let totalSearchTime = 0;

  searchHistory.forEach(search => {
    const categories = search.appliedFilters?.activityCategories || [];
    categories.forEach(cat => {
      categoryFreq[cat] = (categoryFreq[cat] || 0) + 1;
    });

    const location = search.appliedFilters?.location?.city;
    if (location) {
      locationFreq[location] = (locationFreq[location] || 0) + 1;
    }

    totalSearchTime += search.performanceMetrics?.searchTime || 0;
  });

  const avgSearchTime = totalSearchTime / searchHistory.length;

  if (language.startsWith('ar')) {
    insights.push(`متوسط وقت البحث: ${avgSearchTime.toFixed(0)} ميلي ثانية`);
    
    const topCategory = Object.keys(categoryFreq)[0];
    if (topCategory) {
      insights.push(`الفئة المفضلة: ${topCategory}`);
    }
    
    const topLocation = Object.keys(locationFreq)[0];
    if (topLocation) {
      insights.push(`الموقع الأكثر بحثاً: ${topLocation}`);
    }
  } else {
    insights.push(`Average search time: ${avgSearchTime.toFixed(0)}ms`);
    
    const topCategory = Object.keys(categoryFreq)[0];
    if (topCategory) {
      insights.push(`Favorite category: ${topCategory}`);
    }
    
    const topLocation = Object.keys(locationFreq)[0];
    if (topLocation) {
      insights.push(`Most searched location: ${topLocation}`);
    }
  }

  return insights;
}

module.exports = router;