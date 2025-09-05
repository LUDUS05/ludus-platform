# LUDUS Platform Implementation Prompt (Updated - Curated MVP Approach with Moyasar)

## Context and Objective

You are tasked with implementing the LUDUS social activity discovery platform using a **curated MVP approach**. This means you will build a platform where administrators manually onboard high-quality vendors rather than building complex vendor self-registration systems from day one.

**Key Strategy Changes**: 
- Focus on perfecting the user experience first, with admin-curated, vetted vendors providing immediate value to users
- **Use Moyasar as the payment gateway** - optimized for the Saudi Arabian market with local payment methods
- Vendor self-service capabilities will be added in Phase 2 once demand is proven

## Implementation Philosophy

### Smart MVP Principles

1. **User-First Development**: Prioritize features that directly impact user experience
2. **Quality Over Quantity**: Start with 15-20 carefully curated vendors rather than building for scale
3. **Rapid Validation**: Launch in 8 weeks to test core assumptions
4. **Evolution Path**: Build with clear upgrade paths to more complex features
5. **Modular Monolith**: Single application with well-organized modules for future microservices split
6. **Localized Payments**: Implement Moyasar for optimal Saudi market payment experience

## Technical Architecture

### MVP Architecture (Simplified Stack)

**Frontend:**
- React.js (single web application)
- Tailwind CSS for styling
- React Router for navigation
- **Moyasar JavaScript SDK** for payments

**Backend:**
- Node.js + Express.js (single application)
- MongoDB with Mongoose ODM
- JWT for authentication
- Multer + Cloudinary for image uploads
- **Moyasar Node.js SDK** for payment processing

**Infrastructure:**
- Railway or Vercel for deployment (simpler than Google Cloud initially)
- MongoDB Atlas for database
- **Moyasar for payment processing** (Saudi-optimized)
- Cloudinary for image storage and management

**Development Tools:**
- Nodemon for development
- Jest for testing
- ESLint for code quality
- Postman for API testing

### File Structure to Implement

