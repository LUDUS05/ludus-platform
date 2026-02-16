#!/bin/bash

# Google OAuth Setup Script for LUDUS Platform
echo "🔧 Setting up Google OAuth for LUDUS Platform..."

# Check if .env file exists in client directory
if [ ! -f "client/.env" ]; then
    echo "📝 Creating client/.env file..."
    cat > client/.env << EOF
# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here

# API Configuration
REACT_APP_API_URL=https://ludus-backend-jzc5.onrender.com
EOF
    echo "✅ Created client/.env file"
else
    echo "📄 client/.env file already exists"
fi

echo ""
echo "🔑 To complete Google OAuth setup:"
echo "1. Go to Google Cloud Console: https://console.cloud.google.com/"
echo "2. Create a new project or select existing one"
echo "3. Enable Google+ API"
echo "4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID"
echo "5. Set Application type to 'Web application'"
echo "6. Add authorized origins:"
echo "   - http://localhost:3000 (for development)"
echo "   - https://app.letsludus.com (for production)"
echo "7. Copy the Client ID and update client/.env file:"
echo "   REACT_APP_GOOGLE_CLIENT_ID=your_actual_client_id_here"
echo ""
echo "🚀 After updating the .env file, restart your development server:"
echo "   cd client && npm start"
echo ""
echo "📚 For more details, see: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid"
