import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants/app_constants.dart';
import 'colors.dart';
import 'text_styles.dart';

class AppTheme {
  // Light Theme
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: _lightColorScheme,
      textTheme: _lightTextTheme,
      primaryTextTheme: _lightTextTheme,
      fontFamily: AppTextStyles.primaryFontFamily,
      
      // App Bar Theme
      appBarTheme: _lightAppBarTheme,
      
      // Bottom Navigation Bar Theme
      bottomNavigationBarTheme: _lightBottomNavigationBarTheme,
      
      // Card Theme
      cardTheme: _lightCardTheme,
      
      // Elevated Button Theme
      elevatedButtonTheme: _lightElevatedButtonTheme,
      
      // Outlined Button Theme
      outlinedButtonTheme: _lightOutlinedButtonTheme,
      
      // Text Button Theme
      textButtonTheme: _lightTextButtonTheme,
      
      // Input Decoration Theme
      inputDecorationTheme: _lightInputDecorationTheme,
      
      // Chip Theme
      chipTheme: _lightChipTheme,
      
      // Dialog Theme
      dialogTheme: _lightDialogTheme,
      
      // Bottom Sheet Theme
      bottomSheetTheme: _lightBottomSheetTheme,
      
      // Floating Action Button Theme
      floatingActionButtonTheme: _lightFloatingActionButtonTheme,
      
      // Divider Theme
      dividerTheme: _lightDividerTheme,
      
      // Icon Theme
      iconTheme: _lightIconTheme,
      
      // Progress Indicator Theme
      progressIndicatorTheme: _lightProgressIndicatorTheme,
      
      // Switch Theme
      switchTheme: _lightSwitchTheme,
      
      // Checkbox Theme
      checkboxTheme: _lightCheckboxTheme,
      
      // Radio Theme
      radioTheme: _lightRadioTheme,
      
      // Slider Theme
      sliderTheme: _lightSliderTheme,
      
      // Tab Bar Theme
      tabBarTheme: _lightTabBarTheme,
      
      // Tooltip Theme
      tooltipTheme: _lightTooltipTheme,
      
      // Snackbar Theme
      snackBarTheme: _lightSnackBarTheme,
      
      // Page Transitions Theme
      pageTransitionsTheme: _pageTransitionsTheme,
      
