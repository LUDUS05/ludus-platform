# LUDUS Platform - API Specifications (V2.0.0)
## Comprehensive RESTful API Documentation

**Created:** 2025-10-08
**Version:** 2.0.0
**Status:** ACTIVE - Reflects Production Blueprint
**Platform:** LUDUS Social Activity Platform  
**Base URL:** `https://api.ludus.sa/v1`  

---

## 📋 API OVERVIEW

The LUDUS Platform API is a RESTful API designed for the LUDUS social activity platform. It follows consistent design patterns, uses standard HTTP methods, and returns standardized JSON responses. This document is aligned with the "LUDUS Platform - Comprehensive Blueprint V2.0.0".

---

## 🔐 AUTHENTICATION

All protected API endpoints require a **JWT Bearer Token** in the Authorization header.

`Authorization: Bearer <jwt_token>`

### Authentication Endpoints

**`POST /api/auth/register`**
- Register a new user.

**`POST /api/auth/login`**
- Log in a user and receive access/refresh tokens.

**`POST /api/auth/logout`**
- Log out a user and invalidate tokens.

**`POST /api/auth/refresh-token`**
- Obtain a new access token using a refresh token.

**`POST /api/auth/forgot-password`**
- Initiate the password reset process.

**`POST /api/auth/reset-password`**
- Reset the user's password using a token.

**`GET /api/auth/verify-email/:token`**
- Verify a user's email address.

---

## 👤 USERS

**`GET /api/users/profile`**
- Get the current authenticated user's profile.

**`PUT /api/users/profile`**
- Update the current user's profile information.

**`GET /api/users/bookings`**
- Get a list of the current user's bookings.

**`GET /api/users/reviews`**
- Get reviews submitted by the current user.

**`GET /api/users/saved-activities`**
- Get the user's list of saved/favorite activities.

**`POST /api/users/saved-activities/:activityId`**
- Add an activity to the user's saved list.

**`DELETE /api/users/saved-activities/:activityId`**
- Remove an activity from the user's saved list.

---

## 🎯 ACTIVITIES

**`GET /api/activities`**
- Get a list of all available activities with filtering and pagination.

**`GET /api/activities/:id`**
- Get detailed information for a single activity.

**`POST /api/activities`** (Partner only)
- Create a new activity.

**`PUT /api/activities/:id`** (Partner only)
- Update an existing activity.

**`DELETE /api/activities/:id`** (Partner only)
- Delete an activity.

**`GET /api/activities/search`**
- Search for activities based on various criteria.
- **Query Params**: `query`, `category`, `priceMin`, `priceMax`, `date`, `location`, `skillLevel`, `rating`, `sortBy`, `page`, `limit`

**`GET /api/activities/featured`**
- Get a list of featured activities.

**`GET /api/activities/category/:categoryId`**
- Get activities belonging to a specific category.

---

## 📅 BOOKINGS

**`GET /api/bookings`**
- Get a list of bookings for the authenticated user or partner.

**`GET /api/bookings/:id`**
- Get details of a specific booking.

**`POST /api/bookings`**
- Create a new booking.

**`PUT /api/bookings/:id/cancel`**
- Cancel an existing booking.

**`GET /api/bookings/:id/confirmation`**
- Get the confirmation details for a booking.

**`POST /api/bookings/:id/reschedule`**
- Request to reschedule a booking.

---

## 💳 PAYMENTS

**`POST /api/payments/create`**
- Create a payment intent for a booking.

**`GET /api/payments/:id/status`**
- Check the status of a payment.

**`POST /api/payments/:id/refund`** (Admin only)
- Process a refund for a payment.

**`POST /webhooks/moyasar`**
- Webhook endpoint to receive payment status updates from Moyasar.

---

## ⭐ REVIEWS

**`GET /api/reviews/activity/:activityId`**
- Get all reviews for a specific activity.

**`POST /api/reviews`**
- Submit a new review for a completed booking.

**`PUT /api/reviews/:id`**
- Update a review.

**`DELETE /api/reviews/:id`**
- Delete a review.

**`POST /api/reviews/:id/helpful`**
- Mark a review as helpful.

---

## 🏢 PARTNERS

**`GET /api/partners`**
- Get a list of all partners.

**`GET /api/partners/:id`**
- Get details for a specific partner.

**`POST /api/partners/register`**
- Register a new partner account.

**`PUT /api/partners/:id`**
- Update a partner's profile and settings.

**`GET /api/partners/:id/activities`**
- Get a list of activities for a specific partner.

**`GET /api/partners/:id/analytics`**
- Get analytics and performance data for a partner.
