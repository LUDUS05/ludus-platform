import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../models/payment_model.dart';
import '../providers/payment_provider.dart';
import '../services/payment_service.dart';

class PaymentScreen extends ConsumerStatefulWidget {
  final String bookingId;
  final double amount;
  final String currency;

  const PaymentScreen({
    super.key,
    required this.bookingId,
    required this.amount,
    this.currency = 'SAR',
  });

  @override
  ConsumerState<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends ConsumerState<PaymentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _cardNumberController = TextEditingController();
  final _cardholderNameController = TextEditingController();
  final _cvvController = TextEditingController();
  
  PaymentMethod _selectedMethod = PaymentMethod.creditCard;
  int _selectedExpiryMonth = 1;
  int _selectedExpiryYear = DateTime.now().year;
  bool _saveCard = false;
  bool _isLoading = false;
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _loadAvailablePaymentMethods();
  }

  @override
  void dispose() {
    _cardNumberController.dispose();
    _cardholderNameController.dispose();
    _cvvController.dispose();
    super.dispose();
  }

  void _loadAvailablePaymentMethods() {
    ref.read(paymentProvider.notifier).loadAvailablePaymentMethods();
  }

  Future<void> _processPayment() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isProcessing = true);

    try {
      // TODO: Get actual user data from auth provider
      const userId = 'mock-user-id';

      Map<String, dynamic> paymentDetails = {};

      if (_selectedMethod == PaymentMethod.creditCard || _selectedMethod == PaymentMethod.debitCard) {
        paymentDetails = {
          'cardNumber': _cardNumberController.text.replaceAll(RegExp(r'[\s-]'), ''),
          'cardholderName': _cardholderNameController.text,
          'expiryMonth': _selectedExpiryMonth,
          'expiryYear': _selectedExpiryYear,
          'cvv': _cvvController.text,
          'saveCard': _saveCard,
        };
      }

      final payment = await ref.read(paymentProvider.notifier).processPayment(
        bookingId: widget.bookingId,
        userId: userId,
        amount: widget.amount,
        method: _selectedMethod,
        paymentDetails: paymentDetails,
      );

      if (payment != null && mounted) {
        if (payment.isCompleted) {
          // Navigate to success screen
          context.push('/payment-success/${payment.id}');
        } else if (payment.isFailed) {
          // Show error message
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Payment failed: ${payment.errorMessage ?? 'Unknown error'}'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Payment failed: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  String? _validateCardNumber(String? value) {
    if (value == null || value.isEmpty) {
      return 'Card number is required';
    }
    if (!PaymentService.validateCardNumber(value)) {
      return 'Invalid card number';
    }
    return null;
  }

  String? _validateCardholderName(String? value) {
    if (value == null || value.isEmpty) {
      return 'Cardholder name is required';
    }
    if (value.length < 2) {
      return 'Cardholder name must be at least 2 characters';
    }
    return null;
  }

  String? _validateCVV(String? value) {
    if (value == null || value.isEmpty) {
      return 'CVV is required';
    }
    final cardType = PaymentService.getCardType(_cardNumberController.text);
    if (!PaymentService.validateCVV(value, cardType)) {
      return 'Invalid CVV';
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final paymentState = ref.watch(paymentProvider);
    final isLoading = paymentState.isLoading;
    final error = paymentState.error;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Payment'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.onPrimary,
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Payment Summary
                  Card(
                    margin: const EdgeInsets.only(bottom: 24),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Payment Summary',
                            style: AppTextStyles.titleLarge.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Amount:',
                                style: AppTextStyles.bodyLarge,
                              ),
                              Text(
                                '${widget.amount.toStringAsFixed(2)} ${widget.currency}',
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
                  ),

                  // Payment Method Selection
                  Text(
                    'Payment Method',
                    style: AppTextStyles.titleMedium.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildPaymentMethodSelector(),

                  const SizedBox(height: 24),

                  // Card Details (if credit/debit card selected)
                  if (_selectedMethod == PaymentMethod.creditCard || _selectedMethod == PaymentMethod.debitCard) ...[
                    Text(
                      'Card Details',
                      style: AppTextStyles.titleMedium.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildCardDetailsForm(),
                  ],

                  const SizedBox(height: 32),

                  // Pay Button
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: (_isProcessing || isLoading) ? null : _processPayment,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: AppColors.onPrimary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: _isProcessing
                          ? Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    color: AppColors.onPrimary,
                                    strokeWidth: 2,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Text(
                                  'Processing Payment...',
                                  style: AppTextStyles.titleMedium.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            )
                          : Text(
                              'Pay ${widget.amount.toStringAsFixed(2)} ${widget.currency}',
                              style: AppTextStyles.titleMedium.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Security Notice
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.security,
                          color: AppColors.primary,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Your payment information is secure and encrypted',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Loading Overlay
          if (isLoading)
            Container(
              color: Colors.black.withOpacity(0.3),
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPaymentMethodSelector() {
    return Column(
      children: [
        _buildPaymentMethodOption(
          PaymentMethod.creditCard,
          'Credit Card',
          Icons.credit_card,
        ),
        _buildPaymentMethodOption(
          PaymentMethod.debitCard,
          'Debit Card',
          Icons.credit_card,
        ),
        _buildPaymentMethodOption(
          PaymentMethod.digitalWallet,
          'Digital Wallet',
          Icons.account_balance_wallet,
        ),
        _buildPaymentMethodOption(
          PaymentMethod.bankTransfer,
          'Bank Transfer',
          Icons.account_balance,
        ),
      ],
    );
  }

  Widget _buildPaymentMethodOption(
    PaymentMethod method,
    String title,
    IconData icon,
  ) {
    final isSelected = _selectedMethod == method;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: () => setState(() => _selectedMethod = method),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary.withOpacity(0.1) : AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.onSurface.withOpacity(0.1),
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Row(
            children: [
              Icon(
                icon,
                color: isSelected ? AppColors.primary : AppColors.onSurface.withOpacity(0.6),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: AppTextStyles.bodyLarge.copyWith(
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    color: isSelected ? AppColors.primary : AppColors.onSurface,
                  ),
                ),
              ),
              if (isSelected)
                Icon(
                  Icons.check_circle,
                  color: AppColors.primary,
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCardDetailsForm() {
    return Column(
      children: [
        // Card Number
        TextFormField(
          controller: _cardNumberController,
          validator: _validateCardNumber,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(
            labelText: 'Card Number',
            hintText: '1234 5678 9012 3456',
            prefixIcon: Icon(Icons.credit_card),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            filled: true,
            fillColor: AppColors.surface,
          ),
          onChanged: (value) {
            // Auto-format card number
            final clean = value.replaceAll(RegExp(r'[\s-]'), '');
            if (clean.length <= 16) {
              final formatted = clean.replaceAllMapped(
                RegExp(r'.{4}'),
                (match) => '${match.group(0)} ',
              ).trim();
              if (formatted != value) {
                _cardNumberController.value = TextEditingValue(
                  text: formatted,
                  selection: TextSelection.collapsed(offset: formatted.length),
                );
              }
            }
          },
        ),

        const SizedBox(height: 16),

        // Cardholder Name
        TextFormField(
          controller: _cardholderNameController,
          validator: _validateCardholderName,
          textCapitalization: TextCapitalization.words,
          decoration: InputDecoration(
            labelText: 'Cardholder Name',
            hintText: 'John Doe',
            prefixIcon: Icon(Icons.person),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            filled: true,
            fillColor: AppColors.surface,
          ),
        ),

        const SizedBox(height: 16),

        // Expiry Date and CVV
        Row(
          children: [
            // Expiry Month
            Expanded(
              child: DropdownButtonFormField<int>(
                value: _selectedExpiryMonth,
                decoration: InputDecoration(
                  labelText: 'Month',
                  prefixIcon: Icon(Icons.calendar_today),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  filled: true,
                  fillColor: AppColors.surface,
                ),
                items: List.generate(12, (index) {
                  return DropdownMenuItem(
                    value: index + 1,
                    child: Text('${(index + 1).toString().padLeft(2, '0')}'),
                  );
                }),
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _selectedExpiryMonth = value);
                  }
                },
              ),
            ),
            const SizedBox(width: 12),
            // Expiry Year
            Expanded(
              child: DropdownButtonFormField<int>(
                value: _selectedExpiryYear,
                decoration: InputDecoration(
                  labelText: 'Year',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  filled: true,
                  fillColor: AppColors.surface,
                ),
                items: List.generate(10, (index) {
                  final year = DateTime.now().year + index;
                  return DropdownMenuItem(
                    value: year,
                    child: Text(year.toString()),
                  );
                }),
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _selectedExpiryYear = value);
                  }
                },
              ),
            ),
            const SizedBox(width: 12),
            // CVV
            Expanded(
              child: TextFormField(
                controller: _cvvController,
                validator: _validateCVV,
                keyboardType: TextInputType.number,
                maxLength: 4,
                decoration: InputDecoration(
                  labelText: 'CVV',
                  hintText: '123',
                  counterText: '',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  filled: true,
                  fillColor: AppColors.surface,
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: 16),

        // Save Card Option
        CheckboxListTile(
          value: _saveCard,
          onChanged: (value) {
            setState(() => _saveCard = value ?? false);
          },
          title: Text(
            'Save this card for future payments',
            style: AppTextStyles.bodyMedium,
          ),
          controlAffinity: ListTileControlAffinity.leading,
          contentPadding: EdgeInsets.zero,
        ),
      ],
    );
  }
}
