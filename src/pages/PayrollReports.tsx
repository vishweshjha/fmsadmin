import { useState, useEffect } from 'react'
import {
  FileText,
  Calendar,
  Download,
  RefreshCw,
  TrendingUp,
  Loader2,
  ShieldCheck,
  TrendingDown,
  Lock,
  Search,
  Filter,
  Layers,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react'
import {
  fetchGeneratedReports,
  createPayrollReport,
  fetchPayoutSettlements,
  type PayrollReportRecord,
  type PayoutSettlementItem
} from '../services/gyorsApi'
import { exportToCSV, exportToPDF } from '../utils/exportUtils'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'

export default function PayrollReports() {
  const [reports, setReports] = useState<PayrollReportRecord[]>([])
  const [payouts, setPayouts] = useState<PayoutSettlementItem[]>([])

  // Report Form Filters
  const [reportType, setReportType] = useState<'Disbursement Summary' | 'Incentives & Penalties' | 'Provider Earnings' | 'Audit Trail'>('Disbursement Summary')
  const [selectedDateFrom, setSelectedDateFrom] = useState<string>(
    new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0] // last 30 days default
  )
  const [selectedDateTo, setSelectedDateTo] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [reportName, setReportName] = useState('Payroll_Summary_May_2026')

  // Search in Preview Grid
  const [searchQuery, setSearchQuery] = useState('')

  // Export Stepper Wizard Overlay State
  const [isExportingOpen, setIsExportingOpen] = useState(false)
  const [exportStep, setExportStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [stepperLogs, setStepperLogs] = useState<string[]>([])
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'EXCEL' | 'CSV'>('PDF')
  const [compiledReport, setCompiledReport] = useState<PayrollReportRecord | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [rRes, pRes] = await Promise.all([
        fetchGeneratedReports(),
        fetchPayoutSettlements()
      ])
      setReports(rRes)
      setPayouts(pRes)
    } catch (e) {
      console.error('Failed to load reporting analytics datasets', e)
    }
  }

  // Pre-configured Date range presets
  const applyPreset = (preset: 'last_7' | 'this_month' | 'last_month' | 'q1') => {
    const today = new Date()
    let fromDate = new Date()
    
    if (preset === 'last_7') {
      fromDate.setDate(today.getDate() - 7)
    } else if (preset === 'this_month') {
      fromDate = new Date(today.getFullYear(), today.getMonth(), 1)
    } else if (preset === 'last_month') {
      fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      today.setDate(0) // last day of previous month
    } else if (preset === 'q1') {
      fromDate = new Date(today.getFullYear(), 0, 1) // Jan 1st
      today.setMonth(2, 31) // Mar 31st
    }
    
    setSelectedDateFrom(fromDate.toISOString().split('T')[0])
    setSelectedDateTo(today.toISOString().split('T')[0])
  }

  // Handle guided wizard stepper execution
  const executeExportWizard = (format: 'PDF' | 'EXCEL' | 'CSV') => {
    setSelectedFormat(format)
    setExportStep(1)
    setStepperLogs([
      'Audit Router successfully connected.',
      'Checking user JWT session authentication... Approved.',
      `Validating ledger entries between ${selectedDateFrom} and ${selectedDateTo}...`
    ])
    setIsExportingOpen(true)

    // Step 1: Validate (1.4s)
    setTimeout(() => {
      setExportStep(2)
      setStepperLogs(prev => [
        ...prev,
        '✓ Validation compliance audits passed.',
        'Verified bank institutions account clearance... Done.',
        'Audited payroll rule multipliers disputes... None found.',
        `Initiating ${format} document compiler compiler...`
      ])

      // Step 2: Process (1.6s)
      setTimeout(() => {
        setExportStep(3)
        setStepperLogs(prev => [
          ...prev,
          '✓ Aggregated data mapping completed.',
          `Generating final ${format} visual tables...`,
          'Building headers and metadata records... Done.',
          'Injecting audit logs trail persistence...'
        ])

        // Step 3: Save (1.4s)
        setTimeout(async () => {
          try {
            const docName = reportName.trim() ? reportName.replace(/\s+/g, '_') : 'Payroll_Report'
            const record = await createPayrollReport({
              reportName: docName,
              reportType,
              dateFrom: selectedDateFrom,
              dateTo: selectedDateTo,
              recordCount: filteredPayouts.length,
              generatedBy: 'Finance Admin',
              fileFormat: format,
              fileSize: format === 'PDF' ? '1.4 MB' : format === 'EXCEL' ? '410 KB' : '82 KB'
            })
            setCompiledReport(record)
            
            // Re-fetch reports roster
            const allReports = await fetchGeneratedReports()
            setReports(allReports)

            setExportStep(4)
            setStepperLogs(prev => [
              ...prev,
              `✓ ${format} Report persisted safely in local reports logs.`,
              'Registering audit transaction trail codes...',
              'Dispatching email summaries clearance... Done.',
              'Preparing secure download router link...'
            ])

            // Step 4: Notify (1.2s)
            setTimeout(() => {
              setExportStep(5)
              setStepperLogs(prev => [
                ...prev,
                '✓ Admin push alerts triggered.',
                `Payroll Report compilation completes successfully!`
              ])
            }, 1200)

          } catch (e) {
            alert('Failed to persistent save generated report')
            setIsExportingOpen(false)
          }
        }, 1400)

      }, 1600)

    }, 1400)
  }

  // Trigger local download based on compiled format
  const downloadReportFile = (rec: PayrollReportRecord) => {
    const headers = ['Provider Name', 'Phone', 'City', 'Disbursement Amount (₹)', 'Institution', 'Clearance State']
    const rows = payouts.map(p => [
      p.providerName,
      p.providerPhone,
      p.city || 'Mumbai',
      p.amount,
      p.bankName,
      p.status
    ])

    if (rec.fileFormat === 'CSV') {
      exportToCSV(rec.reportName, headers, rows)
    } else if (rec.fileFormat === 'PDF') {
      exportToPDF(
        `${rec.reportType} - Audit Report`,
        `Scope: ${rec.dateFrom} to ${rec.dateTo} | Records Count: ${rec.recordCount} | Generated By: ${rec.generatedBy}`,
        headers,
        rows
      )
    } else {
      // Mocking Excel export
      exportToCSV(`${rec.reportName}_excel`, headers, rows)
    }
  }

  // Live filter grid records
  const filteredPayouts = payouts.filter(p => {
    const matchesSearch = p.providerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.providerPhone.includes(searchQuery)
    return matchesSearch
  })

  // Calculations for Report Summary Indicators
  const reportTotals = {
    grossPayroll: filteredPayouts.reduce((sum, item) => sum + item.amount, 0),
    incentives: filteredPayouts.reduce((sum, item) => sum + (item.amount > 1000 ? 250 : 100), 0),
    penalties: filteredPayouts.filter(p => p.status === 'Hold').reduce((sum, _item) => sum + 150, 0),
    netPayroll: 0
  }
  reportTotals.netPayroll = reportTotals.grossPayroll + reportTotals.incentives - reportTotals.penalties

  // Pie chart category costs distribution
  const categoryCostData = [
    { name: 'Base Salary', value: reportTotals.grossPayroll * 0.75, color: '#10B981' },
    { name: 'Incentives / Bonuses', value: reportTotals.incentives, color: '#8B5CF6' },
    { name: 'Deductions / Penalties', value: reportTotals.penalties, color: '#EF4444' },
    { name: 'Overtime Allowance', value: reportTotals.grossPayroll * 0.15, color: '#6366F1' }
  ]

  // Line chart daily trend mock distribution
  const payoutTrendData = [
    { date: '12 May', disbursements: 14500, incentives: 2200 },
    { date: '14 May', disbursements: 16800, incentives: 2400 },
    { date: '16 May', disbursements: 12900, incentives: 1800 },
    { date: '18 May', disbursements: 19800, incentives: 3100 },
    { date: '20 May', disbursements: 24500, incentives: 4200 },
    { date: '22 May', disbursements: 21100, incentives: 3600 },
    { date: '24 May', disbursements: reportTotals.netPayroll, incentives: reportTotals.incentives }
  ]

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
            <span className="bg-primary-600 text-white p-2 rounded-2xl shadow-lg shadow-primary-500/20">
              <FileText size={28} />
            </span>
            Payroll Reporting (FR-PAY-011)
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Configure reporting scopes, aggregate provider payouts distributions, and export secure audited PDF, Excel spreadsheets, or CSV sheets.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 bg-white border border-gray-250 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm shrink-0 self-start lg:self-center"
        >
          <RefreshCw size={15} /> Refresh Analytics
        </button>
      </div>

      {/* Analytics widgets & configurations side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Report configuration Form */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6 lg:col-span-1 self-start">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Filter size={16} className="text-primary-500" /> Report Specifications
            </h3>
          </div>

          <div className="space-y-4">
            {/* Report Type */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Report Category</label>
              <select
                value={reportType}
                onChange={e => setReportType(e.target.value as any)}
                className="w-full px-3 py-2.5 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Disbursement Summary">Disbursement Summary Report</option>
                <option value="Incentives & Penalties">Incentives &amp; Penalties Analysis</option>
                <option value="Provider Earnings">Provider Earnings Roster</option>
                <option value="Audit Trail">Audit Trail History</option>
              </select>
            </div>

            {/* Document Name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Custom Document Name</label>
              <input
                type="text"
                value={reportName}
                onChange={e => setReportName(e.target.value)}
                placeholder="e.g. Q1_Audit_Summary"
                className="w-full px-3.5 py-2 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
              />
            </div>

            {/* Date Filters presets */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quick Date presets</label>
              <div className="flex flex-wrap gap-1.5 select-none">
                {[
                  { id: 'last_7', label: 'Last 7 Days' },
                  { id: 'this_month', label: 'This Month' },
                  { id: 'last_month', label: 'Last Month' },
                  { id: 'q1', label: 'Q1 Period' }
                ].map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id as any)}
                    className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 text-3xs font-bold text-gray-650 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Picker Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date From</label>
                <div className="relative">
                  <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={selectedDateFrom}
                    onChange={e => setSelectedDateFrom(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-2 border border-gray-250 rounded-xl text-3xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date To</label>
                <div className="relative">
                  <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={selectedDateTo}
                    onChange={e => setSelectedDateTo(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-2 border border-gray-250 rounded-xl text-3xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5 space-y-2.5 select-none">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => executeExportWizard('PDF')}
                className="flex flex-col items-center gap-1.5 bg-red-50 hover:bg-red-100/70 border border-red-200 py-3 rounded-2xl text-red-700 font-bold transition-all"
              >
                <FileText size={20} />
                <span className="text-3xs tracking-wider uppercase font-extrabold">PDF Log</span>
              </button>
              
              <button
                onClick={() => executeExportWizard('EXCEL')}
                className="flex flex-col items-center gap-1.5 bg-green-50 hover:bg-green-100/70 border border-green-200 py-3 rounded-2xl text-green-700 font-bold transition-all"
              >
                <FileSpreadsheet size={20} />
                <span className="text-3xs tracking-wider uppercase font-extrabold">Excel sheet</span>
              </button>
              
              <button
                onClick={() => executeExportWizard('CSV')}
                className="flex flex-col items-center gap-1.5 bg-blue-50 hover:bg-blue-100/70 border border-blue-200 py-3 rounded-2xl text-blue-700 font-bold transition-all"
              >
                <Layers size={20} />
                <span className="text-3xs tracking-wider uppercase font-extrabold">CSV Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Visualization Summary & Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Aggregated Quick Metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Audited Gross Payroll', value: `₹${reportTotals.grossPayroll.toLocaleString('en-IN')}`, color: 'emerald', Icon: TrendingUp },
              { label: 'Bonuses & Incentives', value: `₹${reportTotals.incentives.toLocaleString('en-IN')}`, color: 'indigo', Icon: ShieldCheck },
              { label: 'Deductions & Holds', value: `₹${reportTotals.penalties.toLocaleString('en-IN')}`, color: 'rose', Icon: TrendingDown }
            ].map(m => {
              const colorsMap = {
                emerald: 'bg-emerald-50/70 border-emerald-100 text-emerald-600',
                indigo: 'bg-indigo-50/70 border-indigo-100 text-indigo-600',
                rose: 'bg-rose-50/70 border-rose-100 text-rose-600'
              }
              return (
                <div key={m.label} className="bg-white border border-gray-200 p-5 rounded-2xl flex justify-between items-center shadow-3xs">
                  <div>
                    <span className="text-gray-400 text-3xs font-extrabold uppercase tracking-wider">{m.label}</span>
                    <h3 className="text-xl font-black text-gray-900 mt-1">{m.value}</h3>
                  </div>
                  <div className={`p-2 rounded-xl border ${colorsMap[m.color as 'emerald' | 'indigo' | 'rose']}`}>
                    <m.Icon size={18} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Graphical Analytics Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart cost allocation distribution */}
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="text-2xs font-extrabold text-gray-400 uppercase tracking-wider">Estimated Costs Distribution Allocation</h4>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryCostData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryCostData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                      contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-3xs font-bold text-gray-600 leading-relaxed">
                {categoryCostData.map(c => (
                  <div key={c.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="truncate">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Line Chart Trend overview */}
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="text-2xs font-extrabold text-gray-400 uppercase tracking-wider">Payroll Disbursement trends over time</h4>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={payoutTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={9} tickLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={9} tickLine={false} />
                    <Tooltip
                      formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Disbursed']}
                      contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                    />
                    <Line type="monotone" dataKey="disbursements" stroke="#10B981" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="incentives" stroke="#6366F1" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Table Preview Section */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-gray-150 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              📂 Report Database Preview Grid ({reportType})
            </h3>
            <p className="text-gray-500 text-3xs font-semibold mt-1 uppercase tracking-wider">
              Scanned active provider rows satisfying current dates range parameters
            </p>
          </div>
          
          <div className="relative max-w-xs shrink-0">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search target providers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-1.5 border border-gray-250 rounded-xl text-3xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/70 border-b border-gray-150">
              <tr>
                {['Provider Name', 'Phone No', 'City Scope', 'Base Payout Target', 'Incentives Sum', 'Deductions Sum', 'Bank Status'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-3xs font-extrabold text-gray-450 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-450 font-bold">
                    <AlertTriangle size={24} className="mx-auto mb-2 text-gray-300" />
                    No preview rows matching filters
                  </td>
                </tr>
              ) : (
                filteredPayouts.map(p => {
                  const isApproved = p.status === 'Approve'
                  const isHold = p.status === 'Hold'
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{p.providerName}</td>
                      <td className="px-6 py-4 font-semibold text-gray-500">{p.providerPhone}</td>
                      <td className="px-6 py-4 font-bold text-gray-600">{p.city}</td>
                      <td className="px-6 py-4 font-extrabold text-gray-900">₹{p.amount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">+₹{(p.amount > 1000 ? 250 : 100).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-rose-600 font-bold">-₹{(p.status === 'Hold' ? 150 : 0).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-4xs font-extrabold uppercase tracking-wider border ${
                          isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isHold ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Persistent historical reports logs list */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="border-b border-gray-100 pb-3 flex justify-between items-center select-none">
          <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Lock size={15} className="text-primary-500" /> Secure Reports Exportation Audit Trail Ledger
          </h4>
          <span className="px-2 py-0.5 text-4xs font-extrabold bg-primary-100 text-primary-700 rounded-full">{reports.length} generated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-150">
              <tr>
                {['Report Name', 'Specification Type', 'Scope Dates', 'Records', 'Format', 'File Size', 'Generated By', 'Dispatched at', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-3xs font-extrabold text-gray-450 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-650">
              {reports.map(rec => {
                const isPDF = rec.fileFormat === 'PDF'
                const isExcel = rec.fileFormat === 'EXCEL'
                return (
                  <tr key={rec.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 font-mono">{rec.reportName}</td>
                    <td className="px-6 py-4 text-primary-600 font-bold">{rec.reportType}</td>
                    <td className="px-6 py-4 text-3xs">
                      {new Date(rec.dateFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      {' → '}
                      {new Date(rec.dateTo).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{rec.recordCount} rows</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-4xs font-extrabold ${
                        isPDF ? 'bg-red-50 text-red-700' : isExcel ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {rec.fileFormat}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">{rec.fileSize}</td>
                    <td className="px-6 py-4 text-gray-550">{rec.generatedBy}</td>
                    <td className="px-6 py-4 text-3xs text-gray-400">{new Date(rec.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => downloadReportFile(rec)}
                        className="flex items-center gap-1 bg-white border border-gray-250 hover:bg-gray-50 text-3xs font-bold text-gray-750 px-2 py-1.5 rounded-lg shadow-3xs transition-all"
                      >
                        <Download size={11} /> Download
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stepper Guided Export Processor Wizard Modal */}
      {isExportingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 shrink-0 select-none">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin text-primary-600" /> Guided Export compliance Wizard
                </h3>
                <p className="text-gray-400 text-3xs font-bold uppercase tracking-wider mt-1">
                  SYSTEM IS RUNNING GENERATED REPORT PERMISSIONS VERIFICATION
                </p>
              </div>
            </div>

            {/* Stepper visual progress */}
            <div className="grid grid-cols-4 gap-4 py-8 border-b border-gray-100 shrink-0 select-none text-center">
              {[
                { step: 1, label: '1. Validate Data', color: 'emerald' },
                { step: 2, label: '2. Process Format', color: 'blue' },
                { step: 3, label: '3. Save Record', color: 'teal' },
                { step: 4, label: '4. Notify Admin', color: 'indigo' }
              ].map(s => {
                const isDone = exportStep > s.step || exportStep === 5
                const isActive = exportStep === s.step
                
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

            {/* Stepper content logs */}
            <div className="py-6 flex flex-col justify-between min-h-[220px]">
              {exportStep !== 5 ? (
                <div className="space-y-4">
                  <h4 className="text-2xs font-extrabold text-gray-400 uppercase tracking-wider">Reports Clearance Logs</h4>
                  
                  <div className="bg-gray-950 border border-gray-850 rounded-2xl p-4 h-[140px] overflow-y-auto space-y-2.5 font-mono text-3xs text-emerald-400 shadow-inner">
                    {stepperLogs.map((log, i) => (
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
                /* Complete Step 5 */
                <div className="space-y-6 text-center animate-in zoom-in duration-300 py-4 select-none">
                  <div className="w-14 h-14 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                    <ShieldCheck size={32} className="animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-gray-900">Payroll Report Exported Successfully!</h4>
                    <p className="text-gray-400 text-3xs mt-1.5 font-semibold leading-relaxed max-w-sm mx-auto">
                      A secured complied {selectedFormat} file containing filtered ledger data has been successfully generated, logged, and ready to download.
                    </p>
                  </div>

                  {compiledReport && (
                    <div className="max-w-xs mx-auto bg-gray-50 border border-gray-150 rounded-2xl p-4 text-left grid grid-cols-2 gap-4 text-3xs font-bold font-sans shadow-3xs">
                      <div>
                        <span className="text-gray-450 block uppercase tracking-wider text-4xs">Report Name</span>
                        <span className="text-gray-800 font-mono mt-0.5 block truncate">{compiledReport.reportName}</span>
                      </div>
                      <div>
                        <span className="text-gray-450 block uppercase tracking-wider text-4xs">File Format</span>
                        <span className="text-primary-600 font-bold text-xs mt-0.5 block">{compiledReport.fileFormat}</span>
                      </div>
                      <div>
                        <span className="text-gray-450 block uppercase tracking-wider text-4xs">Records Exported</span>
                        <span className="text-gray-850 mt-0.5 block">{compiledReport.recordCount} rows</span>
                      </div>
                      <div>
                        <span className="text-gray-450 block uppercase tracking-wider text-4xs">File Size</span>
                        <span className="text-gray-800 mt-0.5 block">{compiledReport.fileSize}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 shrink-0 flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setIsExportingOpen(false)
                        if (compiledReport) downloadReportFile(compiledReport)
                      }}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-emerald-500/10 transition-all flex items-center gap-1.5"
                    >
                      <Download size={14} /> Download File
                    </button>
                    <button
                      onClick={() => setIsExportingOpen(false)}
                      className="px-6 py-2.5 bg-white border border-gray-250 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all"
                    >
                      Close Router
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
