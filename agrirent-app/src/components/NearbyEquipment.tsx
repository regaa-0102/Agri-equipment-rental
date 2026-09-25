import { useState } from 'react'
import { MapPin, Navigation, Star, ArrowRight, ShieldCheck } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { catalog, CatalogItem } from '../lib/catalog'

interface Props {
  onNavigate: (screen: string) => void
  onSelectEquipment?: (item: CatalogItem) => void
}

interface NearbyItem {
  item: CatalogItem
  distanceKm: number
  distanceLabelEn: string
  distanceLabelTa: string
}

export default function NearbyEquipment({ onNavigate, onSelectEquipment }: Props) {
  const { isTamil } = useLanguage()
  const [filterCat, setFilterCat] = useState<string>('All')

  // Curate nearby list with realistic distances exactly meeting prompt examples
  const nearbyList: NearbyItem[] = [
    {
      item: catalog.find((c) => c.name.includes('Water Sprayer') || c.cat === 'Water Sprayer') || catalog[6],
      distanceKm: 1.8,
      distanceLabelEn: '1.8 km away',
      distanceLabelTa: '1.8 கி.மீ. தொலைவில்',
    },
    {
      item: catalog.find((c) => c.cat === 'Tractor') || catalog[0],
      distanceKm: 2.5,
      distanceLabelEn: '2.5 km away',
      distanceLabelTa: '2.5 கி.மீ. தொலைவில்',
    },
    {
      item: catalog.find((c) => c.cat.includes('Fertilizer') || c.name.includes('Fertilizer')) || catalog[9],
      distanceKm: 3.2,
      distanceLabelEn: '3.2 km away',
      distanceLabelTa: '3.2 கி.மீ. தொலைவில்',
    },
    {
      item: catalog.find((c) => c.cat === 'Rotavator') || catalog[12],
      distanceKm: 4.1,
      distanceLabelEn: '4.1 km away',
      distanceLabelTa: '4.1 கி.மீ. தொலைவில்',
    },
    {
      item: catalog.find((c) => c.cat === 'Seeder') || catalog[11],
      distanceKm: 3.8,
      distanceLabelEn: '3.8 km away',
      distanceLabelTa: '3.8 கி.மீ. தொலைவில்',
    },
    {
      item: catalog.find((c) => c.cat === 'Water Pump') || catalog[14],
      distanceKm: 2.8,
      distanceLabelEn: '2.8 km away',
      distanceLabelTa: '2.8 கி.மீ. தொலைவில்',
    },
  ]

  const categories = ['All', 'Tractor', 'Water Sprayer', 'Fertilizer Spreader', 'Rotavator']

  const filtered = nearbyList.filter((n) => {
    if (filterCat === 'All') return true
    if (filterCat === 'Fertilizer Spreader') {
      return n.item.cat.includes('Fertilizer') || n.item.name.includes('Fertilizer')
    }
    return n.item.cat === filterCat
  })

  return (
    <section
      className="nearby-equipment-section"
      style={{
        padding: '48px 0',
        background: '#FAFAFA',
        borderTop: '1px solid #F3F4F6',
        borderBottom: '1px solid #F3F4F6',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 24,
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#E8F5E9',
                color: '#2E7D32',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              <Navigation size={13} />
              <span>{isTamil ? 'அருகாமை சேவை' : 'Proximity Dispatch'}</span>
            </div>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#111827',
                margin: 0,
                letterSpacing: '-0.5px',
              }}
            >
              {isTamil ? 'அருகிலுள்ள உபகரணங்கள்' : 'Nearby Equipment'}
            </h2>
            <p style={{ color: '#6B7280', fontSize: 14, margin: '6px 0 0' }}>
              {isTamil
                ? 'உங்கள் பண்ணைக்கு அருகிலுள்ள உடனடி வாடகை கருவிகள் (டெமோ இருப்பிட கணக்கீடு)'
                : 'Agricultural machinery ready for quick dispatch near you (Simulated distance demo)'}
            </p>
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilterCat(c)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  border: filterCat === c ? '1.5px solid #2E7D32' : '1px solid #E5E7EB',
                  background: filterCat === c ? '#E8F5E9' : '#fff',
                  color: filterCat === c ? '#2E7D32' : '#4B5563',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {c === 'All'
                  ? isTamil ? 'அனைத்தும்' : 'All'
                  : c === 'Tractor'
                  ? isTamil ? 'டிராக்டர்' : 'Tractor'
                  : c === 'Water Sprayer'
                  ? isTamil ? 'நீர் தெளிப்பான்' : 'Water Sprayer'
                  : c === 'Fertilizer Spreader'
                  ? isTamil ? 'உரம் பரப்பி' : 'Fertilizer Spreader'
                  : isTamil ? 'ரோட்டாவேட்டர்' : 'Rotavator'}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {filtered.map(({ item, distanceLabelEn, distanceLabelTa }) => {
            const distLabel = isTamil ? distanceLabelTa : distanceLabelEn
            return (
              <div
                key={item.id}
                className="card-shadow card-shadow-hover"
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  border: '1px solid #F3F4F6',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {/* Image and badges */}
                <div style={{ position: 'relative', height: 160, background: '#F3F4F6' }}>
                  <img
                    src={item.img}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1533062618053-d51e617307ec?auto=format&fit=crop&w=400&h=300&q=80'
                    }}
                  />
                  {/* Distance badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      background: 'rgba(17, 24, 39, 0.85)',
                      color: '#fff',
                      backdropFilter: 'blur(4px)',
                      borderRadius: 14,
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <MapPin size={12} style={{ color: '#4ADE80' }} />
                    <span>{distLabel}</span>
                  </div>

                  {/* Availability badge */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      left: 10,
                      background: item.avail ? '#E8F5E9' : '#F3F4F6',
                      color: item.avail ? '#2E7D32' : '#6B7280',
                      borderRadius: 12,
                      padding: '3px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                      border: item.avail ? '1px solid #C8E6C9' : '1px solid #E5E7EB',
                    }}
                  >
                    {item.avail
                      ? isTamil ? 'இப்போது கிடைக்கிறது' : 'Available Now'
                      : isTamil ? 'தற்போது முன்பதிவு செய்யப்பட்டது' : 'Currently Booked'}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#2E7D32',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: 4,
                    }}
                  >
                    {item.cat}
                  </div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#111827',
                      margin: '0 0 8px',
                      lineHeight: 1.3,
                    }}
                  >
                    {item.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <Star size={13} style={{ fill: '#F59E0B', color: '#F59E0B' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{item.rating}</span>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>({item.reviews})</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6B7280' }}>
                      📍 {item.location}
                    </span>
                  </div>

                  {/* Pricing and actions */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: 12,
                      borderTop: '1px solid #F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#2E7D32' }}>{item.price}</span>
                      <small style={{ fontSize: 11, color: '#6B7280' }}>{item.unit}</small>
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectEquipment) onSelectEquipment(item)
                          onNavigate('equipment-details')
                        }}
                        style={{
                          padding: '6px 12px',
                          background: '#F3F4F6',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: '#374151',
                        }}
                      >
                        {isTamil ? 'விவரங்கள்' : 'Details'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectEquipment) onSelectEquipment(item)
                          onNavigate('booking')
                        }}
                        style={{
                          padding: '6px 14px',
                          background: '#2E7D32',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span>{isTamil ? 'முன்பதிவு' : 'Book'}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
