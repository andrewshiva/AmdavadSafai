import json
import math
import os
from sqlalchemy.orm import Session
import models

# Real AMC ward polygons (DataMeet Municipal_Spatial_Data, CC BY 4.0).
# Pilot wards without an official match keep the synthetic fallback below.
REAL_WARDS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "amd_wards.geojson")

# Normalised pilot-name -> official feature Name for transliteration mismatches
# (each alias verified: pilot centre falls inside the official polygon)
NAME_ALIASES = {
    "SHAHIBAUG": "16 SHAHIBAG",
    "GHATLODIYA": "07 GHATLODIA",
    "CHANDLODIYA": "02 CHANDLODIA",
    "VADAJ": "06 NEW WADAJ",
}


def _norm(name: str) -> str:
    return "".join(c for c in (name or "").upper() if c.isalpha())


_real_index = None


def _load_real_index():
    global _real_index
    if _real_index is not None:
        return _real_index
    _real_index = {}
    try:
        with open(REAL_WARDS_PATH, encoding="utf-8") as f:
            data = json.load(f)
        for feature in data.get("features", []):
            name = ((feature.get("properties") or {}).get("Name") or "").strip()
            if name and feature.get("geometry"):
                _real_index[_norm(name)] = feature["geometry"]
                _real_index[name.strip().upper()] = feature["geometry"]
    except Exception as err:
        print(f"[GeoJSON] Notice: real ward polygons unavailable ({err}). Using synthetic fallback.")
    return _real_index


def match_real_polygon(ward_name_en: str):
    """Return (geometry, official_name) for a pilot ward, or (None, None)."""
    index = _load_real_index()
    if not index:
        return None, None
    key = _norm(ward_name_en)
    if key in index:
        return index[key], ward_name_en
    alias = NAME_ALIASES.get(key)
    if alias and (alias in index or _norm(alias) in index):
        return index.get(alias) or index.get(_norm(alias)), alias
    return None, None


