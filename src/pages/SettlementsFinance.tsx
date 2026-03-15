import { useState, useEffect } from 'react'
import { Download, DollarSign, TrendingUp, FileText, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { fetchWallets, fetchSettlements, type Wallet, type Settlement } from '../services/gyorsApi'

const revenueData = [
  { month: 'Jan', revenue: 420000, payouts: 315000 },
  { month: 'Feb', revenue: 480000, payouts: 360000 },
  { month: 'Mar', revenue: 520000, payouts: 390000 },
]

export default function SettlementsFinance() {
  const [activeTab, setActiveTab] = useState<'providers' | 'settlements' | 'reports'>('providers')
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [w, s] = await Promise.allSettled([fetchWallets(), fetchSettlements()])
      if (w.status === 'fulfilled') setWallets(w.value)
      if (s.status === 'fulfilled') setSettlements(s.value)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const totalWalletBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0)
  const formatAmount = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`

  const getStatusCls = (status?: string) => {
    const s = status?.toLowerCase() || ''
    if (s.includes('process') || s.includes('complete') || s.includes('success')) return 'bg-green-100 text-green-800'
    if (s.includes('fail') || s.includes('reject')) return 'bg-red-100 text-red-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settlements & Finance</h1>
          <p className="text-gray-500 mt-1">Manage wallets and financial settlements</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadData} className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
            <RefreshCw size={18} /> Refresh
          </button>
          <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Wallet Balance</p>
              <p className="text-3xl font-bold mt-2">{formatAmount(totalWalletBalance)}</p>
              <p className="text-green-600 text-sm mt-1">Across {wallets.length} wallets</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg"><TrendingUp size={24} className="text-green-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Wallets</p>
              <p className="text-3xl font-bold mt-2">{wallets.length}</p>
              <p className="text-blue-600 text-sm mt-1">Platform wallets</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg"><DollarSign size={24} className="text-blue-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Settlements</p>
              <p className="text-3xl font-bold mt-2">{settlements.length}</p>
              <p className="text-orange-600 text-sm mt-1">Total records</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg"><DollarSign size={24} className="text-orange-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Reports</p>
              <p className="text-3xl font-bold mt-2">—</p>
              <p className="text-purple-600 text-sm mt-1">View in Reports tab</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg"><FileText size={24} className="text-purple-600" /></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {(['providers', 'settlements', 'reports'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium border-b-2 capitalize ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}>
                {tab === 'providers' ? 'Wallets' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Loading from Gyors backend…</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="text-red-600" size={20} />
              <div>
                <p className="text-red-800 font-semibold text-sm">Error loading data</p>
                <p className="text-red-600 text-sm">{error}</p>
                <button onClick={loadData} className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs">Retry</button>
              </div>
            </div>
          ) : (
            <>
              {/* Wallets Tab */}
              {activeTab === 'providers' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Wallet ID', 'User ID', 'Balance', 'Currency', 'Actions'].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {wallets.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No wallets found</td></tr>
                      ) : wallets.map((wallet) => (
                        <tr key={wallet.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">{wallet.id?.slice(0, 12)}…</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{wallet.userId || '—'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            {formatAmount(wallet.balance || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wallet.currency || 'INR'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button className="text-primary-600 hover:text-primary-900">
                              <FileText size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Settlements Tab */}
              {activeTab === 'settlements' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Settlement ID', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {settlements.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No settlements found</td></tr>
                      ) : settlements.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">{s.id?.slice(0, 12)}…</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatAmount(s.amount || 0)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusCls(s.status)}`}>
                              {s.status || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button className="text-primary-600 hover:text-primary-900"><FileText size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Reports Tab */}
              {activeTab === 'reports' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Revenue vs Payouts (Monthly)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']} />
                        <Legend />
                        <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                        <Bar dataKey="payouts" fill="#10b981" name="Payouts" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 flex items-center gap-3">
                      <FileText className="text-primary-600" size={24} />
                      <div className="text-left">
                        <p className="font-semibold">Generate Invoice</p>
                        <p className="text-sm text-gray-500">Create invoice for selected period</p>
                      </div>
                    </button>
                    <button className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 flex items-center gap-3">
                      <FileText className="text-green-600" size={24} />
                      <div className="text-left">
                        <p className="font-semibold">Tax Report</p>
                        <p className="text-sm text-gray-500">Generate tax compliance report</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
