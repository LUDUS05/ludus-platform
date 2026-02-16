/**
 * @fileoverview Enhanced notification service for LUDUS platform
 * 
 * This service provides comprehensive notification management functionality
 * including fetching, creating, updating, and managing notification preferences
 * with full RTL support for the Saudi Arabian market.
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

import { gsap } from '../utils/gsap-setup';
import { rtlAware } from '../utils/gsap-setup';

class LUDUSNotificationService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.container = null;
    this.notifications = new Map();
    this.init();
  }

  init() {
    // Create notification container
    this.container = document.createElement('div');
    this.container.className = 'ludus-notification-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
      max-width: 400px;
    `;
    
    // RTL support
    const isRTL = document.dir === 'rtl' || document.documentElement.dir === 'rtl';
    if (isRTL) {
      this.container.style.right = 'auto';
      this.container.style.left = '20px';
    }
    
    document.body.appendChild(this.container);
  }

  // API Helper Methods
  async makeRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Notification Management Methods

  /**
   * Get notifications for the current user
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Notifications data
   */
  async getNotifications(options = {}) {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.status) params.append('status', options.status);
    if (options.type) params.append('type', options.type);
    if (options.priority) params.append('priority', options.priority);
    if (options.category) params.append('category', options.category);

    const queryString = params.toString();
    const endpoint = `/notifications${queryString ? `?${queryString}` : ''}`;
    
    return await this.makeRequest(endpoint);
  }

  /**
   * Get unread notification count
   * @returns {Promise<Object>} Unread count data
   */
  async getUnreadCount() {
    return await this.makeRequest('/notifications/unread-count');
  }

  /**
   * Get notification statistics
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Statistics data
   */
  async getNotificationStats(options = {}) {
    const params = new URLSearchParams();
    
    if (options.period) params.append('period', options.period);

    const queryString = params.toString();
    const endpoint = `/notifications/stats${queryString ? `?${queryString}` : ''}`;
    
    return await this.makeRequest(endpoint);
  }

  /**
   * Get notification analytics
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Analytics data
   */
  async getNotificationAnalytics(options = {}) {
    const params = new URLSearchParams();
    
    if (options.period) params.append('period', options.period);
    if (options.groupBy) params.append('groupBy', options.groupBy);

    const queryString = params.toString();
    const endpoint = `/notifications/analytics${queryString ? `?${queryString}` : ''}`;
    
    return await this.makeRequest(endpoint);
  }

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} Updated notification data
   */
  async markAsRead(id) {
    return await this.makeRequest(`/notifications/${id}/read`, {
      method: 'PUT'
    });
  }

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Update result
   */
  async markAllAsRead() {
    return await this.makeRequest('/notifications/mark-all-read', {
      method: 'PUT'
    });
  }

  /**
   * Mark notification as archived
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} Updated notification data
   */
  async markAsArchived(id) {
    return await this.makeRequest(`/notifications/${id}/archive`, {
      method: 'PUT'
    });
  }

  /**
   * Delete notification
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteNotification(id) {
    return await this.makeRequest(`/notifications/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Create enhanced notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification data
   */
  async createEnhancedNotification(notificationData) {
    return await this.makeRequest('/notifications/enhanced', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    });
  }

  /**
   * Update delivery status
   * @param {string} id - Notification ID
   * @param {Object} statusData - Delivery status data
   * @returns {Promise<Object>} Updated notification data
   */
  async updateDeliveryStatus(id, statusData) {
    return await this.makeRequest(`/notifications/${id}/delivery`, {
      method: 'PUT',
      body: JSON.stringify(statusData)
    });
  }

  /**
   * Get notification preferences
   * @returns {Promise<Object>} User preferences
   */
  async getNotificationPreferences() {
    return await this.makeRequest('/notifications/preferences');
  }

  /**
   * Update notification preferences
   * @param {Object} preferences - User preferences
   * @returns {Promise<Object>} Updated preferences
   */
  async updateNotificationPreferences(preferences) {
    return await this.makeRequest('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify({ preferences })
    });
  }

  /**
   * Create system notification (Admin only)
   * @param {Object} notificationData - System notification data
   * @returns {Promise<Object>} Created notification data
   */
  async createSystemNotification(notificationData) {
    return await this.makeRequest('/notifications/system', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    });
  }

  /**
   * Bulk create notifications (Admin only)
   * @param {Object} bulkData - Bulk notification data
   * @returns {Promise<Object>} Created notifications data
   */
  async bulkCreateNotifications(bulkData) {
    return await this.makeRequest('/notifications/bulk', {
      method: 'POST',
      body: JSON.stringify(bulkData)
    });
  }

  // UI Notification Methods

  /**
   * Show notification in UI
   * @param {string} type - Notification type
   * @param {string} message - Notification message
   * @param {number} duration - Display duration
   * @param {Object} options - Additional options
   * @returns {number} Notification ID
   */
  show(type, message, duration = 4000, options = {}) {
    const notification = this.createNotification(type, message, options);
    const id = Date.now() + Math.random();
    
    this.notifications.set(id, notification);
    this.container.appendChild(notification);
    
    const tl = gsap.timeline({
      onComplete: () => this.remove(id)
    });
    
    // RTL-aware entrance animation
    const isRTL = document.dir === 'rtl' || document.documentElement.dir === 'rtl';
    const entranceX = isRTL ? -20 : 20;
    
    tl.from(notification, {
      duration: 0.5,
      y: -50,
      x: entranceX,
      opacity: 0,
      scale: 0.9,
      ease: 'back.out(1.7)'
    })
    .to(notification, {
      duration: 0.3,
      y: -70,
      opacity: 0,
      scale: 0.95,
      ease: 'power2.in',
      delay: duration / 1000
    });

    // Auto-remove after duration
    setTimeout(() => {
      if (this.notifications.has(id)) {
        this.remove(id);
      }
    }, duration);

    return id;
  }

  /**
   * Create notification element
   * @param {string} type - Notification type
   * @param {string} message - Notification message
   * @param {Object} options - Additional options
   * @returns {HTMLElement} Notification element
   */
  createNotification(type, message, options = {}) {
    const notification = document.createElement('div');
    notification.className = `ludus-notification ludus-notification--${type}`;
    
    // Base styles
    notification.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      border-left: 4px solid;
      pointer-events: auto;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      max-width: 100%;
      word-wrap: break-word;
    `;

    // Type-specific styling
    const typeStyles = {
      success: {
        borderLeftColor: '#10b981',
        color: '#065f46'
      },
      error: {
        borderLeftColor: '#ef4444',
        color: '#991b1b'
      },
      warning: {
        borderLeftColor: '#f59e0b',
        color: '#92400e'
      },
      info: {
        borderLeftColor: '#3b82f6',
        color: '#1e40af'
      }
    };

    const style = typeStyles[type] || typeStyles.info;
    Object.assign(notification.style, style);

    // Add icon and content
    const icon = this.getIcon(type);
    notification.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div class="notification-icon" style="flex-shrink: 0; margin-top: 2px;">
          ${icon}
        </div>
        <div class="notification-content" style="flex: 1;">
          <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" style="
          flex-shrink: 0;
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">×</button>
      </div>
    `;

    // Add click handlers
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.remove(notification);
    });

    return notification;
  }

  /**
   * Get icon for notification type
   * @param {string} type - Notification type
   * @returns {string} Icon HTML
   */
  getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  /**
   * Remove notification
   * @param {number|HTMLElement} idOrElement - Notification ID or element
   */
  remove(idOrElement) {
    let notification;
    
    if (typeof idOrElement === 'number') {
      notification = this.notifications.get(idOrElement);
      this.notifications.delete(idOrElement);
    } else {
      notification = idOrElement;
      // Find and remove from map
      for (const [id, notif] of this.notifications.entries()) {
        if (notif === notification) {
          this.notifications.delete(id);
          break;
        }
      }
    }

    if (notification && notification.parentNode) {
      gsap.to(notification, {
        duration: 0.3,
        x: rtlAware.transform(100, 0).x,
        opacity: 0,
        scale: 0.9,
        ease: 'power2.in',
        onComplete: () => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }
      });
    }
  }

  /**
   * Show notification from API response
   * @param {Object} response - API response
   */
  showFromAPIResponse(response) {
    if (response.animationTriggers) {
      const { errorMessage, successMessage, errorShake } = response.animationTriggers;
      
      if (errorMessage) {
        this.show('error', errorMessage);
        if (errorShake) this.triggerErrorShake();
      }
      
      if (successMessage) {
        this.show('success', successMessage);
      }
    }
  }

  /**
   * Trigger error shake animation
   */
  triggerErrorShake() {
    const mainContainer = document.querySelector('.main-container') || document.body;
    gsap.to(mainContainer, {
      duration: 0.1,
      x: 5,
      repeat: 5,
      yoyo: true,
      ease: 'power2.inOut'
    });
  }

  /**
   * Clear all notifications
   */
  clear() {
    this.notifications.forEach((notification, id) => {
      this.remove(id);
    });
  }

  // Utility Methods

  /**
   * Format notification for display
   * @param {Object} notification - Notification object
   * @param {string} language - User language preference
   * @returns {Object} Formatted notification
   */
  formatNotificationForDisplay(notification, language = 'ar') {
    return {
      ...notification,
      displayTitle: notification.titleAr && language === 'ar' ? notification.titleAr : notification.title,
      displayMessage: notification.messageAr && language === 'ar' ? notification.messageAr : notification.message,
      isUnread: !notification.isRead,
      timeAgo: this.getTimeAgo(notification.createdAt),
      priorityClass: this.getPriorityClass(notification.priority),
      typeIcon: this.getTypeIcon(notification.type)
    };
  }

  /**
   * Get time ago string
   * @param {string|Date} date - Date to format
   * @returns {string} Time ago string
   */
  getTimeAgo(date) {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) return 'الآن';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ساعة`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} يوم`;
    return `${Math.floor(diffInSeconds / 2592000)} شهر`;
  }

  /**
   * Get priority CSS class
   * @param {string} priority - Priority level
   * @returns {string} CSS class
   */
  getPriorityClass(priority) {
    const classes = {
      low: 'priority-low',
      normal: 'priority-normal',
      high: 'priority-high',
      urgent: 'priority-urgent'
    };
    return classes[priority] || classes.normal;
  }

  /**
   * Get type icon
   * @param {string} type - Notification type
   * @returns {string} Icon emoji
   */
  getTypeIcon(type) {
    const icons = {
      booking_confirmed: '📅',
      booking_cancelled: '❌',
      booking_reminder: '⏰',
      payment_success: '💰',
      payment_failed: '💳',
      review_request: '⭐',
      review_received: '⭐',
      promotion: '🎉',
      system_announcement: '📢',
      activity_updated: '🔄',
      activity_cancelled: '🚫',
      partner_response: '💬',
      referral_reward: '🎁',
      welcome: '👋',
      verification_required: '🔐'
    };
    return icons[type] || '📢';
  }

  /**
   * Validate notification data
   * @param {Object} data - Notification data
   * @returns {Object} Validation result
   */
  validateNotificationData(data) {
    const errors = [];

    if (!data.user) errors.push('User ID is required');
    if (!data.type) errors.push('Notification type is required');
    if (!data.title) errors.push('Title is required');
    if (!data.message) errors.push('Message is required');

    if (data.title && data.title.length > 100) {
      errors.push('Title must be 100 characters or less');
    }

    if (data.message && data.message.length > 500) {
      errors.push('Message must be 500 characters or less');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get default notification preferences
   * @returns {Object} Default preferences
   */
  getDefaultPreferences() {
    return {
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
  }
}

// Create singleton instance
export const notificationService = new LUDUSNotificationService();
export default notificationService;