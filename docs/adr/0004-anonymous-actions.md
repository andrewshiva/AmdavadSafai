# ADR-0004: Anonymous civic actions, optional identity

Status: Accepted

## Context

v2 gated reporting, verification, disputes, and drive creation behind a mock
phone-only `LoginModal` (localStorage, no server auth). NammaKasa's traction
came from zero-friction anonymous reporting; login walls cost reports and
anonymity protects citizens reporting government failure. Our backend has no
real auth, so the gate bought no abuse protection either.

## Decision

All civic actions are anonymous: report, verify, flag, dispute, share, join
and create drives. Sign-in remains purely optional as a display identity for
karma/badges. Anti-abuse stays where it is: client-side karma ledger dedup
plus server-side ward geofence and payload validation.

## Consequences

- `AppV2.handleOpenReport` and all modal/drive actions skip login.
- If real auth arrives, re-gate only abuse-sensitive writes (verify/dispute),
  never reads or reporting.
