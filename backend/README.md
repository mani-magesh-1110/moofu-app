# MOOFU Backend API

Express.js + PostgreSQL backend for MOOFU parking management platform.

## 🏗 Architecture

```
src/
├── controllers/        # HTTP request handlers
├── services/           # Business logic layer
├── repositories/       # Database access layer
├── models/             # Data models
├── routes/             # API route definitions
├── middleware/         # Express middleware (auth, validation, logging)
├── config/             # Configuration (database, environment)
└── utils/              # Utilities (logging, validation, helpers)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 14+
- npm

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create Environment File**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize Database**
   ```bash
   npm run db:init
   ```
   This will:
   - Create the PostgreSQL database
   - Initialize all tables
   - Create indexes and constraints

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

## 📋 Available Scripts

```bash
npm run dev              # Start development server with hot reload
npm start               # Start production server
npm run db:init         # Initialize database schema
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
npm run test:api        # Run API integration tests
```

## 🔌 API Endpoints

### Authentication (No Auth Required)
```
POST   /api/auth/otp/request          # Request OTP for phone
POST   /api/auth/otp/verify           # Verify OTP and get token
GET    /api/auth/me                   # Get profile (requires token)
PUT    /api/auth/profile              # Update profile (requires token)
```

### Parking Stations (No Auth Required)
```
GET    /api/parking                   # List all stations
GET    /api/parking/:id               # Get station details
GET    /api/parking/search/area       # Search by area
GET    /api/parking/nearby            # Find nearby stations
POST   /api/parking                   # Create station (admin only)
```

### Parking Slots (No Auth Required)
```
GET    /api/slots/:stationId/availability     # Check availability
POST   /api/slots/:stationId                  # Add slots (admin only)
```

### Bookings (Auth Required)
```
POST   /api/booking                   # Create booking
GET    /api/booking/history/user      # Get user's bookings
GET    /api/booking/:id               # Get booking details
DELETE /api/booking/:id               # Cancel booking
```

### Admin (Auth + Admin Role Required)
```
POST   /api/admin/stations/onboard           # Add parking station
POST   /api/admin/stations/:id/slots         # Add slots to station
```

## 🔐 Authentication

The API uses **JWT (JSON Web Tokens)** for authentication.

### OTP-Based Login Flow
1. User calls `/api/auth/otp/request` with phone number
2. OTP is sent to user (in dev, use `DEV_OTP_CODE`)
3. User calls `/api/auth/otp/verify` with phone and OTP
4. Server returns JWT token
5. Client stores token in AsyncStorage
6. Client includes token in Authorization header: `Bearer <token>`

### Token Expiration
- Tokens expire after 7 days (configurable via `JWT_EXPIRES_IN`)
- Expired tokens return 401 Unauthorized
- Client should request new OTP and re-authenticate

## 🗄 Database Schema

### users
```sql
- id: UUID (primary key)
- phone_number: VARCHAR (unique)
- email: VARCHAR (unique, optional)
- name: VARCHAR
- password_hash: TEXT
- role: VARCHAR ('admin' or 'customer')
- location: VARCHAR
- vehicle_number: VARCHAR
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### parking_stations
```sql
- id: UUID (primary key)
- name: VARCHAR
- area: VARCHAR
- address: TEXT
- latitude: DOUBLE PRECISION
- longitude: DOUBLE PRECISION
- hourly_rate: NUMERIC(10,2)
- convenience_fee: NUMERIC(10,2)
- total_spots: INTEGER
- created_by: UUID (foreign key to users)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### parking_slots
```sql
- id: UUID (primary key)
- station_id: UUID (foreign key)
- slot_number: VARCHAR
- vehicle_type: VARCHAR ('car' or 'bike')
- is_available: BOOLEAN (default TRUE)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### bookings
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- station_id: UUID (foreign key)
- slot_id: UUID (foreign key)
- vehicle_type: VARCHAR ('car' or 'bike')
- vehicle_number: VARCHAR
- arrival_at: TIMESTAMPTZ
- departure_at: TIMESTAMPTZ (nullable until checkout)
- duration_hours: INTEGER
- estimated_subtotal: NUMERIC(10,2)
- convenience_fee: NUMERIC(10,2)
- total_amount: NUMERIC(10,2)
- payment_method_id: VARCHAR
- status: VARCHAR ('confirmed' or 'cancelled')
- cancelled_at: TIMESTAMPTZ (nullable)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### otp_codes
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- code: VARCHAR
- expires_at: TIMESTAMPTZ
- attempts: INTEGER (default 0)
- created_at: TIMESTAMPTZ
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm test -- --testNamePattern="Auth"
npm test -- src/__tests__/parking.test.js
```

### Generate Coverage Report
```bash
npm run test:coverage
```

### Test Without Database
Tests use in-memory database when `NODE_ENV=test`, no PostgreSQL required.

## 🐳 Docker

### Build Docker Image
```bash
docker build -t moofu-backend:latest .
```

### Run Docker Container
```bash
docker run \
  -e DATABASE_URL="postgresql://user:password@db:5432/moofu" \
  -e JWT_SECRET="your-secret" \
  -p 5000:5000 \
  moofu-backend:latest
```

### Docker Compose (for development)
```bash
docker-compose up
```

## 🔧 Configuration

### Environment Variables
See `.env.example` for all available options.

Key variables:
- `NODE_ENV` - Environment (development, production, test)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for signing JWTs
- `OTP_TTL_MINUTES` - How long OTP is valid

## 📝 Error Handling

All errors return consistent JSON format:
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

Common Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

## 🚀 Deployment

### On Render.com
1. Connect GitHub repository
2. Add environment variables in Render dashboard
3. Add PostgreSQL database
4. Deploy

### On Railway.app
1. Create new project
2. Add PostgreSQL plugin
3. Add GitHub repository
4. Set environment variables
5. Deploy

### On Heroku
```bash
heroku create moofu-backend
heroku addons:create heroku-postgresql:standard-0
git push heroku main
```

## 🔍 Logging

The app uses Winston for logging. Logs are written to:
- Console (all levels in development)
- `./logs/` directory (production)

Log levels: error, warn, info, debug

## 🆘 Troubleshooting

### Database Connection Error
```
Error: password authentication failed for user "postgres"
```
**Solution:** Check DATABASE_URL in .env file

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change PORT in .env or kill process using port 5000

### Tests Failing
- Ensure NODE_ENV=test when running tests
- Check all dependencies are installed
- Clear jest cache: `npx jest --clearCache`

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/)
- [Jest Testing](https://jestjs.io/)

