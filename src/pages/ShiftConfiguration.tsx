import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  X, 
  Loader2, 
  Copy, 
  EyeOff, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  LayoutGrid,
  List
} from 'lucide-react'
import { 
  fetchShiftTypes, 
  createShiftType, 
  updateShiftType, 
  deleteShiftType, 
  type ShiftType 
} from '../services/gyorsApi'

export default function ShiftConfiguration() {
  const [shifts, setShifts] = useState<ShiftType[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [durationFilter, setDurationFilter] = useState<'all' | 8 | 10 | 12>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    Shift_Name: '',
    Duration_hours: 8,
    Daily_Salary: '',
    Overtime_Rate: '',
    attendancePercent: 90,
    targetJobs: 5
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadShifts()
  }, [])

  const loadShifts = async () => {
    setLoading(true)
    try {
      const res = await fetchShiftTypes().catch(() => [])
      // Enrich backend results with UI-only fields if they are missing
      const enriched = res.map((s: any) => ({
        ...s,
        attendancePercent: s.attendancePercent ?? 90,
        targetJobs: s.targetJobs ?? (s.Duration_hours === 8 ? 4 : s.Duration_hours === 10 ? 6 : 8),
        status: s.status ?? 'ACTIVE'
      }))
      setShifts(enriched)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAddModal = () => {
    setEditingShiftId(null)
    setFormData({
      Shift_Name: '',
      Duration_hours: 8,
      Daily_Salary: '',
      Overtime_Rate: '',
      attendancePercent: 90,
      targetJobs: 5
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (shift: ShiftType) => {
    setEditingShiftId(shift.id || null)
    setFormData({
      Shift_Name: shift.Shift_Name,
      Duration_hours: shift.Duration_hours,
      Daily_Salary: shift.Daily_Salary.toString(),
      Overtime_Rate: shift.Overtime_Rate.toString(),
      attendancePercent: shift.attendancePercent ?? 90,
      targetJobs: shift.targetJobs ?? 5
    })
    setIsModalOpen(true)
  }

  const handleDuplicateShift = (shift: ShiftType) => {
    setEditingShiftId(null) // It's a new shift, so id is null
    setFormData({
      Shift_Name: `${shift.Shift_Name} (Copy)`,
      Duration_hours: shift.Duration_hours,
      Daily_Salary: shift.Daily_Salary.toString(),
      Overtime_Rate: shift.Overtime_Rate.toString(),
      attendancePercent: shift.attendancePercent ?? 90,
      targetJobs: shift.targetJobs ?? 5
    })
    setIsModalOpen(true)
  }

  const handleToggleStatus = async (shift: ShiftType) => {
    const newStatus = shift.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED'
    try {
      // Optmistically update UI
      setShifts(prev => prev.map(s => s.id === shift.id ? { ...s, status: newStatus } : s))
      if (shift.id) {
        await updateShiftType(shift.id, { 
          Shift_Name: shift.Shift_Name,
          Duration_hours: shift.Duration_hours,
          Daily_Salary: Number(shift.Daily_Salary),
          Overtime_Rate: Number(shift.Overtime_Rate),
          status: newStatus 
        } as any)
      }
    } catch (error) {
      alert('Failed to toggle shift status')
      await loadShifts()
    }
  }

  const handleDeleteShift = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this shift configuration?')) return
    try {
      setShifts(prev => prev.filter(s => s.id !== id))
      await deleteShiftType(id)
    } catch (error) {
      alert('Failed to delete shift')
      await loadShifts()
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload: any = {
        Shift_Name: formData.Shift_Name,
        Duration_hours: Number(formData.Duration_hours),
        Daily_Salary: Number(formData.Daily_Salary),
        Overtime_Rate: Number(formData.Overtime_Rate),
        attendancePercent: Number(formData.attendancePercent),
        targetJobs: Number(formData.targetJobs),
        status: 'ACTIVE'
      }

      if (editingShiftId) {
        await updateShiftType(editingShiftId, payload)
      } else {
        await createShiftType(payload)
      }

      setIsModalOpen(false)
      await loadShifts()
    } catch (error) {
      alert('Failed to save shift configuration')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filtering shifts
  const filteredShifts = shifts.filter(s => {
    const matchesSearch = s.Shift_Name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDuration = durationFilter === 'all' || s.Duration_hours === durationFilter
    return matchesSearch && matchesDuration
  })

  // Aggregated analytics metrics
  const activeCount = shifts.filter(s => s.status === 'ACTIVE').length
  const disabledCount = shifts.filter(s => s.status === 'DISABLED').length
  const averageSalary = shifts.length > 0 
    ? Math.round(shifts.reduce((acc, curr) => acc + Number(curr.Daily_Salary), 0) / shifts.length) 
    : 0
  const averageOT = shifts.length > 0 
    ? Math.round(shifts.reduce((acc, curr) => acc + Number(curr.Overtime_Rate), 0) / shifts.length) 
    : 0

  return (
    <div className="space-y-8 pb-12">
      {/* Header section with interactive glow */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
            <span className="bg-primary-600 text-white p-2 rounded-xl shadow-lg shadow-primary-500/20">
              <Clock size={28} />
            </span>
            Shift Configuration
          </h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">
            Configure working hours, core daily salaries, overtime rates, and performance targets.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Create Shift Configuration
        </button>
      </div>

      {/* Stunning glassmorphic metrics section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Configurations</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">{shifts.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <Clock size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
            <span className="font-semibold text-green-600 flex items-center gap-1">
              <CheckCircle size={14} /> {activeCount} Active
            </span>
            <span>•</span>
            <span className="text-gray-400 font-semibold">{disabledCount} Disabled</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Avg Base Salary</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">₹{averageSalary}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl text-green-600">
              <DollarSign size={22} />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 font-semibold">
            Across 8h, 10h, and 12h shifts
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Avg Overtime Rate</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">₹{averageOT}/hr</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 font-semibold">
            Applies to excess worked hours
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Target Qualifier</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">90%</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
              <CheckCircle size={22} />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 font-semibold">
            Average baseline attendance goal
          </div>
        </div>
      </div>

      {/* Control panel: Filtering, Search, View toggles */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex items-center overflow-x-auto gap-2 py-1 scrollbar-hide">
          {(['all', 8, 10, 12] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setDurationFilter(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                durationFilter === tab
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {tab === 'all' ? 'All Durations' : `${tab} Hour Shifts`}
            </button>
          ))}
        </div>

        {/* Search & layout switchers */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search shifts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          <div className="border border-gray-200 rounded-xl p-1 flex items-center bg-gray-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Table View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main shifts renderer */}
      {loading ? (
        <div className="py-24 text-center text-gray-500 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
          <p className="font-medium">Fetching shift configurations...</p>
        </div>
      ) : filteredShifts.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-gray-300 rounded-2xl bg-white p-8">
          <AlertCircle size={40} className="text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-700">No Shift Configurations Found</h3>
          <p className="text-gray-500 mt-1 text-sm">
            Try adjusting your search query, filtering parameters, or click "Create Shift Configuration" to add one.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShifts.map(shift => {
            const is8h = shift.Duration_hours === 8
            const is10h = shift.Duration_hours === 10
            const isDisabled = shift.status === 'DISABLED'

            // Harmonious color styling based on duration
            const cardTheme = isDisabled
              ? 'border-gray-200 bg-gray-50'
              : is8h
              ? 'border-teal-100 bg-gradient-to-br from-white to-teal-50/20'
              : is10h
              ? 'border-amber-100 bg-gradient-to-br from-white to-amber-50/20'
              : 'border-indigo-100 bg-gradient-to-br from-white to-indigo-50/20'

            const badgeTheme = isDisabled
              ? 'bg-gray-100 text-gray-700 border-gray-300'
              : is8h
              ? 'bg-teal-50 text-teal-700 border-teal-200'
              : is10h
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'

            return (
              <div
                key={shift.id}
                className={`border rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 p-6 flex flex-col justify-between ${cardTheme} relative`}
              >
                {/* Header info */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${badgeTheme}`}>
                        {shift.Duration_hours} Hour Shift
                      </span>
                      <h3 className={`text-xl font-bold mt-3 ${isDisabled ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {shift.Shift_Name}
                      </h3>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-2xs font-bold ${
                      isDisabled ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                      {isDisabled ? 'Disabled' : 'Active'}
                    </span>
                  </div>

                  {/* Core metrics */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-white/60 backdrop-blur-2xs p-3 rounded-xl border border-gray-100">
                      <p className="text-gray-400 text-3xs font-semibold uppercase tracking-wider">Base Salary</p>
                      <p className="text-lg font-extrabold text-gray-900 mt-1">₹{shift.Daily_Salary}</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-2xs p-3 rounded-xl border border-gray-100">
                      <p className="text-gray-400 text-3xs font-semibold uppercase tracking-wider">Overtime Rate</p>
                      <p className="text-lg font-extrabold text-gray-900 mt-1">₹{shift.Overtime_Rate}/hr</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-2xs p-3 rounded-xl border border-gray-100">
                      <p className="text-gray-400 text-3xs font-semibold uppercase tracking-wider">Min Attendance</p>
                      <p className="text-lg font-extrabold text-gray-900 mt-1">{shift.attendancePercent}%</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-2xs p-3 rounded-xl border border-gray-100">
                      <p className="text-gray-400 text-3xs font-semibold uppercase tracking-wider">Target Workload</p>
                      <p className="text-lg font-extrabold text-gray-900 mt-1">{shift.targetJobs} Jobs</p>
                    </div>
                  </div>
                </div>

                {/* Operations / Actions */}
                <div className="mt-8 pt-4 border-t border-gray-100/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(shift)}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      title="Edit Configuration"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDuplicateShift(shift)}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      title="Duplicate Shift"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(shift)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDisabled 
                          ? 'text-green-500 hover:bg-green-50 hover:text-green-700' 
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      title={isDisabled ? 'Enable Shift' : 'Disable Shift'}
                    >
                      {isDisabled ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteShift(shift.id!)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                    title="Delete Configuration"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Structured Table Layout */
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Shift Name</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Daily Base Salary</th>
                  <th className="px-6 py-4">Overtime Rate</th>
                  <th className="px-6 py-4">Min Attendance</th>
                  <th className="px-6 py-4">Target Jobs</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {filteredShifts.map(shift => (
                  <tr key={shift.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{shift.Shift_Name}</td>
                    <td className="px-6 py-4 font-semibold text-gray-600">{shift.Duration_hours} Hours</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">₹{shift.Daily_Salary}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">₹{shift.Overtime_Rate}/hr</td>
                    <td className="px-6 py-4 text-gray-600">{shift.attendancePercent}%</td>
                    <td className="px-6 py-4 text-gray-600">{shift.targetJobs} Jobs</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        shift.status === 'DISABLED' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-800'
                      }`}>
                        {shift.status === 'DISABLED' ? 'Disabled' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(shift)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDuplicateShift(shift)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                          title="Duplicate"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(shift)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                          title={shift.status === 'DISABLED' ? 'Enable' : 'Disable'}
                        >
                          {shift.status === 'DISABLED' ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeleteShift(shift.id!)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 size={16} />
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

      {/* Premium Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg p-6 relative overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  {editingShiftId ? 'Edit Shift Configuration' : 'Configure Shift Type'}
                </h2>
                <p className="text-gray-400 text-xs mt-1">Configure daily shift metrics and targets</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-5 mt-5">
              {/* Shift Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Shift Name</label>
                <input
                  required
                  type="text"
                  value={formData.Shift_Name}
                  onChange={e => setFormData({ ...formData, Shift_Name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="e.g. Regular 8 Hours (Morning)"
                />
              </div>

              {/* Duration Segment buttons */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Duration Hours</label>
                <div className="grid grid-cols-3 gap-3">
                  {([8, 10, 12] as const).map(hours => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setFormData({ ...formData, Duration_hours: hours })}
                      className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                        formData.Duration_hours === hours
                          ? 'bg-gray-900 text-white border-transparent shadow-md'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {hours} Hours
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary & Overtime Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Base Salary (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.Daily_Salary}
                      onChange={e => setFormData({ ...formData, Daily_Salary: e.target.value })}
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                      placeholder="e.g. 1500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">OT Hourly Rate (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.Overtime_Rate}
                      onChange={e => setFormData({ ...formData, Overtime_Rate: e.target.value })}
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                      placeholder="e.g. 200"
                    />
                  </div>
                </div>
              </div>

              {/* Target workloads & attendance criteria */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Min Attendance (%)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="100"
                    value={formData.attendancePercent}
                    onChange={e => setFormData({ ...formData, attendancePercent: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="e.g. 90"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Target Jobs Count</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.targetJobs}
                    onChange={e => setFormData({ ...formData, targetJobs: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="e.g. 5"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-primary-500/20 transition-all flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 size={18} className="animate-spin" />}
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
