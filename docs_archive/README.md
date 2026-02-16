# LUDUS Platform

A comprehensive social activity platform built for the Saudi Arabian market, featuring advanced AI integration, multi-language support, and seamless deployment on Render.

## 🚀 Features

### Core Platform
- **Social Activity Management**: Create, discover, and join social activities
- **Multi-language Support**: Arabic-first design with English support
- **User Management**: Comprehensive user profiles and authentication
- **Vendor System**: Partner management and activity hosting
- **Payment Integration**: Moyasar payment gateway integration
- **Rating System**: Advanced rating and review system
- **Referral Program**: Complete referral and reward system

### AI Integration
- **AI Agents Hub**: Automated agents for various platform functions
- **Ollama Integration**: Local AI model deployment and management
- **Athena System**: Advanced AI-powered features and automation
- **Render MCP**: Model Context Protocol integration for AI agents
- **Render MCP API**: RESTful endpoints for Render service management

### Technical Features
- **Firebase Integration**: Real-time database and authentication
- **Render Deployment**: Optimized for Render hosting platform
- **Performance Monitoring**: Comprehensive monitoring and analytics
- **Security**: Enterprise-grade security with RBAC
- **API-First Design**: RESTful APIs with comprehensive documentation

## 🏗️ Architecture

### Frontend (React)
- **Location**: `client/`
- **Framework**: React 18 with modern hooks
- **Styling**: Tailwind CSS with RTL support
- **State Management**: Context API and custom hooks
- **Internationalization**: i18next with Arabic/English support

### Backend (Node.js)
- **Location**: `server/`
- **Framework**: Express.js with comprehensive middleware
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Firebase Auth integration
- **API**: RESTful APIs with OpenAPI documentation

### AI Agents
- **Location**: `agents/`
- **Framework**: Python with FastAPI
- **Models**: Ollama integration for local AI
- **Protocol**: MCP (Model Context Protocol) support

### Render MCP API
- **Location**: `server/src/controllers/renderMCPController.js`
- **Endpoints**: 8 RESTful endpoints for Render service management
- **Authentication**: JWT with admin role requirements
- **Features**: Service listing, deployment control, logs, metrics

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- MongoDB
- Python 3.8+ (for AI agents)
- Render account (for deployment)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ludus-platform
   ```

2. **Install dependencies**:
   ```bash
   # Backend dependencies
   cd server
   npm install

   # Frontend dependencies
   cd ../client
   npm install

   # AI agents dependencies
   cd ../agents
   pip install -r requirements.txt
   ```

3. **Environment setup**:
   ```bash
   # Copy environment template
   cp env.template .env

   # Edit .env with your configuration
   nano .env
   ```

4. **Start development servers**:
   ```bash
   # Backend (from server directory)
   npm run dev

   # Frontend (from client directory)
   npm start

   # AI agents (from agents directory)
   python -m uvicorn api.main:app --reload
   ```

## 🔧 Configuration

### Environment Variables

Key environment variables for the platform:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/ludus

# Authentication
JWT_SECRET=your_jwt_secret
FIREBASE_PROJECT_ID=your_firebase_project

# Payment
MOYASAR_SECRET_KEY=your_moyasar_key
MOYASAR_PUBLISHABLE_KEY=your_moyasar_public_key

# Render MCP
RENDER_API_TOKEN=rnd_AjWyMGFA2vmtx6KidKj4TPVLZwpU

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Firebase Setup

1. Create a Firebase project
2. Enable Authentication (Google, Email/Password)
3. Create Firestore database
4. Configure security rules
5. Add configuration to environment variables

## 🚀 Deployment

### Render Deployment

The platform is optimized for Render deployment with the following services:

1. **Backend Service**: Node.js API server
2. **Frontend Service**: React static site
3. **AI Agents Service**: Python FastAPI service
4. **Database**: MongoDB Atlas

### Deployment Commands

```bash
# Deploy backend
./deploy-backend.sh

# Deploy frontend
./deploy-frontend-new-render.sh

# Deploy AI agents
./deploy-automated-agents.sh

