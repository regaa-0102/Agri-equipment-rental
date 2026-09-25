export interface BookingItem {
  id: string
  equipment: string
  cat: string
  img: string
  location: string
  from: string // YYYY-MM-DD or readable
  to: string   // YYYY-MM-DD or readable
  dailyRate: number
  amount: string
  totalNumeric: number
  status: 'active' | 'completed' | 'cancelled' | 'pending' | 'confirmed'
  owner: string
  ownerPhone?: string
  trackingStage: number // 0 to 6
  lastLocation?: string
  distance?: string
}

export const TRACKING_STAGES = [
  { id: 'confirmed', en: 'Booking Confirmed', ta: 'முன்பதிவு உறுதி செய்யப்பட்டது' },
  { id: 'prepared', en: 'Equipment Prepared', ta: 'உபகரணம் தயார் செய்யப்பட்டது' },
  { id: 'dispatched', en: 'Picked Up / Dispatched', ta: 'அனுப்பப்பட்டது' },
  { id: 'transit', en: 'In Transit', ta: 'வழியில் உள்ளது' },
  { id: 'nearby', en: 'Near Your Location', ta: 'உங்கள் இருப்பிடத்திற்கு அருகில்' },
  { id: 'delivered', en: 'Delivered / Rented', ta: 'வழங்கப்பட்டது / வாடகையில் உள்ளது' },
  { id: 'completed', en: 'Rental Completed', ta: 'வாடகை நிறைவடைந்தது' },
]

export const SEED_BOOKINGS: BookingItem[] = [
  {
    id: 'BK-2841',
    equipment: 'John Deere 5310 Tractor',
    cat: 'Tractor',
    img: 'https://images.unsplash.com/photo-1533062618053-d51e617307ec?auto=format&fit=crop&w=800&h=520&q=85',
    location: 'Ludhiana, Punjab',
    from: '2026-09-22',
    to: '2026-09-25',
    dailyRate: 1800,
    amount: '₹5,400',
    totalNumeric: 5400,
    status: 'active',
    owner: 'Gurpreet Singh',
    ownerPhone: '+91 98765 43210',
    trackingStage: 4, // Near Your Location
    lastLocation: 'GT Road, Near Doraha Toll (1.8 km away)',
    distance: '2.5 km away',
  },
  {
    id: 'BK-2799',
    equipment: 'Aspee Power Sprayer 45L',
    cat: 'Water Sprayer',
    img: 'https://images.unsplash.com/photo-1592417817098-8f3d69106a49?auto=format&fit=crop&w=800&h=520&q=85',
    location: 'Salem, Tamil Nadu',
    from: '2026-09-20',
    to: '2026-09-24',
    dailyRate: 450,
    amount: '₹1,800',
    totalNumeric: 1800,
    status: 'active',
    owner: 'Ramesh Kumar',
    ownerPhone: '+91 94432 18765',
    trackingStage: 5, // Delivered / Rented
    lastLocation: 'Farmer Field Block B, Salem West',
    distance: '1.8 km away',
  },
  {
    id: 'BK-2756',
    equipment: 'Fieldking Rotavator 7ft',
    cat: 'Rotavator',
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&h=520&q=85',
    location: 'Jaipur, Rajasthan',
    from: '2026-08-28',
    to: '2026-08-30',
    dailyRate: 850,
    amount: '₹1,700',
    totalNumeric: 1700,
    status: 'completed',
    owner: 'Ravi Sharma',
    ownerPhone: '+91 98290 11223',
    trackingStage: 6,
    lastLocation: 'Returned to Owner Depot, Jaipur',
    distance: '4.1 km away',
  },
  {
    id: 'BK-2712',
    equipment: 'Mahindra ARJUN 605 DI',
    cat: 'Tractor',
    img: 'https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?auto=format&fit=crop&w=800&h=520&q=85',
    location: 'Nagpur, Maharashtra',
    from: '2026-07-20',
    to: '2026-07-22',
    dailyRate: 2100,
    amount: '₹4,200',
    totalNumeric: 4200,
    status: 'completed',
    owner: 'Suresh Patel',
    ownerPhone: '+91 97654 32109',
    trackingStage: 6,
    lastLocation: 'Nagpur Central Hub',
    distance: '3.6 km away',
  },
  {
    id: 'BK-2688',
    equipment: 'Fertilizer Spreader 500kg',
    cat: 'Fertilizers',
    img: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=800&h=520&q=85',
    location: 'Coimbatore, Tamil Nadu',
    from: '2026-09-21',
    to: '2026-09-25',
    dailyRate: 600,
    amount: '₹2,400',
    totalNumeric: 2400,
    status: 'active',
    owner: 'Muthu Kumar',
    ownerPhone: '+91 98421 55667',
    trackingStage: 3, // In Transit
    lastLocation: 'Pollachi Main Road (4.2 km away)',
    distance: '3.2 km away',
  },
  {
    id: 'BK-2645',
    equipment: 'CLAAS Lexion 8700 Harvester',
    cat: 'Harvester',
    img: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&h=520&q=85',
    location: 'Amritsar, Punjab',
    from: '2026-07-01',
    to: '2026-07-05',
    dailyRate: 6800,
    amount: '₹27,200',
    totalNumeric: 27200,
    status: 'cancelled',
    owner: 'Balvinder Singh',
    ownerPhone: '+91 98140 99887',
    trackingStage: 0,
    lastLocation: 'Cancelled prior to dispatch',
    distance: '5.2 km away',
  },
]

