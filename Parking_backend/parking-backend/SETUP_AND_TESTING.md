# MOOFU Parking Backend - Setup & Testing Guide

## Prerequisites

- Node.js 16+ and npm
- PostgreSQL 12+
- Postman (for API testing) - Optional
- Git

## Quick Start

### 1. Install Dependencies
```bash
cd Parking_backend/parking-backend
npm install
```

### 2. Database Setup

Create PostgreSQL database:
```bash
createdb moofu_parking
```

Or using psql:
```sql
CREATE DATABASE moofu_parking;
```

### 3. Environment Configuration

Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Update the following in `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=moofu_parking
JWT_SECRET=your_secret_key_12345
```

### 4. Start Development Server

```bash
npm run dev
```

**Expected Output**:
```
✓ Server running on port 5000
✓ Base URL: http://localhost:5000
✓ Health check: http://localhost:5000/health

Initializing database connection...
✓ Database connected successfully

✅ Parking spaces seeded
```

### 5. Verify Server Health

```bash
curl http://localhost:5000/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "message": "Parking Backend API",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Testing the 10 Endpoints

### Test Collection Overview

All tests use JSON request bodies and Bearer token authentication for protected endpoints.

---

### Test 1: Request OTP

**Request**:
```bash
POST http://localhost:5000/api/auth/otp/request
Content-Type: application/json

{
  "phoneNumber": "9876543210"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "OTP sent to 9876543210"
  }
}
```

**Console Output** (development mode):
```
[DEV] OTP for 9876543210: 1234
```

---

### Test 2: Verify OTP & Login

Use the OTP printed in console from Test 1.

**Request**:
```bash
POST http://localhost:5000/api/auth/otp/verify
Content-Type: application/json

{
  "phoneNumber": "9876543210",
  "otp": "1234"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "phoneNumber": "9876543210",
      "name": "MOOFU User",
      "location": "Not specified",
      "vehicleNumber": "Not specified"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token** for next tests. Example:
```
TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Test 3: Get Current User

**Request**:
```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer <TOKEN_FROM_TEST_2>
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phoneNumber": "9876543210",
    "name": "MOOFU User",
    "location": "Not specified",
    "vehicleNumber": "Not specified"
  }
}
```

---

### Test 4: Update User Profile

**Request**:
```bash
PUT http://localhost:5000/api/auth/profile
Authorization: Bearer <TOKEN_FROM_TEST_2>
Content-Type: application/json

{
  "name": "John Doe",
  "location": "San Francisco",
  "vehicleNumber": "CA-123456"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phoneNumber": "9876543210",
    "name": "John Doe",
    "location": "San Francisco",
    "vehicleNumber": "CA-123456"
  }
}
```

---

### Test 5: Get All Parking Spaces

**Request**:
```bash
GET http://localhost:5000/api/parking
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "spaces": [
      {
        "id": "uuid-1",
        "name": "Downtown Parking Hub",
        "rating": 4.5,
        "distanceKm": 0.5,
        "isOpen": true,
        "availabilityText": "45/100 spots available",
        "address": "123 Main Street",
        "area": "Downtown",
        "city": "San Francisco",
        "hourlyRate": 5.99,
        "convenienceFee": 2.0,
        "monthlyPlans": [...],
        "spots": [...]
      },
      ...
    ]
  }
}
```

**Save a parking ID** for next tests:
```
PARKING_ID=<from_response>
```

---

### Test 6: Get Specific Parking Space

**Request**:
```bash
GET http://localhost:5000/api/parking/<PARKING_ID>
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "<PARKING_ID>",
    "name": "Downtown Parking Hub",
    "rating": 4.5,
    "distanceKm": 0.5,
    "isOpen": true,
    "availabilityText": "45/100 spots available",
    ...
  }
}
```

---

### Test 7: Create Booking

**Request**:
```bash
POST http://localhost:5000/api/booking
Authorization: Bearer <TOKEN_FROM_TEST_2>
Content-Type: application/json

