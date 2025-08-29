class AppConstants {
  // App Information
  static const String appName = 'LUDUS';
  static const String appVersion = '1.0.0';
  static const String appDescription = 'Social Activity Discovery & Booking Platform';
  
  // API Configuration
  static const String baseUrl = 'https://api.ludus.com';
  static const int apiTimeout = 30000; // 30 seconds
  static const int maxRetries = 3;
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 50;
  
  // Cache Configuration
  static const int cacheExpiryHours = 24;
  static const int imageCacheExpiryDays = 7;
  
  // Location Configuration
  static const double defaultLatitude = 24.7136; // Riyadh
  static const double defaultLongitude = 46.6753;
  static const double maxSearchRadius = 50.0; // km
  static const double minSearchRadius = 1.0; // km
  
  // Booking Configuration
  static const int maxParticipantsPerActivity = 100;
  static const int minParticipantsPerActivity = 1;
  static const int maxBookingAdvanceDays = 365;
  static const int minBookingAdvanceHours = 2;
  
  // Payment Configuration
  static const String currency = 'SAR';
  static const String currencySymbol = 'ر.س';
  static const double minActivityPrice = 10.0;
  static const double maxActivityPrice = 10000.0;
  
  // File Upload Configuration
  static const int maxImageSize = 5 * 1024 * 1024; // 5MB
  static const int maxProfileImageSize = 2 * 1024 * 1024; // 2MB
  static const List<String> allowedImageFormats = ['jpg', 'jpeg', 'png', 'webp'];
  
  // Validation Rules
  static const int minPasswordLength = 8;
  static const int maxPasswordLength = 128;
  static const int minDisplayNameLength = 2;
  static const int maxDisplayNameLength = 50;
  static const int maxDescriptionLength = 1000;
  static const int maxActivityTitleLength = 100;
  
  // Notification Configuration
  static const int maxNotificationRetentionDays = 30;
  static const int pushNotificationBatchSize = 10;
  
  // Social Features
  static const int maxFollowers = 10000;
  static const int maxFollowing = 5000;
  static const int maxReviewsPerUser = 100;
  
  // Performance Configuration
  static const int imageCacheSize = 100; // MB
  static const int maxConcurrentImageLoads = 5;
  static const int searchDebounceMs = 500;
  
  // Error Messages
  static const String networkErrorMessage = 'Please check your internet connection and try again.';
  static const String generalErrorMessage = 'Something went wrong. Please try again.';
  static const String authenticationErrorMessage = 'Authentication failed. Please sign in again.';
  
  // Success Messages
  static const String bookingSuccessMessage = 'Activity booked successfully!';
  static const String profileUpdateSuccessMessage = 'Profile updated successfully!';
  static const String activityCreatedSuccessMessage = 'Activity created successfully!';
  
  // Default Values
  static const String defaultProfileImage = 'assets/images/default_profile.png';
  static const String defaultActivityImage = 'assets/images/default_activity.png';
  static const String defaultCategoryIcon = 'assets/icons/default_category.svg';
  
  // Animation Durations
  static const Duration shortAnimationDuration = Duration(milliseconds: 200);
  static const Duration mediumAnimationDuration = Duration(milliseconds: 300);
  static const Duration longAnimationDuration = Duration(milliseconds: 500);
  
  // Spacing Constants
  static const double xsSpacing = 4.0;
  static const double smSpacing = 8.0;
  static const double mdSpacing = 16.0;
  static const double lgSpacing = 24.0;
  static const double xlSpacing = 32.0;
  static const double xxlSpacing = 48.0;
  
  // Border Radius
  static const double xsRadius = 4.0;
  static const double smRadius = 8.0;
  static const double mdRadius = 12.0;
  static const double lgRadius = 16.0;
  static const double xlRadius = 24.0;
  
  // Shadow Elevation
  static const double xsElevation = 1.0;
  static const double smElevation = 2.0;
  static const double mdElevation = 4.0;
  static const double lgElevation = 8.0;
  static const double xlElevation = 16.0;
}
