# Referral System Deployment & Monitoring Guide

This guide covers the complete deployment and monitoring setup for the LUDUS Referral System on Render.

## 🚀 **Phase 8: Deployment & Monitoring**

### **Table of Contents**
1. [Pre-deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Preparation](#database-preparation)
4. [Deployment Process](#deployment-process)
5. [Monitoring Setup](#monitoring-setup)
6. [Health Checks](#health-checks)
7. [Performance Monitoring](#performance-monitoring)
8. [Error Tracking](#error-tracking)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)

---

## 📋 **Pre-deployment Checklist**

### **System Requirements**
- [ ] Node.js 18+ installed
- [ ] MongoDB database ready
- [ ] Render account configured
- [ ] Environment variables prepared
- [ ] SSL certificates ready (for custom domains)
- [ ] Monitoring tools configured

### **Code Quality Checks**
- [ ] All tests passing (`npm run test:referral:all`)
- [ ] Linting passed (`npm run lint`)
- [ ] Code formatting applied (`npm run format`)
- [ ] No sensitive data in code
- [ ] Environment-specific configurations set

### **Security Checklist**
- [ ] Environment variables secured
- [ ] API keys rotated
- [ ] Database access restricted
- [ ] Rate limiting configured
- [ ] CORS settings appropriate
- [ ] Authentication middleware active

---

## ⚙️ **Environment Setup**

### **1. Environment Variables**

Create `.env` file in the project root:

```bash
# Application
NODE_ENV=production
PORT=5000
SESSION_SECRET=your-super-secret-session-key

# Database
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/ludus_production
TEST_DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/ludus_test

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Moyasar Payment
MOYASAR_SECRET_KEY=your-moyasar-secret-key
MOYASAR_PUBLISHABLE_KEY=your-moyasar-publishable-key

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Monitoring
LOG_LEVEL=info
ENABLE_PERFORMANCE_MONITORING=true
ENABLE_ERROR_TRACKING=true

# Referral System
REFERRAL_REGISTRATION_REWARD=50
REFERRAL_BOOKING_REWARD=100
REFERRAL_CODE_LENGTH=8
```

### **2. Render Configuration**

#### **Backend Service (`render.yaml`)**
```yaml
services:
  - type: web
    name: ludus-backend
    env: node
    plan: starter
    buildCommand: cd server && npm ci --production=false
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: MOYASAR_SECRET_KEY
        sync: false
    healthCheckPath: /health
    autoDeploy: true
    numInstances: 1
    disk:
      name: uploads
      mountPath: /opt/render/project/src/server/uploads
      sizeGB: 1
```

#### **Frontend Service (`render.yaml`)**
```yaml
services:
  - type: web
    name: ludus-frontend
    env: static
    buildCommand: cd client && npm ci && npm run build
    staticPublishPath: client/build
    envVars:
      - key: REACT_APP_API_URL
        value: https://ludus-backend.onrender.com
      - key: REACT_APP_ENVIRONMENT
        value: production
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

---

## 🗄️ **Database Preparation**

### **1. MongoDB Atlas Setup**

1. **Create Cluster**
   - Choose M0 (Free) or higher
   - Select region closest to your users
   - Enable backup

2. **Database User**
   ```bash
   # Create database user with appropriate permissions
   db.createUser({
     user: "ludus_user",
     pwd: "secure_password",
     roles: [
       { role: "readWrite", db: "ludus_production" },
       { role: "readWrite", db: "ludus_test" }
     ]
   })
   ```

3. **Network Access**
   - Allow access from anywhere (0.0.0.0/0)
   - Or restrict to Render IPs

### **2. Database Initialization**

```bash
# Run database setup
cd server
npm run setup

# Verify collections created
npm run seed
```

### **3. Indexes for Performance**

```javascript
// Create indexes for referral system
db.referrals.createIndex({ "referrerId": 1, "createdAt": -1 });
db.referrals.createIndex({ "referredUserId": 1 });
db.referralCodes.createIndex({ "code": 1 }, { unique: true });
db.referralCodes.createIndex({ "userId": 1 });
db.invitations.createIndex({ "referrerId": 1, "createdAt": -1 });
db.notifications.createIndex({ "userId": 1, "status": 1 });
```

---

## 🚀 **Deployment Process**

### **1. Automated Deployment**

```bash
# Make deployment script executable
chmod +x deploy-referral-system.sh

# Deploy to production
./deploy-referral-system.sh production

# Deploy to staging
./deploy-referral-system.sh staging

# Run health checks only
./deploy-referral-system.sh --health

# Setup monitoring only
./deploy-referral-system.sh --monitor
```

### **2. Manual Deployment Steps**

#### **Backend Deployment**
```bash
# 1. Build and test
cd server
npm ci --production=false
npm run test:referral:all

# 2. Deploy to Render
render deploy --service ludus-backend

# 3. Verify deployment
curl https://ludus-backend.onrender.com/health
```

#### **Frontend Deployment**
```bash
# 1. Build production version
cd client
npm ci
npm run build

# 2. Deploy to Render
render deploy --service ludus-frontend

# 3. Verify deployment
curl https://ludus-frontend.onrender.com
```

### **3. Post-deployment Verification**

```bash
# Check system health
curl https://ludus-backend.onrender.com/health

# Test referral system endpoints
curl -H "Authorization: Bearer $TEST_TOKEN" \
  https://ludus-backend.onrender.com/api/referrals/stats

# Verify frontend loads
curl -I https://ludus-frontend.onrender.com
```

---

## 📊 **Monitoring Setup**

### **1. System Health Monitoring**

The system includes comprehensive health checks at `/health`:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 86400,
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "referral": "active",
    "analytics": "active",
    "notifications": "active"
  },
  "referral": {
    "system": "operational",
    "rewards": "active",
    "tracking": "enabled",
    "analytics": "available"
  }
}
```

### **2. Performance Monitoring**

The system automatically tracks:
- Request response times
- Memory usage
- CPU usage
- Database query performance
- Referral system metrics

### **3. Error Tracking**

Automatic error categorization and alerting:
- Database connection issues
- Payment failures
- Referral system errors
- Authentication problems
- Validation errors

---

## 🏥 **Health Checks**

### **1. Automated Health Checks**

```bash
# Create health check script
cat > monitoring/health-check.sh << 'EOF'
#!/bin/bash

BACKEND_URL="https://ludus-backend.onrender.com"
FRONTEND_URL="https://ludus-frontend.onrender.com"
LOG_FILE="health-check-$(date +%Y%m%d).log"

# Check backend
if curl -f -s "$BACKEND_URL/health" > /dev/null; then
    echo "$(date): Backend OK" >> "$LOG_FILE"
else
    echo "$(date): Backend FAILED" >> "$LOG_FILE"
    # Send alert
fi

# Check frontend
if curl -f -s "$FRONTEND_URL" > /dev/null; then
    echo "$(date): Frontend OK" >> "$LOG_FILE"
else
    echo "$(date): Frontend FAILED" >> "$LOG_FILE"
    # Send alert
fi
EOF

chmod +x monitoring/health-check.sh
```

### **2. Render Health Checks**

Render automatically monitors:
- HTTP response codes
- Response times
- Service availability
- Auto-restart on failures

### **3. Custom Health Check Endpoints**

```javascript
// Additional health checks
app.get('/health/detailed', async (req, res) => {
  try {
    const checks = {
      database: await checkDatabaseConnection(),
      referral: await checkReferralSystem(),
      analytics: await checkAnalyticsService(),
      notifications: await checkNotificationService()
    };
    
    const allHealthy = Object.values(checks).every(check => check.status === 'healthy');
    
    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

---

## 📈 **Performance Monitoring**

### **1. Key Metrics Tracked**

- **Response Times**: P50, P95, P99 percentiles
- **Throughput**: Requests per second
- **Error Rates**: By endpoint and type
- **Resource Usage**: Memory, CPU, disk
- **Database Performance**: Query times, connection pool
- **Referral System**: Conversion rates, reward distribution

### **2. Performance Alerts**

Automatic alerts for:
- Response time > 2 seconds
- Error rate > 5%
- Memory usage > 80%
- Database query time > 1 second
- Unusual referral metrics

### **3. Performance Dashboard**

Access monitoring data via:
```bash
# Get performance stats
curl https://ludus-backend.onrender.com/api/monitoring/performance

# Get error stats
curl https://ludus-backend.onrender.com/api/monitoring/errors

# Export performance data
curl https://ludus-backend.onrender.com/api/monitoring/export?format=csv
```

---

## 🚨 **Error Tracking**

### **1. Error Categories**

- **Critical**: Database connection, payment failures
- **High**: Referral system issues, authentication problems
- **Medium**: Validation errors, rate limiting
- **Low**: File upload issues, external service timeouts

### **2. Alert Thresholds**

- **Consecutive Errors**: 5+ of same type
- **Error Rate**: > 10% of total requests
- **Critical Errors**: Immediate alert

### **3. Error Notifications**

Automatic notifications via:
- Email alerts
- Slack messages (if configured)
- Admin dashboard
- Log aggregation

---

## 💾 **Backup & Recovery**

### **1. Automated Backups**

```bash
# Database backup
mongodump --uri="$DATABASE_URL" --out="backups/$(date +%Y%m%d_%H%M%S)"

# File backup
tar -czf "backups/uploads-$(date +%Y%m%d_%H%M%S).tar.gz" server/uploads/

# Configuration backup
cp .env "backups/env-$(date +%Y%m%d_%H%M%S).backup"
```

### **2. Recovery Procedures**

#### **Database Recovery**
```bash
# Restore from backup
mongorestore --uri="$DATABASE_URL" "backups/20240115_103000/"

# Verify restoration
mongo --uri="$DATABASE_URL" --eval "db.referrals.count()"
```

#### **Application Recovery**
```bash
# Rollback deployment
./deploy-referral-system.sh --rollback

# Restore configuration
cp "backups/env-20240115_103000.backup" .env

# Restart services
render restart --service ludus-backend
render restart --service ludus-frontend
```

### **3. Backup Retention**

- **Daily backups**: Keep for 7 days
- **Weekly backups**: Keep for 4 weeks
- **Monthly backups**: Keep for 12 months
- **Automatic cleanup**: Remove old backups

---

## 🔧 **Troubleshooting**

### **1. Common Issues**

#### **Deployment Failures**
```bash
# Check build logs
render logs --service ludus-backend

# Verify environment variables
render env ls --service ludus-backend

# Check service status
render ps --service ludus-backend
```

#### **Database Connection Issues**
```bash
# Test database connection
mongo --uri="$DATABASE_URL" --eval "db.runCommand('ping')"

# Check network access
telnet your-cluster.mongodb.net 27017

# Verify credentials
mongo --uri="$DATABASE_URL" --eval "db.auth('username', 'password')"
```

#### **Performance Issues**
```bash
# Check system resources
curl https://ludus-backend.onrender.com/health

# Monitor response times
curl -w "@curl-format.txt" -o /dev/null -s "https://ludus-backend.onrender.com/health"

# Check error logs
render logs --service ludus-backend --follow
```

### **2. Debug Mode**

```bash
# Enable debug logging
export LOG_LEVEL=debug
export NODE_ENV=development

# Run with verbose output
node --trace-warnings src/app.js
```

### **3. Performance Profiling**

```bash
# Enable performance monitoring
export ENABLE_PERFORMANCE_MONITORING=true

# Profile specific endpoints
curl -X POST https://ludus-backend.onrender.com/api/referrals/generate-code \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Performance-Profile: true"
```

---

## 📚 **Additional Resources**

### **1. Monitoring Tools**

- **Render Dashboard**: Built-in monitoring
- **MongoDB Atlas**: Database monitoring
- **Custom Health Checks**: Application-specific monitoring
- **Error Tracking**: Comprehensive error monitoring
- **Performance Metrics**: Real-time performance tracking

### **2. Documentation**

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com/)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

### **3. Support**

- **Render Support**: Available in dashboard
- **MongoDB Support**: Community and paid options
- **System Logs**: Comprehensive logging for debugging

---

## 🎯 **Next Steps**

After successful deployment:

1. **Monitor System Health**: Check health endpoints regularly
2. **Set Up Alerts**: Configure email/Slack notifications
3. **Performance Tuning**: Optimize based on metrics
4. **Security Review**: Regular security assessments
5. **Backup Verification**: Test backup and recovery procedures
6. **User Training**: Train admin users on monitoring dashboard

---

## 📞 **Support & Maintenance**

### **Regular Maintenance Tasks**

- **Daily**: Check health endpoints, review error logs
- **Weekly**: Review performance metrics, clean old logs
- **Monthly**: Security updates, dependency updates
- **Quarterly**: Full system review, performance optimization

### **Emergency Contacts**

- **System Administrator**: [Your Contact Info]
- **Database Administrator**: [DB Admin Contact]
- **Render Support**: Available via dashboard
- **MongoDB Support**: [Support Contact Info]

---

*This guide covers the complete deployment and monitoring setup for the LUDUS Referral System. For additional support or questions, please refer to the troubleshooting section or contact the system administrator.*
