import { useState, useRef, type FormEvent } from 'react'
import Sidebar from '../components/Sidebar'
import { useLanguage } from '../context/LanguageContext'
import { api, getStoredUser } from '../lib/api-client'
import { toast } from 'sonner'
import {
  Phone,
  Mail,
  UserCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  Tractor,
  CalendarDays,
  ShieldCheck,
  Wrench,
  LifeBuoy,
  Clock,
  Sparkles,
  ArrowRight,
  Headphones,
  RotateCcw,
} from 'lucide-react'

const P = '#2E7D32'
const PM = '#E8F5E9'
const FOUNDER_PHONE = '6380167495'
const FOUNDER_EMAIL = 'gregaa749@gmail.com'

interface Props {
  onNavigate: (screen: string) => void
}

interface FormState {
  fullName: string
  email: string
  phone: string
  subject: string
  category: string
  message: string
}

interface FormErrors {
  fullName?: string | undefined
  email?: string | undefined
  phone?: string | undefined
  subject?: string | undefined
  category?: string | undefined
  message?: string | undefined
}

const SUPPORT_CATEGORIES = [
  'Equipment Rental',
  'Booking Support',
  'Payment Support',
  'Equipment Owner Support',
  'Technical Support',
  'Other',
] as const

const QUICK_TOPICS = [
  {
    id: 'rental',
    label: 'Equipment Rental',
    category: 'Equipment Rental',
    icon: Tractor,
    hint: 'Tractors, Harvesters, Implements',
  },
  {
    id: 'booking',
    label: 'Booking Help',
    category: 'Booking Support',
    icon: CalendarDays,
    hint: 'Scheduling, Extensions, Delivery',
  },
  {
    id: 'payment',
    label: 'Payment Help',
    category: 'Payment Support',
    icon: ShieldCheck,
    hint: 'AgriSafe™ Escrow, Refunds, Invoices',
  },
  {
    id: 'owner',
    label: 'Owner Support',
    category: 'Equipment Owner Support',
    icon: Wrench,
    hint: 'Fleet Listing, Payouts, Verification',
  },
  {
    id: 'technical',
    label: 'Technical Help',
    category: 'Technical Support',
    icon: LifeBuoy,
    hint: 'App Login, Account, KYC Portal',
  },
] as const

