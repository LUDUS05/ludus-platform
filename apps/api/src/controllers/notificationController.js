/**
 * @fileoverview Controller for handling notifications.
 * @module controllers/notificationController
 */

const Notification = require('../models/Notification');
const User = require('../models/User');

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

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  markAsArchived,
  deleteNotification,
  createSystemNotification,
  getNotificationStats
};
