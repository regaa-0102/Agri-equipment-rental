export interface BookingItem {
  id: string
  equipmentId?: string | undefined
  equipment: string
  cat: string
  category?: string | undefined
  days?: number | undefined
  img: string
  location: string
  from: string // YYYY-MM-DD or readable
  to: string   // YYYY-MM-DD or readable
  dailyRate: number
  amount: string
  totalNumeric: number
  status: 'active' | 'completed' | 'cancelled' | 'pending' | 'confirmed'
  owner: string
  ownerPhone?: string | undefined
  trackingStage: number // 0 to 6
  lastLocation?: string | undefined
  distance?: string | undefined
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
    equipment: 'John Deere 5310',
    cat: 'Tractor',
    img: '/equipment/tractors/john-deere-5310.jpg',
    location: 'Thanjavur, Tamil Nadu',
    from: '2026-09-22',
    to: '2026-09-25',
    dailyRate: 2200,
    amount: '₹6,600',
    totalNumeric: 6600,
    status: 'active',
    owner: 'M. Ramesh',
    ownerPhone: '+91 98422 34567',
    trackingStage: 4, // Near Your Location
    lastLocation: 'Thanjavur Bypass (1.8 km away)',
    distance: '2.5 km away',
  },
  {
    id: 'BK-2799',
    equipment: 'DJI Agras T40 Agricultural Drone',
    cat: 'Sprayers & Drones',
    img: '/equipment/sprayers-drones/dji-agras-t40.jpg',
    location: 'Coimbatore, Tamil Nadu',
    from: '2026-09-20',
    to: '2026-09-24',
    dailyRate: 2800,
    amount: '₹8,400',
    totalNumeric: 8400,
    status: 'active',
    owner: 'Balvinder Singh',
    ownerPhone: '+91 98140 87654',
    trackingStage: 5, // Delivered / Rented
    lastLocation: 'Farmer Field Block B, Pollachi Road',
    distance: '1.8 km away',
  },
  {
    id: 'BK-2756',
    equipment: 'Shaktiman Rotary Tiller',
    cat: 'Ploughing & Tilling',
    img: '/equipment/tillage/shaktiman-rotary-tiller.jpg',
    location: 'Coimbatore, Tamil Nadu',
    from: '2026-08-28',
    to: '2026-08-30',
    dailyRate: 1100,
    amount: '₹2,200',
    totalNumeric: 2200,
    status: 'completed',
    owner: 'Selvam Murugan',
    ownerPhone: '+91 98421 54321',
    trackingStage: 6,
    lastLocation: 'Returned to Owner Depot, Coimbatore',
    distance: '4.1 km away',
  },
  {
    id: 'BK-2712',
    equipment: 'Mahindra 575 DI Yuvo Tech+',
    cat: 'Tractor',
    img: '/equipment/tractors/mahindra-575-di-yuvo-tech-plus.jpg',
    location: 'Coimbatore, Tamil Nadu',
    from: '2026-07-20',
    to: '2026-07-22',
    dailyRate: 1800,
    amount: '₹3,600',
    totalNumeric: 3600,
    status: 'completed',
    owner: 'Karthik Subramanian',
    ownerPhone: '+91 98421 23456',
    trackingStage: 6,
    lastLocation: 'Coimbatore Central Hub',
    distance: '3.6 km away',
  },
  {
    id: 'BK-2688',
    equipment: 'Mahindra Seed Drill',
    cat: 'Seeding',
    img: '/equipment/seeding/mahindra-seed-drill.jpg',
    location: 'Thanjavur, Tamil Nadu',
    from: '2026-09-21',
    to: '2026-09-25',
    dailyRate: 1400,
    amount: '₹5,600',
    totalNumeric: 5600,
    status: 'active',
    owner: 'Selvam Murugan',
    ownerPhone: '+91 98421 54321',
    trackingStage: 3, // In Transit
    lastLocation: 'Kumbakonam Main Road (3.2 km away)',
    distance: '3.2 km away',
  },
  {
    id: 'BK-2645',
    equipment: 'Claas Crop Tiger 30',
    cat: 'Harvester',
    img: '/equipment/harvesters/claas-crop-tiger-30.jpg',
    location: 'Thanjavur, Tamil Nadu',
    from: '2026-07-01',
    to: '2026-07-05',
    dailyRate: 4800,
    amount: '₹19,200',
    totalNumeric: 19200,
    status: 'cancelled',
    owner: 'Balvinder Singh',
    ownerPhone: '+91 98140 87654',
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
  const target = list[index]
  if (!target) return { success: false, error: 'Booking not found' }
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
    id: target.id,
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
  if (!target) return { success: false, error: 'Booking not found' }
  if (target.status === 'cancelled') {
    return { success: false, error: 'Booking is already cancelled' }
  }
  if (target.status === 'completed') {
    return { success: false, error: 'Cannot cancel an already completed booking' }
  }

  const updated: BookingItem = {
    ...target,
    id: target.id,
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

export function hasActiveBookingForEquipment(equipmentNameOrId: string): boolean {
  const list = getStoredBookings()
  const lower = (equipmentNameOrId || '').toLowerCase().trim()
  return list.some(
    (b) =>
      (b.id.toLowerCase() === lower ||
        b.equipment.toLowerCase().includes(lower) ||
        lower.includes(b.equipment.toLowerCase())) &&
      (b.status === 'active' || b.status === 'pending' || b.status === 'confirmed')
  )
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
