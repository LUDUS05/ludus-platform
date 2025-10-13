const mongoose = require('mongoose');
const crypto = require('crypto');

const referralCodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    
  },
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
    minlength: 6,
    maxlength: 10
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  maxUsage: {
    type: Number,
    default: null, // null means unlimited
    min: 1
  },
  expiresAt: {
    type: Date,
    default: null // null means never expires
  },
  metadata: {
    generatedAt: {
      type: Date,
      default: Date.now
    },
    lastUsedAt: Date,
    source: {
      type: String,
      enum: ['auto-generated', 'admin-created', 'user-requested'],
      default: 'auto-generated'
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
referralCodeSchema.index({ code: 1, isActive: 1 });
referralCodeSchema.index({ userId: 1, isActive: 1 });
referralCodeSchema.index({ expiresAt: 1 });

// Generate unique referral code
referralCodeSchema.statics.generateUniqueCode = async function() {
  let code;
  let attempts = 0;
  const maxAttempts = 10;
  
  do {
    // Generate a random 8-character code
    code = crypto.randomBytes(4).toString('hex').toUpperCase();
    attempts++;
    
    if (attempts > maxAttempts) {
      throw new Error('Unable to generate unique referral code after maximum attempts');
    }
  } while (await this.findOne({ code }));
  
  return code;
};

// Method to increment usage count
referralCodeSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.metadata.lastUsedAt = new Date();
  return this.save();
};

// Method to add earnings
referralCodeSchema.methods.addEarnings = function(amount) {
  this.totalEarnings += amount;
  return this.save();
};

// Method to check if code can be used
referralCodeSchema.methods.canBeUsed = function() {
  if (!this.isActive) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  if (this.maxUsage && this.usageCount >= this.maxUsage) return false;
  return true;
};

// Method to deactivate code
referralCodeSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Method to reactivate code
referralCodeSchema.methods.activate = function() {
  this.isActive = true;
  return this.save();
};

// Pre-save middleware to ensure code is unique
referralCodeSchema.pre('save', async function(next) {
  if (this.isModified('code')) {
    const existingCode = await this.constructor.findOne({ 
      code: this.code, 
      _id: { $ne: this._id } 
    });
    
    if (existingCode) {
      throw new Error('Referral code already exists');
    }
  }
  next();
});

module.exports = mongoose.model('ReferralCode', referralCodeSchema);
