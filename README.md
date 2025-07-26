# LUDUS Platform - MVP Implementation

A social activity discovery platform connecting users with local experiences and vendors.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Moyasar account (for Saudi payments)
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

### ✅ Completed (Week 1)
- [x] Project structure and environment setup
- [x] Express.js backend with MongoDB integration
- [x] User authentication system (JWT-based)
- [x] Core data models (User, Vendor, Activity, Booking)
- [x] React frontend with Tailwind CSS
- [x] Authentication context and services
- [x] Basic routing and header component

### 🚧 In Progress (Week 2)
- [ ] Admin panel for vendor/activity management
- [ ] Activity browsing and search functionality
- [ ] Vendor profile pages
- [ ] User dashboard

### 📋 Upcoming (Week 3-4)
- [ ] Booking system with payment integration
- [ ] Email notifications
- [ ] Image upload functionality
- [ ] Activity filtering and search

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

### Admin (Admin only)
- `POST /api/admin/vendors` - Create vendor
- `POST /api/admin/activities` - Create activity
- `GET /api/admin/dashboard/stats` - Dashboard statistics

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
- Payment tracking with Stripe
- Participant details and special requirements

## 🚀 Deployment

The application will be deployed using:
- **Frontend**: Vercel or Netlify
- **Backend**: Railway or Render
- **Database**: MongoDB Atlas
- **Images**: Cloudinary
- **Payments**: Stripe

## 📊 Success Metrics

**Week 4 Goals:**
- Working authentication system
- 10+ vendor profiles created
- 20+ activities with full details
- Admin panel operational

**Week 8 Launch:**
- 15+ active vendors
- 30+ bookable activities
- Complete booking flow
- Mobile responsive design

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

**Built with:** React, Node.js, Express, MongoDB, Tailwind CSS, Stripe, Cloudinary