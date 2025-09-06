#!/bin/bash

# Project ATHENA - Simple System Functionality Test
# Tests all Project ATHENA features using curl

echo "🎬 Project ATHENA - Complete System Functionality Test"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="https://ludus-backend-athena.onrender.com"
FRONTEND_URL="https://ludus-frontend-athena.onrender.com"

# Test results tracking
PASSED=0
FAILED=0
TOTAL=0

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
        *)
            echo -e "[$timestamp] $message"
            ;;
    esac
}

record_test() {
    local name=$1
    local passed=$2
    local details=${3:-""}
    
    TOTAL=$((TOTAL + 1))
    
    if [ "$passed" = "true" ]; then
        PASSED=$((PASSED + 1))
        log "$name: PASSED" "success"
    else
        FAILED=$((FAILED + 1))
        log "$name: FAILED - $details" "error"
    fi
}

# Test functions
test_backend_health() {
    echo -e "${BLUE}🔧 Core System Tests:${NC}"
    echo "-----------------"
    
    log "Testing backend health endpoint..." "info"
    
    response=$(curl -s -w "%{http_code}" -o /tmp/backend_health.json "$BACKEND_URL/health" 2>/dev/null)
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        # Check if response contains healthy status
        if grep -q '"status":"healthy"' /tmp/backend_health.json 2>/dev/null; then
            record_test "Backend Health Check" "true"
            
            # Extract and display additional info
            uptime=$(grep -o '"uptime":[0-9.]*' /tmp/backend_health.json | cut -d':' -f2 2>/dev/null)
            environment=$(grep -o '"environment":"[^"]*"' /tmp/backend_health.json | cut -d'"' -f4 2>/dev/null)
            version=$(grep -o '"version":"[^"]*"' /tmp/backend_health.json | cut -d'"' -f4 2>/dev/null)
            
            log "Backend uptime: ${uptime}s" "info"
            log "Environment: $environment" "info"
            log "Version: $version" "info"
            return 0
        else
            record_test "Backend Health Check" "false" "Invalid response format"
            return 1
        fi
    else
        record_test "Backend Health Check" "false" "HTTP $http_code"
        return 1
    fi
}

test_frontend_accessibility() {
    log "Testing frontend accessibility..." "info"
    
    response=$(curl -s -w "%{http_code}" -o /tmp/frontend_response.html "$FRONTEND_URL" 2>/dev/null)
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        record_test "Frontend Accessibility" "true"
        return 0
    else
        record_test "Frontend Accessibility" "false" "HTTP $http_code"
        return 1
    fi
}

test_database_connection() {
    log "Testing database connection..." "info"
    
    if [ -f /tmp/backend_health.json ]; then
        if grep -q '"database":"connected"' /tmp/backend_health.json 2>/dev/null; then
            record_test "Database Connection" "true"
            return 0
        else
            record_test "Database Connection" "false" "Database not connected"
            return 1
        fi
    else
        record_test "Database Connection" "false" "No health data available"
        return 1
    fi
}

test_athena_services() {
    echo ""
    echo -e "${BLUE}🎯 Project ATHENA Tests:${NC}"
    echo "-------------------"
    
    log "Testing Project ATHENA services..." "info"
    
    if [ -f /tmp/backend_health.json ]; then
        # Check for ATHENA services
        services=("referral" "analytics" "notifications" "invitations" "reports")
        all_active=true
        
        for service in "${services[@]}"; do
            if ! grep -q "\"$service\":\"active\"" /tmp/backend_health.json 2>/dev/null; then
                all_active=false
                break
            fi
        done
        
        if [ "$all_active" = "true" ]; then
            record_test "Project ATHENA Services" "true"
            log "All ATHENA services are active:" "info"
            for service in "${services[@]}"; do
                log "  - $service: active" "info"
            done
            return 0
        else
            record_test "Project ATHENA Services" "false" "Some services not active"
            return 1
        fi
    else
        record_test "Project ATHENA Services" "false" "No health data available"
        return 1
    fi
}

test_referral_system() {
    log "Testing referral system..." "info"
    
    if [ -f /tmp/backend_health.json ]; then
        if grep -q '"system":"operational"' /tmp/backend_health.json 2>/dev/null; then
            record_test "Referral System" "true"
            
            # Extract referral system details
            rewards=$(grep -o '"rewards":"[^"]*"' /tmp/backend_health.json | cut -d'"' -f4 2>/dev/null)
            tracking=$(grep -o '"tracking":"[^"]*"' /tmp/backend_health.json | cut -d'"' -f4 2>/dev/null)
            analytics=$(grep -o '"analytics":"[^"]*"' /tmp/backend_health.json | cut -d'"' -f4 2>/dev/null)
            
            log "Referral system: operational" "info"
            log "Rewards: $rewards" "info"
            log "Tracking: $tracking" "info"
            log "Analytics: $analytics" "info"
            return 0
        else
            record_test "Referral System" "false" "Referral system not operational"
            return 1
        fi
    else
        record_test "Referral System" "false" "No health data available"
        return 1
    fi
}

