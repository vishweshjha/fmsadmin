import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, MoreVertical, Ban, CheckCircle, Eye, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { fetchUsers, updateUserStatus, type AdminUser } from '../services/gyorsApi'

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = {}
      if (filterRole !== 'all') params.role = filterRole.toUpperCase()
      if (filterStatus !== 'all') params.status = filterStatus.toUpperCase()
      if (searchTerm) params.name = searchTerm
      const data = await fetchUsers(params)
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [filterRole, filterStatus, searchTerm])

  useEffect(() => { loadUsers() }, []) // load on mount

  const handleSearch = () => loadUsers()

  const handleStatusChange = async (user: AdminUser, newStatus: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED') => {
    setActionLoading(user.id)
    try {
      await updateUserStatus(user.id, newStatus)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusDisplay = (status: string) => {
    const s = status?.toLowerCase() || ''
    if (s === 'active') return { label: 'Active', cls: 'bg-green-100 text-green-800' }
    if (s === 'blocked') return { label: 'Blocked', cls: 'bg-red-100 text-red-800' }
    if (s === 'suspended') return { label: 'Suspended', cls: 'bg-yellow-100 text-yellow-800' }
    return { label: status || 'Unknown', cls: 'bg-gray-100 text-gray-800' }
  }

  const getRoleDisplay = (role: string) => {
    const map: Record<string, string> = {
      CUSTOMER: 'Customer', PROVIDER: 'Provider', SERVICE_PROVIDER: 'Provider',
      ADMIN: 'Admin', SUPER_ADMIN: 'Super Admin',
    }
    return map[role?.toUpperCase()] || role || 'Unknown'
  }

  const filteredUsers = users.filter(user => {
    const name = user.name || ''
    const phone = user.phone || user.phoneNumber || ''
    const email = user.email || ''
    const matchesSearch = !searchTerm ||
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' ||
      getRoleDisplay(user.role).toLowerCase() === filterRole.toLowerCase()
    const matchesStatus = filterStatus === 'all' ||
      user.status?.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-500 mt-1">Manage all platform users • {filteredUsers.length} shown</p>
        </div>
        <button onClick={loadUsers} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, phone, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="all">All Roles</option>
            <option value="Customer">Customer</option>
            <option value="Provider">Provider</option>
            <option value="Admin">Admin</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="suspended">Suspended</option>
          </select>
          <button onClick={handleSearch} className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <Filter size={18} /><span>Apply Filters</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
          <div className="text-center"><Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-3" /><p className="text-gray-500">Loading users…</p></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <p className="text-red-800 font-semibold">Failed to load users</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={loadUsers} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Retry</button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['User', 'Contact', 'Role', 'Status', 'Registered', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No users found</td></tr>
                ) : filteredUsers.map((user) => {
                  const status = getStatusDisplay(user.status)
                  const isActive = user.status?.toLowerCase() === 'active'
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary-700">
                              {(user.name || user.email || '?').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name || '—'}</div>
                            <div className="text-xs text-gray-400 font-mono">{user.id?.slice(0, 8)}…</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.phone || user.phoneNumber || '—'}</div>
                        <div className="text-xs text-gray-500">{user.email || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getRoleDisplay(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.cls}`}>{status.label}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {actionLoading === user.id ? (
                            <Loader2 size={18} className="animate-spin text-gray-400" />
                          ) : (
                            <>
                              <button title="View history" className="text-primary-600 hover:text-primary-900">
                                <Eye size={18} />
                              </button>
                              {isActive ? (
                                <button title="Block user" onClick={() => handleStatusChange(user, 'BLOCKED')} className="text-red-600 hover:text-red-900">
                                  <Ban size={18} />
                                </button>
                              ) : (
                                <button title="Activate user" onClick={() => handleStatusChange(user, 'ACTIVE')} className="text-green-600 hover:text-green-900">
                                  <CheckCircle size={18} />
                                </button>
                              )}
                              <button title="More options" className="text-gray-600 hover:text-gray-900">
                                <MoreVertical size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
