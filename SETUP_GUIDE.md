# MOOFU App - Complete Setup Guide

## ✅ COMPLETED: UI/UX Improvements

### 1. Keyboard Hiding Issue - FIXED
- Updated `OtpScreen.tsx` with `ScrollView` inside `KeyboardAvoidingView`
- Updated `ScreenContainer.tsx` to use `behavior="height"` for Android
- Added `keyboardVerticalOffset` for proper spacing
- Result: Users can now see input fields while typing OTP/numbers

### 2. Font System - UPDATED  
- Updated theme with Montserrat (Bold/ExtraBold), Inter, and Poppins fonts
- Typography utilities configured with proper font weights
- Can use `FontFamily` constants from theme

**TO INSTALL CUSTOM FONTS** (Optional but recommended):
```bash
npm install @expo-google-fonts/montserrat @expo-google-fonts/inter @expo-google-fonts/poppins
```

Then update `AppProviders.tsx`:
```typescript
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Montserrat_700Bold, Montserrat_800ExtraBold } from '@expo-google-fonts/montserrat';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { Poppins_500Medium } from '@expo-google-fonts/poppins';

SplashScreen.preventAutoHideAsync();

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [fontsLoaded] = useFonts({
    Montserrat_Bold: Montserrat_700Bold,
    Montserrat_ExtraBold: Montserrat_800ExtraBold,
    Inter_Regular: Inter_400Regular,
    Inter_Medium: Inter_500Medium,
    Poppins_Medium: Poppins_500Medium,
  });

  React.useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* existing providers */}
    </GestureHandlerRootView>
  );
}
```

---

## 📱 PART 3: Backend Architecture Setup

### Overview
The MOOFU app has three main user types:
1. **Users** (Mobile App) - Book parking slots
2. **Station Owners** (Website + Admin) - Manage parking stations, prices, slots
3. **Backend Server** - Handles business logic, database, messaging

### Architecture Design

```
┌─────────────────┐
│  Mobile App     │
│  (React Native) │
└────────┬────────┘
         │ REST API / WebSocket
         ▼
┌─────────────────────────────────────┐
│  Backend Server (Node.js/Express)   │
│  - Authentication (JWT)             │
│  - Parking slots management         │
│  - Booking engine                   │
│  - Payment integration              │
│  - WhatsApp messaging               │
└─────────────────────────────────────┘
         ▲              ▲
         │              │
    Database        External APIs
   (MongoDB/        (WhatsApp,
    PostgreSQL)      Stripe)
         ▲              │
         └──────┬───────┘
                │
    ┌───────────┴───────────┐
    │                       │
┌─────────────────┐  ┌──────────────┐
│ Station Owner   │  │ Admin Panel  │
│  Website        │  │ (Web/React)  │
│ (React/Next.js) │  └──────────────┘
└─────────────────┘
```

### Tech Stack Recommendation

**Backend:**
- Node.js + Express.js (or NestJS for larger application)
- TypeScript
- MongoDB (flexible schema) or PostgreSQL (structured data)
- Socket.io (Real-time notifications)
- JWT for authentication
- Twilio/WhatsApp Business API
- Stripe/Razorpay for payments

**Station Owner Website:**
- React or Next.js
- Material-UI or Tailwind CSS
- Redux/Context API for state management
- Chart libraries (Chart.js, Recharts) for analytics

**Hosting:**
- Backend: Render, Railway, Heroku, AWS, or DigitalOcean
- Frontend: Vercel, Netlify, or AWS S3 + CloudFront

---

### Step 1: Backend Project Setup

```bash
# Create backend folder
mkdir moofu-backend
cd moofu-backend

# Initialize Node project
npm init -y

# Install dependencies
npm install express cors dotenv mongoose bcryptjs jsonwebtoken
npm install -D typescript ts-node @types/express @types/node

# Create folder structure
mkdir src
mkdir src/{controllers,routes,middleware,models,utils}
```

### Step 2: Core Database Models

**File: `src/models/User.ts`**
```typescript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phone: { type: String, unique: true, required: true },
  name: String,
  email: { type: String, unique: true, sparse: true },
  location: String,
  vehicleNumber: String,
  password: String,
  createdAt: { type: Date, default: Date.now },
  lastBooking: mongoose.Schema.Types.ObjectId,
});

export const User = mongoose.model('User', userSchema);
```

