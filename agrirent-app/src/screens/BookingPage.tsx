import { useState, useEffect } from 'react'
import { CalendarDays, CheckCircle2, ShieldCheck, MapPin, ArrowRight, AlertCircle, X, ShieldAlert, Check } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { catalog, findCatalogItem, CatalogItem, getCategoryFallback } from '../lib/catalog'
import { api, getStoredUser, SmsNotificationResult } from '../lib/api-client'
import { checkBookingVerification, BookingVerificationCheck } from '../lib/verification'

const P = '#2E7D32'
const PM = '#E8F5E9'

interface Props {
  onNavigate: (screen: string) => void
  selectedEquipment?: CatalogItem
}

export default function BookingPage({ onNavigate, selectedEquipment }: Props) {
  const { t, isTamil } = useLanguage()
  const currentUser = getStoredUser()

  const [eq, setEq] = useState<CatalogItem>(() => {
    if (selectedEquipment) return selectedEquipment
    if (typeof window !== 'undefined') {
      const urlId = new URLSearchParams(window.location.search).get('id')
      const storedId = urlId || window.localStorage.getItem('agrirent_selected_equipment_id')
      if (storedId) {
        const found = findCatalogItem(storedId)
        if (found) return found
      }
    }
    return (catalog[0] as CatalogItem)
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlId = new URLSearchParams(window.location.search).get('id')
      const storedId = urlId || (!selectedEquipment ? window.localStorage.getItem('agrirent_selected_equipment_id') : null)
      if (storedId) {
        const found = findCatalogItem(storedId)
        if (found) setEq(found)
      } else if (selectedEquipment) {
        setEq(selectedEquipment)
      }
    }
  }, [selectedEquipment])

  const [verification, setVerification] = useState<BookingVerificationCheck>(() => checkBookingVerification(currentUser))
  useEffect(() => {
    setVerification(checkBookingVerification(currentUser))
  }, [currentUser])

  const [payMethod, setPayMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi')
  const [upiId, setUpiId] = useState('farmer@upi')

  const [startDate, setStartDate] = useState('2026-09-26')
  const [endDate, setEndDate] = useState('2026-09-29')

  const [village, setVillage] = useState('Raikot Village')
  const [district, setDistrict] = useState('Ludhiana')
  const [stateName, setStateName] = useState('Punjab')
  const [pincode, setPincode] = useState('141001')

  // Review & Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [invoiceEmailSent, setInvoiceEmailSent] = useState(false)
  const [bookingSms, setBookingSms] = useState<SmsNotificationResult | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)

  // Dynamic days calculation
  const startMs = new Date(startDate).getTime()
  const endMs = new Date(endDate).getTime()
  const days = Math.max(1, !isNaN(startMs) && !isNaN(endMs) && endMs > startMs ? Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) : 3)

  const pricePerDay = eq.dailyRate || 1800
  const subtotal = pricePerDay * days
  const deposit = eq.securityDeposit || 2500
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + deposit + tax

  // Trigger Review Step
  const handleProceedToReview = () => {
    const currentVerif = checkBookingVerification(currentUser)
    setVerification(currentVerif)

    if (!currentVerif.canBook) {
      // Identity verification gating - prompt to complete verification
      return
    }

    setShowConfirmModal(true)
  }

  // Final Confirmed Booking Action
  const handleFinalConfirm = async () => {
    if (isSubmitting) return
    if (!currentUser || currentUser.role !== 'farmer') {
      onNavigate('login')
      return
    }
    setIsSubmitting(true)
    setBookingError(null)

    try {
      const result = await api.createBooking({ listingId: eq.id, startDate, endDate, days })

      setInvoiceEmailSent(result.invoiceEmailSent)
      setBookingSms(result.sms)
      setBookingSuccess(true)
      setTimeout(() => {
        onNavigate('payment-success')
      }, 1800)
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Booking could not be saved.')
    } finally {
      setIsSubmitting(false)
    }
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

          {/* Stepper */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {[
              { en: '1. Dates & Address', ta: '1. தேதிகள் & முகவரி' },
              { en: '2. Payment Mode', ta: '2. கட்டண முறை' },
              { en: '3. Review & Confirm', ta: '3. உறுதிப்படுத்துதல்' },
            ].map((step, i) => (
              <div key={step.en} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: i <= 1 ? P : '#E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      color: i <= 1 ? '#fff' : '#9CA3AF',
                    }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: i <= 1 ? 600 : 400, color: i <= 1 ? '#111827' : '#9CA3AF' }}>
                    {isTamil ? step.ta : step.en}
                  </span>
                </div>
                {i < 2 && <div style={{ width: 16, height: 2, background: i < 1 ? P : '#E5E7EB' }} />}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        {/* Verification Status Alert Banner */}
        <div style={{ marginBottom: 24 }}>
          {verification.canBook ? (
            <div
              style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: 14,
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Check size={18} strokeWidth={3} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#065F46' }}>
                    Identity Verification: Verified (Aadhaar Demo Prototype)
                  </div>
                  <div style={{ fontSize: 12, color: '#047857' }}>
                    Aadhaar ID: •••• •••• 4821 • Verified farmer profile • Eligible for instant machine dispatch & AgriSafe™ escrow.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                style={{
                  background: '#D1FAE5',
                  color: '#065F46',
                  border: '1px solid #6EE7B7',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                View Profile ID
              </button>
            </div>
          ) : (
            <div
              style={{
                background: verification.status === 'REJECTED' ? '#FEF2F2' : '#FFFBEB',
                border: `1.5px solid ${verification.status === 'REJECTED' ? '#FCA5A5' : '#FCD34D'}`,
                borderRadius: 14,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: verification.status === 'REJECTED' ? '#EF4444' : '#F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>
                    {verification.title}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#4B5563', lineHeight: 1.4 }}>
                    {verification.message}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>
                    {isTamil
                      ? 'கனரக விவசாய இயந்திரங்களை முன்பதிவு செய்ய ஆதார் மாதிரி சரிபார்ப்பு அவசியம்.'
                      : 'High-value agricultural machinery requires one-time identity verification check for insurance & asset security.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('profile')}
                style={{
                  background: verification.status === 'REJECTED' ? '#DC2626' : '#D97706',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {verification.actionLabel} →
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 32 }}>
          {/* Left: Booking form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Equipment summary with correct image */}
            <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <img
                  src={eq.imageUrl || eq.img}
                  alt={eq.name}
                  style={{ width: 130, height: 95, borderRadius: 12, objectFit: 'cover', background: '#F3F4F6', flexShrink: 0 }}
                  onError={(e) => {
                    e.currentTarget.src = getCategoryFallback(eq.category || eq.cat)
                  }}
                />
                <div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: P, fontWeight: 700, background: PM, borderRadius: 6, padding: '2px 8px' }}>
                      {eq.category || eq.cat}
                    </span>
                    {eq.brand && (
                      <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                        {eq.brand} {eq.model ? `• ${eq.model}` : ''}
                      </span>
                    )}
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
                  <input
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #D1D5DB' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>
                    {isTamil ? 'மாவட்டம்' : 'District'}
                  </label>
                  <input
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #D1D5DB' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>
                    {isTamil ? 'மாநிலம்' : 'State'}
                  </label>
                  <select
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #D1D5DB' }}
                  >
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
                  <input
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #D1D5DB' }}
                  />
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
                      { l: isTamil ? 'உரிமையாளர்' : 'Owner', v: eq.owner || 'Verified Partner' },
                    ].map(({ l, v }) => (
                      <div key={l}>
                        <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>{l}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</div>
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

                {verification.canBook ? (
                  <button
                    type="button"
                    onClick={handleProceedToReview}
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
                    <span>📋</span>
                    <span>
                      {isTamil ? 'முன்பதிவை மதிப்பாய்வு செய்து உறுதிப்படுத்துக' : 'Review & Confirm Booking'}
                    </span>
                  </button>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => onNavigate('profile')}
                      style={{
                        width: '100%',
                        padding: '14px',
                        fontSize: 15,
                        borderRadius: 14,
                        fontWeight: 700,
                        background: '#DC2626',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                      }}
                    >
                      <ShieldAlert size={18} />
                      <span>{verification.actionLabel}</span>
                    </button>
                    <div style={{ fontSize: 12, color: '#EF4444', textAlign: 'center', marginTop: 8, fontWeight: 600 }}>
                      ⚠️ {verification.title} - Booking blocked until verified
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION STEP MODAL (Requirement 4: Confirm Booking Step Before Final Booking) */}
      {showConfirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: 16,
          }}
        >
          <div
            className="card-shadow"
            style={{
              background: '#fff',
              borderRadius: 24,
              maxWidth: 580,
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#F8FAFC',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: PM, display: 'flex', alignItems: 'center', justifyContent: 'center', color: P, fontWeight: 800 }}>
                  ✓
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>
                    {isTamil ? 'முன்பதிவு உறுதிப்படுத்தல்' : 'Confirm Your Equipment Booking'}
                  </h3>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>
                    {isTamil ? 'கடைசி படி: கட்டணம் செலுத்துவதற்கு முன் விபரங்களை சரிபார்க்கவும்' : 'Step 3 of 3: Review all details before final confirmation'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isSubmitting && setShowConfirmModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  color: '#9CA3AF',
                  padding: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
              {bookingError && (
                <div role="alert" style={{ color: '#991B1B', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                  {bookingError}
                </div>
              )}
              {bookingSuccess && (
                <div role="status" style={{ color: '#166534', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                  <div>
                    {invoiceEmailSent
                      ? (isTamil ? 'முன்பதிவு உறுதி செய்யப்பட்டது. விலைப்பட்டியல் உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்டது.' : 'Booking confirmed. Invoice sent to your email.')
                      : (isTamil ? 'முன்பதிவு உறுதி செய்யப்பட்டது.' : 'Booking confirmed.')}
                  </div>
                  {bookingSms?.status === 'accepted' && (
                    <div>
                      {isTamil
                        ? `SMS கோரிக்கை Twilio-ஆல் ஏற்கப்பட்டது (${bookingSms.maskedPhone || '******'}).`
                        : `Twilio accepted the SMS request for ${bookingSms.maskedPhone || '******'}; delivery is not yet confirmed.`}
                    </div>
                  )}
                  {bookingSms?.status === 'pending' && (
                    <div role="status">
                      {isTamil
                        ? 'முன்பதிவு உறுதி செய்யப்பட்டது. SMS கோரிக்கை இன்னும் செயல்பாட்டில் உள்ளது; விநியோகம் உறுதிப்படுத்தப்படவில்லை.'
                        : 'Booking confirmed. The SMS request is still processing; delivery is not yet confirmed.'}
                    </div>
                  )}
                  {bookingSms?.status === 'delivered' && (
                    <div>
                      {isTamil
                        ? `SMS ${bookingSms.maskedPhone || '******'} எண்ணுக்கு வழங்கப்பட்டது.`
                        : `SMS delivery was confirmed for ${bookingSms.maskedPhone || '******'}.`}
                    </div>
                  )}
                  {bookingSms?.status === 'failed' && (
                    <div role="status">
                      {isTamil
                        ? 'முன்பதிவு உறுதி செய்யப்பட்டது, ஆனால் SMS அனுப்ப முடியவில்லை. உங்கள் பதிவு செய்யப்பட்ட தொலைபேசி எண் அல்லது SMS அமைப்பைச் சரிபார்க்கவும்.'
                        : 'Booking confirmed, but SMS notification could not be sent. Please check your registered phone number or SMS configuration.'}
                    </div>
                  )}
                  {bookingSms?.status === 'no_phone' && (
                    <div role="status">
                      {isTamil
                        ? 'SMS உறுதிப்படுத்தலைப் பெற உங்கள் சுயவிவரத்தில் தொலைபேசி எண்ணைச் சேர்க்கவும்.'
                        : 'Booking confirmed. Add a phone number to your profile to receive SMS confirmations.'}
                    </div>
                  )}
                  {bookingSms?.status === 'invalid_phone' && (
                    <div role="status">
                      {isTamil
                        ? 'முன்பதிவு உறுதி செய்யப்பட்டது, ஆனால் சுயவிவர தொலைபேசி எண் தவறானது; SMS அனுப்பப்படவில்லை.'
                        : 'Booking confirmed, but the phone number saved in your profile is invalid, so no SMS was sent.'}
                    </div>
                  )}
                </div>
              )}
              {/* Equipment Item Row */}
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  padding: '16px',
                  background: '#F9FAFB',
                  borderRadius: 16,
                  border: '1px solid #F3F4F6',
                  marginBottom: 20,
                  alignItems: 'center',
                }}
              >
                <img
                  src={eq.imageUrl || eq.img}
                  alt={eq.name}
                  style={{ width: 90, height: 75, objectFit: 'cover', borderRadius: 10, background: '#E5E7EB' }}
                  onError={(e) => {
                    e.currentTarget.src = getCategoryFallback(eq.category || eq.cat)
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: P, background: PM, padding: '2px 8px', borderRadius: 6 }}>
                      {eq.category || eq.cat}
                    </span>
                    {eq.brand && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                        {eq.brand}
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#111827', margin: '4px 0 2px' }}>
                    {eq.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>
                    👤 {isTamil ? 'உரிமையாளர்' : 'Owner'}: <strong>{eq.owner || 'Verified Equipment Partner'}</strong> ({eq.ownerPhone || '+91 98421 54321'})
                  </div>
                </div>
              </div>

              {/* Booking Specifications Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 12,
                  marginBottom: 20,
                  background: '#F8FAFC',
                  padding: 16,
                  borderRadius: 14,
                  border: '1px solid #E2E8F0',
                  fontSize: 13,
                }}
              >
                <div>
                  <span style={{ color: '#64748B', fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>
                    {isTamil ? 'வாடகை காலம்' : 'Rental Duration'}
                  </span>
                  <div style={{ fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                    {startDate} &nbsp;→&nbsp; {endDate}
                  </div>
                  <div style={{ fontSize: 12, color: P, fontWeight: 700 }}>({days} {isTamil ? 'நாட்கள்' : 'Days'})</div>
                </div>

                <div>
                  <span style={{ color: '#64748B', fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>
                    {isTamil ? 'தினசரி வாடகை' : 'Daily Rental Rate'}
                  </span>
                  <div style={{ fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                    ₹{pricePerDay.toLocaleString('en-IN')} / day
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748B', fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>
                    {isTamil ? 'விநியோக இடம்' : 'Delivery Destination'}
                  </span>
                  <div style={{ fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                    {village}, {district} ({pincode})
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748B', fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>
                    {isTamil ? 'கட்டண முறை' : 'Payment Method'}
                  </span>
                  <div style={{ fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                    {payMethod.toUpperCase()} {payMethod === 'upi' ? `(${upiId})` : ''}
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4B5563', marginBottom: 8 }}>
                  <span>Machinery Rental ({days} days × ₹{pricePerDay.toLocaleString('en-IN')})</span>
                  <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4B5563', marginBottom: 8 }}>
                  <span>AgriSafe™ Escrow Security Deposit (Refundable)</span>
                  <span style={{ fontWeight: 600 }}>₹{deposit.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4B5563', marginBottom: 12 }}>
                  <span>Applicable GST & Maintenance Cess (18%)</span>
                  <span style={{ fontWeight: 600 }}>₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ height: 1, background: '#E5E7EB', marginBottom: 12 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>
                    {isTamil ? 'இறுதி செலுத்த வேண்டிய தொகை' : 'Final Payable Amount'}
                  </span>
                  <span style={{ fontSize: 24, fontWeight: 900, color: P }}>
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Security guarantee notice */}
              <div
                style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: 12,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 12,
                  color: '#065F46',
                }}
              >
                <ShieldCheck size={18} style={{ flexShrink: 0 }} />
                <span>
                  {isTamil
                    ? 'முன்பதிவு உறுதி செய்யப்பட்டவுடன் தொகை அக்ரிசேஃப் (AgriSafe™) எஸ்க்ரோவில் வைக்கப்படும். கருவி ஆய்வு செய்யப்பட்ட பின்னரே உரிமையாளருக்கு அளிக்கப்படும்.'
                    : '100% Escrow Protected: Funds remain securely locked in AgriSafe™ escrow and are released to owner only after successful machinery handover.'}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 12,
                background: '#F8FAFC',
              }}
            >
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                style={{
                  padding: '12px 20px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#475569',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isTamil ? 'ரத்துசெய் / பின்செல்' : 'Cancel / Go Back'}
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalConfirm}
                style={{
                  padding: '12px 28px',
                  background: isSubmitting ? '#9CA3AF' : P,
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#fff',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 6px -1px rgba(46, 125, 50, 0.3)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                    <span>{isTamil ? 'உறுதிப்படுத்தப்படுகிறது...' : 'Confirming Booking...'}</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>{isTamil ? 'முன்பதிவை உறுதி செய்' : 'Confirm Booking'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
