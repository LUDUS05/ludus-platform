import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/activity_model.dart';
import '../services/activity_service.dart';

// Activity state
class ActivityState {
  final List<ActivityModel> activities;
  final List<ActivityModel> featuredActivities;
  final bool isLoading;
  final String? error;
  final String? searchQuery;
  final String? selectedCategory;
  final String? selectedLocation;

  const ActivityState({
    this.activities = const [],
    this.featuredActivities = const [],
    this.isLoading = false,
    this.error,
    this.searchQuery,
    this.selectedCategory,
    this.selectedLocation,
  });

  ActivityState copyWith({
    List<ActivityModel>? activities,
    List<ActivityModel>? featuredActivities,
    bool? isLoading,
    String? error,
    String? searchQuery,
    String? selectedCategory,
    String? selectedLocation,
  }) {
    return ActivityState(
      activities: activities ?? this.activities,
      featuredActivities: featuredActivities ?? this.featuredActivities,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      searchQuery: searchQuery ?? this.searchQuery,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      selectedLocation: selectedLocation ?? this.selectedLocation,
    );
  }
}

// Activity notifier
class ActivityNotifier extends StateNotifier<ActivityState> {
  ActivityNotifier() : super(const ActivityState());

  // Load all activities
  Future<void> loadActivities({
    String? category,
    String? location,
    double? minPrice,
    double? maxPrice,
    int? limit,
    int? offset,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final activities = await ActivityService.getActivities(
        category: category,
        location: location,
        minPrice: minPrice,
        maxPrice: maxPrice,
        limit: limit,
        offset: offset,
      );

      state = state.copyWith(
        activities: activities,
        isLoading: false,
        selectedCategory: category,
        selectedLocation: location,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  // Load featured activities
  Future<void> loadFeaturedActivities() async {
    try {
      final featuredActivities = await ActivityService.getFeaturedActivities();
      state = state.copyWith(featuredActivities: featuredActivities);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Search activities
  Future<void> searchActivities(String query) async {
    if (query.isEmpty) {
      await loadActivities();
      return;
    }

    state = state.copyWith(isLoading: true, error: null, searchQuery: query);

    try {
      final activities = await ActivityService.searchActivities(query);
      state = state.copyWith(
        activities: activities,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  // Get activity by ID
  Future<ActivityModel?> getActivityById(String id) async {
    try {
      return await ActivityService.getActivityById(id);
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  // Get activities by category
  Future<void> getActivitiesByCategory(String category) async {
    await loadActivities(category: category);
  }

  // Get nearby activities
  Future<void> getNearbyActivities({
    required double latitude,
    required double longitude,
    double radius = 10.0,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final activities = await ActivityService.getNearbyActivities(
        latitude: latitude,
        longitude: longitude,
        radius: radius,
      );

      state = state.copyWith(
        activities: activities,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  // Clear search
  void clearSearch() {
    state = state.copyWith(
      searchQuery: null,
      selectedCategory: null,
      selectedLocation: null,
    );
    loadActivities();
  }

  // Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }

  // Refresh activities
  Future<void> refreshActivities() async {
    await loadActivities();
  }
}

// Providers
final activityProvider = StateNotifierProvider<ActivityNotifier, ActivityState>((ref) {
  return ActivityNotifier();
});

final activitiesProvider = Provider<List<ActivityModel>>((ref) {
  return ref.watch(activityProvider).activities;
});

final featuredActivitiesProvider = Provider<List<ActivityModel>>((ref) {
  return ref.watch(activityProvider).featuredActivities;
});

final activityLoadingProvider = Provider<bool>((ref) {
  return ref.watch(activityProvider).isLoading;
});

final activityErrorProvider = Provider<String?>((ref) {
  return ref.watch(activityProvider).error;
});

// Individual activity provider
final activityByIdProvider = FutureProvider.family<ActivityModel?, String>((ref, id) async {
  final notifier = ref.read(activityProvider.notifier);
  return await notifier.getActivityById(id);
});
