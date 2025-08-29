class UserProfile {
  final String id;
  final String userId;
  final String firstName;
  final String lastName;
  final String? email;
  final String? phoneNumber;
  final String? profileImage;
  final DateTime? dateOfBirth;
  final String? gender;
  final String? nationality;
  final String? preferredLanguage;
  final String? timezone;
  final Map<String, dynamic>? preferences;
  final List<String>? interests;
  final String? emergencyContact;
  final String? emergencyPhone;
  final bool emailNotifications;
  final bool pushNotifications;
  final bool smsNotifications;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? lastLoginAt;

  UserProfile({
    required this.id,
    required this.userId,
    required this.firstName,
    required this.lastName,
    this.email,
    this.phoneNumber,
    this.profileImage,
    this.dateOfBirth,
    this.gender,
    this.nationality,
    this.preferredLanguage,
    this.timezone,
    this.preferences,
    this.interests,
    this.emergencyContact,
    this.emergencyPhone,
    this.emailNotifications = true,
    this.pushNotifications = true,
    this.smsNotifications = false,
    required this.createdAt,
    required this.updatedAt,
    this.lastLoginAt,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['_id'] ?? json['id'],
      userId: json['userId'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      email: json['email'],
      phoneNumber: json['phoneNumber'],
      profileImage: json['profileImage'],
      dateOfBirth: json['dateOfBirth'] != null 
          ? DateTime.parse(json['dateOfBirth']) 
          : null,
      gender: json['gender'],
      nationality: json['nationality'],
      preferredLanguage: json['preferredLanguage'],
      timezone: json['timezone'],
      preferences: json['preferences'],
      interests: json['interests'] != null 
          ? List<String>.from(json['interests'])
          : null,
      emergencyContact: json['emergencyContact'],
      emergencyPhone: json['emergencyPhone'],
      emailNotifications: json['emailNotifications'] ?? true,
      pushNotifications: json['pushNotifications'] ?? true,
      smsNotifications: json['smsNotifications'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      lastLoginAt: json['lastLoginAt'] != null 
          ? DateTime.parse(json['lastLoginAt']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'phoneNumber': phoneNumber,
      'profileImage': profileImage,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'gender': gender,
      'nationality': nationality,
      'preferredLanguage': preferredLanguage,
      'timezone': timezone,
      'preferences': preferences,
      'interests': interests,
      'emergencyContact': emergencyContact,
      'emergencyPhone': emergencyPhone,
      'emailNotifications': emailNotifications,
      'pushNotifications': pushNotifications,
      'smsNotifications': smsNotifications,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'lastLoginAt': lastLoginAt?.toIso8601String(),
    };
  }

  UserProfile copyWith({
    String? id,
    String? userId,
    String? firstName,
    String? lastName,
    String? email,
    String? phoneNumber,
    String? profileImage,
    DateTime? dateOfBirth,
    String? gender,
    String? nationality,
    String? preferredLanguage,
    String? timezone,
    Map<String, dynamic>? preferences,
    List<String>? interests,
    String? emergencyContact,
    String? emergencyPhone,
    bool? emailNotifications,
    bool? pushNotifications,
    bool? smsNotifications,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? lastLoginAt,
  }) {
    return UserProfile(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      profileImage: profileImage ?? this.profileImage,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      gender: gender ?? this.gender,
      nationality: nationality ?? this.nationality,
      preferredLanguage: preferredLanguage ?? this.preferredLanguage,
      timezone: timezone ?? this.timezone,
      preferences: preferences ?? this.preferences,
      interests: interests ?? this.interests,
      emergencyContact: emergencyContact ?? this.emergencyContact,
      emergencyPhone: emergencyPhone ?? this.emergencyPhone,
      emailNotifications: emailNotifications ?? this.emailNotifications,
      pushNotifications: pushNotifications ?? this.pushNotifications,
      smsNotifications: smsNotifications ?? this.smsNotifications,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
    );
  }

  String get fullName => '$firstName $lastName';
  String get displayName => '$firstName ${lastName.isNotEmpty ? lastName[0] : ''}';
  String get initials => '${firstName.isNotEmpty ? firstName[0] : ''}${lastName.isNotEmpty ? lastName[0] : ''}'.toUpperCase();
  
  int? get age {
    if (dateOfBirth == null) return null;
    final now = DateTime.now();
    int age = now.year - dateOfBirth!.year;
    if (now.month < dateOfBirth!.month || 
        (now.month == dateOfBirth!.month && now.day < dateOfBirth!.day)) {
      age--;
    }
    return age;
  }

  bool get hasProfileImage => profileImage != null && profileImage!.isNotEmpty;
  bool get isComplete => firstName.isNotEmpty && lastName.isNotEmpty && email != null;
  bool get hasEmergencyContact => emergencyContact != null && emergencyPhone != null;
}

// User Preferences Model
class UserPreferences {
  final String userId;
  final Map<String, dynamic> activityPreferences;
  final Map<String, dynamic> notificationPreferences;
  final Map<String, dynamic> privacyPreferences;
  final Map<String, dynamic> accessibilityPreferences;
  final DateTime updatedAt;

  UserPreferences({
    required this.userId,
    this.activityPreferences = const {},
    this.notificationPreferences = const {},
    this.privacyPreferences = const {},
    this.accessibilityPreferences = const {},
    required this.updatedAt,
  });

  factory UserPreferences.fromJson(Map<String, dynamic> json) {
    return UserPreferences(
      userId: json['userId'] ?? '',
      activityPreferences: json['activityPreferences'] ?? {},
      notificationPreferences: json['notificationPreferences'] ?? {},
      privacyPreferences: json['privacyPreferences'] ?? {},
      accessibilityPreferences: json['accessibilityPreferences'] ?? {},
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'activityPreferences': activityPreferences,
      'notificationPreferences': notificationPreferences,
      'privacyPreferences': privacyPreferences,
      'accessibilityPreferences': accessibilityPreferences,
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  UserPreferences copyWith({
    String? userId,
    Map<String, dynamic>? activityPreferences,
    Map<String, dynamic>? notificationPreferences,
    Map<String, dynamic>? privacyPreferences,
    Map<String, dynamic>? accessibilityPreferences,
    DateTime? updatedAt,
  }) {
    return UserPreferences(
      userId: userId ?? this.userId,
      activityPreferences: activityPreferences ?? this.activityPreferences,
      notificationPreferences: notificationPreferences ?? this.notificationPreferences,
      privacyPreferences: privacyPreferences ?? this.privacyPreferences,
      accessibilityPreferences: accessibilityPreferences ?? this.accessibilityPreferences,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

// User Statistics Model
class UserStatistics {
  final String userId;
  final int totalBookings;
  final int completedBookings;
  final int cancelledBookings;
  final double totalSpent;
  final int favoriteActivities;
  final int reviewsSubmitted;
  final double averageRating;
  final DateTime lastActivityDate;
  final Map<String, int> activityTypeCounts;
  final Map<String, double> monthlySpending;

  UserStatistics({
    required this.userId,
    this.totalBookings = 0,
    this.completedBookings = 0,
    this.cancelledBookings = 0,
    this.totalSpent = 0.0,
    this.favoriteActivities = 0,
    this.reviewsSubmitted = 0,
    this.averageRating = 0.0,
    required this.lastActivityDate,
    this.activityTypeCounts = const {},
    this.monthlySpending = const {},
  });

  factory UserStatistics.fromJson(Map<String, dynamic> json) {
    return UserStatistics(
      userId: json['userId'] ?? '',
      totalBookings: json['totalBookings'] ?? 0,
      completedBookings: json['completedBookings'] ?? 0,
      cancelledBookings: json['cancelledBookings'] ?? 0,
      totalSpent: (json['totalSpent'] ?? 0).toDouble(),
      favoriteActivities: json['favoriteActivities'] ?? 0,
      reviewsSubmitted: json['reviewsSubmitted'] ?? 0,
      averageRating: (json['averageRating'] ?? 0).toDouble(),
      lastActivityDate: DateTime.parse(json['lastActivityDate']),
      activityTypeCounts: Map<String, int>.from(json['activityTypeCounts'] ?? {}),
      monthlySpending: Map<String, double>.from(json['monthlySpending'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'totalBookings': totalBookings,
      'completedBookings': completedBookings,
      'cancelledBookings': cancelledBookings,
      'totalSpent': totalSpent,
      'favoriteActivities': favoriteActivities,
      'reviewsSubmitted': reviewsSubmitted,
      'averageRating': averageRating,
      'lastActivityDate': lastActivityDate.toIso8601String(),
      'activityTypeCounts': activityTypeCounts,
      'monthlySpending': monthlySpending,
    };
  }

  double get completionRate => totalBookings > 0 ? completedBookings / totalBookings : 0.0;
  double get cancellationRate => totalBookings > 0 ? cancelledBookings / totalBookings : 0.0;
  bool get hasActivity => totalBookings > 0;
  String get formattedTotalSpent => '\$${totalSpent.toStringAsFixed(2)}';
}
