# LUDUS Mobile App - Deployment Guide

## Overview

This guide provides comprehensive instructions for building, testing, and deploying the LUDUS mobile app across different platforms and environments.

## 🏗️ Build Configuration

### Environment Setup

#### Development Environment
```bash
# Install Flutter SDK
flutter doctor

# Install dependencies
flutter pub get

# Run code generation
flutter packages pub run build_runner build

# Run tests
flutter test
```

#### Production Environment
```bash
# Clean build
flutter clean

# Get dependencies
flutter pub get

# Generate code
flutter packages pub run build_runner build --delete-conflicting-outputs

# Run full test suite
flutter test --coverage
```

### Build Variants

#### Debug Build
```bash
# Android Debug
flutter build apk --debug

# iOS Debug
flutter build ios --debug

# Web Debug
flutter build web --debug
```

#### Release Build
```bash
# Android Release
flutter build apk --release

# iOS Release
flutter build ios --release

# Web Release
flutter build web --release
```

#### Profile Build (Performance Testing)
```bash
# Android Profile
flutter build apk --profile

# iOS Profile
flutter build ios --profile
```

## 📱 Platform-Specific Configuration

### Android Configuration

#### Build Configuration
```gradle
// android/app/build.gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.ludus.mobile"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
        
        // Enable multidex
        multiDexEnabled true
    }
    
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
        
        debug {
            applicationIdSuffix ".debug"
            debuggable true
        }
    }
    
    // Enable split APKs for different architectures
    splits {
        abi {
            enable true
            reset()
            include "armeabi-v7a", "arm64-v8a", "x86_64"
            universalApk false
        }
    }
}
```

#### Signing Configuration
```gradle
// android/app/build.gradle
android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
}

// Load keystore properties
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

#### ProGuard Rules
```proguard
# android/app/proguard-rules.pro
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# Keep Firebase classes
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Keep JSON serialization
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
```

### iOS Configuration

#### Build Configuration
```swift
// ios/Runner.xcodeproj/project.pbxproj
// Update build settings in Xcode

// Info.plist configuration
<key>CFBundleDisplayName</key>
<string>LUDUS</string>
<key>CFBundleIdentifier</key>
<string>com.ludus.mobile</string>
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
```

#### Signing and Capabilities
```xml
<!-- ios/Runner/Info.plist -->
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to scan QR codes and take photos</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to show nearby activities</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app needs location access to show nearby activities and provide directions</string>
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access for voice messages</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs photo library access to upload profile pictures</string>
```

### Web Configuration

#### Build Configuration
```yaml
# web/index.html
<!DOCTYPE html>
<html>
<head>
  <base href="$FLUTTER_BASE_HREF">
  <meta charset="UTF-8">
  <meta content="IE=Edge" http-equiv="X-UA-Compatible">
  <meta name="description" content="LUDUS - Social Activity Discovery Platform">
  
  <!-- iOS meta tags & icons -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="apple-mobile-web-app-title" content="LUDUS">
  <link rel="apple-touch-icon" href="icons/Icon-192.png">
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="favicon.png"/>
  
  <title>LUDUS</title>
  <link rel="manifest" href="manifest.json">
</head>
<body>
  <script>
    var serviceWorkerVersion = null;
  </script>
  <script src="flutter.js" defer></script>
