# Camelot Shadow Subspace adapter

This integration turns Puter into the **Shadow Castle workspace surface** for Camelot-OS.

It does **not** embed the Camelot native executor and it never receives the `camelot-shadowd` bearer token. All privileged Shadow operations remain behind the narrow Bifrost Shadow adapter configured by:

```bash
export CAMELOT_BIFROST_URL=http://127.0.0.1:4188
```

Puter's extension authentication middleware remains enabled by default for every backend route in this module.

## Puter-native Shadow Castle window

The companion GUI extension lives at:

```text
src/gui/src/extensions/camelot-shadow/index.js
```

Puter's GUI build automatically includes JavaScript files and extension directories from `src/gui/src/extensions`, so no core GUI registry modification is required.

Open the Puter user menu and choose:

```text
◐ Camelot Shadow Castle
```

The window provides:

- native Shadow CPU health
- authenticated mission summon flow
- active Shadow session list
- CPU/RAM/TTL/receipt telemetry
- capability and egress boundary display
- effect manifest proposal
- R4/R5 HITL approve/deny controls
- R6 UI path that remains fail-closed when Camelot server policy disables R6
- append-only receipt viewer
- seal-and-purge workspace action

The browser GUI authenticates to Puter with the existing `puter.authToken`. It calls the Puter backend adapter, which then calls Bifrost. The browser never talks directly to `camelot-shadowd`.

## Security boundary

```text
Puter GUI (authenticated human)
        |
        v
Puter camelot-shadow backend extension
        |
        v
Bifrost governed Shadow adapter
        |  native bearer inserted server-side
        v
camelot-shadowd (loopback-only Rust service)
```

- Puter: authenticated human workspace / desktop UX
- Bifrost: allowlisted protocol boundary and secret broker
- `camelot-shadowd`: loopback-only native Rust policy/HITL daemon
- Sentinel/Heimdall: higher-order Camelot authority layers
- Shadow VFS: temporary copy-on-write mission workspace
- Ledger: signed/hash-chained receipts retained after the workspace is sealed

The adapter intentionally exposes **no arbitrary reverse proxy** and **no shell execution endpoint**.

## Backend routes

- `GET /api/camelot-shadow/health`
- `GET /api/camelot-shadow/sessions`
- `POST /api/camelot-shadow/sessions`
- `POST /api/camelot-shadow/effects`
- `POST /api/camelot-shadow/decision`
- `GET /api/camelot-shadow/receipts/:session_id`
- `POST /api/camelot-shadow/seal`

R4-R5 effects stop at Camelot's HITL gate. R6 is fail-closed by default in `camelot-shadowd` and should remain disabled until Camelot has a server-authenticated sovereign identity path.

## Design invariant

> The Shadow may minimize external footprint, but it is never invisible to the Crown.

This is privacy- and isolation-oriented execution, not anti-forensic identity evasion. Consequential actions remain attributable and receipted.
