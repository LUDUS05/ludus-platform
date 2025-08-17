# 🚨 OPGrapes Deployment Troubleshooting Guide

## 🚨 **Critical Issues Fixed**

### **1. Render Configuration Mismatch** ✅ FIXED
- **Problem**: Wrong `rootDirectory` and build commands
- **Solution**: Updated `render.yaml` with correct paths
- **Status**: ✅ RESOLVED

### **2. TypeScript Module Mismatch** ✅ FIXED
- **Problem**: `tsconfig.json` used CommonJS, package.json used ES modules
- **Solution**: Updated TypeScript config to use ESNext modules
- **Status**: ✅ RESOLVED

### **3. Vercel Build Commands** ✅ FIXED
- **Problem**: Incorrect build commands with `--include=dev`
- **Solution**: Simplified build commands for production
- **Status**: ✅ RESOLVED

## 🔍 **Common Deployment Issues & Solutions**

### **Build Failures**

#### **Issue**: TypeScript compilation errors
```bash
# Error: Cannot find module or its corresponding type declarations
```
**Solution**:
1. Check `tsconfig.json` module settings match `package.json` type
2. Ensure all dependencies are installed: `npm install`
3. Run type check: `npm run typecheck`

#### **Issue**: Missing dependencies
```bash
# Error: Cannot find module 'express'
```
**Solution**:
1. Verify `package.json` has all required dependencies
2. Check if `devDependencies` are needed in production
3. Run `npm install --production` for production builds

### **Runtime Errors**

#### **Issue**: Database connection failures
```bash
# Error: MongooseServerSelectionError
```
**Solution**:
1. Verify MongoDB Atlas connection string
2. Check network access settings (IP whitelist)
3. Ensure database user has correct permissions
4. Test connection locally first

#### **Issue**: CORS errors
```bash
# Error: CORS policy blocked request
```
**Solution**:
1. Update `CORS_ORIGIN` environment variable
2. Ensure frontend URL matches exactly
3. Redeploy backend after CORS changes
4. Check for trailing slashes in URLs

### **Environment Variable Issues**

#### **Issue**: Undefined environment variables
```bash
# Error: process.env.MONGODB_URI is undefined
```
**Solution**:
1. Verify all required variables are set in Render/Vercel
2. Check variable names match exactly (case-sensitive)
3. Restart services after variable changes
4. Use `.env.example` as template

## 🛠️ **Quick Fix Commands**

### **Local Testing**
```bash
# Test API build locally
cd apps/api
npm run build
npm start

# Test web build locally
cd apps/web
npm run build
npm start
```

### **Environment Setup**
```bash
# Copy environment template
cp apps/api/env.example apps/api/.env

# Install dependencies
npm install

# Type check
npm run typecheck
```

## 📋 **Deployment Checklist**

### **Before Deploying**
- [ ] All tests pass: `npm run test`
- [ ] Type check passes: `npm run typecheck`
- [ ] Build succeeds locally: `npm run build`
- [ ] Environment variables configured
- [ ] Database connection tested

### **After Deploying**
- [ ] Health check endpoint responds: `/health`
- [ ] Frontend loads without errors
- [ ] API endpoints respond correctly
- [ ] Database operations work
- [ ] CORS allows frontend requests

## 🔧 **Configuration Files Status**

| File | Status | Issues Fixed |
|------|--------|--------------|
| `render.yaml` | ✅ FIXED | Paths, build commands, branch |
| `vercel.json` | ✅ FIXED | Build commands, dependencies |
| `tsconfig.json` | ✅ FIXED | Module system mismatch |
| `env.example` | ✅ UPDATED | Complete environment template |

## 🚀 **Next Steps**

1. **Test Local Builds**: Ensure both API and web build successfully
2. **Deploy Backend**: Push to Render with updated configuration
3. **Deploy Frontend**: Push to Vercel with corrected settings
4. **Verify Integration**: Test end-to-end functionality
5. **Monitor Logs**: Check for any remaining issues

## 📞 **Getting Help**

- **Build Errors**: Check console output and logs
- **Runtime Issues**: Monitor application logs in Render/Vercel
- **Database Problems**: Verify MongoDB Atlas configuration
- **CORS Issues**: Check browser console and network tab

---

**🎉 Most critical deployment issues have been resolved! Your application should now deploy successfully.**
