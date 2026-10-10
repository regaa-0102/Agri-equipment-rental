import { useState } from 'react'
import {
  X,
  Palette,
  ZoomIn,
  ZoomOut,
  Globe,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react'
import { useTheme, THEME_OPTIONS } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'

export default function SettingsModal() {
  const { theme, setTheme, siteZoom, setSiteZoom, zoomIn, zoomOut, resetZoom, isSettingsOpen, closeSettings } =
    useTheme()
  const { lang, setLanguage, isTamil, t } = useLanguage()

  if (!isSettingsOpen) return null

  const ZOOM_PRESETS = [
    { label: '85%', value: 85, desc: 'Compact' },
    { label: '100%', value: 100, desc: 'Standard' },
    { label: '115%', value: 115, desc: 'Comfort' },
    { label: '130%', value: 130, desc: isTamil ? 'பெரிய எழுத்து' : 'Farmer View' },
    { label: '150%', value: 150, desc: 'Maximum' },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99998,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={closeSettings}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 640,
          maxHeight: '90vh',
          backgroundColor: 'var(--settings-bg, #FFFFFF)',
          color: 'var(--settings-text, #0F172A)',
          borderRadius: 20,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--settings-border, #E2E8F0)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--settings-border, #E2E8F0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--settings-header-bg, #F8FAFC)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #15803D, #22C55E)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Sliders size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800 }}>
                {isTamil ? 'அமைப்புகள் & தீம்கள்' : 'Settings & Customization'}
              </h2>
              <span style={{ fontSize: 12, color: 'var(--settings-muted, #64748B)' }}>
                {isTamil
                  ? 'தீம், பெரிதாக்கம் மற்றும் மொழி விருப்பங்கள்'
                  : 'Customize theme, zoom magnification and display options'}
              </span>
            </div>
          </div>

          <button
            onClick={closeSettings}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--settings-muted, #64748B)',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 8,
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* 1. Theme Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Palette size={18} color="#15803D" />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                {isTamil ? 'இணையதள தீம் (வண்ணங்கள்)' : 'Website Theme (Color Scheme)'}
              </h3>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--settings-muted, #64748B)' }}>
              {isTamil
                ? 'வெள்ளை, இருண்ட தோற்றம் அல்லது விவசாய இயற்கை தீம்களைத் தேர்வு செய்யவும்:'
                : 'Choose from White, Dark, or specialized agricultural themes:'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
              {THEME_OPTIONS.map((opt) => {
                const isSelected = theme === opt.id
                return (
                  <div
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    style={{
                      border: `2px solid ${isSelected ? opt.accentPreview : 'var(--settings-border, #E2E8F0)'}`,
                      borderRadius: 14,
                      padding: 14,
                      cursor: 'pointer',
                      background: opt.cardPreview,
                      color: opt.textPreview,
                      boxShadow: isSelected ? `0 0 0 2px ${opt.accentPreview}40` : 'none',
                      transition: 'all 0.18s ease',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Color Swatch Bar */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: opt.bgPreview,
                          border: '1px solid rgba(128,128,128,0.3)',
                        }}
                      />
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: opt.cardPreview,
                          border: '1px solid rgba(128,128,128,0.3)',
                        }}
                      />
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: opt.accentPreview,
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>
                        {opt.icon} {isTamil ? opt.nameTa : opt.name}
                      </div>
                      {isSelected && (
                        <div
                          style={{
                            background: opt.accentPreview,
                            color: '#fff',
                            borderRadius: '50%',
                            width: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        opacity: 0.8,
                        marginTop: 6,
                        lineHeight: 1.4,
                      }}
                    >
                      {isTamil ? opt.descriptionTa : opt.description}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 2. Zoom In & Zoom Out Option */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ZoomIn size={18} color="#15803D" />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                  {isTamil ? 'திரை பெரிதாக்கம் (Zoom In / Zoom Out)' : 'Overall Website Zoom In & Zoom Out'}
                </h3>
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: '#15803D',
                  background: 'rgba(21, 128, 61, 0.1)',
                  padding: '3px 10px',
                  borderRadius: 20,
                }}
              >
                {siteZoom}%
              </span>
            </div>

            <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--settings-muted, #64748B)' }}>
              {isTamil
                ? 'விவசாயிகள் மற்றும் எளிதான வாசிப்பிற்கு இணையதள அளவை பெரிதாக்கலாம் அல்லது சிறிதாக்கலாம்:'
                : 'Scale the entire website larger or smaller for comfortable reading and farmer-friendly viewing:'}
            </p>

            {/* Zoom Slider and - / + Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 18px',
                borderRadius: 14,
                background: 'var(--settings-card-bg, #F8FAFC)',
                border: '1px solid var(--settings-border, #E2E8F0)',
                marginBottom: 12,
              }}
            >
              <button
                type="button"
                onClick={zoomOut}
                disabled={siteZoom <= 80}
                title="Zoom Out (-)"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  border: '1px solid var(--settings-border, #CBD5E1)',
                  background: 'var(--settings-bg, #fff)',
                  color: 'inherit',
                  cursor: siteZoom <= 80 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: siteZoom <= 80 ? 0.4 : 1,
                }}
              >
                <ZoomOut size={18} />
              </button>

              <input
                type="range"
                min="80"
                max="150"
                step="5"
                value={siteZoom}
                onChange={(e) => setSiteZoom(parseInt(e.target.value, 10))}
                style={{ flex: 1, accentColor: '#15803D', cursor: 'pointer' }}
              />

              <button
                type="button"
                onClick={zoomIn}
                disabled={siteZoom >= 150}
                title="Zoom In (+)"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  border: '1px solid var(--settings-border, #CBD5E1)',
                  background: 'var(--settings-bg, #fff)',
                  color: 'inherit',
                  cursor: siteZoom >= 150 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: siteZoom >= 150 ? 0.4 : 1,
                }}
              >
                <ZoomIn size={18} />
              </button>

              <button
                type="button"
                onClick={resetZoom}
                title="Reset to 100%"
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--settings-border, #CBD5E1)',
                  background: 'var(--settings-bg, #fff)',
                  color: 'inherit',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <RotateCcw size={14} />
                <span>100%</span>
              </button>
            </div>

            {/* Preset Buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ZOOM_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setSiteZoom(p.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: `1px solid ${siteZoom === p.value ? '#15803D' : 'var(--settings-border, #CBD5E1)'}`,
                    background: siteZoom === p.value ? '#15803D' : 'var(--settings-bg, #fff)',
                    color: siteZoom === p.value ? '#fff' : 'inherit',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p.label} • {p.desc}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Language Selection */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Globe size={18} color="#15803D" />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                {isTamil ? 'மொழித் தேர்வு' : 'Language Selection'}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: `2px solid ${lang === 'en' ? '#15803D' : 'var(--settings-border, #E2E8F0)'}`,
                  background: lang === 'en' ? 'rgba(21, 128, 61, 0.08)' : 'var(--settings-card-bg, #fff)',
                  color: 'inherit',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                <span>🇬🇧 English</span>
                {lang === 'en' && <Check size={16} color="#15803D" />}
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ta')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: `2px solid ${lang === 'ta' ? '#15803D' : 'var(--settings-border, #E2E8F0)'}`,
                  background: lang === 'ta' ? 'rgba(21, 128, 61, 0.08)' : 'var(--settings-card-bg, #fff)',
                  color: 'inherit',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                <span>🇮🇳 தமிழ் (Tamil)</span>
                {lang === 'ta' && <Check size={16} color="#15803D" />}
              </button>
            </div>
          </div>

          {/* 4. Equipment Images Directly from Google Info Banner */}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(21, 128, 61, 0.1), rgba(56, 189, 248, 0.1))',
              border: '1px solid rgba(21, 128, 61, 0.2)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#15803D',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ImageIcon size={18} />
            </div>
            <div>
              <strong style={{ fontSize: 13, color: '#15803D' }}>
                {isTamil ? 'கூகிள் நேரடி புகைப்பட இணைப்பு' : 'Direct Google Equipment Images Enabled'}
              </strong>
              <p style={{ margin: '4px 0 8px', fontSize: 12, color: 'var(--settings-muted, #475569)', lineHeight: 1.5 }}>
                {isTamil
                  ? 'அனைத்து 46 உபகரணங்களின் புகைப்படங்களும் அவற்றின் தயாரிப்புப் பெயர் மற்றும் பிராண்டிற்கு ஏற்ப கூகிள் மற்றும் உண்மையான கள புகைப்படங்களுடன் இணைக்கப்பட்டுள்ளன.'
                  : 'All 46 equipment machinery records across the website are directly resolved to authentic photos matching each model and brand name from Google and verified agricultural archives.'}
              </p>
              <a
                href="https://www.google.com/search?tbm=isch&q=John+Deere+5310+tractor"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#15803D',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  textDecoration: 'none',
                }}
              >
                <span>{isTamil ? 'மாதிரி படத் தேடலைக் காண்க' : 'Preview Live Google Search Query'}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--settings-border, #E2E8F0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--settings-header-bg, #F8FAFC)',
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--settings-muted, #64748B)' }}>
            AgriRent Enterprise • Version 2.4.0
          </span>
          <button
            type="button"
            onClick={closeSettings}
            style={{
              padding: '9px 20px',
              borderRadius: 10,
              background: '#15803D',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {isTamil ? 'சரி / முடிந்தது' : 'Done & Apply'}
          </button>
        </div>
      </div>
    </div>
  )
}
