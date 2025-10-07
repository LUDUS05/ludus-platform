const mongoose = require('mongoose');

const criteriaRatingSchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500,
    trim: true
  }
}, { _id: false });

const impactTrackingSchema = new mongoose.Schema({
  tierChangeBefore: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum']
  },
  tierChangeAfter: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum']
  },
  scoreChangeBefore: {
    type: Number,
    min: 0,
    max: 5
  },
  scoreChangeAfter: {
    type: Number,
    min: 0,
    max: 5
  },
  tierChanged: {
    type: Boolean,
    default: false
  },
  scoreImpact: {
    type: Number,
    default: 0
  }
}, { _id: false });

const ratingRecordSchema = new mongoose.Schema({
  // Event and activity information
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  activityTitle: {
    type: String,
    required: true
  },
  activityCategory: {
    type: String,
    enum: ['fitness', 'arts', 'food', 'outdoor', 'unique', 'wellness']
  },
  activityDate: {
    type: Date,
    required: true
  },
  
  // Rater information
  raterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  raterName: {
    type: String,
    required: true
  },
  raterTier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  raterRatingHistory: {
    averageRatingGiven: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatingsGiven: {
      type: Number,
      default: 0,
      min: 0
    },
    reliabilityScore: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 1
    }
  },
  
  // Target information
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetName: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    enum: ['peer', 'vendor'],
    required: true
  },
  targetTier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  
  // Detailed ratings
  criteria: {
    punctuality: criteriaRatingSchema,
    engagement: criteriaRatingSchema,
    respectfulness: criteriaRatingSchema,
    teamwork: criteriaRatingSchema
  },
  
  // Calculated scores
  overallScore: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  weightedScore: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  criteriaWeights: {
    punctuality: { type: Number, default: 0.2 },
    engagement: { type: Number, default: 0.3 },
    respectfulness: { type: Number, default: 0.3 },
    teamwork: { type: Number, default: 0.2 }
  },
  
  // Additional context
  generalComment: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  wouldParticipateAgain: {
    type: Boolean,
    default: true
  },
  reportFlags: [{
    type: String,
    enum: [
      'inappropriate_behavior',
      'safety_concern',
      'harassment',
      'discrimination',
      'spam',
      'fake_rating',
      'other'
    ]
  }],
  reportDetails: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // Metadata
  submittedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  deviceInfo: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop'],
    default: 'desktop'
  },
  responseTime: {
    type: Number,
    default: 0,
    min: 0 // seconds taken to complete rating
  },
  
  // Verification and quality control
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationMethod: {
    type: String,
    enum: [
      'participation_confirmed',
      'booking_verified',
      'admin_verified',
      'peer_verified',
      'auto_verified'
    ],
    default: 'participation_confirmed'
  },
  verificationScore: {
    type: Number,
    default: 1.0,
    min: 0,
    max: 1
  },
  
  // Impact tracking
  impactOnTarget: impactTrackingSchema,
  
  // Rating quality metrics
  qualityMetrics: {
    completenessScore: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 1
    },
    consistencyScore: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 1
    },
    helpfulnessScore: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 1
    },
    isOutlier: {
      type: Boolean,
      default: false
    },
    outlierReason: {
      type: String,
      enum: ['statistical', 'behavioral', 'temporal', 'none']
    }
  },
  
  // System status
  status: {
    type: String,
    enum: ['submitted', 'verified', 'flagged', 'rejected', 'under_review'],
    default: 'submitted'
  },
  flaggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  flaggedAt: Date,
  flagReason: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNotes: String,
  
  // Assignment tracking
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RatingAssignment'
  },
  assignmentReason: {
    type: String,
    enum: [
      'random_selection',
      'coverage_balance',
      'mandatory',
      'preference_match',
      'activity_type_match',
      'demographic_balance'
    ]
  },
  
  // Analytics and tracking
  analytics: {
    viewCount: {
      type: Number,
      default: 0,
      min: 0
    },
    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0
    },
    notHelpfulVotes: {
      type: Number,
      default: 0,
      min: 0
    },
    shareCount: {
      type: Number,
      default: 0,
      min: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
ratingRecordSchema.index({ eventId: 1 });
ratingRecordSchema.index({ raterId: 1 });
ratingRecordSchema.index({ targetUserId: 1 });
ratingRecordSchema.index({ submittedAt: -1 });
ratingRecordSchema.index({ overallScore: -1 });
ratingRecordSchema.index({ status: 1 });
ratingRecordSchema.index({ 'targetType': 1 });
ratingRecordSchema.index({ 'qualityMetrics.isOutlier': 1 });
ratingRecordSchema.index({ assignmentId: 1 });

// Compound indexes for complex queries
ratingRecordSchema.index({ raterId: 1, targetUserId: 1 });
ratingRecordSchema.index({ eventId: 1, targetType: 1 });
ratingRecordSchema.index({ submittedAt: -1, status: 1 });

// Virtual for helpfulness ratio
ratingRecordSchema.virtual('helpfulnessRatio').get(function() {
  const total = this.analytics.helpfulVotes + this.analytics.notHelpfulVotes;
  return total > 0 ? this.analytics.helpfulVotes / total : 0;
});

// Virtual for rating age in days
ratingRecordSchema.virtual('ageInDays').get(function() {
  return Math.floor((new Date() - this.submittedAt) / (1000 * 60 * 60 * 24));
});

// Method to calculate weighted score
ratingRecordSchema.methods.calculateWeightedScore = function() {
  const criteria = this.criteria;
  const weights = this.criteriaWeights;
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  Object.keys(criteria).forEach(criterion => {
    if (criteria[criterion] && weights[criterion]) {
      weightedSum += criteria[criterion].score * weights[criterion];
      totalWeight += weights[criterion];
    }
  });
  
  return totalWeight > 0 ? weightedSum / totalWeight : this.overallScore;
};

// Method to check if rating is complete
ratingRecordSchema.methods.isComplete = function() {
  const criteria = this.criteria;
  const requiredCriteria = ['punctuality', 'engagement', 'respectfulness', 'teamwork'];
  
  return requiredCriteria.every(criterion => 
    criteria[criterion] && criteria[criterion].score >= 1 && criteria[criterion].score <= 5
  );
};

// Method to calculate quality metrics
ratingRecordSchema.methods.calculateQualityMetrics = function() {
  const criteria = this.criteria;
  const requiredCriteria = ['punctuality', 'engagement', 'respectfulness', 'teamwork'];
  
  // Completeness score
  const completedCriteria = requiredCriteria.filter(criterion => 
    criteria[criterion] && criteria[criterion].score >= 1 && criteria[criterion].score <= 5
  );
  const completenessScore = completedCriteria.length / requiredCriteria.length;
  
  // Consistency score (how consistent are the ratings)
  const scores = completedCriteria.map(criterion => criteria[criterion].score);
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
  const consistencyScore = Math.max(0, 1 - (variance / 4)); // Normalize by max variance
  
  // Helpfulness score (based on comment quality and detail)
  let helpfulnessScore = 0.5; // Base score
  if (this.generalComment && this.generalComment.length > 50) helpfulnessScore += 0.2;
  if (this.generalComment && this.generalComment.length > 100) helpfulnessScore += 0.2;
  if (this.wouldParticipateAgain !== undefined) helpfulnessScore += 0.1;
  
  this.qualityMetrics = {
    completenessScore,
    consistencyScore,
    helpfulnessScore,
    isOutlier: this.detectOutlier(),
    outlierReason: this.getOutlierReason()
  };
  
  return this.qualityMetrics;
};

// Method to detect if rating is an outlier
ratingRecordSchema.methods.detectOutlier = function() {
  // This would typically be calculated against historical data
  // For now, we'll use simple heuristics
  const criteria = this.criteria;
  const scores = Object.values(criteria).map(c => c.score);
  
  // Check for extreme scores
  if (scores.some(score => score === 1 || score === 5)) {
    return true;
  }
  
  // Check for inconsistent scoring patterns
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const hasExtremeVariation = scores.some(score => Math.abs(score - average) > 2);
  
  return hasExtremeVariation;
};

// Method to get outlier reason
ratingRecordSchema.methods.getOutlierReason = function() {
  if (!this.qualityMetrics.isOutlier) return 'none';
  
  const criteria = this.criteria;
  const scores = Object.values(criteria).map(c => c.score);
  
  if (scores.some(score => score === 1 || score === 5)) {
    return 'statistical';
  }
  
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  if (scores.some(score => Math.abs(score - average) > 2)) {
    return 'behavioral';
  }
  
  return 'temporal';
};

// Method to flag rating
ratingRecordSchema.methods.flagRating = function(flaggedBy, reason, details = '') {
  this.status = 'flagged';
  this.flaggedBy = flaggedBy;
  this.flaggedAt = new Date();
  this.flagReason = reason;
  if (details) {
    this.reviewNotes = details;
  }
};

// Method to review and approve/reject rating
ratingRecordSchema.methods.reviewRating = function(reviewedBy, approved, notes = '') {
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  this.reviewNotes = notes;
  this.status = approved ? 'verified' : 'rejected';
};

// Static method to get ratings for a user
ratingRecordSchema.statics.getRatingsForUser = async function(userId, options = {}) {
  const query = { targetUserId: userId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.targetType) {
    query.targetType = options.targetType;
  }
  
  if (options.dateRange) {
    query.submittedAt = {
      $gte: options.dateRange.start,
      $lte: options.dateRange.end
    };
  }
  
  return await this.find(query)
    .populate('raterId', 'firstName lastName profileImage')
    .populate('eventId', 'title category')
    .sort({ submittedAt: -1 })
    .limit(options.limit || 50);
};

// Static method to get ratings by a user
ratingRecordSchema.statics.getRatingsByUser = async function(userId, options = {}) {
  const query = { raterId: userId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.targetType) {
    query.targetType = options.targetType;
  }
  
  return await this.find(query)
    .populate('targetUserId', 'firstName lastName profileImage')
    .populate('eventId', 'title category')
    .sort({ submittedAt: -1 })
    .limit(options.limit || 50);
};

// Static method to get rating statistics
ratingRecordSchema.statics.getRatingStats = async function(options = {}) {
  const matchStage = {};
  
  if (options.dateRange) {
    matchStage.submittedAt = {
      $gte: options.dateRange.start,
      $lte: options.dateRange.end
    };
  }
  
  if (options.status) {
    matchStage.status = options.status;
  }
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRatings: { $sum: 1 },
        averageRating: { $avg: '$overallScore' },
        averageWeightedRating: { $avg: '$weightedScore' },
        ratingDistribution: {
          $push: '$overallScore'
        },
        flaggedRatings: {
          $sum: {
            $cond: [{ $eq: ['$status', 'flagged'] }, 1, 0]
          }
        },
        verifiedRatings: {
          $sum: {
            $cond: [{ $eq: ['$status', 'verified'] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        totalRatings: 1,
        averageRating: { $round: ['$averageRating', 2] },
        averageWeightedRating: { $round: ['$averageWeightedRating', 2] },
        flaggedRatings: 1,
        verifiedRatings: 1,
        flagRate: {
          $round: [
            { $multiply: [{ $divide: ['$flaggedRatings', '$totalRatings'] }, 100] },
            2
          ]
        }
      }
    }
  ]);
};

// Transform output to remove sensitive data
ratingRecordSchema.methods.toJSON = function() {
  const record = this.toObject();
  
  // Remove sensitive information
  delete record.ipAddress;
  delete record.userAgent;
  delete record.flaggedBy;
  delete record.reviewedBy;
  delete record.reviewNotes;
  
  return record;
};

module.exports = mongoose.model('RatingRecord', ratingRecordSchema);
