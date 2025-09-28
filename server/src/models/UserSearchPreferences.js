/**
 * @fileoverview User Search Preferences model for LUDUS platform.
 * 
 * This model stores learned user preferences for the Selena-Discover AI agent.
 * It enables personalized recommendations and search result ranking.
 * 
 * Key Features:
 * - Machine learning-based preference tracking
 * - Cultural preference analysis
 * - Geographic preference learning
 * - Time-based preference patterns
 * - Activity type affinity scoring
 * - Privacy-conscious preference storage
 * 
 * @version 1.0.0
 * @author LUDUS Development Team - Selena-Discover AI Agent
 * @since 2025-09-28
 */

const mongoose = require('mongoose');

const userSearchPreferencesSchema = new mongoose.Schema({
  // User identification
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },

  // Activity type preferences (learned from interactions)
  activityPreferences: {
    categories: {
      type: Map,
      of: {
        affinity: {
          type: Number,
          min: 0,
          max: 1,
          default: 0.5
        },
        interactionCount: {
          type: Number,
          default: 0
        },
        bookingCount: {
          type: Number,
          default: 0
        },
        averageRating: {
          type: Number,
          min: 0,
          max: 5,
          default: 0
        },
        lastInteraction: Date
      },
      default: {}
    },
    subcategories: {
      type: Map,
      of: {
        affinity: Number,
        interactionCount: Number,
        lastInteraction: Date
      },
      default: {}
    },
    tags: {
      type: Map,
      of: {
        preference: Number, // -1 to 1 (negative = avoid, positive = prefer)
        frequency: Number,
        lastSeen: Date
      },
      default: {}
    }
  },

  // Price sensitivity and preferences
  pricePreferences: {
    averageSpent: {
      type: Number,
      default: 0
    },
    priceRanges: {
      under_50: { bookings: Number, satisfaction: Number },
      range_50_100: { bookings: Number, satisfaction: Number },
      range_100_200: { bookings: Number, satisfaction: Number },
      range_200_500: { bookings: Number, satisfaction: Number },
      over_500: { bookings: Number, satisfaction: Number }
    },
    priceSensitivity: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5 // 0 = very price sensitive, 1 = price insensitive
    },
    budgetFlexibility: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    }
  },

  // Geographic preferences
  locationPreferences: {
    preferredCities: {
      type: Map,
      of: {
        visitCount: Number,
        satisfaction: Number,
        lastVisit: Date,
        travelWillingness: Number // 0-1 score for willingness to travel to this city
      },
      default: {}
    },
    proximityPreference: {
      type: Number,
      min: 0,
      max: 100, // maximum kilometers willing to travel
      default: 15
    },
    transportationModes: {
      car: Boolean,
      publicTransport: Boolean,
      walking: Boolean,
      taxi: Boolean
    },
    homeLocation: {
      city: String,
      coordinates: [Number], // [longitude, latitude]
      accuracy: String // 'exact', 'city', 'region'
    }
  },

  // Time-based preferences
  timePreferences: {
    preferredTimes: {
      morning: { preference: Number, count: Number },
      afternoon: { preference: Number, count: Number },
      evening: { preference: Number, count: Number },
      night: { preference: Number, count: Number }
    },
    preferredDays: {
      type: Map,
      of: {
        preference: Number, // 0-1 preference score
        bookingCount: Number,
        averageSatisfaction: Number
      },
      default: {}
    },
    advanceBookingPattern: {
      averageDaysInAdvance: Number,
      plannedVsSpontaneous: Number, // 0 = spontaneous, 1 = well-planned
      lastMinuteComfort: Number // 0-1 comfort with last-minute bookings
    },
    seasonalPreferences: {
      type: Map,
      of: {
        preference: Number,
        activityTypes: [String],
        spendingPattern: Number
      },
      default: {}
    }
  },

  // Cultural and social preferences
  culturalPreferences: {
    familyOrientation: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5 // 0 = individual focused, 1 = family focused
    },
    traditionalModern: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5 // 0 = traditional, 1 = modern
    },
    socialGroupSize: {
      preferred: {
        type: Number,
        min: 1,
        max: 50,
        default: 4
      },
      flexibility: Number // willingness to join different group sizes
    },
    genderPreferences: {
      mixedGroupComfort: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.8
      },
      separateGroupPreference: Boolean,
      familyOnlyEvents: Boolean
    },
    religiousConsiderations: {
      prayerTimeAwareness: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.8
      },
      halalRequirements: Boolean,
      islamicHolidayAvoidance: Boolean
    }
  },

  // Learning and AI model data
  learningData: {
    modelVersion: {
      type: String,
      default: '1.0.0'
    },
    trainingDataPoints: {
      type: Number,
      default: 0
    },
    predictionAccuracy: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    lastModelUpdate: Date,
    feedbackCount: {
      positive: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 }
    },
    preferenceStability: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5 // How stable are the user's preferences
    }
  },

  // Search behavior patterns
  searchBehavior: {
    averageQueryLength: {
      type: Number,
      default: 0
    },
    languageUsage: {
      arabic: { percentage: Number, queries: Number },
      english: { percentage: Number, queries: Number },
      mixed: { percentage: Number, queries: Number }
    },
    searchComplexity: {
      simple: Number, // count of simple searches
      moderate: Number, // count of moderate complexity
      complex: Number // count of complex searches
    },
    filterUsage: {
      location: Number,
      price: Number,
      category: Number,
      time: Number,
      groupSize: Number
    },
    searchToBookingTime: {
      averageMinutes: Number,
      pattern: String // 'immediate', 'considered', 'prolonged'
    }
  },

  // Privacy and consent
  privacySettings: {
    allowPersonalization: {
      type: Boolean,
      default: true
    },
    allowLocationTracking: {
      type: Boolean,
      default: false
    },
    allowBehaviorAnalysis: {
      type: Boolean,
      default: true
    },
    dataRetentionPreference: {
      type: Number,
      min: 30,
      max: 730, // days
      default: 365
    },
    shareWithVendors: {
      type: Boolean,
      default: false
    }
  }

}, {
  timestamps: true
});

