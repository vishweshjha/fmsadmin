import { useState } from 'react'
import { Search, Filter, Download, Eye, Calendar, User, Shield } from 'lucide-react'

const auditLogs = [
  {
    id: 'AL001',
    timestamp: '24 Mar 2024, 10:30 AM',
    adminUser: 'Super Admin',
    action: 'User Blocked',
    entity: 'User: Rajesh Kumar',
    details: 'User account blocked due to policy violation',
    ipAddress: '192.168.1.100',
    status: 'Success'
  },
  {
    id: 'AL002',
    timestamp: '24 Mar 2024, 09:15 AM',
    adminUser: 'Operations Admin',
    action: 'Booking Cancelled',
    entity: 'Booking: BK001',
    details: 'Booking cancelled with manual refund of ₹1,200',
    ipAddress: '192.168.1.101',
    status: 'Success'
  },
  {
    id: 'AL003',
    timestamp: '24 Mar 2024, 08:45 AM',
    adminUser: 'Finance Admin',
    action: 'Payout Processed',
    entity: 'Provider: Amit Sharma',
    details: 'Payout of ₹33,750 processed successfully',
    ipAddress: '192.168.1.102',
    status: 'Success'
  },
  {
    id: 'AL004',
    timestamp: '23 Mar 2024, 11:20 PM',
    adminUser: 'Compliance Officer',
    action: 'KYC Approved',
    entity: 'Provider: Vikram Patel',
    details: 'KYC documents verified and approved',
    ipAddress: '192.168.1.103',
    status: 'Success'
  },
  {
    id: 'AL005',
    timestamp: '23 Mar 2024, 10:00 PM',
    adminUser: 'Operations Admin',
    action: 'Provider Reassigned',
    entity: 'Booking: BK003',
    details: 'Provider reassigned from Suresh to Ramesh',
    ipAddress: '192.168.1.101',
    status: 'Success'
  },
  {
    id: 'AL006',
    timestamp: '23 Mar 2024, 05:30 PM',
    adminUser: 'Super Admin',
    action: 'Pricing Updated',
    entity: 'Service: House Cleaning - Premium',
    details: 'Base price updated from ₹1,000 to ₹1,200',
    ipAddress: '192.168.1.100',
    status: 'Success'
  },
]

export default function AuditLogging() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('all')
  const [filterUser, setFilterUser] = useState('all')

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.adminUser.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = filterAction === 'all' || log.action.includes(filterAction)
    const matchesUser = filterUser === 'all' || log.adminUser === filterUser
    return matchesSearch && matchesAction && matchesUser
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit & Logging</h1>
          <p className="text-gray-500 mt-1">Immutable audit trail of all admin actions</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
          <Download size={18} />
          Export Logs
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Logs</p>
              <p className="text-3xl font-bold mt-2">12,847</p>
              <p className="text-gray-500 text-sm mt-1">All time</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Shield size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Today's Actions</p>
              <p className="text-3xl font-bold mt-2">156</p>
              <p className="text-green-600 text-sm mt-1">+12% from yesterday</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Calendar size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Admins</p>
              <p className="text-3xl font-bold mt-2">8</p>
              <p className="text-gray-500 text-sm mt-1">Currently online</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <User size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Failed Actions</p>
              <p className="text-3xl font-bold mt-2">3</p>
              <p className="text-red-600 text-sm mt-1">Requires attention</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <Shield size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Actions</option>
            <option value="User">User Management</option>
            <option value="Booking">Booking Management</option>
            <option value="KYC">KYC & Verification</option>
            <option value="Pricing">Pricing Updates</option>
            <option value="Payout">Financial Operations</option>
          </select>
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Users</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Operations Admin">Operations Admin</option>
            <option value="Finance Admin">Finance Admin</option>
            <option value="Compliance Officer">Compliance Officer</option>
          </select>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter size={18} />
            <span>Date Range</span>
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Log ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{log.timestamp}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-700">
                          {log.adminUser.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{log.adminUser}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{log.entity}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">{log.details}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{log.ipAddress}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
