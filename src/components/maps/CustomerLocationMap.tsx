import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomerLocationMapProps {
  latitude: number;
  longitude: number;
  customerName?: string;
  customerLocation?: string;
}

const CustomerLocationMap = ({ 
  latitude, 
  longitude, 
  customerName,
  customerLocation 
}: CustomerLocationMapProps) => {
  // Use OpenStreetMap embed instead of react-leaflet to avoid Context errors
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className="space-y-3">
      {/* Map Container */}
      <div className="h-64 w-full rounded-xl overflow-hidden border-2 border-primary/20 relative">
        <iframe
          src={mapUrl}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="موقع العميل"
        />
        
        {/* Overlay with customer info */}
        {(customerName || customerLocation) && (
          <div className="absolute bottom-2 right-2 left-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                {customerName && (
                  <p className="font-bold text-sm truncate">{customerName}</p>
                )}
                {customerLocation && (
                  <p className="text-xs text-muted-foreground truncate">{customerLocation}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => window.open(googleMapsUrl, '_blank')}
        >
          <Navigation className="w-4 h-4 ml-2" />
          فتح في خرائط جوجل
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`, '_blank')}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CustomerLocationMap;