```
ludus-platform/
├── client/                          # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Header, Footer, Loading, etc.
│   │   │   ├── auth/                # Login, Register, PasswordReset
│   │   │   ├── activities/          # ActivityCard, ActivityList, ActivityDetails
│   │   │   ├── booking/             # BookingForm, BookingConfirmation
│   │   │   ├── payments/            # Moyasar payment components
│   │   │   │   ├── MoyasarForm.jsx  # Payment form wrapper
│   │   │   │   ├── PaymentMethods.jsx # Available payment methods
│   │   │   │   └── SavedCards.jsx   # Saved payment methods
│   │   │   ├── user/                # UserDashboard, UserProfile, UserBookings
│   │   │   ├── vendor/              # VendorProfile (read-only for MVP)
│   │   │   └── admin/               # AdminDashboard, VendorManagement, ActivityManagement
│   │   ├── pages/                   # Page-level components
│   │   │   ├── Home.jsx
│   │   │   ├── Activities.jsx
│   │   │   ├── ActivityDetail.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── PaymentSuccess.jsx   # Moyasar callback page
│   │   │   ├── PaymentFailed.jsx    # Payment failure handling
│   │   │   ├── UserDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useApi.js
│   │   │   ├── useMoyasar.js        # Moyasar integration hook
│   │   │   └── useLocalStorage.js
│   │   ├── services/                # API service functions
│   │   │   ├── api.js               # Axios configuration
│   │   │   ├── authService.js
│   │   │   ├── activityService.js
│   │   │   ├── bookingService.js
│   │   │   ├── vendorService.js
│   │   │   └── moyasarService.js    # Moyasar client-side integration
│   │   ├── utils/                   # Helper functions
│   │   │   ├── formatters.js        # Price, date formatting (SAR support)
│   │   │   ├── validators.js        # Form validation
│   │   │   ├── moyasarHelpers.js    # Moyasar utility functions
│   │   │   └── constants.js         # App constants
│   │   ├── context/                 # React context
│   │   │   ├── AuthContext.js
│   │   │   ├── AppContext.js
│   │   │   └── PaymentContext.js    # Payment state management
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── server/                          # Express backend
│   ├── src/
│   │   ├── controllers/             # Route handlers
│   │   │   ├── authController.js    # Register, login, password reset
│   │   │   ├── userController.js    # User profile, preferences
│   │   │   ├── activityController.js # Browse, search, details
│   │   │   ├── vendorController.js  # Vendor profiles (read-only)
│   │   │   ├── bookingController.js # Create, manage bookings
│   │   │   ├── paymentController.js # Moyasar payment handling
│   │   │   └── adminController.js   # Admin CRUD operations
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── User.js              # Customer accounts with payment tokens
│   │   │   ├── Vendor.js            # Admin-created vendor profiles
│   │   │   ├── Activity.js          # Activities with SAR pricing
│   │   │   ├── Booking.js           # Booking with Moyasar payment tracking
│   │   │   └── Payment.js           # Payment transaction records
│   │   ├── routes/                  # Express routes
│   │   │   ├── auth.js              # /api/auth/*
│   │   │   ├── users.js             # /api/users/*
│   │   │   ├── activities.js        # /api/activities/*
│   │   │   ├── vendors.js           # /api/vendors/*
│   │   │   ├── bookings.js          # /api/bookings/*
│   │   │   ├── payments.js          # /api/payments/* (Moyasar)
│   │   │   └── admin.js             # /api/admin/*
│   │   ├── middleware/              # Custom middleware
│   │   │   ├── auth.js              # JWT token verification
│   │   │   ├── admin.js             # Admin role verification
│   │   │   ├── validation.js        # Request validation middleware
│   │   │   ├── upload.js            # File upload handling
│   │   │   ├── moyasarWebhook.js    # Moyasar webhook verification
│   │   │   └── errorHandler.js      # Global error handling
│   │   ├── services/                # Business logic services
│   │   │   ├── emailService.js      # Booking confirmations, notifications
│   │   │   ├── moyasarService.js    # Moyasar integration service
│   │   │   ├── uploadService.js     # Cloudinary integration
│   │   │   └── geocodingService.js  # Address to coordinates
│   │   ├── utils/                   # Helper functions
│   │   │   ├── generateTokens.js    # JWT token generation
│   │   │   ├── validators.js        # Data validation helpers
│   │   │   ├── moyasarHelpers.js    # Moyasar utility functions
│   │   │   └── responseHelpers.js   # Standardized API responses
│   │   ├── config/                  # Configuration files
│   │   │   ├── database.js          # MongoDB connection
│   │   │   ├── cloudinary.js        # Cloudinary setup
│   │   │   ├── moyasar.js           # Moyasar configuration
│   │   │   └── email.js             # Email service config
│   │   ├── seeds/                   # Database seeding
│   │   │   ├── seedVendors.js       # Create sample vendors
│   │   │   ├── seedActivities.js    # Create sample activities
│   │   │   └── seedAdmin.js         # Create admin user
│   │   └── app.js                   # Express app setup and configuration
│   ├── tests/                       # Test files
│   │   ├── auth.test.js
│   │   ├── activities.test.js
│   │   ├── bookings.test.js
│   │   └── payments.test.js         # Moyasar payment tests
│   └── package.json
├── shared/                          # Shared utilities (optional)
│   ├── constants.js                 # Shared constants
│   └── validation.js                # Shared validation rules
├── docs/                           # Documentation
│   ├── API.md                      # API documentation
│   ├── SETUP.md                    # Setup instructions
│   ├── MOYASAR.md                  # Moyasar integration guide
│   └── DEPLOYMENT.md               # Deployment guide
├── .env.example                    # Environment variables template
├── .gitignore
├── README.md
└── package.json                    # Root package.json for scripts
```

## Implementation Phases and Timeline

### Phase 1: MVP Core (8 Weeks)

#### Week 1-2: Foundation & Authentication
**Backend Setup:**
- Initialize Express.js application with proper folder structure
- Set up MongoDB connection with Mongoose
- Implement User model with authentication
- Create JWT-based auth system (register, login, refresh tokens)
- Set up basic middleware (auth, validation, error handling)
- Create admin user seeding script
- **Initialize Moyasar service configuration**

**Frontend Setup:**
- Initialize React application with Tailwind CSS
- Set up routing with React Router
- Create authentication context and hooks
- Build login/register components
- Implement protected route system
- Set up API service layer with Axios
- **Install and configure Moyasar JavaScript SDK**

**Key Deliverables:**
- Working authentication system
- User registration and login
- Admin panel access
- Basic responsive UI framework
- **Moyasar test environment setup**

