import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/booking_model.dart';

class BookingService {
  static const String baseUrl = 'http://localhost:5000/api'; // Update with your backend URL
  
  // Create a new booking
  static Future<BookingModel> createBooking({
    required String activityId,
    required String activityTitle,
    required String userId,
    required String userName,
    required String userEmail,
    required String userPhone,
    required DateTime activityDate,
    required int participants,
    required double pricePerPerson,
    String? specialRequests,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/bookings'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'activityId': activityId,
          'activityTitle': activityTitle,
          'userId': userId,
          'userName': userName,
          'userEmail': userEmail,
          'userPhone': userPhone,
          'activityDate': activityDate.toIso8601String(),
          'participants': participants,
          'pricePerPerson': pricePerPerson,
          'totalPrice': pricePerPerson * participants,
          'specialRequests': specialRequests,
        }),
      );

      if (response.statusCode == 201) {
        final data = json.decode(response.body)['data'];
        return BookingModel.fromJson(data);
      } else {
        throw Exception('Failed to create booking: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error creating booking: $e');
    }
  }

  // Get booking by ID
  static Future<BookingModel> getBookingById(String bookingId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/bookings/$bookingId'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return BookingModel.fromJson(data);
      } else {
        throw Exception('Failed to load booking: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching booking: $e');
    }
  }

  // Get user's bookings
  static Future<List<BookingModel>> getUserBookings(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/bookings/user/$userId'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body)['data'];
        return data.map((json) => BookingModel.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load user bookings: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching user bookings: $e');
    }
  }

  // Update booking status
  static Future<BookingModel> updateBookingStatus(
    String bookingId,
    String status,
  ) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/bookings/$bookingId/status'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'status': status,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return BookingModel.fromJson(data);
      } else {
        throw Exception('Failed to update booking status: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error updating booking status: $e');
    }
  }

  // Cancel booking
  static Future<BookingModel> cancelBooking(String bookingId) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/bookings/$bookingId/cancel'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return BookingModel.fromJson(data);
      } else {
        throw Exception('Failed to cancel booking: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error cancelling booking: $e');
    }
  }

  // Get booking availability for an activity
  static Future<Map<String, dynamic>> getActivityAvailability(
    String activityId,
    DateTime date,
  ) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/activities/$activityId/availability?date=${date.toIso8601String()}'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return json.decode(response.body)['data'];
      } else {
        throw Exception('Failed to get availability: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching availability: $e');
    }
  }

  // Process payment for booking
  static Future<Map<String, dynamic>> processPayment({
    required String bookingId,
    required String paymentMethod,
    required Map<String, dynamic> paymentDetails,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/bookings/$bookingId/payment'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'paymentMethod': paymentMethod,
          'paymentDetails': paymentDetails,
        }),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body)['data'];
      } else {
        throw Exception('Failed to process payment: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error processing payment: $e');
    }
  }

  // Get booking statistics
  static Future<Map<String, dynamic>> getBookingStats(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/bookings/stats/$userId'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return json.decode(response.body)['data'];
      } else {
        throw Exception('Failed to get booking stats: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching booking stats: $e');
    }
  }
}
