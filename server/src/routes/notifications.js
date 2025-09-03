const express = require('express');
const { authenticate: protect, authorize } = require('../middleware/auth');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  markAsArchived,
  deleteNotification,
  createSystemNotification,
  getNotificationStats
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

// Mark notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', markAllAsRead);

// Mark notification as archived
router.put('/:id/archive', markAsArchived);

// Delete notification
router.delete('/:id', deleteNotification);

// Admin-only routes
router.use(authorize('admin'));

// Create system notification
router.post('/system', createSystemNotification);

module.exports = router;
