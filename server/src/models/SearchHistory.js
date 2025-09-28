/**
 * @fileoverview Search History model for LUDUS platform.
 * 
 * This model tracks user search patterns and queries for the Selena-Discover AI agent.
 * It enables personalized recommendations and search analytics.
 * 
 * Key Features:
 * - Comprehensive search query tracking
 * - Natural language processing metadata
 * - Cultural context preservation
 * - Search result interaction tracking
 * - Performance metrics collection
 * - Privacy-conscious data handling
 * 
 * @version 1.0.0
 * @author LUDUS Development Team - Selena-Discover AI Agent
 * @since 2025-09-28
 */

const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  // User identification
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Search query information
  searchQuery: {
    originalQuery: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true
    },
    processedQuery: {
      type: String,
      maxlength: 500,
      trim: true
    },
    language: {
      type: String,
      enum: ['ar', 'en', 'mixed'],
      default: 'ar'
    },
    queryType: {
      type: String,
      enum: ['text', 'voice', 'visual'],
      default: 'text'
    }
  },

  // NLP Analysis Results
  nlpAnalysis: {
    searchIntent: {
      type: String,
      enum: ['find_activity', 'recommendation', 'nearby', 'popular', 'group', 'solo'],
      default: 'find_activity'
    },
    extractedEntities: [{
      entity: String,
      type: {
        type: String,
        enum: ['location', 'activity_type', 'price', 'time', 'group_size', 'cultural_context']
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1
      }
    }],
    detectedActivityTypes: [String],
    detectedLocation: String,
    culturalContext: {
      familyFriendly: Boolean,
      genderPreferences: String,
      religiousConsiderations: Boolean,
      traditionalValues: Boolean
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    }
  },

  // Applied search filters
  appliedFilters: {
    location: {
      city: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      },
      radius: Number // in kilometers
    },
    priceRange: {
      min: {
        type: Number,
        min: 0
      },
      max: {
        type: Number,
        min: 0
      }
    },
    datePreference: {
      type: String,
      enum: ['today', 'tomorrow', 'weekend', 'this_week', 'flexible']
    },
    groupSize: {
      type: Number,
      min: 1,
      max: 100
    },
    activityCategories: [{
      type: String,
      enum: ['fitness', 'arts', 'food', 'outdoor', 'unique', 'wellness', 'gaming', 'cultural', 'sports']
    }],
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all_levels']
    }
  },

  // Search results and interactions
  searchResults: {
    totalResults: {
      type: Number,
      default: 0
    },
    returnedResults: {
      type: Number,
      default: 0
    },
    topResultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity'
    },
    resultIds: [{
      activity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity'
      },
      relevanceScore: Number,
      culturalFitScore: Number,
      popularityScore: Number,
      geographicScore: Number,
      finalScore: Number,
      rankPosition: Number
    }]
  },

  // User interactions with results
  userInteractions: {
    clickedResults: [{
      activity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity'
      },
      clickPosition: Number,
      clickTimestamp: Date,
      timeSpentViewing: Number // in seconds
    }],
    bookingAttempts: [{
      activity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity'
      },
      bookingStatus: {
        type: String,
        enum: ['initiated', 'completed', 'abandoned', 'failed']
      },
      timestamp: Date
    }],
    savedActivities: [{
      activity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity'
      },
      savedAt: Date
    }],
    sharedResults: [{
      activity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity'
      },
      sharedAt: Date,
      shareMethod: {
        type: String,
        enum: ['whatsapp', 'telegram', 'twitter', 'copy_link', 'email']
      }
    }]
  },

  // Performance metrics
  performanceMetrics: {
    searchTime: {
      type: Number, // milliseconds
      required: true
    },
    nlpProcessingTime: Number, // milliseconds
    databaseQueryTime: Number, // milliseconds
    recommendationTime: Number, // milliseconds
    totalResponseTime: Number // milliseconds
  },

  // Cultural and geographic context
  contextData: {
    userLocation: {
      detectedCity: String,
      coordinates: [Number], // [longitude, latitude]
      accuracy: Number,
      source: {
        type: String,
        enum: ['gps', 'ip', 'manual', 'profile']
      }
    },
    timeContext: {
      searchTime: Date,
      localTimeZone: {
        type: String,
        default: 'Asia/Riyadh'
      },
      nearestPrayerTime: String,
      culturalEvents: [String] // Current cultural events affecting recommendations
    },
    sessionContext: {
      deviceType: String,
      browserLanguage: String,
      sessionDuration: Number, // minutes
      previousSearches: Number // count in current session
    }
  },

  // Feedback and learning data
  feedbackData: {
    userSatisfaction: {
      type: Number,
      min: 1,
      max: 5
    },
    resultQuality: {
      type: Number,
      min: 1,
      max: 5
    },
    culturalRelevance: {
      type: Number,
      min: 1,
      max: 5
    },
    feedbackComment: {
      type: String,
      maxlength: 1000
    },
    feedbackTimestamp: Date
  },

  // Analytics flags
  analyticsFlags: {
    isTrainingData: {
      type: Boolean,
      default: true
    },
    includeInRecommendations: {
      type: Boolean,
      default: true
    },
    isAnonymized: {
      type: Boolean,
      default: false
    },
    dataRetentionDays: {
      type: Number,
      default: 365
    }
  }

}, {
  timestamps: true,
  // Automatic cleanup of old search history
  expireAfterSeconds: 60 * 60 * 24 * 365 // 1 year
});

