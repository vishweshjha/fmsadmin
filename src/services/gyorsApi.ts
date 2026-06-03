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

export async function triggerPayout(walletId: string, amount: number): Promise<any> {
  const res = await apiClient.post(`${API_ENDPOINTS.SETTLEMENTS.WALLETS}/${walletId}/payout`, { amount })
  if (!res.success) throw new Error(res.error?.message || 'Failed to trigger payout')
  return res.data!
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
  categories?: { id: string; name: string }[]
  items?: { id: string; name: string }[]
  [key: string]: any
}

export interface ServiceProviderPayload {
  user_id: string
  name: string
  phoneNumber: string
  city?: string
  yearsOfExperience?: number
  status?: string
  categoryIds?: string[]
  itemIds?: string[]
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

// ─── Categories & Items ───────────────────────────────────────────────────

export async function fetchCategories(): Promise<{ id: string; name: string }[]> {
  try {
    const res = await apiClient.get<any>(API_ENDPOINTS.COMMON.SERVICE_CATEGORIES)
    if (!res.success) return []
    
    const data = res.data
    if (Array.isArray(data)) return data
    if (data?.categories && Array.isArray(data.categories)) return data.categories
    if (data?.data && Array.isArray(data.data)) return data.data
    return []
  } catch (e) {
    console.error('fetchCategories failed:', e)
    return []
  }
}

export async function fetchServiceItems(): Promise<{ id: string; name: string; categoryId: string }[]> {
  try {
    const res = await apiClient.get<any>(API_ENDPOINTS.COMMON.SERVICE_ITEMS)
    if (!res.success) return []
    
    const data = res.data
    if (Array.isArray(data)) return data
    if (data?.items && Array.isArray(data.items)) return data.items
    if (data?.data && Array.isArray(data.data)) return data.data
    return []
  } catch (e) {
    console.error('fetchServiceItems failed:', e)
    return []
  }
}
// ─── Coupons ──────────────────────────────────────────────────────────────────
export interface Coupon {
  id?: string
  code: string
  discountPercent: number
  maxDiscount?: number
  expiryDate: string
  isActive?: boolean
  usageLimit?: number
  usedCount?: number
  createdAt?: string
  isVisibleOnHome?: boolean
  price?: number
  allowedJobsCount?: number
  jobDurationMinutes?: number
  description?: string
}

export async function fetchCoupons(): Promise<Coupon[]> {
  const res = await apiClient.get<any>(API_ENDPOINTS.COUPONS.LIST)
  if (!res.success) throw new Error(res.error?.message || 'Failed to load coupons')
  const data = res.data
  if (Array.isArray(data)) return data
  if (data?.data) return data.data
  return []
}

export async function createCoupon(data: Coupon): Promise<any> {
  const res = await apiClient.post(API_ENDPOINTS.COUPONS.CREATE, data)
  if (!res.success) throw new Error(res.error?.message || 'Failed to create coupon')
  return res.data
}

export async function deleteCoupon(id: string): Promise<any> {
  const res = await apiClient.delete(API_ENDPOINTS.COUPONS.DELETE(id))
  if (!res.success) throw new Error(res.error?.message || 'Failed to delete coupon')
  return res.data
}

// ─── Shifts ───────────────────────────────────────────────────────────────────
export interface ShiftType {
  id?: string
  Shift_Name: string
  Duration_hours: number
  Daily_Salary: number | string
  Overtime_Rate: number | string
  attendancePercent?: number
  targetJobs?: number
  status?: 'ACTIVE' | 'DISABLED'
  createdAt?: string
  updatedAt?: string
}

export async function fetchShiftTypes(): Promise<ShiftType[]> {
  const res = await apiClient.get<any>(API_ENDPOINTS.SHIFTS.LIST)
  if (!res.success) throw new Error(res.error?.message || 'Failed to load shift configurations')
  const data = res.data
  if (Array.isArray(data)) return data
  if (data?.data) return data.data
  return []
}

export async function createShiftType(data: ShiftType): Promise<any> {
  const res = await apiClient.post(API_ENDPOINTS.SHIFTS.CREATE, data)
  if (!res.success) throw new Error(res.error?.message || 'Failed to create shift configuration')
  return res.data
}

export async function updateShiftType(id: string, data: Partial<ShiftType>): Promise<any> {
  const res = await apiClient.patch(API_ENDPOINTS.SHIFTS.UPDATE(id), data)
  if (!res.success) throw new Error(res.error?.message || 'Failed to update shift configuration')
  return res.data
}

export async function deleteShiftType(id: string): Promise<any> {
  const res = await apiClient.delete(API_ENDPOINTS.SHIFTS.DELETE(id))
  if (!res.success) throw new Error(res.error?.message || 'Failed to delete shift configuration')
  return res.data
}

// ─── Shift Assignments ────────────────────────────────────────────────────────
export interface ShiftAssignment {
  id?: string
  provider_id: string
  shift_type_id: string
  assignment_date: string
  Status?: string
  created_at?: string
  updated_at?: string
  // UI Display helpers:
  providerName?: string
  shiftName?: string
  durationHours?: number
  dailySalary?: number
  city?: string
  area?: string
}

export async function fetchShiftAssignments(params?: { provider_id?: string; shift_type_id?: string; date?: string }): Promise<ShiftAssignment[]> {
  const res = await apiClient.get<any>(API_ENDPOINTS.SHIFT_ASSIGNMENTS.LIST, params)
  if (!res.success) throw new Error(res.error?.message || 'Failed to load shift assignments')
  const data = res.data
  if (Array.isArray(data)) return data
  if (data?.data) return data.data
  return []
}

export async function assignShift(data: { provider_id: string; shift_type_id: string; assignment_date: string }): Promise<any> {
  const res = await apiClient.post(API_ENDPOINTS.SHIFT_ASSIGNMENTS.ASSIGN, data)
  if (!res.success) throw new Error(res.error?.message || 'Failed to assign provider to shift')
  return res.data
}

export async function updateShiftAssignmentStatus(id: string, status: string): Promise<any> {
  const res = await apiClient.patch(API_ENDPOINTS.SHIFT_ASSIGNMENTS.UPDATE_STATUS(id), { status })
  if (!res.success) throw new Error(res.error?.message || 'Failed to update shift assignment status')
  return res.data
}

export async function deleteShiftAssignment(id: string): Promise<any> {
  const res = await apiClient.delete(API_ENDPOINTS.SHIFT_ASSIGNMENTS.DELETE(id))
  if (!res.success) throw new Error(res.error?.message || 'Failed to delete/cancel shift assignment')
  return res.data
}

// ─── Attendance Management ───────────────────────────────────────────────────
export interface ProviderAttendance {
  id?: string
  provider_id: string
  shift_type_id: string
  attendance_date: string
  in_time: string
  out_time?: string
  total_hours: number
  Status: 'PRESENT' | 'HALF_DAY' | 'LATE' | 'ABSENT'
  // UI helper fields:
  providerName?: string
  providerPhone?: string
  shiftName?: string
  baseSalary?: number
}

export async function fetchAttendance(params?: { date?: string; providerId?: string; status?: string }): Promise<ProviderAttendance[]> {
  const res = await apiClient.get<any>(API_ENDPOINTS.ATTENDANCE.LIST, params)
  if (!res.success) throw new Error(res.error?.message || 'Failed to load attendance logs')
  const data = res.data as any
  if (Array.isArray(data)) return data
  if (data?.data && Array.isArray(data.data)) return data.data
  return []
}

export async function adjustAttendanceHours(id: string, data: { in_time: string; out_time: string; Status: string }): Promise<any> {
  const res = await apiClient.patch(API_ENDPOINTS.ATTENDANCE.ADJUST(id), data)
  if (!res.success) throw new Error(res.error?.message || 'Failed to adjust attendance hours')
  return res.data
}

export async function fetchProviderTelemetry(providerId: string, params?: { date?: string }): Promise<any[]> {
  const res = await apiClient.get<any[]>(API_ENDPOINTS.ATTENDANCE.GPS_LOGS(providerId), params)
  if (!res.success) throw new Error(res.error?.message || 'Failed to load provider GPS telemetry logs')
  const data = res.data as any
  if (Array.isArray(data)) return data
  if (data?.data && Array.isArray(data.data)) return data.data
  return []
}

// ─── Salary Ledger Management ───────────────────────────────────────────────────

export interface DailySalaryLedger {
  id: string
  providerId: string
  providerName: string
  providerPhone: string
  date: string
  baseSalary: number
  bonus: number
  bonusReason?: string
  penalty: number
  penaltyReason?: string
  overtimeHours: number
  overtimeRate: number
  overtimePay: number
  finalSalary: number
  status: 'Paid' | 'Approved' | 'Pending Review' | 'Disputed'
  city?: string
  checkInTime?: string
  checkOutTime?: string
  shiftName?: string
}

// Memory cache to persist manual overrides during dev session
let memoryLedgerStore: DailySalaryLedger[] | null = null

function generateMockSalaryLedgers(dateFrom?: string, dateTo?: string): DailySalaryLedger[] {
  const providers = [
    { id: 'john-doe-uuid', name: 'John Doe', phone: '+919876543210', city: 'Mumbai', shift: 'Morning Shift (8h)', base: 600, ot: 100 },
    { id: 'ravi-kumar-uuid', name: 'Ravi Kumar', phone: '+919999988888', city: 'Budapest', shift: 'Evening Shift (8h)', base: 800, ot: 150 },
    { id: 'sarah-jenkins-uuid', name: 'Sarah Jenkins', phone: '+1234567890', city: 'London', shift: 'Night Shift (8h)', base: 950, ot: 180 },
    { id: 'amit-patel-uuid', name: 'Amit Patel', phone: '+919111122222', city: 'Mumbai', shift: 'Standard Shift (8h)', base: 600, ot: 100 },
    { id: 'priya-sharma-uuid', name: 'Priya Sharma', phone: '+919333344444', city: 'Budapest', shift: 'Morning Shift (8h)', base: 800, ot: 150 },
    { id: 'david-miller-uuid', name: 'David Miller', phone: '+447777888888', city: 'London', shift: 'Standard Shift (8h)', base: 950, ot: 180 },
  ]

  const records: DailySalaryLedger[] = []
  
  // Calculate dates between from and to (or default to last 7 days)
  const end = dateTo ? new Date(dateTo) : new Date()
  const start = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 7 * 86400000)
  
