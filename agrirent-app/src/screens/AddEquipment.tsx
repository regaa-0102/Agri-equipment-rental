import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { categoryNames, addCatalogItem, getCategoryFallback, CatalogItem } from '../lib/catalog'
import { useLanguage } from '../context/LanguageContext'
import { api, getStoredUser } from '../lib/api-client'
import { addNotification } from '../lib/notifications'
import { CheckCircle2, Upload, AlertCircle, ArrowLeft } from 'lucide-react'

const P = '#2E7D32'
const PM = '#E8F5E9'

interface Props {
  onNavigate: (screen: string) => void
}

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  Tractor: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=800&q=80',
  Harvester: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80',
  Rotavator: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
  Seeder: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
  'Water Sprayer': 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
  'Water Pump': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
  Cultivator: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
  Other: 'https://images.unsplash.com/photo-1533062618053-d51e617307ec?auto=format&fit=crop&w=800&q=80',
}

const LOCATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Pollachi, Coimbatore': { lat: 10.6609, lng: 77.0048 },
  'Thanjavur, Tamil Nadu': { lat: 10.787, lng: 79.1378 },
  'Madurai, Tamil Nadu': { lat: 9.9252, lng: 78.1198 },
  'Ludhiana, Punjab': { lat: 30.901, lng: 75.8573 },
  'Salem, Tamil Nadu': { lat: 11.6643, lng: 78.146 },
  'Tiruchirappalli, Tamil Nadu': { lat: 10.7905, lng: 78.7047 },
}

