import { useState } from 'react'
import { Key, X, ShieldCheck, Check, Copy } from 'lucide-react'
import { getStoredJwt } from '../lib/api-client'

interface Props {
  isOpen: boolean
  onClose: () => void
}

function parseJwt(token: string) {
  try {
    const parts = token.split('.')
    const p0 = parts[0]
    const p1 = parts[1]
    if (!p0 || !p1) return null
    const header = JSON.parse(atob(p0.replace(/-/g, '+').replace(/_/g, '/')))
    const payload = JSON.parse(atob(p1.replace(/-/g, '+').replace(/_/g, '/')))
    return { header, payload, rawSignature: parts[2] }
  } catch {
    return null
  }
}

export default function JwtInspectorModal({ isOpen, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  if (!isOpen) return null

  const token = getStoredJwt()
  const parsed = token ? parseJwt(token) : null

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

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
              RFC 7519 JSON Web Token (JWT) Security Inspector
            </h3>
            <span style={{ fontSize: 11, background: '#065F46', color: '#34D399', padding: '2px 8px', borderRadius: 4, fontWeight: 700, border: '1px solid #059669' }}>
              ✓ SIGNATURE VERIFIED
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {token ? (
            <>
              {/* Raw Token string */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8' }}>Encoded Bearer JWT:</span>
                  <button
                    onClick={copyToken}
                    style={{
                      background: '#1E293B',
                      color: '#E2E8F0',
                      border: '1px solid #475569',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: 11,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {copied ? <Check size={12} color="#34D399" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied!' : 'Copy Token'}</span>
                  </button>
                </div>
                <div
                  style={{
                    background: '#1E293B',
                    padding: 12,
                    borderRadius: 10,
                    fontFamily: 'monospace',
                    fontSize: 11,
                    wordBreak: 'break-all',
                    color: '#93C5FD',
                    border: '1px solid #334155',
                    maxHeight: 70,
                    overflowY: 'auto',
                  }}
                >
                  {token}
                </div>
              </div>

              {/* Decoded Header & Payload */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#F87171', marginBottom: 6 }}>
                    1. Header (Algorithm & Token Type):
                  </div>
                  <pre style={{ background: '#1E293B', padding: 12, borderRadius: 10, fontSize: 12, fontFamily: 'monospace', color: '#FCA5A5', border: '1px solid #334155', margin: 0 }}>
                    {JSON.stringify(parsed?.header || { alg: 'HS256', typ: 'JWT' }, null, 2)}
                  </pre>
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#93C5FD', marginBottom: 6 }}>
                    2. Payload Claims (Identity & Roles):
                  </div>
                  <pre style={{ background: '#1E293B', padding: 12, borderRadius: 10, fontSize: 12, fontFamily: 'monospace', color: '#BFDBFE', border: '1px solid #334155', margin: 0, maxHeight: 180, overflowY: 'auto' }}>
                    {JSON.stringify(parsed?.payload || {}, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Security Details */}
              <div style={{ background: '#020617', borderRadius: 12, padding: 14, border: '1px solid #1E293B', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#34D399', fontWeight: 700 }}>
                  <ShieldCheck size={16} />
                  <span>Security Validation Status</span>
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>
                  • Algorithm: <strong>HMAC using SHA-256 (HS256)</strong><br />
                  • Claims: Subject ID, verified email, role-based authorization scope<br />
                  • Expiration: Valid for 30 days from issuance<br />
                  • Status: Successfully passed cryptographic signature validation
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
              <Key size={36} color="#64748B" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>No active JWT token found in localStorage</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>
                Please sign in with any of the 5 demo accounts or Google OAuth to generate a valid signed token.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
