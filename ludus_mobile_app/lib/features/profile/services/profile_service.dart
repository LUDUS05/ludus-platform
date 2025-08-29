import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/profile_model.dart';

class ProfileService {
  static const String baseUrl = 'http://localhost:5000/api'; // Update with your backend URL
  
  // Get user profile
  static Future<UserProfile> getUserProfile(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/profiles/$userId'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return UserProfile.fromJson(data);
      } else {
        throw Exception('Failed to load profile: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching profile: $e');
    }
  }

  // Update user profile
  static Future<UserProfile> updateUserProfile(String userId, Map<String, dynamic> profileData) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/profiles/$userId'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode(profileData),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return UserProfile.fromJson(data);
      } else {
        throw Exception('Failed to update profile: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error updating profile: $e');
    }
  }

  // Upload profile image
  static Future<String> uploadProfileImage(String userId, File imageFile) async {
    try {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/profiles/$userId/image'),
      );

      request.files.add(
        await http.MultipartFile.fromPath(
          'image',
          imageFile.path,
        ),
      );

      final response = await request.send();
      final responseData = await response.stream.bytesToString();
      final data = json.decode(responseData);

      if (response.statusCode == 200) {
        return data['imageUrl'];
      } else {
        throw Exception('Failed to upload image: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error uploading image: $e');
    }
  }

  // Delete profile image
  static Future<void> deleteProfileImage(String userId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/profiles/$userId/image'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to delete image: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error deleting image: $e');
    }
  }

  // Get user preferences
  static Future<UserPreferences> getUserPreferences(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/profiles/$userId/preferences'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return UserPreferences.fromJson(data);
      } else {
        throw Exception('Failed to load preferences: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching preferences: $e');
    }
  }

  // Update user preferences
  static Future<UserPreferences> updateUserPreferences(String userId, Map<String, dynamic> preferences) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/profiles/$userId/preferences'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode(preferences),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return UserPreferences.fromJson(data);
      } else {
        throw Exception('Failed to update preferences: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error updating preferences: $e');
    }
  }

  // Get user statistics
  static Future<UserStatistics> getUserStatistics(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/profiles/$userId/statistics'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return UserStatistics.fromJson(data);
      } else {
        throw Exception('Failed to load statistics: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching statistics: $e');
    }
  }

  // Get user booking history
  static Future<List<Map<String, dynamic>>> getUserBookingHistory(String userId, {int? limit, int? offset}) async {
    try {
      final queryParams = <String, String>{};
      if (limit != null) queryParams['limit'] = limit.toString();
      if (offset != null) queryParams['offset'] = offset.toString();

      final uri = Uri.parse('$baseUrl/profiles/$userId/bookings').replace(queryParameters: queryParams);
      
      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body)['data'];
        return data.cast<Map<String, dynamic>>();
      } else {
        throw Exception('Failed to load booking history: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching booking history: $e');
    }
  }

  // Get user favorite activities
  static Future<List<Map<String, dynamic>>> getUserFavorites(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/profiles/$userId/favorites'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body)['data'];
        return data.cast<Map<String, dynamic>>();
      } else {
        throw Exception('Failed to load favorites: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching favorites: $e');
    }
  }

  // Add activity to favorites
  static Future<void> addToFavorites(String userId, String activityId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/profiles/$userId/favorites'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({'activityId': activityId}),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to add to favorites: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error adding to favorites: $e');
    }
  }

  // Remove activity from favorites
  static Future<void> removeFromFavorites(String userId, String activityId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/profiles/$userId/favorites/$activityId'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to remove from favorites: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error removing from favorites: $e');
    }
  }

  // Get user reviews
  static Future<List<Map<String, dynamic>>> getUserReviews(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/profiles/$userId/reviews'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body)['data'];
        return data.cast<Map<String, dynamic>>();
      } else {
        throw Exception('Failed to load reviews: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching reviews: $e');
    }
  }

  // Update notification settings
  static Future<UserProfile> updateNotificationSettings(String userId, Map<String, bool> settings) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/profiles/$userId/notifications'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode(settings),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return UserProfile.fromJson(data);
      } else {
        throw Exception('Failed to update notification settings: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error updating notification settings: $e');
    }
  }

  // Delete user account
  static Future<void> deleteUserAccount(String userId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/profiles/$userId'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to delete account: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error deleting account: $e');
    }
  }

  // Export user data
  static Future<Map<String, dynamic>> exportUserData(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/profiles/$userId/export'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return json.decode(response.body)['data'];
      } else {
        throw Exception('Failed to export data: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error exporting data: $e');
    }
  }

  // Validate profile data
  static Map<String, String> validateProfileData(Map<String, dynamic> data) {
    final errors = <String, String>{};

    if (data['firstName'] == null || data['firstName'].toString().trim().isEmpty) {
      errors['firstName'] = 'First name is required';
    }

    if (data['lastName'] == null || data['lastName'].toString().trim().isEmpty) {
      errors['lastName'] = 'Last name is required';
    }

    if (data['email'] != null && data['email'].toString().isNotEmpty) {
      final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
      if (!emailRegex.hasMatch(data['email'])) {
        errors['email'] = 'Invalid email format';
      }
    }

    if (data['phoneNumber'] != null && data['phoneNumber'].toString().isNotEmpty) {
      final phoneRegex = RegExp(r'^\+?[\d\s-()]+$');
      if (!phoneRegex.hasMatch(data['phoneNumber'])) {
        errors['phoneNumber'] = 'Invalid phone number format';
      }
    }

    if (data['dateOfBirth'] != null) {
      try {
        final date = DateTime.parse(data['dateOfBirth']);
        final now = DateTime.now();
        if (date.isAfter(now)) {
          errors['dateOfBirth'] = 'Date of birth cannot be in the future';
        }
        if (now.difference(date).inDays < 365 * 13) {
          errors['dateOfBirth'] = 'User must be at least 13 years old';
        }
      } catch (e) {
        errors['dateOfBirth'] = 'Invalid date format';
      }
    }

    return errors;
  }
}
