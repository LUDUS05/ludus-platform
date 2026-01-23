# LUDUS Platform - Technical Specifications

**Version:** 1.0  
**Last Updated:** January 27, 2025  
**Status:** Production Ready  

## 📋 Table of Contents

1. [Platform Constitution](#platform-constitution)
2. [System Architecture](#system-architecture)
3. [API Specifications](#api-specifications)
4. [Database Schema](#database-schema)
5. [Security Requirements](#security-requirements)
6. [Deployment Architecture](#deployment-architecture)
7. [Performance Requirements](#performance-requirements)
8. [Monitoring & Observability](#monitoring--observability)

---

## 🏛️ Platform Constitution

### **Immutable Principles**

The LUDUS platform is built on these unchangeable principles that guide all development decisions:

#### **1. Saudi-First Design**
- **Arabic Language Primary:** All interfaces must support Arabic as the primary language
- **RTL Layout:** Right-to-left text direction is the default layout
- **Cultural Sensitivity:** All features must respect Saudi cultural and religious values
- **Local Market Focus:** Platform optimized for Saudi Arabian market needs

#### **2. Family-Centric Approach**
- **Family Activities:** Core focus on family-friendly activities and experiences
- **Multi-Generation Support:** Features must work for all age groups
- **Safety First:** All activities must meet safety standards for families
- **Community Building:** Platform fosters local community connections

#### **3. Technology Excellence**
- **Performance:** Sub-200ms API response times
- **Reliability:** 99.9% uptime requirement
- **Security:** Zero-trust security model
- **Scalability:** Support for 100,000+ concurrent users

#### **4. User Experience Priority**
- **Intuitive Design:** Users should accomplish tasks in 3 clicks or less
- **Mobile-First:** All features must work perfectly on mobile devices
- **Accessibility:** WCAG 2.1 AA compliance required
- **Offline Capability:** Core features work without internet connection

---

## 🏗️ System Architecture

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    LUDUS Platform Architecture              │
├─────────────────────────────────────────────────────────────┤
│  Frontend Layer (React + TypeScript)                       │
│  ├── Web App (apps/web)                                    │
│  ├── Admin Dashboard (apps/admin)                          │
│  └── Mobile App (apps/mobile) - Future                     │
├─────────────────────────────────────────────────────────────┤
│  API Gateway Layer (Express.js + Node.js)                  │
│  ├── Authentication Service                                 │
│  ├── Activity Management Service                           │
│  ├── Booking Service                                       │
│  ├── Payment Service                                       │
│  └── Notification Service                                  │
├─────────────────────────────────────────────────────────────┤
│  Data Layer (MongoDB Atlas)                                │
│  ├── User Data                                             │
│  ├── Activity Data                                         │
│  ├── Booking Data                                          │
│  └── Analytics Data                                        │
├─────────────────────────────────────────────────────────────┤
│  External Services                                         │
│  ├── Moyasar (Payments)                                    │
│  ├── Twilio (SMS)                                          │
│  ├── Cloudinary (Media)                                    │
│  └── SendGrid (Email)                                      │
└─────────────────────────────────────────────────────────────┘
```

### **Technology Stack**

#### **Frontend**
- **Framework:** React 18.2.0 with TypeScript
- **State Management:** Redux Toolkit + RTK Query
- **UI Library:** Custom components with Tailwind CSS
- **Internationalization:** i18next with Arabic RTL support
- **Build Tool:** Vite for fast development and building

#### **Backend**
- **Runtime:** Node.js 18+ with Express.js
- **Language:** TypeScript for type safety
- **Authentication:** JWT with refresh tokens
- **Validation:** Joi for request validation
- **Documentation:** Swagger/OpenAPI 3.0

#### **Database**
- **Primary:** MongoDB Atlas (M30 cluster)
- **Cache:** Redis for session and data caching
- **Search:** MongoDB text search with geospatial queries
- **Backup:** Automated daily backups with 7-day retention

#### **Infrastructure**
- **Hosting:** Render.com for scalable deployment
- **CDN:** Cloudflare for global content delivery
- **Monitoring:** Custom monitoring with health checks
- **CI/CD:** GitHub Actions for automated deployment

---

## 🔌 API Specifications

### **Base URL**
```
Production: https://api.ludus.sa
Development: http://localhost:5000
```

### **Authentication**
All API endpoints (except public ones) require JWT authentication:

```http
Authorization: Bearer <jwt_token>
```

### **Response Format**
All API responses follow this standard format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2025-01-27T12:00:00.000Z",
  "requestId": "req_123456789"
}
```

### **Error Format**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "timestamp": "2025-01-27T12:00:00.000Z",
  "requestId": "req_123456789"
}
```

### **Core API Endpoints**

#### **Authentication Endpoints**
```http
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
POST /api/auth/logout            # User logout
POST /api/auth/refresh           # Refresh JWT token
POST /api/auth/forgot-password   # Password reset request
POST /api/auth/reset-password    # Password reset completion
GET  /api/auth/me                # Get current user profile
```

#### **Activity Endpoints**
```http
GET    /api/activities           # List activities with filters
POST   /api/activities           # Create new activity
GET    /api/activities/:id       # Get activity details
PUT    /api/activities/:id       # Update activity
DELETE /api/activities/:id       # Delete activity
GET    /api/activities/search    # Search activities
GET    /api/activities/categories # Get activity categories
```

#### **Booking Endpoints**
```http
GET    /api/bookings             # List user bookings
POST   /api/bookings             # Create new booking
GET    /api/bookings/:id         # Get booking details
PUT    /api/bookings/:id         # Update booking
DELETE /api/bookings/:id         # Cancel booking
POST   /api/bookings/:id/confirm # Confirm booking
GET    /api/bookings/:id/qr      # Get QR code for check-in
```

#### **Payment Endpoints**
```http
POST   /api/payments/create      # Create payment
GET    /api/payments/:id         # Get payment details
POST   /api/payments/:id/refund  # Process refund
GET    /api/payments/history     # Payment history
POST   /api/payments/webhook     # Moyasar webhook
```

#### **User Management Endpoints**
```http
GET    /api/users                # List users (admin)
GET    /api/users/:id            # Get user profile
PUT    /api/users/:id            # Update user profile
DELETE /api/users/:id            # Delete user (admin)
GET    /api/users/:id/activities # User's activities
GET    /api/users/:id/bookings   # User's bookings
```

### **API Rate Limiting**
- **General API:** 100 requests per 15 minutes per IP
- **Authentication:** 5 attempts per minute per IP
- **Payment API:** 10 requests per minute per user
- **Search API:** 50 requests per minute per user

---

## 🗄️ Database Schema

### **Core Collections**

#### **Users Collection**
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  phone: String (Saudi format),
  dateOfBirth: Date,
  gender: String (enum: ['male', 'female']),
  preferences: {
    language: String (default: 'ar'),
    notifications: {
      email: Boolean (default: true),
      sms: Boolean (default: true),
      push: Boolean (default: true)
    },
    interests: [String],
    location: {
      city: String,
      coordinates: {
        type: 'Point',
        coordinates: [Number, Number] // [longitude, latitude]
      }
    }
  },
  role: String (enum: ['user', 'partner', 'admin']),
  isVerified: Boolean (default: false),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}
```

#### **Activities Collection**
```javascript
{
  _id: ObjectId,
  title: {
    ar: String (required),
    en: String (required)
  },
  description: {
    ar: String (required),
    en: String (required)
  },
  category: String (required),
  subcategory: String,
  location: {
    name: String (required),
    address: String (required),
    city: String (required),
    coordinates: {
      type: 'Point',
      coordinates: [Number, Number]
    }
  },
  pricing: {
    adult: Number (required),
    child: Number,
    family: Number,
    currency: String (default: 'SAR')
  },
  schedule: {
    startDate: Date (required),
    endDate: Date (required),
    timeSlots: [{
      startTime: String,
      endTime: String,
      maxParticipants: Number
    }]
  },
  requirements: {
    minAge: Number,
    maxAge: Number,
    difficulty: String (enum: ['easy', 'medium', 'hard']),
    equipment: [String],
    specialRequirements: String
  },
  media: {
    images: [String], // Cloudinary URLs
    videos: [String],
    thumbnail: String
  },
  partner: {
    id: ObjectId (ref: 'Partners'),
    name: String,
    contact: String
  },
  status: String (enum: ['draft', 'published', 'suspended', 'archived']),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

#### **Bookings Collection**
```javascript
{
  _id: ObjectId,
  user: {
    id: ObjectId (ref: 'Users'),
    name: String,
    email: String,
    phone: String
  },
  activity: {
    id: ObjectId (ref: 'Activities'),
    title: String,
    date: Date,
    timeSlot: String
  },
  participants: [{
    name: String (required),
    age: Number,
    type: String (enum: ['adult', 'child'])
  }],
  pricing: {
    subtotal: Number,
    tax: Number,
    total: Number,
    currency: String
  },
  payment: {
    id: String, // Moyasar payment ID
    status: String (enum: ['pending', 'completed', 'failed', 'refunded']),
    method: String,
    transactionId: String
  },
  status: String (enum: ['pending', 'confirmed', 'cancelled', 'completed']),
  qrCode: String, // For check-in
  checkInAt: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Reviews Collection**
```javascript
{
  _id: ObjectId,
  user: {
    id: ObjectId (ref: 'Users'),
    name: String,
    avatar: String
  },
  activity: {
    id: ObjectId (ref: 'Activities'),
    title: String
  },
  booking: ObjectId (ref: 'Bookings'),
  rating: Number (min: 1, max: 5, required),
  title: String,
  comment: String,
  images: [String], // User uploaded images
  helpful: Number (default: 0),
  isVerified: Boolean (default: false),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### **Database Indexes**

#### **Performance Indexes**
```javascript
// Users collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "preferences.location.coordinates": "2dsphere" })
db.users.createIndex({ "role": 1, "isActive": 1 })

// Activities collection
db.activities.createIndex({ "location.coordinates": "2dsphere" })
db.activities.createIndex({ "category": 1, "status": 1 })
db.activities.createIndex({ "title.ar": "text", "title.en": "text", "description.ar": "text", "description.en": "text" })
db.activities.createIndex({ "schedule.startDate": 1, "schedule.endDate": 1 })
db.activities.createIndex({ "partner.id": 1, "status": 1 })

// Bookings collection
db.bookings.createIndex({ "user.id": 1, "createdAt": -1 })
db.bookings.createIndex({ "activity.id": 1, "status": 1 })
db.bookings.createIndex({ "payment.id": 1 })
db.bookings.createIndex({ "qrCode": 1 }, { unique: true })

// Reviews collection
db.reviews.createIndex({ "activity.id": 1, "isActive": 1 })
db.reviews.createIndex({ "user.id": 1, "createdAt": -1 })
db.reviews.createIndex({ "rating": 1, "isActive": 1 })
```

---

## 🔒 Security Requirements

### **Authentication & Authorization**

#### **JWT Token Security**
- **Access Token:** 15 minutes expiration
- **Refresh Token:** 7 days expiration
- **Algorithm:** RS256 with rotating keys
- **Storage:** HttpOnly cookies for refresh tokens
- **Rotation:** Automatic refresh token rotation

#### **Password Security**
- **Hashing:** bcrypt with salt rounds of 12
- **Minimum Length:** 8 characters
- **Requirements:** At least 1 uppercase, 1 lowercase, 1 number, 1 special character
- **History:** Prevent reuse of last 5 passwords

#### **Role-Based Access Control (RBAC)**
```javascript
const roles = {
  user: ['read:profile', 'create:booking', 'read:activities'],
  partner: ['read:profile', 'create:activity', 'manage:bookings', 'read:analytics'],
  admin: ['*'] // All permissions
}
```

### **Data Protection**

#### **Encryption**
- **At Rest:** AES-256 encryption for sensitive data
- **In Transit:** TLS 1.3 for all communications
- **Database:** MongoDB encryption at rest enabled
- **Files:** Cloudinary encryption for uploaded media

#### **Data Privacy**
- **GDPR Compliance:** User data export and deletion
- **Data Retention:** 7 years for financial records, 2 years for user data
- **Anonymization:** Personal data anonymized after account deletion
- **Consent Management:** Granular consent for data processing

### **API Security**

#### **Input Validation**
- **Schema Validation:** Joi schemas for all inputs
- **SQL Injection Prevention:** Parameterized queries only
- **XSS Protection:** Input sanitization and output encoding
- **File Upload Security:** Type validation and virus scanning

#### **Rate Limiting**
- **IP-based:** 100 requests per 15 minutes
- **User-based:** 1000 requests per hour
- **Endpoint-specific:** Custom limits for sensitive endpoints
- **DDoS Protection:** Cloudflare protection enabled

### **Infrastructure Security**

#### **Network Security**
- **VPC:** Private network for database access
- **Firewall:** Restrictive rules for all services
- **WAF:** Web Application Firewall for API protection
- **DDoS Protection:** Cloudflare DDoS mitigation

#### **Monitoring & Alerting**
- **Security Events:** Real-time monitoring of security events
- **Failed Logins:** Alert after 5 failed attempts
- **Suspicious Activity:** ML-based anomaly detection
- **Incident Response:** 24/7 security team on-call

---

## 🚀 Deployment Architecture

### **Production Environment**

#### **Frontend Deployment**
- **Platform:** Render.com Static Site
- **CDN:** Cloudflare for global distribution
- **SSL:** Automatic SSL certificate management
- **Build:** Automated builds on git push

#### **Backend Deployment**
- **Platform:** Render.com Web Service
- **Runtime:** Node.js 18+ with PM2
- **Scaling:** Auto-scaling based on CPU/memory
- **Health Checks:** Automated health monitoring

#### **Database**
- **Platform:** MongoDB Atlas M30 cluster
- **Region:** Middle East (Bahrain)
- **Backup:** Automated daily backups
- **Monitoring:** 24/7 database monitoring

### **Development Environment**

#### **Local Development**
- **Docker Compose:** All services containerized
- **Hot Reload:** Frontend and backend hot reload
- **Database:** Local MongoDB with sample data
- **Environment:** Separate dev/staging/prod configs

#### **Staging Environment**
- **Platform:** Render.com preview deployments
- **Database:** Separate staging MongoDB cluster
- **Testing:** Automated integration tests
- **Review:** Pull request preview deployments

---

## ⚡ Performance Requirements

### **Response Time Targets**
- **API Endpoints:** < 200ms for 95% of requests
- **Page Load:** < 2 seconds for initial page load
- **Search Results:** < 500ms for activity search
- **Image Loading:** < 1 second for optimized images

### **Scalability Targets**
- **Concurrent Users:** 10,000+ simultaneous users
- **API Throughput:** 1,000+ requests per second
- **Database Queries:** < 50ms average query time
- **File Uploads:** Support for 10MB+ images

### **Optimization Strategies**
- **Caching:** Redis for session and data caching
- **CDN:** Cloudflare for static asset delivery
- **Database:** Optimized indexes and query patterns
- **Images:** WebP format with multiple sizes
- **Code Splitting:** Lazy loading for frontend components

---

## 📊 Monitoring & Observability

### **Application Monitoring**
- **Health Checks:** Automated endpoint monitoring
- **Error Tracking:** Real-time error monitoring and alerting
- **Performance:** APM for response time tracking
- **Uptime:** 99.9% uptime monitoring

### **Business Metrics**
- **User Engagement:** Daily/monthly active users
- **Booking Conversion:** Activity view to booking rate
- **Revenue Tracking:** Real-time revenue monitoring
- **Customer Satisfaction:** Review ratings and feedback

### **Infrastructure Monitoring**
- **Server Metrics:** CPU, memory, disk usage
- **Database Performance:** Query performance and slow queries
- **Network Monitoring:** Bandwidth and latency tracking
- **Security Monitoring:** Failed login attempts and suspicious activity

### **Alerting**
- **Critical Alerts:** Immediate notification for system failures
- **Warning Alerts:** Proactive alerts for performance degradation
- **Business Alerts:** Revenue and user engagement thresholds
- **Security Alerts:** Real-time security incident notifications

---

## 📝 API Documentation

### **Interactive Documentation**
- **Swagger UI:** Available at `/api/docs`
- **OpenAPI 3.0:** Complete API specification
- **Code Examples:** JavaScript, Python, cURL examples
- **Testing:** Interactive API testing interface

### **SDK Support**
- **JavaScript SDK:** NPM package for frontend integration
- **Python SDK:** For backend integrations
- **Mobile SDK:** React Native integration
- **Webhook SDK:** For partner integrations

---

## 🔄 Versioning & Compatibility

### **API Versioning**
- **Current Version:** v1.0
- **Versioning Strategy:** URL path versioning (`/api/v1/`)
- **Backward Compatibility:** 12 months support for previous versions
- **Deprecation Policy:** 6 months notice before breaking changes

### **Database Migrations**
- **Migration System:** Automated database migrations
- **Rollback Support:** Safe rollback procedures
- **Data Integrity:** Validation before and after migrations
- **Zero Downtime:** Blue-green deployment for schema changes

---

## 📞 Support & Maintenance

### **Technical Support**
- **Documentation:** Comprehensive technical documentation
- **Code Comments:** Inline code documentation
- **Architecture Decision Records:** ADR for major decisions
- **Troubleshooting Guides:** Common issues and solutions

### **Maintenance Schedule**
- **Security Updates:** Monthly security patches
- **Feature Updates:** Bi-weekly feature releases
- **Database Maintenance:** Weekly maintenance windows
- **Performance Reviews:** Monthly performance analysis

---

**Document Status:** ✅ **COMPLETED**  
**Next Review:** February 27, 2025  
**Maintainer:** LUDUS Development Team
