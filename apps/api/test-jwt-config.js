const jwt = require('jsonwebtoken');
require('dotenv').config();

function testJWTConfiguration() {
  console.log('🔍 Testing JWT configuration...');

  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'JWT_EXPIRES_IN',
    'JWT_REFRESH_EXPIRES_IN'
  ];

  let allConfigured = true;

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}: SET`);
    } else {
      console.log(`❌ ${envVar}: NOT SET`);
      allConfigured = false;
    }
  }

  if (allConfigured) {
    try {
      // Test JWT token generation
      const testPayload = { userId: 'test', email: 'test@example.com' };

      const accessToken = jwt.sign(testPayload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });

      const refreshToken = jwt.sign(testPayload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
      });

      console.log('✅ JWT token generation successful');
      console.log(`📝 Access token length: ${accessToken.length}`);
      console.log(`📝 Refresh token length: ${refreshToken.length}`);

      // Test token verification
      const decodedAccess = jwt.verify(accessToken, process.env.JWT_SECRET);
      const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      console.log('✅ JWT token verification successful');
      console.log(`👤 Decoded access token: ${JSON.stringify(decodedAccess)}`);

      return true;
    } catch (error) {
      console.error('❌ JWT test failed:', error.message);
      return false;
    }
  } else {
    console.error('❌ JWT configuration incomplete');
    return false;
  }
}

// Run test
const success = testJWTConfiguration();
process.exit(success ? 0 : 1);
