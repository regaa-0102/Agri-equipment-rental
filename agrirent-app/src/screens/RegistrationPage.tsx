import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { api } from '../lib/api-client'

const P = '#2E7D32'

interface Props {
  onNavigate: (screen: string) => void
}

export default function RegistrationPage({ onNavigate }: Props) {
  const { t, isTamil } = useLanguage()
  const [tab, setTab] = useState<'farmer' | 'owner'>('farmer')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [location, setLocation] = useState('')
  const [stateName, setStateName] = useState('Tamil Nadu')
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRoleTab = (r: 'farmer' | 'owner') => {
    setTab(r)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError(isTamil ? 'முழு பெயரை உள்ளிடவும் (குறைந்தது 2 எழுத்துக்கள்)' : 'Please enter your full name (minimum 2 characters)')
      return
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(isTamil ? 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்' : 'Please enter a valid email address')
      return
    }

    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      setError(isTamil ? 'சரியான கைபேசி எண்ணை உள்ளிடவும்' : 'Please enter a valid phone number')
      return
    }

    if (password.trim().length < 6) {
      setError(isTamil ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்' : 'Password must be at least 6 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError(isTamil ? 'கடவுச்சொற்கள் பொருந்தவில்லை' : 'Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const fullLoc = [location.trim(), stateName].filter(Boolean).join(', ')
      const res = await api.register({
        name: fullName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        role: tab,
        phone: phone.trim(),
        location: fullLoc || 'Tamil Nadu, India',
      })

      if (res.user.role === 'owner') {
        onNavigate('owner-dashboard')
      } else {
        onNavigate('farmer-dashboard')
      }
    } catch (err: any) {
      setError(err.message || (isTamil ? 'பதிவு செய்வதில் பிழை ஏற்பட்டது' : 'Registration failed. Please check your details.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 44px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', width: '100%', minWidth: 0, background: '#fff' }}>
      {/* Left panel */}
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: 400 }}>
        <img
          src="https://images.unsplash.com/photo-1696441567908-6a04d49e1350?w=720&h=960&fit=crop&auto=format"
          alt="Tractor plowing a field"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(27,94,32,0.88) 0%, rgba(46,125,50,0.70) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.2)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
              <span style={{ fontSize: 18 }}>🌿</span>
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>AgriRent</span>
          </div>

          <div>
            <h1 style={{ fontSize: 38, fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 16, letterSpacing: '-1px' }}>
              {t('Join 50,000+') || 'Join 50,000+'}<br />{t('Farmers &')}<br />{t('Owners')}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 1.6, maxWidth: 360 }}>
              {t("Create your free account and unlock access to India's largest agricultural equipment network.")}
            </p>

            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: '✅', text: t('Free registration, no credit card required') || 'Free registration, no credit card required' },
                { icon: '🛡️', text: t('Your data is protected and encrypted') },
                { icon: '📱', text: 'Get real-time notifications on WhatsApp' },
                { icon: '🌾', text: 'Access 12,000+ equipment across 18 states' },
              ].map((f) => (
                <div key={f.text} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 16 }}>{f.icon}</span>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: '18px 20px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#FCD34D', fontSize: 15 }}>★</span>)}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 1.6, fontStyle: 'italic', marginBottom: 8 }}>
              "Listed my tractor on AgriRent and started earning ₹40,000/month from equipment that was just sitting idle."
            </p>
            <div style={{ color: '#A5D6A7', fontSize: 12, fontWeight: 600 }}>— Harpreet Singh, Equipment Owner, Ludhiana</div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ background: '#FAFAFA', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '36px 24px', overflowY: 'auto' }}>
        <div className="card-shadow" style={{ background: '#fff', borderRadius: 24, padding: '36px 32px', width: '100%', maxWidth: 480, border: '1px solid #F3F4F6' }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 6, letterSpacing: '-0.5px' }}>{t('Create your account')}</h2>
            <p style={{ color: '#6B7280', fontSize: 14 }}>
              {t('Already registered?')}{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                style={{ color: P, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 0 }}
              >
                {t('Sign in here')}
              </button>
            </p>
          </div>

          {/* Role tabs */}
          <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 20 }}>
            {(['farmer', 'owner'] as const).map((tKey) => (
              <button
                key={tKey}
                type="button"
                onClick={() => handleRoleTab(tKey)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 9,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  background: tab === tKey ? '#fff' : 'transparent',
                  color: tab === tKey ? P : '#6B7280',
                  boxShadow: tab === tKey ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s',
                  textTransform: 'capitalize',
                }}
              >
                {tKey === 'farmer' ? (isTamil ? '🌾 விவசாயி (Farmer)' : '🌾 Farmer') : (isTamil ? '🔧 உபகரண உரிமையாளர்' : '🔧 Equipment Owner')}
              </button>
            ))}
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

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            <div style={{ width: 'calc(50% - 7px)' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                {isTamil ? 'முழு பெயர்' : 'Full Name'} *
              </label>
              <input
                className="input-field"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                required
              />
            </div>

            <div style={{ width: 'calc(50% - 7px)' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                {isTamil ? 'கைபேசி எண்' : 'Mobile Number'} *
              </label>
              <input
                className="input-field"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
              />
            </div>

            <div style={{ width: '100%' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                {isTamil ? 'மின்னஞ்சல் முகவரி' : 'Email Address'} *
              </label>
              <input
                className="input-field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>

            <div style={{ width: 'calc(50% - 7px)' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                {isTamil ? 'கடவுச்சொல்' : 'Password'} *
              </label>
              <input
                className="input-field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
              />
            </div>

            <div style={{ width: 'calc(50% - 7px)' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                {isTamil ? 'கடவுச்சொல்லை உறுதிப்படுத்துக' : 'Confirm Password'} *
              </label>
              <input
                className="input-field"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
              />
            </div>

            {tab === 'owner' && (
              <div style={{ width: '100%' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  {isTamil ? 'வணிகம் / பண்ணை பெயர்' : 'Business / Fleet Name'} (Optional)
                </label>
                <input
                  className="input-field"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Kongu Agro Machinery Fleet"
                />
              </div>
            )}

            <div style={{ width: 'calc(50% - 7px)' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                {isTamil ? 'மாவட்டம் / ஊர்' : 'Town / District'}
              </label>
              <input
                className="input-field"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Coimbatore"
              />
            </div>

            <div style={{ width: 'calc(50% - 7px)' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                {isTamil ? 'மாநிலம்' : 'State'}
              </label>
              <select
                className="input-field"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                style={{ width: '100%' }}
              >
                {['Tamil Nadu', 'Maharashtra', 'Punjab', 'Karnataka', 'Andhra Pradesh', 'Gujarat'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Terms */}
            <div style={{ width: '100%', display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 4 }}>
              <input type="checkbox" id="terms" defaultChecked required style={{ marginTop: 2, accentColor: P, cursor: 'pointer' }} />
              <label htmlFor="terms" style={{ fontSize: 12, color: '#6B7280', cursor: 'pointer', lineHeight: 1.5 }}>
                I agree to AgriRent's <span style={{ color: P, fontWeight: 600 }}>{t('Terms of Service')}</span> {t('and')} <span style={{ color: P, fontWeight: 600 }}>{t('Privacy Policy')}</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', marginTop: 12, padding: '13px', fontSize: 15, borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading
                ? (isTamil ? 'பதிவு செய்கிறது...' : 'Creating Account...')
                : tab === 'farmer'
                ? (isTamil ? 'விவசாயி கணக்கை உருவாக்கவும் →' : 'Create Farmer Account →')
                : (isTamil ? 'உரிமையாளர் கணக்கை உருவாக்கவும் →' : 'Create Owner Account →')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 12, cursor: 'pointer' }}
            >
              {t('← Back to Home')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
