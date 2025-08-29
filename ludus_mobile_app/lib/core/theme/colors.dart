import 'package:flutter/material.dart';

class AppColors {
  // Primary Brand Colors
  static const Color primary = Color(0xFF2563EB); // Vibrant blue
  static const Color primaryLight = Color(0xFF3B82F6);
  static const Color primaryDark = Color(0xFF1D4ED8);
  static const Color primaryContainer = Color(0xFFDBEAFE);
  
  // Secondary Brand Colors
  static const Color secondary = Color(0xFF10B981); // Emerald green
  static const Color secondaryLight = Color(0xFF34D399);
  static const Color secondaryDark = Color(0xFF059669);
  static const Color secondaryContainer = Color(0xFFD1FAE5);
  
  // Accent Colors
  static const Color accent = Color(0xFFF59E0B); // Amber
  static const Color accentLight = Color(0xFFFBBF24);
  static const Color accentDark = Color(0xFFD97706);
  static const Color accentContainer = Color(0xFFFEF3C7);
  
  // Neutral Colors
  static const Color background = Color(0xFFFAFAFA);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF5F5F5);
  static const Color surfaceDark = Color(0xFF1F2937);
  
  // Text Colors
  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color onSecondary = Color(0xFFFFFFFF);
  static const Color onSurface = Color(0xFF1F2937);
  static const Color onSurfaceVariant = Color(0xFF6B7280);
  static const Color onBackground = Color(0xFF1F2937);
  
  // Status Colors
  static const Color success = Color(0xFF10B981);
  static const Color successLight = Color(0xFFD1FAE5);
  static const Color successDark = Color(0xFF059669);
  
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFEF3C7);
  static const Color warningDark = Color(0xFFD97706);
  
  static const Color error = Color(0xFFEF4444);
  static const Color errorLight = Color(0xFFFEE2E2);
  static const Color errorDark = Color(0xFFDC2626);
  
  static const Color info = Color(0xFF3B82F6);
  static const Color infoLight = Color(0xFFDBEAFE);
  static const Color infoDark = Color(0xFF1D4ED8);
  
  // Activity Category Colors
  static const Color sports = Color(0xFF3B82F6);
  static const Color adventure = Color(0xFF10B981);
  static const Color culture = Color(0xFF8B5CF6);
  static const Color food = Color(0xFFF59E0B);
  static const Color wellness = Color(0xFFEC4899);
  static const Color education = Color(0xFF06B6D4);
  static const Color entertainment = Color(0xFFEF4444);
  static const Color technology = Color(0xFF6366F1);
  
  // Social Colors
  static const Color facebook = Color(0xFF1877F2);
  static const Color google = Color(0xFFDB4437);
  static const Color apple = Color(0xFF000000);
  static const Color twitter = Color(0xFF1DA1F2);
  static const Color instagram = Color(0xFFE4405F);
  
  // Payment Colors
  static const Color visa = Color(0xFF1A1F71);
  static const Color mastercard = Color(0xFFEB001B);
  static const Color mada = Color(0xFF00A651);
  static const Color applePay = Color(0xFF000000);
  static const Color stcPay = Color(0xFF00A651);
  
  // Gradient Colors
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, primaryLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient secondaryGradient = LinearGradient(
    colors: [secondary, secondaryLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient accentGradient = LinearGradient(
    colors: [accent, accentLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient backgroundGradient = LinearGradient(
    colors: [background, surfaceVariant],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
  
  // Shadow Colors
  static const Color shadowLight = Color(0x1A000000);
  static const Color shadowMedium = Color(0x33000000);
  static const Color shadowDark = Color(0x4D000000);
  
  // Overlay Colors
  static const Color overlayLight = Color(0x80000000);
  static const Color overlayMedium = Color(0xB3000000);
  static const Color overlayDark = Color(0xE6000000);
  
  // Border Colors
  static const Color borderLight = Color(0xFFE5E7EB);
  static const Color borderMedium = Color(0xFFD1D5DB);
  static const Color borderDark = Color(0xFF9CA3AF);
  static const Color outline = Color(0xFFE5E7EB);
  
  // Disabled Colors
  static const Color disabled = Color(0xFF9CA3AF);
  static const Color disabledContainer = Color(0xFFF3F4F6);
  static const Color onDisabled = Color(0xFF6B7280);
  
  // Rating Colors
  static const Color ratingStar = Color(0xFFFFD700);
  static const Color ratingStarEmpty = Color(0xFFE5E7EB);
  
  // Map Colors
  static const Color mapPrimary = Color(0xFF2563EB);
  static const Color mapSecondary = Color(0xFF10B981);
  static const Color mapAccent = Color(0xFFF59E0B);
  
  // Calendar Colors
  static const Color calendarToday = Color(0xFF2563EB);
  static const Color calendarSelected = Color(0xFF10B981);
  static const Color calendarBooked = Color(0xFFEF4444);
  static const Color calendarAvailable = Color(0xFFE5E7EB);
  
  // Notification Colors
  static const Color notificationSuccess = Color(0xFF10B981);
  static const Color notificationWarning = Color(0xFFF59E0B);
  static const Color notificationError = Color(0xFFEF4444);
  static const Color notificationInfo = Color(0xFF3B82F6);
  
  // Progress Colors
  static const Color progressBackground = Color(0xFFE5E7EB);
  static const Color progressFill = Color(0xFF2563EB);
  static const Color progressSuccess = Color(0xFF10B981);
  static const Color progressWarning = Color(0xFFF59E0B);
  static const Color progressError = Color(0xFFEF4444);
  
  // Chart Colors
  static const List<Color> chartColors = [
    Color(0xFF2563EB),
    Color(0xFF10B981),
    Color(0xFFF59E0B),
    Color(0xFF8B5CF6),
    Color(0xFFEC4899),
    Color(0xFF06B6D4),
    Color(0xFFEF4444),
    Color(0xFF6366F1),
  ];
  
  // Dark Theme Colors
  static const Color darkBackground = Color(0xFF111827);
  static const Color darkSurface = Color(0xFF1F2937);
  static const Color darkSurfaceVariant = Color(0xFF374151);
  static const Color darkOnSurface = Color(0xFFF9FAFB);
  static const Color darkOnSurfaceVariant = Color(0xFFD1D5DB);
  static const Color darkBorder = Color(0xFF374151);
  
  // Get category color by name
  static Color getCategoryColor(String category) {
    switch (category.toLowerCase()) {
      case 'sports':
        return sports;
      case 'adventure':
        return adventure;
      case 'culture':
        return culture;
      case 'food':
        return food;
      case 'wellness':
        return wellness;
      case 'education':
        return education;
      case 'entertainment':
        return entertainment;
      case 'technology':
        return technology;
      default:
        return primary;
    }
  }
  
  // Get status color
  static Color getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'active':
      case 'confirmed':
      case 'completed':
        return success;
      case 'pending':
        return warning;
      case 'cancelled':
      case 'failed':
        return error;
      default:
        return info;
    }
  }
}