#### Week 3-4: Core Activity Features
**Backend Development:**
- Implement Vendor and Activity models with SAR pricing
- Create admin controllers for vendor/activity management
- Build activity browsing and search APIs
- Set up Cloudinary for image uploads
- Implement basic filtering and pagination

**Frontend Development:**
- Create activity browsing page with filtering
- Build activity card components
- Implement activity detail pages
- Create vendor profile pages (read-only)
- Add search functionality with real-time results

**Admin Panel:**
- Vendor creation and management interface
- Activity creation with image upload and SAR pricing
- Basic dashboard with stats
- Content management tools

**Key Deliverables:**
- Complete activity discovery system
- Admin panel for content management
- Image upload and storage
- Search and filtering functionality
- **SAR currency formatting and display**

#### Week 5-6: Booking System & Moyasar Payment Integration
**Backend Development:**
- Implement Booking model with Moyasar payment tracking
- Create **Moyasar payment integration service**
- Build booking creation and management APIs
- Set up **Moyasar webhook handling** for payment notifications
- Implement booking cancellation with **Moyasar refunds**
- Set up email notification system

**Frontend Development:**
- Create booking flow with date/time selection
- **Integrate Moyasar payment form** with Saudi payment methods
- Build booking confirmation pages
- Implement user dashboard for booking management
- Add booking cancellation functionality
- **Handle Moyasar payment callbacks and status updates**

**Moyasar Integration Specifics:**
- Credit/debit card processing
- MADA (Saudi debit cards) support
- Apple Pay integration
- STC Pay support
- Payment tokenization for saved cards
- Real-time payment status updates

**Key Deliverables:**
- Complete booking and payment system
- **Moyasar payment processing** with local methods
- Email confirmations and notifications
- User booking management dashboard
- Refund and cancellation handling
- **Payment webhook processing**

#### Week 7-8: Polish, Testing & Deployment
**Quality Assurance:**
- Comprehensive testing of all user flows
- **Moyasar payment testing** with all supported methods
- Mobile responsiveness optimization
- Performance optimization and caching
- Security audit and improvements
- Error handling and user feedback

**Content Preparation:**
- Create 15-20 vendor profiles with Moyasar setup
- Add 30+ activities across categories with SAR pricing
- Professional photography and descriptions
- Test all booking and payment flows
- Set up monitoring and analytics

**Deployment:**
- Set up production environment (Railway/Vercel)
- Configure environment variables including **Moyasar production keys**
- Set up CI/CD pipeline
- Domain setup and SSL configuration
- **Moyasar webhook endpoint configuration**
- Performance monitoring setup

**Key Deliverables:**
- Production-ready application
- Quality content and vendor profiles
- **Moyasar production integration**
- Monitoring and analytics
- Documentation and user guides

### Phase 2: Growth Features (4 Weeks)

#### Week 9-10: Enhanced User Experience
- User reviews and rating system
- Advanced search with multiple filters
- Activity recommendations based on preferences
- Social sharing functionality
- Enhanced user profiles with preferences
- **Advanced Moyasar features** (tokenization, recurring payments)

#### Week 11-12: Vendor Self-Service Introduction
- Vendor registration and application flow
- Basic vendor dashboard for profile management
- Self-service activity creation (with admin approval)
- Vendor verification and approval process
- **Vendor Moyasar account setup assistance**
- Vendor analytics and booking management
- Migration tools for existing admin-managed vendors

## Core Implementation Requirements

### Database Schema Implementation

**Priority Order:**
1. **User Model** - Complete with authentication, preferences, and **Moyasar payment tokens**
2. **Vendor Model** - Admin-created profiles with **Moyasar account information**
3. **Activity Model** - Comprehensive activity data with **SAR pricing** and location
4. **Booking Model** - Complete booking lifecycle with **Moyasar payment tracking**
5. **Payment Model** - Detailed **Moyasar transaction records**

### API Endpoints Implementation

**Critical APIs (Week 1-4):**
```
Authentication:
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh

Activities:
GET /api/activities (with filtering)
GET /api/activities/:id
GET /api/activities/search
GET /api/activities/featured

Vendors:
GET /api/vendors/:id
GET /api/vendors/:id/activities
```

