# LUDUS Onboarding System Documentation

## Overview

The LUDUS Onboarding System is a comprehensive, premium user onboarding experience designed to welcome new users to the platform and guide them through essential setup steps. The system is fully integrated with the existing translation system, admin controls, and Firebase backend.

## Features

### ✅ Completed Features

1. **Dynamic Onboarding Configuration**
   - Admin-controllable onboarding steps
   - Enable/disable individual steps
   - Customizable content and fields
   - Step reordering capabilities

2. **Multi-step User Journey**
   - Welcome Screen with value propositions
   - Authentication (Google + Email/Password)
   - Progressive Profile Form
   - Referral System Integration
   - Interest Selection
   - Personal Preferences
   - Success Celebration

3. **Backend Integration**
   - JWT-based authentication (Google, Email/Password)
   - MongoDB for user data and progress tracking
   - Express.js API for backend logic
   - RESTful data synchronization

4. **Translation System Integration**
   - Full Arabic/English support
   - RTL/LTR layout switching
   - Dynamic content translation
   - Admin translation management

5. **Admin Dashboard**
   - Onboarding system control panel
   - Step configuration management
   - Analytics and monitoring
   - Content customization

6. **Responsive Design**
   - Mobile-first approach
   - Smooth animations with Framer Motion
   - Typeform-style sliding UI
   - Premium visual design

7. **Gamification Enhancements**
   - Step-based points awarding (per-step configurable defaults)
   - Badge unlocks: `first_login`, `profile_complete`, `interests_selected`, `referral_connected`, `onboarding_complete`
   - Completion bonus points on finishing onboarding
   - Real-time toasts for points and badge unlocks (RTL-aware)
   - Progress bar with step count (localized)
   - Daily streak tracking with longest streak
   - Onboarding leaderboard endpoint and UI

## Architecture

### Frontend Components

```
client/src/components/onboarding/
├── OnboardingProvider.jsx          # Context provider for state management
├── OnboardingWrapper.jsx           # Wrapper component with provider
├── OnboardingFlow.jsx              # Main flow orchestrator
├── OnboardingTest.jsx              # Testing and integration component
└── steps/
    ├── WelcomeStep.jsx             # Welcome screen with value props
    ├── AuthStep.jsx                # Authentication options
    ├── ProfileStep.jsx             # Progressive profile form
    ├── ReferralStep.jsx            # Referral system integration
    ├── InterestsStep.jsx           # Interest selection
    ├── PreferencesStep.jsx         # Personal preferences
    └── SuccessStep.jsx             # Completion celebration
```

### Backend Models

```javascript
// OnboardingConfig Model (MongoDB - key fields)
{
  isEnabled: Boolean,
  version: Number,
  steps: [{
    stepId: 'welcome'|'auth'|'profile'|'referral'|'interests'|'preferences',
    isEnabled: Boolean,
    isRequired: Boolean,
    order: Number,
    config: Mixed
  }],
  welcomeConfig: { title: {en, ar}, subtitle: {en, ar}, valuePropositions: [], backgroundAnimation },
  authConfig: { allowGoogleAuth, allowEmailAuth, requireEmailVerification, socialProof: {en, ar} },
  profileConfig: { fields: [{ fieldId, isEnabled, isRequired, order, label: {en, ar}, placeholder: {en, ar}, validation }] },
  referralConfig: { isEnabled, isRequired, title: {en, ar}, description: {en, ar}, sharingOptions: [{ platform, isEnabled }] },
  interestsConfig: { categories: [{ categoryId, name: {en, ar}, icon, color, isEnabled, order }], minSelections, maxSelections, title: {en, ar} },
  preferencesConfig: { preferences: [{ preferenceId, isEnabled, isRequired, order, label: {en, ar}, description: {en, ar}, defaultValue, options: [{ value, label: {en, ar}}]}], title: {en, ar} },
  analytics: { trackStepCompletion, trackDropOffPoints, trackTimeToCompletion },
  lastUpdatedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// User onboarding progress (selected fields)
{
  onboardingProgress: Record<stepId, { completed: boolean, completedAt: Date, data: any }>,
  onboardingCompleted: Boolean,
  onboardingCompletedAt: Date
}
```

### API Endpoints

