import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, LoaderCircle, MapPin, Navigation, Search, SlidersHorizontal, Star } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { api } from '../lib/api-client'
import {
  calculateDistanceKm,
  categoryNames,
  CatalogItem,
  getCategoryFallback,
  getFullCatalog,
  tamilNaduDistrictCoordinates,
  tamilNaduDistricts,
} from '../lib/catalog'
import NearbyEquipmentMap, { type NearbyMapItem } from './NearbyEquipmentMap'

type Purpose = 'all' | 'rent' | 'buy' | 'both'
type SortOption = 'nearest' | 'rating' | 'rent-price' | 'buy-price'
type Coordinates = { lat: number; lng: number }

interface ListingApiRecord {
  id: string
  name: string
  nameTa?: string | undefined
  category?: string | undefined
  brand?: string | undefined
  model?: string | undefined
  description?: string | undefined
  imageUrl?: string | undefined
  img?: string | undefined
  location?: string | undefined
  lat?: number | undefined
  lng?: number | undefined
  pricePerDay?: number | undefined
  rating?: number | undefined
  reviews?: number | undefined
  available?: boolean | undefined
  availabilityType?: 'rent' | 'buy' | 'both' | undefined
  purchasePrice?: number | undefined
  vendorId?: string | undefined
  vendorName?: string | undefined
  ownerId?: string | undefined
  ownerName?: string | undefined
  ownerPhone?: string | undefined
  securityDeposit?: number | undefined
  specs?: CatalogItem['specs'] | undefined
}

interface VendorApiRecord {
  id: string
  name: string
  address: string
  city: string
  lat: number
  lng: number
}

function normalizeDistrict(location: string): string {
  const normalized = location
    .split(',')
    .map((part) => part.trim())
    .find((part) => part && part.toLowerCase() !== 'tamil nadu')
  if (!normalized) return ''
  const alias = normalized.toLowerCase() === 'villupuram' ? 'Viluppuram' : normalized
  return tamilNaduDistricts.find((district) => district.toLowerCase() === alias.toLowerCase()) || ''
}

function mapServerListing(
  record: ListingApiRecord,
  vendors: Map<string, VendorApiRecord>,
  catalog: CatalogItem[],
): CatalogItem {
  const base = catalog.find((item) => item.id === record.id)
  const vendor = record.vendorId ? vendors.get(record.vendorId) : undefined
  const image = record.imageUrl || record.img || base?.imageUrl || base?.img || ''
  const dailyRate = Number(record.pricePerDay ?? base?.dailyRate ?? 0)
  const location = record.location || base?.location || vendor?.address || vendor?.city || 'Tamil Nadu'
  const lat = typeof record.lat === 'number' ? record.lat : vendor?.lat ?? base?.lat
  const lng = typeof record.lng === 'number' ? record.lng : vendor?.lng ?? base?.lng
  const category = record.category || base?.category || base?.cat || 'Equipment'

  return {
    id: record.id,
    name: record.name || base?.name || 'Agricultural equipment',
    nameTa: record.nameTa || base?.nameTa || record.name,
    category,
    cat: category,
    brand: record.brand || base?.brand || '',
    model: record.model || base?.model || record.name,
    description: record.description || base?.description || '',
    descriptionTa: base?.descriptionTa || record.description || '',
    imageUrl: image,
    img: image,
    gallery: base?.gallery || [image],
    price: dailyRate ? `₹${dailyRate.toLocaleString('en-IN')}/day` : 'Price unavailable',
    dailyRate,
    unit: '/day',
    location,
    lat,
    lng,
    rating: Number(record.rating ?? base?.rating ?? 0),
    reviews: Number(record.reviews ?? base?.reviews ?? 0),
    avail: record.available !== false,
    availabilityType: record.availabilityType || base?.availabilityType || 'rent',
    purchasePrice: record.purchasePrice ?? base?.purchasePrice,
    vendorId: record.vendorId || base?.vendorId,
    vendorName: record.vendorName || vendor?.name || base?.vendorName,
    owner: record.ownerName || base?.owner || vendor?.name || 'Equipment provider',
    ownerId: record.ownerId || base?.ownerId || '',
    ownerPhone: record.ownerPhone || base?.ownerPhone || '',
    specs: record.specs || base?.specs || [],
    features: base?.features || [],
    securityDeposit: record.securityDeposit ?? base?.securityDeposit,
  }
}

