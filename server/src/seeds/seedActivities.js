const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

const activitiesData = [
  // Fitness Activities
  {
    vendorName: 'Riyadh Fitness Studio',
    activities: [
      {
        title: 'Personal Training Session',
        shortDescription: 'One-on-one fitness training with certified personal trainer. Customized workout plan based on your fitness goals and current level.',
        description: 'Transform your fitness journey with personalized training sessions designed specifically for you. Our certified trainers work with you to create a customized workout plan that aligns with your goals, whether it\'s weight loss, muscle building, or general fitness improvement. Each session includes fitness assessment, proper form instruction, and progress tracking. Perfect for beginners and experienced fitness enthusiasts alike.',
        category: 'fitness',
        subcategory: 'Personal Training',
        tags: ['personal trainer', 'fitness', 'one-on-one', 'customized workout'],
        pricing: {
          basePrice: 150,
          currency: 'SAR',
          priceType: 'per_person'
        },
        duration: { hours: 1, minutes: 0 },
        capacity: { min: 1, max: 1 },
        difficulty: 'all_levels',
        ageRequirements: { min: 16, max: 65 },
        requirements: {
          equipment: [],
          clothing: ['Athletic wear', 'Sports shoes'],
          whatToBring: ['Water bottle', 'Towel'],
          whatIsProvided: ['Equipment', 'Fitness assessment', 'Workout plan']
        }
      },
      {
        title: 'Group Fitness Class',
        shortDescription: 'High-energy group fitness class combining cardio, strength training, and flexibility exercises. Suitable for all fitness levels.',
        description: 'Join our energizing group fitness classes that combine the best of cardio, strength training, and flexibility work. Led by experienced instructors, these classes create a motivating environment where you can push your limits while having fun. Each class is designed to be scalable for different fitness levels, ensuring everyone gets a great workout regardless of their starting point.',
        category: 'fitness',
        subcategory: 'Group Classes',
        tags: ['group fitness', 'cardio', 'strength training', 'beginner friendly'],
        pricing: {
          basePrice: 75,
          currency: 'SAR',
          priceType: 'per_person'
        },
        duration: { hours: 1, minutes: 0 },
        capacity: { min: 5, max: 20 },
        difficulty: 'all_levels',
        ageRequirements: { min: 16, max: 70 }
      }
    ]
  },
  // Arts Activities
  {
    vendorName: 'Saudi Traditional Arts Center',
    activities: [
      {
        title: 'Arabic Calligraphy Workshop',
        shortDescription: 'Learn the beautiful art of Arabic calligraphy with traditional tools and techniques. Perfect for beginners wanting to explore this timeless art form.',
        description: 'Discover the elegance and spiritual depth of Arabic calligraphy in this hands-on workshop. Using traditional qalam (reed pens) and natural inks, you\'ll learn the fundamental strokes and letter formations of classical Arabic scripts. Our master calligrapher will guide you through the history, cultural significance, and proper techniques of this revered art form. By the end of the session, you\'ll create your own beautiful calligraphic piece to take home.',
        category: 'arts',
        subcategory: 'Calligraphy',
        tags: ['arabic calligraphy', 'traditional art', 'cultural heritage', 'handwriting'],
        pricing: {
          basePrice: 200,
          currency: 'SAR',
          priceType: 'per_person'
        },
        duration: { hours: 2, minutes: 30 },
        capacity: { min: 3, max: 12 },
        difficulty: 'beginner',
        ageRequirements: { min: 12, max: 80 },
        requirements: {
          whatIsProvided: ['Traditional qalam pens', 'Natural inks', 'Practice paper', 'Final artwork paper']
        }
      },
      {
        title: 'Traditional Pottery Making',
        shortDescription: 'Create beautiful pottery using traditional Saudi techniques. Learn wheel throwing, shaping, and glazing in this comprehensive workshop.',
        description: 'Immerse yourself in the ancient art of pottery making using techniques passed down through generations of Saudi artisans. This comprehensive workshop covers everything from preparing clay to wheel throwing, shaping, and glazing. You\'ll learn about the historical significance of pottery in Saudi culture while creating your own unique pieces. Each participant will make 2-3 pottery items that will be fired and glazed for pickup within a week.',
        category: 'arts',
        subcategory: 'Pottery',
        tags: ['pottery', 'ceramics', 'traditional crafts', 'wheel throwing'],
        pricing: {
          basePrice: 250,
          currency: 'SAR',
          priceType: 'per_person'
        },
        duration: { hours: 3, minutes: 0 },
        capacity: { min: 4, max: 10 },
        difficulty: 'beginner',
        ageRequirements: { min: 14, max: 75 }
      }
    ]
  },
  // Food Activities
  {
    vendorName: 'Desert Culinary Academy',
    activities: [
      {
        title: 'Traditional Kabsa Cooking Class',
        shortDescription: 'Master the art of cooking authentic Saudi Kabsa with traditional spices and techniques. Includes recipe booklet and full meal.',
        description: 'Learn to prepare Saudi Arabia\'s national dish, Kabsa, from our expert chefs who have perfected this recipe over decades. This hands-on cooking class covers the selection and preparation of traditional spices, proper rice cooking techniques, and the art of balancing flavors that make Kabsa so special. You\'ll prepare a complete meal including appetizers and traditional sides, then enjoy your creations together. Take home a comprehensive recipe booklet and spice blend.',
        category: 'food',
        subcategory: 'Traditional Cooking',
        tags: ['kabsa', 'saudi cuisine', 'traditional cooking', 'spices'],
        pricing: {
          basePrice: 180,
          currency: 'SAR',
          priceType: 'per_person'
        },
        duration: { hours: 3, minutes: 0 },
        capacity: { min: 6, max: 16 },
        difficulty: 'beginner',
        ageRequirements: { min: 16, max: 70 },
        requirements: {
          whatIsProvided: ['All ingredients', 'Cooking equipment', 'Recipe booklet', 'Spice blend', 'Full meal']
        }
      },
      {
        title: 'Middle Eastern Desserts Workshop',
        shortDescription: 'Create delicious traditional Middle Eastern desserts including Baklava, Kunafa, and Ma\'amoul. Perfect for sweet enthusiasts.',
        description: 'Indulge your sweet tooth while learning to make exquisite Middle Eastern desserts from scratch. This workshop covers three beloved desserts: flaky baklava with nuts and honey, creamy kunafa with cheese, and delicate ma\'amoul cookies. You\'ll learn the secrets of working with phyllo dough, making perfect syrup, and achieving the ideal texture for each dessert. All participants take home a box of their handmade desserts plus detailed recipes.',
        category: 'food',
        subcategory: 'Desserts & Baking',
        tags: ['middle eastern desserts', 'baklava', 'kunafa', 'baking'],
        pricing: {
          basePrice: 160,
          currency: 'SAR',
          priceType: 'per_person'
        },
        duration: { hours: 2, minutes: 30 },
        capacity: { min: 4, max: 12 },
        difficulty: 'intermediate',
        ageRequirements: { min: 18, max: 75 }
      }
    ]
  },
  // Outdoor Activities
  {
    vendorName: 'Riyadh Adventure Tours',
    activities: [
      {
        title: 'Desert Sunset Hiking & Camping',
        shortDescription: 'Experience the beauty of the Saudi desert with guided hiking, traditional camping, and stargazing. Includes traditional dinner and breakfast.',
        description: 'Escape the city and immerse yourself in the stunning beauty of the Saudi desert. This adventure begins with a guided hike through dramatic desert landscapes, followed by a traditional Bedouin-style camping experience. Watch the spectacular desert sunset, enjoy a traditional dinner around the campfire, and fall asleep under a blanket of stars. Wake up to a beautiful sunrise and traditional Arabic breakfast before returning to the city. All camping equipment and meals included.',
        category: 'outdoor',
        subcategory: 'Camping & Hiking',
        tags: ['desert camping', 'hiking', 'stargazing', 'bedouin experience'],
        pricing: {
          basePrice: 350,
          currency: 'SAR',
          priceType: 'per_person'
        },
        duration: { hours: 18, minutes: 0 },
        capacity: { min: 4, max: 12 },
        difficulty: 'intermediate',
        ageRequirements: { min: 16, max: 60 },
        requirements: {
          clothing: ['Comfortable hiking shoes', 'Long pants', 'Long sleeves', 'Hat'],
          whatToBring: ['Personal water bottle', 'Sunscreen', 'Personal medications'],
          whatIsProvided: ['Camping equipment', 'All meals', 'Transportation', 'Guide']
        }
      },
      {
        title: 'Rock Climbing Basics',
        shortDescription: 'Learn rock climbing fundamentals with certified instructors. Includes safety equipment and training for beginners.',
        description: 'Discover the thrill of rock climbing in a safe, controlled environment with our certified climbing instructors. This beginner-friendly course covers essential climbing techniques, safety procedures, equipment usage, and basic knots. You\'ll practice on various routes suitable for different skill levels, building confidence and strength. All safety equipment is provided, and our instructors maintain a low student-to-teacher ratio for personalized attention.',
        category: 'outdoor',
        subcategory: 'Rock Climbing',
        tags: ['rock climbing', 'adventure sports', 'safety training', 'beginner friendly'],
        pricing: {
          basePrice: 220,
          currency: 'SAR',
          priceType: 'per_person'
        },
        duration: { hours: 4, minutes: 0 },
        capacity: { min: 3, max: 8 },
        difficulty: 'beginner',
        ageRequirements: { min: 14, max: 55 }
      }
    ]
  },
  // Wellness Activities
  {
    vendorName: 'Wellness Oasis Spa',
    activities: [
      {
        title: 'Traditional Arabian Massage Therapy',
        shortDescription: 'Rejuvenating massage therapy using traditional Arabian techniques and natural oils. Perfect for stress relief and relaxation.',
        description: 'Experience the healing power of traditional Arabian massage therapy, passed down through generations of skilled therapists. This luxurious treatment uses warm natural oils infused with frankincense, rose, and other traditional Arabian essences. The massage combines gentle pressure techniques with aromatherapy to release tension, improve circulation, and restore balance to mind and body. Each session includes a consultation to customize the treatment to your specific needs.',
        category: 'wellness',
        subcategory: 'Massage Therapy',
        tags: ['massage therapy', 'traditional arabian', 'aromatherapy', 'stress relief'],
        pricing: {
          basePrice: 280,
          currency: 'SAR',
          priceType: 'per_person'
        },
        duration: { hours: 1, minutes: 30 },
        capacity: { min: 1, max: 1 },
        difficulty: 'all_levels',
        ageRequirements: { min: 18, max: 75 },
        requirements: {
          whatIsProvided: ['Natural oils', 'Towels', 'Relaxation tea', 'Consultation']
        }
      },
      {
        title: 'Meditation & Mindfulness Workshop',
        shortDescription: 'Learn practical meditation techniques and mindfulness practices for daily stress management and inner peace.',
        description: 'Discover the transformative power of meditation and mindfulness in this comprehensive workshop designed for modern life. Learn various meditation techniques including breathing exercises, body scanning, and mindful awareness practices. Our experienced instructor will guide you through practical methods you can easily incorporate into your daily routine for stress reduction, improved focus, and emotional well-being. Includes guided meditation sessions and take-home practice materials.',
        category: 'wellness',
        subcategory: 'Meditation',
        tags: ['meditation', 'mindfulness', 'stress management', 'mental wellness'],
        pricing: {
          basePrice: 120,
          currency: 'SAR',
          priceType: 'per_person'
        },
        duration: { hours: 2, minutes: 0 },
        capacity: { min: 5, max: 15 },
        difficulty: 'beginner',
        ageRequirements: { min: 16, max: 80 }
      }
    ]
  }
];

