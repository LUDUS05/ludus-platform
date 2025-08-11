import mongoose, { Document, Schema } from 'mongoose';

export interface IVendor extends Document {
  name: string;
  description: string;
  businessType: string;
  category: string;
  
  // Contact Information
  contact: {
    email: string;
    phone: string;
    website?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
    };
  };
  
  // Location and Address
  location: {
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Business Details
  businessHours: {
    monday?: { open: string; close: string; closed: boolean };
    tuesday?: { open: string; close: string; closed: boolean };
    wednesday?: { open: string; close: string; closed: boolean };
    thursday?: { open: string; close: string; closed: boolean };
    friday?: { open: string; close: string; closed: boolean };
    saturday?: { open: string; close: string; closed: boolean };
    sunday?: { open: string; close: string; closed: boolean };
  };
  
  // Images and Media
  images: {
    logo?: string;
    banner?: string;
    gallery: string[];
  };
  
  // Business Information
  foundedYear?: number;
  employeeCount?: number;
  certifications: string[];
  insurance: {
    hasInsurance: boolean;
    provider?: string;
    policyNumber?: string;
    expiryDate?: Date;
  };
  
  // Verification and Status
  isVerified: boolean;
  isActive: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationNotes?: string;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  
  // Owner Information
  owner: {
    userId: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  toJSON(): any;
}

const vendorSchema = new Schema<IVendor>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  businessType: {
    type: String,
    required: true,
    enum: [
      'sole-proprietorship',
      'partnership',
      'corporation',
      'llc',
      'nonprofit',
      'other'
    ]
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
  contact: {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
    },
    socialMedia: {
      facebook: {
        type: String,
        trim: true
      },
      instagram: {
        type: String,
        trim: true
      },
      twitter: {
        type: String,
        trim: true
      },
      linkedin: {
        type: String,
        trim: true
      }
    }
  },
  location: {
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(value: number[]) {
          return value.length === 2 && 
                 value[0] >= -180 && value[0] <= 180 && // longitude
                 value[1] >= -90 && value[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates'
      }
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'United States'
    }
  },
  businessHours: {
    monday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    tuesday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    wednesday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    thursday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    friday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    saturday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    sunday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    }
  },
  images: {
    logo: {
      type: String,
      trim: true
    },
    banner: {
      type: String,
      trim: true
    },
    gallery: [{
      type: String,
      trim: true
    }]
  },
  foundedYear: {
    type: Number,
    min: [1800, 'Founded year must be after 1800'],
    max: [new Date().getFullYear(), 'Founded year cannot be in the future']
  },
  employeeCount: {
    type: Number,
    min: [1, 'Employee count must be at least 1']
  },
  certifications: [{
    type: String,
    trim: true
  }],
  insurance: {
    hasInsurance: {
      type: Boolean,
      required: true
    },
    provider: {
      type: String,
      trim: true
    },
    policyNumber: {
      type: String,
      trim: true
    },
    expiryDate: {
      type: Date
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationNotes: {
    type: String,
    trim: true
  },
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  owner: {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address
vendorSchema.virtual('fullAddress').get(function(this: IVendor) {
  return `${this.location.address}, ${this.location.city}, ${this.location.state} ${this.location.zipCode}, ${this.location.country}`;
});

// Virtual for business hours summary
vendorSchema.virtual('businessHoursSummary').get(function(this: IVendor) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const openDays = days.filter(day => this.businessHours[day as keyof typeof this.businessHours] && !this.businessHours[day as keyof typeof this.businessHours]?.closed);
  return openDays.length > 0 ? `${openDays.length} days open` : 'Closed';
});

// Indexes
vendorSchema.index({ name: 1 });
vendorSchema.index({ category: 1 });
vendorSchema.index({ 'location.coordinates': '2dsphere' });
vendorSchema.index({ isVerified: 1 });
vendorSchema.index({ isActive: 1 });
vendorSchema.index({ verificationStatus: 1 });
vendorSchema.index({ 'owner.userId': 1 });
vendorSchema.index({ createdAt: -1 });

// Method to return vendor without sensitive data
vendorSchema.methods.toJSON = function() {
  const vendor = this.toObject();
  delete vendor.insurance.policyNumber;
  return vendor;
};

export const Vendor = mongoose.model<IVendor>('Vendor', vendorSchema);