  // Ensure dates are parsed correctly
  const curr = new Date(start)
  while (curr <= end) {
    const dateStr = curr.toISOString().split('T')[0]
    
    providers.forEach((p, idx) => {
      // Create some variance based on date/index
      const daySeed = curr.getDate() + idx
      const worked = daySeed % 7 !== 0 // off-day once a week
      
      if (worked) {
        let baseSalary = p.base
        let bonus = 0
        let bonusReason = ''
        let penalty = 0
        let penaltyReason = ''
        let overtimeHours = 0
        
        // Add random bonus or penalty for premium mock feel
        if (daySeed % 5 === 0) {
          bonus = 150
          bonusReason = 'High Rating Incentive (5-star job)'
        } else if (daySeed % 8 === 0) {
          bonus = 100
          bonusReason = 'Perfect Attendance Bonus'
        }
        
        if (daySeed % 6 === 0) {
          penalty = 50
          penaltyReason = 'Late Check-in (>15 mins)'
        } else if (daySeed % 11 === 0) {
          penalty = 120
          penaltyReason = 'Safety Protocol Warning'
        }
        
        if (daySeed % 4 === 0) {
          overtimeHours = daySeed % 3 === 0 ? 2 : 1.5
        }

        const overtimeRate = p.ot
        const overtimePay = overtimeHours * overtimeRate
        const finalSalary = baseSalary + bonus + overtimePay - penalty
        
        const statuses: DailySalaryLedger['status'][] = ['Paid', 'Approved', 'Pending Review', 'Disputed']
        const status = statuses[daySeed % statuses.length]

        const checkIn = new Date(`${dateStr}T09:00:00`)
        if (penalty > 0) {
          checkIn.setMinutes(25) // Checked in late
        }
        const checkOut = new Date(`${dateStr}T17:00:00`)
        if (overtimeHours > 0) {
          checkOut.setMinutes(overtimeHours * 60) // Stayed late
        }

        records.push({
          id: `sl-${p.id}-${dateStr}`,
          providerId: p.id,
          providerName: p.name,
          providerPhone: p.phone,
          date: dateStr,
          baseSalary,
          bonus,
          bonusReason,
          penalty,
          penaltyReason,
          overtimeHours,
          overtimeRate,
          overtimePay,
          finalSalary,
          status,
          city: p.city,
          checkInTime: checkIn.toISOString(),
          checkOutTime: status === 'Pending Review' && daySeed % 2 === 0 ? undefined : checkOut.toISOString(),
          shiftName: p.shift
        })
      }
    })
    curr.setDate(curr.getDate() + 1)
  }
  
