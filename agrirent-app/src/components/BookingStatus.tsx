import { useLanguage } from '../context/LanguageContext'

export type BookingStatusType = 'active' | 'completed' | 'cancelled' | 'pending' | 'confirmed'

interface Props {
  status: BookingStatusType | string
  className?: string
  style?: React.CSSProperties
}

export default function BookingStatus({ status, className = '', style }: Props) {
  const { t, isTamil } = useLanguage()
  const normalized = (status || 'active').toLowerCase() as BookingStatusType

  const config: Record<
    BookingStatusType,
    { bg: string; color: string; border: string; dot: string; labelEn: string; labelTa: string }
  > = {
    active: {
      bg: '#E8F5E9',
      color: '#2E7D32',
      border: '#C8E6C9',
      dot: '#2E7D32',
      labelEn: 'Active',
      labelTa: 'செயலில்',
    },
    completed: {
      bg: '#E3F2FD',
      color: '#1565C0',
      border: '#BBDEFB',
      dot: '#1565C0',
      labelEn: 'Completed',
      labelTa: 'நிறைவடைந்தது',
    },
    cancelled: {
      bg: '#FFEBEE',
      color: '#C62828',
      border: '#FFCDD2',
      dot: '#C62828',
      labelEn: 'Cancelled',
      labelTa: 'ரத்து செய்யப்பட்டது',
    },
    pending: {
      bg: '#FFF8E1',
      color: '#B45309',
      border: '#FDE68A',
      dot: '#F59E0B',
      labelEn: 'Pending',
      labelTa: 'நிலுவையில் உள்ளது',
    },
    confirmed: {
      bg: '#F0FDF4',
      color: '#16A34A',
      border: '#BBF7D0',
      dot: '#16A34A',
      labelEn: 'Confirmed',
      labelTa: 'உறுதிப்படுத்தப்பட்டது',
    },
  }

  const current = config[normalized] || config.active
  const displayLabel = isTamil ? current.labelTa : current.labelEn

  return (
    <span
      className={`booking-status-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700,
        background: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: current.dot,
        }}
      />
      {t(displayLabel)}
    </span>
  )
}
