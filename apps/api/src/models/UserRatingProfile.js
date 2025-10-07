const mongoose = require('mongoose');

const criteriaScoreSchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  count: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const tierInfoSchema = new mongoose.Schema({
  current: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  previous: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  nextTierProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  tierHistory: [{
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum']
    },
    achievedAt: Date,
    ratingAtTime: Number
  }]
}, { _id: false });

const monthlyActivitySchema = new mongoose.Schema({
  currentMonth: {
    type: String,
    required: true // Format: "2025-09"
  },
  participationCount: {
    type: Number,
    default: 0,
    min: 0
  },
  bonusApplied: {
    type: Boolean,
    default: false
  },
  bonusAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  consecutiveActiveMonths: {
    type: Number,
    default: 0,
    min: 0
  },
  lastActivityDate: Date
}, { _id: false });

const rewardsSchema = new mongoose.Schema({
  currentDiscountRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  freeCredits: {
    type: Number,
    default: 0,
    min: 0
  },
  unlockedBenefits: [{
    type: String,
    enum: [
      'basic_booking_access',
      'priority_booking',
      'exclusive_events',
      'priority_support',
      'free_credits',
      'personal_concierge',
      'early_access',
      'special_offers'
    ]
  }],
  nextRewardAt: Date,
  totalCreditsEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  lastCreditEarned: Date
}, { _id: false });