{
  "parkingId": "<PARKING_ID>",
  "vehicleType": "FOUR_WHEELER",
  "vehicleNumber": "CA-123456",
  "arrivalDateISO": "2024-01-20T14:30:00Z",
  "arrivalTimeLabel": "2:30 PM",
  "departureDateISO": "2024-01-20T18:30:00Z",
  "departureTimeLabel": "6:30 PM",
  "durationHours": 4,
  "estimatedSubtotal": 23.96,
  "convenienceFee": 2.0,
  "totalAmount": 25.96,
  "paymentMethodId": "card_123"
}
```

**Expected Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "userId": "user-uuid",
    "parkingId": "<PARKING_ID>",
    "vehicleType": "FOUR_WHEELER",
    "vehicleNumber": "CA-123456",
    "totalAmount": 25.96,
    "tokenNo": "TOKEN-1705326600000",
    ...
  }
}
```

**Save booking ID** for next tests:
```
BOOKING_ID=<from_response>
```

---

### Test 8: Get User Booking History

**Request**:
```bash
GET http://localhost:5000/api/booking/history/user
Authorization: Bearer <TOKEN_FROM_TEST_2>
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "<BOOKING_ID>",
        "userId": "user-uuid",
        "parkingId": "<PARKING_ID>",
        ...
      }
    ]
  }
}
```

---

### Test 9: Get Booking Details

**Request**:
```bash
GET http://localhost:5000/api/booking/<BOOKING_ID>
Authorization: Bearer <TOKEN_FROM_TEST_2>
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "<BOOKING_ID>",
    "userId": "user-uuid",
    "parkingId": "<PARKING_ID>",
    ...
  }
}
```

---

### Test 10: Cancel Booking

**Request**:
```bash
DELETE http://localhost:5000/api/booking/<BOOKING_ID>
Authorization: Bearer <TOKEN_FROM_TEST_2>
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "Booking cancelled successfully"
  }
}
```

---

### Bonus Test: Search Parking by Area

**Request**:
```bash
GET http://localhost:5000/api/parking/search/area?area=Downtown
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "spaces": [
      {
        "id": "uuid-1",
        "name": "Downtown Parking Hub",
        "area": "Downtown",
        ...
      }
    ]
  }
}
```

---

## Common Issues & Solutions

### Issue: "Database connection failed"
**Solution**:
1. Verify PostgreSQL is running: `psql --version`
2. Check `.env` database credentials
3. Ensure database exists: `psql -l | grep moofu_parking`
4. Create if missing: `createdb moofu_parking`

### Issue: "Port 5000 already in use"
**Solution**:
1. Change PORT in `.env` to different value (e.g., 5001)
2. Or kill existing process: `lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9`

### Issue: "OTP is always invalid"
**Solution**:
1. Check console output for generated OTP
2. Use exact OTP from console (it's printed in development mode)
3. OTPs expire after 10 minutes

### Issue: "Unauthorized - Missing Authorization header"
**Solution**:
1. Ensure Protected routes include Authorization header
2. Format: `Authorization: Bearer <token>` (space between Bearer and token)
3. Use token from Test 2 (OTP verification)

---

## Build & Production

### Build for Production
```bash
npm run build
```

Generates compiled JavaScript in `dist/` folder.

### Run Production Server
```bash
npm start
```

Ensure `.env` has:
- `NODE_ENV=production`
- Valid `JWT_SECRET`
- Real database credentials

---

## Database Reset

To start fresh with seeded data:

```bash
# Drop and recreate database
dropdb moofu_parking
createdb moofu_parking

# Restart server (will auto-reseed)
npm run dev
```

---

## Next Steps: Frontend Integration

Update frontend to call these endpoints instead of mock data:

1. Replace `mockData.ts` imports with API calls
2. Update `AuthContext.tsx` to use `/api/auth/` endpoints
3. Update `BookingContext.tsx` to use `/api/booking/` endpoints
4. Fetch parking data from `/api/parking` instead of mockData
5. Add loading & error states for API calls

See [FRONTEND_INTEGRATION.md](../FRONTEND_INTEGRATION.md) for detailed steps.
