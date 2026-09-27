# Origin-aware activity observations

Status: implemented **presentation boundary proposal**, version 1. This is the
canonical ForgeHUD design record for the approved origin-aware approach, not an
adopted upstream execution schema. Shared ecosystem schema ownership remains with
forge_contract_core. Producer and authenticated transport adoption remain open.

## Identities and scope

Origin is extensible: forge-smithy, ForgeCommand, hephaestus, beta,
tarcie-reviewer, Author-Forge and other public apps all use the same shape.
Origin never determines executing backend or LLM provider.

| Field | Meaning |
| --- | --- |
| `scope.plane` | `business-local` or `public-app`; audience boundary, not deployment location |
| `scope.scopeId` | Opaque audience identifier resolved by an authenticated transport |
| `origin.appId`, `origin.taskId` | Initiating app and task; propagated through downstream execution |
| `requestId`, `attemptId` | Request and individual attempt; retries/concurrent branches use distinct attempt IDs |
| `backend` | `yellowjacket` or `neuroforge` for this presentation slice |
| `sequence` | Nonnegative safe integer, increasing per full observation key |
| `observedAt` | Producer observation time, UTC ISO milliseconds; nondecreasing per attempt |
| `phase` | queued, routed, executing, waiting, blocked, completed, failed, halted |
| `provider`, `model` | Producer-reported identity or null; not inferred from a requested preference |
| `simulation` | Explicit producer simulation marker |

The adapter rejects missing/extra fields and invalid values. It admits only bounded
text identifiers; this is not a content sanitizer or a reason to include prompts,
outputs, credentials, URLs or raw errors in those identifiers. Producer adapters
must allowlist and minimize content before sending it.

`google` maps to the Gemini icon; `xai` maps to Grok. Other supported IDs match the
existing icon catalog. Unrecognized/local providers retain their original identity
in the parsed observation but use the generic unknown-provider icon in the HUD.
Provider ID here means the producer's declared attribution; transport host and
model-company identity must not be conflated. Proxy/hosting details need upstream
contract review before expanding this proposal.

## Consumer usage

```ts
import { acceptObservation, observationKey, projectObservation } from '@forgehud/svelte';
// trustedScope comes from the authenticated subscription, never event.scope.
const accepted = acceptObservation(previousForThisAttempt, decodedEvent, trustedScope);
if (accepted) {
  observations.set(observationKey(accepted), accepted);
}
// Recompute on connection changes and the consumer's existing freshness clock.
const hud = projectObservation(currentObservation, trustedScope, profile, {
  nowMs: Date.now(), staleAfterMs: configuredFreshnessBudget, connected
});
```

Consumers must validate scope before storing/disclosing observations, maintain
separate entries keyed by `observationKey`, and use `acceptObservation` for ordering.
`projectObservation` validates and projects one snapshot; it does not remember
previous events, so bypassing the acceptance guard forfeits ordering protection.
Null means rejected input, not idle. It must never grant an action or be interpreted
as successful completion. Invalid input does not refresh the previous timestamp.

Terminal attempts cannot change phase or provider/model identity. Higher-sequence
same-terminal observations may refresh freshness. New work requires a new attempt.
If a producer clock moves backward, retain the last accepted state until a valid
update or a fresh authenticated snapshot restores consistency. Sequence behavior,
snapshot revisions and restart epochs require agreement with the transport owner.

Routed projects to primed (provider selection does not prove execution); executing
to working; waiting to awaiting authority. Other phases map to idle, blocked,
complete, failed and halted. Evidence remains unverified and action IDs remain
empty even when `simulation` is false. The HUD adapter never grants authority.

Disconnect or age >= the consumer's configured freshness budget becomes stale.
Future producer timestamps become unknown freshness. The adapter does not own
polling, clocks, heartbeat policy or connection establishment.

## Isolation and transport obligations

- Authenticate subscriptions and authorize scope server-side **before delivery**.
  Client scope matching is defense against accidental cross-wiring, not access control.
- Public apps must function independently of Command/SMITH and receive only their
  authorized user/session/task activity. Do not expose internal operator traces.
- tarcie-reviewer receives only assigned review scope. A displayed origin name alone
  grants no access. Server-side identity derives or validates the origin and scope.
- Command's cross-origin view is a collection of explicitly authorized scopes;
  there is no client wildcard or bypass. Clear stores on logout/scope revocation.
