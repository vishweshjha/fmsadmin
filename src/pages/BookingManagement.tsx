import { useState, useEffect } from 'react'
import { Search, RefreshCw, XCircle, Clock, CheckCircle, Loader2, AlertCircle, UserPlus } from 'lucide-react'
import { fetchBookings, updateBookingStatus, assignProviderToBooking, fetchServiceProviders, type AdminBooking, type ServiceProvider } from '../services/gyorsApi'

export default function BookingManagement() {
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [providers, setProviders] = useState<ServiceProvider[]>([])
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

  const loadProviders = async () => {
    try {
      const data = await fetchServiceProviders({ status: 'ACTIVE' })
      setProviders(data)
    } catch (err) {
      console.error('Failed to load operators', err)
    }
  }

  useEffect(() => {
    loadBookings()
    loadProviders()
  }, [])

  const handleAssignProvider = async (bookingId: string, providerId: string) => {
    if (!providerId) return
    setActionLoading(bookingId)
    try {
      console.warn(bookingId, providerId, "provider id ###############");
      await assignProviderToBooking(bookingId, providerId)
      await loadBookings() // Refresh bookings to show the assigned provider and updated status
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to assign provider')
    } finally {
      setActionLoading(null)
    }
  }

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

  const handleCancelClick = (id: string, currentStatus: string) => {
    if (currentStatus?.toLowerCase().includes('cancel')) return
    const reason = window.prompt('Please enter the reason for cancellation:\n\nNote: If the customer already paid, a refund will automatically be triggered to their source.')
    if (reason === null) return // user dismissed the prompt
    if (reason.trim() === '') {
      alert('A cancellation reason is strictly required to cancel and log this action.')
      return
    }
    handleStatusUpdate(id, 'CANCELLED', reason.trim())
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
    const serviceName = b.service?.name || b.serviceId || ''
    const customerName = b.user?.name || b.userId || ''
    const providerName = b.provider?.name || b.providerId || ''
    const searchString = `${id} ${serviceName} ${customerName} ${providerName}`.toLowerCase()

    const matchSearch = !searchTerm || searchString.includes(searchTerm.toLowerCase())
    const matchStatus = filterStatus === 'all' || b.status?.toLowerCase() === filterStatus.toLowerCase()
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
                      <div className="text-sm font-medium text-gray-900">{booking.service?.name || booking.serviceId || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.user?.name || booking.user?.phoneNumber || booking.userId || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.provider?.name || booking.providerId
                        ? <div className="text-sm text-gray-900">{booking.provider?.name || booking.providerId}</div>
                        : (
                          <div className="flex flex-col gap-1">
                            <select
                              onChange={(e) => handleAssignProvider(booking.id, e.target.value)}
                              defaultValue=""
                              className="text-xs border border-orange-300 text-orange-700 bg-orange-50 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                            >
                              <option value="" disabled>Assign Provider ▼</option>
                              {providers.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.city || 'Any'})</option>
                              ))}
                            </select>
                          </div>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatAmount(booking.totalAmount || booking.amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.date || booking.scheduledAt ? new Date(booking.date || booking.scheduledAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {actionLoading === booking.id ? (
                        <Loader2 size={18} className="animate-spin text-gray-400" />
                      ) : (
                        <div className="flex items-center gap-2">
                          {!booking.status?.toLowerCase().includes('cancel') && (
                            <button onClick={() => handleCancelClick(booking.id, booking.status)}
                              title="Cancel booking" className="text-red-600 hover:text-red-900">
                              <XCircle size={18} />
                            </button>
                          )}
                          {(booking.status?.toLowerCase().includes('progress') || booking.status?.toLowerCase().includes('started')) && (
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
