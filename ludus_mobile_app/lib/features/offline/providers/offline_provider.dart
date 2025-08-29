import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/offline_model.dart';
import '../services/offline_service.dart';

// Offline state
class OfflineState {
  final bool isConnected;
  final bool isWifiConnected;
  final bool isOfflineMode;
  final OfflineSettings? settings;
  final List<SyncQueue> syncQueue;
  final SyncStats? syncStats;
  final bool isSyncing;
  final bool isLoading;
  final String? error;
  final Map<CacheType, bool> cacheStatus;

  const OfflineState({
    this.isConnected = true,
    this.isWifiConnected = false,
    this.isOfflineMode = false,
    this.settings,
    this.syncQueue = const [],
    this.syncStats,
    this.isSyncing = false,
    this.isLoading = false,
    this.error,
    this.cacheStatus = const {},
  });

  OfflineState copyWith({
    bool? isConnected,
    bool? isWifiConnected,
    bool? isOfflineMode,
    OfflineSettings? settings,
    List<SyncQueue>? syncQueue,
    SyncStats? syncStats,
    bool? isSyncing,
    bool? isLoading,
    String? error,
    Map<CacheType, bool>? cacheStatus,
  }) {
    return OfflineState(
      isConnected: isConnected ?? this.isConnected,
      isWifiConnected: isWifiConnected ?? this.isWifiConnected,
      isOfflineMode: isOfflineMode ?? this.isOfflineMode,
      settings: settings ?? this.settings,
      syncQueue: syncQueue ?? this.syncQueue,
      syncStats: syncStats ?? this.syncStats,
      isSyncing: isSyncing ?? this.isSyncing,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      cacheStatus: cacheStatus ?? this.cacheStatus,
    );
  }
}

// Offline notifier
class OfflineNotifier extends StateNotifier<OfflineState> {
  OfflineNotifier() : super(const OfflineState());

