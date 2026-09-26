import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useLanguage } from '../context/LanguageContext'
import { getStoredUser } from '../lib/api-client'
import { getStoredBookings } from '../lib/bookings'
import { CreditCard, ShieldCheck, ArrowDownRight, Clock, CheckCircle2, Download, AlertCircle } from 'lucide-react'

const P = '#2E7D32'
const PM = '#E8F5E9'

interface Props {
  onNavigate: (screen: string) => void
}

export default function PaymentsPage({ onNavigate }: Props) {
  const { t, isTamil } = useLanguage()
  const currentUser = getStoredUser()
  const role = currentUser?.role || 'farmer'
  const bookings = getStoredBookings()

  const [activeTab, setActiveTab] = useState<'all' | 'escrow' | 'completed'>('all')

  const totalSpent = bookings.reduce((sum, b) => sum + (b.totalNumeric || 0), 0)
  const escrowHeld = bookings.filter((b) => b.status === 'active' || b.status === 'confirmed').reduce((sum, b) => sum + 2500, 0)

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 44px)', width: '100%', minWidth: 0, background: '#F9FAFB' }}>
      <Sidebar activeItem="Payments" onNavigate={onNavigate} role={role} />

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
              {isTamil ? 'கட்டணங்கள் & எஸ்க்ரோ இருப்பு' : 'Payments & AgriSafe™ Escrow Ledger'}
            </h1>
            <p style={{ color: '#6B7280', fontSize: 13, margin: '4px 0 0' }}>
              {isTamil
                ? 'பாதுகாப்பான கட்டண பரிவர்த்தனைகள் மற்றும் வைப்புத்தொகை வரலாறு.'
                : '100% digital escrow ledger protecting rental deposits and farm transactions.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => onNavigate('my-bookings')}
              className="btn-outline"
              style={{ padding: '8px 16px', fontSize: 13 }}
            >
              {isTamil ? 'முன்பதிவுகள் காண்க' : 'View Bookings'}
            </button>
          </div>
        </div>

        <div style={{ padding: '28px', maxWidth: 1100 }}>
          {/* Summary Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 28 }}>
            <div className="card-shadow" style={{ background: '#fff', borderRadius: 18, padding: 22, border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#6B7280' }}>
                  {isTamil ? 'மொத்த வாடகை கட்டணம்' : 'Total Rental Volume'}
                </span>
                <span style={{ background: PM, color: P, padding: '4px 8px', borderRadius: 8, fontSize: 18 }}>💳</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#111827' }}>
                ₹{totalSpent.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                Across {bookings.length} machinery transactions
              </div>
            </div>

            <div className="card-shadow" style={{ background: '#fff', borderRadius: 18, padding: 22, border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#6B7280' }}>
                  {isTamil ? 'எஸ்க்ரோவில் உள்ள வைப்புத்தொகை' : 'AgriSafe™ Escrow Held'}
                </span>
                <span style={{ background: '#DCFCE7', color: '#15803D', padding: '4px 8px', borderRadius: 8, fontSize: 18 }}>🛡️</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: P }}>
                ₹{escrowHeld.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 12, color: '#15803D', marginTop: 4, fontWeight: 600 }}>
                100% refundable upon machine return
              </div>
            </div>

            <div className="card-shadow" style={{ background: '#fff', borderRadius: 18, padding: 22, border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#6B7280' }}>
                  {isTamil ? 'பாதுகாப்பு நிலை' : 'Escrow Protection Status'}
                </span>
                <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '4px 8px', borderRadius: 8, fontSize: 18 }}>🔒</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0284C7' }}>
                Protected & Insured
              </div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                Instant refund guarantee via UPI/Netbanking
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111827' }}>
                {isTamil ? 'பரிவர்த்தனை வரலாறு' : 'Recent Payment Transactions'}
              </h3>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>Showing {bookings.length} payments</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#6B7280', fontSize: 11, textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px 24px' }}>Transaction ID</th>
                    <th style={{ padding: '14px 16px' }}>Equipment</th>
                    <th style={{ padding: '14px 16px' }}>Owner</th>
                    <th style={{ padding: '14px 16px' }}>Dates</th>
                    <th style={{ padding: '14px 16px' }}>Amount</th>
                    <th style={{ padding: '14px 16px' }}>Escrow Status</th>
                    <th style={{ padding: '14px 24px' }}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '16px 24px', fontWeight: 700, color: '#111827' }}>
                        TXN-{b.id}
                      </td>
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>{b.equipment}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>{b.cat}</div>
                      </td>
                      <td style={{ padding: '16px 16px', color: '#4B5563' }}>
                        {b.owner}
                      </td>
                      <td style={{ padding: '16px 16px', color: '#6B7280' }}>
                        {b.from} → {b.to}
                      </td>
                      <td style={{ padding: '16px 16px', fontWeight: 800, color: P }}>
                        {b.amount}
                      </td>
                      <td style={{ padding: '16px 16px' }}>
                        <span
                          style={{
                            background: '#DCFCE7',
                            color: '#15803D',
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <ShieldCheck size={12} />
                          <span>AgriSafe™ Held</span>
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <button
                          type="button"
                          style={{
                            background: '#F3F4F6',
                            border: 'none',
                            borderRadius: 6,
                            padding: '4px 10px',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: '#374151',
                          }}
                        >
                          Download PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
