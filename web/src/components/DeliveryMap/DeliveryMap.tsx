import { useEffect, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from 'react-leaflet'
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

export interface AddressDetails {
  street: string
  area: string
  city: string
  state: string
  fullAddress: string
}

export const EMPTY_ADDRESS: AddressDetails = {
  street: '',
  area: '',
  city: '',
  state: '',
  fullAddress: '',
}

// Free reverse geocoding (OpenStreetMap Nominatim, no key needed)
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<AddressDetails> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    const addr = data.address || {}
    return {
      street: addr.road || addr.pedestrian || addr.footway || addr.path || '',
      area:
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.village ||
        addr.hamlet ||
        '',
      city: addr.city || addr.town || addr.county || '',
      state: addr.state || addr.region || '',
      fullAddress: data.display_name || '',
    }
  } catch (error) {
    console.error('Reverse geocoding failed:', error)
    return { ...EMPTY_ADDRESS }
  }
}

interface Props {
  latitude: number
  longitude: number
  onLocationChange?: (
    lat: number,
    lng: number,
    address: AddressDetails
  ) => void
  interactive?: boolean
}

const LocationMarker = ({
  onLocationChange,
  interactive,
}: {
  onLocationChange?: Props['onLocationChange']
  interactive?: boolean
}) => {
  const map = useMap()
  const requestId = useRef(0)

  useMapEvents({
    async click(e) {
      if (!interactive || !onLocationChange) return
      const { lat, lng } = e.latlng
      const myRequest = ++requestId.current
      map.flyTo([lat, lng], Math.max(map.getZoom(), 16), { duration: 0.5 })
      const address = await reverseGeocode(lat, lng)
      // Ignore stale responses if the user tapped again
      if (myRequest === requestId.current) {
        onLocationChange(lat, lng, address)
      }
    },
  })
  return null
}

// Recenters the map when GPS / button updates the coordinates
const MapUpdater = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], map.getZoom())
  }, [lat, lng, map])
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
        <MapUpdater lat={latitude} lng={longitude} />
        <LocationMarker
          onLocationChange={onLocationChange}
          interactive={interactive}
        />
      </MapContainer>
    </div>
  )
}

export default DeliveryMap
