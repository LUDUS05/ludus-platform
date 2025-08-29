import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'colors.dart';

class AppTextStyles {
  // Font Families
  static const String primaryFontFamily = 'Poppins';
  static const String arabicFontFamily = 'NotoSansArabic';
  
  // Base Text Styles
  static TextStyle get _baseTextStyle => GoogleFonts.poppins(
    color: AppColors.onSurface,
    fontWeight: FontWeight.normal,
  );
  
  static TextStyle get _baseArabicTextStyle => const TextStyle(
    fontFamily: arabicFontFamily,
    color: AppColors.onSurface,
    fontWeight: FontWeight.normal,
  );
  
  // Display Styles
  static TextStyle get displayLarge => _baseTextStyle.copyWith(
    fontSize: 57,
    fontWeight: FontWeight.w400,
    letterSpacing: -0.25,
    height: 1.12,
  );
  
  static TextStyle get displayMedium => _baseTextStyle.copyWith(
    fontSize: 45,
    fontWeight: FontWeight.w400,
    letterSpacing: 0,
    height: 1.16,
  );
  
  static TextStyle get displaySmall => _baseTextStyle.copyWith(
    fontSize: 36,
    fontWeight: FontWeight.w400,
    letterSpacing: 0,
    height: 1.22,
  );
  
  // Headline Styles
  static TextStyle get headlineLarge => _baseTextStyle.copyWith(
    fontSize: 32,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
    height: 1.25,
  );
  
  static TextStyle get headlineMedium => _baseTextStyle.copyWith(
    fontSize: 28,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
    height: 1.29,
  );
  
  static TextStyle get headlineSmall => _baseTextStyle.copyWith(
    fontSize: 24,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
    height: 1.33,
  );
  
  // Title Styles
  static TextStyle get titleLarge => _baseTextStyle.copyWith(
    fontSize: 22,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
    height: 1.27,
  );
  
  static TextStyle get titleMedium => _baseTextStyle.copyWith(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.15,
    height: 1.5,
  );
  
  static TextStyle get titleSmall => _baseTextStyle.copyWith(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.1,
    height: 1.43,
  );
  
  // Body Styles
  static TextStyle get bodyLarge => _baseTextStyle.copyWith(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.5,
    height: 1.5,
  );
  
  static TextStyle get bodyMedium => _baseTextStyle.copyWith(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.25,
    height: 1.43,
  );
  
  static TextStyle get bodySmall => _baseTextStyle.copyWith(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.4,
    height: 1.33,
  );
  
  // Label Styles
  static TextStyle get labelLarge => _baseTextStyle.copyWith(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.1,
    height: 1.43,
  );
  
  static TextStyle get labelMedium => _baseTextStyle.copyWith(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.5,
    height: 1.33,
  );
  
  static TextStyle get labelSmall => _baseTextStyle.copyWith(
    fontSize: 11,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.5,
    height: 1.45,
  );
  
  // Custom Styles for LUDUS App
  static TextStyle get appTitle => _baseTextStyle.copyWith(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: AppColors.primary,
    letterSpacing: -0.5,
  );
  
  static TextStyle get appSubtitle => _baseTextStyle.copyWith(
    fontSize: 18,
    fontWeight: FontWeight.w500,
    color: AppColors.onSurfaceVariant,
    letterSpacing: 0.15,
  );
  
  static TextStyle get activityTitle => _baseTextStyle.copyWith(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    color: AppColors.onSurface,
    letterSpacing: 0.15,
  );
  
  static TextStyle get activityDescription => _baseTextStyle.copyWith(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.onSurfaceVariant,
    letterSpacing: 0.25,
    height: 1.5,
  );
  
  static TextStyle get price => _baseTextStyle.copyWith(
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: AppColors.primary,
    letterSpacing: 0.15,
  );
  
  static TextStyle get priceSmall => _baseTextStyle.copyWith(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    color: AppColors.primary,
    letterSpacing: 0.1,
  );
  
  static TextStyle get rating => _baseTextStyle.copyWith(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: AppColors.accent,
    letterSpacing: 0.1,
  );
  
  static TextStyle get category => _baseTextStyle.copyWith(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: AppColors.onSurfaceVariant,
    letterSpacing: 0.5,
  );
  
