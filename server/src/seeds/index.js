const seedAdmin = require('./seedAdmin');
const seedVendors = require('./seedVendors');
const seedActivities = require('./seedActivities');

const runAllSeeds = async () => {
  try {
    console.log('🚀 Starting complete database seeding...\n');
    
    // Run seeds in order
    console.log('1️⃣  Seeding admin user...');
    await seedAdmin();
    console.log('✅ Admin seeding completed\n');
    
    console.log('2️⃣  Seeding vendors...');
    await seedVendors();
    console.log('✅ Vendor seeding completed\n');
    
    console.log('3️⃣  Seeding activities...');
    await seedActivities();
    console.log('✅ Activity seeding completed\n');
    
    console.log('🎉 All seeding completed successfully!');
    console.log('\n📊 Database Summary:');
    console.log('   👤 Admin user created');
    console.log('   🏢 5 vendors created');
    console.log('   🎯 10+ activities created with SAR pricing');
    console.log('   💰 All activities priced in Saudi Riyals (SAR)');
    console.log('   📍 All locations in Riyadh area');
    
  } catch (error) {
    console.error('💥 Seeding failed:', error.message);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  runAllSeeds()
    .then(() => {
      console.log('\n🎊 Ready to start development!');
      console.log('   📝 Admin login: admin@ludusapp.com / AdminPassword123!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💀 Fatal seeding error:', error);
      process.exit(1);
    });
}

module.exports = runAllSeeds;