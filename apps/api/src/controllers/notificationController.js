/**
 * @fileoverview Controller for handling notifications.
 * @module controllers/notificationController
 */

const Notification = require('../models/Notification');
const NotificationEnhanced = require('../models/NotificationEnhanced');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Get all notifications for the authenticated user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'unread', type, priority, category } = req.query;
    const userId = req.user.id || req.user._id;

    const result = await Notification.getNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      type,
      priority,
      category
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message
    });
  }
};

/**
 * Get the number of unread notifications for the authenticated user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const count = await Notification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

/**
 * Mark a notification as read.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

/**
 * Mark all notifications as read for the authenticated user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const result = await Notification.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

/**
 * Mark a notification as archived.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const markAsArchived = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsArchived();

    res.status(200).json({
      success: true,
      message: 'Notification archived',
      data: notification
    });
  } catch (error) {
    console.error('Error archiving notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive notification',
      error: error.message
    });
  }
};

/**
 * Delete a notification.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await Notification.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

/**
 * Create a system-wide notification (for admins).
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const createSystemNotification = async (req, res) => {
  try {
    const {
      title,
      content,
      priority = 'normal',
      category = 'system',
      action,
      expiresAt,
      targetUsers = 'all' // 'all', 'specific', 'role'
    } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    let userIds = [];

    if (targetUsers === 'all') {
      // Get all user IDs
      const users = await User.find({}, '_id');
      userIds = users.map(user => user._id);
    } else if (targetUsers === 'role') {
      // Get users by specific role
      const { role } = req.body;
      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Role is required when targetUsers is "role"'
        });
      }
      const users = await User.find({ role }, '_id');
      userIds = users.map(user => user._id);
    } else if (targetUsers === 'specific') {
      // Get specific user IDs
      const { userIds: specificUserIds } = req.body;
      if (!specificUserIds || !Array.isArray(specificUserIds)) {
        return res.status(400).json({
          success: false,
          message: 'userIds array is required when targetUsers is "specific"'
        });
      }
      userIds = specificUserIds;
    }

    // Create notifications for all target users
    const notifications = [];
    for (const userId of userIds) {
      const notification = new Notification({
        userId,
        type: 'system_announcement',
        title,
        content,
        priority,
        richContent: {
          data: {
            createdBy: req.user.id || req.user._id,
            category,
            timestamp: new Date()
          }
        },
        metadata: {
          source: 'system',
          category,
          tags: ['system', category]
        },
        action,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      });
      
      notifications.push(notification);
    }

    // Bulk insert notifications
    const createdNotifications = await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: `System notification created for ${createdNotifications.length} users`,
      data: {
        notificationsCreated: createdNotifications.length,
        sampleNotification: createdNotifications[0]
      }
    });
  } catch (error) {
    console.error('Error creating system notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create system notification',
      error: error.message
    });
  }
};

/**
 * Get notification statistics for the authenticated user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { period = '30d' } = req.query;

    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const stats = await Notification.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] }
          },
          read: {
            $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] }
          },
          archived: {
            $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
          },
          byType: {
            $push: '$type'
          },
          byPriority: {
            $push: '$priority'
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      unread: 0,
      read: 0,
      archived: 0,
      byType: [],
      byPriority: []
    };

    // Calculate type distribution
    const typeDistribution = {};
    result.byType.forEach(type => {
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });

    // Calculate priority distribution
    const priorityDistribution = {};
    result.byPriority.forEach(priority => {
      priorityDistribution[priority] = (priorityDistribution[priority] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate },
        overview: {
          total: result.total,
          unread: result.unread,
          read: result.read,
          archived: result.archived
        },
        typeDistribution,
        priorityDistribution
      }
    });
  } catch (error) {
    console.error('Error getting notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification statistics',
      error: error.message
    });
  }
};

/**
 * Get notification analytics and insights.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getNotificationAnalytics = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { period = '30d', groupBy = 'type' } = req.query;

    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const analytics = await NotificationEnhanced.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: groupBy === 'type' ? '$type' : groupBy === 'priority' ? '$priority' : '$metadata.source',
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
          read: { $sum: { $cond: [{ $eq: ['$isRead', true] }, 1, 0] } },
          delivered: { $sum: { $cond: [{ $eq: ['$isDelivered', true] }, 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ['$isUrgent', true] }, 1, 0] } },
          avgReadTime: {
            $avg: {
              $cond: [
                { $ne: ['$readAt', null] },
                { $subtract: ['$readAt', '$createdAt'] },
                null
              ]
            }
          }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Get delivery channel analytics
    const channelAnalytics = await NotificationEnhanced.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          emailSent: { $sum: { $cond: [{ $eq: ['$channels.email.sent', true] }, 1, 0] } },
          smsSent: { $sum: { $cond: [{ $eq: ['$channels.sms.sent', true] }, 1, 0] } },
          pushSent: { $sum: { $cond: [{ $eq: ['$channels.push.sent', true] }, 1, 0] } },
          emailErrors: { $sum: { $cond: [{ $ne: ['$channels.email.error', null] }, 1, 0] } },
          smsErrors: { $sum: { $cond: [{ $ne: ['$channels.sms.error', null] }, 1, 0] } },
          pushErrors: { $sum: { $cond: [{ $ne: ['$channels.push.error', null] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate },
        analytics,
        channelAnalytics: channelAnalytics[0] || {
          emailSent: 0,
          smsSent: 0,
          pushSent: 0,
          emailErrors: 0,
          smsErrors: 0,
          pushErrors: 0
        }
      }
    });
  } catch (error) {
    console.error('Error getting notification analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification analytics',
      error: error.message
    });
  }
};

/**
 * Create enhanced notification with multi-channel delivery.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const createEnhancedNotification = async (req, res) => {
  try {
    const {
      user,
      type,
      title,
      titleAr,
      message,
      messageAr,
      data = {},
      actionUrl,
      imageUrl,
      priority = 'normal',
      isUrgent = false,
      relatedEntity = {},
      channels = { email: true, sms: false, push: true },
      expiresAt
    } = req.body;

    // Validate required fields
    if (!user || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'User, type, title, and message are required'
      });
    }

    // Check if user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create notification
    const notification = new NotificationEnhanced({
      user,
      type,
      title,
      titleAr,
      message,
      messageAr,
      data,
      actionUrl,
      imageUrl,
      priority,
      isUrgent,
      relatedEntity,
      channels,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    await notification.save();

    // TODO: Implement actual delivery logic here
    // This would integrate with email service, SMS service, and push notification service

    res.status(201).json({
      success: true,
      message: 'Enhanced notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error creating enhanced notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create enhanced notification',
      error: error.message
    });
  }
};

/**
 * Update notification delivery status.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { channel, sent, error } = req.body;

    if (!channel || typeof sent !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Channel and sent status are required'
      });
    }

    const notification = await NotificationEnhanced.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.updateChannelStatus(channel, sent, error);

    res.status(200).json({
      success: true,
      message: 'Delivery status updated successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update delivery status',
      error: error.message
    });
  }
};

/**
 * Get notification preferences for user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId).select('notificationPreferences');
    
    const defaultPreferences = {
      email: {
        booking: true,
        payment: true,
        promotion: true,
        system: true
      },
      sms: {
        booking: false,
        payment: true,
        promotion: false,
        system: false
      },
      push: {
        booking: true,
        payment: true,
        promotion: true,
        system: true
      },
      frequency: 'immediate',
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    };

    res.status(200).json({
      success: true,
      data: {
        preferences: user?.notificationPreferences || defaultPreferences
      }
    });
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification preferences',
      error: error.message
    });
  }
};

/**
 * Update notification preferences for user.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { preferences } = req.body;

    if (!preferences) {
      return res.status(400).json({
        success: false,
        message: 'Preferences are required'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { notificationPreferences: preferences },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: {
        preferences: user.notificationPreferences
      }
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message
    });
  }
};

/**
 * Bulk create notifications for multiple users.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 */
