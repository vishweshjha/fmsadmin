/**
 * Gyors Backend API Service
 * Central service layer for all API calls to the Gyors GCP backend
 */

import apiClient from './apiClient'
import API_ENDPOINTS from '../../mock/api-endpoints'

// ─── Dashboard / Analytics ────────────────────────────────────────────────────

export interface DashboardMetrics {
  totalBookings?: number
  activeUsers?: number
  revenue?: number
  pendingKYC?: number
  bookingsGrowth?: number
  usersGrowth?: number
  revenueGrowth?: number
  averageResponseTime?: number
  [key: string]: any
}

export async function fetchDashboardStats(): Promise<DashboardMetrics> {
  const res = await apiClient.get<DashboardMetrics>(API_ENDPOINTS.ANALYTICS.DASHBOARD_STATS)
  if (!res.success) throw new Error(res.error?.message || 'Failed to load dashboard stats')
  return res.data || {}
}

export async function fetchRevenueAnalytics(): Promise<any[]> {
  const res = await apiClient.get<any[]>(API_ENDPOINTS.ANALYTICS.REVENUE_ANALYTICS)
  if (!res.success) throw new Error(res.error?.message || 'Failed to load revenue analytics')
  const data = res.data
  if (Array.isArray(data)) return data
  return []
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string
  name: string
  phone?: string
  phoneNumber?: string
  email?: string
  role: string
  status: string
  createdAt?: string
  lastLogin?: string
  totalBookings?: number
  [key: string]: any
}

export interface UsersListParams {
  name?: string
  phone?: string
  role?: string
  status?: string
  page?: number
  limit?: number
}

export async function fetchUsers(params?: UsersListParams): Promise<AdminUser[]> {
  const res = await apiClient.get<any>(API_ENDPOINTS.USERS.LIST, params)
  if (!res.success) throw new Error(res.error?.message || 'Failed to load users')
  const data = res.data
  if (Array.isArray(data)) return data
  if (data?.users) return data.users
  if (data?.data) return data.data
  return []
}

export async function updateUserStatus(
  id: string,
  status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED',
  reason?: string
): Promise<void> {
  const res = await apiClient.patch(API_ENDPOINTS.USERS.UPDATE_STATUS(id), { status, reason })
  if (!res.success) throw new Error(res.error?.message || 'Failed to update user status')
}

export async function fetchUserHistory(id: string): Promise<any[]> {
  const res = await apiClient.get<any[]>(API_ENDPOINTS.USERS.ACTIVITY_HISTORY(id))
  if (!res.success) throw new Error(res.error?.message || 'Failed to load user history')
  const data = res.data
  if (Array.isArray(data)) return data
  return []
}

// ─── KYC ─────────────────────────────────────────────────────────────────────

export interface KYCApplication {
  id: string
  serviceProviderId?: string
  providerName?: string
  name?: string
  phone?: string
  phoneNumber?: string
  email?: string
  documentType?: string
  fileUrl?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  remarks?: string
  aadhaarNumber?: string
  submittedAt?: string
  createdAt?: string
  [key: string]: any
}

export async function fetchPendingKYC(): Promise<KYCApplication[]> {
  const res = await apiClient.get<any>(API_ENDPOINTS.KYC.LIST)
  if (!res.success) throw new Error(res.error?.message || 'Failed to load KYC applications')
  const data = res.data
  if (Array.isArray(data)) return data
  if (data?.applications) return data.applications
  if (data?.data) return data.data
  return []
}

