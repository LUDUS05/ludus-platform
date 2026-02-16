#!/bin/bash

# ===========================================
# LUDUS Platform - Asset Optimization Script
# ===========================================
# This script optimizes assets for production deployment

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

# Install optimization tools
install_optimization_tools() {
    log "Installing asset optimization tools..."

    # Install global tools if not present
    if ! command -v imagemin &> /dev/null; then
        npm install -g imagemin-cli
    fi

    if ! command -v svgo &> /dev/null; then
        npm install -g svgo
    fi

    if ! command -v webp &> /dev/null; then
        npm install -g webp
    fi

    success "Optimization tools installed"
}

# Optimize images
optimize_images() {
    log "Optimizing images..."

    # Create optimized images directory
    mkdir -p apps/web/public/images/optimized

    # Find and optimize all images
    find apps/web/public/images -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" | while read file; do
        filename=$(basename "$file")
        name="${filename%.*}"
        ext="${filename##*.}"

        # Convert to WebP
        cwebp -q 80 "$file" -o "apps/web/public/images/optimized/${name}.webp"

        # Optimize original
        if [ "$ext" = "jpg" ] || [ "$ext" = "jpeg" ]; then
            imagemin "$file" --out-dir=apps/web/public/images/optimized --plugin=mozjpeg
        elif [ "$ext" = "png" ]; then
            imagemin "$file" --out-dir=apps/web/public/images/optimized --plugin=pngquant
        fi
    done

    success "Images optimized"
}

# Optimize SVGs
optimize_svgs() {
    log "Optimizing SVGs..."

    # Create optimized SVGs directory
    mkdir -p apps/web/public/icons/optimized

    # Find and optimize all SVGs
    find apps/web/public/icons -name "*.svg" | while read file; do
        filename=$(basename "$file")
        svgo "$file" -o "apps/web/public/icons/optimized/$filename"
    done

    success "SVGs optimized"
}

# Create responsive images
create_responsive_images() {
    log "Creating responsive images..."

    # Create responsive images directory
    mkdir -p apps/web/public/images/responsive

    # Generate different sizes for each image
    find apps/web/public/images -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" | while read file; do
        filename=$(basename "$file")
        name="${filename%.*}"
        ext="${filename##*.}"

        # Generate different sizes
        for size in 320 640 768 1024 1280 1920; do
            if [ "$ext" = "jpg" ] || [ "$ext" = "jpeg" ]; then
                convert "$file" -resize "${size}x" -quality 80 "apps/web/public/images/responsive/${name}-${size}w.${ext}"
                cwebp -q 80 "$file" -resize "${size}" 0 -o "apps/web/public/images/responsive/${name}-${size}w.webp"
            elif [ "$ext" = "png" ]; then
                convert "$file" -resize "${size}x" "apps/web/public/images/responsive/${name}-${size}w.${ext}"
                cwebp -q 80 "$file" -resize "${size}" 0 -o "apps/web/public/images/responsive/${name}-${size}w.webp"
            fi
        done
    done

    success "Responsive images created"
}

# Optimize CSS
optimize_css() {
    log "Optimizing CSS..."

    # Install CSS optimization tools
    npm install --save-dev clean-css-cli postcss-cli autoprefixer

    # Optimize CSS files
    find apps/web/src -name "*.css" | while read file; do
        filename=$(basename "$file")
        name="${filename%.*}"

        # Minify CSS
        cleancss -o "apps/web/build/static/css/${name}.min.css" "$file"
    done

    success "CSS optimized"
}

# Optimize JavaScript
optimize_javascript() {
    log "Optimizing JavaScript..."

    # Install JS optimization tools
    npm install --save-dev terser

    # Optimize JS files
    find apps/web/build/static/js -name "*.js" | while read file; do
        filename=$(basename "$file")
        name="${filename%.*}"

        # Minify JS
        terser "$file" -o "apps/web/build/static/js/${name}.min.js" -c -m
    done

    success "JavaScript optimized"
}

# Create CDN configuration
create_cdn_config() {
    log "Creating CDN configuration..."

    # Create Cloudflare configuration
    cat > apps/web/public/_headers << EOF
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains

# Cache static assets for 1 year
/static/css/*
  Cache-Control: public, max-age=31536000, immutable

/static/js/*
  Cache-Control: public, max-age=31536000, immutable

/static/media/*
  Cache-Control: public, max-age=31536000, immutable

# Cache images for 1 year
/images/*
  Cache-Control: public, max-age=31536000, immutable

# Cache icons for 1 year
/icons/*
  Cache-Control: public, max-age=31536000, immutable

# Don't cache HTML
/*.html
  Cache-Control: public, max-age=0, must-revalidate

# Cache favicon for 1 day
/favicon.ico
  Cache-Control: public, max-age=86400
EOF

    # Create Cloudflare Workers script
    cat > apps/web/cloudflare-worker.js << EOF
// Cloudflare Worker for LUDUS Platform
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    return fetch(\`https://ludus-backend-prod.onrender.com\${url.pathname}\${url.search}\`, {
      method: request.method,
      headers: request.headers,
      body: request.body
    })
  }

  // Handle static assets with cache
  if (url.pathname.startsWith('/static/')) {
    const response = await fetch(request)
    const newResponse = new Response(response.body, response)
    newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return newResponse
  }

  // Handle images with WebP support
  if (url.pathname.match(/\\.(jpg|jpeg|png)$/)) {
    const webpUrl = url.pathname.replace(/\\.(jpg|jpeg|png)$/, '.webp')
    const webpResponse = await fetch(new Request(webpUrl, request))

    if (webpResponse.ok && request.headers.get('Accept')?.includes('image/webp')) {
      const newResponse = new Response(webpResponse.body, webpResponse)
      newResponse.headers.set('Content-Type', 'image/webp')
      newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      return newResponse
    }
  }

  // Default response
  return fetch(request)
}
EOF

    success "CDN configuration created"
}

# Create asset manifest
create_asset_manifest() {
    log "Creating asset manifest..."

    # Create asset manifest for cache busting
    cat > apps/web/public/asset-manifest.json << EOF
{
  "files": {
    "main.css": "/static/css/main.css",
    "main.js": "/static/js/main.js",
    "runtime.js": "/static/js/runtime.js",
    "vendors.js": "/static/js/vendors.js"
  },
  "entrypoints": [
    "static/css/main.css",
    "static/js/runtime.js",
    "static/js/vendors.js",
    "static/js/main.js"
  ]
}
EOF

    success "Asset manifest created"
}

# Create service worker for caching
create_service_worker() {
    log "Creating service worker for caching..."

    cat > apps/web/public/sw.js << EOF
// LUDUS Platform Service Worker
const CACHE_NAME = 'ludus-v1'
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/js/runtime.js',
  '/static/js/vendors.js',
  '/manifest.json'
]

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  )
})

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
  )
})

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})
EOF

    success "Service worker created"
}

# Main optimization function
main() {
    log "Starting LUDUS Platform asset optimization..."

    install_optimization_tools
    optimize_images
    optimize_svgs
    create_responsive_images
    optimize_css
    optimize_javascript
    create_cdn_config
    create_asset_manifest
    create_service_worker

    success "Asset optimization completed successfully!"
    log "Optimized assets are ready for CDN deployment"
}

# Run main function
main "$@"
