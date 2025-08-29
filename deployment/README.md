# LUDUS Multi-Platform Deployment Guide

## 🚀 **Overview**

This guide covers the deployment process for all three LUDUS platforms:
- **Mobile App (Flutter)**: Android, iOS, and Web
- **Staff Control Panel (React.js)**: Web application
- **Partner Portal (React.js)**: Web application
- **Firebase Backend**: Cloud infrastructure

## 📋 **Prerequisites**

### **Required Tools**
- Node.js 18+
- Flutter 3.16+
- Firebase CLI
- Git
- Docker (optional)

### **Required Accounts**
- **Firebase**: Project setup with billing enabled
- **Google Cloud**: For Firebase services
- **App Store Connect**: For iOS deployment
- **Google Play Console**: For Android deployment
- **Vercel/Netlify**: For web platform hosting
- **GitHub**: For CI/CD pipelines

## 🔧 **Environment Configuration**

### **Environment Variables**

Create `.env` files for each platform:

#### **Mobile App (.env)**
```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# API Configuration
API_BASE_URL=https://api.ludus.com
API_VERSION=v1

# Payment Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret

# Analytics
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
FIREBASE_ANALYTICS_ID=your_analytics_id

# Maps
GOOGLE_MAPS_API_KEY=your_maps_api_key

# Notifications
FCM_SERVER_KEY=your_fcm_server_key
```

#### **Staff Control Panel (.env.local)**
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.ludus.com
API_SECRET_KEY=your_api_secret

# Authentication
NEXTAUTH_URL=https://staff.ludus.com
NEXTAUTH_SECRET=your_nextauth_secret

# Database
DATABASE_URL=your_database_url

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### **Partner Portal (.env.local)**
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.ludus.com
API_SECRET_KEY=your_api_secret

# Authentication
NEXTAUTH_URL=https://partner.ludus.com
NEXTAUTH_SECRET=your_nextauth_secret

# Payment
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## 🏗️ **Firebase Backend Deployment**

### **1. Firebase Project Setup**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Select services:
# - Firestore
# - Functions
# - Storage
# - Hosting
# - Emulators
```

### **2. Deploy Firebase Services**
```bash
# Deploy all services
firebase deploy

# Deploy specific services
firebase deploy --only firestore:rules
firebase deploy --only functions
firebase deploy --only storage
firebase deploy --only hosting
```

### **3. Firebase Configuration Files**

#### **firestore.rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    function isStaff() {
      return getUserRole() in ['staff_admin', 'staff_support', 'staff_moderator'];
    }
    
    function isPartner() {
      return getUserRole() == 'partner';
    }
    
    function isUser() {
      return getUserRole() == 'user';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isStaff());
      allow write: if isAuthenticated() && request.auth.uid == userId;
      allow create: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Partners collection  
    match /partners/{partnerId} {
      allow read: if isAuthenticated() && (request.auth.uid == partnerId || isStaff());
      allow write: if isAuthenticated() && (request.auth.uid == partnerId || getUserRole() == 'staff_admin');
      allow create: if isAuthenticated() && request.auth.uid == partnerId && isPartner();
    }
    
    // Activities collection
    match /activities/{activityId} {
      allow read: if true; // Public read for discovery
      allow write: if isAuthenticated() && (
        (isPartner() && request.auth.uid == resource.data.partnerId) || 
        getUserRole() in ['staff_admin', 'staff_moderator']
      );
      allow create: if isAuthenticated() && isPartner();
    }
    
    // Bookings collection
    match /bookings/{bookingId} {
      allow read: if isAuthenticated() && (
        request.auth.uid == resource.data.userId || // User's own booking
        request.auth.uid == resource.data.partnerId || // Partner's activity booking
        isStaff() // Staff access
      );
      allow write: if isAuthenticated() && (
        (request.auth.uid == resource.data.userId && isUser()) || // User modifications
        (request.auth.uid == resource.data.partnerId && isPartner()) || // Partner modifications  
        isStaff() // Staff modifications
      );
      allow create: if isAuthenticated();
    }
    
    // Reviews collection
    match /reviews/{reviewId} {
      allow read: if true; // Public read for activity reviews
      allow write: if isAuthenticated() && request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated() && isUser();
      allow update: if isAuthenticated() && (
        (request.auth.uid == resource.data.userId && isUser()) ||
        (request.auth.uid == resource.data.partnerId && isPartner() && 'response' in request.resource.data.diff(resource.data).affectedKeys()) ||
        (isStaff() && 'isHidden' in request.resource.data.diff(resource.data).affectedKeys())
      );
    }
    
    // Categories collection
    match /categories/{categoryId} {
      allow read: if true; // Public read
      allow write: if isAuthenticated() && getUserRole() in ['staff_admin', 'staff_moderator'];
    }
    
    // Staff actions - Admin only
    match /staff_actions/{actionId} {
      allow read, write: if isAuthenticated() && isStaff();
    }
    
    // Platform analytics - Admin only
    match /platform_analytics/{date} {
      allow read, write: if isAuthenticated() && getUserRole() == 'staff_admin';
    }
  }
}
```

