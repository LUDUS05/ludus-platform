# Google OAuth Production Setup Guide

## 🚨 **URGENT: Production Google OAuth Configuration Required**

The Google login is failing because the production backend doesn't have the Google OAuth environment variables configured.

## 📋 **Required Environment Variables**

You need to set these environment variables in your Render dashboard:

### **Backend Service (ludus-backend)**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Navigate to your backend service: `ludus-backend` (Service ID: srv-d2v0aj0gjchc73aolf30)
3. Go to **Environment** tab
4. Add these environment variables:

```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### **Frontend Service (ludus-frontend)**
1. Go to your frontend service in Render dashboard
2. Go to **Environment** tab
3. Add this environment variable:

```
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## 🔄 **After Setting Variables**

1. **Redeploy both services** (or they will auto-deploy if auto-deploy is enabled)
2. **Test Google login** at `https://app.letsludus.com/hi`

## 📝 **Note**

The actual Google OAuth credentials are not included in this guide for security reasons. You need to use the credentials provided separately.

## ✅ **Verification**

After setting the environment variables, the Google login should work properly. The backend will be able to verify Google OAuth tokens and complete the authentication process.
