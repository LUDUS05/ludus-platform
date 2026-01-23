#!/bin/bash

echo "🚀 LUDUS Platform - Deployment Status Check"
echo "==========================================="
echo ""

# Check ATHENA services status
echo "📊 Checking ATHENA Services Status:"
echo ""

# Frontend ATHENA Service
echo "🌐 Frontend ATHENA Service:"
FRONTEND_URL="https://ludus-frontend-athena.onrender.com"
echo "   URL: $FRONTEND_URL"

# Check if service is responding
if curl -s --head "$FRONTEND_URL" | head -n 1 | grep -q "200 OK"; then
    echo "   ✅ Status: Online"
else
    echo "   ⏳ Status: Deploying or Offline"
fi

echo ""

# Backend ATHENA Service
echo "🔧 Backend ATHENA Service:"
BACKEND_URL="https://ludus-backend-athena.onrender.com"
echo "   URL: $BACKEND_URL"

# Check health endpoint
if curl -s "$BACKEND_URL/health" | grep -q "OK"; then
    echo "   ✅ Status: Online"
else
    echo "   ⏳ Status: Deploying or Offline"
fi

echo ""

# Main domain check
echo "🎯 Main Domain Check:"
MAIN_URL="https://app.letsludus.com"
echo "   URL: $MAIN_URL"

if curl -s --head "$MAIN_URL" | head -n 1 | grep -q "200 OK"; then
    echo "   ✅ Status: Online"
    
    # Check if onboarding page has new UI
    echo "   🔍 Checking onboarding page for neumorphic UI..."
    if curl -s "$MAIN_URL/onboarding" | grep -q "neumorphic"; then
        echo "   ✅ Neumorphic UI: Deployed"
    else
        echo "   ⏳ Neumorphic UI: Still deploying or not updated"
    fi
else
    echo "   ⏳ Status: Deploying or Offline"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Wait 5-10 minutes for deployment to complete"
echo "2. Check Render dashboard: https://dashboard.render.com"
echo "3. Test onboarding page: https://app.letsludus.com/onboarding"
echo "4. Verify Arabic default language is working"
echo ""
echo "🔄 If deployment is taking too long, you can:"
echo "   - Check Render dashboard for build logs"
echo "   - Manually trigger deployment from Render dashboard"
echo "   - Check for any build errors in the logs"
