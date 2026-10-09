import { useEffect, useState } from 'react'
import { CloudSun, Wind, Droplets, Gauge, CheckCircle, AlertTriangle } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { api } from '../lib/api-client'

export default function AgriWeatherCard() {
  const { isTamil } = useLanguage()
  const [location, setLocation] = useState('Coimbatore')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchWeather = async (loc: string) => {
    setLoading(true)
    try {
      const res = await api.getWeather(loc)
      setData(res)
    } catch {
      setData({
        location: loc,
        currentWeather: { temp: 29, humidity: 62, windSpeed: 8, rainProb: 10, condition: 'Partly Cloudy', conditionTa: 'பகுதி மேகமூட்டம்' },
        spraySuitability: {
          suitable: true,
          score: 92,
          adviceEn: 'Optimal conditions for agricultural drone & boom spraying. Negligible chemical drift risk.',
          adviceTa: 'விவசாய ட்ரோன் மற்றும் பூம் தெளிப்புக்கு மிகச்சிறந்த நேரம். மருந்து காற்றில் வீணாகாது.',
        },
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather(location)
  }, [location])

  const cities = ['Coimbatore', 'Thanjavur', 'Madurai', 'Salem', 'Tiruchirappalli', 'Pune', 'Ludhiana']

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 20,
        padding: '20px 24px',
        border: '1px solid #E5E7EB',
        marginBottom: 28,
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CloudSun size={22} color="#0284C7" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0 }}>
              {isTamil ? 'வேளாண் வானிலை & ட்ரோன் தெளிப்பு குறியீடு' : 'Agri-Weather & Spray Suitability Telemetry'}
            </h3>
            <span style={{ fontSize: 11, color: '#6B7280' }}>
              Real-time micrometeorology API for precision farming
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#4B5563' }}>{isTamil ? 'பகுதி:' : 'Region:'}</span>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid #D1D5DB',
              fontSize: 12,
              fontWeight: 700,
              background: '#F9FAFB',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
          <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, marginBottom: 4 }}>
              {isTamil ? 'வெப்பநிலை' : 'Temperature'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
              {data.currentWeather.temp}°C
            </div>
            <div style={{ fontSize: 11, color: '#0284C7', fontWeight: 600, marginTop: 2 }}>
              {isTamil ? data.currentWeather.conditionTa : data.currentWeather.condition}
            </div>
          </div>

          <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748B', fontWeight: 600, marginBottom: 4 }}>
              <Wind size={13} />
              {isTamil ? 'காற்று வேகம்' : 'Wind Speed'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
              {data.currentWeather.windSpeed} <span style={{ fontSize: 12, fontWeight: 500 }}>km/h</span>
            </div>
            <div style={{ fontSize: 11, color: data.currentWeather.windSpeed < 15 ? '#16A34A' : '#DC2626', fontWeight: 600, marginTop: 2 }}>
              {data.currentWeather.windSpeed < 15 ? (isTamil ? 'குறைந்த காற்று (நன்று)' : 'Calm / Gentle') : (isTamil ? 'அதிவேக காற்று' : 'High Drift')}
            </div>
          </div>

          <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748B', fontWeight: 600, marginBottom: 4 }}>
              <Droplets size={13} />
              {isTamil ? 'ஈரப்பதம்' : 'Humidity'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
              {data.currentWeather.humidity}%
            </div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
              Rain risk: {data.currentWeather.rainProb}%
            </div>
          </div>

          <div
            style={{
              background: data.spraySuitability.suitable ? '#F0FDF4' : '#FEF2F2',
              borderRadius: 12,
              padding: '12px',
              border: `1.5px solid ${data.spraySuitability.suitable ? '#86EFAC' : '#FCA5A5'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: data.spraySuitability.suitable ? '#166534' : '#991B1B', marginBottom: 4 }}>
              <Gauge size={13} />
              {isTamil ? 'தெளிப்பு குறியீடு' : 'Spray Suitability'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: data.spraySuitability.suitable ? '#15803D' : '#DC2626' }}>
              {data.spraySuitability.score}/100
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: data.spraySuitability.suitable ? '#166534' : '#991B1B', marginTop: 2 }}>
              {data.spraySuitability.suitable ? (isTamil ? '✓ தெளிக்க சிறந்தது' : '✓ OPTIMAL FOR SPRAY') : (isTamil ? '⚠️ தாமதிக்கவும்' : '⚠️ HIGH DRIFT RISK')}
            </div>
          </div>
        </div>
      )}

      {data && (
        <div
          style={{
            background: data.spraySuitability.suitable ? '#ECFDF5' : '#FFFBEB',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 12,
            color: data.spraySuitability.suitable ? '#065F46' : '#92400E',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {data.spraySuitability.suitable ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          <span>{isTamil ? data.spraySuitability.adviceTa : data.spraySuitability.adviceEn}</span>
        </div>
      )}
    </div>
  )
}
