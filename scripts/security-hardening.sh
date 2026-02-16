#!/bin/bash

# ===========================================
# LUDUS Platform - Security Hardening Script
# ===========================================
# This script implements comprehensive security measures

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

    # Save to .env.production
    cat > .env.production << EOF
# Generated on $(date)
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
MOYASAR_WEBHOOK_SECRET=${MOYASAR_WEBHOOK_SECRET}
REDIS_PASSWORD=${REDIS_PASSWORD}
EOF

    success "Secure secrets generated and saved to .env.production"
}

# Update package.json security
update_package_security() {
    log "Updating package.json security settings..."

    # Add security scripts to root package.json
    if [ -f "package.json" ]; then
        # Add security audit script
        if ! grep -q '"security:audit"' package.json; then
            sed -i.bak '/"workspace:status:update"/a\
    "security:audit": "npm audit --audit-level moderate",\
    "security:fix": "npm audit fix --force",\
    "security:check": "npm audit --audit-level high",\
    "security:outdated": "npm outdated",\
    "security:update": "npm update"' package.json
        fi
    fi

    success "Package.json security settings updated"
}

# Create security configuration files
create_security_configs() {
    log "Creating security configuration files..."

    # Create .npmrc for security
    cat > .npmrc << EOF
# Security settings
audit-level=moderate
fund=false
update-notifier=false
EOF

    # Create .gitignore security additions
    cat >> .gitignore << EOF

# Security files
.env
.env.local
.env.production
.env.staging
*.key
*.pem
*.p12
*.pfx
secrets/
keys/
certificates/
EOF

    # Create security headers configuration
    cat > apps/web/public/_headers << EOF
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.letsludus.com; frame-src 'none'; object-src 'none'; upgrade-insecure-requests;
EOF

    success "Security configuration files created"
}

# Update Docker security
update_docker_security() {
    log "Updating Docker security configurations..."

    # Create secure Dockerfile for API
    cat > apps/api/Dockerfile.production << EOF
# Multi-stage build for security
FROM node:18-alpine AS builder

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm ci --only=production --legacy-peer-deps

# Copy source code
COPY apps/api/ ./apps/api/

# Build application
WORKDIR /app/apps/api
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S ludus -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=ludus:nodejs /app/apps/api ./apps/api

# Switch to non-root user
USER ludus

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["node", "apps/api/src/app.production.js"]
EOF

    # Create secure Dockerfile for Web
    cat > apps/web/Dockerfile.production << EOF
# Multi-stage build for security
FROM node:18-alpine AS builder

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY apps/web/ ./apps/web/

# Build application
WORKDIR /app/apps/web
RUN npm run build:prod

# Production stage
FROM nginx:alpine AS production

# Copy built application
COPY --from=builder /app/apps/web/build /usr/share/nginx/html

# Copy nginx configuration
COPY apps/web/nginx.production.conf /etc/nginx/nginx.conf

# Copy security headers
COPY apps/web/public/_headers /usr/share/nginx/html/

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
EOF

    success "Docker security configurations updated"
}

# Create nginx security configuration
create_nginx_config() {
    log "Creating nginx security configuration..."

    cat > apps/web/nginx.production.conf << EOF
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Hide nginx version
    server_tokens off;

    # Logging
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Security
        location ~ /\. {
            deny all;
        }

        location ~ \.(env|log|ini)$ {
            deny all;
        }

        # Static files with cache
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header X-Content-Type-Options "nosniff";
        }

        # HTML files
        location ~* \.html$ {
            expires 0;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # SPA routing
        location / {
            try_files \$uri \$uri/ /index.html;
        }
    }
}
EOF

    success "Nginx security configuration created"
}

# Run security audit
run_security_audit() {
    log "Running security audit..."

    # NPM audit
    if command -v npm &> /dev/null; then
        npm audit --audit-level moderate || warning "NPM audit found issues"
    fi

    # Check for vulnerable dependencies
    if command -v npx &> /dev/null; then
        npx audit-ci --config .audit-ci.json || warning "Audit CI found issues"
    fi

    success "Security audit completed"
}

# Create audit configuration
create_audit_config() {
    log "Creating audit configuration..."

    cat > .audit-ci.json << EOF
{
  "low": true,
  "moderate": true,
  "high": true,
  "critical": true,
  "allowlist": [],
  "skip-dev": false,
  "report-type": "summary"
}
EOF

    success "Audit configuration created"
}

# Main security hardening function
main() {
    log "Starting LUDUS Platform security hardening..."

    generate_secrets
    update_package_security
    create_security_configs
    update_docker_security
    create_nginx_config
    create_audit_config
    run_security_audit

    success "Security hardening completed successfully!"
    warning "Please review the generated .env.production file and update your environment variables"
    warning "Make sure to set proper file permissions: chmod 600 .env.production"
}

# Run main function
main "$@"
