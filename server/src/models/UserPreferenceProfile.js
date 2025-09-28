/**
 * @fileoverview User Preference Profile model for Selena-Discover AI Agent
 * 
 * This model stores comprehensive user preference data, behavior patterns,
 * and machine learning features for personalized activity recommendations.
 * 
 * @version 1.0.0
 * @author LUDUS Development Team - Selena-Discover Implementation
 * @since 2025-09-28
 */

const mongoose = require('mongoose');

const userPreferenceProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  preferenceVector: {
    type: [Number], // ML feature vector for recommendations
    default: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5] // 8-dimensional vector
  },
  categoryPreferences: {
    fitness: {
      interest: { type: Number, min: 0, max: 1, default: 0.5 },
      experience: { type: Number, min: 0, max: 1, default: 0.5 },
      bookingHistory: { type: Number, default: 0 }
    },
    arts: {
      interest: { type: Number, min: 0, max: 1, default: 0.5 },
      experience: { type: Number, min: 0, max: 1, default: 0.5 },
      bookingHistory: { type: Number, default: 0 }
    },
    food: {
      interest: { type: Number, min: 0, max: 1, default: 0.5 },
      experience: { type: Number, min: 0, max: 1, default: 0.5 },
      bookingHistory: { type: Number, default: 0 }
    },
    outdoor: {
      interest: { type: Number, min: 0, max: 1, default: 0.5 },
      experience: { type: Number, min: 0, max: 1, default: 0.5 },
      bookingHistory: { type: Number, default: 0 }
    },
    unique: {
      interest: { type: Number, min: 0, max: 1, default: 0.5 },
      experience: { type: Number, min: 0, max: 1, default: 0.5 },
      bookingHistory: { type: Number, default: 0 }
    },
    wellness: {
      interest: { type: Number, min: 0, max: 1, default: 0.5 },
      experience: { type: Number, min: 0, max: 1, default: 0.5 },
      bookingHistory: { type: Number, default: 0 }
    }
  },
  culturalProfile: {
    traditionalPreference: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    modernPreference: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    familyOrientation: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    socialPreference: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    religiousConsiderations: {
      type: Boolean,
      default: true
    },
    genderSeparationPreference: {
      type: String,
      enum: ['mixed', 'separated', 'flexible'],
      default: 'flexible'
    },
    languagePreference: {
      primary: {
        type: String,
        enum: ['ar', 'en'],
        default: 'ar'
      },
      secondary: String
    }
  },
  behaviorPatterns: {
    searchFrequency: {
      daily: { type: Number, default: 0 },
      weekly: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 }
    },
    bookingPatterns: {
      advanceBookingDays: { type: Number, default: 7 },
      preferredTimeSlots: [String],
      groupSizePreference: {
        min: { type: Number, default: 1 },
        max: { type: Number, default: 5 }
      },
      budgetPatterns: {
        averageSpend: { type: Number, default: 0 },
        maxSpend: { type: Number, default: 500 },
        pricesensitivity: { type: Number, min: 0, max: 1, default: 0.5 }
      }
    },
    interactionPatterns: {
      clickThroughRate: { type: Number, min: 0, max: 1, default: 0 },
      averageTimeOnPage: Number, // seconds
      scrollDepthAverage: { type: Number, min: 0, max: 1, default: 0 },
      shareRate: { type: Number, min: 0, max: 1, default: 0 },
      reviewRate: { type: Number, min: 0, max: 1, default: 0 }
    },
    locationPatterns: {
      preferredCities: [String],
      maxTravelDistance: { type: Number, default: 25 }, // km
      transportPreference: {
        type: String,
        enum: ['car', 'public', 'walk', 'any'],
        default: 'any'
      }
    },
    temporalPatterns: {
      preferredDays: [String],
      preferredTimes: [String],
      planningHorizon: { type: Number, default: 14 }, // days
      flexibility: { type: Number, min: 0, max: 1, default: 0.5 }
    }
  },
  learningMetadata: {
    profileCompleteness: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.1
    },
    dataQuality: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    lastLearningUpdate: {
      type: Date,
      default: Date.now
    },
    totalInteractions: {
      type: Number,
      default: 0
    },
    learningConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.1
    }
  },
  similarUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    similarityScore: {
      type: Number,
      min: 0,
      max: 1
    },
    commonPreferences: [String],
    lastCalculated: Date
  }],
  recommendationHistory: [{
    recommendedActivity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity'
    },
    recommendationScore: Number,
    culturalFitScore: Number,
    userResponse: {
      type: String,
      enum: ['clicked', 'booked', 'shared', 'ignored', 'disliked']
    },
    recommendedAt: {
      type: Date,
      default: Date.now
    },
    context: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Indexes for ML algorithm performance
userPreferenceProfileSchema.index({ 'learningMetadata.profileCompleteness': -1 });
userPreferenceProfileSchema.index({ 'learningMetadata.learningConfidence': -1 });
userPreferenceProfileSchema.index({ 'culturalProfile.traditionalPreference': -1 });
userPreferenceProfileSchema.index({ 'culturalProfile.modernPreference': -1 });

// Virtual for preference completeness percentage
userPreferenceProfileSchema.virtual('completenessPercentage').get(function() {
  return Math.round(this.learningMetadata.profileCompleteness * 100);
});

// Method to update preferences based on user interaction
userPreferenceProfileSchema.methods.updateFromInteraction = function(interactionData) {
  const { type, activityData, userResponse, context } = interactionData;
  
  // Update category preferences based on interaction
  const category = activityData.category;
  if (this.categoryPreferences[category]) {
    const learningRate = {
      'clicked': 0.05,
      'booked': 0.2,
      'shared': 0.15,
      'reviewed': 0.25,
      'ignored': -0.02,
      'disliked': -0.1
    }[userResponse] || 0;
    
    const currentInterest = this.categoryPreferences[category].interest;
    this.categoryPreferences[category].interest = Math.max(0, Math.min(1, 
      currentInterest + learningRate
    ));
    
    if (userResponse === 'booked') {
      this.categoryPreferences[category].bookingHistory++;
    }
  }
  
  // Update cultural preferences
  if (activityData.culturalTags) {
    const traditionalTags = ['traditional', 'heritage', 'cultural'];
    const modernTags = ['modern', 'contemporary', 'trendy'];
    
    const isTraditional = activityData.culturalTags.some(tag => traditionalTags.includes(tag));
    const isModern = activityData.culturalTags.some(tag => modernTags.includes(tag));
    
    const culturalLearningRate = 0.1;
    
    if (isTraditional && ['clicked', 'booked', 'shared'].includes(userResponse)) {
      this.culturalProfile.traditionalPreference = Math.min(1,
        this.culturalProfile.traditionalPreference + culturalLearningRate
      );
    }
    
    if (isModern && ['clicked', 'booked', 'shared'].includes(userResponse)) {
      this.culturalProfile.modernPreference = Math.min(1,
        this.culturalProfile.modernPreference + culturalLearningRate
      );
    }
  }
  
  // Update behavior patterns
  if (context?.searchTime) {
    const hour = new Date(context.searchTime).getHours();
    if (hour < 12) {
      this.behaviorPatterns.temporalPatterns.preferredTimes.push('morning');
    } else if (hour < 18) {
      this.behaviorPatterns.temporalPatterns.preferredTimes.push('afternoon');
    } else {
      this.behaviorPatterns.temporalPatterns.preferredTimes.push('evening');
    }
    
    // Keep only recent preferences
    this.behaviorPatterns.temporalPatterns.preferredTimes = 
      this.behaviorPatterns.temporalPatterns.preferredTimes.slice(-20);
  }
  
  // Update total interactions and learning metadata
  this.learningMetadata.totalInteractions++;
  this.learningMetadata.lastLearningUpdate = new Date();
  
  // Recalculate profile completeness
  this._updateProfileCompleteness();
  
  // Add to recommendation history
  this.recommendationHistory.push({
    recommendedActivity: activityData._id,
    recommendationScore: context?.recommendationScore || 0.5,
    culturalFitScore: context?.culturalFitScore || 0.5,
    userResponse,
    context
  });
  
  // Keep only recent recommendations
  this.recommendationHistory = this.recommendationHistory.slice(-50);
  
  return this.save();
};

// Method to update profile completeness
userPreferenceProfileSchema.methods._updateProfileCompleteness = function() {
  let completeness = 0.1; // Base completeness
  
  // Category preferences completeness
  const categoryCount = Object.keys(this.categoryPreferences).length;
  const categoriesWithHistory = Object.values(this.categoryPreferences)
    .filter(cat => cat.bookingHistory > 0).length;
  completeness += (categoriesWithHistory / categoryCount) * 0.3;
  
  // Cultural profile completeness
  const culturalFields = ['traditionalPreference', 'modernPreference', 
                         'familyOrientation', 'socialPreference'];
  const culturalCompleteness = culturalFields
    .filter(field => this.culturalProfile[field] !== 0.5).length / culturalFields.length;
  completeness += culturalCompleteness * 0.2;
  
  // Behavior patterns completeness
  const hasSearchHistory = this.behaviorPatterns.searchFrequency.weekly > 0;
  const hasBookingHistory = this.behaviorPatterns.bookingPatterns.advanceBookingDays !== 7;
  const hasInteractionData = this.behaviorPatterns.interactionPatterns.clickThroughRate > 0;
  
  completeness += (hasSearchHistory + hasBookingHistory + hasInteractionData) / 3 * 0.3;
  
  // Interaction volume bonus
  if (this.learningMetadata.totalInteractions > 10) {
    completeness += 0.2;
  }
  
  this.learningMetadata.profileCompleteness = Math.min(1, completeness);
  
  // Update learning confidence based on data volume and recency
  const daysSinceLastUpdate = (Date.now() - this.learningMetadata.lastLearningUpdate) / (1000 * 60 * 60 * 24);
  const recencyFactor = Math.max(0.1, 1 - (daysSinceLastUpdate / 30)); // Decay over 30 days
  
  this.learningMetadata.learningConfidence = Math.min(1,
    this.learningMetadata.profileCompleteness * recencyFactor * 
    Math.min(1, this.learningMetadata.totalInteractions / 50)
  );
};

// Method to get similar users for collaborative filtering
userPreferenceProfileSchema.methods.findSimilarUsers = async function(limit = 10) {
  // Calculate similarity based on preference vectors and cultural profiles
  const allUsers = await this.constructor.find({
    user: { $ne: this.user },
    'learningMetadata.profileCompleteness': { $gte: 0.3 }
  }).lean();
  
  const similarities = allUsers.map(otherUser => {
    // Calculate cosine similarity between preference vectors
    const similarity = this._calculateCosineSimilarity(
      this.preferenceVector, 
      otherUser.preferenceVector
    );
    
    // Calculate cultural similarity
    const culturalSimilarity = this._calculateCulturalSimilarity(
      this.culturalProfile,
      otherUser.culturalProfile
    );
    
    // Combined similarity score
    const combinedSimilarity = similarity * 0.7 + culturalSimilarity * 0.3;
    
    return {
      userId: otherUser.user,
      similarityScore: combinedSimilarity,
      commonPreferences: this._findCommonPreferences(this, otherUser),
      lastCalculated: new Date()
    };
  });
  
  // Sort by similarity and return top matches
  similarities.sort((a, b) => b.similarityScore - a.similarityScore);
  
  // Update similar users cache
  this.similarUsers = similarities.slice(0, limit);
  await this.save();
  
  return this.similarUsers;
};

// Helper method to calculate cosine similarity
userPreferenceProfileSchema.methods._calculateCosineSimilarity = function(vec1, vec2) {
  if (vec1.length !== vec2.length) return 0;
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  if (norm1 === 0 || norm2 === 0) return 0;
  
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
};

// Helper method to calculate cultural similarity
userPreferenceProfileSchema.methods._calculateCulturalSimilarity = function(profile1, profile2) {
  const weights = {
    traditionalPreference: 0.25,
    modernPreference: 0.25,
    familyOrientation: 0.2,
    socialPreference: 0.15,
    genderSeparationPreference: 0.15
  };
  
  let similarity = 0;
  
  // Numerical preferences
  for (const [key, weight] of Object.entries(weights)) {
    if (typeof profile1[key] === 'number' && typeof profile2[key] === 'number') {
      const diff = Math.abs(profile1[key] - profile2[key]);
      similarity += (1 - diff) * weight;
    }
  }
  
  // Categorical preferences
  if (profile1.genderSeparationPreference === profile2.genderSeparationPreference) {
    similarity += weights.genderSeparationPreference;
  }
  
  return similarity;
};

// Helper method to find common preferences
userPreferenceProfileSchema.methods._findCommonPreferences = function(profile1, profile2) {
  const common = [];
  
  // Find common high-interest categories
  for (const [category, prefs] of Object.entries(profile1.categoryPreferences)) {
    if (prefs.interest > 0.6 && profile2.categoryPreferences[category]?.interest > 0.6) {
      common.push(`high_interest_${category}`);
    }
  }
  
  // Find common cultural preferences
  if (Math.abs(profile1.culturalProfile.traditionalPreference - 
               profile2.culturalProfile.traditionalPreference) < 0.2) {
    common.push('similar_traditional_preference');
  }
  
  if (Math.abs(profile1.culturalProfile.modernPreference - 
               profile2.culturalProfile.modernPreference) < 0.2) {
    common.push('similar_modern_preference');
  }
  
  return common;
};

// Static method to get recommendation candidates for user
userPreferenceProfileSchema.statics.getRecommendationCandidates = async function(userId) {
  const userProfile = await this.findOne({ user: userId });
  if (!userProfile) return [];
  
  // Get similar users
  await userProfile.findSimilarUsers();
  
  // Get activities that similar users liked but this user hasn't interacted with
  const similarUserIds = userProfile.similarUsers.map(u => u.userId);
  
  // Get recommendation candidates (simplified - would use more complex ML in production)
  const candidates = await this.aggregate([
    {
      $match: {
        user: { $in: similarUserIds }
      }
    },
    {
      $unwind: '$recommendationHistory'
    },
    {
      $match: {
        'recommendationHistory.userResponse': { $in: ['clicked', 'booked', 'shared'] }
      }
    },
    {
      $group: {
        _id: '$recommendationHistory.recommendedActivity',
        averageScore: { $avg: '$recommendationHistory.recommendationScore' },
        interactionCount: { $sum: 1 },
        culturalFit: { $avg: '$recommendationHistory.culturalFitScore' }
      }
    },
    {
      $match: {
        interactionCount: { $gte: 2 } // At least 2 similar users liked it
      }
    },
    {
      $sort: { averageScore: -1, interactionCount: -1 }
    },
    {
      $limit: 20
    }
  ]);
  
  return candidates;
};

// Method to export data for ML model training
userPreferenceProfileSchema.methods.exportForML = function() {
  return {
    userId: this.user,
    features: this.preferenceVector,
    categoryPreferences: this.categoryPreferences,
    culturalProfile: this.culturalProfile,
    behaviorMetrics: {
      searchFrequency: this.behaviorPatterns.searchFrequency.weekly,
      bookingRate: this.behaviorPatterns.bookingPatterns.advanceBookingDays,
      interactionRate: this.behaviorPatterns.interactionPatterns.clickThroughRate,
      profileCompleteness: this.learningMetadata.profileCompleteness
    },
    lastUpdated: this.updatedAt
  };
};

module.exports = mongoose.model('UserPreferenceProfile', userPreferenceProfileSchema);