import { CatalogCategory } from '../lib/catalog'
import { useLanguage } from '../context/LanguageContext'

interface Props {
  category: CatalogCategory
  isSelected?: boolean
  onClick: (catName: string) => void
}

export default function CategoryCard({ category, isSelected = false, onClick }: Props) {
  const { isTamil } = useLanguage()
  const displayName = isTamil && category.nameTa ? category.nameTa : category.name

  return (
    <div
      onClick={() => onClick(category.name)}
      className="card-shadow card-shadow-hover"
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: 0,
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        width: 154,
        border: isSelected ? '2.5px solid #2E7D32' : '1px solid #F3F4F6',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ height: 104, background: '#F3F4F6', position: 'relative', overflow: 'hidden' }}>
        <img
          className="category-card-image"
          src={category.image}
          alt={`${displayName} category`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onError={(e) => {
            e.currentTarget.src =
              '/equipment/tractors/mahindra-575-di-yuvo-tech-plus.jpg'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 6,
            right: 6,
            background: 'rgba(255, 255, 255, 0.92)',
            borderRadius: '50%',
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          {category.icon}
        </div>
      </div>

      <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: isSelected ? '#2E7D32' : '#111827',
            marginBottom: 4,
            lineHeight: 1.2,
          }}
        >
          {displayName}
        </div>
        <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, marginTop: 'auto', marginBottom: 8 }}>
          {category.count} {isTamil ? 'கிடைக்கும்' : 'Available'}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClick(category.name)
          }}
          style={{
            background: isSelected ? '#2E7D32' : '#F0FDF4',
            color: isSelected ? '#fff' : '#15803D',
            border: isSelected ? '1px solid #2E7D32' : '1px solid #BBF7D0',
            borderRadius: 8,
            padding: '5px 8px',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            textAlign: 'center',
            width: '100%',
            transition: 'all 0.15s ease',
          }}
        >
          {isTamil ? `பார் (${displayName})` : `View ${displayName}`}
        </button>
      </div>
    </div>
  )
}
