# MongoDB Atlas Setup - LUDUS Platform

**Version:** 1.0  
**Last Updated:** January 27, 2025  
**Status:** Production Ready  

## 📋 Overview

This document outlines the complete MongoDB Atlas setup for the LUDUS platform, including cluster configuration, security settings, monitoring, and backup strategies.

## 🏗️ Cluster Configuration

### **Production Cluster Specifications**

| Parameter | Value | Description |
|-----------|-------|-------------|
| **Cluster Name** | `ludus-production` | Production cluster identifier |
| **Cluster Tier** | M30 | Production-ready cluster |
| **Region** | Middle East (Bahrain) | Closest to Saudi Arabia |
| **Cloud Provider** | AWS | Amazon Web Services |
| **MongoDB Version** | 7.0 | Latest stable version |
| **Storage Engine** | WiredTiger | Default storage engine |
| **Backup** | Enabled | Automated daily backups |
| **Retention** | 7 days | Backup retention period |

### **Development Cluster Specifications**

| Parameter | Value | Description |
|-----------|-------|-------------|
| **Cluster Name** | `ludus-development` | Development cluster identifier |
| **Cluster Tier** | M10 | Development cluster |
| **Region** | Middle East (Bahrain) | Same region as production |
| **Cloud Provider** | AWS | Amazon Web Services |
| **MongoDB Version** | 7.0 | Latest stable version |
| **Backup** | Enabled | Automated daily backups |
| **Retention** | 3 days | Shorter retention for dev |

## 🔐 Security Configuration

### **Network Access**

#### **IP Whitelist**
```
# Production IPs
54.123.45.67/32    # Render.com production
54.123.45.68/32    # Render.com production backup
203.0.113.0/24     # Office network
198.51.100.0/24    # Development team

# Development IPs
0.0.0.0/0          # Development (temporary)
```

#### **VPC Peering**
- **Production:** VPC peering with Render.com
- **Development:** Public access for development
- **Security Groups:** Restrictive inbound rules

### **Database Users**

#### **Application User**
```javascript
{
  username: "ludus_app",
  password: "SecurePassword123!",
  database: "ludus_production",
  roles: [
    {
      role: "readWrite",
      db: "ludus_production"
    }
  ]
}
```

#### **Admin User**
```javascript
{
  username: "ludus_admin",
  password: "AdminPassword456!",
  database: "admin",
  roles: [
    {
      role: "dbAdminAnyDatabase",
      db: "admin"
    },
    {
      role: "userAdminAnyDatabase",
      db: "admin"
    }
  ]
}
```

#### **Read-Only User**
```javascript
{
  username: "ludus_readonly",
  password: "ReadOnlyPassword789!",
  database: "ludus_production",
  roles: [
    {
      role: "read",
      db: "ludus_production"
    }
  ]
}
```

### **Encryption**

#### **Encryption at Rest**
- **Status:** Enabled
- **Provider:** AWS KMS
- **Key Management:** Customer-managed keys
- **Algorithm:** AES-256

#### **Encryption in Transit**
- **TLS Version:** 1.2+
- **Certificate:** MongoDB Atlas managed
- **Validation:** Required for all connections

## 📊 Database Configuration

### **Database Structure**

#### **Production Database**
```javascript
// Database: ludus_production
{
  collections: [
    "users",
    "activities", 
    "bookings",
    "reviews",
    "partners",
    "categories",
    "payments",
    "notifications",
    "sessions",
    "analytics"
  ]
}
```

#### **Development Database**
```javascript
// Database: ludus_development
{
  collections: [
    "users",
    "activities",
    "bookings", 
    "reviews",
    "partners",
    "categories",
    "payments",
    "notifications",
    "sessions",
    "analytics",
    "test_data" // Additional test collections
  ]
}
```

### **Indexes Configuration**

