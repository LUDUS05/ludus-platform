# Activity Management System Guide

## 📋 Overview

The Activity Management System is a comprehensive solution for managing activities on the LUDUS platform. It provides full CRUD operations, advanced search and filtering, analytics, and RTL support for Arabic users.

## 🏗️ System Architecture

### Backend Components

#### Models
- **Activity.js** - Basic activity model
- **ActivityEnhanced.js** - Enhanced activity model with comprehensive features
- **Category.js** - Activity categories
- **Partner.js** - Activity partners/vendors

#### Controllers
- **activityController.js** - Main activity management controller
  - `createEnhancedActivity()` - Create new activities
  - `getActivityAnalytics()` - Get activity statistics
  - `updateActivityStatus()` - Update activity status
  - `getPartnerActivities()` - Get partner's activities
  - `duplicateActivity()` - Duplicate existing activities

#### Routes
- **activities.js** - Activity management routes
  - `POST /api/activities/enhanced` - Create enhanced activity
  - `GET /api/activities/:id/analytics` - Get activity analytics
  - `PUT /api/activities/:id/status` - Update activity status
  - `GET /api/activities/partner/my` - Get partner activities
  - `POST /api/activities/:id/duplicate` - Duplicate activity

### Frontend Components

#### Services
- **activityService.js** - Frontend service for activity management
  - Activity CRUD operations
  - Search and filtering
  - Analytics and reporting
  - Utility functions

#### Components
- **ActivityManagement.jsx** - Main activity management interface
- **ActivityForm.jsx** - Activity creation and editing form

## 🚀 Key Features

### 1. Activity Creation and Management
- **Multi-step Form** - Guided activity creation process
- **Validation** - Comprehensive client and server-side validation
- **RTL Support** - Full Arabic language and layout support
- **Media Upload** - Image and video upload capabilities
- **Status Management** - Draft, published, suspended, archived states

### 2. Advanced Search and Filtering
- **Text Search** - Search by title, description, and tags
- **Category Filtering** - Filter by activity categories
- **Location Filtering** - Filter by city and region
- **Price Range** - Filter by price range
- **Status Filtering** - Filter by activity status
- **Sorting** - Sort by various fields (date, price, rating, etc.)

### 3. Analytics and Reporting
- **Booking Statistics** - Total, confirmed, completed, cancelled bookings
- **Revenue Tracking** - Total revenue and average booking value
- **Conversion Rates** - Booking conversion metrics
- **Demographics** - Participant demographics and age distribution
- **Trends** - Monthly booking trends and patterns

### 4. Partner Management
- **Activity Dashboard** - Overview of all partner activities
- **Status Management** - Update activity status with reasons
- **Bulk Operations** - Bulk update and delete operations
- **Analytics** - Detailed analytics for each activity

### 5. RTL Support
- **Arabic Interface** - Full Arabic language support
- **RTL Layout** - Right-to-left layout for Arabic users
- **Cultural Sensitivity** - Saudi market specific features
- **Bilingual Support** - Arabic and English content

## 📊 Data Models

### ActivityEnhanced Schema

