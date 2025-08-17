# 🚀 LUDUS API Services

This directory contains all the API service classes that handle communication between the frontend and backend. These services provide a clean, type-safe interface for making HTTP requests and managing application state.

## 📁 Service Structure

```
services/
├── index.ts                 # Main export file
├── activityService.ts       # Activity management
├── adminService.ts          # Admin operations
├── authService.ts           # Authentication
├── bookingService.ts        # Booking management
├── userService.ts           # User management
└── vendorService.ts         # Vendor operations
```

## 🔧 Core Features

- **TypeScript Support**: Full type safety with comprehensive interfaces
- **Error Handling**: Centralized error handling with user-friendly messages
- **Authentication**: Automatic token management and refresh
- **Loading States**: Built-in loading state management
- **Retry Logic**: Automatic retry for network failures
- **File Uploads**: Support for image and document uploads

## 🚀 Quick Start

### Basic Usage

```typescript
import { activityService, vendorService } from '@/services';

// Get all activities
const activities = await activityService.getActivities({
  category: 'outdoor',
  city: 'Mountain View'
});

// Get vendor profile
const vendor = await vendorService.getMyVendorProfile();
```

### With Loading States

```typescript
import { useLoadingState } from '@/utils/loadingStates';
import { activityService } from '@/services';

function ActivityList() {
  const { data: activities, isLoading, error, setLoading, setError, setSuccess } = useLoadingState();

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const result = await activityService.getActivities();
      setSuccess(result.activities);
    } catch (error) {
      setError(error.message);
    }
  };

  // ... rest of component
}
```

## 📚 Service Documentation

### 🔐 AuthService

Handles all authentication-related operations.

```typescript
import { authService } from '@/services';

// Login
const response = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Check authentication
const isAuthenticated = await authService.isAuthenticated();

// Get current user
const { user } = await authService.getCurrentUser();

// Check roles
const isVendor = await authService.isVendor();
const isAdmin = await authService.isAdmin();
```

**Key Methods:**
- `login(credentials)` - User login
- `register(userData)` - User registration
- `logout()` - User logout
- `getCurrentUser()` - Get current user profile
- `isAuthenticated()` - Check authentication status
- `hasRole(role)` - Check user role
- `getUserPermissions()` - Get user permissions

### 👤 UserService

Manages user profiles and preferences.

```typescript
import { userService } from '@/services';

// Get current user profile
const { user } = await userService.getMyProfile();

// Update profile
const updatedUser = await userService.updateMyProfile({
  firstName: 'John',
  lastName: 'Doe'
});

// Change password
await userService.changePassword({
  currentPassword: 'oldpass',
  newPassword: 'newpass'
});

// Upload avatar
const { avatarUrl } = await userService.uploadAvatar(file);
```

**Key Methods:**
- `getMyProfile()` - Get current user profile
- `updateMyProfile(updates)` - Update user profile
- `changePassword(passwordData)` - Change password
- `uploadAvatar(file)` - Upload profile avatar
- `getUserPreferences()` - Get user preferences
- `updateUserPreferences(preferences)` - Update preferences

### 🏪 VendorService

Handles vendor operations and profile management.

```typescript
import { vendorService } from '@/services';

// Get all vendors
const vendors = await vendorService.getVendors({
  city: 'Mountain View',
  specialty: 'outdoor'
});

// Get vendor profile
const { vendor } = await vendorService.getMyVendorProfile();

// Update vendor profile
const updatedVendor = await vendorService.updateVendorProfile({
  businessName: 'New Business Name',
  description: 'Updated description'
});

// Get vendor dashboard
const dashboard = await vendorService.getVendorDashboard('30d');
```

**Key Methods:**
- `getVendors(filters)` - Get filtered vendor list
- `getVendor(id)` - Get vendor by ID
- `getMyVendorProfile()` - Get current vendor profile
- `updateVendorProfile(updates)` - Update vendor profile
- `uploadLogo(file)` - Upload vendor logo
- `uploadBanner(file)` - Upload vendor banner
- `getVendorDashboard(period)` - Get vendor analytics

