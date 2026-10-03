import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { getStoredUser, UserSession } from '../lib/api-client'
import { getUnreadCount, onNotificationsChange } from '../lib/notifications'

const P = '#2E7D32'
const PM = '#E8F5E9'

interface SidebarItem {
  icon: string
  label: string
  screen: string
  badge?: number | string | undefined
}

interface Props {
  activeItem: string
  onNavigate: (screen: string) => void
  role: 'farmer' | 'owner' | 'admin'
}

export default function Sidebar({ activeItem, onNavigate, role }: Props) {
  const { t } = useLanguage()
  const { openSettings } = useTheme()
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => getStoredUser())
  const userId = currentUser?.id || (role === 'farmer' ? 'usr-farmer-1' : 'usr-owner-1')

  const [unreadNotifs, setUnreadNotifs] = useState(() => getUnreadCount(userId))

  useEffect(() => {
    setUnreadNotifs(getUnreadCount(userId))
    const unsubscribe = onNotificationsChange(() => {
      setUnreadNotifs(getUnreadCount(userId))
    })
    return () => unsubscribe()
  }, [userId])

  const farmerItems: SidebarItem[] = [
    { icon: '🏠', label: 'Dashboard', screen: 'farmer-dashboard' },
    { icon: '🔍', label: 'Search Equipment', screen: 'equipment-details' },
    { icon: '📋', label: 'My Bookings', screen: 'my-bookings', badge: 2 },
    { icon: '🚜', label: 'My Rentals', screen: 'my-bookings' },
    { icon: '💳', label: 'Payments', screen: 'payments' },
    { icon: '🔔', label: 'Notifications', screen: 'notifications', badge: unreadNotifs > 0 ? unreadNotifs : undefined },
    { icon: '👤', label: 'Profile', screen: 'profile' },
    { icon: '❓', label: 'Help & Support', screen: 'help' },
  ]

  const ownerItems: SidebarItem[] = [
    { icon: '🏠', label: 'Dashboard', screen: 'owner-dashboard' },
    { icon: '🚜', label: 'My Equipment', screen: 'owner-dashboard' },
    { icon: '➕', label: 'Add Equipment', screen: 'add-equipment' },
    { icon: '📋', label: 'Booking Requests', screen: 'owner-bookings', badge: 3 },
    { icon: '📊', label: 'Analytics', screen: 'analytics' },
    { icon: '💰', label: 'Revenue', screen: 'revenue' },
    { icon: '🔔', label: 'Notifications', screen: 'notifications', badge: unreadNotifs > 0 ? unreadNotifs : undefined },
    { icon: '👤', label: 'Profile', screen: 'profile' },
  ]

  const adminItems: SidebarItem[] = [
    { icon: '🏠', label: 'Dashboard', screen: 'admin-dashboard' },
    { icon: '👥', label: 'Farmers', screen: 'admin-dashboard' },
    { icon: '🔧', label: 'Owners', screen: 'admin-dashboard' },
    { icon: '🚜', label: 'Equipment', screen: 'admin-dashboard' },
    { icon: '📋', label: 'Bookings', screen: 'admin-dashboard', badge: 12 },
    { icon: '💰', label: 'Revenue', screen: 'revenue' },
    { icon: '⚠️', label: 'Disputes', screen: 'admin-dashboard', badge: 3 },
    { icon: '⚙', label: 'Settings', screen: 'profile' },
  ]

  const items = role === 'farmer' ? farmerItems : role === 'owner' ? ownerItems : adminItems
  const roleLabel = role === 'farmer' ? t('🌾 Farmer') : role === 'owner' ? t('🔧 Equipment Owner') : t('⚙️ Administrator')
  const dashboardScreen = role === 'farmer' ? 'farmer-dashboard' : role === 'owner' ? 'owner-dashboard' : 'admin-dashboard'

  const displayName =
    currentUser?.name ||
    (role === 'farmer' ? 'Muthukumar S.' : role === 'owner' ? 'Selvam Murugan' : 'Dr. Anandhan')
  const displayEmail =
    currentUser?.email ||
    (role === 'farmer' ? 'muthukumar@agrirent.in' : role === 'owner' ? 'selvam@agrirent.in' : 'admin@agrirent.in')
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      style={{
        width: 256,
        flexShrink: 0,
        background: '#fff',
        borderRight: '1px solid #F3F4F6',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
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
        <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', padding: '0 8px', marginBottom: 8, textTransform: 'uppercase' }}>
          {t('Menu')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map((item) => {
            const isActive =
              activeItem === item.label ||
              activeItem === item.screen ||
              (item.screen === 'profile' && activeItem.toLowerCase().includes('profile')) ||
              (item.screen === 'notifications' && activeItem.toLowerCase().includes('notif'))

            return (
              <div
                key={item.label}
                className={`sidebar-link${isActive ? ' active' : ''}`}
                onClick={() => onNavigate(item.screen)}
                style={{
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: isActive ? PM : 'transparent',
                  color: isActive ? P : '#374151',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 17 }}>{item.icon}</span>
                  <span style={{ fontSize: 14 }}>{t(item.label)}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    style={{
                      background: '#EF4444',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: 10,
                      padding: '2px 7px',
                      flexShrink: 0,
                    }}
                  >
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
        <div
          onClick={() => onNavigate('profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 12,
            cursor: 'pointer',
            transition: 'background 0.2s',
            background: activeItem === 'Profile' ? PM : 'transparent',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: PM,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 14,
              color: P,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayEmail}
            </div>
          </div>
          <span style={{ color: '#9CA3AF', fontSize: 14 }}>⚙️</span>
        </div>

        <button
          type="button"
          onClick={openSettings}
          style={{
            width: '100%',
            marginTop: 8,
            padding: '8px 0',
            background: 'rgba(21, 128, 61, 0.08)',
            border: '1px solid rgba(21, 128, 61, 0.2)',
            borderRadius: 10,
            color: '#15803D',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <span>🎨</span> {t('Settings & Themes')}
        </button>

        <button
          onClick={() => onNavigate('login')}
          style={{
            width: '100%',
            marginTop: 8,
            padding: '8px 0',
            background: '#FEF2F2',
            border: 'none',
            borderRadius: 10,
            color: '#DC2626',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <span>🚪</span> {t('Log Out')}
        </button>
      </div>
    </div>
  )
}
