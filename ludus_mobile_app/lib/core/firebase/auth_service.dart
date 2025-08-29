import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:flutter/foundation.dart';
import '../constants/firebase_constants.dart';
import '../constants/app_constants.dart';
import 'firebase_service.dart';

class AuthService {
  static AuthService? _instance;
  static AuthService get instance => _instance ??= AuthService._();
  
  AuthService._();
  
  final FirebaseAuth _auth = FirebaseService.instance.auth;
  final FirebaseFirestore _firestore = FirebaseService.instance.firestore;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  
  // Current user stream
  Stream<User?> get authStateChanges => _auth.authStateChanges();
  
  // Current user
  User? get currentUser => _auth.currentUser;
  
  /// Sign in with email and password
  Future<UserCredential> signInWithEmail(String email, String password) async {
    try {
      final credential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      // Update last active timestamp
      await _updateLastActive(credential.user!.uid);
      
      // Log analytics event
      await FirebaseService.instance.logEvent(
        name: 'user_sign_in',
        parameters: {
          'method': 'email',
          'user_id': credential.user!.uid,
        },
      );
      
      return credential;
    } on FirebaseAuthException catch (e) {
      _logAuthError('signInWithEmail', e);
      rethrow;
    }
  }
  
  /// Sign up with email and password
  Future<UserCredential> signUpWithEmail({
    required String email,
    required String password,
    required String displayName,
    String? phoneNumber,
  }) async {
    try {
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      // Update user profile
      await credential.user!.updateDisplayName(displayName);
      
      // Create user document in Firestore
      await _createUserDocument(
        uid: credential.user!.uid,
        email: email,
        displayName: displayName,
        phoneNumber: phoneNumber,
      );
      
      // Log analytics event
      await FirebaseService.instance.logEvent(
        name: 'user_sign_up',
        parameters: {
          'method': 'email',
          'user_id': credential.user!.uid,
        },
      );
      
      return credential;
    } on FirebaseAuthException catch (e) {
      _logAuthError('signUpWithEmail', e);
      rethrow;
    }
  }
  
