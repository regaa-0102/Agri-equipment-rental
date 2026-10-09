import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useLanguage } from '../context/LanguageContext'
import { getStoredUser } from '../lib/api-client'
import { addNotification } from '../lib/notifications'
import { Check, X, ShieldCheck, Calendar, MapPin, User, CheckCircle2 } from 'lucide-react'

const P = '#2E7D32'
const PM = '#E8F5E9'

interface Props {
  onNavigate: (screen: string) => void
}

interface OwnerRequest {
  id: string
  farmer: string
  farmerPhone: string
  farmerLocation: string
  equipment: string
  cat: string
  dates: string
  days: number
  totalAmount: string
  status: 'pending' | 'approved' | 'rejected'
}

const INITIAL_REQUESTS: OwnerRequest[] = [
  {
    id: 'REQ-4821',
    farmer: 'Muthukumar S.',
    farmerPhone: '+91 94431 87654',
    farmerLocation: 'Pollachi, Coimbatore',
    equipment: 'Mahindra Novo 755 DI 4WD',
    cat: 'Tractor',
    dates: '26 Sep → 29 Sep 2026',
    days: 3,
    totalAmount: '₹8,500',
    status: 'pending',
  },
  {
    id: 'REQ-4799',
    farmer: 'Sunita Patel',
    farmerPhone: '+91 98421 11223',
    farmerLocation: 'Raikot, Ludhiana',
    equipment: 'John Deere 5310 4WD',
    cat: 'Tractor',
    dates: '01 Oct → 04 Oct 2026',
    days: 3,
    totalAmount: '₹8,872',
    status: 'pending',
  },
  {
    id: 'REQ-4755',
    farmer: 'Mohan Reddy',
    farmerPhone: '+91 98765 43210',
    farmerLocation: 'Thanjavur Delta',
    equipment: 'CLAAS Crop Tiger 30',
    cat: 'Harvester',
    dates: '05 Oct → 10 Oct 2026',
    days: 5,
    totalAmount: '₹22,000',
    status: 'approved',
  },
]

export default function BookingRequestsPage({ onNavigate }: Props) {
  const { t, isTamil } = useLanguage()
  const currentUser = getStoredUser()
  const [requests, setRequests] = useState<OwnerRequest[]>(INITIAL_REQUESTS)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleApprove = (req: OwnerRequest) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, status: 'approved' } : r))
    )

    // Send notification to farmer
    addNotification({
      userId: req.id,
      title: isTamil ? `முன்பதிவு ஏற்கப்பட்டது: ${req.equipment}` : `Booking Approved: ${req.equipment}`,
      message: isTamil
        ? `உரிமையாளர் ${currentUser?.name || 'உரிமையாளர்'} உங்கள் ${req.equipment} முன்பதிவை (${req.dates}) உறுதிப்படுத்தியுள்ளார்.`
        : `Owner ${currentUser?.name || 'Equipment Owner'} has confirmed and approved your booking for ${req.equipment} (${req.dates}).`,
      type: 'booking_confirmed',
      relatedId: req.id,
    })

    showToast(`Booking ${req.id} approved! Farmer notified.`)
  }

  const handleReject = (req: OwnerRequest) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, status: 'rejected' } : r))
    )

    // Send notification to farmer
    addNotification({
      userId: req.id,
      title: isTamil ? `முன்பதிவு நிராகரிக்கப்பட்டது: ${req.equipment}` : `Booking Declined: ${req.equipment}`,
      message: isTamil
        ? `கருவி வேறு பணியில் இருப்பதால் உங்கள் முன்பதிவு ரத்து செய்யப்பட்டது. முழு வைப்புத்தொகை திரும்பப் பெறப்பட்டது.`
        : `Booking ${req.id} for ${req.equipment} could not be accommodated for these dates. 100% escrow refunded.`,
      type: 'booking_cancelled',
      relatedId: req.id,
    })

    showToast(`Booking ${req.id} declined.`)
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 44px)', width: '100%', minWidth: 0, background: '#F9FAFB' }}>
      <Sidebar activeItem="Booking Requests" onNavigate={onNavigate} role="owner" />

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>
                {isTamil ? 'விவசாயிகளின் முன்பதிவு கோரிக்கைகள்' : 'Farmer Booking Requests'}
              </h1>
              {pendingCount > 0 && (
                <span
                  style={{
                    background: '#EF4444',
                    color: '#fff',
                    borderRadius: 20,
                    padding: '2px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {pendingCount} pending
                </span>
              )}
            </div>
            <p style={{ color: '#6B7280', fontSize: 13, margin: '4px 0 0' }}>
              {isTamil
                ? 'உங்கள் விவசாயக் கருவிகளுக்கான வாடகை கோரிக்கைகளை ஏற்று உறுதிப்படுத்தவும்.'
                : 'Review incoming rental dispatch requests from verified farmers and manage your fleet.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('add-equipment')}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            + Add More Equipment
          </button>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {requests.map((req) => (
              <div
                key={req.id}
                className="card-shadow"
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  border: '1px solid #E5E7EB',
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{req.id}</span>
                    <span style={{ background: PM, color: P, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                      {req.cat}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        background:
                          req.status === 'approved'
                            ? '#DCFCE7'
                            : req.status === 'rejected'
                            ? '#FEE2E2'
                            : '#FEF3C7',
                        color:
                          req.status === 'approved'
                            ? '#15803D'
                            : req.status === 'rejected'
                            ? '#DC2626'
                            : '#B45309',
                      }}
                    >
                      ● {req.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
                    {req.equipment}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#4B5563', flexWrap: 'wrap' }}>
                    <span>👤 Farmer: <strong>{req.farmer}</strong> ({req.farmerPhone})</span>
                    <span>📍 Destination: {req.farmerLocation}</span>
                    <span>📅 Dates: {req.dates} ({req.days} days)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700 }}>Escrow Amount</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: P }}>{req.totalAmount}</div>
                  </div>

                  {req.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleReject(req)}
                        style={{
                          background: '#FEE2E2',
                          color: '#DC2626',
                          border: 'none',
                          borderRadius: 10,
                          padding: '8px 14px',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(req)}
                        style={{
                          background: P,
                          color: '#fff',
                          border: 'none',
                          borderRadius: 10,
                          padding: '8px 18px',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Check size={16} />
                        <span>Accept</span>
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 700, color: req.status === 'approved' ? '#15803D' : '#DC2626' }}>
                      {req.status === 'approved' ? '✓ Accepted' : '✗ Declined'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
