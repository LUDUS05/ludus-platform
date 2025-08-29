class UserModel {
  final String uid;
  final String email;
  final String displayName;
  final String? phoneNumber;
  final String? photoURL;
  final String role;
  final DateTime createdAt;
  final DateTime? lastSignInAt;
  final bool isActive;
  final Map<String, dynamic> preferences;
  final Map<String, dynamic> location;
  final List<String> favoriteActivities;
  final List<String> bookedActivities;
  final Map<String, dynamic> profile;

  const UserModel({
    required this.uid,
    required this.email,
    required this.displayName,
    this.phoneNumber,
    this.photoURL,
    required this.role,
    required this.createdAt,
    this.lastSignInAt,
    required this.isActive,
    required this.preferences,
    required this.location,
    this.favoriteActivities = const [],
    this.bookedActivities = const [],
    this.profile = const {},
  });

  // Create from Map
  factory UserModel.fromMap(Map<String, dynamic> data) {
    return UserModel(
      uid: data['uid'] ?? '',
      email: data['email'] ?? '',
      displayName: data['displayName'] ?? '',
      phoneNumber: data['phoneNumber'],
      photoURL: data['photoURL'],
      role: data['role'] ?? 'user',
      createdAt: data['createdAt'] != null 
          ? DateTime.parse(data['createdAt'].toString())
          : DateTime.now(),
      lastSignInAt: data['lastSignInAt'] != null 
          ? DateTime.parse(data['lastSignInAt'].toString())
          : null,
      isActive: data['isActive'] ?? true,
      preferences: data['preferences'] ?? {},
      location: data['location'] ?? {},
      favoriteActivities: List<String>.from(data['favoriteActivities'] ?? []),
      bookedActivities: List<String>.from(data['bookedActivities'] ?? []),
      profile: data['profile'] ?? {},
    );
  }

  // Convert to Map
  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'email': email,
      'displayName': displayName,
      'phoneNumber': phoneNumber,
      'photoURL': photoURL,
      'role': role,
      'createdAt': createdAt.toIso8601String(),
      'lastSignInAt': lastSignInAt?.toIso8601String(),
      'isActive': isActive,
      'preferences': preferences,
      'location': location,
      'favoriteActivities': favoriteActivities,
      'bookedActivities': bookedActivities,
      'profile': profile,
    };
  }

  // Copy with method
  UserModel copyWith({
    String? uid,
    String? email,
    String? displayName,
    String? phoneNumber,
    String? photoURL,
    String? role,
    DateTime? createdAt,
    DateTime? lastSignInAt,
    bool? isActive,
    Map<String, dynamic>? preferences,
    Map<String, dynamic>? location,
    List<String>? favoriteActivities,
    List<String>? bookedActivities,
    Map<String, dynamic>? profile,
  }) {
    return UserModel(
      uid: uid ?? this.uid,
      email: email ?? this.email,
      displayName: displayName ?? this.displayName,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      photoURL: photoURL ?? this.photoURL,
      role: role ?? this.role,
      createdAt: createdAt ?? this.createdAt,
      lastSignInAt: lastSignInAt ?? this.lastSignInAt,
      isActive: isActive ?? this.isActive,
      preferences: preferences ?? this.preferences,
      location: location ?? this.location,
      favoriteActivities: favoriteActivities ?? this.favoriteActivities,
      bookedActivities: bookedActivities ?? this.bookedActivities,
      profile: profile ?? this.profile,
    );
  }

  // Check if user is staff
  bool get isStaff => role == 'staff_admin' || role == 'staff_support' || role == 'staff_moderator';

  // Check if user is partner
  bool get isPartner => role == 'partner';

  // Check if user is admin
  bool get isAdmin => role == 'staff_admin';

  // Get user's city
  String get city => location['city'] ?? '';

  // Get user's coordinates
  Map<String, double>? get coordinates => location['coordinates'] != null 
      ? Map<String, double>.from(location['coordinates'])
      : null;

  // Get notification preference
  bool get notificationsEnabled => preferences['notifications'] ?? true;

  // Get location preference
  bool get locationEnabled => preferences['location'] ?? true;

  // Get language preference
  String get language => preferences['language'] ?? 'en';

  // Equality operator
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is UserModel && other.uid == uid;
  }

  // Hash code
  @override
  int get hashCode => uid.hashCode;

  // To string
  @override
  String toString() {
    return 'UserModel(uid: $uid, email: $email, displayName: $displayName, role: $role)';
  }
}
