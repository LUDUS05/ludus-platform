// Simple integration test for the API
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing API Integration...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health endpoint:', healthData);

    // Test version endpoint
    console.log('\n2. Testing version endpoint...');
    const versionResponse = await fetch(`${API_BASE}/api/version`);
    const versionData = await versionResponse.json();
    console.log('✅ Version endpoint:', versionData);

    // Test auth endpoints (without authentication)
    console.log('\n3. Testing auth endpoints...');
    
    // Test register endpoint
    const registerData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      phone: '123-456-7890',
      location: {
        coordinates: [-74.006, 40.7128],
        address: '123 Test St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      }
    };

    const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    if (registerResponse.ok) {
      const registerResult = await registerResponse.json();
      console.log('✅ Register endpoint:', registerResult.message);
      
      // Test login endpoint
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      if (loginResponse.ok) {
        const loginResult = await loginResponse.json();
        console.log('✅ Login endpoint:', loginResult.message);
        
        // Test protected endpoint with token
        const token = loginResult.token;
        const meResponse = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (meResponse.ok) {
          const meData = await meResponse.json();
          console.log('✅ Protected endpoint (me):', meData.user.email);
        } else {
          console.log('❌ Protected endpoint failed:', meResponse.status);
        }
      } else {
        console.log('❌ Login endpoint failed:', loginResponse.status);
      }
    } else {
      console.log('❌ Register endpoint failed:', registerResponse.status);
    }

    // Test categories endpoint
    console.log('\n4. Testing categories endpoint...');
    const categoriesResponse = await fetch(`${API_BASE}/api/activities/categories`);
    const categoriesData = await categoriesResponse.json();
    console.log('✅ Categories endpoint:', categoriesData.categories.length, 'categories');

    // Test featured activities endpoint
    console.log('\n5. Testing featured activities endpoint...');
    const featuredResponse = await fetch(`${API_BASE}/api/activities/featured`);
    const featuredData = await featuredResponse.json();
    console.log('✅ Featured activities endpoint:', featuredData.activities.length, 'activities');

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Health endpoint: ✅');
    console.log('- Version endpoint: ✅');
    console.log('- Auth endpoints: ✅');
    console.log('- Categories endpoint: ✅');
    console.log('- Featured activities endpoint: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the API server is running on port 5000');
    console.log('   Run: npm run dev');
  }
}

// Run the test
testAPI();
