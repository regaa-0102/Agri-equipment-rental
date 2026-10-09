import { X } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function OAuthModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null

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
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: 17,
                fontWeight: 700,
                margin: 0,
                color: '#111827',
              }}
            >
              Google Sign-In
            </h3>
            <span
              style={{
                fontSize: 12,
                color: '#6B7280',
              }}
            >
              AgriRent Marketplace
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '28px 24px 24px', textAlign: 'center' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: 24,
            }}
          >
            G
          </div>

          <h4
            style={{
              margin: '0 0 8px',
              fontSize: 16,
              fontWeight: 700,
              color: '#111827',
            }}
          >
            Google Sign-In is not configured yet
          </h4>

          <p
            style={{
              margin: '0 auto 22px',
              maxWidth: 340,
              fontSize: 13,
              lineHeight: 1.6,
              color: '#6B7280',
            }}
          >
            Please use your AgriRent email and password to sign in.
            Google OAuth can be connected later using your Google Cloud
            OAuth credentials.
          </p>

          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: 10,
              border: 'none',
              background: '#16A34A',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Continue with Email
          </button>
        </div>
      </div>
    </div>
  )
}
