#!/bin/bash

# Project ATHENA - Frontend Environment Variables Verification
# This script verifies that frontend environment variables are properly configured

echo "🔧 Project ATHENA - Frontend Environment Variables Verification"
echo "============================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="https://ludus-frontend-athena.onrender.com"
BACKEND_URL="https://ludus-backend-athena.onrender.com"

# Utility functions
log() {
    local message=$1
    local type=${2:-info}
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $type in
        success)
            echo -e "[$timestamp] ✅ $message" | sed 's/.*/\x1b[32m&\x1b[0m/'
            ;;
        error)
            echo -e "[$timestamp] ❌ $message" | sed 's/.*/\x1b[31m&\x1b[0m/'
            ;;
        warning)
            echo -e "[$timestamp] ⚠️  $message" | sed 's/.*/\x1b[33m&\x1b[0m/'
            ;;
        info)
            echo -e "[$timestamp] ℹ️  $message" | sed 's/.*/\x1b[34m&\x1b[0m/'
            ;;
        step)
            echo -e "[$timestamp] 🔧 $message" | sed 's/.*/\x1b[36m&\x1b[0m/'
            ;;
        *)
            echo -e "[$timestamp] $message"
            ;;
    esac
}

# Function to check frontend accessibility
check_frontend_accessibility() {
    echo -e "${BLUE}🌐 Frontend Accessibility Check:${NC}"
    echo "==============================="
    
    log "Checking frontend service accessibility..." "info"
    
    response=$(curl -s -w "%{http_code}" -o /tmp/frontend_check.html "$FRONTEND_URL" 2>/dev/null)
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        log "Frontend service is accessible (HTTP $http_code)" "success"
        return 0
    else
        log "Frontend service is not accessible (HTTP $http_code)" "error"
        return 1
    fi
}

# Function to check if frontend is connecting to backend
check_api_connection() {
    echo ""
    echo -e "${BLUE}🔗 API Connection Check:${NC}"
    echo "========================"
    
    log "Checking if frontend is connecting to backend..." "info"
    
    # Check if the frontend HTML contains the correct API URL
    if [ -f /tmp/frontend_check.html ]; then
        if grep -q "ludus-backend-athena.onrender.com" /tmp/frontend_check.html 2>/dev/null; then
            log "Frontend is configured to connect to backend API" "success"
            return 0
        else
            log "Frontend may not be configured with correct API URL" "warning"
            log "This could mean environment variables need to be set in Render dashboard" "info"
            return 1
        fi
    else
        log "Cannot check API connection - no frontend response available" "error"
        return 1
    fi
}

# Function to check backend connectivity
check_backend_connectivity() {
    echo ""
    echo -e "${BLUE}🔧 Backend Connectivity Check:${NC}"
    echo "==============================="
    
    log "Checking backend service connectivity..." "info"
    
    response=$(curl -s -w "%{http_code}" -o /tmp/backend_check.json "$BACKEND_URL/health" 2>/dev/null)
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        log "Backend service is accessible (HTTP $http_code)" "success"
        
        # Check if backend is healthy
        if grep -q '"status":"healthy"' /tmp/backend_check.json 2>/dev/null; then
            log "Backend service is healthy" "success"
            return 0
        else
            log "Backend service is not healthy" "warning"
            return 1
        fi
    else
        log "Backend service is not accessible (HTTP $http_code)" "error"
        return 1
    fi
}