const seedActivities = async () => {
  try {
    console.log('🌱 Starting activities seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user to associate activities with
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      throw new Error('Admin user not found. Please run seedAdmin first.');
    }

    // Clear existing activities
    await Activity.deleteMany({});
    console.log('🗑️  Cleared existing activities');

    let totalActivities = 0;

    // Create activities for each vendor
    for (const vendorData of activitiesData) {
      // Find the vendor
      const vendor = await Vendor.findOne({ businessName: vendorData.vendorName });
      if (!vendor) {
        console.warn(`⚠️  Vendor not found: ${vendorData.vendorName}`);
        continue;
      }

      // Create activities for this vendor
      for (const activityData of vendorData.activities) {
        const activity = new Activity({
          ...activityData,
          vendor: vendor._id,
          location: {
            address: vendor.location.address,
            city: vendor.location.city,
            state: vendor.location.state,
            zipCode: vendor.location.zipCode,
            coordinates: vendor.location.coordinates,
            isOnline: false
          },
          schedule: {
            type: 'flexible',
            availability: [
              { day: 'sunday', slots: [{ startTime: '09:00', endTime: '17:00', maxBookings: 10 }] },
              { day: 'monday', slots: [{ startTime: '09:00', endTime: '17:00', maxBookings: 10 }] },
              { day: 'tuesday', slots: [{ startTime: '09:00', endTime: '17:00', maxBookings: 10 }] },
              { day: 'wednesday', slots: [{ startTime: '09:00', endTime: '17:00', maxBookings: 10 }] },
              { day: 'thursday', slots: [{ startTime: '09:00', endTime: '17:00', maxBookings: 10 }] },
              { day: 'saturday', slots: [{ startTime: '09:00', endTime: '17:00', maxBookings: 10 }] }
            ],
            blackoutDates: [],
            advanceBooking: { min: 24, max: 2160 }
          },
          policies: {
            cancellation: 'Free cancellation up to 24 hours before the activity. 50% refund for cancellations 12-24 hours before. No refund for cancellations less than 12 hours before.',
            refund: 'Full refund for cancellations made 24+ hours in advance. Partial refunds may apply for weather-related cancellations.'
          },
          isActive: true,
          isFeatured: totalActivities < 4, // Make first 4 activities featured
          createdBy: adminUser._id
        });

        await activity.save();
        totalActivities++;
        console.log(`✅ Created activity: ${activity.title} (${vendor.businessName})`);
      }
    }

    console.log(`🎉 Successfully created ${totalActivities} activities across ${activitiesData.length} vendors`);
    
  } catch (error) {
    console.error('❌ Error seeding activities:', error.message);
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedActivities()
    .then(() => {
      console.log('🎉 Activities seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Activities seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedActivities;