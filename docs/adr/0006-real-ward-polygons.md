# ADR-0006: Real AMC ward polygons from DataMeet

Status: Accepted (supersedes the all-synthetic state in ADR-0001; ADR-0001's
fallback reasoning still applies to unmatched wards)

## Context

DataMeet's Municipal_Spatial_Data publishes `Ahmedabad/Wards.geojson`
(48 official wards, CC BY 4.0) — the same class of open source NammaKasa
used for BBMP boundaries. Synthetic octagons were undermining credibility
with officials.

## Decision

- Commit `backend/app/data/amd_wards.geojson` and serve matched polygons
  from `GET /api/wards/geojson` (20/27 pilot wards matched by normalised
  name + 3 transliteration aliases).
- 7 pilot wards with no official counterpart (Satellite, Bopal, Vastrapur,
  Kalupur, Ambawadi, Vadaj, Sola) keep the synthetic fallback, flagged per
  feature via `boundary_source`.
- Attribution: map legend credits "AMC via DataMeet (CC BY 4.0)".
- Ward assignment stays Haversine-to-center; polygons are display + future
  point-in-polygon work, not the resolve path.

## Update: official union as the geofence (ADR-0009 gate)

- Vadaj verified inside `06 NEW WADAJ` (centre containment + transliteration):
  21/27 pilot wards now draw real polygons.
- Satellite, Vastrapur, Kalupur, Ambawadi, Sola keep synthetic display:
  their centres fall inside neighbouring official wards (Jodhpur, Bodakdev,
  Khadia, Navrangpura, Gota), but borrowing a neighbour's shape under a
  pilot label would misattribute the map — so display stays honest.
- The *gate* uses the full 48-ward union (`inside_official_limits`): any
  point inside official AMC limits is accepted and attributed to the nearest
  pilot ward. Bopal predates the snapshot and is covered by its pilot
   octagon.

## Consequences

- The map now draws real boundaries for most wards; no API shape break
  (additive `boundary_source` / `boundary_official_name` properties).
- If AMC re-delimits wards, re-pull the dataset and extend `NAME_ALIASES`.
