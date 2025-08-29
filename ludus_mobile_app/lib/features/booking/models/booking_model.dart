enum BookingStatus {
  pending,
  confirmed,
  cancelled,
  completed,
  refunded,
}

class BookingModel {
  final String id;
  final String activityId;
  final String activityTitle;
  final String userId;
  final String userName;
  final String userEmail;
  final String userPhone;
  final DateTime bookingDate;
  final DateTime activityDate;
  final int participants;
  final double pricePerPerson;
  final double totalPrice;
  final String currency;
  final BookingStatus status;
  final String? specialRequests;
  final String? paymentMethod;
  final String? paymentId;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Map<String, dynamic>? metadata;

  BookingModel({
    required this.id,
    required this.activityId,
    required this.activityTitle,
    required this.userId,
    required this.userName,
    required this.userEmail,
    required this.userPhone,
    required this.bookingDate,
    required this.activityDate,
    required this.participants,
    required this.pricePerPerson,
    required this.totalPrice,
    this.currency = 'SAR',
    this.status = BookingStatus.pending,
    this.specialRequests,
    this.paymentMethod,
    this.paymentId,
    required this.createdAt,
    required this.updatedAt,
    this.metadata,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    return BookingModel(
      id: json['_id'] ?? json['id'],
      activityId: json['activityId'] ?? '',
      activityTitle: json['activityTitle'] ?? '',
      userId: json['userId'] ?? '',
      userName: json['userName'] ?? '',
      userEmail: json['userEmail'] ?? '',
      userPhone: json['userPhone'] ?? '',
      bookingDate: DateTime.parse(json['bookingDate']),
      activityDate: DateTime.parse(json['activityDate']),
      participants: json['participants'] ?? 1,
      pricePerPerson: (json['pricePerPerson'] ?? 0).toDouble(),
      totalPrice: (json['totalPrice'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'SAR',
      status: BookingStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
        orElse: () => BookingStatus.pending,
      ),
      specialRequests: json['specialRequests'],
      paymentMethod: json['paymentMethod'],
      paymentId: json['paymentId'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'activityId': activityId,
      'activityTitle': activityTitle,
      'userId': userId,
      'userName': userName,
      'userEmail': userEmail,
      'userPhone': userPhone,
      'bookingDate': bookingDate.toIso8601String(),
      'activityDate': activityDate.toIso8601String(),
      'participants': participants,
      'pricePerPerson': pricePerPerson,
      'totalPrice': totalPrice,
      'currency': currency,
      'status': status.toString().split('.').last,
      'specialRequests': specialRequests,
      'paymentMethod': paymentMethod,
      'paymentId': paymentId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'metadata': metadata,
    };
  }

  BookingModel copyWith({
    String? id,
    String? activityId,
    String? activityTitle,
    String? userId,
    String? userName,
    String? userEmail,
    String? userPhone,
    DateTime? bookingDate,
    DateTime? activityDate,
    int? participants,
    double? pricePerPerson,
    double? totalPrice,
    String? currency,
    BookingStatus? status,
    String? specialRequests,
    String? paymentMethod,
    String? paymentId,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? metadata,
  }) {
    return BookingModel(
      id: id ?? this.id,
      activityId: activityId ?? this.activityId,
      activityTitle: activityTitle ?? this.activityTitle,
      userId: userId ?? this.userId,
      userName: userName ?? this.userName,
      userEmail: userEmail ?? this.userEmail,
      userPhone: userPhone ?? this.userPhone,
      bookingDate: bookingDate ?? this.bookingDate,
      activityDate: activityDate ?? this.activityDate,
      participants: participants ?? this.participants,
      pricePerPerson: pricePerPerson ?? this.pricePerPerson,
      totalPrice: totalPrice ?? this.totalPrice,
      currency: currency ?? this.currency,
      status: status ?? this.status,
      specialRequests: specialRequests ?? this.specialRequests,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      paymentId: paymentId ?? this.paymentId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      metadata: metadata ?? this.metadata,
    );
  }

  String get formattedTotalPrice => '$totalPrice $currency';
  String get formattedPricePerPerson => '$pricePerPerson $currency';
  String get formattedActivityDate => '${activityDate.day}/${activityDate.month}/${activityDate.year}';
  String get formattedActivityTime => '${activityDate.hour.toString().padLeft(2, '0')}:${activityDate.minute.toString().padLeft(2, '0')}';
  String get statusDisplayName {
    switch (status) {
      case BookingStatus.pending:
        return 'Pending';
      case BookingStatus.confirmed:
        return 'Confirmed';
      case BookingStatus.cancelled:
        return 'Cancelled';
      case BookingStatus.completed:
        return 'Completed';
      case BookingStatus.refunded:
        return 'Refunded';
    }
  }

  bool get isConfirmed => status == BookingStatus.confirmed;
  bool get isCancelled => status == BookingStatus.cancelled;
  bool get isCompleted => status == BookingStatus.completed;
  bool get canBeCancelled => status == BookingStatus.pending || status == BookingStatus.confirmed;
}
