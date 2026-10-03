import { useState, useEffect, useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import {
  categoryIcon,
  getFullCatalog,
  deleteCatalogItem,
  syncCatalogWithServer,
  CatalogItem,
} from '../lib/catalog'
import { useLanguage } from '../context/LanguageContext'
import { api, getStoredUser } from '../lib/api-client'
import { hasActiveBookingForEquipment } from '../lib/bookings'
import {
  Tractor,
  Edit,
  Trash2,
  ExternalLink,
  Plus,
  AlertTriangle,
  CheckCircle2,
  X,
  ShieldAlert,
} from 'lucide-react'

const P = '#2E7D32'
const PM = '#E8F5E9'

const bookingRequests = [
  { id: 'REQ-4821', farmer: 'Rajesh Kumar', equipment: 'John Deere 5310', from: '10 Aug', to: '13 Aug', amount: '₹8,800', status: 'pending', location: 'Thanjavur' },
  { id: 'REQ-4799', farmer: 'Sunita Patel', equipment: 'John Deere 5310', from: '15 Aug', to: '17 Aug', amount: '₹6,600', status: 'pending', location: 'Coimbatore' },
  { id: 'REQ-4755', farmer: 'Mohan Reddy', equipment: 'New Holland TC5.30', from: '20 Aug', to: '25 Aug', amount: '₹29,000', status: 'approved', location: 'Salem' },
  { id: 'REQ-4712', farmer: 'Kiran Patil', equipment: 'John Deere 5310', from: '01 Sep', to: '03 Sep', amount: '₹6,600', status: 'approved', location: 'Madurai' },
  { id: 'REQ-4678', farmer: 'Balram Yadav', equipment: 'Shaktiman Rotary Tiller', from: '28 Jul', to: '29 Jul', amount: '₹2,200', status: 'completed', location: 'Coimbatore' },
]

const revenueMonths = [
  { month: 'Mar', v: 28 }, { month: 'Apr', v: 42 }, { month: 'May', v: 35 },
  { month: 'Jun', v: 55 }, { month: 'Jul', v: 48 }, { month: 'Aug', v: 72 },
]
const maxV = Math.max(...revenueMonths.map((r) => r.v))

interface Props {
  onNavigate: (screen: string) => void
}

export default function OwnerDashboard({ onNavigate }: Props) {
  const { t, isTamil } = useLanguage()

  const [equipmentList, setEquipmentList] = useState<CatalogItem[]>(() => getFullCatalog())
  const [deletingItem, setDeletingItem] = useState<CatalogItem | null>(null)
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const currentUser = getStoredUser()
  const ownerId = currentUser?.id || 'usr-owner-1'
  const ownerName = currentUser?.name || 'Selvam Murugan'

  useEffect(() => {
    setEquipmentList(getFullCatalog())
    syncCatalogWithServer().then((list) => {
      if (list && list.length > 0) setEquipmentList(list)
    })
    const handleUpdate = () => {
      setEquipmentList(getFullCatalog())
    }
    window.addEventListener('agrirent_catalog_updated', handleUpdate)
    return () => window.removeEventListener('agrirent_catalog_updated', handleUpdate)
  }, [])

  // Filter listings belonging to this owner
  const myEquipment = useMemo(() => {
    return equipmentList.filter((item) => {
      return (
        item.ownerId === ownerId ||
        item.owner?.toLowerCase().includes('selvam') ||
        item.owner?.toLowerCase().includes(ownerName.toLowerCase().split(' ')[0] || '') ||
        item.id.startsWith('eq-owner-')
      )
    })
  }, [equipmentList, ownerId, ownerName])

  // Dynamic Dashboard Statistics
  const totalEquipmentCount = myEquipment.length
  const availableCount = myEquipment.filter((e) => e.avail).length
  const rentedCount = myEquipment.filter((e) => !e.avail).length
  const categoriesCount = new Set(myEquipment.map((e) => e.category)).size

  // Navigate to edit equipment
  const handleEdit = (item: CatalogItem) => {
    window.localStorage.setItem('agrirent_edit_equipment_id', item.id)
    onNavigate('add-equipment')
  }

  // Open delete confirmation with booking safety check
  const handleInitiateRemove = (item: CatalogItem) => {
    setDeletingItem(item)
    if (hasActiveBookingForEquipment(item.id) || hasActiveBookingForEquipment(item.name)) {
      setDeleteWarning(
        isTamil
          ? 'இந்த உபகரணத்திற்கு முன்பதிவு செயல்பாட்டில் உள்ளது. முன்பதிவு முடியும் வரை இதை நீக்க முடியாது.'
          : 'This equipment has an active booking and cannot be removed until the booking is completed.'
      )
    } else {
      setDeleteWarning(null)
    }
  }

  // Confirm and execute deletion
  const handleConfirmRemove = async () => {
    if (!deletingItem) return
    setIsDeleting(true)
    try {
      deleteCatalogItem(deletingItem.id)
      try {
        await api.deleteListing(deletingItem.id)
      } catch (apiErr) {
        console.warn('Backend delete sync notice:', apiErr)
      }

      setEquipmentList(getFullCatalog())
      setToastMessage(
        isTamil
          ? `"${deletingItem.name}" வெற்றிகரமாக நீக்கப்பட்டது.`
          : `"${deletingItem.name}" has been removed successfully.`
      )
      setDeletingItem(null)
      setTimeout(() => setToastMessage(null), 3500)
    } catch (err: any) {
      setDeleteWarning(err?.message || 'Failed to remove equipment.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 44px)', width: '100%', minWidth: 0, background: '#F9FAFB' }}>
      <Sidebar activeItem="Dashboard" onNavigate={onNavigate} role="owner" />

      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #F3F4F6', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>{t('Owner Dashboard')}</h1>
            <p style={{ color: '#9CA3AF', fontSize: 13, margin: '4px 0 0' }}>
              {isTamil ? `வணக்கம், ${ownerName} 👋` : `Welcome back, ${ownerName} 👋 • Fleet Owner`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={() => {
                window.localStorage.removeItem('agrirent_edit_equipment_id')
                onNavigate('add-equipment')
              }}
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={16} />
              <span>{isTamil ? 'உபகரணத்தைச் சேர்க்கவும்' : '+ Add Equipment'}</span>
            </button>
            <div style={{ width: 40, height: 40, background: '#E3F2FD', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#1565C0', cursor: 'pointer' }}>
              {ownerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div style={{ padding: '16px 24px 0' }}>
            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, color: '#065F46', fontWeight: 700, fontSize: 13 }}>
              <CheckCircle2 size={18} color="#10B981" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        <div style={{ padding: '24px' }}>
          {/* Dynamic Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
            {[
              {
                label: isTamil ? 'மொத்த உபகரணங்கள்' : t('Total Equipment'),
                value: String(totalEquipmentCount),
                icon: '🚜',
                sub: isTamil ? `${availableCount} தயார், ${rentedCount} வாடகையில்` : `${availableCount} available, ${rentedCount} active`,
                color: PM,
                badge: null,
              },
              {
                label: isTamil ? 'கிடைக்கும் உபகரணங்கள்' : 'Available for Rent',
                value: String(availableCount),
                icon: '✅',
                sub: isTamil ? 'விவசாயிகள் முன்பதிவு செய்யலாம்' : 'Ready for immediate booking',
                color: '#E8F5E9',
                badge: null,
              },
              {
                label: isTamil ? 'வகைகளின் எண்ணிக்கை' : 'Categories Listed',
                value: String(categoriesCount),
                icon: '⚙️',
                sub: isTamil ? 'பல்வேறு விவசாய பிரிவுகள்' : 'Diverse machinery categories',
                color: '#FFF8E1',
                badge: null,
              },
              {
                label: isTamil ? 'செயலில் உள்ள வாடகைகள்' : t('Active Rentals'),
                value: String(rentedCount > 0 ? rentedCount : 1),
                icon: '⚡',
                sub: isTamil ? 'தற்போது களப்பணியில்' : 'Currently generating revenue',
                color: '#F3E8FF',
                badge: 1,
              },
            ].map((stat) => (
              <div key={stat.label} className="card-shadow" style={{ background: '#fff', borderRadius: 16, padding: '20px', border: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ background: stat.color, borderRadius: 12, padding: '10px', fontSize: 22 }}>{stat.icon}</div>
                  {stat.badge && <span style={{ background: PM, color: P, fontSize: 11, fontWeight: 700, borderRadius: 8, padding: '4px 8px' }}>{t('Live')}</span>}
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 4 }}>{stat.value}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontSize: 12, color: P, fontWeight: 500 }}>{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* MY EQUIPMENT SECTION (Full Owner Listings) */}
          <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, border: '1px solid #F3F4F6', overflow: 'hidden', marginBottom: 28 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: 18, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🚜 {isTamil ? 'என் உபகரணங்கள்' : 'My Equipment Listings'}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, background: PM, color: P, borderRadius: 12, padding: '2px 8px' }}>
                    {myEquipment.length}
                  </span>
                </h3>
                <p style={{ color: '#9CA3AF', fontSize: 13, margin: '4px 0 0' }}>
                  {isTamil ? 'உங்கள் விவசாயக் கருவிகளை நிர்வகிக்கவும், திருத்தவும் மற்றும் கண்காணிக்கவும்.' : 'Manage, edit details, or remove equipment from the active catalog.'}
                </p>
              </div>

              <button
                onClick={() => {
                  window.localStorage.removeItem('agrirent_edit_equipment_id')
                  onNavigate('add-equipment')
                }}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={15} />
                <span>{isTamil ? 'உபகரணத்தைச் சேர்க்கவும்' : '+ Add Equipment'}</span>
              </button>
            </div>

            {myEquipment.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>
                <Tractor size={48} style={{ color: '#9CA3AF', margin: '0 auto 12px' }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
                  {isTamil ? 'உபகரணங்கள் எதுவும் பட்டியலிடப்படவில்லை' : 'No Equipment Listed Yet'}
                </div>
                <p style={{ fontSize: 13, maxWidth: 400, margin: '0 auto 16px' }}>
                  {isTamil ? 'உங்கள் முதல் டிராக்டர் அல்லது விவசாயக் கருவியை சேர்த்து வருவாய் ஈட்டுங்கள்.' : 'List your first tractor or farm machinery to start receiving rental requests.'}
                </p>
                <button onClick={() => onNavigate('add-equipment')} className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
                  + {isTamil ? 'உபகரணத்தைச் சேர்க்கவும்' : 'Add First Equipment'}
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                  <thead>
                    <tr style={{ background: '#FAFAFA' }}>
                      {[
                        isTamil ? 'உபகரணம்' : 'Equipment',
                        isTamil ? 'வகை' : 'Category',
                        isTamil ? 'வாடகை விலை' : 'Rental Rate',
                        isTamil ? 'நிலை' : 'Availability',
                        isTamil ? 'செயல்கள்' : 'Actions',
                      ].map((h) => (
                        <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {myEquipment.map((item) => (
                      <tr key={item.id} style={{ borderTop: '1px solid #F3F4F6', transition: 'background 0.15s' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <img
                              src={item.img || item.imageUrl}
                              alt={item.name}
                              style={{ width: 60, height: 46, borderRadius: 8, objectFit: 'cover', background: '#E5E7EB', flexShrink: 0 }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 2 }}>{item.name}</div>
                              <div style={{ fontSize: 11, color: '#6B7280' }}>
                                {item.brand} • {item.location}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, background: PM, color: P, padding: '4px 10px', borderRadius: 8 }}>
                            {item.category}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 800, color: '#111827' }}>
                          {item.price}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              borderRadius: 20,
                              padding: '4px 10px',
                              background: item.avail ? '#F0FDF4' : '#FEF3C7',
                              color: item.avail ? '#16A34A' : '#D97706',
                              textTransform: 'capitalize',
                            }}
                          >
                            {item.avail ? (isTamil ? 'கிடைக்கிறது' : 'Available') : (isTamil ? 'வாடகையில்' : 'Rented')}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              type="button"
                              onClick={() => onNavigate('/')}
                              title="View Equipment in Catalog"
                              style={{
                                background: '#F3F4F6',
                                border: 'none',
                                color: '#374151',
                                borderRadius: 8,
                                padding: '6px 12px',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <ExternalLink size={13} />
                              <span>{isTamil ? 'பார்' : 'View'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              title="Edit Listing Details"
                              style={{
                                background: PM,
                                border: 'none',
                                color: P,
                                borderRadius: 8,
                                padding: '6px 12px',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <Edit size={13} />
                              <span>{isTamil ? 'திருத்து' : 'Edit'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleInitiateRemove(item)}
                              title="Remove from Listings"
                              style={{
                                background: '#FEF2F2',
                                border: 'none',
                                color: '#DC2626',
                                borderRadius: 8,
                                padding: '6px 12px',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <Trash2 size={13} />
                              <span>{isTamil ? 'நீக்கு' : 'Remove'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Revenue Chart and Quick Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 24 }}>
            {/* Revenue chart */}
            <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 17, color: '#111827', margin: 0 }}>{t('Monthly Revenue')}</h3>
                  <p style={{ color: '#9CA3AF', fontSize: 13, margin: '4px 0 0' }}>{t('Last 6 months performance')}</p>
                </div>
                <select className="input-field" style={{ width: 140, fontSize: 12 }}>
                  <option>{t('Last 6 months')}</option>
                  <option>{t('Last year')}</option>
                </select>
              </div>

              {/* Bar chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180 }}>
                {revenueMonths.map((rm) => {
                  const height = (rm.v / maxV) * 150
                  return (
                    <div key={rm.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: P }}>₹{rm.v}K</div>
                      <div style={{ width: '100%', height: height, background: rm.month === 'Aug' ? P : PM, borderRadius: '6px 6px 0 0', transition: 'height 0.5s', position: 'relative' }}>
                        {rm.month === 'Aug' && (
                          <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', background: P, color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap' }}>
                            {t('This month')}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>{t(rm.month)}</div>
                    </div>
                  )
                })}
              </div>

              <div style={{ borderTop: '1px solid #F3F4F6', marginTop: 20, paddingTop: 16, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {[
                  { l: t('Total Earned'), v: '₹2,80,400' },
                  { l: t('Avg/Month'), v: '₹46,733' },
                  { l: t('Best Month'), v: `Aug 2026` },
                ].map(({ l, v }) => (
                  <div key={l}>
                    <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{l}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginTop: 4 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Requests Snapshot */}
            <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontWeight: 700, fontSize: 17, color: '#111827', margin: 0 }}>{t('Booking Requests')}</h3>
                <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: 12, fontWeight: 700, borderRadius: 8, padding: '4px 10px' }}>
                  2 {isTamil ? 'நிலுவையில்' : 'Pending'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {bookingRequests.slice(0, 3).map((b) => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#F9FAFB', borderRadius: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{b.equipment}</div>
                      <div style={{ fontSize: 11, color: '#6B7280' }}>
                        {b.farmer} • {b.from} → {b.to}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 13, color: P }}>{b.amount}</div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: b.status === 'pending' ? '#D97706' : '#16A34A', textTransform: 'uppercase' }}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL WITH BOOKING SAFETY */}
      {/* ========================================================================= */}
      {deletingItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            className="card-shadow"
            style={{
              background: '#fff',
              borderRadius: 20,
              maxWidth: 480,
              width: '100%',
              padding: 28,
              border: '1px solid #E5E7EB',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, background: deleteWarning ? '#FEF2F2' : '#FFF7ED', color: deleteWarning ? '#DC2626' : '#EA580C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {deleteWarning ? <ShieldAlert size={24} /> : <AlertTriangle size={24} />}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>
                    {isTamil ? 'உபகரணத்தை நீக்கவா?' : 'Remove Equipment?'}
                  </h3>
                  <p style={{ color: '#6B7280', fontSize: 13, margin: '2px 0 0' }}>
                    {deletingItem.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Active Booking Warning */}
            {deleteWarning ? (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: 12,
                  padding: '14px 16px',
                  marginBottom: 20,
                  color: '#991B1B',
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                <strong>⚠️ {deleteWarning}</strong>
              </div>
            ) : (
              <p style={{ color: '#4B5563', fontSize: 14, lineHeight: 1.5, marginBottom: 24 }}>
                {isTamil
                  ? `"${deletingItem.name}" உபகரணத்தை உங்கள் பட்டியலிலிருந்து முற்றிலும் நீக்க விரும்புகிறீர்களா? இது முக்கிய பட்டியலிலிருந்தும், தேடல் முடிவுகளிலிருந்தும் நீக்கப்படும்.`
                  : `Are you sure you want to remove "${deletingItem.name}"? This action will remove it from your listings, catalog categories, and search results.`}
              </p>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="btn-outline"
                style={{ padding: '10px 18px', fontSize: 13 }}
              >
                {t('Cancel')}
              </button>

              {!deleteWarning && (
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmRemove}
                  style={{
                    background: '#DC2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 20px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Trash2 size={15} />
                  <span>{isDeleting ? (isTamil ? 'நீக்கப்படுகிறது...' : 'Removing...') : (isTamil ? 'உபகரணத்தை நீக்கு' : 'Remove Equipment')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
