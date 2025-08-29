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
import 'features/booking/screens/booking_screen.dart';
import 'features/vendor/screens/vendor_dashboard_screen.dart';
import 'features/profile/screens/profile_screen.dart';
import 'features/social/screens/social_screen.dart';

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
    
    // Main app routes
    ShellRoute(
      builder: (context, state, child) => MainScaffold(child: child),
      routes: [
        // Home/Discovery
        GoRoute(
          path: '/home',
          builder: (context, state) => const HomeScreen(),
        ),
        
        // Booking
        GoRoute(
          path: '/booking',
          builder: (context, state) => const BookingScreen(),
        ),
        
        // Vendor Dashboard
        GoRoute(
          path: '/vendor',
          builder: (context, state) => const VendorDashboardScreen(),
        ),
        
        // Profile
        GoRoute(
          path: '/profile',
          builder: (context, state) => const ProfileScreen(),
        ),
        
        // Social
        GoRoute(
          path: '/social',
          builder: (context, state) => const SocialScreen(),
        ),
      ],
    ),
  ],
  errorBuilder: (context, state) => ErrorScreen(
    error: state.error?.toString() ?? 'Unknown error',
    onRetry: () => context.go('/'),
  ),
);

// Main scaffold with bottom navigation
class MainScaffold extends ConsumerStatefulWidget {
  final Widget child;
  
  const MainScaffold({
    super.key,
    required this.child,
  });

  @override
  ConsumerState<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends ConsumerState<MainScaffold> {
  int _currentIndex = 0;
  
  final List<String> _routes = [
    '/home',
    '/booking',
    '/vendor',
    '/profile',
    '/social',
  ];
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
          context.go(_routes[index]);
        },
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today_outlined),
            activeIcon: Icon(Icons.calendar_today),
            label: 'Bookings',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.store_outlined),
            activeIcon: Icon(Icons.store),
            label: 'Vendor',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profile',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people_outline),
            activeIcon: Icon(Icons.people),
            label: 'Social',
          ),
        ],
      ),
    );
  }
}

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
