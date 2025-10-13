/**
 * @fileoverview User model for LUDUS platform.
 * 
 * This model defines the comprehensive user schema for the LUDUS social activity platform.
 * It includes user authentication, profile management, preferences, social features,
 * referral system, rating profiles, and admin role management.
 * 
 * Key Features:
 * - JWT-based authentication with password hashing
 * - Social authentication (Google, Facebook, Apple)
 * - Comprehensive user preferences and settings
 * - Referral system integration
 * - Rating profile management
 * - Admin role system with granular permissions
 * - Payment method management
 * - Onboarding gamification
 * 
 * @version 1.0.0
 * @author LUDUS Development Team
 * @since 2025-01-01
 */

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
      push: { type: Boolean, default: true },
      marketing: { type: Boolean, default: true },
      activityUpdates: { type: Boolean, default: true },
      socialUpdates: { type: Boolean, default: true },
      reminderNotifications: { type: Boolean, default: true }
    },
    // Enhanced participation preferences
    participantPreferences: {
      ageGroups: {
        preferred: [String],
        avoid: [String]
      },
      genders: {
        preferred: [String],
        avoid: [String]
      },
      languages: {
        preferred: [String],
        avoid: [String]
      },
      experienceLevels: {
        preferred: [String],
        avoid: [String]
      },
      groupSizes: {
        preferred: [String],
        avoid: [String]
      }
    },
    // Enhanced social preferences
    socialPreferences: {
      socialInteraction: {
        type: String,
        enum: ['minimal', 'moderate', 'high'],
        default: 'moderate'
      },
      networking: { type: Boolean, default: true },
      teamBuilding: { type: Boolean, default: true },
      competitive: { type: Boolean, default: false }
    },
    // Enhanced activity preferences
    indoorOutdoor: {
      type: String,
      enum: ['both', 'indoor', 'outdoor'],
      default: 'both'
    },
    physicalIntensity: {
      type: String,
      enum: ['low', 'moderate', 'high', 'very-high'],
      default: 'moderate'
    }
  },
  profileImage: {
    type: String // Cloudinary URL
  },
  // Enhanced profile fields
  bio: {
    type: String,
    maxlength: 500
  },
  socialLinks: {
    instagram: String,
    twitter: String,
    linkedin: String,
    website: String,
    snapchat: String
  },
  location: {
    city: String,
    country: {
      type: String,
      default: 'Saudi Arabia'
    }
  },
  interests: [String],
  languages: [String],
  availability: {
    weekdays: { type: Boolean, default: false },
    weekends: { type: Boolean, default: false },
    evenings: { type: Boolean, default: false },
    mornings: { type: Boolean, default: false }
  },
  contactPreferences: {
    allowMessages: { type: Boolean, default: true },
    allowFriendRequests: { type: Boolean, default: true },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false }
  },
  // Community rating system (legacy - will be migrated to UserRatingProfile)
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
  
  // Enhanced rating system integration
  ratingProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserRatingProfile',
    default: null
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
  emailVerificationExpires: Date,
  // Referral system fields
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  referredBy: {
    type: String // Referral code used during registration
  },
  referralStats: {
    totalReferrals: {
      type: Number,
      default: 0,
      min: 0
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0
    },
    firstBookingCompleted: {
      type: Boolean,
      default: false
    },
    lastReferralAt: Date
  },
  // Onboarding gamification (points, badges)
  onboardingGamification: {
    points: {
      type: Number,
      default: 0,
      min: 0
    },
    badges: [{
      type: String
    }],
    lastActionAt: Date,
    currentStreak: {
      type: Number,
      default: 0,
      min: 0
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0
    }
  }
}, {
  timestamps: true
});

/**
 * Pre-save middleware to hash user passwords.
 * 
 * Automatically hashes the password using bcrypt with a salt rounds of 12
 * before saving the user to the database. Only hashes if the password
 * field has been modified to avoid unnecessary re-hashing.
 * 
 * @async
 * @function
 * @param {Function} next - Express middleware next function
 * @returns {Promise<void>} Continues to next middleware
 * 
 * @example
 * // Automatically called when saving a user with a new password
 * const user = new User({ email: 'test@example.com', password: 'plaintext' });
 * await user.save(); // Password is automatically hashed
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/**
 * Compare a candidate password with the user's hashed password.
 * 
 * Uses bcrypt to securely compare the provided password with the stored
 * hashed password. This method is used during login authentication.
 * 
 * @async
 * @method comparePassword
 * @param {string} candidatePassword - The plain text password to compare
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 * 
 * @example
 * const user = await User.findOne({ email: 'test@example.com' });
 * const isValid = await user.comparePassword('userPassword123');
 * if (isValid) {
 *   // User authentication successful
 * }
 */
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