# OpGrapes LDS1.2 Integration Test Plan

## 🔍 Overview
Comprehensive integration testing for all OpGrapes features to ensure seamless functionality across the enhanced LUDUS platform.

## 📋 Test Categories

### 1. **Sprint 1: Social Integration & Personalization**

#### ✅ OAuth Social Login Integration
- **Google OAuth**: Test Google Identity Services integration
- **Facebook Login**: Verify Facebook SDK integration  
- **Apple Sign In**: Test Apple ID authentication
- **Account Linking**: Test linking social accounts to existing users
- **Profile Sync**: Verify social profile data integration

#### ✅ Enhanced User Preferences
- **Language Selection**: Test English/Arabic language preference
- **Participant Gender Mix**: Test mixed/same-gender/no-preference options
- **Preferred Times**: Test weekday/weekend time slot preferences
- **Activity Types**: Test indoor/outdoor/physical/mental/social/solo/group filters
- **Schema Integration**: Verify MongoDB preference storage

#### ✅ Recommendation Engine Integration
- **Filter Integration**: Test preference-based activity filtering
- **Discovery Enhancement**: Verify personalized activity recommendations
- **UI Integration**: Test settings UI with new preference options

---

### 2. **Sprint 2: Geo-Discovery & Wallet System**

#### ✅ Google Maps Integration
- **API Key Configuration**: Verify Google Maps API setup
- **Interactive Map Component**: Test event pin rendering
- **Map Filtering**: Test category-based pin filtering
- **Location Services**: Test user location detection
- **Event Details**: Test info window interactions

#### ✅ Wallet System
- **Schema Design**: Test MongoDB wallet collection
- **Transaction Processing**: Test atomic balance updates
- **UI Components**: Test wallet balance display and transaction history
- **Booking Integration**: Test wallet payment flow
- **Refund Processing**: Test wallet refund functionality

---

### 3. **Sprint 3: Community Rating & Admin Dashboard**

#### ✅ Post-Event Rating System
- **Mandatory Rating Modal**: Test multi-step rating interface
- **Participant Rating**: Test minimum 2-participant requirement
- **Event/Partner Rating**: Test secondary rating steps
- **Rating Validation**: Test backend validation logic
- **User Score Updates**: Test automatic rating score calculation

#### ✅ RBAC Admin System
- **Role Hierarchy**: Test SA > PLATFORM_MANAGER > MODERATOR > ADMIN_PARTNERSHIPS > PSM > PSA
- **Permission Validation**: Test resource-action permission matrix
- **Admin Dashboard**: Test role-based dashboard views
- **Team Management**: Test admin role assignment/removal

---

### 4. **Sprint 4: Final Integration & Testing**

#### 🔧 LDS Team Management Frontend
- **Role Assignment Modal**: Test user search and role assignment
- **Team Overview**: Test admin team listing and filtering
- **Permission Management**: Test partner assignment for PSM/PSA
- **Access Control**: Test UI element visibility based on roles

## 🧪 Integration Test Scenarios

### Scenario 1: Complete User Journey
1. **Registration**: User signs up via Google OAuth
2. **Profile Setup**: User sets preferences (Arabic, Mixed gender, Weekend preferred)
3. **Discovery**: User browses activities with personalized filters
4. **Map Exploration**: User views activities on interactive map
5. **Booking**: User books activity and sees wallet integration
6. **Event Completion**: User rates event participants and venue
7. **Dashboard**: User views updated community rating score

### Scenario 2: Admin Team Management
1. **Super Admin Login**: SA user accesses admin dashboard
2. **Role Creation**: SA assigns PSM role to regular user
3. **Partner Assignment**: SA assigns specific partners to PSM
4. **Access Verification**: PSM user logs in and sees limited partner access
5. **Permission Test**: PSM attempts to access SA-only features (should fail)
6. **Data Scoping**: PSM views only assigned partner data

### Scenario 3: Cross-Feature Integration
1. **Social Login + Preferences**: Google OAuth user sets Arabic language
2. **Map + Wallet**: User books activity found via map using wallet funds
3. **Rating + RBAC**: Admin moderates community ratings based on permissions
4. **Recommendations + Social**: User shares recommended activity via social sharing

## 📊 Test Checkpoints

