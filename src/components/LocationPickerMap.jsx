import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { validateAhmedabadCoords } from '../utils/geofence';

export const LocationPickerMap = ({
  lat,
  lng,
  onChange,
  lang = 'en',
  height = '230px'
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const isInternalUpdate = useRef(false);
  const onChangeRef = useRef(onChange);
  const langRef = useRef(lang);

  useEffect(() => {
    onChangeRef.current = onChange;
    langRef.current = lang;
  }, [onChange, lang]);

  const numLat = parseFloat(lat) || 23.0225;
  const numLng = parseFloat(lng) || 72.5714;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [numLng, numLat],
      zoom: 13,
      minZoom: 10,
      maxZoom: 18,
      maxBounds: [
        [72.25, 22.80],
        [72.85, 23.25]
      ],
      attributionControl: false,
      dragRotate: false,
      touchPitch: false
    });

    // Custom draggable pin element
    const pinEl = document.createElement('div');
    pinEl.className = 'location-picker-pin';
    pinEl.innerHTML = `
      <div style="
        width: 32px;
        height: 38px;
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(0, -19px);
        cursor: grab;
      ">
        <svg width="32" height="38" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#FF5722" stroke="#FFFFFF" stroke-width="1.8"/>
          <circle cx="12" cy="9" r="2.8" fill="#FFFFFF"/>
        </svg>
      </div>
    `;

    const marker = new maplibregl.Marker({
      element: pinEl,
      draggable: true
    })
      .setLngLat([numLng, numLat])
      .addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLngLat();
      const nextLat = pos.lat.toFixed(5);
      const nextLng = pos.lng.toFixed(5);
      isInternalUpdate.current = true;
      if (onChange) {
        const val = validateAhmedabadCoords(pos.lat, pos.lng, lang);
        onChange({ lat: nextLat, lng: nextLng, ward: val.ward, valid: val.valid, error: val.error });
      }
    });

    // Click anywhere on map to reposition pin
    map.on('click', (e) => {
      const nextLat = e.lngLat.lat.toFixed(5);
      const nextLng = e.lngLat.lng.toFixed(5);
      marker.setLngLat(e.lngLat);
      isInternalUpdate.current = true;
      if (onChange) {
        const val = validateAhmedabadCoords(e.lngLat.lat, e.lngLat.lng, lang);
        onChange({ lat: nextLat, lng: nextLng, ward: val.ward, valid: val.valid, error: val.error });
      }
    });

    mapRef.current = map;
    markerRef.current = marker;

    // Trigger map resize after initial render
    const timer = setTimeout(() => {
      if (map) map.resize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Sync external coordinate changes (typing in inputs, ward select, GPS)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    if (!isNaN(numLat) && !isNaN(numLng)) {
      marker.setLngLat([numLng, numLat]);
      map.flyTo({
        center: [numLng, numLat],
        zoom: Math.max(map.getZoom(), 13),
        duration: 500
      });
    }
  }, [numLat, numLng]);

  return (
    <div className="location-picker-wrapper" style={{ position: 'relative', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1.5px solid #E2E8F0', marginTop: '10px' }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height,
          background: '#E2E8F0'
        }}
      />
      {/* Floating Guidance Pill */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.85)',
          color: '#FFFFFF',
          padding: '5px 12px',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.3px',
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          whiteSpace: 'nowrap',
          zIndex: 10
        }}
      >
        <span>📍</span>
        <span>
          {lang === 'gu'
            ? 'નકશા પર ક્લિક કરો અથવા પિન ખસેડો'
            : lang === 'hi'
            ? 'मानचित्र पर टैप करें या पिन खींचें'
            : 'Tap map or drag pin to select spot'}
        </span>
      </div>
    </div>
  );
};

export default LocationPickerMap;
