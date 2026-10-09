import { useState, useEffect, type FormEvent } from 'react'
import { CalendarDays, ChevronDown, CircleX, Clock, Navigation, Plus, Search, Star, Truck } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import BookingStatus from '../components/BookingStatus'
import ExtendRental from '../components/ExtendRental'
import CancelBooking from '../components/CancelBooking'
import TrackingPanel from '../components/TrackingPanel'
import { useLanguage } from '../context/LanguageContext'
import { BookingItem } from '../lib/bookings'
import { api } from '../lib/api-client'
import { findCatalogItem } from '../lib/catalog'

const P = '#2E7D32'
const PM = '#E8F5E9'

interface ApiBooking {
  id: string
  listingId: string
  equipmentName: string
  equipmentImg?: string
  startDate: string
  endDate: string
  days: number
  dailyRate: number
  totalAmount: number
  status: string
  ownerName: string
  review?: { rating: number; reviewText: string } | null
}

function toBookingItem(booking: ApiBooking): BookingItem {
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
    ...(booking.review ? { review: booking.review } : {}),
    trackingStage: status === 'completed' ? 6 : status === 'active' ? 5 : 0,
  }
}

interface Props {
  onNavigate: (screen: string) => void
}

export default function MyBookings({ onNavigate }: Props) {
  const { t, isTamil } = useLanguage()
  const [bookingsList, setBookingsList] = useState<BookingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [tab, setTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Modals state
  const [extendingBooking, setExtendingBooking] = useState<BookingItem | null>(null)
  const [cancellingBooking, setCancellingBooking] = useState<BookingItem | null>(null)
  const [trackingBooking, setTrackingBooking] = useState<BookingItem | null>(null)
  const [reviewingBooking, setReviewingBooking] = useState<BookingItem | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewNotice, setReviewNotice] = useState('')

  useEffect(() => {
    void loadBookings()
  }, [])

  async function loadBookings() {
    setLoading(true)
    setLoadError('')
    try {
      const response = await api.getBookings()
      setBookingsList((response.bookings as ApiBooking[]).map(toBookingItem))
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load bookings.')
    } finally {
      setLoading(false)
    }
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!reviewingBooking?.equipmentId) {
      setReviewError(isTamil ? 'கருவி விவரம் கிடைக்கவில்லை.' : 'The equipment reference is unavailable.')
      return
    }
    setReviewError('')
    setReviewSubmitting(true)
    try {
      await api.createReview({
        equipmentId: reviewingBooking.equipmentId,
        bookingId: reviewingBooking.id,
        rating: reviewRating,
        reviewText: reviewText.trim(),
      })
      setReviewingBooking(null)
      setReviewText('')
      await loadBookings()
      setReviewNotice(isTamil ? 'உங்கள் மதிப்புரை சேமிக்கப்பட்டது.' : 'Your review has been saved.')
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Could not submit review.')
    } finally {
      setReviewSubmitting(false)
    }
  }

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
          {loadError && (
            <div role="alert" style={{ padding: 14, marginBottom: 16, borderRadius: 10, color: '#B91C1C', background: '#FEF2F2' }}>
              {loadError}
              <button type="button" onClick={() => void loadBookings()} style={{ marginLeft: 12, color: '#991B1B', textDecoration: 'underline', border: 0, background: 'none', cursor: 'pointer' }}>
                {isTamil ? 'மீண்டும் முயற்சிக்கவும்' : 'Retry'}
              </button>
            </div>
          )}
          {reviewNotice && (
            <div role="status" style={{ padding: 14, marginBottom: 16, borderRadius: 10, color: '#166534', background: '#F0FDF4' }}>
              {reviewNotice}
              <button type="button" onClick={() => setReviewNotice('')} style={{ marginLeft: 12, color: '#166534', border: 0, background: 'none', cursor: 'pointer' }}>×</button>
            </div>
          )}
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
                                '/equipment/tractors/mahindra-575-di-yuvo-tech-plus.jpg'
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
                          {b.status === 'completed' && b.review && (
                            <span
                              aria-label={isTamil ? `ஏற்கனவே ${b.review.rating} நட்சத்திரம் மதிப்பிட்டுள்ளீர்கள்` : `Already rated ${b.review.rating} out of 5 stars`}
                              style={{ padding: '6px 8px', background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A', borderRadius: 8, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}
                            >
                              <Star size={14} fill="currentColor" style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />
                              {b.review.rating}/5
                            </span>
                          )}
                          {b.status === 'completed' && !b.review && (
                            <button
                              type="button"
                              onClick={() => {
                                setReviewingBooking(b)
                                setReviewRating(5)
                                setReviewText('')
                                setReviewError('')
                              }}
                              title={isTamil ? 'மதிப்புரை எழுதவும்' : 'Rate this rental'}
                              style={{ padding: '6px 8px', background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
                            >
                              <Star size={14} />{isTamil ? 'மதிப்பிடு' : 'Rate'}
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

            {loading && (
              <div role="status" style={{ textAlign: 'center', padding: '32px 20px', color: '#6B7280' }}>
                {isTamil ? 'முன்பதிவுகள் ஏற்றப்படுகின்றன...' : 'Loading your bookings…'}
              </div>
            )}
            {!loading && filtered.length === 0 && (
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
          onSuccess={() => {
            void loadBookings()
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
          onSuccess={() => {
            void loadBookings()
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
      {reviewingBooking && (
        <div role="presentation" onClick={() => setReviewingBooking(null)} style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(17,24,39,.6)' }}>
          <form onSubmit={(event) => void submitReview(event)} role="dialog" aria-modal="true" aria-labelledby="booking-review-title" onClick={(event) => event.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: 16, padding: 24 }}>
            <h2 id="booking-review-title" style={{ margin: '0 0 8px', fontSize: 20 }}>{isTamil ? 'வாடகை மதிப்புரை' : 'Review your rental'}</h2>
            <p style={{ margin: '0 0 16px', color: '#64748B' }}>{reviewingBooking.equipment}</p>
            <div role="radiogroup" aria-label={isTamil ? 'நட்சத்திர மதிப்பீடு' : 'Star rating'} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map((stars) => (
                <button key={stars} type="button" role="radio" aria-checked={reviewRating === stars} aria-label={`${stars} ${stars === 1 ? 'star' : 'stars'}`} onClick={() => setReviewRating(stars)} style={{ padding: 4, background: 'none', border: 0, cursor: 'pointer', color: stars <= reviewRating ? '#F59E0B' : '#CBD5E1' }}>
                  <Star size={28} fill={stars <= reviewRating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
            <textarea value={reviewText} onChange={(event) => setReviewText(event.target.value)} maxLength={2000} rows={4} placeholder={isTamil ? 'உங்கள் அனுபவத்தைப் பகிரவும்' : 'Share your experience (optional)'} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #CBD5E1', borderRadius: 10, padding: 12, resize: 'vertical' }} />
            {reviewError && <p role="alert" style={{ color: '#B91C1C', margin: '10px 0 0' }}>{reviewError}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button type="button" onClick={() => setReviewingBooking(null)} style={{ padding: '9px 14px', border: '1px solid #CBD5E1', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>{isTamil ? 'மூடு' : 'Cancel'}</button>
              <button type="submit" disabled={reviewSubmitting} style={{ padding: '9px 14px', border: 0, borderRadius: 8, background: P, color: '#fff', fontWeight: 700, cursor: reviewSubmitting ? 'wait' : 'pointer' }}>{reviewSubmitting ? (isTamil ? 'சேமிக்கிறது...' : 'Submitting…') : (isTamil ? 'மதிப்புரையை சமர்ப்பிக்கவும்' : 'Submit review')}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
