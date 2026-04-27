# MOOFU Backend

Express + PostgreSQL backend for MOOFU parking booking platform.

## Folder structure

```
src/
  controllers/
  services/
  repositories/
  models/
  routes/
  middleware/
  config/
```

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run db:init
npm run dev
```

## API Base URL

`http://localhost:5000/api`

## Key APIs

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/otp/request`
- `POST /api/auth/otp/verify`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `POST /api/parking` (admin)
- `GET /api/parking`
- `GET /api/parking/nearby`
- `POST /api/slots/:stationId` (admin)
- `GET /api/slots/:stationId/availability`
- `POST /api/booking`
- `DELETE /api/booking/:id`
- `GET /api/booking/history/user`
- `POST /api/admin/stations/onboard` (admin)
- `POST /api/admin/stations/:stationId/slots` (admin)
