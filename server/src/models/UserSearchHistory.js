/**
 * @fileoverview User Search History model for Selena-Discover AI Agent
 * 
 * This model tracks user search patterns, behavior, and preferences for
 * the intelligent discovery system. It enables machine learning algorithms
 * to provide better recommendations and cultural context awareness.
 * 
 * @version 1.0.0
 * @author LUDUS Development Team - Selena-Discover Implementation
 * @since 2025-09-28
 */

const mongoose = require('mongoose');

const userSearchHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  searchQuery: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  processedQuery: {
    originalQuery: String,
    language: {
      type: String,
      enum: ['ar', 'en'],
      default: 'ar'
    },
    intent: [String], // Extracted intents (adventure, food, etc.)
    entities: {
      activities: [String],
      locations: [String],
      time: [String],
      price: [String],
      participants: Number
    },
    filters: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    }
  },
  searchFilters: {
    location: {
      city: String,
      coordinates: [Number], // [longitude, latitude]
      radius: Number
    },
    priceRange: {
      min: Number,
      max: Number
    },
    category: [String],
    participants: Number,
    date: Date,
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all_levels']
    },
    duration: {
      min: Number, // in minutes
      max: Number
    }
  },
  resultsReturned: {
    type: Number,
    default: 0,
    min: 0
  },
  resultsClicked: [{
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity'
    },
    clickedAt: {
      type: Date,
      default: Date.now
    },
    position: Number, // Position in search results
    relevanceScore: Number
  }],
  searchContext: {
    searchType: {
      type: String,
      enum: ['natural', 'filter', 'recommendation', 'geographic', 'voice'],
      default: 'natural'
    },
    voiceInput: {
      type: Boolean,
      default: false
    },
    culturalContext: {
      type: String,
      enum: ['saudi_traditional', 'saudi_modern', 'expat_western', 'expat_arab'],
      default: 'saudi_modern'
    },
    sessionId: String,
    deviceType: String,
    platform: String
  },
  performanceMetrics: {
    processingTimeMs: Number,
    nlpConfidence: Number,
    rankingQuality: Number,
    resultsRelevance: Number
  },
  userInteraction: {
    timeSpentOnResults: Number, // seconds
    scrollDepth: Number, // percentage
    filtersUsed: [String],
    refinedSearch: Boolean,
    bookingAttempted: Boolean,
    sharingActivity: Boolean
  },
  geoLocation: {
    userCoordinates: [Number],
    city: String,
    country: {
      type: String,
      default: 'Saudi Arabia'
    },
    timezone: {
      type: String,
      default: 'Asia/Riyadh'
    }
  }
}, {
  timestamps: true
});

// Indexes for optimal query performance
userSearchHistorySchema.index({ user: 1, createdAt: -1 });
userSearchHistorySchema.index({ 'searchContext.searchType': 1 });
userSearchHistorySchema.index({ 'processedQuery.language': 1 });
userSearchHistorySchema.index({ 'searchFilters.location.city': 1 });
userSearchHistorySchema.index({ 'processedQuery.intent': 1 });

// Virtual for search success rate
userSearchHistorySchema.virtual('searchSuccessRate').get(function() {
  return this.resultsReturned > 0 && this.resultsClicked.length > 0;
});

// Method to add click interaction
userSearchHistorySchema.methods.addClickInteraction = function(activityId, position, relevanceScore) {
  this.resultsClicked.push({
    activityId,
    clickedAt: new Date(),
    position,
    relevanceScore
  });
  return this.save();
};

// Static method to get user search patterns
userSearchHistorySchema.statics.getUserSearchPatterns = async function(userId, timeframe = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - timeframe);
  
  const patterns = await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: cutoffDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSearches: { $sum: 1 },
        averageResultsClicked: { $avg: { $size: '$resultsClicked' } },
        popularIntents: { $push: '$processedQuery.intent' },
        preferredLanguage: { $push: '$processedQuery.language' },
        searchTypes: { $push: '$searchContext.searchType' },
        averageConfidence: { $avg: '$processedQuery.confidence' },
        commonFilters: { $push: '$searchFilters' }
      }
    }
  ]);
  
  return patterns[0] || null;
};

// Static method to get cultural search trends
userSearchHistorySchema.statics.getCulturalSearchTrends = async function(timeframe = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - timeframe);
  
  return await this.aggregate([
    {
      $match: {
        createdAt: { $gte: cutoffDate }
      }
    },
    {
      $group: {
        _id: '$searchContext.culturalContext',
        searchCount: { $sum: 1 },
        popularIntents: { $push: '$processedQuery.intent' },
        averageSuccess: { $avg: { $cond: [{ $gt: ['$resultsReturned', 0] }, 1, 0] } }
      }
    },
    {
      $sort: { searchCount: -1 }
    }
  ]);
};

module.exports = mongoose.model('UserSearchHistory', userSearchHistorySchema);