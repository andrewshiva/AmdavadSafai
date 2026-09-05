# ADR-0003: Local karma store is source of truth

Status: Accepted

## Context

`src/utils/gamification.js` keeps points, streaks, and the idempotent action ledger in `localStorage` (+ cookie device id `amd_*`). `POST /api/karma/sync` acknowledges `{device_id, points, streak_days}` without persisting. Login (`LoginModal.jsx`) is phone-only localStorage. Anti-abuse caps (dedup, 5/day) run client-side.

## Decision

Keep localStorage as source of truth for the pilot. Server sync stays ack-only until real auth exists.

## Consequences

- Points are per-device and resettable; do not use them for anything authoritative (rewards, leaderboards with prizes).
- A future auth track must add server-side identity + persisted ledger + server-enforced caps before karma can be trusted.
