const mongoose = require('mongoose');

const referralConversionSchema = new mongoose.Schema({
  // Referral identification
  referralId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral',
    required: true,
    index: true
  },
  
  // User information
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Conversion funnel stages
  funnelStage: {
    type: String,
    enum: [
      'invitation_sent',
      'invitation_viewed',
      'invitation_clicked',
      'registration_started',
      'registration_completed',
      'profile_created',
      'first_activity_viewed',
      'first_booking_started',
      'first_booking_completed',
      'second_activity_viewed',
      'second_booking_completed',
      'referral_shared'
    ],
    required: true,
    index: true
  },
  
  // Conversion metadata
  conversionData: {
    stage: String,
    timestamp: Date,
    duration: Number, // Time spent in this stage (seconds)
    source: String, // 'direct', 'social', 'email', 'qr-code'
    platform: String, // 'web', 'mobile', 'app'
    userAgent: String,
    ipAddress: String,
    location: {
      country: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    device: {
      type: String, // 'desktop', 'mobile', 'tablet'
      os: String,
      browser: String,
      screenSize: String
    }
  },
  
  // Performance metrics
  performance: {
    timeToConversion: Number, // Time from previous stage to this stage (seconds)
    stageDuration: Number, // Time spent in this specific stage
    totalFunnelTime: Number, // Total time from first stage to this stage
    dropoffRate: Number, // Percentage of users who dropped off at this stage
    conversionRate: Number, // Percentage of users who progressed from previous stage
    engagementScore: Number // Calculated engagement metric (0-100)
  },
  
  // Business metrics
  businessMetrics: {
    revenueImpact: Number, // Potential revenue impact of this conversion
    customerLifetimeValue: Number, // Estimated CLV of the referred user
    referralValue: Number, // Value of this specific referral
    retentionProbability: Number // Probability of user retention
  },
  
  // A/B testing and optimization
  optimization: {
    variant: String, // A/B test variant
    campaign: String, // Marketing campaign identifier
    segment: String, // User segment
    experiment: String // Experiment identifier
  },
  
  // Status and lifecycle
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned', 'expired'],
    default: 'active',
    index: true
  },
  
  // Expiration and scheduling
  expiresAt: Date,
  completedAt: Date,
  
  // Tags and categorization
  tags: [String],
  category: String,
  
  // Notes and comments
  notes: String,
  
  // Audit trail
  audit: {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    version: { type: Number, default: 1 }
  }
}, {
  timestamps: true
});

// Indexes for performance
referralConversionSchema.index({ referrerId: 1, funnelStage: 1, createdAt: -1 });
referralConversionSchema.index({ funnelStage: 1, status: 1 });
referralConversionSchema.index({ 'conversionData.source': 1, 'conversionData.platform': 1 });
referralConversionSchema.index({ 'conversionData.location.country': 1, createdAt: -1 });
referralConversionSchema.index({ 'performance.conversionRate': -1 });
referralConversionSchema.index({ 'businessMetrics.revenueImpact': -1 });

// Virtual for conversion funnel position
referralConversionSchema.virtual('funnelPosition').get(function() {
  const funnelOrder = [
    'invitation_sent',
    'invitation_viewed',
    'invitation_clicked',
    'registration_started',
    'registration_completed',
    'profile_created',
    'first_activity_viewed',
    'first_booking_started',
    'first_booking_completed',
    'second_activity_viewed',
    'second_booking_completed',
    'referral_shared'
  ];
  
  return funnelOrder.indexOf(this.funnelStage) + 1;
});

// Instance methods
referralConversionSchema.methods.calculatePerformanceMetrics = async function() {
  // Calculate time to conversion from previous stage
  const previousStage = await this.constructor.findOne({
    referralId: this.referralId,
    funnelStage: { $lt: this.funnelPosition }
  }).sort({ funnelPosition: -1 });
  
  if (previousStage) {
    this.performance.timeToConversion = 
      (this.conversionData.timestamp - previousStage.conversionData.timestamp) / 1000;
  }
  
  // Calculate total funnel time
  const firstStage = await this.constructor.findOne({
    referralId: this.referralId
  }).sort({ funnelPosition: 1 });
  
  if (firstStage) {
    this.performance.totalFunnelTime = 
      (this.conversionData.timestamp - firstStage.conversionData.timestamp) / 1000;
  }
  
  // Calculate engagement score based on various factors
  this.performance.engagementScore = this.calculateEngagementScore();
  
  await this.save();
  return this;
};

referralConversionSchema.methods.calculateEngagementScore = function() {
  let score = 0;
  
  // Base score for reaching this stage
  score += this.funnelPosition * 5;
  
  // Bonus for quick progression
  if (this.performance.timeToConversion && this.performance.timeToConversion < 300) {
    score += 10; // Bonus for quick progression
  }
  
  // Bonus for mobile engagement
  if (this.conversionData.platform === 'mobile') {
    score += 5;
  }
  
  // Bonus for social source
  if (this.conversionData.source === 'social') {
    score += 3;
  }
  
  // Cap score at 100
  return Math.min(score, 100);
};