  /// Sign in with Google
  Future<UserCredential?> signInWithGoogle() async {
    try {
      // Trigger the authentication flow
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      
      if (googleUser == null) {
        return null; // User cancelled the sign-in
      }
      
      // Obtain the auth details from the request
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      
      // Create a new credential
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );
      
      // Sign in to Firebase with the credential
      final userCredential = await _auth.signInWithCredential(credential);
      
      // Check if this is a new user
      if (userCredential.additionalUserInfo!.isNewUser) {
        // Create user document in Firestore
        await _createUserDocument(
          uid: userCredential.user!.uid,
          email: userCredential.user!.email!,
          displayName: userCredential.user!.displayName ?? 'User',
          profilePicture: userCredential.user!.photoURL,
        );
      } else {
        // Update last active timestamp for existing user
        await _updateLastActive(userCredential.user!.uid);
      }
      
      // Log analytics event
      await FirebaseService.instance.logEvent(
        name: 'user_sign_in',
        parameters: {
          'method': 'google',
          'user_id': userCredential.user!.uid,
          'is_new_user': userCredential.additionalUserInfo!.isNewUser,
        },
      );
      
      return userCredential;
    } on FirebaseAuthException catch (e) {
      _logAuthError('signInWithGoogle', e);
      rethrow;
    } catch (e) {
      debugPrint('Error signing in with Google: $e');
      rethrow;
    }
  }
  
  /// Sign in with Facebook
  Future<UserCredential?> signInWithFacebook() async {
    try {
      // Trigger the sign-in flow
      final LoginResult result = await FacebookAuth.instance.login();
      
      if (result.status != LoginStatus.success) {
        return null; // User cancelled or error occurred
      }
      
      // Create a credential from the access token
      final OAuthCredential credential = FacebookAuthProvider.credential(
        result.accessToken!.token,
      );
      
      // Sign in to Firebase with the credential
      final userCredential = await _auth.signInWithCredential(credential);
      
      // Check if this is a new user
      if (userCredential.additionalUserInfo!.isNewUser) {
        // Get user data from Facebook
        final userData = await FacebookAuth.instance.getUserData();
        
        // Create user document in Firestore
        await _createUserDocument(
          uid: userCredential.user!.uid,
          email: userCredential.user!.email ?? userData['email'] ?? '',
          displayName: userCredential.user!.displayName ?? userData['name'] ?? 'User',
          profilePicture: userCredential.user!.photoURL ?? userData['picture']?['data']?['url'],
        );
      } else {
        // Update last active timestamp for existing user
        await _updateLastActive(userCredential.user!.uid);
      }
      
      // Log analytics event
      await FirebaseService.instance.logEvent(
        name: 'user_sign_in',
        parameters: {
          'method': 'facebook',
          'user_id': userCredential.user!.uid,
          'is_new_user': userCredential.additionalUserInfo!.isNewUser,
        },
      );
      
      return userCredential;
    } on FirebaseAuthException catch (e) {
      _logAuthError('signInWithFacebook', e);
      rethrow;
    } catch (e) {
      debugPrint('Error signing in with Facebook: $e');
      rethrow;
    }
  }
  
  /// Sign in with Apple
  Future<UserCredential?> signInWithApple() async {
    try {
      // Check if Apple Sign In is available
      final isAvailable = await SignInWithApple.isAvailable();
      if (!isAvailable) {
        throw Exception('Apple Sign In is not available on this device');
      }
      
      // Request credential for the currently signed in Apple account
      final appleCredential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );
      
      // Create an `OAuthCredential` from the credential returned by Apple
      final oauthCredential = OAuthProvider("apple.com").credential(
        idToken: appleCredential.identityToken,
        accessToken: appleCredential.authorizationCode,
      );
      
      // Sign in to Firebase with the credential
      final userCredential = await _auth.signInWithCredential(oauthCredential);
      
      // Check if this is a new user
      if (userCredential.additionalUserInfo!.isNewUser) {
        // Create user document in Firestore
        final displayName = appleCredential.givenName != null && appleCredential.familyName != null
            ? '${appleCredential.givenName} ${appleCredential.familyName}'
            : 'User';
            
        await _createUserDocument(
          uid: userCredential.user!.uid,
          email: userCredential.user!.email ?? appleCredential.email ?? '',
          displayName: displayName,
        );
      } else {
        // Update last active timestamp for existing user
        await _updateLastActive(userCredential.user!.uid);
      }
      
      // Log analytics event
      await FirebaseService.instance.logEvent(
        name: 'user_sign_in',
        parameters: {
          'method': 'apple',
          'user_id': userCredential.user!.uid,
          'is_new_user': userCredential.additionalUserInfo!.isNewUser,
        },
      );
      
      return userCredential;
    } on FirebaseAuthException catch (e) {
      _logAuthError('signInWithApple', e);
      rethrow;
    } catch (e) {
      debugPrint('Error signing in with Apple: $e');
      rethrow;
    }
  }
  
  /// Sign out
  Future<void> signOut() async {
    try {
      // Sign out from Firebase
      await _auth.signOut();
      
      // Sign out from Google
      await _googleSignIn.signOut();
      
      // Sign out from Facebook
      await FacebookAuth.instance.logOut();
      
      // Log analytics event
      await FirebaseService.instance.logEvent(
        name: 'user_sign_out',
        parameters: {
          'user_id': currentUser?.uid,
        },
      );
      
      debugPrint('User signed out successfully');
    } catch (e) {
      debugPrint('Error signing out: $e');
      rethrow;
    }
  }
  
  /// Send password reset email
  Future<void> sendPasswordResetEmail(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email);
      
      // Log analytics event
      await FirebaseService.instance.logEvent(
        name: 'password_reset_email_sent',
        parameters: {
          'email': email,
        },
      );
      
      debugPrint('Password reset email sent successfully');
    } on FirebaseAuthException catch (e) {
      _logAuthError('sendPasswordResetEmail', e);
      rethrow;
    }
  }
  
  /// Update user profile
  Future<void> updateProfile({
    String? displayName,
    String? photoURL,
  }) async {
    try {
      final user = currentUser;
      if (user == null) {
        throw Exception('No user is currently signed in');
      }
      
      // Update Firebase Auth profile
      await user.updateDisplayName(displayName);
      if (photoURL != null) {
        await user.updatePhotoURL(photoURL);
      }
      
      // Update Firestore document
      final updates = <String, dynamic>{
        FirebaseConstants.userUpdatedAt: FieldValue.serverTimestamp(),
      };
      
      if (displayName != null) {
        updates[FirebaseConstants.userDisplayName] = displayName;
      }
      if (photoURL != null) {
        updates[FirebaseConstants.userProfilePicture] = photoURL;
      }
      
      await _firestore
          .collection(FirebaseConstants.usersCollection)
          .doc(user.uid)
          .update(updates);
      
      debugPrint('User profile updated successfully');
    } catch (e) {
      debugPrint('Error updating user profile: $e');
      rethrow;
    }
  }
  
  /// Update user email
  Future<void> updateEmail(String newEmail) async {
    try {
      final user = currentUser;
      if (user == null) {
        throw Exception('No user is currently signed in');
      }
      
      // Update Firebase Auth email
      await user.updateEmail(newEmail);
      
      // Update Firestore document
      await _firestore
          .collection(FirebaseConstants.usersCollection)
          .doc(user.uid)
          .update({
        FirebaseConstants.userEmail: newEmail,
        FirebaseConstants.userUpdatedAt: FieldValue.serverTimestamp(),
      });
      
      debugPrint('User email updated successfully');
    } on FirebaseAuthException catch (e) {
      _logAuthError('updateEmail', e);
      rethrow;
    }
  }
  
  /// Update user password
  Future<void> updatePassword(String newPassword) async {
    try {
      final user = currentUser;
      if (user == null) {
        throw Exception('No user is currently signed in');
      }
      
      await user.updatePassword(newPassword);
      
      debugPrint('User password updated successfully');
    } on FirebaseAuthException catch (e) {
      _logAuthError('updatePassword', e);
      rethrow;
    }
  }
  
  /// Delete user account
  Future<void> deleteAccount() async {
    try {
      final user = currentUser;
      if (user == null) {
        throw Exception('No user is currently signed in');
      }
      
      // Delete user document from Firestore
      await _firestore
          .collection(FirebaseConstants.usersCollection)
          .doc(user.uid)
          .delete();
      
      // Delete user from Firebase Auth
      await user.delete();
      
      // Log analytics event
      await FirebaseService.instance.logEvent(
        name: 'user_account_deleted',
        parameters: {
          'user_id': user.uid,
        },
      );
      
      debugPrint('User account deleted successfully');
    } on FirebaseAuthException catch (e) {
      _logAuthError('deleteAccount', e);
      rethrow;
    }
  }
  
  /// Get user data from Firestore
  Future<Map<String, dynamic>?> getUserData(String uid) async {
    try {
      final doc = await _firestore
          .collection(FirebaseConstants.usersCollection)
          .doc(uid)
          .get();
      
      if (doc.exists) {
        return doc.data();
      }
      return null;
    } catch (e) {
      debugPrint('Error getting user data: $e');
      rethrow;
    }
  }
  
  /// Update user data in Firestore
  Future<void> updateUserData(String uid, Map<String, dynamic> data) async {
    try {
      await _firestore
          .collection(FirebaseConstants.usersCollection)
          .doc(uid)
          .update({
        ...data,
        FirebaseConstants.userUpdatedAt: FieldValue.serverTimestamp(),
      });
      
      debugPrint('User data updated successfully');
    } catch (e) {
      debugPrint('Error updating user data: $e');
      rethrow;
    }
  }
  
  /// Create user document in Firestore
  Future<void> _createUserDocument({
    required String uid,
    required String email,
    required String displayName,
    String? phoneNumber,
    String? profilePicture,
  }) async {
    try {
      final userData = {
        FirebaseConstants.userUid: uid,
        FirebaseConstants.userEmail: email,
        FirebaseConstants.userDisplayName: displayName,
        FirebaseConstants.userRole: FirebaseConstants.userRoleUser,
        FirebaseConstants.userCreatedAt: FieldValue.serverTimestamp(),
        FirebaseConstants.userUpdatedAt: FieldValue.serverTimestamp(),
        FirebaseConstants.userIsVerified: false,
        FirebaseConstants.userLastActive: FieldValue.serverTimestamp(),
      };
      
      if (phoneNumber != null) {
        userData[FirebaseConstants.userPhoneNumber] = phoneNumber;
      }
      
      if (profilePicture != null) {
        userData[FirebaseConstants.userProfilePicture] = profilePicture;
      }
      
      await _firestore
          .collection(FirebaseConstants.usersCollection)
          .doc(uid)
          .set(userData);
      
      debugPrint('User document created successfully');
    } catch (e) {
      debugPrint('Error creating user document: $e');
      rethrow;
    }
  }
  
  /// Update last active timestamp
  Future<void> _updateLastActive(String uid) async {
    try {
      await _firestore
          .collection(FirebaseConstants.usersCollection)
          .doc(uid)
          .update({
        FirebaseConstants.userLastActive: FieldValue.serverTimestamp(),
      });
    } catch (e) {
      debugPrint('Error updating last active: $e');
    }
  }
  
  /// Log authentication errors
  void _logAuthError(String method, FirebaseAuthException e) {
    debugPrint('Auth error in $method: ${e.code} - ${e.message}');
    
    // Log to Crashlytics
    FirebaseService.instance.logError(
      e,
      StackTrace.current,
      reason: 'Authentication error in $method',
    );
    
    // Log to Analytics
    FirebaseService.instance.logEvent(
      name: 'auth_error',
      parameters: {
        'method': method,
        'error_code': e.code,
        'error_message': e.message,
      },
    );
  }
  
  /// Get authentication error message
  String getAuthErrorMessage(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return 'No user found with this email address.';
      case 'wrong-password':
        return 'Incorrect password. Please try again.';
      case 'email-already-in-use':
        return 'An account with this email already exists.';
      case 'weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'invalid-email':
        return 'Invalid email address.';
      case 'user-disabled':
        return 'This account has been disabled.';
      case 'too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'operation-not-allowed':
        return 'This sign-in method is not enabled.';
      case 'network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}
