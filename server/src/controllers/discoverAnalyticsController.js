/**
 * @fileoverview Analytics Controller for Selena-Discover AI Agent
 * 
 * This controller provides comprehensive analytics, performance monitoring,
 * and insights for the Selena-Discover AI agent system.
 * 
 * @version 1.0.0
 * @author LUDUS Development Team - Selena-Discover Implementation
 * @since 2025-09-28
 */

const UserSearchHistory = require('../models/UserSearchHistory');
const VenuePopularityMetrics = require('../models/VenuePopularityMetrics');
const UserPreferenceProfile = require('../models/UserPreferenceProfile');
const Activity = require('../models/Activity');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Get comprehensive discover agent analytics
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getDiscoverAnalytics = async (req, res) => {
  try {
    const { timeframe = 'week', detailed = false } = req.query;
    
    const timeframeDays = {
      'day': 1,
      'week': 7,
      'month': 30,
      'quarter': 90
    }[timeframe] || 7;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);

    // Parallel analytics queries
    const [
      searchAnalytics,
      performanceMetrics,
      culturalInsights,
      userBehaviorAnalytics,
      popularityTrends,
      geographicAnalytics
    ] = await Promise.all([
      getSearchAnalytics(cutoffDate),
      getPerformanceMetrics(cutoffDate),
      getCulturalInsights(cutoffDate),
      getUserBehaviorAnalytics(cutoffDate),
      getPopularityTrends(cutoffDate),
      getGeographicAnalytics(cutoffDate)
    ]);

    const analytics = {
      overview: {
        timeframe,
        timeframeDays,
        generatedAt: new Date().toISOString()
      },
      searchAnalytics,
      performanceMetrics,
      culturalInsights,
      userBehaviorAnalytics,
      popularityTrends,
      geographicAnalytics
    };

    if (detailed) {
      analytics.detailedMetrics = await getDetailedMetrics(cutoffDate);
    }

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get discover analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get search-specific analytics
 */
async function getSearchAnalytics(cutoffDate) {
  const searchStats = await UserSearchHistory.aggregate([
    {
      $match: {
        createdAt: { $gte: cutoffDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSearches: { $sum: 1 },
        uniqueUsers: { $addToSet: '$user' },
        successfulSearches: {
          $sum: { $cond: [{ $gt: ['$resultsReturned', 0] }, 1, 0] }
        },
        averageResults: { $avg: '$resultsReturned' },
        averageProcessingTime: { $avg: '$performanceMetrics.processingTimeMs' },
        languageDistribution: { $push: '$processedQuery.language' },
        searchTypes: { $push: '$searchContext.searchType' },
        popularIntents: { $push: '$processedQuery.intent' },
        clickThroughRates: { $push: { $size: '$resultsClicked' } }
      }
    }
  ]);

  const stats = searchStats[0] || {};
  
  // Process language distribution
  const languageCount = {};
  (stats.languageDistribution || []).forEach(lang => {
    languageCount[lang] = (languageCount[lang] || 0) + 1;
  });

  // Process search types
  const searchTypeCount = {};
  (stats.searchTypes || []).forEach(type => {
    searchTypeCount[type] = (searchTypeCount[type] || 0) + 1;
  });

  // Process popular intents
  const intentCount = {};
  (stats.popularIntents || []).forEach(intents => {
    if (Array.isArray(intents)) {
      intents.forEach(intent => {
        intentCount[intent] = (intentCount[intent] || 0) + 1;
      });
    }
  });

  return {
    totalSearches: stats.totalSearches || 0,
    uniqueUsers: (stats.uniqueUsers || []).length,
    successRate: stats.totalSearches > 0 ? 
      (stats.successfulSearches || 0) / stats.totalSearches : 0,
    averageResultsPerSearch: stats.averageResults || 0,
    averageProcessingTimeMs: stats.averageProcessingTime || 0,
    languageDistribution: languageCount,
    searchTypeDistribution: searchTypeCount,
    popularIntents: Object.entries(intentCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10),
    averageClickThroughRate: (stats.clickThroughRates || []).length > 0 ?
      stats.clickThroughRates.reduce((a, b) => a + b, 0) / stats.clickThroughRates.length : 0
  };
}

/**
 * Get performance metrics
 */
async function getPerformanceMetrics(cutoffDate) {
  const performanceData = await UserSearchHistory.aggregate([
    {
      $match: {
        createdAt: { $gte: cutoffDate },
        'performanceMetrics.processingTimeMs': { $exists: true }
      }
    },
    {
      $group: {
        _id: null,
        averageProcessingTime: { $avg: '$performanceMetrics.processingTimeMs' },
        maxProcessingTime: { $max: '$performanceMetrics.processingTimeMs' },
        minProcessingTime: { $min: '$performanceMetrics.processingTimeMs' },
        p95ProcessingTime: {
          $percentile: {
            input: '$performanceMetrics.processingTimeMs',
            p: [0.95],
            method: 'approximate'
          }
        },
        averageNlpConfidence: { $avg: '$performanceMetrics.nlpConfidence' },
        averageRankingQuality: { $avg: '$performanceMetrics.rankingQuality' }
      }
    }
  ]);

  const metrics = performanceData[0] || {};

  // Performance scoring
  const performanceScore = calculatePerformanceScore(metrics);

  return {
    processingTime: {
      average: metrics.averageProcessingTime || 0,
      max: metrics.maxProcessingTime || 0,
      min: metrics.minProcessingTime || 0,
      p95: metrics.p95ProcessingTime?.[0] || 0
    },
    qualityMetrics: {
      nlpConfidence: metrics.averageNlpConfidence || 0,
      rankingQuality: metrics.averageRankingQuality || 0,
      overallScore: performanceScore
    },
    slaCompliance: {
      under300ms: metrics.averageProcessingTime < 300,
      under500ms: metrics.averageProcessingTime < 500,
      targetMet: metrics.averageProcessingTime < 300
    }
  };
}

/**
 * Get cultural insights and trends
 */
async function getCulturalInsights(cutoffDate) {
  const culturalData = await UserSearchHistory.aggregate([
    {
      $match: {
        createdAt: { $gte: cutoffDate }
      }
    },
    {
      $group: {
        _id: '$searchContext.culturalContext',
        searchCount: { $sum: 1 },
        successRate: {
          $avg: { $cond: [{ $gt: ['$resultsReturned', 0] }, 1, 0] }
        },
        popularIntents: { $push: '$processedQuery.intent' },
        averageResultsClicked: { $avg: { $size: '$resultsClicked' } }
      }
    },
    {
      $sort: { searchCount: -1 }
    }
  ]);

  // Get venue cultural alignment
  const venueAlignment = await VenuePopularityMetrics.aggregate([
    {
      $group: {
        _id: null,
        traditionalVenues: {
          $sum: { $cond: [{ $gt: ['$culturalMetrics.traditionalAlignment', 0.7] }, 1, 0] }
        },
        modernVenues: {
          $sum: { $cond: [{ $gt: ['$culturalMetrics.modernAlignment', 0.7] }, 1, 0] }
        },
        familyFriendlyVenues: {
          $sum: { $cond: [{ $gt: ['$culturalMetrics.familyFriendliness', 0.7] }, 1, 0] }
        },
        totalVenues: { $sum: 1 }
      }
    }
  ]);

  const alignment = venueAlignment[0] || {};

  return {
    culturalContextDistribution: culturalData,
    venueAlignment: {
      traditionalPercentage: alignment.totalVenues > 0 ? 
        (alignment.traditionalVenues / alignment.totalVenues) * 100 : 0,
      modernPercentage: alignment.totalVenues > 0 ? 
        (alignment.modernVenues / alignment.totalVenues) * 100 : 0,
      familyFriendlyPercentage: alignment.totalVenues > 0 ? 
        (alignment.familyFriendlyVenues / alignment.totalVenues) * 100 : 0
    },
    recommendations: generateCulturalRecommendations(culturalData, alignment)
  };
}

/**
 * Get user behavior analytics
 */
async function getUserBehaviorAnalytics(cutoffDate) {
  // User preference profile analytics
  const userProfiles = await UserPreferenceProfile.aggregate([
    {
      $group: {
        _id: null,
        totalProfiles: { $sum: 1 },
        averageCompleteness: { $avg: '$learningMetadata.profileCompleteness' },
        averageConfidence: { $avg: '$learningMetadata.learningConfidence' },
        averageInteractions: { $avg: '$learningMetadata.totalInteractions' },
        culturalDistribution: {
          $push: {
            traditional: '$culturalProfile.traditionalPreference',
            modern: '$culturalProfile.modernPreference',
            family: '$culturalProfile.familyOrientation'
          }
        }
      }
    }
  ]);

  const profiles = userProfiles[0] || {};

  // Search behavior patterns
  const behaviorPatterns = await UserSearchHistory.aggregate([
    {
      $match: {
        createdAt: { $gte: cutoffDate }
      }
    },
    {
      $group: {
        _id: '$user',
        searchCount: { $sum: 1 },
        averageQueryLength: { $avg: { $strLenCP: '$searchQuery' } },
        usesVoiceSearch: { $sum: { $cond: ['$searchContext.voiceInput', 1, 0] } },
        languagePreference: { $first: '$processedQuery.language' }
      }
    },
    {
      $group: {
        _id: null,
        activeUsers: { $sum: 1 },
        averageSearchesPerUser: { $avg: '$searchCount' },
        averageQueryLength: { $avg: '$averageQueryLength' },
        voiceSearchAdoption: { $avg: { $cond: [{ $gt: ['$usesVoiceSearch', 0] }, 1, 0] } },
        arabicUsers: { $sum: { $cond: [{ $eq: ['$languagePreference', 'ar'] }, 1, 0] } },
        englishUsers: { $sum: { $cond: [{ $eq: ['$languagePreference', 'en'] }, 1, 0] } }
      }
    }
  ]);

  const behavior = behaviorPatterns[0] || {};

  return {
    userProfiles: {
      total: profiles.totalProfiles || 0,
      averageCompleteness: (profiles.averageCompleteness || 0) * 100,
      averageConfidence: (profiles.averageConfidence || 0) * 100,
      averageInteractions: profiles.averageInteractions || 0
    },
    searchBehavior: {
      activeUsers: behavior.activeUsers || 0,
      averageSearchesPerUser: behavior.averageSearchesPerUser || 0,
      averageQueryLength: behavior.averageQueryLength || 0,
      voiceSearchAdoptionRate: (behavior.voiceSearchAdoption || 0) * 100,
      languagePreference: {
        arabic: behavior.arabicUsers || 0,
        english: behavior.englishUsers || 0
      }
    }
  };
}

/**
 * Get popularity trends and metrics
 */
async function getPopularityTrends(cutoffDate) {
  const trendingData = await VenuePopularityMetrics.aggregate([
    {
      $sort: { lastUpdated: -1 }
    },
    {
      $group: {
        _id: '$activity',
        latestMetrics: { $first: '$$ROOT' }
      }
    },
    {
      $replaceRoot: { newRoot: '$latestMetrics' }
    },
    {
      $lookup: {
        from: 'activities',
        localField: 'activity',
        foreignField: '_id',
        as: 'activityInfo'
      }
    },
    {
      $unwind: '$activityInfo'
    },
    {
      $group: {
        _id: '$activityInfo.category',
        averagePopularity: { $avg: '$popularityScore' },
        averageCulturalRating: { $avg: '$culturalRating' },
        totalBookings: { $sum: '$metrics.totalBookings' },
        averageConversion: { $avg: '$metrics.conversionRate' },
        activityCount: { $sum: 1 }
      }
    },
    {
      $sort: { averagePopularity: -1 }
    }
  ]);

  // Get top trending individual activities
  const topActivities = await VenuePopularityMetrics.find({})
    .populate('activity', 'title category')
    .sort({ trendingScore: -1 })
    .limit(10)
    .lean();

  return {
    categoryTrends: trendingData,
    topTrendingActivities: topActivities.map(metric => ({
      activity: metric.activity,
      trendingScore: metric.trendingScore,
      popularityScore: metric.popularityScore,
      culturalRating: metric.culturalRating,
      totalBookings: metric.metrics?.totalBookings || 0
    })),
    trendingInsights: generateTrendingInsights(trendingData)
  };
}

/**
 * Get geographic analytics
 */
async function getGeographicAnalytics(cutoffDate) {
  const geoData = await UserSearchHistory.aggregate([
    {
      $match: {
        createdAt: { $gte: cutoffDate },
        'geoLocation.city': { $exists: true }
      }
    },
    {
      $group: {
        _id: '$geoLocation.city',
        searchCount: { $sum: 1 },
        uniqueUsers: { $addToSet: '$user' },
        averageResults: { $avg: '$resultsReturned' },
        popularIntents: { $push: '$processedQuery.intent' }
      }
    },
    {
      $addFields: {
        uniqueUserCount: { $size: '$uniqueUsers' }
      }
    },
    {
      $sort: { searchCount: -1 }
    },
    {
      $limit: 10
    }
  ]);

  // Get venue distribution by city
  const venueDistribution = await VenuePopularityMetrics.aggregate([
    {
      $lookup: {
        from: 'vendors',
        localField: 'venue',
        foreignField: '_id',
        as: 'venueInfo'
      }
    },
    {
      $unwind: '$venueInfo'
    },
    {
      $group: {
        _id: '$venueInfo.location.city',
        venueCount: { $sum: 1 },
        averagePopularity: { $avg: '$popularityScore' },
        totalBookings: { $sum: '$metrics.totalBookings' }
      }
    },
    {
      $sort: { venueCount: -1 }
    }
  ]);

  return {
    searchDistribution: geoData,
    venueDistribution,
    insights: generateGeographicInsights(geoData, venueDistribution)
  };
}

/**
 * Get detailed performance metrics for admin dashboard
 */
async function getDetailedMetrics(cutoffDate) {
  const [
    hourlyDistribution,
    queryComplexityAnalysis,
    filterUsageAnalysis,
    recommendationEffectiveness
  ] = await Promise.all([
    getHourlySearchDistribution(cutoffDate),
    getQueryComplexityAnalysis(cutoffDate),
    getFilterUsageAnalysis(cutoffDate),
    getRecommendationEffectiveness(cutoffDate)
  ]);

  return {
    hourlyDistribution,
    queryComplexityAnalysis,
    filterUsageAnalysis,
    recommendationEffectiveness
  };
}

/**
 * Get hourly search distribution
 */
async function getHourlySearchDistribution(cutoffDate) {
  return await UserSearchHistory.aggregate([
    {
      $match: {
        createdAt: { $gte: cutoffDate }
      }
    },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        searchCount: { $sum: 1 },
        averageResults: { $avg: '$resultsReturned' }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);
}

/**
 * Get query complexity analysis
 */
async function getQueryComplexityAnalysis(cutoffDate) {
  return await UserSearchHistory.aggregate([
    {
      $match: {
        createdAt: { $gte: cutoffDate }
      }
    },
    {
      $addFields: {
        queryLength: { $strLenCP: '$searchQuery' },
        queryWords: { $size: { $split: ['$searchQuery', ' '] } },
        hasLocation: { $toBool: '$searchFilters.location' },
        hasFilters: { $toBool: '$searchFilters.priceRange' },
        intentCount: { $size: { $ifNull: ['$processedQuery.intent', []] } }
      }
    },
    {
      $group: {
        _id: null,
        averageQueryLength: { $avg: '$queryLength' },
        averageWordCount: { $avg: '$queryWords' },
        locationUsageRate: { $avg: { $cond: ['$hasLocation', 1, 0] } },
        filterUsageRate: { $avg: { $cond: ['$hasFilters', 1, 0] } },
        averageIntentCount: { $avg: '$intentCount' },
        complexQueryRate: {
          $avg: { $cond: [{ $and: ['$hasLocation', '$hasFilters', { $gt: ['$queryWords', 3] }] }, 1, 0] }
        }
      }
    }
  ]);
}

/**
 * Get filter usage analysis
 */
async function getFilterUsageAnalysis(cutoffDate) {
  const filterData = await UserSearchHistory.aggregate([
    {
      $match: {
        createdAt: { $gte: cutoffDate }
      }
    },
    {
      $group: {
        _id: null,
        locationFilters: { $sum: { $cond: [{ $ne: ['$searchFilters.location', null] }, 1, 0] } },
        priceFilters: { $sum: { $cond: [{ $ne: ['$searchFilters.priceRange', null] }, 1, 0] } },
        categoryFilters: { $sum: { $cond: [{ $ne: ['$searchFilters.category', null] }, 1, 0] } },
        participantFilters: { $sum: { $cond: [{ $ne: ['$searchFilters.participants', null] }, 1, 0] } },
        dateFilters: { $sum: { $cond: [{ $ne: ['$searchFilters.date', null] }, 1, 0] } },
        difficultyFilters: { $sum: { $cond: [{ $ne: ['$searchFilters.difficulty', null] }, 1, 0] } },
        totalSearches: { $sum: 1 }
      }
    }
  ]);

  const filters = filterData[0] || {};
  const total = filters.totalSearches || 1;

  return {
    usage: {
      location: (filters.locationFilters / total) * 100,
      priceRange: (filters.priceFilters / total) * 100,
      category: (filters.categoryFilters / total) * 100,
      participants: (filters.participantFilters / total) * 100,
      date: (filters.dateFilters / total) * 100,
      difficulty: (filters.difficultyFilters / total) * 100
    },
    insights: generateFilterInsights(filters, total)
  };
}

/**
 * Get recommendation effectiveness metrics
 */
async function getRecommendationEffectiveness(cutoffDate) {
  const recommendationData = await UserPreferenceProfile.aggregate([
    {
      $unwind: '$recommendationHistory'
    },
    {
      $match: {
        'recommendationHistory.recommendedAt': { $gte: cutoffDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRecommendations: { $sum: 1 },
        clickedRecommendations: {
          $sum: { $cond: [{ $eq: ['$recommendationHistory.userResponse', 'clicked'] }, 1, 0] }
        },
        bookedRecommendations: {
          $sum: { $cond: [{ $eq: ['$recommendationHistory.userResponse', 'booked'] }, 1, 0] }
        },
        sharedRecommendations: {
          $sum: { $cond: [{ $eq: ['$recommendationHistory.userResponse', 'shared'] }, 1, 0] }
        },
        ignoredRecommendations: {
          $sum: { $cond: [{ $eq: ['$recommendationHistory.userResponse', 'ignored'] }, 1, 0] }
        },
        averageRecommendationScore: { $avg: '$recommendationHistory.recommendationScore' },
        averageCulturalFit: { $avg: '$recommendationHistory.culturalFitScore' }
      }
    }
  ]);

  const data = recommendationData[0] || {};
  const total = data.totalRecommendations || 1;

  return {
    effectiveness: {
      clickThroughRate: (data.clickedRecommendations / total) * 100,
      bookingRate: (data.bookedRecommendations / total) * 100,
      shareRate: (data.sharedRecommendations / total) * 100,
      ignoreRate: (data.ignoredRecommendations / total) * 100
    },
    quality: {
      averageScore: data.averageRecommendationScore || 0,
      averageCulturalFit: data.averageCulturalFit || 0
    },
    totalRecommendations: total,
    insights: generateRecommendationInsights(data, total)
  };
}

/**
 * Generate cultural recommendations for platform optimization
 */
function generateCulturalRecommendations(culturalData, venueAlignment) {
  const recommendations = [];

  // Analyze cultural context preferences
  const traditionalists = culturalData.find(d => d._id === 'saudi_traditional');
  const modernists = culturalData.find(d => d._id === 'saudi_modern');

  if (traditionalists && traditionalists.searchCount > (modernists?.searchCount || 0)) {
    recommendations.push({
      type: 'cultural_focus',
      priority: 'high',
      message: 'Increase focus on traditional and heritage activities',
      action: 'Partner with more cultural venues and traditional activity providers'
    });
  }

  if (venueAlignment.traditionalVenues < venueAlignment.modernVenues * 0.5) {
    recommendations.push({
      type: 'venue_balance',
      priority: 'medium',
      message: 'Need more traditional venue partnerships',
      action: 'Recruit heritage sites, cultural centers, and traditional craft workshops'
    });
  }

  return recommendations;
}

/**
 * Generate geographic insights
 */
function generateGeographicInsights(searchData, venueData) {
  const insights = [];

  // Identify underserved markets
  const searchCities = new Map(searchData.map(d => [d._id, d.searchCount]));
  const venueCities = new Map(venueData.map(d => [d._id, d.venueCount]));

  for (const [city, searchCount] of searchCities) {
    const venueCount = venueCities.get(city) || 0;
    const demandSupplyRatio = venueCount > 0 ? searchCount / venueCount : searchCount;

    if (demandSupplyRatio > 10) {
      insights.push({
        type: 'high_demand',
        city,
        message: `High search demand in ${city} with limited venue supply`,
        recommendation: 'Prioritize venue acquisition in this market'
      });
    }
  }

  return insights;
}

/**
 * Generate filter usage insights
 */
function generateFilterInsights(filters, total) {
  const insights = [];

  if (filters.locationFilters / total > 0.8) {
    insights.push({
      type: 'filter_usage',
      message: 'Users heavily rely on location filtering',
      recommendation: 'Enhance location-based search and recommendations'
    });
  }

  if (filters.priceFilters / total > 0.6) {
    insights.push({
      type: 'price_sensitivity',
      message: 'High price filter usage indicates price-conscious users',
      recommendation: 'Ensure good coverage across price ranges'
    });
  }

  return insights;
}

/**
 * Generate recommendation effectiveness insights
 */
function generateRecommendationInsights(data, total) {
  const insights = [];

  const clickThroughRate = (data.clickedRecommendations / total) * 100;
  const bookingRate = (data.bookedRecommendations / total) * 100;

  if (clickThroughRate < 15) {
    insights.push({
      type: 'low_engagement',
      message: 'Low recommendation click-through rate',
      recommendation: 'Improve recommendation relevance and presentation'
    });
  }

  if (bookingRate < 5) {
    insights.push({
      type: 'conversion_issue',
      message: 'Low booking conversion from recommendations',
      recommendation: 'Review recommendation quality and booking flow'
    });
  }

  if (data.averageCulturalFit < 0.7) {
    insights.push({
      type: 'cultural_mismatch',
      message: 'Cultural fit scores below target',
      recommendation: 'Enhance cultural context algorithms'
    });
  }

  return insights;
}

/**
 * Calculate overall performance score
 */
function calculatePerformanceScore(metrics) {
  let score = 100;

  // Processing time penalty
  if (metrics.averageProcessingTime > 300) {
    score -= 20;
  } else if (metrics.averageProcessingTime > 200) {
    score -= 10;
  }

  // NLP confidence penalty
  if (metrics.averageNlpConfidence < 0.7) {
    score -= 15;
  } else if (metrics.averageNlpConfidence < 0.8) {
    score -= 5;
  }

  // Ranking quality penalty
  if (metrics.averageRankingQuality < 0.7) {
    score -= 15;
  } else if (metrics.averageRankingQuality < 0.8) {
    score -= 5;
  }

  return Math.max(0, score);
}

/**
 * Generate trending insights
 */
function generateTrendingInsights(trendingData) {
  const insights = [];

  if (trendingData.length === 0) return insights;

  // Identify fastest growing category
  const topCategory = trendingData[0];
  insights.push({
    type: 'category_leader',
    message: `${topCategory._id} is the most popular activity category`,
    metrics: {
      averagePopularity: topCategory.averagePopularity,
      totalBookings: topCategory.totalBookings
    }
  });

  // Identify underperforming categories
  const lowPerforming = trendingData.filter(cat => cat.averagePopularity < 0.3);
  if (lowPerforming.length > 0) {
    insights.push({
      type: 'improvement_opportunity',
      message: `${lowPerforming.length} categories have low engagement`,
      categories: lowPerforming.map(cat => cat._id),
      recommendation: 'Focus on improving these categories or consider strategic changes'
    });
  }

  return insights;
}

/**
 * Get real-time discover agent health status
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getDiscoverAgentHealth = async (req, res) => {
  try {
    const healthChecks = [];

    // Check Python agent connectivity
    try {
      const agentResponse = await axios.get(
        `${process.env.DISCOVER_AGENT_URL || 'http://localhost:8000'}/health`,
        { timeout: 3000 }
      );
      healthChecks.push({
        service: 'discover_agent',
        status: 'healthy',
        responseTime: agentResponse.headers['x-response-time'] || 'unknown',
        details: agentResponse.data
      });
    } catch (error) {
      healthChecks.push({
        service: 'discover_agent',
        status: 'unhealthy',
        error: error.message
      });
    }

    // Check database models
    try {
      const modelChecks = await Promise.all([
        UserSearchHistory.countDocuments({}),
        VenuePopularityMetrics.countDocuments({}),
        UserPreferenceProfile.countDocuments({})
      ]);

      healthChecks.push({
        service: 'database_models',
        status: 'healthy',
        details: {
          searchHistoryCount: modelChecks[0],
          popularityMetricsCount: modelChecks[1],
          userProfilesCount: modelChecks[2]
        }
      });
    } catch (error) {
      healthChecks.push({
        service: 'database_models',
        status: 'unhealthy',
        error: error.message
      });
    }

    // Calculate overall health
    const healthyServices = healthChecks.filter(check => check.status === 'healthy').length;
    const overallHealth = healthyServices / healthChecks.length;

    res.json({
      success: true,
      data: {
        overallHealth: overallHealth >= 0.8 ? 'healthy' : 'degraded',
        healthScore: overallHealth * 100,
        services: healthChecks,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
};

/**
 * Get discover agent performance dashboard data
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getPerformanceDashboard = async (req, res) => {
  try {
    const { timeframe = 'day' } = req.query;
    
    const analytics = await getDiscoverAnalytics({ query: { timeframe, detailed: true } }, { 
      json: (data) => data 
    });

    // Format for dashboard consumption
    const dashboardData = {
      kpis: {
        totalSearches: analytics.data.searchAnalytics.totalSearches,
        searchSuccessRate: analytics.data.searchAnalytics.successRate * 100,
        averageProcessingTime: analytics.data.performanceMetrics.processingTime.average,
        userEngagement: analytics.data.userBehaviorAnalytics.searchBehavior.averageSearchesPerUser
      },
      charts: {
        hourlyDistribution: analytics.data.detailedMetrics?.hourlyDistribution || [],
        languageDistribution: analytics.data.searchAnalytics.languageDistribution,
        categoryTrends: analytics.data.popularityTrends.categoryTrends,
        performanceTrend: generatePerformanceTrend(analytics.data)
      },
      alerts: generatePerformanceAlerts(analytics.data)
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Performance dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance dashboard data'
    });
  }
};

/**
 * Generate performance alerts
 */
function generatePerformanceTrend(analyticsData) {
  // Simplified performance trend calculation
  const processingTime = analyticsData.performanceMetrics?.processingTime?.average || 0;
  const successRate = analyticsData.searchAnalytics?.successRate || 0;
  const nlpConfidence = analyticsData.performanceMetrics?.qualityMetrics?.nlpConfidence || 0;

  return [
    { metric: 'Processing Time', value: processingTime, target: 300, unit: 'ms' },
    { metric: 'Success Rate', value: successRate * 100, target: 85, unit: '%' },
    { metric: 'NLP Confidence', value: nlpConfidence * 100, target: 80, unit: '%' }
  ];
}

/**
 * Generate performance alerts
 */
function generatePerformanceAlerts(analyticsData) {
  const alerts = [];

  // Processing time alert
  const avgProcessingTime = analyticsData.performanceMetrics?.processingTime?.average || 0;
  if (avgProcessingTime > 300) {
    alerts.push({
      type: 'performance',
      severity: 'warning',
      message: `Average processing time (${avgProcessingTime}ms) exceeds target (300ms)`,
      recommendation: 'Optimize search algorithms or scale infrastructure'
    });
  }

  // Success rate alert
  const successRate = analyticsData.searchAnalytics?.successRate || 0;
  if (successRate < 0.85) {
    alerts.push({
      type: 'quality',
      severity: 'warning',
      message: `Search success rate (${(successRate * 100).toFixed(1)}%) below target (85%)`,
      recommendation: 'Review search algorithms and activity data quality'
    });
  }

  // Low engagement alert
  const avgSearches = analyticsData.userBehaviorAnalytics?.searchBehavior?.averageSearchesPerUser || 0;
  if (avgSearches < 2) {
    alerts.push({
      type: 'engagement',
      severity: 'info',
      message: 'Low user search frequency indicates potential engagement issues',
      recommendation: 'Improve search experience and recommendation quality'
    });
  }

  return alerts;
}

module.exports = {
  getDiscoverAnalytics,
  getDiscoverAgentHealth,
  getPerformanceDashboard
};