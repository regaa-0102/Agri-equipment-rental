import { useState } from 'react'
import { Terminal, X, Play, Copy, Check, ExternalLink } from 'lucide-react'
import { getStoredJwt } from '../lib/api-client'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const ENDPOINTS = [
  {
    name: 'Get All Equipment Listings',
    method: 'GET',
    url: '/api/listings',
    description: 'Fetch all genuine equipment listings with filtering support by category and price.',
  },
  {
    name: 'Live Agri-Weather & Spray Index',
    method: 'GET',
    url: '/api/weather?location=Coimbatore',
    description: 'Returns micrometeorology data and calculates drone/boom spray suitability.',
  },
  {
    name: 'AgriMatch™ Optimizer API',
    method: 'POST',
    url: '/api/calculator/agrimatch',
    body: JSON.stringify({ acres: 8, crop: 'Paddy', soil: 'Clay Wetland', operation: 'Tillage' }, null, 2),
    description: 'Calculates recommended tractor HP, machine hours, fuel consumption, and labor cost savings.',
  },
  {
    name: 'JWT Authentication (Farmer Login)',
    method: 'POST',
    url: '/api/auth/login',
    body: JSON.stringify({ email: 'muthu.farmer@gmail.com', password: 'Farmer@123' }, null, 2),
    description: 'Authenticates user and returns RFC 7519 HMAC-SHA256 JWT token.',
  },
  {
    name: 'Admin Telemetry & Escrow Metrics',
    method: 'GET',
    url: '/api/admin/metrics',
    description: 'Returns platform GMV, commission revenue, active rentals, and escrow held.',
  },
  {
    name: 'Seed Users Directory (5 Verified Accounts)',
    method: 'GET',
    url: '/api/auth/seed-users',
    description: 'Returns the 5 pre-seeded test accounts for fast 1-click evaluation.',
  },
]

export default function ApiExplorerModal({ isOpen, onClose }: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [response, setResponse] = useState<any>(null)
  const [statusCode, setStatusCode] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const ep = ENDPOINTS[selectedIdx]

  const runRequest = async () => {
    setLoading(true)
    setResponse(null)
    setStatusCode(null)

    const token = getStoredJwt()
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    try {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers,
        body: ep.method === 'POST' ? ep.body : undefined,
      })
      setStatusCode(res.status)
      const data = await res.json()
      setResponse(data)
    } catch (err: any) {
      setStatusCode(500)
      setResponse({ error: 'Request failed', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  const copyCurl = () => {
    const token = getStoredJwt()
    const authHeader = token ? ` -H "Authorization: Bearer ${token}"` : ''
    const bodyArg = ep.method === 'POST' ? ` -d '${ep.body.replace(/\n/g, '')}'` : ''
    const curl = `curl -X ${ep.method} "http://localhost:5173${ep.url}" -H "Content-Type: application/json"${authHeader}${bodyArg}`
    navigator.clipboard.writeText(curl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 20000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          background: '#0F172A',
          color: '#F8FAFC',
          borderRadius: 20,
          width: 900,
          maxWidth: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid #334155',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Terminal size={20} color="#4ADE80" />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#F8FAFC' }}>
              AgriRent REST API Sandbox & Live Explorer
            </h3>
            <span style={{ fontSize: 10, background: '#1E293B', color: '#94A3B8', padding: '2px 8px', borderRadius: 4, border: '1px solid #475569' }}>
              v2.4
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Endpoints sidebar */}
          <div style={{ background: '#1E293B', borderRight: '1px solid #334155', padding: '12px', overflowY: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8, padding: '0 6px' }}>
              Available Endpoints
            </div>
            {ENDPOINTS.map((item, idx) => (
              <button
                key={item.name}
                onClick={() => {
                  setSelectedIdx(idx)
                  setResponse(null)
                  setStatusCode(null)
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: 'none',
                  background: selectedIdx === idx ? '#334155' : 'transparent',
                  color: selectedIdx === idx ? '#4ADE80' : '#E2E8F0',
                  fontSize: 12,
                  fontWeight: selectedIdx === idx ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    padding: '2px 5px',
                    borderRadius: 4,
                    background: item.method === 'POST' ? '#3B82F6' : '#10B981',
                    color: '#fff',
                  }}
                >
                  {item.method}
                </span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
              </button>
            ))}
          </div>

          {/* Request & Response Playground */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', background: '#0B1120' }}>
            {/* Target bar */}
            <div>
              <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>{ep.description}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#1E293B', padding: '10px 14px', borderRadius: 10, border: '1px solid #334155' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: ep.method === 'POST' ? '#60A5FA' : '#34D399' }}>{ep.method}</span>
                <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#F1F5F9', flex: 1 }}>{ep.url}</span>
                <button
                  onClick={runRequest}
                  disabled={loading}
                  style={{
                    background: '#16A34A',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Play size={13} fill="#fff" />
                  <span>{loading ? 'Sending...' : 'Send Request'}</span>
                </button>
                <button
                  onClick={copyCurl}
                  style={{
                    background: '#334155',
                    color: '#E2E8F0',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 10px',
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                  title="Copy cURL command"
                >
                  {copied ? <Check size={13} color="#4ADE80" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            {/* Request Body (if POST) */}
            {ep.body && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 4 }}>Request Payload (JSON):</div>
                <pre style={{ background: '#1E293B', padding: 12, borderRadius: 10, fontSize: 12, fontFamily: 'monospace', color: '#FCD34D', margin: 0, border: '1px solid #334155' }}>
                  {ep.body}
                </pre>
              </div>
            )}

            {/* Response Section */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8' }}>Response Output:</span>
                {statusCode && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: statusCode < 300 ? '#065F46' : '#991B1B',
                      color: statusCode < 300 ? '#34D399' : '#FCA5A5',
                    }}
                  >
                    Status: {statusCode} {statusCode === 200 ? 'OK' : statusCode === 201 ? 'Created' : ''}
                  </span>
                )}
              </div>

              <div
                style={{
                  background: '#020617',
                  border: '1px solid #1E293B',
                  borderRadius: 10,
                  padding: 14,
                  minHeight: 180,
                  maxHeight: 280,
                  overflowY: 'auto',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: '#38BDF8',
                  lineHeight: 1.5,
                }}
              >
                {loading ? (
                  <span style={{ color: '#94A3B8' }}>Dispatching live HTTP request to local backend...</span>
                ) : response ? (
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(response, null, 2)}</pre>
                ) : (
                  <span style={{ color: '#64748B' }}>Click "Send Request" to test this endpoint live and inspect the response JSON.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
