# MOOFU - Complete Testing & Deployment Guide

**Status**: ✅ Ready for Testing and Deployment
**Prepared**: April 14, 2026

---

## 📋 Table of Contents

1. [System Configuration](#system-configuration)
2. [Testing (Phase 3B)](#testing-phase-3b)
3. [Deployment Checklist](#deployment-checklist)
4. [Common Errors & Solutions](#common-errors--solutions)

---

## 🔧 System Configuration

### Prerequisites
- Node.js 16+ and npm 8+
- MongoDB Atlas account (free tier OK)
- Twilio account with WhatsApp (optional for initial testing)
- React Native development environment

### Backend Setup

#### 1. Start MongoDB Atlas
```bash
# Create free cluster in MongoDB Atlas
# Get connection string: mongodb+srv://user:pass@cluster.mongodb.net/moofu?retryWrites=true&w=majority
```

#### 2. Configure Backend Environment
```bash
cd Parking_backend/parking-backend
cp .env.example .env
```

**Edit `.env` with:**
```
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/moofu?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-change-this-in-production
CORS_ORIGIN=http://localhost:3000,http://10.0.2.2:8081,localhost:8081
NODE_ENV=development

# Optional Twilio (for WhatsApp notifications)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+1234567890
```

#### 3. Start Backend Server
```bash
cd Parking_backend/parking-backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

**Check health:**
```bash
curl http://localhost:5000/health
# Response: {"status":"ok","database":"connected"}
```

### Frontend Setup

#### 1. Install Dependencies
```bash
npm install
# This installs all React Native dependencies
```

#### 2. Check API Configuration
Open `src/services/api.ts` - The base URL is automatically configured:
- **Android Emulator**: `http://10.0.2.2:5000/api`
- **iOS Simulator**: `http://localhost:5000/api`
- **Production**: `https://moofu-api.onrender.com/api` (update after backend deployment)

#### 3. Start Frontend
```bash
# For Android
npm run android

# For iOS
npm run ios

# For Web (testing only)
npm run web
```

---

## ✅ Testing (Phase 3B - Full Testing)

### Test Case 1: Authentication Flow

**Objective**: Verify login/OTP system works end-to-end

**Steps**:
1. Open app on Android emulator/iOS simulator
2. Click "Continue"
3. Enter phone: `+919876543210`
4. Click "Send OTP"
5. Enter OTP: `123456` (backend sends this in dev mode)
6. Click "Verify"

**Expected Result**:
- ✅ Toast: "OTP verified"
- ✅ User navigated to Home screen
- ✅ JWT token stored in AsyncStorage
- ✅ No "Network request failed" error in console

**Debug**:
```
If error "[BookingContext] Failed to fetch parkings: Network request failed":
1. Check backend is running: curl http://localhost:5000/health
2. On Android: Verify base URL uses 10.0.2.2:5000
3. Check console: Error will show {"status": 0, "message": "Network request failed"}
4. Solution: Ensure MongoDB is connected and backend is listening
```

### Test Case 2: Parking List Loading

**Objective**: Verify parkings load from backend API

**Steps**:
1. After login, on Home screen
2. Tap "Book Parking"
3. Wait 2-3 seconds for loading

**Expected Result**:
- ✅ 4 parking spaces appear in list
- ✅ Each has: Name, Area, Hourly Rate, Available Spots
- ✅ No error messages in console
- ✅ "Results" section shows available parkings

**Debug**:
```
If parkings don't load:
1. Check backend has auto-seeded data:
   curl http://localhost:5000/api/parking
   Should return: {"data": {"spaces": [...]}}

2. Verify BookingContext fetch:
   Look for: "[BookingContext] Failed to fetch parkings:"
   
3. Common issues:
   - Backend not running
   - MongoDB not connected
   - CORS not configured properly
   - JWT token not sent with request
```

### Test Case 3: Booking Flow

**Objective**: Verify complete booking creation

**Steps**:
1. From parking list, tap on a parking
2. Select vehicle type (Bike/Car)
3. Enter vehicle number: `MH01AB1234`
4. Select arrival date/time
5. Select departure date/time
6. Verify pricing calculates correctly
7. Tap "Continue to Payment"
8. Select payment method
9. Tap "Pay Now"

**Expected Result**:
- ✅ Booking created successfully
- ✅ Navigate to Success screen
- ✅ No errors in console
- ✅ Booking saved to backend
- ✅ Can see booking in Schedule screen

**Debug**:
```
If booking fails:
1. Check BookingContext logs for API errors
2. Verify POST /api/booking is called
3. Check JWT token is included in header
4. Verify parking ID is valid
```

### Test Case 4: Schedule/History

**Objective**: Verify bookings persist and display

**Steps**:
1. After successful booking, go to Schedule tab
2. View created booking
3. Can see: Parking name, dates, vehicle, amount
4. Tap "Cancel Booking"

**Expected Result**:
- ✅ Booking displays with all details
- ✅ Cancel button works
- ✅ Booking removed from list
- ✅ No errors in console

**Debug**:
```
If bookings don't display:
1. Check GET /api/booking/history/user endpoint
2. Verify JWT token is valid
3. Check browser console for API errors
```

### Test Case 5: Profile Update

**Objective**: Verify user profile can be saved

**Steps**:
1. Go to Profile tab
2. Update Name: "John Doe"
3. Update Location: "Mumbai"
4. Update Vehicle: "MH02CD5678"
5. Tap "Save"

**Expected Result**:
- ✅ Toast: "Profile updated"
- ✅ Changes persist after app restart
- ✅ No network errors

---

## 🚀 Deployment Checklist

### Pre-Deployment Backend

- [ ] **Database Setup**
  - [ ] MongoDB Atlas cluster created
  - [ ] Credentials saved securely
  - [ ] Database initialized with collections
  - [ ] Indexes created: `db.parkingSpaces.createIndex({ "location": "2dsphere" })`

- [ ] **Backend Deployment** (Render.com or Railway)
  - [ ] Create account on Render.com
  - [ ] Connect GitHub repository
  - [ ] Set environment variables (MONGODB_URI, JWT_SECRET, CORS_ORIGIN)
  - [ ] Deploy backend
  - [ ] Test health endpoint: `https://moofu-api.onrender.com/health`
  - [ ] Get production URL

- [ ] **Frontend Update**
  - [ ] Update `src/services/api.ts` line 12:
    ```typescript
    return "https://moofu-api.onrender.com/api"; // Update with your URL
    ```
  - [ ] Test all endpoints work with production API

### Pre-Deployment Frontend

- [ ] **App Configuration**
  - [ ] Update `app.json`:
    ```json
    {
      "expo": {
        "name": "MOOFU",
        "slug": "MOOFU",
        "version": "1.0.0",
        "newArchEnabled": false,
        "android": { "package": "com.moofu.app" },
        "ios": { "bundleIdentifier": "com.moofu.app" }
      }
    }
    ```
  - [ ] Set unique package name for your app
  - [ ] Add app icon: `assets/icon.png` (at least 1024x1024px)
  - [ ] Add splash screen: `assets/splash-icon.png`

- [ ] **Build Production**
  ```bash
  eas build --platform android --build-type apk
  # or for app bundle (required for Play Store)
  eas build --platform android --build-type app-bundle
  ```

- [ ] **Code Testing**
  - [ ] All screens navigable
  - [ ] No console errors or warnings
  - [ ] API calls complete successfully
  - [ ] Bookings persist after app restart
  - [ ] Profile updates work
  - [ ] No memory leaks detected

### Google Play Store Deployment

- [ ] **Create Developer Account**
  - [ ] Go to [Google Play Console](https://play.google.com/console)
  - [ ] Create account ($25 one-time fee)
  - [ ] Verify identity

- [ ] **Create App**
  - [ ] New app: "MOOFU Parking"
  - [ ] Category: "Travel"
  - [ ] Target devices: Phones & tablets

- [ ] **Prepare Store Listing**
  - [ ] App name: "MOOFU - Smart Parking"
  - [ ] Short description: "Find and book parking instantly"
  - [ ] Full description (max 4000 chars):
    ```
    MOOFU is an intelligent parking reservation app that makes 
    finding and booking parking spaces easy and convenient.
    
    Features:
    • Search parking by location and price
    • Real-time availability tracking
    • Easy booking and payment
    • WhatsApp notifications
    • 24/7 customer support
    
    Download MOOFU now and never waste time finding parking again!
    ```
  - [ ] Screenshots (minimum 2, maximum 8)
  - [ ] Feature graphic (1024x500px)
  - [ ] App icon (512x512px)
  - [ ] Content rating questionnaire
  - [ ] Target devices: Min Android 7.0 (API 24)

- [ ] **Upload Build**
  - [ ] Go to "Create new release"
  - [ ] Upload APK/AAB from `eas build`
  - [ ] Add version name: "1.0.0"
  - [ ] Add release notes: "Initial release"

- [ ] **Set Price and Distribution**
  - [ ] Price: Free
  - [ ] Countries: Select target markets
  - [ ] Content rating: Family (if applicable)

- [ ] **Release to Production**
  - [ ] Review app for Play Store policies
  - [ ] Submit for review
  - [ ] Wait 24-48 hours for approval

---

## ⚙️ Common Errors & Solutions

### Error 1: `[BookingContext] Failed to fetch parkings: {"data": [TypeError: Network request failed]`

**Cause**: Frontend cannot reach backend API

**Solutions**:
```bash
# 1. Check backend is running
curl http://localhost:5000/health

# 2. On Android emulator, verify correct IP
# Android: Use 10.0.2.2 (not localhost)
# iOS: Use localhost
# Check src/services/api.ts line 12

# 3. Check firewall allows port 5000
# Windows: netstat -an | findstr :5000
# Mac: lsof -i :5000

# 4. Check MongoDB is connected
# Backend logs should show: "Database connection: connected"

# 5. Test API directly from device
adb shell
curl http://10.0.2.2:5000/health # Android
```

### Error 2: `Element type is invalid: expected a string... but got: undefined`

**Cause**: Incorrect import/export of components

**Solution**: ✅ FIXED
- Updated LoadingState import from default to named export
- Check all component imports use correct syntax
```typescript
// ❌ Wrong
import LoadingState from "..."

// ✅ Correct
import { LoadingState } from "..."
```

### Error 3: `CORS policy: No 'Access-Control-Allow-Origin'`

**Cause**: Backend CORS not configured properly

**Solution**:
```bash
# In backend .env, update CORS_ORIGIN:
CORS_ORIGIN=http://localhost:3000,http://10.0.2.2:8081,localhost:8081

# Restart backend:
npm run dev
```

### Error 4: `404 Not Found - /api/parking`

**Cause**: Backend route not registered

**Solution**:
```bash
# Check backend server.ts has routes registered
# Should show: "Parking routes configured"

# Verify route file exists:
# Parking_backend/parking-backend/src/routes/parkingSpace.route.ts

# Check route definition:
# Should have: router.get('/', getParkingSpaces)
```

### Error 5: `Invalid JWT token` in authentication

**Cause**: JWT secret mismatch or token expired

**Solution**:
```bash
# Check JWT_SECRET in backend .env
# Must match for token verification

# Clear AsyncStorage and login again:
# App -> Settings -> Clear app data

# Or in code:
await AsyncStorage.removeItem("moofu_auth_token")
```

---

## 📊 Performance Checklist

- [ ] App loads in < 3 seconds
- [ ] Parking list loads in < 2 seconds
- [ ] API responses < 500ms
- [ ] No memory leaks (check with Android Studio Profiler)
- [ ] Smooth navigation between screens
- [ ] No console warnings or errors

---

## 🔐 Security Checklist

- [ ] JWT secret is strong (min 32 characters)
- [ ] MongoDB passwords are strong
- [ ] API endpoints require authentication where needed
- [ ] User personal data not logged
- [ ] No credentials in version control
- [ ] HTTPS used in production
- [ ] All user inputs validated

---

## 📝 Deployment Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Backend Setup | 30 mins | ✅ Done |
| Frontend Testing | 2-3 hours | ⏳ Current |
| Play Store Setup | 1 hour | ⏳ Next |
| App Review & Approval | 24-48 hours | ⏳ After submission |
| **Total to Launch** | **3-4 days** | |

---

## 🎯 Success Criteria

Your app is ready to deploy when:

- ✅ All 10 API endpoints tested and working
- ✅ No "Network request failed" errors
- ✅ No React/TypeScript compilation errors
- ✅ All screens navigate correctly
- ✅ Bookings persist after app restart
- ✅ Backend deployed to production
- ✅ Production API URL configured in frontend
- ✅ Play Store account created
- ✅ All required store assets uploaded

---

## 📞 Quick Reference Commands

```bash
# Start backend
cd Parking_backend/parking-backend && npm run dev

# Start frontend (Android)
npm run android

# Start frontend (iOS)
npm run ios

# Test API health
curl http://localhost:5000/health

# Test login endpoint
curl -X POST http://localhost:5000/api/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210"}'

# Build for production
eas build --platform android --build-type app-bundle

# View app logs
npx expo-cli logs --remote --level verbose
```

---

## 🆘 Still Having Issues?

1. **Check console logs** in both frontend and backend
2. **Verify all services running**:
   - Backend: `curl http://localhost:5000/health`
   - MongoDB: Check Atlas connection
3. **Clear cache and rebuild**:
   - `npm cache clean --force`
   - `npm install`
4. **Check network connectivity** (especially Android)
5. **Contact support** with error logs

---

**Last Updated**: April 14, 2026  
**Status**: ✅ Ready for Production Deployment  
**Version**: 1.0.0

