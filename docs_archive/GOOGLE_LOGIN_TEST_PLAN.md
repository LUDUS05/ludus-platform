# Google Login Test Plan

## 🧪 Test Environment
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5001
- **Google OAuth Client ID:** 126334556952-378ojugbokottiec09e5s978hbj0kvp8.apps.googleusercontent.com

## ✅ Test Steps

### 1. **Basic Google OAuth Initialization Test**
- [ ] Open http://localhost:3000/hi
- [ ] Open browser developer tools (F12)
- [ ] Check console for Google OAuth initialization messages
- [ ] Verify no "Missing required parameter: client_id" errors
- [ ] Look for: "Google Identity Services loaded successfully"

### 2. **Google Login Button Test**
- [ ] Navigate to the registration step on /hi page
- [ ] Look for "Sign in with Google" button
- [ ] Verify button is clickable and not disabled
- [ ] Check that button shows proper styling

### 3. **Google Login Flow Test**
- [ ] Click "Sign in with Google" button
- [ ] Google OAuth popup should appear
- [ ] Select a Google account
- [ ] Grant permissions
- [ ] Verify successful login and redirect to /share page

### 4. **Referral System Integration Test**
- [ ] Test with referral link: http://localhost:3000/invite/TEST123
- [ ] Complete Google login
- [ ] Verify referral code is captured and processed
- [ ] Check that referral data is sent to backend

### 5. **Error Handling Test**
- [ ] Test with invalid Google account
- [ ] Test with denied permissions
- [ ] Verify proper error messages are shown
- [ ] Check that app doesn't crash

### 6. **Backend Integration Test**
- [ ] Check backend logs for Google token validation
- [ ] Verify user data is properly stored
- [ ] Check referral tracking in backend

## 🔍 What to Look For

### ✅ Success Indicators:
- Google OAuth popup appears
- Successful login and redirect
- No console errors
- Referral codes captured
- User data stored in backend

### ❌ Failure Indicators:
- "Missing required parameter: client_id" error
- Google OAuth popup doesn't appear
- Login fails silently
- Console shows authentication errors
- Referral codes not captured

## 🚨 Common Issues & Solutions

### Issue: "Missing required parameter: client_id"
**Solution:** Check that REACT_APP_GOOGLE_CLIENT_ID is set in client/.env

### Issue: Google OAuth popup doesn't appear
**Solution:** Check browser console for JavaScript errors

### Issue: Login fails after Google authentication
**Solution:** Check backend logs for token validation errors

### Issue: Referral codes not captured
**Solution:** Verify referral URL format and localStorage handling

## 📊 Test Results

### Test Date: ___________
### Tester: ___________

#### Frontend Tests:
- [ ] Google OAuth initialization: PASS/FAIL
- [ ] Login button functionality: PASS/FAIL
- [ ] Google login flow: PASS/FAIL
- [ ] Error handling: PASS/FAIL

#### Backend Tests:
- [ ] Token validation: PASS/FAIL
- [ ] User data storage: PASS/FAIL
- [ ] Referral tracking: PASS/FAIL

#### Integration Tests:
- [ ] End-to-end login flow: PASS/FAIL
- [ ] Referral system integration: PASS/FAIL

### Notes:
_________________________________
_________________________________
_________________________________

## 🎯 Expected Outcome
Google login should work seamlessly with:
- Proper OAuth initialization
- Successful authentication
- Referral code capture
- User data storage
- Redirect to /share page

---

**Status:** Ready for testing
