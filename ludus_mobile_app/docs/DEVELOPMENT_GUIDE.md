# LUDUS Mobile App - Development Guide

## 🎯 Development Philosophy

The LUDUS mobile app follows a clean, maintainable, and scalable development approach. This guide ensures consistency across the development team and high code quality.

## 📋 Coding Standards

### Dart/Flutter Conventions

#### Naming Conventions
```dart
// Classes and enums: PascalCase
class UserProfile {}
enum BookingStatus {}

// Variables and functions: camelCase
String userName = 'John';
void getUserData() {}

// Constants: SCREAMING_SNAKE_CASE
const String API_BASE_URL = 'https://api.ludus.com';

// Private members: underscore prefix
class _PrivateClass {}
String _privateVariable = '';
```

#### File Naming
- **Screens**: `snake_case_screen.dart`
- **Widgets**: `snake_case_widget.dart`
- **Services**: `snake_case_service.dart`
- **Models**: `snake_case_model.dart`
- **Providers**: `snake_case_provider.dart`

### Code Organization

#### Import Order
```dart
// 1. Dart imports
import 'dart:async';
import 'dart:io';

// 2. Flutter imports
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// 3. Third-party packages
import 'package:riverpod/riverpod.dart';
import 'package:go_router/go_router.dart';

// 4. Local imports
import '../core/constants/app_constants.dart';
import '../shared/widgets/common/loading_widget.dart';
```

#### Class Structure
```dart
class ExampleClass {
  // 1. Static constants
  static const String _defaultValue = 'default';
  
  // 2. Instance variables
  final String _privateField;
  String publicField;
  
  // 3. Constructor
  ExampleClass({
    required this.publicField,
    String? privateField,
  }) : _privateField = privateField ?? _defaultValue;
  
  // 4. Getters and setters
  String get privateField => _privateField;
  
  // 5. Public methods
  void publicMethod() {
    _privateMethod();
  }
  
  // 6. Private methods
  void _privateMethod() {
    // Implementation
  }
}
```

## 🏗️ Architecture Patterns

### Feature-Based Development

Each feature should be self-contained with the following structure:

```
features/auth/
├── models/
│   ├── user_model.dart
│   └── auth_state.dart
├── providers/
│   └── auth_provider.dart
├── services/
│   └── auth_service.dart
└── screens/
    ├── login_screen.dart
    └── register_screen.dart
```

### State Management with Riverpod

#### Provider Best Practices
```dart
// 1. Define state class
class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;
  
  const AuthState({
    this.user,
    this.isLoading = false,
    this.error,
  });
  
  AuthState copyWith({
    User? user,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

// 2. Create notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  
  AuthNotifier(this._authService) : super(const AuthState());
  
  Future<void> signIn(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final user = await _authService.signIn(email, password);
      state = state.copyWith(user: user, isLoading: false);
    } catch (e) {
      state = state.copyWith(
        error: e.toString(),
        isLoading: false,
      );
    }
  }
}

// 3. Create provider
final authNotifierProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthNotifier(authService);
});
```

### Widget Development

#### Widget Structure
```dart
class CustomWidget extends StatelessWidget {
  final String title;
  final VoidCallback? onTap;
  
  const CustomWidget({
    super.key,
    required this.title,
    this.onTap,
  });
  
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppConstants.mdSpacing),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppConstants.mdRadius),
        ),
        child: Text(
          title,
          style: AppTextStyles.bodyMedium,
        ),
      ),
    );
  }
}
```

#### Responsive Design
```dart
class ResponsiveWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth > 600) {
          return _buildTabletLayout();
        } else {
          return _buildMobileLayout();
        }
      },
    );
  }
  
  Widget _buildMobileLayout() {
    return Column(
      children: [
        // Mobile-specific layout
      ],
    );
  }
  
  Widget _buildTabletLayout() {
    return Row(
      children: [
        // Tablet-specific layout
      ],
    );
  }
}
```

## 🎨 UI/UX Guidelines

### Design System Usage

#### Colors
```dart
// Use predefined colors from AppColors
Container(
  color: AppColors.primary,
  child: Text(
    'Primary Text',
    style: TextStyle(color: AppColors.onPrimary),
  ),
)
```

#### Typography
```dart
// Use predefined text styles
Text(
  'Heading',
  style: AppTextStyles.headlineMedium,
)

Text(
  'Body text',
  style: AppTextStyles.bodyMedium,
)
```

#### Spacing
```dart
// Use predefined spacing constants
Container(
  margin: const EdgeInsets.all(AppConstants.mdSpacing),
  padding: const EdgeInsets.symmetric(
    horizontal: AppConstants.lgSpacing,
    vertical: AppConstants.smSpacing,
  ),
)
```

### Component Guidelines

#### Loading States
```dart
// Always provide loading states
Widget build(BuildContext context) {
  return ref.watch(authNotifierProvider).when(
    data: (user) => UserProfileWidget(user: user),
    loading: () => const LoadingWidget(),
    error: (error, stack) => ErrorWidget(error: error),
  );
}
```

#### Error Handling
```dart
// Provide meaningful error messages
try {
  await performAction();
} catch (e) {
  if (e is NetworkException) {
    showErrorSnackBar('Please check your internet connection');
  } else if (e is AuthException) {
    showErrorSnackBar('Authentication failed. Please try again.');
  } else {
    showErrorSnackBar('An unexpected error occurred');
  }
}
```

## 🔧 Development Workflow

### Git Workflow

#### Branch Naming
- **Feature branches**: `feature/feature-name`
- **Bug fixes**: `fix/bug-description`
- **Hotfixes**: `hotfix/urgent-fix`
- **Releases**: `release/version-number`

