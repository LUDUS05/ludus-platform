import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Vendor, Activity, Booking } from '../models/index.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';

dotenv.config();

const sampleUsers = [
  {
    email: 'admin@ludus.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+1-555-0100',
    role: 'admin',
    isVerified: true,
    location: {
      coordinates: [-74.006, 40.7128],
      address: '123 Admin St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    },
    preferences: {
      activityTypes: ['outdoor-adventure', 'cultural-experiences'],
      priceRange: { min: 0, max: 500 },
      maxDistance: 50,
      groupSize: { min: 1, max: 10 }
    }
  },
  {
    email: 'john.doe@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1-555-0101',
    role: 'user',
    isVerified: true,
    location: {
      coordinates: [-74.006, 40.7128],
      address: '456 User Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      country: 'United States'
    },
    preferences: {
      activityTypes: ['outdoor-adventure', 'team-sports'],
      priceRange: { min: 25, max: 200 },
      maxDistance: 30,
      groupSize: { min: 2, max: 8 }
    }
  },
  {
    email: 'jane.smith@example.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+1-555-0102',
    role: 'user',
    isVerified: true,
    location: {
      coordinates: [-74.006, 40.7128],
      address: '789 User Blvd',
      city: 'New York',
      state: 'NY',
      zipCode: '10003',
      country: 'United States'
    },
    preferences: {
      activityTypes: ['wellness-spa', 'cultural-experiences'],
      priceRange: { min: 50, max: 300 },
      maxDistance: 25,
      groupSize: { min: 1, max: 5 }
    }
  }
];

const sampleVendors = [
  {
    name: 'Adventure Outfitters',
    description: 'Premier outdoor adventure company offering hiking, rock climbing, and camping experiences in the New York area.',
    businessType: 'llc',
    category: 'outdoor-adventure',
    contact: {
      email: 'info@adventureoutfitters.com',
      phone: '+1-555-0200',
      website: 'https://adventureoutfitters.com',
      socialMedia: {
        instagram: '@adventureoutfitters',
        facebook: 'adventureoutfitters'
      }
    },
    location: {
      coordinates: [-74.006, 40.7128],
      address: '100 Adventure Way',
      city: 'New York',
      state: 'NY',
      zipCode: '10004',
      country: 'United States'
    },
    businessHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '20:00', closed: false },
      sunday: { open: '08:00', close: '20:00', closed: false }
    },
    images: {
      logo: 'https://example.com/logo1.jpg',
      banner: 'https://example.com/banner1.jpg',
      gallery: ['https://example.com/gallery1.jpg', 'https://example.com/gallery2.jpg']
    },
    foundedYear: 2015,
    employeeCount: 25,
    certifications: ['Wilderness First Aid', 'Rock Climbing Instructor'],
    insurance: {
      hasInsurance: true,
      provider: 'Adventure Insurance Co',
      expiryDate: new Date('2025-12-31')
    },
    isVerified: true,
    verificationStatus: 'verified',
    verifiedAt: new Date(),
    owner: {
      userId: undefined as any, // Will be set after user creation
      name: 'Mike Johnson',
      email: 'mike@adventureoutfitters.com',
      phone: '+1-555-0201'
    }
  },
  {
    name: 'Urban Wellness Spa',
    description: 'Luxury wellness spa offering massage therapy, yoga classes, and meditation sessions in the heart of Manhattan.',
    businessType: 'corporation',
    category: 'wellness-spa',
    contact: {
      email: 'info@urbanwellnessspa.com',
      phone: '+1-555-0300',
      website: 'https://urbanwellnessspa.com',
      socialMedia: {
        instagram: '@urbanwellnessspa',
        facebook: 'urbanwellnessspa'
      }
    },
    location: {
      coordinates: [-74.006, 40.7128],
      address: '200 Wellness Plaza',
      city: 'New York',
      state: 'NY',
      zipCode: '10005',
      country: 'United States'
    },
    businessHours: {
      monday: { open: '08:00', close: '20:00', closed: false },
      tuesday: { open: '08:00', close: '20:00', closed: false },
      wednesday: { open: '08:00', close: '20:00', closed: false },
      thursday: { open: '08:00', close: '20:00', closed: false },
      friday: { open: '08:00', close: '20:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: false }
    },
    images: {
      logo: 'https://example.com/logo2.jpg',
      banner: 'https://example.com/banner2.jpg',
      gallery: ['https://example.com/gallery3.jpg', 'https://example.com/gallery4.jpg']
    },
    foundedYear: 2018,
    employeeCount: 15,
    certifications: ['Licensed Massage Therapist', 'Yoga Alliance Certified'],
    insurance: {
      hasInsurance: true,
      provider: 'Wellness Insurance Co',
      expiryDate: new Date('2025-06-30')
    },
    isVerified: true,
    verificationStatus: 'verified',
    verifiedAt: new Date(),
    owner: {
      userId: undefined as any, // Will be set after user creation
      name: 'Sarah Williams',
      email: 'sarah@urbanwellnessspa.com',
      phone: '+1-555-0301'
    }
  }
];

