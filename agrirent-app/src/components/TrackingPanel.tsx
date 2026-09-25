import { CheckCircle2, Clock, MapPin, Phone, ShieldCheck, Truck, X } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { BookingItem, TRACKING_STAGES } from '../lib/bookings'

interface Props {
  booking: BookingItem
  isOpen: boolean
  onClose: () => void
}

export default function TrackingPanel({ booking, isOpen, onClose }: Props) {
  const { isTamil } = useLanguage()

  if (!isOpen) return null

  // Calculate remaining days
  const now = new Date().getTime()
  const end = new Date(booking.to).getTime()
  const remainingDays = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)))

  const currentStageIdx = Math.min(booking.trackingStage || 3, TRACKING_STAGES.length - 1)

  return (
    <div
      className="cancel-dialog-backdrop"
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(17, 24, 39, 0.6)',
        backdropFilter: 'blur(4px)',
        padding: 16,
      }}
    >
      <div
        className="card-shadow"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 580,
          background: '#fff',
          borderRadius: 24,
          border: '1px solid #E5E7EB',
          padding: '28px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: '#F3F4F6',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#6B7280',
          }}
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#E8F5E9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2E7D32',
            }}
          >
            <Truck size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>
              {isTamil ? 'உபகரணத்தை கண்காணிக்கவும்' : 'Track Equipment'}
            </h2>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '3px 0 0' }}>
              ID: {booking.id} • {booking.cat}
            </p>
          </div>
        </div>

        {/* Equipment summary card */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            alignItems: 'center',
          }}
        >
          <img
            src={booking.img}
            alt={booking.equipment}
            style={{
              width: 88,
              height: 66,
              borderRadius: 10,
              objectFit: 'cover',
              background: '#E5E7EB',
              flexShrink: 0,
            }}
            onError={(e) => {
              // fallback image if offline
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1533062618053-d51e617307ec?auto=format&fit=crop&w=400&h=300&q=80'
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginBottom: 4 }}>
              {booking.equipment}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <ShieldCheck size={14} style={{ color: '#2E7D32' }} />
              <span>{isTamil ? 'உரிமையாளர்' : 'Owner'}: <strong>{booking.owner}</strong></span>
            </div>
            {booking.ownerPhone && (
              <div style={{ fontSize: 12, color: '#4B5563', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={13} style={{ color: '#2E7D32' }} />
                <span>{booking.ownerPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Real-time stats row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 14,
              padding: '12px 16px',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: 2 }}>
              {isTamil ? 'மீதமுள்ள வாடகை காலம்' : 'Remaining Rental'}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#15803D' }}>
              {booking.status === 'completed'
                ? isTamil ? 'நிறைவடைந்தது' : 'Completed'
                : booking.status === 'cancelled'
                ? isTamil ? 'ரத்து செய்யப்பட்டது' : 'Cancelled'
                : `${remainingDays} ${isTamil ? 'நாட்கள்' : 'Days'}`}
            </div>
            <div style={{ fontSize: 11, color: '#166534', marginTop: 2 }}>
              {booking.from} → {booking.to}
            </div>
          </div>

          <div
            style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 14,
              padding: '12px 16px',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 2 }}>
              {isTamil ? 'கடைசியாக அறியப்பட்ட இடம்' : 'Last Known Location'}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={14} style={{ color: '#DC2626', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {booking.lastLocation || booking.location}
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
              {isTamil ? 'செயற்கைக்கோள் டெமோ நிலை' : 'Simulated GPS tracking'}
            </div>
          </div>
        </div>

        {/* Visual Stage Progression Timeline */}
        <div style={{ marginBottom: 20 }}>
          <h3
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#374151',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 16,
            }}
          >
            {isTamil ? 'வாடகை முன்னேற்றம்' : 'Rental Progress'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
            {TRACKING_STAGES.map((stg, i) => {
              const isPast = booking.status === 'completed' ? true : i < currentStageIdx
              const isCurrent = booking.status !== 'completed' && booking.status !== 'cancelled' && i === currentStageIdx
              const isCancelled = booking.status === 'cancelled'

              return (
                <div
                  key={stg.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    position: 'relative',
                    paddingBottom: i < TRACKING_STAGES.length - 1 ? 20 : 0,
                  }}
                >
                  {/* Vertical connecting line */}
                  {i < TRACKING_STAGES.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 13,
                        top: 24,
                        width: 2,
                        bottom: 0,
                        background: isPast ? '#2E7D32' : '#E5E7EB',
                        zIndex: 1,
                      }}
                    />
                  )}

                  {/* Icon Node */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: isPast
                        ? '#2E7D32'
                        : isCurrent
                        ? '#E8F5E9'
                        : '#F3F4F6',
                      border: isCurrent
                        ? '2px solid #2E7D32'
                        : isPast
                        ? 'none'
                        : '1.5px solid #D1D5DB',
                      color: isPast ? '#fff' : isCurrent ? '#2E7D32' : '#9CA3AF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      zIndex: 2,
                      flexShrink: 0,
                    }}
                  >
                    {isPast ? <CheckCircle2 size={16} /> : isCurrent ? <Clock size={14} /> : i + 1}
                  </div>

                  {/* Stage Details */}
                  <div style={{ flex: 1, paddingTop: 3 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: isCurrent ? 800 : isPast ? 700 : 500,
                        color: isCancelled
                          ? '#9CA3AF'
                          : isCurrent
                          ? '#2E7D32'
                          : isPast
                          ? '#111827'
                          : '#6B7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <span>{isTamil ? stg.ta : stg.en}</span>
                      {isCurrent && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            background: '#2E7D32',
                            color: '#fff',
                            borderRadius: 10,
                            padding: '2px 8px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {isTamil ? 'தற்போதைய நிலை' : 'Current Stage'}
                        </span>
                      )}
                    </div>
                    {isCurrent && (
                      <p style={{ fontSize: 12, color: '#4B5563', margin: '4px 0 0' }}>
                        {isTamil
                          ? 'உபகரணம் இப்போது உங்கள் இருப்பிடத்தை நோக்கி வந்துகொண்டிருக்கிறது.'
                          : 'Equipment is en route and estimated to arrive at your farm shortly.'}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Close Button */}
        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 24px',
              background: '#2E7D32',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isTamil ? 'மூடு' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}
