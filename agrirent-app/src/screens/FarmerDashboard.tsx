import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { getFullCatalog, categoryNames, getCategoryFallback, searchCatalog } from '../lib/catalog'
import { useLanguage } from '../context/LanguageContext'
import { BookingItem } from '../lib/bookings'
import { api, getStoredUser } from '../lib/api-client'
import { findCatalogItem } from '../lib/catalog'
import BookingStatus from '../components/BookingStatus'
import TrackingPanel from '../components/TrackingPanel'
import NearbyEquipment from '../components/NearbyEquipment'
import RecentlyViewedSection from '../components/RecentlyViewedSection'
import AgriWeatherCard from '../components/AgriWeatherCard'
import AgriMatchCalculator from '../components/AgriMatchCalculator'
import AgriChatbot from '../components/AgriChatbot'

const P = '#2E7D32'
const PM = '#E8F5E9'

interface Props {
  onNavigate: (screen: string) => void
}

export default function FarmerDashboard({ onNavigate }: Props) {
  const { t, isTamil } = useLanguage()
  const [priceRange, setPriceRange] = useState(6000)
  const [category, setCategory] = useState('All')
  const [location, setLocation] = useState('All Locations')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookingsList, setBookingsList] = useState<BookingItem[]>([])
  const [bookingsError, setBookingsError] = useState('')
  const [trackingBooking, setTrackingBooking] = useState<BookingItem | null>(null)
  const [user, setUser] = useState<any>(null)
  const [allCatalog, setAllCatalog] = useState(() => getFullCatalog())

  useEffect(() => {
    setUser(getStoredUser())
    setAllCatalog(getFullCatalog())
    const handleCatalogUpdate = () => {
      setAllCatalog(getFullCatalog())
    }
    window.addEventListener('agrirent_catalog_updated', handleCatalogUpdate)
    return () => {
      window.removeEventListener('agrirent_catalog_updated', handleCatalogUpdate)
    }
  }, [])

  useEffect(() => {
    void api.getBookings().then(({ bookings }) => {
      setBookingsList(bookings.map((booking) => {
        const listing = findCatalogItem(booking.listingId)
        const status: BookingItem['status'] =
          booking.status === 'completed' ? 'completed' :
          booking.status === 'cancelled' ? 'cancelled' :
          booking.status === 'pending' ? 'pending' : 'active'
        return {
          id: booking.id,
          equipmentId: booking.listingId,
          equipment: booking.equipmentName,
          cat: listing?.cat || 'Equipment',
          img: booking.equipmentImg || listing?.img || '',
          location: listing?.location || '—',
          from: booking.startDate,
          to: booking.endDate,
          days: booking.days,
          dailyRate: booking.dailyRate,
          amount: `₹${booking.totalAmount.toLocaleString()}`,
          totalNumeric: booking.totalAmount,
          status,
          owner: booking.ownerName,
          trackingStage: status === 'completed' ? 6 : status === 'active' ? 5 : 0,
        }
      }))
    }).catch((error: unknown) => {
      setBookingsError(error instanceof Error ? error.message : 'Could not load bookings.')
    })
  }, [])

  const filtered = searchCatalog(allCatalog, searchQuery, {
    category,
    maxPrice: priceRange,
  })

  const activeRentalsCount = bookingsList.filter((b) => b.status === 'active').length
  const completedRentalsCount = bookingsList.filter((b) => b.status === 'completed').length

  if (!user) return null
  const displayName = user.name
  const displayLocation = user.location || ''

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 44px)', width: '100%', minWidth: 0, background: '#F8FAFC' }}>
      <Sidebar activeItem="Dashboard" onNavigate={onNavigate} role={user.role} />

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {isTamil ? `வணக்கம், ${displayName} 👋` : `Good day, ${displayName} 👋`}
            </h1>
            <p style={{ color: '#64748B', fontSize: 13, margin: '4px 0 0' }}>
              📍 {displayLocation} • Farmer Portal
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                placeholder={isTamil ? 'உபகரணங்களைத் தேடு...' : 'Search farm machinery (e.g. Mahindra, Drone)...'}
                style={{ width: 280, paddingLeft: 36, paddingRight: searchQuery ? 30 : 12 }}
              />
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 15 }}>🔍</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: '#F1F5F9',
                    borderRadius: '50%',
                    width: 18,
                    height: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748B',
                    fontSize: 11,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            <div
              onClick={() => onNavigate('profile')}
              style={{ width: 40, height: 40, background: PM, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: P, cursor: 'pointer' }}
            >
              {displayName.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ padding: '24px', flex: 1 }}>
          {/* Stats cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            {[
              { label: isTamil ? 'மொத்த முன்பதிவுகள்' : 'Total Bookings', value: String(bookingsList.length), icon: '📋', delta: '+2 this month', color: '#EFF6FF', tc: '#1D4ED8' },
              { label: isTamil ? 'செயலில் உள்ள வாடகைகள்' : 'Active Rentals', value: String(activeRentalsCount), icon: '🚜', delta: 'Currently in field', color: PM, tc: P },
              { label: isTamil ? 'நிறைவடைந்தவை' : 'Completed Returns', value: String(completedRentalsCount), icon: '✅', delta: 'Deposit refunded', color: '#F0FDF4', tc: '#16A34A' },
              { label: isTamil ? 'சேமிக்கப்பட்ட தொகை' : 'Savings vs Buying', value: '₹2.8 Lakhs', icon: '💳', delta: 'Zero maintenance cost', color: '#FEF3C7', tc: '#B45309' },
            ].map((stat) => (
              <div key={stat.label} className="card-shadow" style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ background: stat.color, borderRadius: 10, padding: '6px 10px', fontSize: 20 }}>{stat.icon}</div>
                  <span style={{ fontSize: 11, color: P, fontWeight: 700, background: PM, borderRadius: 6, padding: '2px 6px' }}>ACTIVE</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', marginBottom: 2 }}>{stat.value}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 2 }}>{stat.label}</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>{stat.delta}</div>
              </div>
            ))}
          </div>

          <NearbyEquipment onNavigate={onNavigate} />

          {/* Live Micrometeorology & Spray Index */}
          <AgriWeatherCard />

          {/* Unique Feature: AgriMatch™ Optimizer */}
          <AgriMatchCalculator onNavigate={onNavigate} />

          {/* Recently Accessed Equipment */}
          <RecentlyViewedSection onNavigate={onNavigate} />

          {/* Active Bookings Tracking */}
          {bookingsError && <div role="alert" style={{ marginBottom: 16, color: '#B91C1C' }}>{bookingsError}</div>}
          {bookingsList.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {isTamil ? 'உங்கள் செயலில் உள்ள முன்பதிவுகள்' : 'Your Active Equipment Rentals'}
                </h3>
                <button onClick={() => onNavigate('my-bookings')} style={{ background: 'none', border: 'none', color: P, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  {isTamil ? 'அனைத்தையும் பார் →' : 'View All Bookings →'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                {bookingsList.slice(0, 2).map((b) => (
                  <div key={b.id} className="card-shadow" style={{ background: '#fff', borderRadius: 16, padding: '18px', border: '1px solid #E2E8F0', display: 'flex', gap: 14 }}>
                    <img src={b.img} alt={b.equipment} style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: P, textTransform: 'uppercase' }}>{b.cat} • {b.id}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '2px 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.equipment}</div>
                      <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8 }}>Owner: {b.owner} ({b.location})</div>
                      <button
                        onClick={() => setTrackingBooking(b)}
                        style={{
                          background: '#DCFCE7',
                          color: '#15803D',
                          border: '1px solid #86EFAC',
                          borderRadius: 8,
                          padding: '4px 10px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        🚚 Live GPS Tracking
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tracking Modal if clicked */}
          {trackingBooking && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
              <div style={{ background: '#fff', borderRadius: 20, width: 600, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 24, position: 'relative' }}>
                <button onClick={() => setTrackingBooking(null)} style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: '#F1F5F9', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontWeight: 700 }}>✕</button>
                <TrackingPanel booking={trackingBooking} onClose={() => setTrackingBooking(null)} />
              </div>
            </div>
          )}

          {/* Catalog Filter & Grid */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {isTamil ? 'வாடகைக்குக் கிடைக்கும் விவசாயக் கருவிகள்' : 'Browse Available Farm Equipment'}
              </h3>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                {categoryNames.slice(0, 6).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    style={{
                      background: category === c ? '#0F172A' : '#fff',
                      color: category === c ? '#fff' : '#475569',
                      border: '1px solid #CBD5E1',
                      borderRadius: 8,
                      padding: '5px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {filtered.slice(0, 8).map((eq) => (
                <div
                  key={eq.id}
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.localStorage.setItem('agrirent_selected_equipment_id', eq.id)
                      const url = new URL(window.location.href)
                      url.searchParams.set('id', eq.id)
                      window.history.replaceState({}, '', url.toString())
                    }
                    onNavigate('equipment-details')
                  }}
                  className="card-shadow"
                  style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #E2E8F0', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ height: 160, position: 'relative' }}>
                    <img
                      src={eq.imageUrl || eq.img}
                      alt={eq.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.src = getCategoryFallback(eq.category || eq.cat)
                      }}
                    />
                    <span style={{ position: 'absolute', top: 8, left: 8, background: '#DCFCE7', color: '#15803D', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                      {eq.category || eq.cat}
                    </span>
                  </div>
                  <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {eq.brand && (
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: 2 }}>
                        {eq.brand} {eq.model ? `• ${eq.model}` : ''}
                      </div>
                    )}
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                      {isTamil && eq.nameTa ? eq.nameTa : eq.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>📍 {eq.location}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
                      <span style={{ fontSize: 18, fontWeight: 900, color: P }}>{eq.price}<span style={{ fontSize: 11, color: '#94A3B8' }}>{eq.unit}</span></span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (typeof window !== 'undefined') {
                            window.localStorage.setItem('agrirent_selected_equipment_id', eq.id)
                            const url = new URL(window.location.href)
                            url.searchParams.set('id', eq.id)
                            window.history.replaceState({}, '', url.toString())
                          }
                          onNavigate('booking')
                        }}
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8 }}
                      >
                        {isTamil ? 'முன்பதிவு' : 'Rent Now'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Farm Assistant Chatbot */}
      <AgriChatbot onNavigate={onNavigate} />
    </div>
  )
}
