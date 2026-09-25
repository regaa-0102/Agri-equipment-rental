import { useState, useEffect } from 'react'
import { CalendarDays, ChevronDown, CircleX, Clock, Navigation, Plus, Search, Truck } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import BookingStatus from '../components/BookingStatus'
import ExtendRental from '../components/ExtendRental'
import CancelBooking from '../components/CancelBooking'
import TrackingPanel from '../components/TrackingPanel'
import { useLanguage } from '../context/LanguageContext'
import { BookingItem, getStoredBookings, onBookingsChange } from '../lib/bookings'

const P = '#2E7D32'
const PM = '#E8F5E9'

interface Props {
  onNavigate: (screen: string) => void
}

export default function MyBookings({ onNavigate }: Props) {
  const { t, isTamil } = useLanguage()
  const [bookingsList, setBookingsList] = useState<BookingItem[]>(() => getStoredBookings())
  const [tab, setTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Modals state
  const [extendingBooking, setExtendingBooking] = useState<BookingItem | null>(null)
  const [cancellingBooking, setCancellingBooking] = useState<BookingItem | null>(null)
  const [trackingBooking, setTrackingBooking] = useState<BookingItem | null>(null)

  useEffect(() => {
    return onBookingsChange((updated) => {
      setBookingsList(updated)
    })
  }, [])

  const filtered = bookingsList.filter((b) => {
    const matchesTab = tab === 'all' || b.status === tab
    const matchesSearch =
      !searchQuery ||
      b.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const counts = {
    all: bookingsList.length,
    active: bookingsList.filter((b) => b.status === 'active').length,
    completed: bookingsList.filter((b) => b.status === 'completed').length,
    cancelled: bookingsList.filter((b) => b.status === 'cancelled').length,
  }

  return (
    <div
      className="bookings-page"
      style={{
        display: 'flex',
        minHeight: 'calc(100vh - 44px)',
        background: '#F9FAFB',
        minWidth: 0,
      }}
    >
      <Sidebar activeItem="My Bookings" onNavigate={onNavigate} role="farmer" />

      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div
          style={{
            background: '#fff',
            borderBottom: '1px solid #F3F4F6',
            padding: '16px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            flexShrink: 0,
          }}
        >
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>
              {isTamil ? 'எனது முன்பதிவுகள்' : 'My Bookings'}
            </h1>
            <p style={{ color: '#6B7280', fontSize: 13, margin: '4px 0 0' }}>
              {isTamil
                ? 'உங்கள் அனைத்து உபகரண வாடகை வரலாறு மற்றும் கண்காணிப்பு'
                : 'Track, extend and manage all your agricultural equipment rentals'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('home')}
            className="btn-primary"
            style={{
              padding: '10px 20px',
              fontSize: 13,
              background: P,
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Plus size={16} />
            {isTamil ? 'புதிய முன்பதிவு' : '+ New Booking'}
          </button>
        </div>

        <div style={{ padding: '24px 28px', flex: 1, minWidth: 0 }}>
          {/* Stats row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 24,
            }}
          >
            {[
              {
                label: isTamil ? 'மொத்த முன்பதிவுகள்' : 'Total Bookings',
                value: counts.all,
                icon: '📋',
                color: '#E3F2FD',
                textColor: '#1565C0',
              },
              {
                label: isTamil ? 'செயலில் உள்ள வாடகைகள்' : 'Active Rentals',
                value: counts.active,
                icon: '🚜',
                color: PM,
                textColor: P,
              },
              {
                label: isTamil ? 'நிறைவடைந்தது' : 'Completed',
                value: counts.completed,
                icon: '✅',
                color: '#F0FDF4',
                textColor: '#16A34A',
              },
              {
                label: isTamil ? 'ரத்து செய்யப்பட்டது' : 'Cancelled',
                value: counts.cancelled,
                icon: '❌',
                color: '#FFEBEE',
                textColor: '#DC2626',
              },
            ].map((s) => (
              <div
                key={s.label}
                className="card-shadow"
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  padding: '16px 20px',
                  border: '1px solid #F3F4F6',
                  display: 'flex',
                  gap: 14,
                  alignItems: 'center',
                }}
              >
                <div style={{ background: s.color, borderRadius: 10, padding: '10px', fontSize: 22, flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.textColor }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Table card */}
          <div
            className="card-shadow"
            style={{
              background: '#fff',
              borderRadius: 18,
              border: '1px solid #F3F4F6',
              overflow: 'hidden',
            }}
          >
            {/* Tabs and search bar */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #F3F4F6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {(['all', 'active', 'completed', 'cancelled'] as const).map((tVal) => (
                  <button
                    key={tVal}
                    type="button"
                    onClick={() => setTab(tVal)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 10,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      background: tab === tVal ? PM : 'transparent',
                      color: tab === tVal ? P : '#6B7280',
                      transition: 'all 0.15s ease',
                      textTransform: 'capitalize',
                    }}
                  >
                    {tVal === 'all'
                      ? isTamil ? 'அனைத்தும்' : 'All'
                      : tVal === 'active'
                      ? isTamil ? 'செயலில்' : 'Active'
                      : tVal === 'completed'
                      ? isTamil ? 'முடிந்தது' : 'Completed'
                      : isTamil ? 'ரத்து' : 'Cancelled'}{' '}
                    ({counts[tVal]})
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', width: 240, maxWidth: '100%' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isTamil ? 'முன்பதிவுகளைத் தேடுங்கள்...' : 'Search bookings...'}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    borderRadius: 8,
                    border: '1px solid #E5E7EB',
                    fontSize: 12,
                    outline: 'none',
                  }}
                />
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              </div>
            </div>

            {/* Bookings Table (Desktop) / Cards (Mobile) */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#FAFAFA' }}>
                    {[
                      isTamil ? 'உபகரணம்' : 'Equipment',
                      isTamil ? 'இடம்' : 'Location',
                      isTamil ? 'தொடக்க தேதி' : 'Start Date',
                      isTamil ? 'முடிவு தேதி' : 'End Date',
                      isTamil ? 'தொகை' : 'Amount',
                      isTamil ? 'நிலை' : 'Status',
                      isTamil ? 'செயல்கள்' : 'Actions',
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '12px 18px',
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#6B7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr
                      key={b.id}
                      style={{
                        borderTop: '1px solid #F3F4F6',
                        background: '#fff',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      {/* Equipment with matching image */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <img
                            src={b.img}
                            alt={b.equipment}
                            style={{
                              width: 56,
                              height: 44,
                              borderRadius: 8,
                              objectFit: 'cover',
                              background: '#F3F4F6',
                              flexShrink: 0,
                            }}
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://images.unsplash.com/photo-1533062618053-d51e617307ec?auto=format&fit=crop&w=200&h=150&q=80'
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginBottom: 2 }}>
                              {b.equipment}
                            </div>
                            <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>
                              ID: {b.id} • {b.owner}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td style={{ padding: '14px 18px', fontSize: 13, color: '#4B5563', whiteSpace: 'nowrap' }}>
                        📍 {b.location}
                      </td>

                      {/* Dates */}
                      <td style={{ padding: '14px 18px', fontSize: 13, color: '#374151', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {b.from}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: '#2E7D32', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {b.to}
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 800, color: '#111827', whiteSpace: 'nowrap' }}>
                        {b.amount}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px' }}>
                        <BookingStatus status={b.status} />
                      </td>

                      {/* Action Buttons: Track Equipment, Extend Rental, Cancel Booking */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'nowrap' }}>
                          {/* Track Equipment Button */}
                          <button
                            type="button"
                            onClick={() => setTrackingBooking(b)}
                            title={isTamil ? 'உபகரணத்தை கண்காணிக்கவும்' : 'Track Equipment'}
                            style={{
                              padding: '6px 10px',
                              background: '#F0FDF4',
                              color: '#166534',
                              border: '1px solid #BBF7D0',
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <Truck size={14} />
                            <span>{isTamil ? 'கண்காணி' : 'Track'}</span>
                          </button>

                          {/* Extend Rental Button - Only available for active bookings */}
                          {b.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => setExtendingBooking(b)}
                              title={isTamil ? 'வாடகையை நீட்டிக்கவும்' : 'Extend Rental'}
                              style={{
                                padding: '6px 10px',
                                background: PM,
                                color: P,
                                border: '1px solid #C8E6C9',
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <CalendarDays size={14} />
                              <span>{isTamil ? 'நீட்டிக்கவும்' : 'Extend'}</span>
                            </button>
                          )}

                          {/* Cancel Booking Button - Only available for active / pending bookings */}
                          {b.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => setCancellingBooking(b)}
                              title={isTamil ? 'முன்பதிவை ரத்து செய்யவும்' : 'Cancel Booking'}
                              style={{
                                padding: '6px 8px',
                                background: '#FEF2F2',
                                color: '#DC2626',
                                border: '1px solid #FECACA',
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <CircleX size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '56px 20px', color: '#6B7280' }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>📋</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 4 }}>
                  {isTamil ? 'முன்பதிவுகள் எதுவும் இல்லை' : 'No bookings found'}
                </div>
                <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>
                  {isTamil ? 'இந்த பிரிவில் பதிவுகள் எதுவும் காணப்படவில்லை.' : 'You have no bookings matching the selected criteria.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Extend Rental */}
      {extendingBooking && (
        <ExtendRental
          booking={extendingBooking}
          isOpen={Boolean(extendingBooking)}
          onClose={() => setExtendingBooking(null)}
          onSuccess={(updated) => {
            setBookingsList(getStoredBookings())
            setExtendingBooking(null)
          }}
        />
      )}

      {/* Modal: Cancel Booking */}
      {cancellingBooking && (
        <CancelBooking
          booking={cancellingBooking}
          isOpen={Boolean(cancellingBooking)}
          onClose={() => setCancellingBooking(null)}
          onSuccess={(updated) => {
            setBookingsList(getStoredBookings())
            setCancellingBooking(null)
          }}
        />
      )}

      {/* Modal: Rental Tracking */}
      {trackingBooking && (
        <TrackingPanel
          booking={trackingBooking}
          isOpen={Boolean(trackingBooking)}
          onClose={() => setTrackingBooking(null)}
        />
      )}
    </div>
  )
}
