# LUDUS Mobile App - API Documentation

## Overview

This document provides comprehensive documentation for the LUDUS mobile app's API integration, data models, and service layer architecture.

## 🔗 API Integration

### Base Configuration

#### API Client Setup
```dart
class ApiClient {
  static const String baseUrl = 'https://api.ludus.com/v1';
  static const Duration timeout = Duration(seconds: 30);
  
  late final Dio _dio;
  
  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: timeout,
      receiveTimeout: timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));
    
    _setupInterceptors();
  }
  
  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // Add auth token
          final token = SecureStorageService.getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onResponse: (response, handler) {
          handler.next(response);
        },
        onError: (error, handler) {
          // Handle common errors
          if (error.response?.statusCode == 401) {
            // Handle unauthorized
            AuthService.logout();
          }
          handler.next(error);
        },
      ),
    );
  }
}
```

#### Response Wrapper
```dart
class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? message;
  final int? statusCode;
  final Map<String, dynamic>? errors;
  
  ApiResponse({
    required this.success,
    this.data,
    this.message,
    this.statusCode,
    this.errors,
  });
  
  factory ApiResponse.fromJson(Map<String, dynamic> json, T Function(Map<String, dynamic>) fromJson) {
    return ApiResponse(
      success: json['success'] ?? false,
      data: json['data'] != null ? fromJson(json['data']) : null,
      message: json['message'],
      statusCode: json['status_code'],
      errors: json['errors'],
    );
  }
}
```

## 📊 Data Models

### User Models

#### User Model
```dart
@JsonSerializable()
class User {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String? phoneNumber;
  final String? profileImage;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isEmailVerified;
  final UserRole role;
  final UserPreferences preferences;
  
  User({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    this.phoneNumber,
    this.profileImage,
    required this.createdAt,
    required this.updatedAt,
    required this.isEmailVerified,
    required this.role,
    required this.preferences,
  });
  
  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
  
  String get fullName => '$firstName $lastName';
  String get displayName => firstName.isNotEmpty ? firstName : email;
}
```

#### User Preferences
```dart
@JsonSerializable()
class UserPreferences {
  final List<String> favoriteCategories;
  final String? preferredLanguage;
  final String? timezone;
  final NotificationSettings notifications;
  final PrivacySettings privacy;
  
  UserPreferences({
    this.favoriteCategories = const [],
    this.preferredLanguage,
    this.timezone,
    required this.notifications,
    required this.privacy,
  });
  
  factory UserPreferences.fromJson(Map<String, dynamic> json) => _$UserPreferencesFromJson(json);
  Map<String, dynamic> toJson() => _$UserPreferencesToJson(this);
}
```

#### User Role Enum
```dart
enum UserRole {
  @JsonValue('user')
  user,
  @JsonValue('vendor')
  vendor,
  @JsonValue('admin')
  admin,
}
```

### Activity Models

#### Activity Model
```dart
@JsonSerializable()
class Activity {
  final String id;
  final String title;
  final String description;
  final String category;
  final List<String> images;
  final String? videoUrl;
  final Location location;
  final Pricing pricing;
  final ActivitySchedule schedule;
  final ActivityCapacity capacity;
  final List<String> tags;
  final double rating;
  final int reviewCount;
  final ActivityStatus status;
  final String vendorId;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  Activity({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.images,
    this.videoUrl,
    required this.location,
    required this.pricing,
    required this.schedule,
    required this.capacity,
    required this.tags,
    required this.rating,
    required this.reviewCount,
    required this.status,
    required this.vendorId,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory Activity.fromJson(Map<String, dynamic> json) => _$ActivityFromJson(json);
  Map<String, dynamic> toJson() => _$ActivityToJson(this);
  
  bool get isAvailable => status == ActivityStatus.active;
  bool get hasDiscount => pricing.discountPrice != null;
}
```

#### Location Model
```dart
@JsonSerializable()
class Location {
  final String address;
  final String city;
  final String country;
  final double latitude;
  final double longitude;
  final String? venueName;
  final String? venueDescription;
  
  Location({
    required this.address,
    required this.city,
    required this.country,
    required this.latitude,
    required this.longitude,
    this.venueName,
    this.venueDescription,
  });
  
  factory Location.fromJson(Map<String, dynamic> json) => _$LocationFromJson(json);
  Map<String, dynamic> toJson() => _$LocationToJson(this);
  
  String get fullAddress => '$address, $city, $country';
}
```

