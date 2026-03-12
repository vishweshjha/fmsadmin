/**
 * Analytics & Reporting API Schemas
 */

export interface DashboardStatsRequest {
  dateFrom?: string
  dateTo?: string
  city?: string
  serviceCategory?: string
}

export interface DashboardStatsResponse {
  success: boolean
  data: {
    totalBookings: number
    activeUsers: number
    revenue: number
    pendingKYC: number
    bookingsGrowth: number
    usersGrowth: number
    revenueGrowth: number
    averageResponseTime: number
  }
}

export interface DemandSupplyHeatmapRequest {
  dateFrom: string
  dateTo: string
  city?: string
  serviceCategory?: string
  granularity: 'hour' | 'day' | 'week'
}

export interface DemandSupplyHeatmapResponse {
  success: boolean
  data: DemandSupplyDataPoint[]
}

export interface DemandSupplyDataPoint {
  timestamp: string
  demand: number
  supply: number
  gap: number
}

export interface ServiceDistributionRequest {
  dateFrom: string
  dateTo: string
  city?: string
}

export interface ServiceDistributionResponse {
  success: boolean
  data: ServiceDistributionItem[]
}

export interface ServiceDistributionItem {
  serviceName: string
  category: string
  count: number
  percentage: number
  revenue: number
}

export interface SLAMetricsRequest {
  dateFrom: string
  dateTo: string
  city?: string
}

export interface SLAMetricsResponse {
  success: boolean
  data: {
    responseTime: SLAMetric
    completionRate: SLAMetric
    customerSatisfaction: SLAMetric
    providerOnTime: SLAMetric
  }
}

export interface SLAMetric {
  target: number
  actual: number
  status: 'Excellent' | 'Good' | 'Warning' | 'Critical'
  trend: 'up' | 'down' | 'stable'
}

export interface RevenueAnalyticsRequest {
  dateFrom: string
  dateTo: string
  granularity: 'day' | 'week' | 'month'
  city?: string
  serviceCategory?: string
}

export interface RevenueAnalyticsResponse {
  success: boolean
  data: RevenueDataPoint[]
}

export interface RevenueDataPoint {
  period: string
  revenue: number
  bookings: number
  averageBookingValue: number
  growth: number
}

export interface CityPerformanceRequest {
  dateFrom: string
  dateTo: string
  limit?: number
  sortBy?: 'bookings' | 'revenue' | 'growth'
  sortOrder?: 'asc' | 'desc'
}

export interface CityPerformanceResponse {
  success: boolean
  data: CityPerformanceItem[]
}

export interface CityPerformanceItem {
  city: string
  state: string
  bookings: number
  revenue: number
  growth: number
  activeUsers: number
  activeProviders: number
}

export interface UserGrowthAnalyticsRequest {
  dateFrom: string
  dateTo: string
  granularity: 'day' | 'week' | 'month'
  userType?: 'Customer' | 'Provider' | 'Vendor'
}

export interface UserGrowthAnalyticsResponse {
  success: boolean
  data: UserGrowthDataPoint[]
}

export interface UserGrowthDataPoint {
  period: string
  newUsers: number
  activeUsers: number
  totalUsers: number
  growth: number
}

export interface ProviderPerformanceRequest {
  dateFrom: string
  dateTo: string
  limit?: number
  sortBy?: 'bookings' | 'rating' | 'earnings'
  sortOrder?: 'asc' | 'desc'
}

export interface ProviderPerformanceResponse {
  success: boolean
  data: ProviderPerformanceItem[]
}

export interface ProviderPerformanceItem {
  providerId: string
  providerName: string
  bookings: number
  completedBookings: number
  rating: number
  earnings: number
  onTimeRate: number
}

export interface ExportAnalyticsRequest {
  reportType: 'dashboard' | 'revenue' | 'users' | 'sla' | 'city-performance'
  dateFrom: string
  dateTo: string
  format: 'csv' | 'xlsx' | 'pdf'
  filters?: Record<string, any>
}

export interface ExportAnalyticsResponse {
  success: boolean
  downloadUrl: string
  expiresAt: string
}

export interface RealTimeMetricsResponse {
  success: boolean
  data: {
    activeBookings: number
    pendingAssignments: number
    onlineProviders: number
    activeCustomers: number
    revenueToday: number
    bookingsToday: number
  }
  timestamp: string
}
