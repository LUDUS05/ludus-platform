import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/notification_model.dart';
import '../services/notification_service.dart';

// Notification state
class NotificationState {
  final List<NotificationModel> notifications;
  final NotificationSettings? settings;
  final int unreadCount;
  final bool isLoading;
  final String? error;
  final bool isUpdating;
  final Map<String, dynamic>? stats;

  const NotificationState({
    this.notifications = const [],
    this.settings,
    this.unreadCount = 0,
    this.isLoading = false,
    this.error,
    this.isUpdating = false,
    this.stats,
  });

  NotificationState copyWith({
    List<NotificationModel>? notifications,
    NotificationSettings? settings,
    int? unreadCount,
    bool? isLoading,
    String? error,
    bool? isUpdating,
    Map<String, dynamic>? stats,
  }) {
    return NotificationState(
      notifications: notifications ?? this.notifications,
      settings: settings ?? this.settings,
      unreadCount: unreadCount ?? this.unreadCount,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      isUpdating: isUpdating ?? this.isUpdating,
      stats: stats ?? this.stats,
    );
  }
}

// Notification notifier
class NotificationNotifier extends StateNotifier<NotificationState> {
  NotificationNotifier() : super(const NotificationState());

  // Load user notifications
  Future<void> loadUserNotifications(String userId, {int? limit, int? offset}) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final notifications = await NotificationService.getUserNotifications(userId, limit: limit, offset: offset);
      state = state.copyWith(
        notifications: notifications,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  // Load notification settings
  Future<void> loadNotificationSettings(String userId) async {
    try {
      final settings = await NotificationService.getNotificationSettings(userId);
      state = state.copyWith(settings: settings);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Update notification settings
  Future<NotificationSettings?> updateNotificationSettings(String userId, Map<String, dynamic> settings) async {
    state = state.copyWith(isUpdating: true, error: null);

    try {
      final updatedSettings = await NotificationService.updateNotificationSettings(userId, settings);
      state = state.copyWith(
        settings: updatedSettings,
        isUpdating: false,
      );
      return updatedSettings;
    } catch (e) {
      state = state.copyWith(
        isUpdating: false,
        error: e.toString(),
      );
      return null;
    }
  }

  // Mark notification as read
  Future<NotificationModel?> markAsRead(String notificationId) async {
    try {
      final notification = await NotificationService.markAsRead(notificationId);
      
      // Update in notifications list
      final updatedNotifications = state.notifications.map((n) {
        if (n.id == notificationId) {
          return notification;
        }
        return n;
      }).toList();

      state = state.copyWith(
        notifications: updatedNotifications,
        unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0,
      );

      return notification;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  // Mark all notifications as read
  Future<void> markAllAsRead(String userId) async {
    try {
      await NotificationService.markAllAsRead(userId);
      
      // Update all notifications to read status
      final updatedNotifications = state.notifications.map((n) {
        return n.copyWith(status: NotificationStatus.read);
      }).toList();

      state = state.copyWith(
        notifications: updatedNotifications,
        unreadCount: 0,
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Archive notification
  Future<NotificationModel?> archiveNotification(String notificationId) async {
    try {
      final notification = await NotificationService.archiveNotification(notificationId);
      
      // Update in notifications list
      final updatedNotifications = state.notifications.map((n) {
        if (n.id == notificationId) {
          return notification;
        }
        return n;
      }).toList();

      state = state.copyWith(notifications: updatedNotifications);

      return notification;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  // Delete notification
  Future<bool> deleteNotification(String notificationId) async {
    try {
      await NotificationService.deleteNotification(notificationId);
      
      // Remove from notifications list
      final updatedNotifications = state.notifications.where((n) => n.id != notificationId).toList();
      
      // Update unread count if notification was unread
      final deletedNotification = state.notifications.firstWhere((n) => n.id == notificationId);
      final newUnreadCount = deletedNotification.isUnread && state.unreadCount > 0 
          ? state.unreadCount - 1 
          : state.unreadCount;

      state = state.copyWith(
        notifications: updatedNotifications,
        unreadCount: newUnreadCount,
      );

      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  // Load unread count
  Future<void> loadUnreadCount(String userId) async {
    try {
      final count = await NotificationService.getUnreadCount(userId);
      state = state.copyWith(unreadCount: count);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Load notification statistics
  Future<void> loadNotificationStats(String userId) async {
    try {
      final stats = await NotificationService.getNotificationStats(userId);
      state = state.copyWith(stats: stats);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Register device token
  Future<bool> registerDeviceToken(String userId, String deviceToken, String platform) async {
    try {
      await NotificationService.registerDeviceToken(userId, deviceToken, platform);
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  // Unregister device token
  Future<bool> unregisterDeviceToken(String userId, String deviceToken) async {
    try {
      await NotificationService.unregisterDeviceToken(userId, deviceToken);
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  // Send test notification
  Future<bool> sendTestNotification(String userId) async {
    try {
      await NotificationService.sendTestNotification(userId);
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  // Create local notification
  Future<void> createLocalNotification({
    required String title,
    required String body,
    String? payload,
    Map<String, dynamic>? data,
  }) async {
    try {
      await NotificationService.createLocalNotification(
        title: title,
        body: body,
        payload: payload,
        data: data,
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Schedule local notification
  Future<void> scheduleLocalNotification({
    required String title,
    required String body,
    required DateTime scheduledDate,
    String? payload,
    Map<String, dynamic>? data,
  }) async {
    try {
      await NotificationService.scheduleLocalNotification(
        title: title,
        body: body,
        scheduledDate: scheduledDate,
        payload: payload,
        data: data,
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Add notification to list (for real-time updates)
  void addNotification(NotificationModel notification) {
    final updatedNotifications = [notification, ...state.notifications];
    final newUnreadCount = notification.isUnread ? state.unreadCount + 1 : state.unreadCount;
    
    state = state.copyWith(
      notifications: updatedNotifications,
      unreadCount: newUnreadCount,
    );
  }

  // Update notification in list
  void updateNotification(NotificationModel notification) {
    final updatedNotifications = state.notifications.map((n) {
      if (n.id == notification.id) {
        return notification;
      }
      return n;
    }).toList();

    state = state.copyWith(notifications: updatedNotifications);
  }

  // Remove notification from list
  void removeNotification(String notificationId) {
    final updatedNotifications = state.notifications.where((n) => n.id != notificationId).toList();
    state = state.copyWith(notifications: updatedNotifications);
  }

  // Refresh all notification data
  Future<void> refreshNotificationData(String userId) async {
    await Future.wait([
      loadUserNotifications(userId),
      loadNotificationSettings(userId),
      loadUnreadCount(userId),
      loadNotificationStats(userId),
    ]);
  }

  // Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }

  // Clear notifications
  void clearNotifications() {
    state = state.copyWith(notifications: [], unreadCount: 0);
  }
}

// Providers
final notificationProvider = StateNotifierProvider<NotificationNotifier, NotificationState>((ref) {
  return NotificationNotifier();
});

final notificationsProvider = Provider<List<NotificationModel>>((ref) {
  return ref.watch(notificationProvider).notifications;
});

final notificationSettingsProvider = Provider<NotificationSettings?>((ref) {
  return ref.watch(notificationProvider).settings;
});

final unreadCountProvider = Provider<int>((ref) {
  return ref.watch(notificationProvider).unreadCount;
});

final notificationLoadingProvider = Provider<bool>((ref) {
  return ref.watch(notificationProvider).isLoading;
});

final notificationUpdatingProvider = Provider<bool>((ref) {
  return ref.watch(notificationProvider).isUpdating;
});

final notificationErrorProvider = Provider<String?>((ref) {
  return ref.watch(notificationProvider).error;
});

final notificationStatsProvider = Provider<Map<String, dynamic>?>((ref) {
  return ref.watch(notificationProvider).stats;
});

// Individual notification provider
final notificationByIdProvider = FutureProvider.family<NotificationModel?, String>((ref, notificationId) async {
  try {
    return await NotificationService.getNotificationById(notificationId);
  } catch (e) {
    return null;
  }
});

// Unread notifications provider
final unreadNotificationsProvider = Provider<List<NotificationModel>>((ref) {
  final notifications = ref.watch(notificationsProvider);
  return notifications.where((n) => n.isUnread).toList();
});

// High priority notifications provider
final highPriorityNotificationsProvider = Provider<List<NotificationModel>>((ref) {
  final notifications = ref.watch(notificationsProvider);
  return notifications.where((n) => n.isHighPriority).toList();
});

// Notifications by type provider
final notificationsByTypeProvider = Provider.family<List<NotificationModel>, NotificationType>((ref, type) {
  final notifications = ref.watch(notificationsProvider);
  return notifications.where((n) => n.type == type).toList();
});

// Notification summary provider
final notificationSummaryProvider = Provider<Map<String, dynamic>>((ref) {
  final notifications = ref.watch(notificationsProvider);
  final unreadCount = ref.watch(unreadCountProvider);
  final stats = ref.watch(notificationStatsProvider);

  return {
    'totalNotifications': notifications.length,
    'unreadCount': unreadCount,
    'readCount': notifications.where((n) => n.isRead).length,
    'archivedCount': notifications.where((n) => n.isArchived).length,
    'urgentCount': notifications.where((n) => n.isUrgent).length,
    'stats': stats,
  };
});
