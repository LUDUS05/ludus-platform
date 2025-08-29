import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import '../constants/firebase_constants.dart';
import 'firebase_service.dart';

class FirestoreService {
  static FirestoreService? _instance;
  static FirestoreService get instance => _instance ??= FirestoreService._();
  
  FirestoreService._();
  
  final FirebaseFirestore _firestore = FirebaseService.instance.firestore;
  
  // Collection references
  CollectionReference get _usersCollection => 
      _firestore.collection(FirebaseConstants.usersCollection);
  CollectionReference get _activitiesCollection => 
      _firestore.collection(FirebaseConstants.activitiesCollection);
  CollectionReference get _bookingsCollection => 
      _firestore.collection(FirebaseConstants.bookingsCollection);
  CollectionReference get _reviewsCollection => 
      _firestore.collection(FirebaseConstants.reviewsCollection);
  CollectionReference get _categoriesCollection => 
      _firestore.collection(FirebaseConstants.categoriesCollection);
  CollectionReference get _tagsCollection => 
      _firestore.collection(FirebaseConstants.tagsCollection);
  CollectionReference get _notificationsCollection => 
      _firestore.collection(FirebaseConstants.notificationsCollection);
  CollectionReference get _paymentsCollection => 
      _firestore.collection(FirebaseConstants.paymentsCollection);
  CollectionReference get _conversationsCollection => 
      _firestore.collection(FirebaseConstants.conversationsCollection);
  CollectionReference get _messagesCollection => 
      _firestore.collection(FirebaseConstants.messagesCollection);
  CollectionReference get _followersCollection => 
      _firestore.collection(FirebaseConstants.followersCollection);
  CollectionReference get _favoritesCollection => 
      _firestore.collection(FirebaseConstants.favoritesCollection);
  CollectionReference get _reportsCollection => 
      _firestore.collection(FirebaseConstants.reportsCollection);
  CollectionReference get _analyticsCollection => 
      _firestore.collection(FirebaseConstants.analyticsCollection);
  
  // ==================== USER OPERATIONS ====================
  
  /// Get user document by ID
  Future<Map<String, dynamic>?> getUser(String uid) async {
    try {
      final doc = await _usersCollection.doc(uid).get();
      if (doc.exists) {
        return doc.data() as Map<String, dynamic>;
      }
      return null;
    } catch (e) {
      debugPrint('Error getting user: $e');
      rethrow;
    }
  }
  
  /// Get user document stream
  Stream<Map<String, dynamic>?> getUserStream(String uid) {
    return _usersCollection.doc(uid).snapshots().map((doc) {
      if (doc.exists) {
        return doc.data() as Map<String, dynamic>;
      }
      return null;
    });
  }
  
  /// Update user document
  Future<void> updateUser(String uid, Map<String, dynamic> data) async {
    try {
      await _usersCollection.doc(uid).update({
        ...data,
        FirebaseConstants.userUpdatedAt: FieldValue.serverTimestamp(),
      });
    } catch (e) {
      debugPrint('Error updating user: $e');
      rethrow;
    }
  }
  
  /// Delete user document
  Future<void> deleteUser(String uid) async {
    try {
      await _usersCollection.doc(uid).delete();
    } catch (e) {
      debugPrint('Error deleting user: $e');
      rethrow;
    }
  }
  
  // ==================== ACTIVITY OPERATIONS ====================
  
  /// Create new activity
  Future<String> createActivity(Map<String, dynamic> activityData) async {
    try {
      final docRef = await _activitiesCollection.add({
        ...activityData,
        FirebaseConstants.activityCreatedAt: FieldValue.serverTimestamp(),
        FirebaseConstants.activityUpdatedAt: FieldValue.serverTimestamp(),
      });
      
      // Update the document with its ID
      await docRef.update({FirebaseConstants.activityId: docRef.id});
      
      return docRef.id;
    } catch (e) {
      debugPrint('Error creating activity: $e');
      rethrow;
    }
  }
  
  /// Get activity by ID
  Future<Map<String, dynamic>?> getActivity(String activityId) async {
    try {
      final doc = await _activitiesCollection.doc(activityId).get();
      if (doc.exists) {
        return doc.data() as Map<String, dynamic>;
      }
      return null;
    } catch (e) {
      debugPrint('Error getting activity: $e');
      rethrow;
    }
  }
  
