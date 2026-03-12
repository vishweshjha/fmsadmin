# FMS Admin Panel

A comprehensive admin dashboard for the On-Demand House Help Platform, built with React, TypeScript, and Tailwind CSS.

## Features

### Authentication & Authorization

- **Login System**: Secure login with email and password
- **Signup System**: Admin account registration with role selection
- **Role-Based Access Control (RBAC)**: Five distinct admin roles with granular permissions
- **Protected Routes**: Automatic redirection for unauthorized access
- **Session Management**: Persistent login with localStorage

### Core Functionality

- **User Management**: View, search, block, unblock, and suspend users (customers, providers, vendors)
- **KYC & Verification**: Review and approve/reject KYC documents with audit trails
- **Booking Management**: Manage all bookings with manual assignment, reassignment, and cancellation capabilities
- **Pricing & Commission**: Configure base pricing, surge pricing rules, and commission structures
- **Settlements & Finance**: Generate provider payouts, vendor settlements, and financial reports
- **Analytics & Reporting**: Real-time dashboards with demand/supply heatmaps, SLA metrics, and revenue analytics
- **Audit & Logging**: Immutable audit trail of all admin actions

### Design Features

- Modern, clean UI inspired by professional admin dashboards
- Responsive design that works on all screen sizes
- Dark sidebar navigation with active state indicators
- Interactive charts and graphs using Recharts
- Real-time data visualization
- Search and filter capabilities across all modules

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Chart library for data visualization
- **Lucide React** - Icon library
- **date-fns** - Date formatting utilities

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
FMS-admin/
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # Main layout wrapper
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   └── TopBar.tsx           # Top navigation bar
│   ├── pages/
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── UserManagement.tsx  # User management page
│   │   ├── KYCVerification.tsx # KYC review page
│   │   ├── BookingManagement.tsx # Booking management
│   │   ├── PricingManagement.tsx # Pricing configuration
│   │   ├── SettlementsFinance.tsx # Financial settlements
│   │   ├── AnalyticsReporting.tsx # Analytics dashboard
│   │   └── AuditLogging.tsx     # Audit logs
│   ├── App.tsx                 # Main app component with routing
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## User Roles & Permissions

The system supports the following admin roles with specific permissions:

### Super Admin
- **Full system access** to all modules
- Can access: Dashboard, User Management, KYC, Bookings, Pricing, Settlements, Analytics, Audit

### Operations Admin
- **Operations and user management**
- Can access: Dashboard, User Management, Bookings, Analytics
- Cannot access: KYC, Pricing, Settlements, Audit

### Finance Admin
- **Financial operations and settlements**
- Can access: Dashboard, Pricing, Settlements, Analytics
- Cannot access: User Management, KYC, Bookings, Audit

### Support Agent
- **Customer support and booking operations**
- Can access: Dashboard, Bookings
- Cannot access: User Management, KYC, Pricing, Settlements, Analytics, Audit

### Compliance Officer
- **KYC verification and compliance**
- Can access: Dashboard, KYC, Audit
- Cannot access: User Management, Bookings, Pricing, Settlements, Analytics

## Authentication

### Demo Credentials

For testing purposes, the following demo accounts are available:

- **Super Admin**: `superadmin@fms.com` / `admin123`
- **Operations Admin**: `operations@fms.com` / `admin123`
- **Finance Admin**: `finance@fms.com` / `admin123`
- **Support Agent**: `support@fms.com` / `admin123`
- **Compliance Officer**: `compliance@fms.com` / `admin123`

### Signup

New admin accounts can be created through the signup page. Role selection is available during registration.

## Key Features by Module

### Dashboard
- Real-time statistics cards
- Recent bookings table
- Productivity charts
- Projects in progress carousel

### User Management
- Search by name, phone, email, role, or status
- Filter by role and status
- Block/unblock/suspend users
- View user activity history

### KYC & Verification
- Review uploaded documents
- Approve/reject with remarks
- View verification levels
- Audit log tracking

### Booking Management
- View all bookings with real-time status
- Manual provider assignment/reassignment
- Cancel bookings with reason codes
- Apply manual refunds

### Pricing & Commission
- Configure base pricing per service
- Set surge pricing rules
- Manage commission structures
- City-wise pricing configuration

### Settlements & Finance
- Provider payout reports
- Vendor settlement reports
- Trigger payouts manually
- Generate invoices and tax reports

### Analytics & Reporting
- Real-time operational dashboards
- Demand and supply heatmaps
- SLA compliance metrics
- Revenue and growth analytics
- CSV export functionality

### Audit & Logging
- Complete audit trail
- Immutable logs
- Search and filter capabilities
- Export functionality

## Non-Functional Requirements

- **Performance**: Dashboard load time < 3 seconds
- **Availability**: 99.9% uptime target
- **Security**: RBAC, audit logs, encrypted data
- **Scalability**: Multi-city operations support
- **Compliance**: DPDP, PCI-DSS (payments)

## Development

### Code Style

The project uses ESLint for code quality. Run linting with:

```bash
npm run lint
```

### Adding New Features

1. Create new page components in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation item in `src/components/Sidebar.tsx`
4. Follow existing component patterns and styling

## License

This project is proprietary software for the On-Demand House Help Platform.
