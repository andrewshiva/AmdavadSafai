# ADR-0009: Municipal-boundary geofence for reports

Status: Accepted

## Context

Previous gate iterations used distance to ward centers (35 km, then 8 km fallback), which admitted Gandhinagar (Infocity, Bhat, Koba), Sanand, Kalol, and other neighbours. Frontend ReportPage and ReportModal additionally swallowed 400 rejections and network errors into the offline localStorage path, causing rejected out-of-city reports to still appear filed with tickets and karma points awarded.

## Decision

- Backend: Bounding box fast-reject gate (`[22.8900, 23.1600]` lat, `[72.4300, 72.7100]` lng) combined with point-in-polygon against pilot ward boundaries (`locate_point`) and the 48 official AMC ward boundaries (`inside_official_limits`).
  Zero out-of-city fallback: points outside the municipal boundary are strictly rejected with HTTP 400. `POST /api/reports`, `POST /api/events`, and `POST /api/wards/resolve` all enforce it; client `ward_id` never overrides.
- Frontend: Dual-layer client-side geofencing via `src/utils/geofence.js` (`validateAhmedabadCoords`). Real-time ray-casting checks run on GPS capture, map click, and form progression.
  Map clicks outside Ahmedabad are blocked with a toast warning and map navigation is restricted with `maxBounds`.
  Step 2 blocks progression to Step 3 if coordinates are outside AMC limits.
  Offline localStorage fallback only permits verified coordinates within Ahmedabad; out-of-city submissions never touch localStorage and never award Karma points.
- Maintenance: Automatic cleanup (`cleanseStoredReports`) purges any legacy out-of-city reports on startup.

## Consequences

- Non-Ahmedabad coordinates are strictly rejected across all entry points with localized distance context.
- Neither server nor client localStorage will ever accept reports or events outside Ahmedabad municipal limits.
