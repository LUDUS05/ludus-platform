# LUDUS Platform - Technical Architecture (V2.0.0)
## Comprehensive System Design & Implementation Blueprint

**Date:** October 2025
**Version:** 2.0.0
**Status:** Production (Latest)
**Platform:** LUDUS Social Activity Platform  
**Target Market:** Saudi Arabia  

---

## 🏗️ ARCHITECTURE OVERVIEW

LUDUS is a comprehensive social activity platform designed specifically for the Saudi Arabian market. It is built as a modern, scalable, cloud-native application featuring an Arabic-first design, advanced payment integration, and a premium UI/UX.

### **Core Architecture Principles**
- **Multi-Service Architecture**: Modular, independently deployable services for frontend, backend, and admin functions.
- **API-First Design**: A comprehensive RESTful API serves as the backbone for all client applications.
- **Cloud-Native**: Optimized for cloud deployment, leveraging services like managed databases, object storage, and CI/CD pipelines.
- **Security-First**: Comprehensive security measures are integrated at every layer of the application.

---

## 🎯 SYSTEM ARCHITECTURE

### Multi-Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    LUDUS Platform                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Frontend   │  │   Backend    │  │    Admin     │ │
│  │  React 19.1  │  │  Express.js  │  │    Panel     │ │
│  │   + GSAP     │  │  + MongoDB   │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                   External Services                      │
│  • MongoDB Atlas (Database)                             │
│  • Moyasar (Payment Gateway)                            │
│  • Firebase (Authentication)                            │
│  • Cloudinary (Image Storage)                           │
│  • Redis (Caching & Sessions)                           │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend**
- React 19.1.1 with modern hooks and Context API
- Tailwind CSS with RTL configuration
- GSAP 3.12.5 for 60fps animations
- i18next 25.3.2 for Arabic/English localization
- React Router DOM 7.7.1 for navigation
- Axios for API communication

**Backend**
- Node.js with Express.js framework
- MongoDB with Mongoose ODM
- JWT authentication with refresh tokens
- Redis for session management and caching
- Socket.io for real-time features

**Payment Integration**
- Moyasar Payment Gateway
- Support for: Credit/Debit Cards, Mada, Apple Pay, STC Pay

**Infrastructure**
- Docker containerization
- NGINX reverse proxy
- PM2 process manager
- GitHub Actions for CI/CD
- Cloud deployment (AWS/Digital Ocean)

---

## 核心 FEATURES & SERVICES

This section details the architecture of the platform's main features.

### 1. Activity Management
- **Data Model**: A rich data model supporting bilingual content, advanced pricing (tiered, discounts), complex scheduling (recurring, flexible), and comprehensive media management.
- **Search API**: Powered by a robust search API with support for full-text search (Arabic/English), geolocation, and multi-faceted filtering.

### 2. Booking System
- **Data Model**: A detailed booking schema that links users, activities, and partners. It handles complex participant structures, detailed pricing breakdowns (including VAT and fees), and comprehensive status tracking.
- **Booking Flow**: A multi-step, user-friendly booking process from selection to confirmation, fully integrated with the payment gateway.

### 3. Payment Integration (Moyasar)
- **Secure Integration**: Leverages Moyasar for PCI DSS compliant payment processing.
- **Webhook-Driven**: Uses webhooks for real-time updates on payment status (paid, failed, refunded), ensuring data consistency between LUDUS and the payment gateway.

### 4. Rating & Review System
- **Multi-dimensional Ratings**: Allows users to provide detailed feedback on various aspects of an activity (e.g., accuracy, communication, value).
- **Moderation & Verification**: Includes a system for review moderation and verification to ensure authenticity and quality.

### 5. Referral System
- **Two-Sided Rewards**: Implements a referral program that rewards both the referrer and the referee.
- **Analytics**: Includes a dashboard for users to track their referral success and earnings.

---

## 🖥️ UI/UX DESIGN SYSTEM

### Design Principles
1.  **Arabic-First Design**: RTL layout, Arabic typography, and culturally-aware design elements.
2.  **Premium Visual Experience**: Smooth animations powered by GSAP, high-quality imagery, and modern UI patterns.
3.  **Mobile-First Responsive**: Optimized for touch, gestures, and a native-like PWA experience.
4.  **Accessibility**: WCAG 2.1 AA compliance.

### Component Library
- A comprehensive library of reusable React components, including a rich button system, cards, form elements, and specialized components like `ActivityCard` and `Rating`.

---

## 🔐 SECURITY & COMPLIANCE

### Security Measures
- **Authentication**: Firebase Authentication and JWT with refresh tokens.
- **Data Protection**: Encryption at rest and in transit, password hashing, and PII data encryption.
- **Payment Security**: PCI DSS compliance via Moyasar.
- **API Security**: Rate limiting, CORS, input validation, and protection against common vulnerabilities (XSS, SQLi).

### Compliance
- Adherence to Saudi Arabian regulations, including the Personal Data Protection Law (PDPL) and e-commerce laws.

---

## 📈 PERFORMANCE OPTIMIZATION

### Frontend Optimization
- **Code Splitting**: Using `React.lazy()` and Suspense for route-based splitting.
- **Image Optimization**: Serving optimized WebP images with lazy loading.
- **Caching**: Leveraging a Service Worker for aggressive caching.
- **Performance Targets**: FCP < 1.5s, LCP < 2.5s, TTI < 3.5s.

### Backend Optimization
- **Database**: Strategic indexing, Redis caching for frequent queries, and connection pooling.
- **API**: Response compression, cursor-based pagination, and load balancing.
- **Performance Targets**: API Response Time < 200ms (p95), Uptime > 99.9%.

---

## 🚀 DEPLOYMENT & DEVOPS

### Infrastructure
- **Hosting**: AWS / Digital Ocean, with a primary region in Saudi Arabia.
- **Services**: NGINX for reverse proxy, PM2 for process management, MongoDB Atlas for the database, Redis for caching, and Cloudinary for storage.
- **Monitoring**: Prometheus + Grafana for metrics, Sentry for error tracking.

### CI/CD Pipeline
- **Automation**: GitHub Actions workflow for linting, testing, building, and deploying.
- **Environments**: Separate, automated deployments to Staging (on push to develop) and Production (on merge to main, with manual approval).
- **Verification**: Post-deployment smoke tests and security scans.
