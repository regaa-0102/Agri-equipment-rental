import { useState } from 'react'
import { Star, MapPin, ZoomIn } from 'lucide-react'
import { CatalogItem, getCategoryFallback } from '../lib/catalog'
import { useLanguage } from '../context/LanguageContext'
import ImageZoomModal from './ImageZoomModal'
interface Props {
  equipment: CatalogItem
  onNavigate: (screen: string) => void
  onSelect?: (item: CatalogItem) => void
}

export default function EquipmentCard({ equipment, onNavigate, onSelect }: Props) {
  const { isTamil } = useLanguage()
  const [zoomModalOpen, setZoomModalOpen] = useState(false)

  const resolvedImage =
    equipment.imageUrl ||
    equipment.img ||
    getCategoryFallback(equipment.category || equipment.cat)

  const handleCardClick = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('agrirent_selected_equipment_id', equipment.id)
      const url = new URL(window.location.href)
      url.searchParams.set('id', equipment.id)
      window.history.replaceState({}, '', url.toString())
    }
    if (onSelect) onSelect(equipment)
    onNavigate('equipment-details')
  }

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('agrirent_selected_equipment_id', equipment.id)
      const url = new URL(window.location.href)
      url.searchParams.set('id', equipment.id)
      window.history.replaceState({}, '', url.toString())
    }
    if (onSelect) onSelect(equipment)
    onNavigate('booking')
  }

  return (
    <div
      onClick={handleCardClick}
      className="card-shadow card-shadow-hover"
      style={{
        background: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid #F3F4F6',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ position: 'relative', height: 200, background: '#F3F4F6' }}>
        <img
          src={resolvedImage}
          alt={equipment.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.currentTarget.src = getCategoryFallback(equipment.category || equipment.cat)
          }}
        />
        {/* Quick Zoom Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setZoomModalOpen(true)
          }}
          title={isTamil ? 'படத்தை பெரிதாக்கிக் காண்க (Zoom)' : 'Zoom In Photo'}
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            background: 'rgba(15, 23, 42, 0.78)',
            backdropFilter: 'blur(4px)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            zIndex: 5,
          }}
        >
          <ZoomIn size={16} />
        </button>
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            background: '#E8F5E9',
            borderRadius: 8,
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 700,
            color: '#2E7D32',
          }}
        >
          {equipment.cat}
        </div>
        {equipment.avail ? (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'rgba(46, 125, 50, 0.9)',
              color: '#fff',
              borderRadius: 8,
              padding: '3px 8px',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {isTamil ? 'கிடைக்கிறது' : 'Available'}
          </div>
        ) : (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'rgba(107, 114, 128, 0.9)',
              color: '#fff',
              borderRadius: 8,
              padding: '3px 8px',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {isTamil ? 'முன்பதிவானது' : 'Booked'}
          </div>
        )}
      </div>

      <div style={{ padding: '18px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {equipment.brand && (
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            {equipment.brand} {equipment.model ? `• ${equipment.model}` : ''}
          </div>
        )}
        <h3
          style={{
            fontWeight: 700,
            fontSize: 16,
            color: '#111827',
            marginBottom: 8,
            lineHeight: 1.3,
          }}
        >
          {equipment.name}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Star size={14} style={{ fill: '#F59E0B', color: '#F59E0B' }} />
          <span style={{ fontWeight: 700, color: '#111827', fontSize: 13 }}>{equipment.rating}</span>
          <span style={{ color: '#9CA3AF', fontSize: 12 }}>({equipment.reviews} reviews)</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: '#6B7280',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          <MapPin size={13} style={{ color: '#9CA3AF', flexShrink: 0 }} />
          <span>{equipment.location}</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'auto',
            paddingTop: 12,
            borderTop: '1px solid #F3F4F6',
          }}
        >
          <div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#2E7D32' }}>{equipment.price}</span>
            <span style={{ color: '#9CA3AF', fontSize: 12 }}>{equipment.unit}</span>
          </div>
          <button
            type="button"
            onClick={handleBookClick}
            className="btn-primary"
            style={{
              borderRadius: 10,
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 700,
              background: '#2E7D32',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {isTamil ? 'இப்போது முன்பதிவு செய்க' : 'Book Now'}
          </button>
        </div>
      </div>

      {/* Quick Zoom Modal */}
      <ImageZoomModal
        isOpen={zoomModalOpen}
        onClose={() => setZoomModalOpen(false)}
        imageSrc={resolvedImage}
        equipmentName={equipment.name}
        category={equipment.category || equipment.cat}
        gallery={equipment.gallery && equipment.gallery.length > 0 ? equipment.gallery : [resolvedImage]}
      />
    </div>
  )
}
