export interface UserSession {
  id: string
  name: string
  email: string
  role: 'farmer' | 'owner' | 'admin'
  phone?: string
  location?: string
  avatar?: string
  theme?: string
  provider?: 'local' | 'google'
  verificationStatus?: 'NOT_VERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
}

let currentUser: UserSession | null = null
let authInitialized = false
let authRestorePromise: Promise<UserSession | null> | null = null

export function getStoredUser(): UserSession | null {
  return currentUser
}

export function isAuthInitialized(): boolean {
  return authInitialized
}

export function setAuthenticatedUser(user: UserSession | null): void {
  currentUser = user
  authInitialized = true
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('agrirent_auth_change', { detail: user }))
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')

  const response = await fetch(endpoint, {
    ...options,
    credentials: 'same-origin',
    headers,
  })

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`
    try {
      const body = await response.json()
      if (body.error) errorMsg = body.error
    } catch {}
    if (
      response.status === 401 &&
      ![
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/logout',
        '/api/auth/email-otp/request',
        '/api/auth/email-otp/verify',
      ].includes(endpoint)
    ) {
      setAuthenticatedUser(null)
    }
    throw new Error(errorMsg)
  }

  return response.json() as Promise<T>
}

export const api = {
  // Auth
  async login(email: string, password: string, role: 'farmer' | 'owner' | 'admin', remember = true) {
    const res = await request<{ user: UserSession }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role, remember }),
    })
    setAuthenticatedUser(res.user)
    return res
  },

  async requestEmailOtp(email: string, role?: 'farmer' | 'owner' | 'admin') {
    return request<{ success: boolean }>('/api/auth/email-otp/request', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    })
  },

  async verifyEmailOtp(email: string, code: string, role?: 'farmer' | 'owner' | 'admin') {
    const res = await request<{ user: UserSession }>('/api/auth/email-otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code, role }),
    })
    setAuthenticatedUser(res.user)
    return res
  },

  async completeGoogleLogin(role: 'farmer' | 'owner' | 'admin') {
    const res = await request<{ user: UserSession }>('/api/auth/google/complete', {
      method: 'POST',
      body: JSON.stringify({ role }),
    })
    setAuthenticatedUser(res.user)
    return res
  },

  async register(data: {
    name: string
    email: string
    password: string
    confirmPassword: string
    role: 'farmer' | 'owner'
    phone: string
    location?: string
  }) {
    const res = await request<{ user: UserSession }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    setAuthenticatedUser(res.user)
    return res
  },

  async logout() {
    await request<{ success: boolean }>('/api/auth/logout', { method: 'POST' })
    setAuthenticatedUser(null)
  },

  async restoreSession(): Promise<UserSession | null> {
    if (authInitialized) return currentUser
    if (authRestorePromise) return authRestorePromise
    authRestorePromise = this.getMe()
      .then(({ user }) => {
        setAuthenticatedUser(user)
        return user
      })
      .catch((error: unknown) => {
        setAuthenticatedUser(null)
        if (error instanceof Error && error.message.startsWith('HTTP Error 401')) return null
        throw error
      })
      .finally(() => {
        authRestorePromise = null
      })
    return authRestorePromise
  },

  async updateTheme(theme: string) {
    return request<{ success: boolean; theme: string }>('/api/users/theme', {
      method: 'PATCH',
      body: JSON.stringify({ theme }),
    })
  },

  async getMe() {
    return request<{ user: UserSession; jwtClaims: unknown }>('/api/auth/me')
  },

  // Listings
  async getListings(filters?: {
    search?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    minRating?: number
    availability?: 'rent' | 'buy' | 'both'
    sortBy?: 'rating' | 'reviews' | 'price_asc' | 'price_desc'
  }) {
    const params = new URLSearchParams()
    if (filters?.search) params.set('search', filters.search)
    if (filters?.category) params.set('category', filters.category)
    if (filters?.minPrice) params.set('minPrice', String(filters.minPrice))
    if (filters?.maxPrice) params.set('maxPrice', String(filters.maxPrice))
    if (filters?.minRating) params.set('minRating', String(filters.minRating))
    if (filters?.availability) params.set('availability', filters.availability)
    if (filters?.sortBy) params.set('sortBy', filters.sortBy)
    const query = params.toString() ? `?${params.toString()}` : ''
    return request<{ count: number; listings: any[] }>(`/api/listings${query}`)
  },

  async getListingById(id: string) {
    return request<{ listing: any; ratingSummary?: any; reviews?: any[]; vendor?: any }>(`/api/listings/${id}`)
  },

  // Reviews
  async getReviews(equipmentId?: string) {
    const query = equipmentId ? `?equipmentId=${encodeURIComponent(equipmentId)}` : ''
    return request<{ reviews: any[]; summary: any }>(`/api/reviews${query}`)
  },

  async createReview(data: { equipmentId: string; bookingId: string; rating: number; reviewText?: string }) {
    return request<{ success: boolean; review: any; summary: any }>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Vendors
  async getVendors(filters?: {
    lat?: number
    lng?: number
    city?: string
    search?: string
    sortBy?: 'distance' | 'rating'
  }) {
    const params = new URLSearchParams()
    if (filters?.lat !== undefined) params.set('lat', String(filters.lat))
    if (filters?.lng !== undefined) params.set('lng', String(filters.lng))
    if (filters?.city) params.set('city', filters.city)
    if (filters?.search) params.set('search', filters.search)
    if (filters?.sortBy) params.set('sortBy', filters.sortBy)
    const query = params.toString() ? `?${params.toString()}` : ''
    return request<{ count: number; vendors: any[] }>(`/api/vendors${query}`)
  },

  async getVendorById(id: string) {
    return request<{ vendor: any }>(`/api/vendors/${id}`)
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
    return request<{
      booking: any
      invoiceEmailSent: boolean
      sms: { status: 'sent' | 'failed' | 'no_phone'; maskedPhone?: string }
    }>('/api/bookings', {
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

  async completeAdminBooking(id: string) {
    return request<{ booking: any }>(`/api/admin/bookings/${encodeURIComponent(id)}/complete`, {
      method: 'PATCH',
    })
  },

  async extendBooking(id: string, endDate: string) {
    return request<{ booking: any }>(`/api/bookings/${id}/extend`, {
      method: 'PATCH',
      body: JSON.stringify({ endDate }),
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

  // Contact Us
  async submitContactMessage(data: {
    fullName: string
    email: string
    phone: string
    subject: string
    category: string
    message: string
  }) {
    try {
      const res = await request<{
        success: boolean
        message: string
        contact: any
      }>('/api/contact', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if (typeof window !== 'undefined') {
        try {
          const raw = window.localStorage.getItem('agrirent_contact_messages')
          const list = raw ? JSON.parse(raw) : []
          list.unshift(res.contact || { ...data, id: `local-${Date.now()}`, createdAt: new Date().toISOString() })
          window.localStorage.setItem('agrirent_contact_messages', JSON.stringify(list))
        } catch {}
      }
      return res
    } catch (err) {
      console.warn('Backend /api/contact unreachable or demo mode, persisting locally:', err)
      const fallback = {
        id: `contact-local-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        status: 'new',
      }
      if (typeof window !== 'undefined') {
        try {
          const raw = window.localStorage.getItem('agrirent_contact_messages')
          const list = raw ? JSON.parse(raw) : []
          list.unshift(fallback)
          window.localStorage.setItem('agrirent_contact_messages', JSON.stringify(list))
        } catch {}
      }
      return {
        success: true,
        message: 'Your message has been sent successfully. Regaa G and the AgriRent team will respond shortly.',
        contact: fallback,
      }
    }
  },
}
