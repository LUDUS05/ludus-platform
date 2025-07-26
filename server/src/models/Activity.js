const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: 300
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['fitness', 'arts', 'food', 'outdoor', 'unique', 'wellness']
  },
  subcategory: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  images: [{
    url: String, // Cloudinary URL
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  videos: [{
    url: String, // Cloudinary URL
    thumbnail: String,
    duration: Number // in seconds
  }],
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'SAR', // Default to Saudi Riyal
      enum: ['SAR']
    },
    priceType: {
      type: String,
      enum: ['per_person', 'per_group', 'per_hour'],
      default: 'per_person'
    },
    groupDiscounts: [{
      minParticipants: Number,
      discountPercent: Number
    }]
  },
  duration: {
    hours: { type: Number, min: 0 },
    minutes: { type: Number, min: 0, max: 59 }
  },
  capacity: {
    min: {
      type: Number,
      default: 1,
      min: 1
    },
    max: {
      type: Number,
      required: true,
      min: 1
    }
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all_levels'],
    default: 'beginner'
  },
  ageRequirements: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 120 },
    notes: String
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    isOnline: { type: Boolean, default: false },
    meetingLink: String
  },
  schedule: {
    type: {
      type: String,
      enum: ['fixed', 'flexible', 'recurring'],
      default: 'flexible'
    },
    fixedSlots: [{
      date: Date,
      startTime: String, // HH:MM format
      endTime: String,
      availableSpots: Number,
      bookedSpots: { type: Number, default: 0 }
    }],
    availability: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      slots: [{
        startTime: String,
        endTime: String,
        maxBookings: Number
      }]
    }],
    blackoutDates: [Date],
    advanceBooking: {
      min: { type: Number, default: 24 }, // hours
      max: { type: Number, default: 2160 } // hours (90 days)
    }
  },
  requirements: {
    equipment: [String],
    clothing: [String],
    skills: [String],
    physicalRequirements: String,
    whatToBring: [String],
    whatIsProvided: [String]
  },
  policies: {
    cancellation: {
      type: String,
      maxlength: 500
    },
    refund: {
      type: String,
      maxlength: 500
    },
    lateCancellationFee: Number,
    noShowFee: Number
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  statistics: {
    totalBookings: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageGroupSize: { type: Number, default: 0 },
    repeatCustomers: { type: Number, default: 0 }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPromoted: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Generate slug from title
activitySchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Update rating when new review is added
activitySchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating.average * this.rating.count) + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

// Get primary image
activitySchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0] ? this.images[0].url : null);
});

// Get formatted duration
activitySchema.virtual('formattedDuration').get(function() {
  if (this.duration.hours && this.duration.minutes) {
    return `${this.duration.hours}h ${this.duration.minutes}m`;
  } else if (this.duration.hours) {
    return `${this.duration.hours}h`;
  } else if (this.duration.minutes) {
    return `${this.duration.minutes}m`;
  }
  return 'Duration not specified';
});

// Check availability for a specific date and time
activitySchema.methods.checkAvailability = function(date, startTime) {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // Check if date is in blackout dates
  if (this.schedule.blackoutDates.some(blackout => 
    blackout.toDateString() === date.toDateString()
  )) {
    return false;
  }
  
  // Check availability based on schedule type
  if (this.schedule.type === 'fixed') {
    return this.schedule.fixedSlots.some(slot => 
      slot.date.toDateString() === date.toDateString() &&
      slot.startTime === startTime &&
      slot.availableSpots > slot.bookedSpots
    );
  } else if (this.schedule.type === 'flexible' || this.schedule.type === 'recurring') {
    const dayAvailability = this.schedule.availability.find(avail => avail.day === dayOfWeek);
    return dayAvailability && dayAvailability.slots.some(slot => 
      slot.startTime === startTime
    );
  }
  
  return false;
};

// Get available time slots for a date
activitySchema.methods.getAvailableSlots = function(date) {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // Check if date is in blackout dates
  if (this.schedule.blackoutDates.some(blackout => 
    blackout.toDateString() === date.toDateString()
  )) {
    return [];
  }
  
  if (this.schedule.type === 'fixed') {
    return this.schedule.fixedSlots
      .filter(slot => 
        slot.date.toDateString() === date.toDateString() &&
        slot.availableSpots > slot.bookedSpots
      )
      .map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        availableSpots: slot.availableSpots - slot.bookedSpots
      }));
  } else if (this.schedule.type === 'flexible' || this.schedule.type === 'recurring') {
    const dayAvailability = this.schedule.availability.find(avail => avail.day === dayOfWeek);
    return dayAvailability ? dayAvailability.slots : [];
  }
  
  return [];
};

module.exports = mongoose.model('Activity', activitySchema);