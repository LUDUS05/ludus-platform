const ReferralReward = require('../models/ReferralReward');
const User = require('../models/User');

const seedReferralRewards = async () => {
  try {
    console.log('🌱 Seeding referral rewards...');
    
    // Find an admin user to set as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('⚠️  No admin user found, skipping referral rewards seeding');
      return;
    }
    
    // Default rewards configuration
    const defaultRewards = [
      {
        rewardType: 'registration',
        amount: 50, // 50 SAR for new user registration
        currency: 'SAR',
        description: 'Reward for referring a new user who completes registration',
        conditions: {
          minReferrals: 0,
          maxReferrals: null, // unlimited
          validFrom: new Date(),
          validUntil: null // never expires
        },
        metadata: {
          createdBy: adminUser._id
        }
      },
      {
        rewardType: 'first-booking',
        amount: 100, // 100 SAR for first booking
        currency: 'SAR',
        description: 'Reward for referring a user who completes their first booking',
        conditions: {
          minReferrals: 0,
          maxReferrals: null, // unlimited
          validFrom: new Date(),
          validUntil: null // never expires
        },
        metadata: {
          createdBy: adminUser._id
        }
      }
    ];
    
    // Check if rewards already exist
    for (const rewardData of defaultRewards) {
      const existingReward = await ReferralReward.findOne({ 
        rewardType: rewardData.rewardType 
      });
      
      if (!existingReward) {
        await ReferralReward.create(rewardData);
        console.log(`✅ Created ${rewardData.rewardType} reward: ${rewardData.amount} ${rewardData.currency}`);
      } else {
        console.log(`ℹ️  ${rewardData.rewardType} reward already exists`);
      }
    }
    
    console.log('✅ Referral rewards seeding completed');
  } catch (error) {
    console.error('❌ Error seeding referral rewards:', error);
  }
};

module.exports = seedReferralRewards;