#### Pricing Model
```dart
@JsonSerializable()
class Pricing {
  final double basePrice;
  final String currency;
  final double? discountPrice;
  final DateTime? discountValidUntil;
  final List<PricingTier> tiers;
  final List<String> includedItems;
  final List<String> excludedItems;
  
  Pricing({
    required this.basePrice,
    required this.currency,
    this.discountPrice,
    this.discountValidUntil,
    this.tiers = const [],
    this.includedItems = const [],
    this.excludedItems = const [],
  });
  
  factory Pricing.fromJson(Map<String, dynamic> json) => _$PricingFromJson(json);
  Map<String, dynamic> toJson() => _$PricingToJson(this);
  
  double get currentPrice => discountPrice ?? basePrice;
  bool get hasDiscount => discountPrice != null && 
      (discountValidUntil == null || discountValidUntil!.isAfter(DateTime.now()));
}
```

### Booking Models

#### Booking Model
```dart
@JsonSerializable()
class Booking {
  final String id;
  final String activityId;
  final String userId;
  final String vendorId;
  final DateTime activityDate;
  final int participants;
  final double totalAmount;
  final String currency;
  final BookingStatus status;
  final PaymentStatus paymentStatus;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? cancellationReason;
  final DateTime? cancelledAt;
  final List<BookingParticipant> participants;
  
  Booking({
    required this.id,
    required this.activityId,
    required this.userId,
    required this.vendorId,
    required this.activityDate,
    required this.participants,
    required this.totalAmount,
    required this.currency,
    required this.status,
    required this.paymentStatus,
    required this.createdAt,
    required this.updatedAt,
    this.cancellationReason,
    this.cancelledAt,
    required this.participants,
  });
  
  factory Booking.fromJson(Map<String, dynamic> json) => _$BookingFromJson(json);
  Map<String, dynamic> toJson() => _$BookingToJson(this);
  
  bool get isCancelled => status == BookingStatus.cancelled;
  bool get isConfirmed => status == BookingStatus.confirmed;
  bool get isPending => status == BookingStatus.pending;
}
```

#### Booking Status Enum
```dart
enum BookingStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('confirmed')
  confirmed,
  @JsonValue('cancelled')
  cancelled,
  @JsonValue('completed')
  completed,
}
```

## 🔧 Service Layer

### Authentication Service

#### AuthService Interface
```dart
abstract class AuthService {
  Future<User> signIn(String email, String password);
  Future<User> signUp(SignUpRequest request);
  Future<void> signOut();
  Future<void> resetPassword(String email);
  Future<User> updateProfile(UpdateProfileRequest request);
  Future<void> deleteAccount();
  Stream<User?> get authStateChanges;
}
```

#### AuthService Implementation
```dart
class AuthServiceImpl implements AuthService {
  final ApiClient _apiClient;
  final SecureStorageService _storage;
  
  AuthServiceImpl({
    required ApiClient apiClient,
    required SecureStorageService storage,
  }) : _apiClient = apiClient, _storage = storage;
  
  @override
  Future<User> signIn(String email, String password) async {
    try {
      final response = await _apiClient.post('/auth/login', {
        'email': email,
        'password': password,
      });
      
      final apiResponse = ApiResponse<User>.fromJson(
        response.data,
        (json) => User.fromJson(json),
      );
      
      if (apiResponse.success && apiResponse.data != null) {
        await _storage.saveToken(apiResponse.data!.id);
        return apiResponse.data!;
      } else {
        throw AuthException(apiResponse.message ?? 'Login failed');
      }
    } catch (e) {
      throw AuthException('Login failed: ${e.toString()}');
    }
  }
  
  @override
  Future<User> signUp(SignUpRequest request) async {
    try {
      final response = await _apiClient.post('/auth/register', request.toJson());
      
      final apiResponse = ApiResponse<User>.fromJson(
        response.data,
        (json) => User.fromJson(json),
      );
      
      if (apiResponse.success && apiResponse.data != null) {
        await _storage.saveToken(apiResponse.data!.id);
        return apiResponse.data!;
      } else {
        throw AuthException(apiResponse.message ?? 'Registration failed');
      }
    } catch (e) {
      throw AuthException('Registration failed: ${e.toString()}');
    }
  }
}
```

### Activity Service

#### ActivityService Interface
```dart
abstract class ActivityService {
  Future<List<Activity>> getActivities({
    String? category,
    String? location,
    DateTime? date,
    double? minPrice,
    double? maxPrice,
    int? page,
    int? limit,
  });
  
  Future<Activity> getActivity(String id);
  Future<List<Activity>> getRecommendedActivities();
  Future<List<Activity>> searchActivities(String query);
  Future<void> favoriteActivity(String activityId);
  Future<void> unfavoriteActivity(String activityId);
  Future<List<Activity>> getFavoriteActivities();
}
```

