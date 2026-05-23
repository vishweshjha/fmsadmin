/**
 * API Endpoints Definition
 * Base URL: https://gyors-backend-311476989793.us-central1.run.app/api
 */

// const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const BASE_URL = import.meta.env.VITE_API_URL || 'https://gyors-backend-311476989793.us-central1.run.app/api'

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

  // Admin - User Management
  USERS: {
    LIST: `${BASE_URL}/admin/users`,
    DETAIL: (id: string) => `${BASE_URL}/admin/users/${id}`,
    UPDATE_STATUS: (id: string) => `${BASE_URL}/admin/users/${id}/status`,
    ACTIVITY_HISTORY: (id: string) => `${BASE_URL}/admin/users/${id}/history`,
    EXPORT: `${BASE_URL}/admin/users/export`,
  },

  // Admin - KYC & Verification
  KYC: {
    LIST: `${BASE_URL}/admin/kyc/pending`,
    DETAIL: (id: string) => `${BASE_URL}/admin/kyc/${id}`,
    REVIEW: (id: string) => `${BASE_URL}/admin/kyc/${id}/status`,
    STATS: `${BASE_URL}/admin/kyc/pending`,
    EXPORT_AUDIT: `${BASE_URL}/admin/kyc/export-audit`,
  },

  // Admin - Booking Management
  BOOKINGS: {
    LIST: `${BASE_URL}/admin/bookings`,
    DETAIL: (id: string) => `${BASE_URL}/admin/bookings/${id}`,
    UPDATE_STATUS: (id: string) => `${BASE_URL}/admin/bookings/${id}/status`,
    CANCEL: (id: string) => `${BASE_URL}/admin/bookings/${id}/status`,
    ASSIGN: (id: string) => `${BASE_URL}/admin/bookings/${id}/assign`,
    STATS: `${BASE_URL}/admin/bookings`,
    EXPORT: `${BASE_URL}/admin/bookings/export`,
  },

  // Admin - Pricing & Finance
  PRICING: {
    RULES_CREATE: `${BASE_URL}/admin/pricing-rules`,
    RULES_LIST: `${BASE_URL}/admin/pricing-rules`,
    RULES_UPDATE: (id: string) => `${BASE_URL}/admin/pricing-rules/${id}`,
    RULES_DELETE: (id: string) => `${BASE_URL}/admin/pricing-rules/${id}`,
    SURGE_CREATE: `${BASE_URL}/admin/surge-rules`,
    SURGE_LIST: `${BASE_URL}/admin/surge-rules`,
    SURGE_UPDATE: (id: string) => `${BASE_URL}/admin/surge-rules/${id}`,
    SURGE_DELETE: (id: string) => `${BASE_URL}/admin/surge-rules/${id}`,
    WALLETS: `${BASE_URL}/admin/wallets`,
  },

  // Admin - Settlements & Finance
  SETTLEMENTS: {
    LIST: `${BASE_URL}/admin/settlements`,
    WALLETS: `${BASE_URL}/admin/wallets`,
  },

  // Admin - Analytics
  ANALYTICS: {
    DASHBOARD_STATS: `${BASE_URL}/admin/analytics/dashboard`,
    REVENUE_ANALYTICS: `${BASE_URL}/admin/analytics/revenue`,
    REAL_TIME_METRICS: `${BASE_URL}/admin/analytics/dashboard`,
  },

  // Admin - Notifications
  NOTIFICATIONS: {
    LIST: `${BASE_URL}/admin/notifications`,
    MARK_READ: (id: string) => `${BASE_URL}/admin/notifications/${id}/read`,
  },

  // Common / Shared
  COMMON: {
    HEALTH_CHECK: `${BASE_URL}/health`,
    SERVICE_CATEGORIES: `${BASE_URL}/services/categories`,
    SERVICE_ITEMS: `${BASE_URL}/services/items`,
    SERVICE_SEARCH: `${BASE_URL}/services/search`,
  },

  // Admin - Service Provider Management
  SERVICE_PROVIDERS: {
    LIST: `${BASE_URL}/admin/service-providers`,
    DETAIL: (id: string) => `${BASE_URL}/admin/service-providers/${id}`,
    CREATE: `${BASE_URL}/admin/service-providers`,
    UPDATE: (id: string) => `${BASE_URL}/admin/service-providers/${id}`,
    UPDATE_STATUS: (id: string) => `${BASE_URL}/admin/service-providers/${id}/status`,
    DELETE: (id: string) => `${BASE_URL}/admin/service-providers/${id}`,
  },

  // Admin - Coupons
  COUPONS: {
    CREATE: `${BASE_URL}/admin/coupons`,
    LIST: `${BASE_URL}/admin/coupons`,
    DELETE: (id: string) => `${BASE_URL}/admin/coupons/${id}`,
  },

  // Admin - Shifts
  SHIFTS: {
    LIST: `${BASE_URL}/admin/shifts`,
    CREATE: `${BASE_URL}/admin/shifts`,
    UPDATE: (id: string) => `${BASE_URL}/admin/shifts/${id}`,
    DELETE: (id: string) => `${BASE_URL}/admin/shifts/${id}`,
  },
} as const

export default API_ENDPOINTS
