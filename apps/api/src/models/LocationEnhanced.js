/**
 * @fileoverview Enhanced Location model for LUDUS platform - LDS-006 Implementation
 *
 * This model defines the comprehensive location schema for the LUDUS social activity platform
 * based on the detailed database design specification. It includes location management,
 * hierarchical structure, geospatial support, and activity counting with cultural
 * sensitivity for the Saudi Arabian market.
 *
 * Key Features:
 * - Hierarchical location structure (country, region, city, landmark)
 * - Arabic/English bilingual support
 * - Geospatial coordinates and mapping
 * - Activity counting and statistics
 * - Timezone support
 * - Active/inactive status management
 * - Search and filtering capabilities
 *
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true,
    maxlength: [100, 'Location name cannot exceed 100 characters']
  },
  nameEn: {
    type: String,
    required: [true, 'English location name is required'],
    trim: true,
    maxlength: [100, 'English location name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  descriptionEn: {
    type: String,
    maxlength: [500, 'English description cannot exceed 500 characters']
  },

  // Location Type and Hierarchy
  type: {
    type: String,
    enum: ['country', 'region', 'city', 'landmark', 'district', 'neighborhood'],
    required: [true, 'Location type is required'],
    index: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    default: null,
    index: true
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  }],
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  path: {
    type: String,
    default: ''
  },

  // Geospatial Information
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
  bounds: {
    northeast: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number] // [longitude, latitude]
      }
    },
    southwest: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number] // [longitude, latitude]
      }
    }
  },

  // Timezone and Regional Information
  timezone: {
    type: String,
    default: 'Asia/Riyadh'
  },
  country: {
    type: String,
    default: 'Saudi Arabia'
  },
  countryCode: {
    type: String,
    default: 'SA'
  },
  region: {
    type: String
  },
  regionEn: {
    type: String
  },

  // Statistics
  activityCount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalActivityCount: {
    type: Number,
    default: 0,
    min: 0
  },
  userCount: {
    type: Number,
    default: 0,
    min: 0
  },
  partnerCount: {
    type: Number,
    default: 0,
    min: 0
  },

  // Status and Ordering
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  sortOrder: {
    type: Number,
    default: 0,
    index: true
  },

  // Additional Information
  population: {
    type: Number,
    min: 0
  },
  area: {
    type: Number,
    min: 0
  },
  areaUnit: {
    type: String,
    enum: ['km2', 'm2', 'sq_miles'],
    default: 'km2'
  },

  // SEO Information
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaTitleEn: {
      type: String,
      maxlength: [60, 'English meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    metaDescriptionEn: {
      type: String,
      maxlength: [160, 'English meta description cannot exceed 160 characters']
    },
    keywords: [String],
    keywordsEn: [String]
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
 * Update location path before saving.
 *
 * Updates the location path based on the parent hierarchy
 * for efficient querying and navigation.
 *
 * @function
 * @param {Function} next - Express middleware next function
 * @returns {void}
 */
locationSchema.pre('save', async function(next) {
  if (this.isModified('parent')) {
    if (this.parent) {
      const parentLocation = await this.constructor.findById(this.parent);
      if (parentLocation) {
        this.level = parentLocation.level + 1;
        this.path = parentLocation.path ? `${parentLocation.path}/${this._id}` : this._id.toString();
      }
    } else {
      this.level = 0;
      this.path = this._id.toString();
    }
  }
  next();
});

/**
 * Update parent's children after saving.
 *
 * Updates the parent location's children array when
 * a new location is created or parent is changed.
 *
 * @function
 * @param {Function} next - Express middleware next function
 * @returns {void}
 */
locationSchema.post('save', async function(next) {
  if (this.parent) {
    await this.constructor.findByIdAndUpdate(
      this.parent,
      { $addToSet: { children: this._id } }
    );
  }
  next();
});

/**
 * Remove from parent's children after deletion.
 *
 * Removes the location from its parent's children array
 * when the location is deleted.
 *
 * @function
 * @param {Function} next - Express middleware next function
 * @returns {void}
 */
locationSchema.post('remove', async function(next) {
  if (this.parent) {
    await this.constructor.findByIdAndUpdate(
      this.parent,
      { $pull: { children: this._id } }
    );
  }
  next();
});