const sampleActivities = [
  {
    title: 'Hiking Adventure in Central Park',
    description: 'Explore the beautiful trails of Central Park with our experienced guides. Learn about the park\'s history while enjoying nature.',
    shortDescription: 'Guided hiking tour through Central Park with expert guides.',
    category: 'outdoor-adventure',
    tags: ['hiking', 'nature', 'guided-tour', 'central-park'],
    vendor: {
      vendorId: undefined as any, // Will be set after vendor creation
      name: 'Adventure Outfitters',
      verified: true
    },
    pricing: {
      basePrice: 45,
      currency: 'USD',
      priceType: 'per-person',
      discounts: [
        { groupSize: 4, discountPercentage: 15 },
        { groupSize: 8, discountPercentage: 25 }
      ]
    },
    duration: {
      minDuration: 120,
      setupTime: 15,
      cleanupTime: 15
    },
    location: {
      type: 'on-site',
      coordinates: [-73.9654, 40.7829],
      address: 'Central Park',
      city: 'New York',
      state: 'NY',
      zipCode: '10024',
      country: 'United States'
    },
    capacity: {
      minParticipants: 2,
      maxParticipants: 12,
      minAge: 8,
      skillLevel: 'beginner',
      physicalRequirements: ['Moderate walking ability'],
      equipmentProvided: true,
      equipmentRequired: ['Comfortable walking shoes', 'Water bottle']
    },
    images: {
      featured: 'https://example.com/hiking-featured.jpg',
      gallery: ['https://example.com/hiking1.jpg', 'https://example.com/hiking2.jpg']
    },
    availability: {
      isActive: true,
      availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      availableTimes: { startTime: '09:00', endTime: '17:00' },
      advanceBookingDays: 7,
      lastMinuteBooking: true,
      cancellationPolicy: 'moderate',
      cancellationHours: 24
    },
    highlights: ['Expert guides', 'Small group sizes', 'Historical insights', 'Beautiful scenery'],
    included: ['Professional guide', 'Safety equipment', 'Park maps', 'Snacks'],
    notIncluded: ['Transportation to park', 'Personal items', 'Gratuities'],
    whatToBring: ['Comfortable shoes', 'Weather-appropriate clothing', 'Water bottle', 'Camera'],
    weatherDependent: true,
    indoorOutdoor: 'outdoor',
    status: 'active',
    isFeatured: true,
    stats: {
      viewCount: 150,
      bookingCount: 45,
      averageRating: 4.8,
      reviewCount: 38,
      favoriteCount: 67
    }
  },
  {
    title: 'Relaxing Swedish Massage',
    description: 'Experience ultimate relaxation with our signature Swedish massage. Perfect for stress relief and muscle tension.',
    shortDescription: 'Professional Swedish massage for ultimate relaxation and stress relief.',
    category: 'wellness-spa',
    tags: ['massage', 'relaxation', 'stress-relief', 'swedish'],
    vendor: {
      vendorId: undefined as any, // Will be set after vendor creation
      name: 'Urban Wellness Spa',
      verified: true
    },
    pricing: {
      basePrice: 120,
      currency: 'USD',
      priceType: 'per-person'
    },
    duration: {
      minDuration: 60,
      setupTime: 10,
      cleanupTime: 10
    },
    location: {
      type: 'on-site',
      coordinates: [-74.006, 40.7128],
      address: '200 Wellness Plaza',
      city: 'New York',
      state: 'NY',
      zipCode: '10005',
      country: 'United States'
    },
    capacity: {
      minParticipants: 1,
      maxParticipants: 1,
      minAge: 18,
      skillLevel: 'all-levels',
      physicalRequirements: [],
      equipmentProvided: true,
      equipmentRequired: []
    },
    images: {
      featured: 'https://example.com/massage-featured.jpg',
      gallery: ['https://example.com/massage1.jpg', 'https://example.com/massage2.jpg']
    },
    availability: {
      isActive: true,
      availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      availableTimes: { startTime: '08:00', endTime: '20:00' },
      advanceBookingDays: 14,
      lastMinuteBooking: false,
      cancellationPolicy: 'moderate',
      cancellationHours: 48
    },
    highlights: ['Licensed therapists', 'Premium massage oils', 'Private rooms', 'Relaxing atmosphere'],
    included: ['Professional massage', 'Clean linens', 'Relaxing music', 'Tea service'],
    notIncluded: ['Gratuities', 'Additional services', 'Products'],
    whatToBring: ['Comfortable clothing', 'Open mind'],
    weatherDependent: false,
    indoorOutdoor: 'indoor',
    status: 'active',
    isFeatured: true,
    stats: {
      viewCount: 200,
      bookingCount: 78,
      averageRating: 4.9,
      reviewCount: 65,
      favoriteCount: 89
    }
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDatabase();
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Vendor.deleteMany({});
    await Activity.deleteMany({});
    await Booking.deleteMany({});
    
    // Create users
    console.log('👥 Creating sample users...');
    const createdUsers = await User.create(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} users`);
    
    // Update vendor owner IDs
    sampleVendors[0].owner.userId = createdUsers[0]._id as mongoose.Types.ObjectId; // Admin user
    sampleVendors[1].owner.userId = createdUsers[0]._id as mongoose.Types.ObjectId; // Admin user
    
    // Create vendors
    console.log('🏢 Creating sample vendors...');
    const createdVendors = await Vendor.create(sampleVendors);
    console.log(`✅ Created ${createdVendors.length} vendors`);
    
    // Update activity vendor IDs
    sampleActivities[0].vendor.vendorId = createdVendors[0]._id as mongoose.Types.ObjectId;
    sampleActivities[1].vendor.vendorId = createdVendors[1]._id as mongoose.Types.ObjectId;
    
    // Create activities
    console.log('🎯 Creating sample activities...');
    const createdActivities = await Activity.create(sampleActivities);
    console.log(`✅ Created ${createdActivities.length} activities`);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Sample Data Summary:');
    console.log(`- Users: ${createdUsers.length}`);
    console.log(`- Vendors: ${createdVendors.length}`);
    console.log(`- Activities: ${createdActivities.length}`);
    
    // Display sample data
    console.log('\n👤 Sample Users:');
    createdUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    
    console.log('\n🏢 Sample Vendors:');
    createdVendors.forEach(vendor => {
      console.log(`  - ${vendor.name} (${vendor.category})`);
    });
    
    console.log('\n🎯 Sample Activities:');
    createdActivities.forEach(activity => {
      console.log(`  - ${activity.title} (${activity.category}) - $${activity.pricing.basePrice}`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
