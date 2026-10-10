import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { useLanguage } from '../context/LanguageContext'
import { api, getStoredUser, setAuthenticatedUser, type UserSession } from '../lib/api-client'
import { normalizeIndianMobileNumber } from '../lib/phone'
import {
  getUserVerification,
  setUserVerificationStatus,
  onVerificationChange,
  VerificationStatus,
  UserVerificationData,
} from '../lib/verification'
import {
  User,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Lock,
} from 'lucide-react'

const P = '#2E7D32'
const PM = '#E8F5E9'

interface Props {
  onNavigate: (screen: string) => void
}

export default function ProfilePage({ onNavigate }: Props) {
  const { t, isTamil } = useLanguage()
  const [currentUser, setCurrentUserState] = useState<UserSession | null>(() => getStoredUser())
  const userId = currentUser?.id || ''
  const [isEditingContact, setIsEditingContact] = useState(false)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false)
  const [isSavingContact, setIsSavingContact] = useState(false)
  const [contactError, setContactError] = useState('')
  const [contactSuccess, setContactSuccess] = useState('')

  const [verifData, setVerifData] = useState<UserVerificationData>(() => getUserVerification(userId))
  const [lastFour, setLastFour] = useState('4821')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const handleAuthChange = (event: Event) => {
      const updatedUser = (event as CustomEvent<UserSession | null>).detail
      setCurrentUserState(updatedUser)
    }
    window.addEventListener('agrirent_auth_change', handleAuthChange)

    api.getMe()
      .then(({ user }) => {
        if (!active) return
        setCurrentUserState(user)
        setAuthenticatedUser(user)
      })
      .catch((error: unknown) => {
        if (!active) return
        setContactError(
          error instanceof Error
            ? `${isTamil ? 'சுயவிவரத்தைப் புதுப்பிக்க முடியவில்லை:' : 'Could not refresh your profile:'} ${error.message}`
            : (isTamil ? 'சுயவிவரத்தைப் புதுப்பிக்க முடியவில்லை.' : 'Could not refresh your profile.')
        )
      })

    return () => {
      active = false
      window.removeEventListener('agrirent_auth_change', handleAuthChange)
    }
  }, [isTamil])

  useEffect(() => {
    setVerifData(getUserVerification(userId))
    const unsubscribe = onVerificationChange(() => {
      setVerifData(getUserVerification(userId))
    })
    return () => unsubscribe()
  }, [userId])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const handleSimulateStatus = (status: VerificationStatus) => {
    setUserVerificationStatus(userId, status, {
      lastFourDigits: lastFour,
    })
    setVerifData(getUserVerification(userId))
    showToast(`Verification status updated to: ${status.replace('_', ' ')}`)
  }

  const handleSubmitVerificationForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (lastFour.length < 4) {
      showToast('Please enter the last 4 digits')
      return
    }
    setUserVerificationStatus(userId, 'VERIFIED', {
      lastFourDigits: lastFour,
      remarks: 'Government ID verified successfully for agricultural rental.',
    })
    setVerifData(getUserVerification(userId))
    showToast('Identity verified successfully! You can now book equipment.')
  }

  const handleEditContact = async () => {
    setContactError('')
    setContactSuccess('')
    try {
      const { user } = await api.getMe()
      setCurrentUserState(user)
      setAuthenticatedUser(user)
      setEmail(user.email || '')
      setPhone(user.phone || '')
      setVerificationCode('')
      setEmailVerificationRequired(false)
      setIsEditingContact(true)
    } catch (error) {
      setContactError(
        error instanceof Error
          ? `${isTamil ? 'சுயவிவரத்தை ஏற்ற முடியவில்லை:' : 'Could not load your profile:'} ${error.message}`
          : (isTamil ? 'சுயவிவரத்தை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Could not load your profile. Please try again.')
      )
    }
  }

  const handleSaveContact = async () => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setContactError(isTamil ? 'செல்லுபடியாகும் மின்னஞ்சல் முகவரியை உள்ளிடவும்.' : 'Enter a valid email address.')
      return
    }
    const normalizedPhone = normalizeIndianMobileNumber(phone)
    if (!normalizedPhone) {
      setContactError(
        isTamil
          ? 'செல்லுபடியாகும் இந்திய மொபைல் எண்ணை உள்ளிடவும் (உதா. +91 98765 43210).'
          : 'Enter a valid Indian mobile number, such as +91 98765 43210.'
      )
      return
    }

    setIsSavingContact(true)
    setContactError('')
    setContactSuccess('')
    try {
      const result = await api.updateContactDetails(normalizedEmail, normalizedPhone)
      setCurrentUserState(result.user)
      setAuthenticatedUser(result.user)
      if (result.emailVerificationRequired) {
        setEmailVerificationRequired(true)
        setContactSuccess(
          isTamil
            ? `சரிபார்ப்பு குறியீடு ${normalizedEmail} முகவரிக்கு அனுப்பப்பட்டது. மின்னஞ்சல் மாற்றம் உறுதிப்படுத்தப்பட்ட பிறகே சேமிக்கப்படும்.`
            : `A verification code was sent to ${normalizedEmail}. Your login email will change only after verification.`
        )
      } else {
        const { user } = await api.getMe()
        setCurrentUserState(user)
        setAuthenticatedUser(user)
        setEmail(user.email || '')
        setPhone(user.phone || '')
        setIsEditingContact(false)
        setContactSuccess(isTamil ? 'தொலைபேசி எண் சேமிக்கப்பட்டது.' : 'Contact details saved successfully.')
      }
    } catch (error) {
      setContactError(error instanceof Error ? error.message : (isTamil ? 'தொடர்பு விவரங்களைச் சேமிக்க முடியவில்லை.' : 'Could not save contact details.'))
    } finally {
      setIsSavingContact(false)
    }
  }

  const handleVerifyContactEmail = async () => {
    if (!/^\d{6}$/.test(verificationCode.trim())) {
      setContactError(isTamil ? '6 இலக்க சரிபார்ப்பு குறியீட்டை உள்ளிடவும்.' : 'Enter the 6-digit verification code.')
      return
    }
    setIsSavingContact(true)
    setContactError('')
    try {
      await api.verifyContactEmail(verificationCode.trim())
      const { user } = await api.getMe()
      setCurrentUserState(user)
      setAuthenticatedUser(user)
      setEmail(user.email || '')
      setPhone(user.phone || '')
      setEmailVerificationRequired(false)
      setIsEditingContact(false)
      setContactSuccess(isTamil ? 'மின்னஞ்சல் சரிபார்க்கப்பட்டு தொடர்பு விவரங்கள் சேமிக்கப்பட்டன.' : 'Email verified and contact details saved successfully.')
    } catch (error) {
      setContactError(error instanceof Error ? error.message : (isTamil ? 'மின்னஞ்சலைச் சரிபார்க்க முடியவில்லை.' : 'Could not verify the email address.'))
    } finally {
      setIsSavingContact(false)
    }
  }

  const handleCancelContactEdit = async () => {
    if (emailVerificationRequired) {
      setIsSavingContact(true)
      setContactError('')
      try {
        await api.cancelContactEmailChange()
      } catch (error) {
        setContactError(error instanceof Error ? error.message : (isTamil ? 'மின்னஞ்சல் மாற்றத்தை ரத்து செய்ய முடியவில்லை.' : 'Could not cancel the pending email change.'))
        setIsSavingContact(false)
        return
      }
      setIsSavingContact(false)
    }
    setEmail(currentUser?.email || '')
    setPhone(currentUser?.phone || '')
    setVerificationCode('')
    setEmailVerificationRequired(false)
    setContactError('')
    setContactSuccess('')
    setIsEditingContact(false)
  }

  const getStatusBadge = () => {
    switch (verifData.status) {
      case 'VERIFIED':
        return (
          <span
            style={{
              background: '#DCFCE7',
              color: '#15803D',
              border: '1px solid #86EFAC',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <CheckCircle2 size={16} />
            <span>Identity Verification: Verified</span>
          </span>
        )
      case 'PENDING':
        return (
          <span
            style={{
              background: '#FEF3C7',
              color: '#B45309',
              border: '1px solid #FCD34D',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Clock size={16} />
            <span>Identity Verification: Pending</span>
          </span>
        )
      case 'REJECTED':
        return (
          <span
            style={{
              background: '#FEE2E2',
              color: '#DC2626',
              border: '1px solid #FCA5A5',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ShieldAlert size={16} />
            <span>Identity Verification: Action Required</span>
          </span>
        )
      case 'NOT_VERIFIED':
      default:
        return (
          <span
            style={{
              background: '#F3F4F6',
              color: '#4B5563',
              border: '1px solid #D1D5DB',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <AlertTriangle size={16} />
            <span>Identity Verification: Not Verified</span>
          </span>
        )
    }
  }

  if (!currentUser) {
    return (
      <div role="status" style={{ padding: 32, fontFamily: 'sans-serif', color: '#374151' }}>
        {isTamil ? 'உங்கள் சுயவிவரத்தை ஏற்றுகிறது…' : 'Loading your profile…'}
      </div>
    )
  }

  const roleLabel =
    currentUser.role === 'owner'
      ? isTamil ? 'உபகரண உரிமையாளர்' : 'Equipment Owner'
      : currentUser.role === 'admin'
      ? isTamil ? 'நிர்வாகி' : 'Administrator'
      : isTamil ? 'விவசாயி' : 'Farmer / Renter'

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 44px)', width: '100%', minWidth: 0, background: '#F9FAFB' }}>
      <Sidebar activeItem="Profile" onNavigate={onNavigate} role={currentUser.role} />

      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        {/* Header */}
        <div
          style={{
            background: '#fff',
            borderBottom: '1px solid #F3F4F6',
            padding: '20px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>
              {isTamil ? 'பயனர் சுயவிவரம் & சரிபார்ப்பு' : 'User Profile & Identity Verification'}
            </h1>
            <p style={{ color: '#6B7280', fontSize: 13, margin: '4px 0 0' }}>
              {isTamil
                ? 'உங்கள் கணக்கு விவரங்கள் மற்றும் ஆதார் மாதிரி சரிபார்ப்பு நிலை.'
                : 'Manage account credentials and prototype Aadhaar-style identity verification status.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => onNavigate(currentUser.role === 'owner' ? 'owner-dashboard' : currentUser.role === 'admin' ? 'admin-dashboard' : 'farmer-dashboard')}
              className="btn-outline"
              style={{ padding: '8px 16px', fontSize: 13 }}
            >
              ← {isTamil ? 'டாஷ்போர்டு' : 'Back to Dashboard'}
            </button>
          </div>
        </div>

        {/* Toast */}
        {toastMsg && (
          <div
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              background: '#111827',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>✨</span>
            <span>{toastMsg}</span>
          </div>
        )}

        <div style={{ padding: '28px', maxWidth: 1000 }}>
          {/* User Information Card */}
          <div
            className="card-shadow"
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 28,
              border: '1px solid #F3F4F6',
              marginBottom: 28,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 24 }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: PM,
                  color: P,
                  fontSize: 26,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${P}`,
                }}
              >
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>
                    {currentUser.name}
                  </h2>
                  <span
                    style={{
                      background: PM,
                      color: P,
                      fontSize: 11,
                      fontWeight: 800,
                      borderRadius: 6,
                      padding: '3px 8px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {roleLabel}
                  </span>
                </div>
                <p style={{ color: '#6B7280', fontSize: 13, margin: '4px 0 0' }}>
                  User ID: <code style={{ background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>{userId}</code>
                </p>
              </div>

              <div style={{ marginLeft: 'auto', display: 'grid', justifyItems: 'end', gap: 10 }}>
                {getStatusBadge()}
                {!isEditingContact && (
                  <button
                    type="button"
                    onClick={handleEditContact}
                    style={{
                      border: '1px solid #166534',
                      borderRadius: 9,
                      padding: '9px 14px',
                      background: P,
                      color: '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isTamil ? 'சுயவிவரத்தைத் திருத்து' : 'Edit Profile'}
                  </button>
                )}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
                padding: '16px',
                background: '#F9FAFB',
                borderRadius: 14,
                border: '1px solid #E5E7EB',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={16} color="#6B7280" />
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700 }}>Email</div>
                  {isEditingContact ? (
                    <input
                      aria-label={isTamil ? 'மின்னஞ்சல் முகவரி' : 'Email address'}
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={isSavingContact || emailVerificationRequired}
                      style={{ marginTop: 4, width: '100%', minWidth: 0, boxSizing: 'border-box', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 8 }}
                    />
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                      {currentUser.email || (isTamil ? 'சேர்க்கப்படவில்லை' : 'Not provided')}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Phone size={16} color="#6B7280" />
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700 }}>Phone</div>
                  {isEditingContact ? (
                    <input
                      aria-label={isTamil ? 'தொலைபேசி எண்' : 'Phone number'}
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      disabled={isSavingContact || emailVerificationRequired}
                      style={{ marginTop: 4, width: '100%', minWidth: 0, boxSizing: 'border-box', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 8 }}
                    />
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                      {currentUser.phone || (isTamil ? 'சேர்க்கப்படவில்லை' : 'Not provided')}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MapPin size={16} color="#6B7280" />
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700 }}>Location</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                    {currentUser?.location || 'Pollachi, Coimbatore, Tamil Nadu'}
                  </div>
                </div>
              </div>
              {isEditingContact && emailVerificationRequired && (
                <label style={{ display: 'grid', gap: 6, maxWidth: 360, marginTop: 16, fontSize: 13, fontWeight: 700, color: '#374151' }}>
                  {isTamil ? 'மின்னஞ்சல் சரிபார்ப்பு குறியீடு' : 'Email verification code'}
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={isSavingContact}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 11px', border: '1px solid #D1D5DB', borderRadius: 8 }}
                  />
                </label>
              )}
              {(contactError || contactSuccess) && (
                <p role={contactError ? 'alert' : 'status'} style={{ margin: '14px 0 0', color: contactError ? '#B91C1C' : P, fontSize: 13 }}>
                  {contactError || contactSuccess}
                </p>
              )}
              {isEditingContact && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={handleCancelContactEdit}
                    disabled={isSavingContact}
                    style={{ border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 14px', background: '#fff', color: '#374151', fontWeight: 700, cursor: isSavingContact ? 'wait' : 'pointer' }}
                  >
                    {isTamil ? 'ரத்து' : 'Cancel'}
                  </button>
                  {emailVerificationRequired && (
                    <button
                      type="button"
                      onClick={handleVerifyContactEmail}
                      disabled={isSavingContact}
                      style={{ border: '1px solid #166534', borderRadius: 8, padding: '9px 14px', background: P, color: '#fff', fontWeight: 700, cursor: isSavingContact ? 'wait' : 'pointer' }}
                    >
                      {isTamil ? 'மின்னஞ்சலைச் சரிபார்க்கவும்' : 'Verify Email'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveContact}
                    disabled={isSavingContact || emailVerificationRequired}
                    style={{ border: '1px solid #166534', borderRadius: 8, padding: '9px 14px', background: isSavingContact ? '#86A98F' : P, color: '#fff', fontWeight: 700, cursor: isSavingContact ? 'wait' : 'pointer' }}
                  >
                    {isSavingContact ? (isTamil ? 'சேமிக்கப்படுகிறது...' : 'Saving...') : (isTamil ? 'மாற்றங்களைச் சேமி' : 'Save Changes')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* IDENTITY VERIFICATION CARD (Requirement 5) */}
          <div
            className="card-shadow"
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 28,
              border: '1px solid #F3F4F6',
              marginBottom: 28,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <ShieldCheck size={24} color={P} />
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>
                {isTamil ? 'அடையாள சரிபார்ப்பு (மாதிரி முன்மாதிரி)' : 'Identity Verification (Aadhaar Prototype Demo)'}
              </h3>
            </div>

            <p style={{ color: '#4B5563', fontSize: 13, lineHeight: 1.5, margin: '0 0 20px' }}>
              {isTamil
                ? 'கனரக விவசாய இயந்திரங்களை பாதுகாப்பாக வாடகைக்கு எடுக்க அடையாள சரிபார்ப்பு தேவைப்படுகிறது. (பாதுகாப்பு விதிகளின்படி உண்மையான ஆதார் எண்கள் சேமிக்கப்படாது).'
                : 'Agricultural heavy equipment rental requires one-time identity verification check for asset safety and insurance. Note: In compliance with security standards, this is a prototype demonstration — no real Aadhaar data is processed or stored.'}
            </p>

            {/* Current Status Box */}
            <div
              style={{
                border: '1px solid #E5E7EB',
                borderRadius: 16,
                padding: '20px',
                background: '#FAFAFA',
                marginBottom: 24,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                    Document Type:
                  </span>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginTop: 2 }}>
                    {verifData.idType}
                  </div>
                </div>

                <div>{getStatusBadge()}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <div>
                  <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>
                    Masked ID Number
                  </span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginTop: 2 }}>
                    {verifData.maskedId || '•••• •••• ----'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>
                    Status Remarks
                  </span>
                  <div style={{ fontSize: 13, color: '#4B5563', marginTop: 2 }}>
                    {verifData.remarks || 'Standard prototype identity verification.'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>
                    Rental Eligibility
                  </span>
                  <div style={{ fontSize: 13, fontWeight: 700, color: verifData.status === 'VERIFIED' ? P : '#DC2626', marginTop: 2 }}>
                    {verifData.status === 'VERIFIED'
                      ? '✓ Instant Machine Booking Enabled'
                      : '✗ Booking Blocked (Verification Required)'}
                  </div>
                </div>
              </div>
            </div>

            {/* PROTOTYPE SIMULATOR CONTROLS (Easily test all prompt requirements) */}
            <div
              style={{
                background: '#F0FDF4',
                border: '1.5px solid #86EFAC',
                borderRadius: 16,
                padding: '20px 24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Sparkles size={18} color="#16A34A" />
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#14532D' }}>
                  {isTamil ? 'சரிபார்ப்பு முன்மாதிரி சோதனை பலகை (Prototype Simulator)' : 'Interactive Verification Simulator (Test All Booking Flows)'}
                </h4>
              </div>

              <p style={{ margin: '0 0 16px', fontSize: 12, color: '#166534', lineHeight: 1.45 }}>
                Switch statuses below to test how the <strong>Booking Page</strong> dynamically reacts to each state:
                <br />
                • <strong>VERIFIED</strong>: Allows proceeding to booking confirmation.
                <br />
                • <strong>PENDING</strong>: Displays verification pending alert and disables booking.
                <br />
                • <strong>REJECTED</strong>: Displays rejection alert and prevents booking.
                <br />
                • <strong>NOT_VERIFIED</strong>: Prompts farmer to complete verification.
              </p>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
                <button
                  type="button"
                  onClick={() => handleSimulateStatus('VERIFIED')}
                  style={{
                    background: verifData.status === 'VERIFIED' ? '#16A34A' : '#fff',
                    color: verifData.status === 'VERIFIED' ? '#fff' : '#16A34A',
                    border: '1.5px solid #16A34A',
                    borderRadius: 10,
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  🟢 Set as VERIFIED
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateStatus('PENDING')}
                  style={{
                    background: verifData.status === 'PENDING' ? '#D97706' : '#fff',
                    color: verifData.status === 'PENDING' ? '#fff' : '#D97706',
                    border: '1.5px solid #D97706',
                    borderRadius: 10,
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  🟡 Set as PENDING
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateStatus('REJECTED')}
                  style={{
                    background: verifData.status === 'REJECTED' ? '#DC2626' : '#fff',
                    color: verifData.status === 'REJECTED' ? '#fff' : '#DC2626',
                    border: '1.5px solid #DC2626',
                    borderRadius: 10,
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  🔴 Set as REJECTED
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateStatus('NOT_VERIFIED')}
                  style={{
                    background: verifData.status === 'NOT_VERIFIED' ? '#4B5563' : '#fff',
                    color: verifData.status === 'NOT_VERIFIED' ? '#fff' : '#4B5563',
                    border: '1.5px solid #6B7280',
                    borderRadius: 10,
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ⚪ Set as NOT_VERIFIED
                </button>
              </div>

              {/* Demo Submission Form */}
              <form onSubmit={handleSubmitVerificationForm} style={{ borderTop: '1px solid #BBF7D0', paddingTop: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#14532D', marginBottom: 6 }}>
                  Simulate Aadhaar Verification Submission:
                </label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #86EFAC', borderRadius: 8, padding: '0 12px' }}>
                    <span style={{ color: '#9CA3AF', fontSize: 13, letterSpacing: '2px', marginRight: 4 }}>•••• ••••</span>
                    <input
                      maxLength={4}
                      value={lastFour}
                      onChange={(e) => setLastFour(e.target.value.replace(/\D/g, ''))}
                      placeholder="4821"
                      style={{
                        border: 'none',
                        outline: 'none',
                        width: 50,
                        fontSize: 14,
                        fontWeight: 700,
                        padding: '8px 0',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      background: P,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Submit Verification
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
