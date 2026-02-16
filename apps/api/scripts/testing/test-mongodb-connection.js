const mongoose = require('mongoose');
require('dotenv').config();

async function testMongoDBConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...');

    // Test with different connection strings
    const testUris = [
      process.env.MONGODB_URI,
      'mongodb://localhost:27017/ludus_development',
      'mongodb+srv://test:test@cluster.mongodb.net/test'
    ];

    for (const uri of testUris) {
      if (!uri) continue;

      console.log(`\n📡 Testing URI: ${uri.replace(/\/\/.*@/, '//***:***@')}`);

      try {
        const conn = await mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });

        console.log(`✅ Connected successfully to: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        console.log(`🔗 Ready State: ${conn.connection.readyState}`);

        // Test basic query
        await conn.connection.db.admin().ping();
        console.log('✅ Database ping successful');

        await mongoose.disconnect();
        console.log('✅ Disconnected successfully');
        return true;
      } catch (error) {
        console.log(`❌ Connection failed: ${error.message}`);
        if (error.code === 'ETIMEOUT') {
          console.log('🔧 ETIMEOUT error - Check network/firewall settings');
        }
      }
    }

    return false;
  } catch (error) {
    console.error('❌ MongoDB test failed:', error.message);
    return false;
  }
}

// Run test
testMongoDBConnection().then(success => {
  process.exit(success ? 0 : 1);
});
