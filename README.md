# LUDUS Platform

## 🎯 **Project Overview**

**LUDUS** is a Saudi Arabian social activity discovery platform that connects users with local experiences and vendors. The platform provides a comprehensive ecosystem for activity discovery, booking, and management.

**Status**: 🟡 In Development (70% Complete)  
**Target Launch**: Q2 2025

---

## 📊 **Current Status**

| Component | Status | Progress |
|-----------|--------|----------|
| **Backend API** | ✅ Complete | 95% |
| **Frontend Web** | ✅ Complete | 80% |
| **Mobile App (Flutter)** | 🔄 In Progress | 60% |
| **Content Management** | ✅ Complete | 95% |
| **Testing & Quality** | 🔄 In Progress | 45% |
| **Documentation** | 🔄 In Progress | 70% |
| **Deployment** | ✅ Complete | 80% |

**Overall Progress: ~70% Complete**

---

## 🏗️ **Architecture**

### **Technology Stack**
- **Backend**: Express.js + MongoDB (Mongoose ODM)
- **Frontend**: React + Create React App + Tailwind CSS
- **Mobile**: Flutter 3.16+ with Riverpod state management
- **Authentication**: JWT + Social Login (Google, Facebook)
- **Payment**: Moyasar payment gateway
- **Content Management**: Custom CMS with block-based editor
- **Maps**: Google Maps API integration
- **Deployment**: Multiple options (Railway, Render, Vercel)

### **Platform Components**
```
┌─────────────────────────────────────────────────────────────┐
│                    LUDUS PLATFORM ARCHITECTURE              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌──────────────────────────────────┐ │
│  │   WEB FRONTEND  │    │           BACKEND API            │ │
│  │                 │    │                                  │ │
│  │ • React App     │◄──►│ • Express.js Server              │ │
│  │ • Tailwind CSS  │    │ • MongoDB Database               │ │
│  │ • Multi-lang    │    │ • JWT Authentication             │ │
│  │ • Responsive    │    │ • Payment Integration            │ │
│  │                 │    │ • Content Management             │ │
│  └─────────────────┘    └──────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────┐    ┌──────────────────────────────────┐ │
│  │  MOBILE APP     │    │         ADMIN DASHBOARD          │ │
│  │                 │    │                                  │ │
│  │ • Flutter App   │◄──►│ • Content Management             │ │
│  │ • iOS/Android   │    │ • User Management                │ │
│  │ • Native UI     │    │ • Analytics & Reports            │ │
│  │ • Offline Sync  │    │ • System Administration          │ │
│  │                 │    │                                  │ │
│  └─────────────────┘    └──────────────────────────────────┘ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                      FEATURES                               │
│                                                             │
│  🌐 Multi-language   📱 Mobile App   💳 Payment System      │
│  🗺️ Location-based   ⭐ Ratings      📊 Analytics           │
│  🔐 Social Login     📝 Rich CMS     🚀 Real-time Updates   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- MongoDB
- Flutter 3.16+ (for mobile development)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/LUDUS05/ludus-platform.git
   cd ludus-platform
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd server && npm install
   
   # Install frontend dependencies
   cd ../client && npm install
   
   # Install mobile dependencies (optional)
   cd ../ludus_mobile_app && flutter pub get
   ```

