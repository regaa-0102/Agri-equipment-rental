import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useLanguage } from '../context/LanguageContext'
import { getStoredUser } from '../lib/api-client'
import { HelpCircle, Phone, MessageSquare, Wrench, Shield, ChevronDown, ChevronUp } from 'lucide-react'

const P = '#2E7D32'
const PM = '#E8F5E9'

interface Props {
  onNavigate: (screen: string) => void
}

const FAQS = [
  {
    q: 'How does the AgriSafe™ digital escrow deposit work?',
    a: 'When you confirm a booking, the security deposit is held in a protected digital escrow account. Once you inspect the equipment upon return with zero reported damage, the deposit is automatically refunded to your original payment method within 24 hours.',
  },
  {
    q: 'What is required for the Identity Verification check?',
    a: 'For agricultural safety and heavy machinery insurance, farmers complete a simple one-time identity verification check (demonstrated in this prototype via Aadhaar-style verification). Once verified, you can immediately book any machinery on the platform.',
  },
  {
    q: 'What happens if a tractor or machine breaks down during rental?',
    a: 'All rentals include 24/7 on-field breakdown coverage. Call our emergency agricultural mechanic hotline at 1800-425-AGRI (2474). A certified technician or replacement machine is dispatched within 2 hours.',
  },
  {
    q: 'Can I cancel or reschedule my equipment booking?',
    a: 'Yes, cancellations made at least 24 hours prior to the scheduled delivery time receive a 100% full refund with zero cancellation charges.',
  },
]

export default function HelpSupportPage({ onNavigate }: Props) {
  const { t, isTamil } = useLanguage()
  const currentUser = getStoredUser()
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  if (!currentUser) return null
  const role = currentUser.role

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 44px)', width: '100%', minWidth: 0, background: '#F9FAFB' }}>
      <Sidebar activeItem="Help & Support" onNavigate={onNavigate} role={role} />

      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        {/* Header */}
        <div
          style={{
            background: '#fff',
            borderBottom: '1px solid #F3F4F6',
            padding: '20px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>
              {isTamil ? 'உதவி & ஆதரவு மையம்' : 'Help & Farmer Support'}
            </h1>
            <p style={{ color: '#6B7280', fontSize: 13, margin: '4px 0 0' }}>
              {isTamil
                ? '24/7 அவசர இயந்திர பழுதுபார்ப்பு மற்றும் வாடகை உதவி சேவை.'
                : '24/7 agricultural helpline, equipment emergency repair, and dispute resolution.'}
            </p>
          </div>
        </div>

        <div style={{ padding: '28px', maxWidth: 900 }}>
          {/* Quick Contact Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 32 }}>
            <div className="card-shadow" style={{ background: '#fff', borderRadius: 18, padding: 24, border: '1px solid #E5E7EB' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: PM, display: 'flex', alignItems: 'center', justifyContent: 'center', color: P, marginBottom: 16 }}>
                <Phone size={22} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
                Toll-Free Farmer Hotline
              </h3>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
                Available in Tamil, English, and Hindi 24/7
              </p>
              <div style={{ fontSize: 18, fontWeight: 900, color: P }}>
                1800-425-AGRI (2474)
              </div>
            </div>

            <div className="card-shadow" style={{ background: '#fff', borderRadius: 18, padding: 24, border: '1px solid #E5E7EB' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B45309', marginBottom: 16 }}>
                <Wrench size={22} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
                Emergency Machine Repair
              </h3>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
                Mobile tractor & harvester mechanic response within 2 hours
              </p>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#B45309' }}>
                +91 94421 99880
              </div>
            </div>

            <div className="card-shadow" style={{ background: '#fff', borderRadius: 18, padding: 24, border: '1px solid #E5E7EB' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369A1', marginBottom: 16 }}>
                <Shield size={22} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
                AgriSafe™ Dispute Desk
              </h3>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
                Fast resolution for deposit refunds and rental claims
              </p>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0284C7' }}>
                support@agrirent.in
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="card-shadow" style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '0 0 20px' }}>
              Frequently Asked Questions (FAQ)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index
                return (
                  <div
                    key={index}
                    style={{
                      border: '1px solid #E5E7EB',
                      borderRadius: 12,
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        background: isOpen ? '#F9FAFB' : '#fff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: 14,
                        color: '#111827',
                      }}
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp size={18} color="#6B7280" /> : <ChevronDown size={18} color="#6B7280" />}
                    </button>

                    {isOpen && (
                      <div style={{ padding: '14px 20px 18px', background: '#F9FAFB', fontSize: 13, color: '#4B5563', lineHeight: 1.55 }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
