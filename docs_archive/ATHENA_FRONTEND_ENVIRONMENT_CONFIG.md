# 🎬 Project ATHENA - Frontend Environment Configuration
## LUDUS Platform - Frontend Service Environment Variables

**Purpose:** Configure frontend environment variables for Project ATHENA deployment  
**Service:** ludus-frontend-athena  
**Platform:** Render  

---

## 🔧 **Required Environment Variables**

### **Core Configuration:**
```bash
# API Configuration - REQUIRED
REACT_APP_API_URL=https://ludus-backend-athena.onrender.com

# Animation Configuration - REQUIRED
REACT_APP_ANIMATION_ENABLED=true
REACT_APP_RTL_SUPPORT=true

# Performance Monitoring - REQUIRED
REACT_APP_PERFORMANCE_MONITORING=true
REACT_APP_DEBUG_MODE=false
```

### **Optional Services:**
```bash
# Google Services (Optional - for maps and social login)
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id

# Facebook Login (Optional)
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id

# Payment Integration (Optional - for Moyasar)
REACT_APP_MOYASAR_PUBLISHABLE_KEY=your_moyasar_publishable_key

# Image Service (Optional - for Unsplash)
REACT_APP_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
REACT_APP_UNSPLASH_SECRET_KEY=your_unsplash_secret_key

# Error Monitoring (Optional - for Sentry)
REACT_APP_SENTRY_DSN=your_sentry_dsn
```

---

## 🚀 **How to Set Environment Variables in Render**

### **Step 1: Access Render Dashboard**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Navigate to your `ludus-frontend-athena` service
3. Click on "Environment" tab

### **Step 2: Add Required Variables**
Add these **REQUIRED** environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `REACT_APP_API_URL` | `https://ludus-backend-athena.onrender.com` | Backend API URL |
| `REACT_APP_ANIMATION_ENABLED` | `true` | Enable GSAP animations |
| `REACT_APP_RTL_SUPPORT` | `true` | Enable Arabic RTL support |
| `REACT_APP_PERFORMANCE_MONITORING` | `true` | Enable performance monitoring |
| `REACT_APP_DEBUG_MODE` | `false` | Disable debug mode for production |

### **Step 3: Add Optional Variables (if needed)**
Add any optional services you want to enable:

| Variable | Value | Description |
|----------|-------|-------------|
| `REACT_APP_GOOGLE_MAPS_API_KEY` | `your_key` | Google Maps integration |
| `REACT_APP_GOOGLE_CLIENT_ID` | `your_id` | Google OAuth login |
| `REACT_APP_FACEBOOK_APP_ID` | `your_id` | Facebook login |
| `REACT_APP_MOYASAR_PUBLISHABLE_KEY` | `your_key` | Payment processing |
| `REACT_APP_UNSPLASH_ACCESS_KEY` | `your_key` | Image service |
| `REACT_APP_SENTRY_DSN` | `your_dsn` | Error monitoring |

### **Step 4: Deploy**
1. Click "Save Changes"
2. The service will automatically redeploy with new environment variables
3. Monitor the deployment logs for success

---

## 🔍 **Environment Variable Usage in Code**

### **API Configuration:**
```javascript
// src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ludus-backend-athena.onrender.com';
```

### **Animation Configuration:**
```javascript
// src/utils/gsap-setup.js
const animationEnabled = process.env.REACT_APP_ANIMATION_ENABLED === 'true';
const rtlSupport = process.env.REACT_APP_RTL_SUPPORT === 'true';
```

### **Performance Monitoring:**
```javascript
// src/utils/performance.js
const performanceMonitoring = process.env.REACT_APP_PERFORMANCE_MONITORING === 'true';
const debugMode = process.env.REACT_APP_DEBUG_MODE === 'true';
```

---

## 🧪 **Testing Environment Variables**

### **After Setting Variables:**
1. **Check Build Logs:** Look for environment variable confirmation
2. **Test API Connection:** Verify frontend can connect to backend
3. **Test Animations:** Verify GSAP animations are working
4. **Test RTL Support:** Verify Arabic language support
5. **Test Performance:** Check performance monitoring is active

### **Debug Commands:**
```javascript
// Add to browser console to verify environment variables
console.log('Environment Variables:', {
  API_URL: process.env.REACT_APP_API_URL,
  ANIMATION_ENABLED: process.env.REACT_APP_ANIMATION_ENABLED,
  RTL_SUPPORT: process.env.REACT_APP_RTL_SUPPORT,
  PERFORMANCE_MONITORING: process.env.REACT_APP_PERFORMANCE_MONITORING
});
```

---

## 🎯 **Expected Results**

### **After Configuration:**
- ✅ **Frontend connects to backend** - API calls work
- ✅ **GSAP animations active** - Smooth 60fps animations
- ✅ **RTL support enabled** - Arabic language support
- ✅ **Performance monitoring** - Real-time metrics
- ✅ **Production optimized** - Debug mode disabled

### **Service URLs:**
- **Frontend:** https://ludus-frontend-athena.onrender.com
- **Backend:** https://ludus-backend-athena.onrender.com
- **API Connection:** Frontend → Backend ✅

---

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **1. API Connection Failed**
- **Check:** `REACT_APP_API_URL` is set correctly
- **Verify:** Backend service is running
- **Test:** Direct API call to backend URL

#### **2. Animations Not Working**
- **Check:** `REACT_APP_ANIMATION_ENABLED=true`
- **Verify:** GSAP is loaded correctly
- **Test:** Animation presets are available

#### **3. RTL Support Not Working**
- **Check:** `REACT_APP_RTL_SUPPORT=true`
- **Verify:** Document direction is set
- **Test:** Arabic text displays correctly

#### **4. Performance Issues**
- **Check:** `REACT_APP_DEBUG_MODE=false`
- **Verify:** Performance monitoring is active
- **Test:** Frame rate is 60fps

---

## 📊 **Environment Variable Status**

### **Current Configuration:**
- ✅ **API URL:** Configured for backend connection
- ✅ **Animation:** Enabled for GSAP integration
- ✅ **RTL Support:** Enabled for Arabic language
- ✅ **Performance:** Monitoring enabled
- ✅ **Debug Mode:** Disabled for production

### **Next Steps:**
1. **Set environment variables** in Render dashboard
2. **Redeploy frontend service** with new configuration
3. **Test complete system** functionality
4. **Configure custom domain** (app.letsludus.com)

---

## 🎉 **Project ATHENA Frontend Configuration**

**The frontend service is ready for environment variable configuration to complete the Project ATHENA deployment!**

### **Key Benefits:**
- ✅ **Seamless API integration** with backend
- ✅ **Optimized animations** with GSAP
- ✅ **Arabic language support** with RTL
- ✅ **Performance monitoring** for optimization
- ✅ **Production-ready** configuration

**Once environment variables are set, Project ATHENA will be fully operational with all features active!** 🚀✨

---

*Project ATHENA - Frontend Environment Configuration Guide* 🎬

**Created by:** Aether-Render Project Manager  
**Date:** 2025-09-05  
**Status:** Ready for Configuration ✅  
**Next:** Set environment variables in Render dashboard 🚀
