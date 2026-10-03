import { useState, useEffect } from 'react'
import {
  Truck,
  Star,
  MapPin,
  ShieldCheck,
  Check,
  ArrowRight,
  Phone,
  Calendar,
  Clock,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  RotateCcw,
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { catalog, findCatalogItem, type CatalogItem, getCategoryFallback, getGoogleImageSearchUrl } from '../lib/catalog'
import { recordRecentlyViewed } from '../lib/recently-accessed'
import TrackingPanel from '../components/TrackingPanel'
import ImageZoomModal from '../components/ImageZoomModal'
import { SEED_BOOKINGS } from '../lib/bookings'

const P = '#2E7D32'
const PM = '#E8F5E9'

interface Props {
  onNavigate: (screen: string) => void
}

export default function EquipmentDetails({ onNavigate }: Props) {
  const { t, isTamil } = useLanguage()
  const [item, setItem] = useState<CatalogItem>(() => {
    if (typeof window !== 'undefined') {
      const urlId = new URLSearchParams(window.location.search).get('id')
      const storedId = urlId || window.localStorage.getItem('agrirent_selected_equipment_id')
      if (storedId) {
        const found = findCatalogItem(storedId)
        if (found) return found
      }
    }
    return (catalog[0] as CatalogItem)
  })
  const [selectedImg, setSelectedImg] = useState<string>(() => item.imageUrl || item.img)
  const [activeTab, setActiveTab] = useState<'specs' | 'desc' | 'escrow'>('specs')
  const [showTracking, setShowTracking] = useState(false)
  const [zoomModalOpen, setZoomModalOpen] = useState(false)
  const [inlineZoom, setInlineZoom] = useState(1)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlId = new URLSearchParams(window.location.search).get('id')
      const storedId = urlId || window.localStorage.getItem('agrirent_selected_equipment_id')
      if (storedId) {
        const found = findCatalogItem(storedId)
        if (found) {
          setItem(found)
          setSelectedImg(found.imageUrl || found.img)
          recordRecentlyViewed(found)
          return
        }
      }
    }
    recordRecentlyViewed(catalog[0] as CatalogItem)
  }, [])

  const handleBookNow = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('agrirent_selected_equipment_id', item.id)
      const url = new URL(window.location.href)
      url.searchParams.set('id', item.id)
      window.history.replaceState({}, '', url.toString())
    }
    onNavigate('booking')
  }

  const gallery = item.gallery && item.gallery.length > 0 ? item.gallery : [item.imageUrl || item.img]

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
            <div
              style={{
                height: 420,
                borderRadius: 20,
                overflow: 'hidden',
                background: '#0F172A',
                marginBottom: 12,
                border: '1px solid #E2E8F0',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={selectedImg}
                alt={item.name}
                onClick={() => setZoomModalOpen(true)}
                title="Click to open Fullscreen Zoom Lightbox"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `scale(${inlineZoom})`,
                  transition: 'transform 0.2s ease',
                  cursor: inlineZoom > 1 ? 'pointer' : 'zoom-in',
                }}
                onError={(e) => {
                  e.currentTarget.src = getCategoryFallback(item.cat)
                }}
              />

              {/* Floating Zoom Controls Bar */}
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 8px',
                  borderRadius: 24,
                  background: 'rgba(15, 23, 42, 0.82)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  zIndex: 10,
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setInlineZoom((prev) => Math.max(1, Number((prev - 0.25).toFixed(2))))
                  }}
                  disabled={inlineZoom <= 1}
                  title="Zoom Out (-)"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    padding: 4,
                    cursor: inlineZoom <= 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    opacity: inlineZoom <= 1 ? 0.35 : 1,
                  }}
                >
                  <ZoomOut size={16} />
                </button>

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#4ADE80',
                    minWidth: 40,
                    textAlign: 'center',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {Math.round(inlineZoom * 100)}%
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setInlineZoom((prev) => Math.min(2.5, Number((prev + 0.25).toFixed(2))))
                  }}
                  disabled={inlineZoom >= 2.5}
                  title="Zoom In (+)"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    padding: 4,
                    cursor: inlineZoom >= 2.5 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    opacity: inlineZoom >= 2.5 ? 0.35 : 1,
                  }}
                >
                  <ZoomIn size={16} />
                </button>

                {inlineZoom > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setInlineZoom(1)
                    }}
                    title="Reset Zoom"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      padding: 4,
                      cursor: 'pointer',
                      display: 'flex',
                    }}
                  >
                    <RotateCcw size={14} />
                  </button>
                )}

                <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)', margin: '0 2px' }} />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setZoomModalOpen(true)
                  }}
                  title="Fullscreen Zoom Lightbox (up to 400% & Pan)"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#38BDF8',
                    padding: 4,
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  <Maximize2 size={15} />
                </button>
              </div>

              {/* Sourcing Badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 14,
                  left: 14,
                  background: 'rgba(15, 23, 42, 0.8)',
                  color: '#fff',
                  borderRadius: 8,
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span style={{ color: '#4ADE80' }}>✓</span>
                <span>Verified Google Model Photo</span>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {gallery.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedImg(imgUrl)
                      setInlineZoom(1)
                    }}
                    style={{
                      width: 80,
                      height: 60,
                      borderRadius: 10,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: `2px solid ${selectedImg === imgUrl ? '#15803D' : '#CBD5E1'}`,
                      transform: selectedImg === imgUrl ? 'scale(1.05)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Google Search & Fullscreen Zoom Bar */}
            <div
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => setZoomModalOpen(true)}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '9px 14px',
                  borderRadius: 10,
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <ZoomIn size={14} color="#15803D" />
                <span>{isTamil ? 'பெரிதாக்கிக் காண்க (Zoom 400%)' : 'Interactive Zoom & Pan (400%)'}</span>
              </button>

              <a
                href={getGoogleImageSearchUrl(item.name)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 14px',
                  borderRadius: 10,
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  color: '#334155',
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={13} color="#2563EB" />
                <span>{isTamil ? 'கூகிள் படங்கள்' : 'Search on Google Images'}</span>
              </a>
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

            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: '0 0 6px', lineHeight: 1.25 }}>
              {isTamil && item.nameTa ? item.nameTa : item.name}
            </h1>

            {item.brand && (
              <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 12 }}>
                {isTamil ? 'பிராண்ட்' : 'Brand'}: <span style={{ color: '#0F172A', fontWeight: 800 }}>{item.brand}</span>
                {item.model ? ` • Model: ${item.model}` : ''}
              </div>
            )}

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

      {/* Fullscreen Image Zoom Lightbox */}
      <ImageZoomModal
        isOpen={zoomModalOpen}
        onClose={() => setZoomModalOpen(false)}
        imageSrc={selectedImg}
        equipmentName={item.name}
        category={item.cat}
        gallery={gallery}
      />
    </div>
  )
}
