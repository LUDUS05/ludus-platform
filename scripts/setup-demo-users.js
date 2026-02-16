#!/usr/bin/env node

/**
 * LUDUS Platform - Demo Users Setup Script
 * 
 * This script creates demo users for testing the new features:
 * - Admin UI responsive layout
 * - Enhanced referral social sharing
 * - Admin forms management
 * - User participation preferences
 * - User profile pages
 */

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// User model (adjust path as needed)
const User = require('../server/src/models/User');

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ludus-platform';

// Hash password helper
const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

// Demo users data
const demoUsers = [
  {
    firstName: "Admin",
    lastName: "User",
    email: "admin@ludus.demo",
    password: hashPassword("Admin123!"),
    role: "admin",
    isEmailVerified: true,
    preferences: {
      language: "en",
      participantGenderMix: "no-preference",
      preferredTimes: ["weekend-morning", "weekend-afternoon"],
      activityTypes: ["outdoor", "social"],
      categories: ["fitness", "unique"],
      priceRange: { min: 0, max: 500 },
      radius: 25,
      notifications: {
        email: true,
        sms: false,
        push: true,
        marketing: true,
        activityUpdates: true,
        socialUpdates: true,
        reminderNotifications: true
      }
    },
    createdAt: new Date()
  },
  {
    firstName: "Sarah",
    lastName: "Ahmed",
    email: "sarah.ahmed@ludus.demo",
    password: hashPassword("Sarah123!"),
    role: "user",
    isEmailVerified: true,
    bio: "Fitness enthusiast and outdoor adventure lover. Always looking for new activities to try!",
    socialLinks: {
      instagram: "@sarah_ahmed_fitness",
      twitter: "@sarah_ahmed",
      linkedin: "linkedin.com/in/sarah-ahmed",
      website: "https://sarahahmed.com",
      snapchat: "@sarah_ahmed"
    },
    location: {
      city: "Riyadh",
      country: "Saudi Arabia"
    },
    interests: ["Fitness & Sports", "Outdoor Adventures", "Photography", "Travel"],
    languages: ["English", "Arabic"],
    availability: {
      weekdays: false,
      weekends: true,
      evenings: true,
      mornings: false
    },
    contactPreferences: {
      allowMessages: true,
      allowFriendRequests: true,
      showEmail: false,
      showPhone: false
    },
    preferences: {
      language: "en",
      participantGenderMix: "mixed",
      preferredTimes: ["weekend-morning", "weekend-afternoon", "weekday-evening"],
      activityTypes: ["outdoor", "physical", "social"],
      categories: ["fitness", "outdoor", "unique"],
      priceRange: { min: 50, max: 300 },
      radius: 30,
      indoorOutdoor: "outdoor",
      physicalIntensity: "high",
      socialPreferences: {
        socialInteraction: "high",
        networking: true,
        teamBuilding: true,
        competitive: true
      },
      participantPreferences: {
        ageGroups: {
          preferred: ["26-35", "36-45"],
          avoid: ["18-25"]
        },
        genders: {
          preferred: [],
          avoid: []
        },
        languages: {
          preferred: ["English", "Arabic"],
          avoid: []
        },
        experienceLevels: {
          preferred: ["intermediate", "advanced"],
          avoid: ["beginner"]
        },
        groupSizes: {
          preferred: ["small", "medium"],
          avoid: ["very-large"]
        }
      },
      notifications: {
        email: true,
        sms: false,
        push: true,
        marketing: true,
        activityUpdates: true,
        socialUpdates: true,
        reminderNotifications: true
      }
    },
    createdAt: new Date()
  },
  {
    firstName: "Ahmed",
    lastName: "Hassan",
    email: "ahmed.hassan@ludus.demo",
    password: hashPassword("Ahmed123!"),
    role: "user",
    isEmailVerified: true,
    bio: "New to the platform, exploring activities",
    location: {
      city: "Jeddah",
      country: "Saudi Arabia"
    },
    interests: ["Technology"],
    languages: ["Arabic", "English"],
    availability: {
      weekdays: true,
      weekends: false,
      evenings: true,
      mornings: false
    },
    contactPreferences: {
      allowMessages: true,
      allowFriendRequests: false,
      showEmail: false,
      showPhone: false
    },
    preferences: {
      language: "ar",
      participantGenderMix: "same-gender",
      preferredTimes: ["weekday-evening"],
      activityTypes: ["indoor", "mental"],
      categories: ["technology"],
      priceRange: { min: 0, max: 200 },
      radius: 20,
      indoorOutdoor: "indoor",
      physicalIntensity: "low",
      socialPreferences: {
        socialInteraction: "minimal",
        networking: false,
        teamBuilding: false,
        competitive: false
      },
      participantPreferences: {
        ageGroups: {
          preferred: ["26-35"],
          avoid: []
        },
        genders: {
          preferred: ["male"],
          avoid: []
        },
        languages: {
          preferred: ["Arabic"],
          avoid: []
        },
        experienceLevels: {
          preferred: ["beginner", "intermediate"],
          avoid: []
        },
        groupSizes: {
          preferred: ["small"],
          avoid: ["large", "very-large"]
        }
      },
      notifications: {
        email: true,
        sms: false,
        push: false,
        marketing: false,
        activityUpdates: true,
        socialUpdates: false,
        reminderNotifications: true
      }
    },
    createdAt: new Date()
  },
  {
    firstName: "Fatima",
    lastName: "Ali",
    email: "fatima.ali@ludus.demo",
    password: hashPassword("Fatima123!"),
    role: "user",
    isEmailVerified: true,
    bio: "Love meeting new people through activities. Always up for team building and networking!",
    socialLinks: {
      instagram: "@fatima_ali_social",
      twitter: "@fatima_ali",
      linkedin: "linkedin.com/in/fatima-ali",
      website: "https://fatimaali.com",
      snapchat: "@fatima_ali"
    },
    location: {
      city: "Dammam",
      country: "Saudi Arabia"
    },
    interests: ["Arts & Culture", "Food & Dining", "Volunteering", "Business", "Education"],
    languages: ["Arabic", "English", "French"],
    availability: {
      weekdays: true,
      weekends: true,
      evenings: true,
      mornings: true
    },
    contactPreferences: {
      allowMessages: true,
      allowFriendRequests: true,
      showEmail: true,
      showPhone: false
    },
    preferences: {
      language: "ar",
      participantGenderMix: "mixed",
      preferredTimes: ["weekday-evening", "weekend-morning", "weekend-afternoon"],
      activityTypes: ["social", "group", "mental"],
      categories: ["arts", "food", "unique", "wellness"],
      priceRange: { min: 0, max: 400 },
      radius: 40,
      indoorOutdoor: "both",
      physicalIntensity: "moderate",
      socialPreferences: {
        socialInteraction: "high",
        networking: true,
        teamBuilding: true,
        competitive: false
      },
      participantPreferences: {
        ageGroups: {
          preferred: ["26-35", "36-45", "46-55"],
          avoid: []
        },
        genders: {
          preferred: [],
          avoid: []
        },
        languages: {
          preferred: ["Arabic", "English"],
          avoid: []
        },
        experienceLevels: {
          preferred: ["beginner", "intermediate", "advanced"],
          avoid: []
        },
        groupSizes: {
          preferred: ["medium", "large"],
          avoid: ["small"]
        }
      },
      notifications: {
        email: true,
        sms: true,
        push: true,
        marketing: true,
        activityUpdates: true,
        socialUpdates: true,
        reminderNotifications: true
      }
    },
    createdAt: new Date()
  },
  {
    firstName: "TechHub",
    lastName: "Solutions",
    email: "techhub@ludus.demo",
    password: hashPassword("TechHub123!"),
    role: "vendor",
    isEmailVerified: true,
    bio: "Leading technology education provider offering coding bootcamps, workshops, and team building activities.",
    socialLinks: {
      instagram: "@techhub_sa",
      twitter: "@techhub_sa",
      linkedin: "linkedin.com/company/techhub-sa",
      website: "https://techhub.sa",
      snapchat: "@techhub_sa"
    },
    location: {
      city: "Riyadh",
      country: "Saudi Arabia"
    },
    interests: ["Technology", "Education", "Business"],
    languages: ["Arabic", "English"],
    availability: {
      weekdays: true,
      weekends: true,
      evenings: true,
      mornings: true
    },
    contactPreferences: {
      allowMessages: true,
      allowFriendRequests: false,
      showEmail: true,
      showPhone: true
    },
    preferences: {
      language: "en",
      participantGenderMix: "no-preference",
      preferredTimes: ["weekday-morning", "weekday-afternoon", "weekend-morning"],
      activityTypes: ["indoor", "mental", "group"],
      categories: ["technology", "education", "unique"],
      priceRange: { min: 100, max: 1000 },
      radius: 50,
      indoorOutdoor: "indoor",
      physicalIntensity: "low",
      socialPreferences: {
        socialInteraction: "moderate",
        networking: true,
        teamBuilding: true,
        competitive: false
      },
      participantPreferences: {
        ageGroups: {
          preferred: ["18-25", "26-35", "36-45"],
          avoid: []
        },
        genders: {
          preferred: [],
          avoid: []
        },
        languages: {
          preferred: ["Arabic", "English"],
          avoid: []
        },
        experienceLevels: {
          preferred: ["beginner", "intermediate"],
          avoid: []
        },
        groupSizes: {
          preferred: ["medium", "large"],
          avoid: ["small"]
        }
      },
      notifications: {
        email: true,
        sms: false,
        push: true,
        marketing: true,
        activityUpdates: true,
        socialUpdates: true,
        reminderNotifications: true
      }
    },
    createdAt: new Date()
  }
];

