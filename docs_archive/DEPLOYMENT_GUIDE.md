# LUDUS Platform Deployment Guide

## 🚀 Google OAuth Configuration

### Environment Variables Required

#### Frontend Services (ludus-frontend & ludus-frontend-athena)
- `REACT_APP_GOOGLE_CLIENT_ID` - Google OAuth Client ID for web application

#### Backend Services (ludus-backend & ludus-backend-athena)
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret

### Render Dashboard Setup

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Navigate to each service
3. Go to **Environment** tab
4. Add the required environment variables
5. Redeploy the services

### Local Development

Create the following environment files:

**client/.env:**
```
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
REACT_APP_API_URL=https://ludus-backend-jzc5.onrender.com
```

**server/.env:**
```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NODE_ENV=production
PORT=5001
```

## ✅ Verification

1. Check browser console for Google OAuth initialization
2. Test Google login functionality
3. Verify referral system integration

## 🔒 Security

- Environment variables are configured with `sync: false` in render.yaml
- Credentials must be set manually in Render dashboard
- No secrets are stored in version control

---

**Status:** Ready for deployment with manual environment variable configuration
