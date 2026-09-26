import { useState, type ReactNode } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import LanguageSelector from './LanguageSelector'
import AgriRentApp from './AgriRentApp'
import { useLanguage } from '../context/LanguageContext'
import ApiExplorerModal from './ApiExplorerModal'
import JwtInspectorModal from './JwtInspectorModal'
import { Tractor } from 'lucide-react'

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
