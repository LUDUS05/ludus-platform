const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  try {
    let mongoUri;

    if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
      console.log('Starting in-memory MongoDB for development/testing...');
      // Only import mongodb-memory-server when needed to avoid production dependency issues
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    } else if (process.env.MONGODB_URI) {
      mongoUri = process.env.MONGODB_URI;
    } else {
      console.error('MONGODB_URI environment variable not set for production');
      return false;
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Create indexes for better performance
    await createIndexes();
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('⚠️  Server will continue without database connection');
    return false;
  }
};

const createIndexes = async () => {
  try {
    // Wait for connection to be ready
    if (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => mongoose.connection.once('open', resolve));
    }

    const db = mongoose.connection.db;
    
    // Users indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ "location.coordinates": "2dsphere" });

    // Activities indexes
    await db.collection('activities').createIndex({ "location.coordinates": "2dsphere" });
    await db.collection('activities').createIndex({ category: 1, isActive: 1 });
    await db.collection('activities').createIndex({ featured: 1, isActive: 1 });
    await db.collection('activities').createIndex({ 
      title: "text", 
      description: "text", 
      tags: "text" 
    });

    // Bookings indexes
    await db.collection('bookings').createIndex({ user: 1, bookingDate: -1 });
    await db.collection('bookings').createIndex({ activity: 1, bookingDate: 1 });
    await db.collection('bookings').createIndex({ status: 1, createdAt: -1 });

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

// Cleanup function for graceful shutdown
const disconnectDB = async () => {
  try {
    if (mongoServer) {
      await mongoServer.stop();
      console.log('✅ In-memory MongoDB stopped');
    }
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('Error during database cleanup:', error);
  }
};

module.exports = { connectDB, disconnectDB };