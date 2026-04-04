import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, DollarSign, TrendingUp, MapPin, X, Loader2 } from 'lucide-react'
import { fetchPricingRules, fetchSurgeRules, createPricingRule, createSurgeRule, updatePricingRule, updateSurgeRule, deletePricingRule, deleteSurgeRule, type PricingRule, type SurgeRule } from '../services/gyorsApi'

export default function PricingManagement() {
  const [activeTab, setActiveTab] = useState<'services' | 'surge' | 'commission'>('services')
  const [services, setServices] = useState<PricingRule[]>([])
  const [surgeRules, setSurgeRules] = useState<SurgeRule[]>([])
  const [loading, setLoading] = useState(false)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    service_type: '', city: '', base_price: '',
    pricingRuleId: '', multiplier: '', condition: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    setLoading(true)
    try {
      const [pricingRes, surgeRes] = await Promise.all([
        fetchPricingRules().catch(() => []),
        fetchSurgeRules().catch(() => [])
      ])
      setServices(pricingRes)
      setSurgeRules(surgeRes)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (activeTab === 'services') {
        const payload = {
          service_type: formData.service_type,
          city: formData.city,
          base_price: Number(formData.base_price)
        }
        if (editingRuleId) {
          await updatePricingRule(editingRuleId, payload)
        } else {
          await createPricingRule(payload)
        }
      } else if (activeTab === 'surge') {
        const payload = {
          pricingRuleId: formData.pricingRuleId,
          multiplier: Number(formData.multiplier),
          condition: Number(formData.condition)
        }
        if (editingRuleId) {
          await updateSurgeRule(editingRuleId, payload)
        } else {
          await createSurgeRule(payload)
        }
      }
      setIsModalOpen(false)
      setEditingRuleId(null)
      setFormData({ service_type: '', city: '', base_price: '', pricingRuleId: '', multiplier: '', condition: '' })
      await loadRules()
    } catch (error) {
      alert('Failed to save rule')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (rule: any, type: 'services' | 'surge') => {
    if (type === 'services') {
      setFormData({
        ...formData,
        service_type: rule.service_type || rule.name || '',
        city: rule.city || '',
        base_price: rule.base_price?.toString() || rule.basePrice?.toString() || ''
      })
    } else {
      setFormData({
        ...formData,
        pricingRuleId: rule.PricingRuleid || rule.name || '',
        multiplier: rule.multiplier?.toString() || '',
        condition: typeof rule.condition === 'string' ? rule.condition : rule.condition?.toString() || ''
      })
    }
    setEditingRuleId(rule.id)
    setIsModalOpen(true)
  }

  const openAddModal = () => {
    if (activeTab === 'commission') return alert('Cannot add rules for commission.')
    setEditingRuleId(null)
    setFormData({ service_type: '', city: '', base_price: '', pricingRuleId: '', multiplier: '', condition: '' })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, type: 'services' | 'surge') => {
    if (!window.confirm(`Are you sure you want to delete this ${type === 'services' ? 'pricing' : 'surge'} rule?`)) return
    try {
      if (type === 'services') await deletePricingRule(id)
      else await deleteSurgeRule(id)
      await loadRules()
    } catch (error) {
      alert('Failed to delete rule')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pricing & Commission Management</h1>
          <p className="text-gray-500 mt-1">Configure pricing rules and commission structures</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus size={18} />
          Add New Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Services</p>
              <p className="text-3xl font-bold mt-2">24</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Pricing Rules</p>
              <p className="text-3xl font-bold mt-2">{services.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg Provider Commission</p>
              <p className="text-3xl font-bold mt-2">75%</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Cities Configured</p>
              <p className="text-3xl font-bold mt-2">12</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <MapPin size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('services')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'services'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Service Pricing
            </button>
            <button
              onClick={() => setActiveTab('surge')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'surge'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Surge Pricing Rules
            </button>
            <button
              onClick={() => setActiveTab('commission')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'commission'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Commission Structure
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                    <Loader2 className="animate-spin mb-4" size={32} />
                    <p>Loading rules...</p>
                  </div>
                ) : (
                  <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        City
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Base Price (₹)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Version
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Surge Multiplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Provider Commission (%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor Commission (%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {services.map((service, idx) => (
                      <tr key={service.id || idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{service.service_type || service.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{service.city}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">₹{service.base_price || service.basePrice}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            v{service.version || 1}.0
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{service.surgeMultiplier || '1.0'}x</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{service.providerCommission || 70}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{service.vendorCommission || 10}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {service.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditModal(service, 'services')} className="text-primary-600 hover:text-primary-900">
                              <Edit size={18} />
                            </button>
                            <button onClick={() => handleDelete(service.id!, 'services')} className="text-red-600 hover:text-red-900">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'surge' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                    <Loader2 className="animate-spin mb-4" size={32} />
                    <p>Loading surge rules...</p>
                  </div>
                ) : (
                  <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rule Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Multiplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {surgeRules.map((rule, idx) => (
                      <tr key={rule.id || idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{rule.PricingRuleid || rule.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{rule.multiplier}x</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{typeof rule.condition === 'string' ? rule.condition : 'Condition: ' + rule.condition}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {rule.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditModal(rule, 'surge')} className="text-primary-600 hover:text-primary-900">
                              <Edit size={18} />
                            </button>
                            <button onClick={() => handleDelete(rule.id!, 'surge')} className="text-red-600 hover:text-red-900">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'commission' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Default Commission Structure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provider Commission (%)
                    </label>
                    <input
                      type="number"
                      defaultValue={75}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor Commission (%)
                    </label>
                    <input
                      type="number"
                      defaultValue={10}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <button className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                  Update Default Commission
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingRuleId ? 'Edit Rule' : (activeTab === 'services' ? 'Add Pricing Rule' : 'Add Surge Rule')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              {activeTab === 'services' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                    <input required type="text" value={formData.service_type} onChange={e => setFormData({ ...formData, service_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. CLEANING" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input required type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Mumbai" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                    <input required type="number" min="0" value={formData.base_price} onChange={e => setFormData({ ...formData, base_price: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. 500" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Rule ID</label>
                    <input required type="text" value={formData.pricingRuleId} onChange={e => setFormData({ ...formData, pricingRuleId: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="UUID of Pricing Rule" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Surge Multiplier</label>
                    <input required type="number" step="0.1" min="1" value={formData.multiplier} onChange={e => setFormData({ ...formData, multiplier: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. 1.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition (Threshold)</label>
                    <input required type="number" min="0" value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. 10" />
                  </div>
                </>
              )}
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />} Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