const bulkCreateNotifications = async (req, res) => {
  try {
    const {
      userIds,
      type,
      title,
      titleAr,
      message,
      messageAr,
      data = {},
      actionUrl,
      imageUrl,
      priority = 'normal',
      isUrgent = false,
      channels = { email: true, sms: false, push: true },
      expiresAt
    } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    // Validate all users exist
    const users = await User.find({ _id: { $in: userIds } }).select('_id');
    if (users.length !== userIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some users not found'
      });
    }

    // Create notifications
    const notifications = userIds.map(userId => ({
      user: userId,
      type,
      title,
      titleAr,
      message,
      messageAr,
      data,
      actionUrl,
      imageUrl,
      priority,
      isUrgent,
      channels,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    }));

    const createdNotifications = await NotificationEnhanced.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: `Bulk notifications created for ${createdNotifications.length} users`,
      data: {
        notificationsCreated: createdNotifications.length,
        sampleNotification: createdNotifications[0]
      }
    });
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bulk notifications',
      error: error.message
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  markAsArchived,
  deleteNotification,
  createSystemNotification,
  getNotificationStats,
  getNotificationAnalytics,
  createEnhancedNotification,
  updateDeliveryStatus,
  getNotificationPreferences,
  updateNotificationPreferences,
  bulkCreateNotifications
};