**Booking & Payment APIs (Week 5-6):**
```
Bookings:
GET /api/bookings (user's bookings)
POST /api/bookings (create with payment)
PUT /api/bookings/:id/cancel
GET /api/bookings/:id

Payments (Moyasar):
POST /api/payments/create-payment
POST /api/payments/confirm-payment
GET /api/payments/:paymentId/status
POST /api/payments/webhook
POST /api/payments/refund
GET /api/payments/methods (user's saved cards)
POST /api/payments/save-method

Admin:
GET /api/admin/dashboard/stats
POST /api/admin/vendors
POST /api/admin/activities
GET /api/admin/payments/analytics
```

### Frontend Component Development

**Critical Components (Week 1-4):**
- `ActivityCard` - Reusable activity display with SAR pricing
- `ActivityList` - Grid/list view with filtering
- `ActivityDetail` - Complete activity information
- `VendorProfile` - Business information display
- `SearchBar` - Real-time search with autocomplete

**Booking & Payment Components (Week 5-6):**
- `BookingForm` - Complete booking flow
- `MoyasarPaymentForm` - **Moyasar payment integration component**
- `PaymentMethods` - **Display and select payment methods (cards, MADA, Apple Pay)**
- `BookingConfirmation` - Success page with payment confirmation
- `UserDashboard` - Booking management
- `BookingCard` - Individual booking display with payment status

### Admin Panel Requirements

**Essential Admin Features:**
1. **Vendor Management:**
   - Create/edit vendor profiles
   - Upload business images and logos
   - Manage contact information and social media
   - **Configure vendor Moyasar accounts**
   - Activate/deactivate vendors

2. **Activity Management:**
   - Create activities for any vendor
   - Upload activity images and videos
   - Set **pricing in SAR** with proper formatting
   - Manage availability and scheduling
   - Feature/unfeature activities

3. **Booking & Payment Oversight:**
   - View all platform bookings
   - Update booking statuses
   - **Monitor Moyasar payment status**
   - Handle refunds and cancellations through **Moyasar API**
   - Export booking and payment data
   - Customer support tools

4. **Payment Management:**
   - **Moyasar transaction monitoring**
   - Payment method analytics
   - Failed payment investigation
   - Refund processing dashboard
   - Revenue analytics and reporting

## Payment Integration Strategy (Moyasar)

### Moyasar Implementation Details

**Required Environment Variables:**
```bash
# Moyasar Configuration
MOYASAR_PUBLISHABLE_KEY=pk_test_your_publishable_key
MOYASAR_SECRET_KEY=sk_test_your_secret_key
MOYASAR_WEBHOOK_SECRET=your_webhook_secret
MOYASAR_BASE_URL=https://api.moyasar.com/v1
```

**Backend Moyasar Service Implementation:**
```javascript
// services/moyasarService.js
const Moyasar = require('moyasar');

const moyasar = new Moyasar({
  apiKey: process.env.MOYASAR_SECRET_KEY,
  baseURL: process.env.MOYASAR_BASE_URL
});

class MoyasarService {
  async createPayment(paymentData) {
    try {
      const payment = await moyasar.payments.create({
        amount: paymentData.amount * 100, // Convert SAR to halalas
        currency: 'SAR',
        description: paymentData.description,
        callback_url: paymentData.callbackUrl,
        source: paymentData.source,
        metadata: paymentData.metadata
      });
      return payment;
    } catch (error) {
      throw new Error(`Moyasar payment creation failed: ${error.message}`);
    }
  }

  async retrievePayment(paymentId) {
    return await moyasar.payments.retrieve(paymentId);
  }

  async refundPayment(paymentId, amount) {
    return await moyasar.payments.refund(paymentId, {
      amount: amount * 100 // Convert SAR to halalas
    });
  }

  async createInvoice(invoiceData) {
    return await moyasar.invoices.create(invoiceData);
  }

  verifyWebhookSignature(payload, signature) {
    // Implement webhook signature verification
    const crypto = require('crypto');
    const computedSignature = crypto
      .createHmac('sha256', process.env.MOYASAR_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');
    
    return signature === computedSignature;
  }
}

module.exports = new MoyasarService();
```

