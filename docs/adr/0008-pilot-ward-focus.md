# ADR-0008: Single-ward pilot focus

Status: Accepted

## Context

City-wide launch spreads reports thin and proves nothing. NammaKasa's loop
closed ward-by-ward (BSWML marshals adopting Mahadevapura). The metric that
matters is one ward's resolution rate, not total signups.

## Decision

- `src/data/pilot.json` names the focus ward(s), currently `ward_02`
  (Navrangpura), status `proposed` — partnership onboarding is pending and
  no agreement is claimed.
- Backend digest flags pilot wards (`"pilot": true`) so the mailer and
  dashboards can prioritize them.
- Ward profile defaults to the pilot ward and shows a PILOT badge.

## Consequences

- Changing focus is a one-line config edit, no code deploy logic.
- Do not market the pilot as an AMC partnership until a signed agreement
  exists; then record it here.
