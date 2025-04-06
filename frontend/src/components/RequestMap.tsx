import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RequestLocation } from '@/services/request.service';
import { requestService } from '@/services/request.service';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Replace with your Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface RequestMapProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
}

const RequestMap: React.FC<RequestMapProps> = ({
  isOpen,
  onClose,
  requestId
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState<RequestLocation | null>(null);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        const data = await requestService.getRequestLocationMap(requestId);
        setMapData(data);
      } catch (error) {
        console.error('Error fetching request map data:', error);
        toast.error('Failed to load request map data');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && requestId) {
      fetchMapData();
    }
  }, [isOpen, requestId]);

  useEffect(() => {
    if (!mapContainer.current || !isOpen || !mapData) return;

    // Initialize map centered on request
    const { coordinates } = mapData.request.location;
    const [lng, lat] = coordinates;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 12
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());

    // Add request marker (blue)
    const requestEl = document.createElement('div');
    requestEl.className = 'marker request';
    requestEl.style.backgroundColor = '#2563eb';
    requestEl.style.width = '20px';
    requestEl.style.height = '20px';
    requestEl.style.borderRadius = '50%';
    requestEl.style.border = '3px solid white';
    requestEl.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';

    new mapboxgl.Marker(requestEl)
      .setLngLat(coordinates)
      .setPopup(new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">Request: ${mapData.request.title}</h3>
            <p>User: ${mapData.request.user.name}</p>
            <p>Status: ${mapData.request.status}</p>
            <p>Vehicle: ${mapData.request.vehicleInfo.type} - ${mapData.request.vehicleInfo.number || 'N/A'}</p>
          </div>
        `))
      .addTo(map.current);

    // Add service provider markers (green)
    mapData.serviceProviders.forEach((provider) => {
      if (provider.location && provider.location.coordinates) {
        const el = document.createElement('div');
        el.className = 'marker service-provider';
        el.style.backgroundColor = '#16a34a';
        el.style.width = '15px';
        el.style.height = '15px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';

        new mapboxgl.Marker(el)
          .setLngLat(provider.location.coordinates)
          .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">Service Provider</h3>
                <p>Name: ${provider.name}</p>
                <p>Type: ${provider.type}</p>
                <p>Contact: ${provider.contact?.mobile || 'N/A'}</p>
              </div>
            `))
          .addTo(map.current!);
      }
    });

    // Fit bounds to include all markers
    const bounds = new mapboxgl.LngLatBounds();
    
    // Add request location to bounds
    bounds.extend(coordinates);
    
    // Add all service provider locations to bounds
    mapData.serviceProviders.forEach(provider => {
      if (provider.location?.coordinates) {
        bounds.extend(provider.location.coordinates);
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
            <DialogTitle>Request Map</DialogTitle>
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
                    <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
                    <span className="text-sm font-medium">Request</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-600 border-2 border-white shadow-sm" />
                    <span className="text-sm font-medium">Service Provider</span>
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

export default RequestMap; 