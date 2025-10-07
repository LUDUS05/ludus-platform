/**
 * @fileoverview Enhanced Review model for LUDUS platform - LDS-006 Implementation
 * 
 * This model defines the comprehensive review schema for the LUDUS social activity platform
 * based on the detailed database design specification. It includes review management,
 * rating system, comment handling, image support, and partner responses with cultural
 * sensitivity for the Saudi Arabian market.
 * 
 * Key Features:
 * - Comprehensive rating system with multiple categories
 * - Arabic/English bilingual support
 * - Image and media support for reviews
 * - Partner response system
 * - Helpful votes and social features
 * - Review verification system
 * - Moderation and status management
 * - Analytics and reporting support
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // User Information
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'User name is required']
    },
    nameAr: {
      type: String
    },
    avatar: {
      type: String
    }
  },

  // Activity Information
  activity: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
      required: [true, 'Activity ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Activity title is required']
    },
    titleEn: {
      type: String
    }
  },

  // Booking Information
  booking: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required']
    },
    bookingNumber: {
      type: String,
      required: [true, 'Booking number is required']
    }
  },

  // Rating Information
  rating: {
    overall: {
      type: Number,
      required: [true, 'Overall rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      index: true
    },
    categories: {
      value: {
        type: Number,
        min: [1, 'Value rating must be at least 1'],
        max: [5, 'Value rating cannot exceed 5']
      },
      service: {
        type: Number,
        min: [1, 'Service rating must be at least 1'],
        max: [5, 'Service rating cannot exceed 5']
      },
      location: {
        type: Number,
        min: [1, 'Location rating must be at least 1'],
        max: [5, 'Location rating cannot exceed 5']
      },
      communication: {
        type: Number,
        min: [1, 'Communication rating must be at least 1'],
        max: [5, 'Communication rating cannot exceed 5']
      }
    }
  },

  // Review Content
  comment: {
    type: String,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  commentAr: {
    type: String,
    maxlength: [1000, 'Arabic comment cannot exceed 1000 characters']
  },

  // Media
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      maxlength: [200, 'Image caption cannot exceed 200 characters']
    },
    captionAr: {
      type: String,
      maxlength: [200, 'Arabic image caption cannot exceed 200 characters']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Verification
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },

  // Social Features
  helpful: {
    count: {
      type: Number,
      default: 0,
      min: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },

  // Partner Response
  response: {
    partner: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partner'
      },
      name: {
        type: String
      },
      nameAr: {
        type: String
      }
    },
    comment: {
      type: String,
      maxlength: [1000, 'Partner response cannot exceed 1000 characters']
    },
    commentAr: {
      type: String,
      maxlength: [1000, 'Arabic partner response cannot exceed 1000 characters']
    },
    respondedAt: {
      type: Date,
      default: Date.now
    }
  },

  // Moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'pending',
    index: true
  },
  moderationNotes: {
    type: String,
    maxlength: [500, 'Moderation notes cannot exceed 500 characters']
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },

  // Analytics
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  shares: {
    type: Number,
    default: 0,
    min: 0
  },

  // Metadata
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'admin', 'api'],
      default: 'web'
    },
    userAgent: {
      type: String
    },
    ipAddress: {
      type: String
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Calculate average category rating.
 * 
 * Calculates the average of all category ratings to provide
 * a comprehensive rating overview.
 * 
 * @method calculateAverageCategoryRating
 * @returns {number} The average category rating
 */
reviewSchema.methods.calculateAverageCategoryRating = function() {
  const categories = this.rating.categories;
  const ratings = Object.values(categories).filter(rating => rating !== undefined);
  
  if (ratings.length === 0) return 0;
  
  const sum = ratings.reduce((total, rating) => total + rating, 0);
  return sum / ratings.length;
};

/**
 * Add helpful vote from user.
 * 
 * Adds a helpful vote from a user if they haven't already voted.
 * Prevents duplicate votes from the same user.
 * 
 * @method addHelpfulVote
 * @param {string} userId - The user ID adding the vote
 * @returns {Promise<Review>} The updated review document
 */
reviewSchema.methods.addHelpfulVote = function(userId) {
  if (!this.helpful.users.includes(userId)) {
    this.helpful.users.push(userId);
    this.helpful.count += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

/**
 * Remove helpful vote from user.
 * 
 * Removes a helpful vote from a user if they have previously voted.
 * 
 * @method removeHelpfulVote
 * @param {string} userId - The user ID removing the vote
 * @returns {Promise<Review>} The updated review document
 */
reviewSchema.methods.removeHelpfulVote = function(userId) {
  const userIndex = this.helpful.users.indexOf(userId);
  if (userIndex > -1) {
    this.helpful.users.splice(userIndex, 1);
    this.helpful.count = Math.max(0, this.helpful.count - 1);
    return this.save();
  }
  return Promise.resolve(this);
};

/**
 * Add partner response to review.
 * 
 * Adds a response from the partner to the review, including
 * the response text and partner information.
 * 
 * @method addPartnerResponse
 * @param {Object} partnerInfo - Partner information
 * @param {string} comment - Response comment
 * @param {string} commentAr - Arabic response comment
 * @returns {Promise<Review>} The updated review document
 */
reviewSchema.methods.addPartnerResponse = function(partnerInfo, comment, commentAr = null) {
  this.response = {
    partner: {
      id: partnerInfo.id,
      name: partnerInfo.name,
      nameAr: partnerInfo.nameAr
    },
    comment: comment,
    commentAr: commentAr,
    respondedAt: new Date()
  };
  return this.save();
};

/**
 * Update review status for moderation.
 * 
 * Updates the review status and adds moderation information
 * for content management purposes.
 * 
 * @method updateStatus
 * @param {string} status - The new status
 * @param {string} moderatorId - The moderator user ID
 * @param {string} notes - Moderation notes
 * @returns {Promise<Review>} The updated review document
 */
reviewSchema.methods.updateStatus = function(status, moderatorId, notes = '') {
  this.status = status;
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  this.moderationNotes = notes;
  return this.save();
};

// Virtual for display user name
reviewSchema.virtual('displayUserName').get(function() {
  return this.user.nameAr || this.user.name;
});

// Virtual for display activity title
reviewSchema.virtual('displayActivityTitle').get(function() {
  return this.activity.titleEn || this.activity.title;
});

// Virtual for display comment
reviewSchema.virtual('displayComment').get(function() {
  return this.commentAr || this.comment;
});

// Virtual for average category rating
reviewSchema.virtual('averageCategoryRating').get(function() {
  return this.calculateAverageCategoryRating();
});

// Virtual for is verified
reviewSchema.virtual('isVerifiedReview').get(function() {
  return this.isVerified;
});

// Virtual for has partner response
reviewSchema.virtual('hasPartnerResponse').get(function() {
  return this.response && this.response.comment;
});

// Virtual for display partner response
reviewSchema.virtual('displayPartnerResponse').get(function() {
  if (!this.response) return null;
  return this.response.commentAr || this.response.comment;
});

// Indexes for performance optimization
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ isVerified: 1, status: 1 });
reviewSchema.index({ 'helpful.count': -1 });
reviewSchema.index({ 'response.partner.id': 1 });

// Text index for search
reviewSchema.index({ 
  comment: 'text', 
  commentAr: 'text'
});

module.exports = mongoose.model('ReviewEnhanced', reviewSchema);

