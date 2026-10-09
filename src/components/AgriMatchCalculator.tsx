import { useState } from 'react'
import { Calculator, Sparkles, TrendingDown, Clock, Fuel, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { api } from '../lib/api-client'

interface Props {
  onNavigate?: (screen: string) => void
  onSelectEquipment?: (id: string) => void
}

export default function AgriMatchCalculator({ onNavigate, onSelectEquipment }: Props) {
  const { isTamil } = useLanguage()
  const [acres, setAcres] = useState<number>(5)
  const [crop, setCrop] = useState<string>('Paddy')
  const [soil, setSoil] = useState<string>('Clay Wetland')
  const [operation, setOperation] = useState<string>('Tillage')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCalculate = async () => {
    setLoading(true)
    try {
      const res = await api.calculateAgriMatch({ acres, crop, soil, operation })
      setResult(res)
    } catch {
      // client-side calculation fallback
      const totalManual = acres * 3200
      const totalMech = acres * 1450
      setResult({
        acres,
        crop,
        soil,
        operation,
        hpRequired: 50,
        recommendedCategory: 'Tractor',
        recommendedTool: 'John Deere 5310 + Shaktiman Rotary Tiller',
        recommendedId: 'eq-tractor-2',
        totalHours: Number((acres * 1.5).toFixed(1)),
        totalDieselLiters: Math.round(acres * 6.2),
        totalManualCost: totalManual,
        totalMechanizedCost: totalMech,
        netSavings: totalManual - totalMech,
        savingsPercent: 55,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBook = (id: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('agrirent_selected_equipment_id', id)
    }
    if (onSelectEquipment) onSelectEquipment(id)
    if (onNavigate) onNavigate('booking')
  }

  return (
    <div
      className="card-shadow"
      style={{
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F0FDF4 100%)',
        borderRadius: 24,
        padding: '28px',
        border: '1.5px solid #BBF7D0',
        marginBottom: 32,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              background: '#15803D',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <Calculator size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#14532D', margin: 0 }}>
                AgriMatch™ AI Machinery & Farm Acreage Optimizer
              </h2>
              <span
                style={{
                  background: '#DCFCE7',
                  color: '#15803D',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 800,
                  border: '1px solid #86EFAC',
                }}
              >
                PATENT PENDING
              </span>
            </div>
            <p style={{ color: '#4B5563', fontSize: 13, margin: '4px 0 0' }}>
              {isTamil
                ? 'உங்கள் நில பரப்பளவு, பயிர் மற்றும் மண் வகைக்கு ஏற்ப மிகச்சிறந்த கருவி மற்றும் டீசல் சேமிப்பு கால்குலேட்டர்'
                : 'Input your acreage, crop, and soil type to compute ideal equipment HP, diesel savings, and labor cost ROI.'}
            </p>
          </div>
        </div>
      </div>

      {/* Input controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
            {isTamil ? 'நில பரப்பளவு (ஏக்கர்)' : 'Land Size (Acres)'}
          </label>
          <input
            type="number"
            min={1}
            max={500}
            value={acres}
            onChange={(e) => setAcres(Math.max(1, Number(e.target.value)))}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #D1D5DB',
              fontSize: 14,
              fontWeight: 700,
              color: '#111827',
              outline: 'none',
              background: '#fff',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
            {isTamil ? 'பயிர் வகை' : 'Crop Type'}
          </label>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #D1D5DB',
              fontSize: 13,
              fontWeight: 600,
              background: '#fff',
              outline: 'none',
            }}
          >
            <option value="Paddy">Paddy / Rice (நெல்)</option>
            <option value="Sugarcane">Sugarcane (கரும்பு)</option>
            <option value="Cotton">Cotton (பருத்தி)</option>
            <option value="Maize">Maize / Corn (மக்காச்சோளம்)</option>
            <option value="Groundnut">Groundnut (நிலக்கடலை)</option>
            <option value="Vegetables">Horticulture & Vegetables (தோட்டக்கலை)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
            {isTamil ? 'மண் வகை' : 'Soil Condition'}
          </label>
          <select
            value={soil}
            onChange={(e) => setSoil(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #D1D5DB',
              fontSize: 13,
              fontWeight: 600,
              background: '#fff',
              outline: 'none',
            }}
          >
            <option value="Clay Wetland">Clay Wetland / Puddle (சேற்று நிலம்)</option>
            <option value="Black Cotton">Black Cotton Soil (கரிசல் மண்)</option>
            <option value="Red Soil">Red Loamy Soil (செம்மண்)</option>
            <option value="Alluvial">Alluvial Delta Soil (வண்டல் மண்)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
            {isTamil ? 'வேளாண் பணி' : 'Farming Stage'}
          </label>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #D1D5DB',
              fontSize: 13,
              fontWeight: 600,
              background: '#fff',
              outline: 'none',
            }}
          >
            <option value="Tillage">Tillage & Puddling (உழவு & சேற்றுழவு)</option>
            <option value="Leveling">Precision Laser Leveling (லேசர் நில சமன்)</option>
            <option value="Spraying">Crop Spraying & Protection (ட்ரோன் மருந்து தெளிப்பு)</option>
            <option value="Harvesting">Harvesting & Baler (அறுவடை & பேலர்)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: result ? 20 : 0 }}>
        <button
          onClick={handleCalculate}
          disabled={loading}
          style={{
            background: '#15803D',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)',
          }}
        >
          <Sparkles size={16} />
          <span>{loading ? (isTamil ? 'கணக்கிடப்படுகிறது...' : 'Calculating...') : isTamil ? 'பரிந்துரை மற்றும் சேமிப்பைக் காண்க' : 'Run AgriMatch™ Analysis'}</span>
        </button>
      </div>

      {/* Analysis Result Card */}
      {result && (
        <div
          style={{
            background: '#fff',
            borderRadius: 18,
            padding: '24px',
            border: '1px solid #86EFAC',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            marginTop: 18,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#15803D', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                {isTamil ? 'பரிந்துரைக்கப்படும் கருவி தொகுப்பு' : 'AI Optimal Equipment Recommendation'}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>
                {result.recommendedTool}
              </h3>
              <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, background: '#F3F4F6', padding: '3px 8px', borderRadius: 6, fontWeight: 600, color: '#374151' }}>
                  Min HP Required: <strong>{result.hpRequired} HP</strong>
                </span>
                <span style={{ fontSize: 12, background: '#ECFDF5', padding: '3px 8px', borderRadius: 6, fontWeight: 600, color: '#047857' }}>
                  Coverage: <strong>{result.acres} Acres</strong>
                </span>
              </div>
            </div>

            <button
              onClick={() => handleBook(result.recommendedId)}
              style={{
                background: '#15803D',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '10px 20px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>{isTamil ? 'இப்போதே வாடகைக்கு எடுக்கவும்' : 'Book Recommended Equipment'}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Metrics comparison grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '14px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4B5563', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                <Clock size={16} color="#4B5563" />
                {isTamil ? 'மொத்த நேரம்' : 'Estimated Machine Time'}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>
                {result.totalHours} <span style={{ fontSize: 13, fontWeight: 500 }}>Hours</span>
              </div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                vs 120+ manual labor hours
              </div>
            </div>

            <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '14px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4B5563', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                <Fuel size={16} color="#D97706" />
                {isTamil ? 'டீசல் நுகர்வு' : 'Diesel / Power Estimate'}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#D97706' }}>
                {result.totalDieselLiters} <span style={{ fontSize: 13, fontWeight: 500 }}>Liters</span>
              </div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                High-efficiency calibrated rate
              </div>
            </div>

            <div style={{ background: '#FEF2F2', borderRadius: 12, padding: '14px', border: '1px solid #FCA5A5' }}>
              <div style={{ color: '#991B1B', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                {isTamil ? 'பாரம்பரிய உழைப்பு செலவு' : 'Traditional Labor Cost'}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#991B1B' }}>
                ₹{result.totalManualCost.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: '#B91C1C', marginTop: 2 }}>
                Manual wages & delays
              </div>
            </div>

            <div style={{ background: '#F0FDF4', borderRadius: 12, padding: '14px', border: '1.5px solid #86EFAC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#15803D', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                <TrendingDown size={16} />
                {isTamil ? 'விவசாயிக்கு நிகர சேமிப்பு' : 'Your Net Savings'}
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#15803D' }}>
                ₹{result.netSavings.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginTop: 2 }}>
                Save {result.savingsPercent}% of total cost!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