  return records
}

export async function fetchSalaryLedger(params?: {
  dateFrom?: string
  dateTo?: string
  providerId?: string
  city?: string
  status?: string
}): Promise<DailySalaryLedger[]> {
  try {
    // Attempt backend call first (fallback to mock if endpoint doesn't exist)
    const res = await apiClient.get<any>('/admin/salary-ledger', params)
    
    let ledgers: DailySalaryLedger[] = []
    if (res.success && Array.isArray(res.data)) {
      ledgers = res.data
    } else {
      // Backend not implemented or down, initialize/use memory storage
      if (!memoryLedgerStore) {
        memoryLedgerStore = generateMockSalaryLedgers(params?.dateFrom, params?.dateTo)
      }
      ledgers = memoryLedgerStore
    }
    
    // Apply client-side filters
    return ledgers.filter(item => {
      if (params?.providerId && item.providerId !== params.providerId) return false
      if (params?.city && params.city !== 'all' && item.city?.toLowerCase() !== params.city.toLowerCase()) return false
      if (params?.status && params.status !== 'all' && item.status !== params.status) return false
      if (params?.dateFrom && item.date < params.dateFrom) return false
      if (params?.dateTo && item.date > params.dateTo) return false
      return true
    })
  } catch (e) {
    console.warn('Salary Ledger API failed, using high-fidelity mock fallback.', e)
    if (!memoryLedgerStore) {
      memoryLedgerStore = generateMockSalaryLedgers(params?.dateFrom, params?.dateTo)
    }
    return memoryLedgerStore.filter(item => {
      if (params?.providerId && item.providerId !== params.providerId) return false
      if (params?.city && params.city !== 'all' && item.city?.toLowerCase() !== params.city.toLowerCase()) return false
      if (params?.status && params.status !== 'all' && item.status !== params.status) return false
      if (params?.dateFrom && item.date < params.dateFrom) return false
      if (params?.dateTo && item.date > params.dateTo) return false
      return true
    })
  }
}

