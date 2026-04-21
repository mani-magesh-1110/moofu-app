# Android Play Store - Quick Setup Checklist

## 🎯 Pre-Deployment (Do This First)

### Account Setup (5-10 min)
- [ ] Create Google Play Developer Account at https://play.google.com/console
- [ ] Pay $25 one-time registration fee
- [ ] Complete developer profile
- [ ] Wait for account activation (24-48 hours)

### Local Setup (5 min)
- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Login to EAS: `eas login`
- [ ] Verify app.json is updated ✅ (DONE)
- [ ] Verify eas.json exists ✅ (DONE)

---

## 🔑 Signing Setup (One-time, 5 min)

### Generate Signing Key
```bash
# PowerShell (Windows)
keytool -genkey -v -keystore moofu-release.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias moofu-key

# macOS/Linux
keytool -genkey -v -keystore moofu-release.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias moofu-key
```

When prompted:
- Keystore password: **[Create strong password - SAVE THIS]**
- Key password: **[Same as keystore password]**
- Alias: `moofu-key`
- Validity: `10000`

**⚠️ Critical**: Save the keystore file and password in a safe place (password manager, NOT in git).

---

## 🏗️ Build Process (20-30 min)

### Step 1: Build Android App Bundle
```bash
eas build --platform android --release
```

This will:
- Compile your React Native code
- Sign with your keystore
- Create production Android App Bundle (.aab)
- Upload to Expo servers

Wait for confirmation message:
```
✅ Build successful!
📱 Download AAB: https://expo.dev/artifacts/...
```

### Step 2: Download the AAB File
- Click the link from build output
- Save to `~/Downloads/moofu-release.aab` (or safe location)

---

## 📱 Play Store Setup (30-45 min)

### Step 1: Create App in Console
- [ ] Log in to Google Play Console
- [ ] Click **Create app**
- [ ] Name: **MOOFU**
- [ ] Category: **Maps & Navigation**
- [ ] Type: **App**

### Step 2: Add Store Listing
- [ ] Go to **Store listing > Main store listing**
- [ ] **Short description** (80 chars):
  ```
  Reserve parking spots instantly. Find, book, and manage parking with ease.
  ```
- [ ] **Full description** (4000 chars):
  ```
  MOOFU makes parking effortless. 
  
  ✨ Features:
  • Find available parking spots near you
  • Reserve spots in seconds
  • Real-time availability updates
  • Multiple payment methods
  • Booking history & cancellation
  • Push notifications
  
  Perfect for hourly or daily parking needs.
  ```

### Step 3: Add Required Assets
- [ ] **App icon** (512x512 PNG) → `assets/icon.png`
- [ ] **Feature graphic** (1024x500 PNG) → Create new
- [ ] **Screenshots** (5-8 images, 1080x1920 PNG)
  - Login screen
  - Home screen with parking list
  - Parking details
  - Map/booking view
  - Payment screen
  - Success confirmation
  - Booking history

### Step 4: Content Rating
- [ ] Complete IARC questionnaire
- [ ] Select rating: **General Audiences** or **Parental Guidance**

### Step 5: Privacy & Compliance
- [ ] Add privacy policy URL
- [ ] Add terms & conditions URL
- [ ] Declare data collection (location, payment)
- [ ] Contact email: support@moofuparking.com

---

## 📤 Submit for Review (10 min)

### Step 1: Upload Build
- [ ] Go to **Release > Production > Create new release**
- [ ] Click **Browse files** → Upload your `.aab` file
- [ ] Review build summary

### Step 2: Release Notes
```
Version 1.0.0 - Initial Launch

✨ Features:
• Find and reserve parking spots instantly
• Real-time availability updates
• Secure OTP-based authentication
• Multiple payment methods
• Booking management
• Location-based search

🐛 Stability improvements
```

### Step 3: Review Everything
- [ ] App icon ✅
- [ ] App name ✅
- [ ] 5+ screenshots ✅
- [ ] Feature graphic ✅
- [ ] Descriptions ✅
- [ ] Privacy policy ✅
- [ ] Terms ✅
- [ ] Contact email ✅
- [ ] Build file (.aab) ✅

### Step 4: Submit
- [ ] Click **Next: Review and roll out**
- [ ] Select **10%** for initial rollout (safer)
- [ ] Click **Start rollout to production**
- [ ] Confirm submission

---

## ⏳ After Submission

### Monitor Status
- Check **Releases > Production > Review status**
- You'll get email updates on approval/rejection
- Review timeline: 1-5 business days

### If Approved ✅
Your app will be:
1. Live in 10% rollout
2. Monitored for crashes (1-2 days)
3. Expanded to 100% automatically

### If Rejected ❌
1. Read the rejection reason
2. Fix issues in code
3. Update version: `app.json` → `versionCode: 2`
4. Rebuild: `eas build --platform android --release`
5. Resubmit

---

## 📊 Monitoring After Launch

### Crashes & Stability
- Check **Release > Android vitals > Crashes**
- Target: <0.5% crash rate
- Fix critical issues immediately

### User Reviews & Ratings
- Monitor **Store listing > Reviews**
- Respond to negative reviews professionally
- Address reported bugs quickly

### Analytics
- Track daily active users (DAU)
- Track session length
- Monitor app retention

---

## 🚀 Quick Command Reference

```bash
# Install EAS
npm install -g eas-cli

# Login
eas login

# Build for production
eas build --platform android --release

# Build for testing
eas build --platform android --preview

# Check build status
eas build --status
```

---

## ⚠️ Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Build fails (signing error) | Regenerate keystore: `keytool -genkey ...` |
| App rejected (broken features) | Test on device, fix bugs, rebuild with versionCode+1 |
| Screenshots rejected | Use real screenshots, readable text, no personal info |
| Slow build | Normal (15-30 min), check EAS status if stuck >1hr |
| App crashes on launch | Check Android vitals in Play Console, fix bugs, resubmit |

---

## 💾 Files Updated/Created

- ✅ `app.json` - Updated with Play Store config
- ✅ `eas.json` - Created for build configuration
- ✅ `PLAYSTORE_DEPLOYMENT_GUIDE.md` - Comprehensive guide
- ✅ `PLAYSTORE_QUICK_SETUP.md` - This checklist

---

## 📅 Timeline Estimate

| Task | Time |
|------|------|
| Create Play Developer account | 5 min + 24-48h wait |
| Generate signing key | 5 min |
| Build Android App Bundle | 20-30 min |
| Setup Play Console app | 15 min |
| Add assets & screenshots | 1-2 hours |
| Submit for review | 5 min |
| **Google review** | **1-5 business days** |
| **TOTAL** | **2-6 business days** |

---

## 💰 Costs

- Google Play Developer Account: **$25** (one-time)
- Monthly backend hosting: **$0-8**
- Monthly database: **$0-57**
- WhatsApp notifications: **$0-50**
- **Total Monthly: $0-115**

---

## ✅ Status

**Ready for Android Play Store deployment!** 🎉

All configuration files are set up. Next step: Create Google Play Developer Account and follow the checklist above.

---

**Questions?** See `PLAYSTORE_DEPLOYMENT_GUIDE.md` for detailed instructions.
