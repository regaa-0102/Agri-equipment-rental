import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { useLanguage } from '../context/LanguageContext'
import { api, getStoredUser, UserSession } from '../lib/api-client'
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
  const [emailDraft, setEmailDraft] = useState(currentUser?.email || '')
  const [phoneDraft, setPhoneDraft] = useState(currentUser?.phone || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [verifData, setVerifData] = useState<UserVerificationData>(() => getUserVerification(userId))
  const [lastFour, setLastFour] = useState('4821')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  useEffect(() => {
    setVerifData(getUserVerification(userId))
    const unsubscribe = onVerificationChange(() => {
      setVerifData(getUserVerification(userId))
    })
    return () => unsubscribe()
  }, [userId])

  useEffect(() => {
    setEmailDraft(currentUser?.email || '')
    setPhoneDraft(currentUser?.phone || '')
  }, [currentUser?.id, currentUser?.email, currentUser?.phone])

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!currentUser || currentUser.role !== 'farmer') return

    const updates: { email?: string; phone?: string } = {}
    const email = emailDraft.trim().toLowerCase()
    const phone = phoneDraft.trim()
    if (email !== currentUser.email) updates.email = email
    if (phone !== (currentUser.phone || '')) updates.phone = phone

    if (!Object.keys(updates).length) {
      setProfileMessage({ type: 'error', text: isTamil ? 'சேமிக்க புதிய மாற்றங்கள் இல்லை.' : 'There are no changes to save.' })
      return
    }

    setProfileSaving(true)
    setProfileMessage(null)
    try {
      const { user } = await api.updateProfile(updates)
      setCurrentUserState(user)
      setEmailDraft(user.email)
      setPhoneDraft(user.phone || '')
      setProfileMessage({ type: 'success', text: isTamil ? 'சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது.' : 'Profile updated successfully.' })
    } catch (error) {
      setProfileMessage({
        type: 'error',
        text: error instanceof Error ? error.message : (isTamil ? 'சுயவிவரத்தை புதுப்பிக்க முடியவில்லை.' : 'Could not update profile. Please try again.'),
      })
    } finally {
      setProfileSaving(false)
    }
  }

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

  if (!currentUser) return null

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

              <div style={{ marginLeft: 'auto' }}>
                {getStatusBadge()}
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
              {currentUser.role === 'farmer' ? (
                <form onSubmit={handleProfileSubmit} style={{ gridColumn: '1 / -1', display: 'grid', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                    <label style={{ display: 'grid', gap: 6, fontSize: 11, color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Mail size={15} />Email</span>
                      <input
                        type="email"
                        autoComplete="email"
                        value={emailDraft}
                        onChange={(event) => setEmailDraft(event.target.value)}
                        maxLength={254}
                        aria-label="Email address"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 8, color: '#111827', fontSize: 14, textTransform: 'none' }}
                      />
                    </label>
                    <label style={{ display: 'grid', gap: 6, fontSize: 11, color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Phone size={15} />Phone Number</span>
                      <input
                        type="tel"
                        autoComplete="tel"
                        value={phoneDraft}
                        onChange={(event) => setPhoneDraft(event.target.value)}
                        placeholder="+919876543210"
                        aria-label="Phone number"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 8, color: '#111827', fontSize: 14, textTransform: 'none' }}
                      />
                    </label>
                  </div>
                  {profileMessage && (
                    <p role="status" style={{ margin: 0, color: profileMessage.type === 'success' ? '#15803D' : '#B91C1C', fontSize: 13, fontWeight: 600 }}>
                      {profileMessage.text}
                    </p>
                  )}
                  <div>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={profileSaving}
                      style={{ background: P, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: profileSaving ? 'wait' : 'pointer', opacity: profileSaving ? 0.7 : 1 }}
                    >
                      {profileSaving ? (isTamil ? 'சேமிக்கிறது...' : 'Saving...') : (isTamil ? 'மாற்றங்களைச் சேமி' : 'Save Changes')}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Mail size={16} color="#6B7280" />
                    <div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700 }}>Email</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{currentUser.email}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Phone size={16} color="#6B7280" />
                    <div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700 }}>Phone</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{currentUser.phone || '—'}</div>
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MapPin size={16} color="#6B7280" />
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700 }}>Location</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                    {currentUser?.location || 'Pollachi, Coimbatore, Tamil Nadu'}
                  </div>
                </div>
              </div>
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
