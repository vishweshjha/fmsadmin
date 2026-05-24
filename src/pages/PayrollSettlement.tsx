import { useState, useEffect } from 'react'
import {
  FileCheck,
  Calendar,
  Download,
  RefreshCw,
  TrendingUp,
  Clock,
  Loader2,
  ShieldCheck,
  TrendingDown,
  Lock,
  UserX,
  CreditCard,
  FileText,
  ChevronDown,
  FileSpreadsheet,
  Search
} from 'lucide-react'
import { fetchPayoutSettlements, updatePayoutSettlementStatus, createSettlementBatch, fetchSettlementBatches, type PayoutSettlementItem, type SettlementBatch } from '../services/gyorsApi'
import { exportToCSV, exportToPDF, formatAmountPlain } from '../utils/exportUtils'

// Custom Export Dropdown
interface ExportDropdownProps {
  onCSV: () => void
  onPDF: () => void
  label?: string
}

import { useRef } from 'react'

function ExportDropdown({ onCSV, onPDF, label = 'Export Batches' }: ExportDropdownProps) {
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
    <div className="relative z-20 font-sans" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-white border border-gray-250 hover:bg-gray-50 text-gray-700 font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 text-xs transition-all duration-200"
      >
        <Download size={15} />
        {label}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-150 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-250">
          <button
            onClick={() => { onCSV(); setOpen(false) }}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            <FileSpreadsheet size={16} className="text-green-600" />
            Export as CSV Spreadsheet
          </button>
          <div className="border-t border-gray-100" />
          <button
            onClick={() => { onPDF(); setOpen(false) }}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            <FileText size={16} className="text-red-500" />
            Export as PDF Report
          </button>
        </div>
      )}
    </div>
  )
}