export async function updateKYCStatus(
  id: string,
  status: 'APPROVED' | 'REJECTED' | 'PENDING',
  remarks?: string
): Promise<void> {
  const res = await apiClient.patch(API_ENDPOINTS.KYC.REVIEW(id), { status, remarks })
  if (!res.success) throw new Error(res.error?.message || 'Failed to update KYC status')
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export interface AdminBooking {
  id: string
  serviceItemId?: string
  serviceName?: string
  customerId?: string
  customerName?: string
  providerId?: string
  providerName?: string
  status: string
  scheduledAt?: string
  createdAt?: string
  amount?: number
  paymentStatus?: string
  reason?: string
  [key: string]: any
}

export interface BookingsListParams {
  status?: string
  userId?: string
  page?: number
  limit?: number
}

export async function fetchBookings(params?: BookingsListParams): Promise<AdminBooking[]> {
  const res = await apiClient.get<any>(API_ENDPOINTS.BOOKINGS.LIST, params)
  if (!res.success) throw new Error(res.error?.message || 'Failed to load bookings')
  const data = res.data
  if (Array.isArray(data)) return data
  if (data?.bookings) return data.bookings
  if (data?.data) return data.data
  return []
}

export async function updateBookingStatus(
  id: string,
  status: string,
  reason?: string
): Promise<void> {
  const res = await apiClient.patch(API_ENDPOINTS.BOOKINGS.UPDATE_STATUS(id), { status, reason })
  if (!res.success) throw new Error(res.error?.message || 'Failed to update booking status')
}

export async function assignProviderToBooking(
  id: string,
  providerId: string
): Promise<void> {
  const res = await apiClient.patch(API_ENDPOINTS.BOOKINGS.ASSIGN(id), { providerId })
  if (!res.success) throw new Error(res.error?.message || 'Failed to assign provider')
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

export interface PricingRule {
  id?: string
  service_type: string
  city: string
  base_price: number | string
  [key: string]: any
}

export interface SurgeRule {
  id?: string
  pricingRuleId?: string
  PricingRuleid?: string
  multiplier: number | string
  condition: string | number
  [key: string]: any
}

export async function fetchPricingRules(): Promise<PricingRule[]> {
  const res = await apiClient.get<any>(API_ENDPOINTS.PRICING.RULES_LIST)
  if (!res.success) throw new Error(res.error?.message || 'Failed to load pricing rules')
  const data = res.data
  if (Array.isArray(data)) return data
  if (data?.data) return data.data
  return []
}

export async function fetchSurgeRules(): Promise<SurgeRule[]> {
  const res = await apiClient.get<any>(API_ENDPOINTS.PRICING.SURGE_LIST)
  if (!res.success) throw new Error(res.error?.message || 'Failed to load surge rules')
  const data = res.data
  if (Array.isArray(data)) return data
  if (data?.data) return data.data
  return []
}

export async function createPricingRule(data: PricingRule): Promise<any> {
  const res = await apiClient.post(API_ENDPOINTS.PRICING.RULES_CREATE, data)
  if (!res.success) throw new Error(res.error?.message || 'Failed to create pricing rule')
  return res.data
}

export async function createSurgeRule(data: SurgeRule): Promise<any> {
  const res = await apiClient.post(API_ENDPOINTS.PRICING.SURGE_CREATE, data)
  if (!res.success) throw new Error(res.error?.message || 'Failed to create surge rule')
  return res.data
}

export async function updatePricingRule(id: string, data: Partial<PricingRule>): Promise<any> {
  const res = await apiClient.patch(API_ENDPOINTS.PRICING.RULES_UPDATE(id), data)
  if (!res.success) throw new Error(res.error?.message || 'Failed to update pricing rule')
  return res.data
}

export async function updateSurgeRule(id: string, data: Partial<SurgeRule>): Promise<any> {
  const res = await apiClient.patch(API_ENDPOINTS.PRICING.SURGE_UPDATE(id), data)
  if (!res.success) throw new Error(res.error?.message || 'Failed to update surge rule')
  return res.data
}

export async function deletePricingRule(id: string): Promise<any> {
  const res = await apiClient.delete(API_ENDPOINTS.PRICING.RULES_DELETE(id))
  if (!res.success) throw new Error(res.error?.message || 'Failed to delete pricing rule')
  return res.data
}

export async function deleteSurgeRule(id: string): Promise<any> {
  const res = await apiClient.delete(API_ENDPOINTS.PRICING.SURGE_DELETE(id))
  if (!res.success) throw new Error(res.error?.message || 'Failed to delete surge rule')
  return res.data
}

// ─── Settlements / Wallets ────────────────────────────────────────────────────

export interface Wallet {
  id: string
  userId?: string
  balance?: number
  currency?: string
  [key: string]: any
}

export interface Settlement {
  id: string
  amount?: number
  status?: string
  createdAt?: string
  [key: string]: any
}

export async function fetchWallets(): Promise<Wallet[]> {
  const res = await apiClient.get<any>(API_ENDPOINTS.SETTLEMENTS.WALLETS)
  if (!res.success) throw new Error(res.error?.message || 'Failed to load wallets')
  const data = res.data
  if (Array.isArray(data)) return data
  if (data?.wallets) return data.wallets
  if (data?.data) return data.data
  return []
}

export async function fetchSettlements(): Promise<Settlement[]> {
  const res = await apiClient.get<any>(API_ENDPOINTS.SETTLEMENTS.LIST)
  if (!res.success) throw new Error(res.error?.message || 'Failed to load settlements')
  const data = res.data
  if (Array.isArray(data)) return data
  if (data?.settlements) return data.settlements
  if (data?.data) return data.data
  return []
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface AdminNotification {
  id: string
  message: string
  type?: string
  read?: boolean
  createdAt?: string
  [key: string]: any
}

export async function fetchNotifications(all = false): Promise<AdminNotification[]> {
  const res = await apiClient.get<any>(API_ENDPOINTS.NOTIFICATIONS.LIST, all ? { all: 'true' } : undefined)
  if (!res.success) throw new Error(res.error?.message || 'Failed to load notifications')
  const data = res.data
  if (Array.isArray(data)) return data
  if (data?.notifications) return data.notifications
  if (data?.data) return data.data
  return []
}

export async function markNotificationRead(id: string): Promise<void> {
  const res = await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id))
  if (!res.success) throw new Error(res.error?.message || 'Failed to mark notification as read')
}

// ─── Service Providers ────────────────────────────────────────────────────────

export interface ServiceProvider {
  id: string
  user_id: string
  name: string
  phoneNumber: string
  city?: string
  yearsOfExperience?: number
  status: string
  rating?: number
  Kyc_status?: string
  createdAt?: string
  updatedAt?: string
  user?: { id: string; name?: string; email?: string; phoneNumber?: string }
  providerProfiles?: { id: string; services: string[]; experiences: string[] }[]
  [key: string]: any
}

export interface ServiceProviderPayload {
  user_id: string
  name: string
  phoneNumber: string
  city?: string
  yearsOfExperience?: number
  status?: string
}

export interface ServiceProviderListParams {
  name?: string
  city?: string
  status?: string
}

export async function fetchServiceProviders(
  params?: ServiceProviderListParams
): Promise<ServiceProvider[]> {
  const res = await apiClient.get<any>(API_ENDPOINTS.SERVICE_PROVIDERS.LIST, params)
  if (!res.success) throw new Error(res.error?.message || 'Failed to load service providers')
  const data = res.data
  if (Array.isArray(data)) return data
  if (data?.providers) return data.providers
  if (data?.data) return data.data
  return []
}

export async function fetchServiceProviderById(id: string): Promise<ServiceProvider> {
  const res = await apiClient.get<ServiceProvider>(API_ENDPOINTS.SERVICE_PROVIDERS.DETAIL(id))
  if (!res.success) throw new Error(res.error?.message || 'Failed to load service provider')
  return res.data!
}

export async function createServiceProvider(data: ServiceProviderPayload): Promise<ServiceProvider> {
  const res = await apiClient.post<ServiceProvider>(API_ENDPOINTS.SERVICE_PROVIDERS.CREATE, data)
  if (!res.success) throw new Error(res.error?.message || 'Failed to create service provider')
  return res.data!
}

export async function updateServiceProvider(
  id: string,
  data: Partial<ServiceProviderPayload>
): Promise<ServiceProvider> {
  const res = await apiClient.patch<ServiceProvider>(API_ENDPOINTS.SERVICE_PROVIDERS.UPDATE(id), data)
  if (!res.success) throw new Error(res.error?.message || 'Failed to update service provider')
  return res.data!
}

export async function updateServiceProviderStatus(id: string, status: string): Promise<void> {
  const res = await apiClient.patch(API_ENDPOINTS.SERVICE_PROVIDERS.UPDATE_STATUS(id), { status })
  if (!res.success) throw new Error(res.error?.message || 'Failed to update status')
}

export async function deleteServiceProvider(id: string): Promise<void> {
  const res = await apiClient.delete(API_ENDPOINTS.SERVICE_PROVIDERS.DELETE(id))
  if (!res.success) throw new Error(res.error?.message || 'Failed to delete service provider')
}
