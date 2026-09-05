# ADR-0005: Community tracking refs, no official-ticket claims

Status: Accepted

## Context

The app minted `AMC-CCRS-2026-XXXXX` IDs and presented receipts, banners, and
chat replies as official AMC output ("in partnership with AMC", "guaranteed
48-hour SLA", "AMC SWM Certified"). There is no AMC integration: no CCRS
linkage, no data sharing, no partnership. Official-looking artifacts burn
trust the first time a citizen cross-checks with 155303.

## Decision

- Tracking refs are namespaced `AS-2026-XXXXX` (legacy `AMC-CCRS-` IDs still
  recognised for backward compatibility).
- The receipt is a **Community Cleanup Record** issued by AmdavadSafai,
  citizen-verified, with a printed pointer to official filing (155303).
- Copy attributes cleanup to AMC where true ("official cleanup is AMC's
  job") and claims only public accountability for the platform.
- SLA/charter numbers are stated as targets of the official channel, never
  as platform guarantees.

## Consequences

- Old `AMC-CCRS-` refs in existing DBs keep resolving; new reports mint `AS-`.
- If real CCRS integration arrives, reintroduce official filing as a
  separate, explicitly-sourced field — never by renaming community refs.
