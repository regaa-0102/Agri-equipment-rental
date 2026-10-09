import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import TrackingPanel from '../components/TrackingPanel'
import { getStoredBookings } from '../lib/bookings'

const P = '#2E7D32'
const PM = '#E8F5E9'

interface Props {
  onNavigate: (screen: string) => void
}

export default function PaymentSuccess({ onNavigate }: Props) {
  const { t } = useLanguage()
  const [showTracking, setShowTracking] = useState(false)
  const latestBooking = getStoredBookings()[0]

  return (
    <div style={{ width: '100%', minWidth: 0, background: '#F9FAFB', minHeight: 'calc(100vh - 44px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      {/* Confetti-like background elements */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        {['#66BB6A','#2E7D32','#A5D6A7','#C8E6C9','#4CAF50'].map((color, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() * 12 + 6,
            height: Math.random() * 12 + 6,
            background: color,
            borderRadius: '50%',
            opacity: 0.4,
            top: `${10 + i * 18}%`,
            left: `${5 + i * 20}%`,
          }} />
        ))}
        {['#2E7D32','#66BB6A','#81C784'].map((color, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() * 8 + 4,
            height: Math.random() * 8 + 4,
            background: color,
            borderRadius: '50%',
            opacity: 0.3,
            top: `${20 + i * 25}%`,
            right: `${5 + i * 18}%`,
          }} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 580 }}>
        {/* Success card */}
        <div className="card-shadow" style={{ background: '#fff', borderRadius: 28, padding: '44px 36px', textAlign: 'center', border: '1px solid #F3F4F6' }}>
          {/* Icon */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
            <div style={{ width: 88, height: 88, background: P, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#fff' }}>
              <span style={{ fontSize: 44, lineHeight: 1 }}>✓</span>
            </div>
            <div style={{ position: 'absolute', inset: -8, border: `3px solid ${PM}`, borderRadius: '50%', animation: 'pulse 2s infinite' }} />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: PM, borderRadius: 20, padding: '6px 16px', marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, background: P, borderRadius: '50%' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: P }}>{t('Payment Successful')}</span>
          </div>

          <h1 style={{ fontSize: 30, fontWeight: 900, color: '#111827', marginBottom: 8, letterSpacing: '-0.5px' }}>{t('Booking Confirmed! 🎉')}</h1>
          <p style={{ color: '#6B7280', fontSize: 15, lineHeight: 1.6, maxWidth: 420, margin: '0 auto 28px' }}>
            {t("Your equipment has been successfully booked. You'll receive a confirmation on your registered mobile and email.")}
          </p>

          {/* Booking details */}
          <div style={{ background: '#F9FAFB', borderRadius: 18, padding: '24px', marginBottom: 28, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{t('Booking Details')}</span>
              <span style={{ background: PM, color: P, fontSize: 12, fontWeight: 700, borderRadius: 8, padding: '4px 10px' }}>{t('Active')}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              {[
                { l: t('Booking ID'), v: latestBooking?.id || '#BK-2841', highlight: true },
                { l: t('Transaction ID'), v: 'TXN8829344512' },
                { l: t('Equipment'), v: latestBooking?.equipment || 'John Deere 5310 Tractor' },
                { l: t('Category'), v: t(latestBooking?.category || 'Tractor') },
                { l: t('Rental Start'), v: `${latestBooking?.from || '10 Aug 2026'}, 7:00 AM` },
                { l: t('Rental End'), v: `${latestBooking?.to || '13 Aug 2026'}, 7:00 AM` },
                { l: t('Duration'), v: `${latestBooking?.days || 3} ${t('Days')}` },
                { l: t('Location'), v: latestBooking?.location || 'Raikot Village, Ludhiana' },
                { l: t('Owner'), v: latestBooking?.owner || 'Gurpreet Singh' },
                { l: t('Payment Method'), v: 'UPI (farmer@upi)' },
              ].map(({ l, v, highlight }) => (
                <div key={l}>
                  <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: highlight ? 700 : 600, color: highlight ? P : '#374151' }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{ borderTop: '1px solid #E5E7EB', marginTop: 18, paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{t('Total Paid')}</span>
              <span style={{ fontWeight: 900, fontSize: 22, color: P }}>{latestBooking?.amount || '₹9,924'}</span>
            </div>
          </div>

          {/* What's next */}
          <div style={{ background: PM, borderRadius: 16, padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: P, marginBottom: 10 }}>{t('📋 What happens next?')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                '📱 SMS & WhatsApp confirmation sent to +91 98765 43210',
                '📧 Email receipt sent to rajesh@gmail.com',
                '🚜 Equipment will arrive by 7:00 AM on scheduled date',
                '📞 Owner Gurpreet will call 24 hours before delivery',
              ].map(step => (
                <div key={step} style={{ fontSize: 12, color: '#374151', display: 'flex', gap: 8 }}>
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowTracking(true)}
              style={{ flex: 1, minWidth: 160, padding: '13px', background: '#E3F2FD', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', color: '#1565C0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              📍 {t('Track Equipment')}
            </button>
            <button
              onClick={() => onNavigate('my-bookings')}
              className="btn-primary"
              style={{ flex: 1, minWidth: 160, padding: '13px', borderRadius: 12, fontSize: 13, fontWeight: 700 }}
            >
              📋 {t('Go to My Bookings')}
            </button>
          </div>

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            <button onClick={() => onNavigate('farmer-dashboard')} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
              {t('Back to Dashboard')}
            </button>
            <button onClick={() => onNavigate('home')} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
              {t('Browse More Equipment')}
            </button>
          </div>
        </div>

        {/* Help card */}
        <div className="card-shadow" style={{ background: '#fff', borderRadius: 16, padding: '18px 24px', marginTop: 16, border: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 26 }}>🆘</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{t('Need Help?')}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{t('Our 24/7 support team is here for you')}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ padding: '8px 16px', background: PM, border: 'none', color: P, borderRadius: 10, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>{t('📞 Call Support')}</button>
            <button style={{ padding: '8px 16px', background: '#F3F4F6', border: 'none', color: '#374151', borderRadius: 10, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>{t('💬 Chat')}</button>
          </div>
        </div>
      </div>

      {showTracking && latestBooking && (
        <TrackingPanel booking={latestBooking} onClose={() => setShowTracking(false)} />
      )}
    </div>
  )
}
