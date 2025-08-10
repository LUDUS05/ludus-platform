# **LUDUS LDS1.2 ("OpGrapes") \- Complete Implementation Plan**

## **🚀 Next-Generation Platform with Enhanced Social & Engagement Features**

## **Table of Contents**

1. [Executive Summary](https://www.google.com/search?q=%23executive-summary)  
2. [Core Terminology](https://www.google.com/search?q=%23core-terminology)  
3. [Architecture & UI Strategy](https://www.google.com/search?q=%23architecture--ui-strategy)  
4. [CLI Agent System](https://www.google.com/search?q=%23cli-agent-system)  
5. [Project Management Integration](https://www.google.com/search?q=%23project-management-integration)  
6. [LDS Team Management System](https://www.google.com/search?q=%23lds-team-management-system)  
7. [Implementation Phases for LDS1.2](https://www.google.com/search?q=%23implementation-phases-for-lds12)  
8. [Testing & Quality Assurance](https://www.google.com/search?q=%23testing--quality-assurance)  
9. [Debugging & Monitoring](https://www.google.com/search?q=%23debugging--monitoring)  
10. [Archiving & Documentation](https://www.google.com/search?q=%23archiving--documentation)  
11. [Security Implementation](https://www.google.com/search?q=%23security-implementation)  
12. [Development Workflow](https://www.google.com/search?q=%23development-workflow)  
13. [Launch Checklist](https://www.google.com/search?q=%23launch-checklist)

## **📋 Executive Summary**

This document provides a complete implementation roadmap for **LUDUS LDS1.2**, codenamed **Project "OpGrapes"**. This version marks a significant evolution from V1, focusing on deep social integration, enhanced user engagement, and a robust administrative framework.

Key advancements in LDS1.2 include:

* **Enhanced Social Platform**: Full social media integration for login and sharing, user activity feeds, and community-building features.  
* **Geo-Map Discovery**: Interactive event discovery using the **Google Maps API**.  
* **Component-Driven UI**: A strict methodology using **shadcn/ui, Tailwind CSS, and Storybook** to ensure a consistent and high-quality user interface.  
* **User Wallet & Credit System**: An in-app wallet for refunds and loyalty rewards.  
* **Community-Powered Rating System**: A mandatory participant rating system to ensure community quality and safety.  
* **Advanced User Personalization**: Granular control over user preferences, including language and participant gender.  
* **Hierarchical Admin System**: A structured team management system with defined roles and permissions.

## **📖 Core Terminology**

To ensure clarity and consistency across the platform, the following terms are officially defined:

* **Partner**: Replaces the term "Vendor". Refers to any business, organizer, or individual offering services on the platform.  
* **Activity**: Refers to the **type** of engagement offered by a Partner. It is the "what".  
  * *Example: "Standard Bowling Game at Aspar Bowling in Riyadh."*  
* **Event**: Refers to a specific, scheduled instance of an Activity. It is the "when".  
  * *Example: "A 'Standard Bowling Game' event is scheduled for 9:00 PM \- 10:00 PM on August 17th, 2025."*

## **🏗️ Architecture & UI Strategy**

### **Technology Stack LDS1.2**

\# .ludus/tech-stack.yaml  
version: "LDS1.2"  
architecture:  
  frontend:  
    framework: "Next.js 14"  
    ui\_library: "shadcn/ui \+ Tailwind CSS"  
    component\_viewer: "Storybook" \# Added for UI consistency  
    state\_management: "Zustand \+ React Query"  
    maps\_integration: "Google Maps API" \# Added for Geo-Map features  
    testing: "Vitest \+ Playwright"  
    pwa: "next-pwa"  
  backend:  
    primary: "Firebase Functions (Node.js 20)"  
    api\_gateway: "Firebase Hosting \+ Cloud Run"  
  database:  
    primary: "Firestore"  
    cache: "Redis (Upstash)"  
    search: "Algolia"  
  infrastructure:  
    authentication: "Firebase Auth"  
    storage: "Firebase Storage"  
    messaging: "Firebase Cloud Messaging"  
    monitoring: "Datadog \+ Sentry"  
    ci\_cd: "GitHub Actions \+ Vercel"

### **Approach for UI Consistency**

To guarantee a consistent, scalable, and high-quality UI system, a **Component-Driven Development (CDD)** methodology is mandated.

* **Core Technology**: All UI components will be built using **shadcn/ui** and styled with **Tailwind CSS**. This provides a robust and flexible foundation.  
* **Single Source of Truth**: **Storybook** will be implemented as the definitive library for all UI components. Every component (from a simple button to a complex card) **must** be developed, documented, and tested in isolation within Storybook before being integrated into the main application.  
* **Atomic Design Principles**: Components will be structured using Atomic Design principles (Atoms, Molecules, Organisms). This ensures maximum reusability, simplifies development, and enforces visual consistency. For example, an Avatar (atom) and UserName (atom) can be combined to create a UserProfile (molecule).

## **🛠️ CLI Agent System**

*(This section remains largely the same but will be updated to include generators for new features like Wallet components and Map views.)*

\# Development Commands for LDS1.2  
ludus dev:start                    \# Start development environment  
ludus dev:component \<name\>         \# Generate new component (and its Storybook file)  
ludus dev:page \<route\>             \# Generate Next.js page  
ludus dev:map-view \<name\>          \# Generate a new map-based view component  
ludus dev:wallet-ui \<component\>    \# Generate a new component for the Wallet feature

## **📊 Project Management Integration**

*(No changes to this section's structure. Sprints will be created in Linear/GitHub Projects based on the LDS1.2 phases.)*

## **🚧 LDS Team Management System**

A hierarchical admin system is a priority for LDS1.2 to ensure secure and efficient platform management. The system will be built around AdminGroups and ModGroups with the following roles:

* **SA \- Super Admin**:  
  * **Authority**: Full, unrestricted access to all platform data, settings, and user accounts. The highest level of authority.  
* **Platform Manager**:  
  * **Responsibility**: Manages all public-facing content, including static pages (About Us, FAQ), promotional banners, and platform-wide announcements.  
* **Moderator**:  
  * **Responsibility**: Ensures community health. Can view and modify user data/profiles, review and act on flagged content (reviews, comments), and handle user-reported issues.  
* **Admin of Partnerships**:  
  * **Responsibility**: Manages the entire partnership team and has oversight of all Partner accounts.  
  * **PSM \- Partner Success Manager**:  
    * **Responsibility**: The primary point of contact for Partners. Responsible for activating new Partner accounts and managing the relationship. **Each Partner must be linked to 1 PSM.**  
  * **PSA \- Partner Success Associate**:  
    * **Responsibility**: Supports PSMs. Can add and modify Partner data, including creating and updating Activity listings and managing Event schedules.

## **🚦 Implementation Phases for LDS1.2**

The previous phased plan is now succeeded by the **"OpGrapes"** feature set, which will be implemented in focused sprints.

### **Sprint 1: Social & Personalization Foundation (Weeks 1-3)**

* **Enhanced Social Integration**:  
  * \[ \] Implement OAuth for social logins (Google, Facebook, Apple).  
  * \[ \] Update user profile schema and UI to allow linking of existing social accounts.  
  * \[ \] Develop a universal social sharing component for Activities and Events.  
* **Advanced User Preferences**:  
  * \[ \] Update user settings UI to include new preferences: **Activity Type, Language, Participant Gender Mix, Preferred Times** (weekends, evenings).  
  * \[ \] Modify Firestore security rules and data schema for preferences.  
  * \[ \] Integrate new preferences into the discovery and recommendation engine.

### **Sprint 2: Geo-Maps & Wallet System (Weeks 4-6)**

* **Geo-Map Integration**:  
  * \[ \] Integrate **Google Maps API** into the Next.js application.  
  * \[ \] Develop the core map component to display Events as interactive pins, based on UI drafts.  
  * \[ \] Link map component to the existing filtering system (category, price, etc.).  
* **Wallet & Credit System**:  
  * \[ \] Design and implement the user wallet schema in Firestore (balance, transaction history).  
  * \[ \] Create UI components for users to view their wallet balance and history.  
  * \[ \] Integrate the wallet into the booking flow for payments and refunds.  
  * \[ \] Develop an admin-level function to issue promotional or loyalty credits to user wallets.

### **Sprint 3: Community Rating & Admin Dashboard (Weeks 7-9)**

* **Community Rating System**:  
  * \[ \] Develop a post-Event UI modal prompting users for ratings.  
  * \[ \] Implement logic to enforce the rating of **at least two other participants**.  
  * \[ \] Update user schema to store a community rating score.  
  * \[ \] Allow users to also rate the Event and the Partner.  
* **LDS Team Management Backend**:  
  * \[ \] Implement the Role-Based Access Control (RBAC) system in Firebase Functions based on the defined roles.  
  * \[ \] Build the core admin dashboard structure and secure its access.  
  * \[ \] Develop backend logic for the PSM-Partner linking system.

### **Sprint 4: Admin UI & Polish (Weeks 10-12)**

* **LDS Team Management Frontend**:  
  * \[ \] Build the UI for all admin roles defined in the management system.  
  * \[ \] Create the interface for the Platform Manager to edit content.  
  * \[ \] Build the moderation queue and tools for the Moderator role.  
  * \[ \] Develop the Partner management interface for PSMs and PSAs.  
* **Final Integration & Testing**:  
  * \[ \] End-to-end testing of all new LDS1.2 features.  
  * \[ \] User Acceptance Testing (UAT) with a select group.  
  * \[ \] Performance and security audit of new features.

## **🧪 Testing & Quality Assurance**

### **Testing Strategy Update for LDS1.2**

* **Unit Tests (Vitest)**: Focus on individual components in Storybook, wallet balance calculation functions, and preference filtering logic.  
* **Integration Tests**: Verify interactions between the Map API and our backend, test wallet transaction integrity, and ensure social auth tokens are handled correctly.  
* **E2E Tests (Playwright)**: Add new test suites for the complete user journeys introduced in LDS1.2.

### **E2E Test Example for LDS1.2**

// tests/e2e/social-booking.spec.js  
import { test, expect } from '@playwright/test';

test.describe('Social Booking and Rating Flow', () \=\> {  
  test('user can log in with Google, find event on map, book with wallet, and rate participants', async ({ page }) \=\> {  
    // 1\. Social Login  
    await page.goto('http://localhost:3000/login');  
    await page.click('button:has-text("Login with Google")');  
    // (mock Google auth flow)  
    await expect(page).toHaveURL('http://localhost:3000/dashboard');

    // 2\. Find Event on Map  
    await page.click('a\[href="/map"\]');  
    await page.waitForSelector('.map-pin');  
    await page.click('.map-pin:first-child');  
    await expect(page.locator('h1')).toContainText('Bowling');

    // 3\. Book with Wallet  
    await page.click('button:has-text("Book Now")');  
    await page.click('input\[name="paymentMethod"\]\[value="wallet"\]');  
    await expect(page.locator('.wallet-balance')).toContainText('Sufficient funds');  
    await page.click('button:has-text("Confirm Booking")');  
    await expect(page.locator('.success-message')).toContainText('Booking Confirmed');

    // 4\. Rate Participants (simulate post-event)  
    await page.goto('http://localhost:3000/dashboard/past-events');  
    await page.click('.event-card:first-child button:has-text("Rate Participants")');  
    await page.locator('.participant-rating:nth-child(1) .star-5').click();  
    await page.locator('.participant-rating:nth-child(2) .star-4').click();  
    await page.click('button:has-text("Submit Ratings")');  
    await expect(page.locator('.ratings-submitted-message')).toBeVisible();  
  });  
});

## **🐛 Debugging & Monitoring**

Monitoring will be enhanced to track the performance of new systems.

* **Datadog**: Create new dashboards to monitor Google Maps API latency and error rates.  
* **Sentry**: Set up specific alerts for wallet transaction failures or issues with the community rating submission process.  
* **Firebase Analytics**: Track user engagement with new social features, preference settings, and adoption of the wallet system.

## **📦 Archiving & Documentation**

The documentation process will be updated to include the new UI strategy.

* **Storybook**: Will serve as the primary documentation for all UI components.  
* **API Docs**: OpenAPI/Swagger documentation must be updated to include new endpoints for Maps, Wallet, and the Admin system.  
* **Architecture Docs**: Update diagrams to show the Google Maps API integration and the data flow for the Wallet system.

## **🔐 Security Implementation**

### **Security Checklist for LDS1.2**

* **Authentication & Authorization**:  
  * \[x\] Review and secure OAuth 2.0 implementation for all social providers.  
  * \[x\] Implement robust security rules for the new Admin roles in Firestore.  
* **Data Protection**:  
  * \[x\] Ensure all Map data requests are made securely via the backend to protect API keys.  
  * \[x\] Encrypt sensitive wallet transaction data.  
* **Application Security**:  
  * \[x\] Sanitize all user-generated preference data.  
  * \[x\] Implement fraud detection mechanisms for the wallet system (e.g., flagging unusual transaction volumes).  
* **Compliance**:  
  * \[x\] Review and update the Privacy Policy to reflect the use of Google Maps data and the collection of new user preferences.

### **Updated Firebase Security Rules Example**

// firestore.rules  
rules\_version \= '2';

service cloud.firestore {  
  match /databases/{database}/documents {  
    // Helper function to check for admin roles  
    function isRole(role) {  
      return isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.adminRole \== role;  
    }  
    function isAnyAdmin() {  
      return isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.adminRole \!= null;  
    }

    // Wallets can only be read by their owner or a Super Admin  
    match /wallets/{userId} {  
      allow read, write: if isOwner(userId) || isRole('SA');  
    }

    // Partner data can be modified by the Partner or relevant admin roles  
    match /partners/{partnerId} {  
      allow read: if true;  
      allow write: if isOwner(partnerId) || isRole('PSA') || isRole('PSM') || isRole('SA');  
    }  
      
    // User ratings can only be created by authenticated users who attended the event  
    match /ratings/{ratingId} {  
      allow create: if isAuthenticated() && hasAttended(request.resource.data.eventId);  
      allow read: if true;  
    }  
  }  
}

## **💻 Development Workflow**

The Git workflow and code review process remain the same, but with an added checklist item for UI components.

### **Updated Code Review Checklist**

* **Functionality**  
* **Code Quality**  
* **Testing**  
* **Security**  
* **Performance**  
* **Documentation**  
* **UI Consistency**:  
  * \[ \] Does this component exist in Storybook?  
  * \[ \] Does it follow the established Atomic Design principles?  
  * \[ \] Does it use the approved shadcn/ui and Tailwind CSS conventions?

## **🚀 Launch Checklist for LDS1.2**

### **Technical Readiness**

* \[ \] Google Maps API keys are secured and production-ready with appropriate restrictions.  
* \[ \] Wallet system has been audited for financial transaction security.  
* \[ \] All new social login flows have been tested on multiple platforms.  
* \[ \] Admin roles and permissions have been tested to prevent privilege escalation.  
* \[ \] Load testing performed on the map data endpoints.

### **Business & Content Readiness**

* \[ \] Privacy Policy and Terms of Service updated to include new features.  
* \[ \] FAQ and support documentation created for the Wallet and Rating systems.  
* \[ \] Marketing & Growth Strategy Prepared:  
  * \[ \] **Launch Campaigns**: Prepare campaigns to announce the new social and map features across all channels (social media, email, in-app).  
  * \[ \] **Google Analytics**: Ensure GA is configured to track new feature adoption, user flows, and conversion goals.  
  * \[ \] **Newsletters**: Design and schedule a series of newsletters to engage existing users and highlight new functionalities.  
  * \[ \] **Promotional System**: Implement an automated system to send special offers or reminders to re-engage inactive users (e.g., "We miss you\! Here's a 10 SAR credit for your next event.").

### **Operational Readiness**

* \[ \] Support team trained on how to handle wallet-related customer inquiries.  
* \[ \] On-call schedule includes engineers familiar with the new Maps and Wallet integrations.  
* \[ \] Admin accounts created and assigned to the appropriate team members.