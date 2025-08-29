import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:connectivity_plus/connectivity_plus.dart';
import '../models/offline_model.dart';

class OfflineService {
  static const String baseUrl = 'http://localhost:5000/api'; // Update with your backend URL
  
  // Check network connectivity
  static Future<bool> isConnected() async {
    try {
      final connectivityResult = await Connectivity().checkConnectivity();
      return connectivityResult != ConnectivityResult.none;
    } catch (e) {
      return false;
    }
  }

  // Check if connected to WiFi
  static Future<bool> isWifiConnected() async {
    try {
      final connectivityResult = await Connectivity().checkConnectivity();
      return connectivityResult == ConnectivityResult.wifi;
    } catch (e) {
      return false;
    }
  }

  // Cache data locally
  static Future<void> cacheData({
    required String userId,
    required CacheType type,
    required String dataKey,
    required Map<String, dynamic> data,
    Duration? expiry,
  }) async {
    try {
      // TODO: Implement local storage (SharedPreferences, Hive, or SQLite)
      // This would store data locally for offline access
      print('Caching data: $type - $dataKey');
    } catch (e) {
      throw Exception('Error caching data: $e');
    }
  }

  // Get cached data
  static Future<Map<String, dynamic>?> getCachedData({
    required String userId,
    required CacheType type,
    required String dataKey,
  }) async {
    try {
      // TODO: Implement local storage retrieval
      // This would retrieve cached data from local storage
      print('Getting cached data: $type - $dataKey');
      return null;
    } catch (e) {
      throw Exception('Error getting cached data: $e');
    }
  }

  // Check if data is cached and valid
  static Future<bool> isDataCached({
    required String userId,
    required CacheType type,
    required String dataKey,
  }) async {
    try {
      // TODO: Implement cache validation
      // This would check if data exists and is not expired
      return false;
    } catch (e) {
      return false;
    }
  }

  // Clear cached data
  static Future<void> clearCache({
    String? userId,
    CacheType? type,
  }) async {
    try {
      // TODO: Implement cache clearing
      // This would clear cached data based on parameters
      print('Clearing cache: ${userId ?? 'all'} - ${type ?? 'all'}');
    } catch (e) {
      throw Exception('Error clearing cache: $e');
    }
  }

  // Add item to sync queue
  static Future<void> addToSyncQueue({
    required String userId,
    required String operation,
    required String endpoint,
    required Map<String, dynamic> data,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      // TODO: Implement sync queue storage
      // This would add operations to a queue for later synchronization
      print('Adding to sync queue: $operation - $endpoint');
    } catch (e) {
      throw Exception('Error adding to sync queue: $e');
    }
  }

  // Get sync queue items
  static Future<List<SyncQueue>> getSyncQueue(String userId) async {
    try {
      // TODO: Implement sync queue retrieval
      // This would get pending sync operations
      return [];
    } catch (e) {
      throw Exception('Error getting sync queue: $e');
    }
  }

  // Process sync queue
  static Future<void> processSyncQueue(String userId) async {
    try {
      final queue = await getSyncQueue(userId);
      
      for (final item in queue) {
        if (item.canRetry) {
          await _processSyncItem(item);
        }
      }
    } catch (e) {
      throw Exception('Error processing sync queue: $e');
    }
  }