// Indexes for AI personalization queries
userSearchPreferencesSchema.index({ user: 1 }, { unique: true });
userSearchPreferencesSchema.index({ 'learningData.modelVersion': 1 });
userSearchPreferencesSchema.index({ 'learningData.trainingDataPoints': -1 });
userSearchPreferencesSchema.index({ 'privacySettings.allowPersonalization': 1 });

/**
 * Update preference based on user interaction
 * @param {String} category - Activity category
 * @param {String} interaction - Type of interaction (view, click, book, rate)
 * @param {Object} metadata - Additional interaction metadata
 */
userSearchPreferencesSchema.methods.updateCategoryPreference = function(category, interaction, metadata = {}) {
  if (!this.activityPreferences.categories.has(category)) {
    this.activityPreferences.categories.set(category, {
      affinity: 0.5,
      interactionCount: 0,
      bookingCount: 0,
      averageRating: 0,
      lastInteraction: new Date()
    });
  }

  const categoryData = this.activityPreferences.categories.get(category);
  
  // Update interaction count
  categoryData.interactionCount += 1;
  categoryData.lastInteraction = new Date();

  // Update affinity based on interaction type
  const affinityBoosts = {
    view: 0.02,
    click: 0.05,
    save: 0.08,
    book: 0.15,
    complete: 0.20,
    rate_high: 0.25, // rating 4-5
    rate_low: -0.15  // rating 1-2
  };

  const boost = affinityBoosts[interaction] || 0;
  categoryData.affinity = Math.min(Math.max(categoryData.affinity + boost, 0), 1);

  // Update booking count
  if (interaction === 'book' || interaction === 'complete') {
    categoryData.bookingCount += 1;
  }

  // Update average rating
  if (metadata.rating && interaction.startsWith('rate')) {
    const currentAvg = categoryData.averageRating;
    const count = categoryData.bookingCount;
    categoryData.averageRating = count > 0 ? 
      ((currentAvg * (count - 1)) + metadata.rating) / count : metadata.rating;
  }

  this.activityPreferences.categories.set(category, categoryData);
  this.learningData.trainingDataPoints += 1;
  
  return this.save();
};

/**
 * Get personalized recommendation weights for search ranking
 * @returns {Object} Recommendation weights
 */
userSearchPreferencesSchema.methods.getPersonalizationWeights = function() {
  const weights = {
    categories: {},
    cultural: {},
    geographic: {},
    temporal: {},
    social: {}
  };

  // Category weights from learned preferences
  for (const [category, data] of this.activityPreferences.categories) {
    weights.categories[category] = data.affinity;
  }

  // Cultural weights
  weights.cultural = {
    family_friendly: this.culturalPreferences.familyOrientation,
    traditional: 1 - this.culturalPreferences.traditionalModern, // Inverse for traditional preference
    modern: this.culturalPreferences.traditionalModern,
    prayer_aware: this.culturalPreferences.religiousConsiderations.prayerTimeAwareness
  };

  // Geographic weights
  weights.geographic = {
    proximity_importance: 1 - (this.locationPreferences.proximityPreference / 100),
    city_preferences: Object.fromEntries(this.locationPreferences.preferredCities)
  };

  // Temporal weights
  weights.temporal = {
    time_preferences: Object.fromEntries(this.timePreferences.preferredDays),
    advance_booking: this.timePreferences.advanceBookingPattern.plannedVsSpontaneous
  };

  // Social weights
  weights.social = {
    group_size_preference: this.culturalPreferences.socialGroupSize.preferred,
    mixed_group_comfort: this.culturalPreferences.genderPreferences.mixedGroupComfort
  };

  return weights;
};

module.exports = mongoose.model('UserSearchPreferences', userSearchPreferencesSchema);