referralConversionSchema.methods.updateBusinessMetrics = async function() {
  // Calculate potential revenue impact
  const baseRevenue = 100; // Base activity price
  this.businessMetrics.revenueImpact = baseRevenue * (this.funnelPosition / 12);
  
  // Estimate customer lifetime value
  this.businessMetrics.customerLifetimeValue = this.businessMetrics.revenueImpact * 3;
  
  // Calculate referral value
  this.businessMetrics.referralValue = this.businessMetrics.revenueImpact * 0.1;
  
  // Estimate retention probability based on engagement
  this.businessMetrics.retentionProbability = Math.min(
    this.performance.engagementScore * 0.8,
    95
  );
  
  await this.save();
  return this;
};

// Static methods
referralConversionSchema.statics.getFunnelAnalytics = async function(referrerId, period = '30d') {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }
  
  const query = referrerId ? { referrerId } : {};
  query.createdAt = { $gte: startDate, $lte: endDate };
  
  const funnelData = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$funnelStage',
        count: { $sum: 1 },
        avgTimeToConversion: { $avg: '$performance.timeToConversion' },
        avgEngagementScore: { $avg: '$performance.engagementScore' },
        totalRevenueImpact: { $sum: '$businessMetrics.revenueImpact' },
        avgConversionRate: { $avg: '$performance.conversionRate' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
  
  return funnelData;
};

referralConversionSchema.statics.getConversionRates = async function(referrerId, period = '30d') {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }
  
  const query = referrerId ? { referrerId } : {};
  query.createdAt = { $gte: startDate, $lte: endDate };
  
  const conversionRates = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          stage: '$funnelStage',
          source: '$conversionData.source',
          platform: '$conversionData.platform'
        },
        totalUsers: { $sum: 1 },
        completedUsers: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        },
        avgEngagementScore: { $avg: '$performance.engagementScore' },
        avgTimeToConversion: { $avg: '$performance.timeToConversion' }
      }
    },
    {
      $addFields: {
        conversionRate: {
          $multiply: [
            { $divide: ['$completedUsers', '$totalUsers'] },
            100
          ]
        }
      }
    },
    { $sort: { conversionRate: -1 } }
  ]);
  
  return conversionRates;
};

referralConversionSchema.statics.getGeographicAnalytics = async function(referrerId, period = '30d') {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }
  
  const query = referrerId ? { referrerId } : {};
  query.createdAt = { $gte: startDate, $lte: endDate };
  query['conversionData.location.country'] = { $exists: true };
  
  const geographicData = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$conversionData.location.country',
        totalConversions: { $sum: 1 },
        avgEngagementScore: { $avg: '$performance.engagementScore' },
        totalRevenueImpact: { $sum: '$businessMetrics.revenueImpact' },
        conversionStages: { $addToSet: '$funnelStage' },
        sources: { $addToSet: '$conversionData.source' }
      }
    },
    {
      $addFields: {
        avgConversionStages: { $size: '$conversionStages' },
        sourceDiversity: { $size: '$sources' }
      }
    },
    { $sort: { totalConversions: -1 } }
  ]);
  
  return geographicData;
};

referralConversionSchema.statics.getSourcePerformance = async function(referrerId, period = '30d') {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }
  
  const query = referrerId ? { referrerId } : {};
  query.createdAt = { $gte: startDate, $lte: endDate };
  
  const sourcePerformance = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$conversionData.source',
        totalConversions: { $sum: 1 },
        avgEngagementScore: { $avg: '$performance.engagementScore' },
        avgConversionRate: { $avg: '$performance.conversionRate' },
        totalRevenueImpact: { $sum: '$businessMetrics.revenueImpact' },
        platforms: { $addToSet: '$conversionData.platform' },
        funnelStages: { $addToSet: '$funnelStage' }
      }
    },
    {
      $addFields: {
        platformDiversity: { $size: '$platforms' },
        funnelDepth: { $size: '$funnelStages' }
      }
    },
    { $sort: { totalConversions: -1 } }
  ]);
  
  return sourcePerformance;
};

// Pre-save middleware
referralConversionSchema.pre('save', function(next) {
  // Set default expiration (90 days from creation)
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  }
  
  // Auto-complete if reaching final stage
  if (this.funnelStage === 'referral_shared') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  // Calculate performance metrics if not set
  if (!this.performance.engagementScore) {
    this.performance.engagementScore = this.calculateEngagementScore();
  }
  
  next();
});

module.exports = mongoose.model('ReferralConversion', referralConversionSchema);
