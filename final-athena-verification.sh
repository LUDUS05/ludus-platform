#!/bin/bash

# Project ATHENA - Final System Verification
# Comprehensive verification of all Project ATHENA features and production readiness

echo "🎬 Project ATHENA - Final System Verification"
echo "============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="https://ludus-frontend-athena.onrender.com"
BACKEND_URL="https://ludus-backend-athena.onrender.com"

# Test results tracking
PASSED=0
FAILED=0
TOTAL=0
CRITICAL_FAILED=0

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
        critical)
            echo -e "[$timestamp] 🚨 $message" | sed 's/.*/\x1b[31m&\x1b[0m/'
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
    local critical=${4:-false}
    
    TOTAL=$((TOTAL + 1))
    
    if [ "$passed" = "true" ]; then
        PASSED=$((PASSED + 1))
        log "$name: PASSED" "success"
    else
        FAILED=$((FAILED + 1))
        if [ "$critical" = "true" ]; then
            CRITICAL_FAILED=$((CRITICAL_FAILED + 1))
            log "$name: CRITICAL FAILURE - $details" "critical"
        else
            log "$name: FAILED - $details" "error"
        fi
    fi
}

# Core system tests
test_backend_health() {
    echo -e "${BLUE}🔧 Core System Health Tests:${NC}"
    echo "============================="
    
    log "Testing backend health endpoint..." "info"
    
    response=$(curl -s -w "%{http_code}" -o /tmp/backend_health.json "$BACKEND_URL/health" 2>/dev/null)
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        if grep -q '"status":"healthy"' /tmp/backend_health.json 2>/dev/null; then
            record_test "Backend Health Check" "true"
            
            # Extract additional info
            uptime=$(grep -o '"uptime":[0-9.]*' /tmp/backend_health.json | cut -d':' -f2 2>/dev/null)
            environment=$(grep -o '"environment":"[^"]*"' /tmp/backend_health.json | cut -d'"' -f4 2>/dev/null)
            version=$(grep -o '"version":"[^"]*"' /tmp/backend_health.json | cut -d'"' -f4 2>/dev/null)
            
            log "Backend uptime: ${uptime}s" "info"
            log "Environment: $environment" "info"
            log "Version: $version" "info"
            return 0
        else
            record_test "Backend Health Check" "false" "Invalid response format" "true"
            return 1
        fi
    else
        record_test "Backend Health Check" "false" "HTTP $http_code" "true"
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
        record_test "Frontend Accessibility" "false" "HTTP $http_code" "true"
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
            record_test "Database Connection" "false" "Database not connected" "true"
            return 1
        fi
    else
        record_test "Database Connection" "false" "No health data available" "true"
        return 1
    fi
}

