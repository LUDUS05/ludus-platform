// Export all API services
export { activityService } from './activityService';
export { adminService } from './adminService';
export { authService } from './authService';
export { bookingService } from './bookingService';
export { userService } from './userService';
export { vendorService } from './vendorService';

// Export types from services
export type {
  Activity,
  CreateActivityRequest,
  UpdateActivityRequest,
  ActivityFilters,
  ActivitiesResponse,
  VendorActivity
} from './activityService';

export type {
  DashboardOverview,
  RecentUser,
  RecentBooking,
  DashboardData,
  User as AdminUser,
  Activity as AdminActivity,
  Vendor as AdminVendor,
  PaginationData,
  UsersResponse as AdminUsersResponse,
  ActivitiesResponse as AdminActivitiesResponse,
  VendorsResponse as AdminVendorsResponse,
  UserAnalytics,
  BookingAnalytics
} from './adminService';

export type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutResponse,
  UserProfile
} from './authService';

export type {
  Participant,
  CreateBookingRequest,
  Booking,
  BookingStats
} from './bookingService';

export type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  UserFilters,
  UsersResponse,
  UserStats
} from './userService';

export type {
  Vendor,
  CreateVendorRequest,
  UpdateVendorRequest,
  VendorFilters,
  VendorsResponse,
  VendorStats,
  VendorDashboardData
} from './vendorService';