const statisticsSchema = new mongoose.Schema({
  totalEventsParticipated: {
    type: Number,
    default: 0,
    min: 0
  },
  averageRatingGiven: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingsGivenCount: {
    type: Number,
    default: 0,
    min: 0
  },
  favoriteCategories: [{
    type: String,
    enum: ['fitness', 'arts', 'food', 'outdoor', 'unique', 'wellness']
  }],
  streakCount: {
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastStreakDate: Date,
  totalHoursParticipated: {
    type: Number,
    default: 0,
    min: 0
  },
  averageSessionDuration: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

const userRatingProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Overall rating information
  overall: {
    currentScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    baseScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0,
      min: 0
    },
    lastCalculated: {
      type: Date,
      default: Date.now
    },
    trend: {
      type: String,
      enum: ['improving', 'stable', 'declining'],
      default: 'stable'
    },
    previousScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    scoreHistory: [{
      score: Number,
      date: Date,
      reason: String // 'new_rating', 'bonus_applied', 'decay_applied'
    }]
  },
  
  // Individual criteria scores
  criteria: {
    punctuality: criteriaScoreSchema,
    engagement: criteriaScoreSchema,
    respectfulness: criteriaScoreSchema,
    teamwork: criteriaScoreSchema
  },
  
  // Tier information
  tier: tierInfoSchema,
  
  // Monthly activity tracking
  monthlyActivity: monthlyActivitySchema,
  
  // Rewards and benefits
  rewards: rewardsSchema,
  
  // User statistics
  statistics: statisticsSchema,
  
  // Rating behavior analysis
  ratingBehavior: {
    averageTimeToRate: {
      type: Number,
      default: 0,
      min: 0 // in hours
    },
    ratingCompletionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100 // percentage
    },
    helpfulRatingsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    flaggedRatingsCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // System metadata
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivityDate: Date,
  profileCreatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
userRatingProfileSchema.index({ userId: 1 });
userRatingProfileSchema.index({ 'overall.currentScore': -1 });
userRatingProfileSchema.index({ 'tier.current': 1 });
userRatingProfileSchema.index({ 'monthlyActivity.currentMonth': 1 });
userRatingProfileSchema.index({ 'statistics.totalEventsParticipated': -1 });
userRatingProfileSchema.index({ 'statistics.streakCount': -1 });

// Virtual for full name (populated from User)
userRatingProfileSchema.virtual('userInfo', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
  select: 'firstName lastName email profileImage'
});

// Method to calculate overall score from criteria
userRatingProfileSchema.methods.calculateOverallScore = function(config) {
  const criteria = this.criteria;
  const weights = {};
  
  // Get weights from config
  config.ratingCriteria.forEach(criterion => {
    if (criterion.isActive) {
      weights[criterion.id] = criterion.weight;
    }
  });
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  Object.keys(criteria).forEach(criterionId => {
    if (weights[criterionId] && criteria[criterionId].count > 0) {
      weightedSum += criteria[criterionId].score * weights[criterionId];
      totalWeight += weights[criterionId];
    }
  });
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
};

// Method to update tier based on current score
userRatingProfileSchema.methods.updateTier = function(config) {
  const currentScore = this.overall.currentScore;
  const newTier = config.getTierForRating(currentScore);
  const currentTier = this.tier.current;
  
  if (newTier !== currentTier) {
    // Add to tier history
    this.tier.tierHistory.push({
      tier: newTier,
      achievedAt: new Date(),
      ratingAtTime: currentScore
    });
    
    // Update tier info
    this.tier.previous = currentTier;
    this.tier.current = newTier;
    this.tier.changedAt = new Date();
    
    // Update rewards
    this.rewards.currentDiscountRate = config.getDiscountRate(newTier);
    this.rewards.unlockedBenefits = config.getTierBenefits(newTier);
    
    return true; // Tier changed
  }
  
  return false; // No tier change
};

// Method to calculate next tier progress
userRatingProfileSchema.methods.calculateNextTierProgress = function(config) {
  const currentScore = this.overall.currentScore;
  const currentTier = this.tier.current;
  const tiers = config.tierThresholds;
  
  let nextTierThreshold = 5.0; // Default to max
  
  switch (currentTier) {
    case 'bronze':
      nextTierThreshold = tiers.silver.minRating;
      break;
    case 'silver':
      nextTierThreshold = tiers.gold.minRating;
      break;
    case 'gold':
      nextTierThreshold = tiers.platinum.minRating;
      break;
    case 'platinum':
      return 1.0; // Already at max tier
  }
  
  const currentTierMin = tiers[currentTier].minRating;
  const progress = (currentScore - currentTierMin) / (nextTierThreshold - currentTierMin);
  
  return Math.max(0, Math.min(1, progress));
};

// Method to apply monthly activity bonus
userRatingProfileSchema.methods.applyMonthlyBonus = function(config) {
  const activityBonus = config.activityBonus;
  const monthlyActivity = this.monthlyActivity;
  
  if (monthlyActivity.participationCount >= activityBonus.activitiesPerMonth && 
      !monthlyActivity.bonusApplied) {
    
    const bonusAmount = Math.min(activityBonus.bonusStars, activityBonus.maxBonusPerMonth);
    
    // Apply bonus to base score
    this.overall.baseScore = Math.min(5.0, this.overall.baseScore + bonusAmount);
    this.overall.currentScore = this.overall.baseScore;
    
    // Mark bonus as applied
    monthlyActivity.bonusApplied = true;
    monthlyActivity.bonusAmount = bonusAmount;
    
    // Add to score history
    this.overall.scoreHistory.push({
      score: this.overall.currentScore,
      date: new Date(),
      reason: 'bonus_applied'
    });
    
    return bonusAmount;
  }
  
  return 0;
};

// Method to reset monthly activity
userRatingProfileSchema.methods.resetMonthlyActivity = function(newMonth) {
  this.monthlyActivity.currentMonth = newMonth;
  this.monthlyActivity.participationCount = 0;
  this.monthlyActivity.bonusApplied = false;
  this.monthlyActivity.bonusAmount = 0;
  
  // Check if user was active last month
  if (this.monthlyActivity.participationCount > 0) {
    this.monthlyActivity.consecutiveActiveMonths += 1;
  } else {
    this.monthlyActivity.consecutiveActiveMonths = 0;
  }
};

// Static method to get top rated users
userRatingProfileSchema.statics.getTopRatedUsers = async function(limit = 10, tier = null) {
  const query = { isActive: true };
  if (tier) {
    query['tier.current'] = tier;
  }
  
  return await this.find(query)
    .sort({ 'overall.currentScore': -1 })
    .limit(limit)
    .populate('userInfo', 'firstName lastName profileImage');
};

// Static method to get users by tier
userRatingProfileSchema.statics.getUsersByTier = async function(tier) {
  return await this.find({
    'tier.current': tier,
    isActive: true
  }).populate('userInfo', 'firstName lastName email');
};

// Transform output to remove sensitive data
userRatingProfileSchema.methods.toJSON = function() {
  const profile = this.toObject();
  
  // Remove internal tracking data that shouldn't be exposed
  delete profile.ratingBehavior;
  delete profile.overall.scoreHistory;
  
  return profile;
};

module.exports = mongoose.model('UserRatingProfile', userRatingProfileSchema);