  static TextStyle get status => _baseTextStyle.copyWith(
    fontSize: 12,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
  );
  
  static TextStyle get button => _baseTextStyle.copyWith(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.1,
  );
  
  static TextStyle get buttonSmall => _baseTextStyle.copyWith(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.1,
  );
  
  static TextStyle get inputLabel => _baseTextStyle.copyWith(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: AppColors.onSurface,
    letterSpacing: 0.1,
  );
  
  static TextStyle get inputText => _baseTextStyle.copyWith(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: AppColors.onSurface,
    letterSpacing: 0.15,
  );
  
  static TextStyle get inputHint => _baseTextStyle.copyWith(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: AppColors.onSurfaceVariant,
    letterSpacing: 0.15,
  );
  
  static TextStyle get error => _baseTextStyle.copyWith(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.error,
    letterSpacing: 0.4,
  );
  
  static TextStyle get success => _baseTextStyle.copyWith(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.success,
    letterSpacing: 0.4,
  );
  
  static TextStyle get warning => _baseTextStyle.copyWith(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.warning,
    letterSpacing: 0.4,
  );
  
  static TextStyle get info => _baseTextStyle.copyWith(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.info,
    letterSpacing: 0.4,
  );
  
  // Navigation Styles
  static TextStyle get navigationLabel => _baseTextStyle.copyWith(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.5,
  );
  
  static TextStyle get navigationLabelSelected => _baseTextStyle.copyWith(
    fontSize: 12,
    fontWeight: FontWeight.w600,
    color: AppColors.primary,
    letterSpacing: 0.5,
  );
  
  // Card Styles
  static TextStyle get cardTitle => _baseTextStyle.copyWith(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: AppColors.onSurface,
    letterSpacing: 0.15,
  );
  
  static TextStyle get cardSubtitle => _baseTextStyle.copyWith(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.onSurfaceVariant,
    letterSpacing: 0.25,
  );
  
  static TextStyle get cardMeta => _baseTextStyle.copyWith(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.onSurfaceVariant,
    letterSpacing: 0.4,
  );
  
  // List Styles
  static TextStyle get listTitle => _baseTextStyle.copyWith(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.onSurface,
    letterSpacing: 0.15,
  );
  
  static TextStyle get listSubtitle => _baseTextStyle.copyWith(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.onSurfaceVariant,
    letterSpacing: 0.25,
  );
  
  static TextStyle get listMeta => _baseTextStyle.copyWith(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.onSurfaceVariant,
    letterSpacing: 0.4,
  );
  
  // Dialog Styles
  static TextStyle get dialogTitle => _baseTextStyle.copyWith(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    color: AppColors.onSurface,
    letterSpacing: 0.15,
  );
  
  static TextStyle get dialogContent => _baseTextStyle.copyWith(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: AppColors.onSurface,
    letterSpacing: 0.15,
    height: 1.5,
  );
  
  // Arabic Text Styles
  static TextStyle get arabicBodyLarge => _baseArabicTextStyle.copyWith(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.5,
    height: 1.5,
  );
  
  static TextStyle get arabicBodyMedium => _baseArabicTextStyle.copyWith(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.25,
    height: 1.43,
  );
  
  static TextStyle get arabicTitleLarge => _baseArabicTextStyle.copyWith(
    fontSize: 22,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
    height: 1.27,
  );
  
  static TextStyle get arabicTitleMedium => _baseArabicTextStyle.copyWith(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.15,
    height: 1.5,
  );
  
  // Utility Methods
  static TextStyle withColor(TextStyle style, Color color) {
    return style.copyWith(color: color);
  }
  
  static TextStyle withWeight(TextStyle style, FontWeight weight) {
    return style.copyWith(fontWeight: weight);
  }
  
  static TextStyle withSize(TextStyle style, double size) {
    return style.copyWith(fontSize: size);
  }
  
  static TextStyle getStatusStyle(String status) {
    final baseStyle = AppTextStyles.status;
    final color = AppColors.getStatusColor(status);
    return baseStyle.copyWith(color: color);
  }
  
  static TextStyle getCategoryStyle(String category) {
    final baseStyle = AppTextStyles.category;
    final color = AppColors.getCategoryColor(category);
    return baseStyle.copyWith(color: color);
  }
}
