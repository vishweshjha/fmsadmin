# Prisma Migration Guide

This document explains the migration from TypeORM to Prisma.

## Changes Made

### 1. Dependencies
- ✅ Removed: `@nestjs/typeorm`, `typeorm`
- ✅ Added: `@prisma/client`, `prisma`

### 2. Database Configuration
- ✅ Removed: `DatabaseModule` with TypeORM configuration
- ✅ Added: `PrismaModule` with Prisma Client
- ✅ Updated: `.env` to use `DATABASE_URL` instead of separate DB config

### 3. Schema Definition
- ✅ Created: `prisma/schema.prisma` with all entities
- ✅ All enums defined in Prisma schema
- ✅ Relationships defined using Prisma syntax

### 4. Services Updated
All services now use `PrismaService` instead of TypeORM repositories:
- ✅ `AuthService` - Uses `prisma.adminUser`
- ✅ `UsersService` - Uses `prisma.user`
- ✅ `KYCService` - Uses `prisma.kYCApplication`
- ✅ `BookingsService` - Uses `prisma.booking`
- ✅ `PricingService` - Uses `prisma.servicePricing`, `prisma.surgePricingRule`
- ✅ `SettlementsService` - Uses `prisma.providerPayout`, `prisma.vendorSettlement`
- ✅ `AnalyticsService` - Uses Prisma aggregations
- ✅ `AuditService` - Uses `prisma.auditLog`

### 5. Query Changes

**TypeORM:**
```typescript
this.repository.find({ where: { status: 'ACTIVE' } })
```

**Prisma:**
```typescript
this.prisma.model.findMany({ where: { status: 'ACTIVE' } })
```

**TypeORM Query Builder:**
```typescript
this.repository.createQueryBuilder('user')
  .where('user.name ILIKE :search', { search: `%${search}%` })
```

**Prisma:**
```typescript
this.prisma.user.findMany({
  where: { name: { contains: search, mode: 'insensitive' } }
})
```

### 6. Enum Usage

**Before (TypeORM):**
```typescript
import { UserRole } from './entities/user.entity'
```

**After (Prisma):**
```typescript
import { AdminUserRole } from '@prisma/client'
```

## Setup Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set DATABASE_URL in .env:**
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/fms_admin?schema=public
   ```

3. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

4. **Create initial migration:**
   ```bash
   npm run prisma:migrate
   # Name: init
   ```

5. **Seed database:**
   ```bash
   npm run prisma:seed
   ```

## Prisma Commands

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create and apply migration
- `npm run prisma:migrate:deploy` - Deploy migrations (production)
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Run seed script

## Key Differences

### 1. Type Safety
Prisma provides better type safety with auto-generated types from schema.

### 2. Query Syntax
Prisma uses a more intuitive query API compared to TypeORM's query builder.

### 3. Migrations
Prisma migrations are more straightforward and schema-first.

### 4. Relations
Prisma handles relations more explicitly with `include` and `select`.

## Benefits of Prisma

- ✅ Better type safety
- ✅ Auto-completion in IDE
- ✅ Simpler query syntax
- ✅ Better performance
- ✅ Built-in migration system
- ✅ Prisma Studio for database management
