import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { useLanguage } from '../context/LanguageContext'
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  onNotificationsChange,
  NotificationItem,
} from '../lib/notifications'
import { getStoredUser } from '../lib/api-client'
import { Bell, CheckCheck, Trash2, Calendar, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'

const P = '#2E7D32'
const PM = '#E8F5E9'

interface Props {
  onNavigate: (screen: string) => void
}

export default function NotificationsPage({ onNavigate }: Props) {
  const { t, isTamil } = useLanguage()
  const currentUser = getStoredUser()
  const userRole = currentUser?.role || 'farmer'
  const userId = currentUser?.id || (userRole === 'farmer' ? 'usr-farmer-1' : 'usr-owner-1')

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getUserNotifications(userId))
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'bookings' | 'verification'>('all')

  useEffect(() => {
    setNotifications(getUserNotifications(userId))
    const unsubscribe = onNotificationsChange(() => {
      setNotifications(getUserNotifications(userId))
    })
    return () => unsubscribe()
  }, [userId])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkOne = (id: string) => {
    markAsRead(id)
  }

  const handleMarkAll = () => {
    markAllAsRead(userId)
  }

  const filtered = notifications.filter((n) => {
    if (filterType === 'unread') return !n.read
    if (filterType === 'bookings') {
      return (
        n.type === 'booking_created' ||
        n.type === 'booking_confirmed' ||
        n.type === 'booking_cancelled' ||
        n.type === 'booking_received'
      )
    }
    if (filterType === 'verification') return n.type === 'verification_status'
    return true
  })

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'booking_confirmed':
        return <span style={{ fontSize: 18 }}>✅</span>
      case 'booking_created':
        return <span style={{ fontSize: 18 }}>📅</span>
      case 'booking_cancelled':
        return <span style={{ fontSize: 18 }}>⚠️</span>
      case 'booking_received':
        return <span style={{ fontSize: 18 }}>🚜</span>
      case 'payment_success':
        return <span style={{ fontSize: 18 }}>💳</span>
      case 'equipment_added':
        return <span style={{ fontSize: 18 }}>🚀</span>
      case 'verification_status':
        return <span style={{ fontSize: 18 }}>🛡️</span>
      default:
        return <span style={{ fontSize: 18 }}>🔔</span>
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 44px)', width: '100%', minWidth: 0, background: '#F9FAFB' }}>
      <Sidebar activeItem="Notifications" onNavigate={onNavigate} role={userRole} />

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
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: PM,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: P,
                }}
              >
                <Bell size={20} />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>
                {isTamil ? 'அறிவிப்பு மையம்' : 'Notification Center'}
              </h1>
              {unreadCount > 0 && (
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
                  {unreadCount} {isTamil ? 'புதியவை' : 'unread'}
                </span>
              )}
            </div>
            <p style={{ color: '#6B7280', fontSize: 13, margin: '6px 0 0' }}>
              {isTamil
                ? `${currentUser?.name || 'பயனர்'} கணக்கிற்கான நிகழ்வு அறிவிப்புகள் மற்றும் புதுப்பிப்புகள்.`
                : `Account notifications & updates for ${currentUser?.name || 'User'} (${userRole.toUpperCase()})`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="btn-outline"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <CheckCheck size={16} />
                <span>{isTamil ? 'அனைத்தையும் வாசித்ததாக குறிக்க' : 'Mark All as Read'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ padding: '24px 28px 0' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {[
              { id: 'all', labelEn: `All (${notifications.length})`, labelTa: `அனைத்தும் (${notifications.length})` },
              { id: 'unread', labelEn: `Unread (${unreadCount})`, labelTa: `படிக்காதவை (${unreadCount})` },
              { id: 'bookings', labelEn: 'Bookings & Rentals', labelTa: 'முன்பதிவுகள்' },
              { id: 'verification', labelEn: 'Identity Verification', labelTa: 'சரிபார்ப்பு' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id as any)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  border: filterType === tab.id ? `1.5px solid ${P}` : '1px solid #E5E7EB',
                  background: filterType === tab.id ? PM : '#fff',
                  color: filterType === tab.id ? P : '#4B5563',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {isTamil ? tab.labelTa : tab.labelEn}
              </button>
            ))}
          </div>

          {/* List of Notifications */}
          {filtered.length === 0 ? (
            <div
              style={{
                background: '#fff',
                borderRadius: 20,
                padding: '60px 24px',
                textAlign: 'center',
                border: '1px solid #F3F4F6',
              }}
            >
              <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>
                {isTamil ? 'அறிவிப்புகள் ஏதும் இல்லை' : 'No notifications in this view'}
              </h3>
              <p style={{ color: '#9CA3AF', fontSize: 13, marginTop: 6 }}>
                {isTamil
                  ? 'புதிய முன்பதிவு அல்லது நிலை புதுப்பிப்புகள் வரும் போது இங்கே தோன்றும்.'
                  : 'You are all caught up! New alerts and booking status updates will appear here.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 40 }}>
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkOne(item.id)}
                  style={{
                    background: item.read ? '#fff' : '#F0FDF4',
                    border: item.read ? '1px solid #E5E7EB' : '1.5px solid #86EFAC',
                    borderRadius: 16,
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: item.read ? 'none' : '0 2px 6px rgba(46, 125, 50, 0.08)',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: item.read ? '#F3F4F6' : PM,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getIcon(item.type)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: 15,
                          fontWeight: item.read ? 600 : 800,
                          color: '#111827',
                        }}
                      >
                        {item.title}
                      </h4>
                      <span style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                        {new Date(item.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p style={{ margin: '6px 0 0', fontSize: 13, color: '#4B5563', lineHeight: 1.45 }}>
                      {item.message}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: item.read ? '#9CA3AF' : P,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {item.read ? (isTamil ? 'வாசிக்கப்பட்டது' : 'Read') : (isTamil ? '● புதியது' : '● New Alert')}
                      </span>

                      {item.relatedId && (
                        <span style={{ fontSize: 11, color: '#6B7280', background: '#F3F4F6', padding: '2px 8px', borderRadius: 4 }}>
                          Ref: {item.relatedId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
