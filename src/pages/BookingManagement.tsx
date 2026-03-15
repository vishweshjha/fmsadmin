import { useState, useEffect } from 'react'
import { Search, RefreshCw, XCircle, Clock, CheckCircle, Loader2, AlertCircle, UserPlus } from 'lucide-react'
import { fetchBookings, updateBookingStatus, type AdminBooking } from '../services/gyorsApi'

export default function BookingManagement() {
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadBookings = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = {}
      if (filterStatus !== 'all') params.status = filterStatus.toUpperCase()
      const data = await fetchBookings(params)
      setBookings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadBookings() }, [])

  const handleStatusUpdate = async (id: string, status: string, reason?: string) => {
    setActionLoading(id)
    try {
      await updateBookingStatus(id, status, reason)
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update booking')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || ''
    if (s.includes('complete')) return 'bg-green-100 text-green-800'
    if (s.includes('progress') || s.includes('started')) return 'bg-blue-100 text-blue-800'
    if (s.includes('cancel')) return 'bg-red-100 text-red-800'
    if (s.includes('pending') || s.includes('assign')) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  const formatAmount = (amount?: number) => {
    if (amount == null) return '—'
    return `₹${Number(amount).toLocaleString('en-IN')}`
  }

  const filteredBookings = bookings.filter(b => {
    const id = b.id || ''
    const service = b.serviceName || b.serviceItemId || ''
    const customer = b.customerName || b.customerId || ''
    const matchSearch = !searchTerm ||
      id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = filterStatus === 'all' || b.status?.toLowerCase().includes(filterStatus.toLowerCase())
    return matchSearch && matchStatus
  })

  const counts = {
    total: bookings.length,
    inProgress: bookings.filter(b => b.status?.toLowerCase().includes('progress') || b.status?.toLowerCase().includes('started')).length,
    completed: bookings.filter(b => b.status?.toLowerCase().includes('complete')).length,
    pending: bookings.filter(b => b.status?.toLowerCase().includes('pending') || b.status?.toLowerCase().includes('assign')).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Booking Management</h1>
          <p className="text-gray-500 mt-1">Manage all bookings and overrides • {filteredBookings.length} shown</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadBookings} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Bookings', value: counts.total, icon: Clock, bg: 'bg-blue-100', color: 'text-blue-600' },
          { label: 'In Progress', value: counts.inProgress, icon: RefreshCw, bg: 'bg-yellow-100', color: 'text-yellow-600' },
          { label: 'Completed', value: counts.completed, icon: CheckCircle, bg: 'bg-green-100', color: 'text-green-600' },
          { label: 'Pending Assignment', value: counts.pending, icon: UserPlus, bg: 'bg-orange-100', color: 'text-orange-600' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-gray-500 text-sm">{label}</p><p className="text-3xl font-bold mt-2">{value}</p></div>
              <div className={`${bg} p-3 rounded-lg`}><Icon size={24} className={color} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Search by booking ID, service, customer..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="all">All Status</option>
            <option value="pending">Pending Assignment</option>
            <option value="progress">In Progress</option>
            <option value="complete">Completed</option>
            <option value="cancel">Cancelled</option>
          </select>
          <button onClick={loadBookings} className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw size={18} /><span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
          <div className="text-center"><Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-3" /><p className="text-gray-500">Loading bookings…</p></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <p className="text-red-800 font-semibold">Failed to load bookings</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={loadBookings} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Retry</button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Booking ID', 'Service', 'Customer', 'Provider', 'Status', 'Amount', 'Scheduled', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No bookings found</td></tr>
                ) : filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{booking.id?.slice(0, 12)}…</div>
                      <div className="text-xs text-gray-400">
                        {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-IN') : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{booking.serviceName || booking.serviceItemId || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.customerName || booking.customerId || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.providerName || booking.providerId
                        ? <div className="text-sm text-gray-900">{booking.providerName || booking.providerId}</div>
                        : <span className="text-sm text-orange-600 font-medium">Not Assigned</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatAmount(booking.amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {actionLoading === booking.id ? (
                        <Loader2 size={18} className="animate-spin text-gray-400" />
                      ) : (
                        <div className="flex items-center gap-2">
                          {!booking.status?.toLowerCase().includes('cancel') && (
                            <button onClick={() => handleStatusUpdate(booking.id, 'CANCELLED', 'Admin override')}
                              title="Cancel booking" className="text-red-600 hover:text-red-900">
                              <XCircle size={18} />
                            </button>
                          )}
                          {booking.status?.toLowerCase().includes('progress') && (
                            <button onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                              title="Mark complete" className="text-green-600 hover:text-green-900">
                              <CheckCircle size={18} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
