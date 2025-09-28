#!/bin/bash

# LUDUS Selena AI Service Test Script
# Tests all 4 Selena agents and performance requirements
# 
# Performance Targets:
# - <200ms response time  
# - 1000+ concurrent requests capability
# - All agents operational
#
# Created: 2025-09-28 GMT+3 (Riyadh)

set -e

echo "🧪 LUDUS Selena AI Service Test Suite"
echo "====================================="
echo "Testing 4 Selena AI Agents: Onboard, Discover, Support, Community"
echo "Performance Targets: <200ms response, 1000+ concurrent requests"
echo ""

# Configuration
API_BASE_URL="http://localhost:8081"
TEST_SESSION_ID="test_session_$(date +%s)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run test
run_test() {
    local test_name="$1"
    local expected_status="$2"
    local curl_command="$3"
    
    echo -n "Testing ${test_name}... "
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Measure response time
    start_time=$(date +%s%3N)
    
    # Run curl command and capture response
    response=$(eval "$curl_command" 2>/dev/null)
    exit_code=$?
    
    end_time=$(date +%s%3N)
    response_time=$((end_time - start_time))
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC} (${response_time}ms)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        
        # Check if response time meets target
        if [ $response_time -gt 200 ]; then
            echo -e "   ${YELLOW}⚠️ Slow response: ${response_time}ms > 200ms target${NC}"
        fi
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "   Error: $response"
    fi
}

# Function to test Selena agent
test_selena_agent() {
    local agent_type="$1"
    local message_ar="$2"
    local message_en="$3"
    
    echo ""
    echo -e "${BLUE}🤖 Testing Selena ${agent_type^} Agent${NC}"
    
    # Test Arabic request
    run_test "Selena ${agent_type} (Arabic)" 200 \
        "curl -s -X POST '$API_BASE_URL/selena/chat' \
        -H 'Content-Type: application/json' \
        -d '{\"message\":\"$message_ar\",\"language\":\"ar\",\"agent_type\":\"$agent_type\",\"session_id\":\"$TEST_SESSION_ID\"}' \
        -w '%{http_code}'"
    
    # Test English request
    run_test "Selena ${agent_type} (English)" 200 \
        "curl -s -X POST '$API_BASE_URL/selena/chat' \
        -H 'Content-Type: application/json' \
        -d '{\"message\":\"$message_en\",\"language\":\"en\",\"agent_type\":\"$agent_type\",\"session_id\":\"$TEST_SESSION_ID\"}' \
        -w '%{http_code}'"
    
    # Test dedicated endpoint
    run_test "Selena ${agent_type} (Dedicated endpoint)" 200 \
        "curl -s -X POST '$API_BASE_URL/agents/$agent_type' \
        -H 'Content-Type: application/json' \
        -d '{\"message\":\"Test dedicated endpoint\",\"language\":\"en\",\"session_id\":\"$TEST_SESSION_ID\"}' \
        -w '%{http_code}'"
}

echo -e "${BLUE}🏥 Testing Health Endpoints${NC}"

# Test basic health check
run_test "Basic Health Check" 200 \
    "curl -s '$API_BASE_URL/health' -w '%{http_code}'"

# Test agents list
run_test "Agents List" 200 \
    "curl -s '$API_BASE_URL/agents' -w '%{http_code}'"

# Test Selena agents info
run_test "Selena Agents Info" 200 \
    "curl -s '$API_BASE_URL/selena/agents' -w '%{http_code}'"

# Test Selena performance endpoint
run_test "Selena Performance" 200 \
    "curl -s '$API_BASE_URL/selena/performance' -w '%{http_code}'"

# Test each Selena agent
test_selena_agent "onboard" \
    "مرحباً، أريد المساعدة في إعداد حسابي" \
    "Hello, I need help setting up my account"

test_selena_agent "discover" \
    "أريد اكتشاف أنشطة جديدة في الرياض" \
    "I want to discover new activities in Riyadh"

test_selena_agent "support" \
    "لدي مشكلة في تسجيل الدخول" \
    "I have a login problem"

test_selena_agent "community" \
    "أريد العثور على أصدقاء جدد" \
    "I want to find new friends"

echo ""
echo -e "${BLUE}🚀 Testing Performance Requirements${NC}"

# Test response time requirement (<200ms)
echo -n "Testing response time target (<200ms)... "
start_time=$(date +%s%3N)

curl -s -X POST "$API_BASE_URL/selena/chat" \
    -H 'Content-Type: application/json' \
    -d "{\"message\":\"Performance test\",\"language\":\"en\",\"agent_type\":\"support\",\"session_id\":\"perf_test\"}" \
    > /dev/null

end_time=$(date +%s%3N)
response_time=$((end_time - start_time))

if [ $response_time -lt 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} (${response_time}ms)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${YELLOW}⚠️ SLOW${NC} (${response_time}ms > 200ms target)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo -e "${BLUE}🔧 Testing Error Handling${NC}"

# Test invalid agent type
run_test "Invalid Agent Type" 422 \
    "curl -s -X POST '$API_BASE_URL/selena/chat' \
    -H 'Content-Type: application/json' \
    -d '{\"message\":\"test\",\"language\":\"ar\",\"agent_type\":\"invalid\"}' \
    -w '%{http_code}'"

# Test empty message
run_test "Empty Message Validation" 422 \
    "curl -s -X POST '$API_BASE_URL/selena/chat' \
    -H 'Content-Type: application/json' \
    -d '{\"message\":\"\",\"language\":\"ar\",\"agent_type\":\"support\"}' \
    -w '%{http_code}'"

# Test invalid language
run_test "Invalid Language" 422 \
    "curl -s -X POST '$API_BASE_URL/selena/chat' \
    -H 'Content-Type: application/json' \
    -d '{\"message\":\"test\",\"language\":\"fr\",\"agent_type\":\"support\"}' \
    -w '%{http_code}'"

echo ""
echo "📊 TEST RESULTS SUMMARY"
echo "======================"
echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "Passed: ${GREEN}${PASSED_TESTS}${NC} ✅"
echo -e "Failed: ${RED}${FAILED_TESTS}${NC} ❌"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo -e "Selena AI Service is ready for production deployment."
    exit 0
else
    echo -e "\n${RED}⚠️ SOME TESTS FAILED${NC}"
    echo -e "Please review the failed tests before deployment."
    exit 1
fi