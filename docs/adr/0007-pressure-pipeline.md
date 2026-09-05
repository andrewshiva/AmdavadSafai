# ADR-0007: Pressure pipeline (escalations + digest, no auto-mail)

Status: Accepted

## Context

NammaKasa's leverage is institutional pressure: public counts plus
push channels into the authority (their plan: weekly BBMP emails, auto-tweets
past a per-ward threshold). Our app had public counts but no push path and no
officer surface.

## Decision

- `GET /api/escalations`: wards with unresolved counts at/over threshold
  (`ESCALATION_THRESHOLD`, default 10). Surfaced as badges on the public
  Statistics worst-wards card.
- `GET /api/digest/wards`: machine-readable per-ward digest (counts, rates,
  top-5 unresolved with coordinates + tracking refs) shaped for a weekly
  mailer cron. Email sending is NOT implemented — no provider configured;
  the endpoint is the contract the future mailer consumes.
- The public Statistics page doubles as the read-only officer view; no
  separate officer UI until an AMC consumer asks for one.

## Consequences

- Threshold is tunable without deploy-time code changes (env var).
- Social auto-posting (tweets/toots) is deferred: needs official handles +
  approval, not just code.
