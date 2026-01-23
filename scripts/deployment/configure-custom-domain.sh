#!/bin/bash

# Project ATHENA - Custom Domain Configuration Script
# This script helps configure and verify the custom domain setup

echo "🌐 Project ATHENA - Custom Domain Configuration"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
TARGET_DOMAIN="app.letsludus.com"
FRONTEND_SERVICE="ludus-frontend-athena.onrender.com"
BACKEND_SERVICE="ludus-backend-athena.onrender.com"

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

# Function to check current domain status
check_domain_status() {
    echo -e "${BLUE}🔍 Current Domain Status Check:${NC}"
    echo "================================"
    
    log "Checking current domain resolution..." "info"
    
    # Check if domain resolves
    if nslookup "$TARGET_DOMAIN" >/dev/null 2>&1; then
        log "Domain $TARGET_DOMAIN is resolving" "success"
        
        # Get the resolved IP/CNAME
        resolved=$(nslookup "$TARGET_DOMAIN" | grep -A1 "Name:" | tail -1 | awk '{print $2}')
        log "Resolves to: $resolved" "info"
        
        # Check if it points to Render
        if [[ "$resolved" == *"render.com"* ]] || [[ "$resolved" == *"onrender.com"* ]]; then
            log "Domain correctly points to Render service" "success"
            return 0
        else
            log "Domain does not point to Render service" "warning"
            return 1
        fi
    else
        log "Domain $TARGET_DOMAIN is not resolving" "error"
        return 1
    fi
}

