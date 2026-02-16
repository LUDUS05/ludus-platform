# Database Setup Guide - LUDUS Platform

## 🎯 **Current Working Configuration**

### **Database Connection (RESOLVED ✅)**
- **MongoDB URI**: `mongodb+srv://lds:Mm0916777655@ludus-mvp.kdxn9gc.mongodb.net/ludus_production`
- **Database**: `ludus_production`
- **Status**: ✅ **Connected and Working**

## 🚀 **Quick Start Server**

### **Option 1: Production Database (Recommended)**
```bash
cd server
PORT=5001 NODE_ENV=production MONGODB_URI="mongodb+srv://lds:Mm0916777655@ludus-mvp.kdxn9gc.mongodb.net/ludus_production?retryWrites=true&w=majority&appName=ludus-mvp" node src/app.js
```

### **Option 2: Environment File**
Create `server/.env`:
```bash
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://lds:Mm0916777655@ludus-mvp.kdxn9gc.mongodb.net/ludus_production?retryWrites=true&w=majority&appName=ludus-mvp
JWT_SECRET=ludus-super-secret-jwt-key-development-2024
JWT_REFRESH_SECRET=ludus-super-secret-refresh-jwt-key-development-2024
```

Then run:
```bash
cd server
npm run dev
```

## 🔧 **Why This Configuration Works**

### **Problem Solved:**
- **Client**: Connects to production backend (`https://ludus-backend-crt8.onrender.com/api`)
- **Users**: Register in production database ✅
- **Admin Dashboard**: Now connects to same production database ✅
- **Result**: Admin sees correct user count and all users ✅

### **Key Points:**
1. **NODE_ENV=production** - Avoids in-memory MongoDB
2. **Port 5001** - Port 5000 is blocked by ControlCenter
3. **Production Database** - Same database as user registrations
4. **Real-time Data** - Admin dashboard shows live user data

## 📊 **Admin Endpoints Available**

### **User Management**
- `GET /api/admin/users` - List all users (Admin only)
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/dashboard/overview` - Admin overview

### **Other Admin Routes**
- `/api/admin/vendors` - Vendor management
- `/api/admin/activities` - Activity management
- `/api/admin/bookings` - Booking management

## 🧪 **Testing the Setup**

### **1. Check Server Health**
```bash
curl http://localhost:5001/health
```
Expected: `{"status":"OK","environment":"production"}`

### **2. Test Database Connection**
```bash
curl "http://localhost:5001/api/admin/users" -H "Authorization: Bearer test-token"
```
Expected: `{"success":false,"message":"Invalid token."}` (Endpoint working, just needs auth)

### **3. Verify Database Connection**
Server logs should show:
```
✅ MongoDB Connected: ac-ptjrijo-shard-00-02.kdxn9gc.mongodb.net
Database indexes created successfully
```

## 🚨 **Common Issues & Solutions**

### **Issue: "Cannot find module 'mongodb-memory-server'"**
**Solution**: Use `NODE_ENV=production` instead of `development`

### **Issue: "Port 5000 already in use"**
**Solution**: Use `PORT=5001` (port 5000 blocked by ControlCenter)

### **Issue: "Database connection error"**
**Solution**: Verify MONGODB_URI is correct and accessible

### **Issue: "Route not found"**
**Solution**: Check if server is running and routes are loaded

## 📱 **Client Configuration**

### **Current Setup (Working)**
- Client connects to: `https://ludus-backend-crt8.onrender.com/api`
- Production backend connected to same database
- Admin dashboard shows correct user count

### **Alternative: Local Development**
Create `client/.env.local`:
```bash
REACT_APP_API_URL=http://localhost:5001/api
```

## 🔒 **Security Notes**

- **Database credentials** are in environment variables
- **JWT secrets** should be changed in production
- **Admin routes** require authentication and admin role
- **CORS** configured for localhost:3000 and production domains

## 📋 **Environment Variables Reference**

```bash
# Required for Production Database Connection
NODE_ENV=production
MONGODB_URI=mongodb+srv://lds:Mm0916777655@ludus-mvp.kdxn9gc.mongodb.net/ludus_production?retryWrites=true&w=majority&appName=ludus-mvp

# Server Configuration
PORT=5001
CLIENT_URL=http://localhost:3000

# Authentication
JWT_SECRET=ludus-super-secret-jwt-key-development-2024
JWT_REFRESH_SECRET=ludus-super-secret-refresh-jwt-key-development-2024

# Optional (for full functionality)
MOYASAR_PUBLISHABLE_KEY=pk_test_your_moyasar_publishable_key
MOYASAR_SECRET_KEY=sk_test_your_moyasar_secret_key
SMTP_HOST=smtp-relay.gmail.com
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-password
```

---

**Status**: ✅ **Database Connection Issue RESOLVED**  
**Admin Dashboard**: Now shows accurate user count from production database  
**Next Steps**: Test user registration and verify admin dashboard updates