export async function updateSalaryLedger(
  id: string,
  updates: Partial<DailySalaryLedger>
): Promise<DailySalaryLedger> {
  try {
    const res = await apiClient.patch<DailySalaryLedger>(`/admin/salary-ledger/${id}`, updates)
    if (res.success && res.data) {
      // Sync local memory store
      if (memoryLedgerStore) {
        memoryLedgerStore = memoryLedgerStore.map(item => item.id === id ? { ...item, ...res.data! } : item)
      }
      return res.data
    }
  } catch (e) {
    console.warn('Backend update failed, updating memory storage.', e)
  }

  // Update in memory store
  if (!memoryLedgerStore) {
    memoryLedgerStore = generateMockSalaryLedgers()
  }
  
  let updatedItem: DailySalaryLedger | null = null
  memoryLedgerStore = memoryLedgerStore.map(item => {
    if (item.id === id) {
      const merged = { ...item, ...updates }
      // Recalculate Final Salary
      merged.overtimePay = merged.overtimeHours * merged.overtimeRate
      merged.finalSalary = merged.baseSalary + merged.bonus + merged.overtimePay - merged.penalty
      updatedItem = merged
      return merged
    }
    return item
  })

  if (!updatedItem) {
    throw new Error('Ledger record not found')
  }
  return updatedItem
}

// ─── Incentives & Penalties Rule Configurations ─────────────────────────────────

export interface PayrollRule {
  id: string
  name: string
  type: 'Incentive' | 'Penalty'
  category: 'Attendance' | 'Rating' | 'Shift' | 'Compliance'
  conditionText: string
  valueType: 'Flat' | 'Percentage'
  value: number
  city: string
  status: 'Active' | 'Inactive'
  createdAt: string
}

let memoryRulesStore: PayrollRule[] | null = null