  /// Get activity stream
  Stream<Map<String, dynamic>?> getActivityStream(String activityId) {
    return _activitiesCollection.doc(activityId).snapshots().map((doc) {
      if (doc.exists) {
        return doc.data() as Map<String, dynamic>;
      }
      return null;
    });
  }
  
  /// Update activity
  Future<void> updateActivity(String activityId, Map<String, dynamic> data) async {
    try {
      await _activitiesCollection.doc(activityId).update({
        ...data,
        FirebaseConstants.activityUpdatedAt: FieldValue.serverTimestamp(),
      });
    } catch (e) {
      debugPrint('Error updating activity: $e');
      rethrow;
    }
  }
  
  /// Delete activity
  Future<void> deleteActivity(String activityId) async {
    try {
      await _activitiesCollection.doc(activityId).delete();
    } catch (e) {
      debugPrint('Error deleting activity: $e');
      rethrow;
    }
  }
  
  /// Get activities with filters
  Future<List<Map<String, dynamic>>> getActivities({
    String? vendorId,
    String? category,
    String? status,
    GeoPoint? location,
    double? radius,
    DateTime? startDate,
    DateTime? endDate,
    double? minPrice,
    double? maxPrice,
    int? limit,
    DocumentSnapshot? lastDocument,
  }) async {
    try {
      Query query = _activitiesCollection;
      
      // Apply filters
      if (vendorId != null) {
        query = query.where(FirebaseConstants.activityVendorId, isEqualTo: vendorId);
      }
      
      if (category != null) {
        query = query.where(FirebaseConstants.activityCategory, isEqualTo: category);
      }
      
      if (status != null) {
        query = query.where(FirebaseConstants.activityStatus, isEqualTo: status);
      }
      
      if (startDate != null) {
        query = query.where(FirebaseConstants.activityDateTime, isGreaterThanOrEqualTo: startDate);
      }
      
      if (endDate != null) {
        query = query.where(FirebaseConstants.activityDateTime, isLessThanOrEqualTo: endDate);
      }
      
      if (minPrice != null) {
        query = query.where(FirebaseConstants.activityPrice, isGreaterThanOrEqualTo: minPrice);
      }
      
      if (maxPrice != null) {
        query = query.where(FirebaseConstants.activityPrice, isLessThanOrEqualTo: maxPrice);
      }
      
      // Apply location filter if provided
      if (location != null && radius != null) {
        // Note: This is a simplified location query
        // For production, consider using GeoFirestore or similar
        query = query.where(FirebaseConstants.activityLocation, isGreaterThan: location);
      }
      
      // Apply pagination
      if (lastDocument != null) {
        query = query.startAfterDocument(lastDocument);
      }
      
      if (limit != null) {
        query = query.limit(limit);
      }
      
      // Order by creation date
      query = query.orderBy(FirebaseConstants.activityCreatedAt, descending: true);
      
      final querySnapshot = await query.get();
      
      return querySnapshot.docs.map((doc) {
        final data = doc.data() as Map<String, dynamic>;
        data[FirebaseConstants.activityId] = doc.id;
        return data;
      }).toList();
    } catch (e) {
      debugPrint('Error getting activities: $e');
      rethrow;
    }
  }
  
  /// Get activities stream
  Stream<List<Map<String, dynamic>>> getActivitiesStream({
    String? vendorId,
    String? category,
    String? status,
  }) {
    Query query = _activitiesCollection;
    
    if (vendorId != null) {
      query = query.where(FirebaseConstants.activityVendorId, isEqualTo: vendorId);
    }
    
    if (category != null) {
      query = query.where(FirebaseConstants.activityCategory, isEqualTo: category);
    }
    
    if (status != null) {
      query = query.where(FirebaseConstants.activityStatus, isEqualTo: status);
    }
    
    query = query.orderBy(FirebaseConstants.activityCreatedAt, descending: true);
    
    return query.snapshots().map((snapshot) {
      return snapshot.docs.map((doc) {
        final data = doc.data() as Map<String, dynamic>;
        data[FirebaseConstants.activityId] = doc.id;
        return data;
      }).toList();
    });
  }
  
