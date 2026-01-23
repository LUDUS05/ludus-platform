#!/bin/bash

# Test script for Project ATHENA Onboarding Pages
# Verifies both onboarding pages are accessible and functional

echo "🎬 Testing Project ATHENA Onboarding Pages..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "\n${BLUE}Testing: $test_name${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        ((TESTS_FAILED++))
    fi
}

# Test 1: Check if onboarding files exist
run_test "Onboarding files exist" "
    [ -f 'client/public/onboarding.html' ] && \
    [ -f 'client/public/onboarding.css' ] && \
    [ -f 'client/public/onboarding.js' ] && \
    [ -f 'client/public/onboarding-v2.html' ] && \
    [ -f 'client/public/onboarding-v2.css' ] && \
    [ -f 'client/public/onboarding-v2.js' ]
"

# Test 2: Check HTML structure
run_test "HTML structure validation" "
    grep -q '<!DOCTYPE html>' client/public/onboarding.html && \
    grep -q '<!DOCTYPE html>' client/public/onboarding-v2.html && \
    grep -q 'Project ATHENA' client/public/onboarding.html && \
    grep -q 'Project ATHENA' client/public/onboarding-v2.html
"

# Test 3: Check CSS structure
run_test "CSS structure validation" "
    grep -q 'onboarding' client/public/onboarding.css && \
    grep -q 'onboarding-v2' client/public/onboarding-v2.css && \
    grep -q 'gsap' client/public/onboarding.css && \
    grep -q 'gsap' client/public/onboarding-v2.css
"

# Test 4: Check JavaScript structure
run_test "JavaScript structure validation" "
    grep -q 'GSAP' client/public/onboarding.js && \
    grep -q 'GSAP' client/public/onboarding-v2.js && \
    grep -q 'initOnboarding' client/public/onboarding.js && \
    grep -q 'initOnboarding' client/public/onboarding-v2.js
"

# Test 5: Check for RTL support
run_test "RTL support implementation" "
    grep -q 'rtl' client/public/onboarding.css && \
    grep -q 'rtl' client/public/onboarding-v2.css && \
    grep -q 'toggleLanguage' client/public/onboarding.js && \
    grep -q 'toggleLanguage' client/public/onboarding-v2.js
"

# Test 6: Check for GSAP CDN links
run_test "GSAP CDN integration" "
    grep -q 'gsap.min.js' client/public/onboarding.html && \
    grep -q 'gsap.min.js' client/public/onboarding-v2.html && \
    grep -q 'ScrollTrigger' client/public/onboarding.html && \
    grep -q 'ScrollTrigger' client/public/onboarding-v2.html
"

# Test 7: Check for demo data
run_test "Demo data implementation" "
    grep -q 'demo' client/public/onboarding.html && \
    grep -q 'demo' client/public/onboarding-v2.html && \
    grep -q 'Ahmed' client/public/onboarding.html && \
    grep -q 'Sarah' client/public/onboarding-v2.html
"

# Test 8: Check for interactive elements
run_test "Interactive elements" "
    grep -q 'addEventListener' client/public/onboarding.js && \
    grep -q 'addEventListener' client/public/onboarding-v2.js && \
    grep -q 'button' client/public/onboarding.html && \
    grep -q 'button' client/public/onboarding-v2.html
"

# Test 9: Check for accessibility features
run_test "Accessibility features" "
    grep -q 'keydown' client/public/onboarding.js && \
    grep -q 'keydown' client/public/onboarding-v2.js && \
    grep -q 'aria' client/public/onboarding.html && \
    grep -q 'aria' client/public/onboarding-v2.html
"

# Test 10: Check file sizes (not too large)
run_test "File size optimization" "
    [ \$(wc -c < client/public/onboarding.html) -lt 50000 ] && \
    [ \$(wc -c < client/public/onboarding-v2.html) -lt 50000 ] && \
    [ \$(wc -c < client/public/onboarding.css) -lt 100000 ] && \
    [ \$(wc -c < client/public/onboarding-v2.css) -lt 100000 ]
"

# Test 11: Check for performance monitoring
run_test "Performance monitoring" "
    grep -q 'monitorPerformance' client/public/onboarding.js && \
    grep -q 'monitorPerformance' client/public/onboarding-v2.js && \
    grep -q 'fps' client/public/onboarding.js && \
    grep -q 'fps' client/public/onboarding-v2.js
"

# Test 12: Check for responsive design
run_test "Responsive design" "
    grep -q '@media' client/public/onboarding.css && \
    grep -q '@media' client/public/onboarding-v2.css && \
    grep -q 'max-width' client/public/onboarding.css && \
    grep -q 'max-width' client/public/onboarding-v2.css
"

# Summary
echo -e "\n${BLUE}=============================================="
echo -e "🎬 ONBOARDING PAGES TEST SUMMARY"
echo -e "==============================================${NC}"

echo -e "\n${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Onboarding pages are ready!${NC}"
    echo -e "\n${YELLOW}📋 Available Pages:${NC}"
    echo -e "   • Classic Design: client/public/onboarding.html"
    echo -e "   • Modern Design: client/public/onboarding-v2.html"
    echo -e "\n${YELLOW}🚀 Features Implemented:${NC}"
    echo -e "   • GSAP animations and interactions"
    echo -e "   • RTL language support (Arabic/English)"
    echo -e "   • Responsive design for all devices"
    echo -e "   • Keyboard navigation support"
    echo -e "   • Performance monitoring"
    echo -e "   • Accessibility features"
    echo -e "   • Demo data and interactive elements"
    echo -e "\n${BLUE}🎯 Next Steps:${NC}"
    echo -e "   1. Open both pages in browser to test visually"
    echo -e "   2. Test RTL toggle functionality"
    echo -e "   3. Test keyboard navigation (arrow keys, space, escape)"
    echo -e "   4. Test responsive design on different screen sizes"
    echo -e "   5. Verify GSAP animations are smooth"
    
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Please review the issues above.${NC}"
    exit 1
fi
