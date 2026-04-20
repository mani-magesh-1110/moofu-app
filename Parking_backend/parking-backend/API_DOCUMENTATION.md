# MOOFU Parking Backend - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. Authentication Endpoints

### POST /auth/otp/request
**Scope**: Public  
**Description**: Request OTP for phone-based login

**Request Body**:
```json
{
  "phoneNumber": "9876543210"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "message": "OTP sent to 9876543210"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### POST /auth/otp/verify
**Scope**: Public  
**Description**: Verify OTP and login user

**Request Body**:
```json
{
  "phoneNumber": "9876543210",
  "otp": "1234"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "user": {
      "id": "uuid-user-id",
      "phoneNumber": "9876543210",
      "name": "John Doe",
      "location": "San Francisco",
      "vehicleNumber": "CA-123456"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### GET /auth/me
**Scope**: Protected  
**Description**: Get current user profile

**Request Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "uuid-user-id",
    "phoneNumber": "9876543210",
    "name": "John Doe",
    "location": "San Francisco",
    "vehicleNumber": "CA-123456"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### PUT /auth/profile
**Scope**: Protected  
**Description**: Update user profile

**Request Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Jane Doe",
  "location": "New York",
  "vehicleNumber": "NY-789012"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "uuid-user-id",
    "phoneNumber": "9876543210",
    "name": "Jane Doe",
    "location": "New York",
    "vehicleNumber": "NY-789012"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 2. Parking Endpoints

### GET /parking
**Scope**: Public  
**Description**: Get all available parking spaces

**Response** (200):
```json
{
  "success": true,
  "data": {
    "spaces": [
      {
        "id": "uuid-parking-id",
        "name": "Downtown Parking Hub",
        "rating": 4.5,
        "distanceKm": 0.5,
        "isOpen": true,
        "availabilityText": "45/100 spots available",
        "hourlyRate": 5.99,
        "convenienceFee": 2.0
      }
    ]
  }
}
```

---

### GET /parking/:id
**Scope**: Public  
**Description**: Get specific parking space by ID

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid-parking-id",
    "name": "Downtown Parking Hub",
    "rating": 4.5,
    "distanceKm": 0.5,
    "isOpen": true,
    "availabilityText": "45/100 spots available",
    "hourlyRate": 5.99,
    "convenienceFee": 2.0
  }
}
```

---

## 3. Booking Endpoints

### POST /booking
**Scope**: Protected  
**Description**: Create a new booking

**Request Body**:
```json
{
  "parkingId": "uuid-parking-id",
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

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid-booking-id",
    "userId": "uuid-user-id",
    "parkingId": "uuid-parking-id",
    "tokenNo": "TOKEN-1705326600000",
    "totalAmount": 25.96
  }
}
```

---

### GET /booking/history/user
**Scope**: Protected  
**Description**: Get user's booking history

**Response** (200):
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "uuid-booking-id",
        "parkingId": "uuid-parking-id",
        "totalAmount": 25.96,
        "arrivalDateISO": "2024-01-20T14:30:00Z",
        "createdAtISO": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

### GET /booking/:id
**Scope**: Protected  
**Description**: Get booking details

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid-booking-id",
    "parkingId": "uuid-parking-id",
    "totalAmount": 25.96
  }
}
```

---

