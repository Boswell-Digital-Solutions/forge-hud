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

## Origin-aware follow-on

The user clarified that origins include SMITH, Command, Hephaestus, Beta,
tarcie-reviewer, Author-Forge and other public-facing apps. The next slice therefore
uses a shared presentation boundary rather than binding to a single originating
app. The [origin contract and transport obligations](../../../forge-hud-svelte/docs/origin-activity.md)
record the approved design and implemented pure adapter. The original transport
gaps above remain open; the adapter is not a live service or an authorization layer.

The next consumer slice implements `createActivitySession`: bounded per-scope
memory, snapshot/update ordering, disconnect freshness, reconnect generations and
revocation. It is transport-neutral. Inspection of the existing forge-telemetry
README confirms that library owns producer emission and DataForge owns ingestion
and durable identity; neither should be replaced by a new ForgeHUD ingestion API.
The required authorized read subscription still needs owner-side implementation.

## DataForge read-route inspection and visible consumer slice

Inspected DataForge at `a4e8b33460e4b33ea4ad1f00626d810148141690`, remote
`https://github.com/Boswell-Digital-Solutions/DataForge.git`.
`app/main.py` mounts `app/api/telemetry_router.py`. Its
`GET /api/v1/telemetry/correlations/{correlation_id}` route is rollout-gated and
requires an API key with `telemetry:read`, exact environment/tenant binding, and
service identity `forge_command`. Deployment/flag state was not tested.

`ForgeEventCorrelationReadV1` and `ForgeEventCorrelationSummaryV1` in
`app/models/telemetry_schemas.py` expose bounded correlation summaries, possibly
partial or restricted. They do not contain provider/model, request-attempt activity
state, an authorized public session binding, or snapshot/update feed revisions.
The response `observed_at` is read time, not an execution heartbeat. It cannot be
mapped into the proposed session contract by inventing sequences or treating a
partial correlation result as a complete activity snapshot. Service keys must
remain outside browser code. DataForge also explicitly rejects AuthorForge on its
attributes-bearing canonical ingest route; its separate minimized analytics
boundary must remain intact.

The reusable `ForgeActivityList` now renders accepted session observations as
separate origin/task/request/attempt rows. `/activity.html` exercises the actual
session and projection code with synthetic producer data, including routed versus
executing states, disconnect, revision gap, recovery, age expiry, revocation and
audience replacement. This is visible consumer integration, **not live transport
acceptance**. No consumer vendor refresh or production service mutation was made.

The owner-side critical path remains: agree the minimized lifecycle schema with
forge_contract_core, emit at Yellowjacket/NeuroForge execution boundaries, then
supply an authorized read model with explicit complete-snapshot and replay
semantics. Existing correlation telemetry remains correlation evidence; it is not
silently repurposed as public-app activity delivery.

## NeuroForge request-stream consumer — follow-on

NeuroForge PR #104 merged as `341d4d46`, adding explicit provider/simulated/unknown
result provenance. PR #105 merged as `32f5c267`, adding request-local lifecycle
context to started/model_selected/completed/error. The earlier source findings
above describe the original pinned revision; these two gaps are now addressed in
source. Deployment was not checked.

ForgeHUD now exposes `createNeuroForgeStream` and `ForgeNeuroForgeStream` to bind
that existing request owner's decoded reports to a trusted origin/audience. The
stream preview exercises the real adapter and renderer with fixtures. Unknown
simulation status remains separate from v1 observations rather than becoming a
false boolean claim. Selection never produces a working animation. Content and
error payloads are dropped at this boundary.

Remaining: attach the adapter in actual request-owning consumers, producer-start
and heartbeat evidence, authorized read/replay delivery for observers, and real
service acceptance. This request-local bridge does not satisfy the separate
scope-wide snapshot/update transport contract or establish public-app access.
