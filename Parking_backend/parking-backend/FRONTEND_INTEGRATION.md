# Frontend Integration Guide

## Overview

The backend now provides 10 production-ready endpoints. This guide shows how to integrate frontend with these APIs.

## Current State

**Frontend**: Uses mock data from `src/data/mockData.ts`  
**Backend**: Provides real APIs at `http://localhost:5000/api`

## Integration Steps

### Step 1: Create API Service

Create `src/services/api.ts`:

```typescript
import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Endpoints
export const authAPI = {
  requestOTP: (phoneNumber: string) =>
    api.post('/auth/otp/request', { phoneNumber }),
    
  verifyOTP: (phoneNumber: string, otp: string) =>
    api.post('/auth/otp/verify', { phoneNumber, otp }),
    
  getCurrentUser: () => api.get('/auth/me'),
  
  updateProfile: (name: string, location: string, vehicleNumber: string) =>
    api.put('/auth/profile', { name, location, vehicleNumber }),
};

// Parking Endpoints
export const parkingAPI = {
  getAllParkings: () => api.get('/parking'),
  
  getParkingById: (id: string) => api.get(`/parking/${id}`),
  
  searchByArea: (area: string) => api.get('/parking/search/area', { params: { area } }),
};

// Booking Endpoints
export const bookingAPI = {
  createBooking: (bookingData: any) =>
    api.post('/booking', bookingData),
    
  getUserBookings: () => api.get('/booking/history/user'),
  
  getBookingById: (id: string) => api.get(`/booking/${id}`),
  
  cancelBooking: (id: string) => api.delete(`/booking/${id}`),
};

export default api;
```

### Step 2: Update Environment Config

Add to `App.tsx` or `.env`:

```bash
# For Expo
REACT_APP_API_URL=http://localhost:5000/api

# For Production
REACT_APP_API_URL_PROD=https://api.moofu-parking.com/api
```

### Step 3: Update AuthContext

In `src/context/AuthContext.tsx`:

```typescript
import { authAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithPhone = async (phoneNumber: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.requestOTP(phoneNumber);
      console.log('OTP requested:', response.data.message);
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to request OTP';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (phoneNumber: string, otp: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.verifyOTP(phoneNumber, otp);
      const { user, token } = response.data.data;
      
      // Save token
      await AsyncStorage.setItem('authToken', token);
      setUser(user);
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'OTP verification failed';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;
      
      const response = await authAPI.getCurrentUser();
      setUser(response.data.data);
    } catch (err: any) {
      console.error('Failed to fetch user profile:', err.message);
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(
        updates.name || '',
        updates.location || '',
        updates.vehicleNumber || ''
      );
      setUser(response.data.data);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Profile update failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        loginWithPhone,
        verifyOtp,
        fetchUserProfile,
        updateUserProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

### Step 4: Update BookingContext

In `src/context/BookingContext.tsx`:

```typescript
import { parkingAPI, bookingAPI } from '../services/api';

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllParkings = async () => {
    try {
      setLoading(true);
      const response = await parkingAPI.getAllParkings();
      setParkingLots(response.data.data.spaces);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: BookingDraft) => {
    try {
      setLoading(true);
      const response = await bookingAPI.createBooking(bookingData);
      console.log('Booking created:', response.data.data);
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Booking failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const response = await bookingAPI.getUserBookings();
      setBookings(response.data.data.bookings);
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err.message);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      await bookingAPI.cancelBooking(bookingId);
      setBookings(bookings.filter(b => b.id !== bookingId));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Cancel failed');
      return false;
    }
  };

  return (
    <BookingContext.Provider
      value={{
        parkingLots,
        bookings,
        loading,
        error,
        fetchAllParkings,
        createBooking,
        fetchUserBookings,
        cancelBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
```

### Step 5: Update HomeScreen

In `src/screens/home/HomeScreen.tsx`:

```typescript
import { parkingAPI } from '../../services/api';

export const HomeScreen: React.FC = () => {
  const [parkings, setParkings] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchParkings();
  }, []);

  const fetchParkings = async () => {
    try {
      setLoading(true);
      const response = await parkingAPI.getAllParkings();
      setParkings(response.data.data.spaces);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchParkings} />;

  return (
    <ScreenContainer>
      {parkings.map(parking => (
        <ParkingCard
          key={parking.id}
          parking={parking}
          onPress={() => navigation.navigate('ParkingDetails', { parkingId: parking.id })}
        />
      ))}
    </ScreenContainer>
  );
};
```

### Step 6: Update LoginScreen

In `src/screens/auth/LoginScreen.tsx`:

```typescript
import { authAPI } from '../../services/api';

export const LoginScreen: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loginWithPhone, verifyOtp } = useAuth();

  const handleRequestOTP = async () => {
    try {
      setLoading(true);
      setError(null);
      const success = await loginWithPhone(phone);
      if (success) {
        setStep('otp');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      const success = await verifyOtp(phone, otp);
      if (success) {
        // Navigation handled by AuthStack
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      {step === 'phone' ? (
        <View>
          <AppInput
            placeholder="Phone number"
            value={phone}
            onChangeText={setPhone}
            editable={!loading}
          />
          <AppButton
            title="Request OTP"
            onPress={handleRequestOTP}
            loading={loading}
          />
        </View>
      ) : (
        <View>
          <AppInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            editable={!loading}
          />
          <AppButton
            title="Verify & Login"
            onPress={handleVerifyOTP}
            loading={loading}
          />
        </View>
      )}
      {error && <ErrorMessage message={error} />}
    </ScreenContainer>
  );
};
```

### Step 7: Environment File for Frontend

Create `src/.env`:

```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=10000
```

For Expo development on device:
```bash
REACT_APP_API_URL=http://192.168.1.100:5000/api
```
(Replace IP with your machine's local IP)

## Testing Checklist

- [ ] Backend running on `http://localhost:5000`
- [ ] Database connected and seeded
- [ ] Frontend compiled without errors
- [ ] OTP flow works (request → verify)
- [ ] Token saved and sent in subsequent requests
- [ ] Parking list loads
- [ ] Can create booking
- [ ] Booking appears in history
- [ ] Can cancel booking
- [ ] Profile update works

## Troubleshooting

### Network Error: "Cannot reach server"
- Verify backend is running: `http://localhost:5000/health`
- For device/emulator: Use machine's local IP instead of localhost
- Check CORS configuration in backend

### "Unauthorized" errors
- Token not being sent in header
- Token expired (refresh needed)
- Token format incorrect (should be "Bearer <token>")

### Mock vs Real Data Mismatch
- Ensure field names match exactly
- Backend returns `spaces` array, frontend expects `parkingLots`
- Check data transformation in context providers

## Remove Mock Data

After integration, remove:
```bash
rm src/data/mockData.ts
```

Update App.tsx to remove mockData imports:
```typescript
// Remove: import { mockParkingLots, mockBookings } from './data/mockData';
// Remove: const [parkings] = useState(mockParkingLots);
```

## Production Configuration

For production deployment, update:

```bash
REACT_APP_API_URL=https://your-production-api.com/api
```

Ensure:
- Backend CORS allows frontend domain
- JWT_SECRET is strong and secure
- Database credentials are secure
- All API calls have proper error handling
