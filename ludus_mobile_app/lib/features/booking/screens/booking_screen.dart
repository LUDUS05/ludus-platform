import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../discovery/models/activity_model.dart';
import '../../discovery/providers/activity_provider.dart';
import '../providers/booking_provider.dart';
import '../models/booking_model.dart';

class BookingScreen extends ConsumerStatefulWidget {
  final String activityId;

  const BookingScreen({
    super.key,
    required this.activityId,
  });

  @override
  ConsumerState<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends ConsumerState<BookingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _specialRequestsController = TextEditingController();
  
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  TimeOfDay _selectedTime = const TimeOfDay(hour: 10, minute: 0);
  int _participants = 1;
  bool _isLoading = false;

  @override
  void dispose() {
    _specialRequestsController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now().add(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _selectTime(BuildContext context) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime,
    );
    if (picked != null && picked != _selectedTime) {
      setState(() {
        _selectedTime = picked;
      });
    }
  }

  void _incrementParticipants() {
    setState(() {
      _participants++;
    });
  }

  void _decrementParticipants() {
    if (_participants > 1) {
      setState(() {
        _participants--;
      });
    }
  }

  Future<void> _createBooking(ActivityModel activity) async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      // Combine date and time
      final activityDateTime = DateTime(
        _selectedDate.year,
        _selectedDate.month,
        _selectedDate.day,
        _selectedTime.hour,
        _selectedTime.minute,
      );

      // TODO: Get actual user data from auth provider
      const userId = 'mock-user-id';
      const userName = 'John Doe';
      const userEmail = 'john@example.com';
      const userPhone = '+966501234567';

      final booking = await ref.read(bookingProvider.notifier).createBooking(
        activityId: activity.id,
        activityTitle: activity.title,
        userId: userId,
        userName: userName,
        userEmail: userEmail,
        userPhone: userPhone,
        activityDate: activityDateTime,
        participants: _participants,
        pricePerPerson: activity.price,
        specialRequests: _specialRequestsController.text.isNotEmpty
            ? _specialRequestsController.text
            : null,
      );

      if (booking != null && mounted) {
        // Navigate to booking confirmation
        context.push('/booking-confirmation/${booking.id}');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Booking failed: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final activityAsync = ref.watch(activityByIdProvider(widget.activityId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Book Activity'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.onPrimary,
      ),
      body: activityAsync.when(
        data: (activity) {
          if (activity == null) {
            return _buildErrorScreen('Activity not found');
          }
          return _buildBookingForm(activity);
        },
        loading: () => _buildLoadingScreen(),
        error: (error, stack) => _buildErrorScreen(error.toString()),
      ),
    );
  }

  Widget _buildBookingForm(ActivityModel activity) {
    final totalPrice = activity.price * _participants;

    return Form(
      key: _formKey,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Activity Summary Card
            Card(
              margin: const EdgeInsets.only(bottom: 24),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      activity.title,
                      style: AppTextStyles.titleLarge.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(
                          Icons.location_on,
                          size: 16,
                          color: AppColors.onSurface.withOpacity(0.6),
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            activity.location,
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.onSurface.withOpacity(0.6),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Icon(
                          Icons.access_time,
                          size: 16,
                          color: AppColors.onSurface.withOpacity(0.6),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          activity.formattedDuration,
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: AppColors.onSurface.withOpacity(0.6),
                          ),
                        ),
                        const Spacer(),
                        Text(
                          '${activity.formattedPrice} per person',
                          style: AppTextStyles.titleMedium.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Date Selection
            Text(
              'Select Date',
              style: AppTextStyles.titleMedium.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            InkWell(
              onTap: () => _selectDate(context),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.onSurface.withOpacity(0.1)),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.calendar_today,
                      color: AppColors.primary,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        '${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}',
                        style: AppTextStyles.bodyLarge,
                      ),
                    ),
                    Icon(
                      Icons.arrow_drop_down,
                      color: AppColors.onSurface.withOpacity(0.6),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Time Selection
            Text(
              'Select Time',
              style: AppTextStyles.titleMedium.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            InkWell(
              onTap: () => _selectTime(context),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.onSurface.withOpacity(0.1)),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.access_time,
                      color: AppColors.primary,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _selectedTime.format(context),
                        style: AppTextStyles.bodyLarge,
                      ),
                    ),
                    Icon(
                      Icons.arrow_drop_down,
                      color: AppColors.onSurface.withOpacity(0.6),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Participants Selection
            Text(
              'Number of Participants',
              style: AppTextStyles.titleMedium.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.onSurface.withOpacity(0.1)),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.people,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Participants',
                      style: AppTextStyles.bodyLarge,
                    ),
                  ),
                  IconButton(
                    onPressed: _decrementParticipants,
                    icon: Icon(Icons.remove_circle_outline),
                    color: AppColors.primary,
                  ),
                  Container(
                    width: 40,
                    alignment: Alignment.center,
                    child: Text(
                      '$_participants',
                      style: AppTextStyles.titleMedium.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: _incrementParticipants,
                    icon: Icon(Icons.add_circle_outline),
                    color: AppColors.primary,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Special Requests
            Text(
              'Special Requests (Optional)',
              style: AppTextStyles.titleMedium.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _specialRequestsController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Any special requirements or requests...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: AppColors.surface,
              ),
            ),

            const SizedBox(height: 32),

            // Price Summary
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.primary.withOpacity(0.2)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Price per person:',
                        style: AppTextStyles.bodyMedium,
                      ),
                      Text(
                        activity.formattedPrice,
                        style: AppTextStyles.bodyMedium,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Participants:',
                        style: AppTextStyles.bodyMedium,
                      ),
                      Text(
                        '$_participants',
                        style: AppTextStyles.bodyMedium,
                      ),
                    ],
                  ),
                  const Divider(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Total Price:',
                        style: AppTextStyles.titleMedium.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '${totalPrice.toStringAsFixed(2)} ${activity.currency}',
                        style: AppTextStyles.titleLarge.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Book Now Button
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _isLoading ? null : () => _createBooking(activity),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: AppColors.onPrimary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isLoading
                    ? CircularProgressIndicator(
                        color: AppColors.onPrimary,
                        strokeWidth: 2,
                      )
                    : Text(
                        'Book Now - ${totalPrice.toStringAsFixed(2)} ${activity.currency}',
                        style: AppTextStyles.titleMedium.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),

            const SizedBox(height: 16),

            // Terms and Conditions
            Text(
              'By booking this activity, you agree to our terms and conditions and cancellation policy.',
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.onSurface.withOpacity(0.6),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingScreen() {
    return const Scaffold(
      body: Center(
        child: CircularProgressIndicator(),
      ),
    );
  }

  Widget _buildErrorScreen(String error) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: AppColors.error,
            ),
            const SizedBox(height: 16),
            Text(
              'Error',
              style: AppTextStyles.headlineMedium.copyWith(
                color: AppColors.error,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error,
              style: AppTextStyles.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.pop(),
              child: Text('Go Back'),
            ),
          ],
        ),
      ),
    );
  }
}
