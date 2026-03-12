import { useState } from 'react'
import { Download, DollarSign, TrendingUp, Calendar, FileText, RefreshCw } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const providerPayouts = [
  {
    id: 'PP001',
    providerName: 'Amit Sharma',
    period: '1-15 Mar 2024',
    totalEarnings: 45000,
    commission: 11250,
    payoutAmount: 33750,
    status: 'Pending',
    dueDate: '25 Mar 2024'
  },
  {
    id: 'PP002',
    providerName: 'Vikram Patel',
    period: '1-15 Mar 2024',
    totalEarnings: 32000,
    commission: 8000,
    payoutAmount: 24000,
    status: 'Processed',
    dueDate: '25 Mar 2024'
  },
  {
    id: 'PP003',
    providerName: 'Ramesh Yadav',
    period: '1-15 Mar 2024',
    totalEarnings: 28000,
    commission: 7000,
    payoutAmount: 21000,
    status: 'Pending',
    dueDate: '25 Mar 2024'
  },
]

const vendorSettlements = [
  {
    id: 'VS001',
    vendorName: 'Home Services Pvt Ltd',
    period: '1-15 Mar 2024',
    totalRevenue: 125000,
    commission: 12500,
    settlementAmount: 112500,
    status: 'Pending',
    dueDate: '25 Mar 2024'
  },
  {
    id: 'VS002',
    vendorName: 'QuickFix Solutions',
    period: '1-15 Mar 2024',
    totalRevenue: 98000,
    commission: 9800,
    settlementAmount: 88200,
    status: 'Processed',
    dueDate: '25 Mar 2024'
  },
]

const revenueData = [
  { month: 'Jan', revenue: 420000, payouts: 315000 },
  { month: 'Feb', revenue: 480000, payouts: 360000 },
  { month: 'Mar', revenue: 520000, payouts: 390000 },
]

export default function SettlementsFinance() {
  const [activeTab, setActiveTab] = useState<'providers' | 'vendors' | 'reports'>('providers')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settlements & Finance</h1>
          <p className="text-gray-500 mt-1">Manage payouts and financial settlements</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">₹5.2L</p>
              <p className="text-green-600 text-sm mt-1">This month</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Payouts</p>
              <p className="text-3xl font-bold mt-2">₹1.2L</p>
              <p className="text-orange-600 text-sm mt-1">Due this week</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <DollarSign size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Provider Payouts</p>
              <p className="text-3xl font-bold mt-2">₹78.7K</p>
              <p className="text-blue-600 text-sm mt-1">Pending</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Vendor Settlements</p>
              <p className="text-3xl font-bold mt-2">₹2.0L</p>
              <p className="text-purple-600 text-sm mt-1">Pending</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('providers')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'providers'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Provider Payouts
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'vendors'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vendor Settlements
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'reports'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Financial Reports
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'providers' && (
            <div className="space-y-4">
              <div className="flex justify-end gap-3 mb-4">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <RefreshCw size={18} />
                  Process Selected
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input type="checkbox" />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Provider
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Earnings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Commission
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payout Amount
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
                    {providerPayouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input type="checkbox" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{payout.providerName}</div>
                          <div className="text-xs text-gray-500">{payout.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payout.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{payout.totalEarnings.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{payout.commission.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          ₹{payout.payoutAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              payout.status === 'Processed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {payout.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            {payout.status === 'Pending' && (
                              <button className="text-green-600 hover:text-green-900 px-3 py-1 border border-green-600 rounded hover:bg-green-50">
                                Process
                              </button>
                            )}
                            <button className="text-primary-600 hover:text-primary-900">
                              <FileText size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'vendors' && (
            <div className="space-y-4">
              <div className="flex justify-end gap-3 mb-4">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <RefreshCw size={18} />
                  Process Selected
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input type="checkbox" />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Commission
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Settlement Amount
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
                    {vendorSettlements.map((settlement) => (
                      <tr key={settlement.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input type="checkbox" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{settlement.vendorName}</div>
                          <div className="text-xs text-gray-500">{settlement.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {settlement.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{settlement.totalRevenue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{settlement.commission.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          ₹{settlement.settlementAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              settlement.status === 'Processed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {settlement.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            {settlement.status === 'Pending' && (
                              <button className="text-green-600 hover:text-green-900 px-3 py-1 border border-green-600 rounded hover:bg-green-50">
                                Process
                              </button>
                            )}
                            <button className="text-primary-600 hover:text-primary-900">
                              <FileText size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue vs Payouts</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    <Bar dataKey="payouts" fill="#10b981" name="Payouts" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-primary-600" size={24} />
                    <div>
                      <p className="font-semibold">Generate Invoice</p>
                      <p className="text-sm text-gray-500">Create invoice for selected period</p>
                    </div>
                  </div>
                </button>
                <button className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-green-600" size={24} />
                    <div>
                      <p className="font-semibold">Tax Report</p>
                      <p className="text-sm text-gray-500">Generate tax compliance report</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
