# MOOFU - Smart Parking Solution

A full-stack parking management system built with React Native (Expo) frontend and Express.js backend with PostgreSQL database.

## 🏗 Project Structure

```
moofu/
├── src/                    # Frontend (React Native/Expo)
│   ├── components/         # Reusable UI components
│   ├── screens/            # App screens (auth, home, parking, booking, profile)
│   ├── navigation/         # Navigation configuration
│   ├── context/            # State management (Auth, Booking, Toast)
│   ├── services/           # API client
│   ├── types/              # TypeScript types and models
│   ├── utils/              # Utilities (formatters, validators)
│   ├── theme/              # App theming
│   ├── data/               # Static data (services, payment methods)
│   └── App.tsx             # Root component
├── backend/                # Backend API (Express.js)
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Database access layer
│   │   ├── models/         # Data models
│   │   ├── middleware/     # Express middleware (auth, logging, validation)
│   │   ├── routes/         # API routes
│   │   ├── config/         # Configuration management
│   │   └── utils/          # Utilities (logging, validation)
│   ├── scripts/            # Database initialization scripts
│   ├── __tests__/          # Test suites
│   ├── Dockerfile          # Docker configuration
│   ├── jest.config.js      # Jest testing configuration
│   └── package.json
├── app.json                # Expo configuration
├── package.json            # Frontend dependencies
└── tsconfig.json           # TypeScript configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- PostgreSQL 14+ (for production/staging)
- For mobile: Android Studio or Xcode, Expo Go app

### Backend Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials and secrets
```

3. **Initialize database (requires PostgreSQL running):**
```bash
npm run db:init
```

4. **Start development server:**
```bash
npm run dev
```

The backend will be available at `http://localhost:5000/api`

**Health Check:** `curl http://localhost:5000/health`

### Frontend Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Start development:**
```bash
npm start
```

3. **Run on Android/iOS:**
```bash
npm run android    # Android (requires Android Studio/emulator)
npm run ios        # iOS (macOS only, requires Xcode)
npm run web        # Web browser
```

The app will auto-detect your environment and connect to the correct backend.

## 📋 API Reference

### Authentication
- `POST /api/auth/otp/request` - Request OTP for phone number
  - Body: `{ "phoneNumber": "+919876543210" }`
- `POST /api/auth/otp/verify` - Verify OTP and get JWT token
  - Body: `{ "phoneNumber": "+919876543210", "otp": "1234" }`
- `GET /api/auth/me` - Get current user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)
  - Body: `{ "name": "...", "location": "...", "vehicleNumber": "..." }`

### Parking Stations
- `GET /api/parking` - List all parking stations
- `GET /api/parking/:id` - Get station details
- `GET /api/parking/search/area?area=Downtown` - Search by area
- `GET /api/parking/nearby?latitude=12.97&longitude=77.59` - Find nearby stations
- `POST /api/parking` - Create station (admin only)

### Parking Slots
- `GET /api/slots/:stationId/availability?vehicleType=car&startTime=ISO&endTime=ISO` - Check availability
- `POST /api/slots/:stationId` - Add slots (admin only)

### Bookings
- `POST /api/booking` - Create new booking (requires auth)
  - Body: `{ "stationId": "...", "vehicleType": "car", "vehicleNumber": "...", "startTime": "ISO", "endTime": "ISO", "paymentMethodId": "..." }`
- `GET /api/booking/history/user` - Get user's booking history (requires auth)
- `GET /api/booking/:id` - Get booking details (requires auth)
- `DELETE /api/booking/:id` - Cancel booking (requires auth)

## 🔧 Configuration

### Backend Environment Variables (.env)
```env
# Server Configuration
NODE_ENV=development                          # Environment: development, production, test
PORT=5000                                     # API server port

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/moofu

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Admin Setup
ADMIN_SIGNUP_SECRET=admin-setup-secret

# OTP Configuration
OTP_TTL_MINUTES=5
DEV_OTP_CODE=1234                             # Development only
OTP_MAX_ATTEMPTS=5
```

### Frontend Configuration
The frontend automatically detects the environment:
- **Development:** Connects to `http://10.0.2.2:5000/api` (Android) or `http://localhost:5000/api` (iOS/Web)
- **Production:** Connects to configured production URL

## 🗄 Database

### Schema
- **users** - User accounts with authentication
- **parking_stations** - Parking location details and pricing
- **parking_slots** - Individual parking spaces with availability
- **bookings** - User bookings with pricing details
- **payments** - Payment transaction records
- **otp_codes** - OTP storage for verification

### Initialize Database
```bash
cd backend
npm run db:init
```

This will:
1. Create the database
2. Initialize all tables with constraints
3. Create necessary indexes

## ✅ Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run with Coverage
```bash
npm run test:coverage
```

### Run API Integration Tests
```bash
npm run test:api
```

