import { useState, useMemo } from 'react'
import { MapPin, Navigation, Star, ArrowRight, ShieldCheck, Filter, ArrowUpDown, Compass, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { getFullCatalog, CatalogItem, calculateDistanceKm, getCategoryFallback } from '../lib/catalog'

interface Props {
  onNavigate: (screen: string) => void
  onSelectEquipment?: (item: CatalogItem) => void
}

interface RegionalHub {
  id: string
  name: string
  nameTa: string
  lat: number
  lng: number
}

const REGIONAL_HUBS: RegionalHub[] = [
  { id: 'coimbatore', name: 'Coimbatore & Pollachi', nameTa: 'கோயம்புத்தூர் & பொள்ளாச்சி', lat: 10.998, lng: 76.96 },
  { id: 'madurai', name: 'Madurai & Usilampatti', nameTa: 'மதுரை & உசிலம்பட்டி', lat: 9.9252, lng: 78.1198 },
  { id: 'thanjavur', name: 'Thanjavur & Delta Region', nameTa: 'தஞ்சாவூர் & டெல்டா மண்டலம்', lat: 10.787, lng: 79.1378 },
  { id: 'salem', name: 'Salem & Omalur', nameTa: 'சேலம் & ஓமலூர்', lat: 11.6643, lng: 78.146 },
  { id: 'trichy', name: 'Tiruchirappalli', nameTa: 'திருச்சிராப்பள்ளி', lat: 10.7905, lng: 78.7047 },
  { id: 'ludhiana', name: 'Ludhiana, Punjab', nameTa: 'லூதியானா, பஞ்சாப்', lat: 30.901, lng: 75.8573 },
]

export default function NearbyEquipment({ onNavigate, onSelectEquipment }: Props) {
  const { isTamil } = useLanguage()

  // Location State (Privacy-first: only on request, no continuous background tracking)
  const [currentCoord, setCurrentCoord] = useState<{ lat: number; lng: number }>({
    lat: REGIONAL_HUBS[0]?.lat ?? 10.998,
    lng: REGIONAL_HUBS[0]?.lng ?? 76.96,
  })
  const [selectedHubId, setSelectedHubId] = useState<string>('coimbatore')
  const [isLocating, setIsLocating] = useState(false)
  const [locationStatus, setLocationStatus] = useState<{
    type: 'default' | 'gps' | 'denied'
    message: string
  }>({
    type: 'default',
    message: isTamil
      ? 'இயல்புநிலை பண்ணை இருப்பிடம்: கோயம்புத்தூர் / பொள்ளாச்சி மண்டலம்'
      : 'Default Location: Coimbatore & Pollachi Hub',
  })

  // Filter & Sort State
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'nearest' | 'price_asc' | 'price_desc' | 'available'>('nearest')

  const categories = [
    { id: 'All', labelEn: 'All Equipment', labelTa: 'அனைத்தும்' },
    { id: 'Tractor', labelEn: 'Tractors', labelTa: 'டிராக்டர்கள்' },
    { id: 'Harvester', labelEn: 'Harvesters', labelTa: 'அறுவடை இயந்திரங்கள்' },
    { id: 'Rotavator', labelEn: 'Ploughing / Tillage', labelTa: 'உழவு கருவிகள்' },
    { id: 'Seeder', labelEn: 'Seeding', labelTa: 'விதைப்பு' },
    { id: 'Water Sprayer', labelEn: 'Sprayers & Drones', labelTa: 'தெளிப்பான்கள் & ட்ரோன்கள்' },
    { id: 'Water Pump', labelEn: 'Water Pumps', labelTa: 'நீரேற்றி' },
  ]

  // Geolocation Handler with Graceful Fallback
  const handleRequestLiveLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationStatus({
        type: 'denied',
        message: isTamil
          ? 'உங்கள் உலாவியில் புவிஇருப்பிடம் வசதி இல்லை. கீழே உள்ள மண்டலத்தை தேர்ந்தெடுக்கவும்.'
          : 'Geolocation not supported by this browser. Using selected regional hub.',
      })
      return
    }

    setIsLocating(true)
    setLocationStatus({
      type: 'default',
      message: isTamil ? 'இருப்பிடத்தை தேடுகிறது...' : 'Requesting one-time location permission...',
    })

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false)
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setCurrentCoord({ lat, lng })
        setLocationStatus({
          type: 'gps',
          message: isTamil
            ? `📍 நேரடி ஜி.பி.எஸ் இருப்பிடம் கண்டறியப்பட்டது (${lat.toFixed(3)}° N, ${lng.toFixed(3)}° E)`
            : `📍 GPS Live Location active (${lat.toFixed(3)}° N, ${lng.toFixed(3)}° E) • Calculating true distance`,
        })
      },
      (err) => {
        setIsLocating(false)
        console.warn('Geolocation prompt response:', err.message)
        setLocationStatus({
          type: 'denied',
          message: isTamil
            ? 'இருப்பிட அனுமதி மறுக்கப்பட்டது அல்லது கிடைக்கவில்லை. இயல்பு மண்டலம் பயன்படுத்தப்படுகிறது.'
            : 'Location permission was denied. Fallback regional selector is active.',
        })
      },
      { timeout: 8000, enableHighAccuracy: false, maximumAge: 60000 }
    )
  }

  // Handle Hub Selection
  const handleHubChange = (hubId: string) => {
    setSelectedHubId(hubId)
    const hub = REGIONAL_HUBS.find((h) => h.id === hubId)
    if (hub) {
      setCurrentCoord({ lat: hub.lat, lng: hub.lng })
      setLocationStatus({
        type: 'default',
        message: isTamil
          ? `மண்டலம் மாற்றப்பட்டது: ${hub.nameTa}`
          : `Switched to regional hub: ${hub.name}`,
      })
    }
  }

  // Catalog Processing with Dynamic Distance
  const catalogList = getFullCatalog()

  const nearbyItems = useMemo(() => {
    return catalogList.map((item) => {
      const dist = calculateDistanceKm(currentCoord.lat, currentCoord.lng, item.lat ?? 10.998, item.lng ?? 76.96)
      return {
        ...item,
        computedDistance: dist,
        distanceDisplay: `${dist.toFixed(1)} km`,
      }
    })
  }, [catalogList, currentCoord])

  // Filter & Sort
  const processedItems = useMemo(() => {
    return nearbyItems
      .filter((item) => {
        if (selectedCategory === 'All') return true
        if (selectedCategory === 'Rotavator') {
          return item.cat === 'Rotavator' || item.cat === 'Cultivator' || item.name.toLowerCase().includes('plough')
        }
        if (selectedCategory === 'Water Sprayer') {
          return item.cat === 'Water Sprayer' || item.name.toLowerCase().includes('drone') || item.name.toLowerCase().includes('sprayer')
        }
        return item.cat === selectedCategory
      })
      .sort((a, b) => {
        if (sortBy === 'nearest') return a.computedDistance - b.computedDistance
        if (sortBy === 'price_asc') return (a.dailyRate || 0) - (b.dailyRate || 0)
        if (sortBy === 'price_desc') return (b.dailyRate || 0) - (a.dailyRate || 0)
        if (sortBy === 'available') return (b.avail ? 1 : 0) - (a.avail ? 1 : 0)
        return 0
      })
  }, [nearbyItems, selectedCategory, sortBy])

  const handleSelect = (item: CatalogItem, destination: 'equipment-details' | 'booking') => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('agrirent_selected_equipment_id', item.id)
      const url = new URL(window.location.href)
      url.searchParams.set('id', item.id)
      window.history.replaceState({}, '', url.toString())
    }
    if (onSelectEquipment) onSelectEquipment(item)
    onNavigate(destination)
  }

  return (
    <section
      className="nearby-equipment-section"
      style={{
        padding: '52px 0',
        background: '#F9FAFB',
        borderTop: '1px solid #E5E7EB',
        borderBottom: '1px solid #E5E7EB',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Header Block */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 24,
            gap: 20,
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#E8F5E9',
                color: '#2E7D32',
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              <Navigation size={13} />
              <span>{isTamil ? 'புவிசார் இருப்பிடம் & அருகாமை' : 'GPS Proximity & Dispatch'}</span>
            </div>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: '#111827',
                margin: 0,
                letterSpacing: '-0.5px',
              }}
            >
              {isTamil ? 'அருகிலுள்ள விவசாய இயந்திரங்கள்' : 'Nearby Available Equipment'}
            </h2>
            <p style={{ color: '#6B7280', fontSize: 14, margin: '6px 0 0' }}>
              {isTamil
                ? 'உங்கள் நிலத்திற்கு அருகாமையில் இருக்கும் உபகரணங்கள் மற்றும் விரைவு விநியோக தூரம்.'
                : 'Machinery located nearest to your farm, sorted by direct dispatch distance.'}
            </p>
          </div>

          {/* Location Controls & Geolocation Button */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: 16,
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {/* Live Geolocation Button */}
              <button
                type="button"
                onClick={handleRequestLiveLocation}
                disabled={isLocating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: locationStatus.type === 'gps' ? '#15803D' : '#2E7D32',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: isLocating ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                <Compass size={14} className={isLocating ? 'animate-spin' : ''} />
                <span>
                  {isLocating
                    ? isTamil ? 'இருப்பிடம் தேடுகிறது...' : 'Locating...'
                    : isTamil ? '📍 நேரடி இருப்பிடத்தைப் பயன்படுத்துக' : '📍 Use My Live Location'}
                </span>
              </button>

              <span style={{ fontSize: 12, color: '#9CA3AF' }}>{isTamil ? 'அல்லது மண்டலம்:' : 'or Regional Hub:'}</span>

              {/* Fallback Regional Selector */}
              <select
                value={selectedHubId}
                onChange={(e) => handleHubChange(e.target.value)}
                style={{
                  background: '#F9FAFB',
                  border: '1px solid #D1D5DB',
                  borderRadius: 8,
                  padding: '7px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#111827',
                  cursor: 'pointer',
                }}
              >
                {REGIONAL_HUBS.map((hub) => (
                  <option key={hub.id} value={hub.id}>
                    {isTamil ? hub.nameTa : hub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Geolocation Status Message */}
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: locationStatus.type === 'denied' ? '#DC2626' : locationStatus.type === 'gps' ? '#15803D' : '#6B7280',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {locationStatus.type === 'gps' && <CheckCircle2 size={12} />}
              <span>{locationStatus.message}</span>
            </div>
          </div>
        </div>

        {/* Filter and Sort Toolbar */}
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: '14px 18px',
            border: '1px solid #E5E7EB',
            marginBottom: 24,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
          }}
        >
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginRight: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Filter size={13} />
              <span>{isTamil ? 'வகை:' : 'Category:'}</span>
            </span>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  border: selectedCategory === c.id ? '1.5px solid #2E7D32' : '1px solid #E5E7EB',
                  background: selectedCategory === c.id ? '#E8F5E9' : '#fff',
                  color: selectedCategory === c.id ? '#2E7D32' : '#4B5563',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {isTamil ? c.labelTa : c.labelEn}
              </button>
            ))}
          </div>

          {/* Sorting Options */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowUpDown size={13} />
              <span>{isTamil ? 'வரிசைப்படுத்து:' : 'Sort By:'}</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                background: '#F9FAFB',
                border: '1px solid #D1D5DB',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                color: '#111827',
                cursor: 'pointer',
              }}
            >
              <option value="nearest">{isTamil ? 'மிக அருகில் (Nearest)' : 'Nearest Distance'}</option>
              <option value="price_asc">{isTamil ? 'வாடகை: குறைந்தது முதல்' : 'Price: Low to High'}</option>
              <option value="price_desc">{isTamil ? 'வாடகை: அதிகம் முதல்' : 'Price: High to Low'}</option>
              <option value="available">{isTamil ? 'கிடைக்கும் கருவிகள் முதலில்' : 'Availability First'}</option>
            </select>
          </div>
        </div>

        {/* Results Count & Privacy Notice */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            fontSize: 12,
            color: '#6B7280',
          }}
        >
          <span>
            {isTamil
              ? `${processedItems.length} உபகரணங்கள் கிடைக்கின்றன`
              : `Showing ${processedItems.length} machines near selected location`}
          </span>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>
            🔒 {isTamil ? 'தனியுரிமை பாதுகாப்பு: உங்கள் இருப்பிடம் உலாவி அளவில் மட்டுமே பயன்படுத்தப்படுகிறது.' : 'Privacy Safe: Location calculated in-browser only.'}
          </span>
        </div>

        {/* Grid of Equipment Cards */}
        {processedItems.length === 0 ? (
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: '48px 24px',
              textAlign: 'center',
              border: '1px solid #E5E7EB',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>🚜</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>
              {isTamil ? 'இயந்திரங்கள் ஏதும் கிடைக்கவில்லை' : 'No machinery found for this category'}
            </h3>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 6 }}>
              {isTamil ? 'வேறு வகையை அல்லது அருகில் உள்ள மண்டலத்தை தேர்ந்தெடுக்கவும்.' : 'Try choosing "All Equipment" or select a nearby regional hub.'}
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              style={{
                marginTop: 14,
                padding: '8px 18px',
                background: '#2E7D32',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Show All Equipment
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: 22,
            }}
          >
            {processedItems.map((item) => (
              <div
                key={item.id}
                className="card-shadow card-shadow-hover"
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  border: '1px solid #F3F4F6',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {/* Photo & Status Overlay */}
                <div style={{ position: 'relative', height: 180, background: '#F3F4F6' }}>
                  <img
                    src={item.imageUrl || item.img}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src = getCategoryFallback(item.category || item.cat)
                    }}
                  />

                  {/* Calculated Dynamic Distance Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      background: 'rgba(17, 24, 39, 0.88)',
                      color: '#fff',
                      backdropFilter: 'blur(4px)',
                      borderRadius: 14,
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <MapPin size={12} style={{ color: '#4ADE80' }} />
                    <span>{item.distanceDisplay} {isTamil ? 'தொலைவில்' : 'away'}</span>
                  </div>

                  {/* Availability Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      left: 10,
                      background: item.avail ? 'rgba(232, 245, 233, 0.95)' : 'rgba(243, 244, 246, 0.95)',
                      color: item.avail ? '#2E7D32' : '#6B7280',
                      borderRadius: 10,
                      padding: '3px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                      border: item.avail ? '1px solid #C8E6C9' : '1px solid #E5E7EB',
                    }}
                  >
                    {item.avail
                      ? isTamil ? '● கிடைக்கிறது' : '● Available Now'
                      : isTamil ? '● முன்பதிவானது' : '● Booked'}
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#2E7D32',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {item.category || item.cat}
                    </span>
                    {item.brand && (
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                        {item.brand}
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#111827',
                      margin: '0 0 6px',
                      lineHeight: 1.3,
                    }}
                  >
                    {item.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <Star size={13} style={{ fill: '#F59E0B', color: '#F59E0B' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{item.rating}</span>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>({item.reviews})</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6B7280' }}>
                      📍 {item.location}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: '#4B5563', marginBottom: 14 }}>
                    👤 {isTamil ? 'உரிமையாளர்' : 'Owner'}: <strong>{item.owner || 'Verified Partner'}</strong>
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: 12,
                      borderTop: '1px solid #F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#2E7D32' }}>{item.price}</span>
                      <small style={{ fontSize: 11, color: '#6B7280' }}>{item.unit}</small>
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => handleSelect(item, 'equipment-details')}
                        style={{
                          padding: '6px 12px',
                          background: '#F3F4F6',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: '#374151',
                        }}
                      >
                        {isTamil ? 'விவரங்கள்' : 'Details'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelect(item, 'booking')}
                        style={{
                          padding: '6px 14px',
                          background: '#2E7D32',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span>{isTamil ? 'முன்பதிவு' : 'Book'}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
