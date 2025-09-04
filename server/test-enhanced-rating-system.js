const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models and services
const RatingSystemConfig = require('./src/models/RatingSystemConfig');
const UserRatingProfile = require('./src/models/UserRatingProfile');
const RatingAssignment = require('./src/models/RatingAssignment');
const RatingRecord = require('./src/models/RatingRecord');
const User = require('./src/models/User');
const Activity = require('./src/models/Activity');
const Vendor = require('./src/models/Vendor');
const Booking = require('./src/models/Booking');
const ratingSystemService = require('./src/services/ratingSystemService');

// Test database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ludus-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test data setup
const setupTestData = async () => {
  try {
    console.log('\n🔧 Setting up test data...');
    
    // Create test vendor
    const vendor = new Vendor({
      name: 'Test Wellness Studio',
      email: 'test@wellness.com',
      phone: '+966501234567',
      description: 'A test wellness studio for rating system testing',
      categories: ['wellness'],
      location: {
        address: 'Test Address, Riyadh',
        city: 'Riyadh',
        coordinates: [46.6753, 24.7136]
      },
      isActive: true
    });
    await vendor.save();
    console.log('✅ Test vendor created');

    // Create test users
    const users = [];
    for (let i = 1; i <= 5; i++) {
      const user = new User({
        firstName: `Test${i}`,
        lastName: 'User',
        email: `testuser${i}@example.com`,
        password: 'password123',
        role: 'user',
        preferences: {
          categories: ['wellness'],
          language: 'en'
        }
      });
      await user.save();
      users.push(user);
    }
    console.log('✅ Test users created');

    // Create test activity
    const activity = new Activity({
      title: 'Morning Yoga Session',
      description: 'A relaxing morning yoga session',
      category: 'wellness',
      vendor: vendor._id,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      duration: 60,
      maxParticipants: 10,
      price: 50,
      location: {
        address: 'Test Yoga Studio',
        coordinates: [46.6753, 24.7136]
      },
      isActive: true
    });
    await activity.save();
    console.log('✅ Test activity created');

    // Create test bookings
    for (const user of users) {
      const booking = new Booking({
        user: user._id,
        activity: activity._id,
        status: 'confirmed',
        totalAmount: 50,
        paymentStatus: 'paid'
      });
      await booking.save();
    }
    console.log('✅ Test bookings created');

    return { vendor, users, activity };
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
    throw error;
  }
};

// Test rating system configuration
const testRatingSystemConfig = async () => {
  try {
    console.log('\n🧪 Testing rating system configuration...');
    
    const config = await RatingSystemConfig.getConfig();
    console.log('✅ Rating system configuration loaded');
    
    // Test tier calculation
    const bronzeTier = config.getTierForRating(2.0);
    const silverTier = config.getTierForRating(3.0);
    const goldTier = config.getTierForRating(4.0);
    const platinumTier = config.getTierForRating(4.5);
    
    console.log(`✅ Tier calculations: Bronze(${bronzeTier}), Silver(${silverTier}), Gold(${goldTier}), Platinum(${platinumTier})`);
    
    // Test benefits
    const goldBenefits = config.getTierBenefits('gold');
    const goldDiscount = config.getDiscountRate('gold');
    
    console.log(`✅ Gold tier benefits: ${goldBenefits.join(', ')}`);
    console.log(`✅ Gold tier discount: ${goldDiscount}%`);
    
    return config;
  } catch (error) {
    console.error('❌ Error testing rating system config:', error);
    throw error;
  }
};

// Test user rating profiles
const testUserRatingProfiles = async (users) => {
  try {
    console.log('\n🧪 Testing user rating profiles...');
    
    for (const user of users) {
      const profile = await ratingSystemService.getUserRatingProfile(user._id);
      console.log(`✅ Created rating profile for user ${user.firstName} ${user.lastName}`);
      
      // Test tier calculation
      const nextTierProgress = profile.calculateNextTierProgress(await RatingSystemConfig.getConfig());
      console.log(`✅ Next tier progress for ${user.firstName}: ${(nextTierProgress * 100).toFixed(1)}%`);
    }
  } catch (error) {
    console.error('❌ Error testing user rating profiles:', error);
    throw error;
  }
};

