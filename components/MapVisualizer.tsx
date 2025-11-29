
import React, { useEffect, useRef, useState } from 'react';
import { MealRequest, MealOffer, UserRole } from '../types';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    L: any;
  }
}

interface Props {
  items: (MealRequest | MealOffer)[];
  center: [number, number]; 
  radius: number;
  userRole: UserRole | 'GUEST';
  onSelect: (item: MealRequest | MealOffer) => void;
  onVisibleItemsChange?: (items: (MealRequest | MealOffer)[]) => void;
  isDarkMode?: boolean;
}

const MapVisualizer: React.FC<Props> = ({ items, center, userRole, onSelect, onVisibleItemsChange, isDarkMode = false }) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const tileLayerRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  
  // Use refs to store latest props/state to avoid stale closures in Leaflet event listeners
  const itemsRef = useRef(items);
  const onVisibleItemsChangeRef = useRef(onVisibleItemsChange);

  // Sync refs
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    onVisibleItemsChangeRef.current = onVisibleItemsChange;
  }, [onVisibleItemsChange]);

  useEffect(() => {
    // Poll for Leaflet availability
    const checkLeaflet = setInterval(() => {
      if (window.L && mapContainerRef.current) {
        clearInterval(checkLeaflet);
        initializeMap();
      }
    }, 100);

    return () => clearInterval(checkLeaflet);
  }, []);

  // Update tiles when dark mode changes
  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    
    if (tileLayerRef.current) {
        tileLayerRef.current.remove();
    }

    const tileUrl = isDarkMode 
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    tileLayerRef.current = window.L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(mapRef.current);

  }, [isDarkMode, isMapReady]);

  const initializeMap = () => {
    if (mapRef.current || !window.L || !mapContainerRef.current) return;

    // Initialize map with performance options
    mapRef.current = window.L.map(mapContainerRef.current, {
        preferCanvas: true,
        zoomControl: true,
        scrollWheelZoom: true
    }).setView(center, 13);

    // Force map to recalculate size to ensure bounds are correct
    // This fixes issues where the map thinks it has 0 height initially
    setTimeout(() => {
        if(mapRef.current) {
            mapRef.current.invalidateSize();
            // Trigger an initial bounds check after resize
            updateVisibleItems(); 
        }
    }, 200);

    // Update visible items on move (pan/zoom)
    mapRef.current.on('moveend', () => {
      updateVisibleItems();
    });

    setIsMapReady(true);
    // Initial marker render is handled by the useEffect below
  };

  // Effect to update map view when center changes
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    mapRef.current.flyTo(center, 13, { duration: 1.5 });
  }, [center, isMapReady]);

  // Effect to update markers when items change
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    updateMarkers();
  }, [items, isMapReady]);

  const updateMarkers = () => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add Markers
    // Use items prop directly for rendering markers as this runs in the useEffect[items]
    items.forEach(item => {
      if (item.latitude && item.longitude) {
        const isRequest = 'seekerId' in item;
        const color = isRequest ? '#ea580c' : '#10b981'; // Orange / Emerald
        
        // Lightweight custom icon
        const icon = window.L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const marker = window.L.marker([item.latitude, item.longitude], { icon })
          .addTo(mapRef.current)
          .bindPopup(`
            <div style="font-family: sans-serif; min-width: 160px; padding: 4px;">
                <strong style="color: ${color}; display: block; margin-bottom: 4px;">${isRequest ? 'Request' : 'Offer'}</strong>
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #334155;">${item.description.substring(0, 60)}...</p>
                <button id="btn-${item.id}" style="background: ${color}; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold; width: 100%;">View Details</button>
            </div>
          `);
        
        marker.on('popupopen', () => {
            const btn = document.getElementById(`btn-${item.id}`);
            if (btn) {
                btn.onclick = () => onSelect(item);
            }
        });

        markersRef.current.push(marker);
      }
    });
    
    // Trigger visibility check immediately after updating markers
    // We pass the current items prop explicitly to ensure sync
    updateVisibleItems(items);
  };

  const updateVisibleItems = (currentItems?: (MealRequest | MealOffer)[]) => {
      if (!onVisibleItemsChangeRef.current || !mapRef.current) return;
      
      const bounds = mapRef.current.getBounds();
      // Use passed items OR ref (ref is safe fallback for event listeners)
      const itemsToCheck = currentItems || itemsRef.current;
      
      const visible = itemsToCheck.filter(item => {
          if (item.latitude && item.longitude) {
              return bounds.contains([item.latitude, item.longitude]);
          }
          return false;
      });
      
      onVisibleItemsChangeRef.current(visible);
  };

  return (
    <div className="relative w-full h-[500px] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner z-0">
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900 z-10">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Loading Map...</p>
            </div>
        </div>
      )}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />
      <style>{`
        .leaflet-popup-content-wrapper { border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 0; }
        .leaflet-popup-content { margin: 12px; }
        .leaflet-container { font-family: inherit; }
      `}</style>
    </div>
  );
};

export default MapVisualizer;
