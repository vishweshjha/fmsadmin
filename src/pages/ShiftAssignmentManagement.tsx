import { useState, useEffect } from 'react'
import {
  Calendar,
  UserCheck,
  MapPin,
  Clock,
  Search,
  Filter,
  CheckSquare,
  Square,
  Plus,
  Loader2,
  Trash2,
  Edit2,
  Briefcase,
  Users,
  X
} from 'lucide-react'
import {
  fetchServiceProviders,
  fetchShiftTypes,
  fetchShiftAssignments,
  assignShift,
  deleteShiftAssignment,
  type ServiceProvider,
  type ShiftType,
  type ShiftAssignment
} from '../services/gyorsApi'

// Mock realistic operational zones/areas
const OPERATIONAL_AREAS: Record<string, string[]> = {
  'Budapest': ['District V (Belváros)', 'District VII (Erzsébetváros)', 'District XIII (Újlipótváros)', 'District XI (Újbuda)'],
  'Mumbai': ['Colaba (South Mumbai)', 'Bandra West', 'Andheri East', 'Borivali West'],
  'London': ['Westminster', 'Camden', 'Kensington', 'Islington'],
  'New York': ['Manhattan', 'Brooklyn', 'Queens', 'Bronx'],
}

const DEFAULT_AREAS = ['North Zone', 'East Zone', 'West Zone', 'South Zone']

