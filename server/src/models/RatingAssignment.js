const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  joined: {
    type: Date,
    required: true
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  }
}, { _id: false });

const ratingTargetSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['peer', 'vendor'],
    required: true
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
    ],
    required: true
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  }
}, { _id: false });

const completedRatingSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedAt: {
    type: Date,
    required: true
  },
  ratingGiven: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  overallScore: Number,
  criteriaScores: mongoose.Schema.Types.Mixed
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
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
  toRate: [ratingTargetSchema],
  completed: [completedRatingSchema],
  pending: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  notificationsSent: {
    type: Number,
    default: 0,
    min: 0
  },
  lastReminderAt: Date,
  expiresAt: {
    type: Date,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, { _id: false });

const distributionMetricsSchema = new mongoose.Schema({
  totalAssignments: {
    type: Number,
    default: 0,
    min: 0
  },
  completedRatings: {
    type: Number,
    default: 0,
    min: 0
  },
  coveragePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  balanceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  averageRatingsPerUser: {
    type: Number,
    default: 0,
    min: 0
  },
  minRatingsPerUser: {
    type: Number,
    default: 0,
    min: 0
  },
  maxRatingsPerUser: {
    type: Number,
    default: 0,
    min: 0
  },
  distributionVariance: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

const ratingAssignmentSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  activityTitle: {
    type: String,
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  vendorName: {
    type: String,
    required: true
  },
  activityDate: {
    type: Date,
    required: true
  },
  activityCategory: {
    type: String,
    enum: ['fitness', 'arts', 'food', 'outdoor', 'unique', 'wellness']
  },
  
  // Event participants
  participants: [participantSchema],
  
  // Rating assignments
  assignments: [assignmentSchema],
  
  // Distribution metrics
  distributionMetrics: distributionMetricsSchema,
  
  // Assignment status
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'expired', 'cancelled'],
    default: 'pending'
  },
  
  // Assignment algorithm metadata
  algorithmVersion: {
    type: String,
    default: '1.0.0'
  },
  assignmentStrategy: {
    type: String,
    enum: ['balanced', 'random', 'preference_based', 'tier_balanced'],
    default: 'balanced'
  },
  
  // Timing information
  createdAt: {
    type: Date,
    default: Date.now
  },
  activatedAt: Date,
  completedAt: Date,
  expiresAt: {
    type: Date,
    required: true
  },
  
  // Quality control
  qualityChecks: {
    isBalanced: {
      type: Boolean,
      default: false
    },
    meetsMinimumCoverage: {
      type: Boolean,
      default: false
    },
    hasConflicts: {
      type: Boolean,
      default: false
    },
    conflicts: [{
      type: String,
      description: String
    }]
  },
  
  // System metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
ratingAssignmentSchema.index({ eventId: 1 });
ratingAssignmentSchema.index({ status: 1 });
ratingAssignmentSchema.index({ 'assignments.raterId': 1 });
ratingAssignmentSchema.index({ expiresAt: 1 });
ratingAssignmentSchema.index({ activityDate: -1 });
ratingAssignmentSchema.index({ createdAt: -1 });

// Virtual for total participants
ratingAssignmentSchema.virtual('totalParticipants').get(function() {
  return this.participants.length;
});

// Virtual for total assignments
ratingAssignmentSchema.virtual('totalAssignments').get(function() {
  return this.assignments.length;
});

// Virtual for completion rate
ratingAssignmentSchema.virtual('overallCompletionRate').get(function() {
  if (this.assignments.length === 0) return 0;
  
  const totalPossible = this.assignments.reduce((sum, assignment) => {
    return sum + assignment.toRate.length;
  }, 0);
  
  const totalCompleted = this.assignments.reduce((sum, assignment) => {
    return sum + assignment.completed.length;
  }, 0);
  
  return totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;
});

// Method to check if assignment is expired
ratingAssignmentSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to check if assignment is complete
ratingAssignmentSchema.methods.isComplete = function() {
  return this.assignments.every(assignment => assignment.isCompleted);
};

// Method to get assignment for a specific user
ratingAssignmentSchema.methods.getAssignmentForUser = function(userId) {
  return this.assignments.find(assignment => 
    assignment.raterId.toString() === userId.toString()
  );
};

// Method to update assignment completion
ratingAssignmentSchema.methods.updateAssignmentCompletion = function(raterId, targetId, ratingData) {
  const assignment = this.getAssignmentForUser(raterId);
  if (!assignment) return false;
  
  // Add to completed ratings
  assignment.completed.push({
    id: targetId,
    completedAt: new Date(),
    ratingGiven: ratingData.overallScore,
    overallScore: ratingData.overallScore,
    criteriaScores: ratingData.criteria
  });
  
  // Remove from pending
  assignment.pending = assignment.pending.filter(id => 
    id.toString() !== targetId.toString()
  );
  
  // Update completion status
  assignment.completionRate = (assignment.completed.length / assignment.toRate.length) * 100;
  assignment.isCompleted = assignment.pending.length === 0;
  
  // Update overall status
  if (this.assignments.every(a => a.isCompleted)) {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  return true;
};

// Method to calculate distribution metrics
ratingAssignmentSchema.methods.calculateDistributionMetrics = function() {
  const totalAssignments = this.assignments.length;
  const totalCompleted = this.assignments.reduce((sum, assignment) => {
    return sum + assignment.completed.length;
  }, 0);
  
  // Calculate coverage percentage
  const totalPossible = this.assignments.reduce((sum, assignment) => {
    return sum + assignment.toRate.length;
  }, 0);
  const coveragePercentage = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;
  
  // Calculate balance score (how evenly distributed ratings are)
  const ratingsPerUser = {};
  this.participants.forEach(participant => {
    ratingsPerUser[participant.id.toString()] = 0;
  });
  
  this.assignments.forEach(assignment => {
    assignment.completed.forEach(completed => {
      const userId = completed.id.toString();
      if (ratingsPerUser[userId] !== undefined) {
        ratingsPerUser[userId]++;
      }
    });
  });
  
  const ratingCounts = Object.values(ratingsPerUser);
  const averageRatings = ratingCounts.reduce((sum, count) => sum + count, 0) / ratingCounts.length;
  const variance = ratingCounts.reduce((sum, count) => sum + Math.pow(count - averageRatings, 2), 0) / ratingCounts.length;
  const balanceScore = Math.max(0, 1 - (variance / (averageRatings + 1)));
  
  this.distributionMetrics = {
    totalAssignments,
    completedRatings: totalCompleted,
    coveragePercentage,
    balanceScore,
    averageRatingsPerUser: averageRatings,
    minRatingsPerUser: Math.min(...ratingCounts),
    maxRatingsPerUser: Math.max(...ratingCounts),
    distributionVariance: variance
  };
  
  return this.distributionMetrics;
};

// Method to validate assignment integrity
ratingAssignmentSchema.methods.validateAssignmentIntegrity = function() {
  const issues = [];
  
  // Check for self-rating conflicts
  this.assignments.forEach(assignment => {
    assignment.toRate.forEach(target => {
      if (assignment.raterId.toString() === target.id.toString()) {
        issues.push({
          type: 'self_rating',
          description: `User ${assignment.raterName} assigned to rate themselves`
        });
      }
    });
  });
  
  // Check for mutual rating conflicts
  const ratingPairs = new Set();
  this.assignments.forEach(assignment => {
    assignment.toRate.forEach(target => {
      const pair = [assignment.raterId.toString(), target.id.toString()].sort().join('-');
      if (ratingPairs.has(pair)) {
        issues.push({
          type: 'mutual_rating',
          description: `Mutual rating detected between users`
        });
      }
      ratingPairs.add(pair);
    });
  });
  
  // Check minimum coverage
  const participantIds = new Set(this.participants.map(p => p.id.toString()));
  const ratedUserIds = new Set();
  
  this.assignments.forEach(assignment => {
    assignment.toRate.forEach(target => {
      if (target.type === 'peer') {
        ratedUserIds.add(target.id.toString());
      }
    });
  });
  
  const coveragePercentage = (ratedUserIds.size / participantIds.size) * 100;
  if (coveragePercentage < 80) {
    issues.push({
      type: 'low_coverage',
      description: `Only ${coveragePercentage.toFixed(1)}% of participants will be rated`
    });
  }
  
  this.qualityChecks = {
    isBalanced: issues.length === 0,
    meetsMinimumCoverage: coveragePercentage >= 80,
    hasConflicts: issues.some(issue => issue.type === 'self_rating' || issue.type === 'mutual_rating'),
    conflicts: issues
  };
  
  return issues;
};

// Static method to find assignments for a user
ratingAssignmentSchema.statics.findAssignmentsForUser = async function(userId, status = null) {
  const query = {
    'assignments.raterId': userId
  };
  
  if (status) {
    query.status = status;
  }
  
  return await this.find(query)
    .populate('eventId', 'title description')
    .populate('vendorId', 'name')
    .sort({ createdAt: -1 });
};

// Static method to find expired assignments
ratingAssignmentSchema.statics.findExpiredAssignments = async function() {
  return await this.find({
    status: { $in: ['active', 'pending'] },
    expiresAt: { $lt: new Date() }
  });
};

// Static method to get assignment statistics
ratingAssignmentSchema.statics.getAssignmentStats = async function(dateRange = null) {
  const matchStage = {};
  if (dateRange) {
    matchStage.createdAt = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAssignments: { $sum: 1 },
        completedAssignments: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        },
        averageCompletionRate: { $avg: '$overallCompletionRate' },
        averageCoveragePercentage: { $avg: '$distributionMetrics.coveragePercentage' },
        averageBalanceScore: { $avg: '$distributionMetrics.balanceScore' }
      }
    }
  ]);
};

module.exports = mongoose.model('RatingAssignment', ratingAssignmentSchema);
