import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';

class FirebaseService {
  static FirebaseService? _instance;
  static FirebaseService get instance => _instance ??= FirebaseService._();
  
  FirebaseService._();
  
  // Firebase instances
  late FirebaseAuth _auth;
  late FirebaseFirestore _firestore;
  late FirebaseStorage _storage;
  late FirebaseAnalytics _analytics;
  late FirebaseMessaging _messaging;
  late FirebaseCrashlytics _crashlytics;
  
  // Getters
  FirebaseAuth get auth => _auth;
  FirebaseFirestore get firestore => _firestore;
  FirebaseStorage get storage => _storage;
  FirebaseAnalytics get analytics => _analytics;
  FirebaseMessaging get messaging => _messaging;
  FirebaseCrashlytics get crashlytics => _crashlytics;
  
  /// Initialize Firebase services
  Future<void> initialize() async {
    try {
      // Initialize Firebase Core
      await Firebase.initializeApp();
      
      // Initialize Firebase services
      _auth = FirebaseAuth.instance;
      _firestore = FirebaseFirestore.instance;
      _storage = FirebaseStorage.instance;
      _analytics = FirebaseAnalytics.instance;
      _messaging = FirebaseMessaging.instance;
      _crashlytics = FirebaseCrashlytics.instance;
      
      // Configure Firestore settings
      await _configureFirestore();
      
      // Configure Analytics
      await _configureAnalytics();
      
      // Configure Messaging
      await _configureMessaging();
      
      // Configure Crashlytics
      await _configureCrashlytics();
      
      debugPrint('Firebase services initialized successfully');
    } catch (e, stackTrace) {
      debugPrint('Error initializing Firebase services: $e');
      debugPrint('Stack trace: $stackTrace');
      rethrow;
    }
  }
  
  /// Configure Firestore settings
  Future<void> _configureFirestore() async {
    try {
      // Enable offline persistence
      await _firestore.enablePersistence(
        const PersistenceSettings(synchronizeTabs: true),
      );
      
      // Configure cache size
      await _firestore.settings = const Settings(
        persistenceEnabled: true,
        cacheSizeBytes: Settings.CACHE_SIZE_UNLIMITED,
      );
      
      debugPrint('Firestore configured successfully');
    } catch (e) {
      debugPrint('Error configuring Firestore: $e');
    }
  }
  
  /// Configure Analytics
  Future<void> _configureAnalytics() async {
    try {
      // Set user properties
      await _analytics.setAnalyticsCollectionEnabled(true);
      
      // Set default event parameters
      await _analytics.setDefaultEventParameters({
        'app_version': '1.0.0',
        'platform': defaultTargetPlatform.toString(),
      });
      
      debugPrint('Analytics configured successfully');
    } catch (e) {
      debugPrint('Error configuring Analytics: $e');
    }
  }
  
