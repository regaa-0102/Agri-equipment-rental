import { useEffect, useState } from 'react'
import { Key, X, ShieldCheck } from 'lucide-react'
import { api, type UserSession } from '../lib/api-client'

interface Props {
  isOpen: boolean
  onClose: () => void
}

interface SessionDetails {
  user: UserSession
  jwtClaims: unknown
}

export default function JwtInspectorModal({ isOpen, onClose }: Props) {
  const [session, setSession] = useState<SessionDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    let active = true
    setLoading(true)
    setError(null)
    void api.getMe()
      .then((details) => {
        if (active) setSession(details)
      })
      .catch((reason: unknown) => {
        if (active) {
          setSession(null)
          setError(reason instanceof Error ? reason.message : 'No authenticated session is available.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 20000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          background: '#0F172A',
          color: '#F8FAFC',
          borderRadius: 20,
          width: 720,
          maxWidth: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid #334155',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Key size={20} color="#FBBF24" />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#F8FAFC' }}>
              Authenticated Session Inspector
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loading ? (
            <div style={{ color: '#94A3B8', textAlign: 'center', padding: 32 }}>Checking server session…</div>
          ) : session ? (
            <>
              <div style={{ background: '#020617', borderRadius: 12, padding: 14, border: '1px solid #1E293B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34D399', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                  <ShieldCheck size={16} />
                  <span>Session validated by the server</span>
                </div>
                <div style={{ color: '#CBD5E1', fontSize: 13 }}>
                  {session.user.name} · {session.user.email} · {session.user.role}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#93C5FD', marginBottom: 6 }}>Server-verified JWT claims</div>
                <pre style={{ background: '#1E293B', padding: 12, borderRadius: 10, fontSize: 12, fontFamily: 'monospace', color: '#BFDBFE', border: '1px solid #334155', margin: 0, overflowX: 'auto' }}>
                  {JSON.stringify(session.jwtClaims, null, 2)}
                </pre>
              </div>
              <div style={{ color: '#94A3B8', fontSize: 12, lineHeight: 1.6 }}>
                The signed token is stored in an HttpOnly cookie and is intentionally not exposed to browser scripts.
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 32, color: '#94A3B8' }}>
              <Key size={36} color="#64748B" style={{ marginBottom: 12 }} />
              <div style={{ color: '#E2E8F0', fontWeight: 700 }}>No authenticated session</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>{error || 'Sign in with your registered email and password.'}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
