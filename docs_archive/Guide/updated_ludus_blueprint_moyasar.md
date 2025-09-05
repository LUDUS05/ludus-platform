# LUDUS Platform Blueprint (Updated - Curated MVP Approach with Moyasar)

## Executive Summary

LUDUS is a social activity discovery platform designed to connect users with local activities, events, and experiences. This updated blueprint follows a **curated MVP approach** - starting with manually onboarded, high-quality vendors to ensure immediate value for users, then evolving to self-service vendor registration once demand is proven.

**Key Changes**: 
- Start with admin-curated vendors rather than building complex vendor registration systems from day one
- **Use Moyasar as the payment gateway** - optimized for Saudi Arabia market with local payment methods support

## 1. Platform Overview

### 1.1 Vision and Purpose

LUDUS aims to transform how people discover, book, and participate in local activities by:
- Providing curated, high-quality activity discovery based on user preferences and location
- Creating a seamless booking and participation process with localized payment methods
- Starting with proven, vetted vendors to ensure user satisfaction
- Building toward self-service vendor onboarding once the platform proves valuable

### 1.2 Target Audience

**Primary Users (MVP Focus):**
- Activity seekers (individuals, groups, families) - THE MAIN FOCUS
- Curated activity providers (vetted by admin team)

**Future Users (Post-MVP):**
- Self-service vendors
- Community organizers
- Corporate team-building coordinators

### 1.3 Updated Value Propositions

**For Users (MVP Priority):**
- Discover high-quality, vetted activities based on interests and location
- Simple, reliable booking and payment process with local payment methods (MADA, SADAD, Apple Pay)
- Curated recommendations ensuring quality experiences
- No low-quality or fake activities

**For Vendors (Future Priority):**
- Access to engaged customers without initial platform complexity
- Quality-focused marketplace positioning
- Local payment processing optimized for Saudi market
- Growth path from assisted to self-service management

## 2. Simplified System Architecture

### 2.1 MVP Architecture (Modular Monolith)

Instead of microservices complexity, we start with a well-organized monolithic application:

```
┌─────────────────┐     ┌─────────────────┐
│  Web Client     │     │  Mobile Web     │
│  (React.js)     │     │  (Responsive)   │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
         ┌───────────────────────┐
         │   Express.js API      │
         │   (Single Application)│
         └───────────┬───────────┘
                     │
         ┌───────────────────────┐
         │      Modules          │
         │  ┌─────────────────┐  │
         │  │ Auth Module     │  │
         │  │ User Module     │  │
         │  │ Activity Module │  │
         │  │ Booking Module  │  │
         │  │ Admin Module    │  │
         │  └─────────────────┘  │
         └───────────┬───────────┘
                     │
         ┌───────────────────────┐
         │     MongoDB           │
         │  (Single Database)    │
         └───────────────────────┘
```

### 2.2 Simplified Tech Stack

**Frontend:**
- React.js (web application)
- Tailwind CSS (styling)
- React Router (navigation)

**Backend:**
- Node.js + Express.js (single application)
- MongoDB with Mongoose (single database)
- JWT for authentication
- **Moyasar for payments** (Saudi-optimized payment gateway)

**Infrastructure:**
- Railway or Vercel (simple deployment)
- MongoDB Atlas (managed database)
- Cloudinary (image storage)

**Future Evolution Path:**
- Add React Native mobile app with Moyasar mobile SDKs
- Split into microservices when needed
- Move to Google Cloud when scaling

## 3. Updated Data Model

### 3.1 Simplified Core Entities

