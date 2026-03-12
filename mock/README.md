# API Schemas & Mock Data

This folder contains comprehensive API schemas and endpoint definitions for the FMS Admin Panel.

## Structure

```
mock/
├── api-schemas/          # TypeScript interfaces for all API requests/responses
│   ├── auth.schema.ts
│   ├── user-management.schema.ts
│   ├── kyc-verification.schema.ts
│   ├── booking-management.schema.ts
│   ├── pricing-management.schema.ts
│   ├── settlements-finance.schema.ts
│   ├── analytics-reporting.schema.ts
│   ├── audit-logging.schema.ts
│   ├── common.schema.ts
│   └── index.ts
├── api-endpoints.ts      # Centralized endpoint definitions
└── README.md            # This file
```

## Usage

### Importing Schemas

```typescript
import { 
  LoginRequest, 
  LoginResponse,
  UserListRequest,
  BookingListResponse 
} from './mock/api-schemas'
```

### Using Endpoints

```typescript
import API_ENDPOINTS from './mock/api-endpoints'

// Example API call
const response = await fetch(API_ENDPOINTS.USERS.LIST, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## API Modules

### 1. Authentication (`auth.schema.ts`)
- Login/Logout
- Signup
- Token refresh
- Password reset
- User session management

### 2. User Management (`user-management.schema.ts`)
- List/search users
- User details
- Block/Unblock/Suspend users
- User activity history
- Export users

### 3. KYC & Verification (`kyc-verification.schema.ts`)
- KYC application list
- Review/Approve/Reject KYC
- Re-verification requests
- KYC audit logs
- Statistics

### 4. Booking Management (`booking-management.schema.ts`)
- Booking list with filters
- Booking details
- Assign/Reassign providers
- Cancel bookings
- Manual refunds
- Booking statistics

### 5. Pricing & Commission (`pricing-management.schema.ts`)
- Service pricing management
- Surge pricing rules
- Commission structure
- Pricing history/versioning
- City-wise pricing

### 6. Settlements & Finance (`settlements-finance.schema.ts`)
- Provider payouts
- Vendor settlements
- Wallet ledger
- Invoice generation
- Tax reports
- Financial summaries

### 7. Analytics & Reporting (`analytics-reporting.schema.ts`)
- Dashboard statistics
- Demand/supply heatmaps
- Service distribution
- SLA metrics
- Revenue analytics
- City performance
- Real-time metrics
- Export reports

### 8. Audit & Logging (`audit-logging.schema.ts`)
- Audit log list
- Log details
- Search logs
- Statistics
- Export audit logs

### 9. Common (`common.schema.ts`)
- Pagination
- Error handling
- File uploads
- Bulk operations
- System configuration
- Health checks

## Request/Response Patterns

### Pagination
```typescript
interface PaginationRequest {
  page?: number      // Default: 1
  limit?: number    // Default: 20
}
```

### Sorting
```typescript
interface SortRequest {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
```

### Filtering
```typescript
interface FilterRequest {
  search?: string
  dateFrom?: string
  dateTo?: string
  [key: string]: any
}
```

### Error Response
```typescript
interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}
```

## Authentication

All protected endpoints require an authentication token in the header:

```
Authorization: Bearer <token>
```

## Response Format

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: ApiError
  pagination?: Pagination
}
```

## Environment Variables

Set the API base URL (Vite uses `VITE_` prefix):

```env
VITE_API_URL=https://api.fms.com/v1
```

## Next Steps

1. **Implement API Client**: Create an API client service that uses these schemas
2. **Add Mock Data**: Create mock data files for development/testing
3. **Add Validation**: Use libraries like Zod or Yup for runtime validation
4. **Generate Types**: Use these schemas to generate TypeScript types for your API client
5. **API Documentation**: Generate OpenAPI/Swagger docs from these schemas

## Integration Example

```typescript
// api/client.ts
import API_ENDPOINTS from '../mock/api-endpoints'
import { LoginRequest, LoginResponse } from '../mock/api-schemas'

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })
  
  if (!response.ok) {
    throw new Error('Login failed')
  }
  
  return response.json()
}
```