// Test rating assignments
const testRatingAssignments = async (activity) => {
  try {
    console.log('\n🧪 Testing rating assignments...');
    
    const assignment = await ratingSystemService.createRatingAssignments(activity._id);
    
    if (assignment) {
      console.log(`✅ Created rating assignment for activity: ${assignment.activityTitle}`);
      console.log(`✅ Total participants: ${assignment.participants.length}`);
      console.log(`✅ Total assignments: ${assignment.assignments.length}`);
      console.log(`✅ Coverage percentage: ${assignment.distributionMetrics.coveragePercentage.toFixed(1)}%`);
      console.log(`✅ Balance score: ${assignment.distributionMetrics.balanceScore.toFixed(2)}`);
      
      return assignment;
    } else {
      console.log('⚠️ No rating assignment created (insufficient participants)');
      return null;
    }
  } catch (error) {
    console.error('❌ Error testing rating assignments:', error);
    throw error;
  }
};

// Test rating submission
const testRatingSubmission = async (assignment, users) => {
  try {
    console.log('\n🧪 Testing rating submission...');
    
    if (!assignment) {
      console.log('⚠️ Skipping rating submission test (no assignment)');
      return;
    }
    
    const rater = users[0];
    const targetUser = users[1];
    
    const ratingData = {
      eventId: assignment.eventId,
      raterId: rater._id,
      targetUserId: targetUser._id,
      criteria: {
        punctuality: { score: 4, comment: 'Always on time' },
        engagement: { score: 5, comment: 'Very engaged' },
        respectfulness: { score: 4, comment: 'Respectful person' },
        teamwork: { score: 5, comment: 'Great team player' }
      },
      overallScore: 4.5,
      generalComment: 'Great person to have in activities!',
      wouldParticipateAgain: true,
      reportFlags: []
    };
    
    const ratingRecord = await ratingSystemService.submitRating(ratingData);
    console.log(`✅ Rating submitted successfully: ${ratingRecord.overallScore} stars`);
    console.log(`✅ Weighted score: ${ratingRecord.weightedScore.toFixed(2)}`);
    
    // Test rating recalculation
    const updatedProfile = await ratingSystemService.recalculateUserRating(targetUser._id);
    console.log(`✅ Updated target user profile: ${updatedProfile.overall.currentScore.toFixed(2)} stars`);
    
    return ratingRecord;
  } catch (error) {
    console.error('❌ Error testing rating submission:', error);
    throw error;
  }
};

// Test rating statistics
const testRatingStatistics = async () => {
  try {
    console.log('\n🧪 Testing rating statistics...');
    
    const statistics = await ratingSystemService.getRatingStatistics();
    console.log('✅ Rating statistics retrieved');
    
    if (statistics.length > 0) {
      const stats = statistics[0];
      console.log(`✅ Total ratings: ${stats.totalRatings}`);
      console.log(`✅ Average rating: ${stats.averageRating.toFixed(2)}`);
      console.log(`✅ Flagged ratings: ${stats.flaggedRatings}`);
    }
    
    const topUsers = await ratingSystemService.getTopRatedUsers(5);
    console.log(`✅ Top rated users: ${topUsers.length} users`);
    
  } catch (error) {
    console.error('❌ Error testing rating statistics:', error);
    throw error;
  }
};

// Test monthly bonus processing
const testMonthlyBonuses = async () => {
  try {
    console.log('\n🧪 Testing monthly bonus processing...');
    
    const processedCount = await ratingSystemService.processMonthlyBonuses();
    console.log(`✅ Processed monthly bonuses for ${processedCount} users`);
    
  } catch (error) {
    console.error('❌ Error testing monthly bonuses:', error);
    throw error;
  }
};

// Cleanup test data
const cleanupTestData = async () => {
  try {
    console.log('\n🧹 Cleaning up test data...');
    
    await RatingRecord.deleteMany({});
    await RatingAssignment.deleteMany({});
    await UserRatingProfile.deleteMany({});
    await Booking.deleteMany({});
    await Activity.deleteMany({});
    await User.deleteMany({ email: /testuser/ });
    await Vendor.deleteMany({ email: 'test@wellness.com' });
    
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
    throw error;
  }
};

// Main test function
const runTests = async () => {
  try {
    console.log('🚀 Starting Enhanced Rating System Tests');
    console.log('==========================================');
    
    await connectDB();
    
    // Setup test data
    const testData = await setupTestData();
    
    // Run tests
    await testRatingSystemConfig();
    await testUserRatingProfiles(testData.users);
    const assignment = await testRatingAssignments(testData.activity);
    await testRatingSubmission(assignment, testData.users);
    await testRatingStatistics();
    await testMonthlyBonuses();
    
    // Cleanup
    await cleanupTestData();
    
    console.log('\n==========================================');
    console.log('✅ All Enhanced Rating System Tests Passed!');
    console.log('==========================================');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  setupTestData,
  testRatingSystemConfig,
  testUserRatingProfiles,
  testRatingAssignments,
  testRatingSubmission,
  testRatingStatistics,
  testMonthlyBonuses,
  cleanupTestData
};