3. **Environment setup**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   
   # Configure your environment variables
   # See docs/deployment/environment-setup.md for details
   ```

4. **Start development servers**
   ```bash
   # Start backend server
   cd server && npm run dev
   
   # Start frontend (in new terminal)
   cd client && npm start
   
   # Start mobile app (optional)
   cd ludus_mobile_app && flutter run
   ```

### **Access the application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Dashboard**: http://localhost:3000/admin

---

## 📚 **Documentation**

### **📋 Project Documentation**
- **[PROJECT_PLAN.md](PROJECT_PLAN.md)** - Complete project overview and planning
- **[TASK_TRACKER.md](TASK_TRACKER.md)** - Detailed task tracking and progress
- **[AGENTS.md](AGENTS.md)** - AI agents and development assistants
- **[TODOS.md](TODOS.md)** - Current tasks and priorities

### **🔧 Development Documentation**
- **[docs/development/](docs/development/)** - Development guides and technical documentation
- **[docs/api/](docs/api/)** - API documentation and reference
- **[docs/deployment/](docs/deployment/)** - Deployment guides and configuration
- **[docs/user-guides/](docs/user-guides/)** - User guides and manuals

### **📖 Key Development Guides**
- [Content Management System](docs/development/CONTENT_MANAGEMENT_REBUILD_COMPLETE.md)
- [Admin Dashboard](docs/development/ADMIN_DASHBOARD_ENHANCEMENTS.md)
- [Deployment Guide](docs/deployment/DEPLOYMENT.md)
- [SMTP Setup](docs/deployment/SMTP_SETUP_GUIDE.md)

---

## 🎯 **Core Features**

### ✅ **Completed Features**
- **User Authentication** - JWT-based auth with social login
- **Activity Discovery** - Search, filter, and location-based discovery
- **Booking System** - Complete booking flow with payment integration
- **Content Management** - Rich CMS with multilingual support
- **Admin Dashboard** - Comprehensive admin interface
- **Vendor Portal** - Vendor management and activity creation
- **Payment Integration** - Moyasar payment gateway
- **Email System** - Automated email notifications

### 🔄 **In Progress**
- **Mobile App** - Flutter app with native UI
- **Testing Suite** - Comprehensive testing implementation
- **Performance Optimization** - Load testing and optimization

### 📝 **Planned Features**
- **Real-time Notifications** - WebSocket integration
- **Advanced Analytics** - Enhanced reporting and insights
- **App Store Deployment** - iOS and Android app stores

---

## 🧪 **Testing**

### **Backend Testing**
```bash
cd server
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### **Frontend Testing**
```bash
cd client
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### **E2E Testing**
```bash
npm run test:e2e      # Run end-to-end tests
```

---

## 🚀 **Deployment**

### **Staging Environment**
- **Frontend**: https://ludus-staging.vercel.app
- **Backend**: https://ludus-staging.railway.app
- **Database**: MongoDB Atlas (Staging)

### **Production Environment**
- **Frontend**: https://letsludus.com
- **Backend**: https://api.letsludus.com
- **Database**: MongoDB Atlas (Production)

### **Deployment Commands**
```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Run health checks
npm run health:check
```

---

## 🔧 **Development Workflow**

### **Git Workflow**
1. **Feature Development**: Create feature branch from `main`
2. **Code Review**: Submit PR for review
3. **Testing**: Automated tests must pass
4. **Deployment**: Deploy to staging for testing
5. **Production**: Merge to main for production deployment

### **Code Quality**
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **TypeScript**: Type safety (where applicable)
- **Testing**: Unit, integration, and E2E tests

### **CI/CD Pipeline**
- **GitHub Actions**: Automated testing and deployment
- **Code Review**: Automated PR reviews
- **Security Scanning**: Dependency vulnerability scanning
- **Performance Monitoring**: Real-time performance tracking

---

## 🤝 **Contributing**

### **Development Guidelines**
1. **Code Style**: Follow ESLint and Prettier configuration
2. **Testing**: Write tests for new features
3. **Documentation**: Update documentation for changes
4. **Security**: Follow security best practices
5. **Performance**: Consider performance implications

### **Pull Request Process**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

### **Code Review Checklist**
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Security considerations addressed
- [ ] Performance impact considered

---

## 📞 **Support & Contact**

### **Development Team**
- **Project Manager**: Overall project coordination
- **Backend Developer**: API development and database
- **Frontend Developer**: Web application development
- **Mobile Developer**: Flutter app development
- **DevOps Engineer**: Deployment and infrastructure
- **QA Engineer**: Testing and quality assurance

### **Communication Channels**
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Email**: hi@letsludus.com

### **Escalation Path**
1. **Team Lead**: Technical issues and blockers
2. **Project Manager**: Timeline and resource issues
3. **Stakeholders**: Business and strategic decisions

---

## 📄 **License**

This project is proprietary software. All rights reserved.

---

## 🙏 **Acknowledgments**

- **Moyasar** - Payment gateway integration
- **Google Maps** - Location services
- **MongoDB Atlas** - Database hosting
- **Vercel** - Frontend hosting
- **Railway** - Backend hosting

---

*Last Updated: January 2025*  
*Version: 2.0*  
*Status: Active Development*

---

**For detailed information about the project, please refer to the [PROJECT_PLAN.md](PROJECT_PLAN.md) and [TASK_TRACKER.md](TASK_TRACKER.md) files.**