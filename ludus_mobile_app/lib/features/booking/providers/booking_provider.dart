import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/booking_model.dart';
import '../services/booking_service.dart';

// Booking state
class BookingState {
  final List<BookingModel> userBookings;
  final BookingModel? currentBooking;
  final bool isLoading;
  final String? error;
  final Map<String, dynamic>? availability;
  final Map<String, dynamic>? bookingStats;

  const BookingState({
    this.userBookings = const [],
    this.currentBooking,
    this.isLoading = false,
    this.error,
    this.availability,
    this.bookingStats,
  });

  BookingState copyWith({
    List<BookingModel>? userBookings,
    BookingModel? currentBooking,
    bool? isLoading,
    String? error,
    Map<String, dynamic>? availability,
    Map<String, dynamic>? bookingStats,
  }) {
    return BookingState(
      userBookings: userBookings ?? this.userBookings,
      currentBooking: currentBooking ?? this.currentBooking,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      availability: availability ?? this.availability,
      bookingStats: bookingStats ?? this.bookingStats,
    );
  }
}

// Booking notifier
class BookingNotifier extends StateNotifier<BookingState> {
  BookingNotifier() : super(const BookingState());

  // Create a new booking
  Future<BookingModel?> createBooking({
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
    state = state.copyWith(isLoading: true, error: null);

    try {
      final booking = await BookingService.createBooking(
        activityId: activityId,
        activityTitle: activityTitle,
        userId: userId,
        userName: userName,
        userEmail: userEmail,
        userPhone: userPhone,
        activityDate: activityDate,
        participants: participants,
        pricePerPerson: pricePerPerson,
        specialRequests: specialRequests,
      );

      state = state.copyWith(
        currentBooking: booking,
        isLoading: false,
      );

      // Refresh user bookings
      await loadUserBookings(userId);

      return booking;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return null;
    }
  }

  // Load user's bookings
  Future<void> loadUserBookings(String userId) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final bookings = await BookingService.getUserBookings(userId);
      state = state.copyWith(
        userBookings: bookings,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  // Get booking by ID
  Future<BookingModel?> getBookingById(String bookingId) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final booking = await BookingService.getBookingById(bookingId);
      state = state.copyWith(
        currentBooking: booking,
        isLoading: false,
      );
      return booking;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return null;
    }
  }

  // Update booking status
  Future<BookingModel?> updateBookingStatus(String bookingId, String status) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final booking = await BookingService.updateBookingStatus(bookingId, status);
      state = state.copyWith(
        currentBooking: booking,
        isLoading: false,
      );

      // Update in user bookings list
      final updatedBookings = state.userBookings.map((b) {
        if (b.id == bookingId) {
          return booking;
        }
        return b;
      }).toList();

      state = state.copyWith(userBookings: updatedBookings);

      return booking;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return null;
    }
  }

  // Cancel booking
  Future<BookingModel?> cancelBooking(String bookingId) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final booking = await BookingService.cancelBooking(bookingId);
      state = state.copyWith(
        currentBooking: booking,
        isLoading: false,
      );

      // Update in user bookings list
      final updatedBookings = state.userBookings.map((b) {
        if (b.id == bookingId) {
          return booking;
        }
        return b;
      }).toList();

      state = state.copyWith(userBookings: updatedBookings);

      return booking;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return null;
    }
  }

  // Get activity availability
  Future<Map<String, dynamic>?> getActivityAvailability(
    String activityId,
    DateTime date,
  ) async {
    try {
      final availability = await BookingService.getActivityAvailability(activityId, date);
      state = state.copyWith(availability: availability);
      return availability;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  // Process payment
  Future<Map<String, dynamic>?> processPayment({
    required String bookingId,
    required String paymentMethod,
    required Map<String, dynamic> paymentDetails,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final result = await BookingService.processPayment(
        bookingId: bookingId,
        paymentMethod: paymentMethod,
        paymentDetails: paymentDetails,
      );

      state = state.copyWith(isLoading: false);
      return result;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return null;
    }
  }

  // Get booking statistics
  Future<Map<String, dynamic>?> getBookingStats(String userId) async {
    try {
      final stats = await BookingService.getBookingStats(userId);
      state = state.copyWith(bookingStats: stats);
      return stats;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  // Clear current booking
  void clearCurrentBooking() {
    state = state.copyWith(currentBooking: null);
  }

  // Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }

  // Refresh bookings
  Future<void> refreshBookings(String userId) async {
    await loadUserBookings(userId);
  }
}

// Providers
final bookingProvider = StateNotifierProvider<BookingNotifier, BookingState>((ref) {
  return BookingNotifier();
});

final userBookingsProvider = Provider<List<BookingModel>>((ref) {
  return ref.watch(bookingProvider).userBookings;
});

final currentBookingProvider = Provider<BookingModel?>((ref) {
  return ref.watch(bookingProvider).currentBooking;
});

final bookingLoadingProvider = Provider<bool>((ref) {
  return ref.watch(bookingProvider).isLoading;
});

final bookingErrorProvider = Provider<String?>((ref) {
  return ref.watch(bookingProvider).error;
});

final availabilityProvider = Provider<Map<String, dynamic>?>((ref) {
  return ref.watch(bookingProvider).availability;
});

final bookingStatsProvider = Provider<Map<String, dynamic>?>((ref) {
  return ref.watch(bookingProvider).bookingStats;
});

// Individual booking provider
final bookingByIdProvider = FutureProvider.family<BookingModel?, String>((ref, bookingId) async {
  final notifier = ref.read(bookingProvider.notifier);
  return await notifier.getBookingById(bookingId);
});
