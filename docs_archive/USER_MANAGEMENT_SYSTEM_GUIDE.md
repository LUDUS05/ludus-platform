# LUDUS User Management System Guide

## 📋 Overview

The LUDUS User Management System provides comprehensive user profile management, preferences, statistics, and activity tracking capabilities. This system is designed with cultural sensitivity for the Saudi Arabian market and includes full RTL (Right-to-Left) support for Arabic users.

## 🏗️ System Architecture

### Backend Components

#### 1. User Models
- **`User.js`** - Legacy user model (basic authentication)
- **`UserEnhanced.js`** - Enhanced user model with comprehensive features

#### 2. Controllers
- **`userController.js`** - Main user management controller
- **`authController.js`** - Authentication and authorization

#### 3. Routes
- **`/api/users/*`** - User management endpoints
- **`/api/auth/*`** - Authentication endpoints

#### 4. Middleware
- **`auth.js`** - Authentication middleware
- **`validation.js`** - Input validation
- **`rbac.js`** - Role-based access control

### Frontend Components

#### 1. User Components
- **`EnhancedUserProfile.jsx`** - Comprehensive profile management
- **`UserPreferences.jsx`** - Preferences and settings
- **`UserDashboard.jsx`** - User dashboard with stats and activity

#### 2. Services
- **`userService.js`** - Frontend API service
- **`authService.js`** - Authentication service

## 🔧 Core Features

### 1. User Profile Management

#### Profile Information
```javascript
{
  // Basic Information
  firstName: String,
  lastName: String,
  firstNameAr: String,        // Arabic first name
  lastNameAr: String,         // Arabic last name
  phone: String,              // Saudi phone format (+966XXXXXXXXX)
  dateOfBirth: Date,
  gender: 'male' | 'female',
  avatar: String,             // Profile image URL
  bio: String,
  bioAr: String,              // Arabic bio
  isVerified: Boolean
}
```

#### Location Information
```javascript
{
  city: String,
  cityAr: String,             // Arabic city name
  region: String,
  regionAr: String,           // Arabic region name
  coordinates: {
    type: 'Point',
    coordinates: [Number, Number] // [longitude, latitude]
  },
  address: String,
  addressAr: String           // Arabic address
}
```

#### Social Links
```javascript
{
  instagram: String,
  twitter: String,
  linkedin: String,
  website: String,
  snapchat: String
}
```

### 2. User Preferences

#### Activity Preferences
```javascript
{
  interests: [String],        // Activity categories
  activityTypes: [String],    // Indoor/outdoor, etc.
  preferredTimes: [String],   // Time preferences
  priceRange: {
    min: Number,
    max: Number
  },
  radius: Number,             // Search radius in km
  participantGenderMix: 'mixed' | 'same-gender' | 'no-preference'
}
```

#### Social Preferences
```javascript
{
  socialInteraction: 'minimal' | 'moderate' | 'high',
  networking: Boolean,
  teamBuilding: Boolean,
  competitive: Boolean
}
```

#### Notification Preferences
```javascript
{
  email: Boolean,
  sms: Boolean,
  push: Boolean,
  marketing: Boolean,
  activityUpdates: Boolean,
  socialUpdates: Boolean,
  reminderNotifications: Boolean
}
```

#### Privacy Settings
```javascript
{
  profileVisibility: 'public' | 'friends' | 'private',
  showEmail: Boolean,
  showPhone: Boolean,
  showLocation: Boolean,
  showActivityHistory: Boolean
}
```

### 3. User Statistics

#### Booking Statistics
```javascript
{
  totalBookings: Number,
  completedBookings: Number,
  cancelledBookings: Number,
  totalSpent: Number,
  averageSpentPerBooking: Number,
  completionRate: Number
}
```

#### Activity Statistics
```javascript
{
  favoriteActivities: Number,
  totalActivities: Number,
  memberSince: Date,
  lastActive: Date,
  currentStreak: Number,
  longestStreak: Number
}
```

### 4. Activity History

#### Activity Record
```javascript
{
  id: String,
  title: String,
  vendor: String,
  category: String,
  bookingDate: Date,
  timeSlot: {
    startTime: String,
    endTime: String
  },
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  price: Number,
  participants: Number
}
```

## 🚀 API Endpoints

