import { useState, useEffect } from 'react'
import { TrendingUp, Users, DollarSign, AlertCircle, Calendar, Loader2, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, parseISO } from 'date-fns'
import { fetchDashboardStats, fetchBookings, fetchRevenueAnalytics, fetchPendingKYC, type DashboardMetrics, type AdminBooking } from '../services/gyorsApi'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardMetrics>({})
  const [recentBookings, setRecentBookings] = useState<AdminBooking[]>([])
  const [productivityData, setProductivityData] = useState<any[]>([])
  const [pendingKYCCount, setPendingKYCCount] = useState(0)

  useEffect(() => { loadDashboardData() }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dashData, bookings, revenue, kycList] = await Promise.allSettled([
        fetchDashboardStats(),
        fetchBookings({ limit: 5 } as any),
        fetchRevenueAnalytics(),
        fetchPendingKYC(),
      ])

      if (dashData.status === 'fulfilled') setStats(dashData.value)
      if (bookings.status === 'fulfilled') setRecentBookings(bookings.value.slice(0, 5))
      if (kycList.status === 'fulfilled') setPendingKYCCount(kycList.value.length)
      if (revenue.status === 'fulfilled' && Array.isArray(revenue.value)) {
        const chartData = revenue.value.map((point: any, i: number) => ({
          day: point.period ? (() => { try { return format(parseISO(point.period), 'EEE') } catch { return `Day ${i+1}` } })() : `Day ${i+1}`,
          bookings: point.bookings || point.totalBookings || 0,
          revenue: point.revenue || point.totalRevenue || 0,
        }))
        setProductivityData(chartData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number): string => {
    if (!amount) return '₹0'
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '—'
    try { return format(parseISO(dateString), 'MMM d, h:mm a') } catch { return dateString }
  }

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || ''
    if (s.includes('complete')) return 'bg-green-100 text-green-800'
    if (s.includes('progress') || s.includes('started')) return 'bg-blue-100 text-blue-800'
    if (s.includes('cancel')) return 'bg-red-100 text-red-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard from Gyors backend…</p>
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
            <button onClick={loadDashboardData} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
              <RefreshCw size={16}/> Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const totalBookings = stats.totalBookings ?? stats.total_bookings ?? stats.bookings ?? 0
  const activeUsers   = stats.activeUsers ?? stats.active_users ?? stats.users ?? 0
  const revenue       = stats.revenue ?? stats.totalRevenue ?? stats.total_revenue ?? 0
  const pendingKYC    = stats.pendingKYC ?? stats.pending_kyc ?? pendingKYCCount ?? 0

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Bookings</p>
              <p className="text-3xl font-bold mt-2">{Number(totalBookings).toLocaleString()}</p>
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                <TrendingUp size={14} />
                {stats.bookingsGrowth ? `+${stats.bookingsGrowth}%` : 'Live data'} 
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg"><Calendar size={24} className="text-blue-600" /></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Users</p>
              <p className="text-3xl font-bold mt-2">{Number(activeUsers).toLocaleString()}</p>
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                <TrendingUp size={14} />
                {stats.usersGrowth ? `+${stats.usersGrowth}%` : 'Live data'}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg"><Users size={24} className="text-green-600" /></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Revenue</p>
              <p className="text-3xl font-bold mt-2">{formatAmount(Number(revenue))}</p>
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                <TrendingUp size={14} />
                {stats.revenueGrowth ? `+${stats.revenueGrowth}%` : 'Live data'}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg"><DollarSign size={24} className="text-purple-600" /></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending KYC</p>
              <p className="text-3xl font-bold mt-2">{Number(pendingKYC).toLocaleString()}</p>
              <p className="text-orange-600 text-sm mt-1">Requires attention</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg"><AlertCircle size={24} className="text-orange-600" /></div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Recent Bookings</h2>
            <p className="text-gray-500 text-sm mt-1">{recentBookings.length} shown • live from Gyors backend</p>
          </div>
          <button onClick={loadDashboardData} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          {recentBookings.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
              <p>No bookings found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">{booking.id?.slice(0, 8)}…</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.serviceName || booking.serviceItemId || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.customerName || booking.customerId || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.providerName || booking.providerId || <span className="text-orange-500">Not Assigned</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.scheduledAt || booking.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.amount != null ? formatAmount(booking.amount) : '—'}
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
        {/* Revenue / Productivity Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Revenue Analytics</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-sm text-gray-600">Bookings</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div><span className="text-sm text-gray-600">Revenue</span></div>
            </div>
          </div>
          {productivityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value: any, name: string) => name === 'revenue' ? [formatAmount(Number(value)), 'Revenue'] : [value, name]} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} name="Bookings" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#a855f7" strokeWidth={2} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 flex-col gap-2">
              <TrendingUp size={32} />
              <p className="text-sm">No revenue data available yet</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-6">Quick Stats</h3>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Total Bookings</span>
                <span className="text-lg font-bold text-blue-600">{Number(totalBookings).toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500">Platform-wide booking count</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Total Revenue</span>
                <span className="text-lg font-bold text-green-600">{formatAmount(Number(revenue))}</span>
              </div>
              <p className="text-xs text-gray-500">Cumulative platform revenue</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Active Users</span>
                <span className="text-lg font-bold text-purple-600">{Number(activeUsers).toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500">Currently active on platform</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Pending KYC</span>
                <span className="text-lg font-bold text-orange-600">{Number(pendingKYC).toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500">Provider documents awaiting review</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
