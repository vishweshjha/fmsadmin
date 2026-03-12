import { useState } from 'react'
import { Download, Calendar, TrendingUp, Users, DollarSign, Clock, MapPin } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'

const demandSupplyData = [
  { hour: '00:00', demand: 5, supply: 8 },
  { hour: '04:00', demand: 3, supply: 6 },
  { hour: '08:00', demand: 25, supply: 20 },
  { hour: '12:00', demand: 45, supply: 35 },
  { hour: '16:00', demand: 38, supply: 30 },
  { hour: '20:00', demand: 28, supply: 25 },
]

const serviceDistribution = [
  { name: 'House Cleaning', value: 35, color: '#3b82f6' },
  { name: 'Plumbing', value: 25, color: '#10b981' },
  { name: 'Electrical', value: 20, color: '#f59e0b' },
  { name: 'Carpentry', value: 15, color: '#ef4444' },
  { name: 'Others', value: 5, color: '#8b5cf6' },
]

const slaData = [
  { metric: 'Response Time', target: 95, actual: 92, status: 'Warning' },
  { metric: 'Completion Rate', target: 98, actual: 97, status: 'Good' },
  { metric: 'Customer Satisfaction', target: 90, actual: 94, status: 'Excellent' },
  { metric: 'Provider On-time', target: 95, actual: 96, status: 'Excellent' },
]

const cityPerformance = [
  { city: 'Mumbai', bookings: 450, revenue: 540000, growth: 12 },
  { city: 'Delhi', bookings: 380, revenue: 456000, growth: 8 },
  { city: 'Bangalore', bookings: 320, revenue: 384000, growth: 15 },
  { city: 'Pune', bookings: 280, revenue: 336000, growth: 10 },
]

export default function AnalyticsReporting() {
  const [dateRange, setDateRange] = useState('last7days')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reporting</h1>
          <p className="text-gray-500 mt-1">Real-time operational insights and analytics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="last90days">Last 90 Days</option>
            <option value="custom">Custom Range</option>
          </select>
          <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Bookings</p>
              <p className="text-3xl font-bold mt-2">1,247</p>
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                <TrendingUp size={14} />
                +12% from last period
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
              <p className="text-3xl font-bold mt-2">8,432</p>
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                <TrendingUp size={14} />
                +8% from last period
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
              <p className="text-3xl font-bold mt-2">₹4.2L</p>
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                <TrendingUp size={14} />
                +15% from last period
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
              <p className="text-gray-500 text-sm">Avg Response Time</p>
              <p className="text-3xl font-bold mt-2">2.3m</p>
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                <TrendingUp size={14} />
                -5% from last period
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demand & Supply Heatmap */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-6">Demand & Supply Heatmap</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={demandSupplyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="demand" stroke="#ef4444" strokeWidth={2} name="Demand" />
              <Line type="monotone" dataKey="supply" stroke="#10b981" strokeWidth={2} name="Supply" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Service Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-6">Service Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={serviceDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {serviceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLA Compliance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-6">SLA Compliance Metrics</h3>
          <div className="space-y-4">
            {slaData.map((sla, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{sla.metric}</span>
                  <span className={`text-sm font-semibold ${
                    sla.status === 'Excellent' ? 'text-green-600' :
                    sla.status === 'Good' ? 'text-blue-600' :
                    'text-yellow-600'
                  }`}>
                    {sla.actual}% ({sla.status})
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      sla.actual >= sla.target ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${sla.actual}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">Target: {sla.target}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* City Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-6">City Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cityPerformance.map((city, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{city.city}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{city.bookings}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">₹{city.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-green-600 font-semibold">+{city.growth}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