### DELETE /booking/:id
**Scope**: Protected  
**Description**: Cancel a booking

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "Booking cancelled successfully"
  }
}
```

---

## Summary: 11 Endpoints (10 Required + 1 Bonus)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /auth/otp/request | No | Request login OTP |
| POST | /auth/otp/verify | No | Verify OTP & login |
| GET | /auth/me | Yes | Get user profile |
| PUT | /auth/profile | Yes | Update profile |
| GET | /parking | No | List all parking |
| GET | /parking/:id | No | Get parking details |
| POST | /booking | Yes | Create booking |
| GET | /booking/history/user | Yes | Get user bookings |
| GET | /booking/:id | Yes | Get booking details |
| DELETE | /booking/:id | Yes | Cancel booking |

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Requirements:**
- Email must be valid format
- Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Email must be unique

**Errors:**
- 400: Invalid email format
- 400: Password too weak
- 409: User already exists

---

### 2. Login with Email
**Endpoint:** `POST /auth/login`

**Description:** Login user with email and password

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+91XXXXXXXXXX",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Errors:**
- 400: Email and password required
- 401: Invalid email or password

---

### 3. Request OTP (Phone Login)
**Endpoint:** `POST /auth/otp/request`

**Description:** Request OTP for phone-based login

**Request Body:**
```json
{
  "phoneNumber": "+919876543210"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "message": "OTP sent to +919876543210"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Development Note:** OTP is logged to console (remove in production)

**Requirements:**
- Valid Indian phone number (10 digits starting with 6-9)
- Can be with or without country code

**Errors:**
- 400: Phone number required
- 400: Invalid phone number format

---

### 4. Verify OTP & Login
**Endpoint:** `POST /auth/otp/verify`

**Description:** Verify OTP and login user

**Request Body:**
```json
{
  "phoneNumber": "+919876543210",
  "otp": "1234"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP verified and login successful",
  "data": {
    "user": {
      "id": "uuid",
      "phoneNumber": "+919876543210",
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@example.com",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Requirements:**
- OTP valid for 10 minutes
- 4-6 digit OTP format

**Errors:**
- 400: Phone number and OTP required
- 400: Invalid OTP format
- 401: Invalid OTP
- 401: OTP expired
- 404: User not found

---

## User APIs

### 5. Get Current User Profile
**Endpoint:** `GET /auth/me`

**Description:** Get current authenticated user profile

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile fetched successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "phoneNumber": "+919876543210",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "isPhoneVerified": true,
    "isEmailVerified": false,
    "createdAt": "2024-01-10T10:00:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Errors:**
- 401: Missing or invalid token

---

### 6. Update User Profile
**Endpoint:** `PATCH /auth/profile`

**Description:** Update user profile information

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile updated successfully",
  "data": {
    "id": "uuid",
    "email": "jane@example.com",
    "phoneNumber": "+919876543210",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "USER"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Errors:**
- 401: Missing or invalid token
- 404: User not found

---

## Parking Space APIs

### 7. Create Parking Space
**Endpoint:** `POST /parking-space`

**Description:** Create a new parking space

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Mall Parking - Level 1",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "lenderId": "uuid"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Parking space created successfully",
  "data": {
    "id": "uuid",
    "name": "Mall Parking - Level 1",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 8. Get Parking Space Availability
**Endpoint:** `GET /parking-space/:parkingSpaceId/availability`

**Description:** Get availability for a specific parking space

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Availability fetched successfully",
  "data": {
    "parkingSpaceId": "uuid",
    "totalSlots": 50,
    "availableSlots": 12,
    "occupiedSlots": 38,
    "slotsByType": {
      "TWO_WHEELER": {
        "total": 20,
        "available": 5,
        "occupied": 15
      },
      "FOUR_WHEELER": {
        "total": 30,
        "available": 7,
        "occupied": 23
      }
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Booking APIs

### 9. Create Booking
**Endpoint:** `POST /booking`

**Description:** Create a new parking booking

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "parkingSpaceId": "parking-space-uuid",
  "vehicleType": "FOUR_WHEELER",
  "vehicleNumber": "DL01AB1234"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "bookingId": "uuid",
    "slotNumber": "A12",
    "expiresInMinutes": 30,
    "status": "RESERVED"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Notes:**
- Default reservation time: 30 minutes
- Slot is held during this period

**Errors:**
- 400: No available slots
- 404: Parking space not found
- 401: User not authenticated

---

### 10. Get Booking by ID
**Endpoint:** `GET /booking/:bookingId`

**Description:** Get booking details

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking fetched successfully",
  "data": {
    "id": "uuid",
    "slotNumber": "A12",
    "vehicleType": "FOUR_WHEELER",
    "vehicleNumber": "DL01AB1234",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "parkingSpace": {
      "id": "uuid",
      "name": "Mall Parking",
      "location": { "latitude": 28.6139, "longitude": 77.2090 }
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 11. Get User's Bookings
**Endpoint:** `GET /user/:userId/booking`

**Description:** Get all bookings for a user

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bookings fetched successfully",
  "data": [
    {
      "id": "uuid",
      "slotNumber": "A12",
      "vehicleNumber": "DL01AB1234",
      "status": "COMPLETED",
      "createdAt": "2024-01-15T09:00:00.000Z"
    },
    {
      "id": "uuid",
      "slotNumber": "B5",
      "vehicleNumber": "HR26CD9876",
      "status": "ACTIVE",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 12. Get Bookings by Parking Space
**Endpoint:** `GET /parkingSpace/:parkingSpaceId/booking`

**Description:** Get all bookings for a parking space

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bookings fetched successfully",
  "data": [
    {
      "id": "uuid",
      "slotNumber": "A12",
      "vehicleNumber": "DL01AB1234",
      "status": "ACTIVE",
      "user": { "id": "uuid", "phoneNumber": "+919876543210" }
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Entry/Exit APIs

### 13. Record Parking Entry
**Endpoint:** `POST /parking-entry`

**Description:** Record vehicle entry into parking

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "bookingId": "uuid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Entry recorded successfully",
  "data": {
    "entryTime": "2024-01-15T10:30:00.000Z",
    "bookingId": "uuid",
    "status": "ACTIVE"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 14. Record Parking Exit
**Endpoint:** `POST /parking-exit`

**Description:** Record vehicle exit from parking

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "bookingId": "uuid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Exit recorded successfully",
  "data": {
    "exitTime": "2024-01-15T10:35:00.000Z",
    "bookingId": "uuid",
    "durationMinutes": 5,
    "fee": 10,
    "status": "COMPLETED"
  },
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Error Handling

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |
| 503 | Service Unavailable - Database connection failed |

### Common Error Messages
- `"Missing Authorization header"` - No Bearer token provided
- `"Invalid or expired token"` - Token is invalid or expired
- `"Phone number is required"` - Missing required field
- `"Invalid email format"` - Email validation failed
- `"No available slots"` - All spaces occupied
- `"User not found"` - User doesn't exist
- `"Service unavailable"` - Database is not connected

---

## Authentication

All endpoints except `/auth/register`, `/auth/login`, `/auth/otp/request`, and `/auth/otp/verify` require authentication.

**How to authenticate:**
1. Get token from login or registration
2. Include in Authorization header: `Authorization: Bearer <token>`
3. Token valid for 7 days (configurable in JWT_EXPIRY)

---

## Rate Limiting
Currently not implemented. Can be added using `express-rate-limit` middleware if needed.

---

## Pagination
Currently not implemented. Can be added to list endpoints if needed.

---

## Webhooks
Can be implemented for real-time notifications on booking status changes.

---

## SDK/Libraries
Consider creating SDKs for:
- React Native (Frontend)
- JavaScript/TypeScript (Web)
- Flutter (Future mobile)
