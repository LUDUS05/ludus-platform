const { connectTestDB } = require('./config/test-database');

// Override the database connection for testing
async function startTestServer() {
  try {
    // Connect to in-memory database
    await connectTestDB();
    
    // Set environment variables for testing
    process.env.MONGODB_URI = 'memory://test';
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.MOYASAR_SECRET_KEY = 'sk_test_dummy_key';
    process.env.MOYASAR_PUBLISHABLE_KEY = 'pk_test_dummy_key';
    process.env.NODE_ENV = 'test';
    
    // Import and start the app after database connection
    const app = require('./app');
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Test server running on port ${PORT}`);
      console.log(`📊 Using in-memory MongoDB database`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    });
    
  } catch (error) {
    console.error('Failed to start test server:', error);
    process.exit(1);
  }
}

startTestServer();