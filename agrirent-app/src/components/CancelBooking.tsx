import { useState } from 'react'
import { AlertTriangle, Check, CircleX, X } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { BookingItem, cancelBookingRental } from '../lib/bookings'

interface Props {
  booking: BookingItem
  isOpen: boolean
  onClose: () => void
  onSuccess?: (updated: BookingItem) => void
}

export default function CancelBooking({ booking, isOpen, onClose, onSuccess }: Props) {
  const { t, isTamil } = useLanguage()
  const [successMsg, setSuccessMsg] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')

  if (!isOpen) return null

  const handleConfirmCancel = () => {
    const res = cancelBookingRental(booking.id)
    if (res.success && res.booking) {
      setSuccessMsg(
        isTamil
          ? `முன்பதிவு ${booking.id} வெற்றிகரமாக ரத்து செய்யப்பட்டது.`
          : `Booking ${booking.id} has been successfully cancelled.`
      )
      setTimeout(() => {
        if (onSuccess && res.booking) onSuccess(res.booking)
        onClose()
      }, 1400)
    } else {
      setErrorMsg(res.error || (isTamil ? 'ரத்து செய்ய முடியவில்லை' : 'Failed to cancel booking'))
    }
  }

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
        className="cancel-dialog card-shadow"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#fff',
          borderRadius: 20,
          border: '1px solid #E5E7EB',
          padding: '32px 28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          textAlign: 'center',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
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

        {successMsg ? (
          <div style={{ padding: '16px 0' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#DC2626',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Check size={30} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
              {isTamil ? 'முன்பதிவு ரத்து செய்யப்பட்டது' : 'Booking Cancelled'}
            </h3>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>{successMsg}</p>
          </div>
        ) : (
          <div>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                background: '#FEF2F2',
                color: '#DC2626',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
              {isTamil ? 'இந்த வாடகையை ரத்து செய்யவா?' : 'Cancel this rental?'}
            </h2>

            <div
              style={{
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: 12,
                padding: '12px 16px',
                margin: '16px 0',
                textAlign: 'left',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{booking.equipment}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>
                <strong>ID:</strong> {booking.id} • <strong>{isTamil ? 'உரிமையாளர்' : 'Owner'}:</strong> {booking.owner}
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>
                <strong>{isTamil ? 'காலம்' : 'Period'}:</strong> {booking.from} → {booking.to}
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5, margin: '0 0 20px' }}>
              {isTamil
                ? 'உங்கள் முன்பதிவு மற்ற விவசாயிகளுக்காக விடுவிக்கப்படும். இந்த செயலை மாற்ற முடியாது. மேலும் ரத்து செய்யப்பட்ட வாடகையை நீட்டிக்க முடியாது.'
                : 'Your booking will be released for other farmers. This action cannot be undone and cancelled rentals cannot be extended.'}
            </p>

            {errorMsg && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#DC2626',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '8px 12px',
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  background: '#fff',
                  border: '1.5px solid #D1D5DB',
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  color: '#374151',
                }}
              >
                {isTamil ? 'வாடகையை வைத்திருக்கவும்' : 'Keep rental'}
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  background: '#DC2626',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <CircleX size={16} />
                {isTamil ? 'முன்பதிவை ரத்து செய்' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
