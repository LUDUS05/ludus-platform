const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  // Referrer information
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Invitation details
  invitationType: {
    type: String,
    enum: ['activity-share', 'direct-invite', 'social-share', 'qr-code', 'email-invite'],
    required: true,
    index: true
  },
  
  // Activity context (if sharing an activity)
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    index: true
  },
  
  // Platform information
  platform: {
    type: String,
    enum: ['whatsapp', 'facebook', 'twitter', 'telegram', 'email', 'sms', 'copy', 'qr-code', 'direct'],
    required: true,
    index: true
  },
  
  // Invitation metadata
  metadata: {
    source: {
      type: String,
      enum: ['activity-details', 'profile', 'dashboard', 'referral-link', 'qr-code'],
      default: 'activity-details'
    },
    userAgent: String,
    ipAddress: String,
    referrer: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    utmTerm: String,
    utmContent: String
  },
  
  // Tracking information
  tracking: {
    clicks: {
      type: Number,
      default: 0,
      min: 0
    },
    lastClickedAt: Date,
    firstClickedAt: Date,
    uniqueClicks: {
      type: Number,
      default: 0,
      min: 0
    },
    conversions: {
      type: Number,
      default: 0,
      min: 0
    },
    conversionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  // Status and lifecycle
  status: {
    type: String,
    enum: ['active', 'paused', 'expired', 'deleted'],
    default: 'active',
    index: true
  },
  
  // Expiration and scheduling
  expiresAt: Date,
  scheduledFor: Date,
  
  // Analytics and performance
  performance: {
    totalShares: {
      type: Number,
      default: 0,
      min: 0
    },
    totalViews: {
      type: Number,
      default: 0,
      min: 0
    },
    engagementRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageTimeToConversion: Number, // in hours
    bestPerformingTime: String, // time of day
    bestPerformingDay: String // day of week
  },
  
  // Geographic and demographic data
  analytics: {
    countries: [{
      country: String,
      clicks: Number,
      conversions: Number
    }],
    devices: [{
      device: String,
      clicks: Number,
      conversions: Number
    }],
    browsers: [{
      browser: String,
      clicks: Number,
      conversions: Number
    }]
  }
}, {
  timestamps: true
});

// Indexes for performance
invitationSchema.index({ referrerId: 1, createdAt: -1 });
invitationSchema.index({ invitationType: 1, platform: 1 });
invitationSchema.index({ status: 1, expiresAt: 1 });
invitationSchema.index({ 'tracking.clicks': -1 });
invitationSchema.index({ 'performance.engagementRate': -1 });

// Virtual for invitation link
invitationSchema.virtual('invitationLink').get(function() {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return `${baseUrl}/register?ref=${this.referrerId}&inv=${this._id}`;
});

// Instance methods
invitationSchema.methods.incrementClicks = async function(ipAddress, userAgent) {
  this.tracking.clicks += 1;
  this.tracking.lastClickedAt = new Date();
  
  if (!this.tracking.firstClickedAt) {
    this.tracking.firstClickedAt = new Date();
  }
  
  // Update performance metrics
  this.performance.totalViews += 1;
  
  // Calculate engagement rate
  if (this.performance.totalViews > 0) {
    this.tracking.conversionRate = (this.tracking.conversions / this.performance.totalViews) * 100;
    this.performance.engagementRate = (this.tracking.clicks / this.performance.totalViews) * 100;
  }
  
  await this.save();
  return this;
};

invitationSchema.methods.recordConversion = async function() {
  this.tracking.conversions += 1;
  
  // Calculate conversion rate
  if (this.performance.totalViews > 0) {
    this.tracking.conversionRate = (this.tracking.conversions / this.performance.totalViews) * 100;
  }
  
  // Calculate average time to conversion
  if (this.tracking.firstClickedAt && this.tracking.conversions === 1) {
    const timeDiff = Date.now() - this.tracking.firstClickedAt.getTime();
    this.performance.averageTimeToConversion = timeDiff / (1000 * 60 * 60); // Convert to hours
  }
  
  await this.save();
  return this;
};

invitationSchema.methods.updatePerformance = async function() {
  // Calculate best performing time and day
  if (this.tracking.clicks > 0) {
    const clickHour = this.tracking.lastClickedAt.getHours();
    const clickDay = this.tracking.lastClickedAt.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Update best performing time (simplified logic)
    if (!this.performance.bestPerformingTime || this.tracking.clicks > 5) {
      this.performance.bestPerformingTime = `${clickHour}:00`;
      this.performance.bestPerformingDay = clickDay;
    }
  }
  
  await this.save();
  return this;
};

// Static methods
invitationSchema.statics.getInvitationStats = async function(userId, period = '30d') {
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
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }
  
  const stats = await this.aggregate([
    {
      $match: {
        referrerId: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'active'
      }
    },
    {
      $group: {
        _id: null,
        totalInvitations: { $sum: 1 },
        totalClicks: { $sum: '$tracking.clicks' },
        totalConversions: { $sum: '$tracking.conversions' },
        totalViews: { $sum: '$performance.totalViews' },
        avgEngagementRate: { $avg: '$performance.engagementRate' },
        platforms: { $addToSet: '$platform' },
        invitationTypes: { $addToSet: '$invitationType' }
      }
    }
  ]);
  
  return stats[0] || {
    totalInvitations: 0,
    totalClicks: 0,
    totalConversions: 0,
    totalViews: 0,
    avgEngagementRate: 0,
    platforms: [],
    invitationTypes: []
  };
};

invitationSchema.statics.getTopPerformingInvitations = async function(userId, limit = 5) {
  return await this.find({
    referrerId: userId,
    status: 'active'
  })
  .sort({ 'tracking.conversionRate': -1, 'tracking.clicks': -1 })
  .limit(limit)
  .populate('activityId', 'title category image_url')
  .lean();
};

invitationSchema.statics.getPlatformPerformance = async function(userId) {
  return await this.aggregate([
    {
      $match: {
        referrerId: mongoose.Types.ObjectId(userId),
        status: 'active'
      }
    },
    {
      $group: {
        _id: '$platform',
        totalInvitations: { $sum: 1 },
        totalClicks: { $sum: '$tracking.clicks' },
        totalConversions: { $sum: '$tracking.conversions' },
        avgConversionRate: { $avg: '$tracking.conversionRate' }
      }
    },
    {
      $sort: { totalConversions: -1 }
    }
  ]);
};

// Pre-save middleware
invitationSchema.pre('save', function(next) {
  // Set default expiration (30 days from creation)
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  // Update status based on expiration
  if (this.expiresAt < new Date()) {
    this.status = 'expired';
  }
  
  next();
});

module.exports = mongoose.model('Invitation', invitationSchema);