#### Commit Messages
```
type(scope): description

feat(auth): add biometric authentication
fix(booking): resolve payment processing issue
docs(readme): update installation instructions
style(ui): improve button styling
refactor(api): simplify API service structure
test(auth): add unit tests for auth service
```

### Code Review Process

#### Review Checklist
- [ ] Code follows naming conventions
- [ ] Proper error handling implemented
- [ ] Loading states included
- [ ] Responsive design considered
- [ ] Unit tests added/updated
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Proper null safety usage

#### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Widget tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

## 🧪 Testing Guidelines

### Unit Testing

#### Test Structure
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';

void main() {
  group('AuthService', () {
    late AuthService authService;
    late MockApiClient mockApiClient;
    
    setUp(() {
      mockApiClient = MockApiClient();
      authService = AuthService(apiClient: mockApiClient);
    });
    
    test('should return user when login is successful', () async {
      // Arrange
      when(mockApiClient.post('/auth/login', any))
          .thenAnswer((_) async => {'user': {'id': '1', 'name': 'John'}});
      
      // Act
      final result = await authService.login('email', 'password');
      
      // Assert
      expect(result.name, 'John');
      verify(mockApiClient.post('/auth/login', any)).called(1);
    });
  });
}
```

#### Widget Testing
```dart
testWidgets('should show loading state', (WidgetTester tester) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        authNotifierProvider.overrideWith(
          (ref) => MockAuthNotifier(),
        ),
      ],
      child: const MaterialApp(
        home: LoginScreen(),
      ),
    ),
  );
  
  expect(find.byType(CircularProgressIndicator), findsOneWidget);
});
```

### Integration Testing
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  
  group('Login Flow', () {
    testWidgets('complete login flow', (WidgetTester tester) async {
      await tester.pumpWidget(const MyApp());
      
      // Navigate to login
      await tester.tap(find.text('Login'));
      await tester.pumpAndSettle();
      
      // Enter credentials
      await tester.enterText(find.byType(TextField).first, 'test@example.com');
      await tester.enterText(find.byType(TextField).last, 'password');
      
      // Submit
      await tester.tap(find.text('Sign In'));
      await tester.pumpAndSettle();
      
      // Verify navigation
      expect(find.text('Home'), findsOneWidget);
    });
  });
}
```

## 📱 Platform-Specific Development

### Android Development

#### Permissions
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

#### Configuration
```gradle
// android/app/build.gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        minSdkVersion 21
        targetSdkVersion 34
    }
}
```

### iOS Development

#### Permissions
```xml
<!-- ios/Runner/Info.plist -->
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to scan QR codes</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to show nearby activities</string>
```

#### Configuration
```swift
// ios/Runner/AppDelegate.swift
import UIKit
import Flutter

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
```

## 🔒 Security Guidelines

### Data Protection
```dart
// Use secure storage for sensitive data
class SecureStorageService {
  static const _storage = FlutterSecureStorage();
  
  static Future<void> saveToken(String token) async {
    await _storage.write(key: 'auth_token', value: token);
  }
  
  static Future<String?> getToken() async {
    return await _storage.read(key: 'auth_token');
  }
}
```

### Input Validation
```dart
// Validate all user inputs
class Validators {
  static String? validateEmail(String? email) {
    if (email == null || email.isEmpty) {
      return 'Email is required';
    }
    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email)) {
      return 'Please enter a valid email';
    }
    return null;
  }
  
  static String? validatePassword(String? password) {
    if (password == null || password.isEmpty) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    return null;
  }
}
```

## 📊 Performance Guidelines

### Memory Management
```dart
// Dispose resources properly
class MyWidget extends StatefulWidget {
  @override
  _MyWidgetState createState() => _MyWidgetState();
}

class _MyWidgetState extends State<MyWidget> {
  late StreamSubscription _subscription;
  
  @override
  void initState() {
    super.initState();
    _subscription = someStream.listen(_handleData);
  }
  
  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
```

### Image Optimization
```dart
// Use cached network images
CachedNetworkImage(
  imageUrl: 'https://example.com/image.jpg',
  placeholder: (context, url) => const ShimmerLoading(),
  errorWidget: (context, url, error) => const Icon(Icons.error),
  fit: BoxFit.cover,
)
```

## 🚀 Deployment Guidelines

### Build Configuration
```yaml
# pubspec.yaml
name: ludus_mobile_app
description: LUDUS - Social Activity Discovery Platform
version: 1.0.0+1

environment:
  sdk: ^3.9.0
  flutter: ">=3.16.0"
```

### Release Process
1. **Version Update**: Update version in `pubspec.yaml`
2. **Changelog**: Update `CHANGELOG.md`
3. **Testing**: Run full test suite
4. **Build**: Create release builds
5. **Deploy**: Upload to app stores

## 📚 Documentation Standards

### Code Documentation
```dart
/// Service for handling user authentication operations.
/// 
/// This service provides methods for user login, registration,
/// password reset, and session management.
class AuthService {
  final ApiClient _apiClient;
  
  /// Creates an instance of [AuthService].
  /// 
  /// [apiClient] is required for making HTTP requests.
  AuthService({required ApiClient apiClient}) : _apiClient = apiClient;
  
  /// Authenticates a user with email and password.
  /// 
  /// Returns a [User] object if authentication is successful.
  /// Throws [AuthException] if credentials are invalid.
  /// 
  /// Example:
  /// ```dart
  /// final user = await authService.login('user@example.com', 'password');
  /// ```
  Future<User> login(String email, String password) async {
    // Implementation
  }
}
```

### README Updates
- Update feature documentation
- Add new dependencies
- Update installation instructions
- Include screenshots for UI changes

---

This development guide ensures consistent, high-quality code development across the LUDUS mobile app project.
