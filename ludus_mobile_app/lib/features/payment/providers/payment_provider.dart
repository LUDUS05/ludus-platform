import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/payment_model.dart';
import '../services/payment_service.dart';

// Payment state
class PaymentState {
  final List<PaymentModel> userPayments;
  final List<PaymentCardModel> userCards;
  final PaymentModel? currentPayment;
  final bool isLoading;
  final String? error;
  final List<Map<String, dynamic>> availableMethods;

  const PaymentState({
    this.userPayments = const [],
    this.userCards = const [],
    this.currentPayment,
    this.isLoading = false,
    this.error,
    this.availableMethods = const [],
  });

  PaymentState copyWith({
    List<PaymentModel>? userPayments,
    List<PaymentCardModel>? userCards,
    PaymentModel? currentPayment,
    bool? isLoading,
    String? error,
    List<Map<String, dynamic>>? availableMethods,
  }) {
    return PaymentState(
      userPayments: userPayments ?? this.userPayments,
      userCards: userCards ?? this.userCards,
      currentPayment: currentPayment ?? this.currentPayment,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      availableMethods: availableMethods ?? this.availableMethods,
    );
  }
}

// Payment notifier
class PaymentNotifier extends StateNotifier<PaymentState> {
  PaymentNotifier() : super(const PaymentState());

  // Process payment
  Future<PaymentModel?> processPayment({
    required String bookingId,
    required String userId,
    required double amount,
    required PaymentMethod method,
    required Map<String, dynamic> paymentDetails,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final payment = await PaymentService.processPayment(
        bookingId: bookingId,
        userId: userId,
        amount: amount,
        method: method,
        paymentDetails: paymentDetails,
      );

      state = state.copyWith(
        currentPayment: payment,
        isLoading: false,
      );

      // Refresh user payments
      await loadUserPayments(userId);

      return payment;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return null;
    }
  }

  // Load user's payment history
  Future<void> loadUserPayments(String userId) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final payments = await PaymentService.getUserPayments(userId);
      state = state.copyWith(
        userPayments: payments,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  // Get payment by ID
  Future<PaymentModel?> getPaymentById(String paymentId) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final payment = await PaymentService.getPaymentById(paymentId);
      state = state.copyWith(
        currentPayment: payment,
        isLoading: false,
      );
      return payment;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return null;
    }
  }

  // Get payment status
  Future<PaymentModel?> getPaymentStatus(String paymentId) async {
    try {
      final payment = await PaymentService.getPaymentStatus(paymentId);
      state = state.copyWith(currentPayment: payment);
      return payment;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  // Refund payment
  Future<PaymentModel?> refundPayment(String paymentId, {double? amount}) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final payment = await PaymentService.refundPayment(paymentId, amount: amount);
      state = state.copyWith(
        currentPayment: payment,
        isLoading: false,
      );

      // Update in user payments list
      final updatedPayments = state.userPayments.map((p) {
        if (p.id == paymentId) {
          return payment;
        }
        return p;
      }).toList();

      state = state.copyWith(userPayments: updatedPayments);

      return payment;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return null;
    }
  }

  // Save payment card
  Future<PaymentCardModel?> savePaymentCard({
    required String userId,
    required String cardNumber,
    required String cardholderName,
    required int expiryMonth,
    required int expiryYear,
    required String cvv,
    bool isDefault = false,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final card = await PaymentService.savePaymentCard(
        userId: userId,
        cardNumber: cardNumber,
        cardholderName: cardholderName,
        expiryMonth: expiryMonth,
        expiryYear: expiryYear,
        cvv: cvv,
        isDefault: isDefault,
      );

      state = state.copyWith(
        isLoading: false,
      );

      // Refresh user cards
      await loadUserPaymentCards(userId);

      return card;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return null;
    }
  }

  // Load user's payment cards
  Future<void> loadUserPaymentCards(String userId) async {
    try {
      final cards = await PaymentService.getUserPaymentCards(userId);
      state = state.copyWith(userCards: cards);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Delete payment card
  Future<bool> deletePaymentCard(String cardId, String userId) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      await PaymentService.deletePaymentCard(cardId);
      state = state.copyWith(isLoading: false);

      // Refresh user cards
      await loadUserPaymentCards(userId);

      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return false;
    }
  }

  // Set default payment card
  Future<PaymentCardModel?> setDefaultPaymentCard(String cardId) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final card = await PaymentService.setDefaultPaymentCard(cardId);
      state = state.copyWith(isLoading: false);

      // Update in user cards list
      final updatedCards = state.userCards.map((c) {
        if (c.id == cardId) {
          return card;
        }
        return c.copyWith(isDefault: false);
      }).toList();

      state = state.copyWith(userCards: updatedCards);

      return card;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return null;
    }
  }

  // Load available payment methods
  Future<void> loadAvailablePaymentMethods() async {
    try {
      final methods = await PaymentService.getAvailablePaymentMethods();
      state = state.copyWith(availableMethods: methods);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  // Clear current payment
  void clearCurrentPayment() {
    state = state.copyWith(currentPayment: null);
  }

  // Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }

  // Refresh payments
  Future<void> refreshPayments(String userId) async {
    await loadUserPayments(userId);
  }

  // Refresh payment cards
  Future<void> refreshPaymentCards(String userId) async {
    await loadUserPaymentCards(userId);
  }
}

// Providers
final paymentProvider = StateNotifierProvider<PaymentNotifier, PaymentState>((ref) {
  return PaymentNotifier();
});

final userPaymentsProvider = Provider<List<PaymentModel>>((ref) {
  return ref.watch(paymentProvider).userPayments;
});

final userPaymentCardsProvider = Provider<List<PaymentCardModel>>((ref) {
  return ref.watch(paymentProvider).userCards;
});

final currentPaymentProvider = Provider<PaymentModel?>((ref) {
  return ref.watch(paymentProvider).currentPayment;
});

final paymentLoadingProvider = Provider<bool>((ref) {
  return ref.watch(paymentProvider).isLoading;
});

final paymentErrorProvider = Provider<String?>((ref) {
  return ref.watch(paymentProvider).error;
});

final availablePaymentMethodsProvider = Provider<List<Map<String, dynamic>>>((ref) {
  return ref.watch(paymentProvider).availableMethods;
});

// Individual payment provider
final paymentByIdProvider = FutureProvider.family<PaymentModel?, String>((ref, paymentId) async {
  final notifier = ref.read(paymentProvider.notifier);
  return await notifier.getPaymentById(paymentId);
});

// Default payment card provider
final defaultPaymentCardProvider = Provider<PaymentCardModel?>((ref) {
  final cards = ref.watch(userPaymentCardsProvider);
  return cards.where((card) => card.isDefault).firstOrNull;
});
