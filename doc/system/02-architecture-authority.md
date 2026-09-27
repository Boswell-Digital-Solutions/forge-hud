## 2. Architecture and authority boundaries

### Current architecture

The executable surface includes documentation tooling and the R1 pure TypeScript
projection package. `projectState` validates JSON snapshots, application-owned maps
and presentation profiles, then returns display data. Failures are visible and
action-disabled. There is no rendered UI, server, database, IPC endpoint or business
state machine here.

### Implemented R1 contract and planned consumer integration

Applications supply native state and display projections to the shared Svelte
package. Profiles validate independent operational, severity, authority, evidence,
source and freshness channels. Primitives render that information; actions call back
into the consuming application's existing workflow.

| Owner | Responsibility |
| --- | --- |
| Consuming application/backend | Operational state, readiness, permitted actions and command execution |
| ForgeHUD Svelte package (R1 contracts implemented) | Projection validation, visual semantics, profiles, tokens and accessible rendering |
| Forge Command / existing governance surfaces | Existing operator authorization and decision workflows |
| DataForge | Durable cross-system operational memory |
| forge_contract_core | Shared normative schema admission when required |

Existing SMITH UGA and NextAction resolution must be reused, not duplicated. A lock
may prohibit navigation while work continues; it does not alone mean blocked or
awaiting approval. Command's current `halt` lane is not sufficient evidence of a
system emergency halt. Adapters must interpret source-qualified facts.

Unknown, missing or contradictory projection inputs must remain visibly unavailable
and must not invent permission. A halt display cannot grant resume clearance.
Later shared Rust extraction requires a separate authority-preserving migration.
