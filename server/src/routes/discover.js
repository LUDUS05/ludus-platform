/**
 * @fileoverview Discover API routes for Selena-Discover AI Agent integration
 * 
 * This module provides REST API endpoints that integrate with the Python-based
 * Selena-Discover AI agent, handling intelligent search, recommendations,
 * and cultural context processing.
 * 
 * @version 1.0.0
 * @author LUDUS Development Team - Selena-Discover Implementation
 * @since 2025-09-28
 */

const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');
const axios = require('axios');
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const User = require('../models/User');
const UserSearchHistory = require('../models/UserSearchHistory');
const VenuePopularityMetrics = require('../models/VenuePopularityMetrics');
const UserPreferenceProfile = require('../models/UserPreferenceProfile');
const {
  getDiscoverAnalytics,
  getDiscoverAgentHealth,
  getPerformanceDashboard
} = require('../controllers/discoverAnalyticsController');

// Selena-Discover AI Agent URL
const DISCOVER_AGENT_URL = process.env.DISCOVER_AGENT_URL || 'http://localhost:8000';

/**
 * Intelligent search with AI processing
 * @route POST /api/discover/search
 * @access Public (with optional auth)
 */
router.post('/search', optionalAuth, async (req, res) => {
  try {
    const {
      query,
      location,
      filters,
      language = 'ar',
      searchType = 'natural',
      culturalPreferences,
      voiceInput = false
    } = req.body;

    // Validate required fields
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: language === 'ar' ? 'نص البحث مطلوب' : 'Search query is required'
      });
    }

    // Prepare request for Python agent
    const agentRequest = {
      query: query.trim(),
      user_id: req.user?.id || null,
      location,
      filters,
      language,
      search_type: searchType,
      context: {
        timestamp: new Date().toISOString(),
        user_agent: req.get('User-Agent'),
        ip_address: req.ip
      },
      voice_input: voiceInput,
      cultural_preferences: culturalPreferences
    };

    // Call Selena-Discover agent
    const agentResponse = await axios.post(
      `${DISCOVER_AGENT_URL}/agents/discover/search`,
      agentRequest,
      { timeout: 5000 }
    );

    const discoverResults = agentResponse.data;

    // Enhance results with MongoDB data
    const enhancedResults = await enhanceResultsWithDatabaseData(
      discoverResults.results, req.user?.id, language
    );

    // Save search to database for analytics
    if (req.user?.id) {
      await saveSearchToDatabase(req.user.id, agentRequest, discoverResults);
    }

    // Update user preference profile
    if (req.user?.id && enhancedResults.length > 0) {
      await updateUserPreferenceProfile(req.user.id, {
        type: 'search',
        query: agentRequest,
        results: enhancedResults
      });
    }

    res.json({
      success: true,
      data: {
        results: enhancedResults,
        totalCount: discoverResults.total_count,
        searchQuery: discoverResults.search_query,
        processedQuery: discoverResults.processed_query,
        recommendations: discoverResults.recommendations,
        culturalInsights: discoverResults.cultural_insights,
        geographicClusters: discoverResults.geographic_clusters,
        searchSuggestions: discoverResults.search_suggestions,
        performanceMetrics: discoverResults.performance_metrics,
        userLearning: discoverResults.user_learning
      }
    });

  } catch (error) {
    console.error('Discover search error:', error);
    
    // Fallback to basic MongoDB search
    try {
      const fallbackResults = await performFallbackSearch(req.body, req.user?.id);
      res.json({
        success: true,
        data: fallbackResults,
        fallback: true,
        message: language === 'ar' ? 
          'تم استخدام البحث الأساسي' : 
          'Using basic search fallback'
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: language === 'ar' ? 
          'فشل في البحث عن الأنشطة' : 
          'Failed to search activities',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

/**
 * Generate personalized recommendations
 * @route POST /api/discover/recommend
 * @access Private
 */
router.post('/recommend', auth, async (req, res) => {
  try {
    const {
      context,
      preferenceOverride,
      location,
      socialContext,
      culturalContext = 'saudi_modern'
    } = req.body;

    // Get user preference profile
    const userProfile = await UserPreferenceProfile.findOne({ user: req.user.id });
    
    // Prepare recommendation request
    const recommendationRequest = {
      user_id: req.user.id,
      context: {
        ...context,
        userProfile: userProfile?.exportForML(),
        timestamp: new Date().toISOString()
      },
      preference_override: preferenceOverride,
      location,
      social_context: socialContext,
      cultural_context: culturalContext
    };

    // Call Selena-Discover agent
    const agentResponse = await axios.post(
      `${DISCOVER_AGENT_URL}/agents/discover/recommend`,
      recommendationRequest,
      { timeout: 5000 }
    );

    const recommendations = agentResponse.data;

    // Enhance recommendations with real-time data
    const enhancedRecommendations = await enhanceRecommendationsWithDatabaseData(
      recommendations.recommendations, req.user.id
    );

    // Track recommendation interaction
    await trackRecommendationDelivery(req.user.id, {
      recommendations: enhancedRecommendations,
      context: recommendationRequest.context,
      confidence: recommendations.confidence_score
    });

    res.json({
      success: true,
      data: {
        recommendations: enhancedRecommendations,
        reasoning: recommendations.reasoning,
        culturalFitScore: recommendations.cultural_fit_score,
        confidenceScore: recommendations.confidence_score,
        learningInsights: recommendations.learning_insights,
        alternativeSuggestions: recommendations.alternative_suggestions
      }
    });

  } catch (error) {
    console.error('Discover recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get trending activities with cultural insights
 * @route GET /api/discover/trending
 * @access Public
 */
router.get('/trending', optionalAuth, async (req, res) => {
  try {
    const {
      location,
      timeframe = 'week',
      culturalContext = 'saudi_modern',
      language = 'ar'
    } = req.query;

    // Call Selena-Discover agent
    const agentResponse = await axios.get(
      `${DISCOVER_AGENT_URL}/agents/discover/trending`,
      {
        params: { location, timeframe, cultural_context: culturalContext },
        timeout: 5000
      }
    );

    const trendingData = agentResponse.data;

    // Enhance with real-time popularity metrics
    const enhancedTrending = await enhanceTrendingWithMetrics(
      trendingData.trending_activities, location
    );

    res.json({
      success: true,
      data: {
        trendingActivities: enhancedTrending,
        insights: trendingData.insights,
        timeframe,
        location,
        culturalContext
      }
    });

  } catch (error) {
    console.error('Discover trending error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending activities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get nearby activities with intelligent proximity analysis
 * @route GET /api/discover/nearby/:location
 * @access Public
 */
router.get('/nearby/:location', optionalAuth, async (req, res) => {
  try {
    const { location } = req.params;
    const { radius = 25, language = 'ar' } = req.query;
    const userId = req.user?.id;

    // Call Selena-Discover agent
    const agentResponse = await axios.get(
      `${DISCOVER_AGENT_URL}/agents/discover/nearby/${location}`,
      {
        params: { radius, user_id: userId },
        timeout: 5000
      }
    );

    const nearbyData = agentResponse.data;

    // Enhance with real-time availability
    const enhancedNearby = await enhanceNearbyWithAvailability(
      nearbyData.nearby_activities, location
    );

    res.json({
      success: true,
      data: {
        location,
        radiusKm: parseInt(radius),
        nearbyActivities: enhancedNearby,
        geographicClusters: nearbyData.geographic_clusters,
        locationInsights: nearbyData.location_insights,
        recommendations: nearbyData.recommendations
      }
    });

  } catch (error) {
    console.error('Discover nearby error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get nearby activities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Save user preferences and interaction data
 * @route POST /api/discover/preferences
 * @access Private
 */
router.post('/preferences', auth, async (req, res) => {
  try {
    const { interactionData, preferences } = req.body;

    // Save to Python agent
    const agentResponse = await axios.post(
      `${DISCOVER_AGENT_URL}/agents/discover/save-preferences`,
      {
        user_id: req.user.id,
        interaction_data: interactionData
      },
      { timeout: 3000 }
    );

    // Update MongoDB user preference profile
    let userProfile = await UserPreferenceProfile.findOne({ user: req.user.id });
    
    if (!userProfile) {
      userProfile = new UserPreferenceProfile({ user: req.user.id });
    }

    // Update profile based on interaction
    if (interactionData) {
      await userProfile.updateFromInteraction(interactionData);
    }

    // Update explicit preferences if provided
    if (preferences) {
      Object.assign(userProfile.culturalProfile, preferences.cultural || {});
      Object.assign(userProfile.behaviorPatterns, preferences.behavior || {});
      userProfile._updateProfileCompleteness();
      await userProfile.save();
    }

    res.json({
      success: true,
      data: {
        agentResponse: agentResponse.data,
        profileCompleteness: userProfile.completenessPercentage,
        learningConfidence: userProfile.learningMetadata.learningConfidence,
        message: 'Preferences updated successfully'
      }
    });

  } catch (error) {
    console.error('Discover preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get user's discover analytics and insights
 * @route GET /api/discover/analytics
 * @access Private
 */
router.get('/analytics', auth, async (req, res) => {
  try {
    const { timeframe = 'week' } = req.query;

    // Get analytics from Python agent
    const agentResponse = await axios.get(
      `${DISCOVER_AGENT_URL}/agents/discover/analytics`,
      {
        params: { timeframe },
        timeout: 3000
      }
    );

    // Get user-specific analytics from MongoDB
    const userAnalytics = await getUserDiscoverAnalytics(req.user.id, timeframe);

    res.json({
      success: true,
      data: {
        globalAnalytics: agentResponse.data,
        userAnalytics,
        timeframe
      }
    });

  } catch (error) {
    console.error('Discover analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Advanced filtering with AI assistance
 * @route POST /api/discover/filter
 * @access Public
 */
router.post('/filter', optionalAuth, async (req, res) => {
  try {
    const filterData = {
      ...req.body,
      user_id: req.user?.id
    };

    // Call Selena-Discover agent
    const agentResponse = await axios.post(
      `${DISCOVER_AGENT_URL}/agents/discover/filter`,
      filterData,
      { timeout: 5000 }
    );

    const filterResults = agentResponse.data;

    // Enhance with database data
    const enhancedResults = await enhanceResultsWithDatabaseData(
      filterResults.filtered_results, req.user?.id, req.body.language || 'ar'
    );

    res.json({
      success: true,
      data: {
        filteredResults: enhancedResults,
        alternativeSuggestions: filterResults.alternative_suggestions,
        appliedFilters: filterResults.applied_filters,
        culturalInsights: filterResults.cultural_insights,
        performanceMetrics: filterResults.performance_metrics
      }
    });

  } catch (error) {
    console.error('Discover filter error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply filters',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Track user interaction with search results
 * @route POST /api/discover/track-interaction
 * @access Private
 */
router.post('/track-interaction', auth, async (req, res) => {
  try {
    const {
      searchId,
      activityId,
      interactionType, // 'click', 'view', 'book', 'share', 'like'
      position,
      context
    } = req.body;

    // Find the search history record
    const searchRecord = await UserSearchHistory.findById(searchId);
    if (searchRecord && searchRecord.user.toString() === req.user.id) {
      // Add click interaction
      await searchRecord.addClickInteraction(activityId, position, context?.relevanceScore);
    }

    // Update user preference profile
    const userProfile = await UserPreferenceProfile.findOne({ user: req.user.id });
    if (userProfile) {
      const activityData = await Activity.findById(activityId);
      if (activityData) {
        await userProfile.updateFromInteraction({
          type: interactionType,
          activityData: activityData.toObject(),
          userResponse: interactionType,
          context
        });
      }
    }

    // Send to Python agent for ML learning
    try {
      await axios.post(
        `${DISCOVER_AGENT_URL}/agents/discover/save-preferences`,
        {
          user_id: req.user.id,
          interaction_data: {
            type: interactionType,
            activity_id: activityId,
            position,
            context,
            timestamp: new Date().toISOString()
          }
        },
        { timeout: 2000 }
      );
    } catch (agentError) {
      console.warn('Failed to update agent preferences:', agentError.message);
    }

    res.json({
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

/**
 * Get user's search history and patterns
 * @route GET /api/discover/history
 * @access Private
 */
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, timeframe = 30 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeframe));

    const searchHistory = await UserSearchHistory.find({
      user: req.user.id,
      createdAt: { $gte: cutoffDate }
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Get search patterns
    const searchPatterns = await UserSearchHistory.getUserSearchPatterns(
      req.user.id, parseInt(timeframe)
    );

    const totalSearches = await UserSearchHistory.countDocuments({
      user: req.user.id,
      createdAt: { $gte: cutoffDate }
    });

    res.json({
      success: true,
      data: {
        searchHistory,
        searchPatterns,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalSearches / parseInt(limit)),
          totalSearches
        }
      }
    });

  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search history'
    });
  }
});

/**
 * Get cultural search trends and insights
 * @route GET /api/discover/cultural-trends
 * @access Public
 */
router.get('/cultural-trends', async (req, res) => {
  try {
    const { timeframe = 7 } = req.query;

    // Get cultural trends from database
    const culturalTrends = await UserSearchHistory.getCulturalSearchTrends(
      parseInt(timeframe)
    );

    // Get venue cultural metrics
    const venueMetrics = await VenuePopularityMetrics.aggregate([
      {
        $group: {
          _id: null,
          avgTraditionalAlignment: { $avg: '$culturalMetrics.traditionalAlignment' },
          avgModernAlignment: { $avg: '$culturalMetrics.modernAlignment' },
          avgFamilyFriendliness: { $avg: '$culturalMetrics.familyFriendliness' },
          avgReligiousConsideration: { $avg: '$culturalMetrics.religiousConsideration' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        culturalTrends,
        venueMetrics: venueMetrics[0] || {},
        timeframe: parseInt(timeframe)
      }
    });

  } catch (error) {
    console.error('Cultural trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cultural trends'
    });
  }
});

// Helper Functions

async function enhanceResultsWithDatabaseData(results, userId, language) {
  // Enhance AI agent results with real-time database data
  const enhancedResults = [];

  for (const result of results) {
    try {
      // Get real activity data from MongoDB
      const activity = await Activity.findOne({
        $or: [
          { _id: result.id },
          { title: result.title },
          { slug: result.title?.toLowerCase().replace(/\s+/g, '-') }
        ]
      })
        .populate('vendor', 'businessName location rating')
        .lean();

      if (activity) {
        // Merge AI agent data with database data
        const enhanced = {
          ...activity,
          _discoveryScore: result._discovery_score || 0.5,
          aiInsights: {
            culturalFit: result.cultural_fit_score,
            proximityScore: result.proximity_score,
            recommendationReason: result.recommendation_reason
          },
          realTimeData: {
            currentAvailability: await checkRealTimeAvailability(activity._id),
            dynamicPricing: await getDynamicPricing(activity._id),
            weatherConsiderations: await getWeatherConsiderations(activity)
          }
        };

        enhancedResults.push(enhanced);
      } else {
        // Use AI agent data as fallback
        enhancedResults.push(result);
      }
    } catch (error) {
      console.warn(`Failed to enhance result ${result.id}:`, error.message);
      enhancedResults.push(result);
    }
  }

  return enhancedResults;
}

async function saveSearchToDatabase(userId, searchRequest, searchResults) {
  // Save search data to MongoDB for analytics
  try {
    const searchHistory = new UserSearchHistory({
      user: userId,
      searchQuery: searchRequest.query,
      processedQuery: searchResults.processed_query,
      searchFilters: {
        location: searchRequest.location,
        ...searchRequest.filters
      },
      resultsReturned: searchResults.total_count,
      searchContext: {
        searchType: searchRequest.search_type,
        voiceInput: searchRequest.voice_input,
        culturalContext: searchRequest.cultural_preferences?.context || 'saudi_modern'
      },
      performanceMetrics: searchResults.performance_metrics,
      geoLocation: searchRequest.location
    });

    await searchHistory.save();
    return searchHistory._id;
  } catch (error) {
    console.error('Failed to save search to database:', error);
    return null;
  }
}

async function updateUserPreferenceProfile(userId, searchData) {
  // Update user preference profile based on search behavior
  try {
    let userProfile = await UserPreferenceProfile.findOne({ user: userId });
    
    if (!userProfile) {
      userProfile = new UserPreferenceProfile({ user: userId });
    }

    // Update search frequency
    userProfile.behaviorPatterns.searchFrequency.weekly++;
    
    // Update category interests based on search intent
    const searchIntent = searchData.query.processedQuery?.intent || [];
    for (const intent of searchIntent) {
      if (userProfile.categoryPreferences[intent]) {
        userProfile.categoryPreferences[intent].interest = Math.min(1,
          userProfile.categoryPreferences[intent].interest + 0.02
        );
      }
    }

    // Update profile completeness
    userProfile._updateProfileCompleteness();
    
    await userProfile.save();
    return userProfile;
  } catch (error) {
    console.error('Failed to update user preference profile:', error);
    return null;
  }
}

async function performFallbackSearch(searchParams, userId) {
  // Perform fallback search using MongoDB when AI agent is unavailable
  const { query, filters = {}, language = 'ar' } = searchParams;
  
  // Build MongoDB query
  const mongoQuery = { isActive: true };
  
  if (query) {
    mongoQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }

  if (filters.category) {
    mongoQuery.category = filters.category;
  }

  if (filters.location?.city) {
    mongoQuery['location.city'] = { $regex: filters.location.city, $options: 'i' };
  }

  if (filters.priceRange) {
    mongoQuery['pricing.basePrice'] = {
      $gte: filters.priceRange.min || 0,
      $lte: filters.priceRange.max || 1000
    };
  }

  const activities = await Activity.find(mongoQuery)
    .populate('vendor', 'businessName location rating')
    .sort({ 'rating.average': -1, createdAt: -1 })
    .limit(15)
    .lean();

  return {
    results: activities,
    totalCount: activities.length,
    searchQuery: query,
    fallbackMode: true,
    recommendations: [],
    culturalInsights: [],
    geographicClusters: [],
    searchSuggestions: []
  };
}

async function enhanceRecommendationsWithDatabaseData(recommendations, userId) {
  // Enhance recommendations with real-time database data
  const enhanced = [];

  for (const rec of recommendations) {
    try {
      const activity = await Activity.findById(rec.activity?.id || rec.activity?._id)
        .populate('vendor', 'businessName location rating')
        .lean();

      if (activity) {
        enhanced.push({
          ...rec,
          activity: {
            ...activity,
            aiRecommendationScore: rec.recommendation_score,
            culturalFitScore: rec.cultural_fit,
            realTimeAvailability: await checkRealTimeAvailability(activity._id)
          }
        });
      } else {
        enhanced.push(rec);
      }
    } catch (error) {
      enhanced.push(rec);
    }
  }

  return enhanced;
}

async function checkRealTimeAvailability(activityId) {
  // Check real-time availability for an activity
  try {
    const activity = await Activity.findById(activityId);
    if (!activity) return { available: false };

    // Simplified availability check
    const today = new Date();
    const availableSlots = activity.getAvailableSlots(today);
    
    return {
      available: availableSlots.length > 0,
      slotsToday: availableSlots.length,
      nextAvailable: availableSlots[0]?.startTime || null
    };
  } catch (error) {
    return { available: false, error: error.message };
  }
}

async function getDynamicPricing(activityId) {
  // Get dynamic pricing information
  try {
    const activity = await Activity.findById(activityId);
    if (!activity) return null;

    // Simplified dynamic pricing (could be enhanced with demand-based pricing)
    const basePrice = activity.pricing.basePrice;
    const popularityMetrics = await VenuePopularityMetrics.findOne({ activity: activityId });
    
    let priceMultiplier = 1.0;
    if (popularityMetrics?.popularityScore > 0.8) {
      priceMultiplier = 1.1; // 10% premium for highly popular activities
    }

    return {
      basePrice,
      currentPrice: Math.round(basePrice * priceMultiplier),
      dynamicAdjustment: priceMultiplier !== 1.0,
      priceMultiplier
    };
  } catch (error) {
    return null;
  }
}

async function getWeatherConsiderations(activity) {
  // Get weather considerations for outdoor activities
  try {
    if (activity.category === 'outdoor' || 
        activity.location?.isOnline === false) {
      // Simplified weather check (in production, integrate with weather API)
      return {
        weatherSensitive: true,
        recommendations: [
          'Check weather conditions before booking',
          'Activity may be rescheduled due to weather'
        ]
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function enhanceTrendingWithMetrics(trendingActivities, location) {
  // Enhance trending activities with real-time metrics
  const enhanced = [];

  for (const activity of trendingActivities) {
    try {
      const metrics = await VenuePopularityMetrics.findOne({
        $or: [
          { activity: activity.id },
          { venue: activity.vendor }
        ]
      });

      enhanced.push({
        ...activity,
        trendingMetrics: {
          popularityScore: metrics?.popularityScore || 0.5,
          culturalRating: metrics?.culturalRating || 0.5,
          conversionRate: metrics?.metrics?.conversionRate || 0,
          recentBookings: metrics?.metrics?.totalBookings || 0
        }
      });
    } catch (error) {
      enhanced.push(activity);
    }
  }

  return enhanced;
}

async function enhanceNearbyWithAvailability(nearbyActivities, location) {
  // Enhance nearby activities with availability data
  const enhanced = [];

  for (const activity of nearbyActivities) {
    try {
      const availability = await checkRealTimeAvailability(activity.id);
      const pricing = await getDynamicPricing(activity.id);

      enhanced.push({
        ...activity,
        realTimeData: {
          availability,
          pricing,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      enhanced.push(activity);
    }
  }

  return enhanced;
}

async function trackRecommendationDelivery(userId, recommendationData) {
  // Track recommendation delivery for analytics
  try {
    const userProfile = await UserPreferenceProfile.findOne({ user: userId });
    if (userProfile) {
      // Add recommendations to history
      for (const rec of recommendationData.recommendations) {
        userProfile.recommendationHistory.push({
          recommendedActivity: rec.activity?.id || rec.activity?._id,
          recommendationScore: rec.recommendation_score || 0.5,
          culturalFitScore: rec.cultural_fit || 0.5,
          context: recommendationData.context
        });
      }

      // Keep only recent recommendations
      userProfile.recommendationHistory = userProfile.recommendationHistory.slice(-100);
      await userProfile.save();
    }
  } catch (error) {
    console.error('Failed to track recommendation delivery:', error);
  }
}

async function getUserDiscoverAnalytics(userId, timeframe) {
  // Get user-specific discover analytics
  try {
    const timeframeDays = {
      'day': 1,
      'week': 7,
      'month': 30
    }[timeframe] || 7;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);

    // User search analytics
    const searchAnalytics = await UserSearchHistory.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          createdAt: { $gte: cutoffDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSearches: { $sum: 1 },
          averageResults: { $avg: '$resultsReturned' },
          successfulSearches: {
            $sum: { $cond: [{ $gt: ['$resultsReturned', 0] }, 1, 0] }
          },
          languageDistribution: { $push: '$processedQuery.language' },
          popularIntents: { $push: '$processedQuery.intent' }
        }
      }
    ]);

    // User preference profile analytics
    const userProfile = await UserPreferenceProfile.findOne({ user: userId });

    return {
      searchAnalytics: searchAnalytics[0] || {},
      preferenceProfile: {
        completeness: userProfile?.completenessPercentage || 0,
        confidence: userProfile?.learningMetadata?.learningConfidence || 0,
        totalInteractions: userProfile?.learningMetadata?.totalInteractions || 0,
        culturalAlignment: userProfile?.culturalProfile || {}
      },
      timeframe: timeframeDays
    };
  } catch (error) {
    console.error('Failed to get user analytics:', error);
    return {};
  }
}

/**
 * Get comprehensive discover analytics (admin only)
 * @route GET /api/discover/admin/analytics
 * @access Private (Admin)
 */
router.get('/admin/analytics', auth, getDiscoverAnalytics);

/**
 * Get discover agent health status
 * @route GET /api/discover/health
 * @access Public
 */
router.get('/health', getDiscoverAgentHealth);

/**
 * Get performance dashboard data
 * @route GET /api/discover/admin/dashboard
 * @access Private (Admin)
 */
router.get('/admin/dashboard', auth, getPerformanceDashboard);

/**
 * Get user preference profile
 * @route GET /api/discover/profile
 * @access Private
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const userProfile = await UserPreferenceProfile.findOne({ user: req.user.id })
      .lean();

    if (!userProfile) {
      return res.json({
        success: true,
        data: {
          profile: null,
          message: 'No preference profile found - will be created on first interaction'
        }
      });
    }

    // Remove sensitive data
    const publicProfile = {
      completeness: userProfile.learningMetadata?.profileCompleteness || 0,
      confidence: userProfile.learningMetadata?.learningConfidence || 0,
      totalInteractions: userProfile.learningMetadata?.totalInteractions || 0,
      categoryPreferences: userProfile.categoryPreferences,
      culturalProfile: userProfile.culturalProfile,
      lastUpdated: userProfile.updatedAt
    };

    res.json({
      success: true,
      data: {
        profile: publicProfile
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

module.exports = router;