enum SyncStatus {
  pending,
  syncing,
  completed,
  failed,
}

enum CacheType {
  activities,
  bookings,
  payments,
  profile,
  notifications,
  favorites,
}

class OfflineData {
  final String id;
  final String userId;
  final CacheType type;
  final String dataKey;
  final Map<String, dynamic> data;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? expiresAt;
  final bool isStale;

  OfflineData({
    required this.id,
    required this.userId,
    required this.type,
    required this.dataKey,
    required this.data,
    required this.createdAt,
    required this.updatedAt,
    this.expiresAt,
    this.isStale = false,
  });

  factory OfflineData.fromJson(Map<String, dynamic> json) {
    return OfflineData(
      id: json['id'],
      userId: json['userId'],
      type: CacheType.values.firstWhere(
        (e) => e.toString().split('.').last == json['type'],
        orElse: () => CacheType.activities,
      ),
      dataKey: json['dataKey'],
      data: json['data'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      expiresAt: json['expiresAt'] != null ? DateTime.parse(json['expiresAt']) : null,
      isStale: json['isStale'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'type': type.toString().split('.').last,
      'dataKey': dataKey,
      'data': data,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'expiresAt': expiresAt?.toIso8601String(),
      'isStale': isStale,
    };
  }

  OfflineData copyWith({
    String? id,
    String? userId,
    CacheType? type,
    String? dataKey,
    Map<String, dynamic>? data,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? expiresAt,
    bool? isStale,
  }) {
    return OfflineData(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      type: type ?? this.type,
      dataKey: dataKey ?? this.dataKey,
      data: data ?? this.data,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      expiresAt: expiresAt ?? this.expiresAt,
      isStale: isStale ?? this.isStale,
    );
  }

  bool get isExpired => expiresAt != null && DateTime.now().isAfter(expiresAt!);
  bool get needsSync => isStale || isExpired;
  Duration get age => DateTime.now().difference(createdAt);
  Duration get timeSinceUpdate => DateTime.now().difference(updatedAt);
}

class SyncQueue {
  final String id;
  final String userId;
  final String operation;
  final String endpoint;
  final Map<String, dynamic> data;
  final SyncStatus status;
  final int retryCount;
  final DateTime createdAt;
  final DateTime? lastAttempt;
  final String? errorMessage;
  final Map<String, dynamic>? metadata;

  SyncQueue({
    required this.id,
    required this.userId,
    required this.operation,
    required this.endpoint,
    required this.data,
    this.status = SyncStatus.pending,
    this.retryCount = 0,
    required this.createdAt,
    this.lastAttempt,
    this.errorMessage,
    this.metadata,
  });

  factory SyncQueue.fromJson(Map<String, dynamic> json) {
    return SyncQueue(
      id: json['id'],
      userId: json['userId'],
      operation: json['operation'],
      endpoint: json['endpoint'],
      data: json['data'],
      status: SyncStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
        orElse: () => SyncStatus.pending,
      ),
      retryCount: json['retryCount'] ?? 0,
      createdAt: DateTime.parse(json['createdAt']),
      lastAttempt: json['lastAttempt'] != null ? DateTime.parse(json['lastAttempt']) : null,
      errorMessage: json['errorMessage'],
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'operation': operation,
      'endpoint': endpoint,
      'data': data,
      'status': status.toString().split('.').last,
      'retryCount': retryCount,
      'createdAt': createdAt.toIso8601String(),
      'lastAttempt': lastAttempt?.toIso8601String(),
      'errorMessage': errorMessage,
      'metadata': metadata,
    };
  }

  SyncQueue copyWith({
    String? id,
    String? userId,
    String? operation,
    String? endpoint,
    Map<String, dynamic>? data,
    SyncStatus? status,
    int? retryCount,
    DateTime? createdAt,
    DateTime? lastAttempt,
    String? errorMessage,
    Map<String, dynamic>? metadata,
  }) {
    return SyncQueue(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      operation: operation ?? this.operation,
      endpoint: endpoint ?? this.endpoint,
      data: data ?? this.data,
      status: status ?? this.status,
      retryCount: retryCount ?? this.retryCount,
      createdAt: createdAt ?? this.createdAt,
      lastAttempt: lastAttempt ?? this.lastAttempt,
      errorMessage: errorMessage ?? this.errorMessage,
      metadata: metadata ?? this.metadata,
    );
  }

  bool get isPending => status == SyncStatus.pending;
  bool get isSyncing => status == SyncStatus.syncing;
  bool get isCompleted => status == SyncStatus.completed;
  bool get isFailed => status == SyncStatus.failed;
  bool get canRetry => isFailed && retryCount < 3;
  Duration get timeSinceCreation => DateTime.now().difference(createdAt);
  Duration get timeSinceLastAttempt => lastAttempt != null ? DateTime.now().difference(lastAttempt!) : Duration.zero;
}

class OfflineSettings {
  final String userId;
  final bool enableOfflineMode;
  final Duration cacheExpiry;
  final int maxCacheSize;
  final bool autoSync;
  final Duration syncInterval;
  final bool syncOnWifiOnly;
  final List<CacheType> enabledCacheTypes;
  final DateTime updatedAt;

