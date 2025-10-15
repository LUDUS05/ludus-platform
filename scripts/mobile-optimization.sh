#!/bin/bash

# ===========================================
# LUDUS Platform - Mobile Optimization Script
# ===========================================
# This script optimizes the platform for mobile devices

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

# Install mobile optimization tools
install_mobile_tools() {
    log "Installing mobile optimization tools..."

    # Install global tools if not present
    if ! command -v lighthouse &> /dev/null; then
        npm install -g lighthouse
    fi

    if ! command -v pa11y &> /dev/null; then
        npm install -g pa11y
    fi

    if ! command -v webp &> /dev/null; then
        npm install -g webp
    fi

    success "Mobile optimization tools installed"
}

# Optimize images for mobile
optimize_mobile_images() {
    log "Optimizing images for mobile..."

    # Create mobile-optimized images directory
    mkdir -p apps/web/public/images/mobile

    # Find and optimize all images for mobile
    find apps/web/public/images -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" | while read file; do
        filename=$(basename "$file")
        name="${filename%.*}"
        ext="${filename##*.}"

        # Generate mobile-optimized versions
        for size in 320 640 768; do
            if [ "$ext" = "jpg" ] || [ "$ext" = "jpeg" ]; then
                convert "$file" -resize "${size}x" -quality 75 -strip "apps/web/public/images/mobile/${name}-${size}w.${ext}"
                cwebp -q 75 -resize "${size}" 0 "$file" -o "apps/web/public/images/mobile/${name}-${size}w.webp"
            elif [ "$ext" = "png" ]; then
                convert "$file" -resize "${size}x" -strip "apps/web/public/images/mobile/${name}-${size}w.${ext}"
                cwebp -q 75 -resize "${size}" 0 "$file" -o "apps/web/public/images/mobile/${name}-${size}w.webp"
            fi
        done
    done

    success "Mobile images optimized"
}

