import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { categoryNames } from '../lib/catalog'
import { useLanguage } from '../context/LanguageContext'

const P = '#2E7D32'
const PM = '#E8F5E9'

interface Props {
  onNavigate: (screen: string) => void
}

export default function AddEquipment({ onNavigate }: Props) {
  const { t } = useLanguage()
  const [available, setAvailable] = useState(true)
  const [selectedCat, setSelectedCat] = useState('Tractor')
  const [dragOver, setDragOver] = useState(false)

  const categories = [...categoryNames, 'Cultivator', 'Other']
  const fuelTypes = ['Diesel', 'Petrol', 'Electric', 'LPG']
  const conditions = ['Excellent', 'Good', 'Fair']

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 44px)', width: '100%', minWidth: 0, background: '#F9FAFB' }}>
      <Sidebar activeItem="Add Equipment" onNavigate={onNavigate} role="owner" />

      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #F3F4F6', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>{t('Add New Equipment')}</h1>
            <p style={{ color: '#9CA3AF', fontSize: 13, margin: '4px 0 0' }}>{t('Fill in the details to list your equipment for rent')}</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => onNavigate('owner-dashboard')} className="btn-outline" style={{ padding: '10px 20px', fontSize: 13 }}>{t('Cancel')}</button>
            <button className="btn-primary" style={{ padding: '10px 24px', fontSize: 13 }}>💾 {t('Save as Draft')}</button>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Progress steps */}
          <div className="card-shadow" style={{ background: '#fff', borderRadius: 16, padding: '18px 24px', marginBottom: 28, border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            {[
              { n: 1, label: t('Basic Info') },
              { n: 2, label: t('Specifications') },
              { n: 3, label: t('Pricing & Location') },
              { n: 4, label: t('Photos') },
              { n: 5, label: t('Availability') },
            ].map((step, i) => (
              <div key={step.n} style={{ display: 'flex', alignItems: 'center', flex: i < 4 ? 1 : 0, minWidth: 120 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: i <= 2 ? P : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: i <= 2 ? '#fff' : '#9CA3AF' }}>
                    {i <= 2 ? '✓' : step.n}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: i <= 2 ? '#111827' : '#9CA3AF' }}>{step.label}</span>
                </div>
                {i < 4 && <div style={{ flex: 1, height: 2, background: i < 2 ? P : '#E5E7EB', margin: '0 12px' }} />}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {/* Main form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Basic Info */}
              <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #F3F4F6' }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 20 }}>📋 {t('Basic Information')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('Equipment Name *')}</label>
                    <input className="input-field" placeholder="e.g. John Deere 5310 4WD Tractor" defaultValue="John Deere 5310 4WD Tractor" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('Category *')}</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {categories.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedCat(c)}
                          style={{
                            padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${selectedCat === c ? P : '#E5E7EB'}`,
                            background: selectedCat === c ? PM : '#fff', color: selectedCat === c ? P : '#6B7280',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                          }}
                        >{t(c)}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('Brand *')}</label>
                    <input className="input-field" placeholder="e.g. John Deere, Mahindra, New Holland" defaultValue="John Deere" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('Model *')}</label>
                    <input className="input-field" placeholder="e.g. 5310, 605 DI" defaultValue="5310" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('Manufacturing Year *')}</label>
                    <select className="input-field">
                      {[2024, 2023, 2022, 2021, 2020, 2019, 2018].map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('Condition *')}</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {conditions.map(c => (
                        <button key={c} type="button" style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1.5px solid ${c === 'Excellent' ? P : '#E5E7EB'}`, background: c === 'Excellent' ? PM : '#fff', color: c === 'Excellent' ? P : '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{t(c)}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('Description *')}</label>
                    <textarea
                      className="input-field" rows={4}
                      defaultValue="Well-maintained John Deere 5310 4WD tractor in excellent condition. Regular service done every 250 hours. Suitable for soil preparation, transportation, and crop management. Available with cultivator and rotavator attachments."
                      style={{ resize: 'none' }}
                    />
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, textAlign: 'right' }}>234/500 {t('234/500 characters').split(' ')[1] || 'characters'}</div>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #F3F4F6' }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 20 }}>⚙️ {t('Technical Specifications')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                  {[
                    { l: t('Engine') + ' Power (HP)', p: 'e.g. 55', v: '55' },
                    { l: t('Fuel Type'), p: '', isSelect: true, options: fuelTypes },
                    { l: t('Number of Cylinders'), p: 'e.g. 3', v: '3' },
                    { l: t('PTO Power') + ' (HP)', p: 'e.g. 48', v: '48' },
                    { l: t('Fuel Tank') + ' (Liters)', p: 'e.g. 68', v: '68' },
                    { l: t('Weight') + ' (kg)', p: 'e.g. 2050', v: '2050' },
                    { l: t('Lifting Capacity') + ' (kg)', p: 'e.g. 1800', v: '1800' },
                    { l: t('Transmission Type'), p: '', isSelect: true, options: ['Synchromesh', 'Constant Mesh', 'Sliding Mesh'] },
                    { l: t('Wheel Drive'), p: '', isSelect: true, options: ['4WD', '2WD'] },
                  ].map(f => (
                    <div key={f.l}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>{f.l}</label>
                      {f.isSelect ? (
                        <select className="input-field">
                          {f.options?.map(o => <option key={o}>{t(o)}</option>)}
                        </select>
                      ) : (
                        <input className="input-field" placeholder={f.p} defaultValue={f.v} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing & Location */}
              <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #F3F4F6' }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 20 }}>💰 {t('Pricing & Location')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>{t('Price per Day (₹) *')}</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#374151', fontSize: 15 }}>₹</span>
                      <input className="input-field" style={{ paddingLeft: 28 }} defaultValue="1800" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>{t('Security Deposit (₹)')}</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#374151', fontSize: 15 }}>₹</span>
                      <input className="input-field" style={{ paddingLeft: 28 }} defaultValue="3000" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>{t('Minimum Rental (Days)')}</label>
                    <input className="input-field" defaultValue="1" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>{t('State *')}</label>
                    <select className="input-field">
                      <option>Punjab</option>
                      <option>Maharashtra</option>
                      <option>Rajasthan</option>
                      <option>Gujarat</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>{t('District *')}</label>
                    <input className="input-field" defaultValue="Ludhiana" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>{t('PIN Code *')}</label>
                    <input className="input-field" defaultValue="141001" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>{t('Full Address *')}</label>
                    <input className="input-field" defaultValue="Village Raikot, Ludhiana District, Punjab" />
                  </div>
                </div>
              </div>

              {/* Image upload */}
              <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #F3F4F6' }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 8 }}>📸 {t('Photos')}</h3>
                <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 20 }}>{t('Upload at least 3 high-quality photos. Good photos increase bookings by 70%.')}</p>

                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={() => setDragOver(false)}
                  style={{
                    border: `2px dashed ${dragOver ? P : '#D1D5DB'}`, borderRadius: 16, padding: '40px 24px', textAlign: 'center',
                    cursor: 'pointer', background: dragOver ? PM : '#FAFAFA', transition: 'all 0.2s', marginBottom: 20,
                  }}
                >
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📷</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#374151', marginBottom: 6 }}>{t('Drag & drop photos here')}</div>
                  <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 14 }}>{t('or click to browse files')}</div>
                  <button type="button" className="btn-outline" style={{ fontSize: 13, padding: '8px 20px' }}>{t('Choose Files')}</button>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 12 }}>{t('JPEG, PNG, WebP up to 10MB each • Minimum 800×600px')}</div>
                </div>

                {/* Thumbnail preview grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 12 }}>
                  {[
                    'https://images.unsplash.com/photo-1533062618053-d51e617307ec?w=160&h=120&fit=crop&auto=format',
                    'https://images.unsplash.com/photo-1571509107684-7e3034a90012?w=160&h=120&fit=crop&auto=format',
                    'https://images.unsplash.com/photo-1564868480822-32f714a0e763?w=160&h=120&fit=crop&auto=format',
                  ].map((img, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: '#F3F4F6' }}>
                      <img src={img} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
                      {i === 0 && (
                        <div style={{ position: 'absolute', top: 6, left: 6, background: P, color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 4, padding: '2px 6px' }}>{t('Cover')}</div>
                      )}
                      <button type="button" style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: 6, width: 22, height: 22, cursor: 'pointer', fontSize: 12 }}>✕</button>
                    </div>
                  ))}
                  <div style={{ borderRadius: 10, border: '2px dashed #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', aspectRatio: '4/3', cursor: 'pointer', background: '#FAFAFA' }}>
                    <span style={{ fontSize: 24, color: '#D1D5DB' }}>+</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: preview + availability */}
            <div>
              <div style={{ position: 'sticky', top: 20 }}>
                {/* Availability toggle */}
                <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #F3F4F6', marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 18 }}>📅 {t('Availability')}</h3>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#F9FAFB', borderRadius: 12, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{t('Equipment Available')}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{t('Immediately available for booking')}</div>
                    </div>
                    <div
                      onClick={() => setAvailable(!available)}
                      style={{
                        width: 48, height: 28, borderRadius: 14, cursor: 'pointer', transition: 'background 0.2s',
                        background: available ? P : '#D1D5DB', position: 'relative', flexShrink: 0,
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: 3, left: available ? 23 : 3, width: 22, height: 22,
                        background: '#fff', borderRadius: '50%', transition: 'left 0.2s',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>{t('Unavailable Dates (leave blank for full availability)')}</label>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input type="date" className="input-field" style={{ flex: 1, fontSize: 12 }} />
                      <span style={{ display: 'flex', alignItems: 'center', color: '#9CA3AF' }}>→</span>
                      <input type="date" className="input-field" style={{ flex: 1, fontSize: 12 }} />
                    </div>
                    <button type="button" style={{ width: '100%', padding: '8px', background: '#F3F4F6', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>{t('+ Add Unavailable Period')}</button>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>{t('Operating Hours')}</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <input type="time" className="input-field" defaultValue="06:00" style={{ fontSize: 12 }} />
                      <input type="time" className="input-field" defaultValue="20:00" style={{ fontSize: 12 }} />
                    </div>
                  </div>
                </div>

                {/* Listing preview */}
                <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #F3F4F6', marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 4 }}>{t('Preview')}</h3>
                  <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>{t('How it appears to farmers')}</p>
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden' }}>
                    <img src="https://images.unsplash.com/photo-1533062618053-d51e617307ec?w=300&h=180&fit=crop&auto=format" alt="Preview" style={{ width: '100%', height: 160, objectFit: 'cover', background: '#F3F4F6' }} />
                    <div style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 4 }}>John Deere 5310 4WD Tractor</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>📍 Ludhiana, Punjab</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: 18, color: P }}>₹1,800<span style={{ fontWeight: 400, fontSize: 12, color: '#9CA3AF' }}>{t('/day')}</span></span>
                        <span style={{ background: PM, color: P, fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '3px 8px' }}>{t('● Available')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save button */}
                <button type="button" onClick={() => onNavigate('owner-dashboard')} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: 15, fontWeight: 700, borderRadius: 14 }}>
                  🚀 {t('+ Add Equipment')}
                </button>
                <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#9CA3AF' }}>
                  Your listing will be reviewed within 2-4 hours
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
