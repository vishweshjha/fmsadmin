import { useState, useEffect } from 'react'
import { Plus, Trash2, Tag, Calendar, X, Loader2, CheckCircle, Percent } from 'lucide-react'
import { fetchCoupons, createCoupon, deleteCoupon, type Coupon } from '../services/gyorsApi'

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(false)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    discountPercent: '',
    maxDiscount: '',
    expiryDate: '',
    usageLimit: '',
    isVisibleOnHome: false,
    price: '',
    allowedJobsCount: '',
    jobDurationMinutes: '60',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadCoupons()
  }, [])

  const loadCoupons = async () => {
    setLoading(true)
    try {
      const data = await fetchCoupons()
      setCoupons(data)
    } catch (error) {
      console.error('Failed to load coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload: Coupon = {
        code: formData.code.toUpperCase(),
        discountPercent: Number(formData.discountPercent),
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        expiryDate: formData.expiryDate,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : 0,
        isActive: true,
        isVisibleOnHome: formData.isVisibleOnHome,
        price: formData.price ? Number(formData.price) : undefined,
        allowedJobsCount: formData.allowedJobsCount ? Number(formData.allowedJobsCount) : undefined,
        jobDurationMinutes: formData.jobDurationMinutes ? Number(formData.jobDurationMinutes) : undefined,
        description: formData.description
      }
      await createCoupon(payload)
      setIsModalOpen(false)
      setFormData({ 
        code: '', 
        discountPercent: '', 
        maxDiscount: '', 
        expiryDate: '', 
        usageLimit: '',
        isVisibleOnHome: false,
        price: '',
        allowedJobsCount: '',
        jobDurationMinutes: '60',
        description: ''
      })
      await loadCoupons()
      alert('Coupon created successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to create coupon')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return
    try {
      await deleteCoupon(id)
      await loadCoupons()
    } catch (error) {
      alert('Failed to delete coupon')
    }
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coupon Management</h1>
          <p className="text-gray-500 mt-1">Create and manage discount coupons for customers</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus size={18} />
          Create New Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Coupons</p>
              <p className="text-3xl font-bold mt-2">
                {coupons.filter(c => c.isActive && !isExpired(c.expiryDate)).length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Usage</p>
              <p className="text-3xl font-bold mt-2">
                {coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Percent size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Expired Coupons</p>
              <p className="text-3xl font-bold mt-2">
                {coupons.filter(c => isExpired(c.expiryDate)).length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <Calendar size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Coupon List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">All Coupons</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p>Loading coupons...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No coupons found. Create your first coupon to get started.
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Tag size={16} className="text-primary-600" />
                          <span className="font-mono font-bold text-gray-900">{coupon.code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.discountPercent}% Off
                          {coupon.maxDiscount ? ` (Up to ₹${coupon.maxDiscount})` : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.usedCount || 0} / {coupon.usageLimit === 0 ? '∞' : coupon.usageLimit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isExpired(coupon.expiryDate) ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                          {new Date(coupon.expiryDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isExpired(coupon.expiryDate) ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Expired
                          </span>
                        ) : coupon.isActive ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleDelete(coupon.id!)} className="text-red-600 hover:text-red-900">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Create New Coupon</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. WELCOME50"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="100"
                    placeholder="e.g. 20"
                    value={formData.discountPercent}
                    onChange={e => setFormData({ ...formData, discountPercent: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional"
                    value={formData.maxDiscount}
                    onChange={e => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  required
                  type="date"
                  value={formData.expiryDate}
                  onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit (Total)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0 for unlimited"
                  value={formData.usageLimit}
                  onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold text-gray-900">Job Package Settings (Optional)</h3>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isVisibleOnHome"
                    checked={formData.isVisibleOnHome}
                    onChange={e => setFormData({ ...formData, isVisibleOnHome: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isVisibleOnHome" className="text-sm font-medium text-gray-700">
                    Visible on Customer Home Screen
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Package Price (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1500"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Jobs</label>
                    <input
                      type="number"
                      placeholder="e.g. 3"
                      value={formData.allowedJobsCount}
                      onChange={e => setFormData({ ...formData, allowedJobsCount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Duration (Mins)</label>
                  <select
                    value={formData.jobDurationMinutes}
                    onChange={e => setFormData({ ...formData, jobDurationMinutes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="60">60 Minutes</option>
                    <option value="90">90 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Package Description</label>
                  <textarea
                    placeholder="Describe what's included..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none h-20"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