  // Check connectivity
  Future<void> checkConnectivity() async {
    try {
      final isConnected = await OfflineService.isConnected();
      final isWifiConnected = await OfflineService.isWifiConnected();
      
      state = state.copyWith(
        isConnected: isConnected,
        isWifiConnected: isWifiConnected,
        isOfflineMode: !isConnected,
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Load offline settings
  Future<void> loadOfflineSettings(String userId) async {
    try {
      final settings = await OfflineService.getOfflineSettings(userId);
      state = state.copyWith(settings: settings);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Update offline settings
  Future<OfflineSettings?> updateOfflineSettings(String userId, Map<String, dynamic> settings) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final updatedSettings = await OfflineService.updateOfflineSettings(userId, settings);
      state = state.copyWith(
        settings: updatedSettings,
        isLoading: false,
      );
      return updatedSettings;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return null;
    }
  }

  // Load sync queue
  Future<void> loadSyncQueue(String userId) async {
    try {
      final queue = await OfflineService.getSyncQueue(userId);
      state = state.copyWith(syncQueue: queue);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Process sync queue
  Future<void> processSyncQueue(String userId) async {
    if (!state.isConnected) {
      state = state.copyWith(error: 'No internet connection');
      return;
    }

    state = state.copyWith(isSyncing: true, error: null);

    try {
      await OfflineService.processSyncQueue(userId);
      
      // Reload sync queue after processing
      await loadSyncQueue(userId);
      
      state = state.copyWith(isSyncing: false);
    } catch (e) {
      state = state.copyWith(
        isSyncing: false,
        error: e.toString(),
      );
    }
  }

  // Add to sync queue
  Future<void> addToSyncQueue({
    required String userId,
    required String operation,
    required String endpoint,
    required Map<String, dynamic> data,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      await OfflineService.addToSyncQueue(
        userId: userId,
        operation: operation,
        endpoint: endpoint,
        data: data,
        metadata: metadata,
      );
      
      // Reload sync queue
      await loadSyncQueue(userId);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Load sync statistics
  Future<void> loadSyncStats(String userId) async {
    try {
      final stats = await OfflineService.getSyncStats(userId);
      state = state.copyWith(syncStats: stats);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Cache data
  Future<void> cacheData({
    required String userId,
    required CacheType type,
    required String dataKey,
    required Map<String, dynamic> data,
    Duration? expiry,
  }) async {
    try {
      await OfflineService.cacheData(
        userId: userId,
        type: type,
        dataKey: dataKey,
        data: data,
        expiry: expiry,
      );
      
      // Update cache status
      final updatedCacheStatus = Map<CacheType, bool>.from(state.cacheStatus);
      updatedCacheStatus[type] = true;
      state = state.copyWith(cacheStatus: updatedCacheStatus);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Get cached data
  Future<Map<String, dynamic>?> getCachedData({
    required String userId,
    required CacheType type,
    required String dataKey,
  }) async {
    try {
      return await OfflineService.getCachedData(
        userId: userId,
        type: type,
        dataKey: dataKey,
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  // Check if data is cached
  Future<bool> isDataCached({
    required String userId,
    required CacheType type,
    required String dataKey,
  }) async {
    try {
      return await OfflineService.isDataCached(
        userId: userId,
        type: type,
        dataKey: dataKey,
      );
    } catch (e) {
      return false;
    }
  }

  // Clear cache
  Future<void> clearCache({
    String? userId,
    CacheType? type,
  }) async {
    try {
      await OfflineService.clearCache(userId: userId, type: type);
      
      // Update cache status
      if (type != null) {
        final updatedCacheStatus = Map<CacheType, bool>.from(state.cacheStatus);
        updatedCacheStatus[type] = false;
        state = state.copyWith(cacheStatus: updatedCacheStatus);
      } else {
        state = state.copyWith(cacheStatus: {});
      }
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Preload data
  Future<void> preloadData(String userId, List<CacheType> types) async {
    if (!state.isConnected) {
      state = state.copyWith(error: 'No internet connection for preloading');
      return;
    }

    state = state.copyWith(isLoading: true, error: null);

    try {
      await OfflineService.preloadData(userId, types);
      
      // Update cache status for preloaded types
      final updatedCacheStatus = Map<CacheType, bool>.from(state.cacheStatus);
      for (final type in types) {
        updatedCacheStatus[type] = true;
      }
      
      state = state.copyWith(
        isLoading: false,
        cacheStatus: updatedCacheStatus,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  // Sync data
  Future<void> syncData({
    required String userId,
    required CacheType type,
    Map<String, dynamic>? data,
  }) async {
    if (!state.isConnected) {
      state = state.copyWith(error: 'No internet connection for sync');
      return;
    }

    state = state.copyWith(isSyncing: true, error: null);

    try {
      await OfflineService.syncData(
        userId: userId,
        type: type,
        data: data,
      );
      
      state = state.copyWith(isSyncing: false);
    } catch (e) {
      state = state.copyWith(
        isSyncing: false,
        error: e.toString(),
      );
    }
  }

  // Check if data needs refresh
  Future<bool> needsRefresh({
    required String userId,
    required CacheType type,
    required String dataKey,
    Duration? maxAge,
  }) async {
    try {
      return await OfflineService.needsRefresh(
        userId: userId,
        type: type,
        dataKey: dataKey,
        maxAge: maxAge,
      );
    } catch (e) {
      return true;
    }
  }

  // Get cache size
  Future<int> getCacheSize() async {
    try {
      return await OfflineService.getCacheSize();
    } catch (e) {
      return 0;
    }
  }

  // Export offline data
  Future<Map<String, dynamic>?> exportOfflineData(String userId) async {
    try {
      return await OfflineService.exportOfflineData(userId);
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  // Import offline data
  Future<void> importOfflineData(String userId, Map<String, dynamic> data) async {
    try {
      await OfflineService.importOfflineData(userId, data);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Refresh all offline data
  Future<void> refreshOfflineData(String userId) async {
    await Future.wait([
      checkConnectivity(),
      loadOfflineSettings(userId),
      loadSyncQueue(userId),
      loadSyncStats(userId),
    ]);
  }

  // Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }

  // Toggle offline mode
  void toggleOfflineMode() {
    state = state.copyWith(isOfflineMode: !state.isOfflineMode);
  }
}

// Providers
final offlineProvider = StateNotifierProvider<OfflineNotifier, OfflineState>((ref) {
  return OfflineNotifier();
});

final connectivityProvider = Provider<bool>((ref) {
  return ref.watch(offlineProvider).isConnected;
});

final wifiProvider = Provider<bool>((ref) {
  return ref.watch(offlineProvider).isWifiConnected;
});

final offlineModeProvider = Provider<bool>((ref) {
  return ref.watch(offlineProvider).isOfflineMode;
});

final offlineSettingsProvider = Provider<OfflineSettings?>((ref) {
  return ref.watch(offlineProvider).settings;
});

final syncQueueProvider = Provider<List<SyncQueue>>((ref) {
  return ref.watch(offlineProvider).syncQueue;
});

final syncStatsProvider = Provider<SyncStats?>((ref) {
  return ref.watch(offlineProvider).syncStats;
});

final isSyncingProvider = Provider<bool>((ref) {
  return ref.watch(offlineProvider).isSyncing;
});

final offlineLoadingProvider = Provider<bool>((ref) {
  return ref.watch(offlineProvider).isLoading;
});

final offlineErrorProvider = Provider<String?>((ref) {
  return ref.watch(offlineProvider).error;
});

final cacheStatusProvider = Provider<Map<CacheType, bool>>((ref) {
  return ref.watch(offlineProvider).cacheStatus;
});

// Pending sync items provider
final pendingSyncItemsProvider = Provider<List<SyncQueue>>((ref) {
  final queue = ref.watch(syncQueueProvider);
  return queue.where((item) => item.isPending).toList();
});

// Failed sync items provider
final failedSyncItemsProvider = Provider<List<SyncQueue>>((ref) {
  final queue = ref.watch(syncQueueProvider);
  return queue.where((item) => item.isFailed).toList();
});

// Sync queue summary provider
final syncQueueSummaryProvider = Provider<Map<String, dynamic>>((ref) {
  final queue = ref.watch(syncQueueProvider);
  final stats = ref.watch(syncStatsProvider);
  
  return {
    'totalItems': queue.length,
    'pendingItems': queue.where((item) => item.isPending).length,
    'failedItems': queue.where((item) => item.isFailed).length,
    'completedItems': queue.where((item) => item.isCompleted).length,
    'canRetryItems': queue.where((item) => item.canRetry).length,
    'stats': stats,
  };
});

// Cache summary provider
final cacheSummaryProvider = Provider<Map<String, dynamic>>((ref) {
  final cacheStatus = ref.watch(cacheStatusProvider);
  final settings = ref.watch(offlineSettingsProvider);
  
  return {
    'totalCachedTypes': cacheStatus.length,
    'cachedTypes': cacheStatus.entries.where((e) => e.value).map((e) => e.key).toList(),
    'uncachedTypes': cacheStatus.entries.where((e) => !e.value).map((e) => e.key).toList(),
    'settings': settings,
  };
});
