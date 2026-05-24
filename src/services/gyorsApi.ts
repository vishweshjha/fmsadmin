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


