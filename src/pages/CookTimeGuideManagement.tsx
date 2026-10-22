import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Clock,
  Users,
} from 'lucide-react'
import {
  fetchCookGuideRules,
  createCookGuideRule,
  updateCookGuideRule,
  toggleCookGuideRuleStatus,
  deleteCookGuideRule,
  CookTimeGuide,
} from '../services/cookGuideApi'

export default function CookTimeGuideManagement() {
  const [rules, setRules] = useState<CookTimeGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Search filter
  const [searchTerm, setSearchTerm] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<CookTimeGuide | null>(null)
  const [formData, setFormData] = useState({
    peopleCountText: '',
    dishesCountText: '',
    durationText: '',
    durationMinutes: 60,
    orderIndex: 1,
    isActive: true,
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchCookGuideRules()
      setRules(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to load cook time guide rules.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAddModal = () => {
    setEditingRule(null)
    setFormData({
      peopleCountText: 'Upto ',
      dishesCountText: '2-3 dishes',
      durationText: '60 min',
      durationMinutes: 60,
      orderIndex: rules.length + 1,
      isActive: true,
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (rule: CookTimeGuide) => {
    setEditingRule(rule)
    setFormData({
      peopleCountText: rule.peopleCountText,
      dishesCountText: rule.dishesCountText,
      durationText: rule.durationText,
      durationMinutes: rule.durationMinutes,
      orderIndex: rule.orderIndex,
      isActive: rule.isActive,
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.peopleCountText.trim() || !formData.dishesCountText.trim() || !formData.durationText.trim()) {
      setFormError('Please fill in all required fields.')
      return
    }

    try {
      setSaving(true)
      setFormError(null)

      if (editingRule) {
        await updateCookGuideRule(editingRule.id, formData)
        setSuccessMsg('Cook time guide rule updated successfully.')
      } else {
        await createCookGuideRule(formData)
        setSuccessMsg('New cook time guide rule created successfully.')
      }

      setIsModalOpen(false)
      loadData()
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save rule.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (rule: CookTimeGuide) => {
    try {
      await toggleCookGuideRuleStatus(rule.id)
      loadData()
    } catch (err: any) {
      alert(err?.message || 'Failed to toggle status.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this cook time guide rule?')) return
    try {
      await deleteCookGuideRule(id)
      loadData()
      setSuccessMsg('Rule deleted successfully.')
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err: any) {
      alert(err?.message || 'Failed to delete rule.')
    }
  }

  const filteredRules = rules.filter((r) => {
    const q = searchTerm.toLowerCase()
    return (
      r.peopleCountText.toLowerCase().includes(q) ||
      r.dishesCountText.toLowerCase().includes(q) ||
      r.durationText.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-7 h-7 text-purple-700" />
            Cook Time Guide Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure the dynamic "How long will your cook take?" popup for Gyors Cook schedule bookings.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-medium rounded-lg shadow-sm transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Rule
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Total Configured Rules</span>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{rules.length}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Active Mobile Rules</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {rules.filter((r) => r.isActive).length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Duration Range</span>
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-700 mt-2">
            {rules.length > 0 ? `${rules[0].durationText} – ${rules[rules.length - 1].durationText}` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by people, dishes, or duration..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
          <span className="text-xs text-gray-500">
            Showing {filteredRules.length} of {rules.length} rules
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">Loading guide rules...</div>
        ) : filteredRules.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            No rules found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-16 text-center">Order</th>
                  <th className="py-3.5 px-4">No. of People</th>
                  <th className="py-3.5 px-4">Dishes</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Minutes</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 text-center font-bold text-gray-500">
                      {rule.orderIndex}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      {rule.peopleCountText}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">{rule.dishesCountText}</td>
                    <td className="py-3.5 px-4 font-bold text-purple-700">{rule.durationText}</td>
                    <td className="py-3.5 px-4 text-gray-500">{rule.durationMinutes} min</td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          rule.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(rule)}
                          title={rule.isActive ? 'Pause' : 'Activate'}
                          className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-800 transition-colors"
                        >
                          {rule.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(rule)}
                          title="Edit Rule"
                          className="p-1.5 hover:bg-gray-100 rounded-md text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          title="Delete Rule"
                          className="p-1.5 hover:bg-red-50 rounded-md text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingRule ? 'Edit Cook Time Guide Rule' : 'Add New Guide Rule'}
            </h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    No. of People Text *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Upto 2"
                    value={formData.peopleCountText}
                    onChange={(e) => setFormData({ ...formData, peopleCountText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Dishes Text *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2-3 dishes"
                    value={formData.dishesCountText}
                    onChange={(e) => setFormData({ ...formData, dishesCountText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Duration Display *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 60 min or 2 hrs"
                    value={formData.durationText}
                    onChange={(e) => setFormData({ ...formData, durationText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Duration in Minutes *
                  </label>
                  <input
                    type="number"
                    required
                    min={15}
                    step={15}
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 60 })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Order Index
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.orderIndex}
                    onChange={(e) =>
                      setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    Active on Mobile App
                  </label>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-lg">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block mb-1">
                  Mobile App Row Preview
                </span>
                <div className="flex justify-between items-center bg-white p-2.5 rounded border border-purple-200/60">
                  <span className="font-bold text-gray-900 text-sm">
                    {formData.peopleCountText || 'Upto 2'}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {formData.dishesCountText || '2-3 dishes'}
                  </span>
                  <span className="font-extrabold text-purple-700 text-sm">
                    {formData.durationText || '60 min'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