```javascript
{
  // Basic Information
  title: String, // Arabic title
  titleEn: String, // English title
  description: String, // Short description
  descriptionEn: String, // English description
  fullDescription: String, // Detailed description
  fullDescriptionEn: String, // English detailed description
  slug: String, // URL-friendly identifier
  
  // Category and Partner
  category: {
    id: ObjectId, // Category reference
    name: String, // Category name
    nameEn: String // English category name
  },
  partner: ObjectId, // Partner reference
  createdBy: ObjectId, // Creator reference
  
  // Pricing
  pricing: {
    basePrice: Number, // Base price
    currency: String, // Currency code (SAR)
    priceType: String, // per_person, per_group, per_hour
    discounts: [{
      type: String, // percentage, fixed
      value: Number, // Discount value
      minQuantity: Number, // Minimum quantity for discount
      validUntil: Date // Discount expiry
    }]
  },
  
  // Capacity
  capacity: {
    min: Number, // Minimum participants
    max: Number, // Maximum participants
    current: Number // Current bookings
  },
  
  // Duration
  duration: {
    hours: Number, // Duration in hours
    minutes: Number // Additional minutes
  },
  
  // Location
  location: {
    city: String, // Arabic city name
    cityEn: String, // English city name
    region: String, // Arabic region name
    regionEn: String, // English region name
    address: String, // Arabic address
    addressEn: String, // English address
    coordinates: {
      latitude: Number, // GPS latitude
      longitude: Number // GPS longitude
    },
    isOnline: Boolean // Online activity flag
  },
  
  // Media
  images: [{
    url: String, // Image URL
    caption: String, // Arabic caption
    captionEn: String, // English caption
    isPrimary: Boolean, // Primary image flag
    uploadedAt: Date // Upload timestamp
  }],
  videos: [{
    url: String, // Video URL
    thumbnail: String, // Video thumbnail
    duration: Number, // Duration in seconds
    uploadedAt: Date // Upload timestamp
  }],
  
  // Requirements
  requirements: {
    ageMin: Number, // Minimum age
    ageMax: Number, // Maximum age
    skillLevel: String, // beginner, intermediate, advanced, expert
    equipment: [String], // Required equipment
    specialRequirements: String // Special requirements
  },
  
  // Policies
  policies: {
    cancellationPolicy: String, // Cancellation policy
    refundPolicy: String, // Refund policy
    weatherPolicy: String // Weather policy
  },
  
  // Scheduling
  scheduling: {
    type: String, // fixed, flexible, recurring
    availability: [{
      dayOfWeek: Number, // 0-6 (Sunday-Saturday)
      startTime: String, // HH:MM format
      endTime: String, // HH:MM format
      isAvailable: Boolean // Availability flag
    }],
    advanceBookingDays: Number, // Days in advance
    lastMinuteBooking: Boolean // Last minute booking allowed
  },
  
  // Status and Metadata
  status: String, // draft, published, suspended, archived
  isActive: Boolean, // Active flag
  rating: Number, // Average rating
  reviewCount: Number, // Number of reviews
  viewCount: Number, // Number of views
  bookingCount: Number, // Number of bookings
  
  // Statistics
  statistics: {
    totalBookings: Number, // Total bookings
    confirmedBookings: Number, // Confirmed bookings
    completedBookings: Number, // Completed bookings
    cancelledBookings: Number, // Cancelled bookings
    totalRevenue: Number, // Total revenue
    averageBookingValue: Number, // Average booking value
    conversionRate: Number // Conversion rate
  },
  
  // Timestamps
  createdAt: Date, // Creation timestamp
  updatedAt: Date // Last update timestamp
}
```

## 🔧 API Endpoints

### Public Endpoints

#### GET /api/activities
Get all public activities with filtering and pagination.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)
- `search` - Search term
- `category` - Category ID
- `city` - City name
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort order (asc/desc)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "totalPages": 5,
    "totalActivities": 50,
    "hasMore": true
  },
  "filters": {
    "categories": [...],
    "cities": [...],
    "priceRange": {
      "minPrice": 0,
      "maxPrice": 1000
    }
  }
}
```

#### GET /api/activities/:id
Get single activity by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "activity": {...}
  }
}
```

### Partner Endpoints

#### POST /api/activities/enhanced
Create new enhanced activity.

**Request Body:**
```json
{
  "title": "Activity Title",
  "titleEn": "Activity Title English",
  "description": "Short description",
  "descriptionEn": "Short description English",
  "fullDescription": "Detailed description",
  "fullDescriptionEn": "Detailed description English",
  "category": {
    "id": "category_id"
  },
  "pricing": {
    "basePrice": 100,
    "currency": "SAR",
    "priceType": "per_person"
  },
  "capacity": {
    "min": 1,
    "max": 10
  },
  "duration": {
    "hours": 2,
    "minutes": 0
  },
  "location": {
    "city": "Riyadh",
    "cityEn": "Riyadh",
    "region": "Riyadh Region",
    "regionEn": "Riyadh Region",
    "address": "Full address",
    "addressEn": "Full address English",
    "coordinates": {
      "latitude": 24.7136,
      "longitude": 46.6753
    }
  },
  "requirements": {
    "ageMin": 18,
    "ageMax": 65,
    "skillLevel": "beginner"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "activity": {...}
  },
  "message": "Activity created successfully",
  "animationTriggers": {
    "celebration": true,
    "confetti": true,
    "successMessage": "تم إنشاء النشاط بنجاح! 🎉",
    "hapticFeedback": true
  }
}
```

