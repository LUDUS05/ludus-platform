#!/usr/bin/env node

// Simple MongoDB health check using API package dependencies
const { connectAtlas, healthCheck, disconnectAtlas } = require('../src/config/mongodb-atlas');

async function run() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const ok = await connectAtlas();
    if (!ok) {
      console.error('❌ Connection failed');
      process.exit(1);
    }

    console.log('🏥 Running health check...');
    const health = await healthCheck();
    console.log('📊 Health:', JSON.stringify(health, null, 2));

    await disconnectAtlas();
    console.log('✅ Disconnected');
    if (health.status !== 'healthy') process.exit(1);
  } catch (err) {
    console.error('💥 Error:', err?.message || err);
    process.exit(1);
  }
}

run();



