const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Notification type
  type: {
    type: String,
    enum: [
      'referral_reward_registration',
      'referral_reward_booking',
      'referral_code_generated',
      'referral_conversion',
      'wallet_credited',
      'system_announcement',
      'activity_reminder',
      'booking_confirmation',
      'payment_success',
      'payment_failed'
    ],
    required: true
  },
  
  // Title and content
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Rich content (optional)
  richContent: {
    html: String,
    data: mongoose.Schema.Types.Mixed // For structured data like reward amounts, referral codes, etc.
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Status
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread'
  },
  
  // Read timestamp
  readAt: Date,
  
  // Action data (for actionable notifications)
  action: {
    type: {
      type: String,
      enum: ['link', 'button', 'modal', 'none'],
      default: 'none'
    },
    text: String,
    url: String,
    data: mongoose.Schema.Types.Mixed
  },
  
  // Metadata
  metadata: {
    source: String, // 'system', 'referral', 'wallet', 'activity', etc.
    relatedId: mongoose.Schema.Types.ObjectId, // Related entity ID (referral, booking, etc.)
    relatedType: String, // 'Referral', 'Booking', 'Activity', etc.
    category: String, // 'reward', 'system', 'activity', 'payment'
    tags: [String]
  },
  
  // Expiration
  expiresAt: Date,
  
  // Delivery tracking
  delivery: {
    email: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    },
    push: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    },
    sms: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ userId: 1, status: 1, createdAt: -1 });
notificationSchema.index({ type: 1, status: 1 });
notificationSchema.index({ priority: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1, status: 'unread' });

// Instance methods
notificationSchema.methods.markAsRead = async function() {
  this.status = 'read';
  this.readAt = new Date();
  await this.save();
  return this;
};

notificationSchema.methods.markAsArchived = async function() {
  this.status = 'archived';
  await this.save();
  return this;
};

notificationSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

// Static methods
notificationSchema.statics.createReferralRewardNotification = async function(userId, rewardType, amount, currency, referralCode) {
  const notificationData = {
    userId,
    type: rewardType === 'registration' ? 'referral_reward_registration' : 'referral_reward_booking',
    title: rewardType === 'registration' 
      ? '🎉 Referral Registration Reward!' 
      : '🎉 Referral Booking Reward!',
    content: rewardType === 'registration'
      ? `Congratulations! You earned ${amount} ${currency} for referring a new user with code ${referralCode}.`
      : `Congratulations! You earned ${amount} ${currency} because your referral made their first booking!`,
    priority: 'high',
    richContent: {
      data: {
        rewardType,
        amount,
        currency,
        referralCode,
        timestamp: new Date()
      }
    },
    metadata: {
      source: 'referral',
      relatedType: 'Referral',
      category: 'reward',
      tags: ['referral', 'reward', rewardType]
    },
    action: {
      type: 'link',
      text: 'View Referral Dashboard',
      url: '/referrals'
    }
  };
  
  return await this.create(notificationData);
};

notificationSchema.statics.createReferralCodeGeneratedNotification = async function(userId, referralCode) {
  const notificationData = {
    userId,
    type: 'referral_code_generated',
    title: '🔑 Your Referral Code is Ready!',
    content: `Your unique referral code ${referralCode} has been generated. Start sharing it to earn rewards!`,
    priority: 'normal',
    richContent: {
      data: {
        referralCode,
        generatedAt: new Date()
      }
    },
    metadata: {
      source: 'referral',
      relatedType: 'ReferralCode',
      category: 'reward',
      tags: ['referral', 'code', 'generated']
    },
    action: {
      type: 'link',
      text: 'Start Sharing',
      url: '/referrals'
    }
  };
  
  return await this.create(notificationData);
};

notificationSchema.statics.createWalletCreditedNotification = async function(userId, amount, currency, source, description) {
  const notificationData = {
    userId,
    type: 'wallet_credited',
    title: '💰 Wallet Credited!',
    content: `Your wallet has been credited with ${amount} ${currency}. ${description}`,
    priority: 'high',
    richContent: {
      data: {
        amount,
        currency,
        source,
        creditedAt: new Date()
      }
    },
    metadata: {
      source: 'wallet',
      relatedType: 'Wallet',
      category: 'payment',
      tags: ['wallet', 'credit', source]
    },
    action: {
      type: 'link',
      text: 'View Wallet',
      url: '/wallet'
    }
  };
  
  return await this.create(notificationData);
};

notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    userId,
    status: 'unread'
  });
};

notificationSchema.statics.getNotifications = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    status = 'unread',
    type,
    priority,
    category
  } = options;
  
  const query = { userId };
  if (status !== 'all') query.status = status;
  if (type) query.type = type;
  if (priority) query.priority = priority;
  if (category) query['metadata.category'] = category;
  
  const skip = (page - 1) * limit;
  
  const [notifications, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]);
  
  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { userId, status: 'unread' },
    { 
      status: 'read',
      readAt: new Date()
    }
  );
};

notificationSchema.statics.cleanupExpired = async function() {
  const now = new Date();
  return await this.updateMany(
    { 
      expiresAt: { $lt: now },
      status: 'unread'
    },
    { status: 'archived' }
  );
};

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  // Set default expiration (30 days for most notifications)
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  // Auto-archive expired notifications
  if (this.isExpired() && this.status === 'unread') {
    this.status = 'archived';
  }
  
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
