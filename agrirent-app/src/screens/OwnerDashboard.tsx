import Sidebar from '../components/Sidebar'
import { categoryIcon } from '../lib/catalog'
import { useLanguage } from '../context/LanguageContext'

const P = '#2E7D32'
const PM = '#E8F5E9'

const bookingRequests = [
  { id: 'REQ-4821', farmer: 'Rajesh Kumar', equipment: 'John Deere 5310', from: '10 Aug', to: '13 Aug', amount: '₹9,924', status: 'pending', location: 'Raikot, Ludhiana' },
  { id: 'REQ-4799', farmer: 'Sunita Patel', equipment: 'John Deere 5310', from: '15 Aug', to: '17 Aug', amount: '₹6,616', status: 'pending', location: 'Morinda, Ropar' },
  { id: 'REQ-4755', farmer: 'Mohan Reddy', equipment: 'New Holland TC5', from: '20 Aug', to: '25 Aug', amount: '₹31,180', status: 'approved', location: 'Patiala' },
  { id: 'REQ-4712', farmer: 'Kiran Patil', equipment: 'John Deere 5310', from: '01 Sep', to: '03 Sep', amount: '₹6,616', status: 'approved', location: 'Barnala' },
  { id: 'REQ-4678', farmer: 'Balram Yadav', equipment: 'Fieldking Rotavator', from: '28 Jul', to: '29 Jul', amount: '₹2,006', status: 'completed', location: 'Ludhiana' },
]

const revenueMonths = [
  { month: 'Mar', v: 28 }, { month: 'Apr', v: 42 }, { month: 'May', v: 35 },
  { month: 'Jun', v: 55 }, { month: 'Jul', v: 48 }, { month: 'Aug', v: 72 },
]
const maxV = Math.max(...revenueMonths.map(r => r.v))

interface Props {
  onNavigate: (screen: string) => void
}