```
# Public/user
GET    /api/onboarding/config
GET    /api/onboarding/progress
POST   /api/onboarding/complete-step
POST   /api/onboarding/complete

# Admin (auth + role=admin)
GET    /api/onboarding/admin/config
PUT    /api/onboarding/admin/config
POST   /api/onboarding/admin/toggle
POST   /api/onboarding/admin/reset-user/:userId
```

## Installation & Setup

### 1. Backend Configuration

1. Ensure your Node.js/Express backend is running
2. MongoDB database is connected and accessible
3. JWT authentication is properly configured
4. API endpoints are available and accessible

### 2. Environment Variables

Create `client/.env.local`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
```

### 3. Database Setup

Run the following to initialize the onboarding configuration:

```javascript
// Initialize default onboarding config
const defaultConfig = {
  isEnabled: true,
  version: 1,
  steps: [
    { stepId: "welcome", isEnabled: true, isRequired: true, order: 0 },
    { stepId: "auth", isEnabled: true, isRequired: true, order: 1 },
    { stepId: "profile", isEnabled: true, isRequired: true, order: 2 },
    { stepId: "referral", isEnabled: true, isRequired: false, order: 3 },
    { stepId: "interests", isEnabled: true, isRequired: true, order: 4 },
    { stepId: "preferences", isEnabled: true, isRequired: false, order: 5 }
  ],
  welcomeConfig: {
    title: { en: "Welcome to LUDUS", ar: "مرحباً بك في لودوس" },
    subtitle: { en: "Discover amazing activities", ar: "اكتشف أنشطة رائعة" }
  },
  interestsConfig: {
    minSelections: 3,
    maxSelections: 12,
    categories: []
  }
}
```

## Usage

### Accessing the Onboarding

1. **Direct Access**: Navigate to `/onboarding`
2. **Incognito Preview**: Open `/onboarding` in an incognito window to simulate a fresh user
3. **Reset a User**: POST `/api/onboarding/admin/reset-user/:userId` to re-run onboarding
4. **Admin Management**: Navigate to `/admin/onboarding` to edit the config

### Admin Controls

Admins can:
- Enable/disable the entire onboarding system
- Configure individual steps
- Customize content and translations
- Reorder steps
- Monitor analytics
- Manage user progress

Notes:
- Step IDs must be one of: `welcome`, `auth`, `profile`, `referral`, `interests`, `preferences` (invalid IDs are rejected with 400).
- Reordering updates `order` indexes; only `isEnabled: true` steps are sent to users via `/api/onboarding/config`.

### User Experience

1. **Welcome Screen**: Introduction with value propositions
2. **Authentication**: Google or email/password signup
3. **Profile Setup**: Progressive form with validation
4. **Referral System**: QR code generation and sharing
5. **Interest Selection**: Category selection with minimum requirements
6. **Preferences**: Language, theme, notifications, location
7. **Success**: Celebration and dashboard redirect

### Preview Tips
- After changing step structure, refresh `/onboarding` in an incognito tab.
- If already completed onboarding, reset the user via admin API.

## API Integration

### Frontend Services

```javascript
// OnboardingService
import onboardingService from '../services/onboardingService';

// Get configuration
const config = await onboardingService.getConfig();

// Complete step (returns gamification info)
const stepResp = await onboardingService.completeStep('welcome', { data: 'value' });
// stepResp.gamification = { totalPoints, awardedPoints, newBadges: [] }

// Complete onboarding (returns gamification info)
const completeResp = await onboardingService.completeOnboarding(finalData);
// completeResp.gamification = { totalPoints, awardedPoints, newBadges: ['onboarding_complete'] }

// Leaderboard
const { leaderboard } = await onboardingService.getLeaderboard(10);
```

```javascript
// API Service
import api from '../services/api';

// Authentication (handled by existing AuthContext)
const { login, register } = useAuth();

// Google authentication
const result = await login('google');

// Email authentication
const result = await register({ email, password, firstName, lastName });

// Update progress (handled by onboarding service)
await onboardingService.completeStep(stepId, stepData);
```

### Context Usage

```javascript
import { useOnboarding } from '../components/onboarding/OnboardingProvider';

