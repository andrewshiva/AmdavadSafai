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

## Consequences

- The map now draws real boundaries for most wards; no API shape break
  (additive `boundary_source` / `boundary_official_name` properties).
- If AMC re-delimits wards, re-pull the dataset and extend `NAME_ALIASES`.
