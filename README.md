# MOOFU - Parking Management App

A React Native mobile application for convenient parking space booking and management.

## Overview

MOOFU is a mobile parking management application built with React Native and Expo. It allows users to:
- Browse available parking spaces
- Book parking spots with flexible duration
- Manage their bookings
- View parking history
- Update profile information

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: React Context
- **Storage**: AsyncStorage
- **Icons**: Expo Vector Icons
- **UI Components**: Custom components with React Native

## Project Structure

```
src/
├── components/ui/          # Reusable UI components
├── context/                # React Context providers (Auth, Booking, Toast)
├── data/                   # Mock data and constants
├── navigation/             # Navigation stack configuration
├── screens/                # Screen components
├── services/               # API client and services
├── theme/                  # App theme configuration
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## Installation

1. **Prerequisites**
   - Node.js 18+ 
   - npm or yarn
   - Expo CLI: `npm install -g expo-cli`

2. **Install Dependencies**
   ```bash
   npm install
   ```

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


