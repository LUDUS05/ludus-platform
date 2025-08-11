import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  tags: string[];
  
  // Vendor Information
  vendor: {
    vendorId: mongoose.Types.ObjectId;
    name: string;
    verified: boolean;
  };
  
  // Pricing and Availability
  pricing: {
    basePrice: number;
    currency: string;
    priceType: 'per-person' | 'per-group' | 'per-hour' | 'per-day' | 'fixed';
    discounts?: {
      groupSize: number;
      discountPercentage: number;
    }[];
    seasonalPricing?: {
      startDate: Date;
      endDate: Date;
      price: number;
    }[];
  };
  
  // Duration and Scheduling
  duration: {
    minDuration: number; // in minutes
    maxDuration?: number; // in minutes
    setupTime?: number; // in minutes
    cleanupTime?: number; // in minutes
  };
  
  // Location and Requirements
  location: {
    type: 'on-site' | 'off-site' | 'virtual' | 'mobile';
    coordinates?: [number, number]; // [longitude, latitude]
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    travelRadius?: number; // in miles, for mobile services
  };
  
  // Capacity and Requirements
  capacity: {
    minParticipants: number;
    maxParticipants: number;
    minAge?: number;
    maxAge?: number;
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
    physicalRequirements?: string[];
    equipmentProvided: boolean;
    equipmentRequired?: string[];
  };
  
  // Images and Media
  images: {
    featured: string;
    gallery: string[];
    videos?: string[];
  };
  
  // Availability and Booking
  availability: {
    isActive: boolean;
    availableDays: string[]; // ['monday', 'tuesday', etc.]
    availableTimes: {
      startTime: string; // HH:MM format
      endTime: string;   // HH:MM format
    };
    advanceBookingDays: number; // how many days in advance to book
    lastMinuteBooking: boolean;
    cancellationPolicy: 'flexible' | 'moderate' | 'strict';
    cancellationHours: number; // hours before activity to cancel
  };
  
  // Additional Information
  highlights: string[];
  included: string[];
  notIncluded: string[];
  whatToBring?: string[];
  weatherDependent: boolean;
  indoorOutdoor: 'indoor' | 'outdoor' | 'both';
  
  // Status and Moderation
  status: 'draft' | 'active' | 'inactive' | 'moderated';
  isFeatured: boolean;
  featuredUntil?: Date;
  moderationNotes?: string;
  
  // Statistics
  stats: {
    viewCount: number;
    bookingCount: number;
    averageRating: number;
    reviewCount: number;
    favoriteCount: number;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // Methods
  toJSON(): any;
}