const PRESET_PAYROLL_RULES: PayrollRule[] = [
  {
    id: 'rule-attendance-bonus',
    name: 'Full Attendance Bonus',
    type: 'Incentive',
    category: 'Attendance',
    conditionText: 'Complete all assigned shifts in the week with 100% attendance',
    valueType: 'Flat',
    value: 500,
    city: 'All',
    status: 'Active',
    createdAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 'rule-late-login-penalty',
    name: 'Late Login Penalty',
    type: 'Penalty',
    category: 'Attendance',
    conditionText: 'Clock-in recorded after shift start time (>15 mins late)',
    valueType: 'Flat',
    value: 50,
    city: 'All',
    status: 'Active',
    createdAt: '2026-01-11T12:00:00Z'
  },
  {
    id: 'rule-high-rating-bonus',
    name: 'High Customer Rating Incentive',
    type: 'Incentive',
    category: 'Rating',
    conditionText: 'Maintain an average customer feedback rating of 4.8 or above',
    valueType: 'Percentage',
    value: 10, // 10% of base
    city: 'All',
    status: 'Active',
    createdAt: '2026-01-12T12:00:00Z'
  },
  {
    id: 'rule-safety-warning-penalty',
    name: 'Safety & Protocol Warning',
    type: 'Penalty',
    category: 'Compliance',
    conditionText: 'Levied upon safety checks failures or protocol violation reports',
    valueType: 'Flat',
    value: 120,
    city: 'All',
    status: 'Active',
    createdAt: '2026-01-13T12:00:00Z'
  },
  {
    id: 'rule-perfect-weekend-bonus',
    name: 'Perfect Weekend Attendance',
    type: 'Incentive',
    category: 'Attendance',
    conditionText: 'Complete weekend shifts successfully without late check-ins',
    valueType: 'Flat',
    value: 300,
    city: 'Mumbai',
    status: 'Active',
    createdAt: '2026-01-15T12:00:00Z'
  },
  {
    id: 'rule-early-checkout-penalty',
    name: 'Early Checkout Deduction',
    type: 'Penalty',
    category: 'Attendance',
    conditionText: 'Leaving shift duty early without permission (>30 mins early)',
    valueType: 'Percentage',
    value: 5, // 5% of base
    city: 'London',
    status: 'Active',
    createdAt: '2026-01-20T12:00:00Z'
  }
]

export async function fetchPayrollRules(): Promise<PayrollRule[]> {
  try {
    const res = await apiClient.get<any>('/admin/payroll-rules')
    if (res.success && Array.isArray(res.data)) {
      return res.data
    }
  } catch (e) {
    console.warn('Backend fetchPayrollRules failed, falling back to mock rule configurations.', e)
  }

  if (!memoryRulesStore) {
    memoryRulesStore = [...PRESET_PAYROLL_RULES]
  }
  return memoryRulesStore
}

export async function createPayrollRule(rule: PayrollRule): Promise<PayrollRule> {
  try {
    const res = await apiClient.post<PayrollRule>('/admin/payroll-rules', rule)
    if (res.success && res.data) {
      if (memoryRulesStore) {
        memoryRulesStore.push(res.data)
      }
      return res.data
    }
  } catch (e) {
    console.warn('Backend createPayrollRule failed, writing to memory store.', e)
  }

  if (!memoryRulesStore) {
    memoryRulesStore = [...PRESET_PAYROLL_RULES]
  }
  memoryRulesStore.push(rule)
  return rule
}

export async function updatePayrollRule(id: string, updates: Partial<PayrollRule>): Promise<PayrollRule> {
  try {
    const res = await apiClient.patch<PayrollRule>(`/admin/payroll-rules/${id}`, updates)
    if (res.success && res.data) {
      if (memoryRulesStore) {
        memoryRulesStore = memoryRulesStore.map(r => r.id === id ? { ...r, ...res.data! } : r)
      }
      return res.data
    }
  } catch (e) {
    console.warn('Backend updatePayrollRule failed, updating memory store.', e)
  }

  if (!memoryRulesStore) {
    memoryRulesStore = [...PRESET_PAYROLL_RULES]
  }
  
  let updated: PayrollRule | null = null
  memoryRulesStore = memoryRulesStore.map(r => {
    if (r.id === id) {
      updated = { ...r, ...updates }
      return updated
    }
    return r
  })

  if (!updated) {
    throw new Error('Payroll rule not found')
  }
  return updated
}