#### User (Customers Only)
```json
{
  "_id": "ObjectId",
  "firstName": "String",
  "lastName": "String", 
  "email": "String",
  "passwordHash": "String",
  "phoneNumber": "String",
  "profilePicture": "String (URL)",
  "preferences": {
    "activityTypes": ["String"],
    "priceRange": {
      "min": "Number",
      "max": "Number"
    },
    "maxDistance": "Number (km)"
  },
  "savedActivities": ["ActivityId"],
  "location": {
    "city": "String",
    "coordinates": [longitude, latitude]
  },
  "paymentMethods": [{
    "moyasarTokenId": "String", // Moyasar token for saved cards
    "last4": "String",
    "brand": "String", // visa, mastercard, mada
    "isDefault": "Boolean"
  }],
  "status": "String (active, inactive)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### Vendor (Admin-Created Only)
```json
{
  "_id": "ObjectId",
  "businessName": "String",
  "description": "String", 
  "contactEmail": "String",
  "contactPhone": "String",
  "website": "String",
  "logo": "String (URL)",
  "images": ["String (URL)"],
  "address": {
    "street": "String",
    "city": "String", 
    "postalCode": "String"
  },
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "category": "String",
  "socialMedia": {
    "instagram": "String",
    "facebook": "String"
  },
  "bankingInfo": {
    "moyasarAccountId": "String", // Vendor's Moyasar account for payouts
    "accountStatus": "String (pending, verified, active)"
  },
  "isActive": "Boolean",
  "createdBy": "admin", // Always admin for MVP
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### Activity (Simplified)
```json
{
  "_id": "ObjectId",
  "title": "String",
  "description": "String",
  "category": "String",
  "tags": ["String"],
  "images": ["String (URL)"],
  "price": {
    "amount": "Number",
    "currency": "SAR" // Default to Saudi Riyal
  },
  "vendor": "VendorId",
  "location": {
    "type": "Point", 
    "coordinates": [longitude, latitude],
    "address": "String"
  },
  "duration": "Number (minutes)",
  "maxParticipants": "Number",
  "requirements": {
    "minAge": "Number",
    "skillLevel": "String (beginner, intermediate, advanced)",
    "whatToBring": ["String"]
  },
  "availability": {
    "daysOfWeek": ["String"], // ["monday", "wednesday"]
    "timeSlots": ["String"],  // ["09:00-11:00", "14:00-16:00"]
    "seasonalInfo": "String"
  },
  "isActive": "Boolean",
  "featured": "Boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### Booking (Core Functionality)
```json
{
  "_id": "ObjectId",
  "user": "UserId",
  "activity": "ActivityId", 
  "vendor": "VendorId",
  "bookingDate": "Date",
  "timeSlot": "String",
  "participants": "Number",
  "contactInfo": {
    "name": "String",
    "email": "String", 
    "phone": "String"
  },
  "specialRequests": "String",
  "pricing": {
    "baseAmount": "Number",
    "totalAmount": "Number",
    "currency": "SAR"
  },
  "payment": {
    "moyasarPaymentId": "String", // Moyasar payment ID
    "moyasarInvoiceId": "String", // Moyasar invoice ID (if using invoices)
    "status": "String (pending, paid, failed, refunded)",
    "method": "String (credit_card, mada, apple_pay, stc_pay, sadad)",
    "last4": "String", // Last 4 digits of card
    "brand": "String" // Payment method brand
  },
  "status": "String (pending, confirmed, cancelled, completed)",
  "bookingReference": "String", // Auto-generated
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 3.2 Simplified Database Indexes

```javascript
// User indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ "location.coordinates": "2dsphere" });

// Activity indexes  
db.activities.createIndex({ "location.coordinates": "2dsphere" });
db.activities.createIndex({ category: 1 });
db.activities.createIndex({ vendor: 1 });
db.activities.createIndex({ isActive: 1 });
db.activities.createIndex({ featured: 1 });

// Booking indexes
db.bookings.createIndex({ user: 1 });
db.bookings.createIndex({ activity: 1 });
db.bookings.createIndex({ bookingDate: 1 });
db.bookings.createIndex({ status: 1 });
db.bookings.createIndex({ "payment.moyasarPaymentId": 1 });
```

## 4. Updated Feature Set (MVP Focus)

### 4.1 User Features (MVP)

#### Core User Journey
- **Discovery**: Browse curated activities by category, location, price
- **Details**: View comprehensive activity information and vendor details
- **Booking**: Simple booking flow with date/time selection and localized payment options
- **Management**: View upcoming and past bookings
- **Profile**: Basic profile management and preferences

#### Specific MVP Features
- User registration and authentication
- Activity browsing with basic filtering (category, price, location)
- Activity detail pages with vendor info
- Simple booking flow
- **Moyasar payment integration** with Saudi payment methods (MADA, SADAD, Apple Pay, Credit Cards)
- User dashboard (upcoming/past bookings)
- Basic search functionality
- Responsive design for mobile

### 4.2 Admin Features (MVP Priority)

#### Vendor Management
- Add/edit/delete vendor profiles
- Upload vendor images and information
- Activate/deactivate vendors
- Manage vendor Moyasar account connections

#### Activity Management  
- Create/edit/delete activities for vendors
- Manage activity images and details
- Set pricing in SAR (Saudi Riyal)
- Feature/unfeature activities

#### Booking Management
- View all bookings across platform
- Update booking statuses
- Handle booking issues and refunds through Moyasar
- Export booking data
- Monitor payment status and failed transactions

#### Payment Management
- Monitor Moyasar transactions
- Handle refunds and disputes
- View payment analytics
- Manage payment method failures

### 4.3 Vendor Features (Future - Post-MVP)
- Self-registration and verification
- Vendor dashboard
- Self-service activity management
- Booking management
- Payment analytics via Moyasar

## 5. Updated Implementation Roadmap

### 5.1 Phase 1: MVP (8 weeks)

**Week 1-2: Foundation**
- Project setup (Node.js, React, MongoDB)
- User authentication system
- Basic UI components and routing
- Database schema implementation
- **Moyasar account setup and API key configuration**

**Week 3-4: Core Features**
- Activity browsing and filtering
- Activity detail pages  
- Vendor profile pages
- Basic search functionality

**Week 5-6: Booking System**
- Booking flow implementation
- **Moyasar payment integration** (credit cards, MADA, Apple Pay)
- Booking confirmation and management
- Email notifications
- **Moyasar webhook handling**

**Week 7-8: Admin Panel & Polish**
- Admin dashboard for vendor/activity management
- User dashboard for booking management
- **Payment management tools for Moyasar transactions**
- Testing, bug fixes, and deployment
- Content creation (add 15-20 quality vendors/activities)

### 5.2 Phase 2: Growth Features (4 weeks)

**Week 9-10: Enhanced Discovery**
- Advanced filtering and search
- User reviews and ratings
- Activity recommendations
- Social sharing features

**Week 11-12: Vendor Self-Service & Advanced Payments**
- Vendor registration flow
- Basic vendor dashboard
- Self-service activity creation
- **Advanced Moyasar features** (tokenization, recurring payments)
- Vendor verification process

### 5.3 Phase 3: Scale & Optimize (4 weeks)

**Week 13-14: Mobile & Performance**
- React Native mobile app with **Moyasar mobile SDKs**
- Performance optimization
- Advanced caching
- SEO optimization

**Week 15-16: Advanced Features**
- Group bookings
- Loyalty program basics
- Advanced analytics
- API for future integrations

## 6. Simplified API Design

### 6.1 Core API Endpoints

#### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/forgot-password
```

#### Users
```
GET /api/users/profile
PUT /api/users/profile
GET /api/users/bookings
GET /api/users/saved-activities
POST /api/users/saved-activities/:id
DELETE /api/users/saved-activities/:id
GET /api/users/payment-methods
POST /api/users/payment-methods (save Moyasar token)
DELETE /api/users/payment-methods/:id
```

#### Activities
```
GET /api/activities
GET /api/activities/:id
GET /api/activities/search?q=&category=&minPrice=&maxPrice=&location=
GET /api/activities/featured
GET /api/activities/categories
```

#### Vendors
```
GET /api/vendors/:id
GET /api/vendors/:id/activities
```

#### Bookings
```
GET /api/bookings (user's bookings)
GET /api/bookings/:id
POST /api/bookings
PUT /api/bookings/:id/cancel
POST /api/bookings/:id/refund
```

#### Payments (Moyasar Integration)
```
POST /api/payments/create-payment
POST /api/payments/confirm-payment
GET /api/payments/:paymentId/status
POST /api/payments/webhook (Moyasar webhook handler)
POST /api/payments/refund
```

#### Admin (Protected)
```
GET /api/admin/vendors
POST /api/admin/vendors
PUT /api/admin/vendors/:id
DELETE /api/admin/vendors/:id

GET /api/admin/activities
POST /api/admin/activities
PUT /api/admin/activities/:id
DELETE /api/admin/activities/:id

GET /api/admin/bookings
PUT /api/admin/bookings/:id/status
GET /api/admin/payments/analytics
```

## 7. File Structure

```
ludus-platform/
├── client/                          # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Reusable components
│   │   │   ├── auth/                # Login, register components
│   │   │   ├── activities/          # Activity browsing, details
│   │   │   ├── bookings/            # Booking flow components
│   │   │   ├── payments/            # Moyasar payment components
│   │   │   ├── user/                # User dashboard, profile
│   │   │   └── admin/               # Admin panel components
│   │   ├── pages/                   # Page components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── services/                # API service functions
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── activityService.js
│   │   │   ├── bookingService.js
│   │   │   └── moyasarService.js    # Moyasar integration
│   │   ├── utils/                   # Helper functions
│   │   └── App.js
│   └── package.json
├── server/                          # Express backend
│   ├── src/
│   │   ├── controllers/             # Route handlers
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── activityController.js
│   │   │   ├── vendorController.js
│   │   │   ├── bookingController.js
│   │   │   ├── paymentController.js # Moyasar payments
│   │   │   └── adminController.js
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Vendor.js
│   │   │   ├── Activity.js
│   │   │   └── Booking.js
│   │   ├── routes/                  # Express routes
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── activities.js
│   │   │   ├── vendors.js
│   │   │   ├── bookings.js
│   │   │   ├── payments.js          # Moyasar routes
│   │   │   └── admin.js
│   │   ├── middleware/              # Custom middleware
│   │   │   ├── auth.js              # JWT authentication
│   │   │   ├── admin.js             # Admin authorization
│   │   │   └── validation.js        # Request validation
│   │   ├── services/                # Business logic
│   │   │   ├── emailService.js
│   │   │   ├── moyasarService.js    # Moyasar integration
│   │   │   └── uploadService.js
│   │   ├── utils/                   # Helper functions
│   │   ├── config/                  # Configuration files
│   │   │   ├── database.js
│   │   │   ├── moyasar.js           # Moyasar configuration
│   │   │   └── env.js
│   │   └── app.js                   # Express app setup
│   └── package.json
├── shared/                          # Shared utilities and types
│   ├── constants.js
│   └── validation.js
├── docs/                           # Documentation
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

## 8. Getting Started Guide

### 8.1 Development Setup

1. **Clone and Install**
```bash
git clone <repository>
cd ludus-platform
npm install
cd client && npm install
cd ../server && npm install
```

2. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Configure your .env file:
MONGODB_URI=mongodb://localhost:27017/ludus
JWT_SECRET=your-secret-key
MOYASAR_PUBLISHABLE_KEY=your-moyasar-publishable-key
MOYASAR_SECRET_KEY=your-moyasar-secret-key
MOYASAR_WEBHOOK_SECRET=your-moyasar-webhook-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

3. **Moyasar Setup**
```bash
# Register at https://moyasar.com
# Get API keys from Moyasar dashboard
# Set up webhooks for payment notifications
# Configure supported payment methods (MADA, Apple Pay, etc.)
```

4. **Database Setup**
```bash
# Start MongoDB locally or use MongoDB Atlas
# Run database seed script (creates sample data)
npm run seed
```

5. **Start Development**
```bash
# Start backend (port 5000)
npm run server

# Start frontend (port 3000) 
npm run client

# Or start both
npm run dev
```

### 8.2 First Steps After Setup

1. **Create Admin Account**: Register and manually set role to 'admin' in database
2. **Configure Moyasar**: Set up payment methods and test transactions
3. **Add Sample Vendors**: Use admin panel to create 5-10 vendor profiles
4. **Create Activities**: Add 15-20 activities across different categories
5. **Test User Flow**: Register as user, browse, and make test booking with Moyasar
6. **Configure Webhooks**: Set up Moyasar webhook endpoints for payment notifications

## 9. Payment Integration Strategy (Moyasar)

### 9.1 Moyasar Advantages for Saudi Market

**Local Optimization:**
- **MADA support**: Saudi debit card network integration
- **SADAD support**: Government payment system
- **STC Pay**: Popular mobile payment method
- **SAR currency**: Native Saudi Riyal processing
- **Local compliance**: Saudi Central Bank supervised

**Technical Benefits:**
- REST API with JSON responses
- Real-time webhooks for payment status
- Tokenization for saved payment methods
- Mobile SDKs for iOS/Android
- Test sandbox environment

### 9.2 Supported Payment Methods
1. **Credit/Debit Cards** (Visa, Mastercard)
2. **MADA** (Saudi debit card network)
3. **Apple Pay** (Web and mobile)
4. **STC Pay** (Mobile payment)
5. **SADAD** (Government payment system)
6. **Samsung Pay** (Mobile payment)

### 9.3 Payment Flow Implementation
```javascript
// Example payment creation
const payment = await moyasar.payments.create({
  amount: totalAmount * 100, // Amount in halalas (SAR cents)
  currency: 'SAR',
  description: `Booking for ${activityTitle}`,
  callback_url: `${process.env.FRONTEND_URL}/booking/success`,
  source: {
    type: 'creditcard',
    name: 'Customer Name',
    number: 'token_from_frontend',
    // Or for saved cards: token: 'moyasar_token_id'
  },
  metadata: {
    booking_id: bookingId,
    user_id: userId,
    activity_id: activityId
  }
});
```

## 10. Content Strategy (Critical for MVP)

### 10.1 Vendor Curation Strategy

**Target 15-20 High-Quality Vendors:**
- **Fitness**: Yoga studios, personal trainers, martial arts schools
- **Arts & Crafts**: Pottery studios, painting classes, music lessons  
- **Food & Drink**: Cooking classes, traditional Saudi cuisine experiences
- **Outdoor**: Desert tours, hiking guides, water sports in coastal areas
- **Cultural**: Heritage experiences, traditional crafts, language classes
- **Wellness**: Meditation centers, spa experiences, wellness workshops

### 10.2 Quality Criteria
- Established business with good reputation
- Professional photos and clear descriptions
- Responsive communication
- Proper licensing/insurance
- Competitive pricing in SAR
- **Moyasar payment capability** or willingness to set up

### 10.3 Content Creation Process
1. **Research**: Identify potential vendors in Riyadh and major Saudi cities
2. **Outreach**: Contact vendors with partnership proposal
3. **Payment Setup**: Help vendors set up Moyasar accounts
4. **Onboarding**: Gather all necessary information and media
5. **Profile Creation**: Create compelling vendor and activity profiles
6. **Testing**: Ensure all booking and payment flows work correctly

## 11. Success Metrics (MVP)

### 11.1 Key Performance Indicators

**User Engagement:**
- User registrations per week
- Activity page views
- Booking conversion rate (views → bookings)
- User retention (repeat bookings)

**Business Metrics:**
- Total bookings per month
- Average booking value (in SAR)
- Revenue per user
- Vendor satisfaction
- **Payment success rate** (Moyasar transactions)

**Payment Metrics:**
- Payment method distribution (MADA vs cards vs Apple Pay)
- Payment failure rate by method
- Average payment processing time
- Refund/chargeback rates

**Technical Metrics:**
- Page load times < 3 seconds
- Mobile responsiveness score
- API response times < 500ms
- System uptime > 99%
- **Moyasar API response times**

### 11.2 Success Thresholds (First 3 Months)
- 100+ registered users
- 50+ completed bookings with successful payments
- 15+ active vendors with Moyasar integration
- 20+ activities across 5 categories
- 4.5+ average user rating
- **95%+ payment success rate**

## 12. Risk Mitigation

### 12.1 Technical Risks
- **Database Performance**: Start with indexed MongoDB, plan for scaling
- **Payment Issues**: Thorough Moyasar testing, error handling, webhook reliability
- **Mobile Experience**: Responsive design testing on multiple devices
- **API Reliability**: Moyasar API monitoring and fallback strategies

### 12.2 Business Risks  
- **Vendor Dependency**: Maintain good relationships, have backup vendors
- **Payment Compliance**: Ensure PCI compliance through Moyasar
- **Seasonal Variations**: Mix of indoor/outdoor, seasonal activities
- **Competition**: Focus on quality curation and local payment methods as differentiator

### 12.3 Operational Risks
- **Customer Support**: Plan for booking issues, payment disputes, refund processes
- **Content Quality**: Regular vendor check-ins, photo updates
- **Legal Compliance**: Clear terms of service, privacy policy, Saudi regulations
- **Payment Security**: Rely on Moyasar's Saudi Central Bank supervision

## 13. Future Evolution Path

### 13.1 Post-MVP Enhancements (Months 4-6)
- Vendor self-registration and dashboard
- Mobile app development with Moyasar mobile SDKs
- Advanced search and filtering
- User reviews and rating system
- Group booking functionality
- **Moyasar tokenization** for recurring payments

### 13.2 Scaling Considerations (Months 7-12)
- Microservices architecture migration
- Geographic expansion within Saudi Arabia
- API for third-party integrations
- Advanced analytics and BI
- Multi-language support (Arabic/English)
- **Advanced Moyasar features** (invoicing, subscriptions)

### 13.3 Long-term Vision (Year 2+)
- AI-powered recommendations
- Social features and community building
- Corporate partnerships
- Franchise/white-label opportunities
- Regional expansion (GCC countries)
- **Cross-border payments** via Moyasar's network

## Conclusion

This updated LUDUS blueprint prioritizes rapid MVP development through a curated vendor approach and **localized payment processing via Moyasar**, focusing on user experience and proven demand before building complex vendor tools. The simplified architecture allows for quick development while maintaining a clear path to future scalability.

**Moyasar integration provides significant advantages:**
- Native Saudi payment methods (MADA, SADAD, STC Pay)
- Local currency processing (SAR)
- Saudi Central Bank compliance
- Better conversion rates for local users
- Reduced payment friction

The key to success is launching quickly with high-quality, curated content and seamless local payment experience that provides immediate value to users, then expanding features based on real user feedback and demonstrated demand.

---

**Next Steps**: 
1. Set up development environment
2. **Register Moyasar account and obtain API keys**
3. Begin Phase 1 development (8-week sprint)
4. Start vendor outreach and Moyasar onboarding
5. Plan content creation and photography
6. Prepare for user testing and payment flow validation