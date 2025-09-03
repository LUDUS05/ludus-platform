# LUDUS Platform - Custom Domain Setup Guide

## 🌐 Custom Domain Configuration

Setting up custom domains for your LUDUS Platform will provide a professional appearance and improved branding.

## 📋 Recommended Domain Structure

```
ludusapp.com              # Main website/marketing
app.ludusapp.com          # Frontend application
api.ludusapp.com          # Backend API
admin.ludusapp.com        # Admin panel (optional subdomain)
```

## 🎯 Frontend Domain (Vercel)

### Step 1: Purchase Domain
1. **Domain Registrars**: Namecheap, GoDaddy, Cloudflare Registrar
2. **Recommended**: Use Cloudflare for both domain and DNS management

### Step 2: Configure Vercel
1. **Access Project**: Go to Vercel dashboard → ludus-platform project
2. **Add Domain**: 
   - Click "Settings" → "Domains"
   - Add your domain (e.g., `app.ludusapp.com`)
3. **DNS Configuration**: Vercel will provide DNS records to add

### Step 3: DNS Records (Frontend)
Add these records to your DNS provider:

```dns
Type    Name    Value                           TTL
CNAME   app     cname.vercel-dns.com            Auto
```

### Step 4: SSL Certificate
- **Automatic**: Vercel provides free SSL certificates
- **Custom**: Upload custom certificates if needed

## 🔧 Backend Domain (Render)

### Step 1: Configure Render
1. **Access Service**: Go to Render dashboard → ludus-backend service
2. **Custom Domain**: 
   - Click "Settings" → "Custom Domains"
   - Add your API domain (e.g., `api.ludusapp.com`)

### Step 2: DNS Records (Backend)
Add these records to your DNS provider:

```dns
Type    Name    Value                           TTL
CNAME   api     your-render-service.onrender.com    Auto
```

### Step 3: Update Environment Variables
Update both backend and frontend environment variables:

**Backend (.env.production):**
```env
CLIENT_URL=https://app.ludusapp.com
```

**Frontend (client/.env.production):**
```env
REACT_APP_API_URL=https://api.ludusapp.com/api
```

## 🔄 Configuration Updates

### 1. CORS Configuration
Update backend CORS settings to include new domain:

```javascript
app.use(cors({
  origin: [
    'https://app.ludusapp.com',
    'https://ludusapp.com',
    process.env.CLIENT_URL || 'http://localhost:3000'
  ],
  credentials: true
}));
```

### 2. Moyasar Webhook Update
Update Moyasar webhook URL in dashboard:
```
https://api.ludusapp.com/api/payments/webhook
```

### 3. OAuth Redirects (if applicable)
Update any OAuth redirect URLs to use new domain.

## 🌩️ DNS Provider Setup Examples

### Cloudflare (Recommended)
```dns
Type    Name    Value                           Proxy Status
CNAME   app     cname.vercel-dns.com            DNS only
CNAME   api     ludus-backend-crt8.onrender.com    DNS only
CNAME   www     ludusapp.com                    Proxied
A       @       Your-IP-Address                 Proxied
```

### Namecheap
```dns
Type        Host    Value                           TTL
CNAME       app     cname.vercel-dns.com            Automatic
CNAME       api     ludus-backend-crt8.onrender.com    Automatic
```

### GoDaddy
```dns
Type    Name    Data                            TTL
CNAME   app     cname.vercel-dns.com            1 Hour
CNAME   api     ludus-backend-crt8.onrender.com    1 Hour
```

## 🔐 SSL/TLS Configuration

### Automatic SSL
- **Vercel**: Automatically provides SSL certificates
- **Render**: Automatically provides SSL certificates
- **Cloudflare**: Provides additional SSL/TLS options

### Certificate Management
- **Let's Encrypt**: Free certificates (handled automatically)
- **Custom Certificates**: Upload if you have premium certificates
- **Wildcard Certificates**: For multiple subdomains

## 🚀 Deployment Steps

### 1. Update Code
```bash
# Update environment variables
cp .env.production.example .env.production
# Edit with new domain URLs

# Update client environment
cp client/.env.production.example client/.env.production
# Edit with new API URL
```

### 2. Deploy Changes
```bash
# Deploy backend (Render will auto-deploy on git push)
git add .
git commit -m "Update domains for production"
git push origin main

# Deploy frontend (Vercel will auto-deploy)
# Vercel deployment happens automatically
```

### 3. Verify Configuration
```bash
# Test API endpoint
curl -X GET https://api.ludusapp.com/health

# Test frontend
curl -I https://app.ludusapp.com
```

## 🔍 Testing & Verification

### 1. DNS Propagation
- **Tool**: Use `dig` or online DNS checkers
- **Time**: DNS changes can take 24-48 hours to fully propagate

```bash
# Check DNS resolution
dig app.ludusapp.com
dig api.ludusapp.com
```

### 2. SSL Certificate Verification
```bash
# Check SSL certificate
curl -I https://app.ludusapp.com
curl -I https://api.ludusapp.com
```

### 3. Application Testing
- **Frontend**: Verify all pages load correctly
- **API**: Test authentication and payment flows
- **CORS**: Ensure cross-origin requests work

## 🔧 Troubleshooting

### Common Issues

1. **DNS Not Propagating**
   - Wait 24-48 hours
   - Clear DNS cache: `sudo dscacheutil -flushcache`

2. **SSL Certificate Errors**
   - Verify DNS is pointing correctly
   - Check certificate status in hosting provider

3. **CORS Errors**
   - Update backend CORS configuration
   - Verify environment variables are updated

4. **API Not Accessible**
   - Check Render custom domain configuration
   - Verify DNS CNAME record

### Rollback Plan
If issues occur, you can quickly revert by:
1. Remove custom domains from hosting providers
2. Revert environment variables to .onrender.com/.vercel.app URLs
3. Redeploy applications

## 💰 Cost Considerations

### Annual Costs (Approximate)
- **Domain Registration**: $10-15/year
- **DNS Management**: Free (Cloudflare) or $5-10/year
- **SSL Certificates**: Free (Let's Encrypt) or $50-200/year
- **CDN/Security**: $0-20/month (Cloudflare)

### Free Options
- Use Cloudflare for free DNS and basic security
- Let's Encrypt for free SSL certificates
- Basic domain registrar without premium features

## 📊 Benefits of Custom Domains

### Professional Appearance
- Branded URLs for marketing materials
- Improved user trust and credibility
- Better SEO performance

### Technical Benefits
- Better analytics and tracking
- Easier SSL certificate management
- Improved performance with CDN integration

### Marketing Benefits
- Memorable URLs for marketing campaigns
- Consistent branding across all touchpoints
- Professional email addresses (admin@ludusapp.com)

---

**Note**: Custom domains are optional but recommended for production applications. Plan the domain structure carefully as changes can be complex once users start bookmarking URLs.