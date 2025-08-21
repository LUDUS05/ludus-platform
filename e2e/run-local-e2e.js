/*
 * LUDUS Local E2E Test (Mock Payments)
 * Runs against in-memory MongoDB and local Express app
 */

process.env.NODE_ENV = 'test';
process.env.MOYASAR_MOCK = 'true';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const axios = require('axios');
const { connectTestDB, disconnectTestDB } = require('../server/src/config/test-database');

const API_BASE_URL = 'http://localhost:5000/api';
let accessToken = '';
let testUserId = '';
let ids = { vendorId: '', activityId: '', bookingId: '', paymentId: '' };

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const makeRequest = async (method, endpoint, data = null, useAuth = false) => {
  const config = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...(useAuth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    },
    ...(data ? { data } : {})
  };
  const response = await axios(config);
  return response.data;
};

async function registerUser() {
  const payload = {
    firstName: 'Ahmed',
    lastName: 'Al-Rashid',
    email: `ahmed.e2e.${Date.now()}@ludusapp.com`,
    password: 'TestPassword123!'
  };
  const result = await makeRequest('POST', '/auth/register', payload);
  accessToken = result.data.accessToken;
  testUserId = result.data.user.id;
}

async function createSeedDataDirect() {
  const Vendor = require('../server/src/models/Vendor');
  const Activity = require('../server/src/models/Activity');

  const vendor = new Vendor({
    businessName: 'Saudi Adventure Tours',
    slug: 'saudi-adventure-tours',
    description: 'Premier adventure tour operator in Saudi Arabia providing unique outdoor experiences across the kingdom.',
    contactInfo: {
      email: 'info@saudiadventuretours.com',
      phone: '+966112345678'
    },
    location: {
      address: 'King Fahd Road, Riyadh',
      city: 'Riyadh',
      state: 'Riyadh',
      zipCode: '12271',
      coordinates: [46.7219, 24.6408]
    },
    categories: ['outdoor'],
    createdBy: testUserId
  });
  await vendor.save();
  ids.vendorId = vendor._id.toString();

  const activity = new Activity({
    title: 'Desert Safari Adventure',
    slug: 'desert-safari-adventure',
    description: 'Experience dune bashing, camel riding, and desert camp in the beautiful Saudi desert with expert guides.',
    shortDescription: 'Dune bashing, camel rides, and a desert camp experience.',
    vendor: vendor._id,
    category: 'outdoor',
    pricing: { basePrice: 150, currency: 'SAR', priceType: 'per_person' },
    duration: { hours: 4 },
    capacity: { min: 1, max: 8 },
    location: {
      address: 'Al Thumamah Desert, Riyadh',
      city: 'Riyadh',
      state: 'Riyadh',
      coordinates: [46.7219, 24.6408]
    },
    tags: ['desert', 'safari', 'adventure'],
    createdBy: testUserId
  });
  await activity.save();
  ids.activityId = activity._id.toString();
}

async function listActivities() {
  const result = await makeRequest('GET', '/activities');
  if (!Array.isArray(result.data.activities) || result.data.activities.length === 0) {
    throw new Error('Activities list is empty');
  }
}

async function getActivityDetails() {
  const result = await makeRequest('GET', `/activities/${ids.activityId}`);
  if (result.data.activity._id !== ids.activityId) {
    throw new Error('Activity details mismatch');
  }
}

async function createBooking() {
  const payload = {
    activity: ids.activityId,
    vendor: ids.vendorId,
    bookingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    timeSlot: { startTime: '10:00', endTime: '14:00' },
    participants: {
      count: 2,
      details: [
        { name: 'Ahmed Al-Rashid', age: 30, email: 'ahmed@example.com' },
        { name: 'Sarah Al-Rashid', age: 28, email: 'sarah@example.com' }
      ]
    },
    pricing: { basePrice: 150 },
    contactInfo: { email: 'ahmed@example.com', phone: '+966555123456' },
    specialRequests: 'Vegetarian meals preferred',
    waiverSigned: true,
    waiverSignedAt: new Date()
  };
  const result = await makeRequest('POST', '/bookings', payload, true);
  ids.bookingId = result.data.booking._id;
}

async function createPayment() {
  const payload = {
    bookingId: ids.bookingId,
    paymentMethod: 'credit_card',
    cardData: {
      name: 'Ahmed Al-Rashid',
      number: '4242424242424242',
      cvc: '123',
      month: 12,
      year: new Date().getFullYear() + 2
    }
  };
  const result = await makeRequest('POST', '/payments/create-payment', payload, true);
  ids.paymentId = result.data.paymentId;
}

async function getUserBookings() {
  const result = await makeRequest('GET', '/bookings', null, true);
  if (!Array.isArray(result.data.bookings) || result.data.bookings.length === 0) {
    throw new Error('No bookings found for user');
  }
}

async function cancelBooking() {
  const result = await makeRequest('PUT', `/bookings/${ids.bookingId}/cancel`, { reason: 'Change of plans' }, true);
  if (result.data.booking.status !== 'cancelled') {
    throw new Error('Booking cancellation failed');
  }
}

async function run() {
  console.log('🚀 Starting LUDUS Local E2E (mock payments)');
  let server;

  try {
    await connectTestDB();

    const app = require('../server/src/app');
    server = app.listen(5000, () => {
      console.log('Test server started on port 5000');
    });
    await sleep(1000);

    await registerUser();
    await createSeedDataDirect();
    await listActivities();
    await getActivityDetails();
    await createBooking();
    await getUserBookings();
    await createPayment();
    await getUserBookings();
    await cancelBooking();

    console.log('\n🎉 E2E flow completed successfully');
    process.exitCode = 0;
  } catch (err) {
    console.error('\n💥 E2E failed:', err?.response?.data || err.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await disconnectTestDB();
  }
}

if (require.main === module) {
  run();
}