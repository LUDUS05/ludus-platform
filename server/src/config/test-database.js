const mongoose = require('mongoose');

let mongod;

const connectTestDB = async () => {
  try {
  // Import mongodb-memory-server lazily to avoid extraneous-require in production
  // eslint-disable-next-line node/no-extraneous-require
  const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`Test MongoDB Connected: ${conn.connection.host}`);
    return uri;
  } catch (error) {
    console.error('Test database connection error:', error);
    process.exit(1);
  }
};

const disconnectTestDB = async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
  } catch (error) {
    console.error('Error disconnecting test database:', error);
  }
};

const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

module.exports = {
  connectTestDB,
  disconnectTestDB,
  clearTestDB
};