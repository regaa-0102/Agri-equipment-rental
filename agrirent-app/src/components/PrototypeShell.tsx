import { useState, type ReactNode } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import LanguageSelector from './LanguageSelector'
import AgriRentApp from './AgriRentApp'
import { useLanguage } from '../context/LanguageContext'
import ApiExplorerModal from './ApiExplorerModal'
import JwtInspectorModal from './JwtInspectorModal'
import { Tractor, Settings, ZoomIn, ZoomOut, Palette } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export const SCREENS = [
  { id: 'home', path: '/', label: '1. Home / Equipment Catalog' },
  { id: 'login', path: '/login', label: '2. Login Page (5 Test Accounts)' },
  { id: 'register', path: '/register', label: '3. Registration Page' },
  { id: 'farmer-dashboard', path: '/farmer-dashboard', label: '4. Farmer Dashboard' },
  { id: 'equipment-details', path: '/equipment-details', label: '5. Equipment Details' },
  { id: 'booking', path: '/booking', label: '6. Booking Page' },
  { id: 'payment-success', path: '/payment-success', label: '7. Payment Success' },
  { id: 'my-bookings', path: '/my-bookings', label: '8. My Bookings' },
  { id: 'owner-dashboard', path: '/owner-dashboard', label: '9. Owner Dashboard' },
  { id: 'add-equipment', path: '/add-equipment', label: '10. Add Equipment' },
  { id: 'admin-dashboard', path: '/admin-dashboard', label: '11. Admin Dashboard (Mandatory)' },
  { id: 'notifications', path: '/notifications', label: '12. Notifications Center' },
  { id: 'profile', path: '/profile', label: '13. Profile & Identity Verification' },
  { id: 'payments', path: '/payments', label: '14. Payments & Escrow Ledger' },
  { id: 'help', path: '/help', label: '15. Help & Support' },
  { id: 'owner-bookings', path: '/owner-bookings', label: '16. Owner Booking Requests' },
  { id: 'analytics', path: '/analytics', label: '17. Fleet Analytics' },
  { id: 'revenue', path: '/revenue', label: '18. Revenue & Settlements' },
  { id: 'contact', path: '/contact', label: '19. Contact Us' },
]

export function screenPath(screen: string) {
  return SCREENS.find((s) => s.id === screen)?.path ?? '/'
}

export function usePrototypeNavigate() {
  const navigate = useNavigate()
  return (screen: string) => {
    navigate({ to: screenPath(screen) as string })
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
  }
}

export default function PrototypeShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { theme, siteZoom, zoomIn, zoomOut, openSettings } = useTheme()
  const [apiModalOpen, setApiModalOpen] = useState(false)
  const [jwtModalOpen, setJwtModalOpen] = useState(false)

  const handleScreenChange = (path: string) => {
    navigate({ to: path as string })
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
  }

  return (
    <div className="prototype-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 44px Prototype Header Bar */}
      <div
        className="prototype-top-bar"
        style={{
          minHeight: 44,
          background: '#0F172A',
          color: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 10000,
          borderBottom: '1px solid #334155',
          fontSize: 12,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
            onClick={() => handleScreenChange('/')}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                background: '#15803D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                flexShrink: 0,
              }}
            >
              <Tractor size={16} strokeWidth={2.2} />
            </div>
            <strong style={{ color: '#4ADE80', fontSize: 13, letterSpacing: '-0.2px' }}>AgriRent Enterprise</strong>
          </div>

        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Zoom In & Zoom Out Quick Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 8,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '2px 4px',
              gap: 4,
            }}
          >
            <button
              type="button"
              onClick={zoomOut}
              disabled={siteZoom <= 80}
              title="Website Zoom Out (-)"
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: siteZoom <= 80 ? 'not-allowed' : 'pointer',
                padding: '2px 4px',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                opacity: siteZoom <= 80 ? 0.4 : 1,
              }}
            >
              <ZoomOut size={13} />
            </button>
            <span
              onClick={openSettings}
              title="Click to change Zoom or Theme"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#4ADE80',
                cursor: 'pointer',
                padding: '0 2px',
                minWidth: 32,
                textAlign: 'center',
              }}
            >
              {siteZoom}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              disabled={siteZoom >= 150}
              title="Website Zoom In (+)"
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: siteZoom >= 150 ? 'not-allowed' : 'pointer',
                padding: '2px 4px',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                opacity: siteZoom >= 150 ? 0.4 : 1,
              }}
            >
              <ZoomIn size={13} />
            </button>
          </div>

          {/* Settings & Theme Button */}
          <button
            type="button"
            onClick={openSettings}
            title="Open Settings (Themes, Display Zoom, Language)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 8,
              color: '#F8FAFC',
              padding: '5px 10px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <Palette size={13} style={{ color: '#4ADE80' }} />
            <span>Theme / Settings</span>
            <Settings size={13} />
          </button>

          {/* Language Selector */}
          <LanguageSelector />
        </div>
      </div>

      {/* Main routed screen content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>

      {/* Modals */}
      <ApiExplorerModal isOpen={apiModalOpen} onClose={() => setApiModalOpen(false)} />
      <JwtInspectorModal isOpen={jwtModalOpen} onClose={() => setJwtModalOpen(false)} />
    </div>
  )
}
