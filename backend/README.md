# FMS Admin Panel Backend

NestJS backend API for the FMS Admin Panel.

## Features

- ✅ JWT Authentication & Authorization
- ✅ Role-Based Access Control (RBAC)
- ✅ User Management
- ✅ KYC & Verification
- ✅ Booking Management
- ✅ Pricing & Commission Management
- ✅ Settlements & Finance
- ✅ Analytics & Reporting
- ✅ Audit & Logging
- ✅ PostgreSQL Database with Prisma
- ✅ Swagger API Documentation
- ✅ Input Validation
- ✅ Error Handling

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **Prisma** - Next-generation ORM for database operations
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Swagger** - API documentation
- **class-validator** - DTO validation
- **bcrypt** - Password hashing

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your database credentials
```

## Database Setup

```bash
# Create PostgreSQL database
createdb fms_admin

# Setup Prisma
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed admin users (optional)
npm run prisma:seed
```

## Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## API Documentation

Swagger documentation is available at:
- `http://localhost:3000/api/docs`

## Environment Variables

See `.env.example` for all required environment variables:

- `PORT` - Server port (default: 3000)
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRES_IN` - JWT expiration time
- `FRONTEND_URL` - Frontend URL for CORS

## API Endpoints

### Authentication
- `POST /v1/auth/login` - Login
- `POST /v1/auth/signup` - Signup

### Users (Protected)
- `GET /v1/admin/users` - List users
- `GET /v1/admin/users/:id` - Get user details
- `PATCH /v1/admin/users/:id/status` - Update user status
- `POST /v1/admin/users/:id/block` - Block user
- `POST /v1/admin/users/:id/unblock` - Unblock user

### KYC (Protected)
- `GET /v1/admin/kyc` - List KYC applications
- `GET /v1/admin/kyc/stats` - Get KYC statistics
- `GET /v1/admin/kyc/:id` - Get KYC details
- `POST /v1/admin/kyc/:id/review` - Review KYC

### Bookings (Protected)
- `GET /v1/admin/bookings` - List bookings
- `GET /v1/admin/bookings/stats` - Get booking statistics
- `GET /v1/admin/bookings/:id` - Get booking details
- `POST /v1/admin/bookings/:id/assign` - Assign provider
- `POST /v1/admin/bookings/:id/cancel` - Cancel booking

### Analytics (Protected)
- `GET /v1/admin/analytics/dashboard-stats` - Dashboard statistics
- `GET /v1/admin/analytics/revenue` - Revenue analytics

### Audit (Protected)
- `GET /v1/admin/audit-logs` - List audit logs
- `GET /v1/admin/audit-logs/stats` - Audit statistics

## User Roles

- **Super Admin** - Full access
- **Operations Admin** - Users, Bookings, Analytics
- **Finance Admin** - Pricing, Settlements, Analytics
- **Support Agent** - Bookings only
- **Compliance Officer** - KYC, Audit

## Project Structure

```
backend/
├── src/
│   ├── modules/          # Feature modules
│   │   ├── auth/        # Authentication
│   │   ├── users/       # User management
│   │   ├── kyc/         # KYC verification
│   │   ├── bookings/    # Booking management
│   │   ├── pricing/     # Pricing & commission
│   │   ├── settlements/ # Settlements & finance
│   │   ├── analytics/   # Analytics & reporting
│   │   └── audit/       # Audit logging
│   ├── common/          # Shared utilities
│   │   ├── decorators/  # Custom decorators
│   │   ├── guards/      # Auth guards
│   │   ├── filters/     # Exception filters
│   │   └── interceptors/# Response interceptors
│   ├── database/        # Database configuration
│   └── main.ts          # Application entry point
├── .env.example         # Environment variables template
└── package.json         # Dependencies
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and run migration
npm run prisma:migrate

# Deploy migrations (production)
npm run prisma:migrate:deploy

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Seed database
npm run prisma:seed
```

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation
- SQL injection protection (Prisma)
- CORS configuration
- Rate limiting (Throttler)

## Next Steps

1. Implement file upload for KYC documents
2. Add email notifications
3. Implement real-time updates (WebSockets)
4. Add caching (Redis)
5. Implement comprehensive logging
6. Add unit and E2E tests
7. Set up CI/CD pipeline