#### **storage.rules**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserRole() {
      return firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role;
    }
    
    function isStaff() {
      return getUserRole() in ['staff_admin', 'staff_support', 'staff_moderator'];
    }
    
    function isPartner() {
      return getUserRole() == 'partner';
    }
    
    // User profile pictures
    match /users/{userId}/profile/{fileName} {
      allow read: if true;
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Activity images
    match /activities/{activityId}/images/{fileName} {
      allow read: if true;
      allow write: if isAuthenticated() && (
        (isPartner() && firestore.get(/databases/(default)/documents/activities/$(activityId)).data.partnerId == request.auth.uid) ||
        isStaff()
      );
    }
    
    // Partner business documents
    match /partners/{partnerId}/documents/{fileName} {
      allow read: if isAuthenticated() && (request.auth.uid == partnerId || isStaff());
      allow write: if isAuthenticated() && request.auth.uid == partnerId;
    }
    
    // Review images
    match /reviews/{reviewId}/images/{fileName} {
      allow read: if true;
      allow write: if isAuthenticated() && firestore.get(/databases/(default)/documents/reviews/$(reviewId)).data.userId == request.auth.uid;
    }
  }
}
```

## 📱 **Mobile App Deployment**

### **1. Android Deployment**

#### **Build Configuration (android/app/build.gradle)**
```gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.ludus.mobile"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### **Build Commands**
```bash
# Build APK
flutter build apk --release

# Build App Bundle (recommended for Play Store)
flutter build appbundle --release

# Build for specific architecture
flutter build apk --release --target-platform android-arm64
```

#### **Google Play Store Deployment**
1. Create app in Google Play Console
2. Upload signed APK/AAB
3. Fill in store listing details
4. Set up content rating
5. Configure pricing and distribution
6. Submit for review

### **2. iOS Deployment**

#### **Build Configuration (ios/Runner.xcodeproj)**
```xml
<!-- Info.plist -->
<key>CFBundleDisplayName</key>
<string>LUDUS</string>
<key>CFBundleIdentifier</key>
<string>com.ludus.mobile</string>
<key>CFBundleVersion</key>
<string>1</string>
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
```

#### **Build Commands**
```bash
# Build for iOS
flutter build ios --release

# Build for specific device
flutter build ios --release --flavor production
```

#### **App Store Deployment**
1. Create app in App Store Connect
2. Configure app information
3. Upload build using Xcode or Transporter
4. Fill in app store details
5. Submit for review

### **3. Web Deployment**

#### **Build Command**
```bash
# Build for web
flutter build web --release

# Build with specific base href
flutter build web --release --base-href /ludus/
```

#### **Deploy to Firebase Hosting**
```bash
# Configure hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

## 🌐 **Web Platform Deployment**

### **1. Staff Control Panel Deployment**

#### **Build Configuration (next.config.js)**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

#### **Build and Deploy**
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod
```

### **2. Partner Portal Deployment**

#### **Build Configuration (next.config.js)**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  i18n: {
    locales: ['en', 'ar'],
    defaultLocale: 'en',
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
```

#### **Build and Deploy**
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod
```

## 🔄 **CI/CD Pipeline Setup**