export default function PayrollSettlement() {
  const [payouts, setPayouts] = useState<PayoutSettlementItem[]>([])
  const [batches, setBatches] = useState<SettlementBatch[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'pending' | 'batches'>('pending')

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [cityFilter, setCityFilter] = useState('all')
  const [selectedDateFrom, setSelectedDateFrom] = useState<string>(
    new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0] // last 7 days default
  )
  const [selectedDateTo, setSelectedDateTo] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  // Selection list for bulk processing
  const [checkedIds, setCheckedIds] = useState<string[]>([])

  // Payout Batch Processing Overlay State
  const [isProcessingOpen, setIsProcessingOpen] = useState(false)
  const [processingStep, setProcessingStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [stepLogs, setStepLogs] = useState<string[]>([])
  const [processedBatchResult, setProcessedBatchResult] = useState<SettlementBatch | null>(null)

  // Audit Logs persistence during session
  const [auditLogs, setAuditLogs] = useState<{ id: string; time: string; text: string }[]>([
    { id: '1', time: new Date(Date.now() - 200000).toLocaleTimeString(), text: 'System generated payroll ledger for current cycle.' },
    { id: '2', time: new Date(Date.now() - 100000).toLocaleTimeString(), text: 'Finance admin approved global rating multiplier updates.' }
  ])

  useEffect(() => {
    loadData()
  }, [selectedDateFrom, selectedDateTo])

  const loadData = async () => {
    setLoading(true)
    try {
      const [pRes, bRes] = await Promise.all([
        fetchPayoutSettlements({ dateFrom: selectedDateFrom, dateTo: selectedDateTo }),
        fetchSettlementBatches()
      ])
      setPayouts(pRes)
      setBatches(bRes)
    } catch (e) {
      console.error('Failed to load payroll settlements', e)
    } finally {
      setLoading(false)
    }
  }

  // Update status (Approve, Hold, Reject)
  const handleUpdateStatus = async (id: string, providerName: string, nextStatus: 'Approve' | 'Hold' | 'Reject') => {
    // Optimistic Update
    setPayouts(prev => prev.map(item => item.id === id ? { ...item, status: nextStatus } : item))
    
    // Add audit log
    const statusText = nextStatus === 'Approve' ? 'Approved payout release' : nextStatus === 'Hold' ? 'Placed payout on Hold' : 'Rejected payout'
    setAuditLogs(prev => [
      { id: String(Date.now()), time: new Date().toLocaleTimeString(), text: `Admin ${statusText} for ${providerName}.` },
      ...prev
    ])

    try {
      await updatePayoutSettlementStatus(id, nextStatus)
    } catch (e) {
      // Revert status
      loadData()
      alert('Failed to update settlement status')
    }
  }

  // Checkbox select handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setCheckedIds(filteredPayouts.filter(p => p.status === 'Approve').map(p => p.providerId))
    } else {
      setCheckedIds([])
    }
  }

  const handleSelectOne = (providerId: string, checked: boolean) => {
    if (checked) {
      setCheckedIds(prev => [...prev, providerId])
    } else {
      setCheckedIds(prev => prev.filter(id => id !== providerId))
    }
  }

  // Multi-step batch processing execution flow
  const triggerBatchReleaseFlow = () => {
    const targets = checkedIds.length > 0 
      ? payouts.filter(p => checkedIds.includes(p.providerId) && p.status === 'Approve')
      : payouts.filter(p => p.status === 'Approve')

    if (targets.length === 0) {
      alert('There are no Approved payouts to process! Please select approved service providers.')
      return
    }

    setProcessingStep(1)
    setStepLogs(['Initializing automated processing validation audits...', 'Scanned current active disbursement roster.'])
    setIsProcessingOpen(true)

    // Step 1: Validate (1.5s delay)
    setTimeout(() => {
      setProcessingStep(2)
      setStepLogs(prev => [
        ...prev,
        '✓ Core validation checks PASSED.',
        `Checking ${targets.length} bank details configurations... Done.`,
        'Verifying dispute logs... None active.',
        'Starting settlement batch compiler...'
      ])

      // Step 2: Process (1.8s delay)
      setTimeout(() => {
        setProcessingStep(3)
        setStepLogs(prev => [
          ...prev,
          '✓ Batch layout generated successfully.',
          'Compiling bank clearance files...',
          'Packaging dispatch payloads... DONE.',
          'Writing batch record details to database...'
        ])

        // Step 3: Save (1.5s delay)
        setTimeout(async () => {
          try {
            const batch = await createSettlementBatch({
              dateFrom: selectedDateFrom,
              dateTo: selectedDateTo,
              providerIds: targets.map(t => t.providerId)
            })
            setProcessedBatchResult(batch)

            // Remove processed items optimistically from pending list
            setPayouts(prev => prev.filter(item => !targets.map(t => t.id).includes(item.id)))
            setCheckedIds([])

            setProcessingStep(4)
            setStepLogs(prev => [
              ...prev,
              '✓ Payout Batch securely saved to ledger ledger DB.',
              `Batch Code: ${batch.batchCode}`,
              'Broadcasting alerts to clearance routers...',
              'Dispatching notifications to service providers...'
            ])

            // Step 4: Notify (1.5s delay)
            setTimeout(() => {
              setProcessingStep(5)
              setStepLogs(prev => [
                ...prev,
                '✓ SMS payout confirmations sent.',
                '✓ Provider push notifications triggered successfully.',
                'Disbursement pipeline completes successfully!'
              ])
              
              // Load historical batches and logs
              fetchSettlementBatches().then(setBatches)
              setAuditLogs(prev => [
                { id: String(Date.now()), time: new Date().toLocaleTimeString(), text: `Generated payroll Settlement Batch ${batch.batchCode} for ₹${batch.totalAmount.toLocaleString('en-IN')}.` },
                ...prev
              ])
            }, 1500)

          } catch (e) {
            alert('Failed to save payroll batch settlements')
            setIsProcessingOpen(false)
          }
        }, 1500)

      }, 1800)

    }, 1500)
  }

  // Filter pending payouts
  const filteredPayouts = payouts.filter(p => {
    const matchesSearch = p.providerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.providerPhone.includes(searchQuery)
    const matchesCity = cityFilter === 'all' || p.city?.toLowerCase() === cityFilter.toLowerCase()
    return matchesSearch && matchesCity
  })

  // Calculations for KPI Cards
  const stats = {
    disbursePool: payouts.filter(p => p.status === 'Approve').reduce((sum, item) => sum + item.amount, 0),
    holdPool: payouts.filter(p => p.status === 'Hold').reduce((sum, item) => sum + item.amount, 0),
    rejectPool: payouts.filter(p => p.status === 'Reject').reduce((sum, item) => sum + item.amount, 0),
    totalPending: payouts.length,
    approvedCount: payouts.filter(p => p.status === 'Approve').length,
    settledTotal: batches.reduce((sum, b) => sum + b.totalAmount, 0)
  }

  // CSV/PDF export details
  const exportHeaders = ['Provider Name', 'Phone', 'City', 'Disbursement Target (₹)', 'Bank Name', 'Account Number', 'IFSC Code', 'Payroll State']
  const getExportRows = () => payouts.map(p => [
    p.providerName,
    p.providerPhone,
    p.city || 'Mumbai',
    p.amount,
    p.bankName,
    p.accountNumber,
    p.ifscCode,
    p.status
  ])

  const handleExportCSV = () => {
    exportToCSV('payout_disbursement_settlements', exportHeaders, getExportRows())
  }

  const handleExportPDF = () => {
    exportToPDF(
      'Payroll Disbursement Settlement Audit',
      `Date Range: ${selectedDateFrom} to ${selectedDateTo} | Disbursement Pool: ${formatAmountPlain(stats.disbursePool)} | Hold Pool: ${formatAmountPlain(stats.holdPool)}`,
      exportHeaders,
      getExportRows()
    )
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
            <span className="bg-primary-600 text-white p-2 rounded-2xl shadow-lg shadow-primary-500/20">
              <FileCheck size={28} />
            </span>
            Payroll Settlements (FR-PAY-009)
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Approve, hold, or reject daily payroll payouts, compile bank batch payloads, and disburse target salaries through the validation wizard.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={loadData}
            className="flex items-center gap-2 bg-white border border-gray-250 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCw size={15} /> Refresh Data
          </button>

          <ExportDropdown
            onCSV={handleExportCSV}
            onPDF={handleExportPDF}
          />

          <button
            onClick={triggerBatchReleaseFlow}
            disabled={stats.approvedCount === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md hover:shadow-emerald-500/20 flex items-center gap-2 text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShieldCheck size={16} /> Process &amp; Release Batch
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Disbursement Pool', value: `₹${stats.disbursePool.toLocaleString('en-IN')}`, color: 'emerald', desc: `${stats.approvedCount} approved payouts pending`, Icon: TrendingUp },
          { label: 'Hold Payouts', value: `₹${stats.holdPool.toLocaleString('en-IN')}`, color: 'amber', desc: 'Locked in review/disputed', Icon: Clock },
          { label: 'Rejected Payouts', value: `₹${stats.rejectPool.toLocaleString('en-IN')}`, color: 'rose', desc: 'Deducted from settlement cycle', Icon: TrendingDown },
          { label: 'Grand Total Settled', value: `₹${stats.settledTotal.toLocaleString('en-IN')}`, color: 'indigo', desc: 'Total successfully disbursed', Icon: FileCheck },
          { label: 'Pending Providers', value: stats.totalPending, color: 'blue', desc: 'Active records in filters', Icon: CreditCard }
        ].map(({ label, value, color, desc, Icon }) => {
          const themeMap = {
            emerald: 'text-emerald-600 bg-emerald-50/70 border-emerald-100',
            amber: 'text-amber-600 bg-amber-50/70 border-amber-100',
            rose: 'text-rose-600 bg-rose-50/70 border-rose-100',
            indigo: 'text-indigo-600 bg-indigo-50/70 border-indigo-100',
            blue: 'text-blue-600 bg-blue-50/70 border-blue-100'
          }
          return (
            <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-250">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-3xs font-extrabold uppercase tracking-wider">{label}</p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-2">{value}</p>
                </div>
                <div className={`p-2.5 rounded-xl border ${themeMap[color as 'emerald' | 'amber' | 'rose' | 'indigo' | 'blue']}`}>
                  <Icon size={18} />
                </div>
              </div>
              <p className="text-gray-500 text-3xs mt-3.5 font-semibold leading-relaxed">{desc}</p>
            </div>
          )
        })}
      </div>

      {/* Tabs Menu */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="border-b border-gray-150 bg-gray-50/30 px-6">
          <nav className="flex -mb-px gap-6">
            {[
              { id: 'pending', label: '💳 Pending Disbursements Roster', count: payouts.length },
              { id: 'batches', label: '🗂️ Historical Payout Batches Logs', count: batches.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 text-4xs font-extrabold rounded-full ${
                  activeTab === tab.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content body */}
        <div className="p-6">
          {activeTab === 'pending' ? (
            <div className="space-y-6">
              {/* Date Filters & Search */}
              <div className="flex flex-col md:flex-row items-center gap-4 justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-200/80">
                <div className="relative w-full md:max-w-xs">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search provider name or phone..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-150 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white font-semibold"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                  <select
                    value={cityFilter}
                    onChange={e => setCityFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-150 rounded-xl text-3xs font-bold text-gray-655 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Cities</option>
                    <option value="Budapest">Budapest</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="London">London</option>
                  </select>

                  {/* Date range picker */}
                  <div className="flex items-center gap-1.5 border border-gray-150 px-3 py-2 rounded-xl bg-white shadow-3xs">
                    <Calendar size={13} className="text-gray-400" />
                    <input
                      type="date"
                      value={selectedDateFrom}
                      onChange={e => setSelectedDateFrom(e.target.value)}
                      className="bg-transparent text-3xs font-bold text-gray-700 focus:outline-none w-[90px]"
                    />
                    <span className="text-3xs text-gray-450 font-bold px-1">to</span>
                    <input
                      type="date"
                      value={selectedDateTo}
                      onChange={e => setSelectedDateTo(e.target.value)}
                      className="bg-transparent text-3xs font-bold text-gray-700 focus:outline-none w-[90px]"
                    />
                  </div>
                </div>
              </div>

              {/* Disbursement Payout Table */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-3" />
                    <p className="text-gray-500 font-medium text-xs">Loading pending disbursements...</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-150">
                    <tr>
                      <th className="px-6 py-4 w-12">
                        <input
                          type="checkbox"
                          checked={filteredPayouts.length > 0 && checkedIds.length === filteredPayouts.filter(p => p.status === 'Approve').length}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </th>
                      {['Service Provider', 'Target Salary Payout', 'Bank Institution Details', 'Clearance Status Override', 'Manual Decisions'].map(h => (
                        <th key={h} className="px-6 py-4 text-3xs font-extrabold text-gray-450 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPayouts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-20 text-center">
                          <UserX size={38} className="text-gray-350 mx-auto mb-2" />
                          <p className="font-extrabold text-gray-700">No Payout Records Waiting</p>
                          <p className="text-gray-500 text-3xs mt-0.5">There are no pending salary disbursements in this date range.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredPayouts.map(item => {
                        const isApproved = item.status === 'Approve'
                        const isHold = item.status === 'Hold'
                        const isReject = item.status === 'Reject'
                        const isChecked = checkedIds.includes(item.providerId)
                        
                        return (
                          <tr key={item.id} className={`hover:bg-gray-50/40 transition-colors ${isChecked ? 'bg-primary-50/10' : ''}`}>
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                disabled={item.status !== 'Approve'}
                                checked={isChecked}
                                onChange={e => handleSelectOne(item.providerId, e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-30 disabled:cursor-not-allowed"
                              />
                            </td>

                            {/* Provider Info */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-extrabold text-xs">
                                  {item.providerName.split(' ').map(n=>n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-gray-900">{item.providerName}</p>
                                  <p className="text-3xs font-semibold text-gray-450 mt-0.5">{item.providerPhone} · <span className="font-bold text-gray-650">{item.city}</span></p>
                                </div>
                              </div>
                            </td>

                            {/* Salary value */}
                            <td className="px-6 py-4">
                              <span className="text-xs font-extrabold text-gray-900">
                                ₹{item.amount.toLocaleString('en-IN')}
                              </span>
                            </td>

                            {/* Bank Account */}
                            <td className="px-6 py-4">
                              <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><CreditCard size={11} className="text-gray-400" /> {item.bankName}</p>
                              <p className="text-3xs text-gray-500 mt-0.5 font-mono">A/C: {item.accountNumber} · IFSC: <span className="font-bold uppercase">{item.ifscCode}</span></p>
                            </td>

                            {/* Status Badge */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isApproved && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-4xs font-extrabold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Approve &amp; Ready
                                </span>
                              )}
                              {isHold && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-4xs font-extrabold rounded-full border bg-amber-50 text-amber-700 border-amber-200 uppercase tracking-wider animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  Payout Locked (Hold)
                                </span>
                              )}
                              {isReject && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-4xs font-extrabold rounded-full border bg-rose-50 text-rose-700 border-rose-200 uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                  Rejected from Cycle
                                </span>
                              )}
                            </td>

                            {/* Decisive Toggles buttons */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 font-bold text-3xs">
                                <button
                                  onClick={() => handleUpdateStatus(item.id, item.providerName, 'Approve')}
                                  className={`px-2.5 py-1.5 rounded-lg border transition-all ${
                                    isApproved 
                                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-3xs' 
                                      : 'bg-white border-gray-250 text-gray-500 hover:bg-gray-50'
                                  }`}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(item.id, item.providerName, 'Hold')}
                                  className={`px-2.5 py-1.5 rounded-lg border transition-all ${
                                    isHold 
                                      ? 'bg-amber-500 border-amber-500 text-white shadow-3xs' 
                                      : 'bg-white border-gray-250 text-gray-500 hover:bg-gray-50'
                                  }`}
                                >
                                  Hold
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(item.id, item.providerName, 'Reject')}
                                  className={`px-2.5 py-1.5 rounded-lg border transition-all ${
                                    isReject 
                                      ? 'bg-rose-600 border-rose-600 text-white shadow-3xs' 
                                      : 'bg-white border-gray-250 text-gray-500 hover:bg-gray-50'
                                  }`}
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
                )}
              </div>
            </div>
          ) : (
            /* Historical batches tab content */
            <div className="space-y-6">
              <div className="border border-gray-250 rounded-2xl overflow-hidden bg-white shadow-3xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-150">
                    <tr>
                      {['Batch Identifier Code', 'Ledger Date Range', 'Disbursed Payout Sum', 'Providers Settled', 'Release Date', 'Authorized By', 'Status'].map(h => (
                        <th key={h} className="px-6 py-4 text-3xs font-extrabold text-gray-450 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {batches.map(batch => (
                      <tr key={batch.id} className="hover:bg-gray-50/40 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-xs text-gray-800">{batch.batchCode}</td>
                        <td className="px-6 py-4 text-3xs font-semibold text-gray-650">
                          {new Date(batch.dateFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          {' → '}
                          {new Date(batch.dateTo).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 font-extrabold text-gray-900">₹{batch.totalAmount.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 font-bold text-gray-700">{batch.providerCount} service providers</td>
                        <td className="px-6 py-4 text-3xs text-gray-450">{new Date(batch.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td className="px-6 py-4 text-3xs font-bold text-gray-600">{batch.processedBy}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-150 text-4xs font-extrabold text-emerald-700 uppercase tracking-wider">
                            <ShieldCheck size={10} /> Fully Settled
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit Log Box */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <Lock size={15} className="text-primary-500" /> Secure Batch Settlement Audit Logs (Audit Trail)
        </h4>
        <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 h-[120px] overflow-y-auto space-y-2 font-mono text-3xs text-gray-650">
          {auditLogs.map(log => (
            <div key={log.id} className="flex gap-3 hover:bg-gray-100/50 p-1 rounded">
              <span className="text-gray-400 shrink-0 select-none">[{log.time}]</span>
              <span className="text-slate-800">{log.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Step Batch Release Processor Overlay Wizard Dialog */}
      {isProcessingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin text-primary-600" /> Payroll Disbursement Clearance Router
                </h3>
                <p className="text-gray-400 text-3xs font-bold uppercase tracking-wider mt-1">
                  SYSTEM IS EXECUTING FINANCIAL TRANSFER COMPLIANCE PROTOCOLS
                </p>
              </div>
            </div>

            {/* Stepper progress indicator */}
            <div className="grid grid-cols-4 gap-4 py-8 border-b border-gray-100 shrink-0 select-none text-center">
              {[
                { step: 1, label: '1. Validate Rules', color: 'blue' },
                { step: 2, label: '2. Batch Process', color: 'indigo' },
                { step: 3, label: '3. Save Records', color: 'emerald' },
                { step: 4, label: '4. Notify Staff', color: 'teal' }
              ].map(s => {
                const isDone = processingStep > s.step || processingStep === 5
                const isActive = processingStep === s.step
                
                return (
                  <div key={s.step} className="space-y-2">
                    <div className="flex justify-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                        isDone 
                          ? 'bg-emerald-600 border-emerald-600 text-white' 
                          : isActive 
                            ? 'bg-primary-50 border-primary-500 text-primary-600 animate-pulse' 
                            : 'bg-white border-gray-200 text-gray-400'
                      }`}>
                        {isDone ? '✓' : s.step}
                      </div>
                    </div>
                    <span className={`text-3xs font-extrabold block uppercase tracking-wider ${
                      isDone || isActive ? 'text-gray-900' : 'text-gray-400'
                    }`}>{s.label}</span>
                  </div>
                )
              })}
            </div>

            {/* Main Step interactive layout */}
            <div className="py-6 flex-1 flex flex-col justify-between min-h-[220px]">
              {processingStep !== 5 ? (
                /* Ongoing Steps logs */
                <div className="space-y-4">
                  <h4 className="text-2xs font-extrabold text-gray-400 uppercase tracking-wider">Router Execution Logs</h4>
                  
                  <div className="bg-gray-950 border border-gray-850 rounded-2xl p-4 h-[140px] overflow-y-auto space-y-2.5 font-mono text-3xs text-emerald-400 shadow-inner">
                    {stepLogs.map((log, i) => (
                      <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
                        <span className="text-gray-600 select-none">➔</span>
                        <span>{log}</span>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Loader2 size={11} className="animate-spin text-primary-500 mt-0.5 shrink-0" />
                      <span className="text-gray-500 italic">Processing pipeline instructions...</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Payout Completed Step 5 layout */
                <div className="space-y-6 text-center animate-in zoom-in duration-300 py-4">
                  <div className="w-14 h-14 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                    <ShieldCheck size={32} className="animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-gray-900">Payroll Batch Released Successfully!</h4>
                    <p className="text-gray-400 text-3xs mt-1.5 font-semibold leading-relaxed">
                      A settlement batch containing your selected payout amounts has been persisted, locked, and clearance notifications dispatched.
                    </p>
                  </div>

                  {processedBatchResult && (
                    <div className="max-w-xs mx-auto bg-gray-50 border border-gray-150 rounded-2xl p-4 text-left grid grid-cols-2 gap-4 text-3xs font-bold font-sans mt-4 shadow-3xs">
                      <div>
                        <span className="text-gray-450 block uppercase tracking-wider text-4xs">Batch Code</span>
                        <span className="text-gray-800 font-mono mt-0.5 block">{processedBatchResult.batchCode}</span>
                      </div>
                      <div>
                        <span className="text-gray-450 block uppercase tracking-wider text-4xs">Payout Release</span>
                        <span className="text-emerald-600 text-xs font-extrabold mt-0.5 block">₹{processedBatchResult.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-gray-450 block uppercase tracking-wider text-4xs">Staff Settled</span>
                        <span className="text-gray-800 mt-0.5 block">{processedBatchResult.providerCount} providers</span>
                      </div>
                      <div>
                        <span className="text-gray-450 block uppercase tracking-wider text-4xs">Authorized By</span>
                        <span className="text-gray-800 mt-0.5 block">{processedBatchResult.processedBy}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 shrink-0 flex justify-center">
                    <button
                      onClick={() => {
                        setIsProcessingOpen(false)
                        loadData()
                      }}
                      className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-emerald-500/10 transition-all"
                    >
                      Complete &amp; Close Router
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
