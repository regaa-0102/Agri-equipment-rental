import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'

export type AppTheme = 'light' | 'dark' | 'forest' | 'harvest' | 'earth'

export interface ThemeInfo {
  id: AppTheme
  name: string
  nameTa: string
  description: string
  descriptionTa: string
  bgPreview: string
  cardPreview: string
  accentPreview: string
  textPreview: string
  icon: string
}

export const THEME_OPTIONS: ThemeInfo[] = [
  {
    id: 'light',
    name: 'White / Crisp Day',
    nameTa: 'வெள்ளை / பகல் தோற்றம்',
    description: 'Crisp white layout with agriculture emerald green accents. High clarity for outdoors.',
    descriptionTa: 'தெளிவான வெள்ளை பின்னணி மற்றும் விவசாய பச்சை நிற சிறப்பம்சங்கள்.',
    bgPreview: '#F8FAFC',
    cardPreview: '#FFFFFF',
    accentPreview: '#15803D',
    textPreview: '#0F172A',
    icon: '☀️',
  },
  {
    id: 'dark',
    name: 'Midnight Dark',
    nameTa: 'நள்ளிரவு இருண்ட தோற்றம்',
    description: 'Deep obsidian dark mode with glowing emerald highlights. Battery saving & easy on eyes.',
    descriptionTa: 'கண்களுக்கு இதமான அடர்ந்த இருண்ட பின்னணி மற்றும் ஒளிரும் பச்சை நிறம்.',
    bgPreview: '#0B0F19',
    cardPreview: '#1E293B',
    accentPreview: '#22C55E',
    textPreview: '#F8FAFC',
    icon: '🌙',
  },
  {
    id: 'forest',
    name: 'Forest Emerald',
    nameTa: 'பசுமை காடு தோற்றம்',
    description: 'Lush organic evergreen tones inspired by deep paddy fields and tea plantations.',
    descriptionTa: 'பசுமையான நெல் வயல்கள் மற்றும் தேயிலைத் தோட்டங்களை நினைவூட்டும் பசுமை நிறம்.',
    bgPreview: '#062016',
    cardPreview: '#0F3826',
    accentPreview: '#34D399',
    textPreview: '#ECFDF5',
    icon: '🌲',
  },
  {
    id: 'harvest',
    name: 'Golden Harvest',
    nameTa: 'பொன் அறுவடை தோற்றம்',
    description: 'Warm golden amber and sunset tones inspired by ripe wheat and mustard harvests.',
    descriptionTa: 'முற்றிய பொன் கதிர்கள் மற்றும் சூரிய அஸ்தமனத்தை ஒத்த பொன்னிற தோற்றம்.',
    bgPreview: '#1C150B',
    cardPreview: '#2E2213',
    accentPreview: '#F59E0B',
    textPreview: '#FEF3C7',
    icon: '🌾',
  },
  {
    id: 'earth',
    name: 'Fertile Earth',
    nameTa: 'செம்மண் பூமி தோற்றம்',
    description: 'Rich terracotta and clay tones celebrating fertile agricultural soil.',
    descriptionTa: 'வளமான செம்மண் மற்றும் உழவு நிலத்தின் கம்பீரமான மண் நிறம்.',
    bgPreview: '#1C110C',
    cardPreview: '#2E1C14',
    accentPreview: '#EA580C',
    textPreview: '#FFEDD5',
    icon: '🏺',
  },
]

interface ThemeContextType {
  theme: AppTheme
  setTheme: (theme: AppTheme) => void
  siteZoom: number
  setSiteZoom: (zoom: number) => void
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  isSettingsOpen: boolean
  openSettings: () => void
  closeSettings: () => void
  toggleSettings: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'agrirent_app_theme'
const ZOOM_STORAGE_KEY = 'agrirent_site_zoom'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>('light')
  const [siteZoom, setSiteZoomState] = useState<number>(100)
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as AppTheme
      if (storedTheme && THEME_OPTIONS.some((t) => t.id === storedTheme)) {
        setThemeState(storedTheme)
      } else {
        // Check system preference
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          setThemeState('dark')
        }
      }

      const storedZoom = window.localStorage.getItem(ZOOM_STORAGE_KEY)
      if (storedZoom) {
        const parsed = parseInt(storedZoom, 10)
        if (!isNaN(parsed) && parsed >= 80 && parsed <= 160) {
          setSiteZoomState(parsed)
        }
      }
    } catch (err) {
      console.error('Error reading theme settings:', err)
    }
  }, [])

  // Apply theme class and data-attribute to <html> and <body>
  useEffect(() => {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    root.setAttribute('data-theme', theme)

    // Remove previous theme classes
    THEME_OPTIONS.forEach((t) => {
      root.classList.remove(`theme-${t.id}`)
    })
    root.classList.remove('dark')

    root.classList.add(`theme-${theme}`)
    if (theme !== 'light') {
      root.classList.add('dark')
    }

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {}
  }, [theme])

  // Apply site zoom scaling
  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement

    root.style.setProperty('--site-zoom', `${siteZoom}%`)

    // Apply smooth page zoom via style
    if (siteZoom === 100) {
      root.style.removeProperty('zoom')
      root.style.removeProperty('font-size')
    } else {
      // Use CSS zoom where supported or scale font-size
      root.style.setProperty('zoom', `${siteZoom / 100}`)
    }

    try {
      window.localStorage.setItem(ZOOM_STORAGE_KEY, siteZoom.toString())
    } catch {}
  }, [siteZoom])

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme)
  }

  const setSiteZoom = (zoom: number) => {
    const clamped = Math.max(80, Math.min(160, Math.round(zoom)))
    setSiteZoomState(clamped)
  }

  const zoomIn = () => {
    setSiteZoomState((prev) => Math.min(160, prev + 10))
  }

  const zoomOut = () => {
    setSiteZoomState((prev) => Math.max(80, prev - 10))
  }

  const resetZoom = () => {
    setSiteZoomState(100)
  }

  const openSettings = () => setIsSettingsOpen(true)
  const closeSettings = () => setIsSettingsOpen(false)
  const toggleSettings = () => setIsSettingsOpen((prev) => !prev)

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      siteZoom,
      setSiteZoom,
      zoomIn,
      zoomOut,
      resetZoom,
      isSettingsOpen,
      openSettings,
      closeSettings,
      toggleSettings,
    }),
    [theme, siteZoom, isSettingsOpen],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
