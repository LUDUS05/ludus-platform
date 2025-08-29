enum PaymentStatus {
  pending,
  processing,
  completed,
  failed,
  cancelled,
  refunded,
}

enum PaymentMethod {
  creditCard,
  debitCard,
  bankTransfer,
  digitalWallet,
  cash,
}

class PaymentModel {
  final String id;
  final String bookingId;
  final String userId;
  final double amount;
  final String currency;
  final PaymentMethod method;
  final PaymentStatus status;
  final String? transactionId;
  final String? paymentGateway;
  final Map<String, dynamic>? paymentDetails;
  final String? errorMessage;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? completedAt;

  PaymentModel({
    required this.id,
    required this.bookingId,
    required this.userId,
    required this.amount,
    this.currency = 'SAR',
    required this.method,
    this.status = PaymentStatus.pending,
    this.transactionId,
    this.paymentGateway,
    this.paymentDetails,
    this.errorMessage,
    required this.createdAt,
    required this.updatedAt,
    this.completedAt,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    return PaymentModel(
      id: json['_id'] ?? json['id'],
      bookingId: json['bookingId'] ?? '',
      userId: json['userId'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'SAR',
      method: PaymentMethod.values.firstWhere(
        (e) => e.toString().split('.').last == json['method'],
        orElse: () => PaymentMethod.creditCard,
      ),
      status: PaymentStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
        orElse: () => PaymentStatus.pending,
      ),
      transactionId: json['transactionId'],
      paymentGateway: json['paymentGateway'],
      paymentDetails: json['paymentDetails'],
      errorMessage: json['errorMessage'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      completedAt: json['completedAt'] != null 
          ? DateTime.parse(json['completedAt']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'bookingId': bookingId,
      'userId': userId,
      'amount': amount,
      'currency': currency,
      'method': method.toString().split('.').last,
      'status': status.toString().split('.').last,
      'transactionId': transactionId,
      'paymentGateway': paymentGateway,
      'paymentDetails': paymentDetails,
      'errorMessage': errorMessage,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
    };
  }

  PaymentModel copyWith({
    String? id,
    String? bookingId,
    String? userId,
    double? amount,
    String? currency,
    PaymentMethod? method,
    PaymentStatus? status,
    String? transactionId,
    String? paymentGateway,
    Map<String, dynamic>? paymentDetails,
    String? errorMessage,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? completedAt,
  }) {
    return PaymentModel(
      id: id ?? this.id,
      bookingId: bookingId ?? this.bookingId,
      userId: userId ?? this.userId,
      amount: amount ?? this.amount,
      currency: currency ?? this.currency,
      method: method ?? this.method,
      status: status ?? this.status,
      transactionId: transactionId ?? this.transactionId,
      paymentGateway: paymentGateway ?? this.paymentGateway,
      paymentDetails: paymentDetails ?? this.paymentDetails,
      errorMessage: errorMessage ?? this.errorMessage,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      completedAt: completedAt ?? this.completedAt,
    );
  }

  String get formattedAmount => '$amount $currency';
  String get methodDisplayName {
    switch (method) {
      case PaymentMethod.creditCard:
        return 'Credit Card';
      case PaymentMethod.debitCard:
        return 'Debit Card';
      case PaymentMethod.bankTransfer:
        return 'Bank Transfer';
      case PaymentMethod.digitalWallet:
        return 'Digital Wallet';
      case PaymentMethod.cash:
        return 'Cash';
    }
  }

  String get statusDisplayName {
    switch (status) {
      case PaymentStatus.pending:
        return 'Pending';
      case PaymentStatus.processing:
        return 'Processing';
      case PaymentStatus.completed:
        return 'Completed';
      case PaymentStatus.failed:
        return 'Failed';
      case PaymentStatus.cancelled:
        return 'Cancelled';
      case PaymentStatus.refunded:
        return 'Refunded';
    }
  }

  bool get isCompleted => status == PaymentStatus.completed;
  bool get isFailed => status == PaymentStatus.failed;
  bool get isPending => status == PaymentStatus.pending;
  bool get isProcessing => status == PaymentStatus.processing;
  bool get canBeRefunded => status == PaymentStatus.completed;
}

// Payment Card Model
class PaymentCardModel {
  final String id;
  final String userId;
  final String last4Digits;
  final String cardType;
  final String cardholderName;
  final int expiryMonth;
  final int expiryYear;
  final bool isDefault;
  final DateTime createdAt;

  PaymentCardModel({
    required this.id,
    required this.userId,
    required this.last4Digits,
    required this.cardType,
    required this.cardholderName,
    required this.expiryMonth,
    required this.expiryYear,
    this.isDefault = false,
    required this.createdAt,
  });

  factory PaymentCardModel.fromJson(Map<String, dynamic> json) {
    return PaymentCardModel(
      id: json['_id'] ?? json['id'],
      userId: json['userId'] ?? '',
      last4Digits: json['last4Digits'] ?? '',
      cardType: json['cardType'] ?? '',
      cardholderName: json['cardholderName'] ?? '',
      expiryMonth: json['expiryMonth'] ?? 0,
      expiryYear: json['expiryYear'] ?? 0,
      isDefault: json['isDefault'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'last4Digits': last4Digits,
      'cardType': cardType,
      'cardholderName': cardholderName,
      'expiryMonth': expiryMonth,
      'expiryYear': expiryYear,
      'isDefault': isDefault,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  String get maskedNumber => '**** **** **** $last4Digits';
  String get expiryDate => '${expiryMonth.toString().padLeft(2, '0')}/${expiryYear.toString().substring(2)}';
  bool get isExpired {
    final now = DateTime.now();
    return expiryYear < now.year || (expiryYear == now.year && expiryMonth < now.month);
  }
}
