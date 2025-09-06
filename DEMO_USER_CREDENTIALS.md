# LUDUS Platform - Demo User Credentials

## 🎯 Demo Users for Testing New Features

### **Admin User (Full Access)**
```
Email: admin@ludus.demo
Password: Admin123!
Role: Admin
Features: Full admin panel access, forms management, user management
```

### **Regular User 1 - Sarah (Complete Profile)**
```
Email: sarah.ahmed@ludus.demo
Password: Sarah123!
Role: User
Profile Status: Complete with all new features
- Bio: "Fitness enthusiast and outdoor adventure lover. Always looking for new activities to try!"
- Social Links: Instagram, LinkedIn, Website
- Interests: Fitness & Sports, Outdoor Adventures, Photography
- Languages: English, Arabic
- Availability: Weekends, Evenings
- Participation Preferences: Mixed groups, moderate social interaction
```

### **Regular User 2 - Ahmed (Minimal Profile)**
```
Email: ahmed.hassan@ludus.demo
Password: Ahmed123!
Role: User
Profile Status: Basic profile for testing incomplete states
- Bio: "New to the platform, exploring activities"
- Minimal social links
- Basic preferences set
```

### **Regular User 3 - Fatima (Social User)**
```
Email: fatima.ali@ludus.demo
Password: Fatima123!
Role: User
Profile Status: Social-focused profile
- Bio: "Love meeting new people through activities. Always up for team building and networking!"
- All social links connected
- High social interaction preferences
- Networking and team building enabled
```

### **Vendor User - TechHub (Activity Provider)**
```
Email: techhub@ludus.demo
Password: TechHub123!
Role: Vendor
Profile Status: Activity provider
- Business: Tech workshops and coding bootcamps
- Specializes in: Technology, Education, Team Building
```

## 🧪 Testing Scenarios

### **1. Admin Panel Testing**
- Login as: `admin@ludus.demo`
- Test responsive sidebar on mobile/desktop
- Navigate to Content → Forms tab
- Create new forms with different field types
- Test form validation and response management

### **2. User Profile Testing**
- Login as: `sarah.ahmed@ludus.demo`
- Navigate to `/user/sarah-user-id` (replace with actual ID)
- Test profile editing functionality
- Add/remove interests and languages
- Update social links and bio
- Test contact preferences

### **3. Participation Preferences Testing**
- Login as: `fatima.ali@ludus.demo`
- Go to Settings → Participation Preferences
- Test age group preferences (preferred/avoid)
- Test gender and language preferences
- Test experience level and group size preferences
- Test social interaction settings

### **4. Referral System Testing**
- Login as: `ahmed.hassan@ludus.demo`
- Navigate to Referrals dashboard
- Test new social sharing icons
- Test Snapchat sharing functionality
- Generate referral codes and test sharing

### **5. Cross-User Testing**
- Login as different users
- Visit each other's profiles: `/user/[user-id]`
- Test friend request functionality
- Test messaging system (when implemented)
- Test social features and interactions

## 🔧 Database Setup Commands

### **Create Demo Users (MongoDB)**
```javascript
// Run in MongoDB shell or through your application

// Admin User
db.users.insertOne({
  firstName: "Admin",
  lastName: "User",
  email: "admin@ludus.demo",
  password: "$2b$10$encrypted_password_hash", // Hash for "Admin123!"
  role: "admin",
  isEmailVerified: true,
  createdAt: new Date(),
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
  }
});

// Sarah Ahmed - Complete Profile
db.users.insertOne({
  firstName: "Sarah",
  lastName: "Ahmed",
  email: "sarah.ahmed@ludus.demo",
  password: "$2b$10$encrypted_password_hash", // Hash for "Sarah123!"
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
});

// Ahmed Hassan - Minimal Profile
db.users.insertOne({
  firstName: "Ahmed",
  lastName: "Hassan",
  email: "ahmed.hassan@ludus.demo",
  password: "$2b$10$encrypted_password_hash", // Hash for "Ahmed123!"
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
});

// Fatima Ali - Social User
db.users.insertOne({
  firstName: "Fatima",
  lastName: "Ali",
  email: "fatima.ali@ludus.demo",
  password: "$2b$10$encrypted_password_hash", // Hash for "Fatima123!"
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
});

// TechHub Vendor
db.users.insertOne({
  firstName: "TechHub",
  lastName: "Solutions",
  email: "techhub@ludus.demo",
  password: "$2b$10$encrypted_password_hash", // Hash for "TechHub123!"
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
});
```

## 🔐 Password Hashing

**Note:** Replace `$2b$10$encrypted_password_hash` with actual bcrypt hashes for the passwords:

```javascript
// Use bcrypt to hash passwords
const bcrypt = require('bcrypt');
const saltRounds = 10;

const passwords = {
  admin: 'Admin123!',
  sarah: 'Sarah123!',
  ahmed: 'Ahmed123!',
  fatima: 'Fatima123!',
  techhub: 'TechHub123!'
};

// Hash each password
Object.keys(passwords).forEach(user => {
  const hash = bcrypt.hashSync(passwords[user], saltRounds);
  console.log(`${user}: ${hash}`);
});
```

## 🚀 Quick Setup Script

Create a setup script to quickly populate your database:

```javascript
// setup-demo-users.js
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Connect to your MongoDB
mongoose.connect('your-mongodb-connection-string');

// Hash passwords
const hashPassword = (password) => bcrypt.hashSync(password, 10);

// Demo users data
const demoUsers = [
  {
    firstName: "Admin",
    lastName: "User",
    email: "admin@ludus.demo",
    password: hashPassword("Admin123!"),
    role: "admin",
    isEmailVerified: true,
    // ... rest of admin user data
  },
  // ... other users
];

// Insert users
async function setupDemoUsers() {
  try {
    await User.insertMany(demoUsers);
    console.log('Demo users created successfully!');
  } catch (error) {
    console.error('Error creating demo users:', error);
  }
}

setupDemoUsers();
```

## 📱 Testing Checklist

### **Admin Features:**
- [ ] Responsive sidebar works on mobile/desktop
- [ ] Forms management accessible under Content tab
- [ ] Can create/edit forms with various field types
- [ ] Form validation works correctly
- [ ] Can manage form responses

### **User Profile Features:**
- [ ] Profile pages load correctly (`/user/[id]`)
- [ ] Can edit profile information
- [ ] Social links can be added/updated
- [ ] Interests and languages can be selected
- [ ] Availability settings work
- [ ] Contact preferences function correctly

### **Participation Preferences:**
- [ ] Age group preferences (preferred/avoid)
- [ ] Gender preferences (preferred/avoid)
- [ ] Language preferences (preferred/avoid)
- [ ] Experience level preferences
- [ ] Group size preferences
- [ ] Social interaction settings
- [ ] Notification preferences

### **Referral System:**
- [ ] New social sharing icons display correctly
- [ ] Snapchat sharing works
- [ ] All social platforms share correctly
- [ ] Referral codes generate properly

### **Cross-User Testing:**
- [ ] Can view other users' profiles
- [ ] Friend request system works
- [ ] Messaging system (when implemented)
- [ ] Social features function correctly

## 🎯 Demo Scenarios

1. **Admin Testing:** Login as admin and test all new admin features
2. **Profile Completion:** Login as Ahmed and complete his profile
3. **Social Interaction:** Login as Fatima and test social features
4. **Activity Discovery:** Test how preferences affect activity recommendations
5. **Referral Sharing:** Test the new referral sharing system with all platforms

These demo users provide comprehensive testing coverage for all the new features implemented in the LUDUS platform! 🚀
