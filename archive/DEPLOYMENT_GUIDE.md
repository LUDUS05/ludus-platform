# LUDUS Platform - Deployment Guide

## 🚀 Production Deployment Instructions

### Prerequisites

1. **Install CLI Tools**
   ```bash
   npm install -g vercel @railway/cli
   ```

2. **Authentication**
   ```bash
   vercel login
   railway login
   ```

### 🎯 Quick Deploy (Recommended)

**Option 1: Automated Scripts**
```bash
# Deploy both frontend and backend
./deploy-frontend.sh
./deploy-backend.sh
```

**Option 2: Manual Steps**

#### Deploy Backend (Railway)
```bash
# From project root
railway up
```

#### Deploy Frontend (Vercel)
```bash
cd client
vercel --prod
```

### 🔧 Environment Configuration

#### Backend Environment Variables (Railway)
Set these in your Railway dashboard:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ludus_production
JWT_SECRET=your-super-secret-jwt-key-for-production

# Payment Processing (Moyasar Production Keys)
MOYASAR_SECRET_KEY=sk_live_your_production_secret_key
MOYASAR_PUBLISHABLE_KEY=pk_live_your_production_publishable_key
MOYASAR_WEBHOOK_SECRET=your_production_webhook_secret

# Email Service (Google Workspace SMTP)
SMTP_HOST=smtp-relay.gmail.com
SMTP_PORT=587
SMTP_USER=hi@letsludus.com
SMTP_PASS=your-google-app-password
FROM_EMAIL=hi@letsludus.com
FROM_NAME=LUDUS Platform

# Optional: Image uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Frontend Environment Variables (Vercel)
Create `.env.production` in client folder:

```env
REACT_APP_API_URL=https://your-backend-url.railway.app
REACT_APP_MOYASAR_PUBLISHABLE_KEY=pk_live_your_production_publishable_key
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### 🌐 Domain Configuration

#### Custom Domains

**Frontend (Vercel)**
1. In Vercel dashboard → Project Settings → Domains
2. Add your domain (e.g., `app.letsludus.com`)
3. Configure DNS as instructed

**Backend (Railway)**
1. In Railway dashboard → Project → Settings → Domains
2. Add custom domain (e.g., `api.letsludus.com`)
3. Update frontend `REACT_APP_API_URL`

### 🔒 Security Checklist

#### Production Security Settings

1. **Update CORS origins** in `server/src/app.js`:
   ```javascript
   origin: [
     'https://app.letsludus.com',
     'https://your-production-domain.com'
   ]
   ```

2. **Environment Variables Security**
   - Use strong JWT secrets (64+ characters)
   - Enable production Moyasar keys
   - Secure database with IP whitelist

3. **SSL/HTTPS**
   - Vercel provides automatic SSL
   - Railway provides automatic SSL
   - Ensure all API calls use HTTPS

### 📊 Monitoring & Health Checks

#### Health Check Endpoints
- **Backend:** `https://your-backend-url.railway.app/health`
- **Frontend:** Built-in Vercel monitoring

#### Performance Monitoring
- Enable Vercel Speed Insights (already configured)
- Set up error monitoring (Sentry configured)

### 🧪 Testing Production Deployment

1. **Backend Health Check**
   ```bash
   curl https://your-backend-url.railway.app/health
   ```

2. **Frontend Accessibility**
   - Visit your frontend URL
   - Test user registration/login
   - Test activity browsing
   - Test payment flow (use test cards)

3. **Email Service Test**
   - Register new account
   - Test password reset
   - Test booking confirmation emails

### 🔄 CI/CD Setup (Optional)

#### GitHub Actions for Auto-Deploy

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy LUDUS Platform

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g @railway/cli
      - run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd client && npm install
      - run: cd client && npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./client
```

### 🚨 Troubleshooting

#### Common Issues

1. **Build Failures**
   - Check Node.js version (>=18.0.0)
   - Verify all dependencies installed
   - Check for linting errors

2. **Environment Variables**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify database connection strings

3. **CORS Errors**
   - Update allowed origins in backend
   - Check frontend API URL configuration

4. **Payment Issues**
   - Verify Moyasar production keys
   - Check webhook URL configuration
   - Test with Saudi credit cards

### 📞 Support

- **Railway Support:** https://railway.app/help
- **Vercel Support:** https://vercel.com/help
- **LUDUS Documentation:** Check project README.md

---

## 🎉 Deployment Complete!

Your LUDUS platform is now live and ready for users!

**Next Steps:**
1. Set up monitoring and analytics
2. Configure backup strategies
3. Plan for scaling as user base grows
4. Monitor payment transactions
5. Set up customer support channels