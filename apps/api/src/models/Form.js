const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date', 'file', 'url', 'phone'],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  options: [{
    value: String,
    label: String
  }],
  validation: {
    minLength: Number,
    maxLength: Number,
    min: Number,
    max: Number,
    pattern: String,
    customMessage: String
  },
  order: {
    type: Number,
    required: true
  }
});

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  fields: [fieldSchema],
  settings: {
    allowMultipleSubmissions: {
      type: Boolean,
      default: true
    },
    requireAuthentication: {
      type: Boolean,
      default: false
    },
    showProgressBar: {
      type: Boolean,
      default: true
    },
    submitButtonText: {
      type: String,
      default: 'Submit'
    },
    successMessage: {
      type: String,
      default: 'Thank you for your submission!'
    },
    redirectUrl: {
      type: String,
      default: ''
    },
    emailNotifications: {
      enabled: {
        type: Boolean,
        default: false
      },
      recipients: [String],
      subject: String,
      template: String
    }
  },
  menuPlacement: {
    enabled: {
      type: Boolean,
      default: false
    },
    location: {
      type: String,
      enum: ['header', 'footer', 'sidebar', 'none'],
      default: 'none'
    },
    label: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date,
    default: null
  },
  responseCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient queries
formSchema.index({ slug: 1 });
formSchema.index({ status: 1 });
formSchema.index({ 'menuPlacement.enabled': 1, 'menuPlacement.location': 1 });

// Virtual for form URL
formSchema.virtual('url').get(function() {
  return `/forms/${this.slug}`;
});

// Pre-save middleware to generate slug if not provided
formSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Static method to get published forms
formSchema.statics.getPublishedForms = function() {
  return this.find({ status: 'published' }).sort({ 'menuPlacement.order': 1 });
};

// Static method to get forms by menu location
formSchema.statics.getFormsByMenuLocation = function(location) {
  return this.find({ 
    status: 'published',
    'menuPlacement.enabled': true,
    'menuPlacement.location': location
  }).sort({ 'menuPlacement.order': 1 });
};

module.exports = mongoose.model('Form', formSchema);
