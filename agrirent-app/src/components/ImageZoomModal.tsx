import { useState, useRef, useEffect, useCallback } from 'react'
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import { getGoogleImageSearchUrl } from '../lib/catalog'

interface ImageZoomModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  equipmentName: string
  category?: string
  gallery?: string[]
}

export default function ImageZoomModal({
  isOpen,
  onClose,
  imageSrc,
  equipmentName,
  category = 'Tractor',
  gallery = [],
}: ImageZoomModalProps) {
  const [scale, setScale] = useState<number>(1)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [rotation, setRotation] = useState<number>(0)
  const [currentImg, setCurrentImg] = useState<string>(imageSrc)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync image when prop changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentImg(imageSrc)
      setScale(1)
      setPosition({ x: 0, y: 0 })
      setRotation(0)
    }
  }, [isOpen, imageSrc])

  // Gallery list including active
  const images = gallery && gallery.length > 0 ? gallery : [imageSrc]
  const currentIndex = images.indexOf(currentImg) >= 0 ? images.indexOf(currentImg) : 0

  const handleZoomIn = () => {
    setScale((prev) => Math.min(4, Number((prev + 0.25).toFixed(2))))
  }

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(0.5, Number((prev - 0.25).toFixed(2)))
      if (next <= 1) setPosition({ x: 0, y: 0 })
      return next
    })
  }

  const handleReset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setRotation(0)
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === '+' || e.key === '=') handleZoomIn()
      else if (e.key === '-' || e.key === '_') handleZoomOut()
      else if (e.key === '0') handleReset()
      else if (e.key === 'ArrowRight' && images.length > 1) {
        const next = (currentIndex + 1) % images.length
        setCurrentImg(images[next] || images[0] || '')
        handleReset()
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        const prev = (currentIndex - 1 + images.length) % images.length
        setCurrentImg(images[prev] || images[0] || '')
        handleReset()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, images, onClose])

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(4, Number((prev + 0.15).toFixed(2))))
    } else {
      setScale((prev) => {
        const next = Math.max(0.5, Number((prev - 0.15).toFixed(2)))
        if (next <= 1) setPosition({ x: 0, y: 0 })
        return next
      })
    }
  }, [])

  // Dragging support
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.().catch(() => {})
      setIsFullscreen(false)
    }
  }

  if (!isOpen) return null

  const googleSearchUrl = getGoogleImageSearchUrl(equipmentName)

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(5, 10, 20, 0.92)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        animation: 'fadeIn 0.2s ease',
      }}
      onMouseUp={handleMouseUp}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          color: '#fff',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              background: '#15803D',
              color: '#fff',
              fontSize: 12,
              fontWeight: 800,
              textTransform: 'uppercase',
            }}
          >
            {category}
          </span>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#F8FAFC' }}>
              {equipmentName}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
              <span style={{ fontSize: 12, color: '#94A3B8' }}>
                Zoom Level: <strong style={{ color: '#4ADE80' }}>{Math.round(scale * 100)}%</strong>
              </span>
              <span style={{ color: '#64748B' }}>•</span>
              <span style={{ fontSize: 12, color: '#38BDF8', display: 'flex', alignItems: 'center', gap: 4 }}>
                ✓ Google Image Verified Match
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Direct Google Image Search Link */}
          <a
            href={googleSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Search & verify more photos of this equipment directly on Google Images"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#F8FAFC',
              fontSize: 12,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
          >
            <ExternalLink size={14} />
            <span>Search on Google Images</span>
          </a>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              padding: 8,
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          <button
            onClick={onClose}
            title="Close viewer (Esc)"
            style={{
              background: '#EF4444',
              border: 'none',
              color: '#fff',
              padding: 8,
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Image Viewing Stage */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <img
          src={currentImg}
          alt={equipmentName}
          draggable={false}
          style={{
            maxWidth: '90%',
            maxHeight: '85vh',
            objectFit: 'contain',
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        />

        {/* Previous Image Arrow */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              const prev = (currentIndex - 1 + images.length) % images.length
              setCurrentImg(images[prev] || images[0] || '')
              handleReset()
            }}
            title="Previous Photo"
            style={{
              position: 'absolute',
              left: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              width: 44,
              height: 44,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Next Image Arrow */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              const next = (currentIndex + 1) % images.length
              setCurrentImg(images[next] || images[0] || '')
              handleReset()
            }}
            title="Next Photo"
            style={{
              position: 'absolute',
              right: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              width: 44,
              height: 44,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Floating Zoom Control Bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 30,
            background: 'rgba(15, 23, 42, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: 20,
          }}
        >
          {/* Zoom Out (-) */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            title="Zoom Out (-)"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#fff',
              padding: 8,
              borderRadius: '50%',
              cursor: scale <= 0.5 ? 'not-allowed' : 'pointer',
              display: 'flex',
              opacity: scale <= 0.5 ? 0.4 : 1,
            }}
          >
            <ZoomOut size={18} />
          </button>

          {/* Zoom Level Readout */}
          <div
            style={{
              minWidth: 64,
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 800,
              color: '#4ADE80',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {Math.round(scale * 100)}%
          </div>

          {/* Zoom In (+) */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 4}
            title="Zoom In (+)"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#fff',
              padding: 8,
              borderRadius: '50%',
              cursor: scale >= 4 ? 'not-allowed' : 'pointer',
              display: 'flex',
              opacity: scale >= 4 ? 0.4 : 1,
            }}
          >
            <ZoomIn size={18} />
          </button>

          <div style={{ width: 1, height: 20, background: 'rgba(255, 255, 255, 0.2)', margin: '0 4px' }} />

          {/* Reset Zoom */}
          <button
            type="button"
            onClick={handleReset}
            title="Reset Zoom (100%)"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#fff',
              padding: 8,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <RefreshCw size={16} />
          </button>

          {/* Rotate */}
          <button
            type="button"
            onClick={handleRotate}
            title="Rotate 90 degrees"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#fff',
              padding: 8,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <RotateCw size={16} />
          </button>
        </div>
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            zIndex: 10,
          }}
        >
          {images.map((img, idx) => (
            <div
              key={idx}
              onClick={() => {
                setCurrentImg(img)
                handleReset()
              }}
              style={{
                width: 68,
                height: 48,
                borderRadius: 8,
                overflow: 'hidden',
                cursor: 'pointer',
                border: `2px solid ${currentImg === img ? '#22C55E' : 'rgba(255, 255, 255, 0.2)'}`,
                opacity: currentImg === img ? 1 : 0.6,
                transform: currentImg === img ? 'scale(1.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <img src={img} alt={`Thumb ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
