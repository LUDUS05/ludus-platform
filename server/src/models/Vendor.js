const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  businessName: {
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
    maxlength: 1000
  },
  contactInfo: {
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
    },
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      tiktok: String
    }
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere'
    }
  },
  images: {
    logo: String, // Cloudinary URL
    banner: String, // Cloudinary URL
    gallery: [String] // Array of Cloudinary URLs
  },
  businessHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    isOpen: {
      type: Boolean,
      default: true
    },
    openTime: String, // Format: "09:00"
    closeTime: String // Format: "17:00"
  }],
  categories: [{
    type: String,
    enum: ['fitness', 'arts', 'food', 'outdoor', 'unique', 'wellness'],
    required: true
  }],
  credentials: {
    licenses: [String],
    certifications: [String],
    insurance: {
      provider: String,
      policyNumber: String,
      expiryDate: Date
    }
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
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  paymentMethods: [{
    type: String,
    enum: ['card', 'cash', 'paypal', 'venmo']
  }],
  policies: {
    cancellation: {
      type: String,
      maxlength: 500
    },
    refund: {
      type: String,
      maxlength: 500
    },
    groupSize: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 20 }
    }
  },
  bankingInfo: {
    moyasarAccountId: String, // Vendor's Moyasar account for payouts
    accountStatus: {
      type: String,
      enum: ['pending', 'verified', 'active'],
      default: 'pending'
    }
  },
  // Enhanced Bank Information
  bankInfo: {
    bankName: {
      type: String,
      required: false
    },
    accountHolderName: {
      type: String,
      required: false
    },
    iban: {
      type: String,
      required: false,
      validate: {
        validator: function(v) {
          return !v || /^SA[0-9]{22}$/.test(v);
        },
        message: 'IBAN must be in format SA followed by 22 digits'
      }
    },
    accountNumber: {
      type: String,
      required: false
    },
    swiftCode: {
      type: String,
      required: false
    }
  },
  // Document Management System
  documents: {
    commercialRegistration: {
      fileName: String,
      fileUrl: String,
      uploadDate: Date,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      }
    },
    nationalId: {
      fileName: String,
      fileUrl: String,
      uploadDate: Date,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      }
    },
    bankCertificate: {
      fileName: String,
      fileUrl: String,
      uploadDate: Date,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      }
    },
    businessLicense: {
      fileName: String,
      fileUrl: String,
      uploadDate: Date,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      }
    },
    other: [{
      fileName: String,
      fileUrl: String,
      uploadDate: Date,
      documentType: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      }
    }]
  },
  // Status History Logging
  statusHistory: [{
    status: {
      type: String,
      enum: ['active', 'inactive'],
      required: true
    },
    note: {
      type: String,
      maxlength: 500
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    admin: {
      type: String,
      required: true
    }
  }],
  statistics: {
    totalBookings: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageBookingValue: { type: Number, default: 0 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Generate slug from business name
vendorSchema.pre('save', function(next) {
  if (this.isModified('businessName')) {
    this.slug = this.businessName
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Update rating when new reviews are added
vendorSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating.average * this.rating.count) + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

// Get business hours for a specific day
vendorSchema.methods.getBusinessHours = function(day) {
  return this.businessHours.find(hours => hours.day === day.toLowerCase());
};

// Check if business is open now
vendorSchema.methods.isOpenNow = function() {
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const hours = this.getBusinessHours(day);
  if (!hours || !hours.isOpen) return false;
  
  return currentTime >= hours.openTime && currentTime <= hours.closeTime;
};

module.exports = mongoose.model('Vendor', vendorSchema);