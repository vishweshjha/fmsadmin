/**
 * Dashboard API Service (re-exports from gyorsApi for backward compatibility)
 */
import { fetchDashboardStats, fetchBookings, fetchRevenueAnalytics, fetchPendingKYC } from './gyorsApi'

export type DashboardStatsRequest = { dateFrom?: string; dateTo?: string }
export type DashboardStatsResponse = { success: boolean; data?: any }
export type BookingListRequest = { limit?: number; page?: number; status?: string }
export type BookingListResponse = { success: boolean; data?: any[]; pagination?: any }
export type RevenueAnalyticsRequest = { dateFrom?: string; dateTo?: string; granularity?: string }
export type RevenueAnalyticsResponse = { success: boolean; data?: any[] }
export type BookingStatsResponse = { success: boolean; data?: any }
export type KYCStatsResponse = { success: boolean; data?: any }

export async function getDashboardStats(_params?: DashboardStatsRequest): Promise<DashboardStatsResponse> {
  try {
    const data = await fetchDashboardStats()
    return { success: true, data }
  } catch {
    return { success: false }
  }
}

export async function getRecentBookings(params?: BookingListRequest): Promise<BookingListResponse> {
  try {
    const data = await fetchBookings(params as any)
    return { success: true, data }
  } catch {
    return { success: false, data: [] }
  }
}

export async function getBookingStats(): Promise<BookingStatsResponse> {
  try {
    const bookings = await fetchBookings()
    return {
      success: true,
      data: {
        total: bookings.length,
        pendingAssignment: bookings.filter((b: any) => b.status?.toLowerCase().includes('pending')).length,
        inProgress: bookings.filter((b: any) => b.status?.toLowerCase().includes('progress')).length,
        completed: bookings.filter((b: any) => b.status?.toLowerCase().includes('complete')).length,
        cancelled: bookings.filter((b: any) => b.status?.toLowerCase().includes('cancel')).length,
        totalRevenue: bookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0),
        averageBookingValue: bookings.length ? bookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0) / bookings.length : 0,
      }
    }
  } catch {
    return { success: false }
  }
}

export async function getRevenueAnalytics(_params?: RevenueAnalyticsRequest): Promise<RevenueAnalyticsResponse> {
  try {
    const data = await fetchRevenueAnalytics()
    return { success: true, data }
  } catch {
    return { success: false, data: [] }
  }
}

export async function getKYCStats(): Promise<KYCStatsResponse> {
  try {
    const list = await fetchPendingKYC()
    return {
      success: true,
      data: {
        pending: list.filter((k: any) => k.status?.toLowerCase() === 'pending').length,
        approved: list.filter((k: any) => k.status?.toLowerCase() === 'approved').length,
        rejected: list.filter((k: any) => k.status?.toLowerCase() === 'rejected').length,
        total: list.length,
      }
    }
  } catch {
    return { success: false }
  }
}

export async function getRealTimeMetrics() {
  try {
    return await fetchDashboardStats()
  } catch {
    return {}
  }
}