**Frontend Moyasar Integration:**
```javascript
// services/moyasarService.js (Frontend)
class MoyasarClientService {
  constructor() {
    this.moyasar = window.Moyasar;
  }

  async createPaymentForm(options) {
    return this.moyasar.init({
      element: options.element,
      amount: options.amount * 100, // Convert to halalas
      currency: 'SAR',
      description: options.description,
      publishable_api_key: process.env.REACT_APP_MOYASAR_PUBLISHABLE_KEY,
      callback_url: options.callbackUrl,
      methods: ['creditcard', 'applepay', 'stcpay'], // Available payment methods
      on_completed: options.onCompleted,
      on_failed: options.onFailed
    });
  }

  async tokenizeCard(cardData) {
    return await this.moyasar.tokenize(cardData);
  }
}

export default new MoyasarClientService();
```

### Supported Payment Methods Implementation

**1. Credit/Debit Cards:**
```javascript
// Standard card processing
const cardPayment = {
  source: {
    type: 'creditcard',
    name: cardholderName,
    number: cardNumber,
    cvc: cvc,
    month: expiryMonth,
    year: expiryYear
  }
};
```

**2. MADA (Saudi Debit Cards):**
```javascript
// MADA card processing (automatically detected)
const madaPayment = {
  source: {
    type: 'creditcard', // Same as credit card, MADA auto-detected
    name: cardholderName,
    number: madaCardNumber, // MADA card numbers
    cvc: cvc,
    month: expiryMonth,
    year: expiryYear
  }
};
```

**3. Apple Pay:**
```javascript
// Apple Pay integration
const applePayment = {
  source: {
    type: 'applepay',
    token: applePayToken // Obtained from Apple Pay SDK
  }
};
```

**4. STC Pay:**
```javascript
// STC Pay integration
const stcPayment = {
  source: {
    type: 'stcpay',
    mobile: mobileNumber // STC Pay mobile number
  }
};
```

**5. Saved Payment Methods (Tokenization):**
```javascript
// Using saved payment token
const tokenPayment = {
  source: {
    type: 'token',
    token: savedCardToken // Previously saved Moyasar token
  }
};
```

### Webhook Implementation

**Webhook Endpoint:**
```javascript
// routes/payments.js
router.post('/webhook', moyasarWebhookMiddleware, async (req, res) => {
  try {
    const event = req.body;
    
    switch (event.type) {
      case 'payment_paid':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'payment_refunded':
        await handlePaymentRefunded(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook handler failed' });
  }
});

async function handlePaymentSuccess(payment) {
  const booking = await Booking.findOne({ 
    'payment.moyasarPaymentId': payment.id 
  });
  
  if (booking) {
    booking.payment.status = 'paid';
    booking.status = 'confirmed';
    await booking.save();
    
    // Send confirmation email
    await emailService.sendBookingConfirmation(booking);
  }
}
```

## Content Strategy and Vendor Curation

### Target Vendor Categories (15-20 vendors)

**Fitness & Wellness (4-5 vendors):**
- Yoga studios with various class types
- Personal trainers offering group sessions
- Martial arts schools with beginner classes
- Meditation centers and wellness workshops

**Arts & Culture (3-4 vendors):**
- Pottery studios with hands-on classes
- Art studios offering painting workshops
- Music schools with group lessons
- Traditional Saudi crafts workshops

**Food & Beverage (3-4 vendors):**
- Traditional Saudi cuisine cooking classes
- International cooking schools
- Coffee roasting and tasting experiences
- Traditional bread making workshops

**Outdoor Activities (3-4 vendors):**
- Desert tour guides and experiences
- Hiking and nature guide services
- Water sports instructors (Red Sea coast)
- Rock climbing gyms with introductory sessions

**Cultural Experiences (2-3 vendors):**
- Heritage site tours and experiences
- Traditional Saudi cultural workshops
- Language learning and conversation groups
- Historical walking tours of Riyadh

### Vendor Onboarding Process

**Step 1: Research and Outreach**
- Identify high-quality local businesses in Riyadh
- Research their reputation and offerings
- Prepare partnership proposal highlighting benefits
- Initial contact via email or phone

**Step 2: Moyasar Account Setup**
- Assist vendors in creating Moyasar accounts
- Help with business verification process
- Configure payment methods and settings
- Test payment processing

**Step 3: Information Gathering**
- Business information and credentials
- Activity details and **SAR pricing**
- Professional photos and videos
- Availability and scheduling preferences
- Insurance and licensing verification

**Step 4: Profile Creation**
- Create compelling vendor profiles
- Professional photography if needed
- Write engaging activity descriptions in Arabic/English
- Set up **SAR pricing** and availability
- Test **Moyasar payment flows**

