import { useState } from 'react'
import { CalendarDays, Check, Clock, AlertCircle, X } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { BookingItem } from '../lib/bookings'
import { api, SmsNotificationResult } from '../lib/api-client'

interface Props {
  booking: BookingItem
  isOpen: boolean
  onClose: () => void
  onSuccess?: (updated: BookingItem) => void
}

export default function ExtendRental({ booking, isOpen, onClose, onSuccess }: Props) {
  const { t, isTamil } = useLanguage()

  // Minimum allowed extension date is 1 day after current 'to' date
  const minDate = (() => {
    try {
      const d = new Date(booking.to)
      d.setDate(d.getDate() + 1)
      return d.toISOString().split('T')[0]
    } catch {
      return ''
    }
  })()

  const [newEndDate, setNewEndDate] = useState<string>('')
  const [isConfirming, setIsConfirming] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [successMsg, setSuccessMsg] = useState<string>('')
  const [extensionSms, setExtensionSms] = useState<SmsNotificationResult | null>(null)
  const [isExtending, setIsExtending] = useState(false)

  if (!isOpen) return null

  // Calculate days & cost
  let extraDays = 0
  let additionalCost = 0
  let updatedTotal = booking.totalNumeric

  if (newEndDate) {
    const curEnd = new Date(booking.to).getTime()
    const nextEnd = new Date(newEndDate).getTime()
    if (!isNaN(nextEnd) && nextEnd > curEnd) {
      extraDays = Math.round((nextEnd - curEnd) / (1000 * 60 * 60 * 24))
      additionalCost = extraDays * booking.dailyRate
      updatedTotal = booking.totalNumeric + additionalCost
    }
  }

  const handleApply = () => {
    setErrorMsg('')
    if (!newEndDate) {
      setErrorMsg(isTamil ? 'தயவுசெய்து புதிய முடிவு தேதியைத் தேர்ந்தெடுக்கவும்' : 'Please select a new end date')
      return
    }
    if (extraDays <= 0) {
      setErrorMsg(
        isTamil
          ? 'புதிய முடிவு தேதி தற்போதைய முடிவு தேதிக்கு பிறகு இருக்க வேண்டும்'
          : 'New end date must be after current end date'
      )
      return
    }
    setIsConfirming(true)
  }

  const handleConfirm = async () => {
    if (isExtending) return
    setIsExtending(true)
    try {
      const result = await api.extendBooking(booking.id, newEndDate)
      setExtensionSms(result.sms)
      const formattedDate = new Date(`${newEndDate}T00:00:00Z`).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      })
      setSuccessMsg(
        isTamil
          ? `வாடகை ${formattedDate} வரை வெற்றிகரமாக நீட்டிக்கப்பட்டது!`
          : `Rental successfully extended to ${formattedDate}!`
      )
      setTimeout(() => {
        if (onSuccess) onSuccess({
          ...booking,
          to: newEndDate,
          days: (booking.days || 0) + extraDays,
          totalNumeric: updatedTotal,
          amount: `₹${updatedTotal.toLocaleString()}`,
        })
        onClose()
      }, 1400)
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : (isTamil ? 'நீட்டிப்பு தோல்வியடைந்தது' : 'Extension failed'))
      setIsConfirming(false)
    } finally {
      setIsExtending(false)
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
        className="card-shadow"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 500,
          background: '#fff',
          borderRadius: 20,
          border: '1px solid #E5E7EB',
          padding: '28px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
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

        {/* Header */}
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
            <Clock size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>
              {isTamil ? 'வாடகையை நீட்டிக்கவும்' : 'Extend Rental'}
            </h2>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>
              {booking.equipment} • {booking.id}
            </p>
          </div>
        </div>

        {successMsg ? (
          <div
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              background: '#F0FDF4',
              borderRadius: 14,
              border: '1px solid #BBF7D0',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#2E7D32',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Check size={28} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#166534', margin: '0 0 6px' }}>
              {isTamil ? 'வெற்றிகரமாக நீட்டிக்கப்பட்டது' : 'Extension Applied!'}
            </h3>
            <p style={{ fontSize: 13, color: '#15803D', margin: 0 }}>{successMsg}</p>
            {extensionSms?.status === 'pending' && (
              <p role="status" style={{ fontSize: 12, color: '#92400E', margin: '8px 0 0' }}>
                Extension succeeded. The SMS request is still processing; delivery is not yet confirmed.
              </p>
            )}
            {extensionSms?.status === 'accepted' && (
              <p role="status" style={{ fontSize: 12, color: '#166534', margin: '8px 0 0' }}>
                Twilio accepted the SMS request for {extensionSms.maskedPhone || '******'}; delivery is not yet confirmed.
              </p>
            )}
            {extensionSms?.status === 'delivered' && (
              <p role="status" style={{ fontSize: 12, color: '#166534', margin: '8px 0 0' }}>
                SMS delivery was confirmed for {extensionSms.maskedPhone || '******'}.
              </p>
            )}
            {extensionSms?.status === 'failed' && (
              <p role="status" style={{ fontSize: 12, color: '#92400E', margin: '8px 0 0' }}>
                Extension succeeded, but the SMS could not be sent. Check your saved phone number or Twilio configuration.
              </p>
            )}
            {extensionSms?.status === 'no_phone' && (
              <p role="status" style={{ fontSize: 12, color: '#92400E', margin: '8px 0 0' }}>
                Extension succeeded. Add a phone number to your profile to receive SMS notifications.
              </p>
            )}
            {extensionSms?.status === 'invalid_phone' && (
              <p role="status" style={{ fontSize: 12, color: '#92400E', margin: '8px 0 0' }}>
                Extension succeeded, but the phone number saved in your profile is invalid, so no SMS was sent.
              </p>
            )}
          </div>
        ) : (
          <div>
            {/* Current Rental Summary */}
            <div
              style={{
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: 12,
                padding: '16px 18px',
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 8,
                }}
              >
                {isTamil ? 'தற்போதைய வாடகை காலம்' : 'Current Rental Period'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <div>
                  <span style={{ color: '#9CA3AF' }}>{isTamil ? 'தொடக்க தேதி' : 'Start Date'}: </span>
                  <strong style={{ color: '#111827' }}>{booking.from}</strong>
                </div>
                <div>
                  <span style={{ color: '#9CA3AF' }}>{isTamil ? 'முடிவு தேதி' : 'End Date'}: </span>
                  <strong style={{ color: '#2E7D32' }}>{booking.to}</strong>
                </div>
              </div>
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #E5E7EB', fontSize: 12, color: '#6B7280' }}>
                <span>{isTamil ? 'நாள் வாடகை கட்டணம்' : 'Daily Rate'}: </span>
                <strong style={{ color: '#111827' }}>₹{booking.dailyRate.toLocaleString('en-IN')}/day</strong>
              </div>
            </div>

            {/* Select New Date */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#374151',
                  marginBottom: 8,
                }}
              >
                {isTamil ? 'புதிய முடிவு தேதியைத் தேர்ந்தெடுக்கவும்' : 'Select New End Date'} *
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  border: '1.5px solid #D1D5DB',
                  borderRadius: 10,
                  padding: '10px 14px',
                  background: '#fff',
                }}
              >
                <CalendarDays size={18} style={{ color: '#2E7D32', flexShrink: 0 }} />
                <input
                  type="date"
                  min={minDate}
                  value={newEndDate}
                  onChange={(e) => {
                    setNewEndDate(e.target.value)
                    setErrorMsg('')
                    setIsConfirming(false)
                  }}
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#111827',
                  }}
                />
              </div>
              <small style={{ color: '#9CA3AF', fontSize: 11, display: 'block', marginTop: 4 }}>
                {isTamil
                  ? `குறைந்தபட்சம் ${minDate} அல்லது அதற்குப் பிறகு இருக்க வேண்டும்`
                  : `Must be on or after ${minDate}`}
              </small>
            </div>

            {/* Recalculation details */}
            {extraDays > 0 && (
              <div
                style={{
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: 12,
                  padding: '16px 18px',
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: '#374151' }}>{isTamil ? 'கூடுதல் நாட்கள்' : 'Additional Days'}:</span>
                  <strong style={{ color: '#166534' }}>+{extraDays} {isTamil ? 'நாட்கள்' : 'days'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: '#374151' }}>{isTamil ? 'கூடுதல் வாடகை கட்டணம்' : 'Additional Cost'}:</span>
                  <strong style={{ color: '#166534' }}>₹{additionalCost.toLocaleString('en-IN')}</strong>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: '1px solid #BBF7D0',
                    fontSize: 15,
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#111827' }}>
                    {isTamil ? 'புதுப்பிக்கப்பட்ட மொத்த தொகை' : 'Updated Total Amount'}:
                  </span>
                  <strong style={{ color: '#2E7D32', fontSize: 17, fontWeight: 800 }}>
                    ₹{updatedTotal.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>
            )}

            {errorMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: 10,
                  padding: '10px 14px',
                  marginBottom: 16,
                  color: '#DC2626',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Actions */}
            {isConfirming ? (
              <div style={{ marginTop: 20 }}>
                <div
                  style={{
                    background: '#FEF3C7',
                    border: '1px solid #FCD34D',
                    borderRadius: 10,
                    padding: '12px 14px',
                    marginBottom: 16,
                    fontSize: 13,
                    color: '#92400E',
                  }}
                >
                  <strong>{isTamil ? 'உறுதிப்படுத்தல்' : 'Confirmation'}:</strong>{' '}
                  {isTamil
                    ? `வாடகையை ${newEndDate} வரை நீட்டிக்க உறுதியாக உள்ளீர்களா? கூடுதல் கட்டணம் ₹${additionalCost.toLocaleString('en-IN')}.`
                    : `Confirm rental extension to ${newEndDate} for an additional ₹${additionalCost.toLocaleString('en-IN')}?`}
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsConfirming(false)}
                    style={{
                      padding: '10px 18px',
                      background: '#fff',
                      border: '1px solid #D1D5DB',
                      borderRadius: 10,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      color: '#4B5563',
                    }}
                  >
                    {isTamil ? 'பின்செல்' : 'Back'}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isExtending}
                    style={{
                      padding: '10px 22px',
                      background: isExtending ? '#9CA3AF' : '#2E7D32',
                      border: 'none',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: isExtending ? 'wait' : 'pointer',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Check size={16} />
                    {isExtending
                      ? (isTamil ? 'செயல்படுத்தப்படுகிறது...' : 'Applying...')
                      : (isTamil ? 'நீட்டிப்பை உறுதிப்படுத்து' : 'Confirm Extension')}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '10px 18px',
                    background: '#fff',
                    border: '1px solid #D1D5DB',
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    color: '#4B5563',
                  }}
                >
                  {isTamil ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={!newEndDate || extraDays <= 0}
                  style={{
                    padding: '10px 22px',
                    background: !newEndDate || extraDays <= 0 ? '#9CA3AF' : '#2E7D32',
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: !newEndDate || extraDays <= 0 ? 'not-allowed' : 'pointer',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <CalendarDays size={16} />
                  {isTamil ? 'வாடகையை நீட்டிக்கவும்' : 'Extend Rental'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
