# MOOFU Complete Setup and Deployment Guide

## 📋 Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Production Deployment](#production-deployment)
3. [Verification Checklist](#verification-checklist)
4. [Troubleshooting](#troubleshooting)

---

## 🔧 Local Development Setup

### Prerequisites
- Node.js 16+ installed
- PostgreSQL 14+ installed and running
- Git installed

### Step 1: Backend Setup

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Create Environment File**
   ```bash
   cp .env.example .env
   ```

3. **Update .env with Local PostgreSQL**
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/moofu
   JWT_SECRET=dev-secret-key-change-in-production
   JWT_EXPIRES_IN=7d
   ADMIN_SIGNUP_SECRET=admin-secret
   OTP_TTL_MINUTES=5
   DEV_OTP_CODE=1234
   OTP_MAX_ATTEMPTS=5
   ```

4. **Initialize Database**
   ```bash
   npm run db:init
   ```

5. **Start Backend Server**
   ```bash
   npm run dev
   ```
   
   ✅ Backend should run on http://localhost:5000

### Step 2: Frontend Setup

1. **Install Frontend Dependencies**
   ```bash
   cd ..
   npm install
   ```

2. **Start Frontend Development**
   ```bash
   npm start
   ```

3. **Choose Platform**
   - Press `a` for Android (requires Android emulator)
   - Press `i` for iOS (requires macOS + Xcode)
   - Press `w` for Web

### Step 3: Verify Local Setup

1. **Check Backend Health**
   ```bash
   curl http://localhost:5000/health
   ```
   Expected response: `{"success":true,"status":"ok"}`

2. **Test OTP Request** (in another terminal)
   ```bash
   curl -X POST http://localhost:5000/api/auth/otp/request \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber":"+919876543210"}'
   ```

3. **Test in App**
   - Open app on phone/emulator
   - Try OTP login with any phone number
   - Use OTP code `1234` (from DEV_OTP_CODE in .env)

---

## 🚀 Production Deployment

### Option A: Deploy to Render.com

#### Backend Deployment

1. **Prepare Git Repository**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Create Render Service**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**
   - Name: `moofu-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Branch: `main`

4. **Add PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Name: `moofu-db`
   - Database: `moofu`

5. **Set Environment Variables**
   - Click on the web service
   - Go to "Environment"
   - Add variables:
     ```
     NODE_ENV=production
     PORT=5000
     DATABASE_URL=(copy from PostgreSQL service)
     JWT_SECRET=(generate secure key)
     JWT_EXPIRES_IN=7d
     ADMIN_SIGNUP_SECRET=(generate secure key)
     OTP_TTL_MINUTES=5
     OTP_MAX_ATTEMPTS=5
     ```

6. **Deploy**
   - Service will automatically deploy from GitHub push

#### Frontend Deployment (Expo)

1. **Build for EAS**
   ```bash
   npm install -g eas-cli
   eas login
   eas build --platform all
   ```

2. **Submit to App Stores** (Optional)
   ```bash
   eas submit --platform android --latest
   eas submit --platform ios --latest
   ```

3. **Update API Endpoint**
   - In `src/services/api.ts`, update production URL to your Render domain

### Option B: Deploy to Railway.app

1. **Create New Project**
   - Go to https://railway.app
   - Click "New Project"

2. **Add PostgreSQL**
   - Click "Add Service" → "PostgreSQL"
   - Copy connection string

3. **Add Backend Service**
   - Click "Add Service" → "GitHub Repo"
   - Connect your repository

4. **Configure Service**
   - Root Directory: `backend`
   - Runtime: `Node.js`
   - Environment: Add DATABASE_URL and other vars

5. **Deploy**
   - Push to main branch to trigger deployment

### Option C: Deploy to AWS

1. **RDS for PostgreSQL**
   - Create RDS instance
   - Save connection string

2. **EC2 or ECS for Backend**
   - Create Docker image: `docker build -t moofu-backend .`
   - Push to ECR
   - Deploy on ECS or EC2

3. **Expo for Frontend**
   - Build and submit to Play Store/App Store

---

## ✅ Verification Checklist

### Before Going Live

- [ ] Backend starts without errors
- [ ] Database connection works
- [ ] All API endpoints respond correctly
- [ ] Authentication flow works (OTP → Token)
- [ ] Parking data loads correctly
- [ ] Booking creation works
- [ ] Frontend connects to backend
- [ ] Error handling works properly
- [ ] Environment variables are secure
- [ ] SSL/HTTPS is enforced (production)
- [ ] Database backups are configured
- [ ] Logging is set up
- [ ] Rate limiting is active
- [ ] CORS is properly configured

### API Endpoint Tests

**Health Check**
```bash
curl http://localhost:5000/health
```

**Request OTP**
```bash
curl -X POST http://localhost:5000/api/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+919876543210"}'
```

**Verify OTP** (response will have token)
```bash
curl -X POST http://localhost:5000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+919876543210","otp":"1234"}'
```

**Get Profile** (use token from verify response)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**List Parking Stations**
```bash
curl http://localhost:5000/api/parking
```

---

## 🆘 Troubleshooting

### Backend Issues

**Error: `Error: password authentication failed`**
- Check DATABASE_URL in .env
- Verify PostgreSQL is running
- Ensure database exists: `createdb moofu`

**Error: `Port 5000 already in use`**
- Kill existing process: `lsof -i :5000` then `kill -9 <PID>`
- Or change PORT in .env

**Error: `ENOENT: no such file or directory, open '.env'`**
- Run: `cp .env.example .env`
- Edit .env with your settings

**Backend crashes on start**
- Check logs: `npm run dev` should show errors
- Ensure all dependencies installed: `npm install`
- Check Node version: `node -v` (should be 16+)

### Database Issues

**Database doesn't initialize**
```bash
# Clear and reinit
npm run db:init
```

**Can't connect to PostgreSQL**
```bash
# Test connection
psql -U postgres -h localhost -d moofu
```

**Migration fails**
- Ensure PostgreSQL is running
- Check database doesn't exist (drop if needed): `dropdb moofu`
- Run init again: `npm run db:init`

### Frontend Issues

**App won't connect to backend**
- Check API URL in `src/services/api.ts`
- Verify backend is running on port 5000
- Check device firewall/network

**OTP verification fails**
- Ensure backend API is reachable
- Check JWT_SECRET matches between requests
- Verify DEV_OTP_CODE in .env (default: 1234)

**App crashes on startup**
- Check TypeScript compilation: no red squiggles
- Clear cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules && npm install`

---

## 📊 Monitoring Production

### Health Checks
Set up regular health checks to https://your-domain/health

### Logging
- Backend logs are in `backend/logs/`
- Review error logs daily
- Set up alerts for critical errors

### Database
- Monitor connection pool usage
- Set up automated backups
- Monitor disk space

### Performance
- Monitor API response times
- Track error rates
- Monitor database query performance

---

## 🔐 Security Checklist (Production)

- [ ] JWT_SECRET is strong and random
- [ ] ADMIN_SIGNUP_SECRET is strong
- [ ] Database password is strong
- [ ] SSL/TLS is enforced
- [ ] CORS is restricted to frontend domain
- [ ] Rate limiting is active
- [ ] Input validation is strict
- [ ] Sensitive data is not logged
- [ ] Backups are encrypted
- [ ] Access logs are monitored

---

## 📝 Post-Deployment

1. **Create Admin Account**
   ```bash
   # Use ADMIN_SIGNUP_SECRET from .env
   curl -X POST http://localhost:5000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "phoneNumber":"+919876543210",
       "password":"secure-password",
       "adminSecret":"admin-secret-from-env"
     }'
   ```

2. **Test Critical Flows**
   - User login
   - Parking listing
   - Booking creation
   - Booking cancellation

3. **Setup Monitoring**
   - Set up error tracking (Sentry)
   - Set up performance monitoring (New Relic)
   - Set up uptime monitoring (Pingdom)

4. **Documentation**
   - Update API documentation
   - Document deployment procedure
   - Create runbook for common issues

---

## 📞 Support

For issues:
1. Check logs: `backend/logs/*.log`
2. Review this guide's troubleshooting section
3. Check GitHub issues
4. Contact development team

---

Generated for MOOFU Parking Management System
Date: 2026-04-28
