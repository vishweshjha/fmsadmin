import { useState } from 'react'
import { Search, Filter, RefreshCw, XCircle, DollarSign, UserPlus, Clock, CheckCircle } from 'lucide-react'

const bookings = [
  {
    id: 'BK001',
    serviceName: 'House Cleaning - Premium',
    customer: 'Rajesh Kumar',
    provider: 'Amit Sharma',
    status: 'In Progress',
    bookingDate: '24 Mar 2024, 10:00 AM',
    scheduledDate: '24 Mar 2024, 2:00 PM',
    amount: '₹1,200',
    paymentStatus: 'Paid',
    location: 'Mumbai, Maharashtra'
  },
  {
    id: 'BK002',
    serviceName: 'Plumbing Service',
    customer: 'Priya Singh',
    provider: 'Vikram Patel',
    status: 'Completed',
    bookingDate: '23 Mar 2024, 3:00 PM',
    scheduledDate: '24 Mar 2024, 11:00 AM',
    amount: '₹800',
    paymentStatus: 'Paid',
    location: 'Delhi, NCR'
  },
  {
    id: 'BK003',
    serviceName: 'Electrical Repair',
    customer: 'Mohit Verma',
    provider: null,
    status: 'Pending Assignment',
    bookingDate: '24 Mar 2024, 9:00 AM',
    scheduledDate: '25 Mar 2024, 10:00 AM',
    amount: '₹1,500',
    paymentStatus: 'Pending',
    location: 'Bangalore, Karnataka'
  },
  {
    id: 'BK004',
    serviceName: 'Carpentry Work',
    customer: 'Anita Desai',
    provider: 'Ramesh Yadav',
    status: 'Cancelled',
    bookingDate: '22 Mar 2024, 2:00 PM',
    scheduledDate: '23 Mar 2024, 3:00 PM',
    amount: '₹2,000',
    paymentStatus: 'Refunded',
    location: 'Pune, Maharashtra',
    cancellationReason: 'Customer requested cancellation'
  },
]

export default function BookingManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Booking Management</h1>
          <p className="text-gray-500 mt-1">Manage all bookings and overrides</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
            <RefreshCw size={18} />
            Refresh
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Export Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Bookings</p>
              <p className="text-3xl font-bold mt-2">1,247</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">In Progress</p>
              <p className="text-3xl font-bold mt-2">123</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <RefreshCw size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-3xl font-bold mt-2">1,124</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Assignment</p>
              <p className="text-3xl font-bold mt-2">45</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <UserPlus size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by booking ID, service, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="Pending Assignment">Pending Assignment</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter size={18} />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
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
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduled Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.id}</div>
                    <div className="text-xs text-gray-500">{booking.bookingDate}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{booking.serviceName}</div>
                    <div className="text-xs text-gray-500">{booking.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.customer}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.provider ? (
                      <div className="text-sm text-gray-900">{booking.provider}</div>
                    ) : (
                      <span className="text-sm text-orange-600 font-medium">Not Assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : booking.status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.amount}</div>
                    <div className="text-xs text-gray-500">{booking.paymentStatus}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.scheduledDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {!booking.provider && (
                        <button className="text-primary-600 hover:text-primary-900 px-2 py-1 border border-primary-600 rounded hover:bg-primary-50 text-xs">
                          Assign
                        </button>
                      )}
                      {booking.provider && (
                        <button className="text-blue-600 hover:text-blue-900 px-2 py-1 border border-blue-600 rounded hover:bg-blue-50 text-xs">
                          Reassign
                        </button>
                      )}
                      <button className="text-red-600 hover:text-red-900">
                        <XCircle size={18} />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <DollarSign size={18} />
                      </button>
                    </div>
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
