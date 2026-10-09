import { useEffect, useRef, useState } from 'react'
import type { LayerGroup, Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { CatalogItem } from '../lib/catalog'

export interface NearbyMapItem {
  item: CatalogItem
  district: string
  distanceKm: number | null
}

interface Props {
  items: NearbyMapItem[]
  center: { lat: number; lng: number }
  currentLocation: { lat: number; lng: number } | null
  onSelect: (item: CatalogItem) => void
  onViewDetails: (item: CatalogItem) => void
}

function distanceLabel(distanceKm: number | null): string {
  if (distanceKm === null) return ''
  return distanceKm < 1
    ? `${Math.round(distanceKm * 1000)} m away`
    : `${distanceKm.toFixed(1)} km away`
}

export default function NearbyEquipmentMap({
  items,
  center,
  currentLocation,
  onSelect,
  onViewDetails,
}: Props) {
  const mapElement = useRef<HTMLDivElement>(null)
  const map = useRef<LeafletMap | null>(null)
  const markers = useRef<LayerGroup | null>(null)
  const handlers = useRef({ onSelect, onViewDetails })
  handlers.current = { onSelect, onViewDetails }
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    let cancelled = false
    void import('leaflet')
      .then((L) => {
        if (cancelled || !mapElement.current) return
        const instance = L.map(mapElement.current, { scrollWheelZoom: false }).setView([center.lat, center.lng], 7)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(instance)
        map.current = instance
        markers.current = L.layerGroup().addTo(instance)
        setMapReady(true)
      })
      .catch(() => setMapError(true))

    return () => {
      cancelled = true
      map.current?.remove()
      map.current = null
      markers.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapReady || !map.current || !markers.current) return
    void import('leaflet').then((L) => {
      const instance = map.current
      const layerGroup = markers.current
      if (!instance || !layerGroup) return
      layerGroup.clearLayers()

      const points: [number, number][] = []
      const groupedMarkers = new globalThis.Map<string, NearbyMapItem[]>()
      for (const result of items) {
        const { item } = result
        if (typeof item.lat !== 'number' || typeof item.lng !== 'number') continue
        const key = `${item.lat.toFixed(5)},${item.lng.toFixed(5)}`
        const grouped = groupedMarkers.get(key) || []
        grouped.push(result)
        groupedMarkers.set(key, grouped)
      }

      for (const group of groupedMarkers.values()) {
        const first = group[0]
        if (!first || typeof first.item.lat !== 'number' || typeof first.item.lng !== 'number') continue
        const position: [number, number] = [first.item.lat, first.item.lng]
        points.push(position)
        const marker = L.circleMarker(position, {
          radius: Math.min(13, 8 + group.length),
          color: '#166534',
          weight: 2,
          fillColor: '#22C55E',
          fillOpacity: 0.95,
        })
        const popup = document.createElement('div')
        popup.style.minWidth = '190px'
        for (const result of group) {
          const { item } = result
          const entry = document.createElement('div')
          entry.style.cssText = 'padding:5px 0;border-bottom:1px solid #e2e8f0'
          const title = document.createElement('strong')
          title.textContent = item.name
          entry.append(title)
          const vendor = document.createElement('p')
          vendor.textContent = item.vendorName || item.owner || 'Equipment provider'
          vendor.style.margin = '4px 0'
          entry.append(vendor)
          const details = document.createElement('p')
          const price = item.dailyRate > 0 ? `₹${item.dailyRate.toLocaleString('en-IN')}/day` : 'Rent price unavailable'
          const buyPrice = item.purchasePrice
            ? ` · Buy ₹${item.purchasePrice.toLocaleString('en-IN')}`
            : ''
          details.textContent = `⭐ ${item.rating.toFixed(1)} (${item.reviews}) · ${result.district} · ${price}${buyPrice}${result.distanceKm === null ? '' : ` · ${distanceLabel(result.distanceKm)}`}`
          details.style.margin = '4px 0'
          entry.append(details)
          const button = document.createElement('button')
          button.type = 'button'
          button.textContent = 'View Details'
          button.style.cssText = 'padding:5px 9px;border:0;border-radius:6px;background:#2E7D32;color:#fff;font-weight:700;cursor:pointer'
          button.addEventListener('click', () => handlers.current.onViewDetails(item))
          entry.append(button)
          popup.append(entry)
        }
        marker.bindPopup(popup).on('click', () => handlers.current.onSelect(first.item)).addTo(layerGroup)
      }

      if (currentLocation) {
        const position: [number, number] = [currentLocation.lat, currentLocation.lng]
        points.push(position)
        L.circleMarker(position, {
          radius: 9,
          color: '#1D4ED8',
          weight: 3,
          fillColor: '#60A5FA',
          fillOpacity: 0.9,
        }).bindPopup('Your current location').addTo(layerGroup)
      }

      if (points.length > 1) {
        instance.fitBounds(points, { padding: [24, 24], maxZoom: 11 })
      } else if (points.length === 1) {
        instance.setView(points[0]!, 11)
      } else {
        instance.setView([center.lat, center.lng], 7)
      }
    })
  }, [center, currentLocation, items, mapReady])

  return (
    <div className="nearby-map-wrap" aria-label="Map of equipment providers">
      {mapError ? (
        <div className="nearby-map-error" role="status">
          Map could not be loaded. Check your connection to OpenStreetMap.
        </div>
      ) : null}
      <div ref={mapElement} className="nearby-map" />
      <div className="nearby-map-attribution">Map data &copy; OpenStreetMap contributors</div>
    </div>
  )
}