export default function OwnerDashboard({ onNavigate }: Props) {
  const { t } = useLanguage()

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 44px)', width: '100%', minWidth: 0, background: '#F9FAFB' }}>
      <Sidebar activeItem="Dashboard" onNavigate={onNavigate} role="owner" />

      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #F3F4F6', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>{t('Owner Dashboard')}</h1>
            <p style={{ color: '#9CA3AF', fontSize: 13, margin: '4px 0 0' }}>{t('Monday, 4 August 2026 • Welcome back, Gurpreet 👋')}</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => onNavigate('add-equipment')} className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>{t('+ Add Equipment')}</button>
            <div style={{ width: 40, height: 40, background: '#E3F2FD', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#1565C0', cursor: 'pointer' }}>GS</div>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
            {[
              { label: t('Total Equipment'), value: '8', icon: '🚜', sub: t('6 active, 2 maintenance'), color: PM, badge: null },
              { label: t('Total Bookings'), value: '147', icon: '📋', sub: t('+12 this month'), color: '#E3F2FD', badge: null },
              { label: t('Monthly Revenue'), value: '₹72,400', icon: '💰', sub: t('↑ 34% vs last month'), color: '#FFF8E1', badge: null },
              { label: t('Active Rentals'), value: '3', icon: '⚡', sub: t('Currently rented out'), color: '#F3E8FF', badge: 3 },
            ].map(stat => (
              <div key={stat.label} className="card-shadow" style={{ background: '#fff', borderRadius: 16, padding: '20px', border: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ background: stat.color, borderRadius: 12, padding: '10px', fontSize: 22 }}>{stat.icon}</div>
                  {stat.badge && <span style={{ background: PM, color: P, fontSize: 11, fontWeight: 700, borderRadius: 8, padding: '4px 8px' }}>{t('Live')}</span>}
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 4 }}>{stat.value}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontSize: 12, color: P, fontWeight: 500 }}>{stat.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 24 }}>
            {/* Revenue chart */}
            <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 17, color: '#111827', margin: 0 }}>{t('Monthly Revenue')}</h3>
                  <p style={{ color: '#9CA3AF', fontSize: 13, margin: '4px 0 0' }}>{t('Last 6 months performance')}</p>
                </div>
                <select className="input-field" style={{ width: 140, fontSize: 12 }}>
                  <option>{t('Last 6 months')}</option>
                  <option>{t('Last year')}</option>
                </select>
              </div>

              {/* Bar chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180 }}>
                {revenueMonths.map(rm => {
                  const height = (rm.v / maxV) * 150
                  return (
                    <div key={rm.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: P }}>₹{rm.v}K</div>
                      <div style={{ width: '100%', height: height, background: rm.month === 'Aug' ? P : PM, borderRadius: '6px 6px 0 0', transition: 'height 0.5s', position: 'relative' }}>
                        {rm.month === 'Aug' && (
                          <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', background: P, color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap' }}>
                            {t('This month')}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>{t(rm.month)}</div>
                    </div>
                  )
                })}
              </div>

              <div style={{ borderTop: '1px solid #F3F4F6', marginTop: 20, paddingTop: 16, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {[
                  { l: t('Total Earned'), v: '₹2,80,400' },
                  { l: t('Avg/Month'), v: '₹46,733' },
                  { l: t('Best Month'), v: `Aug 2026` },
                ].map(({ l, v }) => (
                  <div key={l}>
                    <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{l}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginTop: 4 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment status */}
            <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '1px solid #F3F4F6' }}>
              <h3 style={{ fontWeight: 700, fontSize: 17, color: '#111827', marginBottom: 20 }}>{t('My Equipment')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { name: 'John Deere 5310', cat: 'Tractor', status: 'rented', income: '₹18,400' },
                  { name: 'New Holland TC5', cat: 'Harvester', status: 'rented', income: '₹31,200' },
                  { name: 'Fieldking Rotavator', cat: 'Rotavator', status: 'available', income: '₹8,500' },
                  { name: 'Water Pump 10HP', cat: 'Water Pump', status: 'available', income: '₹3,200' },
                  { name: 'Aspee Power Sprayer 45L', cat: 'Water Sprayer', status: 'maintenance', income: '₹0' },
                  { name: 'Borewell Rig Driller', cat: 'Driller', status: 'available', income: '₹22,500' },
                  { name: 'Paddy Seeds ADT-45', cat: 'Seeds', status: 'available', income: '₹6,250' },
                  { name: 'DAP Fertilizer Stock', cat: 'Fertilizers', status: 'rented', income: '₹9,450' },
                ].map(eq => (
                  <div key={eq.name} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px', background: '#F9FAFB', borderRadius: 12 }}>
                    <div style={{ width: 40, height: 40, background: eq.status === 'rented' ? PM : eq.status === 'maintenance' ? '#FFF8E1' : '#F3F4F6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {categoryIcon(eq.cat)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{eq.name}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF' }}>{t(eq.cat)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '3px 8px',
                        background: eq.status === 'rented' ? PM : eq.status === 'maintenance' ? '#FFF8E1' : '#F3F4F6',
                        color: eq.status === 'rented' ? P : eq.status === 'maintenance' ? '#D97706' : '#6B7280',
                        textTransform: 'capitalize', marginBottom: 2,
                      }}>{t(eq.status)}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{eq.income}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => onNavigate('add-equipment')} className="btn-outline" style={{ width: '100%', marginTop: 16, padding: '10px', fontSize: 13 }}>{t('+ Add New Equipment')}</button>
            </div>
          </div>

          {/* Booking requests */}
          <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, border: '1px solid #F3F4F6', overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 17, color: '#111827', margin: 0 }}>{t('Booking Requests')}</h3>
                <p style={{ color: '#9CA3AF', fontSize: 13, margin: '4px 0 0' }}>{t('2 pending requests need your attention')}</p>
              </div>
              <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: 12, fontWeight: 700, borderRadius: 8, padding: '4px 10px' }}>{t('2 Pending')}</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                <thead>
                  <tr style={{ background: '#FAFAFA' }}>
                    {[t('Request ID'), t('Farmer'), t('Equipment'), t('Dates'), t('Location'), t('Amount'), t('Status'), t('Action')].map(h => (
                      <th key={h} style={{ padding: '11px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookingRequests.map(b => (
                    <tr key={b.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 600, color: P }}>{b.id}</td>
                      <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 600, color: '#374151' }}>{b.farmer}</td>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: '#6B7280' }}>{b.equipment}</td>
                      <td style={{ padding: '14px 18px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{b.from} → {b.to}</td>
                      <td style={{ padding: '14px 18px', fontSize: 12, color: '#6B7280' }}>📍 {b.location}</td>
                      <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 700, color: '#111827' }}>{b.amount}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '4px 10px',
                          background: b.status === 'pending' ? '#FEF3C7' : b.status === 'approved' ? PM : '#F0FDF4',
                          color: b.status === 'pending' ? '#D97706' : b.status === 'approved' ? P : '#16A34A',
                          textTransform: 'capitalize',
                        }}>{t(b.status)}</span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {b.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button style={{ background: PM, border: 'none', color: P, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{t('Accept')}</button>
                            <button style={{ background: '#FEF2F2', border: 'none', color: '#DC2626', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{t('Decline')}</button>
                          </div>
                        ) : (
                          <button style={{ background: '#F3F4F6', border: 'none', color: '#374151', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{t('View')}</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity feed */}
          <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '1px solid #F3F4F6' }}>
            <h3 style={{ fontWeight: 700, fontSize: 17, color: '#111827', marginBottom: 20 }}>{t('Recent Activity')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { icon: '💰', text: 'Payment of ₹9,924 received from Rajesh Kumar', time: '2 hours ago', color: PM },
                { icon: '📋', text: 'New booking request from Sunita Patel for JD 5310', time: '4 hours ago', color: '#FEF3C7' },
                { icon: '✅', text: 'Booking BK-4678 marked as completed by Balram Yadav', time: 'Yesterday, 6:00 PM', color: '#E3F2FD' },
                { icon: '⭐', text: 'Kiran Patil left a 5-star review for John Deere 5310', time: 'Yesterday, 2:30 PM', color: '#FFF8E1' },
                { icon: '🚜', text: 'John Deere 5310 delivered to Raikot Village, Ludhiana', time: '3 Aug, 7:00 AM', color: PM },
              ].map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: i < 4 ? '1px solid #F3F4F6' : 'none', alignItems: 'flex-start' }}>
                  <div style={{ width: 38, height: 38, background: a.color, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{a.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{t(a.text)}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>{t(a.time)}</div>
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
