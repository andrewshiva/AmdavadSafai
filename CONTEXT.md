# CONTEXT.md — AmdavadSafai (designinf)

Citizen-driven garbage-reporting map for Ahmedabad. Vite + React 19 SPA (`src/`) + FastAPI + SQLite (`backend/app/`). Trilingual UI: `en` / `gu` (default) / `hi`.

Seed data (`src/data/*.json` → SQLite via `backend/app/seed.py` on startup): `wards.json`, `reports.json`, `events.json`. DB files are local-only and never committed (see `.gitignore`).

## Glossary — use these terms exactly

- **Ward** (`Ward`, `ward_id` like `ward_02`): pilot coverage is **27 wards** (`ward_01..ward_27` in `src/data/wards.json`), each with `name_en/gu`, `zone_en/gu`, `corporator_en/gu`, `mla_*`, `mp_*`, `lat/lng`. Say "ward", never "division" or "district".
- **Zone** (`zone_en`): free-text zone on each ward (e.g. `West Zone`, `South West Zone`). No canonical zone list — do not assume 7 zones.
- **Report** (`Report`, `rpt_<hex8>`): a garbage complaint. Say "report", not "ticket" (ticket = the AMC number below) and not "issue" in code contexts.
  - `severity`: `minor | moderate | severe | critical`
  - `status`: `unresolved | resolved` in DB (`models.py`); UI also shows `pending | in_progress` as display states for unresolved reports
  - `category`: `mixed_waste | construction_dump | overflowing_bin | roadside_garbage | drainage_blockage`
  - `amc_ticket_id`: `AMC-CCRS-2026-XXXXX` (generated in `crud.create_report` when missing)
  - `amc_status` / `amc_department` (default `Solid Waste Management (SWM)`), `upvotes`, `flagged` + `flag_reason`, `image_url`, `verified_image_url`, `lat/lng`, `reported_at`, `resolved_at`
- **CleanupEvent** (`CleanupEvent`): Sunday community drives. `status`: `upcoming | in_progress | completed`. `volunteers_joined` increments on `POST /api/events/{id}/join`.
- **Subscription**: email-only newsletter row, idempotent by email. No mail is sent (stub).
- **Karma / Device** (`src/utils/gamification.js`): client-side civic points keyed by device id `amd_*` (`localStorage:amdavad_citizen_device_id`, cookie mirror). Actions: `REPORT_SUBMITTED 15 / CLEANUP_VERIFIED 30 / EVENT_JOINED 50 / EVENT_CREATED 100 / DAILY_CHECKIN 10 / UPVOTE 5 / DISPUTE 15 / DOSSIER 10 / SHARE 5`, streak `7d +50 / 30d +200`. Tiers: `Safai Sevak 0 / Ward Guardian 50 / Safai Warrior 150 / Eco Champion 300 / Amdavad Ratna 600`. `POST /api/karma/sync` is ack-only; localStorage is source of truth (see ADR-0003).
- **CCRS**: AMC helpline surfaced in chat copy as `155303` / `+91 75678 55303`. Treat numbers as unverified display copy, not facts.
- **Verify / Dispute / Flag**: post-resolution actions on a report (`/verify` sets `resolved`, `/dispute` reopens with `Re-Opened by Citizen Audit`, `/flag` records reason).

## Key flows

- Report: GPS → client-side geofence gate (`src/utils/geofence.js`) → `POST /api/wards/resolve` (strict municipal boundary gate, reject out-of-city coords, see `crud.get_nearest_ward`) → optional `POST /api/ai/triage` → `POST /api/reports` (ward re-resolved server-side from coords; base64 image → `/uploads/*`) → upvote/verify/flag/dispute → receipt/share.
- Map (`MapView.jsx` + `GET /api/wards/geojson`): 21/27 pilot wards draw real
  AMC polygons (DataMeet, CC BY 4.0 — see ADR-0006); 6 without a 1:1 official
  counterpart keep the synthetic approximation flagged via
  `boundary_source`. The report gate additionally accepts any point inside
  the 48-ward official union (see ADR-0009). Cleanliness score `100 − penalty(minor 3 / moderate 6
  / severe 10 / critical 15 / resolved 0.5)` → grade `A+..D`.
- AI (`ai_service.py`): heuristic keyword intents live; MiniMind-3 + SigLIP-2 load only when torch + local weights exist (see ADR-0002).

## Numbers are live

Dashboard, ward profile, and about stats compute from the loaded `reports` array + `wards.json` (`wardsData.length`). No hardcoded totals, rates, or mock feed items. Empty states render when there is no data.
