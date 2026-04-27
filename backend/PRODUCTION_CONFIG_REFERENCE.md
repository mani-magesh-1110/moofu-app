# Production Backend Configuration Guide

## Quick Start (Development)

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env

# 3. Initialize database (requires PostgreSQL running)
npm run db:init

# 4. Start development server
npm run dev

# Server runs on http://localhost:5000
# Health check: http://localhost:5000/health
```

## Environment Configuration

### Development (.env)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/moofu
JWT_SECRET=dev_secret_key_min_32_chars_required
JWT_EXPIRES_IN=7d
ADMIN_SIGNUP_SECRET=local_admin_secret
OTP_TTL_MINUTES=5
DEV_OTP_CODE=1234
OTP_MAX_ATTEMPTS=5
SUPPRESS_LOGS=false
```

### Production (.env.production)
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@prod-host:5432/moofu_prod
JWT_SECRET=prod_secret_must_be_strong_random_32plus_chars
JWT_EXPIRES_IN=7d
ADMIN_SIGNUP_SECRET=secure_admin_key_for_production
OTP_TTL_MINUTES=5
OTP_MAX_ATTEMPTS=5
SUPPRESS_LOGS=false
```

## Database Configuration

### Local PostgreSQL
```
Host: localhost
Port: 5432
User: postgres
Password: (set during installation)
Database: moofu (dev) or moofu_prod (prod)
```

### Railway PostgreSQL
```
Connection string provided in Railway dashboard
Format: postgresql://username:password@container.railway.internal:5432/dbname
```

### Render PostgreSQL
```
Connection string provided in Render dashboard
Format: postgresql://username:password@dpg-xxxxx.render-postgres.com:5432/dbname
```

## Database Schema

### Tables Created

1. **users** - User accounts (customer & admin)
   - Columns: id, name, email, phone_number, password_hash, role, location, vehicle_number, created_at, updated_at

2. **parking_stations** - Parking lots/spaces
   - Columns: id, name, area, address, latitude, longitude, hourly_rate, convenience_fee, total_spots, created_by, created_at, updated_at

3. **parking_slots** - Individual parking spots
   - Columns: id, station_id, slot_number, vehicle_type (car/bike), is_available, created_at, updated_at

4. **bookings** - User parking reservations
   - Columns: id, user_id, station_id, slot_id, vehicle_type, vehicle_number, arrival_at, departure_at, duration_hours, estimated_subtotal, convenience_fee, total_amount, payment_method_id, status, cancelled_at, created_at, updated_at

5. **payments** - Payment records
   - Columns: id, booking_id, amount, method, status, provider_txn_id, created_at, updated_at

6. **otp_codes** - OTP verification codes
   - Columns: id, user_id, code, expires_at, attempts, created_at

## Security Features

### Rate Limiting
- **General**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 attempts per 15 minutes per IP
- **Response**: 429 Too Many Requests after limit exceeded

### Request Validation
- All endpoints validate input with Joi schemas
- Prevents SQL injection, XSS, and invalid data
- Returns 400 Bad Request with detailed error messages

### Authentication
- JWT token-based authentication
- Token includes: user ID, role, email
- Expiration: 7 days (configurable)
- Stored in Authorization header: `Bearer <token>`

### Security Headers (Helmet)
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- Referrer-Policy

## API Endpoints Reference

### Authentication (4 endpoints)
- `POST /api/auth/otp/request` - Request OTP code
- `POST /api/auth/otp/verify` - Verify OTP and get token
- `GET /api/auth/me` - Get current user (requires token)
- `PUT /api/auth/profile` - Update user profile (requires token)

### Parking Stations (4 endpoints)
- `GET /api/parking` - List all parking stations
- `GET /api/parking/:id` - Get station details
- `POST /api/parking` - Create new station (admin only)
- `GET /api/parking/search/area?area=Downtown` - Search by area
- `GET /api/parking/nearby?latitude=12.97&longitude=77.59&radiusKm=5` - Find nearby

### Bookings (4 endpoints)
- `POST /api/booking` - Create booking
- `GET /api/booking/history/user` - Get user's bookings
- `GET /api/booking/:id` - Get booking details
- `DELETE /api/booking/:id` - Cancel booking

### Health Check
- `GET /health` - Check API status (no auth required)

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm test -- auth.test.js
npm test -- parking.test.js
npm test -- booking.test.js
```

### Run with Coverage
```bash
npm run test:coverage
```

