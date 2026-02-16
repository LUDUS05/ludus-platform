# 🌐 Custom Domain Setup Guide: app.letsludus.com

## 🎯 **What We're Setting Up**
Configure your LUDUS platform to use the custom domain `app.letsludus.com` instead of Render subdomains.

## 📋 **Prerequisites**
- Domain `letsludus.com` registered with a domain provider
- Access to domain DNS settings
- Both frontend and backend services deployed on Render

## 🚀 **Step-by-Step Domain Setup**

### **Step 1: DNS Configuration**

#### **Option A: Using Render's DNS (Recommended)**
1. Go to your domain provider (GoDaddy, Namecheap, etc.)
2. Find DNS management settings
3. Add these DNS records:

```
Type: CNAME
Name: app
Value: ludus-frontend-gf1g.onrender.com
TTL: 3600 (or default)

Type: CNAME  
Name: api
Value: ludus-backend-gf1g.onrender.com
TTL: 3600 (or default)
```

#### **Option B: Using Custom DNS Provider**
If you prefer to manage DNS elsewhere, add the same CNAME records.

### **Step 2: Configure Render Services**

#### **Frontend Service (ludus-frontend)**
1. Go to Render dashboard → `ludus-frontend` service
2. Click **Settings** tab
3. Scroll to **Custom Domains** section
4. Click **Add Custom Domain**
5. Enter: `app.letsludus.com`
6. Click **Add Domain**

#### **Backend Service (ludus-backend)**
1. Go to Render dashboard → `ludus-backend` service  
2. Click **Settings** tab
3. Scroll to **Custom Domains** section
4. Click **Add Custom Domain**
5. Enter: `api.letsludus.com` (for API endpoints)
6. Click **Add Domain**

### **Step 3: SSL Certificate**
- Render automatically provisions SSL certificates
- Wait 5-10 minutes for SSL to activate
- Check: `https://app.letsludus.com` should work

### **Step 4: Update Environment Variables**

#### **Backend Service Environment Variables:**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://lds:Mm0916777655@ludus-mvp.kdxn9gc.mongodb.net/ludus_production?retryWrites=true&w=majority&appName=ludus-mvp
JWT_SECRET=ludus-super-secret-jwt-key-development-2024
JWT_REFRESH_SECRET=ludus-super-secret-refresh-jwt-key-development-2024
MOYASAR_SECRET_KEY=sk_test_your_moyasar_secret_key
MOYASAR_PUBLISHABLE_KEY=pk_test_your_moyasar_publishable_key
MOYASAR_WEBHOOK_SECRET=your_moyasar_webhook_secret
CLIENT_URL=https://app.letsludus.com
```

#### **Frontend Service Environment Variables:**
```
REACT_APP_API_URL=https://api.letsludus.com/api
```

## 🔗 **Final URL Structure**

### **Production URLs:**
- **Main App**: `https://app.letsludus.com`
- **API Endpoints**: `https://api.letsludus.com/api/*`
- **Admin Panel**: `https://app.letsludus.com/admin`
- **User Registration**: `https://app.letsludus.com/register`

### **Development URLs:**
- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:5001`
- **API**: `http://localhost:5001/api`

## ✅ **Benefits of Custom Domain**

1. **🎯 Professional**: Looks more credible than Render subdomains
2. **🔗 Memorable**: Easy to remember and share
3. **📱 Branded**: Consistent with your LUDUS brand
4. **🔒 Secure**: SSL certificates automatically managed
5. **🚀 Scalable**: Easy to add subdomains later

## 🚨 **Important Notes**

### **DNS Propagation:**
- DNS changes can take 24-48 hours to propagate globally
- Some regions may see changes faster than others
- Use tools like `whatsmydns.net` to check propagation

### **SSL Certificate:**
- Render automatically handles SSL certificates
- Initial SSL activation may take 5-10 minutes
- Always use `https://` in production

### **Environment Variables:**
- Update both frontend and backend environment variables
- Use the new custom domain URLs
- Test thoroughly after changes

## 🔍 **Testing Your Setup**

### **1. DNS Check:**
```bash
# Check if DNS is resolving
nslookup app.letsludus.com
nslookup api.letsludus.com
```

### **2. SSL Check:**
- Visit `https://app.letsludus.com`
- Look for padlock icon in browser
- Check SSL certificate details

### **3. API Test:**
```bash
# Test API endpoint
curl -X GET https://api.letsludus.com/api/admin/users
```

### **4. Frontend Test:**
- Visit `https://app.letsludus.com`
- Test user registration
- Test admin panel
- Test all Neo UI features

## 🆘 **Troubleshooting**

### **Common Issues:**

#### **1. DNS Not Resolving**
- Wait 24-48 hours for propagation
- Check DNS records are correct
- Verify domain provider settings

#### **2. SSL Not Working**
- Wait 5-10 minutes after adding domain
- Check Render dashboard for SSL status
- Ensure using `https://` not `http://`

#### **3. API Endpoints Not Working**
- Verify backend environment variables
- Check CORS settings
- Test with Postman or curl

#### **4. Frontend Not Loading**
- Check frontend environment variables
- Verify build process completed
- Check Render service status

## 🎉 **You're Done!**

After setup, your LUDUS platform will be accessible at:
- **Main App**: `https://app.letsludus.com`
- **API**: `https://api.letsludus.com/api/*`

**Status**: 🌐 **READY FOR CUSTOM DOMAIN SETUP** - Professional, branded URLs!
