import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

const P = '#2E7D32'

interface Props {
  onNavigate: (screen: string) => void
}

export default function RegistrationPage({ onNavigate }: Props) {
  const { t } = useLanguage()
  const [tab, setTab] = useState<'farmer' | 'owner' | 'admin'>('farmer')

  const farmerFields = [
    { label: t('Full Name'), type: 'text', placeholder: 'Rajesh Kumar', half: true },
    { label: t('Mobile Number'), type: 'tel', placeholder: '+91 98765 43210', half: true },
    { label: t('Email Address'), type: 'email', placeholder: 'rajesh@example.com', half: false },
    { label: t('Password'), type: 'password', placeholder: 'Min 8 characters', half: true },
    { label: t('Confirm Password'), type: 'password', placeholder: 'Repeat password', half: true },
    { label: t('Village / Town'), type: 'text', placeholder: 'Enter your location', half: true },
    { label: t('State'), type: 'select', options: ['Maharashtra', 'Punjab', 'Uttar Pradesh', 'Rajasthan', 'Gujarat', 'Andhra Pradesh', 'Karnataka', 'Tamil Nadu'], half: true },
  ]

  const ownerFields = [
    { label: t('Full Name'), type: 'text', placeholder: 'Gurpreet Singh', half: true },
    { label: t('Mobile Number'), type: 'tel', placeholder: '+91 98765 43210', half: true },
    { label: t('Email Address'), type: 'email', placeholder: 'gurpreet@example.com', half: false },
    { label: t('Password'), type: 'password', placeholder: 'Min 8 characters', half: true },
    { label: t('Confirm Password'), type: 'password', placeholder: 'Repeat password', half: true },
    { label: t('Business / Farm Name') || 'Business Name', type: 'text', placeholder: 'Singh Agro Services', half: false },
    { label: 'GST Number (Optional)', type: 'text', placeholder: '27AAAAA0000A1Z5', half: true },
    { label: t('State'), type: 'select', options: ['Punjab', 'Maharashtra', 'Haryana', 'Gujarat'], half: true },
  ]

  const fields = tab === 'farmer' ? farmerFields : ownerFields

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
              ].map(f => (
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
            <p style={{ color: '#6B7280', fontSize: 14 }}>{t('Already registered?')} <button onClick={() => onNavigate('login')} style={{ color: P, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 0 }}>{t('Sign in here')}</button></p>
          </div>

          {/* Role tabs */}
          <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {(['farmer', 'owner', 'admin'] as const).map(tKey => (
              <button
                key={tKey}
                onClick={() => setTab(tKey)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  background: tab === tKey ? '#fff' : 'transparent',
                  color: tab === tKey ? P : '#6B7280',
                  boxShadow: tab === tKey ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s', textTransform: 'capitalize',
                }}
              >{tKey === 'farmer' ? t('🌾 Farmer') : tKey === 'owner' ? t('🔧 Equipment Owner').replace('Equipment ', '') : t('⚙️ Administrator').replace('istrator', '')}</button>
            ))}
          </div>

          {/* Form fields */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            {fields.map((field) => (
              <div key={field.label} style={{ width: field.half ? 'calc(50% - 7px)' : '100%' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{field.label}</label>
                {field.type === 'select' ? (
                  <select className="input-field" style={{ width: '100%' }}>
                    {field.options?.map(o => <option key={o}>{t(o)}</option>)}
                  </select>
                ) : (
                  <input className="input-field" type={field.type} placeholder={field.placeholder} />
                )}
              </div>
            ))}

            {/* Address */}
            <div style={{ width: '100%' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{t('Full Address')}</label>
              <textarea className="input-field" placeholder="Village, District, State, PIN Code" rows={2} style={{ resize: 'none', width: '100%' }} />
            </div>

            {/* Upload ID */}
            <div style={{ width: '100%' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Upload {tab === 'farmer' ? 'Farmer ID / Aadhaar' : t('Business Document')}</label>
              <div style={{
                border: '2px dashed #D1D5DB', borderRadius: 12, padding: '18px', textAlign: 'center', cursor: 'pointer',
                background: '#FAFAFA', transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: 26, marginBottom: 4 }}>📄</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 2 }}>{t('Click to upload or drag & drop')}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{t('PNG, JPG, PDF up to 5MB')}</div>
              </div>
            </div>

            {/* Terms */}
            <div style={{ width: '100%', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <input type="checkbox" id="terms" defaultChecked style={{ marginTop: 2, accentColor: P, cursor: 'pointer' }} />
              <label htmlFor="terms" style={{ fontSize: 12, color: '#6B7280', cursor: 'pointer', lineHeight: 1.5 }}>
                I agree to AgriRent's <a href="#" style={{ color: P, fontWeight: 600 }}>{t('Terms of Service')}</a> {t('and')} <a href="#" style={{ color: P, fontWeight: 600 }}>{t('Privacy Policy')}</a>
              </label>
            </div>
          </div>

          <button
            onClick={() => onNavigate(tab === 'farmer' ? 'farmer-dashboard' : tab === 'owner' ? 'owner-dashboard' : 'admin-dashboard')}
            className="btn-primary"
            style={{ width: '100%', marginTop: 18, padding: '13px', fontSize: 15, borderRadius: 12 }}
          >
            {tab === 'farmer' ? t('Create Farmer Account →') : tab === 'owner' ? t('Create Owner Account →') : t('Create Admin Account →')}
          </button>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button onClick={() => onNavigate('home')} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 12, cursor: 'pointer' }}>
              {t('← Back to Home')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
