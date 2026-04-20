# MOOFU Parking Backend API

[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express-5.2-000000?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)
[![TypeORM](https://img.shields.io/badge/TypeORM-0.3-orange)](https://typeorm.io/)
[![JWT](https://img.shields.io/badge/JWT-9.0-red)](https://jwt.io/)

Complete REST API backend for MOOFU Parking Management System - a mobile-first parking solution with real-time availability tracking, OTP-based authentication, and booking management.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Configure database and JWT_SECRET in .env

# 4. Start development server
npm run dev

# 5. Server runs at http://localhost:5000
```

**API ready at:** `http://localhost:5000/api`  
**Health check:** `http://localhost:5000/health`

---

## 📁 Project Structure

```
src/
├── controller/              # API request handlers
│   ├── auth.controller.ts   # Authentication endpoints
│   ├── booking.controller.ts
│   ├── parkingSpace.controller.ts
│   └── ...
├── services/                # Business logic layer
│   ├── authService.ts       # Auth logic (login, register, OTP)
│   ├── booking.service.ts
│   └── ...
├── routes/                  # API route definitions
│   ├── auth.routes.ts       # Authentication routes
│   ├── booking.routes.ts
│   └── ...
├── entities/                # Database models
│   ├── User.ts              # User model with password hashing
│   ├── Booking.ts
│   ├── ParkingSpace.ts
│   └── ...
├── middleware/              # Express middleware
│   ├── auth.middleware.ts   # JWT authentication
│   ├── dbCheck.middleware.ts
│   └── ...
├── config/                  # Configuration
│   └── data-source.ts       # TypeORM database setup
├── utils/                   # Helper functions
│   ├── validators.ts        # Input validation
│   ├── response.ts          # Response formatting
│   └── ...
├── jobs/                    # Background jobs
│   └── bookingExpiry.job.ts
├── server.ts                # Express app setup
└── constants.js             # App constants
```

---

## ✨ Key Features

### 🔐 Authentication
- **Email/Password Registration & Login** with secure bcrypt hashing
- **OTP-based Phone Authentication** (SMS integration ready)
- **JWT Token Management** (7-day expiry, configurable)
- **User Profile Management** (update name, email)
- **Role-based Access Control** (USER, ADMIN)

### 🅿️ Parking Management
- **Parking Space Creation** with geolocation support
- **Real-time Slot Availability** tracking per vehicle type
- **Booking Management** (create, view, cancel)
- **Entry/Exit Logging** with automated fee calculation
- **Nearby Parking Search** using coordinates

### 🔔 Notifications
- **Background Jobs** for booking expiry management
- **Event Logging** (BOOKED, ENTRY, EXIT, EXPIRED, CANCELLED)
- **SMS/WhatsApp Integration Ready** (Twilio)

### 🛡️ Security
- **Password Hashing** with bcryptjs (10-round salt)
- **JWT Authentication** for all protected routes
- **Input Validation** (email, phone, OTP, vehicle number)
- **CORS Configuration** for frontend integration
- **Error Handling** without exposing sensitive info
- **Rate Limiting Ready** (can be added with express-rate-limit)

### 📊 Database
- **TypeORM ORM** for type-safe queries
- **PostgreSQL** database with migrations support
- **Automatic Schema Synchronization** in development
- **Entity Relations** (User → Bookings → Slots → Spaces)
- **Timestamps** (createdAt, updatedAt) on all entities

---

## 📖 API Documentation

### Core Endpoints

#### Authentication
```
POST   /api/auth/register              Register new user
POST   /api/auth/login                 Login with email/password
POST   /api/auth/otp/request           Request OTP for phone
POST   /api/auth/otp/verify            Verify OTP and login
GET    /api/auth/me                    Get current user profile
PATCH  /api/auth/profile               Update user profile
```

#### Parking Spaces
```
POST   /api/parking-space              Create parking space
GET    /api/parking-space/:id           Get space details
GET    /api/parking-space/:id/availability  Get slot availability
```

#### Bookings
```
POST   /api/booking                    Create booking
GET    /api/booking/:id                Get booking details
GET    /api/user/:userId/booking       Get user's bookings
GET    /api/parkingSpace/:spaceId/booking  Get space's bookings
```

#### Entry/Exit
```
POST   /api/parking-entry              Record vehicle entry
POST   /api/parking-exit               Record vehicle exit
```

**Full API Documentation:** See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🔧 Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 16+ | JavaScript runtime |
| TypeScript | 5.9 | Type-safe JavaScript |
| Express.js | 5.2 | Web framework |
| TypeORM | 0.3 | ORM for database |
| PostgreSQL | 12+ | Primary database |
| JWT | 9.0 | Authentication tokens |
| bcryptjs | 3.0 | Password hashing |
| dotenv | 17.2 | Environment variables |
| CORS | 2.8 | Cross-origin requests |
| node-cron | 4.2 | Background jobs |

---

## 🚦 Getting Started

### Prerequisites
- Node.js v16 or higher
- PostgreSQL 12 or higher
- npm or yarn
- (Optional) Postman for API testing

### Installation

#### 1. Clone & Navigate
```bash
cd d:\MOOFU\Parking_backend\parking-backend
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Setup Database
```bash
# Create PostgreSQL database
createdb moofu_parking

# Or using psql
psql -U postgres
CREATE DATABASE moofu_parking;
\q
```

#### 4. Configure Environment
```bash
# Copy example
cp .env.example .env

# Edit .env with your values
code .env
```

**Key configurations:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=moofu_parking
JWT_SECRET=your_super_secret_key_here (min 32 chars)
PORT=5000
```

#### 5. Start Server
```bash
npm run dev
```

**Expected output:**
```
✓ Server running on port 5000
✓ Base URL: http://localhost:5000
✓ Health check: http://localhost:5000/health

Initializing database connection...
✓ Database connected successfully

✓ Background jobs started
```

---

## 🧪 Testing

### Using Postman
1. Import `POSTMAN_COLLECTION.json`
2. Set environment variable: `BASE_URL=http://localhost:5000/api`
3. Run authentication tests first (to get TOKEN)
4. Use TOKEN for protected endpoints

### Using cURL
```bash
# Health check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}'
```

### Using JavaScript
```javascript
const BASE = 'http://localhost:5000/api';

// Register
const res = await fetch(`${BASE}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'SecurePass123'
  })
});

