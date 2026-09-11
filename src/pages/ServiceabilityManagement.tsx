import React, { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
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
  X,
  Compass
} from 'lucide-react'
import { apiClient } from '../services/apiClient'

// Fix default Leaflet marker icon issue in Vite/Webpack build
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

declare global {
  interface Window {
    google?: any
  }
}

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

interface LocationSuggestion {
  id: string
  display_name: string
  title: string
  lat: number
  lng: number
  city: string
  state: string
  pincode: string
  suburbOrSociety?: string
}

// Custom Leaflet Map Component (Fallback)
interface LeafletMapPickerProps {
  lat: number
  lng: number
  onLocationSelect: (lat: number, lng: number) => void
}

const LeafletMapPicker: React.FC<LeafletMapPickerProps> = ({ lat, lng, onLocationSelect }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    const centerLat = lat || 28.6139
    const centerLng = lng || 77.2090

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 15,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="background-color: #4F46E5; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transform: translate(-50%, -100%);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      })

      const marker = L.marker([centerLat, centerLng], {
        draggable: true,
        icon: customIcon,
      }).addTo(map)

      marker.on('dragend', () => {
        const position = marker.getLatLng()
        onLocationSelect(position.lat, position.lng)
      })

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng)
        onLocationSelect(e.latlng.lat, e.latlng.lng)
      })

      mapInstanceRef.current = map
      markerRef.current = marker

      setTimeout(() => {
        map.invalidateSize()
      }, 250)
    } else {
      const map = mapInstanceRef.current
      const marker = markerRef.current

      map.flyTo([centerLat, centerLng], 16, { animate: true, duration: 1 })
      if (marker) {
        marker.setLatLng([centerLat, centerLng])
      }
    }
  }, [lat, lng])

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden border border-gray-300 shadow-inner bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md border border-gray-200 z-20 text-[11px] font-semibold text-gray-700 flex items-center gap-1.5">
        <Navigation className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
        <span>Click map or drag pin to select location</span>
      </div>
    </div>
  )
}

