import { useLanguage } from '../context/LanguageContext'

const P = '#2E7D32'
const PM = '#E8F5E9'

interface SidebarItem {
  icon: string
  label: string
  screen?: string
  badge?: number
}

interface Props {
  activeItem: string
  onNavigate: (screen: string) => void
  role: 'farmer' | 'owner' | 'admin'
}

const farmerItems: SidebarItem[] = [
  { icon: '🏠', label: 'Dashboard', screen: 'farmer-dashboard' },
  { icon: '🔍', label: 'Search Equipment', screen: 'equipment-details' },
  { icon: '📋', label: 'My Bookings', screen: 'my-bookings', badge: 2 },
  { icon: '🚜', label: 'My Rentals', screen: 'my-bookings' },
  { icon: '💳', label: 'Payments' },
  { icon: '🔔', label: 'Notifications', badge: 4 },
  { icon: '👤', label: 'Profile' },
  { icon: '❓', label: 'Help & Support' },
]

const ownerItems: SidebarItem[] = [
  { icon: '🏠', label: 'Dashboard', screen: 'owner-dashboard' },
  { icon: '🚜', label: 'My Equipment', screen: 'add-equipment' },
  { icon: '➕', label: 'Add Equipment', screen: 'add-equipment' },
  { icon: '📋', label: 'Booking Requests', badge: 3 },
  { icon: '📊', label: 'Analytics' },
  { icon: '💰', label: 'Revenue' },
  { icon: '🔔', label: 'Notifications', badge: 5 },
  { icon: '👤', label: 'Profile' },
]

const adminItems: SidebarItem[] = [
  { icon: '🏠', label: 'Dashboard', screen: 'admin-dashboard' },
  { icon: '👥', label: 'Farmers' },
  { icon: '🔧', label: 'Owners' },
  { icon: '🚜', label: 'Equipment' },
  { icon: '📋', label: 'Bookings', badge: 12 },
  { icon: '💰', label: 'Revenue' },
  { icon: '⚠️', label: 'Disputes', badge: 3 },
  { icon: '⚙', label: 'Settings' },
]

export default function Sidebar({ activeItem, onNavigate, role }: Props) {
  const { t } = useLanguage()
  const items = role === 'farmer' ? farmerItems : role === 'owner' ? ownerItems : adminItems
  const roleLabel = role === 'farmer' ? t('🌾 Farmer') : role === 'owner' ? t('🔧 Equipment Owner') : t('⚙️ Administrator')
  const dashboardScreen = role === 'farmer' ? 'farmer-dashboard' : role === 'owner' ? 'owner-dashboard' : 'admin-dashboard'

  return (
    <div style={{
      width: 256, flexShrink: 0, background: '#fff', borderRight: '1px solid #F3F4F6',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* Brand */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => onNavigate(dashboardScreen)}>
          <div style={{ width: 36, height: 36, background: P, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, color: '#fff' }}>🌿</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: P, letterSpacing: '-0.3px' }}>AgriRent</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>{roleLabel}</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', padding: '0 8px', marginBottom: 8, textTransform: 'uppercase' }}>{t('Menu')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map(item => {
            const isActive = activeItem === item.label || (item.screen && activeItem === item.screen)
            return (
              <div
                key={item.label}
                className={`sidebar-link${isActive ? ' active' : ''}`}
                onClick={() => item.screen && onNavigate(item.screen)}
                style={{ justifyContent: 'space-between', cursor: item.screen ? 'pointer' : 'default' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 17 }}>{item.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{t(item.label)}</span>
                </div>
                {item.badge && (
                  <span style={{ background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '2px 7px', flexShrink: 0 }}>
                    {item.badge}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* User profile at bottom */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: PM, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: P, flexShrink: 0 }}>
            {role === 'farmer' ? 'RK' : role === 'owner' ? 'GS' : 'AD'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {role === 'farmer' ? 'Rajesh Kumar' : role === 'owner' ? 'Gurpreet Singh' : t('Admin User')}
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {role === 'farmer' ? 'rajesh@gmail.com' : role === 'owner' ? 'gurpreet@gmail.com' : 'admin@agrirent.in'}
            </div>
          </div>
          <span style={{ color: '#9CA3AF', fontSize: 14 }}>⋮</span>
        </div>
        <button
          onClick={() => onNavigate('login')}
          style={{ width: '100%', marginTop: 8, padding: '8px 0', background: '#FEF2F2', border: 'none', borderRadius: 10, color: '#DC2626', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <span>🚪</span> {t('Log Out')}
        </button>
      </div>
    </div>
  )
}