const data = await res.json();
const token = data.data.token;

// Get current user
const userRes = await fetch(`${BASE}/auth/me`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Detailed Testing Guide:** See [SETUP_AND_TESTING_GUIDE.md](./SETUP_AND_TESTING_GUIDE.md)

---

## 🔑 Authentication

### JWT Workflow
1. User registers/logs in
2. Backend returns `token`
3. Client stores token (localStorage/AsyncStorage)
4. For protected routes, send: `Authorization: Bearer <token>`
5. Backend verifies token and processes request

### Token Details
- **Algorithm:** HS256
- **Expiry:** 7 days (configurable)
- **Payload:** `{ userId: string, iat: number, exp: number }`
- **Verification:** Done in `auth.middleware.ts`

### Sample Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOiI1ZTkwZDVjYjUxNmYyNjAwMTI5YzA4MjIiLCJpYXQiOjE3MDUzMDAwMDAsImV4cCI6MTcwNTkwNDgwMH0.
AbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnOp
```

---

## 📝 API Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "user": { "id": "...", "email": "..." }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error
```json
{
  "success": false,
  "message": "Error description",
  "errors": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |
| 503 | Service Unavailable |

---

## 🗄️ Database Schema

### Users Table
```sql
- id (UUID, PK)
- phoneNumber (VARCHAR, unique, nullable)
- email (VARCHAR, unique)
- password (VARCHAR, hashed)
- firstName, lastName
- role (ENUM: USER, ADMIN)
- isEmailVerified, isPhoneVerified
- otp, otpExpiry
- createdAt, updatedAt
```

### Parking Spaces Table
```sql
- id (UUID, PK)
- name (VARCHAR)
- latitude, longitude (DECIMAL)
- lender (FK to Lender)
- isOccupied (BOOLEAN)
- createdAt
```

### Bookings Table
```sql
- id (UUID, PK)
- user (FK to User)
- parkingSpace (FK to Parking Space)
- slot (FK to Parking Slot)
- vehicleType, vehicleNumber
- status (ENUM: RESERVED, ACTIVE, EXPIRED, COMPLETED, CANCELLED)
- fee (DECIMAL, nullable)
- createdAt
```

### Parking Slots Table
```sql
- id (UUID)
- parkingSpace (FK)
- slotNumber (VARCHAR)
- slotType (VARCHAR)
- isOccupied (BOOLEAN)
```

---

## 🛠️ Development

### Build
```bash
npm run build
```

Outputs compiled JavaScript to `dist/` directory.

### Format Code
```bash
npm run format
```

Uses Prettier for consistent code style.

### Development with Auto-Reload
```bash
npm run dev
```

Uses nodemon to restart on file changes.

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Run Production Build
```bash
npm start
```

### Environment Setup for Production
```env
NODE_ENV=production
JWT_SECRET=strong_random_key_min_32_chars
DB_HOST=production_db_host
DB_PASSWORD=strong_password
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=error
```

### Deploy on Render.com
1. Connect GitHub repository
2. Create Web Service
3. Add environment variables
4. Deploy

### Deploy on Railway/Heroku/AWS
Similar setup with appropriate build commands.

---

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
psql -U postgres

# Verify credentials in .env
cat .env | grep DB_

# Check port availability
netstat -ano | findstr :5432  # Windows
```

### Port Already in Use
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>
```

### JWT Secret Error
```env
JWT_SECRET=min_32_characters_long_random_string_here
```

### TypeScript Build Error
```bash
npm run build
# Check error messages and fix imports
```

**More help:** See [SETUP_AND_TESTING_GUIDE.md - Troubleshooting](./SETUP_AND_TESTING_GUIDE.md#troubleshooting)

---

## 📚 Documentation

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference
- **[SETUP_AND_TESTING_GUIDE.md](./SETUP_AND_TESTING_GUIDE.md)** - Installation & testing
- **[POSTMAN_COLLECTION.json](./POSTMAN_COLLECTION.json)** - Postman import file

---

## 🔒 Security Considerations

### Implemented
✅ Password hashing (bcryptjs, 10-round salt)  
✅ JWT token authentication  
✅ Input validation and sanitization  
✅ CORS configuration  
✅ Error handling (no sensitive info leaked)  
✅ Environment variable protection  

### To Add (Future)
⏳ Rate limiting  
⏳ Request logging  
⏳ Sentry error tracking  
⏳ Database query logging  
⏳ API key management  
⏳ Two-factor authentication  

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit pull request

---

## 📋 Changelog

### Version 1.0.0 (2024-01-15)
- ✅ Complete authentication system (email/password + OTP)
- ✅ User profile management
- ✅ Parking space and booking management
- ✅ Entry/exit logging
- ✅ JWT-based authentication
- ✅ TypeORM database integration
- ✅ Comprehensive API documentation
- ✅ Postman collection
- ✅ Setup and testing guide

---

## 📞 Support

For issues or questions:
1. Check [SETUP_AND_TESTING_GUIDE.md](./SETUP_AND_TESTING_GUIDE.md)
2. Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
3. Check server console logs for detailed errors
4. Create an issue with server logs and steps to reproduce

---

## 📄 License

ISC

---

## 🎯 Roadmap

- [ ] Rate limiting
- [ ] Request/response caching
- [ ] Sentry error tracking
- [ ] Advanced analytics
- [ ] SMS/WhatsApp notifications
- [ ] Payment integration
- [ ] Review system
- [ ] Admin dashboard API
- [ ] Subscription management
- [ ] Multi-language support

---

**Built with ❤️ for better parking management**

---

## Quick Links

- **Server:** http://localhost:5000
- **API Base:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health
- **Docs:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Testing:** [SETUP_AND_TESTING_GUIDE.md](./SETUP_AND_TESTING_GUIDE.md)

---

**Last Updated:** January 15, 2024  
**Status:** ✅ Production Ready (with ongoing improvements)