**Step 5: Launch Preparation**
- Train vendors on booking process
- Establish communication protocols
- Set up **Moyasar payment notifications**
- Create promotional materials
- Plan launch marketing

### Quality Standards

**Vendor Requirements:**
- Established business with good local reputation
- Proper business licensing and insurance
- **Valid Moyasar account** with verified business information
- Professional or high-quality photos
- Clear, detailed activity descriptions
- Responsive communication
- Competitive and transparent **SAR pricing**

**Activity Standards:**
- Clear learning objectives or outcomes
- Appropriate for beginners (accessibility focus)
- All necessary equipment provided or clearly listed
- Safety protocols clearly defined
- Professional instruction and guidance
- Reasonable **SAR pricing** for local market

## Technical Implementation Details

### Environment Setup

**Required Environment Variables:**
```bash
# Database
MONGODB_URI=mongodb+srv://...
DATABASE_NAME=ludus_mvp

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Moyasar Payment Gateway
MOYASAR_PUBLISHABLE_KEY=pk_test_your_publishable_key
MOYASAR_SECRET_KEY=sk_test_your_secret_key
MOYASAR_WEBHOOK_SECRET=your_webhook_secret
MOYASAR_BASE_URL=https://api.moyasar.com/v1

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@ludusapp.com
FROM_NAME=LUDUS Platform

# Application
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
```

### Database Indexes and Performance

**Critical Indexes:**
```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ "location.coordinates": "2dsphere" });

// Activities
db.activities.createIndex({ "location.coordinates": "2dsphere" });
db.activities.createIndex({ category: 1, isActive: 1 });
db.activities.createIndex({ featured: 1, isActive: 1 });
db.activities.createIndex({ 
  title: "text", 
  description: "text", 
  tags: "text" 
});

// Bookings
db.bookings.createIndex({ user: 1, bookingDate: -1 });
db.bookings.createIndex({ activity: 1, bookingDate: 1 });
db.bookings.createIndex({ status: 1, createdAt: -1 });
db.bookings.createIndex({ "payment.moyasarPaymentId": 1 });

// Payments
db.payments.createIndex({ moyasarPaymentId: 1 }, { unique: true });
db.payments.createIndex({ status: 1, createdAt: -1 });
db.payments.createIndex({ user: 1, createdAt: -1 });
```

### Security Implementation

**Authentication Security:**
- JWT tokens with short expiration (7 days)
- Refresh token rotation
- Password hashing with bcrypt (12 rounds)
- Rate limiting on auth endpoints
- Email verification for new accounts

**API Security:**
- Input validation on all endpoints
- SQL/NoSQL injection prevention
- XSS protection with helmet.js
- CORS configuration for specific origins
- API rate limiting per user/IP

**Payment Security:**
- **Server-side Moyasar processing only**
- **Moyasar webhook signature verification**
- PCI compliance through Moyasar
- No sensitive payment data storage
- Secure refund processing
- **Payment tokenization** for saved cards

### Testing Strategy

**Unit Tests:**
- Model validation tests
- Service function tests (including **Moyasar service**)
- Utility function tests
- Authentication middleware tests

**Integration Tests:**
- API endpoint tests
- Database integration tests
- **Moyasar payment processing tests**
- Email service tests

**End-to-End Tests:**
- Complete user registration flow
- Activity browsing and booking flow
- **Moyasar payment processing flow** (test mode)
- Admin content management flow

**Payment Testing:**
- **Moyasar test cards** for different scenarios
- Payment method testing (cards, MADA, Apple Pay)
- Webhook delivery testing
- Refund processing testing

## Success Metrics and KPIs

### Week 4 Checkpoint (Core Features)
- User registration and authentication working
- 10+ vendor profiles created
- 20+ activities with complete information and **SAR pricing**
- Activity browsing and search functional
- Admin panel operational

### Week 6 Checkpoint (Booking & Payment System)
- Booking flow completely functional
- **Moyasar payment integration** working with multiple methods
- **Payment webhooks** processing correctly
- Email confirmations being sent
- User dashboard showing bookings and payment status
- Cancellation and refund process working through **Moyasar**

### Week 8 Launch Metrics
- 15+ active vendor profiles with **Moyasar accounts**
- 30+ bookable activities with **SAR pricing**
- All user flows tested and functional
- **Multiple payment methods** (cards, MADA, Apple Pay) working
- Mobile responsive design complete
- Production deployment successful with **Moyasar production environment**

