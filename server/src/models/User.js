const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      // Password not required for social logins
      return !this.social || !(this.social.google || this.social.facebook || this.social.apple);
    },
    minlength: 8
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Enhanced admin role system for LDS Team Management
  adminRole: {
    type: String,
    enum: ['SA', 'PLATFORM_MANAGER', 'MODERATOR', 'ADMIN_PARTNERSHIPS', 'PSM', 'PSA'],
    default: null
  },
  // Partner assignments for PSMs and PSAs
  assignedPartners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  }],
  // Admin metadata
  adminMetadata: {
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: Date,
    lastActiveAt: Date,
    permissions: {
      type: Map,
      of: Boolean,
      default: {}
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  preferences: {
    categories: [{
      type: String,
      enum: ['fitness', 'arts', 'food', 'outdoor', 'unique', 'wellness']
    }],
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 500 }
    },
    radius: {
      type: Number,
      default: 25 // miles
    },
    // OpGrapes new preferences
    language: {
      type: String,
      enum: ['en', 'ar'],
      default: 'en'
    },
    participantGenderMix: {
      type: String,
      enum: ['mixed', 'same-gender', 'no-preference'],
      default: 'no-preference'
    },
    preferredTimes: [{
      type: String,
      enum: ['weekday-morning', 'weekday-afternoon', 'weekday-evening', 'weekend-morning', 'weekend-afternoon', 'weekend-evening']
    }],
    activityTypes: [{
      type: String,
      enum: ['indoor', 'outdoor', 'physical', 'mental', 'social', 'solo', 'group']
    }],
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      marketing: { type: Boolean, default: true }
    }
  },
  profileImage: {
    type: String // Cloudinary URL
  },
  // Community rating system
  communityRating: {
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    ratingDistribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  // Social authentication fields
  social: {
    google: {
      id: String,
      email: String
    },
    facebook: {
      id: String,
      email: String
    },
    apple: {
      id: String,
      email: String
    }
  },
  paymentMethods: [{
    moyasarTokenId: {
      type: String,
      required: true
    },
    last4: {
      type: String,
      required: true
    },
    brand: {
      type: String,
      required: true,
      enum: ['visa', 'mastercard', 'mada', 'amex']
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  refreshToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Transform output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  return user;
};

module.exports = mongoose.model('User', userSchema);