// Google Maps Interactive Picker Component
const GoogleMapPicker: React.FC<LeafletMapPickerProps> = ({ lat, lng, onLocationSelect }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [googleReady, setGoogleReady] = useState(false)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    if (window.google && window.google.maps) {
      setGoogleReady(true)
      return
    }

    const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAZr1_PfcH6Udj0Ut0Nxn2BctOMHLDzyGc'
    const scriptId = 'google-maps-js-sdk'

    const existingScript = document.getElementById(scriptId)
    if (existingScript) {
      const interval = setInterval(() => {
        if (window.google && window.google.maps) {
          setGoogleReady(true)
          clearInterval(interval)
        }
      }, 200)
      return () => clearInterval(interval)
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setGoogleReady(true)
    script.onerror = () => {
      console.warn('Google Maps script load error, falling back to Leaflet map')
      setLoadError(true)
    }
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (!googleReady || !mapContainerRef.current || !window.google?.maps) return

    const centerLat = lat || 28.6139
    const centerLng = lng || 77.2090

    if (!mapInstanceRef.current) {
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 16,
        mapTypeControl: true,
        streetViewControl: false,
        zoomControl: true,
        fullscreenControl: true,
      })

      const marker = new window.google.maps.Marker({
        position: { lat: centerLat, lng: centerLng },
        map,
        draggable: true,
        title: 'Drag or click to select location',
      })

      marker.addListener('dragend', () => {
        const pos = marker.getPosition()
        if (pos) {
          onLocationSelect(pos.lat(), pos.lng())
        }
      })

      map.addListener('click', (e: any) => {
        if (e.latLng) {
          const clickLat = e.latLng.lat()
          const clickLng = e.latLng.lng()
          marker.setPosition({ lat: clickLat, lng: clickLng })
          onLocationSelect(clickLat, clickLng)
        }
      })

      mapInstanceRef.current = map
      markerRef.current = marker
    } else {
      const map = mapInstanceRef.current
      const marker = markerRef.current
      map.setCenter({ lat: centerLat, lng: centerLng })
      if (marker) {
        marker.setPosition({ lat: centerLat, lng: centerLng })
      }
    }
  }, [googleReady, lat, lng])

  if (loadError || (!googleReady && !window.google?.maps)) {
    return <LeafletMapPicker lat={lat} lng={lng} onLocationSelect={onLocationSelect} />
  }

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden border border-gray-300 shadow-inner bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md border border-gray-200 z-20 text-[11px] font-semibold text-gray-700 flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Google Maps Active • Click map or drag pin</span>
      </div>
    </div>
  )
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
  const [latitude, setLatitude] = useState<number>(28.6139)
  const [longitude, setLongitude] = useState<number>(77.2090)
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('')
  const [pincode, setPincode] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Search Box State for Map
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)

  // Feedback Alerts
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Helper to safely parse JSON from external APIs (Photon / Nominatim) without throwing
  const safeFetchJson = async (url: string) => {
    try {
      const res = await fetch(url)
      const text = await res.text()
      return text && text.trim() ? JSON.parse(text) : {}
    } catch (e) {
      console.warn('Safe fetch JSON warning:', e)
      return {}
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<ServiceableLocation[]>('/admin/serviceable-locations')
      if (res.success && Array.isArray(res.data)) {
        setLocations(res.data)
      } else {
        // Fallback mock data if server table is initializing
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
          }
        ])
      }
    } catch (e) {
      console.warn('Error fetching locations:', e)
    } finally {
      setLoading(false)
    }
  }

  // Enhanced Multi-provider Search engine specifically indexing Indian Societies & Apartments
  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text)
    if (text.trim().length >= 2) {
      fetchSuggestions(text.trim())
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const fetchSuggestions = async (query: string) => {
    setIsSearching(true)
    try {
      const rawQuery = query.trim()
      // Sanitize filler words like "State", "district", "tehsil"
      const sanitized = rawQuery.replace(/\b(state|district|tehsil|near|opposite)\b/gi, '').trim()
      const commaParts = sanitized.split(',').map(s => s.trim()).filter(Boolean)
      const primaryName = commaParts[0] || sanitized
      const secondaryName = commaParts.slice(1).join(' ')

      const results: LocationSuggestion[] = []

      // 0. Always include custom society fallback option at top
      results.push({
        id: `custom-add-${Date.now()}`,
        title: rawQuery,
        display_name: `${rawQuery} (Click map or drag pin to select location)`,
        lat: Number(latitude) || 28.5355,
        lng: Number(longitude) || 77.3910,
        city: city || 'Noida',
        state: stateName || 'Uttar Pradesh',
        pincode: pincode || '201306',
        suburbOrSociety: rawQuery
      })

      // 1. Search existing configured DB locations
      const dbMatches = locations.filter(loc => 
        loc.name.toLowerCase().includes(primaryName.toLowerCase()) ||
        loc.address.toLowerCase().includes(primaryName.toLowerCase()) ||
        loc.city.toLowerCase().includes(primaryName.toLowerCase())
      )
      dbMatches.forEach((loc, idx) => {
        results.push({
          id: `db-${loc.id}-${idx}`,
          title: `🏷️ ${loc.name} (Configured Location)`,
          display_name: `${loc.name} - ${loc.address}`,
          lat: loc.latitude,
          lng: loc.longitude,
          city: loc.city,
          state: loc.state,
          pincode: loc.pincode,
          suburbOrSociety: loc.name
        })
      })

      // 2. Google Places Autocomplete & Geocoder API (if Google Maps API loaded)
      if (window.google?.maps?.places) {
        try {
          const autocompleteService = new window.google.maps.places.AutocompleteService()
          autocompleteService.getPlacePredictions(
            {
              input: primaryName,
              componentRestrictions: { country: 'in' },
            },
            (predictions: any, status: any) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && Array.isArray(predictions)) {
                const geocoder = new window.google.maps.Geocoder()
                predictions.slice(0, 5).forEach((pred: any) => {
                  geocoder.geocode({ placeId: pred.place_id }, (geoResults: any, geoStatus: any) => {
                    if (geoStatus === 'OK' && geoResults && geoResults[0]) {
                      const item = geoResults[0]
                      const lat = item.geometry.location.lat()
                      const lng = item.geometry.location.lng()
                      const title = pred.structured_formatting?.main_text || pred.description.split(',')[0]

                      let c = 'Noida'
                      let s = 'Uttar Pradesh'
                      let p = ''

                      item.address_components?.forEach((comp: any) => {
                        if (comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')) c = comp.long_name
                        if (comp.types.includes('administrative_area_level_1')) s = comp.long_name
                        if (comp.types.includes('postal_code')) p = comp.long_name
                      })

                      const isDup = results.some(r => Math.abs(r.lat - lat) < 0.0003 && Math.abs(r.lng - lng) < 0.0003)
                      if (!isDup) {
                        results.push({
                          id: `google-${pred.place_id}`,
                          title: `⚡ ${title} (Google Maps)`,
                          display_name: pred.description,
                          lat,
                          lng,
                          city: c,
                          state: s,
                          pincode: p,
                          suburbOrSociety: title
                        })
                        setSuggestions([...results])
                      }
                    }
                  })
                })
              }
            }
          )
        } catch (e) {
          console.warn('Google Places Autocomplete warning:', e)
        }
      }

      // 3. Esri ArcGIS World Geocode API (100% Indian society & POI coverage)
      const arcgisUrl = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?singleLine=${encodeURIComponent(rawQuery)}&countryCode=IND&maxLocations=10&f=json&outFields=*`
      const photonPrimaryUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(primaryName)}&limit=10&lat=28.5355&lon=77.3910&bbox=68.1,6.5,97.4,35.5`
      const photonFullUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(sanitized)}&limit=10&lat=28.5355&lon=77.3910&bbox=68.1,6.5,97.4,35.5`

      const [arcgisData, photonPrimaryData, photonFullData] = await Promise.all([
        safeFetchJson(arcgisUrl),
        safeFetchJson(photonPrimaryUrl),
        safeFetchJson(photonFullUrl),
      ])

      if (arcgisData && Array.isArray(arcgisData.candidates)) {
        arcgisData.candidates.forEach((cand: any, idx: number) => {
          const attr = cand.attributes || {}
          const loc = cand.location || {}
          if (loc.x && loc.y) {
            const lat = loc.y
            const lng = loc.x
            const title = attr.ShortLabel || attr.PlaceName || cand.address.split(',')[0]
            const display = attr.LongLabel || cand.address
            const c = attr.City || attr.MetroArea || attr.Subregion || 'Noida'
            const s = attr.Region || 'Uttar Pradesh'
            const p = attr.Postal || ''

            const isDuplicate = results.some(r => Math.abs(r.lat - lat) < 0.0003 && Math.abs(r.lng - lng) < 0.0003)
            if (!isDuplicate) {
              results.push({
                id: `arcgis-${idx}-${Math.random()}`,
                title: `🏢 ${title}`,
                display_name: display,
                lat,
                lng,
                city: c,
                state: s,
                pincode: p,
                suburbOrSociety: title
              })
            }
          }
        })
      }

      // Helper to process Photon features
      const processPhotonFeatures = (data: any) => {
        if (data && Array.isArray(data.features)) {
          data.features.forEach((feat: any, idx: number) => {
            const props = feat.properties || {}
            const coords = feat.geometry?.coordinates || []
            if (coords.length === 2) {
              const lon = coords[0]
              const lat = coords[1]
              const title = props.name || props.street || primaryName
              const city = props.city || props.district || props.county || props.state || 'Noida'
              const state = props.state || 'Uttar Pradesh'
              const pincode = props.postcode || ''
              const parts = [props.name, props.street, props.district, props.city, props.state, props.country].filter(Boolean)

              const isDuplicate = results.some(r => Math.abs(r.lat - lat) < 0.0003 && Math.abs(r.lng - lon) < 0.0003)
              if (!isDuplicate) {
                results.push({
                  id: `photon-${idx}-${props.osm_id || idx}-${Math.random()}`,
                  title,
                  display_name: parts.join(', '),
                  lat,
                  lng: lon,
                  city,
                  state,
                  pincode,
                  suburbOrSociety: props.name
                })
              }
            }
          })
        }
      }

      processPhotonFeatures(photonPrimaryData)
      processPhotonFeatures(photonFullData)

      // Helper to process Nominatim features
      const processNomData = (data: any) => {
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            const lat = parseFloat(item.lat)
            const lon = parseFloat(item.lon)
            const addr = item.address || {}
            const title = item.display_name.split(',')[0]
            const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || 'Noida'
            const state = addr.state || 'Uttar Pradesh'
            const pincode = addr.postcode || ''

            const isDuplicate = results.some(r => Math.abs(r.lat - lat) < 0.0003 && Math.abs(r.lng - lon) < 0.0003)
            if (!isDuplicate) {
              results.push({
                id: `nom-${item.place_id}-${Math.random()}`,
                title,
                display_name: item.display_name,
                lat,
                lng: lon,
                city,
                state,
                pincode,
                suburbOrSociety: title
              })
            }
          })
        }
      }

      processNomData(nomPrimaryData)
      processNomData(nomSanitizedData)

      setSuggestions(results)
      setShowSuggestions(true)
    } catch (e) {
      console.warn('Search suggestions error:', e)
    } finally {
      setIsSearching(false)
    }
  }

  // Reverse Geocode when Admin clicks or drags marker pin on map
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true)

    // 1. Try Google Maps Geocoder if loaded
    if (window.google?.maps) {
      try {
        const geocoder = new window.google.maps.Geocoder()
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            const item = results[0]
            setAddress(item.formatted_address)
            setSearchQuery(item.formatted_address)

            let c = ''
            let s = ''
            let p = ''

            item.address_components?.forEach((comp: any) => {
              if (comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')) c = comp.long_name
              if (comp.types.includes('administrative_area_level_1')) s = comp.long_name
              if (comp.types.includes('postal_code')) p = comp.long_name
            })

            if (c) setCity(c)
            if (s) setStateName(s)
            if (p) setPincode(p)

            const mainTitle = item.formatted_address.split(',')[0]
            if (!locationName) setLocationName(mainTitle)
          }
        })
      } catch (e) {
        console.warn('Google Reverse Geocode warning:', e)
      }
    }

    try {
      const data = await safeFetchJson(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      if (data && data.display_name) {
        setAddress(data.display_name)
        setSearchQuery(data.display_name)

        const addr = data.address || {}
        const c = addr.city || addr.town || addr.village || addr.suburb || addr.district || 'New Delhi'
        const s = addr.state || 'Delhi'
        const p = addr.postcode || ''

        if (c) setCity(c)
        if (s) setStateName(s)
        if (p) setPincode(p)

        const mainTitle = data.display_name.split(',')[0]
        if (!locationName) {
          setLocationName(mainTitle)
        }
      }
    } catch (e) {
      console.warn('Reverse geocode error:', e)
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleSelectSuggestion = (item: LocationSuggestion) => {
    setShowSuggestions(false)
    setSearchQuery(item.display_name)
    setAddress(item.display_name)
    setLatitude(item.lat)
    setLongitude(item.lng)
    setCity(item.city)
    setStateName(item.state)
    setPincode(item.pincode)

    if (!locationName || locationName === 'New Location') {
      setLocationName(item.title)
    }
  }

  const handleMapPinSelected = (newLat: number, newLng: number) => {
    setLatitude(newLat)
    setLongitude(newLng)
    reverseGeocode(newLat, newLng)
  }

  const handleOpenAddModal = () => {
    setEditingLocation(null)
    setLocationName('')
    setLocationType('AREA')
    setAddress('Connaught Place, New Delhi, Delhi 110001')
    setLatitude(28.6139)
    setLongitude(77.2090)
    setCity('New Delhi')
    setStateName('Delhi')
    setPincode('110001')
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

    if (!locationName.trim()) {
      setErrorMsg('Please enter a location or apartment name.')
      return
    }
    if (!address.trim() || !latitude || !longitude) {
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
      const res = editingLocation
        ? await apiClient.put<ServiceableLocation>(`/admin/serviceable-locations/${editingLocation.id}`, payload)
        : await apiClient.post<ServiceableLocation>('/admin/serviceable-locations', payload)

      if (!res.success) {
        setErrorMsg(res.error?.message || 'Failed to save location.')
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
    try {
      const res = await apiClient.put<ServiceableLocation>(`/admin/serviceable-locations/${loc.id}`, { isActive: !loc.isActive })
      if (res.success) {
        setLocations(prev =>
          prev.map(l => (l.id === loc.id ? { ...l, isActive: !l.isActive } : l))
        )
      } else {
        alert(res.error?.message || 'Failed to update status')
      }
    } catch (e) {
      console.warn('Error toggling status:', e)
    }
  }

  const handleDeleteLocation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this serviceable location?')) return

    try {
      const res = await apiClient.delete(`/admin/serviceable-locations/${id}`)
      if (res.success) {
        setLocations(prev => prev.filter(l => l.id !== id))
      } else {
        alert(res.error?.message || 'Failed to delete location')
      }
    } catch (e) {
      console.warn('Error deleting location:', e)
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
          <p className="text-sm text-gray-500 mt-1">
            Search, pin, and configure serviceable areas and apartment societies in India where GYORS service is available.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Serviceable Location</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by area, apartment, society name, or city..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Types</option>
            <option value="AREA">Areas / Localities</option>
            <option value="APARTMENT">Apartments / Societies</option>
          </select>

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
                  <th className="px-6 py-3.5">Location / Society</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">City / Pincode</th>
                  <th className="px-6 py-3.5">Coordinates</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredLocations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${loc.locationType === 'APARTMENT' ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'}`}>
                          {loc.locationType === 'APARTMENT' ? <Building2 className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{loc.name}</div>
                          <div className="text-xs text-gray-500 max-w-xs truncate">{loc.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        loc.locationType === 'APARTMENT' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {loc.locationType === 'APARTMENT' ? 'Apartment/Society' : 'Area/Locality'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{loc.city}</div>
                      <div className="text-xs text-gray-500">{loc.pincode || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      <div>Lat: {loc.latitude.toFixed(5)}</div>
                      <div>Lng: {loc.longitude.toFixed(5)}</div>
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

      {/* Add / Edit Serviceable Location Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 border border-gray-100 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900">
                  {editingLocation ? 'Edit Serviceable Location' : 'Add New Serviceable Location'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200/60 transition-colors"
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
                  Search Society / Apartment / Area in India <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Type society (e.g. French Apartments, Gaur City, DLF Cyber City, Hiranandani)..."
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
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-indigo-50 transition-colors flex items-start gap-2.5"
                      >
                        <Building2 className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-gray-900">{item.title}</div>
                          <div className="text-[11px] text-gray-500 leading-tight mt-0.5">{item.display_name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Interactive Leaflet Map Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    Interactive Map Pin Placement
                    {isGeocoding && <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />}
                  </span>
                  <span className="font-mono text-indigo-600 font-semibold">
                    Lat: {Number(latitude).toFixed(5)} | Lng: {Number(longitude).toFixed(5)}
                  </span>
                </div>

                <GoogleMapPicker
                  lat={Number(latitude)}
                  lng={Number(longitude)}
                  onLocationSelect={handleMapPinSelected}
                />
              </div>

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

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Captured Address
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Address automatically captured from map pin placement..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none"
                />
              </div>

              {/* Active / Inactive Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <div className="text-sm font-bold text-gray-900">Service Availability Status</div>
                  <div className="text-xs text-gray-500">Active locations allow customer bookings in this zone.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isActive ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-gray-700 font-semibold text-sm hover:bg-gray-100 rounded-lg transition-colors"
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
