import { getStoredUser, UserSession } from './api-client'
import { addNotification } from './notifications'

export type VerificationStatus = 'NOT_VERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED'

export interface UserVerificationData {
  status: VerificationStatus
  idType: string
  maskedId: string
  submittedAt?: string | undefined
  verifiedAt?: string | undefined
  remarks?: string | undefined
}

const STORAGE_KEY = 'agrirent_user_verifications'
const EVENT_KEY = 'agrirent_verification_changed'

const DEFAULT_VERIFICATIONS: Record<string, UserVerificationData> = {}

function loadAllVerifications(): Record<string, UserVerificationData> {
  if (typeof window === 'undefined') return DEFAULT_VERIFICATIONS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_VERIFICATIONS))
      return DEFAULT_VERIFICATIONS
    }
    return JSON.parse(raw)
  } catch {
    return DEFAULT_VERIFICATIONS
  }
}

function saveAllVerifications(data: Record<string, UserVerificationData>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: data }))
  } catch (err) {
    console.error('Failed to save verifications', err)
  }
}

export function getUserVerification(userId?: string): UserVerificationData {
  const activeUser = getStoredUser()
  const currentUserId = userId || activeUser?.id || ''
  const all = loadAllVerifications()
  if (currentUserId && all[currentUserId]) {
    return all[currentUserId]
  }
  if (activeUser && (!currentUserId || activeUser.id === currentUserId)) {
    const lastFour = activeUser.phone?.replace(/\D/g, '').slice(-4)
    return {
      status: activeUser.verificationStatus || 'NOT_VERIFIED',
      idType: 'Government / Mobile ID',
      maskedId: lastFour ? `•••• •••• ${lastFour}` : '',
      remarks: 'Identity verification status from the authenticated account.',
    }
  }
  return {
    status: 'NOT_VERIFIED',
    idType: 'Aadhaar / Government ID',
    maskedId: '',
    remarks: 'No verification record found.',
  }
}

export function setUserVerificationStatus(
  userId: string,
  status: VerificationStatus,
  options?: { lastFourDigits?: string; remarks?: string }
): UserVerificationData {
  const all = loadAllVerifications()
  const current = all[userId] || {
    status: 'NOT_VERIFIED',
    idType: 'Aadhaar (Prototype Demo)',
    maskedId: '',
  }

  const masked = options?.lastFourDigits
    ? `•••• •••• ${options.lastFourDigits.replace(/\D/g, '').slice(-4).padStart(4, '0')}`
    : current.maskedId || '•••• •••• 9999'

  const updated: UserVerificationData = {
    ...current,
    status,
    maskedId: status === 'NOT_VERIFIED' ? '' : masked,
    submittedAt: status === 'PENDING' ? new Date().toISOString() : current.submittedAt,
    verifiedAt: status === 'VERIFIED' ? new Date().toISOString() : undefined,
    remarks: options?.remarks || (
      status === 'VERIFIED'
        ? 'Identity Verification: Verified'
        : status === 'PENDING'
        ? 'Identity Verification: Pending'
        : status === 'REJECTED'
        ? 'Identity Verification: Rejected (Document re-submission needed)'
        : 'Identity Verification: Not Verified'
    ),
  }

  all[userId] = updated
  saveAllVerifications(all)

  // Trigger event notification
  addNotification({
    userId,
    title: 'Verification Status Changed',
    message: `Your identity verification status is now: ${status.replace('_', ' ')}. ${updated.remarks}`,
    type: 'verification_status',
  })

  return updated
}

export interface BookingVerificationCheck {
  canBook: boolean
  status: VerificationStatus
  badgeColor: string
  badgeText: string
  title: string
  message: string
  actionLabel: string
  actionScreen: string
}

export function checkBookingVerification(user?: UserSession | null): BookingVerificationCheck {
  const activeUser = user !== undefined ? user : getStoredUser()
  if (!activeUser) {
    return {
      canBook: false,
      status: 'NOT_VERIFIED',
      badgeColor: '#EF4444',
      badgeText: 'Sign-in Required',
      title: 'Authentication Required',
      message: 'Please sign in to proceed with booking equipment.',
      actionLabel: 'Sign In Now',
      actionScreen: 'login',
    }
  }

  const verif = getUserVerification(activeUser.id)

  switch (verif.status) {
    case 'VERIFIED':
      return {
        canBook: true,
        status: 'VERIFIED',
        badgeColor: '#16A34A',
        badgeText: 'Identity Verified',
        title: 'Identity Verification: Verified',
        message: 'Your identity has been verified. You can proceed with booking and escrow.',
        actionLabel: 'Proceed to Book',
        actionScreen: '',
      }

    case 'PENDING':
      return {
        canBook: false,
        status: 'PENDING',
        badgeColor: '#F59E0B',
        badgeText: 'Verification Pending',
        title: 'Identity Verification: Pending',
        message: 'Your identity documents are currently under review. Bookings will be enabled once verification completes.',
        actionLabel: 'View Verification Status',
        actionScreen: 'profile',
      }

    case 'REJECTED':
      return {
        canBook: false,
        status: 'REJECTED',
        badgeColor: '#DC2626',
        badgeText: 'Verification Rejected',
        title: 'Identity Verification: Action Required',
        message: 'Your previous identity verification could not be approved. Please submit a valid document in your profile to enable bookings.',
        actionLabel: 'Update Verification in Profile',
        actionScreen: 'profile',
      }

    case 'NOT_VERIFIED':
    default:
      return {
        canBook: false,
        status: 'NOT_VERIFIED',
        badgeColor: '#6B7280',
        badgeText: 'Not Verified',
        title: 'Identity Verification Required',
        message: 'Before booking heavy farm machinery, please complete the demo identity verification check.',
        actionLabel: 'Complete Verification in Profile',
        actionScreen: 'profile',
      }
  }
}

export function onVerificationChange(callback: (verifications: Record<string, UserVerificationData>) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = () => {
    callback(loadAllVerifications())
  }
  window.addEventListener(EVENT_KEY, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(EVENT_KEY, handler)
    window.removeEventListener('storage', handler)
  }
}