# Deploy Ollama
./deploy-ollama.sh
```

### Environment Configuration

Set the following environment variables in Render:

```bash
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_production_jwt_secret
RENDER_API_TOKEN=rnd_AjWyMGFA2vmtx6KidKj4TPVLZwpU
```

## 📚 API Documentation

### Core APIs

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Activities**: `/api/activities/*`
- **Vendors**: `/api/vendors/*`
- **Payments**: `/api/payments/*`
- **Ratings**: `/api/ratings/*`
- **Referrals**: `/api/referrals/*`

### AI Integration APIs

- **Render MCP**: `/api/render-mcp/*`
- **AI Agents**: `/api/agents/*`
- **Monitoring**: `/api/monitoring/*`

### API Authentication

All API endpoints require JWT authentication:

```bash
curl -H "Authorization: Bearer <jwt_token>" \
     http://localhost:5000/api/users/profile
```

## 🤖 AI Integration

### Render MCP

The platform includes a comprehensive Render MCP integration for AI agents:

- **Service Management**: List and monitor Render services
- **Deployment Control**: Trigger deployments and view history
- **Log Access**: Retrieve service logs for debugging
- **Metrics Monitoring**: Access performance metrics
- **Environment Management**: Update service environment variables

See [RENDER_MCP_INTEGRATION_GUIDE.md](./RENDER_MCP_INTEGRATION_GUIDE.md) for detailed documentation.

### AI Agents

The AI agents system provides:

- **Automated Dashboards**: Dynamic dashboard creation
- **Content Management**: AI-powered content generation
- **User Assistance**: Intelligent user support
- **Analytics**: AI-driven insights and recommendations

## 🧪 Testing

### Test Suites

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test

# AI agents tests
cd agents
python -m pytest

# Integration tests
npm run test:integration

# Render MCP tests
node test-render-mcp.js
```

### Test Coverage

- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user journey testing
- **Performance Tests**: Load and stress testing

## 📊 Monitoring

### Health Checks

- **Backend Health**: `/api/health`
- **Render MCP Health**: `/api/render-mcp/health`
- **Database Health**: `/api/monitoring/database`
- **Payment Health**: `/api/monitoring/payments`

### Performance Monitoring

- **API Response Times**: Sub-500ms target
- **Database Performance**: Query optimization
- **Memory Usage**: Optimized for Render starter plan
- **Error Tracking**: Comprehensive error logging

## 🔒 Security

### Security Features

- **Authentication**: JWT with Firebase integration
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API endpoint protection
- **CORS Configuration**: Secure cross-origin requests
- **Helmet**: Security headers and protection

### Security Best Practices

- Environment variables for sensitive data
- Regular security audits
- Dependency vulnerability scanning
- Secure API key management
- HTTPS enforcement

## 🌐 Internationalization

### Language Support

- **Arabic**: Primary language with RTL support
- **English**: Secondary language support
- **Translation System**: Comprehensive i18next integration
- **RTL Layout**: Proper right-to-left layout handling

### Translation Management

- **Admin Interface**: Translation management tools
- **Fallback System**: Graceful fallback for missing translations
- **Analytics**: Translation usage tracking
- **Validation**: Translation completeness checking

## 📈 Performance

### Optimization Features

- **Memory Management**: Aggressive garbage collection
- **Database Optimization**: Query optimization and indexing
- **Caching**: Redis integration for performance
- **CDN**: Static asset optimization
- **Code Splitting**: Frontend bundle optimization

### Performance Targets

- **API Response Time**: < 500ms
- **Page Load Time**: < 2s
- **Memory Usage**: < 512MB (Render starter plan)
- **Database Queries**: Optimized for sub-100ms response

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests for new features**
5. **Update documentation**
6. **Submit a pull request**

### Code Standards

- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **Conventional Commits**: Commit message format

## 📄 License

This project is proprietary software developed for the LUDUS platform.

## 🆘 Support

### Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Render MCP Integration](./RENDER_MCP_INTEGRATION_GUIDE.md)
- [AI Agents Guide](./agents/README.md)
- [API Documentation](./server/README.md)

### Contact

For support and questions:
- **Technical Issues**: Check the troubleshooting guides
- **Feature Requests**: Submit through the issue tracker
- **Security Issues**: Contact the development team directly

---

**Version**: 1.0.0
**Last Updated**: January 2025
**Platform**: LUDUS Social Activity Platform
**Target Market**: Saudi Arabia
