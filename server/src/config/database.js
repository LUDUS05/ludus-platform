const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Create indexes for better performance
    await createIndexes();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
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

module.exports = connectDB;