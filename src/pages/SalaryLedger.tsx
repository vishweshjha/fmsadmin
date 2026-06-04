import { useState, useEffect, useRef } from 'react'
import {
  IndianRupee,
  Search,
  Filter,
  Calendar,
  Download,
  RefreshCw,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  Clock,
  X,
  Loader2,
  FileSpreadsheet,
  FileText,
  Calculator,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingDown
} from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { fetchSalaryLedger, updateSalaryLedger, runSalaryCalculationRoutine, type DailySalaryLedger } from '../services/gyorsApi'
import { exportToCSV, exportToPDF, formatAmountPlain } from '../utils/exportUtils'

// HSL styles for ledger status
const STATUS_STYLES = {
  Paid: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Paid'
  },
  Approved: {
    bg: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
    label: 'Approved'
  },
  'Pending Review': {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    label: 'Pending Review'
  },
  Disputed: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    label: 'Disputed'
  }
}

// Custom Export Dropdown component
interface ExportDropdownProps {
  onCSV: () => void
  onPDF: () => void
  label?: string
}

function ExportDropdown({ onCSV, onPDF, label = 'Export Ledger' }: ExportDropdownProps) {
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
    <div className="relative z-20" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md hover:shadow-primary-500/20 flex items-center gap-2 transition-all duration-200"
      >
        <Download size={18} />
        {label}
        <ChevronDown size={16} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-150 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-250">
          <button
            onClick={() => { onCSV(); setOpen(false) }}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FileSpreadsheet size={16} className="text-green-600" />
            Export as CSV Spreadsheet
          </button>
          <div className="border-t border-gray-100" />
          <button
            onClick={() => { onPDF(); setOpen(false) }}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FileText size={16} className="text-red-500" />
            Export as PDF Document
          </button>
        </div>
      )}
    </div>
  )
}

