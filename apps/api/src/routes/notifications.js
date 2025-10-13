const express = require('express');
const { authenticate: protect, authorize } = require('../middleware/auth');
const {
  validateEnhancedNotification,
  validateBulkNotification,
  validateNotificationPreferences,
  validateDeliveryStatus,
  validateObjectId
} = require('../middleware/validation');
const {
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
} = require('../controllers/notificationController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Get notification statistics
router.get('/stats', getNotificationStats);

// Get notification analytics
router.get('/analytics', getNotificationAnalytics);

// Get notification preferences
router.get('/preferences', getNotificationPreferences);

// Update notification preferences
router.put('/preferences', validateNotificationPreferences, updateNotificationPreferences);

// Create enhanced notification
router.post('/enhanced', validateEnhancedNotification, createEnhancedNotification);

// Update delivery status
router.put('/:id/delivery', validateObjectId('id'), validateDeliveryStatus, updateDeliveryStatus);

// Mark notification as read
router.put('/:id/read', validateObjectId('id'), markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', markAllAsRead);

// Mark notification as archived
router.put('/:id/archive', validateObjectId('id'), markAsArchived);

// Delete notification
router.delete('/:id', validateObjectId('id'), deleteNotification);

// Admin-only routes
router.use(authorize('admin'));

// Create system notification
router.post('/system', createSystemNotification);

// Bulk create notifications
router.post('/bulk', validateBulkNotification, bulkCreateNotifications);

module.exports = router;
