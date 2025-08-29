import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
// Core imports
import 'core/theme/app_theme.dart';
import 'core/constants/app_constants.dart';

// Feature imports
import 'features/auth/screens/splash_screen.dart';
import 'features/auth/screens/onboarding_screen.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/auth/screens/register_screen.dart';
import 'features/discovery/screens/home_screen.dart';
import 'features/discovery/screens/map_screen.dart';
import 'features/discovery/screens/activity_detail_screen.dart';
import 'features/booking/screens/booking_screen.dart';
import 'features/payment/screens/payment_screen.dart';
import 'features/profile/screens/profile_screen.dart';
import 'features/notifications/screens/notification_screen.dart';
import 'features/offline/screens/offline_settings_screen.dart';
import 'features/auth/screens/forgot_password_screen.dart';

// Shared imports
import 'shared/widgets/loading/loading_screen.dart';
import 'shared/widgets/common/error_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  runApp(
    const ProviderScope(
      child: LudusApp(),
    ),
  );
}

class LudusApp extends ConsumerWidget {
  const LudusApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system, // Auto-detect system theme
      routerConfig: _router,
      builder: (context, child) {
        // Add global error handling
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(textScaleFactor: 1.0),
          child: child!,
        );
      },
    );
  }
}

// GoRouter configuration
final _router = GoRouter(
  initialLocation: '/',
  routes: [
    // Splash screen
    GoRoute(
      path: '/',
      builder: (context, state) => const SplashScreen(),
    ),
    
    // Onboarding
    GoRoute(
      path: '/onboarding',
      builder: (context, state) => const OnboardingScreen(),
    ),
    
    // Authentication
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/register',
      builder: (context, state) => const RegisterScreen(),
    ),
    GoRoute(
      path: '/forgot-password',
      builder: (context, state) => const ForgotPasswordScreen(),
    ),
    
    // Main app routes
    GoRoute(
      path: '/home',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/map',
      builder: (context, state) => const MapScreen(),
    ),
    GoRoute(
      path: '/activity/:id',
      builder: (context, state) {
        final activityId = state.pathParameters['id']!;
        return ActivityDetailScreen(activityId: activityId);
      },
    ),
    GoRoute(
      path: '/booking/:id',
      builder: (context, state) {
        final activityId = state.pathParameters['id']!;
        return BookingScreen(activityId: activityId);
      },
    ),
    GoRoute(
      path: '/payment/:bookingId/:amount',
      builder: (context, state) {
        final bookingId = state.pathParameters['bookingId']!;
        final amount = double.parse(state.pathParameters['amount']!);
        return PaymentScreen(bookingId: bookingId, amount: amount);
      },
    ),
    GoRoute(
      path: '/profile',
      builder: (context, state) => ProfileScreen(),
    ),
    GoRoute(
      path: '/notifications',
      builder: (context, state) => NotificationScreen(),
    ),
    GoRoute(
      path: '/offline-settings',
      builder: (context, state) => OfflineSettingsScreen(),
    ),
  ],
  errorBuilder: (context, state) => ErrorScreen(
    error: state.error?.toString() ?? 'Unknown error',
    onRetry: () => context.go('/'),
  ),
);



// Global loading screen
class GlobalLoadingScreen extends StatelessWidget {
  const GlobalLoadingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const LoadingScreen(
      message: 'Loading LUDUS...',
    );
  }
}

// Global error screen
class GlobalErrorScreen extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;
  
  const GlobalErrorScreen({
    super.key,
    required this.message,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return ErrorScreen(
      error: message,
      onRetry: onRetry,
    );
  }
}