#### ActivityService Implementation
```dart
class ActivityServiceImpl implements ActivityService {
  final ApiClient _apiClient;
  
  ActivityServiceImpl({required ApiClient apiClient}) : _apiClient = apiClient;
  
  @override
  Future<List<Activity>> getActivities({
    String? category,
    String? location,
    DateTime? date,
    double? minPrice,
    double? maxPrice,
    int? page,
    int? limit,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (category != null) queryParams['category'] = category;
      if (location != null) queryParams['location'] = location;
      if (date != null) queryParams['date'] = date.toIso8601String();
      if (minPrice != null) queryParams['min_price'] = minPrice;
      if (maxPrice != null) queryParams['max_price'] = maxPrice;
      if (page != null) queryParams['page'] = page;
      if (limit != null) queryParams['limit'] = limit;
      
      final response = await _apiClient.get('/activities', queryParameters: queryParams);
      
      final apiResponse = ApiResponse<List<Activity>>.fromJson(
        response.data,
        (json) => (json as List).map((item) => Activity.fromJson(item)).toList(),
      );
      
      if (apiResponse.success && apiResponse.data != null) {
        return apiResponse.data!;
      } else {
        throw ActivityException(apiResponse.message ?? 'Failed to fetch activities');
      }
    } catch (e) {
      throw ActivityException('Failed to fetch activities: ${e.toString()}');
    }
  }
  
  @override
  Future<Activity> getActivity(String id) async {
    try {
      final response = await _apiClient.get('/activities/$id');
      
      final apiResponse = ApiResponse<Activity>.fromJson(
        response.data,
        (json) => Activity.fromJson(json),
      );
      
      if (apiResponse.success && apiResponse.data != null) {
        return apiResponse.data!;
      } else {
        throw ActivityException(apiResponse.message ?? 'Activity not found');
      }
    } catch (e) {
      throw ActivityException('Failed to fetch activity: ${e.toString()}');
    }
  }
}
```

### Booking Service

#### BookingService Interface
```dart
abstract class BookingService {
  Future<Booking> createBooking(CreateBookingRequest request);
  Future<Booking> getBooking(String id);
  Future<List<Booking>> getUserBookings();
  Future<List<Booking>> getVendorBookings();
  Future<Booking> updateBooking(String id, UpdateBookingRequest request);
  Future<void> cancelBooking(String id, String reason);
  Future<PaymentIntent> createPaymentIntent(String bookingId);
  Future<void> confirmPayment(String bookingId, String paymentIntentId);
}
```

#### BookingService Implementation
```dart
class BookingServiceImpl implements BookingService {
  final ApiClient _apiClient;
  
  BookingServiceImpl({required ApiClient apiClient}) : _apiClient = apiClient;
  
  @override
  Future<Booking> createBooking(CreateBookingRequest request) async {
    try {
      final response = await _apiClient.post('/bookings', request.toJson());
      
      final apiResponse = ApiResponse<Booking>.fromJson(
        response.data,
        (json) => Booking.fromJson(json),
      );
      
      if (apiResponse.success && apiResponse.data != null) {
        return apiResponse.data!;
      } else {
        throw BookingException(apiResponse.message ?? 'Failed to create booking');
      }
    } catch (e) {
      throw BookingException('Failed to create booking: ${e.toString()}');
    }
  }
  
  @override
  Future<List<Booking>> getUserBookings() async {
    try {
      final response = await _apiClient.get('/bookings/user');
      
      final apiResponse = ApiResponse<List<Booking>>.fromJson(
        response.data,
        (json) => (json as List).map((item) => Booking.fromJson(item)).toList(),
      );
      
      if (apiResponse.success && apiResponse.data != null) {
        return apiResponse.data!;
      } else {
        throw BookingException(apiResponse.message ?? 'Failed to fetch bookings');
      }
    } catch (e) {
      throw BookingException('Failed to fetch bookings: ${e.toString()}');
    }
  }
}
```

## 🔄 State Management Integration

### Provider Setup

#### Service Providers
```dart
// Service providers
final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});

final authServiceProvider = Provider<AuthService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  final storage = ref.watch(secureStorageProvider);
  return AuthServiceImpl(apiClient: apiClient, storage: storage);
});

final activityServiceProvider = Provider<ActivityService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ActivityServiceImpl(apiClient: apiClient);
});

final bookingServiceProvider = Provider<BookingService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return BookingServiceImpl(apiClient: apiClient);
});
```

#### Feature Providers
```dart
// Auth state management
final authNotifierProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthNotifier(authService);
});

// Activity state management
final activitiesProvider = FutureProvider<List<Activity>>((ref) async {
  final activityService = ref.watch(activityServiceProvider);
  return await activityService.getActivities();
});

final activitySearchProvider = StateNotifierProvider<ActivitySearchNotifier, ActivitySearchState>((ref) {
  final activityService = ref.watch(activityServiceProvider);
  return ActivitySearchNotifier(activityService);
});

// Booking state management
final userBookingsProvider = FutureProvider<List<Booking>>((ref) async {
  final bookingService = ref.watch(bookingServiceProvider);
  return await bookingService.getUserBookings();
});
```

