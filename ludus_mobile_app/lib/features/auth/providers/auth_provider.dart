import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../../core/firebase/auth_service.dart';

// Auth state class
class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;
  final bool isAuthenticated;

  const AuthState({
    this.user,
    this.isLoading = false,
    this.error,
    this.isAuthenticated = false,
  });

  AuthState copyWith({
    User? user,
    bool? isLoading,
    String? error,
    bool? isAuthenticated,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
    );
  }
}

// Auth notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService = AuthService.instance;

  AuthNotifier() : super(const AuthState()) {
    _init();
  }

  void _init() {
    // Listen to auth state changes
    _authService.authStateChanges.listen((User? user) {
      state = state.copyWith(
        user: user,
        isAuthenticated: user != null,
        error: null,
      );
    });
  }

  // Sign in with email and password
  Future<void> signInWithEmail(String email, String password) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      await _authService.signInWithEmail(email, password);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    } finally {
      state = state.copyWith(isLoading: false);
    }
  }

  // Sign up with email and password
  Future<void> signUpWithEmail({
    required String email,
    required String password,
    required String displayName,
    String? phoneNumber,
  }) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      await _authService.signUpWithEmail(
        email: email,
        password: password,
        displayName: displayName,
        phoneNumber: phoneNumber,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    } finally {
      state = state.copyWith(isLoading: false);
    }
  }

  // Sign in with Google
  Future<void> signInWithGoogle() async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      await _authService.signInWithGoogle();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    } finally {
      state = state.copyWith(isLoading: false);
    }
  }

  // Sign in with Facebook
  Future<void> signInWithFacebook() async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      await _authService.signInWithFacebook();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    } finally {
      state = state.copyWith(isLoading: false);
    }
  }

  // Sign in with Apple
  Future<void> signInWithApple() async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      await _authService.signInWithApple();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    } finally {
      state = state.copyWith(isLoading: false);
    }
  }

  // Sign out
  Future<void> signOut() async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      await _authService.signOut();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    } finally {
      state = state.copyWith(isLoading: false);
    }
  }

  // Send password reset email
  Future<void> sendPasswordResetEmail(String email) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      await _authService.sendPasswordResetEmail(email);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    } finally {
      state = state.copyWith(isLoading: false);
    }
  }

  // Update profile
  Future<void> updateProfile({
    String? displayName,
    String? photoURL,
  }) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      await _authService.updateProfile(
        displayName: displayName,
        photoURL: photoURL,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    } finally {
      state = state.copyWith(isLoading: false);
    }
  }

  // Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }
}

// Providers
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});

final userProvider = Provider<User?>((ref) {
  return ref.watch(authProvider).user;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isAuthenticated;
});

final isLoadingProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isLoading;
});

final authErrorProvider = Provider<String?>((ref) {
  return ref.watch(authProvider).error;
});
