const mongoose = require('mongoose');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const ratingAssignmentAlgorithm = require('./src/services/ratingAssignmentAlgorithm');
const ratingCalculationEngine = require('./src/services/ratingCalculationEngine');
const ratingSystemService = require('./src/services/ratingSystemService');
const RatingSystemConfig = require('./src/models/RatingSystemConfig');
const UserRatingProfile = require('./src/models/UserRatingProfile');
const RatingRecord = require('./src/models/RatingRecord');
const User = require('./src/models/User');

chai.use(chaiAsPromised);
const expect = chai.expect;

// Test configuration
const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ludus_test';

describe('Advanced Rating System Algorithms', () => {
  before(async () => {
    try {
      await mongoose.connect(TEST_DB_URI);
      console.log('✅ Connected to test database');
      
      // Clean up test data
      await Promise.all([
        RatingSystemConfig.deleteMany({}),
        UserRatingProfile.deleteMany({}),
        RatingRecord.deleteMany({}),
        User.deleteMany({ email: /test.*@example\.com/ })
      ]);
      
      // Initialize test configuration
      await initializeTestConfig();
      await createTestUsers();
      
    } catch (error) {
      console.error('❌ Test setup failed:', error);
      throw error;
    }
  });

  after(async () => {
    try {
      // Clean up test data
      await Promise.all([
        RatingSystemConfig.deleteMany({}),
        UserRatingProfile.deleteMany({}),
        RatingRecord.deleteMany({}),
        User.deleteMany({ email: /test.*@example\.com/ })
      ]);
      
      await mongoose.connection.close();
      console.log('✅ Test database connection closed');
    } catch (error) {
      console.error('❌ Test cleanup failed:', error);
    }
  });

  describe('Rating Assignment Algorithm', () => {
    let testParticipants;
    let testVendor;
    let testConfig;

    beforeEach(async () => {
      testParticipants = [
        { id: 'user1', name: 'Test User 1', tier: 'bronze' },
        { id: 'user2', name: 'Test User 2', tier: 'silver' },
        { id: 'user3', name: 'Test User 3', tier: 'gold' },
        { id: 'user4', name: 'Test User 4', tier: 'bronze' },
        { id: 'user5', name: 'Test User 5', tier: 'platinum' }
      ];

      testVendor = {
        _id: 'vendor1',
        name: 'Test Vendor'
      };

      testConfig = await RatingSystemConfig.getConfig();
    });

    it('should generate balanced rating assignments', async () => {
      const result = await ratingAssignmentAlgorithm.generateRatingAssignments(
        testParticipants,
        testVendor,
        testConfig,
        { strategy: 'balanced' }
      );

      expect(result).to.have.property('assignments');
      expect(result).to.have.property('strategy', 'balanced');
      expect(result).to.have.property('metrics');
      expect(result.assignments).to.be.an('array');
      expect(result.assignments).to.have.length(testParticipants.length);

      // Each participant should have assignments
      result.assignments.forEach(assignment => {
        expect(assignment).to.have.property('raterId');
        expect(assignment).to.have.property('toRate');
        expect(assignment.toRate).to.be.an('array');
        expect(assignment.toRate.length).to.be.greaterThan(0);
        
        // Should include vendor rating
        const vendorRating = assignment.toRate.find(r => r.type === 'vendor');
        expect(vendorRating).to.exist;
        expect(vendorRating.id).to.equal(testVendor._id);
      });
    });

    it('should ensure good coverage across participants', async () => {
      const result = await ratingAssignmentAlgorithm.generateRatingAssignments(
        testParticipants,
        testVendor,
        testConfig,
        { strategy: 'balanced' }
      );

      const metrics = result.metrics;
      expect(metrics.coveragePercentage).to.be.greaterThan(80);
      expect(metrics.balanceScore).to.be.greaterThan(0.5);
      expect(metrics.totalAssignments).to.equal(testParticipants.length);
    });

    it('should avoid self-rating conflicts', async () => {
      const result = await ratingAssignmentAlgorithm.generateRatingAssignments(
        testParticipants,
        testVendor,
        testConfig,
        { strategy: 'balanced' }
      );

      result.assignments.forEach(assignment => {
        assignment.toRate.forEach(target => {
          expect(assignment.raterId).to.not.equal(target.id);
        });
      });
    });

    it('should select optimal strategy based on participant characteristics', async () => {
      const smallGroup = testParticipants.slice(0, 3);
      const largeGroup = [...testParticipants, ...testParticipants, ...testParticipants];

      const smallStrategy = ratingAssignmentAlgorithm.selectOptimalStrategy(smallGroup, testConfig, {});
      const largeStrategy = ratingAssignmentAlgorithm.selectOptimalStrategy(largeGroup, testConfig, {});

      expect(smallStrategy).to.be.oneOf(['balanced', 'tier_balanced']);
      expect(largeStrategy).to.be.oneOf(['demographic_balanced', 'balanced']);
    });

    it('should handle edge cases gracefully', async () => {
      // Test with minimum participants
      const minParticipants = testParticipants.slice(0, 2);
      
      const result = await ratingAssignmentAlgorithm.generateRatingAssignments(
        minParticipants,
        testVendor,
        testConfig,
        { strategy: 'balanced' }
      );

      expect(result.assignments).to.have.length(2);
      expect(result.metrics.coveragePercentage).to.be.greaterThan(0);
    });
  });

  describe('Rating Calculation Engine', () => {
    let testUserId;
    let testRatings;

    beforeEach(async () => {
      // Create test user and profile
      const user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@example.com',
        password: 'password123'
      });
      await user.save();
      testUserId = user._id;

      // Create rating profile
      const profile = new UserRatingProfile({
        userId: testUserId,
        overall: {
          currentScore: 0,
          baseScore: 0,
          totalRatings: 0,
          trend: 'stable',
          scoreHistory: []
        },
        criteria: {
          punctuality: { score: 0, count: 0, lastUpdated: new Date() },
          participation: { score: 0, count: 0, lastUpdated: new Date() },
          respectfulness: { score: 0, count: 0, lastUpdated: new Date() },
          helpfulness: { score: 0, count: 0, lastUpdated: new Date() }
        },
        tier: {
          current: 'bronze',
          previous: null,
          changedAt: new Date(),
          tierHistory: []
        },
        monthlyActivity: {
          currentMonth: new Date().toISOString().slice(0, 7),
          participationCount: 0,
          bonusApplied: false,
          bonusAmount: 0
        },
        rewards: {
          currentDiscountRate: 0,
          unlockedBenefits: []
        },
        ratingBehavior: {
          ratingCompletionRate: 0,
          helpfulRatingsCount: 0,
          averageRatingTime: 0
        },
        statistics: {
          totalEventsParticipated: 0,
          favoriteCategories: [],
          averageEventRating: 0
        }
      });
      await profile.save();

      // Create test ratings
      testRatings = [
        new RatingRecord({
          raterId: 'rater1',
          targetUserId: testUserId,
          targetType: 'peer',
          criteria: {
            punctuality: { score: 4, comment: 'Always on time' },
            participation: { score: 5, comment: 'Very active' },
            respectfulness: { score: 4, comment: 'Respectful' },
            helpfulness: { score: 3, comment: 'Somewhat helpful' }
          },
          overallScore: 4.0,
          weightedScore: 4.0,
          generalComment: 'Good participant',
          wouldParticipateAgain: true,
          submittedAt: new Date()
        }),
        new RatingRecord({
          raterId: 'rater2',
          targetUserId: testUserId,
          targetType: 'peer',
          criteria: {
            punctuality: { score: 5, comment: 'Perfect timing' },
            participation: { score: 4, comment: 'Good participation' },
            respectfulness: { score: 5, comment: 'Very respectful' },
            helpfulness: { score: 4, comment: 'Helpful' }
          },
          overallScore: 4.5,
          weightedScore: 4.5,
          generalComment: 'Excellent participant',
          wouldParticipateAgain: true,
          submittedAt: new Date()
        })
      ];
      await RatingRecord.insertMany(testRatings);
    });

    it('should calculate weighted average scores correctly', async () => {
      const result = await ratingCalculationEngine.recalculateUserRating(testUserId, {
        calculationType: 'weighted_average'
      });

      expect(result).to.have.property('profile');
      expect(result).to.have.property('calculationResult');
      
      const profile = result.profile;
      expect(profile.overall.currentScore).to.be.closeTo(4.25, 0.1);
      expect(profile.overall.totalRatings).to.equal(2);
      expect(profile.criteria.punctuality.score).to.be.closeTo(4.5, 0.1);
      expect(profile.criteria.participation.score).to.be.closeTo(4.5, 0.1);
    });

    it('should apply time decay correctly', async () => {
      // Create an old rating
      const oldRating = new RatingRecord({
        raterId: 'rater3',
        targetUserId: testUserId,
        targetType: 'peer',
        criteria: {
          punctuality: { score: 2, comment: 'Often late' },
          participation: { score: 2, comment: 'Poor participation' },
          respectfulness: { score: 2, comment: 'Disrespectful' },
          helpfulness: { score: 2, comment: 'Not helpful' }
        },
        overallScore: 2.0,
        weightedScore: 2.0,
        generalComment: 'Poor participant',
        wouldParticipateAgain: false,
        submittedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
      });
      await oldRating.save();

      const result = await ratingCalculationEngine.recalculateUserRating(testUserId, {
        calculationType: 'time_decay'
      });

      const profile = result.profile;
      // Recent ratings should have more weight than old ones
      expect(profile.overall.currentScore).to.be.greaterThan(3.0);
    });

    it('should apply tier-weighted scoring', async () => {
      // Create ratings from different tier users
      const platinumRater = new RatingRecord({
        raterId: 'platinum_rater',
        targetUserId: testUserId,
        targetType: 'peer',
        criteria: {
          punctuality: { score: 5, comment: 'Perfect' },
          participation: { score: 5, comment: 'Excellent' },
          respectfulness: { score: 5, comment: 'Outstanding' },
          helpfulness: { score: 5, comment: 'Very helpful' }
        },
        overallScore: 5.0,
        weightedScore: 5.0,
        generalComment: 'Outstanding participant',
        wouldParticipateAgain: true,
        submittedAt: new Date()
      });
      await platinumRater.save();

      const result = await ratingCalculationEngine.recalculateUserRating(testUserId, {
        calculationType: 'tier_weighted'
      });

      const profile = result.profile;
      // Should be influenced by the high-tier rating
      expect(profile.overall.currentScore).to.be.greaterThan(4.0);
    });

    it('should update tier based on score', async () => {
      // Create enough high ratings to push to silver tier
      const highRatings = Array(5).fill().map((_, i) => new RatingRecord({
        raterId: `high_rater_${i}`,
        targetUserId: testUserId,
        targetType: 'peer',
        criteria: {
          punctuality: { score: 5, comment: 'Perfect' },
          participation: { score: 5, comment: 'Excellent' },
          respectfulness: { score: 5, comment: 'Outstanding' },
          helpfulness: { score: 5, comment: 'Very helpful' }
        },
        overallScore: 5.0,
        weightedScore: 5.0,
        generalComment: 'Outstanding participant',
        wouldParticipateAgain: true,
        submittedAt: new Date()
      }));
      await RatingRecord.insertMany(highRatings);

      const result = await ratingCalculationEngine.recalculateUserRating(testUserId);
      
      expect(result.tierChanged).to.be.true;
      expect(result.profile.tier.current).to.equal('silver');
    });

    it('should handle batch recalculation', async () => {
      const userIds = [testUserId];
      
      const result = await ratingCalculationEngine.batchRecalculateUsers(userIds, {
        calculationType: 'weighted_average'
      });

      expect(result).to.have.property('total', 1);
      expect(result).to.have.property('successful', 1);
      expect(result).to.have.property('failed', 0);
    });

    it('should provide calculation statistics', async () => {
      const stats = await ratingCalculationEngine.getCalculationStatistics();
      
      expect(stats).to.have.property('totalProfiles');
      expect(stats).to.have.property('averageScore');
      expect(stats).to.have.property('tierDistribution');
      expect(stats).to.have.property('scoreDistribution');
    });
  });

  describe('Integration Tests', () => {
    it('should integrate algorithm and calculation engine', async () => {
      // Test the full workflow
      const participants = [
        { id: 'user1', name: 'User 1', tier: 'bronze' },
        { id: 'user2', name: 'User 2', tier: 'silver' }
      ];
      const vendor = { _id: 'vendor1', name: 'Test Vendor' };
      const config = await RatingSystemConfig.getConfig();

      // Generate assignments
      const assignmentResult = await ratingAssignmentAlgorithm.generateRatingAssignments(
        participants,
        vendor,
        config
      );

      expect(assignmentResult.assignments).to.have.length(2);

      // Simulate rating submission and recalculation
      const testUserId = 'user1';
      const result = await ratingCalculationEngine.recalculateUserRating(testUserId, {
        calculationType: 'weighted_average'
      });

      expect(result).to.have.property('profile');
    });

    it('should handle service integration', async () => {
      const result = await ratingSystemService.generateAdvancedRatingAssignments('test-event-id', {
        strategy: 'balanced'
      });

      // Should return null for non-existent event
      expect(result).to.be.null;
    });
  });
});