#### GET /api/activities/partner/my
Get partner's activities with filtering.

**Query Parameters:**
- `status` - Activity status filter
- `category` - Category filter
- `search` - Search term
- `sortBy` - Sort field
- `sortOrder` - Sort order
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [...],
    "pagination": {...},
    "stats": {
      "totalActivities": 10,
      "publishedActivities": 8,
      "draftActivities": 2,
      "suspendedActivities": 0
    }
  }
}
```

#### GET /api/activities/:id/analytics
Get activity analytics and statistics.

**Query Parameters:**
- `period` - Time period (7d, 30d, 90d, 1y)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "stats": {
      "totalBookings": 50,
      "confirmedBookings": 45,
      "completedBookings": 40,
      "cancelledBookings": 5,
      "totalRevenue": 5000,
      "averageBookingValue": 100
    },
    "bookingsByStatus": [...],
    "monthlyTrends": [...],
    "participantDemographics": [...]
  }
}
```

#### PUT /api/activities/:id/status
Update activity status.

**Request Body:**
```json
{
  "status": "published",
  "reason": "Ready for publication"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "activity": {...}
  },
  "message": "Activity status updated successfully"
}
```

#### POST /api/activities/:id/duplicate
Duplicate an activity.

**Response:**
```json
{
  "success": true,
  "data": {
    "activity": {...}
  },
  "message": "Activity duplicated successfully"
}
```

## 🎨 Frontend Components

### ActivityManagement Component

Main interface for managing activities.

**Props:**
- None (uses authentication context)

**Features:**
- View all partner activities
- Filter and search activities
- Create new activities
- Edit existing activities
- Update activity status
- View analytics
- Duplicate activities

**Usage:**
```jsx
import ActivityManagement from './components/activity/ActivityManagement';

function App() {
  return <ActivityManagement />;
}
```

### ActivityForm Component

Form for creating and editing activities.

**Props:**
- `activityId` - ID of activity to edit (optional)
- `onSuccess` - Success callback
- `onCancel` - Cancel callback

**Features:**
- Multi-step form (4 steps)
- Real-time validation
- RTL support
- Media upload
- Category selection
- Pricing configuration
- Location management

**Usage:**
```jsx
import ActivityForm from './components/activity/ActivityForm';

function CreateActivity() {
  const handleSuccess = () => {
    // Handle success
  };

  const handleCancel = () => {
    // Handle cancel
  };

  return (
    <ActivityForm
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
```

## 🔍 Search and Filtering

### Search Functionality

The system supports comprehensive search across multiple fields:

- **Title** - Activity title (Arabic and English)
- **Description** - Activity description
- **Tags** - Activity tags
- **Category** - Activity category
- **Location** - City and region

### Filtering Options

- **Status** - Draft, published, suspended, archived
- **Category** - Activity categories
- **Location** - City and region
- **Price Range** - Minimum and maximum price
- **Date Range** - Creation and update dates
- **Rating** - Minimum rating threshold

### Sorting Options

- **Date** - Creation date (newest/oldest)
- **Price** - Base price (lowest/highest)
- **Rating** - Average rating (highest/lowest)
- **Popularity** - Booking count
- **Title** - Alphabetical order

## 📈 Analytics and Reporting

### Activity Statistics

- **Total Bookings** - Number of total bookings
- **Confirmed Bookings** - Number of confirmed bookings
- **Completed Bookings** - Number of completed bookings
- **Cancelled Bookings** - Number of cancelled bookings
- **Total Revenue** - Total revenue generated
- **Average Booking Value** - Average value per booking
- **Conversion Rate** - Booking confirmation rate

### Demographics

- **Age Distribution** - Participant age groups
- **Participant Types** - Adult, child, senior breakdown
- **Geographic Distribution** - Booking locations
- **Time Patterns** - Peak booking times

