import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useLanguage } from '../context/LanguageContext'
import { getStoredUser } from '../lib/api-client'
import { BarChart3, TrendingUp, Users, Calendar, Activity, Zap } from 'lucide-react'

const P = '#2E7D32'
const PM = '#E8F5E9'

interface Props {
  onNavigate: (screen: string) => void
}

export default function AnalyticsPage({ onNavigate }: Props) {
  const { t, isTamil } = useLanguage()
  const currentUser = getStoredUser()
  if (!currentUser) return null
  const role = currentUser.role

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 44px)', width: '100%', minWidth: 0, background: '#F9FAFB' }}>
      <Sidebar activeItem="Analytics" onNavigate={onNavigate} role={role} />

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
              {isTamil ? 'இயந்திர செயல்பாட்டு பகுப்பாய்வு' : 'Machinery Analytics & Fleet Utilization'}
            </h1>
            <p style={{ color: '#6B7280', fontSize: 13, margin: '4px 0 0' }}>
              {isTamil
                ? 'உங்கள் விவசாயக் கருவிகளின் பயன்பாட்டு விகிதம் மற்றும் பருவகால தேவை விவரங்கள்.'
                : 'Fleet utilization, seasonal crop demand peaks, and equipment wear telemetry.'}
            </p>
          </div>
        </div>

        <div style={{ padding: '28px', maxWidth: 1000 }}>
          {/* Key KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
            {[
              { label: 'Fleet Utilization', val: '86.4%', sub: '↑ 14% vs last harvest season', icon: '⚡' },
              { label: 'Total Operating Hours', val: '1,420 hrs', sub: 'Across 8 tractors & implements', icon: '⏱️' },
              { label: 'Repeat Farmer Rate', val: '78%', sub: 'High customer satisfaction', icon: '🤝' },
              { label: 'Avg Rental Duration', val: '3.4 days', sub: 'Optimal machinery turnaround', icon: '📅' },
            ].map((k) => (
              <div key={k.label} className="card-shadow" style={{ background: '#fff', borderRadius: 18, padding: 22, border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#6B7280' }}>{k.label}</span>
                  <span style={{ fontSize: 18 }}>{k.icon}</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#111827' }}>{k.val}</div>
                <div style={{ fontSize: 12, color: P, marginTop: 4, fontWeight: 600 }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Utilization Bars */}
          <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #E5E7EB', marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 20px' }}>
              Equipment Category Demand & Dispatch Rate
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { name: 'Tractors (4WD 55-75 HP)', rate: 94, color: '#15803D' },
                { name: 'Combine Harvesters (Paddy/Wheat)', rate: 88, color: '#16A34A' },
                { name: 'Spraying Drones (DJI Agras T40)', rate: 82, color: '#22C55E' },
                { name: 'Rotavators & Tillers', rate: 76, color: '#4ADE80' },
                { name: 'Solar Water Pumps', rate: 64, color: '#86EFAC' },
              ].map((item) => (
                <div key={item.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
                    <span>{item.name}</span>
                    <span>{item.rate}% Booked</span>
                  </div>
                  <div style={{ width: '100%', height: 10, background: '#F3F4F6', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ width: `${item.rate}%`, height: '100%', background: item.color, borderRadius: 5 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