export default function SalaryLedger() {
  const [ledgers, setLedgers] = useState<DailySalaryLedger[]>([])
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null)
  const [runningRoutine, setRunningRoutine] = useState(false)

  // Filters & State
  const [selectedDateFrom, setSelectedDateFrom] = useState<string>(
    new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0] // last 7 days default
  )
  const [selectedDateTo, setSelectedDateTo] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [cityFilter, setCityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Adjustment Drawer / Modal State
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [activeLedger, setActiveLedger] = useState<DailySalaryLedger | null>(null)
  const [adjustForm, setAdjustForm] = useState({
    baseSalary: 0,
    bonus: 0,
    bonusReason: '',
    penalty: 0,
    penaltyReason: '',
    overtimeHours: 0,
    overtimeRate: 0,
    status: 'Pending Review' as DailySalaryLedger['status']
  })

  useEffect(() => {
    loadLedgerData()
  }, [selectedDateFrom, selectedDateTo])

  const loadLedgerData = async () => {
    setLoading(true)
    try {
      const res = await fetchSalaryLedger({
        dateFrom: selectedDateFrom,
        dateTo: selectedDateTo
      })
      setLedgers(res)
    } catch (e) {
      console.error('Failed to load salary ledgers', e)
    } finally {
      setLoading(false)
    }
  }

  // Open the adjustment sidebar
  const handleOpenAdjust = (item: DailySalaryLedger) => {
    setActiveLedger(item)
    setAdjustForm({
      baseSalary: item.baseSalary,
      bonus: item.bonus,
      bonusReason: item.bonusReason || '',
      penalty: item.penalty,
      penaltyReason: item.penaltyReason || '',
      overtimeHours: item.overtimeHours,
      overtimeRate: item.overtimeRate,
      status: item.status
    })
    setIsAdjustOpen(true)
  }

  // Live calculation of Final Salary inside the Drawer form
  const getLiveFinalSalary = () => {
    const base = Number(adjustForm.baseSalary) || 0
    const bonus = Number(adjustForm.bonus) || 0
    const penalty = Number(adjustForm.penalty) || 0
    const otHours = Number(adjustForm.overtimeHours) || 0
    const otRate = Number(adjustForm.overtimeRate) || 0
    const otPay = otHours * otRate
    return base + bonus + otPay - penalty
  }

  // Submit the adjustments
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeLedger) return
    setIsSaving(true)
    try {
      const liveFinal = getLiveFinalSalary()
      const updates: Partial<DailySalaryLedger> = {
        baseSalary: Number(adjustForm.baseSalary),
        bonus: Number(adjustForm.bonus),
        bonusReason: adjustForm.bonusReason,
        penalty: Number(adjustForm.penalty),
        penaltyReason: adjustForm.penaltyReason,
        overtimeHours: Number(adjustForm.overtimeHours),
        overtimeRate: Number(adjustForm.overtimeRate),
        overtimePay: Number(adjustForm.overtimeHours) * Number(adjustForm.overtimeRate),
        finalSalary: liveFinal,
        status: adjustForm.status
      }

      const updated = await updateSalaryLedger(activeLedger.id, updates)
      
      // Update local state list
      setLedgers(prev => prev.map(item => item.id === activeLedger.id ? updated : item))
      setIsAdjustOpen(false)
      setActiveLedger(null)
    } catch (e) {
      alert('Failed to save manual salary adjustments')
    } finally {
      setIsSaving(false)
    }
  }

  // Bulk payroll approval
  const handleBulkApprove = async () => {
    setLoading(true)
    try {
      const pendingItems = filteredLedgers.filter(l => l.status === 'Pending Review')
      if (pendingItems.length === 0) {
        setBulkSuccess('No pending reviews found in current filtered results.')
        setTimeout(() => setBulkSuccess(null), 3000)
        return
      }

      await Promise.all(
        pendingItems.map(item =>
          updateSalaryLedger(item.id, { status: 'Approved' })
        )
      )

      // Reload
      await loadLedgerData()
      setBulkSuccess(`Successfully approved payroll for ${pendingItems.length} records!`)
      setTimeout(() => setBulkSuccess(null), 4000)
    } catch (e) {
      alert('Failed to bulk approve payroll')
    } finally {
      setLoading(false)
    }
  }

  const handleRunCalculationRoutine = async () => {
    setRunningRoutine(true)
    try {
      const dateToRun = selectedDateTo || new Date().toISOString().split('T')[0]
      const confirmRun = window.confirm(`Are you sure you want to run the Daily Salary Calculation routine for date: ${dateToRun}?`)
      if (!confirmRun) {
        setRunningRoutine(false)
        return
      }

      const res = await runSalaryCalculationRoutine(dateToRun)
      setBulkSuccess(`Calculations completed successfully for ${dateToRun}! Processed: ${res.totalProcessed}, Payout: ₹${res.totalPayoutCalculated.toLocaleString('en-IN')}`)
      setTimeout(() => setBulkSuccess(null), 6000)
      
      // Reload ledger data
      await loadLedgerData()
    } catch (e: any) {
      alert(e?.message || 'Failed to run daily calculations routine')
    } finally {
      setRunningRoutine(false)
    }
  }

  // Filter local ledger items
  const filteredLedgers = ledgers.filter(item => {
    const matchesSearch = item.providerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.providerPhone.includes(searchQuery)
    const matchesCity = cityFilter === 'all' || item.city?.toLowerCase() === cityFilter.toLowerCase()
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesCity && matchesStatus
  })

  // Calculate statistics from filtered items
  const stats = {
    totalRecords: filteredLedgers.length,
    baseSalary: filteredLedgers.reduce((sum, item) => sum + item.baseSalary, 0),
    bonus: filteredLedgers.reduce((sum, item) => sum + item.bonus, 0),
    penalty: filteredLedgers.reduce((sum, item) => sum + item.penalty, 0),
    overtimePay: filteredLedgers.reduce((sum, item) => sum + item.overtimePay, 0),
    finalSalary: filteredLedgers.reduce((sum, item) => sum + item.finalSalary, 0),
    disputed: filteredLedgers.filter(item => item.status === 'Disputed').length,
    pending: filteredLedgers.filter(item => item.status === 'Pending Review').length
  }

  // Format Recharts Chart Data (group by date)
  const chartDataMap = filteredLedgers.reduce((acc, curr) => {
    if (!acc[curr.date]) {
      acc[curr.date] = { date: curr.date, base: 0, bonus: 0, penalty: 0, overtime: 0, total: 0 }
    }
    acc[curr.date].base += curr.baseSalary
    acc[curr.date].bonus += curr.bonus
    acc[curr.date].penalty += curr.penalty
    acc[curr.date].overtime += curr.overtimePay
    acc[curr.date].total += curr.finalSalary
    return acc
  }, {} as Record<string, any>)

  const chartData = Object.values(chartDataMap).sort((a, b) => a.date.localeCompare(b.date))

  // Export handlers
  const exportHeaders = ['Date', 'Service Provider', 'Phone', 'City', 'Base Salary (₹)', 'Bonus (₹)', 'Bonus Reason', 'Penalty (₹)', 'Penalty Reason', 'Overtime Hours', 'Overtime Pay (₹)', 'Final Salary (₹)', 'Status']
  
  const getExportRows = () => filteredLedgers.map(l => [
    l.date,
    l.providerName,
    l.providerPhone,
    l.city || '—',
    l.baseSalary,
    l.bonus,
    l.bonusReason || '—',
    l.penalty,
    l.penaltyReason || '—',
    l.overtimeHours,
    l.overtimePay,
    l.finalSalary,
    l.status
  ])

  const handleExportCSV = () => {
    exportToCSV('salary_ledger_report', exportHeaders, getExportRows())
  }

  const handleExportPDF = () => {
    exportToPDF(
      'Daily Salary Ledger Report',
      `Summary: Base Payouts: ${formatAmountPlain(stats.baseSalary)} | Bonuses: ${formatAmountPlain(stats.bonus)} | Penalties: ${formatAmountPlain(stats.penalty)} | Net Payroll: ${formatAmountPlain(stats.finalSalary)}`,
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
            <span className="bg-primary-600 text-white p-2 rounded-2xl shadow-lg shadow-primary-500/20 animate-pulse">
              <IndianRupee size={28} />
            </span>
            Salary Ledger Dashboard
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Review detailed daily salary payouts, configure custom manual adjustments (bonuses/penalties/overtimes), and approve platform payroll.
          </p>
        </div>

        {/* Floating Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadLedgerData}
            className="flex items-center gap-2 bg-white border border-gray-250 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm shrink-0"
          >
            <RefreshCw size={15} /> Refresh Data
          </button>

          <button
            onClick={handleRunCalculationRoutine}
            disabled={runningRoutine}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md hover:shadow-indigo-500/10 flex items-center gap-2 text-xs transition-all duration-200 disabled:opacity-50 shrink-0"
          >
            {runningRoutine ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Calculator size={15} />
            )}
            Run Daily Calculations
          </button>
          
          <button
            onClick={handleBulkApprove}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md hover:shadow-emerald-500/10 flex items-center gap-2 text-xs transition-all duration-200"
          >
            <UserCheck size={16} /> Bulk Approve Review
          </button>

          <ExportDropdown
            onCSV={handleExportCSV}
            onPDF={handleExportPDF}
          />
        </div>
      </div>

      {/* Bulk Alert Banner */}
      {bulkSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3.5 rounded-2xl flex items-center gap-3 animate-bounce shadow-sm">
          <Sparkles className="text-emerald-600" size={20} />
          <p className="text-sm font-bold">{bulkSuccess}</p>
        </div>
      )}

      {/* Premium Statistics KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Base Salaries', value: `₹${stats.baseSalary.toLocaleString('en-IN')}`, color: 'blue', desc: 'Raw standard shifts duty pay', Icon: Clock },
          { label: 'Bonuses Awarded', value: `₹${stats.bonus.toLocaleString('en-IN')}`, color: 'emerald', desc: 'Rating & attendance incentives', Icon: Sparkles },
          { label: 'Penalties Deducted', value: `₹${stats.penalty.toLocaleString('en-IN')}`, color: 'rose', desc: 'Late clock-ins & security warnings', Icon: TrendingDown },
          { label: 'Overtime Paid', value: `₹${stats.overtimePay.toLocaleString('en-IN')}`, color: 'indigo', desc: 'Extra hours duty compensation', Icon: TrendingUp },
          { label: 'Net Final Payroll', value: `₹${stats.finalSalary.toLocaleString('en-IN')}`, color: 'primary', desc: 'Grand total approved payroll payout', Icon: Calculator }
        ].map(({ label, value, color, desc, Icon }) => {
          const themeMap = {
            blue: 'text-blue-600 bg-blue-50/70 border-blue-100',
            emerald: 'text-emerald-600 bg-emerald-50/70 border-emerald-100',
            rose: 'text-rose-600 bg-rose-50/70 border-rose-100',
            indigo: 'text-indigo-600 bg-indigo-50/70 border-indigo-100',
            primary: 'text-primary-700 bg-primary-50/80 border-primary-150'
          }
          return (
            <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-250">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-3xs font-extrabold uppercase tracking-wider">{label}</p>
                  <p className={`text-2xl font-extrabold mt-2 ${color === 'primary' ? 'text-primary-900' : 'text-gray-900'}`}>{value}</p>
                </div>
                <div className={`p-2.5 rounded-xl border ${themeMap[color as 'blue' | 'emerald' | 'rose' | 'indigo' | 'primary']}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-gray-500 text-3xs mt-3.5 font-semibold leading-relaxed">{desc}</p>
            </div>
          )
        })}
      </div>

      {/* Graphical Breakdown Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">Salary Component Distribution Trends</h3>
              <p className="text-gray-400 text-2xs mt-1 font-semibold">Track daily aggregates of salary structures across the platform</p>
            </div>
            <div className="flex items-center gap-4 text-3xs font-bold text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-primary-500" /> Base Pay</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Bonuses</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-indigo-500" /> Overtime</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> Penalties</span>
            </div>
          </div>

          <div className="h-[280px]">
            {chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">
                No component data logged in current search queries
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="bonusGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                    axisLine={false}
                  />
                  <YAxis 
                    tickFormatter={(v) => `₹${v}`}
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      const labels: Record<string, string> = { base: 'Base Pay', bonus: 'Bonus', overtime: 'Overtime Pay', penalty: 'Penalty', total: 'Net Payroll' }
                      return [`₹${value.toLocaleString('en-IN')}`, labels[name] || name]
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="base" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#baseGrad)" name="base" />
                  <Area type="monotone" dataKey="bonus" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#bonusGrad)" name="bonus" />
                  <Area type="monotone" dataKey="overtime" stroke="#6366f1" strokeWidth={2} fill="none" name="overtime" />
                  <Area type="monotone" dataKey="penalty" stroke="#f43f5e" strokeWidth={1.5} fill="none" strokeDasharray="3 3" name="penalty" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right side alert box */}
        <div className="lg:col-span-4 bg-gradient-to-br from-gray-900 to-slate-800 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-8 -translate-y-8" />
          
          <div className="space-y-4">
            <div className="inline-flex p-2 bg-white/10 rounded-xl">
              <ShieldAlert size={20} className="text-amber-400 shrink-0" />
            </div>
            <div>
              <h3 className="text-base font-bold">Payroll Action Center</h3>
              <p className="text-gray-400 text-3xs mt-1.5 font-semibold leading-relaxed">
                Review flagged payroll records before triggering the payout process.
              </p>
            </div>
          </div>

          <div className="divide-y divide-white/10 mt-6 flex-1 space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-2xs text-gray-400 font-bold">Disputed Ledgers</span>
              <span className={`px-2 py-0.5 rounded-full text-3xs font-bold ${stats.disputed > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-white/10 text-gray-300'}`}>
                {stats.disputed} Items flagged
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-2xs text-gray-400 font-bold">Pending Review Approval</span>
              <span className={`px-2 py-0.5 rounded-full text-3xs font-bold ${stats.pending > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-gray-300'}`}>
                {stats.pending} Records waiting
              </span>
            </div>
          </div>

          <button
            onClick={() => setStatusFilter(stats.disputed > 0 ? 'Disputed' : 'Pending Review')}
            className="w-full mt-6 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl py-3 text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2"
          >
            <span>Resolve Pending Issues</span>
            <ArrowRight size={14} className="text-primary-400" />
          </button>
        </div>
      </div>

      {/* Sleek Search & Filters Panel */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search provider name or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-150 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50/20 font-semibold"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-150 rounded-xl text-3xs font-bold text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Cities</option>
              <option value="Budapest">Budapest</option>
              <option value="Mumbai">Mumbai</option>
              <option value="London">London</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-150 rounded-xl text-3xs font-bold text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Approved">Approved</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Disputed">Disputed</option>
          </select>

          {/* Date Picker Range */}
          <div className="flex items-center gap-1.5 border border-gray-150 px-3 py-2 rounded-xl bg-white shadow-3xs">
            <Calendar size={13} className="text-gray-400" />
            <input
              type="date"
              value={selectedDateFrom}
              onChange={e => setSelectedDateFrom(e.target.value)}
              className="bg-transparent text-3xs font-bold text-gray-700 focus:outline-none w-[90px]"
            />
            <span className="text-3xs text-gray-400 font-bold px-1">to</span>
            <input
              type="date"
              value={selectedDateTo}
              onChange={e => setSelectedDateTo(e.target.value)}
              className="bg-transparent text-3xs font-bold text-gray-700 focus:outline-none w-[90px]"
            />
          </div>
        </div>
      </div>

      {/* Salary Ledger Main Table Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 min-h-[300px]">
            <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-4" />
            <p className="text-gray-500 font-medium text-xs">Fetching salary ledger records...</p>
          </div>
        ) : filteredLedgers.length === 0 ? (
          <div className="py-24 text-center">
            <AlertTriangle size={42} className="text-gray-300 mx-auto mb-3" />
            <p className="font-extrabold text-gray-700 text-lg">No Ledger Records Found</p>
            <p className="text-gray-500 text-xs mt-1 max-w-sm mx-auto font-semibold">
              There are no matching salary ledger logs parsed for the selected dates or filter queries. Adjust filters to load records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-150">
                <tr>
                  {['Service Provider', 'Duty Date', 'Base Pay', 'Bonus Incentive', 'Penalty Fee', 'Overtime Pay', 'Net Salary', 'Payroll Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-4 text-3xs font-extrabold text-gray-450 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredLedgers.map(item => {
                  const style = STATUS_STYLES[item.status] || STATUS_STYLES.Approved
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Provider Profile Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 font-extrabold text-xs shadow-3xs">
                            {item.providerName.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{item.providerName}</p>
                            <p className="text-3xs font-semibold text-gray-400 mt-0.5">{item.providerPhone} · <span className="font-bold text-gray-500">{item.city || 'Mumbai'}</span></p>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-xs font-bold text-gray-700">
                          {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-3xs text-gray-400 mt-0.5 font-bold">{item.shiftName || 'Standard Shift'}</p>
                      </td>

                      {/* Base Salary */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-xs font-extrabold text-gray-900">₹{item.baseSalary}</p>
                      </td>

                      {/* Bonus */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.bonus > 0 ? (
                          <div>
                            <p className="text-xs font-extrabold text-emerald-600">+₹{item.bonus}</p>
                            <p className="text-4xs font-bold text-gray-400 truncate max-w-[120px] mt-0.5" title={item.bonusReason}>{item.bonusReason}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-semibold">—</span>
                        )}
                      </td>

                      {/* Penalty */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.penalty > 0 ? (
                          <div>
                            <p className="text-xs font-extrabold text-rose-600">-₹{item.penalty}</p>
                            <p className="text-4xs font-bold text-gray-450 truncate max-w-[120px] mt-0.5" title={item.penaltyReason}>{item.penaltyReason}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-semibold">—</span>
                        )}
                      </td>

                      {/* Overtime */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.overtimeHours > 0 ? (
                          <div>
                            <p className="text-xs font-extrabold text-indigo-600">+₹{item.overtimePay}</p>
                            <p className="text-4xs font-bold text-gray-400 mt-0.5">{item.overtimeHours}h worked @ ₹{item.overtimeRate}/h</p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-semibold">—</span>
                        )}
                      </td>

                      {/* Final Salary */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 rounded-lg bg-gray-50 border border-gray-150 text-xs font-extrabold text-gray-900">
                          ₹{item.finalSalary.toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-4xs font-extrabold rounded-full border uppercase tracking-wider ${style.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {style.label}
                        </span>
                      </td>

                      {/* Operations */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenAdjust(item)}
                          className="flex items-center gap-1.5 px-3 py-2 text-3xs font-extrabold text-gray-700 bg-white border border-gray-250 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all shadow-3xs"
                          title="Adjust Ledger Details"
                        >
                          <Calculator size={11} className="text-primary-500" /> Adjust Ledger
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Details Floating Drawer Sidebar Dialog */}
      {isAdjustOpen && activeLedger && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
          {/* Backdrop Dismiss clicker */}
          <div className="absolute inset-0" onClick={() => setIsAdjustOpen(false)} />
          
          <div className="bg-white h-full w-full max-w-lg shadow-2xl relative z-10 flex flex-col justify-between border-l border-gray-100 animate-in slide-in-from-right duration-250">
            {/* Header */}
            <div className="p-6 border-b border-gray-150 shrink-0 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <Calculator size={20} className="text-primary-600 animate-spin duration-1000" /> Adjust Salary Ledger
                </h2>
                <p className="text-gray-400 text-3xs font-bold uppercase tracking-wider mt-1">
                  MANUAL FINANCING INCENTIVES &amp; PENALTIES FOR {activeLedger.providerName}
                </p>
              </div>
              <button
                onClick={() => setIsAdjustOpen(false)}
                className="p-2 rounded-xl bg-white border border-gray-250 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors shadow-3xs"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <form onSubmit={handleAdjustSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Duty Overview card */}
              <div className="bg-gradient-to-br from-primary-500 to-sky-600 text-white rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-primary-100 text-4xs font-extrabold uppercase tracking-wide">Logged Duty Shift</p>
                    <p className="font-extrabold text-sm mt-0.5">{activeLedger.shiftName || 'Standard Shift'}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white/20 text-3xs font-bold text-white uppercase tracking-wider">
                    {activeLedger.city || 'Mumbai'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-3.5 border-t border-white/10 text-3xs font-bold">
                  <div>
                    <span className="text-primary-100 block">Duty Date</span>
                    <span className="text-white text-xs mt-0.5 block">{new Date(activeLedger.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div>
                    <span className="text-primary-100 block">Check-In / Out</span>
                    <span className="text-white text-xs mt-0.5 block truncate">
                      {activeLedger.checkInTime ? new Date(activeLedger.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'} 
                      {' → '} 
                      {activeLedger.checkOutTime ? new Date(activeLedger.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Live Formula Callout Box */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-3xs">
                <h4 className="text-3xs font-extrabold text-slate-400 uppercase tracking-wider">Live Payout Math Formula</h4>
                
                <div className="flex flex-wrap items-center gap-1.5 font-extrabold text-xs text-slate-800 pt-1">
                  <span>₹{adjustForm.baseSalary || 0}</span>
                  <span className="text-slate-400 text-3xs font-bold">Base</span>
                  <span className="text-emerald-500">+</span>
                  <span className="text-emerald-600">₹{adjustForm.bonus || 0}</span>
                  <span className="text-slate-400 text-3xs font-bold">Bonus</span>
                  <span className="text-indigo-500">+</span>
                  <span className="text-indigo-600">₹{(Number(adjustForm.overtimeHours) || 0) * (Number(adjustForm.overtimeRate) || 0)}</span>
                  <span className="text-slate-400 text-3xs font-bold">OT</span>
                  <span className="text-rose-500">-</span>
                  <span className="text-rose-600">₹{adjustForm.penalty || 0}</span>
                  <span className="text-slate-400 text-3xs font-bold">Penalty</span>
                </div>

                <div className="pt-3.5 border-t border-slate-200 flex justify-between items-center font-extrabold">
                  <span className="text-2xs text-slate-500 uppercase tracking-wider">Estimated Final Payout</span>
                  <span className="text-lg text-primary-600 bg-primary-50 px-3 py-1 rounded-xl border border-primary-100 shadow-3xs animate-pulse">
                    ₹{getLiveFinalSalary().toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Input Forms */}
              <div className="space-y-4">
                {/* Base Salary */}
                <div>
                  <label className="block text-3xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Duty Base Salary (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={adjustForm.baseSalary}
                    onChange={e => setAdjustForm({ ...adjustForm, baseSalary: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Grid for Bonus & Penalty */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Bonus */}
                  <div>
                    <label className="block text-3xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Award Bonus (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={adjustForm.bonus}
                      onChange={e => setAdjustForm({ ...adjustForm, bonus: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 text-emerald-700 bg-emerald-50/20"
                    />
                  </div>

                  {/* Penalty */}
                  <div>
                    <label className="block text-3xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Apply Penalty (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={adjustForm.penalty}
                      onChange={e => setAdjustForm({ ...adjustForm, penalty: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 text-rose-700 bg-rose-50/20"
                    />
                  </div>
                </div>

                {/* Grid for Reasons */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-3xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Bonus Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. 5-star job"
                      value={adjustForm.bonusReason}
                      onChange={e => setAdjustForm({ ...adjustForm, bonusReason: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-3xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-3xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Penalty Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. late check-in"
                      value={adjustForm.penaltyReason}
                      onChange={e => setAdjustForm({ ...adjustForm, penaltyReason: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-3xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Overtime configurations */}
                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                  <div>
                    <label className="block text-3xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Overtime Duty (Hours)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={adjustForm.overtimeHours}
                      onChange={e => setAdjustForm({ ...adjustForm, overtimeHours: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 text-indigo-700 bg-indigo-50/20"
                    />
                  </div>

                  <div>
                    <label className="block text-3xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Overtime Hourly Rate (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={adjustForm.overtimeRate}
                      onChange={e => setAdjustForm({ ...adjustForm, overtimeRate: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Status Override */}
                <div className="border-t border-gray-100 pt-4">
                  <label className="block text-3xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Duty Payroll Status</label>
                  <select
                    value={adjustForm.status}
                    onChange={e => setAdjustForm({ ...adjustForm, status: e.target.value as DailySalaryLedger['status'] })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Disputed">Disputed</option>
                  </select>
                </div>
              </div>
              
              {/* Confirm Adjustments Action buttons */}
              <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 shrink-0 bg-white sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setIsAdjustOpen(false)}
                  className="px-5 py-3 text-xs text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-extrabold transition-all"
                >
                  Cancel Adjustments
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-3 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-extrabold shadow-lg hover:shadow-primary-500/20 transition-all flex items-center gap-2"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  Save Payroll Adjustments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
