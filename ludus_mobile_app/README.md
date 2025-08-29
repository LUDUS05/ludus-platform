# LUDUS Mobile App

A comprehensive Flutter mobile application for social activity discovery, booking, and community platform specifically designed for Saudi Arabia.

## 📱 Project Overview

LUDUS is a social activity discovery and booking platform that connects users with exciting activities, events, and experiences across Saudi Arabia. The app features a modern, user-friendly interface with robust functionality for both users and activity providers.

### Key Features

- **Activity Discovery**: Browse and search for activities by category, location, and preferences
- **Booking System**: Secure booking and payment processing for activities
- **Social Features**: User reviews, ratings, and social sharing
- **Vendor Dashboard**: Tools for activity providers to manage listings and bookings
- **User Profiles**: Personalized user experience with activity history and preferences
- **Real-time Notifications**: Stay updated with booking confirmations and activity updates

## 🏗️ Architecture

### Technology Stack

- **Framework**: Flutter 3.16+
- **Language**: Dart 3.0+
- **State Management**: Riverpod
- **Navigation**: GoRouter
- **UI Framework**: Material 3 with custom theming
- **Backend**: Firebase (Authentication, Firestore, Cloud Storage, Analytics)
- **Local Storage**: Hive
- **HTTP Client**: Dio with Retrofit
- **Code Generation**: build_runner, json_serializable, riverpod_generator

### Project Structure

```
lib/
├── core/                           # Core application logic
│   ├── constants/                  # App-wide constants
│   ├── theme/                      # UI theming and styling
│   ├── firebase/                   # Firebase services (temporarily disabled)
│   └── utils/                      # Utility functions
├── features/                       # Feature modules
│   ├── auth/                       # Authentication
│   ├── discovery/                  # Activity discovery
│   ├── booking/                    # Booking management
│   ├── vendor/                     # Vendor dashboard
│   ├── profile/                    # User profiles
│   └── social/                     # Social features
├── shared/                         # Shared components
│   ├── widgets/                    # Reusable widgets
│   ├── services/                   # Shared services
│   └── models/                     # Shared data models
└── routes/                         # Navigation routes
```

## 🚀 Getting Started

### Prerequisites

- Flutter 3.16+ installed
- Dart 3.0+
- Android Studio / VS Code
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/LUDUS05/ludus-platform.git
   cd ludus-platform/ludus_mobile_app
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Run the app**
   ```bash
   flutter run -d chrome --debug
   ```

### Development Setup

1. **Code Generation**
   ```bash
   flutter packages pub run build_runner build
   ```

2. **Hot Reload**
   ```bash
   flutter run --hot
   ```

## 🎨 Design System

### Color Palette

The app uses a carefully designed color palette that reflects the LUDUS brand:

- **Primary**: Deep blue (#1E3A8A)
- **Secondary**: Vibrant orange (#F97316)
- **Accent**: Teal (#0D9488)
- **Neutral**: Various grays for text and backgrounds
- **Status Colors**: Success (green), warning (yellow), error (red)

### Typography

- **Primary Font**: Poppins (Google Fonts)
- **Arabic Font**: Noto Sans Arabic
- **Font Weights**: Regular (400), Medium (500), SemiBold (600), Bold (700)

### Components

The app includes a comprehensive set of reusable components:
- Buttons (Elevated, Outlined, Text)
- Cards and containers
- Form inputs and validation
- Loading indicators and error states
- Navigation components

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration (to be added)
FIREBASE_API_KEY=your_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# API Configuration
API_BASE_URL=https://api.ludus.com
API_TIMEOUT=30000

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_CRASHLYTICS=true
```

### Firebase Setup (Future Implementation)

1. Create a Firebase project
2. Add Android and iOS apps
3. Download configuration files
4. Enable required services (Auth, Firestore, Storage, Analytics)

## 📱 Features Implementation Status

### Phase 1: Core MVP ✅
- [x] Project structure and navigation
- [x] Theme system and UI components
- [x] Basic screens and routing
- [ ] Authentication system
- [ ] Activity discovery and search
- [ ] Basic booking system

### Phase 2: Enhanced Features 🔄
- [ ] Advanced search and filtering
- [ ] User reviews and ratings
- [ ] Social features and sharing
- [ ] Push notifications
- [ ] Payment integration

### Phase 3: Premium Features 📋
- [ ] Vendor dashboard
- [ ] Analytics and reporting
- [ ] Advanced booking management
- [ ] Multi-language support
- [ ] Offline functionality

## 🧪 Testing

### Unit Tests
```bash
flutter test
```

### Widget Tests
```bash
flutter test test/widget_test.dart
```

### Integration Tests
```bash
flutter test integration_test/
```

## 📦 Building for Production

### Android
```bash
flutter build apk --release
```

### iOS
```bash
flutter build ios --release
```

### Web
```bash
flutter build web --release
```

## 🔒 Security & Privacy

- User data encryption
- Secure API communication
- GDPR compliance
- Privacy policy integration
- Data retention policies

## 📊 Performance

- Lazy loading for images and content
- Efficient state management
- Optimized navigation
- Memory leak prevention
- Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style

- Follow Dart/Flutter conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use proper error handling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial project setup and basic structure
- **v1.1.0** - Theme system and UI components
- **v1.2.0** - Navigation and routing (Current)

---

**LUDUS Mobile App** - Connecting people through amazing experiences in Saudi Arabia 🇸🇦
