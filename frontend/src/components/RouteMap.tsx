import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from 'lucide-react';
import { EmergencyRequest } from '@/types';
import { mapService } from '@/services/map.service';

// Replace with your Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface RouteMapProps {
  isOpen: boolean;
  onClose: () => void;
  emergency: EmergencyRequest;
}

const RouteMap: React.FC<RouteMapProps> = ({
  isOpen,
  onClose,
  emergency,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [serviceProviderLocation, setServiceProviderLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    const fetchServiceProviderLocation = async () => {
      try {
        const data = await mapService.getEmergencyLocations();
        setServiceProviderLocation(data.serviceProvider.location.coordinates);
      } catch (error) {
        console.error('Error fetching service provider location:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchServiceProviderLocation();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!mapContainer.current || !isOpen || !serviceProviderLocation || !emergency.latlon?.coordinates) return;

    const spCoords = serviceProviderLocation;
    const emergencyCoords = emergency.latlon.coordinates;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: spCoords,
      zoom: 12
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());

    map.current.on('load', async () => {
      // Get the route using Mapbox Directions API
      try {
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${spCoords[0]},${spCoords[1]};${emergencyCoords[0]},${emergencyCoords[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();

        const route = data.routes[0].geometry;

        // Add route layer
        map.current?.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route
            }
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 4,
            'line-opacity': 0.75
          }
        });

        // Add service provider marker
        const spEl = document.createElement('div');
        spEl.className = 'marker service-provider';
        spEl.style.backgroundColor = '#16a34a';
        spEl.style.width = '20px';
        spEl.style.height = '20px';
        spEl.style.borderRadius = '50%';
        spEl.style.border = '3px solid white';
        spEl.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';

        new mapboxgl.Marker(spEl)
          .setLngLat(spCoords)
          .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">Your Location</h3>
              </div>
            `))
          .addTo(map.current);

        // Add emergency location marker
        const emergencyEl = document.createElement('div');
        emergencyEl.className = 'marker emergency';
        emergencyEl.style.backgroundColor = '#eab308';
        emergencyEl.style.width = '15px';
        emergencyEl.style.height = '15px';
        emergencyEl.style.borderRadius = '50%';
        emergencyEl.style.border = '2px solid white';
        emergencyEl.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';

        new mapboxgl.Marker(emergencyEl)
          .setLngLat(emergencyCoords)
          .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">Emergency Location</h3>
                <p class="text-sm">User: ${emergency.user?.name || 'Unknown'}</p>
                <p class="text-sm">Contact: ${emergency.user?.mobile || 'N/A'}</p>
              </div>
            `))
          .addTo(map.current);

        // Fit bounds to include both points
        const bounds = new mapboxgl.LngLatBounds()
          .extend(spCoords)
          .extend(emergencyCoords);

        map.current.fitBounds(bounds, {
          padding: 100,
          maxZoom: 15
        });
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    });

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [isOpen, serviceProviderLocation, emergency]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden">
        <div className="flex flex-col h-full w-full">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Route to Emergency Location</DialogTitle>
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
                    <span className="text-sm font-medium">Your Location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-white shadow-sm" />
                    <span className="text-sm font-medium">Emergency Location</span>
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

export default RouteMap; 