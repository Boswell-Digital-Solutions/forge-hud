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