**File: `src/models/ParkingStation.ts`**
```typescript
import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
  location: {
    address: String,
    latitude: Number,
    longitude: Number,
  },
  totalSlots: { type: Number, required: true },
  availableSlots: { type: Number, required: true },
  pricePerHour: Number,
  pricePerDay: Number,
  pricePerMonth: Number,
  vehicleTypes: [String], // ['car', 'bike', 'auto']
  images: [String],
  rating: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

export const ParkingStation = mongoose.model('ParkingStation', stationSchema);
```

**File: `src/models/Booking.ts`**
```typescript
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingStation', required: true },
  vehicleNumber: String,
  vehicleType: String,
  arrivalTime: Date,
  departureTime: Date,
  price: Number,
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentMethod: String,
  tokenNumber: String,
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

export const Booking = mongoose.model('Booking', bookingSchema);
```

**File: `src/models/Owner.ts`**
```typescript
import mongoose from 'mongoose';

const ownerSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: String,
  phone: { type: String, unique: true, required: true },
  whatsappNumber: String,
  companyName: String,
  businessRegistration: String,
  bankDetails: {
    accountName: String,
    accountNumber: String,
    ifscCode: String,
  },
  stations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ParkingStation' }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export const Owner = mongoose.model('Owner', ownerSchema);
```

### Step 3: Authentication Routes

**File: `src/routes/auth.ts`**
```typescript
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

const router = express.Router();

// User Login with Phone
router.post('/login-phone', async (req, res) => {
  const { phone } = req.body;
  
  try {
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone });
      await user.save();
    }
    
    // TODO: Send OTP via Twilio/WhatsApp
    res.json({ 
      success: true, 
      message: 'OTP sent',
      tempToken: jwt.sign({ phone }, process.env.JWT_SECRET, { expiresIn: '10m' })
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  
  // TODO: Verify OTP against cached value
  const user = await User.findOne({ phone });
  
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ success: true, token, user });
});

// Owner Registration
router.post('/owner-register', async (req, res) => {
  const { email, password, phone, companyName } = req.body;
  
  const owner = new Owner({
    email,
    phone,
    companyName,
    password: await bcrypt.hash(password, 10),
  });
  
  await owner.save();
  res.json({ success: true, message: 'Registration successful' });
});

export default router;
```

### Step 4: Booking Routes with Real-time Notifications

**File: `src/routes/bookings.ts`**
```typescript
import express from 'express';
import { Booking } from '../models/Booking';
import { ParkingStation } from '../models/ParkingStation';
import { sendWhatsAppMessage } from '../utils/whatsapp';

const router = express.Router();

// Create Booking
router.post('/', async (req, res) => {
  const { userId, stationId, vehicleNumber, arrivalTime, departureTime } = req.body;
  
  const station = await ParkingStation.findById(stationId).populate('ownerId');
  
  if (!station || station.availableSlots <= 0) {
    return res.status(400).json({ error: 'No slots available' });
  }
  
  const booking = new Booking({
    userId,
    stationId,
    vehicleNumber,
    arrivalTime,
    departureTime,
    price: calculatePrice(station, arrivalTime, departureTime),
    tokenNumber: generateTokenNumber(),
  });
  
  await booking.save();
  station.availableSlots -= 1;
  await station.save();
  
  // 📱 Send WhatsApp to Station Owner
  await sendWhatsAppMessage(
    station.ownerId.whatsappNumber,
    `New Booking!\nStation: ${station.name}\nVehicle: ${vehicleNumber}\nToken: ${booking.tokenNumber}`
  );
  
  res.json({ success: true, booking });
});

export default router;
```

---

## 🔔 PART 4: WhatsApp Integration for Station Owners

### Setup: Twilio WhatsApp Business API

1. **Create Twilio Account:**
   - Go to https://www.twilio.com
   - Sign up and create account
   - Get your SID and Auth Token

2. **Setup WhatsApp Sandbox:**
   - Go to Twilio Console > Messaging > WhatsApp
   - Approve WhatsApp Business Account
   - Get your WhatsApp Sandbox Number

3. **Install Twilio SDK:**
   ```bash
   npm install twilio
   ```