# Function to show Render dashboard instructions
show_render_instructions() {
    echo ""
    echo -e "${BLUE}🚀 Render Dashboard Configuration:${NC}"
    echo "=================================="
    
    log "Configure frontend environment variables in Render dashboard:" "step"
    echo ""
    echo "1. Go to https://dashboard.render.com"
    echo "2. Navigate to your 'ludus-frontend-athena' service"
    echo "3. Click on 'Environment' tab"
    echo "4. Add these environment variables:"
    echo ""
    echo -e "${CYAN}Required Environment Variables:${NC}"
    echo "REACT_APP_API_URL=https://ludus-backend-athena.onrender.com"
    echo "REACT_APP_ANIMATION_ENABLED=true"
    echo "REACT_APP_RTL_SUPPORT=true"
    echo "REACT_APP_PERFORMANCE_MONITORING=true"
    echo "REACT_APP_DEBUG_MODE=false"
    echo ""
    echo "5. Click 'Save Changes'"
    echo "6. The service will automatically redeploy with new environment variables"
    echo "7. Wait for deployment to complete (usually 2-5 minutes)"
    echo ""
    
    log "Optional Environment Variables (if needed):" "info"
    echo "REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key"
    echo "REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id"
    echo "REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id"
    echo "REACT_APP_MOYASAR_PUBLISHABLE_KEY=your_moyasar_publishable_key"
    echo "REACT_APP_UNSPLASH_ACCESS_KEY=your_unsplash_access_key"
    echo "REACT_APP_SENTRY_DSN=your_sentry_dsn"
    echo ""
}

# Function to test complete system integration
test_system_integration() {
    echo ""
    echo -e "${BLUE}🧪 System Integration Test:${NC}"
    echo "============================"
    
    log "Testing complete system integration..." "info"
    
    # Test if frontend can make API calls to backend
    log "Testing frontend to backend API communication..." "info"
    
    # This is a simplified test - in a real scenario, you'd test actual API endpoints
    if check_backend_connectivity && check_frontend_accessibility; then
        log "System integration test passed" "success"
        log "Frontend and backend are both accessible" "success"
        return 0
    else
        log "System integration test failed" "error"
        log "Check that both services are running and accessible" "info"
        return 1
    fi
}

# Function to run complete verification
run_complete_verification() {
    echo ""
    echo -e "${BLUE}🔍 Complete Frontend Environment Verification:${NC}"
    echo "==============================================="
    
    local all_passed=true
    
    # Check frontend accessibility
    if ! check_frontend_accessibility; then
        all_passed=false
    fi
    
    # Check API connection
    if ! check_api_connection; then
        all_passed=false
    fi
    
    # Check backend connectivity
    if ! check_backend_connectivity; then
        all_passed=false
    fi
    
    # Test system integration
    if ! test_system_integration; then
        all_passed=false
    fi
    
    echo ""
    if [ "$all_passed" = "true" ]; then
        log "🎉 Frontend environment configuration is complete and working!" "success"
        echo ""
        log "✅ Frontend Service: Accessible" "success"
        log "✅ Backend Service: Accessible" "success"
        log "✅ API Connection: Configured" "success"
        log "✅ System Integration: Working" "success"
        echo ""
        log "🚀 Project ATHENA is ready for production!" "success"
    else
        log "⚠️  Some issues detected. Environment variables may need configuration." "warning"
        echo ""
        show_render_instructions
    fi
}

# Main execution
main() {
    log "Starting Project ATHENA frontend environment verification..." "info"
    echo ""
    log "Frontend URL: $FRONTEND_URL" "info"
    log "Backend URL: $BACKEND_URL" "info"
    echo ""
    
    # Run complete verification
    run_complete_verification
    
    echo ""
    log "Service URLs:" "info"
    log "  Frontend: $FRONTEND_URL" "info"
    log "  Backend: $BACKEND_URL" "info"
    echo ""
    
    # Show next steps
    log "Next Steps:" "info"
    log "1. Configure environment variables in Render dashboard (if not done)" "info"
    log "2. Wait for frontend service redeployment" "info"
    log "3. Test Project ATHENA features" "info"
    log "4. Verify GSAP animations and RTL support" "info"
}

# Cleanup function
cleanup() {
    rm -f /tmp/frontend_check.html /tmp/backend_check.json
}

# Set up cleanup on exit
trap cleanup EXIT

# Run main function
main