### 🎯 ActivityService

Manages activities and related operations.

```typescript
import { activityService } from '@/services';

// Get all activities
const activities = await activityService.getActivities({
  category: 'outdoor',
  priceMin: 50,
  priceMax: 200
});

// Create new activity
const newActivity = await activityService.createActivity({
  title: 'Rock Climbing',
  description: 'Amazing rock climbing experience',
  category: 'outdoor',
  vendorId: 'vendor123',
  // ... other fields
});

// Get vendor activities
const vendorActivities = await activityService.getVendorActivities('vendor123', {
  status: 'active'
});
```

**Key Methods:**
- `getActivities(filters)` - Get filtered activities
- `getActivity(id)` - Get activity by ID
- `createActivity(activityData)` - Create new activity
- `updateActivity(id, updates)` - Update activity
- `deleteActivity(id)` - Delete activity
- `getVendorActivities(vendorId, filters)` - Get vendor's activities
- `toggleActivityStatus(id, isActive)` - Toggle activity status
- `toggleFeatured(id, featured)` - Toggle featured status

### 📅 BookingService

Handles booking operations and management.

```typescript
import { bookingService } from '@/services';

// Create new booking
const booking = await bookingService.createBooking({
  activityId: 'activity123',
  participants: [
    { firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
  ],
  date: '2024-02-15',
  groupSize: 1,
  totalAmount: 99.99
});

// Get user bookings
const myBookings = await bookingService.getMyBookings('confirmed');

// Cancel booking
await bookingService.cancelBooking('booking123');
```

**Key Methods:**
- `createBooking(bookingData)` - Create new booking
- `getMyBookings(status, page, limit)` - Get user's bookings
- `getBooking(id)` - Get booking by ID
- `updateBooking(id, updates)` - Update booking
- `cancelBooking(id)` - Cancel booking
- `confirmBooking(id)` - Confirm booking
- `completeBooking(id)` - Mark booking as complete

### 👨‍💼 AdminService

Provides admin-only operations and analytics.

```typescript
import { adminService } from '@/services';

// Get dashboard overview
const dashboard = await adminService.getDashboardOverview();

// Get users with filters
const users = await adminService.getUsers({
  role: 'vendor',
  status: 'pending',
  page: 1,
  limit: 20
});

// Update user status
await adminService.updateUser('user123', {
  isActive: false
});

// Get analytics
const userAnalytics = await adminService.getUserAnalytics('30d');
```

**Key Methods:**
- `getDashboardOverview()` - Get admin dashboard data
- `getUsers(filters)` - Get filtered user list
- `updateUser(id, updates)` - Update user
- `deactivateUser(id)` - Deactivate user
- `getActivities(filters)` - Get filtered activities
- `updateActivity(id, updates)` - Update activity status
- `getVendors(filters)` - Get filtered vendors
- `updateVendor(id, updates)` - Update vendor status
- `getUserAnalytics(period)` - Get user analytics
- `getBookingAnalytics(period)` - Get booking analytics

## 🛠️ Utility Functions

### Error Handling

```typescript
import { handleApiError, ApiErrorHandler } from '@/utils/apiErrorHandler';

try {
  const result = await activityService.getActivities();
} catch (error) {
  const apiError = handleApiError(error, 'ActivityService');
  
  if (ApiErrorHandler.isAuthError(apiError)) {
    // Handle authentication error
  } else if (ApiErrorHandler.isNetworkError(apiError)) {
    // Handle network error
  }
}
```

### Loading States

```typescript
import { useLoadingState, withLoadingState } from '@/utils/loadingStates';

// Simple loading state
const { data, isLoading, error, setLoading, setError, setSuccess } = useLoadingState();

// Multiple loading states
const { states, setLoading, setError, setSuccess } = useMultipleLoadingStates({
  activities: createInitialLoadingState(),
  vendors: createInitialLoadingState(),
  bookings: createInitialLoadingState()
});

// With API wrapper
const result = await withLoadingState(loadingState, () => 
  activityService.getActivities()
);
```

## 🔧 Configuration

### Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WEB_URL=http://localhost:3000

