'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { formatPrice } from '@/lib/utils';
import { SAMPLE_PROPERTY_MARKERS } from '@/lib/mapSampleListings';
import type { Property } from '@/types';

/** Jamaica — default view when no listing coordinates. */
const JAMAICA_CENTER: [number, number] = [18.0179, -76.8099];
const JAMAICA_ZOOM = 13;

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** Minimal typing for Leaflet loaded from CDN (`window.L`). */
type LeafletModule = any;

interface PropertyMapProps {
  properties: Property[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onPropertyClick?: (property: Property) => void;
  height?: string;
  singleMarker?: boolean;
}

function escapeHtml(text: string | number | undefined | null): string {
  if (text == null) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

function waitForLeaflet(maxMs = 8000): Promise<LeafletModule> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (typeof window !== 'undefined' && (window as unknown as { L?: LeafletModule }).L) {
        resolve((window as unknown as { L: LeafletModule }).L);
        return;
      }
      if (Date.now() - start > maxMs) {
        reject(new Error('Leaflet did not load (check layout CDN scripts)'));
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
}

export default function PropertyMap({
  properties,
  center,
  zoom = 13,
  onPropertyClick,
  height = '500px',
  singleMarker = false,
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletModule | null>(null);
  const markersLayerRef = useRef<LeafletModule | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initMap = useCallback(async () => {
    if (!mapRef.current) return;
    try {
      const Leaflet = await waitForLeaflet();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }

      const startCenter: [number, number] =
        singleMarker && center ? [center.lat, center.lng] : JAMAICA_CENTER;
      const startZoom = singleMarker && center ? zoom : JAMAICA_ZOOM;

      const map = Leaflet.map(mapRef.current, {
        center: startCenter,
        zoom: startZoom,
        scrollWheelZoom: true,
        dragging: true,
        zoomControl: true,
        attributionControl: true,
      });

      Leaflet.tileLayer(OSM_TILE_URL, {
        maxZoom: 19,
        attribution: OSM_ATTRIBUTION,
      }).addTo(map);

      markersLayerRef.current = Leaflet.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      setLoaded(true);
      requestAnimationFrame(() => map.invalidateSize());
      setTimeout(() => map.invalidateSize(), 200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load map');
    }
  }, [center?.lat, center?.lng, singleMarker, zoom]);

  useEffect(() => {
    initMap();
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
      setLoaded(false);
    };
  }, [initMap]);

  useEffect(() => {
    if (!loaded || !mapInstanceRef.current || !markersLayerRef.current) return;
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    const Leaflet = (window as unknown as { L: LeafletModule }).L;
    if (!Leaflet) return;

    layer.clearLayers();

    const withCoords = properties.filter(
      (p) =>
        p.latitude != null &&
        p.longitude != null &&
        !Number.isNaN(p.latitude) &&
        !Number.isNaN(p.longitude)
    );

    if (withCoords.length > 0) {
      const corners: [number, number][] = withCoords.map((p) => [
        p.latitude as number,
        p.longitude as number,
      ]);

      for (const property of withCoords) {
        const lat = property.latitude as number;
        const lng = property.longitude as number;
        const ll: [number, number] = [lat, lng];

        const fill = property.is_featured ? '#f59e0b' : '#3a876b';
        const marker = Leaflet.circleMarker(ll, {
          radius: 8,
          color: '#ffffff',
          weight: 2,
          fillColor: fill,
          fillOpacity: 1,
        }).addTo(layer);

        const rent = property.property_status === 'for_rent' ? '/mo' : '';
        const html = `
          <div style="padding:10px;min-width:200px;font-family:var(--font-body),system-ui,sans-serif;background:#1a1a1a;border-radius:10px;border:1px solid rgba(74,222,128,0.25);">
            <h3 style="font-weight:600;font-size:14px;margin:0 0 4px 0;color:#f1f5f9;">${escapeHtml(property.title)}</h3>
            <p style="font-size:18px;font-weight:700;color:#4ade80;margin:0 0 4px 0;">${escapeHtml(formatPrice(property.price))}${rent}</p>
            <p style="font-size:12px;color:#94a3b8;margin:0;">${escapeHtml(property.address)}, ${escapeHtml(property.city)}</p>
            <p style="font-size:12px;color:#94a3b8;margin:4px 0 0 0;">${property.bedrooms} bd · ${property.bathrooms} ba · ${Number(property.sqft).toLocaleString()} sqft</p>
          </div>`;
        marker.bindPopup(html);
        marker.on('click', () => onPropertyClick?.(property));
      }

      if (corners.length > 1 && !singleMarker) {
        map.fitBounds(Leaflet.latLngBounds(corners), { padding: [48, 48], maxZoom: 16 });
      } else {
        const p = withCoords[0];
        map.setView([p.latitude as number, p.longitude as number], zoom);
      }
    } else {
      const corners: [number, number][] = SAMPLE_PROPERTY_MARKERS.map((m) => [m.latitude, m.longitude]);
      for (const row of SAMPLE_PROPERTY_MARKERS) {
        const ll: [number, number] = [row.latitude, row.longitude];
        const marker = Leaflet.marker(ll).addTo(layer);
        marker.bindPopup(`<strong>${escapeHtml(row.name)}</strong>`);
      }
      if (corners.length > 0) {
        map.fitBounds(Leaflet.latLngBounds(corners), { padding: [48, 48], maxZoom: 14 });
      } else {
        map.setView(JAMAICA_CENTER, JAMAICA_ZOOM);
      }
    }

    requestAnimationFrame(() => map.invalidateSize());
  }, [properties, loaded, onPropertyClick, singleMarker, zoom]);

  if (error) {
    return (
      <div
        className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-zinc-900/90 text-sm text-slate-400"
        style={{ minHeight: '500px', height }}
      >
        <div className="p-6 text-center">
          <p className="mb-1 font-medium text-slate-200">Map unavailable</p>
          <p className="text-xs text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 shadow-glass-elevate shadow-glow-tight ring-1 ring-brand-500/25 backdrop-blur-md"
      style={{ minHeight: '500px', height }}
    >
      <div ref={mapRef} className="map-container z-0 w-full h-full min-h-[500px]" />
      {!loaded && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
