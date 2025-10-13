/**
 * @fileoverview Enhanced Notification model for LUDUS platform - LDS-006 Implementation
 * 
 * This model defines the comprehensive notification schema for the LUDUS social activity platform
 * based on the detailed database design specification. It includes notification management,
 * multi-channel delivery, status tracking, and user preferences with cultural sensitivity
 * for the Saudi Arabian market.
 * 
 * Key Features:
 * - Multi-channel notification delivery (email, SMS, push)
 * - Arabic/English bilingual support
 * - Notification type categorization
 * - Delivery status tracking
 * - User preference integration
 * - Expiration and cleanup management
 * - Rich data payload support
 * - Analytics and reporting
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // User Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },

  // Notification Type and Content
  type: {
    type: String,
    enum: [
      'booking_confirmed',
      'booking_cancelled',
      'booking_reminder',
      'payment_success',
      'payment_failed',
      'review_request',
      'review_received',
      'promotion',
      'system_announcement',
      'activity_updated',
      'activity_cancelled',
      'partner_response',
      'referral_reward',
      'welcome',
      'verification_required'
    ],
    required: [true, 'Notification type is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  titleAr: {
    type: String,
    maxlength: [100, 'Arabic title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  messageAr: {
    type: String,
    maxlength: [500, 'Arabic message cannot exceed 500 characters']
  },

  // Rich Content
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  actionUrl: {
    type: String,
    maxlength: [500, 'Action URL cannot exceed 500 characters']
  },
  imageUrl: {
    type: String,
    maxlength: [500, 'Image URL cannot exceed 500 characters']
  },

  // Delivery Channels
  channels: {
    email: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date
      },
      error: {
        type: String
      }
    },
    sms: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date
      },
      error: {
        type: String
      }
    },
    push: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date
      },
      error: {
        type: String
      }
    }
  },

  // Status and Read State
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    default: false,
    index: true
  },
  deliveredAt: {
    type: Date
  },

  // Expiration
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  },

  // Priority and Urgency
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
    index: true
  },
  isUrgent: {
    type: Boolean,
    default: false,
    index: true
  },

  // Related Entities
  relatedEntity: {
    type: {
      type: String,
      enum: ['booking', 'activity', 'payment', 'review', 'user', 'partner']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },

  // Metadata
  metadata: {
    source: {
      type: String,
      enum: ['system', 'user', 'admin', 'api'],
      default: 'system'
    },
    campaignId: {
      type: String
    },
    templateId: {
      type: String
    },
    language: {
      type: String,
      enum: ['ar', 'en'],
      default: 'ar'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Mark notification as read.
 * 
 * Marks the notification as read and sets the read timestamp.
 * 
 * @method markAsRead
 * @returns {Promise<Notification>} The updated notification document
 */
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

/**
 * Mark notification as delivered.
 * 
 * Marks the notification as delivered and sets the delivered timestamp.
 * 
 * @method markAsDelivered
 * @returns {Promise<Notification>} The updated notification document
 */
notificationSchema.methods.markAsDelivered = function() {
  this.isDelivered = true;
  this.deliveredAt = new Date();
  return this.save();
};

/**
 * Update channel delivery status.
 * 
 * Updates the delivery status for a specific channel.
 * 
 * @method updateChannelStatus
 * @param {string} channel - Channel name (email, sms, push)
 * @param {boolean} sent - Whether the notification was sent
 * @param {string} error - Error message if sending failed
 * @returns {Promise<Notification>} The updated notification document
 */
notificationSchema.methods.updateChannelStatus = function(channel, sent, error = null) {
  if (this.channels[channel]) {
    this.channels[channel].sent = sent;
    this.channels[channel].sentAt = sent ? new Date() : null;
    this.channels[channel].error = error;
  }
  return this.save();
};

/**
 * Check if notification is expired.
 * 
 * Determines if the notification has expired based on
 * its expiration date.
 * 
 * @method isExpired
 * @returns {boolean} True if notification is expired, false otherwise
 */
notificationSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

/**
 * Get display title based on user language preference.
 * 
 * Returns the appropriate title based on the user's
 * language preference.
 * 
 * @method getDisplayTitle
 * @param {string} language - User's language preference
 * @returns {string} The display title
 */
notificationSchema.methods.getDisplayTitle = function(language = 'ar') {
  if (language === 'ar' && this.titleAr) {
    return this.titleAr;
  }
  return this.title;
};

/**
 * Get display message based on user language preference.
 * 
 * Returns the appropriate message based on the user's
 * language preference.
 * 
 * @method getDisplayMessage
 * @param {string} language - User's language preference
 * @returns {string} The display message
 */
notificationSchema.methods.getDisplayMessage = function(language = 'ar') {
  if (language === 'ar' && this.messageAr) {
    return this.messageAr;
  }
  return this.message;
};

/**
 * Check if notification should be sent to channel.
 * 
 * Determines if the notification should be sent to a specific
 * channel based on user preferences and notification type.
 * 
 * @method shouldSendToChannel
 * @param {string} channel - Channel name (email, sms, push)
 * @param {Object} userPreferences - User's notification preferences
 * @returns {boolean} True if should send, false otherwise
 */
notificationSchema.methods.shouldSendToChannel = function(channel, userPreferences) {
  if (!userPreferences || !userPreferences.notifications) {
    return true; // Default to sending if no preferences
  }
  
  const channelPref = userPreferences.notifications[channel];
  if (typeof channelPref === 'boolean') {
    return channelPref;
  }
  
  // Check type-specific preferences
  const typePref = userPreferences.notifications[this.type];
  if (typePref && typeof typePref[channel] === 'boolean') {
    return typePref[channel];
  }
  
  return true; // Default to sending
};

// Virtual for display title
notificationSchema.virtual('displayTitle').get(function() {
  return this.getDisplayTitle();
});

// Virtual for display message
notificationSchema.virtual('displayMessage').get(function() {
  return this.getDisplayMessage();
});

// Virtual for is unread
notificationSchema.virtual('isUnread').get(function() {
  return !this.isRead;
});

// Virtual for delivery status
notificationSchema.virtual('deliveryStatus').get(function() {
  const channels = Object.keys(this.channels);
  const sentChannels = channels.filter(channel => this.channels[channel].sent);
  
  if (sentChannels.length === 0) return 'not_sent';
  if (sentChannels.length === channels.length) return 'fully_sent';
  return 'partially_sent';
});

// Indexes for performance optimization
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, isUrgent: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ 'relatedEntity.type': 1, 'relatedEntity.id': 1 });
notificationSchema.index({ isDelivered: 1, createdAt: -1 });

// TTL index for automatic cleanup
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('NotificationEnhanced', notificationSchema);

