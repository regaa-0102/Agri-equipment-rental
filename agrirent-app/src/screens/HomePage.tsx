import { useState } from 'react'
import { catalog, categories, categoryNames, tamilNaduDistricts } from '../lib/catalog'
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
import { Terminal } from 'lucide-react'

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
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [activeCat, setActiveCat] = useState('All')
  const [searchLocation, setSearchLocation] = useState('Coimbatore, Tamil Nadu')
  const [searchType, setSearchType] = useState('All Equipment')
  const [apiModalOpen, setApiModalOpen] = useState(false)

  const filteredEquipment = equipment.filter((e) => {
    if (activeCat === 'All') return true
    if (activeCat === 'Fertilizer Spreader' || activeCat === 'Fertilizers') {
      return e.cat === 'Fertilizer Spreader' || e.cat === 'Fertilizers'
    }
    return e.cat === activeCat
  })

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
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: i === 0 ? P : '#4B5563',
                  textDecoration: 'none',
                  background: i === 0 ? PM : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                {t(item)}
              </a>
            ))}
          </nav>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
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
                maxWidth: 720,
                background: 'rgba(255,255,255,0.95)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ flex: '1 1 180px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase' }}>
                  {t('Location')}
                </label>
                <select
                  className="input-field"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  style={{ border: 'none', padding: '4px 0', fontSize: 14, width: '100%', outline: 'none', background: 'transparent', fontWeight: 600 }}
                >
                  {tamilNaduDistricts.map((district) => (
                    <option key={district}>{district}, Tamil Nadu</option>
                  ))}
                </select>
              </div>

              <div style={{ width: 1, height: 40, background: '#E5E7EB' }} className="search-divider" />

              <div style={{ flex: '1 1 180px' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase' }}>
                  {t('Equipment Type')}
                </label>
                <select
                  className="input-field"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  style={{ border: 'none', padding: '4px 0', fontSize: 14, width: '100%', outline: 'none', background: 'transparent', fontWeight: 600 }}
                >
                  <option value="All Equipment">{isTamil ? 'அனைத்து கருவிகள்' : 'All Equipment'}</option>
                  {categoryNames.map((c) => (
                    <option key={c} value={c}>
                      {t(c)}
                    </option>
                  ))}
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
                <span>🔍</span> {t('Search')}
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
            {categories.map((cat) => (
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

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
            {['All', ...categoryNames].map((c) => (
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
                {c === 'All' ? t('All') : t(c)}
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
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#6B7280' }}>
              <p>{isTamil ? 'இந்த பிரிவில் உபகரணங்கள் கிடைக்கவில்லை' : 'No equipment found in this category'}</p>
              <button
                type="button"
                onClick={() => setActiveCat('All')}
                style={{
                  padding: '8px 16px',
                  background: P,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {isTamil ? 'அனைத்து உபகரணங்களையும் பார்க்க' : 'View All Equipment'}
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
                <span style={{ color: '#9CA3AF', fontSize: 13 }}>{t('Contact')}</span>
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
