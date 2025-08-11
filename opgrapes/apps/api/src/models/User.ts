import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  profilePicture?: string;
  
  // Location and preferences
  location: {
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  preferences: {
    activityTypes: string[];
    priceRange: {
      min: number;
      max: number;
    };
    maxDistance: number; // in miles
    groupSize: {
      min: number;
      max: number;
    };
  };
  
  // User status and verification
  isVerified: boolean;
  isActive: boolean;
  role: 'user' | 'admin' | 'vendor';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): any;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Password must be at least 8 characters long']
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(value: Date) {
        return value < new Date();
      },
      message: 'Date of birth must be in the past'
    }
  },
  profilePicture: {
    type: String,
    trim: true
  },
  location: {
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(value: number[]) {
          return value.length === 2 && 
                 value[0] >= -180 && value[0] <= 180 && // longitude
                 value[1] >= -90 && value[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates'
      }
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'United States'
    }
  },
  preferences: {
    activityTypes: [{
      type: String,
      enum: [
        'outdoor-adventure',
        'indoor-activities',
        'water-sports',
        'team-sports',
        'cultural-experiences',
        'food-tours',
        'wellness-spa',
        'entertainment',
        'educational',
        'fitness'
      ]
    }],
    priceRange: {
      min: {
        type: Number,
        min: 0,
        default: 0
      },
      max: {
        type: Number,
        min: 0,
        default: 1000
      }
    },
    maxDistance: {
      type: Number,
      min: 1,
      max: 100,
      default: 25
    },
    groupSize: {
      min: {
        type: Number,
        min: 1,
        default: 1
      },
      max: {
        type: Number,
        min: 1,
        max: 50,
        default: 10
      }
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'vendor'],
    default: 'user'
  },
  lastLoginAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function(this: any) {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for profile completion percentage
userSchema.virtual('profileCompletion').get(function(this: any) {
  const fields = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'profilePicture', 'preferences.activityTypes'];
  const completedFields = fields.filter(field => {
    const value = field.includes('.') ? 
      field.split('.').reduce((obj: any, key: string) => obj?.[key], this) : 
      this[field];
    return value && (Array.isArray(value) ? value.length > 0 : true);
  }).length;
  
  return Math.round((completedFields / fields.length) * 100);
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '12'));
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to return user without sensitive data
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

export const User = mongoose.model<IUser>('User', userSchema);