export async function deletePayrollRule(id: string): Promise<void> {
  try {
    await apiClient.delete(`/admin/payroll-rules/${id}`)
    if (memoryRulesStore) {
      memoryRulesStore = memoryRulesStore.filter(r => r.id !== id)
    }
    return
  } catch (e) {
    console.warn('Backend deletePayrollRule failed, removing from memory store.', e)
  }

  if (memoryRulesStore) {
    memoryRulesStore = memoryRulesStore.filter(r => r.id !== id)
  }
}

// ─── Payroll Settlements & Payout Batches (FR-PAY-009) ─────────────────────────

export interface PayoutSettlementItem {
  id: string
  providerId: string
  providerName: string
  providerPhone: string
  amount: number
  bankName: string
  accountNumber: string
  ifscCode: string
  status: string
  city?: string
  ledgerDate: string
  payoutCycle?: string | Date
  bonus?: number
  penalty?: number
  deduction?: number
}

export interface SettlementBatch {
  id: string
  batchCode: string
  dateFrom: string
  dateTo: string
  totalAmount: number
  providerCount: number
  status: 'Draft' | 'Validating' | 'Processing' | 'Settled'
  processedBy: string
  createdAt: string
}

let memoryPayoutsStore: PayoutSettlementItem[] | null = null
let memoryBatchesStore: SettlementBatch[] | null = null

const PRESET_PAYOUT_SETTLEMENTS: PayoutSettlementItem[] = [
  {
    id: 'ps-1',
    providerId: 'john-doe-uuid',
    providerName: 'John Doe',
    providerPhone: '+919876543210',
    amount: 1150,
    bankName: 'HDFC Bank',
    accountNumber: 'XXXXXX8822',
    ifscCode: 'HDFC0000104',
    status: 'Approve',
    city: 'Mumbai',
    ledgerDate: new Date().toISOString().split('T')[0]
  },
  {
    id: 'ps-2',
    providerId: 'ravi-kumar-uuid',
    providerName: 'Ravi Kumar',
    providerPhone: '+919999988888',
    amount: 900,
    bankName: 'State Bank of India',
    accountNumber: 'XXXXXX5544',
    ifscCode: 'SBIN0000301',
    status: 'Hold',
    city: 'Budapest',
    ledgerDate: new Date().toISOString().split('T')[0]
  },
  {
    id: 'ps-3',
    providerId: 'sarah-jenkins-uuid',
    providerName: 'Sarah Jenkins',
    providerPhone: '+1234567890',
    amount: 1250,
    bankName: 'Barclays Bank',
    accountNumber: 'XXXXXX1199',
    ifscCode: 'BARC0200400',
    status: 'Approve',
    city: 'London',
    ledgerDate: new Date().toISOString().split('T')[0]
  },
  {
    id: 'ps-4',
    providerId: 'amit-patel-uuid',
    providerName: 'Amit Patel',
    providerPhone: '+919111122222',
    amount: 700,
    bankName: 'ICICI Bank',
    accountNumber: 'XXXXXX9911',
    ifscCode: 'ICIC0000222',
    status: 'Approve',
    city: 'Mumbai',
    ledgerDate: new Date().toISOString().split('T')[0]
  },
  {
    id: 'ps-5',
    providerId: 'priya-sharma-uuid',
    providerName: 'Priya Sharma',
    providerPhone: '+919333344444',
    amount: 1300,
    bankName: 'Axis Bank',
    accountNumber: 'XXXXXX4433',
    ifscCode: 'UTIB0000052',
    status: 'Approve',
    city: 'Budapest',
    ledgerDate: new Date().toISOString().split('T')[0]
  },
  {
    id: 'ps-6',
    providerId: 'david-miller-uuid',
    providerName: 'David Miller',
    providerPhone: '+447777888888',
    amount: 950,
    bankName: 'HSBC Bank',
    accountNumber: 'XXXXXX3355',
    ifscCode: 'HSBC0000024',
    status: 'Reject',
    city: 'London',
    ledgerDate: new Date().toISOString().split('T')[0]
  }
]

