import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { app } from "../app";
import mongoose from "mongoose";
import { User, Activity, Vendor, Booking } from "../models";

// Mock data
const mockUser = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "password123",
  role: "user"
};

const mockVendor = {
  name: "Test Vendor",
  description: "A test vendor",
  businessType: "activity",
  category: "outdoor-adventure",
  contact: {
    email: "vendor@example.com",
    phone: "123-456-7890"
  },
  location: {
    coordinates: [-122.4194, 37.7749],
    address: "123 Test St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    country: "USA"
  },
  isVerified: true,
  isActive: true,
  verificationStatus: "verified",
  owner: {
    userId: new mongoose.Types.ObjectId(),
    name: "Vendor Owner",
    email: "owner@example.com",
    phone: "123-456-7890"
  }
};

const mockActivity = {
  title: "Test Activity",
  description: "A test activity",
  shortDescription: "Test activity",
  category: "outdoor-adventure",
  tags: ["test", "outdoor"],
  vendor: {
    vendorId: new mongoose.Types.ObjectId(),
    name: "Test Vendor",
    verified: true
  },
  pricing: {
    basePrice: 50,
    currency: "USD",
    priceType: "per-person"
  },
  duration: {
    minDuration: 60,
    maxDuration: 120
  },
  location: {
    type: "on-site",
    coordinates: [-122.4194, 37.7749],
    address: "123 Test St"
  },
  capacity: {
    minParticipants: 1,
    maxParticipants: 10,
    skillLevel: "beginner"
  },
  availability: {
    isActive: true,
    availableDays: ["monday", "tuesday", "wednesday"],
    availableTimes: {
      startTime: "09:00",
      endTime: "17:00"
    },
    advanceBookingDays: 30,
    lastMinuteBooking: true,
    cancellationPolicy: "flexible",
    cancellationHours: 24
  },
  highlights: ["Fun", "Adventure"],
  included: ["Equipment", "Guide"],
  notIncluded: ["Transportation"],
  weatherDependent: false,
  indoorOutdoor: "outdoor",
  status: "active",
  isFeatured: false
};

