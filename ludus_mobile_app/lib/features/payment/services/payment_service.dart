import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/payment_model.dart';

class PaymentService {
  static const String baseUrl = 'http://localhost:5000/api'; // Update with your backend URL
  
  // Process payment for a booking
  static Future<PaymentModel> processPayment({
    required String bookingId,
    required String userId,
    required double amount,
    required PaymentMethod method,
    required Map<String, dynamic> paymentDetails,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/payments/process'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'bookingId': bookingId,
          'userId': userId,
          'amount': amount,
          'method': method.toString().split('.').last,
          'paymentDetails': paymentDetails,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return PaymentModel.fromJson(data);
      } else {
        throw Exception('Failed to process payment: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error processing payment: $e');
    }
  }

  // Get payment by ID
  static Future<PaymentModel> getPaymentById(String paymentId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/payments/$paymentId'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return PaymentModel.fromJson(data);
      } else {
        throw Exception('Failed to load payment: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching payment: $e');
    }
  }

  // Get user's payment history
  static Future<List<PaymentModel>> getUserPayments(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/payments/user/$userId'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body)['data'];
        return data.map((json) => PaymentModel.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load user payments: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching user payments: $e');
    }
  }

  // Get payment status
  static Future<PaymentModel> getPaymentStatus(String paymentId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/payments/$paymentId/status'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return PaymentModel.fromJson(data);
      } else {
        throw Exception('Failed to get payment status: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting payment status: $e');
    }
  }

  // Refund payment
  static Future<PaymentModel> refundPayment(String paymentId, {double? amount}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/payments/$paymentId/refund'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'amount': amount,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return PaymentModel.fromJson(data);
      } else {
        throw Exception('Failed to refund payment: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error refunding payment: $e');
    }
  }

  // Save payment card
  static Future<PaymentCardModel> savePaymentCard({
    required String userId,
    required String cardNumber,
    required String cardholderName,
    required int expiryMonth,
    required int expiryYear,
    required String cvv,
    bool isDefault = false,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/payments/cards'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'userId': userId,
          'cardNumber': cardNumber,
          'cardholderName': cardholderName,
          'expiryMonth': expiryMonth,
          'expiryYear': expiryYear,
          'cvv': cvv,
          'isDefault': isDefault,
        }),
      );

      if (response.statusCode == 201) {
        final data = json.decode(response.body)['data'];
        return PaymentCardModel.fromJson(data);
      } else {
        throw Exception('Failed to save payment card: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error saving payment card: $e');
    }
  }

  // Get user's saved payment cards
  static Future<List<PaymentCardModel>> getUserPaymentCards(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/payments/cards/user/$userId'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body)['data'];
        return data.map((json) => PaymentCardModel.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load payment cards: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching payment cards: $e');
    }
  }

  // Delete payment card
  static Future<void> deletePaymentCard(String cardId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/payments/cards/$cardId'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to delete payment card: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error deleting payment card: $e');
    }
  }

  // Set default payment card
  static Future<PaymentCardModel> setDefaultPaymentCard(String cardId) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/payments/cards/$cardId/default'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return PaymentCardModel.fromJson(data);
      } else {
        throw Exception('Failed to set default card: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error setting default card: $e');
    }
  }

  // Get payment methods available
  static Future<List<Map<String, dynamic>>> getAvailablePaymentMethods() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/payments/methods'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body)['data'];
        return data.cast<Map<String, dynamic>>();
      } else {
        throw Exception('Failed to get payment methods: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching payment methods: $e');
    }
  }

  // Validate card number (Luhn algorithm)
  static bool validateCardNumber(String cardNumber) {
    if (cardNumber.isEmpty) return false;
    
    // Remove spaces and dashes
    final cleanNumber = cardNumber.replaceAll(RegExp(r'[\s-]'), '');
    
    if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;
    
    int sum = 0;
    bool isEven = false;
    
    // Loop through values starting from the rightmost side
    for (int i = cleanNumber.length - 1; i >= 0; i--) {
      int digit = int.parse(cleanNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 == 0;
  }

  // Get card type from number
  static String getCardType(String cardNumber) {
    final cleanNumber = cardNumber.replaceAll(RegExp(r'[\s-]'), '');
    
    if (cleanNumber.startsWith('4')) {
      return 'Visa';
    } else if (cleanNumber.startsWith('5')) {
      return 'Mastercard';
    } else if (cleanNumber.startsWith('3')) {
      return 'American Express';
    } else if (cleanNumber.startsWith('6')) {
      return 'Discover';
    } else {
      return 'Unknown';
    }
  }

  // Validate expiry date
  static bool validateExpiryDate(int month, int year) {
    final now = DateTime.now();
    final currentYear = now.year;
    final currentMonth = now.month;
    
    if (year < currentYear) return false;
    if (year == currentYear && month < currentMonth) return false;
    if (month < 1 || month > 12) return false;
    
    return true;
  }

  // Validate CVV
  static bool validateCVV(String cvv, String cardType) {
    if (cvv.isEmpty) return false;
    
    final cvvLength = cvv.length;
    if (cardType == 'American Express') {
      return cvvLength == 4;
    } else {
      return cvvLength == 3;
    }
  }
}
