import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { app } from "../app";
import mongoose from "mongoose";
import { User, Activity, Vendor, Booking } from "../models";

// Mock data
const mockAdminUser = {
  firstName: "Admin",
  lastName: "User",
  email: "admin@example.com",
  password: "password123",
  role: "admin"
};

const mockRegularUser = {
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

describe("Admin API", () => {
  let adminUser: any;
  let regularUser: any;
  let testVendor: any;
  let testActivity: any;
  let adminToken: string;
  let userToken: string;

  beforeEach(async () => {
    // Clear database
    await mongoose.connection.dropDatabase();

    // Create admin user
    adminUser = new User(mockAdminUser);
    await adminUser.save();

    // Create regular user
    regularUser = new User(mockRegularUser);
    await regularUser.save();

    // Create test vendor
    testVendor = new Vendor(mockVendor);
    await testVendor.save();

    // Create test activity
    mockActivity.vendor.vendorId = testVendor._id;
    testActivity = new Activity(mockActivity);
    await testActivity.save();

    // Get auth tokens (simplified for testing)
    adminToken = "admin-token";
    userToken = "user-token";
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  describe("GET /api/admin/dashboard/overview", () => {
    it("should return dashboard overview for admin user", async () => {
      const res = await request(app)
        .get("/api/admin/dashboard/overview")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.overview).toBeDefined();
      expect(res.body.overview.totalUsers).toBe(2); // admin + regular user
      expect(res.body.overview.totalActivities).toBe(1);
      expect(res.body.overview.totalVendors).toBe(1);
      expect(res.body.overview.totalBookings).toBe(0);
    });

    it("should return 403 for non-admin user", async () => {
      const res = await request(app)
        .get("/api/admin/dashboard/overview")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/admin/users", () => {
    it("should return list of users for admin", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.users).toBeDefined();
      expect(res.body.users).toHaveLength(2);
      expect(res.body.pagination).toBeDefined();
    });

    it("should filter users by role", async () => {
      const res = await request(app)
        .get("/api/admin/users?role=user")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.users).toHaveLength(1);
      expect(res.body.users[0].role).toBe("user");
    });

    it("should search users by name", async () => {
      const res = await request(app)
        .get("/api/admin/users?search=john")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.users).toHaveLength(1);
      expect(res.body.users[0].firstName).toBe("John");
    });
  });

  describe("GET /api/admin/analytics/users", () => {
    it("should return user analytics for admin", async () => {
      const res = await request(app)
        .get("/api/admin/analytics/users?period=30d")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.newUsers).toBeDefined();
      expect(res.body.userGrowth).toBeDefined();
      expect(res.body.roleDistribution).toBeDefined();
    });

    it("should return different periods", async () => {
      const periods = ['7d', '30d', '90d', '1y'];
      
      for (const period of periods) {
        const res = await request(app)
          .get(`/api/admin/analytics/users?period=${period}`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.newUsers).toBeDefined();
      }
    });
  });

  describe("GET /api/admin/analytics/bookings", () => {
    it("should return booking analytics for admin", async () => {
      const res = await request(app)
        .get("/api/admin/analytics/bookings?period=30d")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalBookings).toBeDefined();
      expect(res.body.revenue).toBeDefined();
      expect(res.body.statusDistribution).toBeDefined();
      expect(res.body.dailyBookings).toBeDefined();
    });
  });

  describe("PUT /api/admin/users/:id", () => {
    it("should update user status for admin", async () => {
      const updates = {
        isActive: false,
        role: "vendor"
      };

      const res = await request(app)
        .put(`/api/admin/users/${regularUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updates);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User updated successfully");
      expect(res.body.user.isActive).toBe(false);
      expect(res.body.user.role).toBe("vendor");
    });

    it("should return 404 for non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updates = { isActive: false };

      const res = await request(app)
        .put(`/api/admin/users/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updates);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("User not found");
    });
  });

  describe("PUT /api/admin/vendors/:id", () => {
    it("should update vendor status for admin", async () => {
      const updates = {
        status: "approved",
        isActive: true,
        verificationNotes: "Approved after review"
      };

      const res = await request(app)
        .put(`/api/admin/vendors/${testVendor._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updates);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Vendor updated successfully");
      expect(res.body.vendor.status).toBe("approved");
      expect(res.body.vendor.isActive).toBe(true);
    });
  });

  describe("PUT /api/admin/activities/:id", () => {
    it("should update activity status for admin", async () => {
      const updates = {
        status: "active",
        isFeatured: true
      };

      const res = await request(app)
        .put(`/api/admin/activities/${testActivity._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updates);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Activity updated successfully");
      expect(res.body.activity.status).toBe("active");
      expect(res.body.activity.isFeatured).toBe(true);
    });
  });
});