describe("Bookings API", () => {
  let testUser: any;
  let testVendor: any;
  let testActivity: any;
  let authToken: string;

  beforeEach(async () => {
    // Clear database
    await mongoose.connection.dropDatabase();

    // Create test vendor
    testVendor = new Vendor(mockVendor);
    await testVendor.save();

    // Create test user
    testUser = new User(mockUser);
    await testUser.save();

    // Create test activity
    mockActivity.vendor.vendorId = testVendor._id;
    testActivity = new Activity(mockActivity);
    await testActivity.save();

    // Get auth token (simplified for testing)
    authToken = "test-token";
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  describe("POST /api/bookings", () => {
    it("should create a new booking successfully", async () => {
      const bookingData = {
        activityId: testActivity._id.toString(),
        participants: {
          adults: 2,
          children: 1,
          seniors: 0,
          total: 3
        },
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        timeSlot: "10:00",
        specialRequests: "Test request"
      };

      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${authToken}`)
        .send(bookingData);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Booking created successfully");
      expect(res.body.booking).toBeDefined();
      expect(res.body.booking.activity.title).toBe("Test Activity");
      expect(res.body.booking.participants.total).toBe(3);
    });

    it("should reject booking with invalid activity ID", async () => {
      const bookingData = {
        activityId: "invalid-id",
        participants: {
          adults: 1,
          total: 1
        },
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${authToken}`)
        .send(bookingData);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Activity not found or inactive");
    });

    it("should reject booking with insufficient capacity", async () => {
      // Create a booking that uses most of the capacity
      const existingBooking = new Booking({
        activity: {
          activityId: testActivity._id,
          title: testActivity.title,
          vendorName: testActivity.vendor.name,
          basePrice: testActivity.pricing.basePrice,
          currency: testActivity.pricing.currency,
          priceType: testActivity.pricing.priceType
        },
        vendor: {
          vendorId: testVendor._id,
          name: testVendor.name,
          contactEmail: testVendor.contact.email,
          contactPhone: testVendor.contact.phone
        },
        participants: {
          adults: 8,
          total: 8
        },
        bookingDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        startTime: "10:00",
        endTime: "12:00",
        duration: 120,
        user: {
          userId: testUser._id,
          name: `${testUser.firstName} ${testUser.lastName}`,
          email: testUser.email,
          phone: testUser.phone
        },
        status: "pending",
        pricing: {
          basePrice: testActivity.pricing.basePrice,
          participantCount: 8,
          subtotal: testActivity.pricing.basePrice * 8,
          taxes: 0,
          fees: 0,
          discounts: [],
          total: testActivity.pricing.basePrice * 8,
          currency: testActivity.pricing.currency
        }
      });
      await existingBooking.save();

      // Try to book more than capacity
      const bookingData = {
        activityId: testActivity._id.toString(),
        participants: {
          adults: 3,
          total: 3
        },
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${authToken}`)
        .send(bookingData);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Insufficient capacity for this date and time");
    });
  });

  describe("GET /api/bookings/availability", () => {
    it("should return availability for a valid activity and date", async () => {
      const res = await request(app)
        .get("/api/bookings/availability")
        .query({
          activityId: testActivity._id.toString(),
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

      expect(res.status).toBe(200);
      expect(res.body.remainingCapacity).toBe(10); // maxParticipants
      expect(res.body.slotAvailability).toBeDefined();
    });

    it("should return 404 for invalid activity ID", async () => {
      const res = await request(app)
        .get("/api/bookings/availability")
        .query({
          activityId: "invalid-id",
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Activity not found or inactive");
    });

    it("should return 400 for missing parameters", async () => {
      const res = await request(app)
        .get("/api/bookings/availability")
        .query({
          activityId: testActivity._id.toString()
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("activityId and date are required");
    });
  });

  describe("GET /api/bookings/my-bookings", () => {
    it("should return user's bookings", async () => {
      // Create a test booking
      const testBooking = new Booking({
        activity: {
          activityId: testActivity._id,
          title: testActivity.title,
          vendorName: testActivity.vendor.name,
          basePrice: testActivity.pricing.basePrice,
          currency: testActivity.pricing.currency,
          priceType: testActivity.pricing.priceType
        },
        vendor: {
          vendorId: testVendor._id,
          name: testVendor.name,
          contactEmail: testVendor.contact.email,
          contactPhone: testVendor.contact.phone
        },
        participants: {
          adults: 1,
          total: 1
        },
        bookingDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        startTime: "10:00",
        endTime: "12:00",
        duration: 120,
        user: {
          userId: testUser._id,
          name: `${testUser.firstName} ${testUser.lastName}`,
          email: testUser.email,
          phone: testUser.phone
        },
        status: "pending",
        pricing: {
          basePrice: testActivity.pricing.basePrice,
          participantCount: 1,
          subtotal: testActivity.pricing.basePrice,
          taxes: 0,
          fees: 0,
          discounts: [],
          total: testActivity.pricing.basePrice,
          currency: testActivity.pricing.currency
        }
      });
      await testBooking.save();

      const res = await request(app)
        .get("/api/bookings/my-bookings")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.bookings).toHaveLength(1);
      expect(res.body.bookings[0].activity.title).toBe("Test Activity");
    });
  });

  describe("PATCH /api/bookings/:id/cancel", () => {
    it("should cancel a booking successfully", async () => {
      // Create a test booking
      const testBooking = new Booking({
        activity: {
          activityId: testActivity._id,
          title: testActivity.title,
          vendorName: testActivity.vendor.name,
          basePrice: testActivity.pricing.basePrice,
          currency: testActivity.pricing.currency,
          priceType: testActivity.pricing.priceType
        },
        vendor: {
          vendorId: testVendor._id,
          name: testVendor.name,
          contactEmail: testVendor.contact.email,
          contactPhone: testVendor.contact.phone
        },
        participants: {
          adults: 1,
          total: 1
        },
        bookingDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        startTime: "10:00",
        endTime: "12:00",
        duration: 120,
        user: {
          userId: testUser._id,
          name: `${testUser.firstName} ${testUser.lastName}`,
          email: testUser.email,
          phone: testUser.phone
        },
        status: "pending",
        pricing: {
          basePrice: testActivity.pricing.basePrice,
          participantCount: 1,
          subtotal: testActivity.pricing.basePrice,
          taxes: 0,
          fees: 0,
          discounts: [],
          total: testActivity.pricing.basePrice,
          currency: testActivity.pricing.currency
        }
      });
      await testBooking.save();

      const res = await request(app)
        .patch(`/api/bookings/${testBooking._id}/cancel`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Booking cancelled successfully");
      expect(res.body.booking.status).toBe("cancelled");
    });
  });
});
