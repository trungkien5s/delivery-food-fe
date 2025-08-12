import { useState, useMemo } from "react"
import { LoadScript, Autocomplete, GoogleMap, Marker } from "@react-google-maps/api"
import { MapPin } from "lucide-react"

const libraries = ["places"]

export function AddressPicker({ value, onChange }) {
  const [auto, setAuto] = useState(null)
  const [openMap, setOpenMap] = useState(false)
  const [typed, setTyped] = useState(value || "")
  const [marker, setMarker] = useState({ lat: 10.762622, lng: 106.660172 }) // HCM default

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY

  const onPlaceChanged = () => {
    if (!auto) return
    const place = auto.getPlace()
    const formatted = place?.formatted_address || place?.name || typed
    const loc = place?.geometry?.location
    const coords = loc ? { lat: loc.lat(), lng: loc.lng() } : null

    setTyped(formatted || "")
    onChange?.({
      address: formatted || "",
      location: coords, // {lat, lng}
      placeId: place?.place_id || null,
    })
    if (coords) setMarker(coords)
  }

  const geocodeLatLng = async (latLng) => {
    // Reverse geocoding bằng JS API
    const geocoder = new window.google.maps.Geocoder()
    return new Promise((resolve) => {
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === "OK" && results?.length) resolve(results[0].formatted_address)
        else resolve("")
      })
    })
  }

  const mapContainerStyle = useMemo(() => ({ width: "100%", height: 360 }), [])

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
      language="vi"
      region="VN"
    >
      <div className="flex gap-2">
        <Autocomplete
          onLoad={setAuto}
          onPlaceChanged={onPlaceChanged}
          options={{
            fields: ["formatted_address", "geometry", "name", "place_id"],
            componentRestrictions: { country: "vn" },
          }}
        >
          <input
            value={typed}
            onChange={(e) => {
              setTyped(e.target.value)
              onChange?.({ address: e.target.value, location: null, placeId: null })
            }}
            placeholder="Nhập địa chỉ giao hàng..."
            className="w-full rounded-xl px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none focus:border-transparent hover:border-green-300"
          />
        </Autocomplete>

        <button
          type="button"
          onClick={() => setOpenMap(true)}
          className="px-3 py-2 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50"
          title="Chọn trên bản đồ"
        >
          <MapPin className="w-5 h-5 text-green-600" />
        </button>
      </div>

      {openMap && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:w-[680px] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Chọn vị trí giao hàng</h3>
              <button
                onClick={() => setOpenMap(false)}
                className="text-sm px-3 py-1 rounded-lg border hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>

            <div className="p-4">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={marker}
                zoom={16}
                onClick={(e) => {
                  const lat = e.latLng?.lat()
                  const lng = e.latLng?.lng()
                  if (lat && lng) setMarker({ lat, lng })
                }}
                options={{ streetViewControl: false, mapTypeControl: false }}
              >
                <Marker
                  position={marker}
                  draggable
                  onDragEnd={(e) => {
                    const lat = e.latLng?.lat()
                    const lng = e.latLng?.lng()
                    if (lat && lng) setMarker({ lat, lng })
                  }}
                />
              </GoogleMap>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="px-4 py-2 rounded-xl border hover:bg-gray-50"
                  onClick={() => setOpenMap(false)}
                >
                  Huỷ
                </button>
                <button
                  className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
                  onClick={async () => {
                    const formatted = await geocodeLatLng(marker)
                    setTyped(formatted || "")
                    onChange?.({ address: formatted || "", location: marker, placeId: null })
                    setOpenMap(false)
                  }}
                >
                  Dùng địa chỉ này
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </LoadScript>
  )
}