// Indexes for performance optimization
searchHistorySchema.index({ user: 1, createdAt: -1 });
searchHistorySchema.index({ 'searchQuery.language': 1, createdAt: -1 });
searchHistorySchema.index({ 'nlpAnalysis.searchIntent': 1, createdAt: -1 });
searchHistorySchema.index({ 'appliedFilters.location.city': 1 });
searchHistorySchema.index({ 'appliedFilters.activityCategories': 1 });
searchHistorySchema.index({ 'performanceMetrics.searchTime': 1 });
searchHistorySchema.index({ 'contextData.timeContext.searchTime': 1 });

// Compound indexes for complex queries
searchHistorySchema.index({ 
  user: 1, 
  'nlpAnalysis.searchIntent': 1, 
  'searchQuery.language': 1,
  createdAt: -1 
});

/**
 * Get user's search patterns for personalization
 * @returns {Object} Aggregated search patterns
 */
searchHistorySchema.methods.getUserSearchPatterns = function() {
  return this.constructor.aggregate([
    { $match: { user: this.user } },
    {
      $group: {
        _id: '$user',
        totalSearches: { $sum: 1 },
        favoriteCategories: { $push: '$appliedFilters.activityCategories' },
        averageSearchTime: { $avg: '$performanceMetrics.searchTime' },
        commonLocations: { $push: '$appliedFilters.location.city' },
        searchLanguages: { $push: '$searchQuery.language' },
        searchIntents: { $push: '$nlpAnalysis.searchIntent' }
      }
    }
  ]);
};

/**
 * Get search analytics for specified time period
 * @param {Date} startDate - Start date for analytics
 * @param {Date} endDate - End date for analytics
 * @returns {Object} Search analytics data
 */
searchHistorySchema.statics.getSearchAnalytics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          language: "$searchQuery.language"
        },
        searchCount: { $sum: 1 },
        averageSearchTime: { $avg: "$performanceMetrics.searchTime" },
        averageResults: { $avg: "$searchResults.totalResults" },
        uniqueUsers: { $addToSet: "$user" }
      }
    },
    {
      $group: {
        _id: "$_id.date",
        languageBreakdown: {
          $push: {
            language: "$_id.language",
            searchCount: "$searchCount",
            averageSearchTime: "$averageSearchTime",
            averageResults: "$averageResults",
            uniqueUsers: { $size: "$uniqueUsers" }
          }
        },
        totalSearches: { $sum: "$searchCount" },
        overallAverageTime: { $avg: "$averageSearchTime" }
      }
    },
    { $sort: { "_id": 1 } }
  ]);
};

/**
 * Find similar search patterns for recommendation improvement
 * @param {Object} currentSearch - Current search parameters
 * @returns {Array} Similar searches
 */
searchHistorySchema.statics.findSimilarSearches = function(currentSearch) {
  const pipeline = [
    {
      $match: {
        'nlpAnalysis.searchIntent': currentSearch.searchIntent,
        'searchQuery.language': currentSearch.language,
        'appliedFilters.location.city': currentSearch.location?.city
      }
    },
    {
      $lookup: {
        from: 'activities',
        localField: 'userInteractions.clickedResults.activity',
        foreignField: '_id',
        as: 'clickedActivities'
      }
    },
    {
      $group: {
        _id: '$userInteractions.clickedResults.activity',
        clickCount: { $sum: 1 },
        avgRating: { $avg: '$clickedActivities.rating.average' },
        categories: { $addToSet: '$clickedActivities.category' }
      }
    },
    { $sort: { clickCount: -1 } },
    { $limit: 10 }
  ];
  
  return this.aggregate(pipeline);
};

/**
 * Auto-cleanup old search data for privacy compliance
 */
searchHistorySchema.pre('save', function(next) {
  // Set expiration based on data retention policy
  if (this.analyticsFlags.dataRetentionDays) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + this.analyticsFlags.dataRetentionDays);
    this.expireAt = expirationDate;
  }
  next();
});

/**
 * Anonymize sensitive data for analytics while preserving insights
 */
searchHistorySchema.methods.anonymize = function() {
  this.analyticsFlags.isAnonymized = true;
  this.user = null; // Remove user reference
  this.searchQuery.originalQuery = this.searchQuery.originalQuery.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '*'); // Anonymize Arabic text
  this.searchQuery.processedQuery = this.searchQuery.processedQuery?.replace(/[a-zA-Z]/g, '*'); // Anonymize English text
  return this.save();
};

module.exports = mongoose.model('SearchHistory', searchHistorySchema);