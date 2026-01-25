import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface CustomerLocationMapProps {
  latitude: number;
  longitude: number;
  customerName?: string;
  customerLocation?: string;
}

// Fix for default marker icon
const customerIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to recenter map when coordinates change
const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
};

const CustomerLocationMap = ({ 
  latitude, 
  longitude, 
  customerName,
  customerLocation 
}: CustomerLocationMapProps) => {
  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border-2 border-primary/20">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={customerIcon}>
          <Popup>
            <div className="text-center p-1">
              {customerName && <p className="font-bold text-sm">{customerName}</p>}
              {customerLocation && <p className="text-xs text-muted-foreground">{customerLocation}</p>}
              <a 
                href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline block mt-1"
              >
                فتح في خرائط جوجل
              </a>
            </div>
          </Popup>
        </Marker>
        <RecenterMap lat={latitude} lng={longitude} />
      </MapContainer>
    </div>
  );
};

export default CustomerLocationMap;
