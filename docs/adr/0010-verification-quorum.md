# ADR-0010: Verification quorum implementation (grill R2)

Status: Accepted (implements grill Round-2 consensus: Q6–Q10)

## What shipped

- `verification_state` on reports: `unreviewed → pending_review → certified | disputed`.
  `status` stays the compatibility field; only `certified` flips it to resolved.
- Quorum: original reporter 1-tap (via `reporter_device_id`) OR 2 distinct
  verifier devices. Repeats from one device dedupe. Anyone closing anything
  unilaterally is gone (also fixed a latent `NameError` that broke verify).
- GPS proof: live coords captured at verification-upload time; ≤200 m of the
  report pin earns `location_proof='gps'`, else a visible `none` tag — never a
  block. EXIF-timestamp freshness is NOT enforced (no EXIF pipeline exists).
- Karma escrow: +30 held pending, released on certification. No slashing.
- Public copy says "Public Dual-Photo Proof / Community Cleanup Record";
  model mode lives in `/api/ai/status` and docs, not on volunteer screens.

## Known limits

- Escrow finalizes on the certifying device; an earlier confirmer's pending
  entry releases only when their device next sees the certified report path.
  Acceptable at pilot scale; revisit with server-side ledger + auth.
- Audit trail is state transitions, not an append-only table (deferred per Q8).
