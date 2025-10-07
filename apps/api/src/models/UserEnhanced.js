/**
 * @fileoverview Enhanced User model for LUDUS platform - LDS-006 Implementation
 * 
 * This model defines the comprehensive user schema for the LUDUS social activity platform
 * based on the detailed database design specification. It includes user authentication,
 * profile management, preferences, social features, referral system, and cultural
 * sensitivity for the Saudi Arabian market.
 * 
 * Key Features:
 * - JWT-based authentication with password hashing
 * - Social authentication (Google, Facebook, Apple)
 * - Arabic/English bilingual support with RTL considerations
 * - Comprehensive user preferences and settings
 * - Referral system integration
 * - Geospatial location support
 * - Admin role system with granular permissions
 * - Payment method management
 * - Onboarding gamification
 * - Cultural sensitivity for Saudi market
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  email: {
    type: String,
    required: [true, 'Email is required'],
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
    minlength: [8, 'Password must be at least 8 characters long']
  },
  
  // Profile Information with Arabic Support
  profile: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    firstNameAr: {
      type: String,
      trim: true,
      maxlength: [50, 'Arabic first name cannot exceed 50 characters']
    },
    lastNameAr: {
      type: String,
      trim: true,
      maxlength: [50, 'Arabic last name cannot exceed 50 characters']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      match: [/^\+966[0-9]{9}$/, 'Please enter a valid Saudi phone number (+966XXXXXXXXX)']
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female'],
        message: 'Gender must be either male or female'
      },
      required: [true, 'Gender is required']
    },
    avatar: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    bioAr: {
      type: String,
      maxlength: [500, 'Arabic bio cannot exceed 500 characters']
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationCode: {
      type: String,
      default: null
    }
  },

  // Location with Geospatial Support
  location: {
    city: {
      type: String,
      required: [true, 'City is required'],
      index: true
    },
    cityAr: {
      type: String,
      index: true
    },
    region: {
      type: String,
      required: [true, 'Region is required']
    },
    regionAr: {
      type: String
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
        validate: {
          validator: function(coords) {
            return coords.length === 2 && 
                   coords[0] >= -180 && coords[0] <= 180 && 
                   coords[1] >= -90 && coords[1] <= 90;
          },
          message: 'Invalid coordinates format'
        }
      }
    },
    address: {
      type: String,
      default: null
    },
    addressAr: {
      type: String,
      default: null
    }
  },

  // User Preferences with Cultural Sensitivity
  preferences: {
    language: {
      type: String,
      enum: {
        values: ['ar', 'en'],
        message: 'Language must be either ar or en'
      },
      default: 'ar'
    },
    timezone: {
      type: String,
      default: 'Asia/Riyadh'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      marketing: {
        type: Boolean,
        default: true
      }
    },
    interests: [{
      type: String,
      enum: ['travel', 'sports', 'culture', 'food', 'adventure', 'family', 'business', 'fitness', 'arts', 'outdoor', 'unique', 'wellness']
    }],
    priceRange: {
      min: {
        type: Number,
        default: 0,
        min: 0
      },
      max: {
        type: Number,
        default: 1000,
        min: 0
      }
    },
    radius: {
      type: Number,
      default: 25, // kilometers
      min: 1,
      max: 100
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
    socialPreferences: {
      socialInteraction: {
        type: String,
        enum: ['minimal', 'moderate', 'high'],
        default: 'moderate'
      },
      networking: {
        type: Boolean,
        default: true
      },
      teamBuilding: {
        type: Boolean,
        default: true
      },
      competitive: {
        type: Boolean,
        default: false
      }
    }
  },

  // User Statistics
  stats: {
    totalBookings: {
      type: Number,
      default: 0,
      min: 0
    },
    totalActivities: {
      type: Number,
      default: 0,
      min: 0
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0
    },
    memberSince: {
      type: Date,
      default: Date.now
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },

  // Social Features
  social: {
    referralCode: {
      type: String,
      unique: true,
      sparse: true
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    referralCount: {
      type: Number,
      default: 0,
      min: 0
    },
    socialLinks: {
      instagram: String,
      twitter: String,
      linkedin: String,
      website: String,
      snapchat: String
    },
    // Social authentication
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

  // Role and Permissions
  role: {
    type: String,
    enum: ['user', 'partner', 'admin', 'moderator'],
    default: 'user',
    index: true
  },
  adminRole: {
    type: String,
    enum: ['SA', 'PLATFORM_MANAGER', 'MODERATOR', 'ADMIN_PARTNERSHIPS', 'PSM', 'PSA'],
    default: null
  },
  assignedPartners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner'
  }],
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

  // Payment Methods
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

  // Authentication Tokens
  refreshToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  // Onboarding Gamification
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
  },

  // User Status
  status: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
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
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Generate unique referral code for user.
 * 
 * Creates a unique referral code for the user if one doesn't exist.
 * The code is generated using a combination of user ID and random string.
 * 
 * @async
 * @function
 * @param {Function} next - Express middleware next function
 * @returns {Promise<void>} Continues to next middleware
 */
userSchema.pre('save', async function(next) {
  if (!this.social.referralCode) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.social.referralCode = `LUDUS-${timestamp}-${random}`.toUpperCase();
  }
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
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Get user's full name based on language preference.
 * 
 * Returns the full name in the user's preferred language (Arabic or English).
 * Falls back to English if Arabic name is not available.
 * 
 * @method getFullName
 * @param {string} language - Language preference ('ar' or 'en')
 * @returns {string} Full name in requested language
 */
userSchema.methods.getFullName = function(language = 'ar') {
  if (language === 'ar' && this.profile.firstNameAr && this.profile.lastNameAr) {
    return `${this.profile.firstNameAr} ${this.profile.lastNameAr}`;
  }
  return `${this.profile.firstName} ${this.profile.lastName}`;
};

/**
 * Check if user has specific permission.
 * 
 * Verifies if the user has a specific permission based on their role
 * and admin metadata permissions.
 * 
 * @method hasPermission
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has permission, false otherwise
 */
userSchema.methods.hasPermission = function(permission) {
  if (this.role === 'admin' && this.adminMetadata.permissions) {
    return this.adminMetadata.permissions.get(permission) || false;
  }
  return false;
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.getFullName();
});

// Virtual for display name (with language preference)
userSchema.virtual('displayName').get(function() {
  return this.getFullName(this.preferences.language);
});

// Transform output to remove sensitive data
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

// Indexes for performance optimization
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ 'location.city': 1, 'preferences.interests': 1 });
userSchema.index({ 'stats.totalBookings': -1, createdAt: -1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ 'preferences.language': 1 });

// Text index for search
userSchema.index({ 
  'profile.firstName': 'text', 
  'profile.lastName': 'text', 
  'profile.firstNameAr': 'text',
  'profile.lastNameAr': 'text',
  email: 'text' 
});

module.exports = mongoose.model('UserEnhanced', userSchema);

