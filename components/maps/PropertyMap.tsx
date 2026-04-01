'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { formatPrice } from '@/lib/utils';
import type { Property } from '@/types';

interface PropertyMapProps {
  properties: Property[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onPropertyClick?: (property: Property) => void;
  height?: string;
  singleMarker?: boolean;
}

export default function PropertyMap({
  properties,
  center = { lat: 37.7749, lng: -122.4194 },
  zoom = 12,
  onPropertyClick,
  height = '400px',
  singleMarker = false,
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initMap = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !mapRef.current) {
      setError('Google Maps API key not configured');
      return;
    }

    try {
      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places', 'geometry'],
      });

      const google = await loader.load();
      
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          { featureType: 'water', stylers: [{ color: '#c4dfe6' }] },
          { featureType: 'landscape', stylers: [{ color: '#f5f5f5' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
          { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#999999' }] },
        ],
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        fullscreenControl: true,
      });

      mapInstanceRef.current = map;
      setLoaded(true);
    } catch (err) {
      setError('Failed to load Google Maps');
    }
  }, [center, zoom]);

  useEffect(() => {
    initMap();
  }, [initMap]);

  useEffect(() => {
    if (!mapInstanceRef.current || !loaded) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    properties.forEach((property) => {
      if (!property.latitude || !property.longitude) return;

      const position = { lat: property.latitude, lng: property.longitude };
      bounds.extend(position);

      const marker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current!,
        title: property.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: property.is_featured ? '#f59e0b' : '#3a876b',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 8,
        },
      });

      const infoContent = `
        <div style="padding: 8px; min-width: 200px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <h3 style="font-weight: 600; font-size: 14px; margin: 0 0 4px 0; color: #1e293b;">${property.title}</h3>
          <p style="font-size: 18px; font-weight: 700; color: #3a876b; margin: 0 0 4px 0;">${formatPrice(property.price)}${property.property_status === 'for_rent' ? '/mo' : ''}</p>
          <p style="font-size: 12px; color: #64748b; margin: 0;">${property.address}, ${property.city}</p>
          <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">${property.bedrooms} bd · ${property.bathrooms} ba · ${property.sqft.toLocaleString()} sqft</p>
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({ content: infoContent });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current!, marker);
        onPropertyClick?.(property);
      });

      markersRef.current.push(marker);
    });

    if (properties.length > 1 && !singleMarker) {
      mapInstanceRef.current.fitBounds(bounds, 60);
    } else if (properties.length === 1 && properties[0].latitude && properties[0].longitude) {
      mapInstanceRef.current.setCenter({
        lat: properties[0].latitude,
        lng: properties[0].longitude,
      });
      mapInstanceRef.current.setZoom(15);
    }
  }, [properties, loaded, onPropertyClick, singleMarker]);

  if (error) {
    return (
      <div
        className="bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-sm"
        style={{ height }}
      >
        <div className="text-center p-6">
          <p className="mb-1 font-medium">Map unavailable</p>
          <p className="text-xs text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200" style={{ height }}>
      <div ref={mapRef} className="map-container w-full h-full" />
      {!loaded && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