function money(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`
}

function formatDistance(distanceKm: number): string {
  return distanceKm < 1
    ? `${Math.round(distanceKm * 1000)} m away`
    : `${distanceKm.toFixed(1)} km away`
}

interface Props {
  onNavigate: (screen: string) => void
}

export default function NearbyEquipment({ onNavigate }: Props) {
  const { isTamil } = useLanguage()
  const [equipment, setEquipment] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [vendorError, setVendorError] = useState('')
  const [district, setDistrict] = useState('')
  const [category, setCategory] = useState('All')
  const [purpose, setPurpose] = useState<Purpose>('all')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [minimumRating, setMinimumRating] = useState(0)
  const [sortBy, setSortBy] = useState<SortOption>('nearest')
  const [equipmentQuery, setEquipmentQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null)
  const [locating, setLocating] = useState(false)
  const [locationMessage, setLocationMessage] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setLoadError('')
      let vendorRecords: VendorApiRecord[] = []
      try {
        const vendorResponse = await api.getVendors()
        vendorRecords = vendorResponse.vendors
      } catch (error: unknown) {
        console.error('Failed to load vendors for nearby equipment', error)
        if (mounted) setVendorError(isTamil
          ? 'விற்பனையாளர் விவரங்களை ஏற்ற முடியவில்லை.'
          : 'Vendor details could not be loaded; listing information is still shown.')
      }

      try {
        const listingResponse = await api.getListings()
        if (!mounted) return
        const vendorMap = new Map(vendorRecords.map((vendor) => [vendor.id, vendor]))
        const referenceCatalog = getFullCatalog()
        const rows = listingResponse.listings as ListingApiRecord[]
        setEquipment(rows.map((record) => mapServerListing(record, vendorMap, referenceCatalog)))
      } catch (error: unknown) {
        console.error('Failed to load equipment for nearby search', error)
        if (mounted) {
          setLoadError(isTamil
            ? 'உபகரணங்களை ஏற்ற முடியவில்லை. இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.'
            : 'Could not load equipment. Check your connection and try again.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [isTamil])

  const districtCenter = (district ? tamilNaduDistrictCoordinates[district] : undefined) || { lat: 10.7, lng: 78.5 }
  const origin = currentLocation || (district ? districtCenter : null)

  const results = useMemo<NearbyMapItem[]>(() => {
    const query = searchQuery.trim().toLowerCase()
    return equipment
      .map((item) => {
        const itemDistrict = normalizeDistrict(item.location)
        const hasCoordinates = typeof item.lat === 'number' && typeof item.lng === 'number'
        const distanceKm = currentLocation && hasCoordinates
          ? calculateDistanceKm(currentLocation.lat, currentLocation.lng, item.lat!, item.lng!)
          : null
        return { item, district: itemDistrict || item.location, distanceKm }
      })
      .filter(({ item, district: itemDistrict }) => {
        if (district && itemDistrict.toLowerCase() !== district.toLowerCase()) return false
        if (category !== 'All' && item.category.toLowerCase() !== category.toLowerCase()) return false
        if (query && !`${item.name} ${item.brand} ${item.model} ${item.vendorName || item.owner}`.toLowerCase().includes(query)) return false
        if (availableOnly && !item.avail) return false
        if (item.rating < minimumRating) return false
        if (purpose === 'rent' && item.availabilityType === 'buy') return false
        if (purpose === 'buy' && (!item.purchasePrice || item.availabilityType === 'rent')) return false
        if (purpose === 'both' && item.availabilityType !== 'both') return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.item.rating - a.item.rating
        if (sortBy === 'rent-price') return a.item.dailyRate - b.item.dailyRate
        if (sortBy === 'buy-price') return (a.item.purchasePrice || Infinity) - (b.item.purchasePrice || Infinity)
        if (!origin) return 0
        const aDistance = a.distanceKm ?? (typeof a.item.lat === 'number' && typeof a.item.lng === 'number'
          ? calculateDistanceKm(origin.lat, origin.lng, a.item.lat, a.item.lng)
          : Infinity)
        const bDistance = b.distanceKm ?? (typeof b.item.lat === 'number' && typeof b.item.lng === 'number'
          ? calculateDistanceKm(origin.lat, origin.lng, b.item.lat, b.item.lng)
          : Infinity)
        return aDistance - bDistance
      })
  }, [availableOnly, category, currentLocation, district, equipment, minimumRating, origin, purpose, searchQuery, sortBy])

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage(isTamil
        ? 'இந்த உலாவியில் இருப்பிட வசதி இல்லை. மாவட்டத்தைத் தேர்ந்தெடுத்து தேடவும்.'
        : 'Location is unavailable in this browser. Select a district to search.')
      return
    }
    setLocating(true)
    setLocationMessage(isTamil ? 'உங்கள் இருப்பிடத்தைக் கண்டறிகிறது...' : 'Finding your location...')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCurrentLocation({ lat: coords.latitude, lng: coords.longitude })
        setLocating(false)
        setLocationMessage(isTamil
          ? 'இருப்பிடம் இந்த தேடலுக்கு மட்டும் பயன்படுத்தப்படுகிறது; சேமிக்கப்படவில்லை.'
          : 'Your location is used for this search only and is not saved.')
      },
      (error) => {
        setCurrentLocation(null)
        setLocating(false)
        setLocationMessage(error.code === error.PERMISSION_DENIED
          ? (isTamil
            ? 'இருப்பிட அனுமதி மறுக்கப்பட்டது. உபகரணங்களைக் கண்டறிய மாவட்டத்தைத் தேர்ந்தெடுக்கவும்.'
            : 'Location access was denied. Select a district to find equipment.')
          : (isTamil
            ? 'இருப்பிடத்தைக் கண்டறிய முடியவில்லை. மாவட்டத்தைத் தேர்ந்தெடுத்து தேடவும்.'
            : 'Could not determine your location. Select a district to search.'))
      },
      { timeout: 10000, enableHighAccuracy: false, maximumAge: 0 },
    )
  }

  const handleSelect = (item: CatalogItem, destination: 'equipment-details' | 'booking') => {
    window.localStorage.setItem('agrirent_selected_equipment_id', item.id)
    const url = new URL(window.location.href)
    url.searchParams.set('id', item.id)
    window.history.replaceState(window.history.state, '', url)
    onNavigate(destination)
  }

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSearchQuery(equipmentQuery)
  }

  return (
    <section id="nearby-equipment" className="nearby-equipment-section">
      <div className="nearby-equipment-inner">
        <header className="nearby-equipment-header">
          <div>
            <span className="nearby-eyebrow"><Navigation size={14} /> {isTamil ? 'உள்ளூர் உபகரண தேடல்' : 'Local equipment discovery'}</span>
            <h2>{isTamil ? 'அருகிலுள்ள உபகரணங்களைக் கண்டறியவும்' : 'Find Equipment Near Me'}</h2>
            <p>{isTamil ? 'மாவட்டம் மற்றும் தேவையைத் தேர்ந்தெடுத்து, உள்ளூர் உபகரணங்களை வரைபடத்தில் ஒப்பிடுங்கள்.' : 'Choose a Tamil Nadu district and equipment type, then compare local providers on the map.'}</p>
          </div>
          <button type="button" className="nearby-location-button" onClick={useMyLocation} disabled={locating}>
            {locating ? <LoaderCircle size={17} className="nearby-spin" /> : <Navigation size={17} />}
            {isTamil ? 'என் இருப்பிடத்தைப் பயன்படுத்து' : 'Use My Location'}
          </button>
        </header>

        {locationMessage && <p className="nearby-location-message" role="status">{locationMessage}</p>}

        <form className="nearby-filters" onSubmit={submitSearch}>
          <label>
            <span>{isTamil ? 'மாவட்டம்' : 'District'}</span>
            <select value={district} onChange={(event) => setDistrict(event.target.value)}>
              <option value="">{isTamil ? 'அனைத்து மாவட்டங்களும்' : 'All Tamil Nadu districts'}</option>
              {tamilNaduDistricts.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
          <label>
            <span>{isTamil ? 'உபகரண வகை' : 'Equipment category'}</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categoryNames.map((name) => <option key={name} value={name}>{name === 'All' ? (isTamil ? 'அனைத்து வகைகளும்' : 'All categories') : name}</option>)}
            </select>
          </label>
          <label>
            <span>{isTamil ? 'உபகரணத்தைத் தேடு' : 'Specific equipment'}</span>
            <div className="nearby-search-input">
              <Search size={16} />
              <input value={equipmentQuery} onChange={(event) => setEquipmentQuery(event.target.value)} placeholder="e.g. Mahindra tractor" />
            </div>
          </label>
          <label>
            <span>{isTamil ? 'தேவை' : 'Purpose'}</span>
            <select value={purpose} onChange={(event) => setPurpose(event.target.value as Purpose)}>
              <option value="all">{isTamil ? 'வாடகை / வாங்க' : 'Rent / Buy / Both'}</option>
              <option value="rent">{isTamil ? 'வாடகை' : 'Rent'}</option>
              <option value="buy">{isTamil ? 'வாங்க' : 'Buy'}</option>
              <option value="both">{isTamil ? 'இரண்டும்' : 'Both only'}</option>
            </select>
          </label>
          <button type="submit" className="nearby-search-button">{isTamil ? 'தேடு' : 'Search'}</button>
        </form>

        <div className="nearby-filter-row">
          <label><input type="checkbox" checked={availableOnly} onChange={(event) => setAvailableOnly(event.target.checked)} /> {isTamil ? 'கிடைக்கும் உபகரணங்கள் மட்டும்' : 'Available only'}</label>
          <label className="nearby-compact-filter">
            <SlidersHorizontal size={15} />
            <span>{isTamil ? 'குறைந்த மதிப்பீடு' : 'Minimum rating'}</span>
            <select value={minimumRating} onChange={(event) => setMinimumRating(Number(event.target.value))}>
              <option value={0}>{isTamil ? 'எதுவும்' : 'Any'}</option>
              <option value={3}>3+ ★</option>
              <option value={4}>4+ ★</option>
              <option value={4.5}>4.5+ ★</option>
            </select>
          </label>
          <label className="nearby-compact-filter">
            <span>{isTamil ? 'வரிசைப்படுத்து' : 'Sort by'}</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}>
              <option value="nearest">{currentLocation ? (isTamil ? 'அருகில்' : 'Nearest') : (isTamil ? 'தேர்ந்தெடுத்த மாவட்டத்துக்கு அருகில்' : 'Nearest to district')}</option>
              <option value="rating">{isTamil ? 'அதிக மதிப்பீடு' : 'Highest rated'}</option>
              <option value="rent-price">{isTamil ? 'குறைந்த வாடகை' : 'Lowest rental price'}</option>
              <option value="buy-price">{isTamil ? 'குறைந்த வாங்கும் விலை' : 'Lowest purchase price'}</option>
            </select>
          </label>
        </div>

        {vendorError && <p className="nearby-load-note" role="status">{vendorError}</p>}
        {loadError && <p className="nearby-load-error" role="alert">{loadError}</p>}
        <div className="nearby-results-count">
          {loading
            ? (isTamil ? 'அருகிலுள்ள உபகரணங்களைத் தேடுகிறது...' : 'Finding nearby equipment...')
            : `${results.length} ${isTamil ? 'உபகரணங்கள் / வழங்குநர்கள்' : 'equipment / providers'}`}
          {!currentLocation && !loading && <span>{isTamil ? 'தூரம் காட்டப்படவில்லை — மாவட்டம்/இடம் பயன்படுத்தப்படுகிறது.' : 'Distances are hidden until you choose Use My Location; district/location is shown instead.'}</span>}
        </div>

        {!loading && !loadError && results.length === 0 ? (
          <div className="nearby-empty-state">
            <MapPin size={26} />
            <strong>{currentLocation
              ? (isTamil ? 'உங்கள் இருப்பிடத்திற்கு அருகில் உபகரணங்கள் இல்லை.' : 'No equipment found near your location.')
              : (isTamil ? 'இந்த இடத்தில் உபகரணங்கள் இல்லை.' : 'No equipment available in this location.')}</strong>
            <span>{isTamil ? 'வேறு மாவட்டம் அல்லது வகையைத் தேர்ந்தெடுத்து மீண்டும் தேடுங்கள்.' : 'Try another district, category, or purpose.'}</span>
          </div>
        ) : null}

        {!loading && !loadError && results.length > 0 && (
          <div className="nearby-results-layout">
            <NearbyEquipmentMap
              items={results}
              center={districtCenter}
              currentLocation={currentLocation}
              onSelect={(item) => setSelectedId(item.id)}
              onViewDetails={(item) => handleSelect(item, 'equipment-details')}
            />
            <div className="nearby-provider-list" aria-label="Equipment and vendor results">
              {results.map(({ item, district: itemDistrict, distanceKm }) => (
                <article key={item.id} className={`nearby-provider-card${selectedId === item.id ? ' is-selected' : ''}`}>
                  <img
                    src={item.imageUrl || getCategoryFallback(item.category)}
                    alt={item.name}
                    onError={(event) => { event.currentTarget.src = getCategoryFallback(item.category) }}
                  />
                  <div className="nearby-provider-info">
                    <div className="nearby-provider-heading">
                      <div>
                        <span className="nearby-category">{item.category}</span>
                        <h3>{item.name}</h3>
                      </div>
                      <span className={`nearby-availability${item.avail ? ' available' : ''}`}>{item.avail ? (isTamil ? 'கிடைக்கிறது' : 'Available') : (isTamil ? 'முன்பதிவு' : 'Unavailable')}</span>
                    </div>
                    <p className="nearby-vendor">{item.vendorName || item.owner}</p>
                    <p className="nearby-location-line"><MapPin size={14} /> {itemDistrict || item.location}{distanceKm === null ? '' : ` · ${formatDistance(distanceKm)}`}</p>
                    <div className="nearby-rating-line"><Star size={15} fill="#F59E0B" color="#F59E0B" /> <strong>{item.rating.toFixed(1)}</strong> <span>({item.reviews} {isTamil ? 'மதிப்புரைகள்' : 'reviews'})</span></div>
                    <div className="nearby-prices">
                      {item.availabilityType !== 'buy' && <span>Rent: <strong>{money(item.dailyRate)}/day</strong></span>}
                      {item.purchasePrice && item.availabilityType !== 'rent' && <span>Buy: <strong>{money(item.purchasePrice)}</strong></span>}
                      <span className="nearby-mode">{item.availabilityType === 'both' ? 'Rent / Buy' : item.availabilityType === 'buy' ? 'Buy' : 'Rent'}</span>
                    </div>
                    <div className="nearby-actions">
                      <button type="button" className="nearby-details-button" onClick={() => handleSelect(item, 'equipment-details')}>{isTamil ? 'விவரங்கள்' : 'View Details'}</button>
                      {item.avail && item.availabilityType !== 'buy' && <button type="button" className="nearby-rent-button" onClick={() => handleSelect(item, 'booking')}>{isTamil ? 'வாடகைக்கு' : 'Rent Now'} <ArrowRight size={14} /></button>}
                      {item.avail && item.purchasePrice && item.availabilityType !== 'rent' && <button type="button" className="nearby-buy-button" onClick={() => handleSelect(item, 'equipment-details')}>{isTamil ? 'வாங்க' : 'Buy Now'}</button>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
