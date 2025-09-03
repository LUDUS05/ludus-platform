const mongoose = require('mongoose');

const referralRewardSchema = new mongoose.Schema({
  rewardType: {
    type: String,
    enum: ['registration', 'first-booking'],
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'SAR',
    enum: ['SAR', 'USD', 'EUR']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  conditions: {
    minReferrals: {
      type: Number,
      default: 0,
      min: 0
    },
    maxReferrals: {
      type: Number,
      default: null,
      min: 0
    },
    validFrom: {
      type: Date,
      default: Date.now
    },
    validUntil: {
      type: Date,
      default: null
    }
  },
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    version: {
      type: Number,
      default: 1
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
referralRewardSchema.index({ rewardType: 1, isActive: 1 });
referralRewardSchema.index({ 'conditions.validFrom': 1, 'conditions.validUntil': 1 });

// Method to check if reward is currently valid
referralRewardSchema.methods.isValid = function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  if (this.conditions.validFrom && now < this.conditions.validFrom) return false;
  if (this.conditions.validUntil && now > this.conditions.validUntil) return false;
  
  return true;
};

// Method to check if user qualifies for this reward
referralRewardSchema.methods.userQualifies = function(userReferralCount) {
  if (!this.isValid()) return false;
  
  if (this.conditions.minReferrals && userReferralCount < this.conditions.minReferrals) {
    return false;
  }
  
  if (this.conditions.maxReferrals && userReferralCount >= this.conditions.maxReferrals) {
    return false;
  }
  
  return true;
};

// Method to deactivate reward
referralRewardSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Method to activate reward
referralRewardSchema.methods.activate = function() {
  this.isActive = true;
  return this.save();
};

// Method to update amount
referralRewardSchema.methods.updateAmount = function(newAmount, updatedBy) {
  this.amount = newAmount;
  this.metadata.lastModifiedBy = updatedBy;
  this.metadata.version += 1;
  return this.save();
};

// Static method to get active rewards
referralRewardSchema.statics.getActiveRewards = function() {
  return this.find({ isActive: true });
};

// Static method to get reward by type
referralRewardSchema.statics.getRewardByType = function(rewardType) {
  return this.findOne({ rewardType, isActive: true });
};

// Pre-save middleware to validate conditions
referralRewardSchema.pre('save', function(next) {
  if (this.conditions.minReferrals && this.conditions.maxReferrals) {
    if (this.conditions.minReferrals >= this.conditions.maxReferrals) {
      return next(new Error('minReferrals must be less than maxReferrals'));
    }
  }
  
  if (this.conditions.validFrom && this.conditions.validUntil) {
    if (this.conditions.validFrom >= this.conditions.validUntil) {
      return next(new Error('validFrom must be before validUntil'));
    }
  }
  
  next();
});

module.exports = mongoose.model('ReferralReward', referralRewardSchema);
