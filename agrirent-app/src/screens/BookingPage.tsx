import { useState, useEffect } from 'react'
import { CalendarDays, CheckCircle2, ShieldCheck, MapPin, ArrowRight } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { createNewBooking } from '../lib/bookings'
import { catalog, findCatalogItem, CatalogItem } from '../lib/catalog'
import { api } from '../lib/api-client'

const P = '#2E7D32'
const PM = '#E8F5E9'

interface Props {
  onNavigate: (screen: string) => void
  selectedEquipment?: CatalogItem
}

export default function BookingPage({ onNavigate, selectedEquipment }: Props) {
  const { t, isTamil } = useLanguage()

  const [eq, setEq] = useState<CatalogItem>(() => {
    if (selectedEquipment) return selectedEquipment
    if (typeof window !== 'undefined') {
      const storedId = window.localStorage.getItem('agrirent_selected_equipment_id')
      if (storedId) {
        const found = findCatalogItem(storedId)
        if (found) return found
      }
    }
    return catalog[0]
  })

  useEffect(() => {
    if (!selectedEquipment && typeof window !== 'undefined') {
      const storedId = window.localStorage.getItem('agrirent_selected_equipment_id')
      if (storedId) {
        const found = findCatalogItem(storedId)
        if (found) setEq(found)
      }
    }
  }, [selectedEquipment])

  const [payMethod, setPayMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi')
  const [upiId, setUpiId] = useState('farmer@upi')

  const [startDate, setStartDate] = useState('2026-09-24')
  const [endDate, setEndDate] = useState('2026-09-27')

  // Dynamic days calculation
  const startMs = new Date(startDate).getTime()
  const endMs = new Date(endDate).getTime()
  const days = Math.max(1, !isNaN(startMs) && !isNaN(endMs) && endMs > startMs ? Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) : 3)

  const pricePerDay = eq.dailyRate || 1800
  const subtotal = pricePerDay * days
  const deposit = eq.securityDeposit || 2500
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + deposit + tax

  const handlePay = async () => {
    // Add to centralized booking store
    createNewBooking({
      equipment: eq.name,
      cat: eq.cat,
      img: eq.img,
      location: eq.location,
      from: startDate,
      to: endDate,
      dailyRate: pricePerDay,
      amount: `₹${total.toLocaleString('en-IN')}`,
      totalNumeric: total,
      owner: eq.owner || 'Verified Owner',
      ownerPhone: eq.ownerPhone || '+91 98421 54321',
      lastLocation: eq.location,
      distance: eq.distance || '2.5 km away',
    })

    // Also sync to backend API
    try {
      await api.createBooking({
        listingId: eq.id,
        startDate,
        endDate,
        days,
      })
    } catch (err) {
      console.warn('Backend booking sync notice:', err)
    }

    onNavigate('payment-success')
  }

  return (
    <div style={{ minWidth: 0, background: '#F9FAFB', minHeight: 'calc(100vh - 44px)' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #F3F4F6', position: 'sticky', top: 44, zIndex: 100 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 20 }}>
          <button
            onClick={() => onNavigate('equipment-details')}
            style={{
              background: '#F3F4F6',
              border: 'none',
              borderRadius: 10,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              color: '#374151',
            }}
          >
            ← {isTamil ? 'பின்செல்' : 'Back'}
          </button>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>
              {isTamil ? 'முன்பதிவை முடிக்கவும்' : 'Complete Booking'}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>{eq.name}</div>
          </div>
          {/* Steps */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {[
              { en: 'Dates', ta: 'தேதிகள்' },
              { en: 'Payment', ta: 'கட்டணம்' },
              { en: 'Confirm', ta: 'உறுதி செய்' },
            ].map((step, i) => (
              <div key={step.en} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: i <= 1 ? P : '#E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      color: i <= 1 ? '#fff' : '#9CA3AF',
                    }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: i <= 1 ? 600 : 400, color: i <= 1 ? '#111827' : '#9CA3AF' }}>
                    {isTamil ? step.ta : step.en}
                  </span>
                </div>
                {i < 2 && <div style={{ width: 24, height: 2, background: i < 1 ? P : '#E5E7EB' }} />}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 32 }}>
          {/* Left: Booking form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Equipment summary with correct image */}
            <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <img
                  src={eq.img}
                  alt={eq.name}
                  style={{ width: 120, height: 90, borderRadius: 12, objectFit: 'cover', background: '#F3F4F6', flexShrink: 0 }}
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1533062618053-d51e617307ec?auto=format&fit=crop&w=400&h=300&q=80'
                  }}
                />
                <div>
                  <div style={{ fontSize: 12, color: P, fontWeight: 700, background: PM, borderRadius: 6, padding: '2px 8px', display: 'inline-block', marginBottom: 6 }}>
                    {eq.cat}
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: 18, color: '#111827', margin: '0 0 6px' }}>{eq.name}</h3>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>
                    📍 {eq.location} &nbsp;•&nbsp; ⭐ {eq.rating} ({eq.reviews} reviews)
                  </div>
                  <div style={{ fontSize: 13, color: '#2E7D32', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={14} />
                    <span>{isTamil ? 'உரிமையாளர்' : 'Owner'}: <strong>{eq.owner || 'Verified Partner'}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rental dates with dynamic calculation */}
            <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #F3F4F6' }}>
              <h3 style={{ fontWeight: 800, fontSize: 16, color: '#111827', marginBottom: 20 }}>
                📅 {isTamil ? 'வாடகை தேதிகள்' : 'Rental Dates'}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' }}>
                    {isTamil ? 'தொடக்க தேதி' : 'Start Date'}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #D1D5DB', fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' }}>
                    {isTamil ? 'முடிவு தேதி' : 'End Date'}
                  </label>
                  <input
                    type="date"
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #D1D5DB', fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' }}>
                    {isTamil ? 'மொத்த நாட்கள்' : 'Total Days'}
                  </label>
                  <div
                    style={{
                      background: PM,
                      border: `1.5px solid ${P}`,
                      color: P,
                      fontWeight: 800,
                      fontSize: 15,
                      padding: '9px 12px',
                      borderRadius: 8,
                      textAlign: 'center',
                    }}
                  >
                    {days} {isTamil ? 'நாட்கள்' : 'Days'}
                  </div>
                </div>
              </div>
              <div style={{ background: '#FFFBEB', borderRadius: 12, padding: '12px 16px', marginTop: 16, border: '1px solid #FDE68A', display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 16 }}>ℹ️</span>
                <p style={{ color: '#92400E', fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                  {isTamil
                    ? 'தொடக்க தேதியில் காலை 7:00 மணிக்குள் கருவி உங்கள் பண்ணைக்கு விநியோகிக்கப்படும். தேவைப்பட்டால் வாடகையை நீட்டிக்கலாம்.'
                    : 'Equipment will be delivered by 7:00 AM on start date. Rentals can be easily extended after booking.'}
                </p>
              </div>
            </div>

            {/* Delivery address */}
            <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #F3F4F6' }}>
              <h3 style={{ fontWeight: 800, fontSize: 16, color: '#111827', marginBottom: 20 }}>
                📍 {isTamil ? 'விநியோக முகவரி' : 'Delivery Address'}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>
                    {isTamil ? 'கிராமம் / ஊர்' : 'Village / Town'}
                  </label>
                  <input className="input-field" defaultValue="Raikot Village" style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #D1D5DB' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>
                    {isTamil ? 'மாவட்டம்' : 'District'}
                  </label>
                  <input className="input-field" defaultValue="Ludhiana" style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #D1D5DB' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>
                    {isTamil ? 'மாநிலம்' : 'State'}
                  </label>
                  <select className="input-field" style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #D1D5DB' }}>
                    <option>Punjab</option>
                    <option>Tamil Nadu</option>
                    <option>Maharashtra</option>
                    <option>Rajasthan</option>
                    <option>Karnataka</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>
                    PIN Code
                  </label>
                  <input className="input-field" defaultValue="141001" style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #D1D5DB' }} />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #F3F4F6' }}>
              <h3 style={{ fontWeight: 800, fontSize: 16, color: '#111827', marginBottom: 20 }}>
                💳 {isTamil ? 'கட்டண முறை' : 'Payment Method'}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12, marginBottom: 20 }}>
                {[
                  { id: 'upi', l: 'UPI', icon: '🔵' },
                  { id: 'card', l: 'Card', icon: '💳' },
                  { id: 'netbanking', l: 'Net Banking', icon: '🏦' },
                  { id: 'wallet', l: 'Wallet', icon: '👛' },
                ].map(({ id, l, icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPayMethod(id as any)}
                    style={{
                      padding: '12px',
                      borderRadius: 12,
                      border: payMethod === id ? `2px solid ${P}` : '1.5px solid #E5E7EB',
                      background: payMethod === id ? PM : '#fff',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: payMethod === id ? P : '#374151' }}>{l}</div>
                  </button>
                ))}
              </div>

              {payMethod === 'upi' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>
                    {isTamil ? 'UPI ஐடி உள்ளிடவும்' : 'Enter UPI ID'}
                  </label>
                  <input
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14 }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right: Summary Card */}
          <div>
            <div style={{ position: 'sticky', top: 120 }}>
              <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #F3F4F6', marginBottom: 16 }}>
                <h3 style={{ fontWeight: 800, fontSize: 16, color: '#111827', marginBottom: 20 }}>
                  {isTamil ? 'முன்பதிவு சுருக்கம்' : 'Booking Summary'}
                </h3>

                <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '16px', marginBottom: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[
                      { l: isTamil ? 'கருவி' : 'Equipment', v: eq.name },
                      { l: isTamil ? 'வகை' : 'Category', v: eq.cat },
                      { l: isTamil ? 'தொடக்க தேதி' : 'Start Date', v: startDate },
                      { l: isTamil ? 'முடிவு தேதி' : 'End Date', v: endDate },
                      { l: isTamil ? 'காலம்' : 'Duration', v: `${days} ${isTamil ? 'நாட்கள்' : 'days'}` },
                      { l: isTamil ? 'நிலை' : 'Status', v: isTamil ? 'உறுதிப்படுத்தப்பட்டது' : 'Confirmed' },
                    ].map(({ l, v }) => (
                      <div key={l}>
                        <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>{l}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginTop: 2 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#4B5563' }}>
                    <span>₹{pricePerDay.toLocaleString('en-IN')} × {days} {isTamil ? 'நாட்கள்' : 'days'}</span>
                    <strong style={{ color: '#111827' }}>₹{subtotal.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#4B5563' }}>
                    <span>{isTamil ? 'பாதுகாப்பு வைப்புத்தொகை (திருப்பித் தரத்தக்கது)' : 'Security deposit (refundable)'}</span>
                    <strong style={{ color: '#111827' }}>₹{deposit.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#4B5563' }}>
                    <span>GST (18%)</span>
                    <strong style={{ color: '#111827' }}>₹{tax.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ height: 1, background: '#E5E7EB' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>
                      {isTamil ? 'மொத்த தொகை' : 'Total Amount'}
                    </span>
                    <span style={{ fontSize: 22, fontWeight: 900, color: P }}>
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePay}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: 16,
                    borderRadius: 14,
                    fontWeight: 800,
                    background: P,
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <span>🔒</span>
                  <span>
                    {isTamil
                      ? `₹${total.toLocaleString('en-IN')} பாதுகாப்பாக செலுத்தவும்`
                      : `Pay ₹${total.toLocaleString('en-IN')} Securely`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
