import { useState, useEffect, useRef } from 'react'
import {
  Download,
  DollarSign,
  TrendingUp,
  FileText,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronDown,
  FileSpreadsheet,
  IndianRupee,
  ShieldCheck,
  X,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { fetchWallets, fetchSettlements, triggerPayout, type Wallet, type Settlement } from '../services/gyorsApi'
import { exportToCSV, exportToPDF, formatAmountPlain } from '../utils/exportUtils'

const revenueData = [
  { month: 'Jan', revenue: 420000, payouts: 315000 },
  { month: 'Feb', revenue: 480000, payouts: 360000 },
  { month: 'Mar', revenue: 520000, payouts: 390000 },
]

// ─── Export Dropdown ──────────────────────────────────────────────────────────

interface ExportDropdownProps {
  onCSV: () => void
  onPDF: () => void
  label?: string
}

function ExportDropdown({ onCSV, onPDF, label = 'Export' }: ExportDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2 transition-colors"
      >
        <Download size={18} />
        {label}
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <button
            onClick={() => { onCSV(); setOpen(false) }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FileSpreadsheet size={16} className="text-green-600" />
            Export as CSV
          </button>
          <div className="border-t border-gray-100" />
          <button
            onClick={() => { onPDF(); setOpen(false) }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FileText size={16} className="text-red-500" />
            Export as PDF
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SettlementsFinance() {
  const [activeTab, setActiveTab] = useState<'providers' | 'settlements' | 'reports'>('providers')
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Payout states
  const [payoutWallet, setPayoutWallet] = useState<Wallet | null>(null)
  const [payoutAmount, setPayoutAmount] = useState<string>('')
  const [payoutLoading, setPayoutLoading] = useState(false)
  const [payoutError, setPayoutError] = useState<string | null>(null)
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null)

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

  const handleTriggerPayout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payoutWallet) return
    
    const amt = parseFloat(payoutAmount)
    if (isNaN(amt) || amt <= 0) {
      setPayoutError('Please enter a valid amount')
      return
    }
    if (amt > (payoutWallet.balance || 0)) {
      setPayoutError(`Cannot exceed wallet balance of ${formatAmountPlain(payoutWallet.balance || 0)}`)
      return
    }

    setPayoutLoading(true)
    setPayoutError(null)
    setPayoutSuccess(null)
    try {
      await triggerPayout(payoutWallet.id, amt)
      setPayoutSuccess(`Successfully triggered payout of ${formatAmountPlain(amt)}`)
      setPayoutAmount('')
      // Reload data to reflect new balance and settlement
      await loadData()
      setTimeout(() => {
        setPayoutWallet(null)
        setPayoutSuccess(null)
      }, 2000)
    } catch (e) {
      setPayoutError(e instanceof Error ? e.message : 'Failed to trigger payout')
    } finally {
      setPayoutLoading(false)
    }
  }

  const totalWalletBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0)
  const formatAmount = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`

  const getStatusCls = (status?: string) => {
    const s = status?.toLowerCase() || ''
    if (s.includes('process') || s.includes('complete') || s.includes('success')) return 'bg-green-100 text-green-800'
    if (s.includes('fail') || s.includes('reject')) return 'bg-red-100 text-red-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  // ─── Export Handlers ─────────────────────────────────────────────────────────

  const walletHeaders = ['Wallet ID', 'User ID', 'Balance (₹)', 'Currency']
  const walletRows = () =>
    wallets.map((w) => [
      w.id ?? '',
      w.userId ?? '',
      w.balance ?? 0,
      w.currency ?? 'INR',
    ])

  const settlementHeaders = ['Settlement ID', 'Amount (₹)', 'Status', 'Date']
  const settlementRows = () =>
    settlements.map((s) => [
      s.id ?? '',
      s.amount ?? 0,
      s.status ?? 'Unknown',
      s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : '',
    ])

  const revenueHeaders = ['Month', 'Revenue (₹)', 'Payouts (₹)', 'Net (₹)']
  const revenueRows = () =>
    revenueData.map((r) => [r.month, r.revenue, r.payouts, r.revenue - r.payouts])

  // Wallets
  const handleWalletsCSV = () =>
    exportToCSV('wallets', walletHeaders, walletRows())
  const handleWalletsPDF = () =>
    exportToPDF(
      'Wallets Report',
      `Total Balance: ${formatAmountPlain(totalWalletBalance)} across ${wallets.length} wallets`,
      walletHeaders,
      walletRows()
    )

  // Settlements
  const handleSettlementsCSV = () =>
    exportToCSV('settlements', settlementHeaders, settlementRows())
  const handleSettlementsPDF = () =>
    exportToPDF(
      'Settlements Report',
      `${settlements.length} total settlement records`,
      settlementHeaders,
      settlementRows()
    )

  // Revenue (Reports tab)
  const handleRevenueCSV = () =>
    exportToCSV('revenue_report', revenueHeaders, revenueRows())
  const handleRevenuePDF = () =>
    exportToPDF(
      'Revenue vs Payouts Report',
      'Monthly financial summary',
      revenueHeaders,
      revenueRows()
    )

  // Active-tab-aware export for the top header button
  const handlePageExportCSV = () => {
    if (activeTab === 'providers') handleWalletsCSV()
    else if (activeTab === 'settlements') handleSettlementsCSV()
    else handleRevenueCSV()
  }
  const handlePageExportPDF = () => {
    if (activeTab === 'providers') handleWalletsPDF()
    else if (activeTab === 'settlements') handleSettlementsPDF()
    else handleRevenuePDF()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settlements &amp; Finance</h1>
          <p className="text-gray-500 mt-1">Manage wallets and financial settlements</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} /> Refresh
          </button>
          <ExportDropdown
            onCSV={handlePageExportCSV}
            onPDF={handlePageExportPDF}
          />
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
            {(['providers', 'settlements', 'reports'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium border-b-2 capitalize ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
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
                <button onClick={loadData} className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs">
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Wallets Tab */}
              {activeTab === 'providers' && (
                <div>
                  {/* Tab-level export bar */}
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-500">{wallets.length} wallets</p>
                    <ExportDropdown
                      label="Export Wallets"
                      onCSV={handleWalletsCSV}
                      onPDF={handleWalletsPDF}
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Wallet ID', 'User ID', 'Balance', 'Currency', 'Actions'].map((h) => (
                            <th
                              key={h}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {wallets.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                              No wallets found
                            </td>
                          </tr>
                        ) : (
                          wallets.map((wallet) => (
                            <tr key={wallet.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                                {wallet.id?.slice(0, 12)}…
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {wallet.userId || '—'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                {formatAmount(wallet.balance || 0)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {wallet.currency || 'INR'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                                <button
                                  title="Export this wallet"
                                  onClick={() =>
                                    exportToPDF(
                                      `Wallet – ${wallet.id}`,
                                      `User: ${wallet.userId ?? '—'}`,
                                      walletHeaders,
                                      [[wallet.id, wallet.userId ?? '', wallet.balance ?? 0, wallet.currency ?? 'INR']]
                                    )
                                  }
                                  className="text-primary-600 hover:text-primary-900 bg-primary-50 p-1.5 rounded"
                                >
                                  <FileText size={18} />
                                </button>
                                <button
                                  title="Trigger Payout"
                                  onClick={() => {
                                    setPayoutWallet(wallet)
                                    setPayoutAmount('')
                                    setPayoutError(null)
                                    setPayoutSuccess(null)
                                  }}
                                  className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded flex items-center gap-1 text-xs font-semibold"
                                >
                                  <DollarSign size={16} /> Pay
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Settlements Tab */}
              {activeTab === 'settlements' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-500">{settlements.length} records</p>
                    <ExportDropdown
                      label="Export Settlements"
                      onCSV={handleSettlementsCSV}
                      onPDF={handleSettlementsPDF}
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Settlement ID', 'Amount', 'Status', 'Date', 'Actions'].map((h) => (
                            <th
                              key={h}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {settlements.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                              No settlements found
                            </td>
                          </tr>
                        ) : (
                          settlements.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                                {s.id?.slice(0, 12)}…
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                {formatAmount(s.amount || 0)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusCls(s.status)}`}>
                                  {s.status || 'Unknown'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : '—'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  title="Export this settlement"
                                  onClick={() =>
                                    exportToPDF(
                                      `Settlement – ${s.id}`,
                                      `Amount: ${formatAmountPlain(s.amount ?? 0)} · Status: ${s.status ?? 'Unknown'}`,
                                      settlementHeaders,
                                      [
                                        [
                                          s.id,
                                          s.amount ?? 0,
                                          s.status ?? 'Unknown',
                                          s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : '',
                                        ],
                                      ]
                                    )
                                  }
                                  className="text-primary-600 hover:text-primary-900"
                                >
                                  <FileText size={18} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Reports Tab */}
              {activeTab === 'reports' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Revenue vs Payouts (Monthly)</h3>
                      <ExportDropdown
                        label="Export Report"
                        onCSV={handleRevenueCSV}
                        onPDF={handleRevenuePDF}
                      />
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                        <Bar dataKey="payouts" fill="#10b981" name="Payouts" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={handleRevenueCSV}
                      className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <FileSpreadsheet className="text-green-600" size={24} />
                      <div className="text-left">
                        <p className="font-semibold">Export Revenue CSV</p>
                        <p className="text-sm text-gray-500">Monthly revenue &amp; payout breakdown</p>
                      </div>
                    </button>
                    <button
                      onClick={handleRevenuePDF}
                      className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <FileText className="text-red-500" size={24} />
                      <div className="text-left">
                        <p className="font-semibold">Export Revenue PDF</p>
                        <p className="text-sm text-gray-500">Printable financial summary report</p>
                      </div>
                    </button>
                    <button
                      onClick={handleWalletsCSV}
                      className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <FileSpreadsheet className="text-blue-600" size={24} />
                      <div className="text-left">
                        <p className="font-semibold">Export All Wallets CSV</p>
                        <p className="text-sm text-gray-500">Complete wallets data export</p>
                      </div>
                    </button>
                    <button
                      onClick={handleSettlementsCSV}
                      className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <FileSpreadsheet className="text-orange-600" size={24} />
                      <div className="text-left">
                        <p className="font-semibold">Export All Settlements CSV</p>
                        <p className="text-sm text-gray-500">Complete settlements history export</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Payout Modal */}
      {payoutWallet && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ShieldCheck className="text-green-600" /> Trigger Admin Payout
              </h3>
              <button 
                onClick={() => setPayoutWallet(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <p className="text-sm text-gray-500">Wallet ID: <span className="font-mono text-gray-900">{payoutWallet.id}</span></p>
              <p className="text-sm text-gray-500 mt-1">Available Balance: <span className="font-semibold text-green-700">{formatAmountPlain(payoutWallet.balance || 0)}</span></p>
            </div>
            
            <form onSubmit={handleTriggerPayout} className="p-6 space-y-4">
              {payoutSuccess && (
                <div className="p-3 bg-green-50 text-green-800 rounded-lg text-sm mb-4">
                  {payoutSuccess}
                </div>
              )}
              {payoutError && (
                <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm flex items-start gap-2 mb-4">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  {payoutError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payout Amount (₹)</label>
                <div className="relative relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IndianRupee size={16} className="text-gray-500" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="pl-9 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter amount to payout..."
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 flex justify-between">
                  <span>Enter an amount up to available balance</span>
                  <button type="button" onClick={() => setPayoutAmount(String(payoutWallet.balance || 0))} className="text-primary-600 hover:underline">Max</button>
                </p>
              </div>

              <button
                type="submit"
                disabled={payoutLoading || !payoutAmount || (payoutWallet.balance || 0) <= 0}
                className="w-full mt-4 bg-green-600 text-white rounded-lg py-2.5 font-semibold hover:bg-green-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {payoutLoading ? <Loader2 size={18} className="animate-spin" /> : <DollarSign size={18} />}
                Confirm Payout
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