def point_in_ring(lng: float, lat: float, ring) -> bool:
    """Ray-casting containment for a GeoJSON linear ring. Ring: [[lng, lat], ...]."""
    inside = False
    n = len(ring)
    if n < 4:
        return False
    j = n - 1
    for i in range(n):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if ((yi > lat) != (yj > lat)) and (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


def locate_point(lat: float, lng: float, wards, ward_index_of):
    """Municipal-boundary check. Returns (ward_id | None).

    Accepts points inside any ward polygon — real DataMeet geometry where
    matched, else the same synthetic octagon served to the map — so the
    geofence follows the drawn boundaries instead of ward-centre distance.
    """
    for w in wards:
        geom, _ = match_real_polygon(w.name_en)
        if geom is not None:
            rings = geom["coordinates"]
        else:
            rings = generate_polygon_for_center(w.lat, w.lng, ward_index_of(w.id))
        outer = rings[0] if rings else []
        if outer and point_in_ring(lng, lat, outer):
            return w.id
    return None


def inside_official_limits(lat: float, lng: float) -> bool:
    """True when the point falls inside ANY of the 48 official AMC ward
    polygons (DataMeet snapshot) — the municipal boundary as a union.

    Pilot labels without a 1:1 official polygon (Satellite, Bopal, Vastrapur,
    Kalupur, Ambawadi, Sola) must NOT borrow a neighbour's shape for display,
    but points inside official limits are still Ahmedabad and pass the gate.
    Bopal predates the snapshot's AMC limits and is covered by its pilot
    octagon via locate_point instead.
    """
    for feature in _load_real_features():
        geom = feature.get("geometry") or {}
        rings = geom.get("coordinates") or []
        outer = rings[0] if rings else []
        if outer and point_in_ring(lng, lat, outer):
            return True
    return False


def _load_real_features():
    try:
        with open(REAL_WARDS_PATH, encoding="utf-8") as f:
            return json.load(f).get("features", [])
    except Exception:
        return []


# Synthetic fallback: realistic polygon around ward lat/lng centers
def generate_polygon_for_center(lat: float, lng: float, ward_index: int):
    # Radius in degrees (~1.2 km radius, slightly varied for realism based on index)
    radius_deg = 0.012 + (ward_index % 3) * 0.002
    points = []
    # Create an 8-point irregular octagon/polygon around the center
    num_points = 8
    for i in range(num_points):
        angle = (2 * math.pi / num_points) * i
        # Add slight pseudo-random variation based on ward index and vertex angle
        variation = 1.0 + 0.2 * math.sin(ward_index * 1.7 + i * 2.3)
        r = radius_deg * variation
        # Adjust lng for cosine of latitude
        d_lat = r * math.cos(angle)
        d_lng = (r * math.sin(angle)) / math.cos(math.radians(lat))
        points.append([round(lng + d_lng, 5), round(lat + d_lat, 5)])

    # Close the polygon by repeating first point
    if points:
        points.append(points[0])
    return [points]

def calculate_cleanliness_metrics(db: Session, ward_id: str):
    reports = db.query(models.Report).filter(models.Report.ward_id == ward_id).all()
    total_count = len(reports)
    unresolved_count = 0
    resolved_count = 0
    penalty = 0.0

    for r in reports:
        if r.status == "unresolved":
            unresolved_count += 1
            if r.severity == "minor":
                penalty += 3.0
            elif r.severity == "moderate":
                penalty += 6.0
            elif r.severity == "severe":
                penalty += 10.0
            elif r.severity == "critical":
                penalty += 15.0
        else:
            resolved_count += 1
            penalty += 0.5  # Slight penalty for historical occurrence

    # Base score 100
    score = max(0.0, min(100.0, 100.0 - penalty))
    score = round(score, 1)

    # Grade and status
    if score >= 90:
        grade = "A+"
        status = "Excellent"
    elif score >= 80:
        grade = "A"
        status = "Good"
    elif score >= 65:
        grade = "B"
        status = "Moderate"
    elif score >= 50:
        grade = "C"
        status = "Attention Needed"
    else:
        grade = "D"
        status = "Critical Alert"

    return {
        "total_reports": total_count,
        "unresolved_reports": unresolved_count,
        "resolved_reports": resolved_count,
        "cleanliness_score": score,
        "cleanliness_grade": grade,
        "cleanliness_status": status
    }

def get_wards_geojson(db: Session):
    wards = db.query(models.Ward).all()
    features = []

    for idx, ward in enumerate(wards):
        metrics = calculate_cleanliness_metrics(db, ward.id)
        real_geom, official_name = match_real_polygon(ward.name_en)
        if real_geom is not None:
            coordinates = real_geom["coordinates"]
            boundary_source = "datameet"
        else:
            coordinates = generate_polygon_for_center(ward.lat, ward.lng, idx)
            boundary_source = "synthetic"
            official_name = ""

        feature = {
            "type": "Feature",
            "id": ward.id,
            "geometry": {
                "type": "Polygon",
                "coordinates": coordinates
            },
            "properties": {
                "ward_id": ward.id,
                "name_en": ward.name_en,
                "name_gu": ward.name_gu,
                "name_hi": getattr(ward, 'name_hi', '') or ward.name_en,
                "zone_en": ward.zone_en,
                "zone_gu": ward.zone_gu,
                "zone_hi": getattr(ward, 'zone_hi', '') or ward.zone_en,
                "corporator_en": ward.corporator_en,
                "corporator_gu": ward.corporator_gu,
                "corporator_hi": getattr(ward, 'corporator_hi', '') or ward.corporator_en,
                "mla_en": getattr(ward, 'mla_en', '') or 'Darshana Vaghela',
                "mla_gu": getattr(ward, 'mla_gu', '') or 'દર્શના વાઘેલા',
                "mla_hi": getattr(ward, 'mla_hi', '') or 'दर्शना वाघेला',
                "mla_party": getattr(ward, 'mla_party', '') or 'BJP',
                "mp_en": getattr(ward, 'mp_en', '') or 'Hasmukh Patel',
                "mp_gu": getattr(ward, 'mp_gu', '') or 'હસમુખ પટેલ',
                "mp_hi": getattr(ward, 'mp_hi', '') or 'हसमुख पटेल',
                "lat": ward.lat,
                "lng": ward.lng,
                "boundary_source": boundary_source,
                "boundary_official_name": official_name,
                **metrics
            }
        }
        features.append(feature)

    return {
        "type": "FeatureCollection",
        "features": features
    }