  // ==================== BOOKING OPERATIONS ====================
  
  /// Create new booking
  Future<String> createBooking(Map<String, dynamic> bookingData) async {
    try {
      final docRef = await _bookingsCollection.add({
        ...bookingData,
        FirebaseConstants.bookingCreatedAt: FieldValue.serverTimestamp(),
        FirebaseConstants.bookingUpdatedAt: FieldValue.serverTimestamp(),
      });
      
      // Update the document with its ID
      await docRef.update({FirebaseConstants.bookingId: docRef.id});
      
      return docRef.id;
    } catch (e) {
      debugPrint('Error creating booking: $e');
      rethrow;
    }
  }
  
  /// Get booking by ID
  Future<Map<String, dynamic>?> getBooking(String bookingId) async {
    try {
      final doc = await _bookingsCollection.doc(bookingId).get();
      if (doc.exists) {
        return doc.data() as Map<String, dynamic>;
      }
      return null;
    } catch (e) {
      debugPrint('Error getting booking: $e');
      rethrow;
    }
  }
  
  /// Get booking stream
  Stream<Map<String, dynamic>?> getBookingStream(String bookingId) {
    return _bookingsCollection.doc(bookingId).snapshots().map((doc) {
      if (doc.exists) {
        return doc.data() as Map<String, dynamic>;
      }
      return null;
    });
  }
  
  /// Update booking
  Future<void> updateBooking(String bookingId, Map<String, dynamic> data) async {
    try {
      await _bookingsCollection.doc(bookingId).update({
        ...data,
        FirebaseConstants.bookingUpdatedAt: FieldValue.serverTimestamp(),
      });
    } catch (e) {
      debugPrint('Error updating booking: $e');
      rethrow;
    }
  }
  
  /// Get user bookings
  Future<List<Map<String, dynamic>>> getUserBookings(String userId, {
    String? status,
    int? limit,
    DocumentSnapshot? lastDocument,
  }) async {
    try {
      Query query = _bookingsCollection
          .where(FirebaseConstants.bookingUserId, isEqualTo: userId);
      
      if (status != null) {
        query = query.where(FirebaseConstants.bookingStatus, isEqualTo: status);
      }
      
      if (lastDocument != null) {
        query = query.startAfterDocument(lastDocument);
      }
      
      if (limit != null) {
        query = query.limit(limit);
      }
      
      query = query.orderBy(FirebaseConstants.bookingCreatedAt, descending: true);
      
      final querySnapshot = await query.get();
      
      return querySnapshot.docs.map((doc) {
        final data = doc.data() as Map<String, dynamic>;
        data[FirebaseConstants.bookingId] = doc.id;
        return data;
      }).toList();
    } catch (e) {
      debugPrint('Error getting user bookings: $e');
      rethrow;
    }
  }
  
  /// Get activity bookings
  Future<List<Map<String, dynamic>>> getActivityBookings(String activityId, {
    String? status,
  }) async {
    try {
      Query query = _bookingsCollection
          .where(FirebaseConstants.bookingActivityId, isEqualTo: activityId);
      
      if (status != null) {
        query = query.where(FirebaseConstants.bookingStatus, isEqualTo: status);
      }
      
      query = query.orderBy(FirebaseConstants.bookingCreatedAt, descending: true);
      
      final querySnapshot = await query.get();
      
      return querySnapshot.docs.map((doc) {
        final data = doc.data() as Map<String, dynamic>;
        data[FirebaseConstants.bookingId] = doc.id;
        return data;
      }).toList();
    } catch (e) {
      debugPrint('Error getting activity bookings: $e');
      rethrow;
    }
  }
  
  // ==================== REVIEW OPERATIONS ====================
  
  /// Create new review
  Future<String> createReview(Map<String, dynamic> reviewData) async {
    try {
      final docRef = await _reviewsCollection.add({
        ...reviewData,
        FirebaseConstants.reviewCreatedAt: FieldValue.serverTimestamp(),
        FirebaseConstants.reviewUpdatedAt: FieldValue.serverTimestamp(),
      });
      
      // Update the document with its ID
      await docRef.update({FirebaseConstants.reviewId: docRef.id});
      
      return docRef.id;
    } catch (e) {
      debugPrint('Error creating review: $e');
      rethrow;
    }
  }
  