### **GitHub Actions Workflow**

#### **Mobile App CI/CD (.github/workflows/mobile.yml)**
```yaml
name: Mobile App CI/CD

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
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
      - run: flutter pub get
      - run: flutter test
      - run: flutter analyze

  build-android:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
      - run: flutter pub get
      - run: flutter build appbundle --release
      - uses: actions/upload-artifact@v3
        with:
          name: android-bundle
          path: build/app/outputs/bundle/release/app-release.aab

  build-ios:
    needs: test
    runs-on: macos-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
      - run: flutter pub get
      - run: flutter build ios --release --no-codesign
      - uses: actions/upload-artifact@v3
        with:
          name: ios-build
          path: build/ios/archive/Runner.xcarchive
```

#### **Web Platform CI/CD (.github/workflows/web.yml)**
```yaml
name: Web Platform CI/CD

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'ludus_staff_panel/**'
      - 'ludus_partner_portal/**'
  pull_request:
    branches: [ main ]

jobs:
  test-staff-panel:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ludus_staff_panel
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test

  test-partner-portal:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ludus_partner_portal
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test

  deploy-staff-panel:
    needs: test-staff-panel
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    defaults:
      run:
        working-directory: ludus_staff_panel
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_STAFF_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-partner-portal:
    needs: test-partner-portal
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    defaults:
      run:
        working-directory: ludus_partner_portal
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PARTNER_PROJECT_ID }}
          vercel-args: '--prod'
```

## 🔒 **Security Configuration**

### **1. SSL/TLS Configuration**
```nginx
# Nginx configuration for SSL
server {
    listen 443 ssl http2;
    server_name ludus.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

### **2. Environment Security**
```bash
# Generate secure secrets
openssl rand -base64 32
openssl rand -hex 32

# Set up environment variables securely
export JWT_SECRET=$(openssl rand -base64 32)
export API_SECRET=$(openssl rand -hex 32)
export DATABASE_PASSWORD=$(openssl rand -base64 32)
```

## 📊 **Monitoring and Analytics**

### **1. Firebase Analytics Setup**
```javascript
// Initialize Firebase Analytics
import { getAnalytics, logEvent } from "firebase/analytics";

const analytics = getAnalytics(app);

// Track custom events
logEvent(analytics, 'booking_created', {
  activity_id: activityId,
  amount: totalAmount,
  currency: 'SAR'
});
```

### **2. Error Tracking (Sentry)**
```javascript
// Initialize Sentry
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### **3. Performance Monitoring**
```javascript
// Firebase Performance Monitoring
import { getPerformance } from "firebase/performance";

const perf = getPerformance(app);

// Custom traces
const trace = perf.trace('custom_trace');
trace.start();
// ... your code ...
trace.stop();
```

## 🚀 **Deployment Checklist**

### **Pre-Deployment**
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security audit performed
- [ ] Performance testing completed
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates installed
- [ ] Monitoring tools configured

### **Deployment**
- [ ] Backup current production data
- [ ] Deploy Firebase backend
- [ ] Deploy web platforms
- [ ] Deploy mobile app updates
- [ ] Update DNS records
- [ ] Configure CDN
- [ ] Set up monitoring alerts

### **Post-Deployment**
- [ ] Verify all services are running
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Validate analytics tracking
- [ ] Update documentation
- [ ] Notify stakeholders

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Firebase Deployment Issues**
```bash
# Clear Firebase cache
firebase logout
firebase login
firebase use --clear

# Redeploy with verbose logging
firebase deploy --debug
```

#### **Mobile App Build Issues**
```bash
# Clean Flutter build
flutter clean
flutter pub get
flutter build apk --release

# Check Flutter doctor
flutter doctor -v
```

#### **Web Platform Build Issues**
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Check for TypeScript errors
npm run type-check
```

## 📞 **Support**

For deployment issues:
- **Documentation**: Check platform-specific docs
- **Firebase Support**: https://firebase.google.com/support
- **Flutter Support**: https://flutter.dev/support
- **Next.js Support**: https://nextjs.org/support

---

**Last Updated**: January 2025  
**Version**: 2.0  
**Maintainer**: DevOps Team
