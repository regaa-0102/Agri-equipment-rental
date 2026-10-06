import { getStoredUser } from './api-client'

export type NotificationType =
  | 'booking_created'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'payment_success'
  | 'equipment_added'
  | 'booking_received'
  | 'verification_status'

export interface NotificationItem {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  timestamp: string
  relatedId?: string
  actionUrl?: string
}

const STORAGE_KEY = 'agrirent_notifications_data'
const EVENT_KEY = 'agrirent_notifications_updated'

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  // Farmer Muthukumar S. (usr-farmer-1)
  {
    id: 'notif-f1-1',
    userId: 'usr-farmer-1',
    title: 'Booking Confirmed: Spraying Drone',
    message: 'Your booking BK-9021 for DJI Agras T40 Agricultural Spraying Drone has been confirmed by owner Selvam Murugan.',
    type: 'booking_confirmed',
    read: false,
    timestamp: '2026-09-24T18:30:00.000Z',
    relatedId: 'BK-9021',
  },
  {
    id: 'notif-f1-2',
    userId: 'usr-farmer-1',
    title: 'Payment Successful',
    message: 'Payment of ₹8,400 with ₹5,000 AgriSafe™ escrow deposit processed successfully for booking BK-9021.',
    type: 'payment_success',
    read: false,
    timestamp: '2026-09-24T18:28:00.000Z',
    relatedId: 'BK-9021',
  },
  {
    id: 'notif-f1-3',
    userId: 'usr-farmer-1',
    title: 'Identity Verification Verified',
    message: 'Your Aadhaar-style prototype identity verification has been confirmed. You now have full access to high-capacity equipment rentals.',
    type: 'verification_status',
    read: true,
    timestamp: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 'notif-f1-4',
    userId: 'usr-farmer-1',
    title: 'Booking Completed & Deposit Refunded',
    message: 'Rental BK-8842 for Claas Crop Tiger 30 completed with clean inspection. Escrow deposit ₹7,500 released.',
    type: 'booking_confirmed',
    read: true,
    timestamp: '2026-08-19T14:00:00.000Z',
    relatedId: 'BK-8842',
  },

  // Farmer Rajesh Kumar Patil (usr-farmer-2)
  {
    id: 'notif-f2-1',
    userId: 'usr-farmer-2',
    title: 'Booking Active: John Deere Tractor',
    message: 'Your active booking BK-8510 for John Deere 5310 Tractor is currently underway at your farm plot.',
    type: 'booking_confirmed',
    read: false,
    timestamp: '2026-09-22T09:00:00.000Z',
    relatedId: 'BK-8510',
  },
  {
    id: 'notif-f2-2',
    userId: 'usr-farmer-2',
    title: 'Identity Verification Needed',
    message: 'Please complete your prototype identity verification in your profile to unlock instant booking approvals.',
    type: 'verification_status',
    read: false,
    timestamp: '2026-09-21T08:00:00.000Z',
  },

  // Owner Selvam Murugan (usr-owner-1)
  {
    id: 'notif-o1-1',
    userId: 'usr-owner-1',
    title: 'New Equipment Booking Received!',
    message: 'Farmer Muthukumar S. has booked your DJI Agras T40 Agricultural Spraying Drone for 3 days (₹8,400).',
    type: 'booking_received',
    read: false,
    timestamp: '2026-09-24T18:29:00.000Z',
    relatedId: 'BK-9021',
  },
  {
    id: 'notif-o1-2',
    userId: 'usr-owner-1',
    title: 'Escrow Payment Credited',
    message: 'Security deposit of ₹5,000 for BK-9021 is securely held in AgriSafe™ escrow for your equipment.',
    type: 'payment_success',
    read: false,
    timestamp: '2026-09-24T18:31:00.000Z',
    relatedId: 'BK-9021',
  },
  {
    id: 'notif-o1-3',
    userId: 'usr-owner-1',
    title: 'Equipment Live on Marketplace',
    message: 'Your John Deere 5310 4WD (55 HP) Tractor listing has been verified and is now receiving booking requests.',
    type: 'equipment_added',
    read: true,
    timestamp: '2026-09-15T11:00:00.000Z',
    relatedId: 'eq-tractor-1',
  },
  {
    id: 'notif-o1-4',
    userId: 'usr-owner-1',
    title: 'Booking Received: John Deere Tractor',
    message: 'Farmer Rajesh Kumar Patil placed a rental request for John Deere 5310 Tractor (4 days).',
    type: 'booking_received',
    read: true,
    timestamp: '2026-09-21T08:35:00.000Z',
    relatedId: 'BK-8510',
  },

  // Owner Balvinder Singh (usr-owner-2)
  {
    id: 'notif-o2-1',
    userId: 'usr-owner-2',
    title: 'Booking Completed: Claas Crop Tiger 30',
    message: 'Rental BK-8842 has been completed. Payout of ₹14,400 has been transferred to your registered bank account.',
    type: 'booking_confirmed',
    read: false,
    timestamp: '2026-08-19T14:30:00.000Z',
    relatedId: 'BK-8842',
  },
  {
    id: 'notif-o2-2',
    userId: 'usr-owner-2',
    title: 'Fleet Equipment Listed',
    message: 'CLAAS CROP TIGER 30 Terra Trac Harvester is published and available for hire in Dindigul region.',
    type: 'equipment_added',
    read: true,
    timestamp: '2026-08-01T09:00:00.000Z',
    relatedId: 'eq-harvester-2',
  },

  // Admin Dr. Ramesh V. (usr-admin-1)
  {
    id: 'notif-adm-1',
    userId: 'usr-admin-1',
    title: 'Escrow Custody Alert',
    message: 'AgriSafe™ escrow currently holds ₹8,000 across active rentals. All safety inspection checks are normal.',
    type: 'booking_confirmed',
    read: false,
    timestamp: '2026-09-24T12:00:00.000Z',
  },
  {
    id: 'notif-adm-2',
    userId: 'usr-admin-1',
    title: 'Platform GMV Update',
    message: 'Monthly rental gross merchandise value crossed ₹36,000 with 10% platform commission retained.',
    type: 'payment_success',
    read: true,
    timestamp: '2026-09-23T10:00:00.000Z',
  },
]

