import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface ChefLocation {
  id: string;
  full_name: string;
  kitchen_name: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

interface AdminChefsMapProps {
  chefs: ChefLocation[];
  onChefClick?: (chefId: string) => void;
}

export default function AdminChefsMap({ chefs, onChefClick }: AdminChefsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  console.log('AdminChefsMap init', {
    token: !!import.meta.env.VITE_MAPBOX_TOKEN,
    chefsCount: chefs.length,
  });

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      console.error('Mapbox token is missing');
      return;
    }

    console.log('Skapar ny Mapbox-karta');
    mapboxgl.accessToken = token;

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [15, 62],
        zoom: 3.5,
      });

      mapRef.current = map;

      map.on('load', () => {
        console.log('Mapbox-karta laddad');
        map.resize();
      });

      map.on('error', (e) => {
        console.error('Mapbox error:', e);
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    } catch (error) {
      console.error('Failed to initialize Mapbox map:', error);
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    console.log('Uppdaterar markörer för', chefs.length, 'kockar');

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (chefs.length === 0) {
      console.log('Inga kockar att visa markörer för');
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();
    let validChefs = 0;

    chefs.forEach((chef) => {
      if (!chef.latitude || !chef.longitude) {
        console.log('Hoppar över kock utan koordinater:', chef.full_name);
        return;
      }

      const el = document.createElement('div');
      el.className = 'chef-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#2563eb';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      el.style.transition = 'transform 0.2s';

      const handleMouseEnter = () => {
        el.style.transform = 'scale(1.2)';
      };

      const handleMouseLeave = () => {
        el.style.transform = 'scale(1)';
      };

      const handleClick = () => {
        if (onChefClick) {
          onChefClick(chef.id);
        }
      };

      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
      el.addEventListener('click', handleClick);

      const popupContent = `
        <div style="font-family: system-ui, sans-serif;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: #000;">
            ${chef.full_name || 'Okänd kock'}
          </div>
          ${chef.kitchen_name ? `<div style="font-size: 13px; color: #666; margin-bottom: 4px;">${chef.kitchen_name}</div>` : ''}
          <div style="font-size: 12px; color: #888;">
            ${chef.city}${chef.country ? `, ${chef.country}` : ''}
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        maxWidth: '250px',
      }).setHTML(popupContent);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([chef.longitude, chef.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([chef.longitude, chef.latitude]);
      validChefs++;
    });

    console.log('Skapade', validChefs, 'markörer');

    if (validChefs > 0) {
      map.fitBounds(bounds, {
        padding: 80,
        maxZoom: 12,
        duration: 1000,
      });
    }
  }, [chefs, onChefClick]);

  if (!import.meta.env.VITE_MAPBOX_TOKEN) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-lg p-6 text-center">
        <p className="text-red-900 font-medium">Mapbox-token saknas</p>
        <p className="text-red-700 text-sm mt-2">
          Konfigurera VITE_MAPBOX_TOKEN i miljövariabler
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div
        ref={mapContainerRef}
        className="admin-chefs-map-container w-full rounded-lg border border-gray-300"
        style={{ height: '500px', width: '100%' }}
      />
      <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200 z-10 pointer-events-none">
        <p className="text-sm font-medium text-black">
          {chefs.length} {chefs.length === 1 ? 'kock' : 'kockar'} på kartan
        </p>
      </div>
    </div>
  );
}
