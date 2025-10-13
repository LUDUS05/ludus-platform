/**
 * @fileoverview Enhanced Partner model for LUDUS platform - LDS-006 Implementation
 * 
 * This model defines the comprehensive partner schema for the LUDUS social activity platform
 * based on the detailed database design specification. It includes partner management,
 * business information, verification, location, and statistics with cultural sensitivity
 * for the Saudi Arabian market.
 * 
 * Key Features:
 * - Comprehensive business information and metadata
 * - Arabic/English bilingual support
 * - Business verification and document management
 * - Location management with geospatial support
 * - Statistics and analytics tracking
 * - Working hours and availability management
 * - Profile and gallery management
 * - Settings and preferences
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  // Business Information
  businessInfo: {
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [100, 'Business name cannot exceed 100 characters']
    },
    nameEn: {
      type: String,
      trim: true,
      maxlength: [100, 'English business name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Business description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    descriptionEn: {
      type: String,
      maxlength: [1000, 'English description cannot exceed 1000 characters']
    },
    businessType: {
      type: String,
      enum: ['individual', 'company', 'ngo'],
      required: [true, 'Business type is required']
    },
    registrationNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    taxNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    licenseNumber: {
      type: String,
      default: null
    }
  },

  // Contact Information
  contact: {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\+966[0-9]{9}$/, 'Please enter a valid Saudi phone number (+966XXXXXXXXX)']
    },
    website: {
      type: String,
      default: null
    },
    socialMedia: {
      instagram: {
        type: String,
        default: null
      },
      twitter: {
        type: String,
        default: null
      },
      facebook: {
        type: String,
        default: null
      },
      linkedin: {
        type: String,
        default: null
      }
    }
  },

  // Location Information
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
    }
  },

  // Profile Information
  profile: {
    avatar: {
      type: String,
      default: null
    },
    coverImage: {
      type: String,
      default: null
    },
    gallery: [{
      url: {
        type: String,
        required: true
      },
      caption: {
        type: String,
        maxlength: [200, 'Gallery caption cannot exceed 200 characters']
      },
      captionEn: {
        type: String,
        maxlength: [200, 'English gallery caption cannot exceed 200 characters']
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },

  // Verification Information
  verification: {
    isVerified: {
      type: Boolean,
      default: false,
      index: true
    },
    verificationLevel: {
      type: String,
      enum: ['pending', 'basic', 'verified', 'premium'],
      default: 'pending',
      index: true
    },
    documents: [{
      type: {
        type: String,
        enum: ['license', 'registration', 'tax_certificate', 'insurance', 'bank_statement'],
        required: true
      },
      url: {
        type: String,
        required: true
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reviewedAt: {
        type: Date
      },
      notes: {
        type: String,
        maxlength: [500, 'Document review notes cannot exceed 500 characters']
      }
    }]
  },

  // Statistics
  stats: {
    totalActivities: {
      type: Number,
      default: 0,
      min: 0
    },
    totalBookings: {
      type: Number,
      default: 0,
      min: 0
    },
    totalRevenue: {
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
    memberSince: {
      type: Date,
      default: Date.now
    }
  },

  // Settings
  settings: {
    autoAcceptBookings: {
      type: Boolean,
      default: false
    },
    notificationPreferences: {
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
      }
    },
    workingHours: {
      sunday: {
        start: String,
        end: String,
        isOpen: {
          type: Boolean,
          default: false
        }
      },
      monday: {
        start: String,
        end: String,
        isOpen: {
          type: Boolean,
          default: true
        }
      },
      tuesday: {
        start: String,
        end: String,
        isOpen: {
          type: Boolean,
          default: true
        }
      },
      wednesday: {
        start: String,
        end: String,
        isOpen: {
          type: Boolean,
          default: true
        }
      },
      thursday: {
        start: String,
        end: String,
        isOpen: {
          type: Boolean,
          default: true
        }
      },
      friday: {
        start: String,
        end: String,
        isOpen: {
          type: Boolean,
          default: false
        }
      },
      saturday: {
        start: String,
        end: String,
        isOpen: {
          type: Boolean,
          default: true
        }
      }
    }
  },

  // Partner Status
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending_verification', 'deleted'],
    default: 'pending_verification',
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
 * Update verification status based on document approval.
 * 
 * Updates the verification status based on the approval status
 * of required documents.
 * 
 * @method updateVerificationStatus
 * @returns {Promise<Partner>} The updated partner document
 */
