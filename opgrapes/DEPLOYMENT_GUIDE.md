# 🚀 OPGrapes Deployment Guide

## Overview
This guide covers deploying OPGrapes to **Vercel (Frontend)** and **Render (Backend)** with MongoDB Atlas as the database.

## 📋 Prerequisites

### 1. Accounts Required
- [GitHub](https://github.com) - Source code repository
- [Vercel](https://vercel.com) - Frontend hosting
- [Render](https://render.com) - Backend hosting
- [MongoDB Atlas](https://mongodb.com/atlas) - Database hosting

### 2. Project Setup
- Ensure all code is committed to GitHub
- Verify all tests pass locally
- Check environment variables are properly configured

## 🗄️ Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Cluster
1. Sign up/login to [MongoDB Atlas](https://mongodb.com/atlas)
2. Create a new project: `OPGrapes`
3. Build a new cluster (Free tier recommended for development)
4. Choose cloud provider and region (closest to your users)

### 1.2 Database Access
1. Go to **Database Access** → **Add New Database User**
2. Create user with **Read and write to any database** permissions
3. Set username and password (save these securely)

### 1.3 Network Access
1. Go to **Network Access** → **Add IP Address**
2. Add `0.0.0.0/0` for development (restrict for production)
3. Or add specific IP addresses for security

### 1.4 Get Connection String
1. Go to **Clusters** → **Connect**
2. Choose **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Replace `<dbname>` with `opgrapes`

**Example:**
```
mongodb+srv://username:password@cluster.mongodb.net/opgrapes?retryWrites=true&w=majority
```

## 🔧 Step 2: Backend Deployment (Render)

### 2.1 Connect GitHub Repository
1. Sign up/login to [Render](https://render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub account
4. Select the `opgrapes` repository

### 2.2 Configure Web Service
- **Name**: `opgrapes-api`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: Free (or paid for production)

### 2.3 Environment Variables
Add these environment variables in Render:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Environment |
| `PORT` | `10000` | Port (Render sets this) |
| `MONGODB_URI` | `[Your MongoDB Atlas URI]` | Database connection |
| `JWT_SECRET` | `[Generate secure random string]` | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | JWT expiration |
| `CORS_ORIGIN` | `[Your Vercel frontend URL]` | CORS origin |
| `BCRYPT_ROUNDS` | `12` | Password hashing rounds |

### 2.4 Deploy
1. Click **Create Web Service**
2. Wait for build to complete
3. Note the service URL (e.g., `https://opgrapes-api.onrender.com`)

## ⚡ Step 3: Frontend Deployment (Vercel)

### 3.1 Connect GitHub Repository
1. Sign up/login to [Vercel](https://vercel.com)
2. Click **New Project**
3. Import your GitHub repository
4. Select the `opgrapes` repository

### 3.2 Configure Project
- **Framework Preset**: Next.js
- **Root Directory**: `apps/web`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3.3 Environment Variables
Add these environment variables in Vercel:

| Key | Value | Description |
|-----|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `[Your Render backend URL]` | Backend API URL |
| `NEXT_PUBLIC_APP_URL` | `[Your Vercel frontend URL]` | Frontend URL |

### 3.4 Deploy
1. Click **Deploy**
2. Wait for build to complete
3. Note the deployment URL

## 🔗 Step 4: Update CORS Configuration

### 4.1 Update Backend CORS
In your Render backend, update the CORS origin to match your Vercel frontend URL:

```typescript
// In your Express app
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://your-app.vercel.app',
  credentials: true
}));
```

### 4.2 Redeploy Backend
After updating CORS, redeploy your backend service in Render.

## 🧪 Step 5: Testing Deployment

### 5.1 Health Check
- Backend: `https://your-api.onrender.com/health`
- Should return: `{"ok": true}`

### 5.2 Frontend Test
- Visit your Vercel URL
- Test user registration/login
- Test activity browsing
- Test booking system

### 5.3 API Test
- Test API endpoints with Postman or similar
- Verify authentication works
- Check database connections

## 🔒 Step 6: Security & Production

### 6.1 Environment Variables
- Never commit `.env` files to Git
- Use Render/Vercel environment variable management
- Rotate JWT secrets regularly

### 6.2 Database Security
- Restrict MongoDB Atlas IP access
- Use strong passwords
- Enable MongoDB Atlas security features

### 6.3 HTTPS & Headers
- Vercel and Render provide HTTPS automatically
- Security headers are configured in `vercel.json`

## 📊 Step 7: Monitoring & Maintenance

### 7.1 Render Monitoring
- Monitor service health
- Check logs for errors
- Monitor resource usage

### 7.2 Vercel Analytics
- Enable Vercel Analytics
- Monitor performance
- Track user behavior

### 7.3 MongoDB Atlas Monitoring
- Monitor database performance
- Check connection limits
- Monitor storage usage

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures
- Check build logs in Render/Vercel
- Verify all dependencies are in `package.json`
- Check Node.js version compatibility

#### 2. Database Connection Issues
- Verify MongoDB Atlas connection string
- Check network access settings
- Verify database user permissions

#### 3. CORS Errors
- Ensure CORS origin matches frontend URL exactly
- Check environment variables are set correctly
- Redeploy backend after CORS changes

#### 4. Environment Variables
- Verify all required variables are set
- Check variable names match exactly
- Restart services after variable changes

#### 5. Render Deployment Issues - "Could not find task 'start'"
**Problem**: Render deployment fails with error "Could not find task 'start' in project"

**Solution**: Ensure your `turbo.json` includes the start task:
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "!.next/cache/**"]
    },
    "start": {
      "dependsOn": ["build"],
      "cache": false
    },
    "dev": {
      "cache": false
    }
  }
}
```

#### 6. Vercel Root Directory Issues
**Problem**: Vercel shows "Root Directory 'client' does not exist"

**Solution**: Ensure your `vercel.json` points to the correct directory:
```json
{
  "rootDirectory": "apps/web",
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "apps/web/.next"
}
```

#### 7. Missing Render Configuration
**Problem**: Web app deployment fails on Render

**Solution**: Create `apps/web/render.yaml` with proper configuration:
```yaml
services:
  - type: web
    name: opgrapes-web
    env: node
    plan: free
    rootDirectory: .
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
    healthCheckPath: /health
    autoDeploy: true
    branch: opgrapes-project
```

#### 8. API ES Module Import Errors
**Problem**: API fails to start with error "Cannot find module '/opt/render/project/src/opgrapes/apps/api/dist/app'"

**Solution**: This is caused by ES module import issues. Fix by:

1. **Update TypeScript configuration** in `apps/api/tsconfig.json`:
```json
{
  "compilerOptions": {
    "moduleResolution": "node",  // Change from "bundler" to "node"
    "module": "ESNext"
  }
}
```

2. **Add .js extensions** to all import statements in TypeScript files:
```typescript
// Before (will fail)
import { app } from "./app";

// After (will work)
import { app } from "./app.js";
```

3. **Use full file paths** for directory imports:
```typescript
// Before (will fail with ERR_UNSUPPORTED_DIR_IMPORT)
import routes from "./routes";

// After (will work)
import routes from "./routes/index.js";
```

4. **Rebuild the API** after making these changes:
```bash
cd apps/api
npm run build
```

**Common ES Module Issues**:
- Missing `.js` extensions in import statements
- Directory imports without specifying the index file
- Using `"moduleResolution": "bundler"` instead of `"node"`

### Getting Help
- Check Render/Vercel documentation
- Review MongoDB Atlas guides
- Check project logs for specific errors

## 🎉 Success Checklist

- [ ] MongoDB Atlas cluster running
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS properly configured
- [ ] Health checks passing
- [ ] User registration working
- [ ] Activity browsing working
- [ ] Booking system functional
- [ ] Admin dashboard accessible

## 🔄 Continuous Deployment

### Automatic Deployments
- Both Render and Vercel support automatic deployments
- Push to `main` branch triggers deployment
- Configure branch protection rules in GitHub

### Manual Deployments
- Use Render/Vercel dashboards for manual deployments
- Rollback to previous versions if needed
- Monitor deployment logs

---

**Congratulations! 🎉** Your OPGrapes application is now deployed and ready for users.

## 📞 Support
- **Documentation**: Check project README
- **Issues**: Use GitHub Issues
- **Deployment**: Render/Vercel support channels