### Trends

- **Monthly Trends** - Monthly booking patterns
- **Seasonal Patterns** - Seasonal activity preferences
- **Growth Metrics** - Month-over-month growth
- **Performance Indicators** - Key performance metrics

## 🌍 RTL Support

### Arabic Language Support

- **Bilingual Content** - Arabic and English titles and descriptions
- **RTL Layout** - Right-to-left layout for Arabic users
- **Cultural Sensitivity** - Saudi market specific features
- **Localization** - Saudi-specific validation and formatting

### RTL Implementation

```css
/* RTL-specific CSS classes */
.rtl {
  direction: rtl;
  text-align: right;
}

.rtl .space-x-4 > * + * {
  margin-left: 0;
  margin-right: 1rem;
}

.rtl .flex-row {
  flex-direction: row-reverse;
}
```

### Component RTL Support

```jsx
// RTL-aware component
const ActivityCard = ({ activity, language = 'ar' }) => {
  const isArabic = language === 'ar';
  
  return (
    <div className={`p-4 ${isArabic ? 'rtl' : 'ltr'}`}>
      <h3 className="text-lg font-semibold">
        {isArabic ? activity.title : activity.titleEn}
      </h3>
      <p className="text-gray-600">
        {isArabic ? activity.description : activity.descriptionEn}
      </p>
    </div>
  );
};
```

## 🔒 Security

### Authentication and Authorization

- **JWT Authentication** - Secure API access
- **Role-based Access** - Partner and admin roles
- **Resource Ownership** - Partners can only manage their activities
- **Input Validation** - Comprehensive server-side validation

### Data Protection

- **Input Sanitization** - XSS prevention
- **SQL Injection Prevention** - Parameterized queries
- **Rate Limiting** - API rate limiting
- **CORS Configuration** - Cross-origin resource sharing

### Privacy

- **Data Encryption** - Sensitive data encryption
- **Access Logging** - Activity access logging
- **Audit Trail** - Status change tracking
- **GDPR Compliance** - Data protection compliance

## 🚀 Performance

### Optimization Strategies

- **Database Indexing** - Optimized database queries
- **Pagination** - Efficient data pagination
- **Caching** - Redis caching for frequently accessed data
- **CDN** - Content delivery network for media files

### Performance Metrics

- **API Response Time** - < 200ms average
- **Database Query Time** - < 50ms average
- **Frontend Load Time** - < 2s initial load
- **Memory Usage** - < 100MB per request

### Scalability

- **Horizontal Scaling** - Multiple server instances
- **Database Sharding** - Database horizontal scaling
- **Load Balancing** - Request distribution
- **Caching Strategy** - Multi-level caching

## 🧪 Testing

### Test Coverage

- **Unit Tests** - Individual function testing
- **Integration Tests** - API endpoint testing
- **E2E Tests** - End-to-end user flow testing
- **Performance Tests** - Load and stress testing

### Test Categories

- **Functionality Tests** - Feature testing
- **Security Tests** - Security vulnerability testing
- **Performance Tests** - Performance benchmarking
- **RTL Tests** - Right-to-left layout testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "Activity Management"

# Run with coverage
npm test -- --coverage

# Run performance tests
npm run test:performance
```

## 📚 Usage Examples

### Creating an Activity

```javascript
import { activityService } from './services/activityService';

