# 🚀 LUDUS Platform - Demo Users Setup

## Quick Setup

### 1. Install Dependencies
```bash
# Install server dependencies (if not already installed)
cd server && npm install

# Install bcrypt for password hashing
npm install bcrypt
```

### 2. Create Demo Users
```bash
# From the project root directory
npm run setup-demo-users

# Or run directly
node scripts/setup-demo-users.js
```

### 3. Start the Application
```bash
# Start both client and server
npm run dev
```

## 🎯 Demo User Credentials

| User | Email | Password | Role | Purpose |
|------|-------|----------|------|---------|
| **Admin** | `admin@ludus.demo` | `Admin123!` | Admin | Test admin features |
| **Sarah** | `sarah.ahmed@ludus.demo` | `Sarah123!` | User | Complete profile testing |
| **Ahmed** | `ahmed.hassan@ludus.demo` | `Ahmed123!` | User | Minimal profile testing |
| **Fatima** | `fatima.ali@ludus.demo` | `Fatima123!` | User | Social features testing |
| **TechHub** | `techhub@ludus.demo` | `TechHub123!` | Vendor | Vendor features testing |

## 🧪 Testing Checklist

### ✅ Admin Features
- [ ] Login as `admin@ludus.demo`
- [ ] Test responsive sidebar (mobile/desktop)
- [ ] Navigate to Content → Forms tab
- [ ] Create new forms with different field types
- [ ] Test form validation and responses

### ✅ User Profile Features
- [ ] Login as `sarah.ahmed@ludus.demo`
- [ ] Visit profile page: `/user/[sarah-user-id]`
- [ ] Test profile editing
- [ ] Add/update social links
- [ ] Test interests and languages
- [ ] Update availability settings

### ✅ Participation Preferences
- [ ] Login as `fatima.ali@ludus.demo`
- [ ] Go to Settings → Participation Preferences
- [ ] Test age group preferences (preferred/avoid)
- [ ] Test gender and language preferences
- [ ] Test experience level preferences
- [ ] Test social interaction settings

### ✅ Referral System
- [ ] Login as `ahmed.hassan@ludus.demo`
- [ ] Navigate to Referrals dashboard
- [ ] Test new social sharing icons
- [ ] Test Snapchat sharing
- [ ] Generate and test referral codes

### ✅ Cross-User Testing
- [ ] Login as different users
- [ ] Visit each other's profiles
- [ ] Test friend request functionality
- [ ] Test social features

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check MongoDB connection
mongosh
# or
mongo

# Verify database exists
use ludus-platform
show collections
```

### Password Issues
```bash
# If passwords don't work, check bcrypt installation
cd server
npm install bcrypt
```

### User Not Found
```bash
# Re-run the setup script
npm run setup-demo-users
```

## 📱 Mobile Testing

Test the responsive features on mobile:
1. Open browser dev tools
2. Toggle device toolbar
3. Test admin sidebar responsiveness
4. Test user profile pages on mobile

## 🎨 Feature Highlights

### New Features Implemented:
- ✅ **Responsive Admin Sidebar** - Works perfectly on all devices
- ✅ **Enhanced Social Sharing** - Professional icons + Snapchat
- ✅ **Forms Management** - Full CRUD under Content section
- ✅ **Participation Preferences** - Detailed user preference controls
- ✅ **User Profile Pages** - Complete profile system with social links

### Key Testing Areas:
- **Admin Panel**: Responsive design, forms management
- **User Profiles**: Bio, social links, interests, availability
- **Preferences**: Age groups, genders, languages, experience levels
- **Social Features**: Friend requests, messaging preparation
- **Referral System**: Modern sharing with Snapchat integration

## 🚀 Ready to Test!

All demo users are configured with realistic data to test every aspect of the new features. Happy testing! 🎉
