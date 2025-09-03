import api from './api';

class NotificationService {
  constructor() {
    this.baseUrl = '/api/notifications';
  }

  // Get user notifications
  async getNotifications(options = {}) {
    try {
      const { page = 1, limit = 20, status = 'unread', type, priority, category } = options;
      
      const response = await api.get(this.baseUrl, {
        params: { page, limit, status, type, priority, category }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw new Error(error.response?.data?.message || 'Failed to get notifications');
    }
  }

  // Get unread notification count
  async getUnreadCount() {
    try {
      const response = await api.get(`${this.baseUrl}/unread-count`);
      return response.data;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw new Error(error.response?.data?.message || 'Failed to get unread count');
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`${this.baseUrl}/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await api.put(`${this.baseUrl}/mark-all-read`);
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }

  // Mark notification as archived
  async markAsArchived(notificationId) {
    try {
      const response = await api.put(`${this.baseUrl}/${notificationId}/archive`);
      return response.data;
    } catch (error) {
      console.error('Error archiving notification:', error);
      throw new Error(error.response?.data?.message || 'Failed to archive notification');
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`${this.baseUrl}/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
  }

  // Get notification statistics
  async getNotificationStats(period = '30d') {
    try {
      const response = await api.get(`${this.baseUrl}/stats`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to get notification statistics');
    }
  }

  // Create system notification (admin only)
  async createSystemNotification(notificationData) {
    try {
      const response = await api.post(`${this.baseUrl}/system`, notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating system notification:', error);
      throw new Error(error.response?.data?.message || 'Failed to create system notification');
    }
  }

  // Helper method to format notification content
  formatNotificationContent(notification) {
    const { type, title, content, richContent, action, createdAt } = notification;
    
    // Format timestamp
    const timestamp = new Date(createdAt).toLocaleString();
    
    // Get icon based on type
    const getIcon = (type) => {
      const icons = {
        referral_reward_registration: '🎉',
        referral_reward_booking: '🎉',
        referral_code_generated: '🔑',
        referral_conversion: '📈',
        wallet_credited: '💰',
        system_announcement: '📢',
        activity_reminder: '⏰',
        booking_confirmation: '✅',
        payment_success: '💳',
        payment_failed: '❌'
      };
      return icons[type] || '📌';
    };

    // Format rich content if available
    let formattedContent = content;
    if (richContent?.data) {
      const data = richContent.data;
      
      if (type === 'referral_reward_registration' || type === 'referral_reward_booking') {
        formattedContent = `Congratulations! You earned ${data.amount} ${data.currency} for referring a new user with code ${data.referralCode}.`;
      } else if (type === 'wallet_credited') {
        formattedContent = `Your wallet has been credited with ${data.amount} ${data.currency}. ${data.description || ''}`;
      }
    }

    return {
      icon: getIcon(type),
      title,
      content: formattedContent,
      timestamp,
      action,
      type
    };
  }

  // Helper method to group notifications by date
  groupNotificationsByDate(notifications) {
    const groups = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });
    
    return groups;
  }

  // Helper method to filter notifications by priority
  filterByPriority(notifications, priority) {
    return notifications.filter(notification => notification.priority === priority);
  }

  // Helper method to search notifications
  searchNotifications(notifications, searchTerm) {
    if (!searchTerm) return notifications;
    
    const term = searchTerm.toLowerCase();
    return notifications.filter(notification => 
      notification.title.toLowerCase().includes(term) ||
      notification.content.toLowerCase().includes(term) ||
      notification.type.toLowerCase().includes(term)
    );
  }

  // Helper method to get notification summary
  getNotificationSummary(notifications) {
    const summary = {
      total: notifications.length,
      unread: notifications.filter(n => n.status === 'unread').length,
      read: notifications.filter(n => n.status === 'read').length,
      archived: notifications.filter(n => n.status === 'archived').length,
      byType: {},
      byPriority: {}
    };

    notifications.forEach(notification => {
      // Count by type
      summary.byType[notification.type] = (summary.byType[notification.type] || 0) + 1;
      
      // Count by priority
      summary.byPriority[notification.priority] = (summary.byPriority[notification.priority] || 0) + 1;
    });

    return summary;
  }
}

export default new NotificationService();
