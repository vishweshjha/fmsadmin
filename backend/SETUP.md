# Backend Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Database

```bash
# Create PostgreSQL database
createdb fms_admin

# Or using psql
psql -U postgres
CREATE DATABASE fms_admin;
\q
```

### 3. Configure Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
```

### 4. Run Database Seed (Optional)

```bash
# Seed admin users
npm run seed
```

This will create default admin users:
- superadmin@fms.com / admin123
- operations@fms.com / admin123
- finance@fms.com / admin123
- support@fms.com / admin123
- compliance@fms.com / admin123

### 5. Start Development Server

```bash
npm run start:dev
```

The API will be available at:
- API: `http://localhost:3000/v1`
- Swagger Docs: `http://localhost:3000/api/docs`

## Environment Variables

Required environment variables in `.env`:

```env
# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database (Prisma)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fms_admin?schema=public

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

## API Endpoints

### Authentication
- `POST /v1/auth/login` - Login
- `POST /v1/auth/signup` - Signup

### Protected Endpoints (Require JWT Token)

All admin endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <token>
```

### Users
- `GET /v1/admin/users` - List users
- `GET /v1/admin/users/:id` - Get user
- `POST /v1/admin/users/:id/block` - Block user
- `POST /v1/admin/users/:id/unblock` - Unblock user

### KYC
- `GET /v1/admin/kyc` - List KYC applications
- `GET /v1/admin/kyc/stats` - KYC statistics
- `POST /v1/admin/kyc/:id/review` - Review KYC

### Bookings
- `GET /v1/admin/bookings` - List bookings
- `GET /v1/admin/bookings/stats` - Booking statistics
- `POST /v1/admin/bookings/:id/assign` - Assign provider

### Analytics
- `GET /v1/admin/analytics/dashboard-stats` - Dashboard stats
- `GET /v1/admin/analytics/revenue` - Revenue analytics

## Testing the API

### Using Swagger UI

1. Start the server: `npm run start:dev`
2. Open: `http://localhost:3000/api/docs`
3. Click "Authorize" and enter your JWT token
4. Test endpoints directly from Swagger

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@fms.com","password":"admin123"}'

# Get users (with token)
curl -X GET http://localhost:3000/v1/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Database Migrations (Prisma)

```bash
# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Create and apply migration
npm run prisma:migrate

# Deploy migrations (production)
npm run prisma:migrate:deploy

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env`
- Ensure database exists: `psql -l | grep fms_admin`
- Run `npm run prisma:generate` after schema changes

### Port Already in Use
- Change PORT in `.env`
- Or kill process: `lsof -ti:3000 | xargs kill`

### Module Not Found
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Run migrations: `npm run prisma:migrate:deploy`
3. Build: `npm run build`
4. Start: `npm run start:prod`

## Next Steps

- [ ] Add file upload for KYC documents
- [ ] Implement email notifications
- [ ] Add Redis caching
- [ ] Set up logging (Winston)
- [ ] Add unit tests
- [ ] Configure CI/CD
