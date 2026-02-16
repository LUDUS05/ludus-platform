# LUDUS Platform Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Railway (Backend) + Vercel (Frontend) [RECOMMENDED]

#### Backend Deployment on Railway

1. **Sign up at [Railway.app](https://railway.app)**
2. **Connect GitHub repository**
3. **Deploy backend:**
   ```bash
   # Railway will auto-detect the project
   # Set these environment variables in Railway dashboard:
   ```
   
   **Required Environment Variables:**
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/ludus_production
   JWT_SECRET=your-super-secure-jwt-secret-32-chars-minimum
   JWT_REFRESH_SECRET=your-super-secure-refresh-secret-32-chars-minimum
   MOYASAR_SECRET_KEY=sk_live_your_moyasar_live_secret_key
   MOYASAR_PUBLISHABLE_KEY=pk_live_your_moyasar_live_publishable_key
   MOYASAR_WEBHOOK_SECRET=your_moyasar_webhook_secret
   CLIENT_URL=https://your-frontend.vercel.app
   ```

4. **Configure build command:**
   ```bash
   cd server && npm install
   ```

5. **Configure start command:**
   ```bash
   cd server && npm start
   ```

#### Frontend Deployment on Vercel

1. **Sign up at [Vercel.com](https://vercel.com)**
2. **Connect GitHub repository**
3. **Configure build settings:**
   - **Framework Preset:** Create React App
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

4. **Set environment variables in Vercel:**
   ```env
   REACT_APP_API_URL=https://your-backend.railway.app/api
   REACT_APP_MOYASAR_PUBLISHABLE_KEY=pk_live_your_moyasar_live_publishable_key
   ```

### Option 2: Render (Full-Stack)

1. **Sign up at [Render.com](https://render.com)**
2. **Use the provided `render.yaml` configuration**
3. **Set environment variables in Render dashboard**

### Option 3: Docker Deployment

1. **Build the Docker image:**
   ```bash
   docker build -t ludus-platform .
   ```

2. **Run the container:**
   ```bash
   docker run -p 5000:5000 --env-file .env.production ludus-platform
   ```

## 📋 Pre-Deployment Checklist

### 1. Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas account**
2. **Create a new cluster**
3. **Create database user**
4. **Whitelist IP addresses (0.0.0.0/0 for production)**
5. **Get connection string**

### 2. Payment Gateway (Moyasar)

1. **Sign up at [Moyasar.com](https://moyasar.com)**
2. **Get live API keys:**
   - Publishable Key (`pk_live_...`)
   - Secret Key (`sk_live_...`)
3. **Set up webhooks:**
   - URL: `https://your-backend-domain/api/payments/webhook`
   - Events: `payment.paid`, `payment.failed`, `payment.expired`, `payment.refunded`

### 3. Environment Variables

#### Backend (.env.production)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=secure-secret-32-chars-minimum
JWT_REFRESH_SECRET=secure-refresh-secret-32-chars-minimum
MOYASAR_SECRET_KEY=sk_live_...
MOYASAR_PUBLISHABLE_KEY=pk_live_...
MOYASAR_WEBHOOK_SECRET=webhook_secret_from_moyasar
CLIENT_URL=https://your-frontend-domain.vercel.app
```

#### Frontend (.env.production)
```env
REACT_APP_API_URL=https://your-backend-domain.railway.app/api
REACT_APP_MOYASAR_PUBLISHABLE_KEY=pk_live_...
```

## 🔧 Production Configuration

### Security Headers (Already Configured)
- Helmet.js for security headers
- CORS configured for production
- Rate limiting enabled
- JWT authentication

### Database
- MongoDB Atlas with connection pooling
- Proper indexing for performance
- Backup and monitoring

### Monitoring & Logging
- Application logs via console (captured by hosting platforms)
- Error tracking recommended: Sentry
- Performance monitoring recommended: New Relic

## 📊 Post-Deployment Steps

### 1. Database Seeding
```bash
# Connect to your production database and run:
npm run seed
```

### 2. Admin User Setup
- Default admin created via seeding
- Email: admin@ludusapp.com
- Password: (set via ADMIN_PASSWORD env var)

### 3. Moyasar Webhook Configuration
1. Go to Moyasar dashboard
2. Add webhook URL: `https://your-backend/api/payments/webhook`
3. Select all payment events
4. Save webhook secret to environment variables

### 4. Testing Production
1. **Create test user account**
2. **Browse activities**
3. **Test booking flow**
4. **Test payment processing**
5. **Verify admin panel access**

## 🌐 Custom Domain Setup

### Frontend (Vercel)
1. Add custom domain in Vercel dashboard
2. Configure DNS records
3. SSL automatically provided

### Backend (Railway)
1. Add custom domain in Railway dashboard
2. Configure DNS records
3. Update CLIENT_URL environment variable

## 🔄 Continuous Deployment

Both Railway and Vercel support automatic deployments:
- **Push to main branch** → Auto deploy to production
- **Push to dev branch** → Deploy to staging (if configured)

## 📈 Scaling Considerations

### Database
- MongoDB Atlas auto-scaling enabled
- Consider read replicas for high traffic

### Backend
- Railway/Render auto-scaling available
- Consider load balancer for multiple instances

### Frontend
- Vercel CDN handles global distribution
- Static assets cached automatically

## 🐛 Troubleshooting

### Common Issues
1. **CORS errors:** Check CLIENT_URL in backend env vars
2. **Payment failures:** Verify Moyasar keys and webhook URL
3. **Database connection:** Check MongoDB Atlas IP whitelist
4. **Build failures:** Ensure Node.js version compatibility

### Logs Access
- **Railway:** Built-in logs viewer
- **Vercel:** Function logs in dashboard
- **Render:** Real-time logs available

## 📞 Support

For deployment issues:
1. Check hosting platform documentation
2. Verify environment variables
3. Review application logs
4. Test API endpoints individually

---

**Next Steps:** Choose your deployment option and follow the step-by-step guide above!