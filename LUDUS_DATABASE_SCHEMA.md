# LUDUS Platform - Database Schema (V2.0.0)
## Comprehensive MongoDB Database Design & Implementation

**Created:** 2025-10-08
**Version:** 2.0.0
**Status:** ACTIVE - Reflects Production Blueprint
**Database:** MongoDB Atlas (Cloud)  
**ODM:** Mongoose (Node.js)  

---

## 🗄️ DATABASE OVERVIEW

This document provides the definitive database schema for the LUDUS platform, based on the "LUDUS Platform - Comprehensive Blueprint V2.0.0". It outlines the structure for all major data models, including indexing strategies and data relationships.

### **Database Design Principles**
- **Arabic-First**: Schemas are designed to support bilingual content (Arabic/English) seamlessly.
- **Scalability**: Built for high performance and horizontal scaling.
- **Data Integrity**: Enforced through Mongoose validation and clear schemas.
- **Comprehensiveness**: Models reflect the full feature set, including advanced pricing, referrals, and ratings.

---

## 👤 User Data Model

```javascript
{
  _id: ObjectId,

  // Authentication
  firebaseUid: String (unique, required),
  email: String (unique, required, lowercase),
  emailVerified: Boolean (default: false),
  phoneNumber: String (unique),
  phoneVerified: Boolean (default: false),

  // Profile
  profile: {
    firstName: String (required),
    lastName: String (required),
    displayName: String,
    avatar: {
      url: String,
      thumbnail: String
    },
    bio: { ar: String, en: String },
    dateOfBirth: Date,
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say',
    nationality: String
  },

  // Preferences
  preferences: {
    language: 'ar' | 'en' (default: 'ar'),
    currency: 'SAR',
    notifications: {
      email: Boolean (default: true),
      sms: Boolean (default: false),
      push: Boolean (default: true),
      marketing: Boolean (default: false)
    },
    interests: [String], // Activity categories
    location: {
      city: String,
      region: String
    }
  },

  // Wallet & Credits
  wallet: {
    balance: Number (default: 0),
    currency: 'SAR',
    transactions: [{
      type: 'credit' | 'debit',
      amount: Number,
      reason: String,
      reference: ObjectId,
      balanceAfter: Number,
      createdAt: Date
    }]
  },

  // Referral
  referral: {
    code: String (unique),
    referredBy: ObjectId (ref: 'User'),
    totalReferrals: Number (default: 0),
    totalRewardsEarned: Number (default: 0)
  },

  // Statistics
  stats: {
    totalBookings: Number (default: 0),
    completedBookings: Number (default: 0),
    cancelledBookings: Number (default: 0),
    totalSpent: Number (default: 0),
    reviewsGiven: Number (default: 0),
    averageRating: Number
  },

  // Saved & Favorites
  savedActivities: [ObjectId] (ref: 'Activity'),
  favoritePartners: [ObjectId] (ref: 'Partner'),

  // Status
  status: 'active' | 'suspended' | 'deleted',
  role: 'user' | 'partner' | 'admin',

  // Security
  lastLogin: Date,
  lastPasswordChange: Date,
  twoFactorEnabled: Boolean (default: false),

  // Metadata
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
}
```

---

## 🏢 Partner/Vendor Data Model

