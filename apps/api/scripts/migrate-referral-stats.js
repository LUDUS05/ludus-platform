/**
 * Migration script to populate referralStats for existing users
 * Run this script to ensure all users have referralStats field
 */

const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

async function migrateReferralStats() {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL);
    console.log('✅ Connected to database');

    console.log('🔍 Finding users without referralStats...');
    const usersWithoutStats = await User.find({
      $or: [
        { referralStats: { $exists: false } },
        { referralStats: null }
      ]
    });

    console.log(`📊 Found ${usersWithoutStats.length} users without referralStats`);

    if (usersWithoutStats.length === 0) {
      console.log('✅ All users already have referralStats');
      return;
    }

    console.log('🔄 Updating users...');
    let updatedCount = 0;

    for (const user of usersWithoutStats) {
      try {
        await User.findByIdAndUpdate(user._id, {
          $set: {
            referralStats: {
              totalReferrals: 0,
              totalEarnings: 0,
              firstBookingCompleted: false
            }
          }
        });
        updatedCount++;
        console.log(`✅ Updated user: ${user.email || user._id}`);
      } catch (error) {
        console.error(`❌ Failed to update user ${user._id}:`, error.message);
      }
    }

    console.log(`🎉 Migration completed! Updated ${updatedCount} users`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateReferralStats()
    .then(() => {
      console.log('🚀 Migration script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = migrateReferralStats;
