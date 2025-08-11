import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  // References
  user: {
    userId: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
  };
  
  activity: {
    activityId: mongoose.Types.ObjectId;
    title: string;
    vendorName: string;
    basePrice: number;
    currency: string;
    priceType: string;
  };
  
  vendor: {
    vendorId: mongoose.Types.ObjectId;
    name: string;
    contactEmail: string;
    contactPhone: string;
  };
  
  // Booking Details
  bookingDate: Date;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  duration: number;  // in minutes
  
  // Participants
  participants: {
    adults: number;
    children?: number;
    seniors?: number;
    total: number;
  };
  
  // Special Requirements
  specialRequirements?: string;
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string[];
  
  // Pricing and Payment
  pricing: {
    basePrice: number;
    participantCount: number;
    subtotal: number;
    taxes: number;
    fees: number;
    discounts: {
      type: string;
      amount: number;
      description: string;
    }[];
    total: number;
    currency: string;
  };
  
  payment: {
    status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
    method?: 'stripe' | 'paypal' | 'bank_transfer' | 'cash';
    transactionId?: string;
    paidAt?: Date;
    refundedAt?: Date;
    refundAmount?: number;
    refundReason?: string;
  };
  
  // Booking Status
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  confirmationCode: string;
  
  // Cancellation
  cancellation?: {
    requestedAt: Date;
    requestedBy: 'user' | 'vendor' | 'admin';
    reason: string;
    refundAmount: number;
    refundStatus: 'pending' | 'processed' | 'failed';
    processedAt?: Date;
  };
  
  // Communication
  messages: {
    sender: 'user' | 'vendor' | 'system';
    message: string;
    timestamp: Date;
    read: boolean;
  }[];
  
  // Reviews and Ratings
  review?: {
    rating: number;
    comment: string;
    createdAt: Date;
    isPublic: boolean;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  
  // Methods
  toJSON(): any;
}

const bookingSchema = new Schema<IBooking>({
  user: {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  activity: {
    activityId: {
      type: Schema.Types.ObjectId,
      ref: 'Activity',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    vendorName: {
      type: String,
      required: true,
      trim: true
    },
    basePrice: {
      type: Number,
      required: true,
      min: [0, 'Base price cannot be negative']
    },
    currency: {
      type: String,
      required: true,
      default: 'USD'
    },
    priceType: {
      type: String,
      required: true
    }
  },
  vendor: {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true
    }
  },
  bookingDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(value: Date) {
        return value > new Date();
      },
      message: 'Booking date must be in the future'
    }
  },
  startTime: {
    type: String,
    required: true,
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
  },
  endTime: {
    type: String,
    required: true,
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
  },
  duration: {
    type: Number,
    required: true,
    min: [15, 'Duration must be at least 15 minutes']
  },
  participants: {
    adults: {
      type: Number,
      required: true,
      min: [1, 'Must have at least 1 adult participant']
    },
    children: {
      type: Number,
      min: [0, 'Children count cannot be negative']
    },
    seniors: {
      type: Number,
      min: [0, 'Seniors count cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [1, 'Total participants must be at least 1']
    }
  },
  specialRequirements: {
    type: String,
    trim: true,
    maxlength: [500, 'Special requirements cannot exceed 500 characters']
  },
  dietaryRestrictions: [{
    type: String,
    trim: true,
    enum: [
      'none',
      'vegetarian',
      'vegan',
      'gluten-free',
      'dairy-free',
      'nut-free',
      'halal',
      'kosher',
      'other'
    ]
  }],
  accessibilityNeeds: [{
    type: String,
    trim: true,
    enum: [
      'wheelchair-access',
      'hearing-assistance',
      'visual-assistance',
      'mobility-support',
      'other'
    ]
  }],
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: [0, 'Base price cannot be negative']
    },
    participantCount: {
      type: Number,
      required: true,
      min: [1, 'Participant count must be at least 1']
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    taxes: {
      type: Number,
      required: true,
      min: [0, 'Taxes cannot be negative']
    },
    fees: {
      type: Number,
      required: true,
      min: [0, 'Fees cannot be negative']
    },
    discounts: [{
      type: {
        type: String,
        required: true,
        enum: ['group', 'seasonal', 'promo', 'loyalty', 'other']
      },
      amount: {
        type: Number,
        required: true,
        min: [0, 'Discount amount cannot be negative']
      },
      description: {
        type: String,
        required: true,
        trim: true
      }
    }],
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    },
    currency: {
      type: String,
      required: true,
      default: 'USD'
    }
  },
  payment: {
    status: {
      type: String,
      required: true,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['stripe', 'paypal', 'bank_transfer', 'cash']
    },
    transactionId: {
      type: String,
      trim: true
    },
    paidAt: {
      type: Date
    },
    refundedAt: {
      type: Date
    },
    refundAmount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative']
    },
    refundReason: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending'
  },
  confirmationCode: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'BK' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  },
  cancellation: {
    requestedAt: {
      type: Date
    },
    requestedBy: {
      type: String,
      enum: ['user', 'vendor', 'admin']
    },
    reason: {
      type: String,
      trim: true
    },
    refundAmount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative']
    },
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending'
    },
    processedAt: {
      type: Date
    }
  },
  messages: [{
    sender: {
      type: String,
      required: true,
      enum: ['user', 'vendor', 'system']
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }],
  review: {
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Review comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  confirmedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for booking summary
bookingSchema.virtual('bookingSummary').get(function(this: any) {
  return `${this.activity.title} - ${this.bookingDate.toLocaleDateString()} at ${this.startTime}`;
});

// Virtual for total discount
bookingSchema.virtual('totalDiscount').get(function(this: any) {
  return this.pricing.discounts.reduce((total: number, discount: any) => total + discount.amount, 0);
});

// Virtual for isUpcoming
bookingSchema.virtual('isUpcoming').get(function(this: any) {
  const now = new Date();
  const bookingDateTime = new Date(this.bookingDate);
  bookingDateTime.setHours(parseInt(this.startTime.split(':')[0]), parseInt(this.startTime.split(':')[1]));
  return bookingDateTime > now && this.status === 'confirmed';
});

// Virtual for isPast
bookingSchema.virtual('isPast').get(function(this: any) {
  const now = new Date();
  const bookingDateTime = new Date(this.bookingDate);
  bookingDateTime.setHours(parseInt(this.endTime.split(':')[0]), parseInt(this.endTime.split(':')[1]));
  return bookingDateTime < now;
});

// Virtual for canCancel
bookingSchema.virtual('canCancel').get(function(this: any) {
  if (this.status !== 'confirmed' && this.status !== 'pending') return false;
  
  const now = new Date();
  const bookingDateTime = new Date(this.bookingDate);
  const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // Can cancel if more than 24 hours before booking
  return hoursUntilBooking > 24;
});

// Indexes
bookingSchema.index({ 'user.userId': 1 });
bookingSchema.index({ 'activity.activityId': 1 });
bookingSchema.index({ 'vendor.vendorId': 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ confirmationCode: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ 'payment.paidAt': -1 });

// Compound indexes for common queries
bookingSchema.index({ 'user.userId': 1, status: 1 });
bookingSchema.index({ 'vendor.vendorId': 1, status: 1 });
bookingSchema.index({ bookingDate: 1, status: 1 });

// Method to return booking without sensitive data
bookingSchema.methods.toJSON = function() {
  const booking = this.toObject();
  // Remove sensitive payment information for non-admin users
  if (this.payment.transactionId) {
    delete booking.payment.transactionId;
  }
  return booking;
};

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
