import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, Sparkles, ArrowRight } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { api } from '../lib/api-client'

interface Message {
  id: string
  sender: 'user' | 'bot'
  text: string
  time: string
  recommendedEquipmentId?: string
}

interface Props {
  onNavigate?: (screen: string) => void
  onSelectEquipment?: (id: string) => void
}

export default function AgriChatbot({ onNavigate, onSelectEquipment }: Props) {
  const { isTamil } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: isTamil
        ? 'வணக்கம்! நான் அக்ரிரென்ட் AI விவசாய உதவியாளர் 🌾. உங்கள் நிலத்திற்கு எந்த கருவி தேவை என்று என்னிடம் கேளுங்கள்!'
        : 'Hello! I am your AgriRent AI Farm Assistant 🌾. Ask me about tractors, harvesters, spraying drones, or rental costs!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  const quickPills = isTamil
    ? ['5 ஏக்கர் நில உழவு', 'ட்ரோன் மருந்து தெளிப்பு', 'நெல் அறுவடை இயந்திரம்', 'பாதுகாப்பு வைப்பு விதிகள்']
    : ['Tractor for 5 Acres', 'Drone Spraying Cost', 'Paddy Harvester', 'Security Deposit Rules']

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text || loading) return

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await api.askChatbot(text, isTamil ? 'ta' : 'en')
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: res.reply,
        recommendedEquipmentId: res.recommendedEquipmentId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, botMsg])
    } catch {
      const fallbackMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: isTamil
          ? 'ஜான் டீர் 5310 டிராக்டர் மற்றும் டிஜேஐ அக்ராஸ் T40 ட்ரோன் தற்போது முன்பதிவுக்கு தயாராக உள்ளன!'
          : 'John Deere 5310 4WD and DJI Agras T40 Drone are currently available in your area for immediate booking!',
        recommendedEquipmentId: 'eq-drone-1',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, fallbackMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleEquipmentClick = (id: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('agrirent_selected_equipment_id', id)
    }
    if (onSelectEquipment) onSelectEquipment(id)
    if (onNavigate) onNavigate('equipment-details')
    setIsOpen(false)
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 30,
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 8px 24px rgba(22, 101, 52, 0.4)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
          >
            <Sparkles size={18} style={{ color: '#FDE047' }} />
            <span>{isTamil ? 'AgriAI விவசாய உதவியாளர்' : 'AgriAI Farm Assistant'}</span>
            <div
              style={{
                width: 8,
                height: 8,
                background: '#4ADE80',
                borderRadius: '50%',
                boxShadow: '0 0 6px #4ADE80',
              }}
            />
          </button>
        )}
      </div>

      {/* Chat Window Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            height: 520,
            maxHeight: 'calc(100vh - 80px)',
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
            border: '1px solid #E5E7EB',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 10000,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
              color: '#fff',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                  AgriAI Assistant
                  <span style={{ fontSize: 10, background: '#4ADE80', color: '#14532D', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                    LIVE
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>
                  {isTamil ? 'தமிழ் & English ஆதரவு' : 'AI Farm Equipment Advisor'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, background: '#F9FAFB' }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div
                  style={{
                    background: m.sender === 'user' ? '#166534' : '#fff',
                    color: m.sender === 'user' ? '#fff' : '#1F2937',
                    padding: '10px 14px',
                    borderRadius: m.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    fontSize: 13,
                    lineHeight: 1.5,
                    border: m.sender === 'bot' ? '1px solid #E5E7EB' : 'none',
                  }}
                >
                  {m.text}
                </div>

                {m.recommendedEquipmentId && (
                  <button
                    onClick={() => handleEquipmentClick(m.recommendedEquipmentId!)}
                    style={{
                      alignSelf: 'flex-start',
                      marginTop: 4,
                      background: '#DCFCE7',
                      color: '#15803D',
                      border: '1px solid #86EFAC',
                      borderRadius: 8,
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>{isTamil ? 'இந்தக் கருவியைப் பார்க்கவும்' : 'View Recommended Equipment'}</span>
                    <ArrowRight size={14} />
                  </button>
                )}

                <span style={{ fontSize: 10, color: '#9CA3AF', alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  {m.time}
                </span>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: '#fff', padding: '8px 14px', borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12, color: '#6B7280' }}>
                {isTamil ? 'AI பதிலளிக்கிறது...' : 'AgriAI is analyzing...'}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Pills */}
          <div style={{ padding: '8px 12px', background: '#fff', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {quickPills.map((pill) => (
              <button
                key={pill}
                onClick={() => sendMessage(pill)}
                style={{
                  background: '#F0FDF4',
                  color: '#166534',
                  border: '1px solid #BBF7D0',
                  borderRadius: 20,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div style={{ padding: 12, background: '#fff', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={isTamil ? 'உங்கள் கேள்வியை தட்டச்சு செய்க...' : 'Ask about equipment, rates, specs...'}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 10,
                border: '1px solid #D1D5DB',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                background: input.trim() && !loading ? '#166534' : '#E5E7EB',
                color: input.trim() && !loading ? '#fff' : '#9CA3AF',
                border: 'none',
                borderRadius: 10,
                padding: '0 14px',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
