import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../models/notification_model.dart';
import '../providers/notification_provider.dart';

class NotificationScreen extends ConsumerStatefulWidget {
  const NotificationScreen({super.key});

  @override
  ConsumerState<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends ConsumerState<NotificationScreen> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    // TODO: Get actual user ID from auth provider
    const userId = 'mock-user-id';
    _loadNotificationData(userId);
  }

  void _loadNotificationData(String userId) {
    ref.read(notificationProvider.notifier).refreshNotificationData(userId);
  }

  @override
  Widget build(BuildContext context) {
    final notificationState = ref.watch(notificationProvider);
    final notifications = notificationState.notifications;
    final isLoading = notificationState.isLoading;
    final error = notificationState.error;
    final unreadCount = notificationState.unreadCount;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Notifications'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.onPrimary,
        actions: [
          if (unreadCount > 0)
            IconButton(
              icon: Icon(Icons.done_all),
              onPressed: () {
                const userId = 'mock-user-id';
                ref.read(notificationProvider.notifier).markAllAsRead(userId);
              },
              tooltip: 'Mark all as read',
            ),
          IconButton(
            icon: Icon(Icons.settings),
            onPressed: () => context.push('/notifications/settings'),
          ),
        ],
      ),
      body: Column(
        children: [
          // Tab Bar
          _buildTabBar(),
          
          // Tab Content
          Expanded(
            child: Stack(
              children: [
                if (isLoading)
                  const Center(child: CircularProgressIndicator())
                else if (error != null)
                  _buildErrorWidget(error)
                else if (notifications.isEmpty)
                  _buildEmptyWidget()
                else
                  _buildTabContent(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorWidget(String error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 64,
            color: AppColors.error,
          ),
          const SizedBox(height: 16),
          Text(
            'Error loading notifications',
            style: AppTextStyles.titleLarge,
          ),
          const SizedBox(height: 8),
          Text(
            error,
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.error),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              const userId = 'mock-user-id';
              _loadNotificationData(userId);
            },
            child: Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyWidget() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_none,
            size: 64,
            color: AppColors.onSurface.withOpacity(0.6),
          ),
          const SizedBox(height: 16),
          Text(
            'No notifications yet',
            style: AppTextStyles.titleLarge,
          ),
          const SizedBox(height: 8),
          Text(
            'You\'ll see your notifications here when they arrive',
            style: AppTextStyles.bodyMedium,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          _buildTabButton('All', 0, Icons.notifications),
          _buildTabButton('Unread', 1, Icons.mark_email_unread),
          _buildTabButton('Urgent', 2, Icons.priority_high),
        ],
      ),
    );
  }

  Widget _buildTabButton(String title, int index, IconData icon) {
    final isSelected = _currentIndex == index;
    final unreadCount = ref.watch(unreadCountProvider);
    
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _currentIndex = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              Stack(
                children: [
                  Icon(
                    icon,
                    color: isSelected ? AppColors.onPrimary : AppColors.onSurface.withOpacity(0.6),
                    size: 20,
                  ),
                  if (index == 1 && unreadCount > 0)
                    Positioned(
                      right: -2,
                      top: -2,
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: BoxDecoration(
                          color: AppColors.error,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 12,
                          minHeight: 12,
                        ),
                        child: Text(
                          unreadCount > 99 ? '99+' : unreadCount.toString(),
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.onPrimary,
                            fontSize: 8,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                title,
                style: AppTextStyles.bodySmall.copyWith(
                  color: isSelected ? AppColors.onPrimary : AppColors.onSurface.withOpacity(0.6),
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTabContent() {
    switch (_currentIndex) {
      case 0:
        return _buildAllNotificationsTab();
      case 1:
        return _buildUnreadNotificationsTab();
      case 2:
        return _buildUrgentNotificationsTab();
      default:
        return _buildAllNotificationsTab();
    }
  }

  Widget _buildAllNotificationsTab() {
    final notifications = ref.watch(notificationsProvider);
    
    return RefreshIndicator(
      onRefresh: () async {
        const userId = 'mock-user-id';
        await ref.read(notificationProvider.notifier).loadUserNotifications(userId);
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: notifications.length,
        itemBuilder: (context, index) {
          final notification = notifications[index];
          return _buildNotificationCard(notification);
        },
      ),
    );
  }

  Widget _buildUnreadNotificationsTab() {
    final unreadNotifications = ref.watch(unreadNotificationsProvider);
    
    if (unreadNotifications.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.mark_email_read,
              size: 64,
              color: AppColors.onSurface.withOpacity(0.6),
            ),
            const SizedBox(height: 16),
            Text(
              'No unread notifications',
              style: AppTextStyles.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              'You\'re all caught up!',
              style: AppTextStyles.bodyMedium,
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        const userId = 'mock-user-id';
        await ref.read(notificationProvider.notifier).loadUserNotifications(userId);
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: unreadNotifications.length,
        itemBuilder: (context, index) {
          final notification = unreadNotifications[index];
          return _buildNotificationCard(notification);
        },
      ),
    );
  }

  Widget _buildUrgentNotificationsTab() {
    final urgentNotifications = ref.watch(highPriorityNotificationsProvider);
    
    if (urgentNotifications.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.priority_high,
              size: 64,
              color: AppColors.onSurface.withOpacity(0.6),
            ),
            const SizedBox(height: 16),
            Text(
              'No urgent notifications',
              style: AppTextStyles.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              'All clear! No urgent matters to attend to.',
              style: AppTextStyles.bodyMedium,
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        const userId = 'mock-user-id';
        await ref.read(notificationProvider.notifier).loadUserNotifications(userId);
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: urgentNotifications.length,
        itemBuilder: (context, index) {
          final notification = urgentNotifications[index];
          return _buildNotificationCard(notification);
        },
      ),
    );
  }

  Widget _buildNotificationCard(NotificationModel notification) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => _handleNotificationTap(notification),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: notification.isUnread 
                ? Border.all(color: AppColors.primary.withOpacity(0.3), width: 1)
                : null,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  // Notification Icon
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: _getNotificationTypeColor(notification.type).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      _getNotificationTypeIcon(notification.type),
                      color: _getNotificationTypeColor(notification.type),
                      size: 20,
                    ),
                  ),
                  
                  const SizedBox(width: 12),
                  
                  // Notification Content
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                notification.title,
                                style: AppTextStyles.bodyLarge.copyWith(
                                  fontWeight: notification.isUnread ? FontWeight.bold : FontWeight.normal,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (notification.isUrgent)
                              Icon(
                                Icons.priority_high,
                                color: AppColors.error,
                                size: 16,
                              ),
                          ],
                        ),
                        
                        const SizedBox(height: 4),
                        
                        Text(
                          notification.body,
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: AppColors.onSurface.withOpacity(0.7),
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Notification Footer
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: _getNotificationTypeColor(notification.type).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      notification.typeDisplayName,
                      style: AppTextStyles.bodySmall.copyWith(
                        color: _getNotificationTypeColor(notification.type),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  
                  const Spacer(),
                  
                  Text(
                    notification.timeAgo,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.onSurface.withOpacity(0.5),
                    ),
                  ),
                  
                  if (notification.isUnread) ...[
                    const SizedBox(width: 8),
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _handleNotificationTap(NotificationModel notification) {
    // Mark as read if unread
    if (notification.isUnread) {
      ref.read(notificationProvider.notifier).markAsRead(notification.id);
    }

    // Handle notification action
    if (notification.hasAction && notification.actionUrl != null) {
      // Navigate based on action URL
      if (notification.actionUrl!.startsWith('/booking/')) {
        context.push(notification.actionUrl!);
      } else if (notification.actionUrl!.startsWith('/activity/')) {
        context.push(notification.actionUrl!);
      } else if (notification.actionUrl!.startsWith('/payment/')) {
        context.push(notification.actionUrl!);
      }
    }

    // Handle notification data
    if (notification.data != null) {
      final data = notification.data!;
      if (data['type'] == 'booking') {
        context.push('/booking/${data['bookingId']}');
      } else if (data['type'] == 'activity') {
        context.push('/activity/${data['activityId']}');
      } else if (data['type'] == 'payment') {
        context.push('/payment/${data['paymentId']}');
      }
    }
  }

  Color _getNotificationTypeColor(NotificationType type) {
    switch (type) {
      case NotificationType.booking:
        return AppColors.primary;
      case NotificationType.payment:
        return AppColors.success;
      case NotificationType.activity:
        return AppColors.info;
      case NotificationType.system:
        return AppColors.warning;
      case NotificationType.marketing:
        return AppColors.error;
      case NotificationType.reminder:
        return AppColors.secondary;
    }
  }

  IconData _getNotificationTypeIcon(NotificationType type) {
    switch (type) {
      case NotificationType.booking:
        return Icons.book;
      case NotificationType.payment:
        return Icons.payment;
      case NotificationType.activity:
        return Icons.local_activity;
      case NotificationType.system:
        return Icons.settings;
      case NotificationType.marketing:
        return Icons.campaign;
      case NotificationType.reminder:
        return Icons.alarm;
    }
  }
}