</body>
</html>
```

#### Web Manifest
```json
// web/manifest.json
{
  "name": "LUDUS",
  "short_name": "LUDUS",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#1E3A8A",
  "theme_color": "#1E3A8A",
  "description": "Social Activity Discovery Platform",
  "orientation": "portrait-primary",
  "prefer_related_applications": false,
  "icons": [
    {
      "src": "icons/Icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/Icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🔧 Environment Configuration

### Environment Variables

#### Development Environment
```env
# .env.development
API_BASE_URL=https://dev-api.ludus.com
FIREBASE_PROJECT_ID=ludus-dev
ENABLE_ANALYTICS=false
ENABLE_CRASHLYTICS=false
LOG_LEVEL=debug
```

#### Staging Environment
```env
# .env.staging
API_BASE_URL=https://staging-api.ludus.com
FIREBASE_PROJECT_ID=ludus-staging
ENABLE_ANALYTICS=true
ENABLE_CRASHLYTICS=true
LOG_LEVEL=info
```

#### Production Environment
```env
# .env.production
API_BASE_URL=https://api.ludus.com
FIREBASE_PROJECT_ID=ludus-prod
ENABLE_ANALYTICS=true
ENABLE_CRASHLYTICS=true
LOG_LEVEL=warning
```

### Environment Configuration Class
```dart
// lib/core/config/environment_config.dart
class EnvironmentConfig {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://api.ludus.com',
  );
  
  static const String firebaseProjectId = String.fromEnvironment(
    'FIREBASE_PROJECT_ID',
    defaultValue: 'ludus-prod',
  );
  
  static const bool enableAnalytics = bool.fromEnvironment(
    'ENABLE_ANALYTICS',
    defaultValue: true,
  );
  
  static const bool enableCrashlytics = bool.fromEnvironment(
    'ENABLE_CRASHLYTICS',
    defaultValue: true,
  );
  
  static const String logLevel = String.fromEnvironment(
    'LOG_LEVEL',
    defaultValue: 'info',
  );
}
```

## 🚀 Build Scripts

### Automated Build Script
```bash
#!/bin/bash
# scripts/build.sh

set -e

# Configuration
APP_NAME="ludus_mobile_app"
VERSION=$(grep 'version:' pubspec.yaml | awk '{print $2}')
BUILD_NUMBER=$(grep 'version:' pubspec.yaml | awk '{print $3}' | cut -d'+' -f2)
PLATFORM=$1
ENVIRONMENT=$2

echo "Building $APP_NAME v$VERSION (Build $BUILD_NUMBER) for $PLATFORM in $ENVIRONMENT environment"

# Clean previous builds
echo "Cleaning previous builds..."
flutter clean

# Get dependencies
echo "Getting dependencies..."
flutter pub get

# Generate code
echo "Generating code..."
flutter packages pub run build_runner build --delete-conflicting-outputs

# Run tests
echo "Running tests..."
flutter test --coverage

# Build based on platform
case $PLATFORM in
  "android")
    echo "Building Android APK..."
    flutter build apk --release \
      --dart-define=API_BASE_URL=$API_BASE_URL \
      --dart-define=FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID \
      --dart-define=ENABLE_ANALYTICS=$ENABLE_ANALYTICS \
      --dart-define=ENABLE_CRASHLYTICS=$ENABLE_CRASHLYTICS
    ;;
  "ios")
    echo "Building iOS app..."
    flutter build ios --release \
      --dart-define=API_BASE_URL=$API_BASE_URL \
      --dart-define=FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID \
      --dart-define=ENABLE_ANALYTICS=$ENABLE_ANALYTICS \
      --dart-define=ENABLE_CRASHLYTICS=$ENABLE_CRASHLYTICS
    ;;
  "web")
    echo "Building Web app..."
    flutter build web --release \
      --dart-define=API_BASE_URL=$API_BASE_URL \
      --dart-define=FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID \
      --dart-define=ENABLE_ANALYTICS=$ENABLE_ANALYTICS \
      --dart-define=ENABLE_CRASHLYTICS=$ENABLE_CRASHLYTICS
    ;;
  *)
    echo "Invalid platform. Use: android, ios, or web"
    exit 1
    ;;
esac

echo "Build completed successfully!"
```

### CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/build.yml
name: Build and Deploy

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
          channel: 'stable'
      
      - name: Install dependencies
        run: flutter pub get
      
      - name: Generate code
        run: flutter packages pub run build_runner build --delete-conflicting-outputs
      
      - name: Run tests
        run: flutter test --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: coverage/lcov.info

  build-android:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
      
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'zulu'
          java-version: '17'
      
      - name: Install dependencies
        run: flutter pub get
      
      - name: Generate code
        run: flutter packages pub run build_runner build --delete-conflicting-outputs
      
      - name: Build APK
        run: flutter build apk --release
      
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: ludus-android-release
          path: build/app/outputs/flutter-apk/app-release.apk

  build-ios:
    needs: test
    runs-on: macos-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
      
      - name: Install dependencies
        run: flutter pub get
      
      - name: Generate code
        run: flutter packages pub run build_runner build --delete-conflicting-outputs
      
      - name: Build iOS
        run: flutter build ios --release --no-codesign
      
      - name: Upload iOS build
        uses: actions/upload-artifact@v3
        with:
          name: ludus-ios-release
          path: build/ios/iphoneos/Runner.app

  build-web:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
      
      - name: Install dependencies
        run: flutter pub get
      
      - name: Generate code
        run: flutter packages pub run build_runner build --delete-conflicting-outputs
      
      - name: Build Web
        run: flutter build web --release
      
      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: ludus-prod
          channelId: live
```

## 📦 Release Management

### Version Management

#### Semantic Versioning
```yaml
# pubspec.yaml
version: 1.0.0+1  # MAJOR.MINOR.PATCH+BUILD_NUMBER
```

#### Version Update Script
```bash
#!/bin/bash
# scripts/version.sh

VERSION_TYPE=$1  # major, minor, patch
CURRENT_VERSION=$(grep 'version:' pubspec.yaml | awk '{print $2}')
CURRENT_BUILD=$(grep 'version:' pubspec.yaml | awk '{print $3}' | cut -d'+' -f2)

# Parse current version
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Update version based on type
case $VERSION_TYPE in
  "major")
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    ;;
  "minor")
    MINOR=$((MINOR + 1))
    PATCH=0
    ;;
  "patch")
    PATCH=$((PATCH + 1))
    ;;
  *)
    echo "Invalid version type. Use: major, minor, or patch"
    exit 1
    ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
