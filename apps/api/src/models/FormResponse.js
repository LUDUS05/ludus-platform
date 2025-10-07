const mongoose = require('mongoose');

const responseFieldSchema = new mongoose.Schema({
  fieldId: {
    type: String,
    required: true
  },
  fieldType: {
    type: String,
    required: true
  },
  fieldLabel: {
    type: String,
    required: true
  },
  value: mongoose.Schema.Types.Mixed, // Can be string, array, number, etc.
  files: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  }]
});

const formResponseSchema = new mongoose.Schema({
  form: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  formSlug: {
    type: String,
    required: true
  },
  formTitle: {
    type: String,
    required: true
  },
  responses: [responseFieldSchema],
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for anonymous submissions
  },
  submitterInfo: {
    name: String,
    email: String,
    ip: String,
    userAgent: String
  },
  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'archived'],
    default: 'submitted'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String,
    default: ''
  },
  metadata: {
    submissionTime: {
      type: Number, // Time taken to complete form in seconds
      default: 0
    },
    referrer: String,
    source: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
formResponseSchema.index({ form: 1, createdAt: -1 });
formResponseSchema.index({ formSlug: 1, createdAt: -1 });
formResponseSchema.index({ status: 1 });
formResponseSchema.index({ submittedBy: 1 });

// Virtual for formatted submission date
formResponseSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Static method to get responses by form
formResponseSchema.statics.getResponsesByForm = function(formId, options = {}) {
  const query = { form: formId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.dateFrom || options.dateTo) {
    query.createdAt = {};
    if (options.dateFrom) query.createdAt.$gte = new Date(options.dateFrom);
    if (options.dateTo) query.createdAt.$lte = new Date(options.dateTo);
  }
  
  return this.find(query)
    .populate('submittedBy', 'firstName lastName email')
    .populate('reviewedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(options.limit || 100)
    .skip(options.skip || 0);
};

// Static method to get response statistics
formResponseSchema.statics.getResponseStats = function(formId) {
  return this.aggregate([
    { $match: { form: mongoose.Types.ObjectId(formId) } },
    {
      $group: {
        _id: null,
        totalResponses: { $sum: 1 },
        reviewedResponses: {
          $sum: { $cond: [{ $eq: ['$status', 'reviewed'] }, 1, 0] }
        },
        pendingResponses: {
          $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] }
        },
        averageSubmissionTime: { $avg: '$metadata.submissionTime' }
      }
    }
  ]);
};

// Method to export responses as CSV data
formResponseSchema.methods.toCSVRow = function() {
  const row = {
    'Submission ID': this._id,
    'Form Title': this.formTitle,
    'Submitted At': this.formattedDate,
    'Status': this.status,
    'Submitter Name': this.submitterInfo?.name || 'Anonymous',
    'Submitter Email': this.submitterInfo?.email || '',
    'IP Address': this.submitterInfo?.ip || '',
    'Review Notes': this.reviewNotes || ''
  };
  
  // Add field responses
  this.responses.forEach(response => {
    let value = response.value;
    if (Array.isArray(value)) {
      value = value.join('; ');
    }
    if (response.files && response.files.length > 0) {
      const fileNames = response.files.map(file => file.originalName).join('; ');
      value = value ? `${value} (Files: ${fileNames})` : `Files: ${fileNames}`;
    }
    row[response.fieldLabel] = value || '';
  });
  
  return row;
};

module.exports = mongoose.model('FormResponse', formResponseSchema);
