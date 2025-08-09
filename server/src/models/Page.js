const mongoose = require('mongoose');

// Content block schema for rich content structure
const contentBlockSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['paragraph', 'heading', 'image', 'video', 'quote', 'code', 'list', 'divider', 'button', 'embed'],
    required: true
  },
  content: {
    en: { type: String, default: '' },
    ar: { type: String, default: '' }
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: false });

// SEO schema for better meta data management
const seoSchema = new mongoose.Schema({
  title: {
    en: { type: String, maxlength: 60 },
    ar: { type: String, maxlength: 60 }
  },
  description: {
    en: { type: String, maxlength: 160 },
    ar: { type: String, maxlength: 160 }
  },
  keywords: {
    en: { type: String },
    ar: { type: String }
  },
  ogImage: { type: String },
  ogTitle: {
    en: { type: String },
    ar: { type: String }
  },
  ogDescription: {
    en: { type: String },
    ar: { type: String }
  }
}, { _id: false });

const pageSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true, trim: true },
    ar: { type: String, required: true, trim: true }
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[a-z0-9-]+$/
  },
  // Rich content blocks
  content: [contentBlockSchema],
  
  // Page template type
  template: {
    type: String,
    enum: ['basic', 'landing', 'about', 'contact', 'custom'],
    default: 'basic'
  },
  
  // Publishing options
  status: {
    type: String,
    enum: ['published', 'draft', 'scheduled', 'archived'],
    default: 'draft'
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  
  // Navigation and placement
  placement: {
    type: String,
    enum: ['header', 'footer', 'sidebar', 'none'],
    default: 'none'
  },
  showInNavigation: {
    type: Boolean,
    default: false
  },
  navigationOrder: {
    type: Number,
    default: 0
  },
  
  // SEO and meta data
  seo: seoSchema,
  
  // Page settings
  settings: {
    allowComments: { type: Boolean, default: false },
    requireAuth: { type: Boolean, default: false },
    customCSS: { type: String },
    customJS: { type: String },
    featuredImage: { type: String },
    backgroundColor: { type: String, default: '#ffffff' },
    textColor: { type: String, default: '#000000' }
  },
  
  // Categories and tags
  categories: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  
  // System flags
  isSystem: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Analytics and tracking
  views: {
    type: Number,
    default: 0
  },
  lastViewed: {
    type: Date
  },
  
  // Version control
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: Number,
    content: [contentBlockSchema],
    updatedAt: Date,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changeLog: String
  }],
  
  // User tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full URL
pageSchema.virtual('url').get(function() {
  return `/pages/${this.slug}`;
});

// Virtual for published status
pageSchema.virtual('isPublished').get(function() {
  return this.status === 'published' && 
         (!this.publishDate || this.publishDate <= new Date()) &&
         (!this.expiryDate || this.expiryDate > new Date());
});

// Virtual for word count
pageSchema.virtual('wordCount').get(function() {
  let totalWords = 0;
  this.content.forEach(block => {
    if (block.content) {
      const enWords = (block.content.en || '').split(/\s+/).filter(word => word.length > 0).length;
      const arWords = (block.content.ar || '').split(/\s+/).filter(word => word.length > 0).length;
      totalWords += Math.max(enWords, arWords);
    }
  });
  return totalWords;
});

// Pre-save middleware
pageSchema.pre('save', async function(next) {
  // Generate slug from English title if not provided
  if (!this.slug && this.title && this.title.en) {
    this.slug = this.title.en
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    if (!this.slug) {
      this.slug = 'page-' + Date.now();
    }
  }
  
  // Ensure content blocks have proper IDs and order
  if (this.content && Array.isArray(this.content)) {
    this.content.forEach((block, index) => {
      if (!block.id) {
        block.id = Date.now().toString() + '-' + index;
      }
      if (typeof block.order !== 'number') {
        block.order = index;
      }
    });
  }
  
  // Auto-generate SEO title from page title if not provided
  if (!this.seo) {
    this.seo = {};
  }
  if (!this.seo.title) {
    this.seo.title = {
      en: this.title.en,
      ar: this.title.ar
    };
  }
  
  // Update version for content changes
  if (this.isModified('content')) {
    this.version = (this.version || 0) + 1;
  }
  
  next();
});

// Index for better performance
pageSchema.index({ slug: 1 });
pageSchema.index({ status: 1, publishDate: -1 });
pageSchema.index({ 'title.en': 'text', 'title.ar': 'text' });
pageSchema.index({ categories: 1 });
pageSchema.index({ tags: 1 });
pageSchema.index({ createdBy: 1 });

// Static methods
pageSchema.statics.findPublished = function(conditions = {}) {
  return this.find({
    ...conditions,
    status: 'published',
    publishDate: { $lte: new Date() },
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gt: new Date() } }
    ]
  });
};

pageSchema.statics.findBySlug = function(slug, includeUnpublished = false) {
  const query = { slug };
  if (!includeUnpublished) {
    query.status = 'published';
    query.publishDate = { $lte: new Date() };
  }
  return this.findOne(query);
};

// Instance methods
pageSchema.methods.incrementViews = function() {
  this.views = (this.views || 0) + 1;
  this.lastViewed = new Date();
  return this.save();
};

pageSchema.methods.createBackup = function(userId, changeLog = '') {
  if (!this.previousVersions) {
    this.previousVersions = [];
  }
  
  this.previousVersions.push({
    version: this.version || 1,
    content: this.content,
    updatedAt: new Date(),
    updatedBy: userId,
    changeLog
  });
  
  // Keep only last 10 versions
  if (this.previousVersions.length > 10) {
    this.previousVersions = this.previousVersions.slice(-10);
  }
  
  return this.save();
};

module.exports = mongoose.model('Page', pageSchema);