### Watch Mode (auto-rerun on changes)
```bash
npm run test:watch
```

### Legacy API Test (older test script)
```bash
npm run test:api
```

## NPM Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start with auto-reload (development) |
| `npm start` | Start production server |
| `npm test` | Run Jest integration tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:api` | Run legacy API tests |
| `npm run db:init` | Initialize database schema |

## Logging Configuration

### Log Levels
- **error**: Application errors (red)
- **warn**: Warnings/deprecations (yellow)
- **info**: General information (green)
- **http**: HTTP requests (magenta)
- **debug**: Detailed debug info (white)

### Log Files
- `logs/error.log` - Errors only
- `logs/all.log` - All logs

### Development Logs
- Console output (colorized)
- All log levels shown

### Production Logs
- File output only (JSON format recommended for parsing)
- Warning and error levels only
- Check logs with: `tail -f logs/all.log`

## Error Handling

### HTTP Error Status Codes
- **400 Bad Request** - Invalid input/validation failed
- **401 Unauthorized** - Missing or invalid token
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource doesn't exist
- **409 Conflict** - Duplicate entry (e.g., email)
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errorId": "error-id-for-server-logs" (500 errors only),
  "details": ["field: error message"] (validation errors)
}
```

### Example Errors

**Validation Error (400)**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "phoneNumber: Invalid phone number format",
    "name: Name must be at least 2 characters"
  ]
}
```

**Rate Limit (429)**
```json
{
  "success": false,
  "message": "Too many login attempts, please try again later."
}
```

**Server Error (500)**
```json
{
  "success": false,
  "message": "Internal Server Error",
  "errorId": "c8k9r2n3s5"
}
```

## Performance Optimization

### Database Indexes
Already created for:
- users.email
- users.phone_number
- parking_slots.station_id + slot_number (unique)
- Geospatial indexes on parking_stations (latitude, longitude)

### Connection Pooling
- Configured in db.js
- Pool size: 10 (default)
- Idle timeout: 30s

### Caching Headers
- Station listings: Cache-Control: max-age=300 (5 minutes)
- User data: Cache-Control: no-cache

## Deployment Checklist

- [ ] Database created and initialized
- [ ] Environment variables configured
- [ ] JWT_SECRET is strong (32+ chars, random)
- [ ] Rate limiting configured
- [ ] HTTPS enabled (automatic on Railway/Render)
- [ ] Health check endpoint working
- [ ] All 11 endpoints tested
- [ ] Error handling verified
- [ ] Logs configured
- [ ] Database backups scheduled
- [ ] Monitoring configured (optional)
- [ ] Admin user created

## Common Issues & Solutions

### Connection Refused Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
Solution:
1. Ensure PostgreSQL is running: pg_isrunning
2. Check DATABASE_URL is correct
3. Verify database exists: psql -l
```

### JWT Token Invalid
```
Error: 401 Unauthorized - Invalid token
Solution:
1. Verify JWT_SECRET matches deployment
2. Check token format: "Bearer <token>"
3. Ensure token not expired (7 days)
```

### Rate Limit Exceeded
```
Error: 429 Too Many Requests
Solution:
1. Wait 15 minutes for rate limit to reset
2. Adjust limits in src/app.js if needed
3. Use different IP/user for testing
```

### Validation Error
```
Error: 400 Bad Request - Validation failed
Solution:
1. Check request body format
2. Verify all required fields present
3. Match field types (string, number, date, etc.)
4. Review API documentation
```

## Monitoring Commands

### Check Health
```bash
curl http://localhost:5000/health
# Response: {"success":true,"status":"ok"}
```

### Check Database Connection
```bash
psql $DATABASE_URL -c "SELECT 1"
# Response: 1 (success)
```

### Count Users
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users"
```

### Recent Errors
```bash
tail -50 logs/error.log
```

### API Response Times
```bash
grep "ms)" logs/all.log | tail -20 | awk -F'(' '{print $2}' | sort -rn
```

## Next Steps

1. **Setup Database**: Run `npm run db:init`
2. **Test Locally**: Start with `npm run dev`
3. **Run Tests**: Execute `npm test`
4. **Deploy**: Follow DEPLOYMENT_PRODUCTION_GUIDE.md
5. **Monitor**: Check logs and metrics regularly

---

For detailed deployment instructions, see: **DEPLOYMENT_PRODUCTION_GUIDE.md**
