/**
 * Dashboard API Service
 * API calls specific to the Dashboard page
 */

import apiClient from './apiClient'
import API_ENDPOINTS from '../../mock/api-endpoints'
import {
  DashboardStatsRequest,
  DashboardStatsResponse,
  BookingListRequest,
  BookingListResponse,
  RevenueAnalyticsRequest,
  RevenueAnalyticsResponse,
  BookingStatsResponse,
  KYCStatsResponse,
} from '../../mock/api-schemas'

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(
  params?: DashboardStatsRequest
): Promise<DashboardStatsResponse> {
  const response = await apiClient.get<DashboardStatsResponse['data']>(
    API_ENDPOINTS.ANALYTICS.DASHBOARD_STATS,
    params
  )

  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to fetch dashboard stats')
  }

  return {
    success: true,
    data: response.data,
  }
}

/**
 * Get recent bookings
 */
export async function getRecentBookings(
  params?: BookingListRequest
): Promise<BookingListResponse> {
  const response = await apiClient.get<BookingListResponse['data']>(
    API_ENDPOINTS.BOOKINGS.LIST,
    {
      ...params,
      limit: params?.limit || 10,
      sortBy: 'bookingDate',
      sortOrder: 'desc',
    }
  )

  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to fetch bookings')
  }

  return {
    success: true,
    data: response.data,
    pagination: response.pagination,
  }
}

/**
 * Get booking statistics
 */
export async function getBookingStats(): Promise<BookingStatsResponse> {
  const response = await apiClient.get<BookingStatsResponse['data']>(
    API_ENDPOINTS.BOOKINGS.STATS
  )

  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to fetch booking stats')
  }

  return {
    success: true,
    data: response.data,
  }
}

/**
 * Get revenue analytics (for productivity chart)
 */
export async function getRevenueAnalytics(
  params?: RevenueAnalyticsRequest
): Promise<RevenueAnalyticsResponse> {
  const response = await apiClient.get<RevenueAnalyticsResponse['data']>(
    API_ENDPOINTS.ANALYTICS.REVENUE_ANALYTICS,
    params
  )

  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to fetch revenue analytics')
  }

  return {
    success: true,
    data: response.data,
  }
}

/**
 * Get KYC statistics
 */
export async function getKYCStats(): Promise<KYCStatsResponse> {
  const response = await apiClient.get<KYCStatsResponse['data']>(
    API_ENDPOINTS.KYC.STATS
  )

  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to fetch KYC stats')
  }

  return {
    success: true,
    data: response.data,
  }
}

/**
 * Get real-time metrics
 */
export async function getRealTimeMetrics() {
  const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.REAL_TIME_METRICS)

  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to fetch real-time metrics')
  }

  return response.data
}
