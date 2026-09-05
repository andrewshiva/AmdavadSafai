import amcBoundaries from '../data/ahmedabad_amc_boundary.json';
import pilotWardsGeoJSON from '../data/ahmedabad_wards.json';
import wardsData from '../data/wards.json';

/**
 * Ahmedabad Municipal Corporation (AMC) Bounding Box.
 * Points outside this bounding box are instantly rejected without polygon computation.
 */
export const AHMEDABAD_BBOX = {
  minLat: 22.8900,
  maxLat: 23.1600,
  minLng: 72.4300,
  maxLng: 72.7100
};

/**
 * Ray-casting algorithm for point containment in a GeoJSON linear ring.
 * @param {number} lng
 * @param {number} lat
 * @param {Array<[number, number]>} ring - Array of [lng, lat] pairs
 * @returns {boolean}
 */
export function pointInRing(lng, lat, ring) {
  let inside = false;
  const n = ring.length;
  if (n < 4) return false;
  let j = n - 1;
  for (let i = 0; i < n; i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    if ((yi > lat !== yj > lat) && (lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi)) {
      inside = !inside;
    }
    j = i;
  }
  return inside;
}

/**
 * Calculate Haversine distance in meters between two coordinates.
 */
export function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Fast-check whether a coordinate falls inside the bounding box of AMC.
 */
export function isWithinAhmedabadBBox(lat, lng) {
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (isNaN(numLat) || isNaN(numLng)) return false;
  return (
    numLat >= AHMEDABAD_BBOX.minLat &&
    numLat <= AHMEDABAD_BBOX.maxLat &&
    numLng >= AHMEDABAD_BBOX.minLng &&
    numLng <= AHMEDABAD_BBOX.maxLng
  );
}

/**
 * Comprehensive municipal boundary check for Ahmedabad.
 * Point must fall within either:
 * 1. Pilot ward polygons (including newly merged AMC areas like Bopal)
 * 2. Official 48 AMC ward boundaries (DataMeet municipal snapshot)
 *
 * @param {number|string} lat
 * @param {number|string} lng
 * @returns {boolean}
 */
export function isWithinAhmedabad(lat, lng) {
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (isNaN(numLat) || isNaN(numLng)) return false;

  // 1. Fast bounding box rejection
  if (!isWithinAhmedabadBBox(numLat, numLng)) {
    return false;
  }

  // 2. Check pilot ward polygons (e.g. Bopal, Satellite, Navrangpura)
  if (pilotWardsGeoJSON && Array.isArray(pilotWardsGeoJSON.features)) {
    for (const feature of pilotWardsGeoJSON.features) {
      const coords = feature.geometry?.coordinates;
      if (coords && coords.length > 0) {
        if (pointInRing(numLng, numLat, coords[0])) {
          return true;
        }
      }
    }
  }

  // 3. Check official 48 AMC ward boundary polygons
  if (Array.isArray(amcBoundaries)) {
    for (const ward of amcBoundaries) {
      if (Array.isArray(ward.coordinates)) {
        for (const ring of ward.coordinates) {
          if (pointInRing(numLng, numLat, ring)) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

/**
 * Find the closest pilot ward from coordinates and calculate distance in meters.
 * @param {number|string} lat
 * @param {number|string} lng
 * @returns {{ ward: object, distance_m: number }}
 */
export function getNearestWard(lat, lng) {
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (isNaN(numLat) || isNaN(numLng) || !wardsData || wardsData.length === 0) {
    return { ward: wardsData[0], distance_m: 0 };
  }

  let nearest = wardsData[0];
  let minDistance = Infinity;

  for (const ward of wardsData) {
    if (typeof ward.lat === 'number' && typeof ward.lng === 'number') {
      const dist = haversineDistanceMeters(numLat, numLng, ward.lat, ward.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = ward;
      }
    }
  }

  return { ward: nearest, distance_m: Math.round(minDistance) };
}

/**
 * Validates coordinates against the municipal boundary and returns a localized error message if invalid.
 * @param {number|string} lat
 * @param {number|string} lng
 * @param {string} lang - 'en' | 'gu' | 'hi'
 * @returns {{ valid: boolean, error: string | null, ward: object, distance_m: number }}
 */
export function validateAhmedabadCoords(lat, lng, lang = 'en') {
  const numLat = Number(lat);
  const numLng = Number(lng);

  if (isNaN(numLat) || isNaN(numLng)) {
    const errorMsg =
      lang === 'gu'
        ? 'અમાન્ય અક્ષાંશ/રેખાંશ કોઓર્ડિનેટ્સ.'
        : lang === 'hi'
        ? 'अमान्य अक्षांश/देशांतर निर्देशांक।'
        : 'Invalid latitude/longitude coordinates.';
    return { valid: false, error: errorMsg, ward: wardsData[0], distance_m: 0 };
  }

  const { ward, distance_m } = getNearestWard(numLat, numLng);
  const inside = isWithinAhmedabad(numLat, numLng);

  if (!inside) {
    const distKm = (distance_m / 1000).toFixed(1);
    const errorMsg =
      lang === 'gu'
        ? `આ સ્થાન (${numLat.toFixed(4)}, ${numLng.toFixed(4)}) અમદાવાદ મ્યુનિસિપલ હદની બહાર છે (${distKm} કિમી દૂર). ફક્ત AMC હદમાં ફરિયાદો સ્વીકારાય છે.`
        : lang === 'hi'
        ? `यह स्थान (${numLat.toFixed(4)}, ${numLng.toFixed(4)}) अहमदाबाद नगर निगम सीमा के बाहर है (${distKm} किमी दूर)। केवल AMC सीमा के भीतर शिकायतें स्वीकार की जाती हैं।`
        : `Location (${numLat.toFixed(4)}, ${numLng.toFixed(4)}) is outside Ahmedabad municipal jurisdiction area (${distKm} km away). Reports are accepted within AMC limits only.`;

    return { valid: false, error: errorMsg, ward, distance_m };
  }

  return { valid: true, error: null, ward, distance_m };
}

/**
 * Purges any invalid out-of-city reports that may have been previously stored in localStorage.
 * Ensures data cleanliness across dashboard and report feeds.
 */
export function cleanseStoredReports() {
  try {
    const raw = localStorage.getItem('amdavad_safai_local_reports');
    if (!raw) return 0;
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return 0;

    const filtered = list.filter((r) => {
      if (!r || typeof r.lat !== 'number' || typeof r.lng !== 'number') return false;
      return isWithinAhmedabad(r.lat, r.lng);
    });

    const removedCount = list.length - filtered.length;
    if (removedCount > 0) {
      localStorage.setItem('amdavad_safai_local_reports', JSON.stringify(filtered));
      console.info(`[Geofence] Purged ${removedCount} out-of-bounds reports from localStorage.`);
    }
    return removedCount;
  } catch {
    return 0;
  }
}
