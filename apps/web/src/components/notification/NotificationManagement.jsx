/**
 * @fileoverview Enhanced notification management component for LUDUS platform
 * 
 * This component provides comprehensive notification management functionality
 * including viewing, filtering, searching, and managing notifications with
 * full RTL support for the Saudi Arabian market.
 * 
 * @version 2.0.0
 * @author LUDUS Development Team
 * @since 2025-01-27
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { notificationService } from '../../services/notificationService';

const NotificationManagement = () => {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState(null);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const options = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.priority !== 'all' && { priority: filters.priority })
      };

      const response = await notificationService.getNotifications(options);
      
      if (response.success) {
        const formattedNotifications = response.data.notifications.map(notification =>
          notificationService.formatNotificationForDisplay(notification, i18n.language)
        );
        
        setNotifications(formattedNotifications);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.message || 'Failed to load notifications');
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, i18n.language]);

  // Load preferences
  const loadPreferences = useCallback(async () => {
    try {
      const response = await notificationService.getNotificationPreferences();
      if (response.success) {
        setPreferences(response.data.preferences);
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadNotifications();
    loadPreferences();
  }, [loadNotifications, loadPreferences]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle search
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response.success) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === id ? { ...notif, isRead: true, isUnread: false } : notif
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true, isUnread: false }))
        );
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      const response = await notificationService.deleteNotification(id);
      if (response.success) {
        setNotifications(prev => prev.filter(notif => notif._id !== id));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Archive notification
  const archiveNotification = async (id) => {
    try {
      const response = await notificationService.markAsArchived(id);
      if (response.success) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === id ? { ...notif, status: 'archived' } : notif
          )
        );
      }
    } catch (err) {
      console.error('Error archiving notification:', err);
    }
  };

  // Update preferences
  const updatePreferences = async (newPreferences) => {
    try {
      const response = await notificationService.updateNotificationPreferences(newPreferences);
      if (response.success) {
        setPreferences(newPreferences);
        setShowPreferences(false);
      }
    } catch (err) {
      console.error('Error updating preferences:', err);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    return notificationService.getTypeIcon(type);
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-500',
      normal: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500'
    };
    return colors[priority] || colors.normal;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      unread: 'bg-blue-100 text-blue-800',
      read: 'bg-gray-100 text-gray-800',
      archived: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || colors.read;
  };

  // Filter notifications based on search
  const filteredNotifications = notifications.filter(notification => {
    if (!filters.search) return true;
    
    const searchTerm = filters.search.toLowerCase();
    return (
      notification.displayTitle.toLowerCase().includes(searchTerm) ||
      notification.displayMessage.toLowerCase().includes(searchTerm) ||
      notification.type.toLowerCase().includes(searchTerm)
    );
  });

  const unreadCount = notifications.filter(n => n.isUnread).length;

  if (loading && notifications.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-ludus-orange dark:border-dark-ludus-orange border-t-transparent"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-charcoal dark:text-dark-text-primary mb-2">
            {t('notifications.error.title')}
          </h3>
          <p className="text-charcoal-light dark:text-dark-text-secondary mb-4">
            {error}
          </p>
          <Button onClick={loadNotifications} variant="primary">
            {t('common.retry')}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <h2 className="text-2xl font-bold text-charcoal dark:text-dark-text-primary">
              {t('notifications.title')}
            </h2>
            {unreadCount > 0 && (
              <Badge variant="error" size="lg">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreferences(true)}
            >
              {t('notifications.preferences')}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={markAllAsRead}
              >
                {t('notifications.markAllRead')}
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-charcoal dark:text-dark-text-primary mb-2">
              {t('notifications.filters.status')}
            </label>
            <Select
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              options={[
                { value: 'all', label: t('notifications.filters.allStatuses') },
                { value: 'unread', label: t('notifications.filters.unread') },
                { value: 'read', label: t('notifications.filters.read') },
                { value: 'archived', label: t('notifications.filters.archived') }
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-charcoal dark:text-dark-text-primary mb-2">
              {t('notifications.filters.type')}
            </label>
            <Select
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
              options={[
                { value: 'all', label: t('notifications.filters.allTypes') },
                { value: 'booking_confirmed', label: t('notifications.types.bookingConfirmed') },
                { value: 'payment_success', label: t('notifications.types.paymentSuccess') },
                { value: 'promotion', label: t('notifications.types.promotion') },
                { value: 'system_announcement', label: t('notifications.types.systemAnnouncement') }
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-charcoal dark:text-dark-text-primary mb-2">
              {t('notifications.filters.priority')}
            </label>
            <Select
              value={filters.priority}
              onChange={(value) => handleFilterChange('priority', value)}
              options={[
                { value: 'all', label: t('notifications.filters.allPriorities') },
                { value: 'low', label: t('notifications.priorities.low') },
                { value: 'normal', label: t('notifications.priorities.normal') },
                { value: 'high', label: t('notifications.priorities.high') },
                { value: 'urgent', label: t('notifications.priorities.urgent') }
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-charcoal dark:text-dark-text-primary mb-2">
              {t('notifications.filters.search')}
            </label>
            <Input
              type="text"
              placeholder={t('notifications.filters.searchPlaceholder')}
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <Card>
        <div className="max-h-96 overflow-y-auto">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-warm-light dark:divide-dark-border-tertiary">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 transition-all duration-200 hover:bg-warm-light dark:hover:bg-dark-bg-tertiary ${
                    notification.isUnread ? 'bg-ludus-orange/5 dark:bg-dark-ludus-orange/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 rtl:space-x-reverse">
                      <div className="w-8 h-8 bg-ludus-orange/10 dark:bg-dark-ludus-orange/10 rounded-lg flex items-center justify-center mt-1">
                        <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <h4 className={`text-body-sm font-semibold ${
                            notification.isUnread 
                              ? 'text-charcoal dark:text-dark-text-primary' 
                              : 'text-charcoal-light dark:text-dark-text-secondary'
                          }`}>
                            {notification.displayTitle}
                          </h4>
                          <Badge 
                            variant="secondary" 
                            size="sm"
                            className={getStatusColor(notification.status)}
                          >
                            {t(`notifications.status.${notification.status}`)}
                          </Badge>
                          <span className={`text-xs ${getPriorityColor(notification.priority)}`}>
                            {t(`notifications.priorities.${notification.priority}`)}
                          </span>
                          {notification.isUrgent && (
                            <Badge variant="error" size="sm">
                              {t('notifications.urgent')}
                            </Badge>
                          )}
                        </div>
                        <p className={`text-body-xs mt-1 ${
                          notification.isUnread
                            ? 'text-charcoal-light dark:text-dark-text-secondary'
                            : 'text-charcoal-light dark:text-dark-text-tertiary'
                        }`}>
                          {notification.displayMessage}
                        </p>
                        <p className="text-body-xs text-charcoal-light dark:text-dark-text-tertiary mt-2">
                          {notification.timeAgo}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2 rtl:ml-0 rtl:mr-2">
                      {notification.isUnread && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="p-1 text-charcoal-light dark:text-dark-text-secondary hover:text-ludus-orange dark:hover:text-dark-ludus-orange transition-colors"
                          title={t('notifications.markAsRead')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => archiveNotification(notification._id)}
                        className="p-1 text-charcoal-light dark:text-dark-text-secondary hover:text-yellow-500 transition-colors"
                        title={t('notifications.archive')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 4 4-4" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="p-1 text-charcoal-light dark:text-dark-text-secondary hover:text-error dark:hover:text-dark-error transition-colors"
                        title={t('common.delete')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">🔔</div>
              <h4 className="text-body-md font-medium text-charcoal dark:text-dark-text-primary mb-2">
                {t('notifications.empty.title')}
              </h4>
              <p className="text-body-sm text-charcoal-light dark:text-dark-text-secondary">
                {t('notifications.empty.message')}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-charcoal-light dark:text-dark-text-secondary">
              {t('common.showing')} {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} {t('common.of')} {pagination.total}
            </p>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="ghost"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                {t('common.previous')}
              </Button>
              <span className="text-sm text-charcoal dark:text-dark-text-primary">
                {pagination.page} / {pagination.pages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                {t('common.next')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <NotificationPreferences
          preferences={preferences}
          onSave={updatePreferences}
          onClose={() => setShowPreferences(false)}
        />
      )}
    </div>
  );
};

// Notification Preferences Component
const NotificationPreferences = ({ preferences, onSave, onClose }) => {
  const { t } = useTranslation();
  const [localPreferences, setLocalPreferences] = useState(preferences || notificationService.getDefaultPreferences());

  const handleSave = () => {
    onSave(localPreferences);
  };

  const handleChannelChange = (channel, type, value) => {
    setLocalPreferences(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: value
      }
    }));
  };

  const handleQuietHoursChange = (field, value) => {
    setLocalPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-charcoal dark:text-dark-text-primary">
              {t('notifications.preferences.title')}
            </h3>
            <button
              onClick={onClose}
              className="text-charcoal-light dark:text-dark-text-secondary hover:text-charcoal dark:hover:text-dark-text-primary"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Email Preferences */}
            <div>
              <h4 className="text-lg font-semibold text-charcoal dark:text-dark-text-primary mb-4">
                {t('notifications.preferences.email')}
              </h4>
              <div className="space-y-3">
                {Object.entries(localPreferences.email).map(([type, enabled]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-charcoal dark:text-dark-text-primary">
                      {t(`notifications.preferences.types.${type}`)}
                    </span>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => handleChannelChange('email', type, e.target.checked)}
                      className="w-4 h-4 text-ludus-orange dark:text-dark-ludus-orange"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* SMS Preferences */}
            <div>
              <h4 className="text-lg font-semibold text-charcoal dark:text-dark-text-primary mb-4">
                {t('notifications.preferences.sms')}
              </h4>
              <div className="space-y-3">
                {Object.entries(localPreferences.sms).map(([type, enabled]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-charcoal dark:text-dark-text-primary">
                      {t(`notifications.preferences.types.${type}`)}
                    </span>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => handleChannelChange('sms', type, e.target.checked)}
                      className="w-4 h-4 text-ludus-orange dark:text-dark-ludus-orange"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Push Preferences */}
            <div>
              <h4 className="text-lg font-semibold text-charcoal dark:text-dark-text-primary mb-4">
                {t('notifications.preferences.push')}
              </h4>
              <div className="space-y-3">
                {Object.entries(localPreferences.push).map(([type, enabled]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-charcoal dark:text-dark-text-primary">
                      {t(`notifications.preferences.types.${type}`)}
                    </span>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => handleChannelChange('push', type, e.target.checked)}
                      className="w-4 h-4 text-ludus-orange dark:text-dark-ludus-orange"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Quiet Hours */}
            <div>
              <h4 className="text-lg font-semibold text-charcoal dark:text-dark-text-primary mb-4">
                {t('notifications.preferences.quietHours')}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-charcoal dark:text-dark-text-primary">
                    {t('notifications.preferences.enableQuietHours')}
                  </span>
                  <input
                    type="checkbox"
                    checked={localPreferences.quietHours.enabled}
                    onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
                    className="w-4 h-4 text-ludus-orange dark:text-dark-ludus-orange"
                  />
                </div>
                {localPreferences.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal dark:text-dark-text-primary mb-2">
                        {t('notifications.preferences.startTime')}
                      </label>
                      <Input
                        type="time"
                        value={localPreferences.quietHours.start}
                        onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal dark:text-dark-text-primary mb-2">
                        {t('notifications.preferences.endTime')}
                      </label>
                      <Input
                        type="time"
                        value={localPreferences.quietHours.end}
                        onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse mt-6">
            <Button variant="ghost" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {t('common.save')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotificationManagement;