- Use an authenticated current snapshot plus resumable updates. Define bounded
  buffers, replay cursors, deletion/expiry, dropped-event recovery and disconnect
  handling before live use. Do not replay a generation POST to recover telemetry.
- Do not persist observed identities in cross-user browser storage by default.
- Keep public and business-local families independently operable, even when their
  cloud services share implementation or telemetry conventions.

## Remaining implementation

1. Reconcile this proposal with forge_contract_core and existing telemetry ownership.
2. Add producer observations at actual execution boundaries (including fallback).
3. Establish scoped read-only snapshot/update delivery with server authorization.
4. Bind Command and SMITH; then review/public-app integrations. Vendor updates must
   accompany genuine consumer wiring rather than relabeling existing pipeline state.
5. Test the real native/backend transport, concurrent attempts, recovery and tenant
   isolation before claiming live acceptance. Current tests exercise adapter logic only.

## Research basis

Request correlation follows the distributed tracing approach in
[Dapper (2010)](https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/)
and [W3C Trace Context](https://www.w3.org/TR/trace-context/).
Ordering guards apply the causal-ordering distinction explained by
[Lamport (1978)](https://www.microsoft.com/en-us/research/publication/time-clocks-ordering-events-distributed-system/).
Explicit stale/unknown posture is an engineering application of failure-detector
uncertainty, discussed by
[Chandra and Toueg (1996)](https://www.cs.princeton.edu/courses/archive/fall07/cos518/papers/unreliable.pdf).
These sources support the design principles; they do not prescribe this schema,
its timeout or its security model.

## Scoped in-memory consumer session

`createActivitySession(trustedScope, maxEntries = 128)` manages a single authorized
scope in memory. It does not authenticate, fetch, subscribe, persist, poll or emit
provider requests. An authenticated transport adapter supplies its callbacks:

```ts
const session = createActivitySession(trustedScope);
const connection = session.begin();
// From the authorized feed, never from a generation-starting request:
connection.snapshot(snapshot.observations, snapshot.revision);
connection.update(update.observation, update.revision);
// Transport disconnect/error:
connection.disconnect();
// Logout, revocation or switching scope:
session.revoke();
```

Each `begin()` invalidates earlier connection callbacks and enters synchronizing
state. Existing records remain visible but project as stale until a complete
snapshot is accepted. Snapshot validation is atomic: malformed, duplicate,
cross-scope or oversized batches cannot partially replace state.

The proposed transport must supply **scope-local, monotonic, contiguous feed
revisions**. These are separate from per-attempt observation sequences. They must
not be generated from browser arrival order, timestamps or a global stream whose
filtered events introduce gaps. A snapshot revision is a high-water mark, and its
records are the entire authorized set at that point. Same-revision snapshots must
match the prior set; newer snapshots may remove records. The server must not
reintroduce expired/deleted attempts through stale replay. Revisions must remain
meaningful across reconnects; a server revision reset requires a new explicitly
initialized session rather than weakening replay checks.

Duplicates/older update revisions are ignored. A gap, invalid update, terminal
regression or capacity overflow enters `resync-required`. Further updates are
rejected until `begin()` and a valid fresh snapshot. No active work is silently
evicted. The maximum is configurable from 1 to 4096 records. The transport adapter
must bound incoming byte/frame size before parsing; this count limit alone is not
network denial-of-service protection.

`session.project(profile, nowMs, staleAfterMs)` returns separately keyed HUD models
for concurrent attempts. Consumers call it through their own reactive lifecycle
and freshness clock. `observations()` returns detached records. `revoke()` clears
all records, rejects all old callbacks, and permanently closes the session.
Create a new session for a new authorized scope. Native/network subscription
cleanup remains the transport adapter's responsibility.

### Existing telemetry ownership

The inspected `forge-telemetry` README identifies it as the canonical producer
library for `ForgeEvent.v1`, with DataForge owning persistence, canonical ingestion
and durable identity. It is not a ready-made HUD read subscription. The native
TypeScript/Rust producer surfaces are described as candidates. This session API
therefore does not invent a parallel ingestion endpoint or claim compatibility
with a deployed snapshot/update service. Map the authorized read model into this
boundary only after its delivery/replay contract is established with its owner.

Tests cover concurrent work, snapshots, gaps, replay, terminal state protection,
disconnect freshness, late callbacks, audience mismatch, revocation and memory
bounds. These are consumer tests, not proof of server-side tenant isolation or
live connectivity.

## Visible consumer integration

`ForgeActivityList` renders one authorized scope. Pass `observations` from
`session.observations()`, `status` from `session.status`, the trusted `scope`, a
validated display `profile`, and the consumer clock (`nowMs`, `staleAfterMs`).
Publish fresh reactive observations/status after each session callback; the session
itself is intentionally framework-neutral and is not a Svelte reactive store.
Update `nowMs` on the host's freshness timer, and clean up that timer/subscription
on unmount. Do not remount the session on every render.

The component rechecks record shape/scope before display and suppresses all rows
when revoked. Ordering and terminal guards still belong to the session: passing
unaccepted observations directly forfeits those protections. Rows include origin,
task, request and attempt, backend/provider identity, last reported phase and time,
and explicit simulation/evidence labels. Routed records do not animate. Unknown
provider IDs remain visible as text alongside the generic icon. No action controls
or authority grants are generated. Empty reports mean unknown activity, not idle.
The polite feed summary announces connection/count changes without reading every
clock tick aloud.

Visit `/activity.html` in the local showcase, or open **Details → Explore origin
activity** from `/adapters.html`. The business operator, Author-Forge session, and
assigned review examples are separate synthetic audiences. Selecting one revokes
and replaces the previous session. The 15-second expiry is a preview setting, not
an agreed production heartbeat budget. Browser tests exercise the real session →
projection → component path, mobile layouts, accessibility and reduced motion.
These fixtures do not establish server-side isolation or live connectivity.

## Existing NeuroForge generation stream

`createNeuroForgeStream(binding)` consumes **decoded lifecycle messages from an
already authorized generation request**. Its binding supplies trusted scope,
origin, request ID and local attempt ID; none come from event payloads. Attach one
instance to exactly one request response. The first `started` report establishes
its producer execution ID; later reports must match it. This does not authenticate
the first report or defend against attaching the wrong response in the host.

```ts
const stream = createNeuroForgeStream({ scope: trustedScope, origin, requestId, attemptId });
// The request owner's existing bounded SSE parser calls this:
stream.accept(eventName, decodedJSON);
// Publish detached state after each callback in the host's reactive store:
report = stream.report();
status = stream.status;
// EOF, network error, cancellation:
stream.close();
// Logout, audience change, component cleanup:
stream.revoke(); // also cancel/detach the native subscription in the host
```

The API never fetches, starts generation, parses unbounded wire data, reconnects,
persists or logs payloads. The request owner must bound frame bytes **before** JSON
parsing. Chunk and metrics inputs are ignored without inspecting them. Legacy
content, prompts, raw errors and payload-supplied audience fields are not retained.
Only selected route identifiers, strict lifecycle context and strict minimized
provenance are copied. Identifier fields are not a general content sanitizer.

The adapter verifies the merged NeuroForge PR #105 lifecycle shape, contiguous
request-local sequence from zero, timestamps, execution identity, allowed phase
order and terminal provenance. Older/duplicate sequence numbers are ignored.
Malformed/gapped/cross-request reports mark the stream invalid and freeze its last
report; disconnect makes an unfinished stream stale. Revoke clears it and rejects
all callbacks. Terminal reports close acceptance; normal EOF preserves their
reported terminal state until the host freshness budget expires. `finished`
means the stream reached a terminal report, **not** that generation succeeded.

These sequence numbers are not the scope-wide feed revisions required by
`createActivitySession`. Do not inject them as feed revisions or synthesize a
complete audience snapshot from a single request. Recovery requires owner-side
read/replay semantics; repeating the generation POST is not telemetry recovery.

`ForgeNeuroForgeStream` renders detached `report`, `status`, `profile`, `nowMs` and
`staleAfterMs`. It keeps unknown provenance explicit and static. The v1 observation
schema requires boolean simulation, so `projectNeuroForgeReport` returns null for
unknown provenance rather than lying about real/simulated execution. Known terminal
provenance projects through the existing HUD adapter. Actual reported provider
identity wins over selected identity; simulated results carry no selected-company
icon. Selection remains separate text. No executing state is invented: this source
still lacks provider-start events. Evidence remains unverified and actions disabled.

The optional `/stream.html` showcase replays payload-shaped fixtures through this
same adapter/component path. Even its provider-mode example is a fixture, clearly
labeled at the top of the page. Access it from `/activity.html`. This verifies the
consumer binding API and renderer, not a deployed service connection or server-side
origin authorization. No SMITH/Command vendor updates are included until their
request-owning transports are bound.