  /// Get activity reviews
  Future<List<Map<String, dynamic>>> getActivityReviews(String activityId, {
    int? limit,
    DocumentSnapshot? lastDocument,
  }) async {
    try {
      Query query = _reviewsCollection
          .where(FirebaseConstants.reviewActivityId, isEqualTo: activityId)
          .orderBy(FirebaseConstants.reviewCreatedAt, descending: true);
      
      if (lastDocument != null) {
        query = query.startAfterDocument(lastDocument);
      }
      
      if (limit != null) {
        query = query.limit(limit);
      }
      
      final querySnapshot = await query.get();
      
      return querySnapshot.docs.map((doc) {
        final data = doc.data() as Map<String, dynamic>;
        data[FirebaseConstants.reviewId] = doc.id;
        return data;
      }).toList();
    } catch (e) {
      debugPrint('Error getting activity reviews: $e');
      rethrow;
    }
  }
  
  /// Update review
  Future<void> updateReview(String reviewId, Map<String, dynamic> data) async {
    try {
      await _reviewsCollection.doc(reviewId).update({
        ...data,
        FirebaseConstants.reviewUpdatedAt: FieldValue.serverTimestamp(),
        FirebaseConstants.reviewIsEdited: true,
      });
    } catch (e) {
      debugPrint('Error updating review: $e');
      rethrow;
    }
  }
  
  // ==================== CATEGORY OPERATIONS ====================
  
  /// Get all categories
  Future<List<Map<String, dynamic>>> getCategories() async {
    try {
      final querySnapshot = await _categoriesCollection
          .where(FirebaseConstants.categoryIsActive, isEqualTo: true)
          .orderBy(FirebaseConstants.categorySortOrder)
          .get();
      
      return querySnapshot.docs.map((doc) {
        final data = doc.data() as Map<String, dynamic>;
        data[FirebaseConstants.categoryId] = doc.id;
        return data;
      }).toList();
    } catch (e) {
      debugPrint('Error getting categories: $e');
      rethrow;
    }
  }
  
