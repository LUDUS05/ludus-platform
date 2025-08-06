const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  content: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  placement: {
    type: String,
    enum: ['header', 'footer', 'none'],
    default: 'none'
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'archived'],
    default: 'draft'
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: 160
  },
  metaKeywords: {
    type: String,
    trim: true
  },
  isSystem: {
    type: Boolean,
    default: false // System pages like privacy, terms can't be deleted
  },
  order: {
    type: Number,
    default: 0 // For menu ordering
  },
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
  timestamps: true
});

// Ensure URL starts with /
pageSchema.pre('save', function(next) {
  if (this.url && !this.url.startsWith('/')) {
    this.url = '/' + this.url;
  }
  next();
});

// Generate slug from title if not provided
pageSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Page', pageSchema);