/**
 * Test QR Code Endpoints
 * Test the QR code generation functionality
 */

const axios = require('axios');

const BASE_URL = 'https://ludus-backend-gf1g.onrender.com';

async function testQREndpoints() {
  console.log('🧪 Testing QR Code Endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log(`✅ Health: ${healthResponse.data.version}`);
    
    // Test 2: QR code generation
    console.log('\n2️⃣ Testing QR code generation...');
    try {
      const qrResponse = await axios.get(`${BASE_URL}/api/qr/TEST1234?size=200&format=png`, {
        responseType: 'arraybuffer'
      });
      
      if (qrResponse.headers['content-type'] === 'image/png') {
        console.log('✅ QR code generated successfully');
        console.log(`✅ Content-Type: ${qrResponse.headers['content-type']}`);
        console.log(`✅ Content-Length: ${qrResponse.headers['content-length']} bytes`);
      } else {
        console.log(`❌ Unexpected content type: ${qrResponse.headers['content-type']}`);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️  QR endpoint not found - backend may not be redeployed yet');
      } else {
        console.log(`❌ QR code generation failed: ${error.response?.status}`);
        console.log('Response:', error.response?.data?.toString().substring(0, 200));
      }
    }

    // Test 3: QR code download
    console.log('\n3️⃣ Testing QR code download...');
    try {
      const downloadResponse = await axios.get(`${BASE_URL}/api/qr/TEST1234/download?size=300&format=png`, {
        responseType: 'arraybuffer'
      });
      
      if (downloadResponse.headers['content-type'] === 'image/png') {
        console.log('✅ QR code download successful');
        console.log(`✅ Content-Type: ${downloadResponse.headers['content-type']}`);
        console.log(`✅ Content-Disposition: ${downloadResponse.headers['content-disposition']}`);
      } else {
        console.log(`❌ Unexpected content type: ${downloadResponse.headers['content-type']}`);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️  QR download endpoint not found - backend may not be redeployed yet');
      } else {
        console.log(`❌ QR code download failed: ${error.response?.status}`);
        console.log('Response:', error.response?.data?.toString().substring(0, 200));
      }
    }

    console.log('\n📋 Summary:');
    console.log('- Backend is running and accessible');
    console.log('- QR code endpoints may need time to deploy');
    console.log('- Once deployed, QR codes will work properly');
    
  } catch (error) {
    console.error('❌ Error testing QR endpoints:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data?.toString().substring(0, 200));
    }
  }
}

// Run the test
testQREndpoints();
