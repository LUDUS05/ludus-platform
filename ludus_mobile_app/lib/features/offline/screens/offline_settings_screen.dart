import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../models/offline_model.dart';
import '../providers/offline_provider.dart';

class OfflineSettingsScreen extends ConsumerStatefulWidget {
  const OfflineSettingsScreen({super.key});

  @override
  ConsumerState<OfflineSettingsScreen> createState() => _OfflineSettingsScreenState();
}

class _OfflineSettingsScreenState extends ConsumerState<OfflineSettingsScreen> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    const userId = 'mock-user-id';
    _loadOfflineData(userId);
  }

  void _loadOfflineData(String userId) {
    ref.read(offlineProvider.notifier).refreshOfflineData(userId);
  }

  @override
  Widget build(BuildContext context) {
    final offlineState = ref.watch(offlineProvider);
    final isConnected = offlineState.isConnected;
    final isWifiConnected = offlineState.isWifiConnected;
    final isLoading = offlineState.isLoading;
    final error = offlineState.error;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Offline Settings'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.onPrimary,
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: () {
              const userId = 'mock-user-id';
              _loadOfflineData(userId);
            },
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: Column(
        children: [
          // Connection Status
          _buildConnectionStatus(isConnected, isWifiConnected),
          
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
                else
                  _buildTabContent(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildConnectionStatus(bool isConnected, bool isWifiConnected) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isConnected ? AppColors.success.withOpacity(0.1) : AppColors.error.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isConnected ? AppColors.success : AppColors.error,
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Icon(
            isConnected ? Icons.wifi : Icons.wifi_off,
            color: isConnected ? AppColors.success : AppColors.error,
            size: 24,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isConnected ? 'Connected' : 'Offline',
                  style: AppTextStyles.bodyLarge.copyWith(
                    fontWeight: FontWeight.bold,
                    color: isConnected ? AppColors.success : AppColors.error,
                  ),
                ),
                Text(
                  isConnected 
                      ? (isWifiConnected ? 'WiFi Connection' : 'Mobile Data')
                      : 'No internet connection',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.onSurface.withOpacity(0.7),
                  ),
                ),
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
            'Error loading offline settings',
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
              _loadOfflineData(userId);
            },
            child: Text('Retry'),
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
          _buildTabButton('Settings', 0, Icons.settings),
          _buildTabButton('Sync Queue', 1, Icons.sync),
          _buildTabButton('Cache', 2, Icons.storage),
        ],
      ),
    );
  }

  Widget _buildTabButton(String title, int index, IconData icon) {
    final isSelected = _currentIndex == index;
    
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
              Icon(
                icon,
                color: isSelected ? AppColors.onPrimary : AppColors.onSurface.withOpacity(0.6),
                size: 20,
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
        return _buildSettingsTab();
      case 1:
        return _buildSyncQueueTab();
      case 2:
        return _buildCacheTab();
      default:
        return _buildSettingsTab();
    }
  }

  Widget _buildSettingsTab() {
    final settings = ref.watch(offlineSettingsProvider);
    
    if (settings == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.settings,
              size: 64,
              color: AppColors.onSurface.withOpacity(0.6),
            ),
            const SizedBox(height: 16),
            Text(
              'No settings available',
              style: AppTextStyles.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              'Offline settings will appear here',
              style: AppTextStyles.bodyMedium,
            ),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSettingsSection(
            'General Settings',
            [
              _buildSwitchTile(
                'Enable Offline Mode',
                'Allow the app to work without internet connection',
                settings.enableOfflineMode,
                (value) => _updateSetting('enableOfflineMode', value),
              ),
              _buildSwitchTile(
                'Auto Sync',
                'Automatically sync data when connection is available',
                settings.autoSync,
                (value) => _updateSetting('autoSync', value),
              ),
              _buildSwitchTile(
                'Sync on WiFi Only',
                'Only sync when connected to WiFi',
                settings.syncOnWifiOnly,
                (value) => _updateSetting('syncOnWifiOnly', value),
              ),
            ],
          ),
          
          const SizedBox(height: 24),
          
          _buildSettingsSection(
            'Cache Settings',
            [
              _buildSliderTile(
                'Cache Expiry',
                '${settings.cacheExpiry.inHours} hours',
                settings.cacheExpiry.inHours.toDouble(),
                1,
                72,
                (value) => _updateSetting('cacheExpiryMinutes', (value * 60).round()),
              ),
              _buildSliderTile(
                'Max Cache Size',
                '${settings.maxCacheSize} items',
                settings.maxCacheSize.toDouble(),
                10,
                500,
                (value) => _updateSetting('maxCacheSize', value.round()),
              ),
              _buildSliderTile(
                'Sync Interval',
                '${settings.syncInterval.inMinutes} minutes',
                settings.syncInterval.inMinutes.toDouble(),
                5,
                120,
                (value) => _updateSetting('syncIntervalMinutes', value.round()),
              ),
            ],
          ),
          
          const SizedBox(height: 24),
          
          _buildSettingsSection(
            'Cache Types',
            CacheType.values.map((type) => _buildCacheTypeTile(type, settings)).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildSyncQueueTab() {
    final syncQueue = ref.watch(syncQueueProvider);
    final syncStats = ref.watch(syncStatsProvider);
    final isSyncing = ref.watch(isSyncingProvider);
    
    return RefreshIndicator(
      onRefresh: () async {
        const userId = 'mock-user-id';
        await ref.read(offlineProvider.notifier).loadSyncQueue(userId);
      },
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Sync Stats
            if (syncStats != null) _buildSyncStatsCard(syncStats),
            
            const SizedBox(height: 16),
            
            // Sync Actions
            _buildSyncActionsCard(isSyncing),
            
            const SizedBox(height: 16),
            
            // Sync Queue
            Text(
              'Sync Queue (${syncQueue.length})',
              style: AppTextStyles.titleMedium,
            ),
            
            const SizedBox(height: 8),
            
            if (syncQueue.isEmpty)
              _buildEmptyQueueWidget()
            else
              ...syncQueue.map((item) => _buildSyncQueueItem(item)).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildCacheTab() {
    final cacheStatus = ref.watch(cacheStatusProvider);
    final cacheSummary = ref.watch(cacheSummaryProvider);
    
    return RefreshIndicator(
      onRefresh: () async {
        const userId = 'mock-user-id';
        await ref.read(offlineProvider.notifier).refreshOfflineData(userId);
      },
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Cache Summary
            _buildCacheSummaryCard(cacheSummary),
            
            const SizedBox(height: 16),
            
            // Cache Actions
            _buildCacheActionsCard(),
            
            const SizedBox(height: 16),
            
            // Cache Status
            Text(
              'Cache Status',
              style: AppTextStyles.titleMedium,
            ),
            
            const SizedBox(height: 8),
            
            ...CacheType.values.map((type) => _buildCacheStatusTile(type, cacheStatus)).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingsSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: AppTextStyles.titleMedium.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: Column(
            children: children,
          ),
        ),
      ],
    );
  }

  Widget _buildSwitchTile(String title, String subtitle, bool value, Function(bool) onChanged) {
    return ListTile(
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: Switch(
        value: value,
        onChanged: onChanged,
        activeColor: AppColors.primary,
      ),
    );
  }

  Widget _buildSliderTile(String title, String valueText, double value, double min, double max, Function(double) onChanged) {
    return ListTile(
      title: Text(title),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(valueText),
          Slider(
            value: value,
            min: min,
            max: max,
            divisions: ((max - min) / 5).round(),
            onChanged: onChanged,
            activeColor: AppColors.primary,
          ),
        ],
      ),
    );
  }

  Widget _buildCacheTypeTile(CacheType type, OfflineSettings settings) {
    final isEnabled = settings.isCacheTypeEnabled(type);
    
    return ListTile(
      title: Text(type.toString().split('.').last),
      subtitle: Text('Cache ${type.toString().split('.').last.toLowerCase()} data'),
      trailing: Switch(
        value: isEnabled,
        onChanged: (value) => _updateCacheType(type, value),
        activeColor: AppColors.primary,
      ),
    );
  }

  Widget _buildSyncStatsCard(SyncStats stats) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Sync Statistics',
              style: AppTextStyles.titleMedium.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildStatItem('Total', stats.totalSyncs.toString()),
                ),
                Expanded(
                  child: _buildStatItem('Success', stats.successfulSyncs.toString()),
                ),
                Expanded(
                  child: _buildStatItem('Failed', stats.failedSyncs.toString()),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Last sync: ${stats.formattedLastSync}',
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.onSurface.withOpacity(0.6),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: AppTextStyles.titleLarge.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
        Text(
          label,
          style: AppTextStyles.bodySmall,
        ),
      ],
    );
  }

  Widget _buildSyncActionsCard(bool isSyncing) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: isSyncing ? null : () {
                  const userId = 'mock-user-id';
                  ref.read(offlineProvider.notifier).processSyncQueue(userId);
                },
                icon: isSyncing 
                    ? SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Icon(Icons.sync),
                label: Text(isSyncing ? 'Syncing...' : 'Sync Now'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyQueueWidget() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            Icon(
              Icons.check_circle_outline,
              size: 48,
              color: AppColors.success,
            ),
            const SizedBox(height: 16),
            Text(
              'Sync queue is empty',
              style: AppTextStyles.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'All data is up to date',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.onSurface.withOpacity(0.6),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSyncQueueItem(SyncQueue item) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(
          _getSyncStatusIcon(item.status),
          color: _getSyncStatusColor(item.status),
        ),
        title: Text(item.operation.toUpperCase()),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(item.endpoint),
            Text(
              'Created: ${item.timeSinceCreation.inMinutes}m ago',
              style: AppTextStyles.bodySmall,
            ),
          ],
        ),
        trailing: item.canRetry
            ? IconButton(
                icon: Icon(Icons.refresh),
                onPressed: () {
                  // TODO: Implement retry functionality
                },
              )
            : null,
      ),
    );
  }

  Widget _buildCacheSummaryCard(Map<String, dynamic> summary) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Cache Summary',
              style: AppTextStyles.titleMedium.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildStatItem('Cached', summary['cachedTypes']?.length.toString() ?? '0'),
                ),
                Expanded(
                  child: _buildStatItem('Total', summary['totalCachedTypes']?.toString() ?? '0'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCacheActionsCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  const userId = 'mock-user-id';
                  ref.read(offlineProvider.notifier).preloadData(
                    userId,
                    CacheType.values,
                  );
                },
                icon: Icon(Icons.download),
                label: Text('Preload All Data'),
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () {
                  ref.read(offlineProvider.notifier).clearCache();
                },
                icon: Icon(Icons.clear_all),
                label: Text('Clear All Cache'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCacheStatusTile(CacheType type, Map<CacheType, bool> cacheStatus) {
    final isCached = cacheStatus[type] ?? false;
    
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(
          isCached ? Icons.check_circle : Icons.radio_button_unchecked,
          color: isCached ? AppColors.success : AppColors.onSurface.withOpacity(0.3),
        ),
        title: Text(type.toString().split('.').last),
        subtitle: Text(
          isCached ? 'Cached' : 'Not cached',
          style: AppTextStyles.bodySmall.copyWith(
            color: isCached ? AppColors.success : AppColors.onSurface.withOpacity(0.6),
          ),
        ),
        trailing: isCached
            ? IconButton(
                icon: Icon(Icons.delete_outline),
                onPressed: () {
                  ref.read(offlineProvider.notifier).clearCache(type: type);
                },
              )
            : null,
      ),
    );
  }

  IconData _getSyncStatusIcon(SyncStatus status) {
    switch (status) {
      case SyncStatus.pending:
        return Icons.schedule;
      case SyncStatus.syncing:
        return Icons.sync;
      case SyncStatus.completed:
        return Icons.check_circle;
      case SyncStatus.failed:
        return Icons.error;
    }
  }

  Color _getSyncStatusColor(SyncStatus status) {
    switch (status) {
      case SyncStatus.pending:
        return AppColors.warning;
      case SyncStatus.syncing:
        return AppColors.primary;
      case SyncStatus.completed:
        return AppColors.success;
      case SyncStatus.failed:
        return AppColors.error;
    }
  }

  void _updateSetting(String key, dynamic value) {
    const userId = 'mock-user-id';
    final currentSettings = ref.read(offlineSettingsProvider);
    
    if (currentSettings != null) {
      final updatedSettings = currentSettings.toJson();
      updatedSettings[key] = value;
      
      ref.read(offlineProvider.notifier).updateOfflineSettings(userId, updatedSettings);
    }
  }

  void _updateCacheType(CacheType type, bool enabled) {
    const userId = 'mock-user-id';
    final currentSettings = ref.read(offlineSettingsProvider);
    
    if (currentSettings != null) {
      final updatedCacheTypes = List<CacheType>.from(currentSettings.enabledCacheTypes);
      
      if (enabled) {
        if (!updatedCacheTypes.contains(type)) {
          updatedCacheTypes.add(type);
        }
      } else {
        updatedCacheTypes.remove(type);
      }
      
      final updatedSettings = currentSettings.copyWith(
        enabledCacheTypes: updatedCacheTypes,
        updatedAt: DateTime.now(),
      );
      
      ref.read(offlineProvider.notifier).updateOfflineSettings(
        userId,
        updatedSettings.toJson(),
      );
    }
  }
}