# Create mobile-specific CSS
create_mobile_css() {
    log "Creating mobile-specific CSS..."

    # Create mobile utilities CSS
    cat > apps/web/src/styles/mobile-utilities.css << EOF
/* Mobile-specific utility classes */

/* Touch targets */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Swipe containers */
.swipe-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.swipe-container::-webkit-scrollbar {
  display: none;
}

.swipe-item {
  scroll-snap-align: start;
  flex-shrink: 0;
}

/* Mobile spacing */
.mobile-p-1 { padding: 0.25rem; }
.mobile-p-2 { padding: 0.5rem; }
.mobile-p-3 { padding: 0.75rem; }
.mobile-p-4 { padding: 1rem; }
.mobile-p-5 { padding: 1.25rem; }
.mobile-p-6 { padding: 1.5rem; }

.mobile-m-1 { margin: 0.25rem; }
.mobile-m-2 { margin: 0.5rem; }
.mobile-m-3 { margin: 0.75rem; }
.mobile-m-4 { margin: 1rem; }
.mobile-m-5 { margin: 1.25rem; }
.mobile-m-6 { margin: 1.5rem; }

/* Mobile text sizes */
.mobile-text-xs { font-size: 0.75rem; }
.mobile-text-sm { font-size: 0.875rem; }
.mobile-text-base { font-size: 1rem; }
.mobile-text-lg { font-size: 1.125rem; }
.mobile-text-xl { font-size: 1.25rem; }

/* Mobile flex utilities */
.mobile-flex-col { flex-direction: column; }
.mobile-flex-row { flex-direction: row; }
.mobile-flex-wrap { flex-wrap: wrap; }
.mobile-flex-nowrap { flex-wrap: nowrap; }

.mobile-justify-start { justify-content: flex-start; }
.mobile-justify-center { justify-content: center; }
.mobile-justify-end { justify-content: flex-end; }
.mobile-justify-between { justify-content: space-between; }

.mobile-items-start { align-items: flex-start; }
.mobile-items-center { align-items: center; }
.mobile-items-end { align-items: flex-end; }
.mobile-items-stretch { align-items: stretch; }

/* Mobile grid */
.mobile-grid-1 { grid-template-columns: repeat(1, 1fr); }
.mobile-grid-2 { grid-template-columns: repeat(2, 1fr); }
.mobile-grid-3 { grid-template-columns: repeat(3, 1fr); }

/* Mobile visibility */
.mobile-hidden { display: none; }
.mobile-block { display: block; }
.mobile-flex { display: flex; }
.mobile-grid { display: grid; }

/* Mobile positioning */
.mobile-relative { position: relative; }
.mobile-absolute { position: absolute; }
.mobile-fixed { position: fixed; }
.mobile-sticky { position: sticky; }

/* Mobile overflow */
.mobile-overflow-hidden { overflow: hidden; }
.mobile-overflow-auto { overflow: auto; }
.mobile-overflow-scroll { overflow: scroll; }

/* Mobile borders */
.mobile-border { border: 1px solid #e5e7eb; }
.mobile-border-t { border-top: 1px solid #e5e7eb; }
.mobile-border-b { border-bottom: 1px solid #e5e7eb; }
.mobile-border-l { border-left: 1px solid #e5e7eb; }
.mobile-border-r { border-right: 1px solid #e5e7eb; }

.mobile-rounded { border-radius: 0.25rem; }
.mobile-rounded-md { border-radius: 0.375rem; }
.mobile-rounded-lg { border-radius: 0.5rem; }
.mobile-rounded-xl { border-radius: 0.75rem; }

/* Mobile shadows */
.mobile-shadow-sm { box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
.mobile-shadow { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
.mobile-shadow-md { box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
.mobile-shadow-lg { box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1); }

/* Mobile backgrounds */
.mobile-bg-white { background-color: white; }
.mobile-bg-gray-50 { background-color: #f9fafb; }
.mobile-bg-gray-100 { background-color: #f3f4f6; }
.mobile-bg-blue-50 { background-color: #eff6ff; }
.mobile-bg-blue-500 { background-color: #3b82f6; }

/* Mobile text colors */
.mobile-text-gray-500 { color: #6b7280; }
.mobile-text-gray-600 { color: #4b5563; }
.mobile-text-gray-700 { color: #374151; }
.mobile-text-gray-900 { color: #111827; }
.mobile-text-blue-500 { color: #3b82f6; }
.mobile-text-blue-600 { color: #2563eb; }

/* Mobile focus states */
.mobile-focus:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Mobile active states */
.mobile-active:active {
  transform: scale(0.98);
}

/* Mobile loading states */
.mobile-loading {
  opacity: 0.6;
  pointer-events: none;
}

.mobile-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f4f6;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: mobile-spin 1s linear infinite;
}

@keyframes mobile-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile animations */
.mobile-fade-in {
  animation: mobile-fade-in 0.3s ease;
}

.mobile-slide-up {
  animation: mobile-slide-up 0.3s ease;
}

.mobile-slide-down {
  animation: mobile-slide-down 0.3s ease;
}

@keyframes mobile-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes mobile-slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes mobile-slide-down {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Mobile responsive breakpoints */
@media (max-width: 320px) {
  .mobile-xs-hidden { display: none; }
  .mobile-xs-block { display: block; }
  .mobile-xs-flex { display: flex; }
}

@media (max-width: 480px) {
  .mobile-sm-hidden { display: none; }
  .mobile-sm-block { display: block; }
  .mobile-sm-flex { display: flex; }
}

@media (max-width: 768px) {
  .mobile-md-hidden { display: none; }
  .mobile-md-block { display: block; }
  .mobile-md-flex { display: flex; }
}

/* Mobile accessibility */
.mobile-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.mobile-focus-visible:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Mobile high contrast mode */
@media (prefers-contrast: high) {
  .mobile-border { border: 2px solid #000; }
  .mobile-shadow { box-shadow: 0 0 0 2px #000; }
}

/* Mobile reduced motion */
@media (prefers-reduced-motion: reduce) {
  .mobile-spinner {
    animation: none;
  }

  .mobile-fade-in,
  .mobile-slide-up,
  .mobile-slide-down {
    animation: none;
  }
}
EOF

    success "Mobile-specific CSS created"
}

# Create mobile manifest
create_mobile_manifest() {
    log "Creating mobile manifest..."

    cat > apps/web/public/manifest.json << EOF
{
  "name": "LUDUS Platform",
  "short_name": "LUDUS",
  "description": "Social Activity Platform for Saudi Arabia",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "scope": "/",
  "lang": "ar",
  "dir": "rtl",
  "categories": ["social", "lifestyle", "entertainment"],
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/mobile-home.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshots/tablet-home.png",
      "sizes": "768x1024",
      "type": "image/png",
      "form_factor": "wide"
    }
  ],
  "shortcuts": [
    {
      "name": "Activities",
      "short_name": "Activities",
      "description": "Browse available activities",
      "url": "/activities",
      "icons": [
        {
          "src": "/icons/activities-96x96.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "My Bookings",
      "short_name": "Bookings",
      "description": "View your bookings",
      "url": "/bookings",
      "icons": [
        {
          "src": "/icons/bookings-96x96.png",
          "sizes": "96x96"
        }
      ]
    }
  ],
  "related_applications": [],
  "prefer_related_applications": false
}
EOF

    success "Mobile manifest created"
}

# Create mobile service worker
create_mobile_service_worker() {
    log "Creating mobile service worker..."

    cat > apps/web/public/sw-mobile.js << EOF
// LUDUS Platform Mobile Service Worker
const CACHE_NAME = 'ludus-mobile-v1'
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/js/runtime.js',
  '/static/js/vendors.js',
  '/manifest.json',
  '/offline.html'
]

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache')
        return cache.addAll(urlsToCache)
      })
  )
})

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response
        }

        return fetch(event.request).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache)
            })

          return response
        }).catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html')
          }
        })
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
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Background sync
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Handle background sync tasks
  console.log('Background sync triggered')
}

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from LUDUS',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Activity',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('LUDUS Platform', options)
  )
})

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/activities')
    )
  }
})
EOF

    success "Mobile service worker created"
}

