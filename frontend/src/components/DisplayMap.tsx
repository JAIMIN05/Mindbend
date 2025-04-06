import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapLocation } from '@/services/map.service';
import { mapService } from '@/services/map.service';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Replace with your Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface DisplayMapProps {
  isOpen: boolean;
  onClose: () => void;
}

const DisplayMap: React.FC<DisplayMapProps> = ({
  isOpen,
  onClose,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState<MapLocation | null>(null);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const data = await mapService.getEmergencyLocations();
        setMapData(data);
      } catch (error) {
        console.error('Error fetching map data:', error);
        toast.error('Failed to load map data');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchMapData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!mapContainer.current || !isOpen || !mapData) return;

    // Initialize map centered on service provider
    const { coordinates } = mapData.serviceProvider.location;
    const [lng, lat] = coordinates;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 12
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());

    // Add service provider marker (green)
    const spEl = document.createElement('div');
    spEl.className = 'marker service-provider';
    spEl.style.backgroundColor = '#16a34a';
    spEl.style.width = '20px';
    spEl.style.height = '20px';
    spEl.style.borderRadius = '50%';
    spEl.style.border = '3px solid white';
    spEl.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';

    new mapboxgl.Marker(spEl)
      .setLngLat(coordinates)
      .setPopup(new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">Service Provider</h3>
            <p>${mapData.serviceProvider.name}</p>
          </div>
        `))
      .addTo(map.current);

    // Add markers for pending emergency requests (red)
    mapData.pendingRequests.forEach((request) => {
      if (request.latlon && request.latlon.coordinates) {
        const el = document.createElement('div');
        el.className = 'marker emergency';
        el.style.backgroundColor = '#dc2626';
        el.style.width = '15px';
        el.style.height = '15px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';

        new mapboxgl.Marker(el)
          .setLngLat(request.latlon.coordinates)
          .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">Emergency Request</h3>
                <p>User: ${request.user?.name || 'Unknown'}</p>
                <p>Contact: ${request.user?.mobile || 'N/A'}</p>
                <p>Status: ${request.status}</p>
              </div>
            `))
          .addTo(map.current!);
      }
    });

    // Add markers for accepted emergency requests (yellow)
    mapData.acceptedRequests.forEach((request) => {
      if (request.latlon && request.latlon.coordinates) {
        const el = document.createElement('div');
        el.className = 'marker accepted';
        el.style.backgroundColor = '#eab308';
        el.style.width = '15px';
        el.style.height = '15px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';

        new mapboxgl.Marker(el)
          .setLngLat(request.latlon.coordinates)
          .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">Accepted Emergency</h3>
                <p>User: ${request.user?.name || 'Unknown'}</p>
                <p>Contact: ${request.user?.mobile || 'N/A'}</p>
                <p>Status: ${request.status}</p>
              </div>
            `))
          .addTo(map.current!);
      }
    });

    // Fit bounds to include all markers
    const bounds = new mapboxgl.LngLatBounds();
    
    // Add service provider location to bounds
    bounds.extend(coordinates);
    
    // Add all emergency request locations to bounds
    [...mapData.pendingRequests, ...mapData.acceptedRequests].forEach(request => {
      if (request.latlon?.coordinates) {
        bounds.extend(request.latlon.coordinates);
      }
    });

    // Fit map to bounds with padding
    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15
    });

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [isOpen, mapData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden">
        <div className="flex flex-col h-full w-full">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Emergency Locations</DialogTitle>
          </DialogHeader>
          
          <div className="relative flex-1 w-full min-h-0">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div ref={mapContainer} className="absolute inset-0" />
                <div className="absolute bottom-6 right-6 flex gap-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-600 border-2 border-white shadow-sm" />
                    <span className="text-sm font-medium">Service Provider</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-600 border-2 border-white shadow-sm" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-white shadow-sm" />
                    <span className="text-sm font-medium">Accepted</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisplayMap;
