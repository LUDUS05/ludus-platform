const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
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
    unique: true,
    index: true
  },
  referralCode: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'expired'],
    default: 'pending',
    index: true
  },
  rewardType: {
    type: String,
    enum: ['registration', 'first-booking'],
    required: true
  },
  rewardAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'SAR',
    enum: ['SAR', 'USD', 'EUR']
  },
  completedAt: {
    type: Date
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  metadata: {
    source: String, // 'qr', 'social', 'direct-link'
    platform: String, // 'whatsapp', 'facebook', 'twitter', 'sms', 'email'
    userAgent: String,
    ipAddress: String
  }
}, {
  timestamps: true
});

// Indexes for performance
referralSchema.index({ referrerId: 1, status: 1 });
referralSchema.index({ referralCode: 1, status: 1 });
referralSchema.index({ createdAt: -1 });

// Virtual for total reward amount
referralSchema.virtual('totalReward').get(function() {
  return this.rewardAmount;
});

// Method to mark referral as completed
referralSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to mark payment as paid
referralSchema.methods.markPaid = function() {
  this.paymentStatus = 'paid';
  return this.save();
};

// Static method to get user's total referrals
referralSchema.statics.getUserReferrals = function(userId) {
  return this.find({ referrerId: userId }).populate('referredUserId', 'firstName lastName email');
};

// Static method to get user's total earnings
referralSchema.statics.getUserEarnings = function(userId) {
  try {
    // Ensure userId is a valid ObjectId
    const objectId = new mongoose.Types.ObjectId(userId);
    return this.aggregate([
      { $match: { referrerId: objectId, status: 'completed' } },
      { $group: { _id: null, totalEarnings: { $sum: '$rewardAmount' } } }
    ]);
  } catch (error) {
    // If userId is invalid, return empty result
    console.error('Invalid userId for getUserEarnings:', userId, error);
    return [];
  }
};

module.exports = mongoose.model('Referral', referralSchema);
