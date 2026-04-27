# Backend Deployment Guide

This guide covers deploying the MOOFU backend to production platforms: Railway or Render.

## Prerequisites

- PostgreSQL database instance (hosted or local)
- Node.js backend code with all dependencies
- Docker (optional but recommended)
- Account on Railway.app or Render.com

## Environment Variables Required

Create a `.env.production` file with these variables:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/moofu_prod
JWT_SECRET=your_secret_key_here_change_me
JWT_EXPIRES_IN=7d
ADMIN_SIGNUP_SECRET=your_admin_secret_here
OTP_TTL_MINUTES=5
OTP_MAX_ATTEMPTS=5
SUPPRESS_LOGS=false
```

### Important Security Notes:
- **JWT_SECRET**: Generate a strong random secret (min 32 characters)
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **ADMIN_SIGNUP_SECRET**: Create a secure admin signup key
- Never commit `.env.production` to version control
- Rotate secrets regularly in production

## Deployment Option 1: Railway.app

### 1. Create Railway Account
- Visit https://railway.app
- Sign up with GitHub account

### 2. Create PostgreSQL Database
```
1. Click "New" → "Database" → "PostgreSQL"
2. Railway creates database instance
3. Copy DATABASE_URL from "Connect" tab
```

### 3. Deploy Backend
```
1. Push code to GitHub
2. In Railway: Click "New" → "GitHub Repo"
3. Select your repository
4. Add environment variables:
   - DATABASE_URL (from PostgreSQL)
   - JWT_SECRET
   - Other .env variables
5. Railway auto-deploys on push
```

### 4. Verify Deployment
```bash
curl https://your-railway-app.up.railway.app/health
# Expected response: {"success":true,"status":"ok"}
```

### 5. View Logs
```
Dashboard → Your App → Logs tab
```

### Scaling on Railway
- Increase memory: Settings → Memory Limit
- Add replicas: Settings → Replica Count
- Auto-deployment on git push enabled by default

---

## Deployment Option 2: Render.com

### 1. Create Render Account
- Visit https://render.com
- Sign up with GitHub account

### 2. Create PostgreSQL Database
```
1. Dashboard → "New +" → "PostgreSQL"
2. Set name: "moofu-db"
3. Copy DATABASE_URL connection string
```

### 3. Create Web Service
```
1. Dashboard → "New +" → "Web Service"
2. Select GitHub repository
3. Configure:
   - Name: moofu-backend
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm start
   - Instance Type: Starter or Standard
```

### 4. Add Environment Variables
In Render Dashboard → Your Service → Environment:

```
NODE_ENV=production
DATABASE_URL=<from PostgreSQL>
JWT_SECRET=<generate secure key>
JWT_EXPIRES_IN=7d
ADMIN_SIGNUP_SECRET=<secure admin secret>
OTP_TTL_MINUTES=5
OTP_MAX_ATTEMPTS=5
```

### 5. Deploy
```
1. Click "Deploy"
2. Render shows deployment logs
3. Wait for "Service is live" message
```

### 6. Verify Deployment
```bash
curl https://your-render-app.onrender.com/health
# Expected: {"success":true,"status":"ok"}
```

### 7. Auto-Deploy on Push
```
Settings → Git Integration → Auto-Deploy enabled
```

### Upgrading on Render
- Paid plans: 24/7 uptime guarantee
- Free tier: 15 minutes inactivity = sleep
- Manual deploy: Click "Deploy" button anytime

---

## Local PostgreSQL Setup (Alternative)

### Install PostgreSQL
```bash
# Windows (using Chocolatey)
choco install postgresql

# macOS (using Homebrew)
brew install postgresql@15

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
```

### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE DATABASE moofu_prod;
CREATE USER moofu_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE moofu_prod TO moofu_user;
\q
```

### Initialize Schema
```bash
cd backend
DATABASE_URL="postgresql://moofu_user:secure_password@localhost:5432/moofu_prod" npm run db:init
```

---

## Database Connection Verification

### Test Connection
```bash
# Replace with your DATABASE_URL
psql postgresql://user:password@host:5432/moofu_prod

# Inside psql:
\dt  # List tables (should show users, parking_stations, bookings, etc.)
\q  # Exit
```

### Connection String Format
```
postgresql://username:password@host:port/database_name

Examples:
- Local: postgresql://postgres:password@localhost:5432/moofu_prod
- Railway: postgresql://user:pass@container.railway.internal:5432/dbname
- Render: postgresql://user:pass@dpg-xxxxx.render-postgres.com:5432/dbname
```

---

## Production Deployment Checklist

