const mongoose = require('mongoose');
require('dotenv').config();

// Import the model
const OnboardingConfig = require('./src/models/OnboardingConfig');

async function testOnboardingConfig() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ludus');
    console.log('✅ Connected to database');

    console.log('🧪 Testing OnboardingConfig model...');
    
    // Test getConfig method
    console.log('📋 Getting config...');
    const config = await OnboardingConfig.getConfig();
    console.log('✅ Config retrieved:', {
      id: config._id,
      isEnabled: config.isEnabled,
      stepsCount: config.steps ? config.steps.length : 0,
      version: config.version
    });

    // Test updateConfig method
    console.log('🔄 Testing update...');
    const updatedConfig = await OnboardingConfig.updateConfig({
      isEnabled: true
    }, new mongoose.Types.ObjectId());
    console.log('✅ Config updated:', {
      id: updatedConfig._id,
      isEnabled: updatedConfig.isEnabled,
      version: updatedConfig.version
    });

    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

testOnboardingConfig();
