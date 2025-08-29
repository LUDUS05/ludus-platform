class FirebaseConstants {
  // Firestore Collections
  static const String usersCollection = 'users';
  static const String activitiesCollection = 'activities';
  static const String bookingsCollection = 'bookings';
  static const String reviewsCollection = 'reviews';
  static const String categoriesCollection = 'categories';
  static const String tagsCollection = 'tags';
  static const String notificationsCollection = 'notifications';
  static const String paymentsCollection = 'payments';
  static const String conversationsCollection = 'conversations';
  static const String messagesCollection = 'messages';
  static const String followersCollection = 'followers';
  static const String favoritesCollection = 'favorites';
  static const String reportsCollection = 'reports';
  static const String analyticsCollection = 'analytics';
  
  // Storage Paths
  static const String profilePicturesPath = 'profile_pictures';
  static const String activityImagesPath = 'activity_images';
  static const String categoryIconsPath = 'category_icons';
  static const String qrCodesPath = 'qr_codes';
  static const String documentsPath = 'documents';
  
  // User Fields
  static const String userUid = 'uid';
  static const String userEmail = 'email';
  static const String userDisplayName = 'displayName';
  static const String userProfilePicture = 'profilePicture';
  static const String userRole = 'role';
  static const String userLocation = 'location';
  static const String userPreferences = 'preferences';
  static const String userCreatedAt = 'createdAt';
  static const String userUpdatedAt = 'updatedAt';
  static const String userIsVerified = 'isVerified';
  static const String userPhoneNumber = 'phoneNumber';
  static const String userDateOfBirth = 'dateOfBirth';
  static const String userGender = 'gender';
  static const String userBio = 'bio';
  static const String userSocialLinks = 'socialLinks';
  static const String userNotificationSettings = 'notificationSettings';
  static const String userPrivacySettings = 'privacySettings';
  static const String userLastActive = 'lastActive';
  static const String userFcmToken = 'fcmToken';
  
  // Activity Fields
  static const String activityId = 'id';
  static const String activityVendorId = 'vendorId';
  static const String activityTitle = 'title';
  static const String activityDescription = 'description';
  static const String activityCategory = 'category';
  static const String activityTags = 'tags';
  static const String activityLocation = 'location';
  static const String activityDateTime = 'dateTime';
  static const String activityDuration = 'duration';
  static const String activityPrice = 'price';
  static const String activityMaxParticipants = 'maxParticipants';
  static const String activityCurrentParticipants = 'currentParticipants';
  static const String activityImages = 'images';
  static const String activityStatus = 'status';
  static const String activityCreatedAt = 'createdAt';
  static const String activityUpdatedAt = 'updatedAt';
  static const String activityIsFeatured = 'isFeatured';
  static const String activityRating = 'rating';
  static const String activityReviewCount = 'reviewCount';
  static const String activityCancellationPolicy = 'cancellationPolicy';
  static const String activityRequirements = 'requirements';
  static const String activityEquipment = 'equipment';
  static const String activitySkillLevel = 'skillLevel';
  static const String activityAgeRestriction = 'ageRestriction';
  static const String activityAccessibility = 'accessibility';
  static const String activityWeatherDependent = 'weatherDependent';
  static const String activityInsurance = 'insurance';
  static const String activityCertification = 'certification';
  
  // Booking Fields
  static const String bookingId = 'id';
  static const String bookingUserId = 'userId';
  static const String bookingActivityId = 'activityId';
  static const String bookingStatus = 'status';
  static const String bookingParticipants = 'participants';
  static const String bookingTotalAmount = 'totalAmount';
  static const String bookingPaymentStatus = 'paymentStatus';
  static const String bookingCreatedAt = 'createdAt';
  static const String bookingUpdatedAt = 'updatedAt';
  static const String bookingCancelledAt = 'cancelledAt';
  static const String bookingCancellationReason = 'cancellationReason';
  static const String bookingRefundAmount = 'refundAmount';
  static const String bookingRefundStatus = 'refundStatus';
  static const String bookingQrCode = 'qrCode';
  static const String bookingCheckInTime = 'checkInTime';
  static const String bookingCheckOutTime = 'checkOutTime';
  static const String bookingSpecialRequests = 'specialRequests';
  static const String bookingInsurance = 'insurance';
  static const String bookingPaymentMethod = 'paymentMethod';
  static const String bookingTransactionId = 'transactionId';
  
  // Review Fields
  static const String reviewId = 'id';
  static const String reviewUserId = 'userId';
  static const String reviewActivityId = 'activityId';
  static const String reviewBookingId = 'bookingId';
  static const String reviewRating = 'rating';
  static const String reviewComment = 'comment';
  static const String reviewCreatedAt = 'createdAt';
  static const String reviewUpdatedAt = 'updatedAt';
  static const String reviewIsVerified = 'isVerified';
  static const String reviewImages = 'images';
  static const String reviewHelpfulCount = 'helpfulCount';
  static const String reviewReportedCount = 'reportedCount';
  static const String reviewIsEdited = 'isEdited';
  
  // Category Fields
  static const String categoryId = 'id';
  static const String categoryName = 'name';
  static const String categoryDescription = 'description';
  static const String categoryIcon = 'icon';
  static const String categoryColor = 'color';
  static const String categoryIsActive = 'isActive';
  static const String categoryCreatedAt = 'createdAt';
  static const String categoryUpdatedAt = 'updatedAt';
  static const String categoryParentId = 'parentId';
  static const String categorySortOrder = 'sortOrder';
  
  // Notification Fields
  static const String notificationId = 'id';
  static const String notificationUserId = 'userId';
  static const String notificationTitle = 'title';
  static const String notificationBody = 'body';
  static const String notificationType = 'type';
  static const String notificationData = 'data';
  static const String notificationIsRead = 'isRead';
  static const String notificationCreatedAt = 'createdAt';
  static const String notificationReadAt = 'readAt';
  static const String notificationActionUrl = 'actionUrl';
  static const String notificationImage = 'image';
  
  // Payment Fields
  static const String paymentId = 'id';
  static const String paymentUserId = 'userId';
  static const String paymentBookingId = 'bookingId';
  static const String paymentAmount = 'amount';
  static const String paymentCurrency = 'currency';
  static const String paymentStatus = 'status';
  static const String paymentMethod = 'method';
  static const String paymentTransactionId = 'transactionId';
  static const String paymentCreatedAt = 'createdAt';
  static const String paymentUpdatedAt = 'updatedAt';
  static const String paymentRefundedAt = 'refundedAt';
  static const String paymentRefundAmount = 'refundAmount';
  static const String paymentGateway = 'gateway';
  static const String paymentGatewayResponse = 'gatewayResponse';
  
  // Message Fields
  static const String messageId = 'id';
  static const String messageConversationId = 'conversationId';
  static const String messageSenderId = 'senderId';
  static const String messageContent = 'content';
  static const String messageType = 'type';
  static const String messageCreatedAt = 'createdAt';
  static const String messageIsRead = 'isRead';
  static const String messageReadAt = 'readAt';
  static const String messageAttachment = 'attachment';
  static const String messageReplyTo = 'replyTo';
  
  // Conversation Fields
  static const String conversationId = 'id';
  static const String conversationParticipants = 'participants';
  static const String conversationLastMessage = 'lastMessage';
  static const String conversationLastMessageAt = 'lastMessageAt';
  static const String conversationCreatedAt = 'createdAt';
  static const String conversationUpdatedAt = 'updatedAt';
  static const String conversationIsGroup = 'isGroup';
  static const String conversationGroupName = 'groupName';
  static const String conversationGroupImage = 'groupImage';
  
  // Analytics Fields
  static const String analyticsId = 'id';
  static const String analyticsUserId = 'userId';
  static const String analyticsEvent = 'event';
  static const String analyticsProperties = 'properties';
  static const String analyticsTimestamp = 'timestamp';
  static const String analyticsPlatform = 'platform';
  static const String analyticsVersion = 'version';
  static const String analyticsSessionId = 'sessionId';
  
  // Security Rules References
  static const String userRoleUser = 'user';
  static const String userRoleVendor = 'vendor';
  static const String userRoleAdmin = 'admin';
  
  static const String activityStatusActive = 'active';
  static const String activityStatusCancelled = 'cancelled';
  static const String activityStatusCompleted = 'completed';
  static const String activityStatusDraft = 'draft';
  
  static const String bookingStatusPending = 'pending';
  static const String bookingStatusConfirmed = 'confirmed';
  static const String bookingStatusCancelled = 'cancelled';
  static const String bookingStatusCompleted = 'completed';
  
  static const String paymentStatusPending = 'pending';
  static const String paymentStatusCompleted = 'completed';
  static const String paymentStatusFailed = 'failed';
  static const String paymentStatusRefunded = 'refunded';
  
  static const String notificationTypeBooking = 'booking';
  static const String notificationTypeActivity = 'activity';
  static const String notificationTypePayment = 'payment';
  static const String notificationTypeSystem = 'system';
  static const String notificationTypeSocial = 'social';
  
  static const String messageTypeText = 'text';
  static const String messageTypeImage = 'image';
  static const String messageTypeFile = 'file';
  static const String messageTypeLocation = 'location';
}