### User Profile Endpoints

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "profile": { /* profile data */ },
      "location": { /* location data */ },
      "socialLinks": { /* social links */ },
      "preferences": { /* preferences */ },
      "stats": { /* statistics */ }
    }
  }
}
```

#### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "profile": {
    "firstName": "Updated Name",
    "bio": "Updated bio"
  },
  "socialLinks": {
    "instagram": "@username"
  }
}
```

#### Update Profile Image
```http
PUT /api/users/profile-image
Authorization: Bearer <token>
Content-Type: application/json

{
  "imageUrl": "https://example.com/image.jpg"
}
```

### User Preferences Endpoints

#### Get User Preferences
```http
GET /api/users/preferences
Authorization: Bearer <token>
```

#### Update User Preferences
```http
PUT /api/users/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "language": "ar",
  "interests": ["travel", "sports"],
  "activityTypes": ["outdoor", "physical"],
  "priceRange": { "min": 100, "max": 500 },
  "notifications": {
    "email": true,
    "push": true
  }
}
```

### User Statistics Endpoints

#### Get User Statistics
```http
GET /api/users/stats
Authorization: Bearer <token>
```

#### Get Dashboard Data
```http
GET /api/users/dashboard
Authorization: Bearer <token>
```

### Activity History Endpoints

#### Get Activity History
```http
GET /api/users/activity-history
Authorization: Bearer <token>
Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- status: string (optional)
- startDate: string (optional)
- endDate: string (optional)
```

### Location Management Endpoints

#### Update User Location
```http
PUT /api/users/location
Authorization: Bearer <token>
Content-Type: application/json

{
  "city": "Riyadh",
  "cityAr": "الرياض",
  "region": "Riyadh Region",
  "coordinates": {
    "latitude": 24.7136,
    "longitude": 46.6753
  }
}
```

### User Search Endpoints

#### Advanced User Search
```http
GET /api/users/search-advanced
Authorization: Bearer <token>
Query Parameters:
- q: string (search query)
- city: string (filter by city)
- interests: string (filter by interests)
- gender: string (filter by gender)
- page: number (pagination)
- limit: number (pagination)
```

## 🎨 Frontend Components

### EnhancedUserProfile Component

#### Features
- Comprehensive profile editing with RTL support
- Image upload functionality
- Social links management
- Location management
- Statistics display
- Activity history

#### Usage
```jsx
import EnhancedUserProfile from './components/user/EnhancedUserProfile';

<EnhancedUserProfile 
  userId={userId}
  isOwnProfile={true}
/>
```

#### Props
- `userId`: String - User ID (optional, defaults to current user)
- `isOwnProfile`: Boolean - Whether this is the user's own profile

### UserPreferences Component

#### Features
- Tabbed interface for different preference categories
- Real-time preference updates
- Validation and error handling
- RTL support

#### Usage
```jsx
import UserPreferences from './components/user/UserPreferences';

<UserPreferences />
```

### UserDashboard Component

#### Features
- Quick stats overview
- Recent activity display
- Upcoming bookings
- Favorite activities
- Recommendations
- Quick actions

#### Usage
```jsx
import UserDashboard from './components/user/UserDashboard';

<UserDashboard />
```

## 🔧 User Service (Frontend)

### Core Methods

#### Profile Management
```javascript
// Get user profile
const profile = await userService.getUserProfile();

// Update user profile
const updatedProfile = await userService.updateUserProfile(profileData);

// Update profile image
const result = await userService.updateProfileImage(imageUrl);
```

#### Preferences Management
```javascript
// Get user preferences
const preferences = await userService.getUserPreferences();

// Update user preferences
const result = await userService.updateUserPreferences(preferencesData);
```

#### Statistics and Dashboard
```javascript
// Get user statistics
const stats = await userService.getUserStats();

// Get dashboard data
const dashboardData = await userService.getDashboardData();
```

#### Activity History
```javascript
// Get activity history
const history = await userService.getUserActivityHistory({
  page: 1,
  limit: 10,
  status: 'completed'
});
```

#### Location Management
```javascript
// Update user location
const result = await userService.updateUserLocation(locationData);
```

#### User Search
```javascript
// Search users
const searchResults = await userService.searchUsersAdvanced({
  q: 'search query',
  city: 'Riyadh',
  interests: ['travel']
});
```

