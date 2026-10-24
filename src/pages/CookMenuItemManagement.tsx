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
  UtensilsCrossed,
  Sparkles,
  Link2,
  Leaf,
  Flame,
  Layers,
  Image as ImageIcon
} from 'lucide-react'
import {
  fetchCookMenuItemsAdmin,
  createCookMenuItem,
  updateCookMenuItem,
  toggleCookMenuItemStatus,
  deleteCookMenuItem,
  fetchServiceItemsList,
  CookMenuItem,
  ServiceItemOption
} from '../services/cookMenuApi'

const PRESET_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages']
const PRESET_BADGES = [
  'Popular Choice',
  'High Protein',
  'Low Calories',
  "Chef's Special",
  'Quick Prep',
  'Kid Friendly'
]

export default function CookMenuItemManagement() {
  const [items, setItems] = useState<CookMenuItem[]>([])
  const [serviceItems, setServiceItems] = useState<ServiceItemOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedVegFilter, setSelectedVegFilter] = useState<'all' | 'veg' | 'nonveg'>('all')
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('all')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CookMenuItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Breakfast',
    isVeg: true,
    badge: '',
    imageUrl: '',
    description: '',
    price: 0,
    orderIndex: 0,
    isActive: true,
    serviceItemId: '',
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Delete confirmation modal state
  const [itemToDelete, setItemToDelete] = useState<CookMenuItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadData()
    loadServices()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchCookMenuItemsAdmin()
      setItems(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to load cook menu items.')
    } finally {
      setLoading(false)
    }
  }

  const loadServices = async () => {
    try {
      const services = await fetchServiceItemsList()
      setServiceItems(services)
    } catch (err) {
      console.error('Failed to load services:', err)
    }
  }

  const handleOpenAddModal = () => {
    setEditingItem(null)
    // Default to the cook service item if found
    const defaultCookService = serviceItems.find(
      (s) => s.id === 'svc_cook' || s.name.toLowerCase().includes('cook')
    )
    setFormData({
      name: '',
      category: 'Breakfast',
      isVeg: true,
      badge: '',
      imageUrl: '',
      description: '',
      price: 0,
      orderIndex: items.length + 1,
      isActive: true,
      serviceItemId: defaultCookService ? defaultCookService.id : (serviceItems[0]?.id || ''),
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item: CookMenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      isVeg: item.isVeg,
      badge: item.badge || '',
      imageUrl: item.imageUrl,
      description: item.description || '',
      price: typeof item.price === 'string' ? parseFloat(item.price) || 0 : (item.price ?? 0),
      orderIndex: item.orderIndex,
      isActive: item.isActive,
      serviceItemId: item.serviceItemId || (serviceItems[0]?.id || ''),
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setFormError('Please enter dish name.')
      return
    }
    if (!formData.category.trim()) {
      setFormError('Please select or specify a category.')
      return
    }
    if (!formData.imageUrl.trim()) {
      setFormError('Please provide an image URL.')
      return
    }
    if (!formData.serviceItemId.trim()) {
      setFormError('Please select a Service Item to maintain referential integrity.')
      return
    }

    try {
      setSaving(true)
      setFormError(null)

      const payload = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        isVeg: formData.isVeg,
        badge: formData.badge.trim() ? formData.badge.trim() : null,
        imageUrl: formData.imageUrl.trim(),
        description: formData.description.trim() ? formData.description.trim() : null,
        price: Number(formData.price) || 0,
        orderIndex: Number(formData.orderIndex) || 0,
        isActive: formData.isActive,
        serviceItemId: formData.serviceItemId,
      }

      if (editingItem) {
        await updateCookMenuItem(editingItem.id, payload)
        setSuccessMsg(`Menu item "${payload.name}" updated successfully.`)
      } else {
        await createCookMenuItem(payload)
        setSuccessMsg(`New menu item "${payload.name}" created successfully.`)
      }

      setIsModalOpen(false)
      loadData()
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save cook menu item.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (item: CookMenuItem) => {
    try {
      await toggleCookMenuItemStatus(item.id)
      loadData()
    } catch (err: any) {
      alert(err?.message || 'Failed to toggle status.')
    }
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    try {
      setDeleting(true)
      await deleteCookMenuItem(itemToDelete.id)
      setSuccessMsg(`Menu item "${itemToDelete.name}" deleted successfully.`)
      setItemToDelete(null)
      loadData()
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err: any) {
      alert(err?.message || 'Failed to delete menu item.')
    } finally {
      setDeleting(false)
    }
  }

  // Filtered List
  const filteredItems = items.filter((item) => {
    // Search query
    const q = searchTerm.toLowerCase()
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.badge && item.badge.toLowerCase().includes(q)) ||
      (item.serviceItem?.name && item.serviceItem.name.toLowerCase().includes(q))

    // Category filter
    const matchesCategory =
      selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase()

    // Veg filter
    const matchesVeg =
      selectedVegFilter === 'all' ||
      (selectedVegFilter === 'veg' && item.isVeg) ||
      (selectedVegFilter === 'nonveg' && !item.isVeg)

    // Service Item filter
    const matchesService =
      selectedServiceFilter === 'all' || item.serviceItemId === selectedServiceFilter

    return matchesSearch && matchesCategory && matchesVeg && matchesService
  })

  // Statistics
  const totalCount = items.length
  const vegCount = items.filter((i) => i.isVeg).length
  const nonVegCount = totalCount - vegCount
  const activeCount = items.filter((i) => i.isActive).length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UtensilsCrossed className="w-7 h-7 text-purple-700" />
            Cook Menu Item Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage menu items and dishes for Gyors Cook services with direct referential integrity to Service Catalog items.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Menu Item
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{totalCount}</div>
            <div className="text-xs text-gray-500 font-medium">Total Dishes</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{vegCount}</div>
            <div className="text-xs text-gray-500 font-medium">Vegetarian</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-700">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{nonVegCount}</div>
            <div className="text-xs text-gray-500 font-medium">Non-Veg</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{activeCount}</div>
            <div className="text-xs text-gray-500 font-medium">Active Online</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dish by name, description, badge or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="all">All Categories</option>
              {PRESET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Veg / NonVeg Filter */}
            <select
              value={selectedVegFilter}
              onChange={(e) => setSelectedVegFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="all">All Food Types</option>
              <option value="veg">🟢 Pure Veg</option>
              <option value="nonveg">🔴 Non-Veg</option>
            </select>

            {/* Service Item Filter */}
            <select
              value={selectedServiceFilter}
              onChange={(e) => setSelectedServiceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600 max-w-[220px]"
            >
              <option value="all">All Linked Services</option>
              {serviceItems.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.name}
                </option>
              ))}
            </select>

            {(searchTerm || selectedCategory !== 'all' || selectedVegFilter !== 'all' || selectedServiceFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setSelectedVegFilter('all')
                  setSelectedServiceFilter('all')
                }}
                className="px-3 py-2 text-xs text-purple-700 hover:text-purple-900 hover:bg-purple-50 rounded-lg font-medium transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Categories ({items.length})
          </button>
          {PRESET_CATEGORIES.map((cat) => {
            const count = items.filter((i) => i.category.toLowerCase() === cat.toLowerCase()).length
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-purple-700 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mx-auto mb-2"></div>
            Loading cook menu items...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700">No Cook Menu Items Found</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              No menu items match your search or filters. Click "Add Menu Item" above to create one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-4 w-16">Dish</th>
                  <th className="py-3.5 px-4">Name & Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Linked Service (Integrity)</th>
                  <th className="py-3.5 px-4 text-center">Badge</th>
                  <th className="py-3.5 px-4 text-right">Price</th>
                  <th className="py-3.5 px-4 text-center">Order</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                    {/* Thumbnail Image */}
                    <td className="py-3.5 px-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                      </div>
                    </td>

                    {/* Name & Description */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-gray-400 line-clamp-1 max-w-xs mt-0.5">
                          {item.description}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                        {item.category}
                      </span>
                    </td>

                    {/* Veg / Non-Veg */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.isVeg ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                          Veg
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
                          Non-Veg
                        </span>
                      )}
                    </td>

                    {/* Referential Integrity: Linked Service */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.serviceItem ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          <Link2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>{item.serviceItem.name}</span>
                        </div>
                      ) : item.serviceItemId ? (
                        <span className="text-xs text-gray-500 font-mono">
                          ID: {item.serviceItemId}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Unlinked
                        </span>
                      )}
                    </td>

                    {/* Badge */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {item.badge ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          {item.badge}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 text-right font-medium text-gray-900 whitespace-nowrap">
                      {Number(item.price) > 0 ? `₹${item.price}` : <span className="text-xs text-gray-400">Included (₹0)</span>}
                    </td>

                    {/* Order Index */}
                    <td className="py-3.5 px-4 text-center text-xs text-gray-500 font-mono">
                      #{item.orderIndex}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggle(item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                          item.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title="Click to toggle visibility"
                      >
                        {item.isActive ? (
                          <>
                            <Play className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                            Active
                          </>
                        ) : (
                          <>
                            <Pause className="w-3 h-3 fill-gray-400 text-gray-400" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit Item"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Item"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 border border-gray-100 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-purple-700" />
                {editingItem ? 'Edit Cook Menu Item' : 'Add New Cook Menu Item'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Linked Service Item (Referential Integrity) */}
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100">
                <label className="block text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-blue-700" />
                  Linked Service Item (Referential Integrity) *
                </label>
                <select
                  required
                  value={formData.serviceItemId}
                  onChange={(e) => setFormData({ ...formData, serviceItemId: e.target.value })}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                >
                  <option value="">-- Select Linked Service Item --</option>
                  {serviceItems.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name} (ID: {svc.id})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-blue-700 mt-1">
                  Enforces foreign key relation in database. If service item is removed, associated menu items are cascade maintained.
                </p>
              </div>

              {/* Dish Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paneer Butter Masala"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    {PRESET_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Food Preference: Veg / Non-Veg */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Food Preference (Veg / Non-Veg) *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isVeg: true })}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-sm font-semibold transition-all ${
                      formData.isVeg
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                    Pure Vegetarian
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isVeg: false })}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-sm font-semibold transition-all ${
                      !formData.isVeg
                        ? 'border-red-500 bg-red-50 text-red-800 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-red-600"></span>
                    Non-Vegetarian
                  </button>
                </div>
              </div>

              {/* Badge Selection / Custom Badge */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Highlight Badge (Optional)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_BADGES.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          badge: formData.badge === b ? '' : b,
                        })
                      }
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        formData.badge === b
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                  {formData.badge && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, badge: '' })}
                      className="px-2 py-1 text-xs text-gray-400 hover:text-red-500"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Or enter custom badge (e.g. Chef Special, Healthy Choice)"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              {/* Image URL & Preview */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Image URL *</span>
                  {formData.imageUrl && (
                    <span className="text-[11px] text-purple-700 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> Live Preview below
                    </span>
                  )}
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                {formData.imageUrl && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-md border border-gray-300"
                      onError={(e) => {
                        ;(e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                    <div className="text-xs text-gray-500">
                      <p className="font-medium text-gray-700">Image Preview</p>
                      <p className="text-[11px] truncate max-w-xs">{formData.imageUrl}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description / Ingredients (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Prepared with fresh cottage cheese, tomato gravy and aromatic herbs."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              {/* Price & Order Index & Active */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <span className="text-[10px] text-gray-400">0 = Included in service</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.orderIndex}
                    onChange={(e) =>
                      setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    />
                    <span className="text-xs font-semibold text-gray-700">Active (Visible)</span>
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-sm font-medium shadow-sm transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Menu Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-100">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Menu Item</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete dish <strong className="text-gray-900">"{itemToDelete.name}"</strong>? It will be removed from customer cooking meal selection.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
