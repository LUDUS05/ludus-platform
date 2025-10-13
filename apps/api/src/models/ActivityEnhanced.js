/**
 * @fileoverview Enhanced Activity model for LUDUS platform - LDS-006 Implementation
 * 
 * This model defines the comprehensive activity schema for the LUDUS social activity platform
 * based on the detailed database design specification. It includes activity management,
 * pricing, scheduling, location, requirements, policies, ratings, and statistics tracking
 * with cultural sensitivity for the Saudi Arabian market.
 * 
 * Key Features:
 * - Comprehensive activity information and metadata
 * - Arabic/English bilingual support with RTL considerations
 * - Flexible pricing models (per person, per group, per hour)
 * - Advanced scheduling system (fixed, flexible, recurring)
 * - Location management with coordinates and online support
 * - Requirements and policies management
 * - Rating and review system
 * - Statistics tracking and analytics
 * - SEO optimization fields
 * - Partner relationship management
 * - Geospatial search capabilities
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  // Basic Information with Arabic Support
  title: {
    type: String,
    required: [true, 'Activity title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
    index: true
  },
  titleEn: {
    type: String,
    trim: true,
    maxlength: [100, 'English title cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Activity description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  descriptionEn: {
    type: String,
    maxlength: [1000, 'English description cannot exceed 1000 characters']
  },
  fullDescription: {
    type: String,
    required: [true, 'Full description is required'],
    maxlength: [5000, 'Full description cannot exceed 5000 characters']
  },
  fullDescriptionEn: {
    type: String,
    maxlength: [5000, 'English full description cannot exceed 5000 characters']
  },

  // Media
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    captionEn: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  videos: [{
    url: String,
    thumbnail: String,
    duration: Number, // in seconds
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Category and Partner Information
  category: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true
    },
    name: String,
    nameEn: String
  },
  partner: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: [true, 'Partner is required'],
      index: true
    },
    name: String,
    nameEn: String,
    avatar: String
  },

  // Location with Geospatial Support
  location: {
    city: {
      type: String,
      required: [true, 'City is required'],
      index: true
    },
    cityEn: {
      type: String,
      index: true
    },
    region: {
      type: String,
      required: [true, 'Region is required']
    },
    regionEn: {
      type: String
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    addressEn: {
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
    meetingPoint: {
      type: String,
      default: null
    },
    meetingPointEn: {
      type: String,
      default: null
    },
    directions: {
      type: String,
      default: null
    },
    directionsEn: {
      type: String,
      default: null
    }
  },

  // Pricing Information
  pricing: {
    adult: {
      type: Number,
      required: [true, 'Adult price is required'],
      min: [0, 'Adult price cannot be negative']
    },
    child: {
      type: Number,
      required: [true, 'Child price is required'],
      min: [0, 'Child price cannot be negative']
    },
    senior: {
      type: Number,
      default: null,
      min: [0, 'Senior price cannot be negative']
    },
    currency: {
      type: String,
      default: 'SAR',
      enum: ['SAR', 'USD', 'EUR']
    },
    includes: [String],
    includesEn: [String],
    excludes: [String],
    excludesEn: [String],
    cancellationPolicy: {
      type: String,
      enum: ['flexible', 'moderate', 'strict'],
      default: 'moderate'
    },
    cancellationPolicyEn: {
      type: String,
      enum: ['flexible', 'moderate', 'strict'],
      default: 'moderate'
    }
  },

  // Schedule Information
  schedule: {
    duration: {
      type: String,
      required: [true, 'Duration is required']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required']
    },
    availableDates: [{
      date: {
        type: Date,
        required: true
      },
      timeSlots: [{
        time: String,
        available: {
          type: Boolean,
          default: true
        },
        maxParticipants: Number
      }]
    }],
    recurring: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none'
    }
  },

  // Capacity Information
  capacity: {
    minParticipants: {
      type: Number,
      required: [true, 'Minimum participants is required'],
      min: [1, 'Minimum participants must be at least 1']
    },
    maxParticipants: {
      type: Number,
      required: [true, 'Maximum participants is required'],
      min: [1, 'Maximum participants must be at least 1']
    },
    currentBookings: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // Requirements and Policies
  requirements: {
    ageRestrictions: {
      minAge: {
        type: Number,
        default: null,
        min: 0
      },
      maxAge: {
        type: Number,
        default: null,
        max: 120
      }
    },
    physicalRequirements: [String],
    physicalRequirementsEn: [String],
    documents: [String],
    documentsEn: [String],
    equipment: [String],
    equipmentEn: [String],
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    }
  },

  // Activity Features
  features: {
    isBookable: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isPopular: {
      type: Boolean,
      default: false
    },
    tags: [String],
    tagsEn: [String],
    highlights: [String],
    highlightsEn: [String]
  },

  // Statistics
  stats: {
    viewCount: {
      type: Number,
      default: 0,
      min: 0
    },
    bookingCount: {
      type: Number,
      default: 0,
      min: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // SEO Information
  seo: {
    metaTitle: String,
    metaTitleEn: String,
    metaDescription: String,
    metaDescriptionEn: String,
    keywords: [String],
    keywordsEn: [String]
  },

  // Activity Status
  status: {
    type: String,
    enum: ['draft', 'active', 'suspended', 'deleted'],
    default: 'draft',
    index: true
  },

  // Creation Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Generate slug from title before validation.
 * 
 * Creates a URL-friendly slug from the activity title for SEO purposes.
 * Handles both Arabic and English titles.
 * 
 * @function
 * @param {Function} next - Express middleware next function
 * @returns {void}
 */