## 🐳 Docker

### Build and Run
```bash
cd backend
docker build -t moofu-backend:latest .
docker run -e DATABASE_URL=postgresql://... -p 5000:5000 moofu-backend:latest
```

## 🚢 Deployment

### Backend (Render, Railway, Heroku)
1. Set environment variables on hosting platform
2. Ensure PostgreSQL is provisioned
3. Deploy Docker container or push to Git

### Frontend (Expo EAS or App Stores)
```bash
# Build for stores
eas build --platform android
eas build --platform ios

# Submit to stores (after building)
eas submit --platform android
eas submit --platform ios
```

## 🔐 Security Best Practices

- ✅ OTP-based authentication (prevents account takeover)
- ✅ JWT tokens with expiration (secure session management)
- ✅ Password hashing with bcryptjs
- ✅ CORS configured for frontend origin
- ✅ Rate limiting on auth endpoints (5 attempts/15 min)
- ✅ Input validation on all endpoints
- ✅ SQL injection protection via parameterized queries
- ✅ HTTPS required in production

## 🎯 Features

### Authentication
- ✅ Phone-based OTP login (no passwords)
- ✅ JWT token management
- ✅ Profile management
- ✅ Automatic session persistence

### Parking Discovery
- ✅ Browse all parking stations
- ✅ Real-time availability checking
- ✅ Filter by area
- ✅ Location-based search (nearby)

### Booking System
- ✅ One-click booking
- ✅ Flexible duration selection
- ✅ Automatic price calculation
- ✅ Multiple payment methods
- ✅ Booking history
- ✅ Cancel bookings (within time limit)

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Troubleshooting

### Backend won't start
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Run `npm install` to install dependencies

### Frontend connection issues
- Verify backend is running on port 5000
- Check firewall/network settings
- Ensure correct API URL for your environment

### Tests failing
- Ensure all dependencies are installed
- Check NODE_ENV variable
- Verify database credentials

## 📞 Support

For issues, questions, or suggestions, please:
- Open an issue on GitHub
- Check documentation in backend/README.md
- Review API logs in backend/logs/

## Running the App

### Development Mode (With Mock Data)

The app is configured to run with mock data in development mode. No backend server is required.

```bash
# Start the Expo development server
npm start

# Run on Android (requires Android Studio/emulator or physical device)
npm run android

# Run on iOS (requires macOS and Xcode)
npm run ios

# Run on Web
npm run web
```

### Using Expo Go

After running `npm start`, you can scan the QR code with:
- **Android**: Built-in camera or Expo Go app
- **iOS**: Expo Go app from App Store

## Features

### Authentication
- Phone number-based login with OTP verification
- Persistent authentication with AsyncStorage
- Mock authentication for development

### Parking Management
- Browse available parking spaces
- View parking details and availability
- Search by area
- Mock parking lots for development

### Booking System
- Select parking duration (hourly or monthly plans)
- View pricing breakdown
- Multiple payment methods
- Booking history tracking

### Profile Management
- Update user profile
- Manage vehicle information
- Update location preferences

## API Configuration

The app uses a mock data system for development. To connect to a real backend:

1. Edit `src/services/api.ts`
2. Set `USE_MOCK_DATA = false`
3. Update `API_BASE_URL` with your backend API endpoint

Backend API endpoints expected:
- `POST /auth/otp/request` - Request OTP
- `POST /auth/otp/verify` - Verify OTP
- `GET /auth/me` - Get user profile
- `PUT /auth/profile` - Update profile
- `GET /parking` - Get all parking spaces
- `POST /booking` - Create booking
- `GET /booking/history/user` - Get booking history

## Development Notes

### Mock Data
- Mock parking lots are defined in `src/data/mockData.ts`
- Mock authentication allows any 10-digit phone number
- Booking operations are simulated locally

### Styling
- Theme configuration in `src/theme/theme.ts`
- Uses Tailwind-inspired spacing and sizing system
- Supports light mode (default)

### Navigation Flow
- Unauthenticated: AuthStack (Login → OTP)
- Authenticated: MainTabs (Home → Booking → Profile)
- Modal screens: Coming Soon services, Parking details

## Building for Production

```bash
# Create a production build
eas build --platform ios --profile production
eas build --platform android --profile production
```

## Troubleshooting

### App Won't Start
- Clear cache: `npm start -- -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node version: `node --version` (should be 18+)

### Metro Bundler Errors
- Clear Metro cache: `npm start -- -c`
- Kill any running Metro processes

### AsyncStorage Issues
- Clear app data from device settings
- Reinstall app on device/emulator

## Future Enhancements

- Real backend API integration
- Payment gateway integration
- Real-time parking availability
- In-app notifications
- Subscription management
- Rating and reviews system

## License

MIT

## Contact

For support or inquiries, contact the development team.


