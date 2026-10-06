import { useState, useEffect, useMemo } from 'react'
import { catalog, categories, categoryNames, tamilNaduDistricts, getFullCatalog, getAllBrands, searchCatalog, getDynamicCategories, syncCatalogWithServer } from '../lib/catalog'
import { useLanguage } from '../context/LanguageContext'
import LanguageSelector from '../components/LanguageSelector'
import CategoryCard from '../components/CategoryCard'
import EquipmentCard from '../components/EquipmentCard'
import NearbyEquipment from '../components/NearbyEquipment'
import RecentlyViewedSection from '../components/RecentlyViewedSection'
import AgriWeatherCard from '../components/AgriWeatherCard'
import AgriMatchCalculator from '../components/AgriMatchCalculator'
import AgriChatbot from '../components/AgriChatbot'
import ApiExplorerModal from '../components/ApiExplorerModal'
import { Terminal, Search, Filter, X, RotateCcw, Check, Sparkles, Settings, Palette } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const P = '#2E7D32'
const PL = '#66BB6A'
const PM = '#E8F5E9'

const equipment = catalog

const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Wheat Farmer, Thanjavur',
    text: 'AgriRent helped me get a harvester at the right time during harvest season. The booking was easy and the equipment was in excellent condition. Saved me lakhs compared to buying!',
    rating: 5,
    avatar: 'RK',
    color: '#E8F5E9',
  },
  {
    name: 'Sunita Patel',
    role: 'Cotton Grower, Erode',
    text: 'I rented a tractor for soil preparation and it was delivered on time. The owner was very cooperative and the platform made everything transparent. Highly recommend!',
    rating: 5,
    avatar: 'SP',
    color: '#E3F2FD',
  },
  {
    name: 'Mohan Reddy',
    role: 'Rice Farmer, Tiruchirappalli',
    text: 'Great platform for small farmers like me who cannot afford to buy expensive equipment. The prices are affordable and the quality is assured.',
    rating: 5,
    avatar: 'MR',
    color: '#FFF8E1',
  },
]

const faqs = [
  { q: 'How does AgriRent work?', a: "Search for equipment in your area, view details, choose rental dates, make payment, and the owner delivers the equipment to your farm. It's that simple!" },
  { q: 'What types of equipment can I rent?', a: 'Tractors, harvesters, rotavators, seed drills, power sprayers, water pumps, cultivators, and 50+ other agricultural equipment types.' },
  { q: 'Is there a security deposit?', a: 'Yes, a refundable security deposit is required at the time of booking. It is fully refunded within 3-5 business days after the equipment is returned in good condition.' },
  { q: 'What if the equipment breaks down?', a: 'All equipment on AgriRent comes with breakdown support. The owner is responsible for maintenance. You can also raise a dispute through the platform.' },
  { q: 'Can I list my own equipment for rent?', a: 'Yes! Register as an equipment owner, list your machinery with photos and pricing, and start earning from your idle equipment.' },
]

interface Props {
  onNavigate: (screen: string) => void
}

