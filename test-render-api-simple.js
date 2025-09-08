#!/usr/bin/env node

/**
 * Simple test for Render API integration
 */

const https = require('https');

const RENDER_API_TOKEN = 'rnd_AjWyMGFA2vmtx6KidKj4TPVLZwpU';
const RENDER_API_BASE = 'https://api.render.com/v1';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.render.com',
      port: 443,
      path: `/v1${path}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${RENDER_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testRenderAPI() {
  console.log('🧪 Testing Render API Integration...');
  console.log(`API Token: ${RENDER_API_TOKEN.substring(0, 10)}...`);
  console.log('');

  try {
    // Test 1: List services
    console.log('1️⃣ Testing list services...');
    const servicesResponse = await makeRequest('/services');
    console.log(`   Status: ${servicesResponse.status}`);
    
    if (servicesResponse.status === 200) {
      const services = servicesResponse.data;
      console.log(`   ✅ Success! Found ${services.length} services`);
      
      if (services.length > 0) {
        const firstService = services[0];
        console.log(`   📋 First service: ${firstService.service?.name || 'Unknown'} (${firstService.service?.id || 'No ID'})`);
        
        // Test 2: Get specific service status
        console.log('');
        console.log('2️⃣ Testing get service status...');
        const serviceResponse = await makeRequest(`/services/${firstService.service.id}`);
        console.log(`   Status: ${serviceResponse.status}`);
        
        if (serviceResponse.status === 200) {
          console.log(`   ✅ Success! Service status: ${serviceResponse.data.service?.status || 'Unknown'}`);
        } else {
          console.log(`   ❌ Failed: ${serviceResponse.data}`);
        }
      }
    } else {
      console.log(`   ❌ Failed: ${servicesResponse.data}`);
    }

    console.log('');
    console.log('🎉 Render API integration test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testRenderAPI();