const PRESET_SETTLEMENT_BATCHES: SettlementBatch[] = [
  {
    id: 'batch-1',
    batchCode: 'BATCH-20260520-A',
    dateFrom: '2026-05-13',
    dateTo: '2026-05-20',
    totalAmount: 24500,
    providerCount: 18,
    status: 'Settled',
    processedBy: 'Super Admin',
    createdAt: '2026-05-20T17:30:00Z'
  },
  {
    id: 'batch-2',
    batchCode: 'BATCH-20260513-A',
    dateFrom: '2026-05-06',
    dateTo: '2026-05-13',
    totalAmount: 18900,
    providerCount: 14,
    status: 'Settled',
    processedBy: 'Finance Admin',
    createdAt: '2026-05-13T16:15:00Z'
  }
]

export async function fetchPayoutSettlements(params?: { dateFrom?: string; dateTo?: string; status?: string }): Promise<PayoutSettlementItem[]> {
  try {
    const queryParams: any = {}
    if (params?.dateFrom) queryParams.startDate = params.dateFrom
    if (params?.dateTo) queryParams.endDate = params.dateTo
    if (params?.status) queryParams.status = params.status

    const res = await apiClient.get<any>('/admin/payroll/settlements', queryParams)
    if (res.success && Array.isArray(res.data)) {
      return res.data
    }
  } catch (e) {
    console.warn('Backend fetchPayoutSettlements failed, falling back to mock dataset.', e)
  }

  if (!memoryPayoutsStore) {
    memoryPayoutsStore = [...PRESET_PAYOUT_SETTLEMENTS]
  }

  // Filter local mock store for dev fallback compatibility
  return memoryPayoutsStore.filter(item => {
    if (params?.status) {
      // Map frontend tab statuses to mock database status values
      const mappedStatus = params.status === 'Approve' ? 'APPROVED' : params.status === 'Hold' ? 'HOLD' : params.status === 'Reject' ? 'REJECTED' : params.status;
      if (item.status.toUpperCase() !== mappedStatus.toUpperCase()) return false;
    }
    return true;
  })
}

export async function generatePayrollSettlements(startDate: string, endDate: string): Promise<any> {
  const res = await apiClient.post<any>('/admin/payroll/settlements', { startDate, endDate })
  if (!res.success) {
    throw new Error(res.error?.message || 'Failed to generate payroll settlements')
  }
  return res.data
}

export async function approvePayrollSettlement(id: string): Promise<any> {
  const res = await apiClient.patch<any>(`/admin/payroll/settlement/${id}/approve`)
  if (!res.success) {
    throw new Error(res.error?.message || 'Failed to approve payroll settlement')
  }
  if (memoryPayoutsStore) {
    memoryPayoutsStore = memoryPayoutsStore.map(item => item.id === id ? { ...item, status: 'Approve' } : item)
  }
  return res.data
}

export async function disbursePayrollSettlement(id: string): Promise<any> {
  const res = await apiClient.post<any>(`/admin/payroll/settlement/${id}/disburse`)
  if (!res.success) {
    throw new Error(res.error?.message || 'Failed to disburse payroll settlement')
  }
  if (memoryPayoutsStore) {
    memoryPayoutsStore = memoryPayoutsStore.filter(item => item.id !== id)
  }
  return res.data
}

export async function updatePayoutSettlementStatus(id: string, status: 'Approve' | 'Hold' | 'Reject'): Promise<PayoutSettlementItem> {
  try {
    if (status === 'Approve') {
      await approvePayrollSettlement(id)
      return { id, status } as any
    }
    
    // Fallback/Mock for Hold/Reject local overrides
    const res = await apiClient.patch<PayoutSettlementItem>(`/admin/payroll-settlements/${id}/status`, { status })
    if (res.success && res.data) {
      if (memoryPayoutsStore) {
        memoryPayoutsStore = memoryPayoutsStore.map(item => item.id === id ? { ...item, status } : item)
      }
      return res.data
    }
  } catch (e) {
    console.warn('Backend updatePayoutSettlementStatus failed, updating memory store.', e)
  }

  if (!memoryPayoutsStore) {
    memoryPayoutsStore = [...PRESET_PAYOUT_SETTLEMENTS]
  }

  let updated: PayoutSettlementItem | null = null
  memoryPayoutsStore = memoryPayoutsStore.map(item => {
    if (item.id === id) {
      updated = { ...item, status }
      return updated
    }
    return item
  })

  if (!updated) {
    throw new Error('Settlement item not found')
  }
  return updated
}

