import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/notification_model.dart';

class NotificationService {
  static const String baseUrl = 'http://localhost:5000/api'; // Update with your backend URL
  
  // Get user notifications
  static Future<List<NotificationModel>> getUserNotifications(String userId, {int? limit, int? offset}) async {
    try {
      final queryParams = <String, String>{};
      if (limit != null) queryParams['limit'] = limit.toString();
      if (offset != null) queryParams['offset'] = offset.toString();

      final uri = Uri.parse('$baseUrl/notifications/$userId').replace(queryParameters: queryParams);
      
      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body)['data'];
        return data.map((json) => NotificationModel.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load notifications: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching notifications: $e');
    }
  }

  // Get notification by ID
  static Future<NotificationModel> getNotificationById(String notificationId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/notifications/detail/$notificationId'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return NotificationModel.fromJson(data);
      } else {
        throw Exception('Failed to load notification: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching notification: $e');
    }
  }

  // Mark notification as read
  static Future<NotificationModel> markAsRead(String notificationId) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/notifications/$notificationId/read'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return NotificationModel.fromJson(data);
      } else {
        throw Exception('Failed to mark notification as read: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error marking notification as read: $e');
    }
  }

  // Mark all notifications as read
  static Future<void> markAllAsRead(String userId) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/notifications/$userId/read-all'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to mark all notifications as read: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error marking all notifications as read: $e');
    }
  }

  // Archive notification
  static Future<NotificationModel> archiveNotification(String notificationId) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/notifications/$notificationId/archive'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return NotificationModel.fromJson(data);
      } else {
        throw Exception('Failed to archive notification: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error archiving notification: $e');
    }
  }

  // Delete notification
  static Future<void> deleteNotification(String notificationId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/notifications/$notificationId'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to delete notification: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error deleting notification: $e');
    }
  }

  // Get notification settings
  static Future<NotificationSettings> getNotificationSettings(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/notifications/$userId/settings'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return NotificationSettings.fromJson(data);
      } else {
        throw Exception('Failed to load notification settings: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching notification settings: $e');
    }
  }

  // Update notification settings
  static Future<NotificationSettings> updateNotificationSettings(String userId, Map<String, dynamic> settings) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/notifications/$userId/settings'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode(settings),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return NotificationSettings.fromJson(data);
      } else {
        throw Exception('Failed to update notification settings: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error updating notification settings: $e');
    }
  }

  // Register device token for push notifications
  static Future<void> registerDeviceToken(String userId, String deviceToken, String platform) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/notifications/$userId/register-device'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'deviceToken': deviceToken,
          'platform': platform,
        }),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to register device token: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error registering device token: $e');
    }
  }

  // Unregister device token
  static Future<void> unregisterDeviceToken(String userId, String deviceToken) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/notifications/$userId/unregister-device'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'deviceToken': deviceToken,
        }),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to unregister device token: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error unregistering device token: $e');
    }
  }

  // Get unread notification count
  static Future<int> getUnreadCount(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/notifications/$userId/unread-count'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return data['count'] ?? 0;
      } else {
        throw Exception('Failed to get unread count: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting unread count: $e');
    }
  }

  // Send test notification
  static Future<void> sendTestNotification(String userId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/notifications/$userId/test'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to send test notification: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error sending test notification: $e');
    }
  }

  // Get notification statistics
  static Future<Map<String, dynamic>> getNotificationStats(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/notifications/$userId/stats'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return json.decode(response.body)['data'];
      } else {
        throw Exception('Failed to get notification stats: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting notification stats: $e');
    }
  }

  // Create local notification (for testing)
  static Future<void> createLocalNotification({
    required String title,
    required String body,
    String? payload,
    Map<String, dynamic>? data,
  }) async {
    // TODO: Implement local notification using flutter_local_notifications
    // This would be used for local notifications when the app is in foreground
    print('Local notification: $title - $body');
  }

  // Schedule local notification
  static Future<void> scheduleLocalNotification({
    required String title,
    required String body,
    required DateTime scheduledDate,
    String? payload,
    Map<String, dynamic>? data,
  }) async {
    // TODO: Implement scheduled local notification
    print('Scheduled notification: $title - $body at $scheduledDate');
  }

  // Cancel local notification
  static Future<void> cancelLocalNotification(int id) async {
    // TODO: Implement cancel local notification
    print('Cancelled notification: $id');
  }

  // Cancel all local notifications
  static Future<void> cancelAllLocalNotifications() async {
    // TODO: Implement cancel all local notifications
    print('Cancelled all notifications');
  }

  // Check notification permissions
  static Future<bool> checkNotificationPermissions() async {
    // TODO: Implement permission check
    // This would check if the app has permission to send notifications
    return true;
  }

  // Request notification permissions
  static Future<bool> requestNotificationPermissions() async {
    // TODO: Implement permission request
    // This would request permission to send notifications
    return true;
  }

  // Handle notification tap
  static void handleNotificationTap(Map<String, dynamic> data) {
    // TODO: Implement notification tap handling
    // This would handle when a user taps on a notification
    print('Notification tapped: $data');
  }

  // Format notification data for display
  static Map<String, dynamic> formatNotificationData(NotificationModel notification) {
    return {
      'id': notification.id,
      'title': notification.title,
      'body': notification.body,
      'type': notification.typeDisplayName,
      'priority': notification.priorityDisplayName,
      'timeAgo': notification.timeAgo,
      'isRead': notification.isRead,
      'isUrgent': notification.isUrgent,
      'hasImage': notification.hasImage,
      'hasAction': notification.hasAction,
      'actionUrl': notification.actionUrl,
      'data': notification.data,
    };
  }

  // Validate notification data
  static Map<String, String> validateNotificationData(Map<String, dynamic> data) {
    final errors = <String, String>{};

    if (data['title'] == null || data['title'].toString().trim().isEmpty) {
      errors['title'] = 'Title is required';
    }

    if (data['body'] == null || data['body'].toString().trim().isEmpty) {
      errors['body'] = 'Body is required';
    }

    if (data['type'] == null) {
      errors['type'] = 'Type is required';
    }

    return errors;
  }
}