export function getStoredNotifications(): NotificationItem[] {
  if (typeof window === 'undefined') return SEED_NOTIFICATIONS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_NOTIFICATIONS))
      return SEED_NOTIFICATIONS
    }
    return JSON.parse(raw)
  } catch {
    return SEED_NOTIFICATIONS
  }
}

export function saveNotifications(items: NotificationItem[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: items }))
  } catch (e) {
    console.error('Failed to save notifications', e)
  }
}

/**
 * Returns notifications strictly scoped to the user (or active logged-in user).
 * Farmers never see owners' private notifications and vice-versa.
 */
export function getUserNotifications(targetUserId?: string): NotificationItem[] {
  const currentUserId = targetUserId || getStoredUser()?.id
  if (!currentUserId) return []
  const all = getStoredNotifications()
  return all
    .filter((n) => n.userId === currentUserId || n.userId === 'all')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function getUnreadCount(targetUserId?: string): number {
  return getUserNotifications(targetUserId).filter((n) => !n.read).length
}

export function markAsRead(notificationId: string): void {
  const currentUserId = getStoredUser()?.id
  if (!currentUserId) return
  const list = getStoredNotifications()
  const idx = list.findIndex((n) => n.id === notificationId)
  const item = list[idx]
  if (idx !== -1 && item && (item.userId === currentUserId || item.userId === 'all')) {
    list[idx] = { ...item, read: true }
    saveNotifications(list)
  }
}

export function markAllAsRead(targetUserId?: string): void {
  const authenticatedUserId = getStoredUser()?.id
  if (!authenticatedUserId || (targetUserId && targetUserId !== authenticatedUserId)) return
  const currentUserId = targetUserId || authenticatedUserId
  const list = getStoredNotifications()
  const updated = list.map((n) => {
    if (n.userId === currentUserId || n.userId === 'all') {
      return { ...n, read: true }
    }
    return n
  })
  saveNotifications(updated)
}

export function addNotification(
  item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'> & { read?: boolean; timestamp?: string }
): NotificationItem {
  const list = getStoredNotifications()
  const newNotif: NotificationItem = {
    ...item,
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    read: item.read ?? false,
    timestamp: item.timestamp || new Date().toISOString(),
  }
  list.unshift(newNotif)
  saveNotifications(list)
  return newNotif
}

export function onNotificationsChange(callback: (notifications: NotificationItem[]) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = () => {
    callback(getStoredNotifications())
  }
  window.addEventListener(EVENT_KEY, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(EVENT_KEY, handler)
    window.removeEventListener('storage', handler)
  }
}
