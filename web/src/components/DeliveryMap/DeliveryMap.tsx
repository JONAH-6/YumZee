import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix missing default marker icons when bundled
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
  ._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface Props {
  latitude: number
  longitude: number
  onLocationChange?: (lat: number, lng: number) => void
  interactive?: boolean
}

const LocationMarker = ({
  onLocationChange,
  interactive,
}: {
  onLocationChange?: (lat: number, lng: number) => void
  interactive?: boolean
}) => {
  useMapEvents({
    click(e) {
      if (interactive && onLocationChange) {
        onLocationChange(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

const DeliveryMap = ({
  latitude,
  longitude,
  onLocationChange,
  interactive = false,
}: Props) => {
  return (
    <div className="h-[220px] w-full overflow-hidden rounded-xl border border-[#E9E5EE]">
      <MapContainer
        center={[latitude, longitude]}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} />
        <LocationMarker
          onLocationChange={onLocationChange}
          interactive={interactive}
        />
      </MapContainer>
    </div>
  )
}

export default DeliveryMap
