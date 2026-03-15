import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, FileText, Clock, Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { fetchPendingKYC, updateKYCStatus, type KYCApplication } from '../services/gyorsApi'

export default function KYCVerification() {
  const [applications, setApplications] = useState<KYCApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadKYC = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPendingKYC()
      setApplications(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load KYC applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadKYC() }, [])

  const handleKYCAction = async (id: string, status: 'APPROVED' | 'REJECTED', remarks?: string) => {
    setActionLoading(id)
    try {
      await updateKYCStatus(id, status, remarks)
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update KYC status')
    } finally {
      setActionLoading(null)
    }
  }

  const getName = (app: KYCApplication) => app.providerName || app.name || app.serviceProviderId || '—'
  const getPhone = (app: KYCApplication) => app.phone || app.phoneNumber || '—'
  const getDate = (app: KYCApplication) => {
    const d = app.submittedAt || app.createdAt
    return d ? new Date(d).toLocaleDateString('en-IN') : '—'
  }

  const filtered = applications.filter(app => {
    const name = getName(app)
    const phone = getPhone(app)
    const email = app.email || ''
    const matchSearch = !searchTerm ||
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = filterStatus === 'all' || app.status?.toLowerCase() === filterStatus.toLowerCase()
    return matchSearch && matchStatus
  })

  const counts = {
    pending: applications.filter(a => a.status?.toLowerCase() === 'pending').length,
    approved: applications.filter(a => a.status?.toLowerCase() === 'approved').length,
    rejected: applications.filter(a => a.status?.toLowerCase() === 'rejected').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">KYC & Verification</h1>
          <p className="text-gray-500 mt-1">Review and verify service provider documents</p>
        </div>
        <button onClick={loadKYC} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Pending Review', value: counts.pending, icon: Clock, bg: 'bg-yellow-100', color: 'text-yellow-600' },
          { label: 'Approved', value: counts.approved, icon: CheckCircle, bg: 'bg-green-100', color: 'text-green-600' },
          { label: 'Rejected', value: counts.rejected, icon: XCircle, bg: 'bg-red-100', color: 'text-red-600' },
          { label: 'Total Applications', value: applications.length, icon: FileText, bg: 'bg-blue-100', color: 'text-blue-600' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{label}</p>
                <p className="text-3xl font-bold mt-2">{value}</p>
              </div>
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
            <input type="text" placeholder="Search by name, phone, email..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
          <div className="text-center"><Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-3" /><p className="text-gray-500">Loading KYC applications…</p></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <p className="text-red-800 font-semibold">Failed to load KYC data</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={loadKYC} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Retry</button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Provider', 'Contact', 'Document Type', 'Submitted', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No KYC applications found</td></tr>
                ) : filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-700">{getName(app).charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{getName(app)}</div>
                          <div className="text-xs text-gray-400">{app.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getPhone(app)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.documentType || (app.aadhaarNumber ? 'Aadhaar Card' : 'Document')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getDate(app)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        app.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-800' :
                        app.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>{app.status || 'PENDING'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {actionLoading === app.id ? (
                        <Loader2 size={18} className="animate-spin text-gray-400" />
                      ) : (
                        <div className="flex items-center gap-2">
                          {app.status?.toLowerCase() === 'pending' && (
                            <>
                              <button onClick={() => handleKYCAction(app.id, 'APPROVED')}
                                className="text-green-600 hover:text-green-900 px-2 py-1 border border-green-600 rounded text-xs hover:bg-green-50">
                                Approve
                              </button>
                              <button onClick={() => handleKYCAction(app.id, 'REJECTED', 'Does not meet requirements')}
                                className="text-red-600 hover:text-red-900 px-2 py-1 border border-red-600 rounded text-xs hover:bg-red-50">
                                Reject
                              </button>
                            </>
                          )}
                          {app.status?.toLowerCase() !== 'pending' && (
                            <span className="text-gray-400 text-xs italic">Reviewed</span>
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
