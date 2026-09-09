import { useMemo } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  Tooltip,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ---------------------------------------------------------------------------
// Fix Leaflet's default marker icon paths (they break under bundlers like
// Vite because the images are resolved relative to the CSS). We point them at
// the official CDN assets instead.
// ---------------------------------------------------------------------------
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Default map centre — Nepal (the soil API only covers Nepal).
const NEPAL_CENTER = [28.3949, 84.124]
const DEFAULT_ZOOM = 7

/** Invisible child that captures map clicks and reports the coordinate. */
function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

/**
 * Interactive Leaflet map.
 *
 * @param {{lat:number,lng:number}|null} props.selected  clicked coordinate
 * @param {object|null} props.data        location intelligence for the popup
 * @param {Array}  props.layers           available map layers
 * @param {Set}    props.activeLayers     enabled layer ids
 * @param {Function} props.onSelect       called with { lat, lng } on click
 */
export default function MapView({ selected, data, layers, activeLayers, onSelect }) {
  // Only render layers that are toggled on.
  const visibleLayers = useMemo(
    () => layers.filter((l) => activeLayers.has(l.id)),
    [layers, activeLayers]
  )

  return (
    <MapContainer
      center={NEPAL_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickHandler onSelect={onSelect} />

      {/* Mocked overlay hotspots for each active layer */}
      {visibleLayers.map((layer) =>
        layer.points.map((p, i) => (
          <CircleMarker
            key={`${layer.id}-${i}`}
            center={[p.lat, p.lng]}
            radius={12}
            pathOptions={{
              color: layer.color,
              fillColor: layer.color,
              fillOpacity: 0.35,
              weight: 1.5,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <span className="font-semibold">{layer.label}:</span> {p.value}
              {layer.unit}
            </Tooltip>
          </CircleMarker>
        ))
      )}

      {/* User-selected location marker + rich popup */}
      {selected && (
        <Marker position={[selected.lat, selected.lng]} icon={markerIcon}>
          <Popup>
            <div className="min-w-[190px] space-y-1 text-sm">
              <div className="mb-1 text-base font-bold text-emerald-600">
                {data?.location ?? 'Selected Location'}
              </div>
              <PopupRow label="Latitude" value={selected.lat.toFixed(4)} />
              <PopupRow label="Longitude" value={selected.lng.toFixed(4)} />
              {data && (
                <>
                  <hr className="my-1 border-slate-200" />
                  <PopupRow label="Temperature" value={`${data.weather.temperature}°C`} />
                  <PopupRow label="Humidity" value={`${data.weather.humidity}%`} />
                  <PopupRow label="Rainfall" value={`${data.weather.rainfall} mm`} />
                  <PopupRow label="Soil" value={data.soil.type} />
                  <PopupRow label="Recommended Crop" value={data.crop.name} />
                  <PopupRow label="Disease Risk" value={data.diseaseRisk.level} />
                </>
              )}
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  )
}

/** One key/value line inside the popup. */
function PopupRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  )
}
