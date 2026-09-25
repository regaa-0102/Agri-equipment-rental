import { useState, useEffect } from 'react'
import { Truck, Star, MapPin, ShieldCheck, Check, ArrowRight, Phone, Calendar, Clock } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { catalog, findCatalogItem, type CatalogItem } from '../lib/catalog'
import { recordRecentlyViewed } from '../lib/recently-accessed'
import TrackingPanel from '../components/TrackingPanel'
import { SEED_BOOKINGS } from '../lib/bookings'

const P = '#2E7D32'
const PM = '#E8F5E9'

interface Props {
  onNavigate: (screen: string) => void
}

export default function EquipmentDetails({ onNavigate }: Props) {
  const { t, isTamil } = useLanguage()
  const [item, setItem] = useState<CatalogItem>(() => catalog[0])
  const [selectedImg, setSelectedImg] = useState<string>(catalog[0].img)
  const [activeTab, setActiveTab] = useState<'specs' | 'desc' | 'escrow'>('specs')
  const [showTracking, setShowTracking] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedId = window.localStorage.getItem('agrirent_selected_equipment_id')
      if (storedId) {
        const found = findCatalogItem(storedId)
        if (found) {
          setItem(found)
          setSelectedImg(found.img)
          recordRecentlyViewed(found)
          return
        }
      }
    }
    recordRecentlyViewed(catalog[0])
  }, [])

  const handleBookNow = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('agrirent_selected_equipment_id', item.id)
    }
    onNavigate('booking')
  }

  const gallery = item.gallery && item.gallery.length > 0 ? item.gallery : [item.img]

  return (
    <div style={{ minWidth: 0, background: '#F8FAFC', minHeight: 'calc(100vh - 44px)' }}>
      {/* Top Breadcrumb Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 44, zIndex: 100 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => onNavigate('home')}
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                color: '#334155',
              }}
            >
              ← {isTamil ? 'முகப்புக்குத் திரும்பு' : 'Back to Catalog'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748B' }}>
              <span>{item.cat}</span>
              <span>/</span>
              <span style={{ color: '#0F172A', fontWeight: 700 }}>
                {isTamil && item.nameTa ? item.nameTa : item.name}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 6,
                background: item.avail ? '#DCFCE7' : '#FEF3C7',
                color: item.avail ? '#15803D' : '#B45309',
              }}
            >
              {item.avail ? (isTamil ? '✓ உடனடியாக கிடைக்கும்' : '✓ Available for Immediate Rental') : (isTamil ? 'முன்பதிவானது' : 'Currently Booked')}
            </span>
          </div>
        </div>
      </header>

      {/* Main Details Section */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 32, marginBottom: 36 }}>
          {/* Photos Column */}
          <div>
            <div style={{ height: 420, borderRadius: 20, overflow: 'hidden', background: '#F1F5F9', marginBottom: 12, border: '1px solid #E2E8F0', position: 'relative' }}>
              <img
                src={selectedImg}
                alt={item.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 14,
                  left: 14,
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  borderRadius: 8,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  backdropFilter: 'blur(4px)',
                }}
              >
                Verified Genuine Equipment Photo
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div style={{ display: 'flex', gap: 10 }}>
              {gallery.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImg(imgUrl)}
                  style={{
                    width: 80,
                    height: 60,
                    borderRadius: 10,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: `2px solid ${selectedImg === imgUrl ? '#15803D' : '#CBD5E1'}`,
                  }}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Details & Pricing Column */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: 12, fontWeight: 800, padding: '3px 10px', borderRadius: 6 }}>
                {item.cat}
              </span>
              <span style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={13} /> {item.location}
              </span>
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: '0 0 10px', lineHeight: 1.25 }}>
              {isTamil && item.nameTa ? item.nameTa : item.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FEF3C7', padding: '3px 8px', borderRadius: 6 }}>
                <Star size={14} fill="#F59E0B" color="#F59E0B" />
                <span style={{ fontWeight: 800, fontSize: 13, color: '#B45309' }}>{item.rating}</span>
              </div>
              <span style={{ fontSize: 13, color: '#64748B' }}>({item.reviews} verified farmer reviews)</span>
              <span style={{ fontSize: 13, color: '#16A34A', fontWeight: 700 }}>• Verified Fleet Listing</span>
            </div>

            {/* Price Box */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '20px', border: '1px solid #E2E8F0', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 32, fontWeight: 900, color: '#15803D' }}>{item.price}</span>
                  <span style={{ fontSize: 14, color: '#64748B', marginLeft: 4 }}>{item.unit}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#64748B' }}>AgriSafe™ Escrow Deposit:</div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#B45309' }}>₹{(item.securityDeposit || 2500).toLocaleString()} (Refundable)</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16, fontSize: 12, color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={14} color="#16A34A" />
                  <span>Doorstep farm transport available</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={14} color="#16A34A" />
                  <span>{item.operatorIncluded ? 'Certified Driver / Operator Included' : 'Optional Driver Available'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={14} color="#16A34A" />
                  <span>Zero breakdown insurance cover</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={14} color="#16A34A" />
                  <span>24-Hour refund escrow guarantee</span>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span>{isTamil ? 'இப்போது முன்பதிவு செய்க' : 'Proceed to Rent & Book Now'}</span>
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Owner badge */}
            <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '14px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#15803D' }}>
                  {item.owner?.slice(0, 2).toUpperCase() || 'AG'}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{item.owner}</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Verified Equipment Partner • 100% On-time</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#15803D', fontWeight: 700 }}>
                <Phone size={14} />
                <span>{item.ownerPhone || '+91 98421 54321'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications & Description Tabs */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', padding: '0 20px' }}>
            {[
              { id: 'specs', label: isTamil ? 'தொழில்நுட்ப விவரங்கள்' : 'Technical Specifications' },
              { id: 'desc', label: isTamil ? 'கருவி விளக்கம்' : 'Full Machine Overview' },
              { id: 'escrow', label: isTamil ? 'அக்ரிசேஃப்™ எஸ்க்ரோ பாதுகாப்பு' : 'AgriSafe™ Escrow & Inspection' },
            ].map((tItem) => (
              <button
                key={tItem.id}
                onClick={() => setActiveTab(tItem.id as any)}
                style={{
                  padding: '16px 20px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tItem.id ? '3px solid #15803D' : '3px solid transparent',
                  color: activeTab === tItem.id ? '#15803D' : '#64748B',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {tItem.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '24px' }}>
            {activeTab === 'specs' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                {(item.specs || []).map((spec, idx) => (
                  <div key={idx} style={{ background: '#F8FAFC', borderRadius: 12, padding: '14px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 4 }}>
                      {isTamil && spec.labelTa ? spec.labelTa : spec.label}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'desc' && (
              <div>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: '#334155', marginBottom: 16 }}>
                  {isTamil && item.descriptionTa ? item.descriptionTa : item.description}
                </p>
                {item.features && item.features.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>Key Field Capabilities:</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                      {item.features.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569' }}>
                          <Check size={14} color="#16A34A" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'escrow' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#15803D', fontWeight: 800, fontSize: 16 }}>
                  <ShieldCheck size={22} />
                  <span>AgriSafe™ Digital Escrow Protocol</span>
                </div>
                <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>
                  {isTamil
                    ? 'நீங்கள் செலுத்தும் பாதுகாப்பு வைப்புத்தொகை அக்ரிரென்ட் எஸ்க்ரோ கணக்கில் பாதுகாப்பாக வைக்கப்படுகிறது. வாடகை முடிந்து உபகரணத்தை பரிசோதித்த 24 மணி நேரத்திற்குள் முழு வைப்புத்தொகையும் உங்கள் கணக்கிற்கு திரும்ப வழங்கப்படும்.'
                    : 'Your security deposit is held in a digital escrow trust during the rental period. Before release, a pre-delivery and post-return digital inspection log (hour meter, fuel level, and attachment health) is recorded. Zero unexpected deduction guarantee.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
