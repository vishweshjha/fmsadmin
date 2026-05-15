import { useState, useEffect, useRef } from 'react'
import {
  UserCog,
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  X,
  ChevronDown,
  Star,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react'
import {
  fetchServiceProviders,
  createServiceProvider,
  updateServiceProvider,
  updateServiceProviderStatus,
  deleteServiceProvider,
  fetchCategories,
  fetchServiceItems,
  fetchBookings,
  type ServiceProvider,
  type ServiceProviderPayload,
} from '../services/gyorsApi'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'] as const
type ProviderStatus = (typeof STATUS_OPTIONS)[number]

function statusBadge(status?: string) {
  const s = (status ?? '').toUpperCase()
  const map: Record<string, { cls: string; Icon: any; label: string }> = {
    ACTIVE: { cls: 'bg-green-100 text-green-800', Icon: CheckCircle2, label: 'Active' },
    PENDING: { cls: 'bg-yellow-100 text-yellow-800', Icon: Clock, label: 'Pending' },
    SUSPENDED: { cls: 'bg-orange-100 text-orange-800', Icon: ShieldAlert, label: 'Suspended' },
    REJECTED: { cls: 'bg-red-100 text-red-800', Icon: XCircle, label: 'Rejected' },
  }
  const cfg = map[s] ?? { cls: 'bg-gray-100 text-gray-600', Icon: Clock, label: status ?? 'Unknown' }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${cfg.cls}`}>
      <cfg.Icon size={12} />
      {cfg.label}
    </span>
  )
}

// ─── Empty Form ───────────────────────────────────────────────────────────────

const emptyForm = (): ServiceProviderPayload => ({
  user_id: '',
  name: '',
  phoneNumber: '',
  city: '',
  yearsOfExperience: 0,
  status: 'PENDING',
  categoryIds: [],
  itemIds: [],
})

// ─── Status Dropdown (reusable) ───────────────────────────────────────────────

function StatusDropdown({
  current,
  onChange,
}: {
  current: string
  onChange: (v: ProviderStatus) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        {statusBadge(current)}
        <ChevronDown size={14} className={`ml-1 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden min-w-[130px]">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm transition-colors"
              onClick={() => { onChange(s); setOpen(false) }}
            >
              {statusBadge(s)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmDeleteModal({
  provider,
  onConfirm,
  onCancel,
  loading,
}: {
  provider: ServiceProvider
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Delete Service Provider</h3>
            <p className="text-sm text-gray-500">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-gray-700 mb-6">
          Are you sure you want to permanently delete{' '}
          <span className="font-semibold">{provider.name}</span>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-60 flex items-center gap-2 transition-colors"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

function ProviderFormModal({
  mode,
  initial,
  onSave,
  onClose,
  saving,
  error,
  allCategories,
  allItems,
}: {
  mode: 'add' | 'edit'
  initial: ServiceProviderPayload
  onSave: (data: ServiceProviderPayload) => void
  onClose: () => void
  saving: boolean
  error: string | null
  allCategories: { id: string; name: string }[]
  allItems: { id: string; name: string; categoryId: string }[]
}) {
  const [form, setForm] = useState<ServiceProviderPayload>(initial)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initial.categoryIds || [])
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(initial.itemIds || [])

  const set = (key: keyof ServiceProviderPayload, value: any) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...form, categoryIds: selectedCategoryIds, itemIds: selectedItemIds })
  }

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const inputCls =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition'

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
              <UserCog size={18} className="text-primary-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {mode === 'add' ? 'Add Service Provider' : 'Edit Service Provider'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {mode === 'add' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Linked user UUID"
                value={form.user_id}
                onChange={(e) => set('user_id', e.target.value)}
                className={inputCls}
              />
              <p className="text-xs text-gray-400 mt-1">Must match an existing User in the system</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ravi Kumar"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+919876543210"
                value={form.phoneNumber}
                onChange={(e) => set('phoneNumber', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                placeholder="e.g. Mumbai"
                value={form.city ?? ''}
                onChange={(e) => set('city', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                min={0}
                max={50}
                placeholder="0"
                value={form.yearsOfExperience ?? 0}
                onChange={(e) => set('yearsOfExperience', parseInt(e.target.value) || 0)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status ?? 'PENDING'}
              onChange={(e) => set('status', e.target.value)}
              className={inputCls}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-gray-100 pt-4 mt-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary-600" />
              Service Mapping
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Mapped Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(allCategories) ? allCategories : []).map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedCategoryIds.includes(cat.id)
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Specific Items
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-gray-50 rounded-lg">
                  {(Array.isArray(allItems) ? allItems : []).map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-all ${
                        selectedItemIds.includes(item.id)
                          ? 'bg-primary-50 text-primary-700 border border-primary-200 font-semibold'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full border ${
                        selectedItemIds.includes(item.id) ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                      }`} />
                      <span className="truncate">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-60 flex items-center gap-2 transition-colors"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {mode === 'add' ? 'Create Provider' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Provider Details Modal ───────────────────────────────────────────────────

function ProviderDetailsModal({
  provider,
  onClose,
}: {
  provider: ServiceProvider
  onClose: () => void
}) {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const allBookings = await fetchBookings()
        setJobs(allBookings.filter((b: any) => b.providerId === provider.id))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadJobs()
  }, [provider.id])

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">
              {provider.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{provider.name}</h3>
              <p className="text-sm text-gray-500">Provider Details & History</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Average Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <Star size={20} className="text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-bold">{provider.rating ?? 'N/A'}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Completed Jobs</p>
              <p className="text-2xl font-bold mt-1">{jobs.filter(j => j.status === 'COMPLETED').length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Experience</p>
              <p className="text-2xl font-bold mt-1">{provider.yearsOfExperience} Years</p>
            </div>
          </div>

          <h4 className="font-bold text-gray-900 mb-4">Job History</h4>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-primary-600" />
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No job history found.</p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="border border-gray-100 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm">{job.serviceName}</p>
                    <p className="text-xs text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-green-700">₹{job.amount || job.finalPrice}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ServiceProviderManagement() {
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Modal state
  const [modal, setModal] = useState<null | 'add' | 'edit'>(null)
  const [editTarget, setEditTarget] = useState<ServiceProvider | null>(null)
  const [detailsTarget, setDetailsTarget] = useState<ServiceProvider | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ServiceProvider | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Master Data
  const [allCategories, setAllCategories] = useState<{ id: string; name: string }[]>([])
  const [allItems, setAllItems] = useState<{ id: string; name: string; categoryId: string }[]>([])

  // Status change loading map
  const [statusLoading, setStatusLoading] = useState<Record<string, boolean>>({})

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const loadProviders = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchServiceProviders({
        name: search || undefined,
        city: filterCity || undefined,
        status: filterStatus || undefined,
      })
      setProviders(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load service providers')
    } finally {
      setLoading(false)
    }
  }

  const loadMasterData = async () => {
    try {
      const [cats, items] = await Promise.all([fetchCategories(), fetchServiceItems()])
      setAllCategories(cats)
      setAllItems(items)
    } catch (e) {
      console.error('Failed to load metadata:', e)
    }
  }

  useEffect(() => { 
    loadProviders()
    loadMasterData()
  }, [])

  // ─── CRUD Actions ──────────────────────────────────────────────────────────

  const handleSave = async (formData: ServiceProviderPayload) => {
    setSaving(true)
    setFormError(null)
    try {
      if (modal === 'add') {
        const created = await createServiceProvider(formData)
        setProviders((prev) => [created, ...prev])
        showToast(`${created.name} added successfully`)
      } else if (modal === 'edit' && editTarget) {
        const { user_id, ...updateData } = formData
        const updated = await updateServiceProvider(editTarget.id, updateData)
        setProviders((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        showToast(`${updated.name} updated successfully`)
      }
      setModal(null)
      setEditTarget(null)
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (provider: ServiceProvider, newStatus: ProviderStatus) => {
    setStatusLoading((prev) => ({ ...prev, [provider.id]: true }))
    try {
      await updateServiceProviderStatus(provider.id, newStatus)
      setProviders((prev) =>
        prev.map((p) => (p.id === provider.id ? { ...p, status: newStatus } : p))
      )
      showToast(`${provider.name}'s status changed to ${newStatus}`)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to update status', 'error')
    } finally {
      setStatusLoading((prev) => ({ ...prev, [provider.id]: false }))
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteServiceProvider(deleteTarget.id)
      setProviders((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      showToast(`${deleteTarget.name} deleted`)
      setDeleteTarget(null)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to delete provider', 'error')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  // Derived stats
  const stats = {
    total: providers.length,
    active: providers.filter((p) => p.status?.toUpperCase() === 'ACTIVE').length,
    pending: providers.filter((p) => p.status?.toUpperCase() === 'PENDING').length,
    suspended: providers.filter(
      (p) => p.status?.toUpperCase() === 'SUSPENDED' || p.status?.toUpperCase() === 'REJECTED'
    ).length,
  }

  // Client-side filter (supplements server filter for quick UX)
  const filtered = providers.filter((p) => {
    const q = search.toLowerCase()
    return (
      (!q || p.name?.toLowerCase().includes(q) || p.phoneNumber?.includes(q)) &&
      (!filterCity || p.city?.toLowerCase().includes(filterCity.toLowerCase())) &&
      (!filterStatus || p.status?.toUpperCase() === filterStatus)
    )
  })

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 transition-all ${toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
            }`}
        >
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Service Providers</h1>
          <p className="text-gray-500 mt-1">Manage all service provider accounts</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadProviders}
            className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => { setModal('add'); setEditTarget(null); setFormError(null) }}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={18} />
            Add Provider
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Providers', value: stats.total, color: 'blue', Icon: UserCog },
          { label: 'Active', value: stats.active, color: 'green', Icon: CheckCircle2 },
          { label: 'Pending', value: stats.pending, color: 'yellow', Icon: Clock },
          { label: 'Suspended / Rejected', value: stats.suspended, color: 'red', Icon: ShieldAlert },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{label}</p>
                <p className="text-3xl font-bold mt-1">{value}</p>
              </div>
              <div className={`bg-${color}-100 p-3 rounded-lg`}>
                <Icon size={22} className={`text-${color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadProviders()}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by city"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-40"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <button
            onClick={loadProviders}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-56">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Loading service providers…</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 m-4 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="text-red-600 shrink-0" size={20} />
            <div>
              <p className="text-red-800 font-semibold text-sm">Error loading data</p>
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={loadProviders}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="px-6 py-3 border-b border-gray-100 text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-800">{filtered.length}</span> provider
              {filtered.length !== 1 ? 's' : ''}
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Provider', 'Contact', 'City', 'Experience', 'Rating', 'KYC', 'Status', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-gray-400">
                      <UserCog size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No service providers found</p>
                      <p className="text-sm">Try adjusting your filters or add a new provider</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((provider) => (
                    <tr key={provider.id} className="hover:bg-gray-50 transition-colors">
                      {/* Provider */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                            <span className="text-primary-700 font-semibold text-sm">
                              {provider.name?.charAt(0)?.toUpperCase() ?? '?'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{provider.name}</p>
                            <p className="text-xs text-gray-400 font-mono">{provider.id.slice(0, 10)}…</p>
                          </div>
                        </div>
                      </td>
                      {/* Contact */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone size={13} className="text-gray-400" />
                          {provider.phoneNumber}
                        </div>
                        {provider.user?.email && (
                          <p className="text-xs text-gray-400 mt-0.5">{provider.user.email}</p>
                        )}
                      </td>
                      {/* City */}
                      <td className="px-5 py-4">
                        {provider.city ? (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin size={13} className="text-gray-400" />
                            {provider.city}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      {/* Experience */}
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {provider.yearsOfExperience != null
                          ? `${provider.yearsOfExperience} yr${provider.yearsOfExperience !== 1 ? 's' : ''}`
                          : '—'}
                      </td>
                      {/* Rating */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          {provider.rating ?? 0}
                        </div>
                      </td>
                      {/* KYC */}
                      <td className="px-5 py-4">
                        {statusBadge(provider.Kyc_status)}
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4">
                        {statusLoading[provider.id] ? (
                          <Loader2 size={18} className="animate-spin text-gray-400" />
                        ) : (
                          <StatusDropdown
                            current={provider.status}
                            onChange={(s) => handleStatusChange(provider, s)}
                          />
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            title="View details"
                            onClick={() => setDetailsTarget(provider)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <RefreshCw size={16} />
                          </button>
                          <button
                            title="Edit provider"
                            onClick={() => {
                              setEditTarget(provider)
                              setModal('edit')
                              setFormError(null)
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            title="Delete provider"
                            onClick={() => setDeleteTarget(provider)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <ProviderFormModal
          mode={modal}
          initial={
            modal === 'edit' && editTarget
              ? {
                user_id: editTarget.user_id,
                name: editTarget.name,
                phoneNumber: editTarget.phoneNumber,
                city: editTarget.city ?? '',
                yearsOfExperience: editTarget.yearsOfExperience ?? 0,
                status: editTarget.status ?? 'PENDING',
                categoryIds: editTarget.categories?.map((c: any) => c.id) || [],
                itemIds: editTarget.items?.map((i: any) => i.id) || [],
              }
              : emptyForm()
          }
          onSave={handleSave}
          onClose={() => { setModal(null); setEditTarget(null) }}
          saving={saving}
          error={formError}
          allCategories={allCategories}
          allItems={allItems}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          provider={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Details Modal */}
      {detailsTarget && (
        <ProviderDetailsModal
          provider={detailsTarget}
          onClose={() => setDetailsTarget(null)}
        />
      )}
    </div>
  )
}
