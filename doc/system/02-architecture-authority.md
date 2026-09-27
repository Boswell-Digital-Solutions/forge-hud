## 2. Architecture and authority boundaries

### Current architecture

The executable surface is documentation tooling only: `doc/system/BUILD.sh` assembles
chapters; `scripts/check_docs.py` validates the documentation set. There is no
application runtime, server, database, IPC endpoint or state machine here.

### Planned architecture

Applications supply native state and display projections to the shared Svelte
package. Profiles validate independent operational, severity, authority, evidence,
source and freshness channels. Primitives render that information; actions call back
into the consuming application's existing workflow.

| Owner | Responsibility |
| --- | --- |
| Consuming application/backend | Operational state, readiness, permitted actions and command execution |
| ForgeHUD Svelte package (planned) | Projection validation, visual semantics, profiles, tokens and accessible rendering |
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