const MyComponent = () => {
  const {
    config,
    currentStep,
    formData,
    onboardingProgress,
    // Gamification
    gamification, // { totalPoints, badges, currentStreak, longestStreak }
    leaderboard,
    nextStep,
    previousStep,
    completeOnboarding,
    user,
    loading,
    error
  } = useOnboarding();

  // Use onboarding state and methods
};
```

## Customization

### Adding New Steps

1. Create step component in `client/src/components/onboarding/steps/`
2. Add step to configuration in admin panel
3. Update translation files with new content
4. Add step to `OnboardingFlow.jsx` switch statement

### Modifying Existing Steps

1. Edit step component directly
2. Update translations in `client/src/i18n/locales/`
3. Modify step configuration via admin panel

### Styling

The system uses Tailwind CSS with custom design tokens:
- Primary colors: Purple/Blue gradients
- Typography: Inter font family
- Spacing: 8px base unit
- Border radius: 12px/16px/24px
- Shadows: Subtle elevation system

### Gamification Localization

Translation keys added under `onboarding.gamification` in `client/src/i18n/locales/{en,ar}.json`:

```json
{
  "onboarding": {
    "gamification": {
      "pointsAwarded": "+{{points}} points",
      "onboardingCompleteBonus": "Onboarding complete! Bonus +{{points}}",
      "badgeUnlocked": {
        "first_login": "Badge unlocked: First Login",
        "profile_complete": "Badge unlocked: Profile Complete",
        "interests_selected": "Badge unlocked: Interests Selected",
        "referral_connected": "Badge unlocked: Referral Connected",
        "onboarding_complete": "Badge unlocked: Onboarding Champion"
      }
    }
  }
}
```

Arabic equivalents provided with RTL-aware toasts.

## Testing

### Automated Tests

Run the test suite at `/onboarding-test`:
- Component import verification
- Service availability checks
- Translation system validation
- Integration testing

### Manual Testing

1. **User Flow**: Complete full onboarding journey
2. **Admin Controls**: Test configuration changes
3. **Responsive Design**: Test on mobile/tablet/desktop
4. **Translation**: Test Arabic/English switching
5. **Error Handling**: Test network failures and edge cases

## Performance

### Optimization Features

- Lazy loading of step components
- Efficient state management with Context
- Optimized Firebase queries
- Image optimization and caching
- Smooth animations with Framer Motion

### Metrics

- Page load time: <3s on 3G
- Transition animations: <300ms
- Form validation: Real-time
- Data persistence: Immediate

## Security

### Authentication

- Firebase Authentication with JWT tokens
- Secure password requirements
- Email verification (optional)
- Social login with OAuth

### Data Protection

- Role-based admin endpoints (`authorize('admin')`)
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure environment variable handling

## Troubleshooting

### Common Issues

1. **API Connection**: Check backend server and API endpoints
2. **Translation Missing**: Verify translation keys in JSON files
3. **Step Not Loading**: Check step configuration in admin panel
4. **Authentication Fails**: Verify JWT authentication setup
5. **400 on Save (Admin)**: Ensure `steps[].stepId` is valid; remove any temporary/unknown IDs.

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('onboarding-debug', 'true');
```

## Future Enhancements

### Planned Features

1. **A/B Testing**: Multiple onboarding variants
2. **Analytics Dashboard**: Detailed user behavior tracking
3. **Progressive Web App**: Offline onboarding support
4. **Voice Integration**: Voice-guided onboarding
5. **Gamification**: Points and achievements system

### Integration Opportunities

1. **CRM Integration**: User data synchronization
2. **Email Marketing**: Automated follow-up sequences
3. **Push Notifications**: Re-engagement campaigns
4. **Social Media**: Enhanced sharing features

## Support

For technical support or feature requests:
- Check the test page at `/onboarding-test`
- Review the admin panel at `/admin/onboarding`
- Consult the translation files for content issues
- Verify backend API configuration for backend issues

## Changelog

### Version 1.0.0 (Current)
- ✅ Complete onboarding system implementation
- ✅ Backend API integration (MongoDB/Express)
- ✅ Admin dashboard
- ✅ Translation system integration
- ✅ Responsive design
- ✅ Testing framework

### Version 1.1.0 (2025-09-07, GMT+3)
- ✅ Gamification v1: per-step points and badge unlocks
- ✅ Completion bonus points and final badge
- ✅ Daily streak tracking (current and longest)
- ✅ Onboarding leaderboard endpoint + UI widget
- ✅ Provider updates to surface `gamification` and `leaderboard`
- ✅ New AR/EN translations for gamification and leaderboard

---

*This documentation is maintained alongside the codebase. Please update it when making changes to the onboarding system.*