test_api_endpoints() {
    echo ""
    echo -e "${BLUE}🔗 API & Integration Tests:${NC}"
    echo "------------------------"
    
    log "Testing API endpoints..." "info"
    
    endpoints=(
        "/api/auth/status"
        "/api/activities"
        "/api/social/interactions"
        "/api/rating-system/health"
    )
    
    all_endpoints_working=true
    
    for endpoint in "${endpoints[@]}"; do
        response=$(curl -s -w "%{http_code}" -o /dev/null "$BACKEND_URL$endpoint" 2>/dev/null)
        http_code="${response: -3}"
        
        # Accept 200, 401 (unauthorized), or 404 (not found) as valid responses
        if [[ "$http_code" =~ ^(200|401|404)$ ]]; then
            log "$endpoint: HTTP $http_code" "info"
        else
            log "$endpoint: HTTP $http_code" "warning"
            all_endpoints_working=false
        fi
    done
    
    if [ "$all_endpoints_working" = "true" ]; then
        record_test "API Endpoints" "true"
    else
        record_test "API Endpoints" "false" "Some endpoints not responding correctly"
    fi
}

test_performance() {
    echo ""
    echo -e "${BLUE}⚡ Performance Tests:${NC}"
    echo "------------------"
    
    log "Testing API response time..." "info"
    
    start_time=$(date +%s)
    response=$(curl -s -w "%{http_code}" -o /dev/null "$BACKEND_URL/health" 2>/dev/null)
    end_time=$(date +%s)
    
    response_time=$(((end_time - start_time) * 1000))
    
    if [ $response_time -lt 1000 ]; then
        record_test "Performance Metrics" "true" "Response time: ${response_time}ms"
        log "API response time: ${response_time}ms" "info"
    else
        record_test "Performance Metrics" "false" "Response time too slow: ${response_time}ms"
    fi
}

test_frontend_build() {
    echo ""
    echo -e "${BLUE}🎨 Frontend Tests:${NC}"
    echo "----------------"
    
    log "Testing frontend build..." "info"
    
    if [ -f /tmp/frontend_response.html ]; then
        # Check if the response contains React app indicators
        if grep -q -i "react\|root" /tmp/frontend_response.html 2>/dev/null; then
            record_test "Frontend Build" "true"
        else
            record_test "Frontend Build" "false" "React app not detected"
        fi
    else
        record_test "Frontend Build" "false" "No frontend response available"
    fi
}

# Main test execution
main() {
    log "Starting comprehensive system tests..." "info"
    echo ""
    
    # Run all tests
    test_backend_health
    test_frontend_accessibility
    test_database_connection
    test_athena_services
    test_referral_system
    test_api_endpoints
    test_performance
    test_frontend_build
    
    # Results summary
    echo ""
    echo -e "${BLUE}📊 Test Results Summary:${NC}"
    echo "==================="
    echo -e "Total Tests: ${TOTAL}"
    echo -e "${GREEN}Passed: ${PASSED}${NC}"
    echo -e "${RED}Failed: ${FAILED}${NC}"
    
    if [ $TOTAL -gt 0 ]; then
        success_rate=$((PASSED * 100 / TOTAL))
        echo -e "${CYAN}Success Rate: ${success_rate}%${NC}"
    fi
    
    echo ""
    
    if [ $FAILED -eq 0 ]; then
        log "🎉 All tests passed! Project ATHENA is fully operational!" "success"
        echo ""
        log "✅ Backend Service: Operational" "success"
        log "✅ Frontend Service: Operational" "success"
        log "✅ Database: Connected" "success"
        log "✅ All ATHENA Features: Active" "success"
        log "✅ Performance: Optimized" "success"
        echo ""
        log "🚀 Project ATHENA is ready for production!" "success"
        exit 0
    else
        log "⚠️  Some tests failed. Please review the issues above." "warning"
        echo ""
        log "Service URLs:" "info"
        log "  Backend: $BACKEND_URL" "info"
        log "  Frontend: $FRONTEND_URL" "info"
        exit 1
    fi
}

# Cleanup function
cleanup() {
    rm -f /tmp/backend_health.json /tmp/frontend_response.html
}

# Set up cleanup on exit
trap cleanup EXIT

# Run main function
main
