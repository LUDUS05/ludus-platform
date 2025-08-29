import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/profile_model.dart';
import '../services/profile_service.dart';

// Profile state
class ProfileState {
  final UserProfile? userProfile;
  final UserPreferences? userPreferences;
  final UserStatistics? userStatistics;
  final List<Map<String, dynamic>> bookingHistory;
  final List<Map<String, dynamic>> favorites;
  final List<Map<String, dynamic>> reviews;
  final bool isLoading;
  final String? error;
  final bool isUpdating;

  const ProfileState({
    this.userProfile,
    this.userPreferences,
    this.userStatistics,
    this.bookingHistory = const [],
    this.favorites = const [],
    this.reviews = const [],
    this.isLoading = false,
    this.error,
    this.isUpdating = false,
  });

  ProfileState copyWith({
    UserProfile? userProfile,
    UserPreferences? userPreferences,
    UserStatistics? userStatistics,
    List<Map<String, dynamic>>? bookingHistory,
    List<Map<String, dynamic>>? favorites,
    List<Map<String, dynamic>>? reviews,
    bool? isLoading,
    String? error,
    bool? isUpdating,
  }) {
    return ProfileState(
      userProfile: userProfile ?? this.userProfile,
      userPreferences: userPreferences ?? this.userPreferences,
      userStatistics: userStatistics ?? this.userStatistics,
      bookingHistory: bookingHistory ?? this.bookingHistory,
      favorites: favorites ?? this.favorites,
      reviews: reviews ?? this.reviews,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      isUpdating: isUpdating ?? this.isUpdating,
    );
  }
}

// Profile notifier
class ProfileNotifier extends StateNotifier<ProfileState> {
  ProfileNotifier() : super(const ProfileState());

