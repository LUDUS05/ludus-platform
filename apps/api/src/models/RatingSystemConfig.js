const mongoose = require('mongoose');

const ratingCriteriaSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  label: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: false });

const tierThresholdSchema = new mongoose.Schema({
  minRating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  maxRating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  discountRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  name: {
    type: String,
    required: true
  },
  benefits: [{
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
  color: {
    type: String,
    default: '#6B7280'
  },
  icon: {
    type: String,
    default: '⭐'
  }
}, { _id: false });

const creditRewardsSchema = new mongoose.Schema({
  consecutiveMonthsRequired: {
    type: Number,
    default: 3,
    min: 1
  },
  minRatingRequired: {
    type: Number,
    default: 4.0,
    min: 0,
    max: 5
  },
  creditAmount: {
    type: Number,
    default: 100,
    min: 0
  },
  resetOnLowRating: {
    type: Boolean,
    default: true
  },
  maxCreditsPerMonth: {
    type: Number,
    default: 200,
    min: 0
  }
}, { _id: false });

const activityBonusSchema = new mongoose.Schema({
  activitiesPerMonth: {
    type: Number,
    default: 2,
    min: 1
  },
  bonusStars: {
    type: Number,
    default: 1.0,
    min: 0,
    max: 2.0
  },
  maxBonusPerMonth: {
    type: Number,
    default: 1.0,
    min: 0
  },
  resetMonthly: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const systemSettingsSchema = new mongoose.Schema({
  minParticipantsForRating: {
    type: Number,
    default: 3,
    min: 2
  },
  ratingWindowDays: {
    type: Number,
    default: 7,
    min: 1,
    max: 30
  },
  maxRatingsPerUser: {
    type: Number,
    default: 2,
    min: 1,
    max: 5
  },
  ratingDecayMonths: {
    type: Number,
    default: 12,
    min: 1
  },
  allowSelfRating: {
    type: Boolean,
    default: false
  },
  requireComments: {
    type: Boolean,
    default: false
  },
  enableAnonymousRating: {
    type: Boolean,
    default: false
  },
  autoAssignRatings: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const ratingSystemConfigSchema = new mongoose.Schema({
  // Rating criteria configuration
  ratingCriteria: [ratingCriteriaSchema],
  
  // Tier thresholds and benefits
  tierThresholds: {
    bronze: tierThresholdSchema,
    silver: tierThresholdSchema,
    gold: tierThresholdSchema,
    platinum: tierThresholdSchema
  },
  
  // Credit rewards system
  creditRewards: creditRewardsSchema,
  
  // Activity bonus system
  activityBonus: activityBonusSchema,
  
  // System-wide settings
  systemSettings: systemSettingsSchema,
  
  // Configuration metadata
  version: {
    type: String,
    default: '1.0.0'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now
  },
  
  // Configuration history for rollback
  history: [{
    version: String,
    changes: mongoose.Schema.Types.Mixed,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }]
}, {
  timestamps: true
});

// Ensure only one configuration document exists
ratingSystemConfigSchema.statics.getConfig = async function() {
  let config = await this.findOne({ isActive: true });
  if (!config) {
    // Create default configuration
    config = await this.create({
      ratingCriteria: [
        {
          id: 'punctuality',
          label: 'Punctuality',
          description: 'Arrives on time and respects schedule',
          weight: 0.2,
          isActive: true,
          order: 1
        },
        {
          id: 'engagement',
          label: 'Engagement',
          description: 'Active participation and enthusiasm',
          weight: 0.3,
          isActive: true,
          order: 2
        },
        {
          id: 'respectfulness',
          label: 'Respectfulness',
          description: 'Treats others with courtesy and respect',
          weight: 0.3,
          isActive: true,
          order: 3
        },
        {
          id: 'teamwork',
          label: 'Team Collaboration',
          description: 'Works well with others and contributes positively',
          weight: 0.2,
          isActive: true,
          order: 4
        }
      ],
      tierThresholds: {
        bronze: {
          minRating: 0,
          maxRating: 2.5,
          discountRate: 0,
          name: 'Bronze Explorer',
          benefits: ['basic_booking_access'],
          color: '#CD7F32',
          icon: '🥉'
        },
        silver: {
          minRating: 2.5,
          maxRating: 3.5,
          discountRate: 10,
          name: 'Silver Adventurer',
          benefits: ['basic_booking_access', 'priority_booking'],
          color: '#C0C0C0',
          icon: '🥈'
        },
        gold: {
          minRating: 3.5,
          maxRating: 4.2,
          discountRate: 20,
          name: 'Gold Champion',
          benefits: ['basic_booking_access', 'priority_booking', 'exclusive_events', 'priority_support'],
          color: '#FFD700',
          icon: '🥇'
        },
        platinum: {
          minRating: 4.2,
          maxRating: 5.0,
          discountRate: 30,
          name: 'Platinum Legend',
          benefits: ['basic_booking_access', 'priority_booking', 'exclusive_events', 'priority_support', 'free_credits', 'personal_concierge'],
          color: '#E5E4E2',
          icon: '💎'
        }
      },
      creditRewards: {
        consecutiveMonthsRequired: 3,
        minRatingRequired: 4.0,
        creditAmount: 100,
        resetOnLowRating: true,
        maxCreditsPerMonth: 200
      },
      activityBonus: {
        activitiesPerMonth: 2,
        bonusStars: 1.0,
        maxBonusPerMonth: 1.0,
        resetMonthly: true
      },
      systemSettings: {
        minParticipantsForRating: 3,
        ratingWindowDays: 7,
        maxRatingsPerUser: 2,
        ratingDecayMonths: 12,
        allowSelfRating: false,
        requireComments: false,
        enableAnonymousRating: false,
        autoAssignRatings: true
      },
      lastModifiedBy: new mongoose.Types.ObjectId() // Will be updated when first admin modifies
    });
  }
  return config;
};

// Method to update configuration with history tracking
ratingSystemConfigSchema.methods.updateConfig = async function(updates, userId, reason = 'Configuration updated') {
  // Store current state in history
  this.history.push({
    version: this.version,
    changes: updates,
    modifiedBy: userId,
    modifiedAt: new Date(),
    reason
  });
  
  // Update configuration
  Object.assign(this, updates, {
    lastModifiedBy: userId,
    lastModifiedAt: new Date()
  });
  
  return await this.save();
};

// Method to get tier for a given rating
ratingSystemConfigSchema.methods.getTierForRating = function(rating) {
  const tiers = this.tierThresholds;
  
  if (rating >= tiers.platinum.minRating && rating <= tiers.platinum.maxRating) {
    return 'platinum';
  } else if (rating >= tiers.gold.minRating && rating <= tiers.gold.maxRating) {
    return 'gold';
  } else if (rating >= tiers.silver.minRating && rating <= tiers.silver.maxRating) {
    return 'silver';
  } else {
    return 'bronze';
  }
};

// Method to get tier benefits
ratingSystemConfigSchema.methods.getTierBenefits = function(tier) {
  return this.tierThresholds[tier]?.benefits || [];
};

// Method to get discount rate for tier
ratingSystemConfigSchema.methods.getDiscountRate = function(tier) {
  return this.tierThresholds[tier]?.discountRate || 0;
};

// Indexes for efficient queries
ratingSystemConfigSchema.index({ isActive: 1 });
ratingSystemConfigSchema.index({ lastModifiedAt: -1 });

module.exports = mongoose.model('RatingSystemConfig', ratingSystemConfigSchema);
