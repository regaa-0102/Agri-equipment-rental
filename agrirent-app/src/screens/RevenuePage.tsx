import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useLanguage } from '../context/LanguageContext'
import { getStoredUser } from '../lib/api-client'
import { DollarSign, TrendingUp, ArrowUpRight, ShieldCheck, CheckCircle2, Download } from 'lucide-react'

const P = '#2E7D32'
const PM = '#E8F5E9'

interface Props {
  onNavigate: (screen: string) => void
}

export default function RevenuePage({ onNavigate }: Props) {
  const { t, isTamil } = useLanguage()
  const currentUser = getStoredUser()
  if (!currentUser) return null
  const role = currentUser.role

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 44px)', width: '100%', minWidth: 0, background: '#F9FAFB' }}>
      <Sidebar activeItem="Revenue" onNavigate={onNavigate} role={role} />

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
              {isTamil ? 'வருவாய் & வங்கி தீர்வு' : 'Revenue & Escrow Settlements'}
            </h1>
            <p style={{ color: '#6B7280', fontSize: 13, margin: '4px 0 0' }}>
              {isTamil
                ? 'உங்கள் உபகரண வாடகை வருவாய் மற்றும் தானியங்கி வங்கி பரிமாற்ற பதிவுகள்.'
                : 'Direct fleet earnings, escrow payout schedules, and bank settlements.'}
            </p>
          </div>

          <button
            type="button"
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            Request Payout
          </button>
        </div>

        <div style={{ padding: '28px', maxWidth: 1000 }}>
          {/* Revenue KPI Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
            {[
              { label: 'Total Earnings (YTD)', val: '₹1,84,500', sub: '↑ 28% from previous season', color: PM, text: P },
              { label: 'Settled to Bank', val: '₹1,56,000', sub: 'HDFC Bank •••• 9012', color: '#E0F2FE', text: '#0369A1' },
              { label: 'In Escrow Settlement', val: '₹28,500', sub: 'Releasing after machine return', color: '#FEF3C7', text: '#B45309' },
            ].map((k) => (
              <div key={k.label} className="card-shadow" style={{ background: '#fff', borderRadius: 18, padding: 22, border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 8 }}>{k.label}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: k.text }}>{k.val}</div>
                <div style={{ fontSize: 12, color: '#4B5563', marginTop: 6 }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Monthly Earnings Chart */}
          <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 20px' }}>
              Monthly Revenue Performance (2026)
            </h3>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, height: 180, padding: '10px 0' }}>
              {[
                { m: 'Mar', v: 35, a: '₹35K' },
                { m: 'Apr', v: 52, a: '₹52K' },
                { m: 'May', v: 44, a: '₹44K' },
                { m: 'Jun', v: 68, a: '₹68K' },
                { m: 'Jul', v: 60, a: '₹60K' },
                { m: 'Aug', v: 92, a: '₹92K' },
                { m: 'Sep', v: 84, a: '₹84K' },
              ].map((bar) => (
                <div key={bar.m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: P, marginBottom: 6 }}>{bar.a}</div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 42,
                      height: `${(bar.v / 100) * 140}px`,
                      background: bar.m === 'Sep' ? P : '#86EFAC',
                      borderRadius: '6px 6px 0 0',
                      marginTop: 'auto',
                    }}
                  />
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginTop: 8 }}>{bar.m}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
