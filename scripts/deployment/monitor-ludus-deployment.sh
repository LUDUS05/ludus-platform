#!/bin/bash

echo "🚀 LUDUS Platform - Deployment Monitor"
echo "======================================"
echo "Target Services: ludus-frontend & ludus-backend"
echo ""

# Function to check service status
check_service() {
    local service_name=$1
    local service_url=$2
    local health_endpoint=$3
    
    echo "📊 $service_name Service:"
    echo "   URL: $service_url"
    
    # Check main service
    if curl -s --head "$service_url" | head -n 1 | grep -q "200 OK"; then
        echo "   ✅ Status: Online"
        
        # Check health endpoint if provided
        if [ ! -z "$health_endpoint" ]; then
            if curl -s "$health_endpoint" | grep -q "OK"; then
                echo "   ✅ Health: OK"
            else
                echo "   ⚠️  Health: Check failed"
            fi
        fi
        
        return 0
    else
        echo "   ⏳ Status: Deploying or Offline"
        return 1
    fi
}

# Check ludus-frontend
echo "🌐 Frontend Service Check:"
check_service "ludus-frontend" "https://ludus-frontend.onrender.com" ""

echo ""

# Check ludus-backend
echo "🔧 Backend Service Check:"
check_service "ludus-backend" "https://ludus-backend.onrender.com" "https://ludus-backend.onrender.com/health"

echo ""

# Check onboarding page
echo "🎯 Onboarding Page Check:"
ONBOARDING_URL="https://ludus-frontend.onrender.com/onboarding"
echo "   URL: $ONBOARDING_URL"

if curl -s --head "$ONBOARDING_URL" | head -n 1 | grep -q "200 OK"; then
    echo "   ✅ Status: Online"
    
    # Check for neumorphic UI
    echo "   🔍 Checking for neumorphic UI..."
    if curl -s "$ONBOARDING_URL" | grep -q "neumorphic"; then
        echo "   ✅ Neumorphic UI: Deployed"
    else
        echo "   ⏳ Neumorphic UI: Still deploying or not detected"
    fi
    
    # Check for Arabic default
    echo "   🔍 Checking for Arabic default language..."
    if curl -s "$ONBOARDING_URL" | grep -q "مرحباً"; then
        echo "   ✅ Arabic Default: Active"
    else
        echo "   ⏳ Arabic Default: Still deploying or not detected"
    fi
else
    echo "   ⏳ Status: Deploying or Offline"
fi

echo ""

# Deployment timeline
echo "⏱️  Deployment Timeline:"
echo "   📅 Push Time: $(date)"
echo "   ⏳ Expected Completion: 5-10 minutes from push"
echo "   🔄 Auto-deploy: Triggered by git push to new-main branch"

echo ""

# Next steps
echo "📋 Next Steps:"
echo "1. Wait for deployment to complete (5-10 minutes)"
echo "2. Check Render dashboard: https://dashboard.render.com"
echo "3. Monitor build logs in Render dashboard"
echo "4. Test services once deployment completes:"
echo "   - Frontend: https://ludus-frontend.onrender.com"
echo "   - Backend: https://ludus-backend.onrender.com"
echo "   - Onboarding: https://ludus-frontend.onrender.com/onboarding"

echo ""

# Troubleshooting
echo "🔧 Troubleshooting:"
echo "   - If deployment fails: Check Render dashboard for build errors"
echo "   - If services are slow: Render free tier has cold start delays"
echo "   - If 404 errors persist: Services may still be deploying"
echo "   - Manual trigger: Use Render dashboard to manually deploy if needed"

echo ""
echo "🔄 Run this script again in 2-3 minutes to check progress"