const createActivity = async () => {
  try {
    const activityData = {
      title: 'Yoga Class',
      titleEn: 'Yoga Class',
      description: 'Relaxing yoga session',
      descriptionEn: 'Relaxing yoga session',
      fullDescription: 'A comprehensive yoga session for all levels',
      fullDescriptionEn: 'A comprehensive yoga session for all levels',
      category: { id: 'fitness' },
      pricing: {
        basePrice: 50,
        currency: 'SAR',
        priceType: 'per_person'
      },
      capacity: {
        min: 1,
        max: 20
      },
      duration: {
        hours: 1,
        minutes: 0
      },
      location: {
        city: 'Riyadh',
        cityEn: 'Riyadh',
        region: 'Riyadh Region',
        regionEn: 'Riyadh Region',
        address: '123 Main Street',
        addressEn: '123 Main Street'
      }
    };

    const result = await activityService.createActivity(activityData);
    console.log('Activity created:', result);
  } catch (error) {
    console.error('Error creating activity:', error);
  }
};
```

### Searching Activities

```javascript
const searchActivities = async () => {
  try {
    const searchParams = {
      search: 'yoga',
      category: 'fitness',
      city: 'Riyadh',
      minPrice: 0,
      maxPrice: 100,
      sortBy: 'pricing.basePrice',
      sortOrder: 'asc'
    };

    const result = await activityService.searchActivities(searchParams);
    console.log('Search results:', result);
  } catch (error) {
    console.error('Error searching activities:', error);
  }
};
```

### Getting Analytics

```javascript
const getAnalytics = async (activityId) => {
  try {
    const analytics = await activityService.getActivityAnalytics(activityId, {
      period: '30d'
    });
    
    console.log('Total bookings:', analytics.stats.totalBookings);
    console.log('Total revenue:', analytics.stats.totalRevenue);
    console.log('Conversion rate:', analytics.stats.conversionRate);
  } catch (error) {
    console.error('Error getting analytics:', error);
  }
};
```

## 🔧 Configuration

### Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/ludus

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Cloudinary (for media upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Database Configuration

```javascript
// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

// Indexes for performance
ActivityEnhanced.createIndexes([
  { title: 'text', description: 'text', tags: 'text' },
  { 'location.city': 1 },
  { 'pricing.basePrice': 1 },
  { status: 1, isActive: 1 },
  { partner: 1, createdAt: -1 }
]);
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Activity Creation Fails
**Problem:** Activity creation returns validation error
**Solution:** Check required fields and validation rules

#### 2. Search Not Working
**Problem:** Search returns no results
**Solution:** Verify search index and query parameters

#### 3. RTL Layout Issues
**Problem:** Arabic text not displaying correctly
**Solution:** Check RTL CSS classes and text direction

#### 4. Performance Issues
**Problem:** Slow API responses
**Solution:** Check database indexes and query optimization

### Debug Mode

```javascript
// Enable debug logging
process.env.DEBUG = 'ludus:activity:*';

// Check database connection
mongoose.connection.on('connected', () => {
  console.log('Database connected');
});

// Monitor API requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

## 📖 Best Practices

### Code Organization

- **Modular Structure** - Separate concerns into modules
- **Error Handling** - Comprehensive error handling
- **Validation** - Input validation at all levels
- **Documentation** - Clear code documentation

### Performance

- **Database Optimization** - Efficient queries and indexes
- **Caching** - Strategic caching implementation
- **Pagination** - Implement pagination for large datasets
- **Lazy Loading** - Load data as needed

### Security

- **Input Validation** - Validate all inputs
- **Authentication** - Secure authentication
- **Authorization** - Proper access control
- **Data Protection** - Protect sensitive data

### User Experience

- **RTL Support** - Full Arabic language support
- **Responsive Design** - Mobile-friendly interface
- **Loading States** - Show loading indicators
- **Error Messages** - Clear error messages

## 🔄 Future Enhancements

### Planned Features

- **Advanced Analytics** - More detailed reporting
- **AI Recommendations** - AI-powered activity recommendations
- **Real-time Updates** - WebSocket for real-time updates
- **Mobile App** - Native mobile application

### Technical Improvements

- **Microservices** - Break down into microservices
- **GraphQL** - Implement GraphQL API
- **Machine Learning** - ML-powered features
- **Blockchain** - Blockchain integration for transparency

## 📞 Support

### Getting Help

- **Documentation** - Check this guide first
- **GitHub Issues** - Report bugs and feature requests
- **Community Forum** - Ask questions and share ideas
- **Email Support** - Contact support team

### Contributing

- **Code Contributions** - Submit pull requests
- **Documentation** - Improve documentation
- **Testing** - Add test cases
- **Bug Reports** - Report issues

---

**Last Updated:** January 27, 2025  
**Version:** 2.0.0  
**Author:** LUDUS Development Team
