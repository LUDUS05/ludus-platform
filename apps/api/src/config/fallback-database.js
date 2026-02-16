
// Fallback database configuration for development
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try production MongoDB Atlas first
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2
      });
      console.log('✅ Connected to MongoDB Atlas');
      return;
    }
    
    // Fallback to local MongoDB
    const localUri = 'mongodb://localhost:27017/ludus_dev';
    await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('✅ Connected to local MongoDB');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Use in-memory database for testing
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to in-memory MongoDB for testing');
  }
};

module.exports = { connectDB };
