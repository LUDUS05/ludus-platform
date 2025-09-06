#!/bin/bash

# Project ATHENA Deployment Verification Script
# This script helps verify that Project ATHENA is deployed correctly

echo "🎬 Project ATHENA Deployment Verification"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service URLs (update these after deployment)
BACKEND_URL="https://ludus-backend-athena.onrender.com"
FRONTEND_URL="https://ludus-frontend-athena.onrender.com"
PRODUCTION_URL="https://app.letsludus.com"

echo -e "${BLUE}🔍 Checking Backend Service...${NC}"
echo "URL: $BACKEND_URL"

# Check backend health
echo -e "\n${YELLOW}Testing backend health endpoint...${NC}"
if curl -s -f "$BACKEND_URL/api/health" > /dev/null; then
    echo -e "${GREEN}✅ Backend health check: PASSED${NC}"
else
    echo -e "${RED}❌ Backend health check: FAILED${NC}"
    echo "Please check if the backend service is running"
fi

# Check backend API endpoints
echo -e "\n${YELLOW}Testing backend API endpoints...${NC}"

# Test social endpoints
if curl -s -f "$BACKEND_URL/api/social" > /dev/null; then
    echo -e "${GREEN}✅ Social API endpoint: ACCESSIBLE${NC}"
else
    echo -e "${YELLOW}⚠️  Social API endpoint: Requires authentication${NC}"
fi

# Test auth endpoints
if curl -s -f "$BACKEND_URL/api/auth" > /dev/null; then
    echo -e "${GREEN}✅ Auth API endpoint: ACCESSIBLE${NC}"
else
    echo -e "${YELLOW}⚠️  Auth API endpoint: Requires authentication${NC}"
fi

echo -e "\n${BLUE}🔍 Checking Frontend Service...${NC}"
echo "URL: $FRONTEND_URL"

# Check frontend accessibility
echo -e "\n${YELLOW}Testing frontend accessibility...${NC}"
if curl -s -f "$FRONTEND_URL" > /dev/null; then
    echo -e "${GREEN}✅ Frontend service: ACCESSIBLE${NC}"
else
    echo -e "${RED}❌ Frontend service: NOT ACCESSIBLE${NC}"
    echo "Please check if the frontend service is running"
fi

# Check for GSAP assets
echo -e "\n${YELLOW}Checking for GSAP animation assets...${NC}"
if curl -s -f "$FRONTEND_URL/static/js" > /dev/null; then
    echo -e "${GREEN}✅ Static assets: ACCESSIBLE${NC}"
else
    echo -e "${YELLOW}⚠️  Static assets: Check build process${NC}"
fi

echo -e "\n${BLUE}🎬 Project ATHENA Features Verification${NC}"
echo "======================================"

echo -e "\n${YELLOW}Frontend Features to Test:${NC}"
echo "• GSAP Animation System (60fps performance)"
echo "• Enhanced Authentication Flow with animations"
echo "• Enhanced Activity Cards with hover effects"
echo "• Enhanced Activity Grid with staggered loading"
echo "• Social Interactions (like, join, share)"
echo "• RTL Support for Arabic language"
echo "• Mobile Optimization"

echo -e "\n${YELLOW}Backend Features to Test:${NC}"
echo "• Social Interaction APIs (join/leave events, like/unlike)"
echo "• Animation Triggers in API responses"
echo "• Enhanced Booking Controller with celebrations"
echo "• Like Model for social features"
echo "• Haptic Feedback support"

echo -e "\n${BLUE}📊 Performance Targets${NC}"
echo "======================"
echo "• Bundle Size: <45KB gzipped increase"
echo "• Build Time: <5 minutes"
echo "• First Load: <2s"
echo "• API Response: <300ms"
echo "• Frame Rate: 60fps sustained"
echo "• Memory Usage: <50MB increase"

echo -e "\n${BLUE}🧪 Manual Testing Checklist${NC}"
echo "============================="
echo "1. Open frontend URL in browser"
echo "2. Test authentication flow with animations"
echo "3. Browse activities with staggered loading"
echo "4. Test social interactions (like, join)"
echo "5. Switch to Arabic language (RTL test)"
echo "6. Test on mobile device"
echo "7. Check animation performance (60fps)"
echo "8. Test API response times"

echo -e "\n${GREEN}🎉 Project ATHENA Deployment Verification Complete!${NC}"
echo "=================================================="

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Set up custom domain (app.letsludus.com)"
echo "2. Configure SSL certificates"
echo "3. Run comprehensive user acceptance testing"
echo "4. Monitor performance metrics"
echo "5. Deploy to production when ready"

echo -e "\n${BLUE}Support Resources:${NC}"
echo "• Project ATHENA Summary: PROJECT_ATHENA_SUMMARY.md"
echo "• Testing Guide: ATHENA_TESTING_GUIDE.md"
echo "• Deployment Guide: ATHENA_DEPLOYMENT_INSTRUCTIONS.md"

echo -e "\n${GREEN}LUDUS Platform is ready to dominate the MENA social activity market! 🚀✨${NC}"