const STORAGE_KEY = 'agrirent-bookings-data'
const EVENT_KEY = 'agrirent-bookings-updated'

export function getStoredBookings(): BookingItem[] {
  if (typeof window === 'undefined') return SEED_BOOKINGS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_BOOKINGS))
      return SEED_BOOKINGS
    }
    return JSON.parse(raw)
  } catch {
    return SEED_BOOKINGS
  }
}

export function saveBookings(bookings: BookingItem[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: bookings }))
  } catch (e) {
    console.error('Failed to save bookings', e)
  }
}

export function extendBookingRental(
  id: string,
  newEndDate: string,
): { success: boolean; error?: string; booking?: BookingItem; additionalCost?: number } {
  const list = getStoredBookings()
  const index = list.findIndex((b) => b.id === id)
  if (index === -1) return { success: false, error: 'Booking not found' }

  const target = list[index]
  if (target.status === 'cancelled') {
    return { success: false, error: 'Cannot extend a cancelled booking' }
  }

  const curEnd = new Date(target.to).getTime()
  const nextEnd = new Date(newEndDate).getTime()

  if (isNaN(nextEnd)) {
    return { success: false, error: 'Invalid date format' }
  }

  const diffTime = nextEnd - curEnd
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) {
    return { success: false, error: 'New end date must be after current end date' }
  }

  const additionalCost = diffDays * target.dailyRate
  const updatedNumeric = target.totalNumeric + additionalCost

  const updated: BookingItem = {
    ...target,
    to: newEndDate,
    totalNumeric: updatedNumeric,
    amount: `₹${updatedNumeric.toLocaleString('en-IN')}`,
  }

  list[index] = updated
  saveBookings(list)
  return { success: true, booking: updated, additionalCost }
}

export function cancelBookingRental(
  id: string,
): { success: boolean; error?: string; booking?: BookingItem } {
  const list = getStoredBookings()
  const index = list.findIndex((b) => b.id === id)
  if (index === -1) return { success: false, error: 'Booking not found' }

  const target = list[index]
  if (target.status === 'cancelled') {
    return { success: false, error: 'Booking is already cancelled' }
  }
  if (target.status === 'completed') {
    return { success: false, error: 'Cannot cancel an already completed booking' }
  }

  const updated: BookingItem = {
    ...target,
    status: 'cancelled',
    trackingStage: 0,
  }

  list[index] = updated
  saveBookings(list)
  return { success: true, booking: updated }
}

export function createNewBooking(
  booking: Omit<BookingItem, 'id' | 'status' | 'trackingStage'>,
): BookingItem {
  const list = getStoredBookings()
  const newId = `BK-${Math.floor(1000 + Math.random() * 9000)}`
  const fullItem: BookingItem = {
    ...booking,
    id: newId,
    status: 'active',
    trackingStage: 1, // Equipment Prepared
  }
  list.unshift(fullItem)
  saveBookings(list)
  return fullItem
}

export function onBookingsChange(callback: (bookings: BookingItem[]) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = () => {
    callback(getStoredBookings())
  }
  window.addEventListener(EVENT_KEY, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(EVENT_KEY, handler)
    window.removeEventListener('storage', handler)
  }
}
