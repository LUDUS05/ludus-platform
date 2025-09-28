/**
 * @fileoverview Venue Popularity Metrics model for LUDUS platform.
 * 
 * This model tracks venue and activity popularity metrics for the Selena-Discover AI agent.
 * It enables intelligent ranking and cultural context analysis.
 * 
 * Key Features:
 * - Real-time popularity tracking
 * - Cultural preference analytics
 * - Geographic clustering insights
 * - Time-based popularity patterns
 * - Demographic analysis
 * - Seasonal trend tracking
 * 
 * @version 1.0.0
 * @author LUDUS Development Team - Selena-Discover AI Agent
 * @since 2025-09-28
 */

const mongoose = require('mongoose');

const venuePopularityMetricsSchema = new mongoose.Schema({
  // Venue/Activity identification
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    index: true
  },
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    index: true
  },
  
  // Popularity metrics
  popularityScore: {
    current: {
      type: Number,
      default: 0.0,
      min: 0,
      max: 1
    },
    historical: [{
      score: Number,
      date: Date,
      calculationMethod: String
    }],
    trend: {
      type: String,
      enum: ['rising', 'declining', 'stable', 'new'],
      default: 'new'
    },
    trendPercentage: {
      type: Number,
      default: 0
    }
  },

  // Cultural preference metrics
  culturalMetrics: {
    familyFriendlyScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    traditionalValueAlignment: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    modernizationScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    socialGatheringFit: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    religiousConsideration: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    genderAppropriateScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    }
  },

  // Geographic analytics
  geographicMetrics: {
    localPopularity: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    touristAppeal: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    accessibilityScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    proximityToLandmarks: [{
      landmark: String,
      distance: Number, // in kilometers
      significance: Number // 0-1 score
    }],
    transportationAccess: {
      publicTransport: Boolean,
      parkingAvailable: Boolean,
      walkability: Number // 0-1 score
    }
  },

  // Time-based popularity patterns
  timePatterns: {
    peakHours: [{
      hour: {
        type: Number,
        min: 0,
        max: 23
      },
      popularityScore: Number,
      bookingCount: Number
    }],
    peakDays: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      popularityScore: Number,
      bookingCount: Number
    }],
    seasonalTrends: [{
      season: {
        type: String,
        enum: ['spring', 'summer', 'autumn', 'winter']
      },
      popularityScore: Number,
      bookingCount: Number,
      culturalEvents: [String]
    }],
    prayerTimeConsideration: {
      prayerAware: Boolean,
      flexibleTiming: Boolean,
      popularityDuringPrayerTimes: Number
    }
  },

  // User demographic insights
  demographicInsights: {
    ageGroups: {
      under_18: { count: Number, satisfaction: Number },
      age_18_25: { count: Number, satisfaction: Number },
      age_26_35: { count: Number, satisfaction: Number },
      age_36_45: { count: Number, satisfaction: Number },
      over_45: { count: Number, satisfaction: Number }
    },
    genderBreakdown: {
      male: { count: Number, satisfaction: Number },
      female: { count: Number, satisfaction: Number },
      mixed: { count: Number, satisfaction: Number }
    },
    groupSizePreferences: {
      solo: { count: Number, satisfaction: Number },
      couple: { count: Number, satisfaction: Number },
      small_group: { count: Number, satisfaction: Number }, // 3-6 people
      large_group: { count: Number, satisfaction: Number }  // 7+ people
    },
    loyaltyMetrics: {
      repeatVisitors: Number,
      averageVisitsPerUser: Number,
      customerLifetimeValue: Number
    }
  },

  // Search and discovery metrics
  discoveryMetrics: {
    searchImpressions: {
      type: Number,
      default: 0
    },
    searchClicks: {
      type: Number,
      default: 0
    },
    searchToBookingConversion: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    averageSearchRank: {
      type: Number,
      default: 0
    },
    commonSearchQueries: [{
      query: String,
      frequency: Number,
      language: String,
      avgRankPosition: Number
    }],
    categorySearchVolume: {
      type: Map,
      of: Number,
      default: {}
    }
  },

  // Competitive analysis
  competitiveMetrics: {
    categoryRank: {
      type: Number,
      min: 1
    },
    localAreaRank: {
      type: Number,
      min: 1
    },
    priceCompetitiveness: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    uniqueSellingPoints: [String],
    competitiveAdvantages: [String]
  },

  // Update metadata
  lastCalculated: {
    type: Date,
    default: Date.now
  },
  calculationVersion: {
    type: String,
    default: '1.0.0'
  },
  dataQuality: {
    completeness: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    freshness: {
      type: Number,
      min: 0,
      max: 1,
      default: 1
    }
  }

}, {
  timestamps: true
});

// Indexes for AI agent queries
venuePopularityMetricsSchema.index({ 'popularityScore.current': -1 });
venuePopularityMetricsSchema.index({ 'culturalMetrics.familyFriendlyScore': -1 });
venuePopularityMetricsSchema.index({ 'geographicMetrics.localPopularity': -1 });
venuePopularityMetricsSchema.index({ 'discoveryMetrics.searchToBookingConversion': -1 });

