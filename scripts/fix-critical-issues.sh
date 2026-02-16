#!/bin/bash

# ===========================================
# LUDUS Platform - Critical Issues Fix Script
# ===========================================
# This script fixes critical configuration issues identified in LET-113

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Generate secure secrets
generate_secrets() {
    log "Generating secure secrets..."

    # Generate JWT secrets
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-32)
    JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-32)

    # Generate webhook secrets
    MOYASAR_WEBHOOK_SECRET=$(openssl rand -hex 32)

    # Generate Redis password
    REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-16)

    # Save to .env file
    cat > .env << EOF
# ===========================================
# LUDUS Platform - Environment Configuration
# Generated on $(date)
# ===========================================

# Core Application Configuration
NODE_ENV=development
PORT=5001
CLIENT_URL=http://localhost:3000
API_URL=http://localhost:5001

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ludus_development
MONGODB_DEV_URI=mongodb://localhost:27017/ludus_development

# Authentication & Security
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12

# Payment Gateway (Moyasar) - TEST KEYS
MOYASAR_SECRET_KEY=sk_test_your_moyasar_secret_key_here
MOYASAR_PUBLISHABLE_KEY=pk_test_your_moyasar_publishable_key_here
MOYASAR_WEBHOOK_SECRET=${MOYASAR_WEBHOOK_SECRET}
MOYASAR_SANDBOX_MODE=true

# Social Authentication
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# Email Service Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@letsludus.com
EMAIL_FROM_NAME=LUDUS Platform

# SMS Service Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# File Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here
CLOUDINARY_API_KEY=your_cloudinary_api_key_here
CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here
CLOUDINARY_FOLDER=ludus-development

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_DB=0

# Monitoring & Analytics
SENTRY_DSN=your_sentry_dsn_here
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX

# External API Keys
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
UNSPLASH_SECRET_KEY=your_unsplash_secret_key_here

# Security Configuration
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Feature Flags
ANIMATION_ENABLED=true
RTL_SUPPORT=true
PERFORMANCE_MONITORING=true
DEBUG_MODE=true
MAINTENANCE_MODE=false

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=combined
LOG_FILE=logs/app.log
EOF

    success "Secure secrets generated and saved to .env"
}

# Create MongoDB connection test
create_mongodb_test() {
    log "Creating MongoDB connection test..."

    cat > apps/api/test-mongodb-connection.js << 'EOF'
const mongoose = require('mongoose');

async function testMongoDBConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...');

    // Test with different connection strings
    const testUris = [
      process.env.MONGODB_URI,
      'mongodb://localhost:27017/ludus_development',
      'mongodb+srv://test:test@cluster.mongodb.net/test'
    ];

    for (const uri of testUris) {
      if (!uri) continue;

      console.log(`\n📡 Testing URI: ${uri.replace(/\/\/.*@/, '//***:***@')}`);

      try {
        const conn = await mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });

        console.log(`✅ Connected successfully to: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        console.log(`🔗 Ready State: ${conn.connection.readyState}`);

        // Test basic query
        await conn.connection.db.admin().ping();
        console.log('✅ Database ping successful');

        await mongoose.disconnect();
        console.log('✅ Disconnected successfully');
        return true;
      } catch (error) {
        console.log(`❌ Connection failed: ${error.message}`);
        if (error.code === 'ETIMEOUT') {
          console.log('🔧 ETIMEOUT error - Check network/firewall settings');
        }
      }
    }

    return false;
  } catch (error) {
    console.error('❌ MongoDB test failed:', error.message);
    return false;
  }
}

// Run test
testMongoDBConnection().then(success => {
  process.exit(success ? 0 : 1);
});
EOF

    success "MongoDB connection test created"
}

# Create JWT configuration test
create_jwt_test() {
    log "Creating JWT configuration test..."

    cat > apps/api/test-jwt-config.js << 'EOF'
const jwt = require('jsonwebtoken');

function testJWTConfiguration() {
  console.log('🔍 Testing JWT configuration...');

  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'JWT_EXPIRES_IN',
    'JWT_REFRESH_EXPIRES_IN'
  ];

  let allConfigured = true;

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}: SET`);
    } else {
      console.log(`❌ ${envVar}: NOT SET`);
      allConfigured = false;
    }
  }

  if (allConfigured) {
    try {
      // Test JWT token generation
      const testPayload = { userId: 'test', email: 'test@example.com' };

      const accessToken = jwt.sign(testPayload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });

      const refreshToken = jwt.sign(testPayload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
      });

      console.log('✅ JWT token generation successful');
      console.log(`📝 Access token length: ${accessToken.length}`);
      console.log(`📝 Refresh token length: ${refreshToken.length}`);

      // Test token verification
      const decodedAccess = jwt.verify(accessToken, process.env.JWT_SECRET);
      const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      console.log('✅ JWT token verification successful');
      console.log(`👤 Decoded access token: ${JSON.stringify(decodedAccess)}`);

      return true;
    } catch (error) {
      console.error('❌ JWT test failed:', error.message);
      return false;
    }
  } else {
    console.error('❌ JWT configuration incomplete');
    return false;
  }
}

// Run test
const success = testJWTConfiguration();
process.exit(success ? 0 : 1);
EOF

    success "JWT configuration test created"
}

# Install missing dependencies
install_dependencies() {
    log "Installing missing dependencies..."

    cd apps/api

    # Install missing packages
    npm install nodemailer jsonwebtoken bcryptjs

    cd ../..

    success "Dependencies installed"
}

# Run basic tests
run_tests() {
    log "Running basic health checks..."

    cd apps/api

    # Run individual tests
    echo "Running JWT configuration test..."
    node test-jwt-config.js

    echo "Running MongoDB connection test..."
    node test-mongodb-connection.js

    cd ../..

    success "Basic health checks completed"
}

# Main function
main() {
    log "Starting LUDUS Platform critical issues fix..."

    generate_secrets
    create_mongodb_test
    create_jwt_test
    install_dependencies
    run_tests

    success "Critical issues fix completed!"
    warning "Please review the generated .env file and update with your actual API keys"
    warning "For production deployment, update the MONGODB_URI with your MongoDB Atlas connection string"
}

# Run main function
main "$@"