partnerSchema.methods.updateVerificationStatus = function() {
  const requiredDocs = ['license', 'registration', 'tax_certificate'];
  const approvedDocs = this.verification.documents.filter(doc => 
    requiredDocs.includes(doc.type) && doc.status === 'approved'
  );
  
  if (approvedDocs.length === requiredDocs.length) {
    this.verification.isVerified = true;
    this.verification.verificationLevel = 'verified';
    this.status = 'active';
  } else if (approvedDocs.length > 0) {
    this.verification.verificationLevel = 'basic';
  } else {
    this.verification.verificationLevel = 'pending';
  }
  
  return this.save();
};

/**
 * Add document to verification process.
 * 
 * Adds a new document to the verification process with
 * pending status for review.
 * 
 * @method addDocument
 * @param {string} type - Document type
 * @param {string} url - Document URL
 * @returns {Promise<Partner>} The updated partner document
 */
partnerSchema.methods.addDocument = function(type, url) {
  this.verification.documents.push({
    type: type,
    url: url,
    uploadedAt: new Date(),
    status: 'pending'
  });
  return this.save();
};

/**
 * Update document status.
 * 
 * Updates the status of a specific document in the verification process.
 * 
 * @method updateDocumentStatus
 * @param {string} documentId - Document ID to update
 * @param {string} status - New status
 * @param {string} reviewerId - Reviewer user ID
 * @param {string} notes - Review notes
 * @returns {Promise<Partner>} The updated partner document
 */
partnerSchema.methods.updateDocumentStatus = function(documentId, status, reviewerId, notes = '') {
  const document = this.verification.documents.id(documentId);
  if (document) {
    document.status = status;
    document.reviewedBy = reviewerId;
    document.reviewedAt = new Date();
    document.notes = notes;
    return this.save();
  }
  return Promise.resolve(this);
};

/**
 * Check if partner is open at specific time.
 * 
 * Checks if the partner is open for business at a specific
 * day and time based on working hours.
 * 
 * @method isOpenAt
 * @param {Date} date - Date to check
 * @param {string} time - Time to check (HH:MM format)
 * @returns {boolean} True if open, false otherwise
 */
partnerSchema.methods.isOpenAt = function(date, time) {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const daySettings = this.settings.workingHours[dayOfWeek];
  
  if (!daySettings || !daySettings.isOpen) {
    return false;
  }
  
  const startTime = daySettings.start;
  const endTime = daySettings.end;
  
  return time >= startTime && time <= endTime;
};

// Virtual for display business name
partnerSchema.virtual('displayBusinessName').get(function() {
  return this.businessInfo.nameEn || this.businessInfo.name;
});

// Virtual for display description
partnerSchema.virtual('displayDescription').get(function() {
  return this.businessInfo.descriptionEn || this.businessInfo.description;
});

// Virtual for display city
partnerSchema.virtual('displayCity').get(function() {
  return this.location.cityEn || this.location.city;
});

// Virtual for display address
partnerSchema.virtual('displayAddress').get(function() {
  return this.location.addressEn || this.location.address;
});

// Virtual for is verified
partnerSchema.virtual('isVerifiedPartner').get(function() {
  return this.verification.isVerified;
});

// Virtual for verification level
partnerSchema.virtual('verificationLevelDisplay').get(function() {
  return this.verification.verificationLevel;
});

// Indexes for performance optimization
partnerSchema.index({ 'location.city': 1, 'verification.isVerified': 1 });
partnerSchema.index({ 'stats.averageRating': -1, 'stats.reviewCount': -1 });
partnerSchema.index({ 'location.coordinates': '2dsphere' });
partnerSchema.index({ status: 1, 'verification.verificationLevel': 1 });

// Text index for search
partnerSchema.index({ 
  'businessInfo.name': 'text', 
  'businessInfo.nameEn': 'text',
  'businessInfo.description': 'text',
  'businessInfo.descriptionEn': 'text'
});

module.exports = mongoose.model('PartnerEnhanced', partnerSchema);