// Compound indexes for complex AI queries
venuePopularityMetricsSchema.index({
  'popularityScore.current': -1,
  'culturalMetrics.familyFriendlyScore': -1,
  lastCalculated: -1
});

/**
 * Calculate overall recommendation score for AI agent
 * @param {Object} userContext - User preferences and context
 * @param {Object} searchContext - Current search context
 * @returns {Number} Recommendation score (0-1)
 */
venuePopularityMetricsSchema.methods.calculateRecommendationScore = function(userContext = {}, searchContext = {}) {
  let score = 0;
  const weights = {
    popularity: 0.25,
    cultural: 0.3,
    geographic: 0.2,
    demographic: 0.15,
    competitive: 0.1
  };

  // Popularity component
  score += this.popularityScore.current * weights.popularity;

  // Cultural component
  const culturalScore = (
    this.culturalMetrics.familyFriendlyScore +
    this.culturalMetrics.traditionalValueAlignment +
    this.culturalMetrics.religiousConsideration
  ) / 3;
  score += culturalScore * weights.cultural;

  // Geographic component
  score += this.geographicMetrics.localPopularity * weights.geographic;

  // Demographic fit (based on user context)
  let demographicScore = 0.5; // Default neutral
  if (userContext.age) {
    const ageGroup = this._getAgeGroup(userContext.age);
    const ageData = this.demographicInsights.ageGroups[ageGroup];
    if (ageData && ageData.count > 0) {
      demographicScore = ageData.satisfaction;
    }
  }
  score += demographicScore * weights.demographic;

  // Competitive component
  score += this.competitiveMetrics.priceCompetitiveness * weights.competitive;

  return Math.min(Math.max(score, 0), 1);
};

/**
 * Update popularity metrics based on new interaction data
 * @param {Object} interactionData - New interaction data
 */
venuePopularityMetricsSchema.methods.updatePopularityMetrics = function(interactionData) {
  // Update search impressions
  if (interactionData.type === 'search_impression') {
    this.discoveryMetrics.searchImpressions += 1;
  }

  // Update search clicks
  if (interactionData.type === 'search_click') {
    this.discoveryMetrics.searchClicks += 1;
    this.discoveryMetrics.searchToBookingConversion = 
      this.discoveryMetrics.searchClicks > 0 ? 
      (this.discoveryMetrics.searchClicks / this.discoveryMetrics.searchImpressions) : 0;
  }

  // Update booking conversion
  if (interactionData.type === 'booking_completed') {
    // Increase popularity score for successful bookings
    const currentScore = this.popularityScore.current;
    this.popularityScore.current = Math.min(currentScore + 0.01, 1.0);
    
    // Update demographic data
    if (interactionData.userDemographics) {
      this._updateDemographicData(interactionData.userDemographics);
    }
  }

  this.lastCalculated = new Date();
  return this.save();
};

/**
 * Get age group classification
 * @private
 */
venuePopularityMetricsSchema.methods._getAgeGroup = function(age) {
  if (age < 18) return 'under_18';
  if (age >= 18 && age <= 25) return 'age_18_25';
  if (age >= 26 && age <= 35) return 'age_26_35';
  if (age >= 36 && age <= 45) return 'age_36_45';
  return 'over_45';
};

/**
 * Update demographic data based on user interaction
 * @private
 */
venuePopularityMetricsSchema.methods._updateDemographicData = function(demographics) {
  const ageGroup = this._getAgeGroup(demographics.age);
  
  if (!this.demographicInsights.ageGroups[ageGroup]) {
    this.demographicInsights.ageGroups[ageGroup] = { count: 0, satisfaction: 0 };
  }
  
  this.demographicInsights.ageGroups[ageGroup].count += 1;
  
  // Update satisfaction if provided
  if (demographics.satisfaction) {
    const current = this.demographicInsights.ageGroups[ageGroup];
    current.satisfaction = ((current.satisfaction * (current.count - 1)) + demographics.satisfaction) / current.count;
  }
};

/**
 * Get cultural recommendations based on metrics
 * @param {String} language - Response language
 * @returns {Array} Cultural recommendations
 */
venuePopularityMetricsSchema.methods.getCulturalRecommendations = function(language = 'ar') {
  const recommendations = [];
  
  if (this.culturalMetrics.familyFriendlyScore > 0.8) {
    recommendations.push(
      language.startsWith('ar') ? 
      'مناسب جداً للعائلات السعودية' : 
      'Highly suitable for Saudi families'
    );
  }

  if (this.culturalMetrics.traditionalValueAlignment > 0.7) {
    recommendations.push(
      language.startsWith('ar') ? 
      'يحترم القيم التقليدية السعودية' : 
      'Respects traditional Saudi values'
    );
  }

  if (this.timePatterns.prayerTimeConsideration.prayerAware) {
    recommendations.push(
      language.startsWith('ar') ? 
      'يراعي أوقات الصلاة' : 
      'Prayer time considerate'
    );
  }

  return recommendations;
};

module.exports = mongoose.model('VenuePopularityMetrics', venuePopularityMetricsSchema);