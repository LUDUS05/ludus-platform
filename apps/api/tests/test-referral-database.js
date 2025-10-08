/**
 * Test Referral Database Setup
 * Check if referral rewards exist and seed them if needed
 */

const mongoose = require('mongoose');
const ReferralReward = require('./src/models/ReferralReward');
const User = require('./src/models/User');
require('dotenv').config();

async function testReferralDatabase() {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL);
    console.log('✅ Connected to database');

    // Check if referral rewards exist
    console.log('\n🔍 Checking referral rewards...');
    const registrationReward = await ReferralReward.findOne({ rewardType: 'registration' });
    const bookingReward = await ReferralReward.findOne({ rewardType: 'first-booking' });

    console.log(`Registration reward: ${registrationReward ? '✅ Exists' : '❌ Missing'}`);
    console.log(`First booking reward: ${bookingReward ? '✅ Exists' : '❌ Missing'}`);

    if (!registrationReward || !bookingReward) {
      console.log('\n🌱 Seeding missing referral rewards...');
      
      // Find an admin user
      const adminUser = await User.findOne({ role: 'admin' });
      if (!adminUser) {
        console.log('⚠️  No admin user found, creating default admin...');
        // Create a default admin user for seeding
        const defaultAdmin = await User.create({
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@ludus.com',
          password: 'admin123',
          role: 'admin',
          isEmailVerified: true
        });
        console.log('✅ Created default admin user');
      }

      const creatorId = adminUser ? adminUser._id : (await User.findOne({ role: 'admin' }))._id;

      // Create missing rewards
      if (!registrationReward) {
        await ReferralReward.create({
          rewardType: 'registration',
          amount: 50,
          currency: 'SAR',
          description: 'Reward for referring a new user who completes registration',
          conditions: {
            minReferrals: 0,
            maxReferrals: null,
            validFrom: new Date(),
            validUntil: null
          },
          metadata: {
            createdBy: creatorId
          }
        });
        console.log('✅ Created registration reward: 50 SAR');
      }

      if (!bookingReward) {
        await ReferralReward.create({
          rewardType: 'first-booking',
          amount: 100,
          currency: 'SAR',
          description: 'Reward for referring a user who completes their first booking',
          conditions: {
            minReferrals: 0,
            maxReferrals: null,
            validFrom: new Date(),
            validUntil: null
          },
          metadata: {
            createdBy: creatorId
          }
        });
        console.log('✅ Created first booking reward: 100 SAR');
      }
    }

    // Test referral code generation
    console.log('\n🧪 Testing referral code generation...');
    const ReferralCode = require('./src/models/ReferralCode');
    
    try {
      const testCode = await ReferralCode.generateUniqueCode();
      console.log(`✅ Generated test referral code: ${testCode}`);
    } catch (error) {
      console.error('❌ Error generating referral code:', error.message);
    }

    // Check User model for referralStats field
    console.log('\n🔍 Checking User model...');
    const sampleUser = await User.findOne();
    if (sampleUser) {
      console.log(`User referralStats: ${sampleUser.referralStats ? '✅ Exists' : '❌ Missing'}`);
      if (!sampleUser.referralStats) {
        console.log('⚠️  User model missing referralStats field');
      }
    }

    console.log('\n✅ Referral database test completed');
    
  } catch (error) {
    console.error('❌ Error testing referral database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the test
testReferralDatabase();