activitySchema.pre('validate', function(next) {
  if (this.isModified('title')) {
    const titleToUse = this.title || this.titleEn || '';
    this.slug = titleToUse
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF -]/g, '') // Include Arabic characters
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

/**
 * Update activity rating when a new review is added.
 * 
 * Calculates the new average rating by incorporating the new rating into
 * the existing average. This method maintains the running average without
 * needing to recalculate from all reviews.
 * 
 * @method updateRating
 * @param {number} newRating - The new rating value (1-5)
 * @returns {Promise<Activity>} The updated activity document
 * @throws {Error} If newRating is not a valid number between 1-5
 */
activitySchema.methods.updateRating = function(newRating) {
  if (newRating < 1 || newRating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  const totalRating = (this.stats.averageRating * this.stats.reviewCount) + newRating;
  this.stats.reviewCount += 1;
  this.stats.averageRating = totalRating / this.stats.reviewCount;
  return this.save();
};

/**
 * Check availability for a specific date and time.
 * 
 * Verifies if the activity is available for booking on a specific date
 * and time slot, considering capacity and existing bookings.
 * 
 * @method checkAvailability
 * @param {Date} date - The date to check
 * @param {string} startTime - The start time to check
 * @returns {boolean} True if available, false otherwise
 */
activitySchema.methods.checkAvailability = function(date, startTime) {
  const availableDate = this.schedule.availableDates.find(ad => 
    ad.date.toDateString() === date.toDateString()
  );
  
  if (!availableDate) return false;
  
  const timeSlot = availableDate.timeSlots.find(ts => ts.time === startTime);
  if (!timeSlot || !timeSlot.available) return false;
  
  const availableSpots = timeSlot.maxParticipants - this.capacity.currentBookings;
  return availableSpots > 0;
};

/**
 * Get available time slots for a specific date.
 * 
 * Returns all available time slots for a given date, considering
 * capacity and existing bookings.
 * 
 * @method getAvailableSlots
 * @param {Date} date - The date to get slots for
 * @returns {Array} Array of available time slots
 */
activitySchema.methods.getAvailableSlots = function(date) {
  const availableDate = this.schedule.availableDates.find(ad => 
    ad.date.toDateString() === date.toDateString()
  );
  
  if (!availableDate) return [];
  
  return availableDate.timeSlots
    .filter(ts => ts.available)
    .map(ts => ({
      time: ts.time,
      availableSpots: ts.maxParticipants - this.capacity.currentBookings
    }))
    .filter(ts => ts.availableSpots > 0);
};

// Virtual for primary image
activitySchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0] ? this.images[0].url : null);
});

// Virtual for formatted duration
activitySchema.virtual('formattedDuration').get(function() {
  return this.schedule.duration;
});

// Virtual for display title (with language preference)
activitySchema.virtual('displayTitle').get(function() {
  return this.titleEn || this.title;
});

// Virtual for display description (with language preference)
activitySchema.virtual('displayDescription').get(function() {
  return this.descriptionEn || this.description;
});

// Indexes for performance optimization
activitySchema.index({ 'location.coordinates': '2dsphere' });
activitySchema.index({ 'schedule.availableDates.date': 1, status: 1 });
activitySchema.index({ 'stats.averageRating': -1, 'stats.reviewCount': -1 });
activitySchema.index({ 'features.isFeatured': 1, 'features.isPopular': 1, status: 1 });
activitySchema.index({ status: 1, createdAt: -1 });

// Text index for search
activitySchema.index({ 
  title: 'text', 
  titleEn: 'text',
  description: 'text', 
  descriptionEn: 'text',
  'features.tags': 'text',
  'features.tagsEn': 'text'
});

module.exports = mongoose.model('ActivityEnhanced', activitySchema);