## 🧪 API Testing

### Mock API Client
```dart
class MockApiClient extends Mock implements ApiClient {
  @override
  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    if (path == '/activities') {
      return Response(
        data: {
          'success': true,
          'data': [
            {
              'id': '1',
              'title': 'Desert Safari',
              'description': 'Experience the thrill of desert adventure',
              'category': 'adventure',
              'images': ['https://example.com/image1.jpg'],
              'location': {
                'address': 'Riyadh Desert',
                'city': 'Riyadh',
                'country': 'Saudi Arabia',
                'latitude': 24.7136,
                'longitude': 46.6753,
              },
              'pricing': {
                'base_price': 299.0,
                'currency': 'SAR',
              },
              'rating': 4.5,
              'review_count': 120,
              'status': 'active',
              'vendor_id': 'vendor1',
              'created_at': DateTime.now().toIso8601String(),
              'updated_at': DateTime.now().toIso8601String(),
            }
          ],
        },
        statusCode: 200,
      );
    }
    
    throw Exception('Endpoint not mocked: $path');
  }
}
```

### API Response Testing
```dart
void main() {
  group('ActivityService', () {
    late ActivityService activityService;
    late MockApiClient mockApiClient;
    
    setUp(() {
      mockApiClient = MockApiClient();
      activityService = ActivityServiceImpl(apiClient: mockApiClient);
    });
    
    test('should return activities when API call is successful', () async {
      // Arrange
      when(mockApiClient.get('/activities', queryParameters: anyNamed('queryParameters')))
          .thenAnswer((_) async => Response(
                data: {
                  'success': true,
                  'data': [
                    {
                      'id': '1',
                      'title': 'Test Activity',
                      // ... other fields
                    }
                  ],
                },
                statusCode: 200,
              ));
      
      // Act
      final result = await activityService.getActivities();
      
      // Assert
      expect(result, isA<List<Activity>>());
      expect(result.length, 1);
      expect(result.first.title, 'Test Activity');
    });
  });
}
```

## 🔒 Error Handling

### Custom Exceptions
```dart
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  
  ApiException(this.message, [this.statusCode]);
  
  @override
  String toString() => 'ApiException: $message';
}

class AuthException extends ApiException {
  AuthException(String message, [int? statusCode]) : super(message, statusCode);
}

class ActivityException extends ApiException {
  ActivityException(String message, [int? statusCode]) : super(message, statusCode);
}

class BookingException extends ApiException {
  BookingException(String message, [int? statusCode]) : super(message, statusCode);
}
```

### Error Handling in Services
```dart
class ErrorHandler {
  static String handleApiError(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          return 'Connection timeout. Please check your internet connection.';
        case DioExceptionType.badResponse:
          final statusCode = error.response?.statusCode;
          switch (statusCode) {
            case 401:
              return 'Authentication failed. Please login again.';
            case 403:
              return 'Access denied. You don\'t have permission to perform this action.';
            case 404:
              return 'Resource not found.';
            case 422:
              return 'Invalid data provided. Please check your input.';
            case 500:
              return 'Server error. Please try again later.';
            default:
              return 'An error occurred. Please try again.';
          }
        case DioExceptionType.cancel:
          return 'Request was cancelled.';
        default:
          return 'Network error. Please check your connection.';
      }
    }
    
    if (error is ApiException) {
      return error.message;
    }
    
    return 'An unexpected error occurred.';
  }
}
```

## 📊 API Endpoints Reference

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

### Activity Endpoints
- `GET /activities` - Get activities list
- `GET /activities/{id}` - Get activity details
- `GET /activities/recommended` - Get recommended activities
- `GET /activities/search` - Search activities
- `POST /activities/{id}/favorite` - Favorite an activity
- `DELETE /activities/{id}/favorite` - Unfavorite an activity
- `GET /activities/favorites` - Get favorite activities

### Booking Endpoints
- `POST /bookings` - Create booking
- `GET /bookings` - Get user bookings
- `GET /bookings/{id}` - Get booking details
- `PUT /bookings/{id}` - Update booking
- `DELETE /bookings/{id}` - Cancel booking
- `POST /bookings/{id}/payment` - Create payment intent
- `POST /bookings/{id}/confirm-payment` - Confirm payment

### Vendor Endpoints
- `GET /vendor/activities` - Get vendor activities
- `POST /vendor/activities` - Create activity
- `PUT /vendor/activities/{id}` - Update activity
- `DELETE /vendor/activities/{id}` - Delete activity
- `GET /vendor/bookings` - Get vendor bookings
- `PUT /vendor/bookings/{id}/status` - Update booking status

---

This API documentation provides comprehensive coverage of the LUDUS mobile app's data models, services, and integration patterns.