  // Load user profile
  Future<void> loadUserProfile(String userId) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final profile = await ProfileService.getUserProfile(userId);
      state = state.copyWith(
        userProfile: profile,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  // Update user profile
  Future<UserProfile?> updateUserProfile(String userId, Map<String, dynamic> profileData) async {
    state = state.copyWith(isUpdating: true, error: null);

    try {
      final updatedProfile = await ProfileService.updateUserProfile(userId, profileData);
      state = state.copyWith(
        userProfile: updatedProfile,
        isUpdating: false,
      );
      return updatedProfile;
    } catch (e) {
      state = state.copyWith(
        isUpdating: false,
        error: e.toString(),
      );
      return null;
    }
  }

  // Upload profile image
  Future<String?> uploadProfileImage(String userId, String imagePath) async {
    state = state.copyWith(isUpdating: true, error: null);

    try {
      // TODO: Implement file upload logic
      // final imageUrl = await ProfileService.uploadProfileImage(userId, File(imagePath));
      
      // Update profile with new image URL
      // final updatedProfile = await ProfileService.updateUserProfile(userId, {'profileImage': imageUrl});
      // state = state.copyWith(userProfile: updatedProfile, isUpdating: false);
      
      // return imageUrl;
      return null;
    } catch (e) {
      state = state.copyWith(
        isUpdating: false,
        error: e.toString(),
      );
      return null;
    }
  }

  // Load user preferences
  Future<void> loadUserPreferences(String userId) async {
    try {
      final preferences = await ProfileService.getUserPreferences(userId);
      state = state.copyWith(userPreferences: preferences);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Update user preferences
  Future<UserPreferences?> updateUserPreferences(String userId, Map<String, dynamic> preferences) async {
    state = state.copyWith(isUpdating: true, error: null);

    try {
      final updatedPreferences = await ProfileService.updateUserPreferences(userId, preferences);
      state = state.copyWith(
        userPreferences: updatedPreferences,
        isUpdating: false,
      );
      return updatedPreferences;
    } catch (e) {
      state = state.copyWith(
        isUpdating: false,
        error: e.toString(),
      );
      return null;
    }
  }

  // Load user statistics
  Future<void> loadUserStatistics(String userId) async {
    try {
      final statistics = await ProfileService.getUserStatistics(userId);
      state = state.copyWith(userStatistics: statistics);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Load booking history
  Future<void> loadBookingHistory(String userId, {int? limit, int? offset}) async {
    try {
      final history = await ProfileService.getUserBookingHistory(userId, limit: limit, offset: offset);
      state = state.copyWith(bookingHistory: history);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Load favorites
  Future<void> loadFavorites(String userId) async {
    try {
      final favorites = await ProfileService.getUserFavorites(userId);
      state = state.copyWith(favorites: favorites);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Add to favorites
  Future<bool> addToFavorites(String userId, String activityId) async {
    try {
      await ProfileService.addToFavorites(userId, activityId);
      // Refresh favorites list
      await loadFavorites(userId);
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  // Remove from favorites
  Future<bool> removeFromFavorites(String userId, String activityId) async {
    try {
      await ProfileService.removeFromFavorites(userId, activityId);
      // Refresh favorites list
      await loadFavorites(userId);
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  // Load reviews
  Future<void> loadReviews(String userId) async {
    try {
      final reviews = await ProfileService.getUserReviews(userId);
      state = state.copyWith(reviews: reviews);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Update notification settings
  Future<UserProfile?> updateNotificationSettings(String userId, Map<String, bool> settings) async {
    state = state.copyWith(isUpdating: true, error: null);

    try {
      final updatedProfile = await ProfileService.updateNotificationSettings(userId, settings);
      state = state.copyWith(
        userProfile: updatedProfile,
        isUpdating: false,
      );
      return updatedProfile;
    } catch (e) {
      state = state.copyWith(
        isUpdating: false,
        error: e.toString(),
      );
      return null;
    }
  }

  // Delete user account
  Future<bool> deleteUserAccount(String userId) async {
    state = state.copyWith(isUpdating: true, error: null);

    try {
      await ProfileService.deleteUserAccount(userId);
      state = state.copyWith(isUpdating: false);
      return true;
    } catch (e) {
      state = state.copyWith(
        isUpdating: false,
        error: e.toString(),
      );
      return false;
    }
  }

  // Export user data
  Future<Map<String, dynamic>?> exportUserData(String userId) async {
    try {
      final data = await ProfileService.exportUserData(userId);
      return data;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  // Refresh all profile data
  Future<void> refreshProfileData(String userId) async {
    await Future.wait([
      loadUserProfile(userId),
      loadUserPreferences(userId),
      loadUserStatistics(userId),
      loadBookingHistory(userId),
      loadFavorites(userId),
      loadReviews(userId),
    ]);
  }

  // Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }

  // Clear profile data
  void clearProfileData() {
    state = const ProfileState();
  }
}

// Providers
final profileProvider = StateNotifierProvider<ProfileNotifier, ProfileState>((ref) {
  return ProfileNotifier();
});

final userProfileProvider = Provider<UserProfile?>((ref) {
  return ref.watch(profileProvider).userProfile;
});

final userPreferencesProvider = Provider<UserPreferences?>((ref) {
  return ref.watch(profileProvider).userPreferences;
});

final userStatisticsProvider = Provider<UserStatistics?>((ref) {
  return ref.watch(profileProvider).userStatistics;
});

final bookingHistoryProvider = Provider<List<Map<String, dynamic>>>((ref) {
  return ref.watch(profileProvider).bookingHistory;
});

final favoritesProvider = Provider<List<Map<String, dynamic>>>((ref) {
  return ref.watch(profileProvider).favorites;
});

final reviewsProvider = Provider<List<Map<String, dynamic>>>((ref) {
  return ref.watch(profileProvider).reviews;
});

final profileLoadingProvider = Provider<bool>((ref) {
  return ref.watch(profileProvider).isLoading;
});

final profileUpdatingProvider = Provider<bool>((ref) {
  return ref.watch(profileProvider).isUpdating;
});

final profileErrorProvider = Provider<String?>((ref) {
  return ref.watch(profileProvider).error;
});

// Individual profile provider
final profileByIdProvider = FutureProvider.family<UserProfile?, String>((ref, userId) async {
  final notifier = ref.read(profileProvider.notifier);
  await notifier.loadUserProfile(userId);
  return ref.read(userProfileProvider);
});

// Profile completion status
final profileCompletionProvider = Provider<double>((ref) {
  final profile = ref.watch(userProfileProvider);
  if (profile == null) return 0.0;

  int completedFields = 0;
  int totalFields = 8; // Adjust based on your required fields

  if (profile.firstName.isNotEmpty) completedFields++;
  if (profile.lastName.isNotEmpty) completedFields++;
  if (profile.email != null && profile.email!.isNotEmpty) completedFields++;
  if (profile.phoneNumber != null && profile.phoneNumber!.isNotEmpty) completedFields++;
  if (profile.dateOfBirth != null) completedFields++;
  if (profile.gender != null && profile.gender!.isNotEmpty) completedFields++;
  if (profile.nationality != null && profile.nationality!.isNotEmpty) completedFields++;
  if (profile.hasEmergencyContact) completedFields++;

  return completedFields / totalFields;
});

// Profile statistics summary
final profileStatsSummaryProvider = Provider<Map<String, dynamic>>((ref) {
  final statistics = ref.watch(userStatisticsProvider);
  if (statistics == null) {
    return {
      'totalBookings': 0,
      'totalSpent': 0.0,
      'completionRate': 0.0,
      'averageRating': 0.0,
    };
  }

  return {
    'totalBookings': statistics.totalBookings,
    'totalSpent': statistics.totalSpent,
    'completionRate': statistics.completionRate,
    'averageRating': statistics.averageRating,
  };
});
