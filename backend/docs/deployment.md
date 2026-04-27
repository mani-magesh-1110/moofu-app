# MOOFU Backend Deployment

## Render Deployment
1. Push repository to GitHub.
2. In Render, create a **PostgreSQL** instance.
3. Create a **Web Service** from this repo with root directory `backend`.
4. Build command: `npm ci && npm run db:init`.
5. Start command: `npm start`.
6. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `DATABASE_URL=<render-postgres-url>`
   - `JWT_SECRET=<secure-random-string>`
   - `JWT_EXPIRES_IN=7d`
7. Deploy and verify `/api/health`.

## Railway Deployment
1. Create a new Railway project and link GitHub repo.
2. Add PostgreSQL plugin.
3. Set service root to `backend`.
4. Configure environment variables same as above.
5. Add pre-deploy command `npm run db:init`.
6. Start command `npm start`.
7. Verify `https://<railway-domain>/api/health`.