export default function ContactPage({ onNavigate }: Props) {
  const { t, isTamil } = useLanguage()
  const currentUser = getStoredUser()
  const role = currentUser?.role || 'farmer'

  const formSectionRef = useRef<HTMLDivElement | null>(null)
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null)

  const [formData, setFormData] = useState<FormState>({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    subject: '',
    category: 'Equipment Rental',
    message: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedData, setSubmittedData] = useState<{
    referenceId: string
    name: string
    category: string
  } | null>(null)

  const handleQuickTopicSelect = (category: string, topicLabel: string) => {
    setFormData((prev) => ({
      ...prev,
      category,
      subject: prev.subject || `${topicLabel} Inquiry`,
    }))
    setErrors((prev) => ({ ...prev, category: undefined }))

    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setTimeout(() => {
      messageInputRef.current?.focus()
    }, 450)
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('Full Name is required')
    }

    if (!formData.email.trim()) {
      newErrors.email = t('Please enter a valid email address')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = t('Please enter a valid email address')
    }

    const digitsOnly = formData.phone.replace(/\D/g, '')
    if (!formData.phone.trim()) {
      newErrors.phone = t('Please enter a valid 10-digit phone number')
    } else if (digitsOnly.length < 10) {
      newErrors.phone = t('Please enter a valid 10-digit phone number')
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t('Subject is required')
    }

    if (!formData.category.trim()) {
      newErrors.category = t('Please select a support category')
    }

    if (!formData.message.trim()) {
      newErrors.message = t('Message must be at least 15 characters')
    } else if (formData.message.trim().length < 15) {
      newErrors.message = t('Message must be at least 15 characters')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      const firstError = Object.values(errors)[0]
      if (firstError) {
        toast.error(firstError)
      }
      return
    }

    setIsSubmitting(true)

    try {
      const res = await api.submitContactMessage({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        category: formData.category.trim(),
        message: formData.message.trim(),
      })

      const refId = res.contact?.id || `REQ-${Math.floor(1000 + Math.random() * 9000)}`

      setSubmittedData({
        referenceId: refId,
        name: formData.fullName.trim(),
        category: formData.category,
      })

      toast.success(t('Message Sent Successfully!'), {
        description: t(
          'Thank you for contacting AgriRent. Our founder and support team will respond shortly.'
        ),
      })

      // Reset form fields
      setFormData({
        fullName: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        subject: '',
        category: 'Equipment Rental',
        message: '',
      })
      setErrors({})
    } catch (err: any) {
      console.error('Contact submission error:', err)
      toast.error('Failed to send message. Please try calling or emailing directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setSubmittedData(null)
    setFormData({
      fullName: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      subject: '',
      category: 'Equipment Rental',
      message: '',
    })
    setErrors({})
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: 'calc(100vh - 44px)',
        width: '100%',
        minWidth: 0,
        background: '#F8FAFC',
      }}
    >
      <Sidebar activeItem="Contact Us" onNavigate={onNavigate} role={role} />

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        {/* Header Banner */}
        <div
          style={{
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: '24px 32px',
          }}
        >
          <div style={{ maxWidth: 1120, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span
                onClick={() => onNavigate('home')}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: P,
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                {t('Home')}
              </span>
              <span style={{ color: '#94A3B8', fontSize: 12 }}>/</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                {t('Contact Us')}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: '#0F172A',
                    margin: 0,
                    letterSpacing: '-0.4px',
                  }}
                >
                  {t('Contact AgriRent')}
                </h1>
                <p
                  style={{
                    color: '#64748B',
                    fontSize: 14,
                    margin: '6px 0 0',
                    maxWidth: 720,
                    lineHeight: 1.5,
                  }}
                >
                  {t(
                    "Have a question about equipment rentals, bookings, or your account? We're here to help."
                  )}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: PM,
                  border: `1px solid rgba(46, 125, 50, 0.25)`,
                  padding: '8px 14px',
                  borderRadius: 10,
                  color: P,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <Clock size={15} />
                <span>{t('Available Mon - Sat, 9:00 AM - 7:00 PM IST')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div style={{ padding: '28px 24px 60px', maxWidth: 1120, margin: '0 auto' }}>
          {/* 5. Quick Support Categories Section */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: P,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 4,
                }}
              >
                {t('Quick Support Categories')}
              </div>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                {t('Select a topic below to auto-fill the contact form')}
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
              }}
            >
              {QUICK_TOPICS.map((topic) => {
                const IconComponent = topic.icon
                const isSelected = formData.category === topic.category

                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleQuickTopicSelect(topic.category, topic.label)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '14px 16px',
                      background: isSelected ? PM : '#FFFFFF',
                      border: isSelected ? `2px solid ${P}` : '1px solid #E2E8F0',
                      borderRadius: 14,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected
                        ? '0 4px 12px rgba(46, 125, 50, 0.12)'
                        : '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: isSelected ? P : '#F1F5F9',
                        color: isSelected ? '#FFFFFF' : P,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconComponent size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: isSelected ? P : '#0F172A',
                          lineHeight: 1.3,
                        }}
                      >
                        {t(topic.label)}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: '#64748B',
                          marginTop: 3,
                          lineHeight: 1.3,
                        }}
                      >
                        {topic.hint}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main 2-Column Responsive Layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 28,
              alignItems: 'start',
            }}
          >
            {/* Left Column: Founder Contact Card & Helpline Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* 2. FOUNDER CONTACT CARD */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 20,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
                  padding: '28px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Decorative Top Accent Bar */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 5,
                    background: `linear-gradient(90deg, ${P} 0%, #4ADE80 100%)`,
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 16,
                      background: `linear-gradient(135deg, ${P} 0%, #1B5E20 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: 22,
                      fontWeight: 800,
                      boxShadow: '0 4px 12px rgba(46, 125, 50, 0.25)',
                      flexShrink: 0,
                    }}
                  >
                    RG
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <h2
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: '#0F172A',
                          margin: 0,
                          letterSpacing: '-0.3px',
                        }}
                      >
                        Regaa G
                      </h2>
                      <span
                        title="Verified Founder"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          color: P,
                        }}
                      >
                        <ShieldCheck size={18} fill="#E8F5E9" />
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 4,
                        background: PM,
                        color: P,
                        fontWeight: 700,
                        fontSize: 12,
                        padding: '3px 10px',
                        borderRadius: 20,
                      }}
                    >
                      <UserCheck size={13} />
                      <span>{t('Founder')}</span>
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: 13,
                    color: '#64748B',
                    lineHeight: 1.6,
                    margin: '0 0 20px',
                  }}
                >
                  {t(
                    'Direct contact for escalations, partnerships, and critical machinery assistance.'
                  )}
                </p>

                {/* Founder Interactive Contact Rows */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    marginBottom: 24,
                  }}
                >
                  {/* Phone */}
                  <a
                    href={`tel:${FOUNDER_PHONE}`}
                    aria-label={`Call Founder Regaa G at ${FOUNDER_PHONE}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '12px 16px',
                      background: '#F8FAFC',
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                      textDecoration: 'none',
                      color: '#0F172A',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = PM
                      e.currentTarget.style.borderColor = P
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#F8FAFC'
                      e.currentTarget.style.borderColor = '#E2E8F0'
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: P,
                        flexShrink: 0,
                      }}
                    >
                      <Phone size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#64748B',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {t('Phone Number')}
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: '#0F172A',
                          marginTop: 2,
                        }}
                      >
                        {FOUNDER_PHONE}
                      </div>
                    </div>
                    <span style={{ color: P, fontSize: 13, fontWeight: 700 }}>
                      tel: →
                    </span>
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:${FOUNDER_EMAIL}`}
                    aria-label={`Email Founder Regaa G at ${FOUNDER_EMAIL}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '12px 16px',
                      background: '#F8FAFC',
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                      textDecoration: 'none',
                      color: '#0F172A',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = PM
                      e.currentTarget.style.borderColor = P
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#F8FAFC'
                      e.currentTarget.style.borderColor = '#E2E8F0'
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: P,
                        flexShrink: 0,
                      }}
                    >
                      <Mail size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#64748B',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {t('Email Address')}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: '#0F172A',
                          marginTop: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {FOUNDER_EMAIL}
                      </div>
                    </div>
                    <span style={{ color: P, fontSize: 13, fontWeight: 700 }}>
                      mailto: →
                    </span>
                  </a>
                </div>

                {/* 4. QUICK CONTACT ACTIONS */}
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#64748B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 10,
                    }}
                  >
                    {t('Quick Contact Actions')}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <a
                      href={`tel:${FOUNDER_PHONE}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        background: P,
                        color: '#FFFFFF',
                        padding: '11px 16px',
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: 13,
                        textDecoration: 'none',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#1B5E20')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = P)}
                    >
                      <Phone size={15} />
                      <span>{t('Call Founder')}</span>
                    </a>

                    <a
                      href={`mailto:${FOUNDER_EMAIL}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        background: '#FFFFFF',
                        color: P,
                        border: `1.5px solid ${P}`,
                        padding: '11px 16px',
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: 13,
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = PM
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#FFFFFF'
                      }}
                    >
                      <Mail size={15} />
                      <span>{t('Email Founder')}</span>
                    </a>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 18,
                    paddingTop: 16,
                    borderTop: '1px solid #F1F5F9',
                    fontSize: 11,
                    color: '#64748B',
                  }}
                >
                  <Sparkles size={14} color={P} />
                  <span>{t('Available in Tamil & English')}</span>
                </div>
              </div>

              {/* Additional Trust & Assistance Cards */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: '#FEF3C7',
                      color: '#B45309',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Headphones size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>
                      {t('Toll-Free Helpline')}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>
                      1800-425-AGRI (2474) • 24/7
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: '#E0F2FE',
                      color: '#0284C7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Wrench size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>
                      {t('Emergency Breakdown')}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>
                      +91 94421 99880 • 2-Hour Response
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 3. CONTACT FORM */}
            <div
              ref={formSectionRef}
              style={{
                background: '#FFFFFF',
                borderRadius: 20,
                border: '1px solid #E2E8F0',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
                padding: '32px',
              }}
            >
              <div style={{ marginBottom: 24 }}>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: '#0F172A',
                    margin: '0 0 6px',
                  }}
                >
                  {t('Send a Message to AgriRent')}
                </h2>
                <p style={{ color: '#64748B', fontSize: 13, margin: 0 }}>
                  {t('Fill out the form below and we will get back to you within 2 hours.')}
                </p>
              </div>

              {/* Success Notification Banner */}
              {submittedData && (
                <div
                  role="status"
                  style={{
                    marginBottom: 24,
                    padding: '16px 20px',
                    borderRadius: 14,
                    background: PM,
                    border: `1.5px solid ${P}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                  }}
                >
                  <CheckCircle2 size={24} color={P} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: P }}>
                      {t('Message Sent Successfully!')}
                    </div>
                    <p style={{ fontSize: 13, color: '#1B5E20', margin: '4px 0 8px', lineHeight: 1.5 }}>
                      {t(
                        'Thank you for contacting AgriRent. Our founder and support team will respond shortly.'
                      )}
                    </p>
                    <div style={{ fontSize: 11, color: '#2E7D32', fontWeight: 600 }}>
                      Ticket Ref: <strong>{submittedData.referenceId}</strong> • Category:{' '}
                      <strong>{t(submittedData.category)}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={handleReset}
                      style={{
                        marginTop: 10,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        border: 'none',
                        background: '#FFFFFF',
                        color: P,
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      }}
                    >
                      <RotateCcw size={13} />
                      <span>{t('Send Another Message')}</span>
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div style={{ display: 'grid', gap: 18 }}>
                  {/* Name and Phone Row */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: 16,
                    }}
                  >
                    {/* Full Name */}
                    <div>
                      <label
                        htmlFor="contact-name"
                        style={{
                          display: 'block',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#334155',
                          marginBottom: 6,
                        }}
                      >
                        {t('Full Name')} <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <input
                        id="contact-name"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => {
                          setFormData({ ...formData, fullName: e.target.value })
                          if (errors.fullName) setErrors({ ...errors, fullName: undefined })
                        }}
                        placeholder={isTamil ? 'உங்கள் முழு பெயர்' : 'e.g. Muthukumar S.'}
                        aria-required="true"
                        aria-invalid={!!errors.fullName}
                        aria-describedby={errors.fullName ? 'contact-name-error' : undefined}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: errors.fullName
                            ? '1.5px solid #DC2626'
                            : '1.5px solid #CBD5E1',
                          outline: 'none',
                          fontSize: 14,
                          color: '#0F172A',
                          background: errors.fullName ? '#FEF2F2' : '#FFFFFF',
                          boxSizing: 'border-box',
                        }}
                      />
                      {errors.fullName && (
                        <p
                          id="contact-name-error"
                          role="alert"
                          style={{
                            margin: '4px 0 0',
                            fontSize: 12,
                            color: '#DC2626',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <AlertCircle size={13} /> {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label
                        htmlFor="contact-phone"
                        style={{
                          display: 'block',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#334155',
                          marginBottom: 6,
                        }}
                      >
                        {t('Phone Number')} <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value })
                          if (errors.phone) setErrors({ ...errors, phone: undefined })
                        }}
                        placeholder={isTamil ? '10 இலக்க தொலைபேசி எண்' : 'e.g. 98401 23456'}
                        aria-required="true"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: errors.phone
                            ? '1.5px solid #DC2626'
                            : '1.5px solid #CBD5E1',
                          outline: 'none',
                          fontSize: 14,
                          color: '#0F172A',
                          background: errors.phone ? '#FEF2F2' : '#FFFFFF',
                          boxSizing: 'border-box',
                        }}
                      />
                      {errors.phone && (
                        <p
                          id="contact-phone-error"
                          role="alert"
                          style={{
                            margin: '4px 0 0',
                            fontSize: 12,
                            color: '#DC2626',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <AlertCircle size={13} /> {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email and Support Category Row */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: 16,
                    }}
                  >
                    {/* Email Address */}
                    <div>
                      <label
                        htmlFor="contact-email"
                        style={{
                          display: 'block',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#334155',
                          marginBottom: 6,
                        }}
                      >
                        {t('Email Address')} <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value })
                          if (errors.email) setErrors({ ...errors, email: undefined })
                        }}
                        placeholder="you@agrirent.in"
                        aria-required="true"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'contact-email-error' : undefined}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: errors.email
                            ? '1.5px solid #DC2626'
                            : '1.5px solid #CBD5E1',
                          outline: 'none',
                          fontSize: 14,
                          color: '#0F172A',
                          background: errors.email ? '#FEF2F2' : '#FFFFFF',
                          boxSizing: 'border-box',
                        }}
                      />
                      {errors.email && (
                        <p
                          id="contact-email-error"
                          role="alert"
                          style={{
                            margin: '4px 0 0',
                            fontSize: 12,
                            color: '#DC2626',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <AlertCircle size={13} /> {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Support Category */}
                    <div>
                      <label
                        htmlFor="contact-category"
                        style={{
                          display: 'block',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#334155',
                          marginBottom: 6,
                        }}
                      >
                        {t('Support Category')} <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <select
                        id="contact-category"
                        name="category"
                        value={formData.category}
                        onChange={(e) => {
                          setFormData({ ...formData, category: e.target.value })
                          if (errors.category) setErrors({ ...errors, category: undefined })
                        }}
                        aria-required="true"
                        aria-invalid={!!errors.category}
                        aria-describedby={errors.category ? 'contact-category-error' : undefined}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: errors.category
                            ? '1.5px solid #DC2626'
                            : '1.5px solid #CBD5E1',
                          outline: 'none',
                          fontSize: 14,
                          color: '#0F172A',
                          background: errors.category ? '#FEF2F2' : '#FFFFFF',
                          boxSizing: 'border-box',
                          cursor: 'pointer',
                        }}
                      >
                        {SUPPORT_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {t(cat)}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p
                          id="contact-category-error"
                          role="alert"
                          style={{
                            margin: '4px 0 0',
                            fontSize: 12,
                            color: '#DC2626',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <AlertCircle size={13} /> {errors.category}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="contact-subject"
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#334155',
                        marginBottom: 6,
                      }}
                    >
                      {t('Subject')} <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => {
                        setFormData({ ...formData, subject: e.target.value })
                        if (errors.subject) setErrors({ ...errors, subject: undefined })
                      }}
                      placeholder={
                        isTamil
                          ? 'உங்கள் கோரிக்கையின் சுருக்கம்'
                          : 'e.g. Inquiring about John Deere 5310 tractor booking in Thanjavur'
                      }
                      aria-required="true"
                      aria-invalid={!!errors.subject}
                      aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: errors.subject
                          ? '1.5px solid #DC2626'
                          : '1.5px solid #CBD5E1',
                        outline: 'none',
                        fontSize: 14,
                        color: '#0F172A',
                        background: errors.subject ? '#FEF2F2' : '#FFFFFF',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.subject && (
                      <p
                        id="contact-subject-error"
                        role="alert"
                        style={{
                          margin: '4px 0 0',
                          fontSize: 12,
                          color: '#DC2626',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <AlertCircle size={13} /> {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 6,
                      }}
                    >
                      <label
                        htmlFor="contact-message"
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#334155',
                        }}
                      >
                        {t('Message')} <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>
                        {formData.message.length} chars (min 15)
                      </span>
                    </div>
                    <textarea
                      ref={messageInputRef}
                      id="contact-message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({ ...formData, message: e.target.value })
                        if (errors.message) setErrors({ ...errors, message: undefined })
                      }}
                      placeholder={
                        isTamil
                          ? 'உங்கள் கேள்விகள் அல்லது வாடகை தேவைகளை விரிவாக உள்ளிடவும்...'
                          : 'Please describe your equipment needs, rental dates, farm location, or inquiry details...'
                      }
                      aria-required="true"
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? 'contact-message-error' : undefined}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: errors.message
                          ? '1.5px solid #DC2626'
                          : '1.5px solid #CBD5E1',
                        outline: 'none',
                        fontSize: 14,
                        color: '#0F172A',
                        background: errors.message ? '#FEF2F2' : '#FFFFFF',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        lineHeight: 1.5,
                      }}
                    />
                    {errors.message && (
                      <p
                        id="contact-message-error"
                        role="alert"
                        style={{
                          margin: '4px 0 0',
                          fontSize: 12,
                          color: '#DC2626',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <AlertCircle size={13} /> {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div style={{ marginTop: 8 }}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '14px 24px',
                        background: isSubmitting ? '#6B7280' : P,
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 12,
                        fontSize: 15,
                        fontWeight: 800,
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        boxShadow: '0 4px 14px rgba(46, 125, 50, 0.25)',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSubmitting) e.currentTarget.style.background = '#1B5E20'
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubmitting) e.currentTarget.style.background = P
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <RotateCcw size={16} className="animate-spin" />
                          <span>{t('Sending Message...')}</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>{t('Send Message')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
