import { useState, useEffect } from 'react'
import { Search, RefreshCw, XCircle, Clock, CheckCircle, Loader2, AlertCircle, UserPlus, ListFilter, Plus, Trash2, X } from 'lucide-react'
import {
  fetchBookings,
  updateBookingStatus,
  assignProviderToBooking,
  fetchServiceProviders,
  fetchCancellationReasons,
  createCancellationReason,
  updateCancellationReason,
  deleteCancellationReason,
  type AdminBooking,
  type ServiceProvider,
  type AdminCancellationReason
} from '../services/gyorsApi'

export default function BookingManagement() {
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Cancellation Reasons Modal State
  const [showReasonsModal, setShowReasonsModal] = useState(false)
  const [cancellationReasons, setCancellationReasons] = useState<AdminCancellationReason[]>([])
  const [reasonsLoading, setReasonsLoading] = useState(false)
  const [newReasonText, setNewReasonText] = useState('')
  const [addingReason, setAddingReason] = useState(false)

  const loadCancellationReasons = async () => {
    setReasonsLoading(true)
    try {
      const data = await fetchCancellationReasons(true)
      setCancellationReasons(data)
    } catch (err) {
      console.error('Failed to load cancellation reasons:', err)
    } finally {
      setReasonsLoading(false)
    }
  }

  const handleAddReason = async () => {
    if (!newReasonText.trim()) return
    setAddingReason(true)
    try {
      await createCancellationReason(newReasonText.trim(), cancellationReasons.length)
      setNewReasonText('')
      await loadCancellationReasons()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add cancellation reason')
    } finally {
      setAddingReason(false)
    }
  }

  const handleToggleReasonActive = async (reasonObj: AdminCancellationReason) => {
    try {
      await updateCancellationReason(reasonObj.id, { isActive: !reasonObj.isActive })
      await loadCancellationReasons()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update reason status')
    }
  }

  const handleDeleteReason = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this cancellation reason?')) return
    try {
      await deleteCancellationReason(id)
      await loadCancellationReasons()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete reason')
    }
  }

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
          <button
            onClick={() => {
              loadCancellationReasons()
              setShowReasonsModal(true)
            }}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 flex items-center gap-2 text-sm font-medium transition"
          >
            <ListFilter size={18} /> Manage Cancel Reasons
          </button>
          <button onClick={loadBookings} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2 text-sm font-medium">
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

      {/* Cancellation Reasons Management Modal */}
      {showReasonsModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-gray-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <ListFilter size={20} /> Cancellation Reasons
                </h3>
                <p className="text-xs text-gray-300">Admin configured options shown to customers in Gyors app</p>
              </div>
              <button
                onClick={() => setShowReasonsModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {/* Add New Reason Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter new cancellation reason..."
                  value={newReasonText}
                  onChange={(e) => setNewReasonText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddReason()}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleAddReason}
                  disabled={addingReason || !newReasonText.trim()}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-1"
                >
                  {addingReason ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add
                </button>
              </div>

              {/* List of Reasons */}
              {reasonsLoading ? (
                <div className="py-8 text-center text-gray-500 flex flex-col items-center">
                  <Loader2 className="animate-spin text-primary-600 mb-2" size={24} />
                  Loading reasons...
                </div>
              ) : cancellationReasons.length === 0 ? (
                <p className="py-8 text-center text-gray-400 text-sm">No cancellation reasons added yet.</p>
              ) : (
                <div className="divide-y border rounded-lg overflow-hidden">
                  {cancellationReasons.map((item, idx) => (
                    <div key={item.id} className="p-3 flex items-center justify-between bg-white hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}.</span>
                        <span className={`text-sm ${item.isActive ? 'text-gray-900 font-medium' : 'text-gray-400 line-through'}`}>
                          {item.reason}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleReasonActive(item)}
                          className={`px-2.5 py-1 text-xs rounded-full font-semibold transition ${
                            item.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Disabled'}
                        </button>
                        <button
                          onClick={() => handleDeleteReason(item.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition"
                          title="Delete reason"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t text-right">
              <button
                onClick={() => setShowReasonsModal(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