# Development Options
NEXT_PUBLIC_MOCK_API=false
NEXT_PUBLIC_SLOW_NETWORK=false
```

### API Configuration

```typescript
import { getApiConfig, API_ENDPOINTS } from '@/config/api';

const config = getApiConfig();
console.log(config.BASE_URL); // http://localhost:5000
console.log(API_ENDPOINTS.AUTH_LOGIN); // http://localhost:5000/api/auth/login
```

## 📝 Best Practices

### 1. Error Handling
Always wrap API calls in try-catch blocks and use the error handling utilities:

```typescript
try {
  const result = await service.method();
  // Handle success
} catch (error) {
  const apiError = handleApiError(error, 'ServiceName');
  // Handle error appropriately
}
```

### 2. Loading States
Use loading state hooks to provide user feedback:

```typescript
const { data, isLoading, error } = useLoadingState();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;

return <DataDisplay data={data} />;
```

### 3. Type Safety
Always use the provided TypeScript interfaces:

```typescript
import { Activity, CreateActivityRequest } from '@/services';

const createActivity = async (data: CreateActivityRequest): Promise<Activity> => {
  return activityService.createActivity(data);
};
```

### 4. Authentication
Check authentication before making protected API calls:

```typescript
const { user } = useAuth();

if (!user) {
  return <Navigate to="/login" />;
}

// Now safe to make authenticated API calls
```

## 🧪 Testing

### Mock Services
For testing, you can create mock versions of services:

```typescript
// __mocks__/services/activityService.ts
export const mockActivityService = {
  getActivities: jest.fn(),
  createActivity: jest.fn(),
  // ... other methods
};
```

### Testing with Loading States
Test components that use loading states:

```typescript
import { render, screen } from '@testing-library/react';
import { useLoadingState } from '@/utils/loadingStates';

// Mock the hook
jest.mock('@/utils/loadingStates');
const mockUseLoadingState = useLoadingState as jest.MockedFunction<typeof useLoadingState>;

test('shows loading state', () => {
  mockUseLoadingState.mockReturnValue({
    isLoading: true,
    error: null,
    isSuccess: false,
    data: null
  });
  
  render(<MyComponent />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
```

## 🚀 Performance Optimization

### 1. Request Deduplication
The services automatically handle request deduplication for identical requests.

### 2. Caching
Implement caching for frequently accessed data:

```typescript
const cachedData = localStorage.getItem('cached_activities');
if (cachedData) {
  return JSON.parse(cachedData);
}

const data = await activityService.getActivities();
localStorage.setItem('cached_activities', JSON.stringify(data));
```

### 3. Pagination
Use pagination for large datasets:

```typescript
const { activities, pagination } = await activityService.getActivities({
  page: 1,
  limit: 20
});
```

## 🔒 Security

### 1. Token Management
Tokens are automatically managed and refreshed:

```typescript
// Token is automatically included in requests
const result = await activityService.getActivities();

// Token refresh is handled automatically
if (tokenExpired) {
  await authService.refreshToken(refreshToken);
}
```

### 2. Input Validation
Always validate input data before sending to API:

```typescript
import { z } from 'zod';

const activitySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  // ... other validations
});

const validatedData = activitySchema.parse(formData);
await activityService.createActivity(validatedData);
```

## 📚 Additional Resources

- [API Configuration](./config/api.ts)
- [Error Handling Utilities](./utils/apiErrorHandler.ts)
- [Loading State Utilities](./utils/loadingStates.ts)
- [Authentication Utilities](./utils/auth.ts)

## 🤝 Contributing

When adding new services or modifying existing ones:

1. **Follow the existing pattern** - Use the same structure and naming conventions
2. **Add comprehensive types** - Define all interfaces and types
3. **Include error handling** - Use the centralized error handling utilities
4. **Add JSDoc comments** - Document all public methods
5. **Update this README** - Keep documentation current

## 📞 Support

For questions or issues with the API services:

1. Check the error messages and logs
2. Verify the API endpoints are accessible
3. Check authentication and permissions
4. Review the service implementation
5. Check the backend API status
