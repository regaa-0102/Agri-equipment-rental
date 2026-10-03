import { CatalogItem } from './catalog'

const STORAGE_KEY = 'agrirent_recently_viewed'
const EVENT_KEY = 'agrirent_recently_viewed_change'

export interface RecentlyViewedItem {
  id: string
  name: string
  nameTa?: string | undefined
  cat: string
  img: string
  price: string
  dailyRate: number
  location: string
  rating: number
  reviews: number
  viewedAt: string
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as RecentlyViewedItem[]
  } catch {
    return []
  }
}

export function recordRecentlyViewed(item: CatalogItem | { id: string; name: string; nameTa?: string; cat: string; img: string; price: string; dailyRate: number; location: string; rating: number; reviews: number }): void {
  if (typeof window === 'undefined') return
  try {
    const list = getRecentlyViewed()
    // Remove if already exists to move it to the top
    const filtered = list.filter((i) => i.id !== item.id)
    const entry: RecentlyViewedItem = {
      id: item.id,
      name: item.name,
      nameTa: item.nameTa,
      cat: item.cat,
      img: item.img,
      price: item.price,
      dailyRate: item.dailyRate,
      location: item.location,
      rating: item.rating,
      reviews: item.reviews,
      viewedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    const updated = [entry, ...filtered].slice(0, 8)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: updated }))
  } catch (err) {
    console.error('Error saving recently viewed:', err)
  }
}

export function clearRecentlyViewed(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: [] }))
  } catch {}
}

export function onRecentlyViewedChange(callback: (items: RecentlyViewedItem[]) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const listener = (event: Event) => {
    const custom = event as CustomEvent<RecentlyViewedItem[]>
    callback(custom.detail || getRecentlyViewed())
  }
  window.addEventListener(EVENT_KEY, listener)
  return () => window.removeEventListener(EVENT_KEY, listener)
}
