#!/bin/bash

# LUDUS Platform - New Features Deployment Script
# Deploys all the new features we implemented:
# - Responsive Admin UI
# - Enhanced Referral Social Sharing
# - Admin Forms Management
# - User Participation Preferences
# - User Profile Pages

echo "🚀 LUDUS Platform - New Features Deployment"
echo "============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Pre-deployment checklist:"
echo ""

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "lds_staging" ]; then
    echo "⚠️  Warning: You're not on lds_staging branch"
    echo "   Current branch: $CURRENT_BRANCH"
    echo "   Recommended: lds_staging for deployment"
    echo ""
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Uncommitted changes detected:"
    git status --short
    echo ""
    echo "🔄 Committing all changes..."
    
    # Add all changes
    git add .
    
    # Commit with descriptive message
    git commit -m "feat: Implement new platform features

- Fix responsive admin sidebar layout
- Add professional social sharing icons with Snapchat
- Implement admin forms management under Content section
- Add detailed user participation preferences
- Create comprehensive user profile pages
- Add demo user setup scripts

Features implemented:
✅ Responsive Admin UI (sidebar)
✅ Enhanced Referral Social Sharing
✅ Admin Forms Management
✅ User Participation Preferences  
✅ User Profile Pages with Social Links
✅ Demo User Credentials Setup"
    
    echo "✅ Changes committed successfully"
else
    echo "✅ No uncommitted changes"
fi

echo ""
echo "🔍 Checking deployment readiness..."

# Check for required files
REQUIRED_FILES=(
    "render.yaml"
    "client/package.json"
    "server/package.json"
    "client/src/components/admin/AdminLayout.jsx"
    "client/src/components/referral/ReferralSocialShare.jsx"
    "client/src/components/admin/EnhancedFormEditor.jsx"
    "client/src/components/user/UserProfilePage.jsx"
    "server/src/models/User.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ Missing: $file"
        exit 1
    fi
done

echo ""
echo "📦 New Features Summary:"
echo "   🎯 Responsive Admin Sidebar - Mobile/Desktop optimized"
echo "   📱 Enhanced Social Sharing - Professional icons + Snapchat"
echo "   📝 Admin Forms Management - Full CRUD under Content"
echo "   ⚙️  User Participation Preferences - Detailed controls"
echo "   👤 User Profile Pages - Bio, social links, interests"
echo "   🧪 Demo User Setup - Complete testing environment"
echo ""

echo "🚀 Deployment Options:"
echo ""
echo "1. 📤 Push to Render (Automatic Deployment)"
echo "   - Pushes to lds_staging branch"
echo "   - Triggers automatic Render deployment"
echo "   - Updates both frontend and backend"
echo ""
echo "2. 🔄 Manual Render Dashboard Deployment"
echo "   - Manual trigger from Render dashboard"
echo "   - More control over deployment process"
echo ""

read -p "Choose deployment method (1 or 2): " choice

case $choice in
    1)
        echo ""
        echo "📤 Pushing to Render for automatic deployment..."
        
        # Push to staging branch
        git push origin lds_staging
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Successfully pushed to lds_staging branch!"
            echo ""
            echo "🔄 Render will automatically:"
            echo "   • Build the backend service (ludus-backend-athena)"
            echo "   • Build the frontend service (ludus-frontend-athena)"
            echo "   • Deploy both services"
            echo ""
            echo "⏱️  Deployment typically takes 3-5 minutes"
            echo "🌐 Monitor deployment at: https://dashboard.render.com"
            echo ""
            echo "🎯 After deployment, test the new features:"
            echo "   • Admin responsive sidebar"
            echo "   • Enhanced referral sharing with Snapchat"
            echo "   • Forms management under Content"
            echo "   • User participation preferences"
            echo "   • User profile pages"
            echo ""
            echo "🧪 Create demo users: npm run setup-demo-users"
        else
            echo "❌ Failed to push to repository"
            exit 1
        fi
        ;;
    2)
        echo ""
        echo "🔄 Manual deployment selected"
        echo ""
        echo "📋 Manual deployment steps:"
        echo "1. Go to https://dashboard.render.com"
        echo "2. Find your services:"
        echo "   • ludus-backend-athena"
        echo "   • ludus-frontend-athena"
        echo "3. Click 'Manual Deploy' on each service"
        echo "4. Select 'lds_staging' branch"
        echo "5. Click 'Deploy'"
        echo ""
        echo "⏱️  Each service takes 3-5 minutes to deploy"
        echo ""
        echo "🎯 After deployment, test the new features:"
        echo "   • Admin responsive sidebar"
        echo "   • Enhanced referral sharing with Snapchat"
        echo "   • Forms management under Content"
        echo "   • User participation preferences"
        echo "   • User profile pages"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "📚 Post-deployment testing:"
echo ""
echo "1. 🧪 Create demo users:"
echo "   npm run setup-demo-users"
echo ""
echo "2. 🎯 Test admin features:"
echo "   Login: admin@ludus.demo / Admin123!"
echo "   Test responsive sidebar and forms management"
echo ""
echo "3. 👤 Test user profiles:"
echo "   Login: sarah.ahmed@ludus.demo / Sarah123!"
echo "   Test profile editing and preferences"
echo ""
echo "4. 📱 Test referral system:"
echo "   Login: ahmed.hassan@ludus.demo / Ahmed123!"
echo "   Test new social sharing with Snapchat"
echo ""
echo "📖 See DEMO_USER_CREDENTIALS.md for complete testing guide"
echo ""
echo "✨ LUDUS Platform with new features is ready for deployment!"