// Helper functions
async function initializeTestConfig() {
  const config = new RatingSystemConfig({
    ratingCriteria: [
      { id: 'punctuality', name: 'Punctuality', weight: 0.25, description: 'Arrives on time' },
      { id: 'participation', name: 'Participation', weight: 0.3, description: 'Active participation' },
      { id: 'respectfulness', name: 'Respectfulness', weight: 0.25, description: 'Respects others' },
      { id: 'helpfulness', name: 'Helpfulness', weight: 0.2, description: 'Helps others' }
    ],
    tierThresholds: {
      bronze: { min: 0, max: 2.5 },
      silver: { min: 2.5, max: 3.5 },
      gold: { min: 3.5, max: 4.5 },
      platinum: { min: 4.5, max: 5.0 }
    },
    creditRewards: {
      ratingSubmission: 10,
      helpfulRating: 5,
      tierUpgrade: 50
    },
    activityBonus: {
      activitiesPerMonth: 3,
      bonusStars: 0.5,
      maxBonusPerMonth: 1.0
    },
    systemSettings: {
      minParticipantsForRating: 2,
      maxRatingsPerUser: 5,
      ratingWindowDays: 7,
      ratingDecayMonths: 6,
      enableTimeDecay: true,
      enableTierWeighting: true
    }
  });
  
  await config.save();
  console.log('✅ Test configuration initialized');
}

async function createTestUsers() {
  const users = [
    { firstName: 'Test', lastName: 'User1', email: 'testuser1@example.com' },
    { firstName: 'Test', lastName: 'User2', email: 'testuser2@example.com' },
    { firstName: 'Test', lastName: 'User3', email: 'testuser3@example.com' }
  ];

  for (const userData of users) {
    const user = new User({
      ...userData,
      password: 'password123'
    });
    await user.save();
  }
  
  console.log('✅ Test users created');
}

// Run tests if called directly
if (require.main === module) {
  const Mocha = require('mocha');
  const mocha = new Mocha({
    timeout: 30000,
    reporter: 'spec'
  });

  mocha.addFile(__filename);
  mocha.run((failures) => {
    process.exitCode = failures ? 1 : 0;
  });
}
