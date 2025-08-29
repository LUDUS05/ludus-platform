// LUDUS Multi-Platform Shared Types
// This file contains all shared types and interfaces used across the LUDUS ecosystem

// ============================================================================
// CORE TYPES
// ============================================================================

export type UserRole = 'user' | 'partner' | 'staff_admin' | 'staff_support' | 'staff_moderator';
export type ActivityStatus = 'draft' | 'active' | 'cancelled' | 'completed' | 'suspended';
export type ActivityVisibility = 'public' | 'private' | 'partner_only';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'partial_refund';
export type PaymentMethod = 'stripe' | 'cash' | 'bank_transfer';
export type BookingSource = 'ludus_mobile' | 'partner_direct' | 'partner_website' | 'walk_in' | 'phone';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly';
export type PartnerVerificationStatus = 'pending' | 'verified' | 'suspended' | 'rejected';
export type SubscriptionPlan = 'basic' | 'premium' | 'enterprise';
export type StaffActionType = 'user_suspension' | 'partner_verification' | 'booking_dispute' | 'content_moderation' | 'refund_processing';

// ============================================================================
// LOCATION TYPES
// ============================================================================

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Location {
  address: string;
  coordinates: GeoPoint;
  city: string;
  venue?: string;
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  uid: string;
  email: string;
  displayName: string;
  profilePicture?: string;
  role: UserRole;
  location: {
    city: string;
    coordinates: GeoPoint;
  };
  preferences: {
    categories: string[];
    budget: number;
  };
  isActive: boolean;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  categories: string[];
  budget: number;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  language: 'en' | 'ar';
  timezone: string;
}

// ============================================================================
// PARTNER TYPES
// ============================================================================

