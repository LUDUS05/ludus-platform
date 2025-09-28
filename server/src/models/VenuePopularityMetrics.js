/**
 * @fileoverview Venue Popularity Metrics model for Selena-Discover AI Agent
 * 
 * This model tracks venue and activity popularity metrics, cultural alignment,
 * and performance data to power intelligent recommendations and discovery algorithms.
 * 
 * @version 1.0.0
 * @author LUDUS Development Team - Selena-Discover Implementation
 * @since 2025-09-28
 */

const mongoose = require('mongoose');

const venuePopularityMetricsSchema = new mongoose.Schema({
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    unique: true,
    index: true
  },
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    index: true
  },
  popularityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    default: 0.5
  },
  culturalRating: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    default: 0.5
  },
  trendingScore: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  metrics: {
    totalViews: {
      type: Number,
      default: 0,
      min: 0
    },
    totalBookings: {
      type: Number,
      default: 0,
      min: 0
    },
    conversionRate: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    averageSessionDuration: Number, // seconds
    repeatVisitorRate: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    shareCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  peakHours: [{
    hour: {
      type: Number,
      min: 0,
      max: 23
    },
    activityLevel: {
      type: Number,
      min: 0,
      max: 1
    },
    bookingRate: Number
  }],
  peakDays: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    activityLevel: {
      type: Number,
      min: 0,
      max: 1
    },
    bookingRate: Number
  }],
  userDemographics: {
    ageGroups: {
      '18-25': { type: Number, default: 0 },
      '26-35': { type: Number, default: 0 },
      '36-45': { type: Number, default: 0 },
      '46-55': { type: Number, default: 0 },
      '55+': { type: Number, default: 0 }
    },
    genderDistribution: {
      male: { type: Number, default: 0 },
      female: { type: Number, default: 0 },
      mixed: { type: Number, default: 0 }
    },
    culturalProfiles: {
      saudi_traditional: { type: Number, default: 0 },
      saudi_modern: { type: Number, default: 0 },
      expat_western: { type: Number, default: 0 },
      expat_arab: { type: Number, default: 0 }
    },
    languagePreference: {
      arabic: { type: Number, default: 0 },
      english: { type: Number, default: 0 },
      mixed: { type: Number, default: 0 }
    }
  },
  geographicMetrics: {
    primaryCatchmentArea: {
      center: [Number], // [longitude, latitude]
      radiusKm: Number
    },
    visitorOrigins: [{
      city: String,
      visitorCount: Number,
      averageDistance: Number
    }],
    proximityScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    }
  },
  culturalMetrics: {
    traditionalAlignment: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    modernAlignment: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    familyFriendliness: {
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
    genderPolicyAlignment: {
      mixed: { type: Number, default: 0 },
      separated: { type: Number, default: 0 },
      flexible: { type: Number, default: 0 }
    }
  },
  seasonalTrends: [{
    season: {
      type: String,
      enum: ['spring', 'summer', 'autumn', 'winter', 'ramadan', 'hajj', 'national_day']
    },
    popularityMultiplier: {
      type: Number,
      min: 0,
      max: 3,
      default: 1
    },
    bookingPattern: String,
    culturalRelevance: Number
  }],
  competitiveMetrics: {
    categoryRank: Number,
    cityRank: Number,
    pricePositioning: {
      type: String,
      enum: ['budget', 'mid-range', 'premium', 'luxury']
    },
    uniquenessScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    }
  },
  qualityIndicators: {
    repeatBookingRate: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    referralRate: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    reviewSentiment: {
      positive: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      negative: { type: Number, default: 0 }
    },
    responseTime: Number, // Average vendor response time in hours
    serviceQuality: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  calculationMetadata: {
    dataPoints: Number,
    confidenceLevel: Number,
    algorithmVersion: {
      type: String,
      default: '1.0.0'
    },
    lastRecalculation: Date
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
venuePopularityMetricsSchema.index({ popularityScore: -1, culturalRating: -1 });
venuePopularityMetricsSchema.index({ 'geographicMetrics.proximityScore': -1 });
venuePopularityMetricsSchema.index({ 'culturalMetrics.traditionalAlignment': -1 });
venuePopularityMetricsSchema.index({ 'culturalMetrics.modernAlignment': -1 });
venuePopularityMetricsSchema.index({ 'qualityIndicators.serviceQuality': -1 });

// Virtual for overall recommendation score
venuePopularityMetricsSchema.virtual('recommendationScore').get(function() {
  return (
    this.popularityScore * 0.3 +
    this.culturalRating * 0.25 +
    this.qualityIndicators.serviceQuality / 5 * 0.25 +
    this.geographicMetrics.proximityScore * 0.2
  );
});

// Method to update popularity score
venuePopularityMetricsSchema.methods.updatePopularityScore = function(newMetrics) {
  // Weighted average with decay for older data
  const decayFactor = 0.95;
  
  this.popularityScore = (this.popularityScore * decayFactor) + 
                        (newMetrics.popularityDelta * (1 - decayFactor));
  
  // Update related metrics
  if (newMetrics.views) this.metrics.totalViews += newMetrics.views;
  if (newMetrics.bookings) this.metrics.totalBookings += newMetrics.bookings;
  
  // Recalculate conversion rate
  if (this.metrics.totalViews > 0) {
    this.metrics.conversionRate = this.metrics.totalBookings / this.metrics.totalViews;
  }
  
  this.lastUpdated = new Date();
  return this.save();
};

// Method to update cultural rating
venuePopularityMetricsSchema.methods.updateCulturalRating = function(culturalFeedback) {
  const {
    traditionalScore,
    modernScore,
    familyScore,
    religiousScore,
    genderPolicyScore
  } = culturalFeedback;
  
  // Update cultural metrics with exponential moving average
  const alpha = 0.2; // Learning rate
  
  if (traditionalScore !== undefined) {
    this.culturalMetrics.traditionalAlignment = 
      (1 - alpha) * this.culturalMetrics.traditionalAlignment + alpha * traditionalScore;
  }
  
  if (modernScore !== undefined) {
    this.culturalMetrics.modernAlignment = 
      (1 - alpha) * this.culturalMetrics.modernAlignment + alpha * modernScore;
  }
  
  if (familyScore !== undefined) {
    this.culturalMetrics.familyFriendliness = 
      (1 - alpha) * this.culturalMetrics.familyFriendliness + alpha * familyScore;
  }
  
  if (religiousScore !== undefined) {
    this.culturalMetrics.religiousConsideration = 
      (1 - alpha) * this.culturalMetrics.religiousConsideration + alpha * religiousScore;
  }
  
  // Recalculate overall cultural rating
  this.culturalRating = (
    this.culturalMetrics.traditionalAlignment * 0.25 +
    this.culturalMetrics.modernAlignment * 0.25 +
    this.culturalMetrics.familyFriendliness * 0.25 +
    this.culturalMetrics.religiousConsideration * 0.25
  );
  
  this.lastUpdated = new Date();
  return this.save();
};

// Static method to get trending venues
venuePopularityMetricsSchema.statics.getTrendingVenues = async function(location, timeframe = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - timeframe);
  
  let matchQuery = {
    lastUpdated: { $gte: cutoffDate }
  };
  
  if (location) {
    matchQuery['geographicMetrics.visitorOrigins.city'] = { $regex: location, $options: 'i' };
  }
  
  return await this.find(matchQuery)
    .populate('venue', 'businessName location')
    .populate('activity', 'title category')
    .sort({ trendingScore: -1, popularityScore: -1 })
    .limit(20)
    .lean();
};

// Static method to calculate recommendation matrix
venuePopularityMetricsSchema.statics.buildRecommendationMatrix = async function() {
  const venues = await this.find({})
    .populate('venue')
    .populate('activity')
    .lean();
  
  // Build feature matrix for ML algorithms
  const matrix = venues.map(venue => ({
    id: venue._id,
    features: [
      venue.popularityScore,
      venue.culturalRating,
      venue.geographicMetrics.proximityScore,
      venue.culturalMetrics.traditionalAlignment,
      venue.culturalMetrics.modernAlignment,
      venue.culturalMetrics.familyFriendliness,
      venue.qualityIndicators.serviceQuality / 5,
      venue.metrics.conversionRate
    ],
    metadata: {
      category: venue.activity?.category,
      city: venue.venue?.location?.city,
      culturalContext: venue.culturalMetrics
    }
  }));
  
  return matrix;
};

module.exports = mongoose.model('VenuePopularityMetrics', venuePopularityMetricsSchema);