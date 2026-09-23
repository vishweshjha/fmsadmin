import React, { useState, useEffect } from 'react'
import {
  Plus,
  MoreVertical,
  CheckCircle,
  XCircle,
  Loader2,
  HelpCircle,
  Trash2,
  Edit3,
  Sparkles
} from 'lucide-react'
import apiClient from '../services/apiClient'
import {
  fetchHelpCards,
  createHelpCard,
  updateHelpCard,
  toggleHelpCardStatus,
  deleteHelpCard,
  type AdminHelpCard
} from '../services/gyorsApi'

// Define types based on backend models
interface ServiceCategory {
  id: string
  name: string
  icon: string
  active: boolean
  _count?: {
    items: number
  }
}

interface ServiceItem {
  id: string
  name: string
  description: string
  price: number | string
  categoryId: string
  category?: ServiceCategory
  durationMinutes: number
  imageUrl?: string
}

export default function ServiceManagement() {
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([])
  const [helpCards, setHelpCards] = useState<AdminHelpCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'categories' | 'items' | 'helpcards'>('categories')

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [showHelpCardModal, setShowHelpCardModal] = useState(false)

  // Form states
  const [newCategory, setNewCategory] = useState({ name: '', icon: 'briefcase', active: true })
  
  // Track editing service item & help card
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null)
  const [editingHelpCard, setEditingHelpCard] = useState<AdminHelpCard | null>(null)

  const [helpCardForm, setHelpCardForm] = useState({
    serviceItemId: '',
    title: '',
    description: '',
    imageUrl: '',
    coveredActivitiesText: '',
    excludedActivitiesText: '',
    dosText: '',
    dontsText: '',
    isActive: true,
  })
  
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    durationMinutes: 60,
    imageUrl: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const loadHelpCards = async () => {
    try {
      const cards = await fetchHelpCards(true)
      setHelpCards(cards)
    } catch (err) {
      console.error('Error fetching help cards:', err)
    }
  }

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const catResponse = await apiClient.get<ServiceCategory[]>('/admin/service-categories')
      if (catResponse.success && catResponse.data) {
        setCategories(catResponse.data)
      }

      const itemResponse = await apiClient.get<ServiceItem[]>('/admin/service-items')
      if (itemResponse.success && itemResponse.data) {
        setServiceItems(itemResponse.data)
      }

      await loadHelpCards()
    } catch (error) {
      console.error('Error fetching service data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditHelpCard = (card: AdminHelpCard) => {
    setEditingHelpCard(card)
    setHelpCardForm({
      serviceItemId: card.serviceItemId || '',
      title: card.title || '',
      description: card.description || '',
      imageUrl: card.imageUrl || '',
      coveredActivitiesText: Array.isArray(card.coveredActivities) ? card.coveredActivities.join('\n') : '',
      excludedActivitiesText: Array.isArray(card.excludedActivities) ? card.excludedActivities.join('\n') : '',
      dosText: Array.isArray(card.dos) ? card.dos.join('\n') : '',
      dontsText: Array.isArray(card.donts) ? card.donts.join('\n') : '',
      isActive: card.isActive ?? true,
    })
    setShowHelpCardModal(true)
  }

  const handleCloseHelpCardModal = () => {
    setShowHelpCardModal(false)
    setEditingHelpCard(null)
    setHelpCardForm({
      serviceItemId: '',
      title: '',
      description: '',
      imageUrl: '',
      coveredActivitiesText: '',
      excludedActivitiesText: '',
      dosText: '',
      dontsText: '',
      isActive: true,
    })
  }

  const handleSaveHelpCard = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const parseLines = (text: string) => text.split('\n').map(s => s.trim()).filter(Boolean)
      const payload = {
        serviceItemId: helpCardForm.serviceItemId || undefined,
        title: helpCardForm.title.trim(),
        description: helpCardForm.description.trim(),
        imageUrl: helpCardForm.imageUrl || undefined,
        coveredActivities: parseLines(helpCardForm.coveredActivitiesText),
        excludedActivities: parseLines(helpCardForm.excludedActivitiesText),
        dos: parseLines(helpCardForm.dosText),
        donts: parseLines(helpCardForm.dontsText),
        isActive: helpCardForm.isActive,
      }

      if (editingHelpCard) {
        await updateHelpCard(editingHelpCard.id, payload)
      } else {
        await createHelpCard(payload)
      }
      handleCloseHelpCardModal()
      loadHelpCards()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save help card')
    }
  }

  const handleToggleHelpCardStatus = async (id: string, currentActive: boolean) => {
    try {
      await toggleHelpCardStatus(id, !currentActive)
      loadHelpCards()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update help card status')
    }
  }

  const handleDeleteHelpCard = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Help Card?')) return
    try {
      await deleteHelpCard(id)
      loadHelpCards()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete help card')
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await apiClient.post('/admin/service-categories', newCategory)
      if (response.success) {
        setShowCategoryModal(false)
        setNewCategory({ name: '', icon: 'briefcase', active: true })
        fetchData()
      }
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const handleEditItem = (item: ServiceItem) => {
    setEditingItem(item)
    setNewItem({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      categoryId: item.categoryId,
      durationMinutes: item.durationMinutes,
      imageUrl: item.imageUrl || ''
    })
    setShowItemModal(true)
  }

  const handleCloseItemModal = () => {
    setShowItemModal(false)
    setEditingItem(null)
    setNewItem({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      durationMinutes: 60,
      imageUrl: ''
    })
  }

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...newItem,
        price: parseFloat(newItem.price as string)
      }

      let response
      if (editingItem) {
        response = await apiClient.patch(`/admin/service-items/${editingItem.id}`, payload)
      } else {
        response = await apiClient.post('/admin/service-items', payload)
      }

      if (response.success) {
        handleCloseItemModal()
        fetchData()
      }
    } catch (error) {
      console.error('Error saving service item:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Catalog</h1>
          <p className="text-gray-500">Manage your service categories and individual offerings</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3.5 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            Add Category
          </button>
          <button
            onClick={() => setShowItemModal(true)}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3.5 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            Add Service Item
          </button>
          <button
            onClick={() => {
              setEditingHelpCard(null)
              setHelpCardForm({
                serviceItemId: '',
                title: '',
                description: '',
                imageUrl: '',
                coveredActivitiesText: '',
                excludedActivitiesText: '',
                dosText: '',
                dontsText: '',
                isActive: true,
              })
              setShowHelpCardModal(true)
            }}
            className="flex items-center gap-2 bg-black text-white px-3.5 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            <Sparkles size={18} className="text-yellow-400" />
            Add Help Card
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'categories'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'items'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Service Items ({serviceItems.length})
          </button>
          <button
            onClick={() => setActiveTab('helpcards')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-1.5 ${activeTab === 'helpcards'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <HelpCircle size={16} />
            One Help (Who Can Do It All) ({helpCards.length})
          </button>
        </nav>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : activeTab === 'categories' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Icon</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{cat.icon}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {cat.active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {cat.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No categories found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'items' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {serviceItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-10 h-10 rounded-lg object-cover border border-gray-100 bg-gray-50"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-lg">
                          🛠️
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        <span className="text-xs text-gray-500 truncate max-w-xs">{item.description}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{item.category?.name || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900">₹{item.price}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{item.durationMinutes} min</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleEditItem(item)}
                      className="text-black font-semibold hover:text-gray-600 transition-colors text-sm px-3 py-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {serviceItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No service items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Help Cards (Who Can Do It All) Grid View */
        <div className="space-y-6">
          {helpCards.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Help Cards Created Yet</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                Create "One Help Who Can Do It All" cards to detail covered activities, excluded activities, do's & don'ts linked directly to service items.
              </p>
              <button
                onClick={() => {
                  setEditingHelpCard(null)
                  setHelpCardForm({
                    serviceItemId: '',
                    title: '',
                    description: '',
                    imageUrl: '',
                    coveredActivitiesText: '',
                    excludedActivitiesText: '',
                    dosText: '',
                    dontsText: '',
                    isActive: true,
                  })
                  setShowHelpCardModal(true)
                }}
                className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <Plus size={18} /> Add First Help Card
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpCards.map((card) => {
                const covered = Array.isArray(card.coveredActivities) ? card.coveredActivities : []
                const excluded = Array.isArray(card.excludedActivities) ? card.excludedActivities : []
                const dos = Array.isArray(card.dos) ? card.dos : []
                const donts = Array.isArray(card.donts) ? card.donts : []

                return (
                  <div key={card.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                    {/* Header Image & Badge */}
                    <div className="relative h-44 bg-gray-100 border-b border-gray-100">
                      {card.imageUrl ? (
                        <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                          <HelpCircle size={40} />
                          <span className="text-xs mt-1 font-medium">No Image</span>
                        </div>
                      )}
                      
                      {/* Active Status Badge */}
                      <button
                        onClick={() => handleToggleHelpCardStatus(card.id, card.isActive)}
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm transition ${
                          card.isActive ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-800 text-gray-200 hover:bg-black'
                        }`}
                      >
                        {card.isActive ? 'Active' : 'Disabled'}
                      </button>

                      {/* Linked Service Item Badge */}
                      <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-md text-xs font-semibold max-w-[85%] truncate">
                        🏷️ {card.serviceItem?.name || 'All Services'}
                      </div>
                    </div>

                    {/* Card Body Content */}
                    <div className="p-5 flex-1 space-y-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg leading-snug">{card.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{card.description}</p>
                      </div>

                      {/* Covered Activities Preview */}
                      {covered.length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-green-700 mb-1.5 flex items-center gap-1">
                            <CheckCircle size={12} /> Covered ({covered.length})
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {covered.slice(0, 3).map((act, i) => (
                              <span key={i} className="bg-green-50 text-green-800 text-xs px-2 py-0.5 rounded border border-green-200">
                                {act}
                              </span>
                            ))}
                            {covered.length > 3 && (
                              <span className="text-xs text-gray-400 self-center">+{covered.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Excluded Activities Preview */}
                      {excluded.length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-red-600 mb-1.5 flex items-center gap-1">
                            <XCircle size={12} /> Excluded ({excluded.length})
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {excluded.slice(0, 3).map((act, i) => (
                              <span key={i} className="bg-red-50 text-red-800 text-xs px-2 py-0.5 rounded border border-red-200">
                                {act}
                              </span>
                            ))}
                            {excluded.length > 3 && (
                              <span className="text-xs text-gray-400 self-center">+{excluded.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Do's & Don'ts Counts */}
                      {(dos.length > 0 || donts.length > 0) && (
                        <div className="flex gap-4 pt-2 border-t border-gray-100 text-xs text-gray-600">
                          <span>👍 <strong>{dos.length}</strong> Do&apos;s</span>
                          <span>👎 <strong>{donts.length}</strong> Don&apos;ts</span>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                      <button
                        onClick={() => handleEditHelpCard(card)}
                        className="text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-100 transition"
                      >
                        <Edit3 size={14} /> Edit Card
                      </button>

                      <button
                        onClick={() => handleDeleteHelpCard(card.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-red-100 bg-red-50 hover:bg-red-100 transition"
                        title="Delete Help Card"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold">Add Service Category</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                  placeholder="e.g. Cleaning, Plumbing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon Identifier</label>
                <input
                  type="text"
                  required
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                  placeholder="e.g. cleaning_icon"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cat-active"
                  checked={newCategory.active}
                  onChange={(e) => setNewCategory({ ...newCategory, active: e.target.checked })}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <label htmlFor="cat-active" className="text-sm text-gray-700">Active and visible to customers</label>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold">{editingItem ? 'Edit Service Item' : 'Add Service Item'}</h3>
              <button onClick={handleCloseItemModal} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateItem} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                  placeholder="e.g. Full House Deep Cleaning"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  required
                  value={newItem.categoryId}
                  onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all appearance-none"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                    placeholder="499"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    required
                    value={newItem.durationMinutes}
                    onChange={(e) => setNewItem({ ...newItem, durationMinutes: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                    placeholder="60"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                  placeholder="Describe the service details..."
                />
              </div>

              {/* Service Photo Upload Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Photo</label>
                <div className="flex gap-4 items-center">
                  {newItem.imageUrl ? (
                    <div className="relative w-24 h-24 rounded-xl border border-gray-200 overflow-hidden group">
                      <img src={newItem.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                      <button
                        type="button"
                        onClick={() => setNewItem({ ...newItem, imageUrl: '' })}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-medium text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400 cursor-pointer flex flex-col items-center justify-center text-gray-400 transition-colors bg-gray-50">
                      <Plus size={20} />
                      <span className="text-[10px] font-semibold mt-1">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.readAsDataURL(file);
                            reader.onload = (event) => {
                              const img = new Image();
                              img.src = event.target?.result as string;
                              img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX_WIDTH = 800;
                                const MAX_HEIGHT = 600;
                                let width = img.width;
                                let height = img.height;

                                if (width > height) {
                                  if (width > MAX_WIDTH) {
                                    height *= MAX_WIDTH / width;
                                    width = MAX_WIDTH;
                                  }
                                } else {
                                  if (height > MAX_HEIGHT) {
                                    width *= MAX_HEIGHT / height;
                                    height = MAX_HEIGHT;
                                  }
                                }

                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                ctx?.drawImage(img, 0, 0, width, height);

                                // Compress to 70% quality JPEG
                                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                                setNewItem({ ...newItem, imageUrl: compressedDataUrl });
                              };
                            };
                          }
                        }}
                      />
                    </label>
                  )}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Or paste an Image URL here..."
                      value={newItem.imageUrl}
                      onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all text-xs"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Supports JPEG, PNG, or Data URL.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseItemModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {editingItem ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Help Card Create / Edit Modal */}
      {showHelpCardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-900 text-white">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-yellow-400" />
                <h3 className="text-lg font-bold">
                  {editingHelpCard ? 'Edit One Help (Who Can Do It All) Card' : 'Add One Help (Who Can Do It All) Card'}
                </h3>
              </div>
              <button onClick={handleCloseHelpCardModal} className="text-gray-400 hover:text-white transition">
                <XCircle size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveHelpCard} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Service Item Selector (Referential Integrity!) */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Select Service Item <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={helpCardForm.serviceItemId}
                  onChange={(e) => setHelpCardForm({ ...helpCardForm, serviceItemId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
                >
                  <option value="">-- Choose Service Item from Dropdown --</option>
                  {serviceItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.category?.name || 'General'}) - ₹{item.price}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Connects this Help Card with strict referential integrity to the chosen Service Item.
                </p>
              </div>

              {/* Card Title & Status Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Card Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={helpCardForm.title}
                    onChange={(e) => setHelpCardForm({ ...helpCardForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all text-sm"
                    placeholder="e.g. What is covered in House Cleaning"
                  />
                </div>
                <div className="flex items-end mb-1">
                  <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-2.5 rounded-lg border border-gray-200 w-full">
                    <input
                      type="checkbox"
                      checked={helpCardForm.isActive}
                      onChange={(e) => setHelpCardForm({ ...helpCardForm, isActive: e.target.checked })}
                      className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                    />
                    <span className="text-xs font-semibold text-gray-800">Card Active & Visible</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={helpCardForm.description}
                  onChange={(e) => setHelpCardForm({ ...helpCardForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all text-sm"
                  placeholder="Overview of what professional does in this service..."
                />
              </div>

              {/* Photo Upload (Saved to imageUrl column like Banner table) */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Card Photo / Image (Saved to imageUrl)
                </label>
                <div className="flex gap-4 items-center">
                  {helpCardForm.imageUrl ? (
                    <div className="relative w-28 h-28 rounded-xl border border-gray-200 overflow-hidden group">
                      <img src={helpCardForm.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                      <button
                        type="button"
                        onClick={() => setHelpCardForm({ ...helpCardForm, imageUrl: '' })}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-medium text-xs"
                      >
                        Remove Photo
                      </button>
                    </div>
                  ) : (
                    <label className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-500 cursor-pointer flex flex-col items-center justify-center text-gray-400 transition-colors bg-gray-50">
                      <Plus size={24} />
                      <span className="text-xs font-semibold mt-1">Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.readAsDataURL(file);
                            reader.onload = (event) => {
                              const img = new Image();
                              img.src = event.target?.result as string;
                              img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX_WIDTH = 800;
                                const MAX_HEIGHT = 600;
                                let width = img.width;
                                let height = img.height;

                                if (width > height) {
                                  if (width > MAX_WIDTH) {
                                    height *= MAX_WIDTH / width;
                                    width = MAX_WIDTH;
                                  }
                                } else {
                                  if (height > MAX_HEIGHT) {
                                    width *= MAX_HEIGHT / height;
                                    height = MAX_HEIGHT;
                                  }
                                }

                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                ctx?.drawImage(img, 0, 0, width, height);

                                // Compress to JPEG data URL (Saved to imageUrl like Banner table)
                                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                                setHelpCardForm({ ...helpCardForm, imageUrl: compressedDataUrl });
                              };
                            };
                          }
                        }}
                      />
                    </label>
                  )}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Or paste an Image URL here..."
                      value={helpCardForm.imageUrl}
                      onChange={(e) => setHelpCardForm({ ...helpCardForm, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all text-xs"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Uploaded photo will be stored in the <code>imageUrl</code> column like the Banner table.
                    </p>
                  </div>
                </div>
              </div>

              {/* Covered & Excluded Activities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-green-800 uppercase tracking-wider mb-1">
                    Covered Activities (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={helpCardForm.coveredActivitiesText}
                    onChange={(e) => setHelpCardForm({ ...helpCardForm, coveredActivitiesText: e.target.value })}
                    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all text-xs font-mono bg-green-50/30"
                    placeholder="Floor mopping and sweeping&#10;Bathroom deep sanitization&#10;Kitchen counter wipe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-red-700 uppercase tracking-wider mb-1">
                    Excluded Activities (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={helpCardForm.excludedActivitiesText}
                    onChange={(e) => setHelpCardForm({ ...helpCardForm, excludedActivitiesText: e.target.value })}
                    className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all text-xs font-mono bg-red-50/30"
                    placeholder="Washing external windows above 2nd floor&#10;Heavy furniture moving&#10;Paint stain removal"
                  />
                </div>
              </div>

              {/* Do's & Don'ts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">
                    Do's for Customer & Operator (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={helpCardForm.dosText}
                    onChange={(e) => setHelpCardForm({ ...helpCardForm, dosText: e.target.value })}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs font-mono bg-blue-50/30"
                    placeholder="Keep electricity & water supply active&#10;Verify OTP before job start"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-orange-700 uppercase tracking-wider mb-1">
                    Don'ts (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={helpCardForm.dontsText}
                    onChange={(e) => setHelpCardForm({ ...helpCardForm, dontsText: e.target.value })}
                    className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all text-xs font-mono bg-orange-50/30"
                    placeholder="Do not offer cash payments directly to provider&#10;Do not share OTP before provider arrival"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseHelpCardModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  {editingHelpCard ? 'Update Help Card' : 'Create Help Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

