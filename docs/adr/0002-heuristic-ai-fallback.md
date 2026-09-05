# ADR-0002: Heuristic AI fallback is the live path

Status: Accepted

## Context

`backend/app/ai_service.py` supports MiniMind-3 (triage/chat) and SigLIP-2 (before/after vision) when torch + local weights under `scratch/models/` exist. `torch`/`transformers` are not in `backend/requirements.txt`, so production (Render) runs with `TORCH_AVAILABLE=False` and keyword-intent + fixed-score fallbacks.

## Decision

Ship heuristic intents (CCRS/SLA/drives/karma/corps, trilingual) and comparison-score fallbacks as the supported behavior. ML weights stay local-only, never deployed.

## Consequences

- Triage/vision responses must be labeled as estimates in UI copy; do not quote confidence as measured accuracy.
- To enable real models: add `torch` + `transformers` to requirements, provide an HF cache/token strategy and a Docker image (weights are hundreds of MB — not Render-free-tier safe).