/**
 * Get all child locations recursively.
 *
 * Retrieves all child locations at all levels below this location
 * in the hierarchy.
 *
 * @method getAllChildren
 * @returns {Promise<Array>} Array of all child location documents
 */
locationSchema.methods.getAllChildren = async function() {
  const children = await this.constructor.find({
    path: { $regex: `^${this.path}/` }
  }).sort({ sortOrder: 1, name: 1 });

  return children;
};

/**
 * Get direct children only.
 *
 * Retrieves only the direct children (one level down)
 * from this location.
 *
 * @method getDirectChildren
 * @returns {Promise<Array>} Array of direct child location documents
 */
locationSchema.methods.getDirectChildren = async function() {
  const children = await this.constructor.find({
    parent: this._id,
    isActive: true
  }).sort({ sortOrder: 1, name: 1 });

  return children;
};

/**
 * Update activity count.
 *
 * Updates the activity count for this location and all
 * parent locations in the hierarchy.
 *
 * @method updateActivityCount
 * @param {number} change - Change in activity count (positive or negative)
 * @returns {Promise<Location>} The updated location document
 */
locationSchema.methods.updateActivityCount = async function(change) {
  this.activityCount = Math.max(0, this.activityCount + change);
  await this.save();

  // Update parent locations
  if (this.parent) {
    const parentLocation = await this.constructor.findById(this.parent);
    if (parentLocation) {
      await parentLocation.updateActivityCount(change);
    }
  }

  return this;
};

/**
 * Get location breadcrumb.
 *
 * Retrieves the breadcrumb path from root to this location
 * for navigation purposes.
 *
 * @method getBreadcrumb
 * @returns {Promise<Array>} Array of location documents in breadcrumb order
 */
locationSchema.methods.getBreadcrumb = async function() {
  const breadcrumb = [];
  let current = this;

  while (current) {
    breadcrumb.unshift(current);
    if (current.parent) {
      current = await this.constructor.findById(current.parent);
    } else {
      current = null;
    }
  }

  return breadcrumb;
};

/**
 * Check if location has children.
 *
 * Determines if this location has any active child locations.
 *
 * @method hasChildren
 * @returns {Promise<boolean>} True if has children, false otherwise
 */
locationSchema.methods.hasChildren = async function() {
  const count = await this.constructor.countDocuments({
    parent: this._id,
    isActive: true
  });
  return count > 0;
};

/**
 * Find locations within radius.
 *
 * Finds locations within a specified radius of given coordinates.
 *
 * @method findNearby
 * @param {number} longitude - Longitude coordinate
 * @param {number} latitude - Latitude coordinate
 * @param {number} radius - Radius in kilometers
 * @returns {Promise<Array>} Array of nearby location documents
 */
locationSchema.statics.findNearby = function(longitude, latitude, radius) {
  return this.find({
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radius * 1000 // Convert km to meters
      }
    },
    isActive: true
  });
};

// Virtual for display name
locationSchema.virtual('displayName').get(function() {
  return this.nameEn || this.name;
});

// Virtual for display description
locationSchema.virtual('displayDescription').get(function() {
  return this.descriptionEn || this.description;
});

// Virtual for is root location
locationSchema.virtual('isRoot').get(function() {
  return !this.parent;
});

// Virtual for is leaf location
locationSchema.virtual('isLeaf').get(function() {
  return this.children.length === 0;
});

// Virtual for full path
locationSchema.virtual('fullPath').get(function() {
  return this.path;
});

// Virtual for formatted coordinates
locationSchema.virtual('formattedCoordinates').get(function() {
  return `${this.coordinates.coordinates[1]}, ${this.coordinates.coordinates[0]}`;
});

// Indexes for performance optimization
locationSchema.index({ name: 1 });
locationSchema.index({ nameEn: 1 });
locationSchema.index({ parent: 1, isActive: 1 });
locationSchema.index({ level: 1, sortOrder: 1 });
locationSchema.index({ path: 1 });
locationSchema.index({ type: 1, isActive: 1 });
locationSchema.index({ activityCount: -1 });
locationSchema.index({ 'coordinates.coordinates': '2dsphere' });

// Text index for search
locationSchema.index({
  name: 'text',
  nameEn: 'text',
  description: 'text',
  descriptionEn: 'text'
});

module.exports = mongoose.model('LocationEnhanced', locationSchema);

