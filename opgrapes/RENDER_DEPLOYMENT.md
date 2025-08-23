# 🚀 Render Deployment Guide for OPGrapes Web App

## 📋 Prerequisites
- GitHub repository connected to Render
- Render account (free tier available)
- Node.js 18+ support

## 🔧 Configuration Files

### 1. `apps/web/render.yaml`
```yaml
services:
  - type: web
    name: opgrapes-web
    env: node
    plan: free
    rootDirectory: opgrapes
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: NEXT_PUBLIC_API_URL
        sync: false
      - key: NEXT_PUBLIC_APP_URL
        sync: false
    healthCheckPath: /health
    autoDeploy: true
    branch: opgrapes-project
```

### 2. `turbo.json` (Root Level)
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
    },
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "outputs": []
    },
    "test": {
      "outputs": []
    }
  }
}
```

## 🌐 Environment Variables

### Required Variables in Render Dashboard:
```
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://your-api-domain.onrender.com
NEXT_PUBLIC_APP_URL=https://your-web-domain.onrender.com
```

### Optional Variables:
```
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-web-domain.onrender.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

## 📱 Render Dashboard Setup

### 1. Create New Web Service
- Go to [Render Dashboard](https://dashboard.render.com/)
- Click **"New +"** → **"Web Service"**
- Connect your GitHub repository

### 2. Configure Service
- **Name**: `opgrapes-web`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `opgrapes-project`
- **Root Directory**: Leave empty (uses render.yaml)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 3. Environment Variables
- Add all required environment variables
- Set `NEXT_PUBLIC_API_URL` to your Render API service URL
- Set `NEXT_PUBLIC_APP_URL` to your Render web service URL

### 4. Advanced Settings
- **Health Check Path**: `/health`
- **Auto-Deploy**: Enabled
- **Plan**: Free

## 🔍 Health Check Endpoint

Your app already has a health check at `/health` that returns:
```json
{
  "status": "ok",
  "service": "web",
  "timestamp": "2025-08-18T12:00:00.000Z"
}
```

## 🚀 Deployment Process

### 1. Automatic Deployment
- Render automatically detects changes in your `opgrapes-project` branch
- Builds and deploys automatically
- Health checks ensure service is running

### 2. Manual Deployment
- Go to your service in Render dashboard
- Click **"Manual Deploy"** → **"Deploy latest commit"**

### 3. Build Logs
- Monitor build process in Render dashboard
- Check for any build errors
- Verify environment variables are loaded

## 🐛 Troubleshooting

### Common Issues:

#### 1. Build Failures
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

#### 2. Environment Variables
- Ensure all required variables are set
- Check variable names match exactly
- Restart service after variable changes

#### 3. Health Check Failures
- Verify `/health` endpoint is accessible
- Check if service is actually running
- Review service logs

#### 4. Port Issues
- Ensure `PORT` environment variable is set to `3000`
- Check if port is available in Render environment

## 📊 Monitoring

### 1. Service Status
- Monitor service health in dashboard
- Check response times
- Review error rates

### 2. Logs
- Access real-time logs in dashboard
- Monitor for errors and warnings
- Track performance metrics

## 🔗 Custom Domain (Optional)

### 1. Add Custom Domain
- Go to service settings
- Click **"Custom Domains"**
- Add your domain

### 2. DNS Configuration
- Point your domain to Render's nameservers
- Or add CNAME record pointing to your Render service

## 💰 Free Tier Limitations

- **Sleep after 15 minutes** of inactivity
- **512 MB RAM** per service
- **Shared CPU** resources
- **100 GB bandwidth** per month
- **Automatic sleep/wake** based on traffic

## 🎯 Next Steps

1. **Deploy to Render** using the configuration above
2. **Set environment variables** in Render dashboard
3. **Test the deployment** by visiting your service URL
4. **Monitor performance** and logs
5. **Set up custom domain** if needed

## 📞 Support

- **Render Documentation**: [docs.render.com](https://docs.render.com/)
- **Community Forum**: [community.render.com](https://community.render.com/)
- **Status Page**: [status.render.com](https://status.render.com/)

---

**Happy Deploying! 🚀**
