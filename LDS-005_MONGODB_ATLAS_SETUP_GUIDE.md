# LDS-005: MongoDB Atlas Setup - Implementation Guide

**Date:** October 6, 2025  
**Status:** 🚧 IN PROGRESS  
**Phase:** Phase 1 - Foundation  
**Assignee:** Claude (Aether-Render Project Manager) + Backend Dev + DevOps Engineer  

---

## 📋 Executive Summary

This guide provides step-by-step instructions for setting up a production-ready MongoDB Atlas cluster for the LUDUS platform, optimized for the Saudi Arabian market with proper security, monitoring, and backup configurations.

---

## 🎯 Objectives

### Primary Goals
- ✅ Provision M30 cluster in Saudi Arabia region
- ✅ Configure network access and security
- ✅ Set up database users and roles
- ✅ Enable automated backups and monitoring
- ✅ Test connectivity and performance
- ✅ Document configuration procedures

### Technical Requirements
- **Cluster Tier:** M30 (Production-ready)
- **Region:** Saudi Arabia (Middle East)
- **Storage:** 20GB SSD
- **Backup:** Automated daily backups
- **Monitoring:** Real-time performance metrics
- **Security:** IP whitelisting, role-based access control

---

## 🏗️ Implementation Steps

### Step 1: MongoDB Atlas Account Setup

