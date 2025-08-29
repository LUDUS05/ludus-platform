class ActivityModel {
  final String id;
  final String title;
  final String description;
  final String category;
  final String location;
  final double? latitude;
  final double? longitude;
  final double price;
  final String currency;
  final int duration; // in minutes
  final int maxParticipants;
  final List<String> images;
  final String vendorId;
  final String vendorName;
  final double rating;
  final int reviewCount;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Map<String, dynamic>? metadata;

  ActivityModel({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.location,
    this.latitude,
    this.longitude,
    required this.price,
    this.currency = 'SAR',
    required this.duration,
    required this.maxParticipants,
    required this.images,
    required this.vendorId,
    required this.vendorName,
    this.rating = 0.0,
    this.reviewCount = 0,
    this.isActive = true,
    required this.createdAt,
    required this.updatedAt,
    this.metadata,
  });

  factory ActivityModel.fromJson(Map<String, dynamic> json) {
    return ActivityModel(
      id: json['_id'] ?? json['id'],
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      location: json['location'] ?? '',
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
      price: (json['price'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'SAR',
      duration: json['duration'] ?? 0,
      maxParticipants: json['maxParticipants'] ?? 0,
      images: List<String>.from(json['images'] ?? []),
      vendorId: json['vendorId'] ?? '',
      vendorName: json['vendorName'] ?? '',
      rating: (json['rating'] ?? 0).toDouble(),
      reviewCount: json['reviewCount'] ?? 0,
      isActive: json['isActive'] ?? true,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category,
      'location': location,
      'latitude': latitude,
      'longitude': longitude,
      'price': price,
      'currency': currency,
      'duration': duration,
      'maxParticipants': maxParticipants,
      'images': images,
      'vendorId': vendorId,
      'vendorName': vendorName,
      'rating': rating,
      'reviewCount': reviewCount,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'metadata': metadata,
    };
  }

  ActivityModel copyWith({
    String? id,
    String? title,
    String? description,
    String? category,
    String? location,
    double? latitude,
    double? longitude,
    double? price,
    String? currency,
    int? duration,
    int? maxParticipants,
    List<String>? images,
    String? vendorId,
    String? vendorName,
    double? rating,
    int? reviewCount,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? metadata,
  }) {
    return ActivityModel(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      category: category ?? this.category,
      location: location ?? this.location,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      price: price ?? this.price,
      currency: currency ?? this.currency,
      duration: duration ?? this.duration,
      maxParticipants: maxParticipants ?? this.maxParticipants,
      images: images ?? this.images,
      vendorId: vendorId ?? this.vendorId,
      vendorName: vendorName ?? this.vendorName,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      metadata: metadata ?? this.metadata,
    );
  }

  String get formattedPrice => '$price $currency';
  String get formattedDuration => '${duration ~/ 60}h ${duration % 60}m';
  String get formattedRating => rating.toStringAsFixed(1);
  String get mainImage => images.isNotEmpty ? images.first : '';
}
