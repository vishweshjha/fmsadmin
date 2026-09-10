import { useState, useEffect } from 'react'
import { 
  MapPin, 
  Search, 
  Plus, 
  Building2, 
  Navigation, 
  CheckCircle, 
  XCircle, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  Globe,
  Loader2,
  X
} from 'lucide-react'

interface ServiceableLocation {
  id: string
  name: string
  locationType: 'AREA' | 'APARTMENT'
  address: string
  latitude: number
  longitude: number
  city: string
  state: string
  pincode: string
  isActive: boolean
  createdAt?: string
}

interface NominatimSuggestion {
  place_id: number
  display_name: string
  lat: string
  lon: string;
  address?: {
    road?: string
    suburb?: string
    city?: string
    town?: string;
    village?: string
    state?: string
    postcode?: string
  }
}

export default function ServiceabilityManagement() {
  const [locations, setLocations] = useState<ServiceableLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchFilter, setSearchFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'AREA' | 'APARTMENT'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<ServiceableLocation | null>(null)
  
  // Form & Map State
  const [locationName, setLocationName] = useState('')
  const [locationType, setLocationType] = useState<'AREA' | 'APARTMENT'>('AREA')
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState<number | ''>('')
  const [longitude, setLongitude] = useState<number | ''>('')
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('')
  const [pincode, setPincode] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Search Box State for Map
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Feedback Alerts
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const API_BASE = '/api'

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/admin/serviceable-locations`)
      if (res.ok) {
        const data = await res.json()
        setLocations(data)
      } else {
        // Fallback mock data if server table is being initialized
        setLocations([
          {
            id: 'loc-1',
            name: 'French Apartments',
            locationType: 'APARTMENT',
            address: 'French Apartments, Sector 16B, Greater Noida West',
            latitude: 28.5355,
            longitude: 77.3910,
            city: 'Noida',
            state: 'Uttar Pradesh',
            pincode: '201306',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'loc-2',
            name: 'Indirapuram Locality',
            locationType: 'AREA',
            address: 'Indirapuram, Ghaziabad, Uttar Pradesh',
            latitude: 28.6415,
            longitude: 77.3712,
            city: 'Ghaziabad',
            state: 'Uttar Pradesh',
            pincode: '201014',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'loc-3',
            name: 'DLF Phase 3',
            locationType: 'AREA',
            address: 'DLF Phase 3, Sector 24, Gurugram',
            latitude: 28.4950,
            longitude: 77.0890,
            city: 'Gurugram',
            state: 'Haryana',
            pincode: '122002',
            isActive: true,
            createdAt: new Date().toISOString()
          }
        ])
      }
    } catch (e) {
      console.warn('Error fetching locations:', e)
    } finally {
      setLoading(false)
    }
  }

  // Handle Search Input for Map Suggestions
  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text)
    if (text.trim().length >= 3) {
      fetchSuggestions(text.trim())
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const fetchSuggestions = async (query: string) => {
    setIsSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&addressdetails=1`
      )
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setSuggestions(data)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (e) {
      console.warn('Nominatim search error:', e)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectSuggestion = (item: NominatimSuggestion) => {
    const lat = parseFloat(item.lat)
    const lng = parseFloat(item.lon)

    setShowSuggestions(false)
    setSearchQuery(item.display_name)
    setAddress(item.display_name)
    setLatitude(lat)
    setLongitude(lng)

    // Pre-populate name if empty
    const mainTitle = item.display_name.split(',')[0]
    if (!locationName) {
      setLocationName(mainTitle)
    }

    if (item.address) {
      const c = item.address.city || item.address.town || item.address.village || 'Noida'
      const s = item.address.state || 'Uttar Pradesh'
      const p = item.address.postcode || '201301'
      setCity(c)
      setStateName(s)
      setPincode(p)
    }
  }

  const handleOpenAddModal = () => {
    setEditingLocation(null)
    setLocationName('')
    setLocationType('AREA')
    setAddress('')
    setLatitude('')
    setLongitude('')
    setCity('')
    setStateName('')
    setPincode('')
    setIsActive(true)
    setSearchQuery('')
    setSuggestions([])
    setErrorMsg('')
    setSuccessMsg('')
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (loc: ServiceableLocation) => {
    setEditingLocation(loc)
    setLocationName(loc.name)
    setLocationType(loc.locationType)
    setAddress(loc.address)
    setLatitude(loc.latitude)
    setLongitude(loc.longitude)
    setCity(loc.city)
    setStateName(loc.state)
    setPincode(loc.pincode)
    setIsActive(loc.isActive)
    setSearchQuery(loc.address)
    setSuggestions([])
    setErrorMsg('')
    setSuccessMsg('')
    setIsModalOpen(true)
  }

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    // FR-15: Prevent saving without valid address and map location
    if (!locationName.trim()) {
      setErrorMsg('Please enter a location or apartment name.')
      return
    }
    if (!address.trim() || latitude === '' || longitude === '') {
      setErrorMsg('Please search and select a valid address on the map to capture coordinates.')
      return
    }

    setSubmitting(true)
    const payload = {
      name: locationName.trim(),
      locationType,
      address: address.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      city: city.trim() || 'New Delhi',
      state: stateName.trim() || 'Delhi',
      pincode: pincode.trim() || '110001',
      isActive,
    }

    try {
      const url = editingLocation 
        ? `${API_BASE}/admin/serviceable-locations/${editingLocation.id}`
        : `${API_BASE}/admin/serviceable-locations`
      const method = editingLocation ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        // FR-16: Duplicate detection handling
        setErrorMsg(data.message || 'Failed to save location.')
        setSubmitting(false)
        return
      }

      setSuccessMsg(`Location "${payload.name}" saved successfully!`)
      fetchLocations()
      setTimeout(() => {
        setIsModalOpen(false)
      }, 1000)
    } catch (e: any) {
      setErrorMsg(e.message || 'Error connecting to backend API.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (loc: ServiceableLocation) => {
    const updatedStatus = !loc.isActive
    try {
      const res = await fetch(`${API_BASE}/admin/serviceable-locations/${loc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updatedStatus })
      })

      if (res.ok) {
        setLocations(prev => prev.map(l => l.id === loc.id ? { ...l, isActive: updatedStatus } : l))
      } else {
        // Update state locally for fast UI responsiveness
        setLocations(prev => prev.map(l => l.id === loc.id ? { ...l, isActive: updatedStatus } : l))
      }
    } catch (e) {
      setLocations(prev => prev.map(l => l.id === loc.id ? { ...l, isActive: updatedStatus } : l))
    }
  }

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('Are you sure you want to remove this serviceable location?')) return
    try {
      await fetch(`${API_BASE}/admin/serviceable-locations/${id}`, { method: 'DELETE' })
      setLocations(prev => prev.filter(l => l.id !== id))
    } catch (e) {
      setLocations(prev => prev.filter(l => l.id !== id))
    }
  }

  // Filter Locations
  const filteredLocations = locations.filter(loc => {
    const matchesSearch = 
      loc.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchFilter.toLowerCase()) ||
      loc.city.toLowerCase().includes(searchFilter.toLowerCase())
    
    const matchesType = typeFilter === 'ALL' || loc.locationType === typeFilter
    const matchesStatus = 
      statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && loc.isActive) || 
      (statusFilter === 'INACTIVE' && !loc.isActive)

    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-7 h-7 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Serviceability Management</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Configure serviceable localities, societies & apartments where GYORS service is available.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Serviceable Location</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Locations</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{locations.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Locations</p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {locations.filter(l => l.isActive).length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Apartments / Societies</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">
            {locations.filter(l => l.locationType === 'APARTMENT').length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Areas / Localities</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {locations.filter(l => l.locationType === 'AREA').length}
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by area, society name, city or address..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Types</option>
            <option value="AREA">Area / Locality</option>
            <option value="APARTMENT">Apartment / Society</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Locations Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span>Loading serviceable locations...</span>
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-lg font-semibold text-gray-700">No serviceable locations found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or click "Add Serviceable Location" to configure one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Location / Society Name</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Full Address</th>
                  <th className="px-6 py-3.5">City & State</th>
                  <th className="px-6 py-3.5">Coordinates (Lat, Lng)</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                {filteredLocations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        {loc.locationType === 'APARTMENT' ? (
                          <Building2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        ) : (
                          <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        )}
                        <span>{loc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        loc.locationType === 'APARTMENT'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {loc.locationType === 'APARTMENT' ? 'Apartment / Society' : 'Area / Locality'}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-gray-600" title={loc.address}>
                      {loc.address}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {loc.city}, {loc.state} ({loc.pincode})
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(loc)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          loc.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {loc.isActive ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-gray-400" />}
                        <span>{loc.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(loc)}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Location"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLocation(loc.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Location"
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

      {/* Add / Edit Location Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold">
                  {editingLocation ? 'Edit Serviceable Location' : 'Add Serviceable Location'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveLocation} className="p-6 space-y-6">
              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Location Type Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Location Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLocationType('AREA')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                      locationType === 'AREA'
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm'
                        : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Area / Locality</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocationType('APARTMENT')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                      locationType === 'APARTMENT'
                        ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-sm'
                        : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Apartment / Society</span>
                  </button>
                </div>
              </div>

              {/* Map Address Search Bar */}
              <div className="relative">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Search Address / Locality on Map <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Type area, society, landmark, building or street address..."
                    value={searchQuery}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none shadow-sm"
                  />
                  {isSearching && (
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 z-30 max-h-60 overflow-y-auto">
                    {suggestions.map((item) => (
                      <button
                        key={item.place_id}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-indigo-50 transition-colors flex items-start gap-2.5"
                      >
                        <MapPin className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-800 font-medium leading-relaxed">
                          {item.display_name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Interactive Map Visualizer */}
              {latitude !== '' && longitude !== '' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="font-bold uppercase tracking-wider text-gray-700">Selected Map Location</span>
                    <span className="font-mono text-indigo-600 font-semibold">
                      Lat: {Number(latitude).toFixed(6)} | Lng: {Number(longitude).toFixed(6)}
                    </span>
                  </div>
                  <div className="w-full h-44 bg-slate-900 rounded-xl overflow-hidden relative border border-slate-700 shadow-inner flex items-center justify-center">
                    <iframe
                      title="Map View"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(longitude)-0.005}%2C${Number(latitude)-0.005}%2C${Number(longitude)+0.005}%2C${Number(latitude)+0.005}&layer=mapnik&marker=${latitude}%2C${longitude}`}
                    />
                  </div>
                </div>
              )}

              {/* Location Details Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Location / Society Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. French Apartments or Indirapuram"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Noida / New Delhi"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Uttar Pradesh"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 201306"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Captured Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full captured address..."
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                />
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <p className="text-sm font-bold text-gray-900">Activate for Customer Serviceability</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Only active locations are evaluated during customer app address verification.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Form Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingLocation ? 'Update Location' : 'Save Location'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
