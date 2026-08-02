import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTranslation } from '../i18n/useTranslation';
import wardsData from '../data/wards.json';
import staticGeoJSON from '../data/ahmedabad_wards.json';
import cityMaskGeoJSON from '../data/ahmedabad_city_mask.json';

// Compute centroid of a polygon from its coordinate ring
const computeCentroid = (coords) => {
  let sumLat = 0, sumLng = 0, count = 0;
  const ring = coords[0]; // outer ring
  if (!ring) return null;
  for (const [lng, lat] of ring) {
    sumLng += lng;
    sumLat += lat;
    count++;
  }
  return count > 0 ? [sumLng / count, sumLat / count] : null;
};

export const MapView = ({ reports, onMapClick, onReportSelect }) => {
  const { t, lang } = useTranslation();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const circleMarkersRef = useRef([]);
  const individualPinsRef = useRef([]);
  const tempMarkerRef = useRef(null);

  // Attach global listener for popup detail button clicks
  useEffect(() => {
    const handleDetailClick = (e) => {
      const btn = e.target.closest('.view-report-detail-btn');
      if (btn) {
        const reportId = btn.getAttribute('data-report-id');
        const r = reports.find((item) => item.id === reportId);
        if (r && onReportSelect) onReportSelect(r);
      }
    };
    document.addEventListener('click', handleDetailClick);
    return () => document.removeEventListener('click', handleDetailClick);
  }, [reports, onReportSelect]);
  
  const [geoData, setGeoData] = useState(staticGeoJSON);
  const [zoom, setZoom] = useState(11.6);

  // Fetch dynamic geojson with cleanliness scores
  useEffect(() => {
    fetch('/api/wards/geojson')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.features) setGeoData(data);
      })
      .catch(() => {});
  }, []);

  // Initialize Maplibre GL Map
  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [72.5714, 23.0225],
      zoom: 11.6,
      minZoom: 10,
      maxZoom: 17
    });

    // Fit bounds to entire city initially based on the mask's inner boundary
    if (cityMaskGeoJSON && cityMaskGeoJSON.features.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      const cityRing = cityMaskGeoJSON.features[0].geometry.coordinates[1]; // The inner city boundary ring
      if (cityRing) {
        cityRing.forEach(coord => bounds.extend(coord));
        // Apply fitBounds immediately on initialization
        map.fitBounds(bounds, { padding: 40, maxZoom: 12.5, duration: 0 });
      }
    }

    // Add navigation controls on the bottom-right like NammaKasa
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

    mapRef.current = map;

    // Track map zoom changes dynamically
    map.on('zoom', () => {
      setZoom(map.getZoom());
    });

    map.on('load', () => {
      // Add ward boundaries source
      map.addSource('wards', {
        type: 'geojson',
        data: geoData
      });

      // Add city mask source for the inverted polygon outside the city
      map.addSource('city-mask', {
        type: 'geojson',
        data: cityMaskGeoJSON
      });

      // Add mask fill layer to grey out everything outside Ahmedabad
      map.addLayer({
        id: 'city-mask-fill',
        type: 'fill',
        source: 'city-mask',
        paint: {
          'fill-color': '#E5E7EB', // Tailwind gray-200
          'fill-opacity': 0.6
        }
      });

      // Add prominent city boundary outline
      map.addLayer({
        id: 'city-mask-outline',
        type: 'line',
        source: 'city-mask',
        paint: {
          'line-color': '#DC2626',
          'line-width': 2.5,
          'line-opacity': 0.7
        }
      });

      // NammaKasa-style: Light pink/red fill for ward areas
      map.addLayer({
        id: 'wards-fill',
        type: 'fill',
        source: 'wards',
        paint: {
          'fill-color': '#DC2626',
          'fill-opacity': 0.12
        }
      });

      // Red ward boundary outlines
      map.addLayer({
        id: 'wards-outline',
        type: 'line',
        source: 'wards',
        paint: {
          'line-color': '#DC2626',
          'line-width': 1.2,
          'line-opacity': 0.6
        }
      });

      // Highlight layer on hover
      map.addLayer({
        id: 'wards-highlight',
        type: 'line',
        source: 'wards',
        paint: {
          'line-color': '#DC2626',
          'line-width': 2.5,
          'line-opacity': 0.9
        },
        filter: ['==', ['get', 'id'], '']
      });

      // Hover tooltip for wards (NammaKasa style)
      let hoveredWardId = null;
      const tooltip = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'ward-tooltip-popup',
        anchor: 'bottom-left',
        offset: [12, -12]
      });

      map.on('mousemove', 'wards-fill', (e) => {
        // Hover tooltip is only active when zoomed out (showing wards)
        if (map.getZoom() < 13.5 && e.features.length > 0) {
          map.getCanvas().style.cursor = 'pointer';
          const feature = e.features[0];
          const newHoveredId = feature.properties.id;

          if (hoveredWardId !== newHoveredId) {
            hoveredWardId = newHoveredId;
            map.setFilter('wards-highlight', ['==', ['get', 'id'], hoveredWardId]);
          }

          const name = lang === 'gu'
            ? feature.properties.name_gu || feature.properties.name_en
            : feature.properties.name_en;
          const zone = lang === 'gu'
            ? feature.properties.zone_gu || feature.properties.zone_en
            : feature.properties.zone_en;
          const ward = wardsData.find((w) => w.id === newHoveredId);
          const corporator = ward
            ? (lang === 'gu' ? ward.corporator_gu : ward.corporator_en)
            : '';
          
          // Re-calculate report counts dynamically
          const totalReports = reports.filter((r) => r.ward_id === newHoveredId).length;
          const unresolvedReports = reports.filter((r) => r.ward_id === newHoveredId && r.status === 'unresolved').length;

          tooltip.setLngLat(e.lngLat)
            .setHTML(`
              <div class="nk-tooltip">
                <div class="nk-tooltip-name">${name}</div>
                <div class="nk-tooltip-zone">${zone} · ${t('corporator')}: ${corporator}</div>
                <div class="nk-tooltip-reports" style="color: #DC2626; font-weight: 700;">${unresolvedReports} ${t('unresolved_badge')} · ${totalReports} ${t('reports_count')}</div>
              </div>
            `)
            .addTo(map);
        } else {
          map.getCanvas().style.cursor = '';
          if (hoveredWardId) {
            hoveredWardId = null;
            map.setFilter('wards-highlight', ['==', ['get', 'id'], '']);
          }
          tooltip.remove();
        }
      });

      map.on('mouseleave', 'wards-fill', () => {
        map.getCanvas().style.cursor = '';
        if (hoveredWardId) {
          hoveredWardId = null;
          map.setFilter('wards-highlight', ['==', ['get', 'id'], '']);
        }
        tooltip.remove();
      });
    });

    // Map click selection handler for coordinate picker
    map.on('click', (e) => {
      if (onMapClick) {
        onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });

        if (tempMarkerRef.current) {
          tempMarkerRef.current.setLngLat(e.lngLat);
        } else {
          const el = document.createElement('div');
          el.style.cssText = 'width:20px;height:20px;border-radius:50%;background:rgba(99,102,241,0.4);border:2px dashed #6366F1;display:flex;align-items:center;justify-content:center;';
          const dot = document.createElement('div');
          dot.style.cssText = 'width:8px;height:8px;border-radius:50%;background:#6366F1;';
          el.appendChild(dot);
          tempMarkerRef.current = new maplibregl.Marker({ element: el })
            .setLngLat(e.lngLat)
            .addTo(map);
        }
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onMapClick]);

  // Update Ward boundaries source if data updates
  useEffect(() => {
    const map = mapRef.current;
    if (map && map.isStyleLoaded() && map.getSource('wards')) {
      map.getSource('wards').setData(geoData);
    }
  }, [geoData]);

  // Dynamically toggle ward fill opacity depending on zoom level
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    
    const adjustOpacity = () => {
      if (map.isStyleLoaded() && map.getLayer('wards-fill')) {
        if (zoom >= 13.5) {
          // Zooms in: transparent polygons to see streets clearly
          map.setPaintProperty('wards-fill', 'fill-opacity', 0.01);
        } else {
          // Zooms out: filled pinkish polygons showing macro layout
          map.setPaintProperty('wards-fill', 'fill-opacity', 0.12);
        }
      }
    };

    if (map.isStyleLoaded()) {
      adjustOpacity();
    } else {
      map.once('load', adjustOpacity);
    }
  }, [zoom]);

  // Render Markers Dynamically (Toggle between aggregated Ward Circles and individual complaint pins)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 1. Clear existing markers
    circleMarkersRef.current.forEach((m) => m.remove());
    circleMarkersRef.current = [];

    individualPinsRef.current.forEach((m) => m.remove());
    individualPinsRef.current = [];

    const getSeverityColor = (sev) => {
      if (sev === 'minor') return '#16A34A';
      if (sev === 'moderate') return '#D97706';
      if (sev === 'severe') return '#EA580C';
      return '#DC2626';
    };

    const getRelativeTime = (timestamp) => {
      const reportDate = new Date(timestamp);
      const now = new Date();
      const diffMs = now - reportDate;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours <= 0) {
          const diffMins = Math.floor(diffMs / (1000 * 60));
          return `${diffMins} ${t('minutes_ago')}`;
        }
        return `${diffHours} ${t('hours_ago')}`;
      }
      return `${diffDays} ${t('days_ago')}`;
    };

    // 2. Render conditionally based on zoom level
    if (zoom < 13.5) {
      // Zoom out: Render large aggregated circles at centroids
      const wardReportCounts = {};
      reports.forEach((r) => {
        wardReportCounts[r.ward_id] = (wardReportCounts[r.ward_id] || 0) + 1;
      });

      const features = geoData?.features || [];
      features.forEach((feature) => {
        const wardId = feature.properties?.id || feature.id;
        const count = wardReportCounts[wardId] || 0;
        if (count === 0) return;

        let centroid = null;
        if (feature.geometry.type === 'Polygon') {
          centroid = computeCentroid(feature.geometry.coordinates);
        } else if (feature.geometry.type === 'MultiPolygon') {
          centroid = computeCentroid(feature.geometry.coordinates[0]);
        }

        if (!centroid) {
          const ward = wardsData.find((w) => w.id === wardId);
          if (ward) centroid = [ward.lng, ward.lat];
        }
        if (!centroid) return;

        const baseSize = 46;
        const scale = Math.min(1 + Math.log10(Math.max(count, 1)) * 0.4, 1.8);
        const size = Math.round(baseSize * scale);
        const countText = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : `${count}`;

        const el = document.createElement('div');
        el.className = 'nk-ward-circle';
        el.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background-color: #7f1d1d;
          border: 2px solid #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-weight: 700;
          font-size: ${size > 50 ? 15 : 13}px;
          font-family: 'Inter', 'Google Sans Flex', sans-serif;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(127, 29, 29, 0.4);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          user-select: none;
          pointer-events: auto;
        `;
        el.textContent = countText;

        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.12)';
          el.style.boxShadow = '0 4px 16px rgba(127, 29, 29, 0.6)';
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
          el.style.boxShadow = '0 2px 8px rgba(127, 29, 29, 0.4)';
        });

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          // Zoom into the ward keeping the centroid centered accurately
          map.flyTo({
            center: centroid,
            zoom: 14.5,
            duration: 800,
            essential: true
          });
        });



        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(centroid)
          .addTo(map);

        circleMarkersRef.current.push(marker);
      });
    } else {
      // Zoom in: Render individual complaint pins at exact coordinates
      reports.forEach((report) => {
        const ward = wardsData.find((w) => w.id === report.ward_id);
        const wardName = ward ? (lang === 'en' ? ward.name_en : ward.name_gu) : '';
        const corporatorName = ward ? (lang === 'en' ? ward.corporator_en : ward.corporator_gu) : '';

        // Create individual report pin element (small dot colored by severity with white border)
        const el = document.createElement('div');
        el.className = 'glowing-map-marker';
        el.style.cssText = `
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background-color: ${getSeverityColor(report.severity)};
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 6px ${getSeverityColor(report.severity)}, 0 2px 6px rgba(0,0,0,0.15);
          cursor: pointer;
          transition: transform 0.15s ease;
        `;
        el.onmouseover = () => { el.style.transform = 'scale(1.25)'; };
        el.onmouseout = () => { el.style.transform = 'scale(1)'; };

        const popupHTML = `
          <div class="popup-content" style="padding: 12px; min-width: 220px; font-family: sans-serif;">
            <div class="popup-ward-info" style="display: flex; flex-direction: column; gap: 2px; margin-bottom: 8px;">
              <span class="popup-ward-name" style="font-weight: 700; font-size: 14px; color: var(--color-text-primary);">📍 ${wardName}</span>
              <span class="popup-corporator" style="font-size: 11px; color: var(--color-text-secondary);">${t('corporator')}: ${corporatorName}</span>
            </div>
            <p class="popup-desc" style="font-size: 13px; color: var(--color-text-secondary); margin: 0 0 8px 0; line-height: 1.45;">
              ${lang === 'en' ? report.description_en : report.description_gu}
            </p>
            <div class="popup-badges" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;">
              <span class="badge badge-${report.severity}" style="font-size: 10px; padding: 2px 8px; border-radius: 4px;">
                ${t(`filter_${report.severity}`)}
              </span>
              <span class="badge status-${report.status}" style="font-size: 10px; padding: 2px 8px; border-radius: 4px;">
                ${t(`${report.status}_badge`)}
              </span>
              <span class="popup-time" style="font-size: 11px; color: var(--color-text-muted);">
                ${getRelativeTime(report.reported_at)}
              </span>
            </div>
            <button
              class="view-report-detail-btn"
              data-report-id="${report.id}"
              style="width: 100%; background: var(--color-primary); color: white; border: none; padding: 6px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 700; cursor: pointer;"
            >
              View Full Details & Representative Info →
            </button>
          </div>
        `;

        const popup = new maplibregl.Popup({ offset: 8, className: 'maplibre-custom-popup' })
          .setHTML(popupHTML);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([report.lng, report.lat])
          .setPopup(popup)
          .addTo(map);

        individualPinsRef.current.push(marker);
      });
    }
  }, [reports, lang, geoData, zoom]);

  return (
    <div className="map-view-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Active/Total Reports Badge (NammaKasa style) */}
      <div className="nk-report-badge">
        <span className="nk-badge-active">{reports.filter(r => r.status === 'unresolved').length}</span>
        <span className="nk-badge-label"> Active</span>
        <span className="nk-badge-sep">·</span>
        <span className="nk-badge-total">{reports.length}</span>
        <span className="nk-badge-label"> {t('reports_count')}</span>
      </div>
    </div>
  );
};
export default MapView;
