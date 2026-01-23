const axios = require('axios');
const { connectTestDB, disconnectTestDB, clearTestDB } = require('./server/src/config/test-database');

// Test configuration
const API_BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testUserId = '';
let testActivityId = '';
let testBookingId = '';

// Test data
const testUser = {
  firstName: 'Ahmed',
  lastName: 'Al-Rashid',
  email: 'ahmed.test@ludusapp.com',
  password: 'TestPassword123!',
  phone: '+966555123456'
};

const testActivity = {
  title: 'Desert Safari Adventure',
  description: 'Experience the thrill of dune bashing and camel riding in the beautiful Saudi desert.',
  category: 'outdoor',
  pricing: {
    basePrice: 150,
    currency: 'SAR'
  },
  duration: '4 hours',
  maxParticipants: 8,
  isActive: true,
  location: {
    address: 'Al Thumamah Desert, Riyadh',
    city: 'Riyadh',
    state: 'Riyadh',
    country: 'Saudi Arabia',
    coordinates: [46.7219, 24.6408]
  }
};

const testVendor = {
  businessName: 'Saudi Adventure Tours',
  description: 'Premier adventure tour operator in Saudi Arabia',
  category: 'outdoor',
  isActive: true,
  location: {
    address: 'King Fahd Road, Riyadh',
    city: 'Riyadh',
    state: 'Riyadh',
    country: 'Saudi Arabia'
  },
  contactInfo: {
    phone: '+966112345678',
    email: 'info@saudiadventuretours.com'
  }
};

// Helper functions
const makeRequest = async (method, endpoint, data = null, useAuth = false) => {
  const config = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...(useAuth && authToken ? { Authorization: `Bearer ${authToken}` } : {})
    },
    ...(data ? { data } : {})
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test functions
const testUserRegistration = async () => {
  console.log('\n🔐 Testing user registration...');
  try {
    const result = await makeRequest('POST', '/auth/register', testUser);
    console.log('✅ User registration successful');
    testUserId = result.data.user._id;
    authToken = result.data.token;
    return true;
  } catch (error) {
    console.error('❌ User registration failed:', error.response?.data?.message);
    return false;
  }
};

const testUserLogin = async () => {
  console.log('\n🔑 Testing user login...');
  try {
    const result = await makeRequest('POST', '/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ User login successful');
    authToken = result.data.token;
    return true;
  } catch (error) {
    console.error('❌ User login failed:', error.response?.data?.message);
    return false;
  }
};

const createTestData = async () => {
  console.log('\n📊 Creating test data...');
  
  // Start the Express server
  const app = require('./server/src/app');
  const server = app.listen(5000, () => {
    console.log('Test server started on port 5000');
  });

  // Wait for server to start
  await sleep(2000);

  try {
    // Create vendor directly in database
    const Vendor = require('./server/src/models/Vendor');
    const vendor = new Vendor({
      ...testVendor,
      createdBy: testUserId
    });
    await vendor.save();

    // Create activity directly in database
    const Activity = require('./server/src/models/Activity');
    const activity = new Activity({
      ...testActivity,
      vendor: vendor._id,
      createdBy: testUserId
    });
    await activity.save();
    testActivityId = activity._id;

    console.log('✅ Test data created successfully');
    return { server, vendor, activity };
  } catch (error) {
    console.error('❌ Failed to create test data:', error);
    throw error;
  }
};

const testActivityBrowsing = async () => {
  console.log('\n🎯 Testing activity browsing...');
  try {
    const result = await makeRequest('GET', '/activities');
    console.log(`✅ Found ${result.data.activities.length} activities`);
    return result.data.activities.length > 0;
  } catch (error) {
    console.error('❌ Activity browsing failed:', error.response?.data?.message);
    return false;
  }
};

const testActivityDetails = async () => {
  console.log('\n📋 Testing activity details...');
  try {
    const result = await makeRequest('GET', `/activities/${testActivityId}`);
    console.log(`✅ Activity details loaded: ${result.data.activity.title}`);
    return result.data.activity._id === testActivityId.toString();
  } catch (error) {
    console.error('❌ Activity details failed:', error.response?.data?.message);
    return false;
  }
};

