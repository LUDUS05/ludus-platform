import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock notifications - replace with real API call
    setTimeout(() => {
      setNotifications([
        {
          id: 1,
          type: 'booking',
          title: 'New Booking Received',
          message: 'Rock Climbing Adventure booked by Ahmed Al-Rashid',
          time: '2 minutes ago',
          status: 'unread',
          priority: 'high'
        },
        {
          id: 2,
          type: 'payment',
          title: 'Payment Processed',
          message: 'SAR 150 payment completed for booking #LDS-789',
          time: '15 minutes ago',
          status: 'unread',
          priority: 'medium'
        },
        {
          id: 3,
          type: 'vendor',
          title: 'New Vendor Registration',
          message: 'Adventure Sports Center has submitted registration',
          time: '1 hour ago',
          status: 'read',
          priority: 'medium'
        },
        {
          id: 4,
          type: 'system',
          title: 'System Maintenance',
          message: 'Scheduled maintenance completed successfully',
          time: '3 hours ago',
          status: 'read',
          priority: 'low'
        },
        {
          id: 5,
          type: 'review',
          title: 'New Review Submitted',
          message: '5-star review for Cooking Workshop',
          time: '5 hours ago',
          status: 'read',
          priority: 'low'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getNotificationIcon = (type) => {
    const icons = {
      booking: '📅',
      payment: '💰',
      vendor: '🏢',
      system: '⚙️',
      review: '⭐'
    };
    return icons[type] || '📢';
  };

  const getNotificationColor = (priority) => {
    const colors = {
      high: 'border-l-error bg-error/5 dark:bg-dark-error/5',
      medium: 'border-l-warning bg-warning/5 dark:bg-dark-warning/5',
      low: 'border-l-info bg-info/5 dark:bg-dark-info/5'
    };
    return colors[priority] || colors.low;
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, status: 'read' } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, status: 'read' }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-ludus-orange dark:border-dark-ludus-orange border-t-transparent"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="px-6 py-4 border-b border-warm dark:border-dark-border-secondary">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-body-lg font-semibold text-charcoal dark:text-dark-text-primary">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-error text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-ludus-orange dark:text-dark-ludus-orange"
            >
              Mark all read
            </Button>
          )}
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="divide-y divide-warm-light dark:divide-dark-border-tertiary">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-l-4 transition-all duration-200 hover:bg-warm-light dark:hover:bg-dark-bg-tertiary ${
                  getNotificationColor(notification.priority)
                } ${
                  notification.status === 'unread' ? 'bg-ludus-orange/5 dark:bg-dark-ludus-orange/5' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-ludus-orange/10 dark:bg-dark-ludus-orange/10 rounded-lg flex items-center justify-center mt-1">
                      <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className={`text-body-sm font-semibold ${
                          notification.status === 'unread' 
                            ? 'text-charcoal dark:text-dark-text-primary' 
                            : 'text-charcoal-light dark:text-dark-text-secondary'
                        }`}>
                          {notification.title}
                        </h4>
                        {notification.status === 'unread' && (
                          <div className="w-2 h-2 bg-ludus-orange dark:bg-dark-ludus-orange rounded-full"></div>
                        )}
                      </div>
                      <p className={`text-body-xs mt-1 ${
                        notification.status === 'unread'
                          ? 'text-charcoal-light dark:text-dark-text-secondary'
                          : 'text-charcoal-light dark:text-dark-text-tertiary'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-body-xs text-charcoal-light dark:text-dark-text-tertiary mt-2">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    {notification.status === 'unread' && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-charcoal-light dark:text-dark-text-secondary hover:text-ludus-orange dark:hover:text-dark-ludus-orange transition-colors"
                        title="Mark as read"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-charcoal-light dark:text-dark-text-secondary hover:text-error dark:hover:text-dark-error transition-colors"
                      title="Delete notification"
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
              All caught up!
            </h4>
            <p className="text-body-sm text-charcoal-light dark:text-dark-text-secondary">
              No new notifications at the moment.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default NotificationCenter;