```javascript
{
  _id: ObjectId,

  // Business Information
  businessName: {
    ar: String (required),
    en: String (required)
  },
  businessType: 'individual' | 'company' | 'organization',

  // Legal Information
  legal: {
    commercialRegistration: String (required),
    taxNumber: String,
    registrationDate: Date,
    expiryDate: Date,
    licenseDocuments: [{
      type: String,
      url: String,
      verifiedAt: Date
    }]
  },

  // Contact Information
  contact: {
    email: String (required),
    phone: String (required),
    whatsapp: String,
    website: String,
    socialMedia: {
      instagram: String,
      twitter: String,
      facebook: String,
      snapchat: String,
      tiktok: String
    }
  },

  // Owner/Representative
  owner: {
    user: ObjectId (ref: 'User', required),
    firstName: String,
    lastName: String,
    nationalId: String,
    role: String
  },

  // Profile
  profile: {
    logo: {
      url: String,
      thumbnail: String
    },
    coverImage: String,
    description: {
      ar: String,
      en: String
    },
    shortDescription: {
      ar: String,
      en: String
    },
    highlights: [{
      ar: String,
      en: String
    }]
  },

  // Location
  locations: [{
    name: { ar: String, en: String },
    address: { ar: String, en: String },
    city: String,
    region: String,
    coordinates: {
      type: 'Point',
      coordinates: [Number, Number]
    },
    isPrimary: Boolean
  }],

  // Banking
  banking: {
    accountName: String,
    accountNumber: String,
    iban: String,
    bankName: String,
    bankCode: String
  },

  // Commission & Fees
  commission: {
    rate: Number (default: 15), // Platform commission %
    customRate: Boolean,
    paymentTerms: 'immediate' | 'weekly' | 'monthly'
  },

  // Rating & Reviews
  rating: {
    average: Number (default: 0),
    count: Number (default: 0),
    distribution: {
      5: Number,
      4: Number,
      3: Number,
      2: Number,
      1: Number
    }
  },

  // Statistics
  stats: {
    totalActivities: Number (default: 0),
    activeActivities: Number (default: 0),
    totalBookings: Number (default: 0),
    completedBookings: Number (default: 0),
    totalRevenue: Number (default: 0),
    conversionRate: Number,
    responseTime: Number, // in minutes
    acceptanceRate: Number
  },

  // Verification
  verification: {
    status: 'pending' | 'verified' | 'rejected',
    verifiedAt: Date,
    verifiedBy: ObjectId (ref: 'Admin'),
    rejectionReason: String,
    documentsVerified: Boolean,
    identityVerified: Boolean
  },

  // Status
  status: 'pending' | 'active' | 'suspended' | 'inactive',
  featured: Boolean (default: false),
  premium: Boolean (default: false),

  // Settings
  settings: {
    autoAcceptBookings: Boolean (default: false),
    bookingLeadTime: Number, // hours before activity
    cancellationWindow: Number, // hours before activity
    allowWaitlist: Boolean (default: true)
  },

  // Team members
  teamMembers: [{
    user: ObjectId (ref: 'User'),
    role: 'owner' | 'manager' | 'staff',
    permissions: [String],
    addedAt: Date
  }],

  // Metadata
  createdAt: Date,
  updatedAt: Date,
  approvedAt: Date,
  lastActivityAt: Date
}
```

---

## 🎯 Activity Data Model