#### **Performance Indexes**
```javascript
// Users Collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "preferences.location.coordinates": "2dsphere" })
db.users.createIndex({ "role": 1, "isActive": 1 })
db.users.createIndex({ "createdAt": -1 })

// Activities Collection
db.activities.createIndex({ "location.coordinates": "2dsphere" })
db.activities.createIndex({ "category": 1, "status": 1, "isActive": 1 })
db.activities.createIndex({ 
  "title.ar": "text", 
  "title.en": "text", 
  "description.ar": "text", 
  "description.en": "text" 
})
db.activities.createIndex({ "schedule.startDate": 1, "schedule.endDate": 1 })
db.activities.createIndex({ "partner.id": 1, "status": 1 })
db.activities.createIndex({ "pricing.adult": 1 })
db.activities.createIndex({ "createdAt": -1 })

// Bookings Collection
db.bookings.createIndex({ "user.id": 1, "createdAt": -1 })
db.bookings.createIndex({ "activity.id": 1, "status": 1 })
db.bookings.createIndex({ "payment.id": 1 })
db.bookings.createIndex({ "qrCode": 1 }, { unique: true })
db.bookings.createIndex({ "status": 1, "createdAt": -1 })

// Reviews Collection
db.reviews.createIndex({ "activity.id": 1, "isActive": 1 })
db.reviews.createIndex({ "user.id": 1, "createdAt": -1 })
db.reviews.createIndex({ "rating": 1, "isActive": 1 })
db.reviews.createIndex({ "isVerified": 1, "createdAt": -1 })

// Payments Collection
db.payments.createIndex({ "bookingId": 1 })
db.payments.createIndex({ "status": 1, "createdAt": -1 })
db.payments.createIndex({ "transactionId": 1 }, { unique: true })
```

#### **TTL Indexes**
```javascript
// Sessions Collection - Auto-delete after 7 days
db.sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })

// Analytics Collection - Auto-delete after 1 year
db.analytics.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 31536000 })
```

## 🔄 Backup Configuration

### **Automated Backups**

#### **Production Backup Settings**
- **Frequency:** Daily at 2:00 AM UTC
- **Retention:** 7 days
- **Point-in-Time Recovery:** Enabled
- **Compression:** Enabled
- **Encryption:** Enabled

#### **Development Backup Settings**
- **Frequency:** Daily at 3:00 AM UTC
- **Retention:** 3 days
- **Point-in-Time Recovery:** Disabled
- **Compression:** Enabled
- **Encryption:** Enabled

### **Backup Monitoring**
- **Email Alerts:** Backup success/failure notifications
- **Dashboard:** Backup status in MongoDB Atlas console
- **Logs:** Detailed backup logs for troubleshooting

## 📈 Monitoring & Alerting

### **Performance Monitoring**

#### **Key Metrics**
- **CPU Usage:** Alert if > 80% for 5 minutes
- **Memory Usage:** Alert if > 85% for 5 minutes
- **Disk Usage:** Alert if > 90% for 5 minutes
- **Connection Count:** Alert if > 80% of limit
- **Query Performance:** Alert if slow queries > 100ms

#### **Database Metrics**
- **Query Execution Time:** Average < 50ms
- **Index Usage:** Monitor unused indexes
- **Lock Percentage:** Alert if > 5%
- **Cache Hit Ratio:** Monitor cache efficiency

### **Alert Configuration**

#### **Critical Alerts**
```yaml
# Cluster Down
- condition: cluster_status != "running"
- severity: critical
- notification: email + slack

# High CPU Usage
- condition: cpu_usage > 80% for 5 minutes
- severity: warning
- notification: email

# High Memory Usage
- condition: memory_usage > 85% for 5 minutes
- severity: warning
- notification: email

# Disk Space Low
- condition: disk_usage > 90%
- severity: critical
- notification: email + slack
```

#### **Warning Alerts**
```yaml
# Slow Queries
- condition: query_time > 100ms
- severity: info
- notification: email

# High Connection Count
- condition: connections > 80% of limit
- severity: warning
- notification: email

# Backup Failure
- condition: backup_status != "success"
- severity: warning
- notification: email
```

## 🔧 Connection Configuration

### **Connection Strings**

#### **Production Connection**
```javascript
// Production MongoDB URI
mongodb+srv://ludus_app:SecurePassword123!@ludus-production.abc123.mongodb.net/ludus_production?retryWrites=true&w=majority&authSource=admin

// With additional options
mongodb+srv://ludus_app:SecurePassword123!@ludus-production.abc123.mongodb.net/ludus_production?retryWrites=true&w=majority&authSource=admin&maxPoolSize=20&minPoolSize=5&maxIdleTimeMS=30000&serverSelectionTimeoutMS=5000
```

#### **Development Connection**
```javascript
// Development MongoDB URI
mongodb+srv://ludus_app:DevPassword123!@ludus-development.def456.mongodb.net/ludus_development?retryWrites=true&w=majority&authSource=admin
```

### **Connection Pool Settings**

