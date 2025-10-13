/**
 * @fileoverview Enhanced Category model for LUDUS platform - LDS-006 Implementation
 * 
 * This model defines the comprehensive category schema for the LUDUS social activity platform
 * based on the detailed database design specification. It includes category management,
 * hierarchical structure, multilingual support, and activity counting with cultural
 * sensitivity for the Saudi Arabian market.
 * 
 * Key Features:
 * - Hierarchical category structure with parent-child relationships
 * - Arabic/English bilingual support
 * - Icon and color management
 * - Activity counting and statistics
 * - Sorting and ordering capabilities
 * - Active/inactive status management
 * - SEO-friendly structure
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  nameEn: {
    type: String,
    required: [true, 'English category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'English category name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Category description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  descriptionEn: {
    type: String,
    maxlength: [500, 'English description cannot exceed 500 characters']
  },

  // Visual Information
  icon: {
    type: String,
    required: [true, 'Category icon is required']
  },
  color: {
    type: String,
    default: '#3B82F6',
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color code']
  },

  // Hierarchical Structure
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    index: true
  },
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  path: {
    type: String,
    default: ''
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
 * Update category path before saving.
 * 
 * Updates the category path based on the parent hierarchy
 * for efficient querying and navigation.
 * 
 * @function
 * @param {Function} next - Express middleware next function
 * @returns {void}
 */
categorySchema.pre('save', async function(next) {
  if (this.isModified('parent')) {
    if (this.parent) {
      const parentCategory = await this.constructor.findById(this.parent);
      if (parentCategory) {
        this.level = parentCategory.level + 1;
        this.path = parentCategory.path ? `${parentCategory.path}/${this._id}` : this._id.toString();
      }
    } else {
      this.level = 0;
      this.path = this._id.toString();
    }
  }
  next();
});

/**
 * Update parent's subcategories after saving.
 * 
 * Updates the parent category's subcategories array when
 * a new category is created or parent is changed.
 * 
 * @function
 * @param {Function} next - Express middleware next function
 * @returns {void}
 */
categorySchema.post('save', async function(next) {
  if (this.parent) {
    await this.constructor.findByIdAndUpdate(
      this.parent,
      { $addToSet: { subcategories: this._id } }
    );
  }
  next();
});

/**
 * Remove from parent's subcategories after deletion.
 * 
 * Removes the category from its parent's subcategories array
 * when the category is deleted.
 * 
 * @function
 * @param {Function} next - Express middleware next function
 * @returns {void}
 */
categorySchema.post('remove', async function(next) {
  if (this.parent) {
    await this.constructor.findByIdAndUpdate(
      this.parent,
      { $pull: { subcategories: this._id } }
    );
  }
  next();
});

/**
 * Get all subcategories recursively.
 * 
 * Retrieves all subcategories at all levels below this category
 * in the hierarchy.
 * 
 * @method getAllSubcategories
 * @returns {Promise<Array>} Array of all subcategory documents
 */
categorySchema.methods.getAllSubcategories = async function() {
  const subcategories = await this.constructor.find({
    path: { $regex: `^${this.path}/` }
  }).sort({ sortOrder: 1, name: 1 });
  
  return subcategories;
};

/**
 * Get direct subcategories only.
 * 
 * Retrieves only the direct subcategories (one level down)
 * from this category.
 * 
 * @method getDirectSubcategories
 * @returns {Promise<Array>} Array of direct subcategory documents
 */
categorySchema.methods.getDirectSubcategories = async function() {
  const subcategories = await this.constructor.find({
    parent: this._id,
    isActive: true
  }).sort({ sortOrder: 1, name: 1 });
  
  return subcategories;
};

/**
 * Update activity count.
 * 
 * Updates the activity count for this category and all
 * parent categories in the hierarchy.
 * 
 * @method updateActivityCount
 * @param {number} change - Change in activity count (positive or negative)
 * @returns {Promise<Category>} The updated category document
 */
categorySchema.methods.updateActivityCount = async function(change) {
  this.activityCount = Math.max(0, this.activityCount + change);
  await this.save();
  
  // Update parent categories
  if (this.parent) {
    const parentCategory = await this.constructor.findById(this.parent);
    if (parentCategory) {
      await parentCategory.updateActivityCount(change);
    }
  }
  
  return this;
};

/**
 * Get category breadcrumb.
 * 
 * Retrieves the breadcrumb path from root to this category
 * for navigation purposes.
 * 
 * @method getBreadcrumb
 * @returns {Promise<Array>} Array of category documents in breadcrumb order
 */
categorySchema.methods.getBreadcrumb = async function() {
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
 * Check if category has subcategories.
 * 
 * Determines if this category has any active subcategories.
 * 
 * @method hasSubcategories
 * @returns {Promise<boolean>} True if has subcategories, false otherwise
 */
categorySchema.methods.hasSubcategories = async function() {
  const count = await this.constructor.countDocuments({
    parent: this._id,
    isActive: true
  });
  return count > 0;
};

// Virtual for display name
categorySchema.virtual('displayName').get(function() {
  return this.nameEn || this.name;
});

// Virtual for display description
categorySchema.virtual('displayDescription').get(function() {
  return this.descriptionEn || this.description;
});

// Virtual for is root category
categorySchema.virtual('isRoot').get(function() {
  return !this.parent;
});

// Virtual for is leaf category
categorySchema.virtual('isLeaf').get(function() {
  return this.subcategories.length === 0;
});

// Virtual for full path
categorySchema.virtual('fullPath').get(function() {
  return this.path;
});

// Indexes for performance optimization
categorySchema.index({ name: 1 });
categorySchema.index({ nameEn: 1 });
categorySchema.index({ parent: 1, isActive: 1 });
categorySchema.index({ level: 1, sortOrder: 1 });
categorySchema.index({ path: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });
categorySchema.index({ activityCount: -1 });

// Text index for search
categorySchema.index({ 
  name: 'text', 
  nameEn: 'text',
  description: 'text',
  descriptionEn: 'text'
});

module.exports = mongoose.model('CategoryEnhanced', categorySchema);