### Post-Launch Success Metrics (First 3 Months)
- 100+ user registrations
- 50+ completed bookings with successful **Moyasar payments**
- Average user session > 3 minutes
- Booking conversion rate > 5%
- **Payment success rate > 95%** (Moyasar transactions)
- User retention rate > 30%
- 4.5+ average user satisfaction rating
- **Payment method distribution** showing local method adoption

## Risk Mitigation and Troubleshooting

### Technical Risks

**Database Performance:**
- Monitor query performance with MongoDB Compass
- Implement proper indexing strategy
- Set up database connection pooling
- Plan for read replicas if needed

**Payment Issues:**
- Thorough **Moyasar testing** in sandbox mode
- Implement comprehensive error handling
- Set up **webhook monitoring** and alerting
- Create manual refund procedures
- **Payment method fallback** strategies

**API Integration:**
- **Moyasar API monitoring** and status checks
- Rate limiting and retry logic
- Error response handling
- **Webhook delivery reliability**

### Business Risks

**Vendor Relationship Management:**
- Maintain regular communication
- Provide excellent support and training
- **Assist with Moyasar account issues**
- Create vendor feedback system
- Have backup vendors for popular categories

**Payment Compliance:**
- Ensure compliance through **Moyasar's Saudi Central Bank supervision**
- Regular security audits
- **PCI compliance** maintenance
- Handle payment disputes properly

### Deployment and Operations

**Monitoring Setup:**
- Application performance monitoring
- Error tracking and alerting
- Database performance monitoring
- **Moyasar payment processing monitoring**
- User behavior analytics

**Backup and Recovery:**
- Daily database backups
- Image storage backup strategy
- Configuration backup procedures
- **Payment data backup and recovery**
- Disaster recovery testing

## Future Evolution Planning

### Phase 3: Mobile and Advanced Features (Month 4-5)
- React Native mobile application
- **Moyasar mobile SDKs integration**
- Push notifications for bookings and payments
- Advanced recommendation engine
- Group booking functionality
- Loyalty program basics

### Phase 4: Scaling and Optimization (Month 6)
- Microservices architecture planning
- Performance optimization
- Advanced analytics dashboard
- SEO optimization
- **Advanced Moyasar features** (subscriptions, installments)

### Long-term Vision (6+ months)
- AI-powered activity recommendations
- Social features and community building
- Corporate team building packages
- Franchise/white-label opportunities
- Multi-city expansion within Saudi Arabia
- **Cross-border payments** and regional expansion

## Getting Started Instructions

### Immediate Next Steps

1. **Set up development environment**
2. **Create Moyasar account and obtain test API keys**
3. **Initialize Git repository and project structure**
4. **Set up MongoDB Atlas database**
5. **Set up Cloudinary account**
6. **Begin Week 1 development tasks**

### Success Checklist

**Before Starting Development:**
- [ ] All accounts created (MongoDB Atlas, **Moyasar**, Cloudinary)
- [ ] Development environment set up
- [ ] Project structure created
- [ ] Environment variables configured
- [ ] **Moyasar test environment configured**
- [ ] Initial vendor outreach list prepared

**Week 4 Milestone:**
- [ ] User authentication working
- [ ] Activity browsing functional
- [ ] Admin panel operational
- [ ] 10+ vendors and 20+ activities with **SAR pricing** added
- [ ] Mobile responsive design

**Week 8 Launch:**
- [ ] Complete booking flow working
- [ ] **Moyasar payment processing** functional with multiple methods
- [ ] **Payment webhooks** processing correctly
- [ ] Email notifications working
- [ ] Production deployment successful
- [ ] 15+ vendors with **Moyasar accounts** and 30+ activities ready

This implementation approach prioritizes rapid development, user experience, and **localized payment processing via Moyasar** over complex technical architecture. The goal is to prove the concept quickly while building a foundation that can evolve into the full-featured platform described in your blueprint.

**Key Success Factors:**
- **Moyasar integration** provides native Saudi payment experience
- Quality curation over quantity
- Rapid iteration based on user feedback
- Strong focus on mobile experience
- Local market optimization (SAR pricing, Arabic support, cultural sensitivity)

Remember: **Perfect is the enemy of good.** Launch with a simple, high-quality MVP that delivers real value to users with seamless **local payment processing**, then iterate based on real feedback and usage data.