NEW_BUILD=$((CURRENT_BUILD + 1))

# Update pubspec.yaml
sed -i "s/version: $CURRENT_VERSION+$CURRENT_BUILD/version: $NEW_VERSION+$NEW_BUILD/" pubspec.yaml

echo "Version updated to $NEW_VERSION+$NEW_BUILD"
```

### Release Process

#### Release Checklist
```markdown
## Release Checklist

### Pre-Release
- [ ] All tests passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Version number updated
- [ ] Changelog updated
- [ ] Performance testing completed
- [ ] Security audit completed

### Build
- [ ] Clean build environment
- [ ] Build for all platforms
- [ ] Sign release builds
- [ ] Test release builds
- [ ] Generate release notes

### Deployment
- [ ] Upload to app stores
- [ ] Deploy web version
- [ ] Update production environment
- [ ] Monitor deployment
- [ ] Notify stakeholders

### Post-Release
- [ ] Monitor app performance
- [ ] Monitor crash reports
- [ ] Monitor user feedback
- [ ] Plan next release
```

#### Release Script
```bash
#!/bin/bash
# scripts/release.sh

set -e

VERSION_TYPE=$1
PLATFORMS=${2:-"android,ios,web"}

echo "Starting release process for $VERSION_TYPE..."

# Update version
./scripts/version.sh $VERSION_TYPE

# Get new version
NEW_VERSION=$(grep 'version:' pubspec.yaml | awk '{print $2}')
NEW_BUILD=$(grep 'version:' pubspec.yaml | awk '{print $3}' | cut -d'+' -f2)

echo "Building version $NEW_VERSION+$NEW_BUILD"

# Build for all platforms
IFS=',' read -ra PLATFORM_ARRAY <<< "$PLATFORMS"
for platform in "${PLATFORM_ARRAY[@]}"; do
  echo "Building for $platform..."
  ./scripts/build.sh $platform production
done

# Create release tag
git add .
git commit -m "Release version $NEW_VERSION+$NEW_BUILD"
git tag -a "v$NEW_VERSION" -m "Release version $NEW_VERSION"
git push origin main --tags

echo "Release $NEW_VERSION completed successfully!"
```

## 🔒 Security Configuration

### Code Signing

#### Android Keystore Setup
```bash
# Generate keystore
keytool -genkey -v -keystore ludus-release-key.keystore -alias ludus-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Create key.properties
cat > android/key.properties << EOF
storePassword=your_keystore_password
keyPassword=your_key_password
keyAlias=ludus-key-alias
storeFile=../ludus-release-key.keystore
EOF
```

#### iOS Code Signing
```bash
# Install certificates and provisioning profiles
# Use Xcode to manage signing certificates
# Or use fastlane for automated signing
```

### Security Headers (Web)
```html
<!-- web/index.html -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: https://ssl.gstatic.com 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; media-src *; img-src 'self' data: content:;">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="X-XSS-Protection" content="1; mode=block">
```

## 📊 Monitoring and Analytics

### Firebase Configuration
```dart
// lib/core/firebase/firebase_config.dart
class FirebaseConfig {
  static Future<void> initialize() async {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    
    if (EnvironmentConfig.enableAnalytics) {
      await FirebaseAnalytics.instance.setAnalyticsCollectionEnabled(true);
    }
    
    if (EnvironmentConfig.enableCrashlytics) {
      await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(true);
    }
  }
}
```

### Performance Monitoring
```dart
// lib/core/monitoring/performance_monitor.dart
class PerformanceMonitor {
  static void trackScreenLoad(String screenName) {
    FirebasePerformance.instance.newTrace('screen_load_$screenName');
  }
  
  static void trackApiCall(String endpoint, Duration duration) {
    FirebasePerformance.instance.newTrace('api_call_$endpoint');
  }
  
  static void trackUserAction(String action) {
    FirebaseAnalytics.instance.logEvent(name: 'user_action', parameters: {
      'action': action,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
    });
  }
}
```

## 🚀 Deployment Platforms

### Google Play Store
```bash
# Build bundle
flutter build appbundle --release

# Upload to Play Console
# Use Google Play Console or fastlane
```

### Apple App Store
```bash
# Build archive
flutter build ios --release

# Archive in Xcode
# Upload to App Store Connect
```

### Firebase Hosting (Web)
```bash
# Build web
flutter build web --release

# Deploy to Firebase
firebase deploy --only hosting
```

### Internal Distribution
```bash
# Build APK for internal testing
flutter build apk --release

# Upload to Firebase App Distribution
firebase appdistribution:distribute build/app/outputs/flutter-apk/app-release.apk \
  --app 1:123456789:android:abcdef \
  --groups "testers" \
  --release-notes "Bug fixes and improvements"
```

---

This deployment guide provides comprehensive instructions for building, testing, and deploying the LUDUS mobile app across all supported platforms.
