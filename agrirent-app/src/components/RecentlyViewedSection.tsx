import { useEffect, useState } from 'react'
import { Clock, Trash2, ArrowRight, MapPin, Star } from 'lucide-react'
import { clearRecentlyViewed, getRecentlyViewed, onRecentlyViewedChange, type RecentlyViewedItem } from '../lib/recently-accessed'
import { useLanguage } from '../context/LanguageContext'

interface Props {
  onNavigate: (screen: string) => void
  onSelectEquipment?: (id: string) => void
}

export default function RecentlyViewedSection({ onNavigate, onSelectEquipment }: Props) {
  const { isTamil } = useLanguage()
  const [items, setItems] = useState<RecentlyViewedItem[]>(() => getRecentlyViewed())

  useEffect(() => {
    return onRecentlyViewedChange((updated) => {
      setItems(updated)
    })
  }, [])

  if (items.length === 0) return null

  const handleCardClick = (id: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('agrirent_selected_equipment_id', id)
    }
    if (onSelectEquipment) onSelectEquipment(id)
    onNavigate('equipment-details')
  }

  const handleBookClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('agrirent_selected_equipment_id', id)
    }
    if (onSelectEquipment) onSelectEquipment(id)
    onNavigate('booking')
  }

  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={20} style={{ color: '#15803D' }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>
            {isTamil ? 'நீங்கள் சமீபத்தில் பார்த்த உபகரணங்கள்' : 'Recently Viewed Equipment'}
          </h2>
          <span style={{ fontSize: 12, background: '#E5E7EB', padding: '2px 8px', borderRadius: 10, fontWeight: 700, color: '#4B5563' }}>
            {items.length}
          </span>
        </div>

        <button
          onClick={() => {
            clearRecentlyViewed()
            setItems([])
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6B7280',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Trash2 size={13} />
          <span>{isTamil ? 'வரலாற்றை அழி' : 'Clear History'}</span>
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleCardClick(item.id)}
            className="card-shadow"
            style={{
              background: '#fff',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid #E5E7EB',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
            }}
          >
            <div style={{ position: 'relative', height: 140, background: '#F3F4F6' }}>
              <img
                src={item.img}
                alt={item.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  background: 'rgba(255,255,255,0.92)',
                  color: '#15803D',
                  fontWeight: 700,
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 6,
                }}
              >
                {item.cat}
              </span>
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: 4,
                }}
              >
                {item.viewedAt}
              </span>
            </div>

            <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 6px', lineHeight: 1.3 }}>
                {isTamil && item.nameTa ? item.nameTa : item.name}
              </h4>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6B7280', fontSize: 11, marginBottom: 8 }}>
                <MapPin size={11} color="#9CA3AF" />
                <span>{item.location}</span>
                <span style={{ margin: '0 4px' }}>•</span>
                <Star size={11} fill="#F59E0B" color="#F59E0B" />
                <span>{item.rating}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#15803D' }}>
                  {item.price}
                </span>
                <button
                  onClick={(e) => handleBookClick(e, item.id)}
                  style={{
                    background: '#DCFCE7',
                    color: '#15803D',
                    border: '1px solid #86EFAC',
                    borderRadius: 8,
                    padding: '4px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span>{isTamil ? 'முன்பதிவு' : 'Rent'}</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