export interface Partner {
  partnerId: string; // matches user uid for partner role users
  businessName: string;
  businessType: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  verificationStatus: PartnerVerificationStatus;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiry: Date;
  businessDocuments: string[]; // Cloud Storage URLs
  externalBookingSources: BookingSource[];
  paymentInfo: {
    bankAccount: string;
    taxId: string;
  };
  analytics: {
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ACTIVITY TYPES
// ============================================================================

export interface Activity {
  id: string;
  partnerId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  location: Location;
  schedule: {
    dateTime: Date;
    duration: number; // in minutes
    recurring?: {
      isRecurring: boolean;
      frequency?: RecurringFrequency;
      endDate?: Date;
    };
  };
  pricing: {
    basePrice: number;
    currency: 'SAR';
    discounts?: {
      earlyBird?: { percentage: number; validUntil: Date };
      groupDiscount?: { minParticipants: number; percentage: number };
    };
  };
  capacity: {
    maxParticipants: number;
    currentBookings: number;
    waitlistCount: number;
  };
  media: {
    images: string[]; // Cloud Storage URLs
    videoUrl?: string;
  };
  requirements?: {
    minAge?: number;
    maxAge?: number;
    skillLevel?: SkillLevel;
    equipment?: string[];
    prerequisites?: string[];
  };
  status: ActivityStatus;
  visibility: ActivityVisibility;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivitySnapshot {
  id: string;
  title: string;
  dateTime: Date;
  location: string;
  basePrice: number;
}

// ============================================================================
// BOOKING TYPES
// ============================================================================

export interface Booking {
  id: string;
  bookingNumber: string; // User-friendly booking reference
  source: BookingSource;
  
  // User Information
  userId?: string; // null for external bookings
  userInfo: {
    name: string;
    email: string;
    phone: string;
  };
  
  // Activity Information
  activityId: string;
  partnerId: string;
  activitySnapshot: ActivitySnapshot;
  
  // Booking Details
  participants: {
    count: number;
    details?: {
      name: string;
      age?: number;
      specialRequirements?: string;
    }[];
  };
  
  // Pricing & Payment
  pricing: {
    baseAmount: number;
    discountAmount?: number;
    taxAmount: number;
    totalAmount: number;
    currency: 'SAR';
  };
  
  payment: {
    status: PaymentStatus;
    method: PaymentMethod;
    transactionId?: string;
    paidAt?: Date;
    refundAmount?: number;
    refundReason?: string;
  };
  
  // Status Management
  status: BookingStatus;
  cancellation?: {
    cancelledBy: 'user' | 'partner' | 'admin';
    reason: string;
    cancelledAt: Date;
    refundProcessed: boolean;
  };
  
  // Communication
  notes?: string;
  partnerNotes?: string; // Only visible to partner and staff
  
  // Timestamps
  bookedAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  updatedAt: Date;
}

// ============================================================================
// REVIEW TYPES
// ============================================================================

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  activityId: string;
  partnerId: string;
  rating: number; // 1-5
  comment?: string;
  images?: string[]; // Cloud Storage URLs
  isVerifiedBooking: boolean;
  response?: {
    partnerResponse?: string;
    respondedAt?: Date;
  };
  isHidden: boolean; // For moderation
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// CATEGORY TYPES
// ============================================================================

export interface Category {
  id: string;
  name: string;
  nameArabic?: string; // For future Arabic localization
  description: string;
  icon: string; // Icon name or URL
  color: string; // Hex color for category theming
  isActive: boolean;
  sortOrder: number;
  parentCategory?: string; // For subcategories
  createdAt: Date;
}

// ============================================================================
// STAFF TYPES
// ============================================================================

export interface StaffAction {
  id: string;
  staffId: string;
  action: StaffActionType;
  targetType: 'user' | 'partner' | 'activity' | 'booking' | 'review';
  targetId: string;
  details: {
    reason: string;
    previousState: any;
    newState: any;
    notes?: string;
  };
  timestamp: Date;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface PlatformAnalytics {
  date: string; // YYYY-MM-DD format
  metrics: {
    activeUsers: number;
    newRegistrations: number;
    totalBookings: number;
    bookingRevenue: number;
    averageBookingValue: number;
    partnerCount: number;
    activityCount: number;
    userRetentionRate: number;
  };
  createdAt: Date;
}

export interface BusinessMetrics {
  totalBookings: number;
  revenue: number;
  averageRating: number;
  repeatCustomers: number;
  growthRate: number;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface ActivityFilters {
  category?: string;
  location?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  participants?: number;
  skillLevel?: SkillLevel;
  tags?: string[];
}

export interface BookingFilters {
  status?: BookingStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  partnerId?: string;
  userId?: string;
  source?: BookingSource;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  location?: string;
  registrationDate?: {
    start: Date;
    end: Date;
  };
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'booking' | 'activity' | 'system' | 'promotional';
  data?: any;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface ActivityForm {
  title: string;
  description: string;
  category: string;
  tags: string[];
  location: Location;
  schedule: {
    dateTime: Date;
    duration: number;
    recurring?: {
      isRecurring: boolean;
      frequency?: RecurringFrequency;
      endDate?: Date;
    };
  };
  pricing: {
    basePrice: number;
    discounts?: {
      earlyBird?: { percentage: number; validUntil: Date };
      groupDiscount?: { minParticipants: number; percentage: number };
    };
  };
  capacity: {
    maxParticipants: number;
  };
  requirements?: {
    minAge?: number;
    maxAge?: number;
    skillLevel?: SkillLevel;
    equipment?: string[];
    prerequisites?: string[];
  };
  visibility: ActivityVisibility;
}

export interface BookingForm {
  activityId: string;
  dateTime: Date;
  participants: {
    count: number;
    details?: {
      name: string;
      age?: number;
      specialRequirements?: string;
    }[];
  };
  notes?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type NonNullableFields<T, K extends keyof T> = T & {
  [P in K]: NonNullable<T[P]>;
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const CURRENCIES = {
  SAR: 'SAR',
  USD: 'USD',
  EUR: 'EUR',
} as const;

export const LANGUAGES = {
  EN: 'en',
  AR: 'ar',
} as const;

export const TIMEZONES = {
  ASIA_RIYADH: 'Asia/Riyadh',
  UTC: 'UTC',
} as const;

export const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm'],
  DOCUMENT: ['application/pdf', 'application/msword'],
} as const;

export const MAX_FILE_SIZE = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  VIDEO: 50 * 1024 * 1024, // 50MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
} as const;

// ============================================================================
// ENUM TYPES
// ============================================================================

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ActivityDifficulty {
  EASY = 'easy',
  MODERATE = 'moderate',
  DIFFICULT = 'difficult',
  EXPERT = 'expert',
}

export enum BookingConfirmationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  UserRole,
  ActivityStatus,
  ActivityVisibility,
  BookingStatus,
  PaymentStatus,
  PaymentMethod,
  BookingSource,
  SkillLevel,
  RecurringFrequency,
  PartnerVerificationStatus,
  SubscriptionPlan,
  StaffActionType,
  GeoPoint,
  Location,
  User,
  UserPreferences,
  Partner,
  Activity,
  ActivitySnapshot,
  Booking,
  Review,
  Category,
  StaffAction,
  PlatformAnalytics,
  BusinessMetrics,
  ApiResponse,
  PaginatedResponse,
  ApiError,
  ActivityFilters,
  BookingFilters,
  UserFilters,
  Notification,
  LoginForm,
  RegisterForm,
  ActivityForm,
  BookingForm,
  DeepPartial,
  Optional,
  RequiredFields,
  NonNullableFields,
};
