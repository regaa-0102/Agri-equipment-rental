const TOKEN_KEY = 'agrirent_jwt_token'
const USER_KEY = 'agrirent_user_session'

export interface UserSession {
  id: string
  name: string
  email: string
  role: 'farmer' | 'owner' | 'admin'
  phone?: string
  location?: string
  avatar?: string
  provider?: 'local' | 'google'
}

export function getStoredJwt(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setStoredJwt(token: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function getStoredUser(): UserSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredUser(user: UserSession): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
  window.dispatchEvent(new CustomEvent('agrirent_auth_change', { detail: user }))
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new CustomEvent('agrirent_auth_change', { detail: null }))
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredJwt()
  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`
    try {
      const body = await response.json()
      if (body.error) errorMsg = body.error
    } catch {}
    throw new Error(errorMsg)
  }

  return response.json() as Promise<T>
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await request<{ token: string; user: UserSession }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setStoredJwt(res.token)
    setStoredUser(res.user)
    return res
  },

  async register(data: { name: string; email: string; password: string; role: 'farmer' | 'owner'; phone?: string; location?: string }) {
    const res = await request<{ token: string; user: UserSession }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    setStoredJwt(res.token)
    setStoredUser(res.user)
    return res
  },

  async oauthGoogle(data?: { email?: string; name?: string; role?: 'farmer' | 'owner' }) {
    const res = await request<{ token: string; oauthProvider: string; user: UserSession }>('/api/auth/oauth', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    })
    setStoredJwt(res.token)
    setStoredUser(res.user)
    return res
  },

  async getSeedUsers() {
    return request<{ seedUsers: Array<UserSession & { defaultPassword: string }> }>('/api/auth/seed-users')
  },

  async getMe() {
    return request<{ user: UserSession; jwtClaims: unknown }>('/api/auth/me')
  },

  // Listings
  async getListings(filters?: { search?: string; category?: string; minPrice?: number; maxPrice?: number }) {
    const params = new URLSearchParams()
    if (filters?.search) params.set('search', filters.search)
    if (filters?.category) params.set('category', filters.category)
    if (filters?.minPrice) params.set('minPrice', String(filters.minPrice))
    if (filters?.maxPrice) params.set('maxPrice', String(filters.maxPrice))
    const query = params.toString() ? `?${params.toString()}` : ''
    return request<{ count: number; listings: any[] }>(`/api/listings${query}`)
  },

  async getListingById(id: string) {
    return request<{ listing: any }>(`/api/listings/${id}`)
  },

  async createListing(data: any) {
    return request<{ listing: any }>('/api/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateListing(id: string, data: any) {
    return request<{ listing: any }>(`/api/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deleteListing(id: string) {
    return request<{ success: boolean; message: string }>(`/api/listings/${id}`, {
      method: 'DELETE',
    })
  },

  // Notifications
  async getNotifications(userId?: string) {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : ''
    return request<{ count: number; notifications: any[] }>(`/api/notifications${query}`)
  },

  async markNotificationRead(id: string) {
    return request<{ notification: any }>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    })
  },

  async markAllNotificationsRead(userId?: string) {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : ''
    return request<{ ok: boolean; message: string }>(`/api/notifications/mark-all-read${query}`, {
      method: 'POST',
    })
  },

  // Verification
  async updateUserVerification(userId: string, status: string) {
    return request<{ user: any; verificationStatus: string }>(`/api/users/${userId}/verification`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    })
  },

  // Bookings
  async getBookings() {
    return request<{ count: number; bookings: any[] }>('/api/bookings')
  },

  async createBooking(data: { listingId: string; startDate: string; endDate: string; days: number }) {
    return request<{ booking: any }>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateBookingStatus(id: string, status: string, escrowStatus?: string) {
    return request<{ booking: any }>(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, escrowStatus }),
    })
  },

  // Admin
  async getAdminMetrics() {
    return request<{ metrics: any; userRole: string }>('/api/admin/metrics')
  },

  async getAdminUsers() {
    return request<{ users: any[] }>('/api/admin/users')
  },

  async toggleUserStatus(userId: string) {
    return request<{ user: any }>(`/api/admin/users/${userId}/toggle`, {
      method: 'POST',
    })
  },

  // Weather & Suitability
  async getWeather(location = 'Coimbatore') {
    return request<any>(`/api/weather?location=${encodeURIComponent(location)}`)
  },

  // AI Chatbot
  async askChatbot(message: string, lang = 'en') {
    return request<{ reply: string; recommendedEquipmentId?: string; quickPills: string[] }>('/api/ai-chat', {
      method: 'POST',
      body: JSON.stringify({ message, lang }),
    })
  },

  // AgriMatch Acreage Calculator
  async calculateAgriMatch(params: { acres: number; crop: string; soil: string; operation: string }) {
    return request<any>('/api/calculator/agrimatch', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  },

  // Health
  async getHealth() {
    return request<any>('/api/health')
  },
}