const testBookingCreation = async () => {
  console.log('\n📅 Testing booking creation...');
  
  const bookingData = {
    activity: testActivityId,
    vendor: testActivityId, // Will be set correctly by the activity lookup
    bookingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    timeSlot: '10:00',
    participants: {
      count: 2,
      details: [
        { name: 'Ahmed Al-Rashid', age: 30, email: 'ahmed@example.com' },
        { name: 'Sarah Al-Rashid', age: 28, email: 'sarah@example.com' }
      ]
    },
    pricing: {
      basePrice: 150,
      totalPrice: 300
    },
    contactInfo: {
      primaryContact: {
        name: 'Ahmed Al-Rashid',
        phone: '+966555123456',
        email: 'ahmed@example.com'
      }
    },
    specialRequests: 'Vegetarian meals preferred',
    waiverSigned: true,
    waiverSignedAt: new Date()
  };

  try {
    const result = await makeRequest('POST', '/bookings', bookingData, true);
    console.log(`✅ Booking created successfully: ${result.data.booking._id}`);
    testBookingId = result.data.booking._id;
    return true;
  } catch (error) {
    console.error('❌ Booking creation failed:', error.response?.data?.message);
    return false;
  }
};

const testPaymentCreation = async () => {
  console.log('\n💳 Testing payment creation...');
  
  const paymentData = {
    bookingId: testBookingId,
    amount: 300, // 300 SAR
    currency: 'SAR',
    description: 'Desert Safari Adventure - 2 participants',
    customer: {
      name: 'Ahmed Al-Rashid',
      email: 'ahmed@example.com',
      phone: '+966555123456'
    },
    successUrl: 'http://localhost:3000/payment/success',
    failureUrl: 'http://localhost:3000/payment/failure'
  };

  try {
    const result = await makeRequest('POST', '/payments/create', paymentData, true);
    console.log(`✅ Payment created successfully: ${result.data.payment.id}`);
    console.log(`Payment URL: ${result.data.payment.source.transaction_url}`);
    return true;
  } catch (error) {
    console.error('❌ Payment creation failed:', error.response?.data?.message);
    return false;
  }
};

const testUserBookings = async () => {
  console.log('\n📋 Testing user bookings retrieval...');
  try {
    const result = await makeRequest('GET', '/bookings', null, true);
    console.log(`✅ Found ${result.data.bookings.length} user bookings`);
    return result.data.bookings.length > 0;
  } catch (error) {
    console.error('❌ User bookings retrieval failed:', error.response?.data?.message);
    return false;
  }
};

const testBookingCancellation = async () => {
  console.log('\n❌ Testing booking cancellation...');
  
  const cancellationData = {
    reason: 'Change of plans - family emergency'
  };

  try {
    const result = await makeRequest('PUT', `/bookings/${testBookingId}/cancel`, cancellationData, true);
    console.log(`✅ Booking cancelled successfully`);
    console.log(`Refund amount: ${result.data.booking.cancellation?.refundAmount || 0} SAR`);
    return true;
  } catch (error) {
    console.error('❌ Booking cancellation failed:', error.response?.data?.message);
    return false;
  }
};

// Main test runner
const runPaymentFlowTest = async () => {
  console.log('🚀 Starting LUDUS Payment Flow End-to-End Test');
  console.log('================================================');

  let server;
  
  try {
    // Connect to test database
    await connectTestDB();
    console.log('✅ Test database connected');

    // Create test data and start server
    const testSetup = await createTestData();
    server = testSetup.server;

    // Run authentication tests
    const registrationSuccess = await testUserRegistration();
    if (!registrationSuccess) {
      throw new Error('User registration failed');
    }

    // Run activity browsing tests
    const browsingSuccess = await testActivityBrowsing();
    if (!browsingSuccess) {
      throw new Error('Activity browsing failed');
    }

    const detailsSuccess = await testActivityDetails();
    if (!detailsSuccess) {
      throw new Error('Activity details failed');
    }

    // Run booking tests
    const bookingSuccess = await testBookingCreation();
    if (!bookingSuccess) {
      throw new Error('Booking creation failed');
    }

    const bookingsSuccess = await testUserBookings();
    if (!bookingsSuccess) {
      throw new Error('User bookings retrieval failed');
    }

    // Run payment tests
    const paymentSuccess = await testPaymentCreation();
    if (!paymentSuccess) {
      throw new Error('Payment creation failed');
    }

    // Test cancellation
    const cancellationSuccess = await testBookingCancellation();
    if (!cancellationSuccess) {
      throw new Error('Booking cancellation failed');
    }

    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('================================================');
    console.log('✅ User Registration & Authentication');
    console.log('✅ Activity Browsing & Details');
    console.log('✅ Booking Creation & Management');
    console.log('✅ Payment Processing (Moyasar)');
    console.log('✅ Booking Cancellation & Refunds');
    console.log('\n🚀 Payment flow is working end-to-end!');

  } catch (error) {
    console.error('\n💥 TEST FAILED:', error.message);
    console.error('================================================');
  } finally {
    // Cleanup
    if (server) {
      server.close();
    }
    await disconnectTestDB();
    console.log('\n🧹 Test cleanup completed');
  }
};

// Run the test if this file is executed directly
if (require.main === module) {
  runPaymentFlowTest();
}

module.exports = { runPaymentFlowTest };