# Create offline page
create_offline_page() {
    log "Creating offline page..."

    cat > apps/web/public/offline.html << EOF
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LUDUS - غير متصل</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: #f9fafb;
            color: #374151;
            text-align: center;
            padding: 2rem;
        }
        .offline-container {
            max-width: 400px;
            margin: 0 auto;
            padding: 2rem;
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .offline-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 1rem;
            background: #f3f4f6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .offline-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #111827;
        }
        .offline-message {
            font-size: 1rem;
            color: #6b7280;
            margin-bottom: 2rem;
            line-height: 1.5;
        }
        .retry-btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
        .retry-btn:hover {
            background: #2563eb;
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="offline-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="1" y1="1" x2="23" y2="23"></line>
                <path d="M16.72 13.06A10.94 10.94 0 0 1 19 12.55"></path>
                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.69"></path>
                <line x1="1.42" y1="9" x2="4" y2="9"></line>
                <path d="M4 9a10 10 0 0 1 10.84-2.16"></path>
                <line x1="20" y1="9" x2="22.58" y2="9"></line>
                <path d="M22.58 9a10 10 0 0 1-2.16 10.84"></path>
                <line x1="9" y1="1.42" x2="9" y2="4"></line>
                <line x1="9" y1="20" x2="9" y2="22.58"></line>
            </svg>
        </div>
        <h1 class="offline-title">غير متصل</h1>
        <p class="offline-message">
            يبدو أنك غير متصل بالإنترنت. تحقق من اتصالك وحاول مرة أخرى.
        </p>
        <button class="retry-btn" onclick="window.location.reload()">
            إعادة المحاولة
        </button>
    </div>

    <script>
        // Check connection status
        function checkConnection() {
            if (navigator.onLine) {
                window.location.reload()
            }
        }

        // Listen for online event
        window.addEventListener('online', checkConnection)

        // Check connection every 5 seconds
        setInterval(checkConnection, 5000)
    </script>
</body>
</html>
EOF

    success "Offline page created"
}

# Run mobile performance tests
run_mobile_tests() {
    log "Running mobile performance tests..."

    # Create mobile test configuration
    cat > mobile-test-config.js << EOF
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        emulatedFormFactor: 'mobile',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4
        }
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}
EOF

    # Run Lighthouse mobile audit
    if command -v lighthouse &> /dev/null; then
        lighthouse http://localhost:3000 --config-path=mobile-test-config.js --output=html --output-path=mobile-audit.html --chrome-flags="--headless" || warning "Lighthouse audit found issues"
    fi

    # Run accessibility tests
    if command -v pa11y &> /dev/null; then
        pa11y http://localhost:3000 --standard WCAG2AA --reporter html --reporter html --reporter-file mobile-accessibility-report.html || warning "Accessibility audit found issues"
    fi

    success "Mobile performance tests completed"
}

# Main mobile optimization function
main() {
    log "Starting LUDUS Platform mobile optimization..."

    install_mobile_tools
    optimize_mobile_images
    create_mobile_css
    create_mobile_manifest
    create_mobile_service_worker
    create_offline_page
    run_mobile_tests

    success "Mobile optimization completed successfully!"
    log "Mobile-optimized assets are ready for deployment"
}

# Run main function
main "$@"
