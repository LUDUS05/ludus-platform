import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../core/models/user_model.dart';

// Firebase Auth instance
final firebaseAuthProvider = Provider<FirebaseAuth>((ref) {
  return FirebaseAuth.instance;
});

// Firestore instance
final firestoreProvider = Provider<FirebaseFirestore>((ref) {
  return FirebaseFirestore.instance;
});

// Auth state provider
final authStateProvider = StreamProvider<User?>((ref) {
  final auth = ref.watch(firebaseAuthProvider);
  return auth.authStateChanges();
});

// Current user provider
final currentUserProvider = Provider<UserModel?>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState.when(
    data: (user) => user != null ? UserModel.fromFirebaseUser(user) : null,
    loading: () => null,
    error: (_, __) => null,
  );
});

// Auth provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final auth = ref.watch(firebaseAuthProvider);
  final firestore = ref.watch(firestoreProvider);
  return AuthNotifier(auth, firestore);
});

// Auth state
class AuthState {
  final bool isLoading;
  final String? error;
  final UserModel? user;

  const AuthState({
    this.isLoading = false,
    this.error,
    this.user,
  });

  AuthState copyWith({
    bool? isLoading,
    String? error,
    UserModel? user,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      user: user ?? this.user,
    );
  }
}

// Auth notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final FirebaseAuth _auth;
  final FirebaseFirestore _firestore;
  final GoogleSignIn _googleSignIn = GoogleSignIn();

  AuthNotifier(this._auth, this._firestore) : super(const AuthState());

  // Sign in with email and password
  Future<void> signInWithEmail({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final userCredential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (userCredential.user != null) {
        await _updateUserData(userCredential.user!);
        state = state.copyWith(
          isLoading: false,
          user: UserModel.fromFirebaseUser(userCredential.user!),
        );
      }
    } on FirebaseAuthException catch (e) {
      String errorMessage = 'An error occurred during sign in';
      
      switch (e.code) {
        case 'user-not-found':
          errorMessage = 'No user found with this email address';
          break;
        case 'wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
      }

      state = state.copyWith(isLoading: false, error: errorMessage);
      throw Exception(errorMessage);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      throw Exception(e.toString());
    }
  }

  // Sign up with email and password
  Future<void> signUpWithEmail({
    required String email,
    required String password,
    required String displayName,
    String? phoneNumber,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final userCredential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (userCredential.user != null) {
        // Update display name
        await userCredential.user!.updateDisplayName(displayName);
        
        // Update phone number if provided
        if (phoneNumber != null) {
          await userCredential.user!.updatePhoneNumber(phoneNumber as PhoneAuthCredential);
        }

        // Create user document in Firestore
        await _createUserDocument(userCredential.user!, displayName, phoneNumber);

        state = state.copyWith(
          isLoading: false,
          user: UserModel.fromFirebaseUser(userCredential.user!),
        );
      }
    } on FirebaseAuthException catch (e) {
      String errorMessage = 'An error occurred during sign up';
      
      switch (e.code) {
        case 'email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'weak-password':
          errorMessage = 'Password is too weak';
          break;
        case 'operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
      }

      state = state.copyWith(isLoading: false, error: errorMessage);
      throw Exception(errorMessage);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      throw Exception(e.toString());
    }
  }

  // Sign in with Google
  Future<void> signInWithGoogle() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      
      if (googleUser == null) {
        state = state.copyWith(isLoading: false);
        return;
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential = await _auth.signInWithCredential(credential);

      if (userCredential.user != null) {
        await _updateUserData(userCredential.user!);
        state = state.copyWith(
          isLoading: false,
          user: UserModel.fromFirebaseUser(userCredential.user!),
        );
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      throw Exception(e.toString());
    }
  }

  // Sign in with Facebook
  Future<void> signInWithFacebook() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final LoginResult result = await FacebookAuth.instance.login();

      if (result.status == LoginStatus.success) {
        final OAuthCredential credential = FacebookAuthProvider.credential(
          result.accessToken!.token,
        );

        final userCredential = await _auth.signInWithCredential(credential);

        if (userCredential.user != null) {
          await _updateUserData(userCredential.user!);
          state = state.copyWith(
            isLoading: false,
            user: UserModel.fromFirebaseUser(userCredential.user!),
          );
        }
      } else {
        state = state.copyWith(isLoading: false, error: 'Facebook login failed');
        throw Exception('Facebook login failed');
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      throw Exception(e.toString());
    }
  }

  // Sign in with Apple
  Future<void> signInWithApple() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );

      final oauthCredential = OAuthProvider('apple.com').credential(
        idToken: credential.identityToken,
        accessToken: credential.authorizationCode,
      );

      final userCredential = await _auth.signInWithCredential(oauthCredential);

      if (userCredential.user != null) {
        await _updateUserData(userCredential.user!);
        state = state.copyWith(
          isLoading: false,
          user: UserModel.fromFirebaseUser(userCredential.user!),
        );
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      throw Exception(e.toString());
    }
  }

  // Sign out
  Future<void> signOut() async {
    state = state.copyWith(isLoading: true);

    try {
      await Future.wait([
        _auth.signOut(),
        _googleSignIn.signOut(),
        FacebookAuth.instance.logOut(),
      ]);

      state = state.copyWith(isLoading: false, user: null);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      throw Exception(e.toString());
    }
  }

  // Reset password
  Future<void> resetPassword(String email) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      await _auth.sendPasswordResetEmail(email: email);
      state = state.copyWith(isLoading: false);
    } on FirebaseAuthException catch (e) {
      String errorMessage = 'An error occurred while resetting password';
      
      switch (e.code) {
        case 'user-not-found':
          errorMessage = 'No user found with this email address';
          break;
        case 'invalid-email':
          errorMessage = 'Invalid email address';
          break;
      }

      state = state.copyWith(isLoading: false, error: errorMessage);
      throw Exception(errorMessage);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      throw Exception(e.toString());
    }
  }

  // Update user data in Firestore
  Future<void> _updateUserData(User user) async {
    try {
      final userDoc = _firestore.collection('users').doc(user.uid);
      final userData = await userDoc.get();

      if (!userData.exists) {
        // Create new user document
        await _createUserDocument(user, user.displayName ?? '', user.phoneNumber);
      } else {
        // Update existing user document
        await userDoc.update({
          'lastSignInAt': FieldValue.serverTimestamp(),
          'displayName': user.displayName,
          'email': user.email,
          'photoURL': user.photoURL,
        });
      }
    } catch (e) {
      // Log error but don't throw to avoid breaking auth flow
      print('Error updating user data: $e');
    }
  }

  // Create user document in Firestore
  Future<void> _createUserDocument(User user, String displayName, String? phoneNumber) async {
    try {
      await _firestore.collection('users').doc(user.uid).set({
        'uid': user.uid,
        'email': user.email,
        'displayName': displayName,
        'phoneNumber': phoneNumber,
        'photoURL': user.photoURL,
        'role': 'user',
        'createdAt': FieldValue.serverTimestamp(),
        'lastSignInAt': FieldValue.serverTimestamp(),
        'isActive': true,
        'preferences': {
          'notifications': true,
          'location': true,
          'language': 'en',
        },
        'location': {
          'city': '',
          'coordinates': null,
        },
      });
    } catch (e) {
      print('Error creating user document: $e');
    }
  }

  // Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }
}
