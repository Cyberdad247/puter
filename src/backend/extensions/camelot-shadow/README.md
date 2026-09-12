# Camelot Shadow Subspace adapter

This Puter backend extension turns Puter into the **Shadow Castle workspace surface** for Camelot-OS.

It does **not** embed the Camelot native executor and it never receives the `camelot-shadowd` bearer token. All requests are sent to the narrow Bifrost Shadow adapter configured by:

```bash
export CAMELOT_BIFROST_URL=http://127.0.0.1:4188
```

Puter's extension authentication middleware remains enabled by default for every route in this module.

## Security boundary

- Puter: authenticated human workspace / desktop UX
- Bifrost: allowlisted protocol boundary and secret broker
- `camelot-shadowd`: loopback-only native Rust policy/HITL daemon
- Sentinel/Heimdall: higher-order Camelot authority layers
- Shadow VFS: temporary copy-on-write mission workspace
- Ledger: signed/hash-chained receipts retained after the workspace is sealed

The adapter intentionally exposes **no arbitrary reverse proxy** and **no shell execution endpoint**.

## Routes

- `GET /api/camelot-shadow/health`
- `GET /api/camelot-shadow/sessions`
- `POST /api/camelot-shadow/sessions`
- `POST /api/camelot-shadow/effects`
- `POST /api/camelot-shadow/decision`
- `GET /api/camelot-shadow/receipts/:session_id`
- `POST /api/camelot-shadow/seal`

R4-R6 effects are expected to stop at Camelot's HITL gate. R6 requires `sovereign` approval scope in the native daemon.

## Design invariant

> The Shadow may minimize external footprint, but it is never invisible to the Crown.

This is privacy- and isolation-oriented execution, not anti-forensic identity evasion. Consequential actions remain attributable and receipted.
