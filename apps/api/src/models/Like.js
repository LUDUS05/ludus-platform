// frontend/src/models/Like.js - Like model for social interactions
const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  contentType: {
    type: String,
    required: true,
    enum: ['activity', 'user', 'comment', 'post'],
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one like per user per content
likeSchema.index({ user: 1, contentId: 1, contentType: 1 }, { unique: true });

// Index for efficient queries
likeSchema.index({ contentId: 1, contentType: 1 });
likeSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Like', likeSchema);
