/**
 * API Endpoints Definition
 * Base URL: https://api.fms.com/v1
 */

// Vite uses import.meta.env instead of process.env
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1'

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    SIGNUP: `${BASE_URL}/auth/signup`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    REFRESH_TOKEN: `${BASE_URL}/auth/refresh`,
    FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
    VERIFY_TOKEN: `${BASE_URL}/auth/verify`,
  },

  // User Management
  USERS: {
    LIST: `${BASE_URL}/admin/users`,
    DETAIL: (id: string) => `${BASE_URL}/admin/users/${id}`,
    UPDATE_STATUS: (id: string) => `${BASE_URL}/admin/users/${id}/status`,
    BLOCK: (id: string) => `${BASE_URL}/admin/users/${id}/block`,
    UNBLOCK: (id: string) => `${BASE_URL}/admin/users/${id}/unblock`,
    SUSPEND: (id: string) => `${BASE_URL}/admin/users/${id}/suspend`,
    ACTIVITY_HISTORY: (id: string) => `${BASE_URL}/admin/users/${id}/activity`,
    EXPORT: `${BASE_URL}/admin/users/export`,
  },

  // KYC & Verification
  KYC: {
    LIST: `${BASE_URL}/admin/kyc`,
    DETAIL: (id: string) => `${BASE_URL}/admin/kyc/${id}`,
    REVIEW: (id: string) => `${BASE_URL}/admin/kyc/${id}/review`,
    REQUEST_REVERIFICATION: (id: string) => `${BASE_URL}/admin/kyc/${id}/reverify`,
    STATS: `${BASE_URL}/admin/kyc/stats`,
    EXPORT_AUDIT: `${BASE_URL}/admin/kyc/export-audit`,
  },

  // Booking Management
  BOOKINGS: {
    LIST: `${BASE_URL}/admin/bookings`,
    DETAIL: (id: string) => `${BASE_URL}/admin/bookings/${id}`,
    ASSIGN_PROVIDER: (id: string) => `${BASE_URL}/admin/bookings/${id}/assign`,
    REASSIGN_PROVIDER: (id: string) => `${BASE_URL}/admin/bookings/${id}/reassign`,
    CANCEL: (id: string) => `${BASE_URL}/admin/bookings/${id}/cancel`,
    APPLY_REFUND: (id: string) => `${BASE_URL}/admin/bookings/${id}/refund`,
    STATS: `${BASE_URL}/admin/bookings/stats`,
    EXPORT: `${BASE_URL}/admin/bookings/export`,
  },

  // Pricing & Commission
  PRICING: {
    SERVICE_LIST: `${BASE_URL}/admin/pricing/services`,
    SERVICE_DETAIL: (id: string) => `${BASE_URL}/admin/pricing/services/${id}`,
    SERVICE_CREATE: `${BASE_URL}/admin/pricing/services`,
    SERVICE_UPDATE: (id: string) => `${BASE_URL}/admin/pricing/services/${id}`,
    SERVICE_HISTORY: (id: string) => `${BASE_URL}/admin/pricing/services/${id}/history`,
    SURGE_RULES: `${BASE_URL}/admin/pricing/surge-rules`,
    SURGE_RULE_DETAIL: (id: string) => `${BASE_URL}/admin/pricing/surge-rules/${id}`,
    SURGE_RULE_CREATE: `${BASE_URL}/admin/pricing/surge-rules`,
    SURGE_RULE_UPDATE: (id: string) => `${BASE_URL}/admin/pricing/surge-rules/${id}`,
    SURGE_RULE_DELETE: (id: string) => `${BASE_URL}/admin/pricing/surge-rules/${id}`,
    COMMISSION_STRUCTURE: `${BASE_URL}/admin/pricing/commission`,
    COMMISSION_UPDATE: `${BASE_URL}/admin/pricing/commission`,
  },

  // Settlements & Finance
  SETTLEMENTS: {
    PROVIDER_PAYOUTS: `${BASE_URL}/admin/settlements/provider-payouts`,
    PROVIDER_PAYOUT_DETAIL: (id: string) => `${BASE_URL}/admin/settlements/provider-payouts/${id}`,
    PROCESS_PAYOUTS: `${BASE_URL}/admin/settlements/provider-payouts/process`,
    VENDOR_SETTLEMENTS: `${BASE_URL}/admin/settlements/vendor-settlements`,
    VENDOR_SETTLEMENT_DETAIL: (id: string) => `${BASE_URL}/admin/settlements/vendor-settlements/${id}`,
    PROCESS_SETTLEMENTS: `${BASE_URL}/admin/settlements/vendor-settlements/process`,
    WALLET_LEDGER: `${BASE_URL}/admin/settlements/wallet-ledger`,
    GENERATE_INVOICE: `${BASE_URL}/admin/settlements/invoices/generate`,
    TAX_REPORT: `${BASE_URL}/admin/settlements/tax-report`,
    FINANCIAL_SUMMARY: `${BASE_URL}/admin/settlements/summary`,
  },

  // Analytics & Reporting
  ANALYTICS: {
    DASHBOARD_STATS: `${BASE_URL}/admin/analytics/dashboard-stats`,
    DEMAND_SUPPLY_HEATMAP: `${BASE_URL}/admin/analytics/demand-supply`,
    SERVICE_DISTRIBUTION: `${BASE_URL}/admin/analytics/service-distribution`,
    SLA_METRICS: `${BASE_URL}/admin/analytics/sla-metrics`,
    REVENUE_ANALYTICS: `${BASE_URL}/admin/analytics/revenue`,
    CITY_PERFORMANCE: `${BASE_URL}/admin/analytics/city-performance`,
    USER_GROWTH: `${BASE_URL}/admin/analytics/user-growth`,
    PROVIDER_PERFORMANCE: `${BASE_URL}/admin/analytics/provider-performance`,
    REAL_TIME_METRICS: `${BASE_URL}/admin/analytics/realtime`,
    EXPORT: `${BASE_URL}/admin/analytics/export`,
  },

  // Audit & Logging
  AUDIT: {
    LIST: `${BASE_URL}/admin/audit-logs`,
    DETAIL: (id: string) => `${BASE_URL}/admin/audit-logs/${id}`,
    STATS: `${BASE_URL}/admin/audit-logs/stats`,
    SEARCH: `${BASE_URL}/admin/audit-logs/search`,
    EXPORT: `${BASE_URL}/admin/audit-logs/export`,
  },

  // Common
  COMMON: {
    HEALTH_CHECK: `${BASE_URL}/health`,
    SYSTEM_CONFIG: `${BASE_URL}/admin/system/config`,
    FILE_UPLOAD: `${BASE_URL}/admin/files/upload`,
  },
} as const

export default API_ENDPOINTS
