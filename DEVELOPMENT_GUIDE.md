# LUDUS Platform - MVP Implementation

A social activity discovery platform connecting users with local experiences and vendors.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Moyasar account (for Saudi payments)
- Google Workspace account (for email notifications)
- Cloudinary account (for image storage)

### Installation

1. **Clone and install dependencies:**
```bash
cd lds-app
npm install
cd client && npm install
cd ../server && npm install
```

2. **Environment Setup:**
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

3. **Quick Setup (with sample data):**
```bash
cd server
npm run setup  # Seeds database with sample vendors and activities
```

4. **Manual Environment Variables (if needed):**
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ludus_mvp
JWT_SECRET=your-super-secret-jwt-key

# Moyasar Payment Gateway (Saudi Arabia)
MOYASAR_PUBLISHABLE_KEY=pk_test_your_moyasar_key
MOYASAR_SECRET_KEY=sk_test_your_moyasar_secret
MOYASAR_WEBHOOK_SECRET=your_webhook_secret

# Email (Google Workspace SMTP Relay)
SMTP_HOST=smtp-relay.gmail.com
SMTP_PORT=587
SMTP_USER=your-workspace-email@yourdomain.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=LUDUS Platform

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

5. **Start Development Servers:**
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm start
```

6. **Test API (optional):**
```bash
cd server && npm run test-api
```

## 📁 Project Structure

```
lds-app/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── context/          # React context
│   │   └── utils/            # Utility functions
│   └── package.json
├── server/                   # Express backend
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── services/        # Business logic
│   │   └── config/          # Configuration
│   └── package.json
└── Guide/                   # Documentation
```

## 🛠 Development Status

### ✅ Completed MVP Features
- [x] **Complete authentication system** (JWT-based with refresh tokens)
- [x] **Full admin panel** (vendor/activity management, dashboard, statistics)
- [x] **Activity browsing and search** (filtering, pagination, SAR pricing)
- [x] **User dashboard** (profile management, booking history, preferences)
- [x] **Vendor profile pages** (business info, activities, reviews, contact)
- [x] **Complete booking system** (end-to-end with Moyasar payment integration)
- [x] **Professional UI design system** (LUDUS branding, RTL support, accessibility)
- [x] **Email notification system** (Google Workspace SMTP, welcome/reset/booking emails)
- [x] **Payment processing** (Moyasar integration with MADA, STC Pay, Apple Pay)
- [x] **Mobile-responsive design** (optimized for all device sizes)

### 📋 Future Enhancements
- [ ] Image upload functionality (Cloudinary integration planned)
- [ ] Enhanced tracking system
- [ ] Performance optimizations
- [ ] Advanced analytics dashboard

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Activities
- `GET /api/activities` - List activities with filters
- `GET /api/activities/:id` - Get activity details
- `GET /api/activities/search` - Search activities

### Email Notifications ✅
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/register` - Triggers welcome email
- Payment confirmations - Automatic booking confirmation emails

### Admin (Admin only)
- `POST /api/admin/vendors` - Create vendor
- `POST /api/admin/activities` - Create activity
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/bookings` - List all bookings with filters

### Payments ✅ (Moyasar Integration)
- `POST /api/payments/create` - Create payment with Saudi payment methods
- `POST /api/payments/confirm` - Confirm payment status
- `POST /api/payments/webhook` - Handle Moyasar webhooks

## 🎯 MVP Features

### Core User Flow
1. **Discovery** - Browse and search activities by category, location, price
2. **Booking** - Select date/time, enter details, process payment
3. **Management** - View bookings, cancel if needed, leave reviews

### Admin Features
1. **Vendor Management** - Create/edit vendor profiles
2. **Activity Management** - Add/edit activities with images and details
3. **Booking Oversight** - Monitor all bookings and handle issues

## 🔐 Authentication & Security
- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration

## 💾 Database Schema

### User Model
- Personal information and preferences
- Location data for nearby activities
- Authentication and session management

### Vendor Model
- Business information and credentials
- Location and contact details
- Images and social media links

### Activity Model
- Detailed activity information
- Pricing and capacity management
- Scheduling and availability
- Reviews and ratings

### Booking Model
- Complete booking lifecycle
- Payment tracking with Moyasar (Saudi payments)
- Participant details and special requirements
- Email confirmations and notifications

## 🚀 Deployment

The application is ready for deployment using:
- **Frontend**: Vercel or Netlify
- **Backend**: Railway or Render
- **Database**: MongoDB Atlas
- **Email**: Google Workspace SMTP (hi@letsludus.com)
- **Images**: Cloudinary (ready for integration)
- **Payments**: Moyasar (Saudi Arabian payment gateway)

## 📊 Success Metrics

**✅ MVP Goals Achieved:**
- ✅ Working authentication system with email notifications
- ✅ Admin panel fully operational with comprehensive management
- ✅ Complete booking flow with Saudi payment processing
- ✅ Mobile responsive design with LUDUS branding
- ✅ Email notification system (welcome, reset, booking confirmations)
- ✅ Professional UI design system with accessibility compliance
- ✅ Sample data: 15+ vendor profiles and 30+ activities ready

**🚀 Production Ready:**
The LUDUS platform MVP is complete and ready for launch with all core features implemented and tested.

## 🤝 Contributing

This is an MVP implementation following the curated approach outlined in the implementation guide. Focus areas:

1. **Quality over quantity** - Perfect core features before adding complexity
2. **User experience first** - Ensure smooth, intuitive interactions
3. **Admin efficiency** - Make vendor/activity management effortless
4. **Mobile responsive** - Works perfectly on all devices

## 📞 Support

For development questions or issues:
1. Check the implementation guide in `/Guide/`
2. Review the development tracker
3. Test with the provided API endpoints

---

**Built with:** React, Node.js, Express, MongoDB, Tailwind CSS, Moyasar (Saudi Payments), Google Workspace SMTP, Cloudinary