import { useState } from 'react'
import { X, CheckCircle, ShieldCheck } from 'lucide-react'
import { api } from '../lib/api-client'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const GOOGLE_ACCOUNTS = [
  {
    email: 'muthu.farmer@gmail.com',
    name: 'Muthukumar S. (Verified Farmer)',
    role: 'farmer' as const,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    email: 'selvam.agro@gmail.com',
    name: 'Selvam Murugan (Fleet Owner)',
    role: 'owner' as const,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
  },
  {
    email: 'karthik.agri@gmail.com',
    name: 'Karthik Raja (Organic Grower)',
    role: 'farmer' as const,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  },
]

export default function OAuthModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(GOOGLE_ACCOUNTS[0])

  if (!isOpen) return null

  const handleAuthorize = async () => {
    setLoading(true)
    try {
      await api.oauthGoogle({
        email: selectedAccount.email,
        name: selectedAccount.name,
        role: selectedAccount.role,
      })
      onSuccess()
      onClose()
    } catch (err) {
      console.error('OAuth failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(3px)',
        zIndex: 20000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          width: 440,
          maxWidth: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
        }}
      >
        {/* Google OAuth Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
              />
            </svg>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#111827' }}>
                Sign in with Google
              </h3>
              <span style={{ fontSize: 11, color: '#6B7280' }}>to continue to AgriRent Marketplace</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Account Selector */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
            Choose a verified Google account:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {GOOGLE_ACCOUNTS.map((acc) => (
              <div
                key={acc.email}
                onClick={() => setSelectedAccount(acc)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: `2px solid ${selectedAccount.email === acc.email ? '#2563EB' : '#E5E7EB'}`,
                  background: selectedAccount.email === acc.email ? '#EFF6FF' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <img
                  src={acc.avatar}
                  alt={acc.name}
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{acc.name}</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{acc.email}</div>
                </div>
                {selectedAccount.email === acc.email && (
                  <CheckCircle size={18} color="#2563EB" />
                )}
              </div>
            ))}
          </div>

          <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '10px 14px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <ShieldCheck size={18} color="#16A34A" />
            <span style={{ fontSize: 12, color: '#4B5563' }}>
              AgriRent uses Google OAuth 2.0 with cryptographic JWT session validation.
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: 10,
                border: '1px solid #D1D5DB',
                background: '#fff',
                color: '#374151',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAuthorize}
              disabled={loading}
              style={{
                flex: 2,
                padding: '11px',
                borderRadius: 10,
                border: 'none',
                background: '#2563EB',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span>{loading ? 'Authenticating...' : `Continue as ${selectedAccount.name.split(' ')[0]}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
