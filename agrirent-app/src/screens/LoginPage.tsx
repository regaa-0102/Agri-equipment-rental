import { useEffect, useState } from 'react'
import { ShieldCheck, Lock, Mail, UserCheck } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { api, setAuthenticatedUser } from '../lib/api-client'

const P = '#2E7D32'

interface Props {
  onNavigate: (screen: string) => void
}

export default function LoginPage({ onNavigate }: Props) {
  const { t, isTamil } = useLanguage()
  const [tab, setTab] = useState<'farmer' | 'owner'>('farmer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [googleRoleStep, setGoogleRoleStep] = useState(false)
  const [googleRole, setGoogleRole] = useState<'farmer' | 'owner'>('farmer')
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get('google')
    if (!result) return

    const cleanCallbackQuery = () => {
      const callbackUrl = new URL(window.location.href)
      callbackUrl.searchParams.delete('google')
      window.history.replaceState(window.history.state, '', callbackUrl)
    }

    if (result === 'role') {
      setGoogleRoleStep(true)
      cleanCallbackQuery()
    } else if (result === 'success') {
      cleanCallbackQuery()
      void api.getMe()
        .then(({ user }) => {
          setAuthenticatedUser(user)
          onNavigate(user.role === 'owner' ? 'owner-dashboard' : user.role === 'admin' ? 'admin-dashboard' : 'farmer-dashboard')
        })
        .catch(() => {
          setError(isTamil
            ? 'Google உள்நுழைவு அமர்வைச் சரிபார்க்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
            : 'Could not verify the Google sign-in session. Please try again.')
        })
    } else {
      cleanCallbackQuery()
      const messages: Record<string, string> = isTamil
        ? {
            cancelled: 'Google உள்நுழைவு ரத்து செய்யப்பட்டது.',
            'not-configured': 'Google உள்நுழைவு அமைக்கப்படவில்லை. நிர்வாகி Google OAuth சூழல் அமைப்புகளைச் சேர்க்க வேண்டும்.',
            conflict: 'இந்த மின்னஞ்சலுக்கு ஏற்கனவே கணக்கு உள்ளது. அந்தக் கணக்கின் வழியாக உள்நுழையவும்.',
            inactive: 'இந்த AgriRent கணக்கு முடக்கப்பட்டுள்ளது. உதவிக்கு ஆதரவைத் தொடர்பு கொள்ளவும்.',
            failed: 'Google உள்நுழைவு தோல்வியடைந்தது அல்லது காலாவதியானது. மீண்டும் முயற்சிக்கவும்.',
          }
        : {
            cancelled: 'Google sign-in was cancelled.',
            'not-configured': 'Google sign-in is not configured. The administrator must add the Google OAuth environment variables.',
            conflict: 'An account already exists for this email. Sign in using that account’s existing method.',
            inactive: 'This AgriRent account is inactive. Contact support for help.',
            failed: 'Google sign-in failed or expired. Please try again.',
          }
      setError(messages[result] || messages['failed'] || 'Google sign-in failed. Please try again.')
    }
  }, [isTamil, onNavigate])

  const handleRoleTab = (role: 'farmer' | 'owner') => {
    setTab(role)
    setError(null)
  }

  const handleGoogleRoleContinue = async () => {
    setGoogleLoading(true)
    setError(null)
    try {
      const res = await api.completeGoogleLogin(googleRole)
      onNavigate(res.user.role === 'owner' ? 'owner-dashboard' : 'farmer-dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ''
      setError(err instanceof TypeError
        ? (isTamil
          ? 'உள்நுழைவு சேவையகத்தை அணுக முடியவில்லை. இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.'
          : 'Unable to reach the sign-in service. Check your connection and try again.')
        : message || (isTamil
          ? 'Google கணக்கை அமைக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
          : 'Could not complete Google account setup. Please try again.'))
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError(isTamil ? 'மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்' : 'Please enter both email and password')
      setLoading(false)
      return
    }

    try {
      const res = await api.login(email.trim(), password, tab, remember)
      if (res.user.role === 'admin') {
        onNavigate('admin-dashboard')
      } else if (res.user.role === 'owner') {
        onNavigate('owner-dashboard')
      } else {
        onNavigate('farmer-dashboard')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ''
      if (err instanceof TypeError) {
        setError(isTamil
          ? 'உள்நுழைவு சேவையகத்தை அணுக முடியவில்லை. உங்கள் இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.'
          : 'Unable to reach the sign-in service. Check your connection and try again.')
      } else if (/^HTTP Error 5\d\d/.test(message)) {
        setError(isTamil
          ? 'உள்நுழைவு சேவையில் சிக்கல் ஏற்பட்டது. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.'
          : 'The sign-in service encountered an error. Please try again later.')
      } else {
        setError(message || (isTamil ? 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல்' : 'Invalid email or password'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 44px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minWidth: 0,
        background: '#F8FAFC',
        padding: '36px 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <div
          className="card-shadow"
          style={{
            background: '#fff',
            borderRadius: 24,
            padding: '36px',
            width: '100%',
            maxWidth: 440,
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                color: P,
              }}
            >
              <UserCheck size={26} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
              {isTamil ? 'உங்கள் கணக்கில் உள்நுழையவும்' : 'Sign in to AgriRent'}
            </h2>
            <p style={{ color: '#64748B', fontSize: 13, margin: 0 }}>
              {isTamil ? 'கணக்கு இல்லையா?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                style={{
                  color: P,
                  fontWeight: 700,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  padding: 0,
                }}
              >
                {isTamil ? 'புதிதாக பதிவு செய்யவும்' : 'Sign Up here'}
              </button>
            </p>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 14px' }}>
            {isTamil ? 'மின்னஞ்சல் மூலம் உள்நுழைக' : 'Login with Email'}
          </h3>

          {googleRoleStep && (
            <div style={{ marginBottom: 20, padding: 14, border: '1px solid #BBF7D0', borderRadius: 12, background: '#F0FDF4' }}>
              <p style={{ margin: '0 0 12px', color: '#166534', fontSize: 14, fontWeight: 700 }}>
                {isTamil ? 'உங்கள் AgriRent பங்கைத் தேர்ந்தெடுக்கவும்' : 'Choose your AgriRent role'}
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {(['farmer', 'owner'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setGoogleRole(role)}
                    aria-pressed={googleRole === role}
                    style={{
                      flex: 1,
                      padding: '10px 8px',
                      borderRadius: 9,
                      border: `1px solid ${googleRole === role ? P : '#CBD5E1'}`,
                      background: googleRole === role ? '#DCFCE7' : '#fff',
                      color: '#334155',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {role === 'farmer'
                      ? (isTamil ? 'விவசாயி' : 'Farmer')
                      : (isTamil ? 'உபகரண உரிமையாளர்' : 'Equipment Owner')}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => void handleGoogleRoleContinue()}
                disabled={googleLoading}
                className="btn-primary"
                style={{ width: '100%', padding: 11, borderRadius: 10, fontWeight: 800 }}
              >
                {googleLoading
                  ? (isTamil ? 'அமைக்கிறது...' : 'Setting up account...')
                  : (isTamil ? 'தொடரவும்' : 'Continue')}
              </button>
            </div>
          )}

          {/* Role selector tabs */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
              {isTamil ? 'உள்நுழைவு பாத்திரம் (Role)' : 'Select Your Role'}
            </label>
            <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 12, padding: 4 }}>
              {(['farmer', 'owner'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleTab(r)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    borderRadius: 9,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 700,
                    background: tab === r ? '#fff' : 'transparent',
                    color: tab === r ? P : '#64748B',
                    boxShadow: tab === r ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {r === 'farmer'
                    ? (isTamil ? '🌾 விவசாயி (Farmer)' : '🌾 Farmer')
                    : (isTamil ? '🔧 உபகரண உரிமையாளர்' : '🔧 Equipment Owner')}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                padding: '11px 14px',
                borderRadius: 10,
                fontSize: 13,
                marginBottom: 16,
                lineHeight: 1.4,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleManualLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                {isTamil ? 'மின்னஞ்சல்' : 'Email'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-field"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  style={{ width: '100%', paddingLeft: 38 }}
                />
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                {isTamil ? 'கடவுச்சொல்' : 'Password'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-field"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isTamil ? 'உங்கள் கடவுச்சொல்' : 'Enter your password'}
                  required
                  autoComplete="current-password"
                  style={{ width: '100%', paddingLeft: 38 }}
                />
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="rem"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: P, cursor: 'pointer' }}
                />
                <label htmlFor="rem" style={{ fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                  {isTamil ? 'என்னை நினைவில் கொள்' : 'Remember me'}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                marginTop: 8,
                padding: '13px',
                fontSize: 14,
                fontWeight: 800,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span>
                {loading
                  ? (isTamil ? 'சரிபார்க்கிறது...' : 'Verifying credentials...')
                  : (isTamil ? 'உள்நுழைக' : 'Sign In')}
              </span>
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: '#94A3B8', fontSize: 12, fontWeight: 700 }}>
            <span style={{ height: 1, background: '#E2E8F0', flex: 1 }} />
            <span>{isTamil ? 'அல்லது' : 'OR'}</span>
            <span style={{ height: 1, background: '#E2E8F0', flex: 1 }} />
          </div>
          <button
            type="button"
            onClick={() => window.location.assign('/api/auth/google/start')}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '13px',
              fontSize: 14,
              fontWeight: 800,
              borderRadius: 12,
              background: '#fff',
              color: '#334155',
              border: '1px solid #CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 9,
            }}
          >
            <ShieldCheck size={17} />
            {isTamil ? 'Google மூலம் தொடரவும்' : 'Continue with Google'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 24, borderTop: '1px solid #F1F5F9', paddingTop: 16 }}>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
            >
              {isTamil ? '← முகப்பு பக்கத்திற்குத் திரும்பு' : '← Back to Equipment Catalog'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