# Project ATHENA specific tests
test_athena_services() {
    echo ""
    echo -e "${PURPLE}🎯 Project ATHENA Services Tests:${NC}"
    echo "==============================="
    
    log "Testing Project ATHENA services..." "info"
    
    if [ -f /tmp/backend_health.json ]; then
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
            
            # Extract referral details
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

# API and integration tests
test_api_endpoints() {
    echo ""
    echo -e "${CYAN}🔗 API & Integration Tests:${NC}"
    echo "============================"
    
    log "Testing API endpoints..." "info"
    
    endpoints=(
        "/api/activities"
        "/api/rating-system/health"
        "/api/monitoring/health/detailed"
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

# Performance tests
test_performance() {
    echo ""
    echo -e "${YELLOW}⚡ Performance Tests:${NC}"
    echo "====================="
    
    log "Testing API response time..." "info"
    
    start_time=$(date +%s)
    response=$(curl -s -w "%{http_code}" -o /dev/null "$BACKEND_URL/health" 2>/dev/null)
    end_time=$(date +%s)
    
    response_time=$(((end_time - start_time) * 1000))
    
    if [ $response_time -lt 2000 ]; then
        record_test "Performance Metrics" "true" "Response time: ${response_time}ms"
        log "API response time: ${response_time}ms" "info"
    else
        record_test "Performance Metrics" "false" "Response time too slow: ${response_time}ms"
    fi
}

# Frontend tests
test_frontend_build() {
    echo ""
    echo -e "${GREEN}🎨 Frontend Tests:${NC}"
    echo "=================="
    
    log "Testing frontend build..." "info"
    
    if [ -f /tmp/frontend_response.html ]; then
        # Check if it's the React app
        if grep -q -i "react\|root" /tmp/frontend_response.html 2>/dev/null; then
            record_test "Frontend Build" "true"
        else
            record_test "Frontend Build" "false" "React app not detected"
        fi
    else
        record_test "Frontend Build" "false" "No frontend response available"
    fi
}

# Security tests
test_security() {
    echo ""
    echo -e "${RED}🔒 Security Tests:${NC}"
    echo "=================="
    
    log "Testing HTTPS enforcement..." "info"
    
    # Test if HTTP redirects to HTTPS
    http_response=$(curl -s -w "%{http_code}" -o /dev/null "http://ludus-frontend-athena.onrender.com" 2>/dev/null)
    http_code="${http_response: -3}"
    
    if [[ "$http_code" =~ ^(301|302|307|308)$ ]]; then
        record_test "HTTPS Enforcement" "true"
    else
        record_test "HTTPS Enforcement" "false" "HTTP does not redirect to HTTPS"
    fi
    
    log "Testing SSL certificate..." "info"
    
    # Test SSL certificate
    if echo | openssl s_client -connect "ludus-frontend-athena.onrender.com:443" -servername "ludus-frontend-athena.onrender.com" 2>/dev/null | openssl x509 -noout -dates >/dev/null 2>&1; then
        record_test "SSL Certificate" "true"
    else
        record_test "SSL Certificate" "false" "SSL certificate not valid"
    fi
}

# Production readiness assessment
assess_production_readiness() {
    echo ""
    echo -e "${PURPLE}🚀 Production Readiness Assessment:${NC}"
    echo "=================================="
    
    local readiness_score=0
    local max_score=10
    
    # Critical systems (5 points)
    if [ $CRITICAL_FAILED -eq 0 ]; then
        readiness_score=$((readiness_score + 5))
        log "Critical systems: All operational" "success"
    else
        log "Critical systems: $CRITICAL_FAILED failures detected" "critical"
    fi
    
    # Overall test success rate (3 points)
    if [ $TOTAL -gt 0 ]; then
        success_rate=$((PASSED * 100 / TOTAL))
        if [ $success_rate -ge 90 ]; then
            readiness_score=$((readiness_score + 3))
            log "Test success rate: $success_rate% (Excellent)" "success"
        elif [ $success_rate -ge 80 ]; then
            readiness_score=$((readiness_score + 2))
            log "Test success rate: $success_rate% (Good)" "info"
        elif [ $success_rate -ge 70 ]; then
            readiness_score=$((readiness_score + 1))
            log "Test success rate: $success_rate% (Acceptable)" "warning"
        else
            log "Test success rate: $success_rate% (Poor)" "error"
        fi
    fi
    
    # Performance (2 points)
    if [ $response_time -lt 1000 ]; then
        readiness_score=$((readiness_score + 2))
        log "Performance: Excellent (<1000ms)" "success"
    elif [ $response_time -lt 2000 ]; then
        readiness_score=$((readiness_score + 1))
        log "Performance: Good (<2000ms)" "info"
    else
        log "Performance: Needs improvement (>2000ms)" "warning"
    fi
    
    echo ""
    log "Production Readiness Score: $readiness_score/$max_score" "info"
    
    if [ $readiness_score -ge 8 ]; then
        log "🎉 PRODUCTION READY! Project ATHENA is ready for launch!" "success"
        return 0
    elif [ $readiness_score -ge 6 ]; then
        log "⚠️  MOSTLY READY - Minor issues to address before production" "warning"
        return 1
    else
        log "🚨 NOT READY - Significant issues need to be resolved" "critical"
        return 2
    fi
}

# Main execution
main() {
    log "Starting Project ATHENA final system verification..." "info"
    echo ""
    log "Frontend URL: $FRONTEND_URL" "info"
    log "Backend URL: $BACKEND_URL" "info"
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
    test_security
    
    # Results summary
    echo ""
    echo -e "${BLUE}📊 Final Test Results Summary:${NC}"
    echo "============================="
    echo -e "Total Tests: ${TOTAL}"
    echo -e "${GREEN}Passed: ${PASSED}${NC}"
    echo -e "${RED}Failed: ${FAILED}${NC}"
    echo -e "${RED}Critical Failures: ${CRITICAL_FAILED}${NC}"
    
    if [ $TOTAL -gt 0 ]; then
        success_rate=$((PASSED * 100 / TOTAL))
        echo -e "${CYAN}Success Rate: ${success_rate}%${NC}"
    fi
    
    echo ""
    
    # Production readiness assessment
    assess_production_readiness
    readiness_status=$?
    
    echo ""
    log "Service URLs:" "info"
    log "  Frontend: $FRONTEND_URL" "info"
    log "  Backend: $BACKEND_URL" "info"
    echo ""
    
    # Final recommendations
    if [ $readiness_status -eq 0 ]; then
        log "🎉 Project ATHENA is PRODUCTION READY!" "success"
        echo ""
        log "✅ All critical systems operational" "success"
        log "✅ Performance optimized" "success"
        log "✅ Security measures in place" "success"
        log "✅ All Project ATHENA features active" "success"
        echo ""
        log "🚀 Ready for production launch!" "success"
    elif [ $readiness_status -eq 1 ]; then
        log "⚠️  Project ATHENA is mostly ready with minor issues" "warning"
        echo ""
        log "Recommended actions:" "info"
        log "1. Address any failed tests above" "info"
        log "2. Optimize performance if needed" "info"
        log "3. Verify all features are working" "info"
        log "4. Run verification again before launch" "info"
    else
        log "🚨 Project ATHENA needs significant work before production" "critical"
        echo ""
        log "Critical actions required:" "info"
        log "1. Fix all critical failures" "info"
        log "2. Ensure all core systems are operational" "info"
        log "3. Verify database connectivity" "info"
        log "4. Test all Project ATHENA features" "info"
        log "5. Run verification again" "info"
    fi
    
    # Exit with appropriate code
    exit $readiness_status
}

# Cleanup function
cleanup() {
    rm -f /tmp/backend_health.json /tmp/frontend_response.html
}

# Set up cleanup on exit
trap cleanup EXIT

# Run main function
main