  /// Configure Messaging
  Future<void> _configureMessaging() async {
    try {
      // Request permission for notifications
      NotificationSettings settings = await _messaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );
      
      debugPrint('User granted permission: ${settings.authorizationStatus}');
      
      // Get FCM token
      String? token = await _messaging.getToken();
      if (token != null) {
        debugPrint('FCM Token: $token');
        // Store token in user document when user is authenticated
        _storeFcmToken(token);
      }
      
      // Listen for token refresh
      _messaging.onTokenRefresh.listen((token) {
        debugPrint('FCM Token refreshed: $token');
        _storeFcmToken(token);
      });
      
      // Handle foreground messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('Got a message whilst in the foreground!');
        debugPrint('Message data: ${message.data}');
        
        if (message.notification != null) {
          debugPrint('Message also contained a notification: ${message.notification}');
        }
        
        // Handle the message (show notification, update UI, etc.)
        _handleForegroundMessage(message);
      });
      
      // Handle background messages
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
      
      // Handle when app is opened from notification
      RemoteMessage? initialMessage = await _messaging.getInitialMessage();
      if (initialMessage != null) {
        debugPrint('App opened from notification: ${initialMessage.data}');
        _handleInitialMessage(initialMessage);
      }
      
      // Handle when app is in background and notification is tapped
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint('App opened from background notification: ${message.data}');
        _handleBackgroundMessageTap(message);
      });
      
      debugPrint('Messaging configured successfully');
    } catch (e) {
      debugPrint('Error configuring Messaging: $e');
    }
  }
  
  /// Configure Crashlytics
  Future<void> _configureCrashlytics() async {
    try {
      // Enable Crashlytics collection
      await _crashlytics.setCrashlyticsCollectionEnabled(true);
      
      // Set user identifier when user is authenticated
      User? user = _auth.currentUser;
      if (user != null) {
        await _crashlytics.setUserIdentifier(user.uid);
      }
      
      // Listen for auth state changes to update user identifier
      _auth.authStateChanges().listen((User? user) {
        if (user != null) {
          _crashlytics.setUserIdentifier(user.uid);
        } else {
          _crashlytics.setUserIdentifier('');
        }
      });
      
      debugPrint('Crashlytics configured successfully');
    } catch (e) {
      debugPrint('Error configuring Crashlytics: $e');
    }
  }
  
  /// Store FCM token in user document
  Future<void> _storeFcmToken(String token) async {
    try {
      User? user = _auth.currentUser;
      if (user != null) {
        await _firestore
            .collection('users')
            .doc(user.uid)
            .update({'fcmToken': token});
      }
    } catch (e) {
      debugPrint('Error storing FCM token: $e');
    }
  }
  
  /// Handle foreground messages
  void _handleForegroundMessage(RemoteMessage message) {
    // TODO: Implement foreground message handling
    // This could include showing a local notification, updating UI, etc.
    debugPrint('Handling foreground message: ${message.data}');
  }
  
  /// Handle initial message when app is opened from notification
  void _handleInitialMessage(RemoteMessage message) {
    // TODO: Implement initial message handling
    // This could include navigating to a specific screen, etc.
    debugPrint('Handling initial message: ${message.data}');
  }
  
  /// Handle background message tap
  void _handleBackgroundMessageTap(RemoteMessage message) {
    // TODO: Implement background message tap handling
    // This could include navigating to a specific screen, etc.
    debugPrint('Handling background message tap: ${message.data}');
  }
  
  /// Log custom event to Analytics
  Future<void> logEvent({
    required String name,
    Map<String, dynamic>? parameters,
  }) async {
    try {
      await _analytics.logEvent(
        name: name,
        parameters: parameters,
      );
    } catch (e) {
      debugPrint('Error logging analytics event: $e');
    }
  }
  
  /// Log error to Crashlytics
  Future<void> logError(
    dynamic error,
    StackTrace? stackTrace, {
    String? reason,
  }) async {
    try {
      await _crashlytics.recordError(
        error,
        stackTrace,
        reason: reason,
      );
    } catch (e) {
      debugPrint('Error logging to Crashlytics: $e');
    }
  }
  
  /// Set custom key in Crashlytics
  Future<void> setCustomKey(String key, dynamic value) async {
    try {
      await _crashlytics.setCustomKey(key, value);
    } catch (e) {
      debugPrint('Error setting custom key in Crashlytics: $e');
    }
  }
  
  /// Set user properties in Analytics
  Future<void> setUserProperties(Map<String, String> properties) async {
    try {
      for (String key in properties.keys) {
        await _analytics.setUserProperty(
          name: key,
          value: properties[key],
        );
      }
    } catch (e) {
      debugPrint('Error setting user properties in Analytics: $e');
    }
  }
  
  /// Clear all data (for testing or logout)
  Future<void> clearData() async {
    try {
      // Clear Firestore cache
      await _firestore.clearPersistence();
      
      // Clear Storage cache
      // Note: Firebase Storage doesn't have a direct cache clearing method
      // The cache is managed by the system and will be cleared automatically
      
      debugPrint('Firebase data cleared successfully');
    } catch (e) {
      debugPrint('Error clearing Firebase data: $e');
    }
  }
  
  /// Dispose resources
  void dispose() {
    // Note: Firebase services are singleton and don't need explicit disposal
    // This method is included for consistency with other services
    debugPrint('Firebase service disposed');
  }
}

// Background message handler (must be top-level function)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Initialize Firebase for background handling
  await Firebase.initializeApp();
  
  debugPrint('Handling a background message: ${message.messageId}');
  debugPrint('Message data: ${message.data}');
  
  // TODO: Implement background message handling
  // This could include updating local storage, etc.
}
