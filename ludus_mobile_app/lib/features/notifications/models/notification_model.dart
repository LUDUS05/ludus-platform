enum NotificationType {
  booking,
  payment,
  activity,
  system,
  marketing,
  reminder,
}

enum NotificationPriority {
  low,
  normal,
  high,
  urgent,
}

enum NotificationStatus {
  unread,
  read,
  archived,
}

class NotificationModel {
  final String id;
  final String userId;
  final String title;
  final String body;
  final NotificationType type;
  final NotificationPriority priority;
  final NotificationStatus status;
  final Map<String, dynamic>? data;
  final String? imageUrl;
  final String? actionUrl;
  final DateTime createdAt;
  final DateTime? readAt;
  final DateTime? expiresAt;
  final bool isSilent;
  final String? category;

  NotificationModel({
    required this.id,
    required this.userId,
    required this.title,
    required this.body,
    required this.type,
    this.priority = NotificationPriority.normal,
    this.status = NotificationStatus.unread,
    this.data,
    this.imageUrl,
    this.actionUrl,
    required this.createdAt,
    this.readAt,
    this.expiresAt,
    this.isSilent = false,
    this.category,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['_id'] ?? json['id'],
      userId: json['userId'] ?? '',
      title: json['title'] ?? '',
      body: json['body'] ?? '',
      type: NotificationType.values.firstWhere(
        (e) => e.toString().split('.').last == json['type'],
        orElse: () => NotificationType.system,
      ),
      priority: NotificationPriority.values.firstWhere(
        (e) => e.toString().split('.').last == json['priority'],
        orElse: () => NotificationPriority.normal,
      ),
      status: NotificationStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
        orElse: () => NotificationStatus.unread,
      ),
      data: json['data'],
      imageUrl: json['imageUrl'],
      actionUrl: json['actionUrl'],
      createdAt: DateTime.parse(json['createdAt']),
      readAt: json['readAt'] != null ? DateTime.parse(json['readAt']) : null,
      expiresAt: json['expiresAt'] != null ? DateTime.parse(json['expiresAt']) : null,
      isSilent: json['isSilent'] ?? false,
      category: json['category'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'title': title,
      'body': body,
      'type': type.toString().split('.').last,
      'priority': priority.toString().split('.').last,
      'status': status.toString().split('.').last,
      'data': data,
      'imageUrl': imageUrl,
      'actionUrl': actionUrl,
      'createdAt': createdAt.toIso8601String(),
      'readAt': readAt?.toIso8601String(),
      'expiresAt': expiresAt?.toIso8601String(),
      'isSilent': isSilent,
      'category': category,
    };
  }

  NotificationModel copyWith({
    String? id,
    String? userId,
    String? title,
    String? body,
    NotificationType? type,
    NotificationPriority? priority,
    NotificationStatus? status,
    Map<String, dynamic>? data,
    String? imageUrl,
    String? actionUrl,
    DateTime? createdAt,
    DateTime? readAt,
    DateTime? expiresAt,
    bool? isSilent,
    String? category,
  }) {
    return NotificationModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      title: title ?? this.title,
      body: body ?? this.body,
      type: type ?? this.type,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      data: data ?? this.data,
      imageUrl: imageUrl ?? this.imageUrl,
      actionUrl: actionUrl ?? this.actionUrl,
      createdAt: createdAt ?? this.createdAt,
      readAt: readAt ?? this.readAt,
      expiresAt: expiresAt ?? this.expiresAt,
      isSilent: isSilent ?? this.isSilent,
      category: category ?? this.category,
    );
  }

  String get typeDisplayName {
    switch (type) {
      case NotificationType.booking:
        return 'Booking';
      case NotificationType.payment:
        return 'Payment';
      case NotificationType.activity:
        return 'Activity';
      case NotificationType.system:
        return 'System';
      case NotificationType.marketing:
        return 'Marketing';
      case NotificationType.reminder:
        return 'Reminder';
    }
  }

  String get priorityDisplayName {
    switch (priority) {
      case NotificationPriority.low:
        return 'Low';
      case NotificationPriority.normal:
        return 'Normal';
      case NotificationPriority.high:
        return 'High';
      case NotificationPriority.urgent:
        return 'Urgent';
    }
  }

  bool get isRead => status == NotificationStatus.read;
  bool get isUnread => status == NotificationStatus.unread;
  bool get isArchived => status == NotificationStatus.archived;
  bool get isExpired => expiresAt != null && DateTime.now().isAfter(expiresAt!);
  bool get hasImage => imageUrl != null && imageUrl!.isNotEmpty;
  bool get hasAction => actionUrl != null && actionUrl!.isNotEmpty;
  bool get isUrgent => priority == NotificationPriority.urgent;
  bool get isHighPriority => priority == NotificationPriority.high || priority == NotificationPriority.urgent;

  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(createdAt);

    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }
}