#### 1.1 Create MongoDB Atlas Account
1. **Visit:** [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Sign Up:** Use LUDUS project email
3. **Organization:** Create "LUDUS Platform" organization
4. **Project:** Create "LUDUS Production" project

#### 1.2 Account Configuration
```yaml
Organization: LUDUS Platform
Project: LUDUS Production
Environment: Production
Region: Middle East (Saudi Arabia)
```

### Step 2: Cluster Provisioning

#### 2.1 Cluster Configuration
```yaml
Cluster Type: Dedicated
Tier: M30
Provider: AWS
Region: Middle East (Bahrain) - Closest to Saudi Arabia
Storage: 20GB SSD
Backup: Enabled
```

#### 2.2 Cluster Settings
- **Cluster Name:** `ludus-production-cluster`
- **MongoDB Version:** Latest stable (7.0+)
- **Backup:** Continuous backup enabled
- **Point-in-Time Recovery:** Enabled
- **Encryption:** At rest and in transit

### Step 3: Network Security Configuration

#### 3.1 Network Access Setup
```yaml
Access Type: IP Access List
Strategy: Whitelist specific IPs + Render IPs
```

#### 3.2 IP Whitelist Configuration
```yaml
# Development IPs
0.0.0.0/0  # Temporary for development (remove in production)

# Production IPs (Render.com)
# Add Render service IPs when deployed

# Team IPs
# Add team member IPs for database access
```

#### 3.3 VPC Peering (Optional)
- Configure VPC peering for enhanced security
- Connect to AWS VPC if using AWS services
- Implement private network access

### Step 4: Database User Management

#### 4.1 Create Database Users
```yaml
# Application User
Username: ludus_app_user
Password: [Generate strong password]
Database: admin
Roles: readWrite on ludus_production

# Admin User
Username: ludus_admin
Password: [Generate strong password]
Database: admin
Roles: dbAdminAnyDatabase, userAdminAnyDatabase

# Read-Only User (for analytics)
Username: ludus_analytics
Password: [Generate strong password]
Database: admin
Roles: read on ludus_production
```

#### 4.2 Role Configuration
```javascript
// Application User Roles
{
  "role": "readWrite",
  "db": "ludus_production"
}

// Admin User Roles
{
  "role": "dbAdminAnyDatabase",
  "db": "admin"
},
{
  "role": "userAdminAnyDatabase", 
  "db": "admin"
}

// Analytics User Roles
{
  "role": "read",
  "db": "ludus_production"
}
```

### Step 5: Database Configuration

#### 5.1 Database Creation
```javascript
// Create main database
use ludus_production

// Create collections with proper indexes
db.createCollection("users")
db.createCollection("partners")
db.createCollection("activities")
db.createCollection("bookings")
db.createCollection("payments")
db.createCollection("reviews")
db.createCollection("categories")
db.createCollection("notifications")
db.createCollection("analytics")
```

#### 5.2 Index Creation
```javascript
// Users Collection Indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "phone": 1 }, { unique: true })
db.users.createIndex({ "location.coordinates": "2dsphere" })
db.users.createIndex({ "profile.firstName": "text", "profile.lastName": "text", "email": "text" })

// Activities Collection Indexes
db.activities.createIndex({ "location.coordinates": "2dsphere" })
db.activities.createIndex({ "category.id": 1, "location.city": 1, "status": 1 })
db.activities.createIndex({ "partner.id": 1, "status": 1 })
db.activities.createIndex({ "title": "text", "description": "text", "features.tags": "text" })

// Bookings Collection Indexes
db.bookings.createIndex({ "user.id": 1, "status": 1 })
db.bookings.createIndex({ "activity.id": 1, "schedule.date": 1 })
db.bookings.createIndex({ "bookingNumber": 1 }, { unique: true })

// Reviews Collection Indexes
db.reviews.createIndex({ "activity.id": 1, "rating.overall": -1 })
db.reviews.createIndex({ "user.id": 1, "createdAt": -1 })
```

### Step 6: Backup and Recovery Configuration

#### 6.1 Backup Settings
```yaml
Backup Type: Continuous
Retention: 30 days
Point-in-Time Recovery: Enabled
Restore Windows: 24 hours
```

#### 6.2 Backup Schedule
- **Frequency:** Continuous
- **Retention:** 30 days
- **Cross-Region Backup:** Enabled (UAE region)
- **Encryption:** AES-256

### Step 7: Monitoring and Alerting

#### 7.1 Performance Monitoring
```yaml
Metrics Tracked:
  - Query Performance
  - Connection Count
  - Memory Usage
  - CPU Utilization
  - Disk Usage
  - Index Usage
```

#### 7.2 Alert Configuration
```yaml
Alerts:
  - High CPU Usage (>80%)
  - High Memory Usage (>90%)
  - Slow Queries (>100ms)
  - Connection Pool Exhaustion
  - Backup Failures
  - Index Usage Warnings
```

#### 7.3 Monitoring Dashboard
- Set up MongoDB Atlas monitoring dashboard
- Configure custom metrics for LUDUS-specific KPIs
- Set up email notifications for critical alerts

### Step 8: Security Hardening

#### 8.1 Encryption Configuration
```yaml
Encryption at Rest: Enabled (AES-256)
Encryption in Transit: TLS 1.2+
Field-Level Encryption: For sensitive data
Key Management: MongoDB Atlas managed keys
```

#### 8.2 Access Control
```yaml
Authentication: SCRAM-SHA-256
Authorization: Role-based access control
Network Security: IP whitelisting
Audit Logging: Enabled
```

#### 8.3 Compliance
- Enable audit logging for compliance
- Configure data residency (Saudi Arabia)
- Set up data retention policies
- Implement GDPR compliance measures

### Step 9: Connection Configuration

#### 9.1 Connection String Generation
```javascript
// Production Connection String
const mongoUri = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${database}?retryWrites=true&w=majority`;

// With additional options
const mongoUri = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${database}?retryWrites=true&w=majority&maxPoolSize=10&serverSelectionTimeoutMS=5000&socketTimeoutMS=45000`;
```

#### 9.2 Environment Variables
```bash
# Production Environment
MONGODB_URI=mongodb+srv://ludus_app_user:${PASSWORD}@ludus-production-cluster.xxxxx.mongodb.net/ludus_production?retryWrites=true&w=majority
DATABASE_NAME=ludus_production
MONGODB_OPTIONS={"maxPoolSize":10,"serverSelectionTimeoutMS":5000,"socketTimeoutMS":45000}

# Development Environment (for testing)
MONGODB_URI_DEV=mongodb+srv://ludus_app_user:${PASSWORD}@ludus-production-cluster.xxxxx.mongodb.net/ludus_development?retryWrites=true&w=majority
```

### Step 10: Testing and Validation

#### 10.1 Connection Testing
```javascript
// Test database connection
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    
    console.log('✅ MongoDB Atlas connection successful');
    
    // Test basic operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error);
    return false;
  }
};
```

#### 10.2 Performance Testing
```javascript
// Test query performance
const testQueryPerformance = async () => {
  const startTime = Date.now();
  
  // Test geospatial query
  const activities = await Activity.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [46.6753, 24.7136] // Riyadh coordinates
        },
        $maxDistance: 10000 // 10km radius
      }
    }
  }).limit(10);
  
  const queryTime = Date.now() - startTime;
  console.log(`📍 Geospatial query completed in ${queryTime}ms`);
  
  return queryTime < 100; // Should be under 100ms
};
```

#### 10.3 Security Testing
```javascript
// Test user permissions
const testUserPermissions = async () => {
  try {
    // Test read access
    const users = await User.find().limit(1);
    console.log('✅ Read access confirmed');
    
    // Test write access
    const testUser = new User({
      email: 'test@example.com',
      password: 'test123',
      profile: {
        firstName: 'Test',
        lastName: 'User'
      }
    });
    
    await testUser.save();
    console.log('✅ Write access confirmed');
    
    // Clean up test data
    await User.deleteOne({ email: 'test@example.com' });
    console.log('✅ Cleanup completed');
    
    return true;
  } catch (error) {
    console.error('❌ Permission test failed:', error);
    return false;
  }
};
```

---

## 🔧 Configuration Files

### Environment Configuration
```bash
# .env.production
MONGODB_URI=mongodb+srv://ludus_app_user:${MONGODB_PASSWORD}@ludus-production-cluster.xxxxx.mongodb.net/ludus_production?retryWrites=true&w=majority
DATABASE_NAME=ludus_production
MONGODB_OPTIONS={"maxPoolSize":10,"serverSelectionTimeoutMS":5000,"socketTimeoutMS":45000}

# .env.development
MONGODB_URI=mongodb+srv://ludus_app_user:${MONGODB_PASSWORD}@ludus-production-cluster.xxxxx.mongodb.net/ludus_development?retryWrites=true&w=majority
DATABASE_NAME=ludus_development
```

### Database Configuration Update
```javascript
// apps/api/src/config/database.js
const connectDB = async () => {
  try {
    let mongoUri;

    if (process.env.NODE_ENV === 'test') {
      // Use in-memory MongoDB for testing
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    } else {
      // Use MongoDB Atlas for development and production
      mongoUri = process.env.MONGODB_URI;
      
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is required');
      }
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false
    };

    // Parse additional options from environment
    if (process.env.MONGODB_OPTIONS) {
      const additionalOptions = JSON.parse(process.env.MONGODB_OPTIONS);
      Object.assign(options, additionalOptions);
    }

    const conn = await mongoose.connect(mongoUri, options);

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Create indexes for better performance
    await createIndexes();
    
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Production server will continue without database connection');
      return false;
    } else {
      throw error;
    }
  }
};
```

---

## 📊 Monitoring and Maintenance

### Key Metrics to Monitor
```yaml
Performance Metrics:
  - Query Response Time (target: <100ms)
  - Connection Pool Utilization (target: <80%)
  - Index Usage (target: >90%)
  - Memory Usage (target: <80%)
  - CPU Usage (target: <80%)

Business Metrics:
  - Active Users
  - Bookings per Day
  - Revenue per Day
  - Error Rate (target: <0.1%)
```

### Alert Thresholds
```yaml
Critical Alerts:
  - Connection failures
  - Query time >500ms
  - Memory usage >90%
  - CPU usage >90%
  - Backup failures

Warning Alerts:
  - Query time >200ms
  - Memory usage >80%
  - CPU usage >80%
  - Index usage <70%
```

### Maintenance Schedule
```yaml
Daily:
  - Check backup status
  - Review performance metrics
  - Monitor error rates

Weekly:
  - Analyze slow queries
  - Review index usage
  - Check storage usage

Monthly:
  - Performance optimization review
  - Security audit
  - Capacity planning
```

---

## 🔒 Security Checklist

### Pre-Production Security
- [ ] IP whitelisting configured
- [ ] Database users created with minimal privileges
- [ ] Encryption enabled (at rest and in transit)
- [ ] Audit logging enabled
- [ ] Backup encryption configured
- [ ] Network security rules applied

### Production Security
- [ ] Remove development IPs from whitelist
- [ ] Enable advanced threat protection
- [ ] Configure data residency compliance
- [ ] Set up security monitoring
- [ ] Implement access logging
- [ ] Regular security audits

---

## 📈 Performance Optimization

### Query Optimization
```javascript
// Use proper indexes
db.activities.find({
  'location.city': 'الرياض',
  'category.id': ObjectId('...'),
  'status': 'active'
}).explain('executionStats');

// Use aggregation pipelines for complex queries
db.activities.aggregate([
  { $match: { 'location.city': 'الرياض' } },
  { $lookup: {
    from: 'reviews',
    localField: '_id',
    foreignField: 'activity.id',
    as: 'reviews'
  }},
  { $addFields: {
    averageRating: { $avg: '$reviews.rating.overall' }
  }},
  { $sort: { averageRating: -1 } }
]);
```

### Index Optimization
```javascript
// Create compound indexes for common query patterns
db.activities.createIndex({
  'location.city': 1,
  'category.id': 1,
  'status': 1,
  'createdAt': -1
});

// Create partial indexes for better performance
db.users.createIndex(
  { 'profile.isVerified': 1 },
  { partialFilterExpression: { 'profile.isVerified': true } }
);
```

---

## 🚀 Deployment Integration

### Render.com Integration
```yaml
# render.yaml
services:
  - type: web
    name: ludus-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: MONGODB_URI
        value: mongodb+srv://ludus_app_user:${MONGODB_PASSWORD}@ludus-production-cluster.xxxxx.mongodb.net/ludus_production?retryWrites=true&w=majority
      - key: DATABASE_NAME
        value: ludus_production
```

### Environment Variables
```bash
# Production Environment Variables
MONGODB_URI=mongodb+srv://ludus_app_user:${MONGODB_PASSWORD}@ludus-production-cluster.xxxxx.mongodb.net/ludus_production?retryWrites=true&w=majority
DATABASE_NAME=ludus_production
MONGODB_OPTIONS={"maxPoolSize":10,"serverSelectionTimeoutMS":5000,"socketTimeoutMS":45000}
```

---

## ✅ Acceptance Criteria Verification

| Criteria | Status | Evidence |
|----------|--------|----------|
| M30 cluster provisioned in Saudi region | ⏳ | Cluster configuration documented |
| Network access configured | ⏳ | IP whitelist setup guide |
| Database users and roles set up | ⏳ | User management procedures |
| Automated backups enabled | ⏳ | Backup configuration documented |
| Monitoring alerts configured | ⏳ | Alert setup procedures |
| Connection strings configured | ⏳ | Environment variables documented |
| Security rules implemented | ⏳ | Security checklist provided |
| Performance monitoring enabled | ⏳ | Monitoring configuration documented |

---

## 🎯 Next Steps

### Immediate Actions
1. **Create MongoDB Atlas Account** - Set up organization and project
2. **Provision M30 Cluster** - Configure in Saudi Arabia region
3. **Set Up Security** - Configure network access and users
4. **Test Connectivity** - Validate connection and performance
5. **Update Environment** - Configure production environment variables

### Follow-up Tasks
1. **LDS-006:** Core Schema Implementation
2. **LDS-007:** Database Migrations System
3. **Performance Testing** - Load testing and optimization
4. **Security Audit** - Comprehensive security review

---

## 📞 Support and Troubleshooting

### Common Issues
1. **Connection Timeouts** - Check network access and IP whitelist
2. **Authentication Failures** - Verify user credentials and roles
3. **Performance Issues** - Review indexes and query patterns
4. **Backup Failures** - Check backup configuration and permissions

### Contact Information
- **MongoDB Atlas Support:** [support.mongodb.com](https://support.mongodb.com)
- **LUDUS Team:** Available through Linear and Notion
- **Emergency Contact:** Claude (Aether-Render Project Manager)

---

**Document Created:** October 6, 2025  
**Status:** 🚧 IN PROGRESS  
**Next Review:** Upon completion of cluster setup  
**Approved by:** Claude (Aether-Render Project Manager)
