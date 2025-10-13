// User Types
export interface User {
  _id: string;
  firebaseUid: string;
  email: string;
  emailVerified: boolean;
  phoneNumber?: string;
  phoneVerified: boolean;
  profile: UserProfile;
  preferences: UserPreferences;
  wallet: UserWallet;
  referral: UserReferral;
  stats: UserStats;
  status: 'active' | 'suspended' | 'deleted';
  role: 'user' | 'partner' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  displayName?: string;
  avatar?: {
    url: string;
    thumbnail: string;
  };
  bio?: {
    ar: string;
    en: string;
  };
  dateOfBirth?: Date;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  nationality?: string;
}

export interface UserPreferences {
  language: 'ar' | 'en';
  currency: 'SAR';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  interests: string[];
  location?: {
    city: string;
    region: string;
  };
}

export interface UserWallet {
  balance: number;
  currency: 'SAR';
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  reference: string;
  balanceAfter: number;
  createdAt: Date;
}

export interface UserReferral {
  code: string;
  referredBy?: string;
  totalReferrals: number;
  totalRewardsEarned: number;
}

export interface UserStats {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpent: number;
  reviewsGiven: number;
  averageRating?: number;
}

// Activity Types
export interface Activity {
  _id: string;
  title: {
    ar: string;
    en: string;
  };
  slug: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  shortDescription?: {
    ar: string;
    en: string;
  };
  partner: string;
  category: string;
  subCategories?: string[];
  tags?: Array<{
    ar: string;
    en: string;
  }>;
  pricing: ActivityPricing;
  media: ActivityMedia;
  location: ActivityLocation;
  schedule: ActivitySchedule;
  capacity: ActivityCapacity;
  requirements: ActivityRequirements;
  duration: ActivityDuration;
  cancellationPolicy: CancellationPolicy;
  rating: ActivityRating;
  statistics: ActivityStatistics;
  seo: ActivitySEO;
  status: 'draft' | 'pending_review' | 'active' | 'inactive' | 'suspended';
  visibility: 'public' | 'unlisted' | 'private';
  featured: boolean;
  promoted: boolean;
  safetyGuidelines: SafetyGuidelines;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  lastBookingAt?: Date;
}

export interface ActivityPricing {
  type: 'fixed' | 'per_person' | 'per_group' | 'tiered';
  basePrice: number;
  currency: 'SAR';
  tiers?: Array<{
    minParticipants: number;
    maxParticipants: number;
    pricePerPerson: number;
  }>;
  discounts?: Array<{
    type: 'early_bird' | 'group' | 'seasonal' | 'promotional';
    value: number;
    valueType: 'percentage' | 'fixed';
    conditions: {
      minParticipants?: number;
      daysBeforeActivity?: number;
      validFrom?: Date;
      validUntil?: Date;
    };
  }>;
}

export interface ActivityMedia {
  coverImage: {
    url: string;
    thumbnail: string;
    alt: {
      ar: string;
      en: string;
    };
  };
  gallery?: Array<{
    url: string;
    thumbnail: string;
    alt: {
      ar: string;
      en: string;
    };
    order: number;
  }>;
  video?: {
    url: string;
    thumbnail: string;
    provider: 'youtube' | 'vimeo' | 'custom';
  };
}

export interface ActivityLocation {
  type: 'physical' | 'online' | 'hybrid';
  address?: {
    ar: string;
    en: string;
  };
  city: string;
  region?: string;
  coordinates?: {
    type: 'Point';
    coordinates: [number, number];
  };
  platform?: string;
  accessLink?: string;
  accessInstructions?: {
    ar: string;
    en: string;
  };
}

export interface ActivitySchedule {
  type: 'one_time' | 'recurring' | 'flexible';
  startDateTime?: Date;
  endDateTime?: Date;
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly';
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
    exceptions: Date[];
  };
  availableSlots: Array<{
    date: Date;
    startTime: string;
    endTime: string;
    maxParticipants: number;
    bookedParticipants: number;
    status: 'available' | 'limited' | 'full' | 'cancelled';
  }>;
}

export interface ActivityCapacity {
  min: number;
  max: number;
  optimal?: number;
  waitlistEnabled: boolean;
  waitlistMax?: number;
}

export interface ActivityRequirements {
  ageRestriction?: {
    min?: number;
    max?: number;
    childrenAllowed: boolean;
  };
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  physicalDemand: 'low' | 'moderate' | 'high';
  prerequisites?: Array<{
    ar: string;
    en: string;
  }>;
  whatToBring?: Array<{
    ar: string;
    en: string;
  }>;
  providedEquipment?: Array<{
    ar: string;
    en: string;
  }>;
}

export interface ActivityDuration {
  value: number;
  unit: 'minutes' | 'hours' | 'days';
  isApproximate: boolean;
}

export interface CancellationPolicy {
  type: 'flexible' | 'moderate' | 'strict';
  refundRules: Array<{
    hoursBeforeActivity: number;
    refundPercentage: number;
  }>;
  description: {
    ar: string;
    en: string;
  };
}

