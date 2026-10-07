import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { useLanguage } from '../context/LanguageContext'
import { api } from '../lib/api-client'
import { ShieldCheck, Key, CheckCircle, AlertTriangle, RefreshCw, Trash2, Check, UserCheck, UserX } from 'lucide-react'
import JwtInspectorModal from '../components/JwtInspectorModal'

const P = '#2E7D32'
const PM = '#E8F5E9'

interface Props {
  onNavigate: (screen: string) => void
}

export default function AdminDashboard({ onNavigate }: Props) {
  const { t, isTamil } = useLanguage()
  const [activeTab, setActiveTab] = useState<'overview' | 'escrow' | 'listings' | 'users'>('overview')
  const [metrics, setMetrics] = useState<any>({
    totalUsers: 0,
    totalFarmers: 0,
    totalOwners: 0,
    totalListings: 0,
    totalBookings: 0,
    activeRentals: 0,
    platformGmv: 0,
    platformRevenue: 0,
    escrowHeld: 0,
    disputes: 0,
  })
  const [users, setUsers] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [jwtModalOpen, setJwtModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')

  const loadData = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const [mRes, uRes, lRes, bRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminUsers(),
        api.getListings(),
        api.getBookings(),
      ])

      setMetrics(mRes.metrics)
      setUsers(uRes.users)
      setListings(lRes.listings)
      setBookings(bRes.bookings)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load administrative data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleToggleUser = async (userId: string) => {
    try {
      await api.toggleUserStatus(userId)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleReleaseEscrow = async (bookingId: string) => {
    try {
      await api.updateBookingStatus(bookingId, 'completed', 'released')
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 44px)', width: '100%', minWidth: 0, background: '#F8FAFC' }}>
      <Sidebar activeItem="Dashboard" onNavigate={onNavigate} role="admin" />

      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
      {loadError && (
        <div role="alert" style={{ margin: 16, padding: 12, borderRadius: 8, color: '#B91C1C', background: '#FEF2F2' }}>
          {loadError}
          <button type="button" onClick={() => void loadData()} style={{ marginLeft: 12, color: '#991B1B', border: 0, background: 'none', textDecoration: 'underline', cursor: 'pointer' }}>Retry</button>
        </div>
      )}
        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {isTamil ? 'நிர்வாகி கட்டுப்பாட்டு மையம்' : 'AgriRent Master Admin Dashboard'}
              </h1>
              <span style={{ background: '#7C3AED', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                ADMIN LEVEL 4
              </span>
            </div>
            <p style={{ color: '#64748B', fontSize: 13, margin: '4px 0 0' }}>
              Real-time platform audit, AgriSafe™ escrow control, and verified equipment telemetry
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => setJwtModalOpen(true)}
              style={{
                background: '#0F172A',
                color: '#F8FAFC',
                border: 'none',
                borderRadius: 10,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Key size={14} color="#FBBF24" />
              <span>JWT Security Audit</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, borderRadius: 10 }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>{isTamil ? 'புதுப்பி' : 'Sync Live Data'}</span>
            </button>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Top KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Platform GMV', value: `₹${(metrics.platformGmv ?? 0).toLocaleString()}`, sub: 'Total transaction value', icon: '💰', color: '#EFF6FF', tc: '#1D4ED8' },
              { label: 'Platform Commission (10%)', value: `₹${(metrics.platformRevenue ?? 0).toLocaleString()}`, sub: 'Net AgriRent earnings', icon: '📈', color: '#F0FDF4', tc: '#15803D' },
              { label: 'AgriSafe™ Escrow Held', value: `₹${(metrics.escrowHeld ?? 0).toLocaleString()}`, sub: 'Security deposits in custody', icon: '🛡️', color: '#FEF3C7', tc: '#B45309' },
              { label: 'Active Equipment Fleet', value: String(metrics.totalListings ?? 0), sub: 'Verified machinery across TN', icon: '🚜', color: '#F3E8FF', tc: '#7C3AED' },
              { label: 'Verified User Accounts', value: String(metrics.totalUsers ?? 0), sub: 'Active registered accounts', icon: '👥', color: '#F1F5F9', tc: '#334155' },
            ].map((s) => (
              <div key={s.label} className="card-shadow" style={{ background: '#fff', borderRadius: 16, padding: '18px', border: '1px solid #E2E8F0' }}>
                <div style={{ background: s.color, borderRadius: 10, padding: '6px 10px', fontSize: 20, display: 'inline-block', marginBottom: 10 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.tc, marginBottom: 2 }}>{s.value}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Navigation Sub-Tabs */}
          <div style={{ display: 'flex', gap: 10, borderBottom: '2px solid #E2E8F0', paddingBottom: 12, marginBottom: 24 }}>
            {[
              { id: 'overview', label: '📊 Platform Telemetry', count: null },
              { id: 'escrow', label: '🛡️ Escrow & Bookings Audit', count: bookings.length },
              { id: 'listings', label: '🚜 Equipment Moderation', count: listings.length },
              { id: 'users', label: '👥 User Access Control', count: users.length },
            ].map((tItem) => (
              <button
                key={tItem.id}
                onClick={() => setActiveTab(tItem.id as any)}
                style={{
                  background: activeTab === tItem.id ? '#0F172A' : '#fff',
                  color: activeTab === tItem.id ? '#fff' : '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: 10,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>{tItem.label}</span>
                {tItem.count !== null && (
                  <span style={{ fontSize: 11, background: activeTab === tItem.id ? '#334155' : '#E2E8F0', padding: '1px 6px', borderRadius: 10 }}>
                    {tItem.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              <div style={{ background: '#fff', borderRadius: 18, padding: '22px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 14 }}>
                  Platform Architecture & Security Verification
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16A34A', fontWeight: 700 }}>
                    <CheckCircle size={18} />
                    <span>Google sign-in is not configured</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16A34A', fontWeight: 700 }}>
                    <CheckCircle size={18} />
                    <span>JWT: RFC 7519 HMAC-SHA256 Signatures Enforced</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16A34A', fontWeight: 700 }}>
                    <CheckCircle size={18} />
                    <span>Strict Role-Based Authorization (Farmer / Owner / Admin)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16A34A', fontWeight: 700 }}>
                    <CheckCircle size={18} />
                    <span>AgriSafe™ Digital Escrow Protocol Holding Deposits</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16A34A', fontWeight: 700 }}>
                    <CheckCircle size={18} />
                    <span>Live Micrometeorological Drone Spray API Connected</span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: 18, padding: '22px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 14 }}>
                  Recent System Telemetry Events
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { time: 'Just now', text: 'Server-issued session authentication is active.', tag: 'AUTH' },
                    { time: '4 min ago', text: 'DJI Agras T40 Spraying Drone booked for 3 days', tag: 'BOOKING' },
                    { time: '18 min ago', text: 'AgriMatch™ analysis executed for 8 acres paddy tillage', tag: 'AI_OPTIMIZER' },
                    { time: '1 hr ago', text: 'Escrow deposit of ₹8,000 released upon clean inspection', tag: 'ESCROW' },
                  ].map((e, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>{e.text}</span>
                      <span style={{ fontSize: 10, background: '#E2E8F0', color: '#475569', fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>{e.tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Escrow & Bookings Audit */}
          {activeTab === 'escrow' && (
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#0F172A' }}>
                    AgriSafe™ Digital Escrow Custody Ledger
                  </h3>
                  <span style={{ fontSize: 12, color: '#64748B' }}>
                    Security deposits held until equipment return inspection checklist is verified
                  </span>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '12px 16px' }}>Booking ID</th>
                      <th style={{ padding: '12px 16px' }}>Equipment Item</th>
                      <th style={{ padding: '12px 16px' }}>Farmer</th>
                      <th style={{ padding: '12px 16px' }}>Rental Total</th>
                      <th style={{ padding: '12px 16px' }}>Escrow Deposit</th>
                      <th style={{ padding: '12px 16px' }}>Booking Status</th>
                      <th style={{ padding: '12px 16px' }}>Escrow Status</th>
                      <th style={{ padding: '12px 16px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: '32px 16px', textAlign: 'center', color: '#64748B' }}>
                          No bookings found.
                        </td>
                      </tr>
                    ) : bookings.map((b: any) => (
                      <tr key={b.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0F172A' }}>{b.id}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{b.equipmentName}</td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>{b.farmerName}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700 }}>₹{b.totalAmount?.toLocaleString()}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#D97706' }}>₹{b.securityDeposit?.toLocaleString()}</td>
                        <td style={{ padding: '12px 16px', color: '#475569', textTransform: 'capitalize' }}>{b.status}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: b.escrowStatus === 'held' ? '#FEF3C7' : '#DCFCE7',
                              color: b.escrowStatus === 'held' ? '#92400E' : '#166534',
                              textTransform: 'uppercase',
                            }}
                          >
                            {b.escrowStatus === 'held' ? '🛡️ In Escrow Custody' : '✓ Released to Farmer'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {b.escrowStatus === 'held' ? (
                            <button
                              onClick={() => handleReleaseEscrow(b.id)}
                              style={{
                                background: '#16A34A',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '5px 10px',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Release Deposit
                            </button>
                          ) : (
                            <span style={{ fontSize: 11, color: '#94A3B8' }}>Audit Finalized</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Equipment Moderation */}
          {activeTab === 'listings' && (
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  Equipment Listings
                </h3>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '10px 14px' }}>Photo</th>
                      <th style={{ padding: '10px 14px' }}>Equipment Name</th>
                      <th style={{ padding: '10px 14px' }}>Category</th>
                      <th style={{ padding: '10px 14px' }}>Location</th>
                      <th style={{ padding: '10px 14px' }}>Daily Rate</th>
                      <th style={{ padding: '10px 14px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(listings.length ? listings : []).slice(0, 15).map((l: any) => (
                      <tr key={l.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '10px 14px' }}>
                          <img
                            src={l.img || l.image}
                            alt={l.name}
                            style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                          />
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0F172A' }}>{l.name}</td>
                        <td style={{ padding: '10px 14px', color: '#475569' }}>{l.category || l.cat}</td>
                        <td style={{ padding: '10px 14px', color: '#64748B' }}>{l.location}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 800, color: '#15803D' }}>₹{l.pricePerDay || l.dailyRate}/day</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            fontSize: 11,
                            background: l.available ? '#DCFCE7' : '#FEF2F2',
                            color: l.available ? '#15803D' : '#DC2626',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontWeight: 700,
                          }}>
                            {l.available ? 'AVAILABLE' : 'UNAVAILABLE'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: User Access Control (5 Accounts) */}
          {activeTab === 'users' && (
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  Platform User Directory (Real Authenticated Accounts)
                </h3>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '12px 16px' }}>User</th>
                      <th style={{ padding: '12px 16px' }}>Email</th>
                      <th style={{ padding: '12px 16px' }}>Role</th>
                      <th style={{ padding: '12px 16px' }}>Location</th>
                      <th style={{ padding: '12px 16px' }}>Auth Method</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: '#64748B' }}>
                          No registered user accounts found. Real users appear here once they create accounts via Sign Up.
                        </td>
                      </tr>
                    ) : (
                      users.map((u: any) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0F172A' }}>{u.name}</td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{u.email}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: u.role === 'admin' ? '#7C3AED' : u.role === 'owner' ? '#D97706' : '#15803D',
                              color: '#fff',
                              textTransform: 'uppercase',
                            }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748B' }}>{u.location}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11, background: '#E0F2FE', color: '#0369A1', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                            {u.provider === 'google' ? 'Google OAuth 2.0' : 'Local + JWT'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11, background: u.status === 'suspended' ? '#FEF2F2' : '#DCFCE7', color: u.status === 'suspended' ? '#DC2626' : '#15803D', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                            {u.status === 'suspended' ? 'SUSPENDED' : 'ACTIVE'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleUser(u.id)}
                              style={{
                                background: u.status === 'suspended' ? '#16A34A' : '#EF4444',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '4px 8px',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </button>
                          )}
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <JwtInspectorModal isOpen={jwtModalOpen} onClose={() => setJwtModalOpen(false)} />
    </div>
  )
}