4. **Create WhatsApp Utility:**
   **File: `src/utils/whatsapp.ts`**
   ```typescript
   import twilio from 'twilio';
   
   const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
   
   export const sendWhatsAppMessage = async (
     toPhoneNumber: string,
     message: string
   ) => {
     try {
       const msg = await client.messages.create({
         from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
         to: `whatsapp:${toPhoneNumber}`,
         body: message,
       });
       
       console.log(`WhatsApp sent: ${msg.sid}`);
       return msg;
     } catch (error) {
       console.error('WhatsApp error:', error);
     }
   };
   
   // Template messages for station owners
   export const sendBookingNotification = async (
     ownerPhone: string,
     bookingInfo: any
   ) => {
     const message = `
   🅿️ *NEW PARKING BOOKING*
   
   Station: ${bookingInfo.stationName}
   Vehicle: ${bookingInfo.vehicleNumber}
   Token #: ${bookingInfo.tokenNumber}
   Duration: ${bookingInfo.duration}hrs
   Amount: ₹${bookingInfo.amount}
   
   Visit MOOFU Admin: [URL]
     `.trim();
     
     return sendWhatsAppMessage(ownerPhone, message);
   };
   ```

5. **Environment Variables (.env):**
   ```
   TWILIO_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_NUMBER=+14155238886
   ```

---

## 👥 PART 5: Station Owner Website Setup

### Frontend Structure (React + TypeScript)

```bash
# Create station owner website
npx create-react-app --template typescript station-owner-dashboard cd station-owner-dashboard
npm install react-router-dom axios recharts
```

**Key Pages:**
```
/dashboard       - Overview of bookings
/stations        - Manage parking stations
/pricing         - Set prices
/earnings        - View earnings
/settings        - Account settings
/login           - Owner login
```

### Core Components Example

**File: `src/pages/Dashboard.tsx`**
```typescript
import React, { useEffect, useState } from 'react';
import LineChart from '../components/LineChart';

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    // Fetch from backend
    const owner = JSON.parse(localStorage.getItem('owner') || '{}');
    
    fetchBookings(owner.id).then((data) => {
      setBookings(data);
      const total = data.reduce((sum, b) => sum + b.price, 0);
      setEarnings(total);
    });
  }, []);

  return (
    <div className="dashboard">
      <h1>Station Dashboard</h1>
      <div className="stats">
        <div className="stat-card">
          <h3>Total Earnings</h3>
          <p>₹{earnings}</p>
        </div>
        <div className="stat-card">
          <h3>Today's Bookings</h3>
          <p>{bookings.filter(b => isToday(b.date)).length}</p>
        </div>
      </div>
      <LineChart bookings={bookings} />
    </div>
  );
}

async function fetchBookings(ownerId: string) {
  const res = await fetch(`/api/bookings?owner=${ownerId}`);
  return res.json();
}

function isToday(date: string) {
  return new Date(date).toDateString() === new Date().toDateString();
}
```

---

## 🚀 PART 6: Deployment & Play Store

### Android Build & Play Store Submission

1. **Generate Signed APK:**
   ```bash
   cd moofu
   eas build --platform android --type apk
   ```

2. **Generate Release Key:**
   ```bash
   keytool -genkey -v -keystore moofu.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias moofu
   ```

3. **Update app.json for production:**
   ```json
   {
     "expo": {
       "name": "MOOFU",
       "version": "1.0.0",
       "android": {
         "versionCode": 1,
         "package": "com.moofu.parking"
       },
       "ios": {
         "bundleIdentifier": "com.moofu.parking"
       }
     }
   }
   ```

4. **Create Google Play Account:**
   - Go to https://play.google.com/console
   - Pay $25 registration fee
   - Create app listing
   - Add screenshots, description, privacy policy

5. **Submit APK:**
   - Upload signed APK
   - Fill app information
   - Add release notes
   - Submit for review (24-48 hours)

---

## 🔗 Quick Links for Implementation

| Component | Setup Link |
|-----------|-----------|
| Backend | Express Setup |
| Database | MongoDB Atlas |
| WhatsApp | Twilio Console |
| Payments | Stripe/Razorpay |
| Hosting | Render.com |
| Play Store | play.google.com/console |

---

## 📋 Checklist for Going Live

- [ ] Backend API deployed and tested
- [ ] Database backup configured
- [ ] WhatsApp messaging working
- [ ] Payment gateway integrated
- [ ] Station owner website live
- [ ] Admin panel deployed
- [ ] Privacy policy & Terms created
- [ ] Test bookings completed
- [ ] App signed and built
- [ ] Play Store submission completed
- [ ] Monitoring & logging setup (Sentry, LogRocket)
- [ ] User documentation created