export interface ActivityRating {
  average: number;
  count: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ActivityStatistics {
  totalViews: number;
  totalBookings: number;
  totalRevenue: number;
  completionRate?: number;
  repeatBookingRate?: number;
  conversionRate?: number;
}

export interface ActivitySEO {
  metaTitle?: {
    ar: string;
    en: string;
  };
  metaDescription?: {
    ar: string;
    en: string;
  };
  keywords?: string[];
}

export interface SafetyGuidelines {
  covidCompliant: boolean;
  insuranceProvided: boolean;
  certifications: string[];
  safetyMeasures: string[];
}

// Booking Types
export interface Booking {
  _id: string;
  bookingNumber: string;
  user: string;
  activity: string;
  partner: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  participants: BookingParticipants;
  pricing: BookingPricing;
  payment: BookingPayment;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  confirmation: BookingConfirmation;
  cancellation?: BookingCancellation;
  communications: BookingCommunication[];
  userReview?: string;
  partnerReview?: string;
  referralCode?: string;
  referredBy?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface BookingParticipants {
  adults: number;
  children: number;
  total: number;
  details: Array<{
    name: string;
    age: number;
    specialRequirements?: string;
  }>;
}

export interface BookingPricing {
  basePrice: number;
  quantity: number;
  subtotal: number;
  discounts: Array<{
    type: string;
    code: string;
    amount: number;
    percentage: number;
  }>;
  platformFee: number;
  vatAmount: number;
  vatPercentage: number;
  totalDiscount: number;
  totalBeforeVat: number;
  totalAmount: number;
  currency: 'SAR';
}

export interface BookingPayment {
  method: 'credit_card' | 'mada' | 'apple_pay' | 'stc_pay';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  moyasarPaymentId?: string;
  transactionId?: string;
  paidAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  refundReason?: string;
  cardLast4?: string;
  cardBrand?: string;
}

export interface BookingConfirmation {
  code: string;
  sentAt: Date;
  confirmedAt: Date;
  method: 'email' | 'sms' | 'both';
}

export interface BookingCancellation {
  cancelledAt: Date;
  cancelledBy: 'user' | 'partner' | 'system' | 'admin';
  reason: string;
  refundAmount: number;
  refundStatus: 'pending' | 'processing' | 'completed' | 'denied';
}

export interface BookingCommunication {
  type: 'email' | 'sms' | 'notification';
  subject: string;
  content: string;
  sentAt: Date;
  status: 'sent' | 'delivered' | 'failed';
}

// Partner Types
export interface Partner {
  _id: string;
  businessName: {
    ar: string;
    en: string;
  };
  businessType: 'individual' | 'company' | 'organization';
  legal: PartnerLegal;
  contact: PartnerContact;
  owner: PartnerOwner;
  profile: PartnerProfile;
  locations: PartnerLocation[];
  banking: PartnerBanking;
  commission: PartnerCommission;
  rating: PartnerRating;
  statistics: PartnerStatistics;
  verification: PartnerVerification;
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  featured: boolean;
  premium: boolean;
  settings: PartnerSettings;
  teamMembers: PartnerTeamMember[];
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  lastActivityAt?: Date;
}

export interface PartnerLegal {
  commercialRegistration: string;
  taxNumber?: string;
  registrationDate: Date;
  expiryDate: Date;
  licenseDocuments: Array<{
    type: string;
    url: string;
    verifiedAt: Date;
  }>;
}

export interface PartnerContact {
  email: string;
  phone: string;
  whatsapp?: string;
  website?: string;
  socialMedia: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    snapchat?: string;
    tiktok?: string;
  };
}

export interface PartnerOwner {
  user: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  role: string;
}

export interface PartnerProfile {
  logo?: {
    url: string;
    thumbnail: string;
  };
  coverImage?: string;
  description?: {
    ar: string;
    en: string;
  };
  shortDescription?: {
    ar: string;
    en: string;
  };
  highlights?: Array<{
    ar: string;
    en: string;
  }>;
}

export interface PartnerLocation {
  name: {
    ar: string;
    en: string;
  };
  address: {
    ar: string;
    en: string;
  };
  city: string;
  region: string;
  coordinates: {
    type: 'Point';
    coordinates: [number, number];
  };
  isPrimary: boolean;
}

export interface PartnerBanking {
  accountName: string;
  accountNumber: string;
  iban: string;
  bankName: string;
  bankCode: string;
}

export interface PartnerCommission {
  rate: number;
  customRate: boolean;
  paymentTerms: 'immediate' | 'weekly' | 'monthly';
}

export interface PartnerRating {
  average: number;
  count: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface PartnerStatistics {
  totalActivities: number;
  activeActivities: number;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  conversionRate?: number;
  responseTime?: number;
  acceptanceRate?: number;
}

export interface PartnerVerification {
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: Date;
  verifiedBy?: string;
  rejectionReason?: string;
  documentsVerified: boolean;
  identityVerified: boolean;
}

export interface PartnerSettings {
  autoAcceptBookings: boolean;
  bookingLeadTime: number;
  cancellationWindow: number;
  allowWaitlist: boolean;
}

export interface PartnerTeamMember {
  user: string;
  role: 'owner' | 'manager' | 'staff';
  permissions: string[];
  addedAt: Date;
}

// Review Types
export interface Review {
  _id: string;
  user: string;
  activity: string;
  booking: string;
  partner: string;
  ratings: ReviewRatings;
  review: {
    ar?: string;
    en?: string;
  };
  photos?: Array<{
    url: string;
    thumbnail: string;
  }>;
  partnerResponse?: {
    text: {
      ar: string;
      en: string;
    };
    respondedAt: Date;
    respondedBy: string;
  };
  helpful: {
    count: number;
    users: string[];
  };
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderationNotes?: string;
  moderatedBy?: string;
  moderatedAt?: Date;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface ReviewRatings {
  overall: number;
  accuracy?: number;
  communication?: number;
  value?: number;
  location?: number;
  quality?: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Search Types
export interface SearchFilters {
  query?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  date?: Date;
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
  skillLevel?: string;
  rating?: number;
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'popularity';
}

// Notification Types
export interface Notification {
  _id: string;
  user: string;
  type: 'booking_confirmation' | 'payment_confirmation' | 'activity_reminder' | 'cancellation_notice' | 'review_request' | 'promotional_offer' | 'referral_reward';
  title: {
    ar: string;
    en: string;
  };
  message: {
    ar: string;
    en: string;
  };
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}