export default function HomePage({ onNavigate }: Props) {
  const { t, isTamil } = useLanguage()
  const { openSettings } = useTheme()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [activeCat, setActiveCat] = useState('All')
  const [searchLocation, setSearchLocation] = useState('All Locations')
  const [searchType, setSearchType] = useState('All Equipment')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('All')
  const [maxPrice, setMaxPrice] = useState<number>(0)
  const [availableOnly, setAvailableOnly] = useState(false)
  const [minRating, setMinRating] = useState(0)
  const [sortByRating, setSortByRating] = useState(false)
  const [apiModalOpen, setApiModalOpen] = useState(false)
  const [equipmentList, setEquipmentList] = useState(() => getFullCatalog())

  useEffect(() => {
    setEquipmentList(getFullCatalog())
    syncCatalogWithServer().then((list) => {
      if (list && list.length > 0) {
        setEquipmentList(list)
      }
    })
    const handleUpdate = () => {
      setEquipmentList(getFullCatalog())
    }
    window.addEventListener('agrirent_catalog_updated', handleUpdate)
    return () => window.removeEventListener('agrirent_catalog_updated', handleUpdate)
  }, [])

  const dynamicCategories = useMemo(() => getDynamicCategories(equipmentList), [equipmentList])

  const allBrands = useMemo(() => getAllBrands(equipmentList), [equipmentList])

  const filteredEquipment = useMemo(() => {
    return searchCatalog(equipmentList, searchQuery, {
      category: activeCat,
      brand: selectedBrand,
      maxPrice: maxPrice > 0 ? maxPrice : undefined,
      availableOnly,
      minRating: minRating || undefined,
      sortBy: sortByRating ? 'rating' : undefined,
      location: searchLocation !== 'All Locations' ? searchLocation : undefined,
    })
  }, [equipmentList, searchQuery, activeCat, selectedBrand, maxPrice, availableOnly, minRating, sortByRating, searchLocation])

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    activeCat !== 'All' ||
    selectedBrand !== 'All' ||
    maxPrice > 0 ||
    availableOnly ||
    minRating > 0 ||
    sortByRating ||
    searchLocation !== 'All Locations'
  )

  const handleResetFilters = () => {
    setSearchQuery('')
    setActiveCat('All')
    setSelectedBrand('All')
    setMaxPrice(0)
    setAvailableOnly(false)
    setMinRating(0)
    setSortByRating(false)
    setSearchLocation('All Locations')
  }

  const handleCategoryClick = (catName: string) => {
    setActiveCat(catName)
    const el = document.getElementById('equipment-catalog')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSearch = () => {
    if (searchType !== 'All Equipment') {
      setActiveCat(searchType)
    }
    const el = document.getElementById('equipment-catalog')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="home-page" style={{ background: '#fff', minWidth: 0, overflowX: 'hidden' }}>
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 44,
          zIndex: 100,
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #F0F0F0',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 24px',
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          {/* Logo */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, cursor: 'pointer' }}
            onClick={() => onNavigate('home')}
          >
            <div
              style={{
                width: 36,
                height: 36,
                background: P,
                borderRadius: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 18 }}>🌿</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: P, letterSpacing: '-0.5px' }}>AgriRent</span>
          </div>

          {/* Nav */}
          <nav className="header-nav" style={{ display: 'flex', gap: 4 }}>
            {['Home', 'Equipment', 'About Us', 'Contact'].map((item, i) => (
              <a
                key={item}
                href={i === 1 ? '#equipment-catalog' : '#'}
                onClick={(e) => {
                  if (item === 'Contact') {
                    e.preventDefault()
                    onNavigate('contact')
                  } else if (item === 'Home') {
                    e.preventDefault()
                    onNavigate('home')
                  }
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: i === 0 ? P : '#4B5563',
                  textDecoration: 'none',
                  background: i === 0 ? PM : 'transparent',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
              >
                {t(item)}
              </a>
            ))}
          </nav>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Theme & Settings Trigger */}
            <button
              type="button"
              onClick={openSettings}
              title={isTamil ? 'அமைப்புகள் & தீம்கள்' : 'Settings & Themes'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(21, 128, 61, 0.08)',
                border: '1px solid rgba(21, 128, 61, 0.2)',
                color: '#15803D',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Palette size={15} />
              <span className="hidden sm:inline">{isTamil ? 'தீம்கள்' : 'Themes'}</span>
              <Settings size={14} />
            </button>

            <LanguageSelector />
            <button onClick={() => onNavigate('login')} className="btn-outline" style={{ padding: '8px 16px', fontSize: 13 }}>
              {t('Log In')}
            </button>
            <button onClick={() => onNavigate('register')} className="btn-primary" style={{ padding: '8px 18px', fontSize: 13, background: P, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
              {t('Sign Up Free')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ position: 'relative', minHeight: 560, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <img
          src="https://images.unsplash.com/photo-1533062618053-d51e617307ec?w=1440&h=700&fit=crop&auto=format"
          alt="Agricultural equipment in field"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.76) 0%, rgba(0,0,0,0.42) 60%, rgba(0,0,0,0.2) 100%)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1280, width: '100%', margin: '0 auto', padding: '60px 24px' }}>
          <div style={{ maxWidth: 650 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(102,187,106,0.25)',
                border: '1px solid rgba(102,187,106,0.5)',
                borderRadius: 20,
                padding: '6px 14px',
                marginBottom: 20,
              }}
            >
              <span style={{ width: 7, height: 7, background: PL, borderRadius: '50%' }} />
              <span style={{ color: '#A5D6A7', fontSize: 13, fontWeight: 500 }}>
                {isTamil ? 'இந்தியா முழுவதும் 50,000+ விவசாயிகளின் நம்பிக்கை' : 'Trusted by 50,000+ Farmers Across India'}
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 18, letterSpacing: '-1px' }}>
              {isTamil ? (
                <>
                  விவசாய கருவிகளை <br />
                  <span style={{ color: PL }}>எளிதாக வாடகைக்கு எடுங்கள்</span>
                </>
              ) : (
                <>
                  Rent Agricultural<br />
                  <span style={{ color: PL }}>Equipment Easily</span>
                </>
              )}
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: 30, fontWeight: 400 }}>
              {isTamil
                ? 'உங்கள் அருகில் உள்ள சிறந்த விவசாய கருவிகளைக் கண்டு, மலிவான விலையில் வாடகைக்கு எடுங்கள். சொந்தமாக வாங்கும் சிரமம் இல்லை.'
                : 'Find the best agricultural equipment near you and rent at affordable prices. No ownership hassle, just results.'}
            </p>

            {/* Search Box */}
            <div
              className="glass-card"
              style={{
                borderRadius: 16,
                padding: 16,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                alignItems: 'center',
                maxWidth: 780,
                background: 'rgba(255,255,255,0.96)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase' }}>
                  {isTamil ? 'உபகரணம் / பிராண்ட்' : 'Keyword or Brand'}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearch()
                    }}
                    placeholder={isTamil ? 'டிராக்டர், ட்ரோன், மகிந்திரா...' : 'e.g. Mahindra, Drone, Harvester...'}
                    style={{
                      border: 'none',
                      padding: '4px 0',
                      fontSize: 14,
                      width: '100%',
                      outline: 'none',
                      background: 'transparent',
                      fontWeight: 600,
                      color: '#0F172A',
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', padding: 2 }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div style={{ width: 1, height: 40, background: '#E5E7EB' }} className="search-divider" />

              <div style={{ flex: '1 1 150px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase' }}>
                  {t('Equipment Type')}
                </label>
                <select
                  className="input-field"
                  value={activeCat}
                  onChange={(e) => setActiveCat(e.target.value)}
                  style={{ border: 'none', padding: '4px 0', fontSize: 14, width: '100%', outline: 'none', background: 'transparent', fontWeight: 600 }}
                >
                  <option value="All">{isTamil ? 'அனைத்து பிரிவுகள்' : 'All Categories'}</option>
                  {categoryNames.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {t(c)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ width: 1, height: 40, background: '#E5E7EB' }} className="search-divider" />

              <div style={{ flex: '1 1 150px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase' }}>
                  {t('Location')}
                </label>
                <select
                  className="input-field"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  style={{ border: 'none', padding: '4px 0', fontSize: 14, width: '100%', outline: 'none', background: 'transparent', fontWeight: 600 }}
                >
                  <option value="All Locations">{isTamil ? 'அனைத்து மாவட்டங்கள்' : 'All Locations'}</option>
                  {tamilNaduDistricts.map((district) => (
                    <option key={district} value={`${district}, Tamil Nadu`}>
                      {district}, Tamil Nadu
                    </option>
                  ))}
                  <option value="Ludhiana, Punjab">Ludhiana, Punjab</option>
                </select>
              </div>

              <button
                onClick={handleSearch}
                className="btn-primary"
                style={{
                  borderRadius: 12,
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0,
                  background: P,
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Search size={16} /> {t('Search')}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
              {['284 Tractors', '96 Harvesters', '167 Water Sprayers', '124 Spreaders'].map((txt) => (
                <span key={txt} style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 500 }}>
                  ✓ {txt}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ background: P }}>
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: 24,
          }}
        >
          {[
            { v: '50,000+', l: isTamil ? 'பதிவு செய்த விவசாயிகள்' : 'Registered Farmers' },
            { v: '12,000+', l: isTamil ? 'பட்டியலிடப்பட்ட கருவிகள்' : 'Equipment Listed' },
            { v: '3.2L+', l: isTamil ? 'வெற்றிகரமான முன்பதிவுகள்' : 'Successful Bookings' },
            { v: '18', l: isTamil ? 'உள்ளடக்கிய மாநிலங்கள்' : 'States Covered' },
          ].map((s) => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Categories Section */}
      <section style={{ padding: '64px 0', background: '#FAFAFA' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ color: P, fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {t('Browse by Category')}
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111827', marginTop: 8, letterSpacing: '-0.5px' }}>
              {t('Popular Equipment Categories')}
            </h2>
            <p style={{ color: '#6B7280', marginTop: 8, fontSize: 15 }}>
              {t('Choose from a wide range of farming equipment for every need')}
            </p>
          </div>

          {/* Category Cards with verified Category-Specific Images */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {dynamicCategories.map((cat) => (
              <CategoryCard
                key={cat.name}
                category={cat}
                isSelected={activeCat === cat.name}
                onClick={handleCategoryClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* NEARBY AGRICULTURAL EQUIPMENT FEATURE */}
      <NearbyEquipment onNavigate={onNavigate} />

      {/* Featured Equipment Catalog Section */}
      <section id="equipment-catalog" style={{ padding: '64px 0', background: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          {/* Live Agri-Weather & Spray Telemetry */}
          <AgriWeatherCard />

          {/* Recently Viewed / Accessed Equipment */}
          <RecentlyViewedSection onNavigate={onNavigate} />

          {/* Unique Feature: AgriMatch AI Acreage & Machinery Optimizer */}
          <AgriMatchCalculator onNavigate={onNavigate} />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: 32,
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <span style={{ color: P, fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {t('Top Picks')}
              </span>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111827', marginTop: 6, letterSpacing: '-0.5px' }}>
                {activeCat === 'All' ? t('Featured Equipment') : `${t(activeCat)} Equipment`}
              </h2>
            </div>

            {activeCat !== 'All' && (
              <button
                type="button"
                onClick={() => setActiveCat('All')}
                style={{
                  background: PM,
                  color: P,
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {isTamil ? 'அனைத்தையும் காட்டு' : 'Show All Categories'}
              </button>
            )}
          </div>

          {/* Search, Brand, Price & Availability Filter Toolbar */}
          <div
            style={{
              background: '#F8FAFC',
              borderRadius: 16,
              padding: '16px 20px',
              border: '1px solid #E2E8F0',
              marginBottom: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {/* Top row: search input + brand + price + available toggle */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              {/* Live search input */}
              <div style={{ flex: '1 1 280px', position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isTamil ? 'பெயர், பிராண்ட், மாதிரி அல்லது ஊர் வாரியாக தேடுங்கள்...' : 'Search by name, brand (e.g. Mahindra), model, or location...'}
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 42px',
                    borderRadius: 10,
                    border: '1.5px solid #CBD5E1',
                    background: '#fff',
                    fontSize: 14,
                    color: '#0F172A',
                    fontWeight: 500,
                    outline: 'none',
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#F1F5F9',
                      border: 'none',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#64748B',
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Brand filter */}
              <div style={{ minWidth: 150, flexShrink: 0 }}>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1.5px solid #CBD5E1',
                    background: '#fff',
                    fontSize: 13,
                    color: '#0F172A',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="All">{isTamil ? 'அனைத்து பிராண்டுகளும்' : 'All Brands'}</option>
                  {allBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Price filter */}
              <div style={{ minWidth: 150, flexShrink: 0 }}>
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1.5px solid #CBD5E1',
                    background: '#fff',
                    fontSize: 13,
                    color: '#0F172A',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value={0}>{isTamil ? 'அனைத்து கட்டணங்கள்' : 'All Rental Rates'}</option>
                  <option value={800}>{isTamil ? '₹800 வரை / நாள்' : 'Up to ₹800 / day'}</option>
                  <option value={1500}>{isTamil ? '₹1,500 வரை / நாள்' : 'Up to ₹1,500 / day'}</option>
                  <option value={2000}>{isTamil ? '₹2,000 வரை / நாள்' : 'Up to ₹2,000 / day'}</option>
                  <option value={3000}>{isTamil ? '₹3,000 வரை / நாள்' : 'Up to ₹3,000 / day'}</option>
                </select>
              </div>

              {/* Available Only toggle */}
              <button
                type="button"
                onClick={() => setAvailableOnly(!availableOnly)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 14px',
                  borderRadius: 10,
                  border: `1.5px solid ${availableOnly ? P : '#CBD5E1'}`,
                  background: availableOnly ? PM : '#fff',
                  color: availableOnly ? P : '#475569',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: availableOnly ? P : '#94A3B8',
                  }}
                />
                {isTamil ? 'கிடைப்பவை மட்டும்' : 'Available Only'}
              </button>

              {/* Reset button if active */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '9px 14px',
                    borderRadius: 10,
                    border: '1px solid #FECACA',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <RotateCcw size={14} />
                  {isTamil ? 'வடிகட்டிகளை நீக்கு' : 'Reset'}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#475569' }}>
                {isTamil ? 'குறைந்தபட்ச மதிப்பீடு' : 'Rating'}
                <select value={minRating} onChange={(event) => setMinRating(Number(event.target.value))} style={{ padding: '8px 10px', borderRadius: 9, border: '1px solid #CBD5E1', background: '#fff' }}>
                  <option value={0}>{isTamil ? 'அனைத்து மதிப்பீடுகள்' : 'All ratings'}</option>
                  <option value={5}>{isTamil ? '5 நட்சத்திரம்' : '5 stars'}</option>
                  <option value={4}>{isTamil ? '4+ நட்சத்திரம்' : '4+ stars'}</option>
                </select>
              </label>
              <button type="button" onClick={() => setSortByRating(!sortByRating)} aria-pressed={sortByRating} style={{ padding: '8px 12px', borderRadius: 9, border: `1px solid ${sortByRating ? P : '#CBD5E1'}`, background: sortByRating ? PM : '#fff', color: sortByRating ? P : '#475569', fontWeight: 700, cursor: 'pointer' }}>
                {isTamil ? 'அதிக மதிப்பீடு முதலில்' : 'Highest rated first'}
              </button>
            </div>

            {/* Results count indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#64748B' }}>
              <div>
                {isTamil ? (
                  <>
                    காட்டப்படும் உபகரணங்கள்: <strong style={{ color: '#0F172A' }}>{filteredEquipment.length}</strong> / {equipmentList.length}
                  </>
                ) : (
                  <>
                    Showing <strong style={{ color: '#0F172A' }}>{filteredEquipment.length}</strong> of {equipmentList.length} verified machines
                  </>
                )}
                {searchQuery && (
                  <span style={{ marginLeft: 8, color: P, fontWeight: 600 }}>
                    matching &ldquo;{searchQuery}&rdquo;
                  </span>
                )}
                {selectedBrand !== 'All' && (
                  <span style={{ marginLeft: 8, color: '#0F172A', fontWeight: 600 }}>
                    • Brand: {selectedBrand}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
            {categoryNames.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCat(c)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  border: `1.5px solid ${activeCat === c ? P : '#E5E7EB'}`,
                  background: activeCat === c ? PM : '#fff',
                  color: activeCat === c ? P : '#4B5563',
                  transition: 'all 0.15s ease',
                }}
              >
                {c === 'All' ? (isTamil ? 'அனைத்து பிரிவுகள்' : 'All Categories') : t(c)}
              </button>
            ))}
          </div>

          {/* Equipment Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 24,
            }}
          >
            {filteredEquipment.map((eq) => (
              <EquipmentCard key={eq.id} equipment={eq} onNavigate={onNavigate} />
            ))}
          </div>

          {filteredEquipment.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '56px 20px',
                background: '#F8FAFC',
                borderRadius: 20,
                border: '1.5px dashed #CBD5E1',
                margin: '20px 0',
              }}
            >
              <div style={{ fontSize: 44, marginBottom: 12 }}>🚜🔍</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
                {searchQuery
                  ? isTamil
                    ? `"${searchQuery}" என்ற தேடலுக்கு உபகரணங்கள் கிடைக்கவில்லை`
                    : `No machinery found matching "${searchQuery}"`
                  : isTamil
                    ? 'தேர்ந்தெடுக்கப்பட்ட வடிகட்டிகளுக்கு உபகரணங்கள் கிடைக்கவில்லை'
                    : 'No equipment matches the selected filters'}
              </h3>
              <p style={{ color: '#64748B', fontSize: 14, maxWidth: 500, margin: '0 auto 20px' }}>
                {isTamil
                  ? 'வேறு வார்த்தைகளை பயன்படுத்தி தேடவும் அல்லது வடிகட்டிகளை மீட்டமைக்கவும்.'
                  : 'Try searching with general terms like "Mahindra", "Tractor", "Harvester", or "Drone".'}
              </p>

              {/* Quick suggestion chips */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
                {['Mahindra', 'John Deere', 'Tractor', 'Harvester', 'Drone', 'Rotavator', 'Sprayer', 'Pump'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchQuery(term)
                      setActiveCat('All')
                      setSelectedBrand('All')
                    }}
                    style={{
                      background: '#fff',
                      border: '1px solid #CBD5E1',
                      borderRadius: 20,
                      padding: '4px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: P,
                      cursor: 'pointer',
                    }}
                  >
                    🔍 {term}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  padding: '10px 24px',
                  background: P,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 14,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <RotateCcw size={16} />
                {isTamil ? 'அனைத்து வடிகட்டிகளையும் மீட்டமை' : 'Reset All Filters & Show Full Inventory'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '64px 0', background: PM }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{ color: P, fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {t('Simple Process')}
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111827', marginTop: 8 }}>
              {t('Get your equipment in 4 easy steps')}
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 24,
            }}
          >
            {[
              { n: '1', t: isTamil ? 'தேடவும்' : 'Search & Select', d: isTamil ? 'உங்களுக்குத் தேவையான விவசாய கருவியைத் தேர்ந்தெடுக்கவும்' : 'Browse equipment listings near your farm location.' },
              { n: '2', t: isTamil ? 'முன்பதிவு செய்க' : 'Book Rental Dates', d: isTamil ? 'வாடகை காலத்தைத் தேர்வு செய்து முன்பதிவை உறுதிப்படுத்தவும்' : 'Choose rental start and end dates with transparent pricing.' },
              { n: '3', t: isTamil ? 'கண்காணிக்கவும்' : 'Track Delivery', d: isTamil ? 'கருவி அனுப்பப்படுவதை நேரலையில் கண்காணிக்கவும்' : 'Track equipment dispatch and arrival right to your field.' },
              { n: '4', t: isTamil ? 'நீட்டிக்கவும் அல்லது திரும்பத்தரவும்' : 'Extend or Return', d: isTamil ? 'தேவைப்பட்டால் வாடகையை நீட்டிக்கவும் அல்லது பாதுகாப்பாக ஒப்படைக்கவும்' : 'Need more time? Extend rental with one click, or return when done.' },
            ].map((step) => (
              <div
                key={step.n}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: 24,
                  border: '1px solid #C8E6C9',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: P,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 16,
                    marginBottom: 14,
                  }}
                >
                  {step.n}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                  {step.t}
                </h3>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                  {step.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '64px 0', background: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ color: P, fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {t('What Farmers Say')}
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111827', marginTop: 8 }}>
              {isTamil ? 'விவசாயிகளின் நற்சான்றுகள்' : 'Real Stories from Real Farmers'}
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 24,
            }}
          >
            {testimonials.map((tItem) => (
              <div
                key={tItem.name}
                style={{
                  background: '#FAFAFA',
                  borderRadius: 16,
                  padding: 24,
                  border: '1px solid #F3F4F6',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: tItem.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      color: P,
                    }}
                  >
                    {tItem.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{tItem.name}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{t(tItem.role)}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.6, flex: 1, margin: '0 0 16px' }}>
                  "{tItem.text}"
                </p>
                <div style={{ color: '#F59E0B', fontSize: 14 }}>{'★'.repeat(tItem.rating)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section style={{ padding: '64px 0', background: '#F9FAFB' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ color: P, fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {t('FAQ')}
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111827', marginTop: 8 }}>
              {t('Frequently Asked Questions')}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqs.map((faq, i) => (
              <div
                key={faq.q}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: '16px 20px',
                  border: '1px solid #E5E7EB',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: 15, color: '#111827' }}>
                  <span>{t(faq.q)}</span>
                  <span style={{ color: P, fontSize: 18 }}>{openFaq === i ? '−' : '+'}</span>
                </div>
                {openFaq === i && (
                  <p style={{ fontSize: 13, color: '#6B7280', margin: '10px 0 0', lineHeight: 1.6 }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#111827', padding: '56px 0 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 40,
              paddingBottom: 40,
              borderBottom: '1px solid #1F2937',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    background: P,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                  }}
                >
                  🌿
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>AgriRent</span>
              </div>
              <p style={{ color: '#9CA3AF', fontSize: 13, lineHeight: 1.7, maxWidth: 280, margin: '0 0 16px' }}>
                {isTamil
                  ? 'இந்தியாவின் மிகப்பெரிய விவசாய கருவி வாடகை தளம்.'
                  : "India's largest agricultural equipment rental platform. Empowering farmers with modern machinery."}
              </p>
              <LanguageSelector />
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 14, marginBottom: 14 }}>
                {t('Platform')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#equipment-catalog" style={{ color: '#9CA3AF', fontSize: 13, textDecoration: 'none' }}>
                  {t('Browse Equipment')}
                </a>
                <a onClick={() => onNavigate('register')} style={{ color: '#9CA3AF', fontSize: 13, textDecoration: 'none', cursor: 'pointer' }}>
                  {t('List Equipment')}
                </a>
                <a onClick={() => onNavigate('my-bookings')} style={{ color: '#9CA3AF', fontSize: 13, textDecoration: 'none', cursor: 'pointer' }}>
                  {t('My Bookings')}
                </a>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 14, marginBottom: 14 }}>
                {t('Dashboards')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a onClick={() => onNavigate('farmer-dashboard')} style={{ color: '#9CA3AF', fontSize: 13, textDecoration: 'none', cursor: 'pointer' }}>
                  {isTamil ? 'விவசாயி முகப்புப்பலகை' : 'Farmer Dashboard'}
                </a>
                <a onClick={() => onNavigate('owner-dashboard')} style={{ color: '#9CA3AF', fontSize: 13, textDecoration: 'none', cursor: 'pointer' }}>
                  {isTamil ? 'உரிமையாளர் முகப்புப்பலகை' : 'Owner Dashboard'}
                </a>
                <a onClick={() => onNavigate('admin-dashboard')} style={{ color: '#9CA3AF', fontSize: 13, textDecoration: 'none', cursor: 'pointer' }}>
                  {isTamil ? 'நிர்வாகி முகப்புப்பலகை' : 'Admin Dashboard'}
                </a>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 14, marginBottom: 14 }}>
                {t('Company')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ color: '#9CA3AF', fontSize: 13 }}>{t('About Us')}</span>
                <span style={{ color: '#9CA3AF', fontSize: 13 }}>{t('Safety')}</span>
                <a onClick={() => onNavigate('contact')} style={{ color: '#9CA3AF', fontSize: 13, textDecoration: 'none', cursor: 'pointer' }}>{t('Contact Us')}</a>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ color: '#6B7280', fontSize: 12 }}>
              © 2026 AgriRent Technologies Pvt. Ltd. {isTamil ? 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.' : 'All rights reserved.'}
            </span>
            <div style={{ display: 'flex', gap: 16 }}>
              {['Privacy Policy', 'Terms of Service'].map((l) => (
                <span key={l} style={{ color: '#6B7280', fontSize: 12 }}>
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive AI Farm Assistant Chatbot */}
      <AgriChatbot onNavigate={onNavigate} />

      {/* REST API Explorer Sandbox */}
      <ApiExplorerModal isOpen={apiModalOpen} onClose={() => setApiModalOpen(false)} />
    </div>
  )
}
