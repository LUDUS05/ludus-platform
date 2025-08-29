import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models/user_model.dart';

// Mock Auth State
class MockAuthState {
  final bool isLoading;
  final String? error;
  final UserModel? user;

  const MockAuthState({
    this.isLoading = false,
    this.error,
    this.user,
  });

  MockAuthState copyWith({
    bool? isLoading,
    String? error,
    UserModel? user,
  }) {
    return MockAuthState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      user: user ?? this.user,
    );
  }
}

// Mock Auth Notifier
class MockAuthNotifier extends StateNotifier<MockAuthState> {
  MockAuthNotifier() : super(const MockAuthState());

  // Sign in with email and password
  Future<void> signInWithEmail({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    // Simulate network delay
    await Future.delayed(const Duration(seconds: 2));

    // Mock validation
    if (email.isEmpty || password.isEmpty) {
      state = state.copyWith(
        isLoading: false,
        error: 'Please fill in all fields',
      );
      throw Exception('Please fill in all fields');
    }

    if (password.length < 6) {
      state = state.copyWith(
        isLoading: false,
        error: 'Password must be at least 6 characters',
      );
      throw Exception('Password must be at least 6 characters');
    }

    // Mock successful login
    final mockUser = UserModel(
      uid: 'mock-user-id',
      email: email,
      displayName: 'Test User',
      role: 'user',
      createdAt: DateTime.now(),
      isActive: true,
      preferences: {
        'notifications': true,
        'location': true,
        'language': 'en',
      },
      location: {
        'city': 'Riyadh',
        'coordinates': null,
      },
    );

    state = state.copyWith(
      isLoading: false,
      user: mockUser,
    );
  }

  // Sign up with email and password
  Future<void> signUpWithEmail({
    required String email,
    required String password,
    required String displayName,
    String? phoneNumber,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    // Simulate network delay
    await Future.delayed(const Duration(seconds: 2));

    // Mock validation
    if (email.isEmpty || password.isEmpty || displayName.isEmpty) {
      state = state.copyWith(
        isLoading: false,
        error: 'Please fill in all required fields',
      );
      throw Exception('Please fill in all required fields');
    }

    if (password.length < 8) {
      state = state.copyWith(
        isLoading: false,
        error: 'Password must be at least 8 characters',
      );
      throw Exception('Password must be at least 8 characters');
    }

    // Mock successful registration
    final mockUser = UserModel(
      uid: 'mock-user-id-${DateTime.now().millisecondsSinceEpoch}',
      email: email,
      displayName: displayName,
      phoneNumber: phoneNumber,
      role: 'user',
      createdAt: DateTime.now(),
      isActive: true,
      preferences: {
        'notifications': true,
        'location': true,
        'language': 'en',
      },
      location: {
        'city': '',
        'coordinates': null,
      },
    );

    state = state.copyWith(
      isLoading: false,
      user: mockUser,
    );
  }

  // Sign in with Google
  Future<void> signInWithGoogle() async {
    state = state.copyWith(isLoading: true, error: null);

    // Simulate network delay
    await Future.delayed(const Duration(seconds: 2));

    // Mock successful Google sign-in
    final mockUser = UserModel(
      uid: 'google-user-id',
      email: 'test@gmail.com',
      displayName: 'Google User',
      role: 'user',
      createdAt: DateTime.now(),
      isActive: true,
      preferences: {
        'notifications': true,
        'location': true,
        'language': 'en',
      },
      location: {
        'city': 'Riyadh',
        'coordinates': null,
      },
    );

    state = state.copyWith(
      isLoading: false,
      user: mockUser,
    );
  }

  // Sign in with Facebook
  Future<void> signInWithFacebook() async {
    state = state.copyWith(isLoading: true, error: null);

    // Simulate network delay
    await Future.delayed(const Duration(seconds: 2));

    // Mock successful Facebook sign-in
    final mockUser = UserModel(
      uid: 'facebook-user-id',
      email: 'test@facebook.com',
      displayName: 'Facebook User',
      role: 'user',
      createdAt: DateTime.now(),
      isActive: true,
      preferences: {
        'notifications': true,
        'location': true,
        'language': 'en',
      },
      location: {
        'city': 'Jeddah',
        'coordinates': null,
      },
    );

    state = state.copyWith(
      isLoading: false,
      user: mockUser,
    );
  }

  // Sign out
  Future<void> signOut() async {
    state = state.copyWith(isLoading: true);

    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));

    state = state.copyWith(isLoading: false, user: null);
  }

  // Reset password
  Future<void> resetPassword(String email) async {
    state = state.copyWith(isLoading: true, error: null);

    // Simulate network delay
    await Future.delayed(const Duration(seconds: 2));

    // Mock validation
    if (email.isEmpty) {
      state = state.copyWith(
        isLoading: false,
        error: 'Please enter your email address',
      );
      throw Exception('Please enter your email address');
    }

    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email)) {
      state = state.copyWith(
        isLoading: false,
        error: 'Please enter a valid email address',
      );
      throw Exception('Please enter a valid email address');
    }

    // Mock successful password reset
    state = state.copyWith(isLoading: false);
  }

  // Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }
}

// Mock Auth Provider
final mockAuthProvider = StateNotifierProvider<MockAuthNotifier, MockAuthState>((ref) {
  return MockAuthNotifier();
});

// Mock Current User Provider
final mockCurrentUserProvider = Provider<UserModel?>((ref) {
  final authState = ref.watch(mockAuthProvider);
  return authState.user;
});