### Utility Methods

#### User Display
```javascript
// Format user display name
const displayName = userService.formatUserDisplayName(user, language);

// Get user initials
const initials = userService.getUserInitials(user);

// Format user location
const location = userService.formatUserLocation(user);
```

#### Validation
```javascript
// Validate profile data
const validation = userService.validateProfileData(profileData);

// Get preference options
const options = userService.getPreferenceOptions();
```

## 🌍 RTL Support

### CSS Classes
```css
/* RTL-specific classes */
.rtl\:space-x-reverse > :not([hidden]) ~ :not([hidden]) {
  --tw-space-x-reverse: 1;
}

.rtl\:text-right {
  text-align: right;
}

.rtl\:flex-row-reverse {
  flex-direction: row-reverse;
}
```

### Component Usage
```jsx
<div className="flex space-x-4 rtl:space-x-reverse">
  <span>First</span>
  <span>Second</span>
</div>
```

### Translation Keys
```javascript
// Arabic translations
{
  "user": {
    "firstName": "الاسم الأول",
    "lastName": "الاسم الأخير",
    "bio": "نبذة شخصية",
    "location": "الموقع",
    "preferences": "التفضيلات"
  }
}
```

## 🧪 Testing

### Test Coverage
- Unit tests for all user management functions
- Integration tests for API endpoints
- Frontend component tests
- RTL layout tests
- Performance tests

### Running Tests
```bash
# Backend tests
npm test -- --grep "User Management"

# Frontend tests
npm test -- --grep "UserProfile"

# All tests
npm test
```

### Test Files
- `apps/api/src/tests/user.test.js` - Backend tests
- `apps/web/src/components/user/__tests__/` - Frontend tests

## 🔒 Security Considerations

### Data Validation
- All inputs are validated and sanitized
- Phone numbers must follow Saudi format (+966XXXXXXXXX)
- Email addresses are validated
- Coordinates are validated for proper ranges

### Privacy Controls
- Users can control profile visibility
- Sensitive information can be hidden
- Activity history can be private
- Location sharing is optional

### Authentication
- JWT-based authentication
- Role-based access control
- Secure password requirements
- Social login integration

## 📊 Performance Optimization

### Database Optimization
- Indexed fields for fast queries
- Geospatial indexing for location searches
- Pagination for large datasets
- Aggregation pipelines for statistics

### Frontend Optimization
- Lazy loading of components
- Memoization of expensive calculations
- Virtual scrolling for large lists
- Image optimization

### Caching
- Redis caching for frequently accessed data
- Browser caching for static assets
- CDN for images and media

## 🚀 Deployment

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/ludus

# JWT
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# File Upload
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

### Docker Configuration
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Render Deployment
```yaml
# render.yaml
services:
  - type: web
    name: ludus-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        fromDatabase:
          name: ludus-db
          property: connectionString
```

## 📈 Monitoring and Analytics

### User Analytics
- Profile completion rates
- Preference usage patterns
- Activity engagement metrics
- Search behavior analysis

### Performance Metrics
- API response times
- Database query performance
- Frontend load times
- Error rates

### Monitoring Tools
- Application performance monitoring (APM)
- Error tracking and logging
- User behavior analytics
- Database performance monitoring

## 🔄 Future Enhancements

### Planned Features
- Advanced user search with AI
- Social features (friends, groups)
- Gamification elements
- Advanced analytics dashboard
- Mobile app integration

### Technical Improvements
- GraphQL API
- Real-time updates
- Advanced caching strategies
- Microservices architecture
- Machine learning recommendations

## 📚 Additional Resources

### Documentation
- [API Documentation](./API_DOCUMENTATION.md)
- [Frontend Component Library](./COMPONENT_LIBRARY.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

### Code Examples
- [User Profile Example](./examples/user-profile-example.js)
- [Preferences Management Example](./examples/preferences-example.js)
- [Dashboard Integration Example](./examples/dashboard-example.js)

### Troubleshooting
- [Common Issues](./TROUBLESHOOTING.md)
- [FAQ](./FAQ.md)
- [Support Contact](./SUPPORT.md)

---

**Last Updated:** January 27, 2025  
**Version:** 2.0.0  
**Author:** LUDUS Development Team