export default function AddEquipment({ onNavigate }: Props) {
  const { t, isTamil } = useLanguage()
  const currentUser = getStoredUser()

  const categories = [...categoryNames, 'Cultivator', 'Other']
  const fuelTypes = ['Diesel', 'Petrol', 'Electric', 'LPG']
  const conditions = ['Excellent', 'Good', 'Fair']

  // Form State
  const [name, setName] = useState('Mahindra Novo 755 DI 4WD')
  const [selectedCat, setSelectedCat] = useState('Tractor')
  const [brand, setBrand] = useState('Mahindra')
  const [model, setModel] = useState('Novo 755 DI')
  const [year, setYear] = useState('2024')
  const [condition, setCondition] = useState('Excellent')
  const [hp, setHp] = useState('74')
  const [fuelType, setFuelType] = useState('Diesel')
  const [pricePerDay, setPricePerDay] = useState('2400')
  const [securityDeposit, setSecurityDeposit] = useState('3500')
  const [locationName, setLocationName] = useState('Pollachi, Coimbatore')
  const [fullAddress, setFullAddress] = useState('SF 240, Kinathukadavu Main Road, Pollachi Taluk')
  const [description, setDescription] = useState(
    'High-performance 74 HP 4WD tractor equipped with CRDi engine, synchromesh transmission, and advanced hydraulic lift. Ideal for deep tillage, laser levelling, and heavy disc plough operations.'
  )
  const [customImgUrl, setCustomImgUrl] = useState('')
  const [available, setAvailable] = useState(true)
  const [operatorIncluded, setOperatorIncluded] = useState(true)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const activeImg = customImgUrl.trim() || CATEGORY_DEFAULT_IMAGES[selectedCat] || CATEGORY_DEFAULT_IMAGES['Tractor'] || 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=800&q=80'

  const handleCategorySelect = (cat: string) => {
    setSelectedCat(cat)
    if (!customImgUrl) {
      // update preview image to match category
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!name.trim()) {
      setErrorMessage(isTamil ? 'கருவியின் பெயர் தேவை' : 'Equipment name is required')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    const coords = LOCATION_COORDINATES[locationName] || { lat: 10.998, lng: 76.96 }
    const priceNum = Number(pricePerDay) || 2000
    const depositNum = Number(securityDeposit) || 3000
    const ownerName = currentUser?.name || 'Selvam Murugan'
    const ownerPhone = currentUser?.phone || '+91 94432 10987'
    const ownerId = currentUser?.id || 'usr-owner-1'

    const newId = `eq-owner-${Date.now().toString(36)}`

    const newItem: CatalogItem = {
      id: newId,
      name: name.trim(),
      nameTa: name.trim(),
      category: selectedCat,
      cat: selectedCat,
      brand: brand.trim() || 'Custom Fleet',
      model: model.trim() || '2026 Edition',
      imageUrl: activeImg,
      img: activeImg,
      gallery: [activeImg],
      description: description.trim() || `${brand} ${model} machinery in excellent condition ready for immediate field operations.`,
      descriptionTa: `${name.trim()} - சிறந்த நிலையில் உள்ள விவசாய கருவி.`,
      price: `₹${priceNum.toLocaleString('en-IN')}`,
      dailyRate: priceNum,
      unit: isTamil ? '/நாள்' : '/day',
      rating: 5.0,
      reviews: 1,
      avail: available,
      location: locationName,
      lat: coords.lat,
      lng: coords.lng,
      securityDeposit: depositNum,
      owner: ownerName,
      ownerPhone: ownerPhone,
      ownerId: ownerId,
      distance: '2.1 km away',
      specs: [
        { label: 'Engine Power', labelTa: 'இயந்திர திறன்', value: `${hp} HP` },
        { label: 'Fuel Type', labelTa: 'எரிபொருள் வகை', value: fuelType },
        { label: 'Condition', labelTa: 'நிலை', value: condition },
        { label: 'Operator Included', labelTa: 'இயக்குனர்', value: operatorIncluded ? 'Yes' : 'No' },
      ],
      features: ['Owner Direct Fleet', 'Pre-inspected', 'Immediate Dispatch'],
      hp: Number(hp) || undefined,
      fuelType: fuelType as any,
      operatorIncluded: operatorIncluded,
    }

    try {
      // 1. Save to client catalog so it shows immediately across farmer screens
      addCatalogItem(newItem)

      // 2. Also save to server API
      try {
        await api.createListing({
          name: newItem.name,
          category: newItem.cat,
          pricePerDay: priceNum,
          securityDeposit: depositNum,
          location: locationName,
          lat: coords.lat,
          lng: coords.lng,
          img: activeImg,
          hp: `${hp} HP`,
          fuelType,
          description,
          operatorIncluded,
          specs: newItem.specs,
        })
      } catch (apiErr) {
        console.warn('Backend listing sync notice (client catalog updated successfully):', apiErr)
      }

      // 3. Generate notification for owner
      addNotification({
        userId: ownerId,
        title: isTamil ? `புதிய கருவி சேர்க்கப்பட்டது: ${name}` : `Equipment Listed: ${name}`,
        message: isTamil
          ? `உங்கள் ${name} கருவி வெற்றிகரமாக அக்ரிரென்ட் சந்தையில் பட்டியலிடப்பட்டது. விவசாயிகள் இப்போது முன்பதிவு செய்யலாம்.`
          : `Your ${name} has been published to the AgriRent marketplace. Farmers in ${locationName} can now view and book it.`,
        type: 'equipment_added',
        relatedId: newId,
      })

      setSuccessMessage(
        isTamil
          ? 'கருவி வெற்றிகரமாக சேர்க்கப்பட்டது! சந்தையில் இப்போது கிடைக்கிறது.'
          : 'Equipment listed successfully! It is now live in the marketplace for farmers.'
      )

      setTimeout(() => {
        onNavigate('owner-dashboard')
      }, 1500)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to add equipment. Please check details.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <button
              type="button"
              onClick={() => onNavigate('owner-dashboard')}
              className="btn-outline"
              style={{ padding: '10px 20px', fontSize: 13 }}
            >
              {t('Cancel')}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit()}
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {isSubmitting ? 'Saving...' : `🚀 ${isTamil ? 'உபகரணத்தை சேர்க்க' : 'Publish Listing'}`}
            </button>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Success Banner */}
          {successMessage && (
            <div
              style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: 14,
                padding: '16px 20px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                color: '#065F46',
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={22} color="#10B981" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: 14,
                padding: '14px 18px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: '#991B1B',
              }}
            >
              <AlertCircle size={20} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {/* Main form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Basic Info */}
              <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #F3F4F6' }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 20 }}>📋 {t('Basic Information')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {t('Equipment Name *')}
                    </label>
                    <input
                      className="input-field"
                      placeholder="e.g. Mahindra Novo 755 DI 4WD Tractor"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {t('Category *')}
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {categories.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleCategorySelect(c)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 8,
                            border: `1.5px solid ${selectedCat === c ? P : '#E5E7EB'}`,
                            background: selectedCat === c ? PM : '#fff',
                            color: selectedCat === c ? P : '#6B7280',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          {t(c)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {t('Brand *')}
                    </label>
                    <input
                      className="input-field"
                      placeholder="e.g. Mahindra, John Deere, Preet"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {t('Model *')}
                    </label>
                    <input
                      className="input-field"
                      placeholder="e.g. Novo 755 DI"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {t('Manufacturing Year *')}
                    </label>
                    <select
                      className="input-field"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    >
                      {[2025, 2024, 2023, 2022, 2021, 2020, 2019].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {t('Condition *')}
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {conditions.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCondition(c)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: 8,
                            border: `1.5px solid ${condition === c ? P : '#E5E7EB'}`,
                            background: condition === c ? PM : '#fff',
                            color: condition === c ? P : '#6B7280',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {t(c)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {t('Description *')}
                    </label>
                    <textarea
                      className="input-field"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      style={{ resize: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #F3F4F6' }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 20 }}>⚙️ {t('Technical Specifications')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>
                      Engine Power (HP)
                    </label>
                    <input
                      className="input-field"
                      value={hp}
                      onChange={(e) => setHp(e.target.value)}
                      placeholder="e.g. 74"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>
                      Fuel Type
                    </label>
                    <select
                      className="input-field"
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                    >
                      {fuelTypes.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>
                      Operator Included
                    </label>
                    <select
                      className="input-field"
                      value={operatorIncluded ? 'yes' : 'no'}
                      onChange={(e) => setOperatorIncluded(e.target.value === 'yes')}
                    >
                      <option value="yes">Yes, certified operator included</option>
                      <option value="no">No, machinery only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing & Location */}
              <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #F3F4F6' }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 20 }}>💰 {t('Pricing & Location')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>
                      {t('Price per Day (₹) *')}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#374151', fontSize: 15 }}>₹</span>
                      <input
                        className="input-field"
                        style={{ paddingLeft: 28 }}
                        value={pricePerDay}
                        onChange={(e) => setPricePerDay(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>
                      {t('Security Deposit (₹)')}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#374151', fontSize: 15 }}>₹</span>
                      <input
                        className="input-field"
                        style={{ paddingLeft: 28 }}
                        value={securityDeposit}
                        onChange={(e) => setSecurityDeposit(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>
                      Region / Base Hub *
                    </label>
                    <select
                      className="input-field"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                    >
                      {Object.keys(LOCATION_COORDINATES).map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>
                      {t('Full Address *')}
                    </label>
                    <input
                      className="input-field"
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Photos */}
              <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #F3F4F6' }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 8 }}>📸 {t('Photos')}</h3>
                <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 16 }}>
                  {t('Each equipment item must have its own distinct image to avoid duplication.')}
                </p>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>
                    Custom Image URL (Optional)
                  </label>
                  <input
                    className="input-field"
                    placeholder="https://images.unsplash.com/..."
                    value={customImgUrl}
                    onChange={(e) => setCustomImgUrl(e.target.value)}
                  />
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                    Leave blank to automatically use high-res image curated for {selectedCat}.
                  </div>
                </div>
              </div>
            </div>

            {/* Right: preview + availability */}
            <div>
              <div style={{ position: 'sticky', top: 80 }}>
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
                        width: 48,
                        height: 28,
                        borderRadius: 14,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        background: available ? P : '#D1D5DB',
                        position: 'relative',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 3,
                          left: available ? 23 : 3,
                          width: 22,
                          height: 22,
                          background: '#fff',
                          borderRadius: '50%',
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Listing preview */}
                <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #F3F4F6', marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 4 }}>{t('Preview')}</h3>
                  <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>{t('How it appears to farmers in marketplace')}</p>
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden' }}>
                    <img
                      src={activeImg}
                      alt="Preview"
                      style={{ width: '100%', height: 160, objectFit: 'cover', background: '#F3F4F6' }}
                      onError={(e) => {
                        e.currentTarget.src = getCategoryFallback(selectedCat)
                      }}
                    />
                    <div style={{ padding: '14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: P, background: PM, padding: '2px 8px', borderRadius: 6 }}>
                        {selectedCat}
                      </span>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: '6px 0 4px' }}>
                        {name || 'Equipment Name'}
                      </div>
                      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>
                        📍 {locationName}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: 18, color: P }}>
                          ₹{Number(pricePerDay || 2000).toLocaleString('en-IN')}
                          <span style={{ fontWeight: 400, fontSize: 12, color: '#9CA3AF' }}>{t('/day')}</span>
                        </span>
                        <span
                          style={{
                            background: available ? PM : '#FEE2E2',
                            color: available ? P : '#DC2626',
                            fontSize: 11,
                            fontWeight: 700,
                            borderRadius: 6,
                            padding: '3px 8px',
                          }}
                        >
                          {available ? t('● Available') : t('● Unavailable')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save button */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit()}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: 15,
                    fontWeight: 700,
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span>🚀</span>
                  <span>{isSubmitting ? 'Listing...' : t('+ Add Equipment')}</span>
                </button>
                <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#9CA3AF' }}>
                  Equipment immediately syncs to farmer inventory & nearby map
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
