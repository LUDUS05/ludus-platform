#!/usr/bin/env node

/**
 * LUDUS Platform - Unsplash API Test Script
 * Tests the configured Unsplash API credentials and basic functionality
 */

const https = require('https');

// Use direct API key for testing
const ACCESS_KEY = 'T4QQB3TTgpU4fhw_-JzAaTaO6X4IAgkckPrkwXDjRw0';
const APPLICATION_ID = process.env.UNSPLASH_APPLICATION_ID || '784371';

console.log('🎨 LUDUS Platform - Unsplash API Test');
console.log('=====================================');
console.log(`Application ID: ${APPLICATION_ID}`);
console.log(`Access Key: ${ACCESS_KEY.substring(0, 10)}...`);
console.log('');

// Test basic API connectivity
function testUnsplashAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.unsplash.com',
      port: 443,
      path: `/search/photos?query=sports&per_page=5&client_id=${ACCESS_KEY}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'LUDUS-Platform/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log('✅ API Connection Successful!');
            console.log(`📊 Found ${response.total} sports images`);
            console.log(`📸 Retrieved ${response.results.length} sample images`);
            console.log('');
            
            // Display sample images
            console.log('📋 Sample Sports Images:');
            response.results.forEach((image, index) => {
              console.log(`${index + 1}. ${image.alt_description || 'Sports activity'}`);
              console.log(`   📏 ${image.width}x${image.height}`);
              console.log(`   👤 by ${image.user.name} (@${image.user.username})`);
              console.log(`   🔗 ${image.urls.small}`);
              console.log('');
            });
            
            resolve(response);
          } else {
            console.log('❌ API Error:', res.statusCode);
            console.log('Response:', response);
            reject(new Error(`HTTP ${res.statusCode}: ${response.errors?.[0] || 'Unknown error'}`));
          }
        } catch (error) {
          console.log('❌ JSON Parse Error:', error.message);
          console.log('Raw Response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request Error:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Test category-specific searches
async function testCategorySearch() {
  console.log('🎯 Testing Category-Specific Searches...');
  console.log('========================================');
  
  const categories = ['sports', 'music', 'art', 'food'];
  
  for (const category of categories) {
    try {
      const response = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.unsplash.com',
          port: 443,
          path: `/search/photos?query=${category}&per_page=3&orientation=landscape&client_id=${ACCESS_KEY}`,
          method: 'GET'
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (error) {
              reject(error);
            }
          });
        });

        req.on('error', reject);
        req.end();
      });

      if (response.results && response.results.length > 0) {
        console.log(`✅ ${category.toUpperCase()}: Found ${response.total} images`);
        console.log(`   📸 Sample: ${response.results[0].alt_description || `${category} activity`}`);
      } else {
        console.log(`⚠️  ${category.toUpperCase()}: No images found`);
      }
    } catch (error) {
      console.log(`❌ ${category.toUpperCase()}: Error - ${error.message}`);
    }
  }
  
  console.log('');
}

// Main test execution
async function runTests() {
  try {
    console.log('🔍 Testing Basic API Connection...');
    await testUnsplashAPI();
    
    await testCategorySearch();
    
    console.log('🎉 All Tests Completed Successfully!');
    console.log('');
    console.log('🚀 Ready to implement Unsplash integration in LUDUS components!');
    console.log('   - ProgressiveImage component');
    console.log('   - Enhanced Activity Cards');
    console.log('   - Image Gallery components');
    console.log('');
    
  } catch (error) {
    console.log('');
    console.log('❌ Test Failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify API credentials in .env file');
    console.log('3. Ensure Unsplash API limits are not exceeded');
    console.log('4. Check Unsplash API status: https://status.unsplash.com/');
    process.exit(1);
  }
}

// Run the tests
runTests();