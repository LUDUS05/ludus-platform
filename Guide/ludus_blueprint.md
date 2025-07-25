# LUDUS Platform Blueprint (Updated - Curated MVP Approach)

## Executive Summary

LUDUS is a social activity discovery platform designed to connect users with local activities, events, and experiences. This updated blueprint follows a **curated MVP approach** - starting with manually onboarded, high-quality vendors to ensure immediate value for users, then evolving to self-service vendor registration once demand is proven.

**Key Change**: We start with admin-curated vendors rather than building complex vendor registration systems from day one, allowing for faster launch and better user experience validation.

## 1. Platform Overview

### 1.1 Vision and Purpose

LUDUS aims to transform how people discover, book, and participate in local activities by:
- Providing curated, high-quality activity discovery based on user preferences and location
- Creating a seamless booking and participation process
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
- Simple, reliable booking and payment process
- Curated recommendations ensuring quality experiences
- No low-quality or fake activities

**For Vendors (Future Priority):**
- Access to engaged customers without initial platform complexity
- Quality-focused marketplace positioning
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
- Stripe for payments

**Infrastructure:**
- Railway or Vercel (simple deployment)
- MongoDB Atlas (managed database)
- Cloudinary (image storage)

**Future Evolution Path:**
- Add React Native mobile app
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
    "currency": "String"
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
    "whatTobring": ["String"]
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
    "currency": "String"
  },
  "payment": {
    "stripePaymentIntentId": "String",
    "status": "String (pending, completed, refunded)"
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
```

## 4. Updated Feature Set (MVP Focus)

### 4.1 User Features (MVP)

#### Core User Journey
- **Discovery**: Browse curated activities by category, location, price
- **Details**: View comprehensive activity information and vendor details
- **Booking**: Simple booking flow with date/time selection and payment
- **Management**: View upcoming and past bookings
- **Profile**: Basic profile management and preferences

#### Specific MVP Features
- User registration and authentication
- Activity browsing with basic filtering (category, price, location)
- Activity detail pages with vendor info
- Simple booking flow
- Stripe payment integration
- User dashboard (upcoming/past bookings)
- Basic search functionality
- Responsive design for mobile

### 4.2 Admin Features (MVP Priority)

#### Vendor Management
- Add/edit/delete vendor profiles
- Upload vendor images and information
- Activate/deactivate vendors

#### Activity Management  
- Create/edit/delete activities for vendors
- Manage activity images and details
- Set pricing and availability
- Feature/unfeature activities

#### Booking Management
- View all bookings across platform
- Update booking statuses
- Handle booking issues and refunds
- Export booking data

#### Content Management
- Manage activity categories and tags
- Upload and organize images
- Create featured activity collections

### 4.3 Vendor Features (Future - Post-MVP)
- Self-registration and verification
- Vendor dashboard
- Self-service activity management
- Booking management
- Basic analytics

## 5. Updated Implementation Roadmap

### 5.1 Phase 1: MVP (8 weeks)

**Week 1-2: Foundation**
- Project setup (Node.js, React, MongoDB)
- User authentication system
- Basic UI components and routing
- Database schema implementation

**Week 3-4: Core Features**
- Activity browsing and filtering
- Activity detail pages  
- Vendor profile pages
- Basic search functionality

**Week 5-6: Booking System**
- Booking flow implementation
- Stripe payment integration
- Booking confirmation and management
- Email notifications

**Week 7-8: Admin Panel & Polish**
- Admin dashboard for vendor/activity management
- User dashboard for booking management
- Testing, bug fixes, and deployment
- Content creation (add 15-20 quality vendors/activities)

### 5.2 Phase 2: Growth Features (4 weeks)

**Week 9-10: Enhanced Discovery**
- Advanced filtering and search
- User reviews and ratings
- Activity recommendations
- Social sharing features

**Week 11-12: Vendor Self-Service**
- Vendor registration flow
- Basic vendor dashboard
- Self-service activity creation
- Vendor verification process

### 5.3 Phase 3: Scale & Optimize (4 weeks)

**Week 13-14: Mobile & Performance**
- React Native mobile app
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
│   │   │   ├── user/                # User dashboard, profile
│   │   │   └── admin/               # Admin panel components
│   │   ├── pages/                   # Page components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── services/                # API service functions
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
│   │   │   └── admin.js
│   │   ├── middleware/              # Custom middleware
│   │   │   ├── auth.js              # JWT authentication
│   │   │   ├── admin.js             # Admin authorization
│   │   │   └── validation.js        # Request validation
│   │   ├── services/                # Business logic
│   │   │   ├── emailService.js
│   │   │   ├── paymentService.js
│   │   │   └── uploadService.js
│   │   ├── utils/                   # Helper functions
│   │   ├── config/                  # Configuration files
│   │   │   ├── database.js
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
STRIPE_SECRET_KEY=your-stripe-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

3. **Database Setup**
```bash
# Start MongoDB locally or use MongoDB Atlas
# Run database seed script (creates sample data)
npm run seed
```

4. **Start Development**
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
2. **Add Sample Vendors**: Use admin panel to create 5-10 vendor profiles
3. **Create Activities**: Add 15-20 activities across different categories
4. **Test User Flow**: Register as user, browse, and make test booking
5. **Configure Payments**: Set up Stripe webhook endpoints

## 9. Content Strategy (Critical for MVP)

### 9.1 Vendor Curation Strategy

**Target 15-20 High-Quality Vendors:**
- **Fitness**: Yoga studios, personal trainers, martial arts schools
- **Arts & Crafts**: Pottery studios, painting classes, music lessons  
- **Food & Drink**: Cooking classes, wine tastings, cocktail workshops
- **Outdoor**: Hiking guides, bike tours, water sports
- **Wellness**: Meditation centers, spa experiences, wellness workshops

### 9.2 Quality Criteria
- Established business with good reputation
- Professional photos and clear descriptions
- Responsive communication
- Proper licensing/insurance
- Competitive pricing

### 9.3 Content Creation Process
1. **Research**: Identify potential vendors in target area
2. **Outreach**: Contact vendors with partnership proposal
3. **Onboarding**: Gather all necessary information and media
4. **Profile Creation**: Create compelling vendor and activity profiles
5. **Testing**: Ensure all booking flows work correctly

## 10. Success Metrics (MVP)

### 10.1 Key Performance Indicators

**User Engagement:**
- User registrations per week
- Activity page views
- Booking conversion rate (views → bookings)
- User retention (repeat bookings)

**Business Metrics:**
- Total bookings per month
- Average booking value
- Revenue per user
- Vendor satisfaction

**Technical Metrics:**
- Page load times < 3 seconds
- Mobile responsiveness score
- API response times < 500ms
- System uptime > 99%

### 10.2 Success Thresholds (First 3 Months)
- 100+ registered users
- 50+ completed bookings  
- 15+ active vendors
- 20+ activities across 5 categories
- 4.5+ average user rating

## 11. Risk Mitigation

### 11.1 Technical Risks
- **Database Performance**: Start with indexed MongoDB, plan for scaling
- **Payment Issues**: Thorough Stripe testing, error handling
- **Mobile Experience**: Responsive design testing on multiple devices

### 11.2 Business Risks  
- **Vendor Dependency**: Maintain good relationships, have backup vendors
- **Seasonal Variations**: Mix of indoor/outdoor, seasonal activities
- **Competition**: Focus on quality curation as differentiator

### 11.3 Operational Risks
- **Customer Support**: Plan for booking issues, refund processes
- **Content Quality**: Regular vendor check-ins, photo updates
- **Legal Compliance**: Clear terms of service, privacy policy

## 12. Future Evolution Path

### 12.1 Post-MVP Enhancements (Months 4-6)
- Vendor self-registration and dashboard
- Mobile app development
- Advanced search and filtering
- User reviews and rating system
- Group booking functionality

### 12.2 Scaling Considerations (Months 7-12)
- Microservices architecture migration
- Geographic expansion
- API for third-party integrations
- Advanced analytics and BI
- Multi-language support

### 12.3 Long-term Vision (Year 2+)
- AI-powered recommendations
- Social features and community building
- Corporate partnerships
- Franchise/white-label opportunities
- International markets

## Conclusion

This updated LUDUS blueprint prioritizes rapid MVP development through a curated vendor approach, focusing on user experience and proven demand before building complex vendor tools. The simplified architecture allows for quick development while maintaining a clear path to future scalability.

The key to success is launching quickly with high-quality, curated content that provides immediate value to users, then expanding features based on real user feedback and demonstrated demand.

---

**Next Steps**: 
1. Set up development environment
2. Begin Phase 1 development (8-week sprint)
3. Start vendor outreach and curation
4. Plan content creation and photography
5. Prepare for user testing and feedback collection