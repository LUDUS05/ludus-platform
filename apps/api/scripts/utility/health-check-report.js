const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function comprehensiveHealthCheck() {
  console.log('🏥 LUDUS Platform - Comprehensive Health Check Report');
  console.log('=' .repeat(60));
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('=' .repeat(60));

  const results = {
    database: { status: 'unknown', message: '', details: {} },
    jwt: { status: 'unknown', message: '', details: {} },
    payment: { status: 'unknown', message: '', details: {} },
    email: { status: 'unknown', message: '', details: {} },
    overall: { status: 'unknown', message: '', score: 0 }
  };

  // Database Health Check
  console.log('\n📊 DATABASE HEALTH CHECK:');
  console.log('-'.repeat(30));
  try {
    if (process.env.MONGODB_URI) {
      console.log(`✅ MONGODB_URI: Configured`);

      // Test connection with timeout
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await conn.connection.db.admin().ping();
      console.log(`✅ Database Connection: Successful`);
      console.log(`📊 Host: ${conn.connection.host}`);
      console.log(`📊 Database: ${conn.connection.name}`);
      console.log(`📊 Ready State: ${conn.connection.readyState}`);

      results.database = {
        status: 'healthy',
        message: 'Database connection successful',
        details: {
          host: conn.connection.host,
          database: conn.connection.name,
          readyState: conn.connection.readyState
        }
      };

      await mongoose.disconnect();
    } else {
      console.log(`❌ MONGODB_URI: Not configured`);
      results.database = {
        status: 'unhealthy',
        message: 'MONGODB_URI not configured',
        details: {}
      };
    }
  } catch (error) {
    console.log(`❌ Database Connection: Failed`);
    console.log(`🔧 Error: ${error.message}`);
    if (error.code === 'ETIMEOUT') {
      console.log(`🔧 ETIMEOUT Error: Check network/firewall settings`);
    }
    results.database = {
      status: 'unhealthy',
      message: error.message,
      details: { errorCode: error.code }
    };
  }

  // JWT Health Check
  console.log('\n🔐 JWT CONFIGURATION CHECK:');
  console.log('-'.repeat(30));
  try {
    const requiredJWT = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'JWT_EXPIRES_IN', 'JWT_REFRESH_EXPIRES_IN'];
    const jwtConfigured = requiredJWT.every(env => process.env[env]);

    if (jwtConfigured) {
      console.log(`✅ JWT_SECRET: Configured`);
      console.log(`✅ JWT_REFRESH_SECRET: Configured`);
      console.log(`✅ JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN}`);
      console.log(`✅ JWT_REFRESH_EXPIRES_IN: ${process.env.JWT_REFRESH_EXPIRES_IN}`);

      // Test JWT token generation
      const testPayload = { userId: 'test', email: 'test@example.com' };
      const accessToken = jwt.sign(testPayload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });
      const refreshToken = jwt.sign(testPayload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
      });

      console.log(`✅ JWT Token Generation: Successful`);
      console.log(`📝 Access Token Length: ${accessToken.length}`);
      console.log(`📝 Refresh Token Length: ${refreshToken.length}`);

      // Test token verification
      const decodedAccess = jwt.verify(accessToken, process.env.JWT_SECRET);
      console.log(`✅ JWT Token Verification: Successful`);

      results.jwt = {
        status: 'healthy',
        message: 'JWT configuration valid and working',
        details: {
          accessTokenLength: accessToken.length,
          refreshTokenLength: refreshToken.length,
          expiresIn: process.env.JWT_EXPIRES_IN
        }
      };
    } else {
      console.log(`❌ JWT Configuration: Incomplete`);
      requiredJWT.forEach(env => {
        console.log(`${process.env[env] ? '✅' : '❌'} ${env}: ${process.env[env] ? 'SET' : 'NOT SET'}`);
      });
      results.jwt = {
        status: 'unhealthy',
        message: 'JWT configuration incomplete',
        details: {}
      };
    }
  } catch (error) {
    console.log(`❌ JWT Configuration: Invalid`);
    console.log(`🔧 Error: ${error.message}`);
    results.jwt = {
      status: 'unhealthy',
      message: error.message,
      details: {}
    };
  }

  // Payment Gateway Health Check
  console.log('\n💳 PAYMENT GATEWAY CHECK:');
  console.log('-'.repeat(30));
  try {
    const requiredPayment = ['MOYASAR_SECRET_KEY', 'MOYASAR_PUBLISHABLE_KEY', 'MOYASAR_WEBHOOK_SECRET'];
    const paymentConfigured = requiredPayment.every(env =>
      process.env[env] && !process.env[env].includes('your_')
    );

    requiredPayment.forEach(env => {
      const value = process.env[env];
      if (value && !value.includes('your_')) {
        console.log(`✅ ${env}: Configured`);
      } else {
        console.log(`⚠️  ${env}: ${value ? 'Using placeholder' : 'Not set'}`);
      }
    });

    if (paymentConfigured) {
      console.log(`✅ Payment Gateway: Fully configured`);
      results.payment = {
        status: 'healthy',
        message: 'Payment gateway fully configured',
        details: {}
      };
    } else {
      console.log(`⚠️  Payment Gateway: Using test/placeholder configuration`);
      results.payment = {
        status: 'warning',
        message: 'Payment gateway using test/placeholder keys',
        details: {}
      };
    }
  } catch (error) {
    console.log(`❌ Payment Gateway: Check failed`);
    console.log(`🔧 Error: ${error.message}`);
    results.payment = {
      status: 'unhealthy',
      message: error.message,
      details: {}
    };
  }

  // Email Service Health Check
  console.log('\n📧 EMAIL SERVICE CHECK:');
  console.log('-'.repeat(30));
  try {
    const requiredEmail = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'];
    const emailConfigured = requiredEmail.every(env =>
      process.env[env] && !process.env[env].includes('your-')
    );

    requiredEmail.forEach(env => {
      const value = process.env[env];
      if (value && !value.includes('your-')) {
        console.log(`✅ ${env}: Configured`);
      } else {
        console.log(`⚠️  ${env}: ${value ? 'Using placeholder' : 'Not set'}`);
      }
    });

    if (emailConfigured) {
      console.log(`✅ Email Service: Fully configured`);
      results.email = {
        status: 'healthy',
        message: 'Email service fully configured',
        details: {}
      };
    } else {
      console.log(`⚠️  Email Service: Using placeholder configuration`);
      results.email = {
        status: 'warning',
        message: 'Email service using placeholder configuration',
        details: {}
      };
    }
  } catch (error) {
    console.log(`❌ Email Service: Check failed`);
    console.log(`🔧 Error: ${error.message}`);
    results.email = {
      status: 'unhealthy',
      message: error.message,
      details: {}
    };
  }

  // Overall Health Assessment
  console.log('\n📋 OVERALL HEALTH ASSESSMENT:');
  console.log('-'.repeat(30));

  const criticalServices = ['database', 'jwt'];
  const criticalHealthy = criticalServices.every(service => results[service].status === 'healthy');
  const warningServices = Object.values(results).filter(service => service.status === 'warning').length;
  const unhealthyServices = Object.values(results).filter(service => service.status === 'unhealthy').length;

  let overallScore = 0;
  let overallMessage = '';

  if (criticalHealthy && unhealthyServices === 0) {
    overallScore = 100;
    overallMessage = 'All systems healthy';
    console.log(`✅ Overall Status: HEALTHY (${overallScore}%)`);
  } else if (criticalHealthy && warningServices > 0) {
    overallScore = 80;
    overallMessage = 'Critical systems healthy, some warnings';
    console.log(`⚠️  Overall Status: HEALTHY WITH WARNINGS (${overallScore}%)`);
  } else {
    overallScore = 40;
    overallMessage = 'Critical systems have issues';
    console.log(`❌ Overall Status: UNHEALTHY (${overallScore}%)`);
  }

  results.overall = {
    status: criticalHealthy ? 'healthy' : 'unhealthy',
    message: overallMessage,
    score: overallScore
  };

  console.log(`📊 Health Score: ${overallScore}%`);
  console.log(`🔧 Critical Services: ${criticalHealthy ? 'Healthy' : 'Issues'}`);
  console.log(`⚠️  Warnings: ${warningServices}`);
  console.log(`❌ Unhealthy: ${unhealthyServices}`);

  // Summary
  console.log('\n📊 HEALTH CHECK SUMMARY:');
  console.log('=' .repeat(60));
  console.log(`Database: ${results.database.status === 'healthy' ? '✅' : '❌'} ${results.database.message}`);
  console.log(`JWT: ${results.jwt.status === 'healthy' ? '✅' : '❌'} ${results.jwt.message}`);
  console.log(`Payment: ${results.payment.status === 'healthy' ? '✅' : results.payment.status === 'warning' ? '⚠️' : '❌'} ${results.payment.message}`);
  console.log(`Email: ${results.email.status === 'healthy' ? '✅' : results.email.status === 'warning' ? '⚠️' : '❌'} ${results.email.message}`);
  console.log(`Overall: ${results.overall.status === 'healthy' ? '✅' : '❌'} ${results.overall.message} (${overallScore}%)`);

  console.log('\n🔧 NEXT STEPS:');
  if (results.database.status !== 'healthy') {
    console.log('1. Configure MONGODB_URI with your MongoDB Atlas connection string');
  }
  if (results.payment.status === 'warning') {
    console.log('2. Update Moyasar API keys with your actual credentials');
  }
  if (results.email.status === 'warning') {
    console.log('3. Configure SMTP settings with your email service credentials');
  }
  if (results.overall.status === 'healthy') {
    console.log('✅ All critical systems are healthy!');
  }

  return results;
}

// Run health check
comprehensiveHealthCheck().then(results => {
  process.exit(results.overall.status === 'healthy' ? 0 : 1);
});