```javascript
{
  _id: ObjectId,

  // Basic Information
  title: {
    ar: String (required),
    en: String (required)
  },
  slug: {
    ar: String (unique, indexed),
    en: String (unique, indexed)
  },
  description: {
    ar: String (required),
    en: String (required)
  },
  shortDescription: {
    ar: String (max: 200),
    en: String (max: 200)
  },

  // Partner/Vendor
  partner: ObjectId (ref: 'Partner', required),

  // Categorization
  category: ObjectId (ref: 'Category', required),
  subCategories: [ObjectId] (ref: 'SubCategory'),
  tags: [{
    ar: String,
    en: String
  }],

  // Pricing
  pricing: {
    type: 'fixed' | 'per_person' | 'per_group' | 'tiered',
    basePrice: Number (required),
    currency: 'SAR' (default),

    // For tiered pricing
    tiers: [{
      minParticipants: Number,
      maxParticipants: Number,
      pricePerPerson: Number
    }],

    // Discounts
    discounts: [{
      type: 'early_bird' | 'group' | 'seasonal' | 'promotional',
      value: Number,
      valueType: 'percentage' | 'fixed',
      conditions: {
        minParticipants: Number,
        daysBeforeActivity: Number,
        validFrom: Date,
        validUntil: Date
      }
    }]
  },

  // Media
  media: {
    coverImage: {
      url: String (required),
      thumbnail: String,
      alt: { ar: String, en: String }
    },
    gallery: [{
      url: String,
      thumbnail: String,
      alt: { ar: String, en: String },
      order: Number
    }],
    video: {
      url: String,
      thumbnail: String,
      provider: 'youtube' | 'vimeo' | 'custom'
    }
  },

  // Location
  location: {
    type: 'physical' | 'online' | 'hybrid',

    // For physical locations
    address: {
      ar: String,
      en: String
    },
    city: String (required),
    region: String,
    coordinates: {
      type: 'Point',
      coordinates: [Number, Number] // [longitude, latitude]
    },

    // For online activities
    platform: String,
    accessLink: String,
    accessInstructions: {
      ar: String,
      en: String
    }
  },

  // Scheduling
  schedule: {
    type: 'one_time' | 'recurring' | 'flexible',

    // For one-time activities
    startDateTime: Date,
    endDateTime: Date,

    // For recurring activities
    recurrence: {
      pattern: 'daily' | 'weekly' | 'monthly',
      daysOfWeek: [Number], // 0-6 (Sunday-Saturday)
      startTime: String,
      endTime: String,
      exceptions: [Date] // Blackout dates
    },

    // Availability
    availableSlots: [{
      date: Date,
      startTime: String,
      endTime: String,
      maxParticipants: Number,
      bookedParticipants: Number,
      status: 'available' | 'limited' | 'full' | 'cancelled'
    }]
  },

  // Capacity
  capacity: {
    min: Number (required),
    max: Number (required),
    optimal: Number,
    waitlistEnabled: Boolean (default: false),
    waitlistMax: Number
  },

  // Requirements
  requirements: {
    ageRestriction: {
      min: Number,
      max: Number,
      childrenAllowed: Boolean (default: true)
    },
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'all_levels',
    physicalDemand: 'low' | 'moderate' | 'high',
    prerequisites: [{
      ar: String,
      en: String
    }],
    whatToBring: [{
      ar: String,
      en: String
    }],
    providedEquipment: [{
      ar: String,
      en: String
    }]
  },

  // Duration
  duration: {
    value: Number (required),
    unit: 'minutes' | 'hours' | 'days',
    isApproximate: Boolean (default: false)
  },

  // Cancellation Policy
  cancellationPolicy: {
    type: 'flexible' | 'moderate' | 'strict',
    refundRules: [{
      hoursBeforeActivity: Number,
      refundPercentage: Number
    }],
    description: {
      ar: String,
      en: String
    }
  },

  // Rating & Reviews
  rating: {
    average: Number (default: 0),
    count: Number (default: 0),
    distribution: {
      5: Number,
      4: Number,
      3: Number,
      2: Number,
      1: Number
    }
  },

  // Statistics
  statistics: {
    totalViews: Number (default: 0),
    totalBookings: Number (default: 0),
    totalRevenue: Number (default: 0),
    completionRate: Number,
    repeatBookingRate: Number,
    conversionRate: Number
  },

  // SEO
  seo: {
    metaTitle: { ar: String, en: String },
    metaDescription: { ar: String, en: String },
    keywords: [String]
  },

  // Status
  status: 'draft' | 'pending_review' | 'active' | 'inactive' | 'suspended',
  visibility: 'public' | 'unlisted' | 'private',
  featured: Boolean (default: false),
  promoted: Boolean (default: false),

  // Safety & Compliance
  safetyGuidelines: {
    covidCompliant: Boolean,
    insuranceProvided: Boolean,
    certifications: [String],
    safetyMeasures: [String]
  },

  // Metadata
  createdAt: Date,
  updatedAt: Date,
  publishedAt: Date,
  lastBookingAt: Date
}
```

---

## 📅 Booking Data Model

