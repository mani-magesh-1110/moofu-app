# MOOFU Parking Backend - Setup & Testing Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Database Setup](#database-setup)
4. [Configuration](#configuration)
5. [Running the Backend](#running-the-backend)
6. [API Testing](#api-testing)
7. [Troubleshooting](#troubleshooting)
8. [Deployment](#deployment)

---

## Prerequisites

### Required Software
- **Node.js** v16 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **PostgreSQL** database ([Download](https://www.postgresql.org/download/))
- **Postman** for API testing ([Download](https://www.postman.com/downloads/))
- **Git** for version control ([Download](https://git-scm.com/))

### Verify Installation
```bash
node --version      # Should be v16+
npm --version       # Should be v7+
postgres --version  # Should be 12+
```

---

## Installation

### Step 1: Clone and Navigate to Backend
```bash
cd d:\MOOFU\Parking_backend\parking-backend
```

### Step 2: Install Dependencies
```bash
npm install
```

**Expected output:**
```
added 150 packages in 45s
```

### Step 3: Verify Installation
```bash
npm list
```

Should show all dependencies installed without errors.

---

## Database Setup

### Option A: Local PostgreSQL Setup (Recommended for Development)

#### 1. Create Database
```bash
# Open PostgreSQL command line
psql -U postgres

# Or use GUI tool like pgAdmin
```

#### 2. Create Database and User
```sql
-- Create database
CREATE DATABASE moofu_parking;

-- Create user
CREATE USER moofu_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE moofu_parking TO moofu_user;

-- Exit
\q
```

#### 3. Verify Connection
```bash
psql -U moofu_user -d moofu_parking -h localhost
```

### Option B: MongoDB Atlas Cloud (Alternative)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster
3. Get connection string
4. Update DB credentials in `.env`

---

## Configuration

### Step 1: Create .env File
```bash
# Navigate to backend directory
cd d:\MOOFU\Parking_backend\parking-backend

# Copy example
cp .env.example .env

# Or on Windows Command Prompt
copy .env.example .env
```

### Step 2: Update .env with Your Values
```bash
# Open .env in your editor
code .env
```

**Configure these fields:**

```env
# Server
PORT=5000
NODE_ENV=development

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=moofu_user
DB_PASSWORD=your_secure_password
DB_NAME=moofu_parking

# JWT (Generate a strong random key)
JWT_SECRET=your_strong_random_key_minimum_32_characters_change_this
JWT_EXPIRY=7d

# URLs
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:19000

# Logging
LOG_LEVEL=debug
```

### Step 3: Generate JWT Secret (Optional but Recommended)
```bash
# Generate random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use the output as your `JWT_SECRET`.

---

## Running the Backend

### Development Mode
```bash
npm run dev
```

**Expected Output:**
```
✓ Server running on port 5000
✓ Base URL: http://localhost:5000
✓ Health check: http://localhost:5000/health

Initializing database connection...
✓ Database connected successfully

✓ Background jobs started
```

### Production Build
```bash
# Build TypeScript
npm run build

# Start server
npm start
```

### Check Server Health
Open in browser: `http://localhost:5000/health`

**Expected Response:**
```json
{
  "status": "healthy",
  "message": "Parking Backend API",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## API Testing

### Using Postman

#### Step 1: Import Collection
1. Open Postman
2. Click **Import**
3. Select `POSTMAN_COLLECTION.json` file
4. Collection will be imported

#### Step 2: Set Environment Variables
1. Click **Environments** (gear icon)
2. Create new environment: `MOOFU_Dev`
3. Add variables:
   - `BASE_URL`: `http://localhost:5000/api`
   - `TOKEN`: (will be set after login)
   - `USER_ID`: (will be updated as needed)
   - `PARKING_SPACE_ID`: (will be updated as needed)

#### Step 3: Test Authentication

##### Test 1: Register User
```
POST /auth/register

Body:
{
  "email": "testuser@example.com",
  "password": "TestPass123",
  "firstName": "Test",
  "lastName": "User"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "testuser@example.com",
      "firstName": "Test",
      "lastName": "User",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Save token:** Update `TOKEN` variable with returned token.

---

##### Test 2: Get Current User
```
GET /auth/me

Headers:
Authorization: Bearer {{TOKEN}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "User profile fetched successfully",
  "data": {
    "id": "user-uuid",
    "email": "testuser@example.com",
    "firstName": "Test",
    "lastName": "User",
    "isPhoneVerified": false,
    "isEmailVerified": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

##### Test 3: Update Profile
```
PATCH /auth/profile

Headers:
Authorization: Bearer {{TOKEN}}

Body:
{
  "firstName": "Updated",
  "lastName": "Name"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "User profile updated successfully",
  "data": {
    "id": "user-uuid",
    "email": "testuser@example.com",
    "firstName": "Updated",
    "lastName": "Name",
    "role": "USER"
  }
}
```

---

#### Step 4: Test Phone OTP Flow

##### Test 1: Request OTP
```
POST /auth/otp/request

Body:
{
  "phoneNumber": "+919876543210"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "message": "OTP sent to +919876543210"
  }
}
```

**Note:** OTP is printed to server console in development.

---

##### Test 2: Verify OTP
```
POST /auth/otp/verify

Body:
{
  "phoneNumber": "+919876543210",
  "otp": "1234"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "OTP verified and login successful",
  "data": {
    "user": {
      "id": "user-uuid",
      "phoneNumber": "+919876543210",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

#### Step 5: Test Email/Password Login

##### Test: Login
```
POST /auth/login

Body:
{
  "email": "testuser@example.com",
  "password": "TestPass123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "testuser@example.com",
      "firstName": "Test",
      "lastName": "User",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Using cURL

#### Test Health Check
```bash
curl http://localhost:5000/health
```

#### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

#### Test Get User (with token)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Using Node.js/JavaScript

```javascript
// test-api.js
const BASE_URL = 'http://localhost:5000/api';

// Register
async function register() {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'SecurePass123',
      firstName: 'John',
      lastName: 'Doe'
    })
  });
  
  const data = await response.json();
  console.log('Register Response:', data);
  return data.data.token;
}

// Get current user
async function getCurrentUser(token) {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log('Current User:', data);
}

// Run
(async () => {
  const token = await register();
  await getCurrentUser(token);
})();
```

Run with:
```bash
node test-api.js
```

---

## Troubleshooting

### Issue 1: Database Connection Failed

**Error:** `PostgreSQL connection refused`

**Solutions:**
1. Check PostgreSQL is running
2. Verify credentials in `.env`
3. Check port number (default: 5432)
4. Run: `psql -U postgres -h localhost`

---

### Issue 2: Port Already in Use

**Error:** `Error: listen EADDRINUSE :::5000`

**Solutions:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Kill process
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Mac/Linux

# Or change PORT in .env
```

---

### Issue 3: JWT Secret Not Set

**Error:** `Cannot use undefined as JWT secret`

**Solution:**
```bash
# Set JWT_SECRET in .env
JWT_SECRET=your_secret_key_here_min_32_chars
```

---

### Issue 4: Module Not Found

**Error:** `Cannot find module 'express'`

**Solutions:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

### Issue 5: TypeScript Errors

**Error:** `src/entities/*.ts errors`

**Solutions:**
```bash
# Clear build
npm run build

# Or start in dev mode
npm run dev
```

---

## Deployment

### Prepare for Production

1. **Update .env:**
```env
NODE_ENV=production
JWT_SECRET=production_secret_change_this_to_strong_key
DB_HOST=production_database_host
DB_PASSWORD=strong_production_password
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=error
```

2. **Build:**
```bash
npm run build
```

3. **Test Build:**
```bash
npm start
```

### Deploy to Render.com (Recommended)

1. **Connect GitHub Repository**
   - Push code to GitHub
   - Link repository in Render dashboard

2. **Create New Web Service**
   - Connect GitHub repo
   - Build command: `npm run build`
   - Start command: `npm start`

3. **Add Environment Variables**
   - Copy all from `.env` to Render environment variables

4. **Connect Database**
   - Add PostgreSQL service
   - Link database URL to environment

### Deploy to AWS/Heroku/Railway

Similar process - set build and start commands, add environment variables.

---

## Testing Checklist

- [ ] Server starts without errors
- [ ] Health check endpoint responds `healthy`
- [ ] Can register new user
- [ ] Can login with email/password
- [ ] Can request and verify OTP
- [ ] Can get current user profile
- [ ] Can update user profile
- [ ] All responses have correct format
- [ ] Invalid requests return proper error codes
- [ ] JWT token validation works
- [ ] CORS is properly configured
- [ ] Database is persisting data

---

## Performance Monitoring

### Check Database
```bash
# Connect to database
psql -U moofu_user -d moofu_parking

# List tables
\dt

# Check user count
SELECT COUNT(*) FROM users;

# Check recent bookings
SELECT * FROM booking ORDER BY "createdAt" DESC LIMIT 10;
```

### Check Server Logs
```bash
npm run dev  # Logs in development mode
```

---

## Next Steps

1. ✅ Setup backend locally
2. ✅ Test all authentication APIs
3. ⬜ Connect frontend to backend
4. ⬜ Implement remaining features
5. ⬜ Setup error tracking (Sentry)
6. ⬜ Deploy to production
7. ⬜ Setup monitoring & alerts

---

## Support & Resources

- **API Documentation:** See `API_DOCUMENTATION.md`
- **TypeORM Docs:** https://typeorm.io/
- **Express Docs:** https://expressjs.com/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **JWT Guide:** https://jwt.io/introduction

---

## Quick Reference Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Format code
npm run format

# Test specific API
curl http://localhost:5000/health
```

---

## Contact & Issues

For issues or questions:
1. Check this guide's Troubleshooting section
2. Review API Documentation
3. Check server logs for detailed errors
4. Report issues with server logs and steps to reproduce

---

**Last Updated:** January 2024  
**Version:** 1.0.0
