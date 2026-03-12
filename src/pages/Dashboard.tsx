import { useState, useEffect } from 'react'
import { CheckCircle2, Clock, TrendingUp, Users, DollarSign, AlertCircle, Calendar, Loader2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, parseISO, isToday, isTomorrow, differenceInHours } from 'date-fns'
import { 
  getDashboardStats, 
  getRecentBookings, 
  getBookingStats, 
  getRevenueAnalytics 
} from '../services/dashboardApi'
import type { Booking, BookingStatus } from '../../mock/api-schemas/booking-management.schema'
import type { RevenueDataPoint } from '../../mock/api-schemas/analytics-reporting.schema'

interface DashboardData {
  totalBookings: number
  activeUsers: number
  revenue: number
  pendingKYC: number
  bookingsGrowth: number
  usersGrowth: number
  revenueGrowth: number
  averageResponseTime: number
}

interface BookingStats {
  total: number
  pendingAssignment: number
  inProgress: number
  completed: number
  cancelled: number
  totalRevenue: number
  averageBookingValue: number
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardData | null>(null)
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null)
  const [productivityData, setProductivityData] = useState<RevenueDataPoint[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Calculate date range for last 7 days
      const dateTo = new Date()
      const dateFrom = new Date()
      dateFrom.setDate(dateFrom.getDate() - 7)

      // Fetch all data in parallel
      const [statsResponse, bookingsResponse, bookingStatsResponse, revenueResponse] = await Promise.all([
        getDashboardStats({
          dateFrom: dateFrom.toISOString().split('T')[0],
          dateTo: dateTo.toISOString().split('T')[0],
        }),
        getRecentBookings({ limit: 5 }),
        getBookingStats(),
        getRevenueAnalytics({
          dateFrom: dateFrom.toISOString().split('T')[0],
          dateTo: dateTo.toISOString().split('T')[0],
          granularity: 'day',
        }),
      ])

      if (statsResponse.success && statsResponse.data) {
        setDashboardStats(statsResponse.data)
      }

      if (bookingsResponse.success && bookingsResponse.data) {
        setRecentBookings(bookingsResponse.data)
      }

      if (bookingStatsResponse.success && bookingStatsResponse.data) {
        setBookingStats(bookingStatsResponse.data)
      }

      if (revenueResponse.success && revenueResponse.data) {
        // Transform revenue data for chart
        const chartData = revenueResponse.data.map((point) => ({
          day: format(parseISO(point.period), 'EEE'),
          bookings: point.bookings,
          revenue: point.revenue,
        }))
        setProductivityData(chartData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      console.error('Dashboard data loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number): string => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    }
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString)
      if (isToday(date)) {
        return `Today, ${format(date, 'h:mm a')}`
      }
      if (isTomorrow(date)) {
        return `Tomorrow, ${format(date, 'h:mm a')}`
      }
      return format(date, 'MMM d, h:mm a')
    } catch {
      return dateString
    }
  }

  const formatDuration = (duration: string): string => {
    return duration
  }

  const getStatusBadgeClass = (status: BookingStatus): string => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800'
      case 'Pending Assignment':
      case 'Assigned':
      case 'Confirmed':
        return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled':
      case 'Refunded':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <h3 className="text-red-800 font-semibold">Error loading dashboard</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={loadDashboardData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Bookings</p>
              <p className="text-3xl font-bold mt-2">
                {dashboardStats?.totalBookings.toLocaleString() || '0'}
              </p>
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                <TrendingUp size={14} />
                {dashboardStats?.bookingsGrowth ? `+${dashboardStats.bookingsGrowth}%` : '0%'} from last week
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Users</p>
              <p className="text-3xl font-bold mt-2">
                {dashboardStats?.activeUsers.toLocaleString() || '0'}
              </p>
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                <TrendingUp size={14} />
                {dashboardStats?.usersGrowth ? `+${dashboardStats.usersGrowth}%` : '0%'} from last week
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Revenue</p>
              <p className="text-3xl font-bold mt-2">
                {dashboardStats?.revenue ? formatAmount(dashboardStats.revenue) : '₹0'}
              </p>
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                <TrendingUp size={14} />
                {dashboardStats?.revenueGrowth ? `+${dashboardStats.revenueGrowth}%` : '0%'} from last week
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending KYC</p>
              <p className="text-3xl font-bold mt-2">
                {dashboardStats?.pendingKYC || 0}
              </p>
              <p className="text-orange-600 text-sm mt-1">Requires attention</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertCircle size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Recent Bookings</h2>
              <p className="text-gray-500 text-sm mt-1">
                {bookingStats?.total || 0} total, proceed to resolve them
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  {bookingStats?.completed || 0}
                </p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {bookingStats?.inProgress || 0}
                </p>
                <p className="text-sm text-gray-500">In progress</p>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {recentBookings.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
              <p>No recent bookings found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Run Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="checkbox" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.serviceName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.customerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.providerName || 'Not Assigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}
                      >
                        {booking.status === 'In Progress' && <Clock size={12} className="inline mr-1" />}
                        {booking.status === 'Completed' && <CheckCircle2 size={12} className="inline mr-1" />}
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDuration(booking.estimatedDuration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.scheduledDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatAmount(booking.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Productivity</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600">Bookings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-gray-600">Revenue</span>
              </div>
            </div>
          </div>
          {productivityData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={productivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'revenue') {
                        return [formatAmount(Number(value)), 'Revenue']
                      }
                      return [value, name]
                    }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Bookings"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 mt-4">Data updates every 3 hours</p>
            </>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              <p>No data available</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-6">Quick Stats</h3>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Pending Assignments</span>
                <span className="text-lg font-bold text-orange-600">
                  {bookingStats?.pendingAssignment || 0}
                </span>
              </div>
              <p className="text-xs text-gray-500">Bookings waiting for provider assignment</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Average Booking Value</span>
                <span className="text-lg font-bold text-green-600">
                  {bookingStats?.averageBookingValue ? formatAmount(bookingStats.averageBookingValue) : '₹0'}
                </span>
              </div>
              <p className="text-xs text-gray-500">Average revenue per booking</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Response Time</span>
                <span className="text-lg font-bold text-blue-600">
                  {dashboardStats?.averageResponseTime ? `${dashboardStats.averageResponseTime}m` : 'N/A'}
                </span>
              </div>
              <p className="text-xs text-gray-500">Average response time to bookings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