# Function to check SSL certificate
check_ssl_certificate() {
    echo ""
    echo -e "${BLUE}🔒 SSL Certificate Check:${NC}"
    echo "========================"
    
    log "Checking SSL certificate for $TARGET_DOMAIN..." "info"
    
    # Check if HTTPS is accessible
    if curl -s -I "https://$TARGET_DOMAIN" >/dev/null 2>&1; then
        log "HTTPS is accessible" "success"
        
        # Get certificate info
        cert_info=$(echo | openssl s_client -connect "$TARGET_DOMAIN:443" -servername "$TARGET_DOMAIN" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
        
        if [ -n "$cert_info" ]; then
            log "SSL certificate is valid" "success"
            echo "$cert_info" | while read line; do
                log "  $line" "info"
            done
            return 0
        else
            log "SSL certificate information not available" "warning"
            return 1
        fi
    else
        log "HTTPS is not accessible" "error"
        return 1
    fi
}

# Function to test website functionality
test_website_functionality() {
    echo ""
    echo -e "${BLUE}🌐 Website Functionality Test:${NC}"
    echo "=============================="
    
    log "Testing website accessibility..." "info"
    
    # Test HTTP response
    response=$(curl -s -w "%{http_code}" -o /tmp/website_response.html "https://$TARGET_DOMAIN" 2>/dev/null)
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        log "Website is accessible (HTTP $http_code)" "success"
        
        # Check if it's the React app
        if grep -q -i "react\|root" /tmp/website_response.html 2>/dev/null; then
            log "React application detected" "success"
        else
            log "React application not detected" "warning"
        fi
        
        return 0
    else
        log "Website is not accessible (HTTP $http_code)" "error"
        return 1
    fi
}

# Function to provide DNS configuration instructions
show_dns_instructions() {
    echo ""
    echo -e "${BLUE}📋 DNS Configuration Instructions:${NC}"
    echo "=================================="
    
    log "To configure your custom domain, add this DNS record:" "step"
    echo ""
    echo -e "${CYAN}DNS Record Configuration:${NC}"
    echo "Type: CNAME"
    echo "Name: app"
    echo "Value: $FRONTEND_SERVICE"
    echo "TTL: 3600 (or default)"
    echo ""
    
    log "Add this record to your domain registrar's DNS settings:" "info"
    echo "1. Log into your domain registrar (GoDaddy, Namecheap, etc.)"
    echo "2. Navigate to DNS management for letsludus.com"
    echo "3. Add the CNAME record above"
    echo "4. Save changes and wait for propagation (5-60 minutes)"
    echo ""
    
    log "Alternative A Record (if CNAME not supported):" "info"
    echo "Type: A"
    echo "Name: app"
    echo "Value: [Get IP from Render dashboard]"
    echo "TTL: 3600"
    echo ""
}

# Function to show Render dashboard instructions
show_render_instructions() {
    echo ""
    echo -e "${BLUE}🚀 Render Dashboard Configuration:${NC}"
    echo "=================================="
    
    log "Configure custom domain in Render dashboard:" "step"
    echo ""
    echo "1. Go to https://dashboard.render.com"
    echo "2. Navigate to your 'ludus-frontend-athena' service"
    echo "3. Click on 'Settings' tab"
    echo "4. Scroll down to 'Custom Domains' section"
    echo "5. Click 'Add Custom Domain'"
    echo "6. Enter: $TARGET_DOMAIN"
    echo "7. Click 'Add Domain'"
    echo "8. Render will provide DNS records to configure"
    echo ""
    
    log "SSL Certificate:" "info"
    echo "- Render automatically provisions SSL certificates"
    echo "- Certificate will be issued once DNS propagates"
    echo "- HTTPS will be enforced automatically"
    echo "- Certificate renewal is automatic"
    echo ""
}

# Function to monitor DNS propagation
monitor_dns_propagation() {
    echo ""
    echo -e "${BLUE}⏱️  DNS Propagation Monitor:${NC}"
    echo "============================"
    
    log "Monitoring DNS propagation for $TARGET_DOMAIN..." "info"
    
    local attempts=0
    local max_attempts=12  # 1 hour with 5-minute intervals
    
    while [ $attempts -lt $max_attempts ]; do
        attempts=$((attempts + 1))
        
        log "Attempt $attempts/$max_attempts - Checking DNS resolution..." "info"
        
        if nslookup "$TARGET_DOMAIN" >/dev/null 2>&1; then
            log "DNS is resolving! ✅" "success"
            resolved=$(nslookup "$TARGET_DOMAIN" | grep -A1 "Name:" | tail -1 | awk '{print $2}')
            log "Resolves to: $resolved" "info"
            return 0
        else
            log "DNS not yet resolving, waiting 5 minutes..." "warning"
            sleep 300  # Wait 5 minutes
        fi
    done
    
    log "DNS propagation monitoring timeout" "error"
    log "Please check your DNS configuration manually" "info"
    return 1
}

# Function to run complete verification
run_complete_verification() {
    echo ""
    echo -e "${BLUE}🔍 Complete Domain Verification:${NC}"
    echo "================================"
    
    local all_passed=true
    
    # Check domain status
    if ! check_domain_status; then
        all_passed=false
    fi
    
    # Check SSL certificate
    if ! check_ssl_certificate; then
        all_passed=false
    fi
    
    # Test website functionality
    if ! test_website_functionality; then
        all_passed=false
    fi
    
    echo ""
    if [ "$all_passed" = "true" ]; then
        log "🎉 Custom domain configuration is complete and working!" "success"
        echo ""
        log "✅ Domain: https://$TARGET_DOMAIN" "success"
        log "✅ SSL Certificate: Valid" "success"
        log "✅ Website: Accessible" "success"
        log "✅ Project ATHENA: Ready for production!" "success"
        echo ""
        log "🚀 Project ATHENA is now live at https://$TARGET_DOMAIN" "success"
    else
        log "⚠️  Some issues detected. Please review the configuration." "warning"
        echo ""
        log "Next steps:" "info"
        log "1. Verify DNS configuration in your domain registrar" "info"
        log "2. Check Render dashboard for custom domain status" "info"
        log "3. Wait for DNS propagation (up to 24 hours)" "info"
        log "4. Run this script again to verify" "info"
    fi
}

# Main menu
show_menu() {
    echo ""
    echo -e "${CYAN}Select an option:${NC}"
    echo "1. Check current domain status"
    echo "2. Show DNS configuration instructions"
    echo "3. Show Render dashboard instructions"
    echo "4. Monitor DNS propagation"
    echo "5. Run complete verification"
    echo "6. Exit"
    echo ""
    read -p "Enter your choice (1-6): " choice
    
    case $choice in
        1)
            check_domain_status
            ;;
        2)
            show_dns_instructions
            ;;
        3)
            show_render_instructions
            ;;
        4)
            monitor_dns_propagation
            ;;
        5)
            run_complete_verification
            ;;
        6)
            log "Exiting custom domain configuration script" "info"
            exit 0
            ;;
        *)
            log "Invalid choice. Please select 1-6." "error"
            show_menu
            ;;
    esac
}

# Main execution
main() {
    log "Starting Project ATHENA custom domain configuration..." "info"
    echo ""
    log "Target Domain: $TARGET_DOMAIN" "info"
    log "Frontend Service: $FRONTEND_SERVICE" "info"
    log "Backend Service: $BACKEND_SERVICE" "info"
    echo ""
    
    # Check if domain is already configured
    if check_domain_status; then
        log "Domain appears to be configured. Running complete verification..." "info"
        run_complete_verification
    else
        log "Domain not yet configured. Showing setup instructions..." "info"
        show_dns_instructions
        show_render_instructions
        echo ""
        log "After configuring DNS and Render, run this script again to verify." "info"
    fi
    
    # Show menu for additional options
    show_menu
}

# Cleanup function
cleanup() {
    rm -f /tmp/website_response.html
}

# Set up cleanup on exit
trap cleanup EXIT

# Run main function
main
