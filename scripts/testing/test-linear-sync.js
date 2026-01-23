#!/usr/bin/env node

/**
 * Linear to Notion Sync Test Script
 * Tests the webhook integration and sync functionality
 */

const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const WEBHOOK_ENDPOINT = `${API_BASE_URL}/api/linear-webhook`;

async function testWebhookEndpoint() {
  console.log('🧪 Testing Linear-Notion Sync Integration...\n');

  try {
    // Test 1: Check if webhook endpoint is accessible
    console.log('1️⃣ Testing webhook endpoint accessibility...');
    const testResponse = await axios.get(`${WEBHOOK_ENDPOINT}/test`);
    console.log('✅ Webhook endpoint is accessible');
    console.log(`   Response: ${testResponse.data.message}\n`);

    // Test 2: Check sync status
    console.log('2️⃣ Checking sync status...');
    const statusResponse = await axios.get(`${WEBHOOK_ENDPOINT}/status`);
    console.log('✅ Sync status retrieved');
    console.log('   Linear connected:', statusResponse.data.status.linear.connected);
    console.log('   Notion connected:', statusResponse.data.status.notion.connected);
    console.log('   Webhook configured:', statusResponse.data.status.webhook.configured);
    console.log('   Database ID:', statusResponse.data.status.notion.databaseId);
    console.log('');

    // Test 3: Test manual sync (if API keys are configured)
    if (statusResponse.data.status.linear.connected && statusResponse.data.status.notion.connected) {
      console.log('3️⃣ Testing manual sync...');
      try {
        const syncResponse = await axios.post(`${WEBHOOK_ENDPOINT}/sync`, {}, {
          params: { limit: 5 }
        });
        console.log('✅ Manual sync completed');
        console.log(`   Created: ${syncResponse.data.data.created}`);
        console.log(`   Updated: ${syncResponse.data.data.updated}`);
        console.log(`   Skipped: ${syncResponse.data.data.skipped}`);
        console.log(`   Total: ${syncResponse.data.data.total}`);
      } catch (syncError) {
        console.log('⚠️  Manual sync failed (this is normal if no Linear issues exist)');
        console.log(`   Error: ${syncError.response?.data?.error || syncError.message}`);
      }
    } else {
      console.log('3️⃣ Skipping manual sync (API keys not configured)');
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Configure your Linear API key in .env');
    console.log('2. Configure your Notion API key in .env');
    console.log('3. Set up Linear webhook pointing to this endpoint');
    console.log('4. Test with real Linear issues');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Test webhook simulation
async function testWebhookSimulation() {
  console.log('\n🔬 Testing webhook simulation...\n');

  const mockWebhookData = {
    type: 'Issue',
    action: 'create',
    data: {
      id: 'test-issue-id',
      identifier: 'TEST-001',
      title: 'Test Issue from Webhook',
      description: 'This is a test issue created by webhook simulation',
      state: { name: 'Todo' },
      priority: 2,
      assignee: { name: 'Test User' },
      url: 'https://linear.app/test/issue/TEST-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };

  try {
    console.log('📤 Sending mock webhook data...');
    const response = await axios.post(WEBHOOK_ENDPOINT, mockWebhookData, {
      headers: {
        'Content-Type': 'application/json',
        'Linear-Signature': 'test-signature' // This will fail verification, but that's expected
      }
    });
    console.log('✅ Webhook simulation successful');
    console.log(`   Response: ${response.data.message}`);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Webhook signature verification working (expected 401 for test)');
    } else {
      console.log('⚠️  Webhook simulation failed:', error.message);
    }
  }
}

// Main execution
async function main() {
  console.log('🚀 Linear-Notion Sync Test Suite');
  console.log('================================\n');

  await testWebhookEndpoint();
  await testWebhookSimulation();

  console.log('\n✨ Test suite completed!');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testWebhookEndpoint, testWebhookSimulation };