      // System UI Overlay Style
      // systemOverlayStyle: _lightSystemOverlayStyle,
    );
  }
  
  // Dark Theme
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: _darkColorScheme,
      textTheme: _darkTextTheme,
      primaryTextTheme: _darkTextTheme,
      fontFamily: AppTextStyles.primaryFontFamily,
      
      // App Bar Theme
      appBarTheme: _darkAppBarTheme,
      
      // Bottom Navigation Bar Theme
      bottomNavigationBarTheme: _darkBottomNavigationBarTheme,
      
      // Card Theme
      cardTheme: _darkCardTheme,
      
      // Elevated Button Theme
      elevatedButtonTheme: _darkElevatedButtonTheme,
      
      // Outlined Button Theme
      outlinedButtonTheme: _darkOutlinedButtonTheme,
      
      // Text Button Theme
      textButtonTheme: _darkTextButtonTheme,
      
      // Input Decoration Theme
      inputDecorationTheme: _darkInputDecorationTheme,
      
      // Chip Theme
      chipTheme: _darkChipTheme,
      
      // Dialog Theme
      dialogTheme: _darkDialogTheme,
      
      // Bottom Sheet Theme
      bottomSheetTheme: _darkBottomSheetTheme,
      
      // Floating Action Button Theme
      floatingActionButtonTheme: _darkFloatingActionButtonTheme,
      
      // Divider Theme
      dividerTheme: _darkDividerTheme,
      
      // Icon Theme
      iconTheme: _darkIconTheme,
      
      // Progress Indicator Theme
      progressIndicatorTheme: _darkProgressIndicatorTheme,
      
      // Switch Theme
      switchTheme: _darkSwitchTheme,
      
      // Checkbox Theme
      checkboxTheme: _darkCheckboxTheme,
      
      // Radio Theme
      radioTheme: _darkRadioTheme,
      
      // Slider Theme
      sliderTheme: _darkSliderTheme,
      
      // Tab Bar Theme
      tabBarTheme: _darkTabBarTheme,
      
      // Tooltip Theme
      tooltipTheme: _darkTooltipTheme,
      
      // Snackbar Theme
      snackBarTheme: _darkSnackBarTheme,
      
      // Page Transitions Theme
      pageTransitionsTheme: _pageTransitionsTheme,
      
      // System UI Overlay Style
      // systemOverlayStyle: _darkSystemOverlayStyle,
    );
  }
  
  // Color Schemes
  static ColorScheme get _lightColorScheme {
    return const ColorScheme(
      brightness: Brightness.light,
      primary: AppColors.primary,
      onPrimary: AppColors.onPrimary,
      primaryContainer: AppColors.primaryContainer,
      onPrimaryContainer: AppColors.primary,
      secondary: AppColors.secondary,
      onSecondary: AppColors.onSecondary,
      secondaryContainer: AppColors.secondaryContainer,
      onSecondaryContainer: AppColors.secondary,
      tertiary: AppColors.accent,
      onTertiary: AppColors.onPrimary,
      tertiaryContainer: AppColors.accentContainer,
      onTertiaryContainer: AppColors.accent,
      error: AppColors.error,
      onError: AppColors.onPrimary,
      errorContainer: AppColors.errorLight,
      onErrorContainer: AppColors.error,
      background: AppColors.background,
      onBackground: AppColors.onBackground,
      surface: AppColors.surface,
      onSurface: AppColors.onSurface,
      surfaceVariant: AppColors.surfaceVariant,
      onSurfaceVariant: AppColors.onSurfaceVariant,
      outline: AppColors.borderMedium,
      outlineVariant: AppColors.borderLight,
      shadow: AppColors.shadowLight,
      scrim: AppColors.overlayLight,
      inverseSurface: AppColors.surfaceDark,
      onInverseSurface: AppColors.onSurface,
      inversePrimary: AppColors.primaryLight,
      surfaceTint: AppColors.primary,
    );
  }
  
  static ColorScheme get _darkColorScheme {
    return const ColorScheme(
      brightness: Brightness.dark,
      primary: AppColors.primaryLight,
      onPrimary: AppColors.onPrimary,
      primaryContainer: AppColors.primary,
      onPrimaryContainer: AppColors.primaryContainer,
      secondary: AppColors.secondaryLight,
      onSecondary: AppColors.onSecondary,
      secondaryContainer: AppColors.secondary,
      onSecondaryContainer: AppColors.secondaryContainer,
      tertiary: AppColors.accentLight,
      onTertiary: AppColors.onPrimary,
      tertiaryContainer: AppColors.accent,
      onTertiaryContainer: AppColors.accentContainer,
      error: AppColors.errorLight,
      onError: AppColors.onPrimary,
      errorContainer: AppColors.error,
      onErrorContainer: AppColors.errorLight,
      background: AppColors.darkBackground,
      onBackground: AppColors.darkOnSurface,
      surface: AppColors.darkSurface,
      onSurface: AppColors.darkOnSurface,
      surfaceVariant: AppColors.darkSurfaceVariant,
      onSurfaceVariant: AppColors.darkOnSurfaceVariant,
      outline: AppColors.darkBorder,
      outlineVariant: AppColors.darkBorder,
      shadow: AppColors.shadowDark,
      scrim: AppColors.overlayDark,
      inverseSurface: AppColors.surface,
      onInverseSurface: AppColors.onSurface,
      inversePrimary: AppColors.primary,
      surfaceTint: AppColors.primaryLight,
    );
  }
  
  // Text Themes
  static TextTheme get _lightTextTheme {
    return TextTheme(
      displayLarge: AppTextStyles.displayLarge,
      displayMedium: AppTextStyles.displayMedium,
      displaySmall: AppTextStyles.displaySmall,
      headlineLarge: AppTextStyles.headlineLarge,
      headlineMedium: AppTextStyles.headlineMedium,
      headlineSmall: AppTextStyles.headlineSmall,
      titleLarge: AppTextStyles.titleLarge,
      titleMedium: AppTextStyles.titleMedium,
      titleSmall: AppTextStyles.titleSmall,
      bodyLarge: AppTextStyles.bodyLarge,
      bodyMedium: AppTextStyles.bodyMedium,
      bodySmall: AppTextStyles.bodySmall,
      labelLarge: AppTextStyles.labelLarge,
      labelMedium: AppTextStyles.labelMedium,
      labelSmall: AppTextStyles.labelSmall,
    );
  }
  
  static TextTheme get _darkTextTheme {
    return TextTheme(
      displayLarge: AppTextStyles.displayLarge.copyWith(color: AppColors.darkOnSurface),
      displayMedium: AppTextStyles.displayMedium.copyWith(color: AppColors.darkOnSurface),
      displaySmall: AppTextStyles.displaySmall.copyWith(color: AppColors.darkOnSurface),
      headlineLarge: AppTextStyles.headlineLarge.copyWith(color: AppColors.darkOnSurface),
      headlineMedium: AppTextStyles.headlineMedium.copyWith(color: AppColors.darkOnSurface),
      headlineSmall: AppTextStyles.headlineSmall.copyWith(color: AppColors.darkOnSurface),
      titleLarge: AppTextStyles.titleLarge.copyWith(color: AppColors.darkOnSurface),
      titleMedium: AppTextStyles.titleMedium.copyWith(color: AppColors.darkOnSurface),
      titleSmall: AppTextStyles.titleSmall.copyWith(color: AppColors.darkOnSurface),
      bodyLarge: AppTextStyles.bodyLarge.copyWith(color: AppColors.darkOnSurface),
      bodyMedium: AppTextStyles.bodyMedium.copyWith(color: AppColors.darkOnSurface),
      bodySmall: AppTextStyles.bodySmall.copyWith(color: AppColors.darkOnSurfaceVariant),
      labelLarge: AppTextStyles.labelLarge.copyWith(color: AppColors.darkOnSurface),
      labelMedium: AppTextStyles.labelMedium.copyWith(color: AppColors.darkOnSurfaceVariant),
      labelSmall: AppTextStyles.labelSmall.copyWith(color: AppColors.darkOnSurfaceVariant),
    );
  }
  
  // App Bar Themes
  static AppBarTheme get _lightAppBarTheme {
    return AppBarTheme(
      backgroundColor: AppColors.surface,
      foregroundColor: AppColors.onSurface,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: AppTextStyles.titleLarge.copyWith(color: AppColors.onSurface),
      // systemOverlayStyle: _lightSystemOverlayStyle,
      iconTheme: const IconThemeData(color: AppColors.onSurface),
      actionsIconTheme: const IconThemeData(color: AppColors.onSurface),
    );
  }
  
  static AppBarTheme get _darkAppBarTheme {
    return AppBarTheme(
      backgroundColor: AppColors.darkSurface,
      foregroundColor: AppColors.darkOnSurface,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: AppTextStyles.titleLarge.copyWith(color: AppColors.darkOnSurface),
      // systemOverlayStyle: _darkSystemOverlayStyle,
      iconTheme: const IconThemeData(color: AppColors.darkOnSurface),
      actionsIconTheme: const IconThemeData(color: AppColors.darkOnSurface),
    );
  }
  
  // Bottom Navigation Bar Themes
  static BottomNavigationBarThemeData get _lightBottomNavigationBarTheme {
    return const BottomNavigationBarThemeData(
      // backgroundColor: AppColors.surface,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: AppColors.onSurfaceVariant,
      type: BottomNavigationBarType.fixed,
      elevation: 8,
    );
  }
  
  static BottomNavigationBarThemeData get _darkBottomNavigationBarTheme {
    return const BottomNavigationBarThemeData(
      // backgroundColor: AppColors.darkSurface,
      selectedItemColor: AppColors.primaryLight,
      unselectedItemColor: AppColors.darkOnSurfaceVariant,
      type: BottomNavigationBarType.fixed,
      elevation: 8,
    );
  }
  
  // Card Themes
  static CardThemeData get _lightCardTheme {
    return CardThemeData(
      color: AppColors.surface,
      elevation: AppConstants.smElevation,
      shadowColor: AppColors.shadowLight,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.mdRadius),
      ),
      margin: const EdgeInsets.all(AppConstants.smSpacing),
    );
  }
  
  static CardThemeData get _darkCardTheme {
    return CardThemeData(
      color: AppColors.darkSurface,
      elevation: AppConstants.smElevation,
      shadowColor: AppColors.shadowDark,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.mdRadius),
      ),
      margin: const EdgeInsets.all(AppConstants.smSpacing),
    );
  }
  
  // Button Themes
  static ElevatedButtonThemeData get _lightElevatedButtonTheme {
    return ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.onPrimary,
        elevation: AppConstants.smElevation,
        shadowColor: AppColors.shadowLight,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConstants.mdRadius),
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: AppConstants.lgSpacing,
          vertical: AppConstants.mdSpacing,
        ),
        textStyle: AppTextStyles.button,
      ),
    );
  }
  
  static ElevatedButtonThemeData get _darkElevatedButtonTheme {
    return ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primaryLight,
        foregroundColor: AppColors.onPrimary,
        elevation: AppConstants.smElevation,
        shadowColor: AppColors.shadowDark,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConstants.mdRadius),
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: AppConstants.lgSpacing,
          vertical: AppConstants.mdSpacing,
        ),
        textStyle: AppTextStyles.button,
      ),
    );
  }
  
  static OutlinedButtonThemeData get _lightOutlinedButtonTheme {
    return OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primary,
        side: const BorderSide(color: AppColors.primary),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConstants.mdRadius),
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: AppConstants.lgSpacing,
          vertical: AppConstants.mdSpacing,
        ),
        textStyle: AppTextStyles.button,
      ),
    );
  }
  
  static OutlinedButtonThemeData get _darkOutlinedButtonTheme {
    return OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primaryLight,
        side: const BorderSide(color: AppColors.primaryLight),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConstants.mdRadius),
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: AppConstants.lgSpacing,
          vertical: AppConstants.mdSpacing,
        ),
        textStyle: AppTextStyles.button,
      ),
    );
  }
  
  static TextButtonThemeData get _lightTextButtonTheme {
    return TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.primary,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConstants.mdRadius),
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: AppConstants.mdSpacing,
          vertical: AppConstants.smSpacing,
        ),
        textStyle: AppTextStyles.buttonSmall,
      ),
    );
  }
  
  static TextButtonThemeData get _darkTextButtonTheme {
    return TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.primaryLight,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConstants.mdRadius),
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: AppConstants.mdSpacing,
          vertical: AppConstants.smSpacing,
        ),
        textStyle: AppTextStyles.buttonSmall,
      ),
    );
  }
  
  // Input Decoration Themes
  static InputDecorationTheme get _lightInputDecorationTheme {
    return InputDecorationTheme(
      filled: true,
      fillColor: AppColors.surfaceVariant,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppConstants.mdRadius),
        borderSide: const BorderSide(color: AppColors.borderLight),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppConstants.mdRadius),
        borderSide: const BorderSide(color: AppColors.borderLight),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppConstants.mdRadius),
        borderSide: const BorderSide(color: AppColors.primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppConstants.mdRadius),
        borderSide: const BorderSide(color: AppColors.error),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppConstants.mdRadius),
        borderSide: const BorderSide(color: AppColors.error, width: 2),
      ),
      labelStyle: AppTextStyles.inputLabel,
      hintStyle: AppTextStyles.inputHint,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: AppConstants.mdSpacing,
        vertical: AppConstants.mdSpacing,
      ),
    );
  }
  
  static InputDecorationTheme get _darkInputDecorationTheme {
    return InputDecorationTheme(
      filled: true,
      fillColor: AppColors.darkSurfaceVariant,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppConstants.mdRadius),
        borderSide: const BorderSide(color: AppColors.darkBorder),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppConstants.mdRadius),
        borderSide: const BorderSide(color: AppColors.darkBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppConstants.mdRadius),
        borderSide: const BorderSide(color: AppColors.primaryLight, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppConstants.mdRadius),
        borderSide: const BorderSide(color: AppColors.errorLight),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppConstants.mdRadius),
        borderSide: const BorderSide(color: AppColors.errorLight, width: 2),
      ),
      labelStyle: AppTextStyles.inputLabel.copyWith(color: AppColors.darkOnSurface),
      hintStyle: AppTextStyles.inputHint.copyWith(color: AppColors.darkOnSurfaceVariant),
      contentPadding: const EdgeInsets.symmetric(
        horizontal: AppConstants.mdSpacing,
        vertical: AppConstants.mdSpacing,
      ),
    );
  }
  
  // Other Theme Components
  static ChipThemeData get _lightChipTheme {
    return ChipThemeData(
      backgroundColor: AppColors.surfaceVariant,
      selectedColor: AppColors.primaryContainer,
      disabledColor: AppColors.disabledContainer,
      labelStyle: AppTextStyles.labelMedium,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.lgRadius),
      ),
    );
  }
  
  static ChipThemeData get _darkChipTheme {
    return ChipThemeData(
      backgroundColor: AppColors.darkSurfaceVariant,
      selectedColor: AppColors.primary,
      disabledColor: AppColors.disabledContainer,
      labelStyle: AppTextStyles.labelMedium.copyWith(color: AppColors.darkOnSurface),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.lgRadius),
      ),
    );
  }
  
  static DialogThemeData get _lightDialogTheme {
    return DialogThemeData(
      backgroundColor: AppColors.surface,
      elevation: AppConstants.lgElevation,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.lgRadius),
      ),
      titleTextStyle: AppTextStyles.dialogTitle,
      contentTextStyle: AppTextStyles.dialogContent,
    );
  }
  
  static DialogThemeData get _darkDialogTheme {
    return DialogThemeData(
      backgroundColor: AppColors.darkSurface,
      elevation: AppConstants.lgElevation,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.lgRadius),
      ),
      titleTextStyle: AppTextStyles.dialogTitle.copyWith(color: AppColors.darkOnSurface),
      contentTextStyle: AppTextStyles.dialogContent.copyWith(color: AppColors.darkOnSurface),
    );
  }
  
  static BottomSheetThemeData get _lightBottomSheetTheme {
    return BottomSheetThemeData(
      backgroundColor: AppColors.surface,
      elevation: AppConstants.lgElevation,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(AppConstants.lgRadius),
        ),
      ),
    );
  }
  
  static BottomSheetThemeData get _darkBottomSheetTheme {
    return BottomSheetThemeData(
      backgroundColor: AppColors.darkSurface,
      elevation: AppConstants.lgElevation,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(AppConstants.lgRadius),
        ),
      ),
    );
  }
  
  static FloatingActionButtonThemeData get _lightFloatingActionButtonTheme {
    return const FloatingActionButtonThemeData(
      backgroundColor: AppColors.primary,
      foregroundColor: AppColors.onPrimary,
      elevation: AppConstants.mdElevation,
    );
  }
  
  static FloatingActionButtonThemeData get _darkFloatingActionButtonTheme {
    return const FloatingActionButtonThemeData(
      backgroundColor: AppColors.primaryLight,
      foregroundColor: AppColors.onPrimary,
      elevation: AppConstants.mdElevation,
    );
  }
  
  static DividerThemeData get _lightDividerTheme {
    return const DividerThemeData(
      color: AppColors.borderLight,
      thickness: 1,
      space: 1,
    );
  }
  
  static DividerThemeData get _darkDividerTheme {
    return const DividerThemeData(
      color: AppColors.darkBorder,
      thickness: 1,
      space: 1,
    );
  }
  
  static IconThemeData get _lightIconTheme {
    return const IconThemeData(
      color: AppColors.onSurface,
      size: 24,
    );
  }
  
  static IconThemeData get _darkIconTheme {
    return const IconThemeData(
      color: AppColors.darkOnSurface,
      size: 24,
    );
  }
  
  static ProgressIndicatorThemeData get _lightProgressIndicatorTheme {
    return const ProgressIndicatorThemeData(
      color: AppColors.primary,
      linearTrackColor: AppColors.progressBackground,
      circularTrackColor: AppColors.progressBackground,
    );
  }
  
  static ProgressIndicatorThemeData get _darkProgressIndicatorTheme {
    return const ProgressIndicatorThemeData(
      color: AppColors.primaryLight,
      linearTrackColor: AppColors.progressBackground,
      circularTrackColor: AppColors.progressBackground,
    );
  }
  
  static SwitchThemeData get _lightSwitchTheme {
    return SwitchThemeData(
      thumbColor: MaterialStateProperty.resolveWith((states) {
        if (states.contains(MaterialState.selected)) {
          return AppColors.primary;
        }
        return AppColors.onSurfaceVariant;
      }),
      trackColor: MaterialStateProperty.resolveWith((states) {
        if (states.contains(MaterialState.selected)) {
          return AppColors.primaryContainer;
        }
        return AppColors.surfaceVariant;
      }),
    );
  }
  
  static SwitchThemeData get _darkSwitchTheme {
    return SwitchThemeData(
      thumbColor: MaterialStateProperty.resolveWith((states) {
        if (states.contains(MaterialState.selected)) {
          return AppColors.primaryLight;
        }
        return AppColors.darkOnSurfaceVariant;
      }),
      trackColor: MaterialStateProperty.resolveWith((states) {
        if (states.contains(MaterialState.selected)) {
          return AppColors.primary;
        }
        return AppColors.darkSurfaceVariant;
      }),
    );
  }
  
  static CheckboxThemeData get _lightCheckboxTheme {
    return CheckboxThemeData(
      fillColor: MaterialStateProperty.resolveWith((states) {
        if (states.contains(MaterialState.selected)) {
          return AppColors.primary;
        }
        return Colors.transparent;
      }),
      checkColor: MaterialStateProperty.all(AppColors.onPrimary),
      side: const BorderSide(color: AppColors.borderMedium),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.xsRadius),
      ),
    );
  }
  
  static CheckboxThemeData get _darkCheckboxTheme {
    return CheckboxThemeData(
      fillColor: MaterialStateProperty.resolveWith((states) {
        if (states.contains(MaterialState.selected)) {
          return AppColors.primaryLight;
        }
        return Colors.transparent;
      }),
      checkColor: MaterialStateProperty.all(AppColors.onPrimary),
      side: const BorderSide(color: AppColors.darkBorder),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.xsRadius),
      ),
    );
  }
  
  static RadioThemeData get _lightRadioTheme {
    return RadioThemeData(
      fillColor: MaterialStateProperty.resolveWith((states) {
        if (states.contains(MaterialState.selected)) {
          return AppColors.primary;
        }
        return AppColors.borderMedium;
      }),
    );
  }
  
  static RadioThemeData get _darkRadioTheme {
    return RadioThemeData(
      fillColor: MaterialStateProperty.resolveWith((states) {
        if (states.contains(MaterialState.selected)) {
          return AppColors.primaryLight;
        }
        return AppColors.darkBorder;
      }),
    );
  }
  
  static SliderThemeData get _lightSliderTheme {
    return SliderThemeData(
      activeTrackColor: AppColors.primary,
      inactiveTrackColor: AppColors.surfaceVariant,
      thumbColor: AppColors.primary,
      overlayColor: AppColors.primary.withOpacity(0.12),
    );
  }
  
  static SliderThemeData get _darkSliderTheme {
    return SliderThemeData(
      activeTrackColor: AppColors.primaryLight,
      inactiveTrackColor: AppColors.darkSurfaceVariant,
      thumbColor: AppColors.primaryLight,
      overlayColor: AppColors.primaryLight.withOpacity(0.12),
    );
  }
  
  static TabBarThemeData get _lightTabBarTheme {
    return TabBarThemeData(
      labelColor: AppColors.primary,
      unselectedLabelColor: AppColors.onSurfaceVariant,
      indicatorColor: AppColors.primary,
      labelStyle: AppTextStyles.labelLarge,
      unselectedLabelStyle: AppTextStyles.labelLarge,
    );
  }
  
  static TabBarThemeData get _darkTabBarTheme {
    return TabBarThemeData(
      labelColor: AppColors.primaryLight,
      unselectedLabelColor: AppColors.darkOnSurfaceVariant,
      indicatorColor: AppColors.primaryLight,
      labelStyle: AppTextStyles.labelLarge.copyWith(color: AppColors.primaryLight),
      unselectedLabelStyle: AppTextStyles.labelLarge.copyWith(color: AppColors.darkOnSurfaceVariant),
    );
  }
  
  static TooltipThemeData get _lightTooltipTheme {
    return TooltipThemeData(
      decoration: BoxDecoration(
        color: AppColors.surfaceDark,
        borderRadius: BorderRadius.circular(AppConstants.smRadius),
      ),
      textStyle: AppTextStyles.bodySmall.copyWith(color: AppColors.onSurface),
    );
  }
  
  static TooltipThemeData get _darkTooltipTheme {
    return TooltipThemeData(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppConstants.smRadius),
      ),
      textStyle: AppTextStyles.bodySmall.copyWith(color: AppColors.onSurface),
    );
  }
  
  static SnackBarThemeData get _lightSnackBarTheme {
    return SnackBarThemeData(
      backgroundColor: AppColors.surfaceDark,
      contentTextStyle: AppTextStyles.bodyMedium.copyWith(color: AppColors.onSurface),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.mdRadius),
      ),
      behavior: SnackBarBehavior.floating,
    );
  }
  
  static SnackBarThemeData get _darkSnackBarTheme {
    return SnackBarThemeData(
      backgroundColor: AppColors.surface,
      contentTextStyle: AppTextStyles.bodyMedium.copyWith(color: AppColors.onSurface),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppConstants.mdRadius),
      ),
      behavior: SnackBarBehavior.floating,
    );
  }
  
  static PageTransitionsTheme get _pageTransitionsTheme {
    return const PageTransitionsTheme(
      builders: {
        TargetPlatform.android: CupertinoPageTransitionsBuilder(),
        TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
      },
    );
  }
  
  static SystemUiOverlayStyle get _lightSystemOverlayStyle {
    return const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
      systemNavigationBarColor: AppColors.surface,
      systemNavigationBarIconBrightness: Brightness.dark,
    );
  }
  
  static SystemUiOverlayStyle get _darkSystemOverlayStyle {
    return const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      statusBarBrightness: Brightness.dark,
      systemNavigationBarColor: AppColors.darkSurface,
      systemNavigationBarIconBrightness: Brightness.light,
    );
  }
}