async function setupDemoUsers() {
  try {
    console.log('🚀 Setting up LUDUS Platform Demo Users...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing demo users (optional)
    const existingDemoUsers = await User.find({ 
      email: { $in: demoUsers.map(user => user.email) } 
    });
    
    if (existingDemoUsers.length > 0) {
      console.log(`⚠️  Found ${existingDemoUsers.length} existing demo users`);
      console.log('   Existing users will be updated with new data\n');
      
      // Update existing users
      for (const userData of demoUsers) {
        await User.findOneAndUpdate(
          { email: userData.email },
          userData,
          { upsert: true, new: true }
        );
        console.log(`✅ Updated: ${userData.email}`);
      }
    } else {
      // Create new users
      const createdUsers = await User.insertMany(demoUsers);
      console.log(`✅ Created ${createdUsers.length} demo users:\n`);
      
      createdUsers.forEach(user => {
        console.log(`   📧 ${user.email} (${user.role})`);
      });
    }
    
    console.log('\n🎯 Demo Users Ready for Testing!\n');
    console.log('📋 Quick Login Credentials:');
    console.log('   Admin:     admin@ludus.demo / Admin123!');
    console.log('   Sarah:     sarah.ahmed@ludus.demo / Sarah123!');
    console.log('   Ahmed:     ahmed.hassan@ludus.demo / Ahmed123!');
    console.log('   Fatima:    fatima.ali@ludus.demo / Fatima123!');
    console.log('   TechHub:   techhub@ludus.demo / TechHub123!\n');
    
    console.log('🧪 Test the new features:');
    console.log('   • Admin responsive sidebar');
    console.log('   • Forms management under Content');
    console.log('   • Enhanced referral sharing with Snapchat');
    console.log('   • User participation preferences');
    console.log('   • User profile pages with social links\n');
    
    console.log('📖 See DEMO_USER_CREDENTIALS.md for detailed testing scenarios');
    
  } catch (error) {
    console.error('❌ Error setting up demo users:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the setup
if (require.main === module) {
  setupDemoUsers();
}

module.exports = { setupDemoUsers, demoUsers };
