import { Globe2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

interface Props {
  className?: string
  style?: React.CSSProperties
}

export default function LanguageSelector({ className = '', style }: Props) {
  const { language, setLanguage } = useLanguage()

  return (
    <div
      className={`language-selector ${className}`}
      aria-label="Language selector"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 20,
        background: '#F3F4F6',
        fontSize: 12,
        fontWeight: 600,
        color: '#4B5563',
        ...style,
      }}
    >
      <Globe2 size={14} style={{ color: '#2E7D32', flexShrink: 0 }} />
      <button
        type="button"
        className={language === 'en' ? 'active' : ''}
        onClick={() => setLanguage('en')}
        style={{
          background: language === 'en' ? '#2E7D32' : 'transparent',
          color: language === 'en' ? '#fff' : '#4B5563',
          border: 'none',
          borderRadius: 12,
          padding: '2px 8px',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 11,
          transition: 'all 0.15s ease',
        }}
      >
        English
      </button>
      <span style={{ color: '#D1D5DB' }}>|</span>
      <button
        type="button"
        className={language === 'ta' ? 'active' : ''}
        onClick={() => setLanguage('ta')}
        style={{
          background: language === 'ta' ? '#2E7D32' : 'transparent',
          color: language === 'ta' ? '#fff' : '#4B5563',
          border: 'none',
          borderRadius: 12,
          padding: '2px 8px',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 11,
          transition: 'all 0.15s ease',
        }}
      >
        தமிழ்
      </button>
    </div>
  )
}
