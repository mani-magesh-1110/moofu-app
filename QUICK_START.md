# 🚀 MOOFU - Quick Start Guide (5 Minutes)

**Purpose**: Get the app running locally in under 5 minutes  
**Date**: April 14, 2026

---

## ⚡ Super Quick Setup

### Step 1: Start Backend (30 seconds)
```bash
cd Parking_backend/parking-backend
npm install  # If not already done
npm run dev
```

**Expected Output**:
```
Server running on http://localhost:5000
Database connection: connected
Parking spaces seeded: 4
```

### Step 2: Start Frontend (30 seconds)

```bash
# In another terminal in root directory
npm run android  # For Android emulator
# OR
npm run ios      # For iOS simulator
```

**Expected Output**:
```
Expo server listening on port 8081
Open http://localhost:8081 in your browser to view the app
```

---

## ✅ Quick Testing (2 minutes)

### Test 1: Login
1. App loads → Click "Continue"
2. Enter phone: `+919876543210`
3. Click "Send OTP"
4. Enter OTP: `123456`
5. Click "Verify"
6. ✅ Should see Home screen (no error)

### Test 2: Parking List
1. On Home screen, tap "Book Parking"
2. Wait 2 seconds
3. ✅ Should see list of 4 parkings appearing

### Test 3: Booking
1. Tap any parking
2. Select vehicle type
3. Enter vehicle number: `MH01AB1234`
4. Select dates/times
5. Tap "Continue to Payment"
6. Select payment method
7. Tap "Pay Now"
8. ✅ Should see Success screen

---

## 🔧 Configuration Required (1 minute)

### MongoDB Setup (Required)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster named "MOOFU"
4. Get connection string
5. In `Parking_backend/parking-backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://your-user:your-pass@cluster.mongodb.net/moofu
   ```

### If Already Configured
Skip MongoDB setup - it's ready to run!

---

## 🐛 If Something Goes Wrong

### Error: "Network request failed"
```bash
# Check backend is running
curl http://localhost:5000/health

# If not, start it:
cd Parking_backend/parking-backend && npm run dev

# If on Android, verify correct URL is used (10.0.2.2, not localhost)
```

### Error: "Element type is invalid"
```
✅ FIXED - This was a loading component import issue
If you still see it, try:
- Clear cache: npm cache clean --force
- Reinstall: npm install
- Restart emulator
```

### Error: "Cannot find module"
```bash
npm install
```

### App crashes on launch
```bash
# Clear and rebuild
npm cache clean --force
rm -rf node_modules
npm install
npm run android  # or npm run ios
```

---

## 📊 Files to Monitor

During testing, keep these open:

1. **Backend Console** - `Terminal running npm run dev`
   - Watch for: Database errors, API logs
   - Example: `GET /api/parking` response

2. **Frontend Console** - `Expo console or device logs`
   - Watch for: Network errors, React warnings
   - Example: `[BookingContext] Fetched X parkings`

3. **Browser DevTools** - `npx expo-cli logs --remote`
   - Network tab: See API calls
   - Console tab: Errors and logs

---

## ✨ Success Indicators

You'll know it's working when:

- ✅ Android emulator/iOS simulator launches app
- ✅ Login screen appears without crashes
- ✅ After login, Home screen shows
- ✅ Tap "Book Parking" → Loading state appears
- ✅ After 2 seconds, parking list displays
- ✅ Tap parking → See details
- ✅ Complete booking → See success
- ✅ No red error screens or console errors

---

## 🎯 What's Ready

| Component | Ready |
|-----------|-------|
| Backend Server | ✅ Yes |
| Database Connection | ✅ Yes (set .env) |
| API Endpoints | ✅ All 10 |
| Frontend App | ✅ Yes |
| Navigation | ✅ Yes |
| Auth Flow | ✅ Yes |
| Booking Flow | ✅ Yes |
| Data Display | ✅ Yes |

---

## 📝 Command Reference

```bash
# Start backend
cd Parking_backend/parking-backend && npm run dev

# Start frontend
npm run android    # Android phone/emulator
npm run ios        # iOS simulator
npm run web        # Web browser (testing only)

# Check backend health
curl http://localhost:5000/health

# View device logs
adb logcat         # Android
log stream --level debug --predicate 'eventMessage contains "Expo"' # iOS

# Expo CLI commands
eas build --platform android
eas submit --platform android

# Clear cache if needed
npm cache clean --force
watchman watch-del-all  # macOS only
```

---

## 🚀 Next Steps After Testing

1. ✅ Verify everything works locally
2. 📦 Deploy backend to production (Render.com)
3. 🔧 Update API URL in src/services/api.ts
4. 📱 Build APK for Play Store: `eas build --platform android --build-type app-bundle`
5. 🎉 Submit to Play Store

---

## 📞 Troubleshooting Links

- **Testing Guide**: [TESTING_AND_DEPLOYMENT_GUIDE.md](TESTING_AND_DEPLOYMENT_GUIDE.md)
- **Configuration Guide**: [CONFIGURATION_STATUS.md](CONFIGURATION_STATUS.md)
- **Full Report**: [FINAL_REPAIR_REPORT.md](FINAL_REPAIR_REPORT.md)

---

**That's it! Your app is ready to test. Start with Step 1 above.** 🚀