```javascript
{
  _id: ObjectId,
  bookingNumber: String (unique, "LDS-XXXX-XXXX"),

  // Parties
  user: ObjectId (ref: 'User', required),
  activity: ObjectId (ref: 'Activity', required),
  partner: ObjectId (ref: 'Partner', required),

  // Booking Details
  bookingDate: Date (required),
  startTime: String,
  endTime: String,

  // Participants
  participants: {
    adults: Number (required),
    children: Number (default: 0),
    total: Number,
    details: [{
      name: String,
      age: Number,
      specialRequirements: String
    }]
  },

  // Pricing
  pricing: {
    basePrice: Number,
    quantity: Number,
    subtotal: Number,

    // Discounts applied
    discounts: [{
      type: String,
      code: String,
      amount: Number,
      percentage: Number
    }],

    // Fees
    platformFee: Number,
    vatAmount: Number,
    vatPercentage: Number (default: 15),

    // Final amounts
    totalDiscount: Number,
    totalBeforeVat: Number,
    totalAmount: Number,

    currency: 'SAR'
  },

  // Payment
  payment: {
    method: 'credit_card' | 'mada' | 'apple_pay' | 'stc_pay',
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded',

    // Moyasar integration
    moyasarPaymentId: String,
    transactionId: String,

    // Payment timeline
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number,
    refundReason: String,

    // Card details (last 4 digits only)
    cardLast4: String,
    cardBrand: String
  },

  // Status tracking
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show',

  // Confirmation
  confirmation: {
    code: String (unique),
    sentAt: Date,
    confirmedAt: Date,
    method: 'email' | 'sms' | 'both'
  },

  // Cancellation
  cancellation: {
    cancelledAt: Date,
    cancelledBy: 'user' | 'partner' | 'system' | 'admin',
    reason: String,
    refundAmount: Number,
    refundStatus: 'pending' | 'processing' | 'completed' | 'denied'
  },

  // Communication
  communications: [{
    type: 'email' | 'sms' | 'notification',
    subject: String,
    content: String,
    sentAt: Date,
    status: 'sent' | 'delivered' | 'failed'
  }],

  // Reviews
  userReview: ObjectId (ref: 'Review'),
  partnerReview: ObjectId (ref: 'Review'),

  // Referral tracking
  referralCode: String,
  referredBy: ObjectId (ref: 'User'),

  // Metadata
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date
}
```

---

## ⭐ Review Data Model

```javascript
{
  _id: ObjectId,

  // References
  user: ObjectId (ref: 'User', required),
  activity: ObjectId (ref: 'Activity', required),
  booking: ObjectId (ref: 'Booking', required),
  partner: ObjectId (ref: 'Partner', required),

  // Rating breakdown
  ratings: {
    overall: Number (1-5, required),
    accuracy: Number (1-5),
    communication: Number (1-5),
    value: Number (1-5),
    location: Number (1-5),
    quality: Number (1-5)
  },

  // Review content
  review: {
    ar: String,
    en: String
  },

  // Media
  photos: [{
    url: String,
    thumbnail: String
  }],

  // Response from partner
  partnerResponse: {
    text: { ar: String, en: String },
    respondedAt: Date,
    respondedBy: ObjectId (ref: 'User')
  },

  // Helpful votes
  helpful: {
    count: Number (default: 0),
    users: [ObjectId] (ref: 'User')
  },

  // Moderation
  status: 'pending' | 'approved' | 'rejected' | 'flagged',
  moderationNotes: String,
  moderatedBy: ObjectId (ref: 'Admin'),
  moderatedAt: Date,

  // Verification
  verified: Boolean (default: true), // Verified booking

  // Metadata
  createdAt: Date,
  updatedAt: Date,
  publishedAt: Date
}
```

---

## 🎁 Referral Program Data Model

```javascript
{
  _id: ObjectId,

  // User who refers
  referrer: ObjectId (ref: 'User', required),
  referralCode: String (unique, indexed),

  // Referral rewards
  rewards: {
    referrer: {
      type: 'percentage' | 'fixed' | 'credits',
      value: Number,
      maxRewardPerReferral: Number,
      description: { ar: String, en: String }
    },
    referee: {
      type: 'percentage' | 'fixed' | 'credits',
      value: Number,
      description: { ar: String, en: String }
    }
  },

  // Usage tracking
  stats: {
    totalReferrals: Number (default: 0),
    successfulReferrals: Number (default: 0),
    totalRewardsEarned: Number (default: 0),
    pendingRewards: Number (default: 0)
  },

  // Individual referrals
  referrals: [{
    referee: ObjectId (ref: 'User'),
    referredAt: Date,
    firstBooking: ObjectId (ref: 'Booking'),
    status: 'pending' | 'qualified' | 'rewarded' | 'expired',
    rewardAmount: Number,
    rewardedAt: Date
  }],
  
  // Settings
  active: Boolean (default: true),
  expiresAt: Date,
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}
```