export async function createSettlementBatch(data: { dateFrom: string; dateTo: string; providerIds: string[] }): Promise<SettlementBatch> {
  // Compute amount
  if (!memoryPayoutsStore) {
    memoryPayoutsStore = [...PRESET_PAYOUT_SETTLEMENTS]
  }
  const selectedPayouts = memoryPayoutsStore.filter(item => data.providerIds.includes(item.providerId))
  const totalAmount = selectedPayouts.reduce((sum, item) => sum + item.amount, 0)
  
  const newBatch: SettlementBatch = {
    id: `batch-${Date.now()}`,
    batchCode: `BATCH-${data.dateFrom.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
    dateFrom: data.dateFrom,
    dateTo: data.dateTo,
    totalAmount,
    providerCount: data.providerIds.length,
    status: 'Settled',
    processedBy: 'Finance Admin',
    createdAt: new Date().toISOString()
  }

  try {
    const res = await apiClient.post<SettlementBatch>('/admin/payroll-batches', newBatch)
    if (res.success && res.data) {
      if (memoryBatchesStore) {
        memoryBatchesStore.push(res.data)
      }
      return res.data
    }
  } catch (e) {
    console.warn('Backend createSettlementBatch failed, writing to memory store.', e)
  }

  if (!memoryBatchesStore) {
    memoryBatchesStore = [...PRESET_SETTLEMENT_BATCHES]
  }
  memoryBatchesStore.push(newBatch)

  // Optimistically set the status of processed payouts to Paid or remove them from pending list
  // For safety in local memory, let's keep them but we can manage them
  return newBatch
}

export async function fetchSettlementBatches(): Promise<SettlementBatch[]> {
  try {
    const res = await apiClient.get<any>('/admin/payroll-batches')
    if (res.success && Array.isArray(res.data)) {
      return res.data
    }
  } catch (e) {
    console.warn('Backend fetchSettlementBatches failed, falling back to mock dataset.', e)
  }

  if (!memoryBatchesStore) {
    memoryBatchesStore = [...PRESET_SETTLEMENT_BATCHES]
  }
  return memoryBatchesStore
}

// ─── Payroll Generated Reports History (FR-PAY-011) ───────────────────────────

export interface PayrollReportRecord {
  id: string
  reportName: string
  reportType: 'Disbursement Summary' | 'Incentives & Penalties' | 'Provider Earnings' | 'Audit Trail'
  dateFrom: string
  dateTo: string
  recordCount: number
  generatedBy: string
  fileFormat: 'PDF' | 'EXCEL' | 'CSV'
  fileSize: string
  createdAt: string
}

let memoryReportsStore: PayrollReportRecord[] | null = null

export async function fetchGeneratedReports(): Promise<PayrollReportRecord[]> {
  if (!memoryReportsStore) {
    memoryReportsStore = [
      {
        id: 'rep-1',
        reportName: 'Q1_Disbursement_Summary_2026',
        reportType: 'Disbursement Summary',
        dateFrom: '2026-01-01',
        dateTo: '2026-03-31',
        recordCount: 48,
        generatedBy: 'Super Admin',
        fileFormat: 'PDF',
        fileSize: '1.2 MB',
        createdAt: '2026-04-01T10:00:00Z'
      },
      {
        id: 'rep-2',
        reportName: 'Attendance_Incentives_May_2026',
        reportType: 'Incentives & Penalties',
        dateFrom: '2026-05-01',
        dateTo: '2026-05-24',
        recordCount: 156,
        generatedBy: 'Finance Admin',
        fileFormat: 'EXCEL',
        fileSize: '340 KB',
        createdAt: '2026-05-24T15:30:00Z'
      }
    ]
  }
  return memoryReportsStore
}

export async function createPayrollReport(report: Omit<PayrollReportRecord, 'id' | 'createdAt'>): Promise<PayrollReportRecord> {
  const newReport: PayrollReportRecord = {
    ...report,
    id: `rep-${Date.now()}`,
    createdAt: new Date().toISOString()
  }
  if (!memoryReportsStore) {
    await fetchGeneratedReports()
  }
  memoryReportsStore!.push(newReport)
  return newReport
}