  /// Get categories stream
  Stream<List<Map<String, dynamic>>> getCategoriesStream() {
    return _categoriesCollection
        .where(FirebaseConstants.categoryIsActive, isEqualTo: true)
        .orderBy(FirebaseConstants.categorySortOrder)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) {
        final data = doc.data() as Map<String, dynamic>;
        data[FirebaseConstants.categoryId] = doc.id;
        return data;
      }).toList();
    });
  }
  
  // ==================== NOTIFICATION OPERATIONS ====================
  
  /// Create notification
  Future<String> createNotification(Map<String, dynamic> notificationData) async {
    try {
      final docRef = await _notificationsCollection.add({
        ...notificationData,
        FirebaseConstants.notificationCreatedAt: FieldValue.serverTimestamp(),
      });
      
      return docRef.id;
    } catch (e) {
      debugPrint('Error creating notification: $e');
      rethrow;
    }
  }
  
  /// Get user notifications
  Future<List<Map<String, dynamic>>> getUserNotifications(String userId, {
    int? limit,
    DocumentSnapshot? lastDocument,
  }) async {
    try {
      Query query = _notificationsCollection
          .where(FirebaseConstants.notificationUserId, isEqualTo: userId)
          .orderBy(FirebaseConstants.notificationCreatedAt, descending: true);
      
      if (lastDocument != null) {
        query = query.startAfterDocument(lastDocument);
      }
      
      if (limit != null) {
        query = query.limit(limit);
      }
      
      final querySnapshot = await query.get();
      
      return querySnapshot.docs.map((doc) {
        final data = doc.data() as Map<String, dynamic>;
        data[FirebaseConstants.notificationId] = doc.id;
        return data;
      }).toList();
    } catch (e) {
      debugPrint('Error getting user notifications: $e');
      rethrow;
    }
  }
  
  /// Mark notification as read
  Future<void> markNotificationAsRead(String notificationId) async {
    try {
      await _notificationsCollection.doc(notificationId).update({
        FirebaseConstants.notificationIsRead: true,
        FirebaseConstants.notificationReadAt: FieldValue.serverTimestamp(),
      });
    } catch (e) {
      debugPrint('Error marking notification as read: $e');
      rethrow;
    }
  }
  
  // ==================== FAVORITE OPERATIONS ====================
  
  /// Add activity to favorites
  Future<void> addToFavorites(String userId, String activityId) async {
    try {
      await _favoritesCollection.doc('${userId}_$activityId').set({
        FirebaseConstants.userId: userId,
        FirebaseConstants.activityId: activityId,
        'createdAt': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      debugPrint('Error adding to favorites: $e');
      rethrow;
    }
  }
  
  /// Remove activity from favorites
  Future<void> removeFromFavorites(String userId, String activityId) async {
    try {
      await _favoritesCollection.doc('${userId}_$activityId').delete();
    } catch (e) {
      debugPrint('Error removing from favorites: $e');
      rethrow;
    }
  }
  
  /// Check if activity is in favorites
  Future<bool> isFavorite(String userId, String activityId) async {
    try {
      final doc = await _favoritesCollection.doc('${userId}_$activityId').get();
      return doc.exists;
    } catch (e) {
      debugPrint('Error checking favorite status: $e');
      return false;
    }
  }
  
  /// Get user favorites
  Future<List<String>> getUserFavorites(String userId) async {
    try {
      final querySnapshot = await _favoritesCollection
          .where(FirebaseConstants.userId, isEqualTo: userId)
          .get();
      
      return querySnapshot.docs
          .map((doc) => doc.data()?[FirebaseConstants.activityId] as String)
          .toList();
    } catch (e) {
      debugPrint('Error getting user favorites: $e');
      return [];
    }
  }
  
  // ==================== ANALYTICS OPERATIONS ====================
  
  /// Log analytics event
  Future<void> logAnalyticsEvent(String event, Map<String, dynamic> properties) async {
    try {
      await _analyticsCollection.add({
        FirebaseConstants.analyticsEvent: event,
        FirebaseConstants.analyticsProperties: properties,
        FirebaseConstants.analyticsTimestamp: FieldValue.serverTimestamp(),
        FirebaseConstants.analyticsPlatform: 'mobile',
        FirebaseConstants.analyticsVersion: '1.0.0',
      });
    } catch (e) {
      debugPrint('Error logging analytics event: $e');
    }
  }
  
  // ==================== UTILITY OPERATIONS ====================
  
  /// Run a transaction
  Future<T> runTransaction<T>(Future<T> Function(Transaction) updateFunction) async {
    try {
      return await _firestore.runTransaction(updateFunction);
    } catch (e) {
      debugPrint('Error running transaction: $e');
      rethrow;
    }
  }
  
  /// Batch write operations
  Future<void> batchWrite(List<Map<String, dynamic>> operations) async {
    try {
      final batch = _firestore.batch();
      
      for (final operation in operations) {
        final type = operation['type'] as String;
        final collection = operation['collection'] as String;
        final documentId = operation['documentId'] as String?;
        final data = operation['data'] as Map<String, dynamic>;
        
        final docRef = _firestore.collection(collection).doc(documentId);
        
        switch (type) {
          case 'set':
            batch.set(docRef, data);
            break;
          case 'update':
            batch.update(docRef, data);
            break;
          case 'delete':
            batch.delete(docRef);
            break;
        }
      }
      
      await batch.commit();
    } catch (e) {
      debugPrint('Error in batch write: $e');
      rethrow;
    }
  }
  
  /// Enable offline persistence
  Future<void> enableOfflinePersistence() async {
    try {
      await _firestore.enablePersistence(
        const PersistenceSettings(synchronizeTabs: true),
      );
    } catch (e) {
      debugPrint('Error enabling offline persistence: $e');
    }
  }
  
  /// Clear offline persistence
  Future<void> clearOfflinePersistence() async {
    try {
      await _firestore.clearPersistence();
    } catch (e) {
      debugPrint('Error clearing offline persistence: $e');
    }
  }
}
