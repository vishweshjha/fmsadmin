import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Calendar, Play, Pause, AlertCircle, Image as ImageIcon, Link2, Sparkles, CheckCircle, Clock } from 'lucide-react'
import { fetchBanners, createBanner, updateBanner, toggleBannerStatus, deleteBanner, Banner } from '../services/gyorsApi'
import apiClient from '../services/apiClient'

interface Category {
  id: string
  name: string
}

interface ServiceItem {
  id: string
  name: string
  price: string
}

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED' | 'EXPIRED'>('ALL')

  // Modal / Form State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    redirectType: 'NONE' as 'NONE' | 'CATEGORY' | 'SERVICE',
    redirectId: '',
    startDate: '',
    endDate: '',
    isActive: true
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Suggest prefilled gorgeous image URLs for convenience
  const defaultImages = [
    { label: 'AC Savings', url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7bc3?q=80&w=600&auto=format&fit=crop' },
    { label: 'Home Sanitizing', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop' },
    { label: 'General Cleaning', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop' },
    { label: 'Electronics Repair', url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=600&auto=format&fit=crop' }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchBanners()
      setBanners(data)

      // Fetch Categories & Service Items for redirection settings
      const catRes = await apiClient.get<Category[]>('/services/categories')
      if (catRes.success && catRes.data) {
        setCategories(catRes.data)
      }
      
      const serviceRes = await apiClient.get<ServiceItem[]>('/services/items')
      if (serviceRes.success && serviceRes.data) {
        setServices(serviceRes.data)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load banners and dependencies')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreateModal = () => {
    setEditingBanner(null)
    const now = new Date()
    const defaultEnd = new Date()
    defaultEnd.setMonth(now.getMonth() + 1) // default 1 month validity
    
    setFormData({
      title: '',
      subtitle: '',
      imageUrl: defaultImages[0].url,
      redirectType: 'NONE',
      redirectId: '',
      startDate: now.toISOString().slice(0, 16),
      endDate: defaultEnd.toISOString().slice(0, 16),
      isActive: true
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl,
      redirectType: banner.redirectType,
      redirectId: banner.redirectId || '',
      startDate: new Date(banner.startDate).toISOString().slice(0, 16),
      endDate: new Date(banner.endDate).toISOString().slice(0, 16),
      isActive: banner.isActive
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleToggleStatus = async (banner: Banner) => {
    try {
      const updated = await toggleBannerStatus(banner.id, !banner.isActive)
      setBanners(prev => prev.map(b => b.id === banner.id ? updated : b))
    } catch (err: any) {
      alert(err?.message || 'Failed to update banner status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return
    try {
      await deleteBanner(id)
      setBanners(prev => prev.filter(b => b.id !== id))
    } catch (err: any) {
      alert(err?.message || 'Failed to delete banner')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.imageUrl || !formData.endDate) {
      setFormError('Please fill out all required fields')
      return
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setFormError('End Date must be after Start Date')
      return
    }

    try {
      setSaving(true)
      setFormError(null)

      const payload = {
        title: formData.title,
        subtitle: formData.subtitle || undefined,
        imageUrl: formData.imageUrl,
        redirectType: formData.redirectType,
        redirectId: formData.redirectType !== 'NONE' ? formData.redirectId : undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        isActive: formData.isActive
      }

      if (editingBanner) {
        const updated = await updateBanner(editingBanner.id, payload)
        setBanners(prev => prev.map(b => b.id === editingBanner.id ? updated : b))
      } else {
        const created = await createBanner(payload)
        setBanners(prev => [created, ...prev])
      }
      setIsModalOpen(false)
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save banner')
    } finally {
      setSaving(false)
    }
  }

  // Filter banners locally
  const filteredBanners = banners.filter(banner => {
    const matchesSearch = 
      banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (banner.subtitle && banner.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))

    const now = new Date()
    const isExpired = new Date(banner.endDate) < now
    const isActiveAndScheduled = banner.isActive && !isExpired

    if (statusFilter === 'ACTIVE') {
      return matchesSearch && isActiveAndScheduled
    }
    if (statusFilter === 'PAUSED') {
      return matchesSearch && !banner.isActive && !isExpired
    }
    if (statusFilter === 'EXPIRED') {
      return matchesSearch && isExpired
    }
    return matchesSearch
  })

  // Statistics summaries
  const totalCount = banners.length
  const activeCount = banners.filter(b => b.isActive && new Date(b.endDate) >= new Date()).length
  const pausedCount = banners.filter(b => !b.isActive && new Date(b.endDate) >= new Date()).length
  const expiredCount = banners.filter(b => new Date(b.endDate) < new Date()).length

  const getRedirectLabel = (type: string, id?: string) => {
    if (type === 'NONE' || !id) return 'No Redirection'
    if (type === 'CATEGORY') {
      const cat = categories.find(c => c.id === id)
      return `Category: ${cat ? cat.name : id}`
    }
    if (type === 'SERVICE') {
      const svc = services.find(s => s.id === id)
      return `Service: ${svc ? svc.name : id}`
    }
    return 'None'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Sparkles className="text-indigo-600" /> Dynamic Banner Management
          </h1>
          <p className="text-gray-500 mt-1">Create, schedule, and pause promotional banners displayed on the customer home screen.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 self-start md:self-auto"
        >
          <Plus size={20} /> Add Dynamic Banner
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ImageIcon size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Banners</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active & Live</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{activeCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Pause size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Paused Banners</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{pausedCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-gray-50 text-gray-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Expired</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{expiredCount}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by title or subtitle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(['ALL', 'ACTIVE', 'PAUSED', 'EXPIRED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status === 'ALL' ? 'All Banners' : status === 'ACTIVE' ? 'Active' : status === 'PAUSED' ? 'Paused' : 'Expired'}
            </button>
          ))}
        </div>
      </div>

      {/* Error View */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex gap-3 items-center">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* List / Grid of Banners */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 py-16 px-4 text-center rounded-2xl shadow-sm">
          <ImageIcon className="mx-auto text-gray-300 mb-3" size={48} />
          <h3 className="text-lg font-bold text-gray-900">No Banners Found</h3>
          <p className="text-gray-500 mt-1 max-w-md mx-auto">
            Try adjusting your search criteria or add a new promotional banner to show on the customer app home screen.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanners.map((banner) => {
            const isExpired = new Date(banner.endDate) < new Date()
            
            return (
              <div key={banner.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
                {/* Banner Preview Image */}
                <div className="relative h-44 bg-gray-50 overflow-hidden">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400'
                    }}
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    {isExpired ? (
                      <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                        Expired
                      </span>
                    ) : banner.isActive ? (
                      <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                        Live
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                        Paused
                      </span>
                    )}
                  </div>
                </div>

                {/* Banner Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{banner.title}</h3>
                    {banner.subtitle && (
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{banner.subtitle}</p>
                    )}
                  </div>

                  {/* Settings / Schedules */}
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span>
                        {new Date(banner.startDate).toLocaleDateString()} - {new Date(banner.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link2 size={14} className="text-gray-400" />
                      <span className="font-medium truncate">
                        {getRedirectLabel(banner.redirectType, banner.redirectId)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-50">
                    <button
                      onClick={() => handleToggleStatus(banner)}
                      disabled={isExpired}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition ${
                        isExpired
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : banner.isActive
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {banner.isActive ? <Pause size={14} /> : <Play size={14} />}
                      {banner.isActive ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(banner)}
                      className="flex items-center justify-center p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                      title="Edit Banner"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="flex items-center justify-center p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                      title="Delete Banner"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-6 my-8">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBanner ? 'Edit Dynamic Banner' : 'Create Dynamic Banner'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl p-1"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl flex gap-2 items-center">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Banner Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Summer AC Savings"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="e.g. Up to 40% OFF today"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Image Upload / URL Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">Banner Photo</label>
                <div className="flex gap-4 items-center">
                  {formData.imageUrl ? (
                    <div className="relative w-24 h-24 rounded-xl border border-gray-200 overflow-hidden group">
                      <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-medium text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-400 cursor-pointer flex flex-col items-center justify-center text-gray-400 transition-colors bg-gray-50">
                      <Plus size={20} className="text-indigo-600" />
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
                                setFormData(prev => ({ ...prev, imageUrl: compressedDataUrl }));
                              };
                            };
                          }
                        }}
                      />
                    </label>
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Or paste an Image URL here..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-xs"
                    />
                    
                    {/* Suggestions quick selector */}
                    <div className="flex flex-wrap gap-2">
                      {defaultImages.map((img) => (
                        <button
                          key={img.label}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, imageUrl: img.url }))}
                          className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition ${
                            formData.imageUrl === img.url
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scheduling Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Start Display Date *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">End Display Date *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Redirection / Clicking Behavior */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Redirection Type</label>
                  <select
                    value={formData.redirectType}
                    onChange={(e) => setFormData(prev => ({ ...prev, redirectType: e.target.value as any, redirectId: '' }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  >
                    <option value="NONE">No Redirection (Static)</option>
                    <option value="CATEGORY">Redirect to Category</option>
                    <option value="SERVICE">Redirect to Service Details</option>
                  </select>
                </div>

                <div className="space-y-1">
                  {formData.redirectType === 'CATEGORY' && (
                    <>
                      <label className="text-xs font-bold text-gray-700">Select Category *</label>
                      <select
                        required
                        value={formData.redirectId}
                        onChange={(e) => setFormData(prev => ({ ...prev, redirectId: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      >
                        <option value="">-- Choose Category --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </>
                  )}

                  {formData.redirectType === 'SERVICE' && (
                    <>
                      <label className="text-xs font-bold text-gray-700">Select Service *</label>
                      <select
                        required
                        value={formData.redirectId}
                        onChange={(e) => setFormData(prev => ({ ...prev, redirectId: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      >
                        <option value="">-- Choose Service --</option>
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>{s.name} (₹{s.price})</option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">
                  Activate banner immediately (Visible within start/end schedule)
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3 justify-end border-t border-gray-100 pt-5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 text-sm flex items-center gap-2"
                >
                  {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  {editingBanner ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