#### **Production Pool**
```javascript
{
  maxPoolSize: 20,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true
}
```

#### **Development Pool**
```javascript
{
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true
}
```

## 🛠️ Environment Configuration

### **Environment Variables**

#### **Production Environment**
```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://ludus_app:SecurePassword123!@ludus-production.abc123.mongodb.net/ludus_production?retryWrites=true&w=majority&authSource=admin
MONGODB_DB=ludus_production
MONGODB_USER=ludus_app
MONGODB_PASSWORD=SecurePassword123!

# Connection Pool
MONGODB_MAX_POOL_SIZE=20
MONGODB_MIN_POOL_SIZE=5
MONGODB_MAX_IDLE_TIME=30000
MONGODB_SERVER_SELECTION_TIMEOUT=5000
MONGODB_CONNECT_TIMEOUT=10000
MONGODB_SOCKET_TIMEOUT=45000

# SSL Configuration
MONGODB_SSL=true
MONGODB_SSL_VALIDATE=true
```

#### **Development Environment**
```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://ludus_app:DevPassword123!@ludus-development.def456.mongodb.net/ludus_development?retryWrites=true&w=majority&authSource=admin
MONGODB_DB=ludus_development
MONGODB_USER=ludus_app
MONGODB_PASSWORD=DevPassword123!

# Connection Pool
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=2
MONGODB_MAX_IDLE_TIME=30000
MONGODB_SERVER_SELECTION_TIMEOUT=5000
MONGODB_CONNECT_TIMEOUT=10000
MONGODB_SOCKET_TIMEOUT=45000

# SSL Configuration
MONGODB_SSL=true
MONGODB_SSL_VALIDATE=true
```

## 📋 Setup Checklist

### **Initial Setup**
- [ ] Create MongoDB Atlas account
- [ ] Set up organization and project
- [ ] Create production cluster (M30)
- [ ] Create development cluster (M10)
- [ ] Configure network access and IP whitelist
- [ ] Create database users with appropriate roles
- [ ] Enable encryption at rest and in transit
- [ ] Configure automated backups
- [ ] Set up monitoring and alerting
- [ ] Test connections from application

### **Security Setup**
- [ ] Configure VPC peering for production
- [ ] Set up IP whitelist with specific IPs
- [ ] Create application user with read/write permissions
- [ ] Create admin user for database management
- [ ] Create read-only user for analytics
- [ ] Enable audit logging
- [ ] Configure data encryption
- [ ] Set up certificate management

### **Monitoring Setup**
- [ ] Configure performance monitoring
- [ ] Set up critical alerts
- [ ] Set up warning alerts
- [ ] Configure backup monitoring
- [ ] Set up dashboard for monitoring
- [ ] Test alert notifications
- [ ] Document monitoring procedures

### **Backup Setup**
- [ ] Enable automated daily backups
- [ ] Configure backup retention (7 days production, 3 days dev)
- [ ] Enable point-in-time recovery for production
- [ ] Test backup restoration process
- [ ] Set up backup monitoring alerts
- [ ] Document backup procedures

## 🚨 Troubleshooting

### **Common Issues**

#### **Connection Issues**
```bash
# Check network connectivity
ping ludus-production.abc123.mongodb.net

# Test connection with mongosh
mongosh "mongodb+srv://ludus_app:password@ludus-production.abc123.mongodb.net/ludus_production"

# Check firewall settings
telnet ludus-production.abc123.mongodb.net 27017
```

#### **Performance Issues**
```javascript
// Check slow queries
db.setProfilingLevel(2, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(5)

// Check index usage
db.activities.aggregate([{ $indexStats: {} }])

// Check connection count
db.serverStatus().connections
```

#### **Backup Issues**
```bash
# Check backup status
# Via MongoDB Atlas console > Backup > Restore

# Check backup logs
# Via MongoDB Atlas console > Activity Feed
```

## 📞 Support

### **MongoDB Atlas Support**
- **Documentation:** https://docs.atlas.mongodb.com/
- **Community:** https://community.mongodb.com/
- **Support:** Available through MongoDB Atlas console

### **LUDUS Team Support**
- **Technical Lead:** dev@ludus.sa
- **Database Admin:** dba@ludus.sa
- **Emergency:** +966-XX-XXX-XXXX

---

**Document Status:** ✅ **COMPLETED**  
**Next Review:** February 27, 2025  
**Maintainer:** LUDUS Development Team