export default function ShiftAssignmentManagement() {
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([])
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([])
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filters & State
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [cityFilter, setCityFilter] = useState<string>('all')
  const [areaFilter, setAreaFilter] = useState<string>('all')
  const [shiftFilter, setShiftFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Selections for Bulk actions
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>([])

  // Modal / Drawer states
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [activeProviderForAssign, setActiveProviderForAssign] = useState<ServiceProvider | null>(null)
  const [isBulkMode, setIsBulkMode] = useState(false)

  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false)
  const [activeAssignmentForReassign, setActiveAssignmentForReassign] = useState<ShiftAssignment | null>(null)

  const [assignForm, setAssignForm] = useState({
    shift_type_id: '',
    assignment_date: selectedDate
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadAssignments()
  }, [selectedDate])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [providersRes, shiftsRes] = await Promise.all([
        fetchServiceProviders().catch(() => []),
        fetchShiftTypes().catch(() => [])
      ])
      // Filter out only active and approved service providers for roster safety
      const activeProviders = providersRes.filter(p => p.status === 'ACTIVE' || p.Kyc_status === 'APPROVED')
      setProviders(activeProviders)
      setShiftTypes(shiftsRes)
      await loadAssignments()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadAssignments = async () => {
    try {
      const res = await fetchShiftAssignments({ date: selectedDate }).catch(() => [])
      setAssignments(res)
    } catch (e) {
      console.error(e)
    }
  }

  // Handle individual assign triggers
  const handleOpenAssignModal = (provider: ServiceProvider) => {
    setActiveProviderForAssign(provider)
    setIsBulkMode(false)
    setAssignForm({
      shift_type_id: shiftTypes[0]?.id || '',
      assignment_date: selectedDate
    })
    setIsAssignModalOpen(true)
  }

  const handleOpenBulkAssignModal = () => {
    if (selectedProviderIds.length === 0) return
    setActiveProviderForAssign(null)
    setIsBulkMode(true)
    setAssignForm({
      shift_type_id: shiftTypes[0]?.id || '',
      assignment_date: selectedDate
    })
    setIsAssignModalOpen(true)
  }

  const handleOpenReassignModal = (assignment: ShiftAssignment) => {
    setActiveAssignmentForReassign(assignment)
    setAssignForm({
      shift_type_id: assignment.shift_type_id,
      assignment_date: new Date(assignment.assignment_date).toISOString().split('T')[0]
    })
    setIsReassignModalOpen(true)
  }

  // API dispatchers
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const isoDate = new Date(assignForm.assignment_date).toISOString()
      if (isBulkMode) {
        // Bulk dispatcher - loops through selected IDs
        await Promise.all(
          selectedProviderIds.map(providerId => 
            assignShift({
              provider_id: providerId,
              shift_type_id: assignForm.shift_type_id,
              assignment_date: isoDate
            }).catch(err => console.error(`Failed to assign ${providerId}:`, err))
          )
        )
        setSelectedProviderIds([])
      } else if (activeProviderForAssign) {
        await assignShift({
          provider_id: activeProviderForAssign.id,
          shift_type_id: assignForm.shift_type_id,
          assignment_date: isoDate
        })
      }

      setIsAssignModalOpen(false)
      await loadAssignments()
    } catch (error) {
      alert('Failed to complete shift assignment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeAssignmentForReassign || !activeAssignmentForReassign.id) return
    setIsSubmitting(true)
    try {
      // Reassignment is handled by deleting the old and creating the new in a clean sequence
      await deleteShiftAssignment(activeAssignmentForReassign.id)
      await assignShift({
        provider_id: activeAssignmentForReassign.provider_id,
        shift_type_id: assignForm.shift_type_id,
        assignment_date: new Date(assignForm.assignment_date).toISOString()
      })

      setIsReassignModalOpen(false)
      setActiveAssignmentForReassign(null)
      await loadAssignments()
    } catch (error) {
      alert('Failed to reassign shift')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveAssignment = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel and remove this provider shift assignment?')) return
    try {
      // Optimistic update
      setAssignments(prev => prev.filter(a => a.id !== id))
      await deleteShiftAssignment(id)
    } catch (error) {
      alert('Failed to remove shift assignment')
      await loadAssignments()
    }
  }

  const handleToggleSelectProvider = (providerId: string) => {
    setSelectedProviderIds(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId) 
        : [...prev, providerId]
    )
  }

  const handleToggleSelectAll = (visibleProviders: ServiceProvider[]) => {
    const visibleIds = visibleProviders.map(p => p.id)
    const allSelected = visibleIds.every(id => selectedProviderIds.includes(id))
    
    if (allSelected) {
      setSelectedProviderIds(prev => prev.filter(id => !visibleIds.includes(id)))
    } else {
      setSelectedProviderIds(prev => [...new Set([...prev, ...visibleIds])])
    }
  }

  // Filtering Rosters
  const filteredRoster = providers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCity = cityFilter === 'all' || p.city === cityFilter
    // Areas mapped locally based on city
    const mockArea = OPERATIONAL_AREAS[p.city || '']?.[(p.name.length) % 4] || DEFAULT_AREAS[(p.name.length) % 4]
    const matchesArea = areaFilter === 'all' || mockArea === areaFilter
    
    // Check status filter (assigned vs unassigned on this date)
    const isAssigned = assignments.some(a => a.provider_id === p.id)
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'ASSIGNED' && isAssigned) || 
      (statusFilter === 'UNASSIGNED' && !isAssigned)

    return matchesSearch && matchesCity && matchesArea && matchesStatus
  })

  // List of active cities from roster
  const cities = Array.from(new Set(providers.map(p => p.city).filter(Boolean))) as string[]
  
  // List of areas mapped to the active city filter
  const areas = cityFilter !== 'all' 
    ? OPERATIONAL_AREAS[cityFilter] || DEFAULT_AREAS 
    : Array.from(new Set(Object.values(OPERATIONAL_AREAS).flat()))

  // Enriched assignments for visualization in Right Panel
  const enrichedAssignments = assignments.map(a => {
    const provider = providers.find(p => p.id === a.provider_id)
    const shift = shiftTypes.find(s => s.id === a.shift_type_id)
    const mockArea = provider 
      ? OPERATIONAL_AREAS[provider.city || '']?.[(provider.name.length) % 4] || DEFAULT_AREAS[(provider.name.length) % 4]
      : 'Main Zone'

    return {
      ...a,
      providerName: provider?.name || 'Unknown Provider',
      shiftName: shift?.Shift_Name || 'Custom Shift',
      durationHours: shift?.Duration_hours || 8,
      dailySalary: shift ? Number(shift.Daily_Salary) : 0,
      city: provider?.city || 'Main',
      area: mockArea
    }
  }).filter(a => {
    return shiftFilter === 'all' || a.shift_type_id === shiftFilter
  })

  return (
    <div className="space-y-6 pb-12">
      {/* Header section with calendar selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
            <span className="bg-primary-600 text-white p-2 rounded-xl shadow-lg shadow-primary-500/20">
              <UserCheck size={28} />
            </span>
            Provider Shift Assignment
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Assign service providers to scheduled shifts and monitor visual operational calendars.
          </p>
        </div>

        {/* Date Quick Selector */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 p-2 rounded-2xl shadow-sm">
          <button
            onClick={() => {
              const d = new Date()
              setSelectedDate(d.toISOString().split('T')[0])
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedDate === new Date().toISOString().split('T')[0]
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-150'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => {
              const d = new Date()
              d.setDate(d.getDate() + 1)
              setSelectedDate(d.toISOString().split('T')[0])
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedDate === new Date(Date.now() + 86400000).toISOString().split('T')[0]
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-150'
            }`}
          >
            Tomorrow
          </button>
          <div className="relative flex items-center border-l pl-3 ml-1 border-gray-200">
            <Calendar size={16} className="text-gray-400 mr-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-bold text-gray-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Roster & Scheduler Split-Pane Workspace */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-gray-250 shadow-sm min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-4" />
          <p className="text-gray-500 font-medium text-sm">Loading Roster and Active Shift Assignments...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT PANEL: ROSTER AND DIRECTORIES (GRID COLS 5) */}
        <div className="lg:col-span-5 bg-white border border-gray-250 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            {/* Panel Header */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users size={18} className="text-gray-400" /> Active Roster
              </h2>
              <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs text-gray-600 font-bold">
                {filteredRoster.length} Available
              </span>
            </div>

            {/* Filters Box */}
            <div className="mt-4 space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search provider name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Advanced select filters */}
              <div className="grid grid-cols-2 gap-3">
                {/* City Filter */}
                <div>
                  <label className="block text-4xs font-bold uppercase tracking-wider text-gray-400 mb-1">City</label>
                  <select
                    value={cityFilter}
                    onChange={e => {
                      setCityFilter(e.target.value)
                      setAreaFilter('all') // Reset area filter on city change
                    }}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white"
                  >
                    <option value="all">All Cities</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Area Filter */}
                <div>
                  <label className="block text-4xs font-bold uppercase tracking-wider text-gray-400 mb-1">Area / Zone</label>
                  <select
                    value={areaFilter}
                    onChange={e => setAreaFilter(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white"
                  >
                    <option value="all">All Areas</option>
                    {areas.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                {/* Status Assignment filter */}
                <div className="col-span-2">
                  <label className="block text-4xs font-bold uppercase tracking-wider text-gray-400 mb-1">Roster Assignment Status</label>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white"
                  >
                    <option value="all">Show All Providers</option>
                    <option value="ASSIGNED">Assigned on this Date</option>
                    <option value="UNASSIGNED">Unassigned / Free</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Checkbox Select All control */}
            <div className="mt-4 flex items-center justify-between bg-gray-50/60 p-2.5 rounded-xl border border-gray-150">
              <button
                onClick={() => handleToggleSelectAll(filteredRoster)}
                className="flex items-center gap-2 text-xs font-bold text-gray-700"
              >
                {filteredRoster.length > 0 && filteredRoster.every(p => selectedProviderIds.includes(p.id)) ? (
                  <CheckSquare size={16} className="text-primary-600" />
                ) : (
                  <Square size={16} className="text-gray-400" />
                )}
                Select All Visible ({filteredRoster.length})
              </button>

              {selectedProviderIds.length > 0 && (
                <span className="text-2xs font-extrabold text-primary-600 uppercase tracking-wide">
                  {selectedProviderIds.length} Selected
                </span>
              )}
            </div>

            {/* Roster Scroll Container */}
            <div className="mt-3 space-y-2 overflow-y-auto max-h-[360px] pr-1">
              {filteredRoster.map(provider => {
                const isSelected = selectedProviderIds.includes(provider.id)
                const isAssigned = assignments.some(a => a.provider_id === provider.id)
                const mockArea = OPERATIONAL_AREAS[provider.city || '']?.[(provider.name.length) % 4] || DEFAULT_AREAS[(provider.name.length) % 4]

                return (
                  <div
                    key={provider.id}
                    className={`p-3 border rounded-xl flex items-center justify-between transition-all ${
                      isSelected 
                        ? 'border-primary-200 bg-primary-50/20' 
                        : isAssigned 
                        ? 'border-gray-150 bg-gray-50/30' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Checkbox selector */}
                      <button
                        onClick={() => handleToggleSelectProvider(provider.id)}
                        className="text-gray-400 hover:text-primary-600"
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-primary-600" />
                        ) : (
                          <Square size={16} className="text-gray-400" />
                        )}
                      </button>

                      {/* Info layout */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900 truncate">{provider.name}</p>
                          <span className={`text-4xs font-extrabold px-1.5 py-0.5 rounded-full ${
                            isAssigned ? 'bg-indigo-50 text-indigo-700' : 'bg-green-50 text-green-700'
                          }`}>
                            {isAssigned ? 'Assigned' : 'Free'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-2xs text-gray-500 mt-0.5">
                          <MapPin size={10} />
                          <span>{provider.city || 'Main'} • {mockArea}</span>
                        </div>
                      </div>
                    </div>

                    {/* Roster actions */}
                    {isAssigned ? (
                      <span className="text-xs font-semibold text-gray-400 mr-2">Assigned</span>
                    ) : (
                      <button
                        onClick={() => handleOpenAssignModal(provider)}
                        className="p-2 bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white rounded-lg transition-colors"
                        title="Assign Shift"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bulk Action Footer in Left Panel */}
          {selectedProviderIds.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-3 bg-primary-50/40 p-3 rounded-xl border border-primary-100/60 animate-in fade-in slide-in-from-bottom duration-200">
              <div className="text-xs">
                <p className="font-extrabold text-primary-900">{selectedProviderIds.length} Providers Selected</p>
                <p className="text-primary-700 mt-0.5">Ready for bulk shift configuration</p>
              </div>
              <button
                onClick={handleOpenBulkAssignModal}
                className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <UserCheck size={14} /> Bulk Assign
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: SCHEDULER & ASSIGNMENTS GRID (GRID COLS 7) */}
        <div className="lg:col-span-7 bg-white border border-gray-250 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            {/* Panel Header */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar size={18} className="text-gray-400" /> Active Roster Calendar
              </h2>
              <span className="bg-primary-50 text-primary-700 border border-primary-200 px-2 py-0.5 rounded-full text-xs font-bold">
                {enrichedAssignments.length} Assignments
              </span>
            </div>

            {/* Shifts Filter */}
            <div className="mt-4 flex items-center gap-3">
              <Filter size={16} className="text-gray-400" />
              <select
                value={shiftFilter}
                onChange={e => setShiftFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="all">All Shift Types</option>
                {shiftTypes.map(s => <option key={s.id} value={s.id}>{s.Shift_Name}</option>)}
              </select>
            </div>

            {/* Assignments Grid */}
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[460px] pr-1">
              {enrichedAssignments.length === 0 ? (
                <div className="py-24 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 p-8">
                  <Clock size={32} className="text-gray-400 mx-auto mb-2" />
                  <p className="font-bold text-gray-700">No Shifts Scheduled</p>
                  <p className="text-gray-500 text-xs mt-1">
                    No provider assignments have been scheduled for {selectedDate}. Use the active roster to create assignments.
                  </p>
                </div>
              ) : (
                enrichedAssignments.map(assignment => {
                  const isPending = assignment.Status === 'PENDING'
                  const isApproved = assignment.Status === 'APPROVED'

                  const statusColor = isPending
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : isApproved
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'

                  return (
                    <div
                      key={assignment.id}
                      className="p-4 border border-gray-200 rounded-2xl hover:shadow-sm hover:border-gray-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white"
                    >
                      {/* Left: Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900">{assignment.providerName}</p>
                          <span className={`text-3xs font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                            {assignment.Status || 'PENDING'}
                          </span>
                        </div>
                        <p className="text-xs text-primary-600 font-semibold mt-1 flex items-center gap-1">
                          <Briefcase size={12} /> {assignment.shiftName} ({assignment.durationHours} Hours)
                        </p>
                        <div className="flex items-center gap-3 text-3xs text-gray-500 mt-2">
                          <span className="flex items-center gap-0.5"><MapPin size={10} /> {assignment.city} • {assignment.area}</span>
                          <span>•</span>
                          <span className="font-bold text-gray-700">₹{assignment.dailySalary} Daily Salary</span>
                        </div>
                      </div>

                      {/* Right: Operations */}
                      <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 justify-end">
                        <button
                          onClick={() => handleOpenReassignModal(assignment)}
                          className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-colors border border-gray-200"
                          title="Reassign Shift"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleRemoveAssignment(assignment.id!)}
                          className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors border border-red-200"
                          title="Remove Assignment"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Quick info status helper */}
          <div className="mt-4 pt-3 border-t border-gray-100 text-3xs text-gray-400 flex items-center justify-between uppercase tracking-wider font-bold">
            <span>Date View: {selectedDate}</span>
            <span>All metrics and compliance rates fully active</span>
          </div>
        </div>

      </div>
      )}

      {/* Assign / Bulk Assign Modal Dialog */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-6 relative overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  {isBulkMode ? 'Bulk Assign Providers' : 'Assign Provider to Shift'}
                </h2>
                <p className="text-gray-400 text-xs mt-1">
                  {isBulkMode 
                    ? `Assign ${selectedProviderIds.length} selected providers in a single action` 
                    : `Scheduling shift assignment for ${activeProviderForAssign?.name}`
                  }
                </p>
              </div>
              <button 
                onClick={() => setIsAssignModalOpen(false)} 
                className="p-1.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAssignSubmit} className="space-y-4 mt-5">
              {/* Shift Configuration selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Select Shift Type</label>
                <select
                  required
                  value={assignForm.shift_type_id}
                  onChange={e => setAssignForm({ ...assignForm, shift_type_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white font-semibold text-gray-800"
                >
                  {shiftTypes.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.Shift_Name} ({s.Duration_hours}h) • ₹{s.Daily_Salary}/day
                    </option>
                  ))}
                </select>
              </div>

              {/* Date selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Scheduled Date</label>
                <input
                  required
                  type="date"
                  value={assignForm.assignment_date}
                  onChange={e => setAssignForm({ ...assignForm, assignment_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-5 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-primary-500/20 transition-all flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                  Assign Provider
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Reassign Modal Dialog */}
      {isReassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-6 relative overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Reassign Shift Configuration</h2>
                <p className="text-gray-400 text-xs mt-1">
                  Reschedule shift details for {activeAssignmentForReassign?.providerName}
                </p>
              </div>
              <button 
                onClick={() => setIsReassignModalOpen(false)} 
                className="p-1.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleReassignSubmit} className="space-y-4 mt-5">
              {/* Select Shift Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Select New Shift Type</label>
                <select
                  required
                  value={assignForm.shift_type_id}
                  onChange={e => setAssignForm({ ...assignForm, shift_type_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white font-semibold text-gray-800"
                >
                  {shiftTypes.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.Shift_Name} ({s.Duration_hours}h) • ₹{s.Daily_Salary}/day
                    </option>
                  ))}
                </select>
              </div>

              {/* Date selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Scheduled Date</label>
                <input
                  required
                  type="date"
                  value={assignForm.assignment_date}
                  onChange={e => setAssignForm({ ...assignForm, assignment_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsReassignModalOpen(false)}
                  className="px-5 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-primary-500/20 transition-all flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                  Confirm Reassignment
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  )
}
