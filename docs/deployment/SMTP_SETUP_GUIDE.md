# 📧 Google Workspace SMTP Relay Setup Guide

## Current Status
❌ **Authentication Failed**: The SMTP credentials need to be properly configured in Google Workspace Admin Console.

## 🔧 Google Workspace SMTP Relay Configuration

### Step 1: Configure SMTP Relay in Google Admin Console

1. **Sign in to Google Admin Console**
   - Go to [admin.google.com](https://admin.google.com)
   - Sign in with your `hi@letsludus.com` admin account

2. **Navigate to SMTP Relay Settings**
   - Go to **Apps** → **Google Workspace** → **Gmail** → **Routing**
   - Click **Configure** next to "SMTP relay service"

3. **Add SMTP Relay Configuration**
   - Click **Add Setting** or **Add Another**
   - Configure the following:
     ```
     Name: LUDUS Platform SMTP Relay
     Allowed senders: Only addresses in my domains
     Authentication: Require SMTP authentication
     Encryption: Require TLS encryption
     ```

4. **Set IP Restrictions (Optional)**
   - Add your server's IP address for additional security
   - Or allow "Only addresses in my domains" for broader access

### Step 2: Create App Password (Recommended)

1. **Enable 2-Step Verification**
   - Go to [myaccount.google.com](https://myaccount.google.com)
   - Sign in with `hi@letsludus.com`
   - Go to **Security** → **2-Step Verification**
   - Enable 2-Step Verification if not already enabled

2. **Generate App Password**
   - Go to **Security** → **App passwords**
   - Select **Mail** and **Other (custom name)**
   - Enter "LUDUS Platform SMTP"
   - Copy the generated 16-character password

3. **Update Environment Variables**
   ```env
   SMTP_HOST=smtp-relay.gmail.com
   SMTP_PORT=587
   SMTP_USER=hi@letsludus.com
   SMTP_PASS=your-16-character-app-password
   FROM_EMAIL=hi@letsludus.com
   FROM_NAME=LUDUS Platform
   ```

### Step 3: Alternative Configuration Options

#### Option A: SMTP Relay (Recommended for Applications)
```env
SMTP_HOST=smtp-relay.gmail.com
SMTP_PORT=587
SMTP_USER=hi@letsludus.com
SMTP_PASS=your-app-password
```

#### Option B: Gmail SMTP (If relay doesn't work)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hi@letsludus.com
SMTP_PASS=your-app-password
```

### Step 4: Domain Authentication (Optional but Recommended)

1. **Configure SPF Record**
   - Add to your DNS TXT records:
   ```
   v=spf1 include:_spf.google.com ~all
   ```

2. **Configure DKIM**
   - In Google Admin Console: **Apps** → **Gmail** → **Authenticate email**
   - Generate DKIM key and add to DNS

3. **Configure DMARC**
   - Add DNS TXT record:
   ```
   v=DMARC1; p=quarantine; rua=mailto:dmarc@letsludus.com
   ```

## 🔍 Testing After Configuration

1. **Wait 10-15 minutes** for settings to propagate
2. **Run the test again**:
   ```bash
   cd server && node test-email.js
   ```

## 🚨 Troubleshooting Common Issues

### Error: "Username and Password not accepted"
- **Solution**: Use App Password instead of regular password
- **Check**: 2-Step Verification is enabled
- **Verify**: SMTP relay is configured in Admin Console

### Error: "Authentication failed"
- **Check**: Correct email address in SMTP_USER
- **Verify**: Password is the 16-character App Password
- **Ensure**: Account has SMTP access enabled

### Error: "Connection timeout"
- **Check**: SMTP_HOST and SMTP_PORT are correct
- **Verify**: Firewall allows outbound connections on port 587
- **Try**: Alternative port 25 or 465

### Error: "Relay access denied"
- **Solution**: Configure SMTP relay in Google Admin Console
- **Check**: "Only addresses in my domains" is selected
- **Verify**: Authentication is required in relay settings

## 📋 Quick Checklist

- [ ] Google Workspace Admin Console access
- [ ] SMTP relay service configured
- [ ] 2-Step Verification enabled on hi@letsludus.com
- [ ] App Password generated
- [ ] Environment variables updated with App Password
- [ ] DNS records configured (SPF, DKIM, DMARC)
- [ ] Test email service

## 💡 Pro Tips

1. **Use App Passwords**: Never use your actual Google account password
2. **IP Restrictions**: Add your server's IP for better security
3. **Monitor Usage**: Check Gmail admin logs for delivery issues
4. **Rate Limits**: Google has daily sending limits (check your plan)
5. **Backup Solution**: Consider using SendGrid or AWS SES as backup

## 📞 Support Resources

- [Google Workspace SMTP Documentation](https://support.google.com/a/answer/2956491)
- [App Passwords Guide](https://support.google.com/accounts/answer/185833)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)

---

Once you've completed the Google Workspace configuration, run the test again to verify everything is working properly!