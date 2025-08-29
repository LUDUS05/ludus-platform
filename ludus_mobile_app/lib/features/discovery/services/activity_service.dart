import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/activity_model.dart';

class ActivityService {
  static const String baseUrl = 'http://localhost:5000/api'; // Update with your backend URL
  
  // Get all activities with optional filters
  static Future<List<ActivityModel>> getActivities({
    String? category,
    String? location,
    double? minPrice,
    double? maxPrice,
    int? limit,
    int? offset,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (category != null) queryParams['category'] = category;
      if (location != null) queryParams['location'] = location;
      if (minPrice != null) queryParams['minPrice'] = minPrice.toString();
      if (maxPrice != null) queryParams['maxPrice'] = maxPrice.toString();
      if (limit != null) queryParams['limit'] = limit.toString();
      if (offset != null) queryParams['offset'] = offset.toString();

      final uri = Uri.parse('$baseUrl/activities').replace(queryParameters: queryParams);
      
      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body)['data'];
        return data.map((json) => ActivityModel.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load activities: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching activities: $e');
    }
  }

  // Get activity by ID
  static Future<ActivityModel> getActivityById(String id) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/activities/$id'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return ActivityModel.fromJson(data);
      } else {
        throw Exception('Failed to load activity: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching activity: $e');
    }
  }

  // Search activities
  static Future<List<ActivityModel>> searchActivities(String query) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/activities/search?q=$query'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body)['data'];
        return data.map((json) => ActivityModel.fromJson(json)).toList();
      } else {
        throw Exception('Failed to search activities: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error searching activities: $e');
    }
  }

  // Get activities by category
  static Future<List<ActivityModel>> getActivitiesByCategory(String category) async {
    return getActivities(category: category);
  }

  // Get featured activities
  static Future<List<ActivityModel>> getFeaturedActivities() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/activities/featured'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body)['data'];
        return data.map((json) => ActivityModel.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load featured activities: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching featured activities: $e');
    }
  }

  // Get nearby activities
  static Future<List<ActivityModel>> getNearbyActivities({
    required double latitude,
    required double longitude,
    double radius = 10.0, // km
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/activities/nearby?lat=$latitude&lng=$longitude&radius=$radius'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body)['data'];
        return data.map((json) => ActivityModel.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load nearby activities: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching nearby activities: $e');
    }
  }
}
