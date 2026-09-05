# ADR-0001: Synthetic ward polygons as approximate geo

Status: Accepted

## Context

`backend/app/geojson_data.py` generates ward boundaries as 8-point irregular octagons (~1.2 km radius) around each ward center in `src/data/wards.json`. There is no licensed AMC ward-boundary source in the repo. Ward assignment uses Haversine distance to ward centers (`crud.get_nearest_ward`), not point-in-polygon.

## Decision

Keep synthetic polygons as a visual approximation. Never present them as official AMC boundaries.

## Consequences

- Heatmap/choropleth is indicative; per-ward counts and cleanliness scores remain valid (computed from report rows, not geometry).
- `POST /api/wards/resolve` stays distance-based with a 35 km geofence; out-of-city handling is unaffected.
- Revisit when a real boundary dataset is licensed: replace `generate_polygon_for_center` with stored GeoJSON + point-in-polygon resolve.