  OfflineSettings({
    required this.userId,
    this.enableOfflineMode = true,
    this.cacheExpiry = const Duration(hours: 24),
    this.maxCacheSize = 100,
    this.autoSync = true,
    this.syncInterval = const Duration(minutes: 30),
    this.syncOnWifiOnly = false,
    this.enabledCacheTypes = CacheType.values,
    required this.updatedAt,
  });

  factory OfflineSettings.fromJson(Map<String, dynamic> json) {
    return OfflineSettings(
      userId: json['userId'],
      enableOfflineMode: json['enableOfflineMode'] ?? true,
      cacheExpiry: Duration(minutes: json['cacheExpiryMinutes'] ?? 1440),
      maxCacheSize: json['maxCacheSize'] ?? 100,
      autoSync: json['autoSync'] ?? true,
      syncInterval: Duration(minutes: json['syncIntervalMinutes'] ?? 30),
      syncOnWifiOnly: json['syncOnWifiOnly'] ?? false,
      enabledCacheTypes: (json['enabledCacheTypes'] as List<dynamic>?)
          ?.map((e) => CacheType.values.firstWhere(
                (type) => type.toString().split('.').last == e,
                orElse: () => CacheType.activities,
              ))
          .toList() ?? CacheType.values,
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'enableOfflineMode': enableOfflineMode,
      'cacheExpiryMinutes': cacheExpiry.inMinutes,
      'maxCacheSize': maxCacheSize,
      'autoSync': autoSync,
      'syncIntervalMinutes': syncInterval.inMinutes,
      'syncOnWifiOnly': syncOnWifiOnly,
      'enabledCacheTypes': enabledCacheTypes.map((e) => e.toString().split('.').last).toList(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  OfflineSettings copyWith({
    String? userId,
    bool? enableOfflineMode,
    Duration? cacheExpiry,
    int? maxCacheSize,
    bool? autoSync,
    Duration? syncInterval,
    bool? syncOnWifiOnly,
    List<CacheType>? enabledCacheTypes,
    DateTime? updatedAt,
  }) {
    return OfflineSettings(
      userId: userId ?? this.userId,
      enableOfflineMode: enableOfflineMode ?? this.enableOfflineMode,
      cacheExpiry: cacheExpiry ?? this.cacheExpiry,
      maxCacheSize: maxCacheSize ?? this.maxCacheSize,
      autoSync: autoSync ?? this.autoSync,
      syncInterval: syncInterval ?? this.syncInterval,
      syncOnWifiOnly: syncOnWifiOnly ?? this.syncOnWifiOnly,
      enabledCacheTypes: enabledCacheTypes ?? this.enabledCacheTypes,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  bool isCacheTypeEnabled(CacheType type) {
    return enabledCacheTypes.contains(type);
  }
}

class SyncStats {
  final String userId;
  final int totalSyncs;
  final int successfulSyncs;
  final int failedSyncs;
  final int pendingSyncs;
  final DateTime lastSync;
  final Duration averageSyncTime;
  final Map<CacheType, int> syncCounts;
  final DateTime updatedAt;

  SyncStats({
    required this.userId,
    this.totalSyncs = 0,
    this.successfulSyncs = 0,
    this.failedSyncs = 0,
    this.pendingSyncs = 0,
    required this.lastSync,
    this.averageSyncTime = Duration.zero,
    this.syncCounts = const {},
    required this.updatedAt,
  });

  factory SyncStats.fromJson(Map<String, dynamic> json) {
    return SyncStats(
      userId: json['userId'],
      totalSyncs: json['totalSyncs'] ?? 0,
      successfulSyncs: json['successfulSyncs'] ?? 0,
      failedSyncs: json['failedSyncs'] ?? 0,
      pendingSyncs: json['pendingSyncs'] ?? 0,
      lastSync: DateTime.parse(json['lastSync']),
      averageSyncTime: Duration(milliseconds: json['averageSyncTimeMs'] ?? 0),
      syncCounts: Map.fromEntries(
        (json['syncCounts'] as Map<String, dynamic>).entries.map(
          (e) => MapEntry(
            CacheType.values.firstWhere(
              (type) => type.toString().split('.').last == e.key,
              orElse: () => CacheType.activities,
            ),
            e.value as int,
          ),
        ),
      ),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'totalSyncs': totalSyncs,
      'successfulSyncs': successfulSyncs,
      'failedSyncs': failedSyncs,
      'pendingSyncs': pendingSyncs,
      'lastSync': lastSync.toIso8601String(),
      'averageSyncTimeMs': averageSyncTime.inMilliseconds,
      'syncCounts': Map.fromEntries(
        syncCounts.entries.map(
          (e) => MapEntry(e.key.toString().split('.').last, e.value),
        ),
      ),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  double get successRate => totalSyncs > 0 ? successfulSyncs / totalSyncs : 0.0;
  double get failureRate => totalSyncs > 0 ? failedSyncs / totalSyncs : 0.0;
  bool get hasRecentSync => DateTime.now().difference(lastSync) < const Duration(hours: 1);
  String get formattedLastSync => _formatDuration(DateTime.now().difference(lastSync));
  String get formattedAverageSyncTime => _formatDuration(averageSyncTime);

  String _formatDuration(Duration duration) {
    if (duration.inDays > 0) {
      return '${duration.inDays}d ago';
    } else if (duration.inHours > 0) {
      return '${duration.inHours}h ago';
    } else if (duration.inMinutes > 0) {
      return '${duration.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }
}