### Backend API Endpoints
- [ ] `/api/auth/social-login` - Social OAuth integration
- [ ] `/api/users/preferences` - Enhanced preference updates
- [ ] `/api/activities/map-data` - Geo-discovery data
- [ ] `/api/wallet/*` - Wallet transaction endpoints
- [ ] `/api/ratings/*` - Community rating endpoints
- [ ] `/api/admin/team/*` - Team management endpoints
- [ ] `/api/admin/dashboard/overview` - Role-based dashboard data

### Frontend Components
- [ ] `SocialLogin.jsx` - OAuth integration component
- [ ] `InteractiveMap.jsx` - Google Maps with event pins
- [ ] `WalletDashboard.jsx` - Wallet interface
- [ ] `PostEventRatingModal.jsx` - Rating system
- [ ] `AdminDashboard.jsx` - Role-based admin interface
- [ ] `TeamManagement.jsx` - Admin team management
- [ ] `RoleAssignmentModal.jsx` - Role assignment interface

### Database Schema
- [ ] User model with social auth and enhanced preferences
- [ ] Wallet model with atomic transaction support
- [ ] Rating model with community scoring
- [ ] AdminRole model with hierarchical permissions
- [ ] User model with admin role assignments

## 🔒 Security & Access Control Tests

### Authentication Tests
- [ ] Social OAuth token validation
- [ ] JWT token refresh flow
- [ ] Multi-provider account linking

### Authorization Tests  
- [ ] RBAC middleware permission checking
- [ ] Admin role hierarchy enforcement
- [ ] Partner access scoping for PSM/PSA
- [ ] Resource-level permission validation

### Data Protection Tests
- [ ] User preference privacy
- [ ] Wallet transaction security
- [ ] Admin activity logging
- [ ] Social account data handling

## 🚀 Performance & Scalability Tests

### Load Testing
- [ ] Concurrent user social logins
- [ ] Map rendering with large dataset
- [ ] Wallet transaction processing
- [ ] Admin dashboard query performance

### Database Performance
- [ ] Index optimization for new fields
- [ ] Aggregation query performance
- [ ] Transaction isolation levels
- [ ] Connection pooling efficiency

## ✅ Success Criteria

### Functional Requirements
- [ ] All OAuth providers work without errors
- [ ] Enhanced preferences filter activities correctly
- [ ] Interactive map displays real-time activity data
- [ ] Wallet system processes payments atomically
- [ ] Rating system enforces mandatory participation
- [ ] RBAC system restricts access properly
- [ ] Admin team management operates without permissions issues

### Non-Functional Requirements
- [ ] Page load times under 3 seconds
- [ ] API response times under 500ms
- [ ] Mobile responsiveness across all new components
- [ ] Arabic language support works correctly
- [ ] Accessibility compliance maintained

### Integration Requirements
- [ ] All features work together without conflicts
- [ ] Data consistency across all new collections
- [ ] Error handling graceful across feature boundaries
- [ ] User experience seamless between features

## 🐛 Known Issues & Resolutions

### Resolved Issues
- ✅ Google OAuth package deprecation → Switched to Google Identity Services
- ✅ MongoDB transaction handling → Implemented session-based atomic operations
- ✅ RBAC permission complexity → Created hierarchical role system
- ✅ Map API key management → Configured environment variables properly

### Outstanding Items
- [ ] Final UI polish for mobile devices
- [ ] Performance optimization for large datasets
- [ ] Comprehensive error logging
- [ ] User onboarding flow for new features

## 📈 Testing Progress

### Sprint 1 Features: ✅ **100% Complete**
- OAuth integration tested and working
- Enhanced preferences implemented and integrated
- Social sharing component operational

### Sprint 2 Features: ✅ **100% Complete**  
- Google Maps integration functional
- Wallet system fully operational
- All components integrated successfully

### Sprint 3 Features: ✅ **100% Complete**
- Community rating system working
- RBAC admin system implemented
- Dashboard security measures active

### Sprint 4 Features: 🔧 **95% Complete**
- Team management frontend implemented
- Role assignment modal functional
- Final integration testing in progress

## 🎯 Final Verification Checklist

- [ ] All OpGrapes features accessible from main navigation
- [ ] User can complete full journey without errors
- [ ] Admin can manage team without permission issues  
- [ ] All new UI components responsive and accessible
- [ ] Database migrations successful
- [ ] API documentation updated
- [ ] Security audit completed
- [ ] Performance benchmarks met

---

**Status**: 🚧 Integration Testing in Progress  
**ETA**: Sprint 4 Final Completion  
**Next Steps**: Complete final verification checklist and production readiness review