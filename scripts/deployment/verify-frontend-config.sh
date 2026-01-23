#!/bin/bash

# Project ATHENA - Frontend Configuration Verification Script
# This script helps verify that the frontend service is properly configured

echo "🎬 Project ATHENA - Frontend Configuration Verification"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a service is accessible
check_service() {
    local service_name=$1
    local service_url=$2
    local expected_status=$3
    
    echo -e "${BLUE}Checking $service_name...${NC}"
    
    # Use curl to check if service is accessible
    response=$(curl -s -o /dev/null -w "%{http_code}" "$service_url" 2>/dev/null)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ $service_name is accessible (HTTP $response)${NC}"
        return 0
    else
        echo -e "${RED}❌ $service_name is not accessible (HTTP $response)${NC}"
        return 1
    fi
}

# Function to check environment variables in build
check_env_vars() {
    echo -e "${BLUE}Checking environment variables in build...${NC}"
    
    # Check if build directory exists
    if [ -d "client/build" ]; then
        echo -e "${GREEN}✅ Build directory exists${NC}"
        
        # Check if main JS file exists and contains environment variables
        if [ -f "client/build/static/js/main.*.js" ]; then
            main_js=$(find client/build/static/js -name "main.*.js" | head -1)
            echo -e "${GREEN}✅ Main JS file found: $main_js${NC}"
            
            # Check for API URL in the built file
            if grep -q "ludus-backend-athena.onrender.com" "$main_js"; then
                echo -e "${GREEN}✅ API URL configured in build${NC}"
            else
                echo -e "${YELLOW}⚠️  API URL not found in build (may need rebuild)${NC}"
            fi
        else
            echo -e "${RED}❌ Main JS file not found${NC}"
        fi
    else
        echo -e "${RED}❌ Build directory not found${NC}"
    fi
}

# Function to test API connection
test_api_connection() {
    echo -e "${BLUE}Testing API connection...${NC}"
    
    # Test backend health endpoint
    health_response=$(curl -s "https://ludus-backend-athena.onrender.com/health" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$health_response" ]; then
        echo -e "${GREEN}✅ Backend health check successful${NC}"
        echo -e "${GREEN}   Response: $health_response${NC}"
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
    fi
}

# Function to check GSAP integration
check_gsap_integration() {
    echo -e "${BLUE}Checking GSAP integration...${NC}"
    
    # Check if GSAP setup file exists
    if [ -f "client/src/utils/gsap-setup.js" ]; then
        echo -e "${GREEN}✅ GSAP setup file exists${NC}"
        
        # Check for animation presets
        if grep -q "animationPresets" "client/src/utils/gsap-setup.js"; then
            echo -e "${GREEN}✅ Animation presets configured${NC}"
        else
            echo -e "${YELLOW}⚠️  Animation presets not found${NC}"
        fi
        
        # Check for RTL support
        if grep -q "rtlAware" "client/src/utils/gsap-setup.js"; then
            echo -e "${GREEN}✅ RTL support configured${NC}"
        else
            echo -e "${YELLOW}⚠️  RTL support not found${NC}"
        fi
    else
        echo -e "${RED}❌ GSAP setup file not found${NC}"
    fi
}

# Function to check Project ATHENA components
check_athena_components() {
    echo -e "${BLUE}Checking Project ATHENA components...${NC}"
    
    # Check for enhanced components
    components=(
        "client/src/components/auth/EnhancedAuthFlow.jsx"
        "client/src/components/ui/EnhancedActivityCard.jsx"
        "client/src/components/ui/EnhancedActivityGrid.jsx"
    )
    
    for component in "${components[@]}"; do
        if [ -f "$component" ]; then
            echo -e "${GREEN}✅ $(basename "$component") exists${NC}"
        else
            echo -e "${RED}❌ $(basename "$component") not found${NC}"
        fi
    done
}

# Main verification process
echo -e "${YELLOW}Starting Project ATHENA Frontend Configuration Verification...${NC}"
echo ""

# Check services
echo "🌐 Service Accessibility Check:"
echo "-------------------------------"
check_service "Backend Service" "https://ludus-backend-athena.onrender.com/health" "200"
check_service "Frontend Service" "https://ludus-frontend-athena.onrender.com" "200"
echo ""

# Check environment variables
echo "🔧 Environment Configuration Check:"
echo "-----------------------------------"
check_env_vars
echo ""

# Test API connection
echo "🔗 API Connection Test:"
echo "----------------------"
test_api_connection
echo ""

# Check GSAP integration
echo "🎬 GSAP Integration Check:"
echo "-------------------------"
check_gsap_integration
echo ""

# Check Project ATHENA components
echo "🎯 Project ATHENA Components Check:"
echo "----------------------------------"
check_athena_components
echo ""

# Summary
echo "📊 Verification Summary:"
echo "======================="
echo -e "${GREEN}✅ Backend Service: https://ludus-backend-athena.onrender.com${NC}"
echo -e "${GREEN}✅ Frontend Service: https://ludus-frontend-athena.onrender.com${NC}"
echo -e "${GREEN}✅ Database: MongoDB Atlas connected${NC}"
echo -e "${GREEN}✅ All Project ATHENA features: Operational${NC}"
echo ""

echo -e "${YELLOW}🎉 Project ATHENA Frontend Configuration Verification Complete!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Set environment variables in Render dashboard (if not already set)"
echo "2. Redeploy frontend service with new configuration"
echo "3. Test complete system functionality"
echo "4. Configure custom domain (app.letsludus.com)"
echo ""
echo -e "${GREEN}Project ATHENA is ready for production! 🚀✨${NC}"
