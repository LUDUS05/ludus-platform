# LUDUS - Complete Multi-Platform Ecosystem

## 🚀 **Platform Overview**

LUDUS is a comprehensive social activity discovery, booking, and community platform targeting the Saudi Arabian market. The ecosystem consists of three interconnected platforms:

- **📱 Mobile App (Flutter)**: End-user activity discovery and booking
- **🖥️ Staff Control Panel (React.js)**: LUDUS staff platform management
- **💼 Partner Portal (React.js)**: Activity providers' business management

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │ Staff Control   │    │ Partner Portal  │
│   (Flutter)     │    │ Panel (React)   │    │ (React)         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Firebase      │
                    │   Backend       │
                    │   (Shared)      │
                    └─────────────────┘
```

## 📁 **Project Structure**

```
ludus-platform/
├── ludus_mobile_app/          # Flutter mobile application
├── ludus_staff_panel/         # React.js staff control panel
├── ludus_partner_portal/      # React.js partner portal
├── shared/                    # Shared utilities and types
├── docs/                      # Platform documentation
└── deployment/                # Deployment configurations
```

## 🛠️ **Technology Stack**

### **Mobile App (Flutter)**
- **Framework**: Flutter 3.16+
- **Language**: Dart 3.0+
- **State Management**: Riverpod
- **Navigation**: GoRouter
- **UI Framework**: Material 3 with Apple HIG compliance
- **Platforms**: Android + iOS

### **Web Platforms (React.js)**
- **Framework**: React.js 18+ with Next.js 14+
- **Language**: TypeScript
- **State Management**: Zustand/Redux Toolkit
- **UI Libraries**: Material-UI (Staff), Ant Design Pro (Partner)
- **Styling**: Styled-components + Tailwind CSS
- **Authentication**: Firebase Admin SDK

### **Backend (Firebase)**
- **Database**: Firestore
- **Authentication**: Firebase Auth
- **Storage**: Cloud Storage
- **Functions**: Cloud Functions
- **Analytics**: Firebase Analytics + GA4

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- Flutter 3.16+
- Firebase CLI
- Git

### **1. Clone Repository**
```bash
git clone https://github.com/LUDUS05/ludus-platform.git
cd ludus-platform
```

### **2. Mobile App Setup**
```bash
cd ludus_mobile_app
flutter pub get
flutter run -d chrome  # For web testing
```

### **3. Staff Control Panel Setup**
```bash
cd ludus_staff_panel
npm install
npm run dev
```

### **4. Partner Portal Setup**
```bash
cd ludus_partner_portal
npm install
npm run dev
```

### **5. Firebase Setup**
```bash
firebase login
firebase init
firebase deploy
```

## 📋 **Platform Features**

### **Mobile App Features**
- ✅ User authentication (Email, Google, Facebook)
- ✅ Activity discovery and search
- ✅ Booking management
- ✅ Social features (reviews, ratings)
- ✅ Push notifications
- 🔄 Offline mode (in development)
- 🔄 AR integration (planned)

### **Staff Control Panel Features**
- ✅ User management
- ✅ Partner verification
- ✅ Content moderation
- ✅ Platform analytics
- ✅ System administration
- 🔄 Advanced reporting (in development)

### **Partner Portal Features**
- ✅ Business dashboard
- ✅ Activity management
- ✅ Multi-source booking management
- ✅ Customer relationship management
- ✅ Financial tracking
- 🔄 External API integrations (in development)

## 🔧 **Development Guidelines**

### **Code Standards**
- **Mobile**: Follow Flutter best practices and Apple HIG
- **Web**: Follow React.js best practices and TypeScript standards
- **Backend**: Follow Firebase security best practices
- **Testing**: Unit, integration, and E2E tests for all platforms

### **Design System**
- **Mobile**: Apple Human Interface Guidelines compliance
- **Web**: Consistent design tokens across platforms
- **Branding**: LUDUS brand colors and typography

## 📊 **Current Status**

| Platform | Status | Progress |
|----------|--------|----------|
| Mobile App | 🟡 In Development | 60% |
| Staff Panel | 🟡 In Development | 40% |
| Partner Portal | 🟡 In Development | 30% |
| Backend | 🟢 Complete | 90% |
| Documentation | 🟢 Complete | 95% |

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Follow coding standards
4. Add tests
5. Submit a pull request

## 📄 **License**

This project is proprietary software. All rights reserved.

## 📞 **Support**

For technical support or questions:
- 📧 Email: support@ludus.com
- 📱 Mobile: +966-XX-XXX-XXXX
- 🌐 Website: https://ludus.com

---

**Built with ❤️ for the Saudi Arabian market**