// Notification Settings Model
class NotificationSettings {
  final String userId;
  final bool bookingNotifications;
  final bool paymentNotifications;
  final bool activityNotifications;
  final bool systemNotifications;
  final bool marketingNotifications;
  final bool reminderNotifications;
  final bool pushNotifications;
  final bool emailNotifications;
  final bool smsNotifications;
  final TimeRange quietHours;
  final List<String> mutedCategories;
  final DateTime updatedAt;

  NotificationSettings({
    required this.userId,
    this.bookingNotifications = true,
    this.paymentNotifications = true,
    this.activityNotifications = true,
    this.systemNotifications = true,
    this.marketingNotifications = false,
    this.reminderNotifications = true,
    this.pushNotifications = true,
    this.emailNotifications = true,
    this.smsNotifications = false,
    this.quietHours = const TimeRange(start: 22, end: 8),
    this.mutedCategories = const [],
    required this.updatedAt,
  });

  factory NotificationSettings.fromJson(Map<String, dynamic> json) {
    return NotificationSettings(
      userId: json['userId'] ?? '',
      bookingNotifications: json['bookingNotifications'] ?? true,
      paymentNotifications: json['paymentNotifications'] ?? true,
      activityNotifications: json['activityNotifications'] ?? true,
      systemNotifications: json['systemNotifications'] ?? true,
      marketingNotifications: json['marketingNotifications'] ?? false,
      reminderNotifications: json['reminderNotifications'] ?? true,
      pushNotifications: json['pushNotifications'] ?? true,
      emailNotifications: json['emailNotifications'] ?? true,
      smsNotifications: json['smsNotifications'] ?? false,
      quietHours: TimeRange.fromJson(json['quietHours'] ?? {}),
      mutedCategories: List<String>.from(json['mutedCategories'] ?? []),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'bookingNotifications': bookingNotifications,
      'paymentNotifications': paymentNotifications,
      'activityNotifications': activityNotifications,
      'systemNotifications': systemNotifications,
      'marketingNotifications': marketingNotifications,
      'reminderNotifications': reminderNotifications,
      'pushNotifications': pushNotifications,
      'emailNotifications': emailNotifications,
      'smsNotifications': smsNotifications,
      'quietHours': quietHours.toJson(),
      'mutedCategories': mutedCategories,
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  NotificationSettings copyWith({
    String? userId,
    bool? bookingNotifications,
    bool? paymentNotifications,
    bool? activityNotifications,
    bool? systemNotifications,
    bool? marketingNotifications,
    bool? reminderNotifications,
    bool? pushNotifications,
    bool? emailNotifications,
    bool? smsNotifications,
    TimeRange? quietHours,
    List<String>? mutedCategories,
    DateTime? updatedAt,
  }) {
    return NotificationSettings(
      userId: userId ?? this.userId,
      bookingNotifications: bookingNotifications ?? this.bookingNotifications,
      paymentNotifications: paymentNotifications ?? this.paymentNotifications,
      activityNotifications: activityNotifications ?? this.activityNotifications,
      systemNotifications: systemNotifications ?? this.systemNotifications,
      marketingNotifications: marketingNotifications ?? this.marketingNotifications,
      reminderNotifications: reminderNotifications ?? this.reminderNotifications,
      pushNotifications: pushNotifications ?? this.pushNotifications,
      emailNotifications: emailNotifications ?? this.emailNotifications,
      smsNotifications: smsNotifications ?? this.smsNotifications,
      quietHours: quietHours ?? this.quietHours,
      mutedCategories: mutedCategories ?? this.mutedCategories,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  bool isNotificationEnabled(NotificationType type) {
    switch (type) {
      case NotificationType.booking:
        return bookingNotifications;
      case NotificationType.payment:
        return paymentNotifications;
      case NotificationType.activity:
        return activityNotifications;
      case NotificationType.system:
        return systemNotifications;
      case NotificationType.marketing:
        return marketingNotifications;
      case NotificationType.reminder:
        return reminderNotifications;
    }
  }

  bool isInQuietHours() {
    final now = DateTime.now();
    final currentHour = now.hour;
    return currentHour >= quietHours.start || currentHour < quietHours.end;
  }

  bool isCategoryMuted(String category) {
    return mutedCategories.contains(category);
  }
}

// Time Range Model for Quiet Hours
class TimeRange {
  final int start;
  final int end;

  const TimeRange({required this.start, required this.end});

  factory TimeRange.fromJson(Map<String, dynamic> json) {
    return TimeRange(
      start: json['start'] ?? 22,
      end: json['end'] ?? 8,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'start': start,
      'end': end,
    };
  }

  String get displayText => '$start:00 - $end:00';
}
