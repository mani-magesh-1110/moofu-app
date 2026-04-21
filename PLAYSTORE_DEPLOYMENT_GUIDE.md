# Android Play Store Deployment Guide for MOOFU

Complete step-by-step guide to publish MOOFU parking app on Google Play Store.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Account Setup](#account-setup)
3. [App Configuration](#app-configuration)
4. [Build & Signing](#build--signing)
5. [App Bundle Creation](#app-bundle-creation)
6. [Play Store Setup](#play-store-setup)
7. [Submission](#submission)
8. [Post-Launch](#post-launch)

---

## Prerequisites

### Required Software
- **Node.js** (v16+)
- **Android Studio** (optional, but recommended)
- **Java Development Kit (JDK)** 11 or higher
- **Git** (already installed)

### Required Accounts
- **Google Play Developer Account** ($25 one-time fee)
- **Google account** (personal or business)

### Project Requirements
- ✅ App name: MOOFU
- ✅ Package name: `com.moofuparking.app` (recommended)
- ✅ Version: 1.0.0
- ✅ Min SDK: 21 (Android 5.0)
- ✅ Target SDK: 34 (Android 14)

---

## Account Setup

### Step 1: Create Google Play Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create account**
3. Select **Developer account** option
4. Pay the **$25 registration fee**
5. Complete your developer profile:
   - Developer name
   - Email address
   - Website (if applicable)
   - Contact information

**Timeline:** Account activation can take a few hours to 48 hours.

### Step 2: Set Up Billing

1. In Play Console, go to **Settings > Account details**
2. Add a payment method
3. Verify your account ownership

---

## App Configuration

### Step 1: Update app.json

Your current `app.json` needs these additions for Play Store:

```json
{
  "expo": {
    "name": "MOOFU",
    "slug": "moofu-parking",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": false,
    "description": "Easy parking spot reservation and management app",
    "privacy": "public",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.moofuparking.app"
    },
    "android": {
      "package": "com.moofuparking.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false,
      "versionCode": 1,
      "permissions": [
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.INTERNET",
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE"
      ],
      "useNextNotificationFormat": true
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-font",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow MOOFU to access your location."
        }
      ]
    ],
    "scheme": "moofu",
    "runtimeVersion": {
      "policy": "appVersion"
    },
    "updates": {
      "url": "https://u.expo.dev/YOUR_PROJECT_ID_HERE",
      "enabled": false,
      "checkAutomatically": "ON_LOAD"
    }
  }
}
```

**Key Updates:**
- `android.package`: Unique reverse domain identifier
- `android.versionCode`: Increment for each build (1, 2, 3...)
- `android.permissions`: Location, camera, internet
- Icon and splash images are required

---

## Build & Signing

### Step 1: Create Signing Key (One-time)

Run this command to generate a keystore for signing:

```bash
# Windows PowerShell
keytool -genkey -v -keystore moofu-release.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias moofu-key

# macOS/Linux
keytool -genkey -v -keystore moofu-release.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias moofu-key
```

When prompted, enter:
- **Keystore password**: Create a strong password (save it!)
- **Key password**: Same as keystore password (recommended)
- **Key alias**: `moofu-key`
- **Organization name**: Your company name
- **Validity**: 10000 days (≈27 years)

**⚠️ CRITICAL:** 
- Save the `moofu-release.keystore` file in a safe location (NOT in git)
- Save the password in a password manager
- **Never lose this keystore** - you can't update the app without it

### Step 2: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 3: Create eas.json

Create `eas.json` in your project root:

```json
{
  "cli": {
    "version": ">= 5.4.0"
  },
  "build": {
    "development": {
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "resourceClass": "m1"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "distribution": "store",
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccount": "./google-play-key.json"
      }
    }
  }
}
```

---

## App Bundle Creation

### Method 1: Using EAS (Recommended)

```bash
# Login to EAS
eas login

# Build Android App Bundle (AAB) for Play Store
eas build --platform android --release

# This will:
# 1. Build your app as an AAB (Android App Bundle)
# 2. Sign it with your signing key
# 3. Create a production-ready binary
# 4. Output the .aab file for upload
```

**Expected output:**
```
✅ Build successful!
📱 Download: https://expo.dev/artifacts/...
```

### Method 2: Local Build (Advanced)

If you want to sign locally:

```bash
# Build unsigned APK first
eas build --platform android --release --local

# Sign with your keystore
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore moofu-release.keystore app-release.aab moofu-key

# Verify signature
jarsigner -verify -verbose -certs app-release.aab
```

---

## Play Store Setup

### Step 1: Create App in Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create app**
3. Fill in:
   - **App name**: MOOFU
   - **Default language**: English
   - **Type**: App
   - **Category**: Maps & Navigation
   - **Target audience**: Mature

### Step 2: Complete App Details

1. Go to **All apps > MOOFU > App details**
2. Fill in:
   - **Short description** (80 chars):
     ```
     Reserve parking spots instantly. Find, book, and manage parking with ease.
     ```
   - **Full description** (4000 chars):
     ```
     MOOFU makes parking effortless. 
     
     ✨ Features:
     • Find available parking spots near you
     • Reserve spots in seconds
     • Real-time availability updates
     • Multiple payment methods
     • Booking history & cancellation
     • Push notifications
     
     Whether you're looking for hourly or daily parking, MOOFU connects you with verified parking locations instantly.
     
     Contact: support@moofuparking.com
     Privacy: https://moofuparking.com/privacy
     Terms: https://moofuparking.com/terms
     ```
   - **Developer contact**: Your email

### Step 3: Add Store Listing Assets

1. Go to **Store listing > Graphics**
2. Upload required images:

#### App Icon (512x512 PNG)
- No rounded corners
- No transparency on edges
- Use `assets/icon.png` at 512x512

#### Feature Graphic (1024x500 PNG)
- Show key app features
- Text should be readable
- Include app name

#### Screenshots (5-8 images, 1080x1920 PNG for phone)
Create screenshots showing:
1. Login/OTP screen
2. Home with parking spots
3. Parking details
4. Booking/Map view
5. Payment screen
6. Success confirmation
7. Booking history

#### Video Preview (15-30 seconds, optional)
- Demonstrate app features
- Show user journey from login to booking

### Step 4: Content Rating

1. Go to **Store listing > Content rating**
2. Complete the **IARC questionnaire**
3. Select rating category: **Parental Guidance (PG)** or **General Audiences**
4. Submit

### Step 5: Target Audience & Content

1. **Target audience**: Adults (18+) or General?
2. **Content guidelines**: 
   - No restricted content
   - Safe for all users
3. **Ads**: Declare if your app contains ads

---

## Submission

### Step 1: Upload Build

1. Go to **Release > Production > Create new release**
2. Click **Browse files** in "Android App Bundles"
3. Upload the `.aab` file from EAS build
4. Review the build summary

### Step 2: Release Notes

```
Version 1.0.0 Release Notes:

🎉 Initial Launch

✨ Features:
• Find and reserve parking spots instantly
• Real-time availability updates
• Secure OTP-based authentication
• Multiple payment methods
• Booking management
• Location-based search

🐛 Stability & Performance improvements
```

### Step 3: Compliance

1. **Data safety section**:
   - Go to **Store listing > Data safety**
   - Declare what data you collect (location, phone, payment)
   - Specify your privacy policy URL
   - Confirm compliance

2. **Ads declaration**:
   - Does your app show ads? (No)
   - Does it use Google Mobile Ads? (No)

3. **COVID-19 resources** (optional):
   - Not applicable for parking app

### Step 4: Final Review

1. Go to **Release > Production**
2. Review:
   - ✅ App icon
   - ✅ App name
   - ✅ Screenshots
   - ✅ Feature graphic
   - ✅ Description
   - ✅ Release notes
   - ✅ Privacy policy
   - ✅ Terms & conditions
   - ✅ Build (AAB file)

3. Click **Next: Review and roll out**

### Step 5: Submit for Review

1. **Review submission**:
   - Click **Start rollout to production**
   - Select **10%** as initial rollout (safer)
   - Confirm submission

2. **Review timeline**:
   - Automated checks: 1-3 hours
   - Manual review: 1-5 business days
   - Status updates via email

---

## Post-Launch

### Step 1: Monitor Submission Status

- Check **Releases > Production > Review status**
- You'll receive email updates on:
  - ✅ App approved
  - ❌ App rejected (reason provided)
  - ⚠️ Policy violations

### Step 2: If Approved

Your app will be:
1. **Live in 10% rollout** (Phase 1)
2. Wait 1-2 days for crash/stability monitoring
3. **Expand to 25%, 50%, 100%** (gradual rollout)
4. **Fully available** in Google Play Store

### Step 3: If Rejected

Common rejection reasons:
- **Broken functionality** (missing features, crashes)
- **Policy violations** (privacy, ads, etc.)
- **Design issues** (misleading screenshots, etc.)
- **Age rating mismatch**

**Action**:
1. Read rejection reason carefully
2. Fix issues in your code
3. Increment version code in `app.json`: `versionCode: 2`
4. Rebuild with EAS
5. Resubmit

### Step 4: Post-Launch Monitoring

1. **Monitor crashes**:
   - Go to **Release > Android vitals > Crashes**
   - Fix critical issues ASAP
   - Release hotfix if needed

2. **Monitor reviews**:
   - Check **Store listing > Reviews**
   - Respond to user feedback
   - Fix reported issues

3. **Monitor ratings**:
   - Target: 4.0+ stars
   - Below 3.5 stars = investigate issues

---

## Versioning & Updates

### Version Code Strategy

```
Version Code increment: for each build submitted
Version Name: Semantic versioning (1.0.0, 1.0.1, 1.1.0, etc.)

Example:
Version 1.0.0 = Build 1
Version 1.0.1 = Build 2 (bug fix)
Version 1.1.0 = Build 3 (new features)
Version 2.0.0 = Build 4 (major update)
```

### Updating the App

```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

Then rebuild:
```bash
eas build --platform android --release
```

---

## Checklist Before Submission

### App Configuration
- [ ] Package name set: `com.moofuparking.app`
- [ ] Version: `1.0.0`
- [ ] Min SDK: 21+
- [ ] Target SDK: 34+

### Assets (512x512 PNG minimum)
- [ ] App icon
- [ ] Adaptive icon
- [ ] Splash screen
- [ ] 5-8 screenshots
- [ ] Feature graphic (1024x500)

### Content
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Privacy policy URL
- [ ] Terms & conditions URL
- [ ] Contact email

### Build
- [ ] Android App Bundle (.aab) created
- [ ] Signed with keystore
- [ ] Tested on device/emulator
- [ ] No errors/warnings

### Compliance
- [ ] Content rating completed
- [ ] Data safety declared
- [ ] Age rating appropriate

---

## Troubleshooting

### Build Fails with "Signing Key Error"
```bash
# Solution: Regenerate keystore
keytool -genkey -v -keystore moofu-release.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias moofu-key
```

### Build Takes Too Long
- Normal: 15-30 minutes
- Check: `eas build --status` for build status
- Contact Expo support if stuck > 1 hour

### Submission Rejected for "Broken App"
1. Test on Android device/emulator
2. Check: Does login work? Can you book?
3. Fix bugs and rebuild
4. Increment version code
5. Resubmit

### Screenshots Rejected
- Must be actual screenshots (not mockups)
- Text must be readable
- No personal information visible
- No competitor logos

---

## Timeline Estimate

| Task | Time |
|------|------|
| Create Google Play account | 5 min + 24-48h wait |
| Configure app.json | 10 min |
| Build Android App Bundle | 20 min |
| Set up Play Console app | 15 min |
| Add assets & screenshots | 1-2 hours |
| Submit for review | 5 min |
| **Google review** | **1-5 business days** |
| **Total Time to Launch** | **2-5 business days** |

---

## Cost Breakdown

| Item | Cost |
|------|------|
| Google Play Developer Account (one-time) | $25 |
| Monthly hosting (Render/Railway) | $0-8 |
| Monthly database (MongoDB Atlas) | $0-57 |
| Monthly WhatsApp API | $0-50 |
| **Total Monthly** | **$0-115** |

---

## Important Links

- **Google Play Console**: https://play.google.com/console
- **Expo Documentation**: https://docs.expo.dev
- **Android App Bundle**: https://developer.android.com/guide/app-bundle
- **Play Store Policies**: https://play.google.com/about/developer-content-policy/
- **MOOFU Documentation**: See `DOCUMENTATION_MAP.md`

---

## Next Steps

1. **Create Google Play Developer Account** ($25, one-time)
2. **Update app.json** with proper configuration
3. **Create eas.json** in project root
4. **Build Android App Bundle** using EAS
5. **Create app in Play Console**
6. **Add store listing** (screenshots, description, etc.)
7. **Submit for review**

**Questions?** Check `BACKEND_STARTER/README.md` for API integration details.

---

**Status**: Ready for Android Play Store submission! 🚀
**Date**: April 21, 2026
**App Version**: 1.0.0
