import { useState } from 'react'
import { ShieldCheck, Check, Sparkles } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { api } from '../lib/api-client'
import OAuthModal from '../components/OAuthModal'

const P = '#2E7D32'

interface Props {
  onNavigate: (screen: string) => void
}

export default function LoginPage({ onNavigate }: Props) {
  const { t, isTamil } = useLanguage()
  const [tab, setTab] = useState<'farmer' | 'owner' | 'admin'>('farmer')
  const [email, setEmail] = useState('muthu.farmer@gmail.com')
  const [password, setPassword] = useState('Farmer@123')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [oauthOpen, setOauthOpen] = useState(false)

  const handleRoleTab = (role: 'farmer' | 'owner' | 'admin') => {
    setTab(role)
    setError(null)
    if (role === 'admin') {
      setEmail('admin@agrirent.in')
      setPassword('Admin@123')
    } else if (role === 'owner') {
      setEmail('selvam.agro@gmail.com')
      setPassword('Owner@123')
    } else {
      setEmail('muthu.farmer@gmail.com')
      setPassword('Farmer@123')
    }
  }

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await api.login(email, password)
      if (res.user.role === 'admin') {
        onNavigate('admin-dashboard')
      } else if (res.user.role === 'owner') {
        onNavigate('owner-dashboard')
      } else {
        onNavigate('farmer-dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 44px)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minWidth: 0, background: '#fff', padding: '36px 20px' }}>
      {/* Login Form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <div className="card-shadow" style={{ background: '#fff', borderRadius: 24, padding: '36px', width: '100%', maxWidth: 440, border: '1px solid #E5E7EB' }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
              {isTamil ? 'உங்கள் கணக்கில் உள்நுழையவும்' : 'Sign in to AgriRent'}
            </h2>
            <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>
              {isTamil ? 'கணக்கு இல்லையா?' : "Don't have an account?"}{' '}
              <button
                onClick={() => onNavigate('register')}
                style={{ color: P, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: 0 }}
              >
                {isTamil ? 'புதிதாக உருவாக்கவும்' : 'Create one free'}
              </button>
            </p>
          </div>

          {/* Role selector tabs */}
          <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 20 }}>
            {(['farmer', 'owner', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleTab(r)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 9,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  background: tab === r ? '#fff' : 'transparent',
                  color: tab === r ? P : '#6B7280',
                  boxShadow: tab === r ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  textTransform: 'capitalize',
                }}
              >
                {r === 'farmer' ? '🌾 Farmer' : r === 'owner' ? '🔧 Owner' : '⚙️ Admin'}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleManualLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                {isTamil ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
              </label>
              <input
                className="input-field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gmail.com"
                required
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
                  {isTamil ? 'கடவுச்சொல்' : 'Password'}
                </label>
                <span style={{ fontSize: 12, color: P, fontWeight: 600 }}>Default: {tab === 'admin' ? 'Admin@123' : tab === 'owner' ? 'Owner@123' : 'Farmer@123'}</span>
              </div>
              <input
                className="input-field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="rem"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: P, cursor: 'pointer' }}
              />
              <label htmlFor="rem" style={{ fontSize: 13, color: '#4B5563', cursor: 'pointer' }}>
                {isTamil ? '30 நாட்களுக்கு என்னை நினைவில் வைத்திரு' : 'Remember me (30-day JWT)'}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                marginTop: 8,
                padding: '12px',
                fontSize: 14,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span>{loading ? 'Authenticating...' : `Sign In as ${tab.toUpperCase()}`}</span>
            </button>
          </form>

          {/* Social OAuth Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
            <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700 }}>OR SIGN IN WITH OAUTH</span>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={() => setOauthOpen(true)}
            style={{
              width: '100%',
              padding: '11px',
              border: '1.5px solid #E5E7EB',
              borderRadius: 12,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              fontSize: 13,
              fontWeight: 700,
              color: '#374151',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
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
            <span>Continue with Google OAuth 2.0</span>
          </button>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              onClick={() => onNavigate('home')}
              style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer' }}
            >
              {isTamil ? '← முகப்பு பக்கத்திற்குத் திரும்பு' : '← Back to Equipment Catalog'}
            </button>
          </div>
        </div>
      </div>

      {/* OAuth and JWT Modals */}
      <OAuthModal
        isOpen={oauthOpen}
        onClose={() => setOauthOpen(false)}
        onSuccess={() => {
          onNavigate('farmer-dashboard')
        }}
      />
    </div>
  )
}