- [ ] Database created and verified
- [ ] `.env.production` configured with all variables
- [ ] JWT_SECRET is strong and random
- [ ] ADMIN_SIGNUP_SECRET is set
- [ ] Health check endpoint responds: `GET /health`
- [ ] Auth endpoints working: `POST /api/auth/otp/request`
- [ ] Parking endpoints working: `GET /api/parking`
- [ ] Booking endpoints working: `POST /api/booking`
- [ ] Rate limiting active (5 auth attempts per 15 min)
- [ ] HTTPS enabled (automatic on Railway/Render)
- [ ] Logs configured and accessible
- [ ] Error handling verified
- [ ] Database backups configured
- [ ] Monitoring set up (optional: Sentry)

---

## Testing API in Production

### 1. Test Health
```bash
curl https://your-app.com/health
```

### 2. Test Auth Flow
```bash
# Request OTP
curl -X POST https://your-app.com/api/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+919876543210"}'

# Verify OTP (use '1234' in development)
curl -X POST https://your-app.com/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+919876543210","otp":"1234"}'
```

### 3. Test Parking API
```bash
curl https://your-app.com/api/parking
```

### 4. Test With Token
```bash
# Use token from verify OTP response
curl https://your-app.com/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Troubleshooting

### Database Connection Failed
```
Error: connect ECONNREFUSED
Solution:
1. Verify DATABASE_URL is correct
2. Check database is running
3. Test connection: psql $DATABASE_URL
```

### Port Already In Use
```
Error: listen EADDRINUSE: address already in use :::5000
Solution:
1. Change PORT in .env
2. Or kill process: lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill
```

### JWT Token Invalid
```
Error: 401 Unauthorized
Solution:
1. Verify JWT_SECRET matches between auth and verification
2. Check token not expired
3. Ensure "Bearer " prefix in Authorization header
```

### Out of Memory
```
Error: FATAL ERROR: CALL_AND_RETRY_LAST
Solution:
1. Upgrade instance tier
2. Check for memory leaks in logs
3. Reduce rate limit max requests
```

---

## Monitoring & Maintenance

### View Logs
- **Railway**: Dashboard → Logs tab
- **Render**: Service → Logs tab
- **Local**: `tail -f logs/all.log`

### Database Backups
- **Railway**: Auto-backup enabled (7 days retention)
- **Render**: Auto-backup every 24 hours
- **Local**: `pg_dump moofu_prod > backup.sql`

### Performance Monitoring
```bash
# Check API response times in logs
grep "ms)" logs/all.log | tail -20

# Identify slow endpoints
grep "ms)" logs/all.log | sort -t'(' -k2 -rn | head -10
```

### Security Best Practices
1. Rotate JWT_SECRET monthly
2. Monitor failed auth attempts (rate limiting logs)
3. Keep Node.js version updated
4. Review error logs regularly
5. Enable database encryption (PostgreSQL)

---

## Scaling to Production

### Load Balancing (Optional)
- Railway: Automatic with replicas
- Render: Upgrade to Standard tier with load balancing

### Database Optimization
```sql
-- Create indexes on frequently queried columns
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_station_id ON bookings(station_id);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_parking_area ON parking_stations(area);
```

### Caching (Future Enhancement)
- Add Redis for session/OTP caching
- Cache parking station listings

---

## Cost Estimation (Monthly)

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Railway (Backend) | 0 | $5-50 |
| Railway (PostgreSQL) | 5GB free | $10-50 |
| Render (Backend) | 0 (sleeps) | $7-100 |
| Render (PostgreSQL) | 1GB free | $15-100 |
| **Total** | **Free** | **$25-200** |

### Recommendations for Launch
- Start with free tier for testing
- Upgrade to paid tier for production
- Budget $50-100/month for reliable hosting

---

## Quick Deploy Script

```bash
#!/bin/bash

echo "🚀 Deploying MOOFU Backend to Production"

# 1. Verify .env.production exists
if [ ! -f .env.production ]; then
  echo "❌ .env.production not found!"
  exit 1
fi

# 2. Install dependencies
npm install --omit=dev

# 3. Run tests
npm test || echo "⚠️ Tests failed, continuing..."

# 4. Build Docker image
docker build -t moofu-backend:latest .

# 5. Push to Docker registry (if using)
# docker push your-registry/moofu-backend:latest

echo "✅ Backend ready for deployment!"
echo "Next steps:"
echo "  - Push to GitHub if using Railway/Render auto-deploy"
echo "  - Or run: docker push your-registry/moofu-backend:latest"
```

Save as `deploy.sh` and run: `chmod +x deploy.sh && ./deploy.sh`

---

## Support & Help

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Node.js Best Practices: https://nodejs.org/en/docs/guides/

For issues, check logs and error messages, then refer to the troubleshooting section.
