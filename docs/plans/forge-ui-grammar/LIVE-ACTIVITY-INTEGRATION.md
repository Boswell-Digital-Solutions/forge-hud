# Live activity source audit — 2026-09-27

Status: source investigation complete; live wiring blocked on an existing request
stream attachment or a read-only producer activity transport. The HUD remains
simulated. No cloud requests, inference runs, credentials, or producer mutations
were performed during this audit.

## Verified sources

| Repository and revision | Evidence | Consequence |
| --- | --- | --- |
| Forge_Command `9b646c923244b9456fb8d543176e858767209634` | `src/lib/types/index.ts`, `NeuroForgeMetrics`; `src-tauri/src/commands/telemetry.rs`, `NeuroForgeDashboardResponse` | Existing `/api/v1/admin/dashboard` feed contains aggregate counts, latency, errors and cost. No per-request provider, model or execution phase. Running-model count is not proof of active inference. |
| Forge_Command, same revision | `src/lib/self-healing/posture.ts`, YellowJacket entry | Admission transport explicitly unwired. |
| forge-smithy `1e8a938ecdb83688546ddff752c1b4e734779d0e` | `src/lib/cockpit/workspaces/TeamTrace.svelte` | YellowJacket worker events explicitly fabricated preview fixtures; no real worker-event source. |
| yellowjacket `1eec62dae3e04d704364965177c51a8be30a2daa` | `packages/yellowjacket-core/src/runtime.ts`, `bootstrapRun` | Returns an in-process summary/trace through requested, admitted and planned. No consumer transport established by this API. |
| NeuroForge `536a55a8b8791f0574705cd035963f0a5a1a7a35` | `neuroforge_backend/routers/execution.py` | `POST /api/v1/execute/generate/stream` emits started, model_selected, chunk, metrics, completed and error. The route starts generation; it is not a read-only activity subscription. |

NeuroForge's `model_selected` carries `model` and `provider`; `completed` carries
those fields plus execution ID and success. `started` carries the execution ID.
The stream does not attach producer timestamps or execution IDs to every event.
Any integration must retain per-request stream identity and distinguish receipt
observation time from a producer observation/heartbeat. Chunk events contain model
output and error events may contain backend error details; neither should be copied
into HUD status text or logs.

No references to `model_selected`, `/generate/stream`, `/planning/stream`, or
`provider_used` were found in the inspected SMITH/Command frontend and Tauri sources.
Existing pilot capsules describe pipeline/decision state, not inference activity.
They must not be relabeled as Yellowjacket or NeuroForge activity without a binding.

## Repository identity

The relevant provider router is the cloud-system repository
`Boswell-Digital-Solutions/NeuroForge` at
`/home/charlie/Forge/ecosystem/cloud-systems/NeuroForge`.
The separately inspected `neuronforge-local-operator` is a training workspace;
`forge-neuronforge` belongs to public app-local support. Neither is silently
substituted for the Command service. Yellowjacket inspected here is the BDS
business-system repository, not the public app-local support counterpart.

## Concrete next slice

1. Identify the consumer that owns the actual inference request, or define a
   read-only authenticated producer transport for lifecycle observations. Do not
   initiate generation or add cloud escalation solely for visualization.
2. Bind scoped events to request IDs. Map actual routed provider aliases
   (`google` to `gemini`, `xai` to `grok`); unsupported/local providers retain an
   explicit text identity and generic icon rather than a guessed brand.
3. Publish lifecycle observations at the producer's execution boundary. Model
   selection expresses a route choice, not independently proven execution.
   Concurrent requests require separate indicators and fallback events must
   update identity without reusing another request's state.
4. Define disconnect, out-of-order event, heartbeat and stale-age behavior. An
   interrupted stream must stop motion and must not imply completion or idle.
5. Refresh the pinned consumer vendor files only alongside a genuine mounting
   and transport binding; preserve existing approval controls and pilot defaults.
6. Verify route, native IPC and frontend independently, then test real service
   acceptance in the authorized environment. Keep credentials and output payloads
   out of the HUD boundary.

The package already supports producer-supplied activity metadata and all approved
status treatments. This audit does not create a new upstream contract or claim
that live acceptance is complete.