const activitySchema = new Schema<IActivity>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'outdoor-adventure',
      'indoor-activities',
      'water-sports',
      'team-sports',
      'cultural-experiences',
      'food-tours',
      'wellness-spa',
      'entertainment',
      'educational',
      'fitness',
      'other'
    ]
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  vendor: {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    verified: {
      type: Boolean,
      required: true
    }
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    },
    priceType: {
      type: String,
      required: true,
      enum: ['per-person', 'per-group', 'per-hour', 'per-day', 'fixed']
    },
    discounts: [{
      groupSize: {
        type: Number,
        required: true,
        min: [2, 'Group size must be at least 2']
      },
      discountPercentage: {
        type: Number,
        required: true,
        min: [1, 'Discount must be at least 1%'],
        max: [100, 'Discount cannot exceed 100%']
      }
    }],
    seasonalPricing: [{
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        required: true
      },
      price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
      }
    }]
  },
  duration: {
    minDuration: {
      type: Number,
      required: true,
      min: [15, 'Minimum duration must be at least 15 minutes']
    },
    maxDuration: {
      type: Number,
      min: [15, 'Maximum duration must be at least 15 minutes']
    },
    setupTime: {
      type: Number,
      min: [0, 'Setup time cannot be negative']
    },
    cleanupTime: {
      type: Number,
      min: [0, 'Cleanup time cannot be negative']
    }
  },
  location: {
    type: {
      type: String,
      required: true,
      enum: ['on-site', 'off-site', 'virtual', 'mobile']
    },
    coordinates: {
      type: [Number],
      validate: {
        validator: function(value: number[]) {
          if (!value || value.length === 0) return true; // Optional for virtual activities
          return value.length === 2 && 
                 value[0] >= -180 && value[0] <= 180 && // longitude
                 value[1] >= -90 && value[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates'
      }
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'United States'
    },
    travelRadius: {
      type: Number,
      min: [1, 'Travel radius must be at least 1 mile'],
      max: [100, 'Travel radius cannot exceed 100 miles']
    }
  },
  capacity: {
    minParticipants: {
      type: Number,
      required: true,
      min: [1, 'Minimum participants must be at least 1']
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: [1, 'Maximum participants must be at least 1']
    },
    minAge: {
      type: Number,
      min: [0, 'Minimum age cannot be negative']
    },
    maxAge: {
      type: Number,
      min: [0, 'Maximum age cannot be negative']
    },
    skillLevel: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced', 'all-levels']
    },
    physicalRequirements: [{
      type: String,
      trim: true
    }],
    equipmentProvided: {
      type: Boolean,
      required: true
    },
    equipmentRequired: [{
      type: String,
      trim: true
    }]
  },
  images: {
    featured: {
      type: String,
      required: true,
      trim: true
    },
    gallery: [{
      type: String,
      trim: true
    }],
    videos: [{
      type: String,
      trim: true
    }]
  },
  availability: {
    isActive: {
      type: Boolean,
      default: true
    },
    availableDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    availableTimes: {
      startTime: {
        type: String,
        required: true,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
      },
      endTime: {
        type: String,
        required: true,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
      }
    },
    advanceBookingDays: {
      type: Number,
      required: true,
      min: [0, 'Advance booking days cannot be negative'],
      default: 7
    },
    lastMinuteBooking: {
      type: Boolean,
      default: false
    },
    cancellationPolicy: {
      type: String,
      required: true,
      enum: ['flexible', 'moderate', 'strict'],
      default: 'moderate'
    },
    cancellationHours: {
      type: Number,
      required: true,
      min: [0, 'Cancellation hours cannot be negative'],
      default: 24
    }
  },
  highlights: [{
    type: String,
    trim: true,
    maxlength: [100, 'Highlight cannot exceed 100 characters']
  }],
  included: [{
    type: String,
    trim: true,
    maxlength: [100, 'Included item cannot exceed 100 characters']
  }],
  notIncluded: [{
    type: String,
    trim: true,
    maxlength: [100, 'Not included item cannot exceed 100 characters']
  }],
  whatToBring: [{
    type: String,
    trim: true,
    maxlength: [100, 'Item cannot exceed 100 characters']
  }],
  weatherDependent: {
    type: Boolean,
    default: false
  },
  indoorOutdoor: {
    type: String,
    required: true,
    enum: ['indoor', 'outdoor', 'both']
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'moderated'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredUntil: {
    type: Date
  },
  moderationNotes: {
    type: String,
    trim: true
  },
  stats: {
    viewCount: {
      type: Number,
      default: 0,
      min: [0, 'View count cannot be negative']
    },
    bookingCount: {
      type: Number,
      default: 0,
      min: [0, 'Booking count cannot be negative']
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative']
    },
    favoriteCount: {
      type: Number,
      default: 0,
      min: [0, 'Favorite count cannot be negative']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full location
activitySchema.virtual('fullLocation').get(function(this: any) {
  if (this.location.type === 'virtual') return 'Virtual Activity';
  if (this.location.type === 'mobile') return `Mobile Service (${this.location.travelRadius} mile radius)`;
  if (this.location.address) {
    return `${this.location.address}, ${this.location.city}, ${this.location.state} ${this.location.zipCode}`;
  }
  return 'Location TBD';
});

// Virtual for price range
activitySchema.virtual('priceRange').get(function(this: any) {
  const basePrice = this.pricing.basePrice;
  const currency = this.pricing.currency;
  
  if (this.pricing.seasonalPricing && this.pricing.seasonalPricing.length > 0) {
    const prices = [basePrice, ...this.pricing.seasonalPricing.map((sp: any) => sp.price)];
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return minPrice === maxPrice ? 
      `${currency}${minPrice}` : 
      `${currency}${minPrice} - ${currency}${maxPrice}`;
  }
  
  return `${currency}${basePrice}`;
});

// Virtual for total duration
activitySchema.virtual('totalDuration').get(function(this: any) {
  let total = this.duration.minDuration;
  if (this.duration.setupTime) total += this.duration.setupTime;
  if (this.duration.cleanupTime) total += this.duration.cleanupTime;
  return total;
});

// Indexes
activitySchema.index({ title: 'text', description: 'text', tags: 'text' });
activitySchema.index({ category: 1 });
activitySchema.index({ 'vendor.vendorId': 1 });
activitySchema.index({ 'location.coordinates': '2dsphere' });
activitySchema.index({ status: 1 });
activitySchema.index({ isFeatured: 1 });
activitySchema.index({ 'pricing.basePrice': 1 });
activitySchema.index({ 'capacity.skillLevel': 1 });
activitySchema.index({ 'availability.isActive': 1 });
activitySchema.index({ createdAt: -1 });
activitySchema.index({ 'stats.averageRating': -1 });
activitySchema.index({ 'stats.bookingCount': -1 });

// Text search index
activitySchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  'vendor.name': 'text'
});

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);
