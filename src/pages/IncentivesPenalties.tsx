import { useState, useEffect } from 'react'
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  Plus,
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  Award,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Edit2,
  Trash2,
  X,
  Loader2,
  Calculator,
  IndianRupee,
  MapPin,
  HelpCircle,
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileText
} from 'lucide-react'
import { fetchPayrollRules, createPayrollRule, updatePayrollRule, deletePayrollRule, type PayrollRule } from '../services/gyorsApi'
import { exportToCSV, exportToPDF } from '../utils/exportUtils'
import { useRef } from 'react'

// Custom Export Dropdown component
interface ExportDropdownProps {
  onCSV: () => void
  onPDF: () => void
  label?: string
}

function ExportDropdown({ onCSV, onPDF, label = 'Export Rules' }: ExportDropdownProps) {
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
            Export as CSV List
          </button>
          <div className="border-t border-gray-100" />
          <button
            onClick={() => { onPDF(); setOpen(false) }}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            <FileText size={16} className="text-red-500" />
            Export as PDF List
          </button>
        </div>
      )}
    </div>
  )
}

export default function IncentivesPenalties() {
  const [rules, setRules] = useState<PayrollRule[]>([])
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'incentive' | 'penalty' | 'simulator'>('incentive')

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('all')

  // Modal Dialog Configuration
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<PayrollRule | null>(null)
  const [formState, setFormState] = useState({
    name: '',
    type: 'Incentive' as PayrollRule['type'],
    category: 'Attendance' as PayrollRule['category'],
    conditionText: '',
    valueType: 'Flat' as PayrollRule['valueType'],
    value: 0,
    city: 'All',
    status: 'Active' as PayrollRule['status']
  })

  // Rule Simulator State
  const [simBaseSalary, setSimBaseSalary] = useState<number>(800)
  const [simRating, setSimRating] = useState<number>(4.9)
  const [simLateCheckIn, setSimLateCheckIn] = useState<boolean>(false)
  const [simPerfectAttendance, setSimPerfectAttendance] = useState<boolean>(true)
  const [simProtocolViolation, setSimProtocolViolation] = useState<boolean>(false)
  const [simWeekendWork, setSimWeekendWork] = useState<boolean>(false)

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    setLoading(true)
    try {
      const res = await fetchPayrollRules()
      setRules(res)
    } catch (e) {
      console.error('Failed to load payroll rules', e)
    } finally {
      setLoading(false)
    }
  }

  // Toggle active status
  const handleToggleStatus = async (rule: PayrollRule) => {
    const nextStatus = rule.status === 'Active' ? 'Inactive' : 'Active'
    
    // Optimistic Update
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, status: nextStatus } : r))

    try {
      await updatePayrollRule(rule.id, { status: nextStatus })
    } catch (e) {
      // Revert if API failed
      setRules(prev => prev.map(r => r.id === rule.id ? rule : r))
      alert('Failed to update rule status')
    }
  }

  // Open edit modal
  const handleOpenEdit = (rule: PayrollRule) => {
    setEditingRule(rule)
    setFormState({
      name: rule.name,
      type: rule.type,
      category: rule.category,
      conditionText: rule.conditionText,
      valueType: rule.valueType,
      value: rule.value,
      city: rule.city,
      status: rule.status
    })
    setIsModalOpen(true)
  }

  // Open create modal
  const handleOpenCreate = () => {
    setEditingRule(null)
    setFormState({
      name: '',
      type: activeTab === 'penalty' ? 'Penalty' : 'Incentive',
      category: 'Attendance',
      conditionText: '',
      valueType: 'Flat',
      value: 0,
      city: 'All',
      status: 'Active'
    })
    setIsModalOpen(true)
  }

  // Delete rule configuration
  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payroll rule configuration?')) return
    setRules(prev => prev.filter(r => r.id !== id))
    try {
      await deletePayrollRule(id)
    } catch (e) {
      loadRules()
      alert('Failed to delete rule config')
    }
  }

  // Save rule (Create or Update)
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (editingRule) {
        // Update
        const updated = await updatePayrollRule(editingRule.id, {
          name: formState.name,
          type: formState.type,
          category: formState.category,
          conditionText: formState.conditionText,
          valueType: formState.valueType,
          value: Number(formState.value),
          city: formState.city,
          status: formState.status
        })
        setRules(prev => prev.map(r => r.id === editingRule.id ? updated : r))
      } else {
        // Create
        const newRule: PayrollRule = {
          id: `rule-${Date.now()}`,
          name: formState.name,
          type: formState.type,
          category: formState.category,
          conditionText: formState.conditionText,
          valueType: formState.valueType,
          value: Number(formState.value),
          city: formState.city,
          status: formState.status,
          createdAt: new Date().toISOString()
        }
        const created = await createPayrollRule(newRule)
        setRules(prev => [...prev, created])
      }
      setIsModalOpen(false)
      setEditingRule(null)
    } catch (e) {
      alert('Failed to save payroll rule configuration')
    } finally {
      setIsSaving(false)
    }
  }

  // Filter rules list
  const filteredRules = rules.filter(r => {
    const matchesTab = r.type.toLowerCase() === activeTab
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.conditionText.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter
    const matchesCity = cityFilter === 'all' || r.city?.toLowerCase() === cityFilter.toLowerCase()
    
    return matchesTab && matchesSearch && matchesCategory && matchesCity
  })

  // Statistics summaries
  const stats = {
    totalIncentives: rules.filter(r => r.type === 'Incentive' && r.status === 'Active').length,
    totalPenalties: rules.filter(r => r.type === 'Penalty' && r.status === 'Active').length,
    totalActive: rules.filter(r => r.status === 'Active').length,
    flatRules: rules.filter(r => r.valueType === 'Flat' && r.status === 'Active').length,
    percentageRules: rules.filter(r => r.valueType === 'Percentage' && r.status === 'Active').length
  }

  // Category Icon helper
  const getCategoryIcon = (category: PayrollRule['category']) => {
    switch (category) {
      case 'Attendance': return <Clock size={16} className="text-blue-500" />
      case 'Rating': return <Award size={16} className="text-amber-500" />
      case 'Compliance': return <ShieldCheck size={16} className="text-emerald-500" />
      default: return <Sparkles size={16} className="text-purple-500" />
    }
  }

  // Interactive Live Rule Simulator Logic
  const getSimulatedCalculations = () => {
    let base = Number(simBaseSalary) || 0
    let bonusesList: { name: string; amount: number }[] = []
    let deductionsList: { name: string; amount: number }[] = []

    // Map active rules in simulation
    rules.forEach(rule => {
      if (rule.status !== 'Active') return

      const valueAmt = rule.valueType === 'Flat' ? rule.value : (base * rule.value) / 100

      if (rule.type === 'Incentive') {
        if (rule.id === 'rule-attendance-bonus' && simPerfectAttendance) {
          bonusesList.push({ name: rule.name, amount: valueAmt })
        } else if (rule.id === 'rule-high-rating-bonus' && simRating >= 4.8) {
          bonusesList.push({ name: rule.name, amount: valueAmt })
        } else if (rule.id === 'rule-perfect-weekend-bonus' && simWeekendWork && simPerfectAttendance) {
          bonusesList.push({ name: rule.name, amount: valueAmt })
        }
      } else {
        if (rule.id === 'rule-late-login-penalty' && simLateCheckIn) {
          deductionsList.push({ name: rule.name, amount: valueAmt })
        } else if (rule.id === 'rule-safety-warning-penalty' && simProtocolViolation) {
          deductionsList.push({ name: rule.name, amount: valueAmt })
        } else if (rule.id === 'rule-early-checkout-penalty' && !simPerfectAttendance) {
          // checkout early
          deductionsList.push({ name: rule.name, amount: valueAmt })
        }
      }
    })

    const totalBonuses = bonusesList.reduce((sum, item) => sum + item.amount, 0)
    const totalDeductions = deductionsList.reduce((sum, item) => sum + item.amount, 0)
    const netPayout = base + totalBonuses - totalDeductions

    return {
      base,
      bonusesList,
      deductionsList,
      totalBonuses,
      totalDeductions,
      netPayout
    }
  }

  const simResult = getSimulatedCalculations()

  // Export handlers
  const exportHeaders = ['Rule ID', 'Name', 'Classification', 'Category', 'Condition Trigger Description', 'Multiplier Type', 'Multiplier Rate', 'Target City', 'Status']
  const getExportRows = () => rules.map(r => [
    r.id,
    r.name,
    r.type,
    r.category,
    r.conditionText,
    r.valueType,
    r.valueType === 'Flat' ? `₹${r.value}` : `${r.value}%`,
    r.city,
    r.status
  ])

  const handleExportCSV = () => {
    exportToCSV('payroll_incentive_penalty_configurations', exportHeaders, getExportRows())
  }

  const handleExportPDF = () => {
    exportToPDF(
      'Payroll Rule Configurations',
      `Summary: Total Active Rules: ${stats.totalActive} | Active Bonuses: ${stats.totalIncentives} | Active Deductions: ${stats.totalPenalties}`,
      exportHeaders,
      getExportRows()
    )
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
            <span className="bg-primary-600 text-white p-2 rounded-2xl shadow-lg shadow-primary-500/20">
              <Sparkles size={28} />
            </span>
            Incentives &amp; Penalties Configuration
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Define system-wide rules for attendance rewards, service rating bonuses, check-in deductions, and safety compliance penalties.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={loadRules}
            className="flex items-center gap-2 bg-white border border-gray-250 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCw size={15} /> Refresh Rules
          </button>
          
          <ExportDropdown
            onCSV={handleExportCSV}
            onPDF={handleExportPDF}
          />

          {activeTab !== 'simulator' && (
            <button
              onClick={handleOpenCreate}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md hover:shadow-primary-500/20 flex items-center gap-2 text-xs transition-all duration-200"
            >
              <Plus size={16} /> Configure New Rule
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Active Incentives', value: stats.totalIncentives, color: 'emerald', desc: 'Active reward bonuses', Icon: TrendingUp },
          { label: 'Active Penalties', value: stats.totalPenalties, color: 'rose', desc: 'Active payroll deductions', Icon: TrendingDown },
          { label: 'Total Active Rules', value: stats.totalActive, color: 'blue', desc: 'Active system configurations', Icon: Sparkles },
          { label: 'Flat Rate Values', value: stats.flatRules, color: 'indigo', desc: 'Fixed flat currency values', Icon: IndianRupee },
          { label: 'Percentage Multipliers', value: stats.percentageRules, color: 'amber', desc: 'Base salary percentages', Icon: Calculator }
        ].map(({ label, value, color, desc, Icon }) => {
          const themeMap = {
            emerald: 'text-emerald-600 bg-emerald-50/70 border-emerald-100',
            rose: 'text-rose-600 bg-rose-50/70 border-rose-100',
            blue: 'text-blue-600 bg-blue-50/70 border-blue-100',
            indigo: 'text-indigo-600 bg-indigo-50/70 border-indigo-100',
            amber: 'text-amber-600 bg-amber-50/70 border-amber-100'
          }
          return (
            <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-250">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-3xs font-extrabold uppercase tracking-wider">{label}</p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-2">{value}</p>
                </div>
                <div className={`p-2.5 rounded-xl border ${themeMap[color as 'emerald' | 'rose' | 'blue' | 'indigo' | 'amber']}`}>
                  <Icon size={18} />
                </div>
              </div>
              <p className="text-gray-500 text-3xs mt-3.5 font-semibold leading-relaxed">{desc}</p>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="border-b border-gray-150 bg-gray-50/30 px-6">
          <nav className="flex -mb-px gap-6">
            {[
              { id: 'incentive', label: '💰 Incentives & Rewards (Bonuses)', count: rules.filter(r => r.type === 'Incentive').length },
              { id: 'penalty', label: '⚠️ Penalties & Deductions (Deductions)', count: rules.filter(r => r.type === 'Penalty').length },
              { id: 'simulator', label: '📊 Live Rule Simulator Calc', count: null }
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
                {tab.count !== null && (
                  <span className={`px-2 py-0.5 text-4xs font-extrabold rounded-full ${
                    activeTab === tab.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {activeTab !== 'simulator' ? (
            <div className="space-y-6">
              {/* Search & Filter subpanel */}
              <div className="flex flex-col md:flex-row items-center gap-4 justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-200/80">
                <div className="relative w-full md:max-w-xs">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search rules name or descriptions..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-150 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white font-semibold"
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-150 rounded-xl text-3xs font-bold text-gray-650 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="Attendance">Attendance Category</option>
                    <option value="Rating">Rating Category</option>
                    <option value="Compliance">Compliance Category</option>
                    <option value="Shift">Shift Category</option>
                  </select>

                  <select
                    value={cityFilter}
                    onChange={e => setCityFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-150 rounded-xl text-3xs font-bold text-gray-650 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Cities Scope</option>
                    <option value="All">Global (All Cities)</option>
                    <option value="Budapest">Budapest</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="London">London</option>
                  </select>
                </div>
              </div>

              {/* Cards Roster */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="animate-spin text-primary-600 mb-2" />
                  <p className="text-gray-500 text-xs font-semibold">Loading payroll configurations...</p>
                </div>
              ) : filteredRules.length === 0 ? (
                <div className="py-20 text-center border border-dashed rounded-3xl bg-gray-50/20">
                  <AlertTriangle className="mx-auto text-gray-300 mb-3" size={38} />
                  <p className="font-extrabold text-gray-700 text-base">No Matching Rule Configurations</p>
                  <p className="text-gray-500 text-xs mt-1 max-w-sm mx-auto font-semibold">
                    No rules matching your filter queries could be parsed. Clear search inputs or click "+ Configure New Rule" to seed custom triggers.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredRules.map(rule => {
                    const isActive = rule.status === 'Active'
                    return (
                      <div
                        key={rule.id}
                        className={`bg-white border rounded-2xl p-5 hover:shadow-md transition-all duration-250 relative overflow-hidden flex flex-col justify-between min-h-[220px] ${
                          isActive ? 'border-gray-200' : 'border-gray-150 bg-gray-50/30'
                        }`}
                      >
                        {/* Status bar marker */}
                        <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                          !isActive ? 'bg-gray-300' : rule.type === 'Incentive' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`} />

                        {/* Top rule line */}
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-50 border border-gray-150 text-4xs font-bold text-gray-500">
                              {getCategoryIcon(rule.category)}
                              {rule.category}
                            </span>
                            
                            {/* Slide active Switch Toggle */}
                            <button
                              onClick={() => handleToggleStatus(rule)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              title={isActive ? 'Deactivate Rule' : 'Activate Rule'}
                            >
                              {isActive ? (
                                <ToggleRight size={26} className="text-emerald-500" />
                              ) : (
                                <ToggleLeft size={26} className="text-gray-300" />
                              )}
                            </button>
                          </div>

                          <h4 className={`text-sm font-extrabold mt-3 ${isActive ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
                            {rule.name}
                          </h4>
                          <p className="text-3xs text-gray-400 font-semibold leading-relaxed mt-2.5">
                            {rule.conditionText}
                          </p>
                        </div>

                        {/* Bottom line rates */}
                        <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
                          <div>
                            <span className="text-4xs font-extrabold text-gray-400 uppercase tracking-wider block">Payroll Rate Impact</span>
                            <span className={`text-base font-extrabold mt-0.5 block ${
                              !isActive ? 'text-gray-400' : rule.type === 'Incentive' ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {rule.type === 'Incentive' ? '+' : '-'}
                              {rule.valueType === 'Flat' ? `₹${rule.value}` : `${rule.value}%`}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-3xs font-extrabold text-gray-400 bg-gray-50 border border-gray-150 px-2 py-0.5 rounded flex items-center gap-1">
                              <MapPin size={10} /> {rule.city}
                            </span>
                            
                            <button
                              onClick={() => handleOpenEdit(rule)}
                              className="p-1.5 rounded-lg border border-gray-250 text-gray-500 hover:bg-gray-50 hover:text-gray-700 shadow-3xs"
                              title="Edit Rule Configuration"
                            >
                              <Edit2 size={11} />
                            </button>

                            <button
                              onClick={() => handleDeleteRule(rule.id)}
                              className="p-1.5 rounded-lg border border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-700 shadow-3xs"
                              title="Delete Rule"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Simulator Tab contents */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left simulator control configuration */}
              <div className="lg:col-span-5 bg-gray-50/50 border border-gray-200 rounded-3xl p-6 space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                    <Calculator size={18} className="text-primary-600" /> Payroll Simulation Parameters
                  </h3>
                  <p className="text-gray-400 text-3xs font-semibold mt-1">Adjust provider variables below to review how system-configured rule trigger metrics affect Net Salary.</p>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Slider Base Salary */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-gray-750 mb-1.5">
                      <span>Assigned Shift Base Salary</span>
                      <span className="text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-lg border border-primary-100">₹{simBaseSalary}</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="1500"
                      step="50"
                      value={simBaseSalary}
                      onChange={e => setSimBaseSalary(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div className="flex justify-between text-4xs font-bold text-gray-400 mt-1">
                      <span>₹500 Min</span>
                      <span>₹1500 Max</span>
                    </div>
                  </div>

                  {/* Rating selection */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-gray-750 mb-1.5">
                      <span>Customer Average Rating</span>
                      <span className="text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-100">{simRating} ★</span>
                    </div>
                    <input
                      type="range"
                      min="3.0"
                      max="5.0"
                      step="0.1"
                      value={simRating}
                      onChange={e => setSimRating(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-4xs font-bold text-gray-400 mt-1">
                      <span>3.0★ Min</span>
                      <span>5.0★ Max</span>
                    </div>
                  </div>

                  {/* Attendance Switches checkboxes */}
                  <div className="border-t border-gray-200/80 pt-4 space-y-3">
                    <label className="block text-3xs font-extrabold uppercase tracking-wider text-gray-400">Attended Timings Variables</label>
                    
                    <label className="flex items-center gap-3 p-3 bg-white border border-gray-200/80 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={simPerfectAttendance}
                        onChange={e => setSimPerfectAttendance(e.target.checked)}
                        className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-800">Perfect Shift Attendance</span>
                        <span className="text-4xs font-semibold text-gray-400 block mt-0.5">Completed 100% scheduled shifts</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-white border border-gray-200/80 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={simLateCheckIn}
                        onChange={e => setSimLateCheckIn(e.target.checked)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-800">Flag Late Clock-In (&gt;15m)</span>
                        <span className="text-4xs font-semibold text-gray-400 block mt-0.5">Triggers late login penalty rule</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-white border border-gray-200/80 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={simProtocolViolation}
                        onChange={e => setSimProtocolViolation(e.target.checked)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-800">Safety Compliance Breach</span>
                        <span className="text-4xs font-semibold text-gray-400 block mt-0.5">Auditor raised protocol warning reports</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-white border border-gray-200/80 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={simWeekendWork}
                        onChange={e => setSimWeekendWork(e.target.checked)}
                        className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-800">Worked Weekend Shifts</span>
                        <span className="text-4xs font-semibold text-gray-400 block mt-0.5">Mumbai area weekend bonus eligibility</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right simulation execution dashboard */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12" />
                  
                  <div className="flex justify-between items-start border-b border-white/10 pb-4 shrink-0">
                    <div>
                      <span className="text-4xs font-extrabold text-primary-300 uppercase tracking-widest block">Simulation Dry Run Outcome</span>
                      <h4 className="text-lg font-extrabold mt-0.5 flex items-center gap-1.5"><Sparkles size={16} className="text-amber-400" /> Estimated Net Pay</h4>
                    </div>
                    
                    <span className="text-2xl font-extrabold text-emerald-400 bg-white/10 px-4 py-1.5 rounded-2xl border border-white/10 shadow-inner">
                      ₹{simResult.netPayout.toFixed(1)}
                    </span>
                  </div>

                  {/* Component Breakdown list */}
                  <div className="flex-1 divide-y divide-white/10 mt-6 space-y-3 font-semibold text-2xs">
                    {/* Base */}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-400">Assigned Shift Base Salary</span>
                      <span className="text-white font-extrabold">₹{simResult.base}</span>
                    </div>

                    {/* Bonuses list */}
                    {simResult.bonusesList.length > 0 && (
                      <div className="space-y-2 py-2">
                        <span className="text-emerald-400 font-bold block uppercase tracking-wider text-4xs">Triggered Incentive Rewards</span>
                        {simResult.bonusesList.map((b, i) => (
                          <div key={i} className="flex justify-between items-center text-3xs pl-2">
                            <span className="text-gray-300 flex items-center gap-1"><CheckCircle size={10} className="text-emerald-400" /> {b.name}</span>
                            <span className="text-emerald-400 font-bold">+₹{b.amount.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Deductions list */}
                    {simResult.deductionsList.length > 0 && (
                      <div className="space-y-2 py-2">
                        <span className="text-rose-400 font-bold block uppercase tracking-wider text-4xs">Triggered Penalty Deductions</span>
                        {simResult.deductionsList.map((d, i) => (
                          <div key={i} className="flex justify-between items-center text-3xs pl-2">
                            <span className="text-gray-300 flex items-center gap-1"><AlertTriangle size={10} className="text-rose-400" /> {d.name}</span>
                            <span className="text-rose-400 font-bold">-₹{d.amount.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Math summary summary */}
                  <div className="border-t border-white/10 pt-4 mt-4 flex justify-between items-center text-3xs text-gray-400 font-bold uppercase tracking-wider shrink-0">
                    <span>Formula: Base + Bonuses - Deductions</span>
                    <span>Net Pay: ₹{simResult.base} + ₹{simResult.totalBonuses.toFixed(0)} - ₹{simResult.totalDeductions.toFixed(0)}</span>
                  </div>
                </div>

                {/* Educational info card */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex items-start gap-3 shadow-3xs">
                  <HelpCircle size={22} className="text-primary-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-2xs font-extrabold text-slate-800 uppercase tracking-wide">About Global Rules Triggering</h5>
                    <p className="text-3xs text-slate-500 font-semibold mt-1.5 leading-relaxed">
                      These simulation parameters run locally on your browser using active system rule models. Percentage multipliers dynamically leverage base salary to scale penalties or incentive payouts automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configure/Edit Payroll Rule Overlay Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg p-6 relative overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-150 shrink-0">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  <Sparkles size={20} className="text-primary-600" /> 
                  {editingRule ? 'Edit Rule Configuration' : 'Configure New Payroll Rule'}
                </h2>
                <p className="text-gray-400 text-3xs font-bold uppercase tracking-wider mt-1">
                  SET SYSTEM-WIDE TRIGGER CONDITIONS AND PAYOUT VALUE RATES
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors border border-gray-250 shadow-3xs"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveRule} className="flex-1 overflow-y-auto space-y-4 mt-5 pr-1">
              {/* Rule Name */}
              <div>
                <label className="block text-3xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Rule Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Full Attendance Bonus"
                  value={formState.name}
                  onChange={e => setFormState({ ...formState, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Grid Type & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-3xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Rule Classification</label>
                  <select
                    value={formState.type}
                    onChange={e => setFormState({ ...formState, type: e.target.value as PayrollRule['type'] })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Incentive">💰 Incentive Reward (Bonus)</option>
                    <option value="Penalty">⚠️ Penalty (Deduction)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-3xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Rule Category</label>
                  <select
                    value={formState.category}
                    onChange={e => setFormState({ ...formState, category: e.target.value as PayrollRule['category'] })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Attendance">Attendance metrics</option>
                    <option value="Rating">Customer Feedback Rating</option>
                    <option value="Compliance">Safety &amp; Compliance</option>
                    <option value="Shift">Shift Duty Overtime</option>
                  </select>
                </div>
              </div>

              {/* Trigger Condition Description */}
              <div>
                <label className="block text-3xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Trigger Condition Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Summarize exact condition parameters, e.g. Clock-in logged >15 mins late from assigned shift start"
                  value={formState.conditionText}
                  onChange={e => setFormState({ ...formState, conditionText: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Grid Value Type & Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-3xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Incentive/Penalty Type</label>
                  <select
                    value={formState.valueType}
                    onChange={e => setFormState({ ...formState, valueType: e.target.value as PayrollRule['valueType'] })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Flat">Flat Amount (₹)</option>
                    <option value="Percentage">Percentage of Base Salary (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-3xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Rate Value ({formState.valueType === 'Flat' ? '₹' : '%'})</label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="Rate amount"
                    value={formState.value || ''}
                    onChange={e => setFormState({ ...formState, value: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Grid Scope City & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-3xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">City Scope Scope</label>
                  <select
                    value={formState.city}
                    onChange={e => setFormState({ ...formState, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="All">All Cities Scope</option>
                    <option value="Budapest">Budapest</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="London">London</option>
                  </select>
                </div>

                <div>
                  <label className="block text-3xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Rule Initial State</label>
                  <select
                    value={formState.status}
                    onChange={e => setFormState({ ...formState, status: e.target.value as PayrollRule['status'] })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Active">Active &amp; Multiplier Live</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Buttons Actions */}
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-150 shrink-0 bg-white sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 text-xs text-gray-650 bg-gray-100 rounded-xl hover:bg-gray-200 font-extrabold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-3 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-extrabold shadow-lg hover:shadow-primary-500/20 transition-all flex items-center gap-2"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  Save Configuration
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  )
}
