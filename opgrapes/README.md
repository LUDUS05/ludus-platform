# 🚀 LUDUS Platform - Social Activity Discovery & Booking

A modern, scalable social activity platform built with cutting-edge technology, designed to transform how people discover, book, and share activities in Saudi Arabia and beyond.

## 🎯 **PLATFORM OVERVIEW**

**LUDUS** is a comprehensive social activity platform that connects users with unique experiences, vendors, and communities. Built with a modular monolith architecture ready for microservices evolution, LUDUS combines social networking with activity discovery and booking.

### **Current Status**: 🟢 **MVP Complete** + 🚀 **Strategic Enhancements Starting**

---

## 🚀 **QUICK START**

### Prerequisites
- Node.js 20+
- npm 9+
- Git
- MongoDB (for development)
- Redis (for strategic enhancements)

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd opgrapes

# Install dependencies
npm install

# Start development servers
npm run dev:all
```

---

## 📁 **PROJECT STRUCTURE**

```
opgrapes/
├── apps/
│   ├── api/          # Express.js API backend (LUDUS Core)
│   └── web/          # Next.js web application (LUDUS Frontend)
├── packages/
│   └── ui/           # Shared UI components (LUDUS Design System)
├── scripts/           # Development and CI scripts
└── .github/          # GitHub Actions workflows
```

---

## 🛠️ **AVAILABLE SCRIPTS**

### Development
- `npm run dev` - Start all services in development mode
- `npm run dev:web` - Start only the web application
- `npm run dev:api` - Start only the API backend
- `npm run dev:all` - Start both services concurrently

### Building & Testing
- `npm run build` - Build all packages and applications
- `npm run test` - Run all tests
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint on all code
- `npm run format` - Format code with Prettier

### CI Testing (Local)
- `npm run test:ci:local` - Run local CI simulation (Linux/macOS)
- `npm run test:ci:local:win` - Run local CI simulation (Windows)

---

## 🚀 **STRATEGIC ENHANCEMENT PHASE**

### **Current Phase**: Analytics & Performance Foundation
**Timeline**: 6 weeks strategic enhancement phase  
**Status**: 🟡 Planning & Setup Phase  

#### **Phase 1: Analytics & Performance Foundation** (Week 1-2)
- [ ] **Advanced Analytics Implementation**
  - User behavior tracking
  - Business metrics and KPIs
  - Conversion funnel analysis
  - Real-time monitoring

- [ ] **Performance Optimization System**
  - Redis caching layer
  - Database query optimization
  - Frontend performance enhancement
  - Comprehensive monitoring

#### **Phase 2: Growth & Retention Features** (Week 3-4)
- [ ] **Advanced Referral System**
  - Smart referral codes
  - Social sharing integration
  - Gamification mechanics

- [ ] **Recommendation Engine**
  - ML-powered recommendations
  - User personalization
  - A/B testing framework

#### **Phase 3: Scalability & Advanced Features** (Week 5-6)
- [ ] **Group Booking Enhancement**
  - Advanced coordination tools
  - Social features integration
  - Business optimization

- [ ] **Vendor Self-Service Dashboard**
  - Activity management tools
  - Analytics and insights
  - Automation features

#### **Phase 4: Infrastructure & Scaling** (Week 7-8)
- [ ] **Microservices Architecture Preparation**
- [ ] **Advanced Caching & CDN**

---

## 🧪 **TESTING**

### Unit Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch
```

### E2E Tests
```bash
# Install Playwright browsers
npx playwright install --with-deps

# Run E2E tests
npm --workspace apps/web run e2e
```

---

## 🚀 **CI/CD**

The project includes a comprehensive GitHub Actions CI workflow that:

- ✅ Runs on all pushes to `main` and pull requests
- ✅ Installs dependencies with npm caching
- ✅ Runs linting and type checking
- ✅ Builds all packages and applications
- ✅ Runs unit tests
- ✅ Starts services and runs E2E tests
- ✅ Caches Playwright browsers for faster builds
- ✅ Uploads test reports as artifacts

### Local CI Testing

To test the CI workflow locally before pushing:

**Linux/macOS:**
```bash
npm run test:ci:local
```

**Windows:**
```powershell
npm run test:ci:local:win
```

---

## 🔧 **CONFIGURATION**

### Environment Variables

- `NODE_ENV` - Environment mode (development, test, production)
- `PORT` - Port for services (API: 4000, Web: 3000)
- `BASE_URL` - Base URL for E2E tests
- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis connection string (for strategic enhancements)
- `JWT_SECRET` - JWT authentication secret
- `MOYASAR_API_KEY` - Payment processing API key

### Ports

- **API**: 4000 (configurable via `PORT` env var)
- **Web**: 3000 (Next.js default)

---

## 📦 **WORKSPACES**

This project uses npm workspaces and Turbo for efficient monorepo management:

- **apps/api**: Express.js backend with TypeScript and Vitest (LUDUS Core API)
- **apps/web**: Next.js 15 application with React 19 and Playwright (LUDUS Frontend)
- **packages/ui**: Shared UI components library (LUDUS Design System)

---

## 🎯 **LUDUS PLATFORM FEATURES**

### **Core Features (MVP Complete)**
- ✅ **User Authentication & Management**
- ✅ **Activity Discovery & Browsing**
- ✅ **Vendor Management & Profiles**
- ✅ **Booking System & Management**
- ✅ **Admin Dashboard & Moderation**
- ✅ **Responsive Design & Mobile Optimization**

### **Strategic Enhancements (In Progress)**
- 🟡 **Analytics & Performance Foundation**
- 📋 **Growth & Retention Features**
- 📋 **Scalability & Advanced Features**
- 📋 **Infrastructure & Scaling**

---

## 🐛 **TROUBLESHOOTING**

### Common Issues

1. **Port conflicts**: Ensure ports 3000 and 4000 are available
2. **Dependencies**: Run `npm install` in the root directory
3. **TypeScript errors**: Run `npm run typecheck` to identify issues
4. **E2E test failures**: Check if services are running on correct ports
5. **Redis connection**: Ensure Redis is running for strategic enhancements

### Development Tips

- Use `npm run dev:all` to start both services simultaneously
- Check service health at `http://localhost:4000/health` (API) and `http://localhost:3000` (Web)
- Use the local CI test scripts to verify changes before pushing
- Monitor performance metrics during strategic enhancement development

---

## 🤝 **CONTRIBUTING**

1. Create a feature branch from `main`
2. Make your changes
3. Run local tests: `npm run test:ci:local`
4. Push and create a pull request
5. Ensure CI passes before merging

**Note**: This project is configured to only accept pushes to the `main` branch. All development should be done through feature branches and pull requests.

---

## 📊 **PROGRESS TRACKING**

- **PROGRESS_TRACKER.md** - Overall project progress and milestones
- **LUDUS_IMPLEMENTATION_TASKS.md** - Strategic enhancement task breakdown
- **STRATEGIC_ENHANCEMENT_TRACKER.md** - Detailed strategic enhancement progress

---

## 📄 **LICENSE**

[Add your license here]

---

**LUDUS Platform** - Transforming social activity discovery and booking through innovative technology and user experience design.
