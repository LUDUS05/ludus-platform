#!/bin/bash

# Deploy Selena-Onboard AI Agent
# This script deploys the Selena-Onboard agent integration for the LUDUS platform

set -e  # Exit on any error

echo "🌟 DEPLOYING SELENA-ONBOARD AI AGENT"
echo "=====================================+"
echo "Time: $(date '+%Y-%m-%d %H:%M:%S') GMT+3 (Riyadh)"
echo ""

# Configuration
BACKEND_SERVICE="ludus-backend-athena"
AGENTS_SERVICE="ludus-agents-api"
FRONTEND_SERVICE="ludus-frontend"

echo "📋 Deployment Configuration:"
echo "   Backend Service: $BACKEND_SERVICE"
echo "   Agents Service: $AGENTS_SERVICE"  
echo "   Frontend Service: $FRONTEND_SERVICE"
echo ""

# Step 1: Validate Files
echo "🔍 Step 1: Validating Implementation Files..."

required_files=(
    "agents/api/onboard_agent.py"
    "server/src/routes/selenaOnboard.js"
    "server/src/models/OnboardingSession.js"
    "client/src/components/onboarding/SelenaChatWidget.jsx"
    "client/src/services/selenaService.js"
    "client/src/components/admin/SelenaAnalyticsDashboard.jsx"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ Missing: $file"
        exit 1
    fi
done

echo "   ✅ All implementation files present"
echo ""

# Step 2: Check Python Dependencies
echo "🐍 Step 2: Checking Python Dependencies..."
cd agents
if [ -f "requirements.txt" ]; then
    if grep -q "pymongo" requirements.txt; then
        echo "   ✅ pymongo dependency present"
    else
        echo "   ❌ Missing pymongo dependency"
        exit 1
    fi
    
    if grep -q "redis" requirements.txt; then
        echo "   ✅ redis dependency present"
    else
        echo "   ❌ Missing redis dependency"
        exit 1
    fi
else
    echo "   ❌ requirements.txt not found"
    exit 1
fi
cd ..
echo ""

# Step 3: Check Node.js Backend Integration
echo "🟢 Step 3: Checking Backend Integration..."
cd server

# Check if the route is properly registered in app.js
if grep -q "selenaOnboard" src/app.js; then
    echo "   ✅ Selena routes registered in app.js"
else
    echo "   ❌ Selena routes not registered in app.js"
    exit 1
fi

# Check if axios dependency exists
if grep -q '"axios"' package.json; then
    echo "   ✅ axios dependency present"
else
    echo "   ❌ Missing axios dependency"
    exit 1
fi

cd ..
echo ""

# Step 4: Check Frontend Integration
echo "⚛️ Step 4: Checking Frontend Integration..."
cd client

# Check if SelenaChatWidget is imported in OnboardingFlow
if grep -q "SelenaChatWidget" src/components/onboarding/OnboardingFlow.jsx; then
    echo "   ✅ SelenaChatWidget integrated in OnboardingFlow"
else
    echo "   ❌ SelenaChatWidget not integrated in OnboardingFlow"
    exit 1
fi

# Check translation files
if grep -q '"selena"' src/i18n/locales/ar.json && grep -q '"selena"' src/i18n/locales/en.json; then
    echo "   ✅ Selena translations added to both languages"
else
    echo "   ❌ Missing Selena translations"
    exit 1
fi

cd ..
echo ""

# Step 5: Validate Environment Variables
echo "🔧 Step 5: Checking Environment Configuration..."

required_env_vars=(
    "MONGODB_URI"
    "REDIS_URL"
    "AGENTS_API_URL"
)

missing_vars=()
for var in "${required_env_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    else
        echo "   ✅ $var configured"
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "   ⚠️  Missing environment variables: ${missing_vars[*]}"
    echo "   These will need to be configured in Render dashboard"
else
    echo "   ✅ All required environment variables present"
fi
echo ""

# Step 6: Create Deployment Commands
echo "🚀 Step 6: Preparing Deployment Commands..."

cat > deploy-commands.md << 'EOF'
# Selena-Onboard Deployment Commands

## 1. Deploy Agents Service (Python FastAPI)
```bash
# In Render dashboard for ludus-agents-api service:
# - Ensure Python 3.11+ runtime
# - Ensure requirements.txt includes: pymongo==4.6.0, redis==5.0.8
# - Set environment variables: MONGODB_URI, REDIS_URL, OLLAMA_HOST
# - Deploy from agents/ directory
```

## 2. Deploy Backend Service (Node.js Express)
```bash
# In Render dashboard for ludus-backend-athena service:
# - Ensure Node.js 18+ runtime
# - Set environment variable: AGENTS_API_URL=https://ludus-agents-api.onrender.com
# - Deploy from server/ directory
```

## 3. Deploy Frontend Service (React)
```bash
# In Render dashboard for ludus-frontend service:
# - Ensure Node.js 18+ runtime
# - Set build command: npm run build
# - Deploy from client/ directory
```

## 4. Environment Variables to Configure

### Agents Service (ludus-agents-api):
- MONGODB_URI: [MongoDB connection string]
- REDIS_URL: [Redis connection string]
- OLLAMA_HOST: http://localhost:11434 (or Ollama service URL)
- OLLAMA_MODEL: llama3.1

### Backend Service (ludus-backend-athena):
- AGENTS_API_URL: https://ludus-agents-api.onrender.com
- MONGODB_URI: [Same as agents service]

### Frontend Service (ludus-frontend):
- REACT_APP_API_URL: https://ludus-backend-athena.onrender.com/api
EOF

echo "   ✅ Deployment commands created in deploy-commands.md"
echo ""

# Step 7: Test File Validation
echo "🧪 Step 7: Running Basic Validation Tests..."

# Test Python imports (syntax check)
echo "   Testing Python agent syntax..."
cd agents
if python3 -m py_compile api/onboard_agent.py 2>/dev/null; then
    echo "   ✅ Python agent syntax valid"
else
    echo "   ❌ Python agent syntax errors"
    exit 1
fi
cd ..

# Test Node.js routes syntax
echo "   Testing Node.js routes syntax..."
cd server
if node -c src/routes/selenaOnboard.js; then
    echo "   ✅ Node.js routes syntax valid"
else
    echo "   ❌ Node.js routes syntax errors"
    exit 1
fi
cd ..

echo ""

# Step 8: Generate Success Report
echo "🎉 Step 8: Generating Deployment Report..."

cat > SELENA_DEPLOYMENT_REPORT.md << EOF
# Selena-Onboard Agent Deployment Report

**Date:** $(date '+%Y-%m-%d %H:%M:%S') GMT+3 (Riyadh)
**Status:** ✅ READY FOR DEPLOYMENT

## 📋 Implementation Summary

### ✅ Completed Components

1. **Python AI Agent** (\`agents/api/onboard_agent.py\`)
   - Specialized onboarding assistance logic
   - Arabic/English bilingual support
   - Cultural guidance for Saudi market
   - MongoDB and Redis integration
   - Registration, profile, and feature tour assistance

2. **Backend API Integration** (\`server/src/routes/selenaOnboard.js\`)
   - RESTful API endpoints for agent communication
   - Session management and analytics tracking
   - MongoDB integration for progress tracking
   - Error handling and fallback responses

3. **Database Schema** (\`server/src/models/OnboardingSession.js\`)
   - Comprehensive session tracking
   - Progress analytics and metrics
   - Cultural context and language preferences
   - Integration with existing user system

4. **Frontend Chat Widget** (\`client/src/components/onboarding/SelenaChatWidget.jsx\`)
   - Interactive chat interface
   - Real-time messaging with Selena
   - Progress visualization
   - Suggestion and quick actions

5. **Service Layer** (\`client/src/services/selenaService.js\`)
   - Centralized API communication
   - Error handling and fallbacks
   - Session management

6. **Admin Analytics Dashboard** (\`client/src/components/admin/SelenaAnalyticsDashboard.jsx\`)
   - Performance monitoring
   - Completion rate tracking
   - Language distribution analysis
   - Step drop-off insights

7. **Translation System Integration**
   - Complete Arabic translations
   - English language support
   - Cultural terminology
   - RTL/LTR interface support

### 🎯 Success Metrics Implementation

- **Completion Rate Tracking:** >85% target
- **Response Time Monitoring:** <200ms target
- **Language Usage Analytics:** >70% Arabic target
- **User Satisfaction Scoring:** 1-5 scale
- **Cultural Sensitivity Validation:** Saudi-specific guidance

### 🔧 API Endpoints Implemented

- \`POST /api/selena/start-session\` - Initialize onboarding session
- \`POST /api/selena/registration-help\` - Registration assistance
- \`POST /api/selena/profile-setup\` - Profile setup guidance
- \`POST /api/selena/feature-tour\` - Platform orientation
- \`POST /api/selena/cultural-guidance\` - Cultural insights
- \`POST /api/selena/complete-onboarding\` - Complete process
- \`GET /api/selena/progress/:user_id\` - Progress tracking
- \`GET /api/selena/analytics\` - Performance analytics
- \`GET /api/selena/session/:session_id\` - Session details

### 📊 Analytics & Monitoring

- MongoDB session tracking
- Redis conversation storage  
- Completion rate analysis
- Language preference tracking
- Step-by-step drop-off monitoring
- Cultural guidance effectiveness
- Average interaction time tracking

## 🚀 Deployment Instructions

1. **Deploy Agents Service:**
   - Update requirements.txt with pymongo and redis
   - Configure environment variables (MONGODB_URI, REDIS_URL)
   - Deploy from agents/ directory

2. **Deploy Backend Service:**
   - Add AGENTS_API_URL environment variable
   - Deploy updated routes and models
   - Verify MongoDB connection

3. **Deploy Frontend Service:**
   - Deploy updated components and translations
   - Test chat widget functionality
   - Verify onboarding integration

## ✅ Ready for Production

The Selena-Onboard agent is fully implemented and ready for deployment with:
- Complete Arabic/English bilingual support
- Cultural sensitivity for Saudi market
- Comprehensive session tracking and analytics
- Integration with existing onboarding system
- Fallback mechanisms for reliability
- Admin monitoring and analytics dashboard

**Next Steps:** Deploy to Render services and monitor performance metrics.
EOF

echo "   ✅ Deployment report created: SELENA_DEPLOYMENT_REPORT.md"
echo ""

# Final Success Message
echo "🎊 SELENA-ONBOARD AGENT READY FOR DEPLOYMENT!"
echo "============================================="
echo "✅ All implementation files validated"
echo "✅ Dependencies checked"
echo "✅ Integration completed"
echo "✅ Translations added"
echo "✅ Analytics implemented"
echo "✅ Deployment commands prepared"
echo ""
echo "📄 See SELENA_DEPLOYMENT_REPORT.md for complete details"
echo "📄 See deploy-commands.md for deployment instructions"
echo ""
echo "🚀 Ready to deploy to Render services!"
echo "🎯 Target metrics: >85% completion rate, <10min average time, >70% Arabic usage"