  // Process individual sync item
  static Future<void> _processSyncItem(SyncQueue item) async {
    try {
      // Update status to syncing
      await _updateSyncItemStatus(item.id, SyncStatus.syncing);

      // Perform the operation
      final response = await _performSyncOperation(item);
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        // Success - remove from queue
        await _removeSyncItem(item.id);
      } else {
        // Failed - update retry count and status
        await _updateSyncItemFailed(item.id, 'HTTP ${response.statusCode}');
      }
    } catch (e) {
      // Failed - update retry count and status
      await _updateSyncItemFailed(item.id, e.toString());
    }
  }

  // Perform sync operation
  static Future<http.Response> _performSyncOperation(SyncQueue item) async {
    switch (item.operation.toLowerCase()) {
      case 'post':
        return await http.post(
          Uri.parse('$baseUrl${item.endpoint}'),
          headers: {'Content-Type': 'application/json'},
          body: json.encode(item.data),
        );
      case 'put':
        return await http.put(
          Uri.parse('$baseUrl${item.endpoint}'),
          headers: {'Content-Type': 'application/json'},
          body: json.encode(item.data),
        );
      case 'patch':
        return await http.patch(
          Uri.parse('$baseUrl${item.endpoint}'),
          headers: {'Content-Type': 'application/json'},
          body: json.encode(item.data),
        );
      case 'delete':
        return await http.delete(
          Uri.parse('$baseUrl${item.endpoint}'),
          headers: {'Content-Type': 'application/json'},
          body: json.encode(item.data),
        );
      default:
        throw Exception('Unsupported operation: ${item.operation}');
    }
  }

  // Update sync item status
  static Future<void> _updateSyncItemStatus(String itemId, SyncStatus status) async {
    try {
      // TODO: Implement sync item status update
      print('Updating sync item status: $itemId - $status');
    } catch (e) {
      throw Exception('Error updating sync item status: $e');
    }
  }

  // Update sync item as failed
  static Future<void> _updateSyncItemFailed(String itemId, String error) async {
    try {
      // TODO: Implement sync item failure update
      print('Updating sync item failed: $itemId - $error');
    } catch (e) {
      throw Exception('Error updating sync item failed: $e');
    }
  }

  // Remove sync item
  static Future<void> _removeSyncItem(String itemId) async {
    try {
      // TODO: Implement sync item removal
      print('Removing sync item: $itemId');
    } catch (e) {
      throw Exception('Error removing sync item: $e');
    }
  }

  // Sync data with server
  static Future<void> syncData({
    required String userId,
    required CacheType type,
    Map<String, dynamic>? data,
  }) async {
    try {
      if (!await isConnected()) {
        throw Exception('No internet connection');
      }

      // TODO: Implement data synchronization
      // This would sync local data with the server
      print('Syncing data: $type');
    } catch (e) {
      throw Exception('Error syncing data: $e');
    }
  }

  // Get offline settings
  static Future<OfflineSettings> getOfflineSettings(String userId) async {
    try {
      // TODO: Implement offline settings retrieval
      // This would get user's offline preferences
      return OfflineSettings(
        userId: userId,
        updatedAt: DateTime.now(),
      );
    } catch (e) {
      throw Exception('Error getting offline settings: $e');
    }
  }

  // Update offline settings
  static Future<OfflineSettings> updateOfflineSettings(String userId, Map<String, dynamic> settings) async {
    try {
      // TODO: Implement offline settings update
      // This would update user's offline preferences
      return OfflineSettings(
        userId: userId,
        updatedAt: DateTime.now(),
      );
    } catch (e) {
      throw Exception('Error updating offline settings: $e');
    }
  }

  // Get sync statistics
  static Future<SyncStats> getSyncStats(String userId) async {
    try {
      // TODO: Implement sync statistics retrieval
      // This would get synchronization statistics
      return SyncStats(
        userId: userId,
        lastSync: DateTime.now(),
        updatedAt: DateTime.now(),
      );
    } catch (e) {
      throw Exception('Error getting sync stats: $e');
    }
  }

  // Preload data for offline use
  static Future<void> preloadData(String userId, List<CacheType> types) async {
    try {
      if (!await isConnected()) {
        throw Exception('No internet connection for preloading');
      }

      for (final type in types) {
        await _preloadDataType(userId, type);
      }
    } catch (e) {
      throw Exception('Error preloading data: $e');
    }
  }

  // Preload specific data type
  static Future<void> _preloadDataType(String userId, CacheType type) async {
    try {
      switch (type) {
        case CacheType.activities:
          await _preloadActivities(userId);
          break;
        case CacheType.bookings:
          await _preloadBookings(userId);
          break;
        case CacheType.payments:
          await _preloadPayments(userId);
          break;
        case CacheType.profile:
          await _preloadProfile(userId);
          break;
        case CacheType.notifications:
          await _preloadNotifications(userId);
          break;
        case CacheType.favorites:
          await _preloadFavorites(userId);
          break;
      }
    } catch (e) {
      print('Error preloading $type: $e');
    }
  }

  // Preload activities
  static Future<void> _preloadActivities(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/activities'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        await cacheData(
          userId: userId,
          type: CacheType.activities,
          dataKey: 'all_activities',
          data: data,
          expiry: const Duration(hours: 24),
        );
      }
    } catch (e) {
      print('Error preloading activities: $e');
    }
  }

  // Preload bookings
  static Future<void> _preloadBookings(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/bookings/user/$userId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        await cacheData(
          userId: userId,
          type: CacheType.bookings,
          dataKey: 'user_bookings',
          data: data,
          expiry: const Duration(hours: 6),
        );
      }
    } catch (e) {
      print('Error preloading bookings: $e');
    }
  }

  // Preload payments
  static Future<void> _preloadPayments(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/payments/user/$userId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        await cacheData(
          userId: userId,
          type: CacheType.payments,
          dataKey: 'user_payments',
          data: data,
          expiry: const Duration(hours: 6),
        );
      }
    } catch (e) {
      print('Error preloading payments: $e');
    }
  }

  // Preload profile
  static Future<void> _preloadProfile(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/profiles/$userId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        await cacheData(
          userId: userId,
          type: CacheType.profile,
          dataKey: 'user_profile',
          data: data,
          expiry: const Duration(hours: 12),
        );
      }
    } catch (e) {
      print('Error preloading profile: $e');
    }
  }

  // Preload notifications
  static Future<void> _preloadNotifications(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/notifications/$userId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        await cacheData(
          userId: userId,
          type: CacheType.notifications,
          dataKey: 'user_notifications',
          data: data,
          expiry: const Duration(hours: 2),
        );
      }
    } catch (e) {
      print('Error preloading notifications: $e');
    }
  }

  // Preload favorites
  static Future<void> _preloadFavorites(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/profiles/$userId/favorites'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        await cacheData(
          userId: userId,
          type: CacheType.favorites,
          dataKey: 'user_favorites',
          data: data,
          expiry: const Duration(hours: 24),
        );
      }
    } catch (e) {
      print('Error preloading favorites: $e');
    }
  }

  // Check if data needs refresh
  static Future<bool> needsRefresh({
    required String userId,
    required CacheType type,
    required String dataKey,
    Duration? maxAge,
  }) async {
    try {
      // TODO: Implement refresh check
      // This would check if cached data is stale and needs refresh
      return false;
    } catch (e) {
      return true;
    }
  }

  // Get cache size
  static Future<int> getCacheSize() async {
    try {
      // TODO: Implement cache size calculation
      // This would calculate the total size of cached data
      return 0;
    } catch (e) {
      return 0;
    }
  }

  // Export offline data
  static Future<Map<String, dynamic>> exportOfflineData(String userId) async {
    try {
      // TODO: Implement offline data export
      // This would export all cached data for backup
      return {};
    } catch (e) {
      throw Exception('Error exporting offline data: $e');
    }
  }

  // Import offline data
  static Future<void> importOfflineData(String userId, Map<String, dynamic> data) async {
    try {
      // TODO: Implement offline data import
      // This would import cached data from backup
      print('Importing offline data for user: $userId');
    } catch (e) {
      throw Exception('Error importing offline data: $e');
    }
  }
}
