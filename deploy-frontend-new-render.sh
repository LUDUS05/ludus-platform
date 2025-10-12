#!/bin/bash

# LUDUS Frontend Deployment Script for New Render Account
# Created: 2025-09-07 22:25 GMT+3 (Riyadh)

echo "🚀 LUDUS Frontend Deployment Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backend URL (from your deployment log)
BACKEND_URL="https://ludus-backend-jzc5.onrender.com"

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "Backend URL: $BACKEND_URL"
echo "Repository: https://github.com/LUDUS05/ludus-platform"
echo "Branch: new-main"
echo "Root Directory: apps/web"
echo ""

echo -e "${YELLOW}⚠️  Manual Steps Required:${NC}"
echo "1. Go to your Render Dashboard"
echo "2. Click 'New +' → 'Static Site'"
echo "3. Configure the following settings:"
echo ""

echo -e "${GREEN}📝 Frontend Service Configuration:${NC}"
echo "Name: ludus-frontend"
echo "Repository: https://github.com/LUDUS05/ludus-platform"
echo "Branch: new-main"
echo "Root Directory: apps/web"
echo "Build Command: npm run build:render"
echo "Publish Directory: build"
echo ""

echo -e "${GREEN}🔧 Environment Variables to Set:${NC}"
echo "REACT_APP_API_URL = $BACKEND_URL"
echo "REACT_APP_ANIMATION_ENABLED = true"
echo "REACT_APP_RTL_SUPPORT = true"
echo "REACT_APP_PERFORMANCE_MONITORING = true"
echo "REACT_APP_DEBUG_MODE = false"
echo ""

echo -e "${YELLOW}🧪 Testing Commands:${NC}"
echo "# Test backend health"
echo "curl $BACKEND_URL/health"
echo ""
echo "# Test API endpoint"
echo "curl $BACKEND_URL/api/health"
echo ""

echo -e "${BLUE}📊 Current Backend Status:${NC}"
echo "✅ Service: ludus-backend-jzc5"
echo "✅ URL: $BACKEND_URL"
echo "✅ MongoDB: Connected"
echo "⚠️  Memory Usage: 89.8% (needs optimization)"
echo ""

echo -e "${RED}🚨 Issues to Address:${NC}"
echo "1. High memory usage (89.8% vs 80% threshold)"
echo "2. MongoDB deprecation warnings (non-critical)"
echo "3. Duplicate schema index warnings (non-critical)"
echo ""

echo -e "${GREEN}✅ Next Steps:${NC}"
echo "1. Deploy frontend using the configuration above"
echo "2. Test frontend-backend connectivity"
echo "3. Optimize memory usage"
echo "4. Configure monitoring alerts"
echo ""

echo -e "${BLUE}🎯 Success Criteria:${NC}"
echo "- Frontend deployed and accessible"
echo "- Frontend connects to backend API"
echo "- User registration/login working"
echo "- Memory usage under 80%"
echo "- All health checks passing"
echo ""

echo -e "${YELLOW}⏱️  Estimated Time: 15-20 minutes${NC}"
echo ""

# Test backend connectivity
echo -e "${BLUE}🔍 Testing Backend Connectivity...${NC}"
if curl -s --max-time 10 "$BACKEND_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ Backend is responding${NC}"
else
    echo -e "${RED}❌ Backend is not responding${NC}"
    echo "Please check your backend deployment"
fi

echo ""
echo -e "${GREEN}🎉 Deployment script completed!${NC}"
echo "Follow the manual steps above to deploy your frontend."
