## 4. Delivery status and plan relationship

Current audited snapshot — 2026-09-30: R1 contracts, R2 Svelte primitives and R3
single-context HUD adapters are implemented. Default-off Command and SMITH
pilots bind existing renderer stores. Both native mounts were observed in
disposable flag-enabled runs, including SMITH's local execution transition;
rollout acceptance is still open.
Human screen-reader review remains open before live adoption. Documentation build success is not runtime or
full GATE-00 acceptance.

The authoritative local work breakdown is the reconciled plan under
`docs/plans/forge-ui-grammar/RECONCILED-PLAN.md`; its R1 scope lists the initial package
files. The source Google Doc has not been edited by this repository setup.

| Stage | Intended result | Status |
| --- | --- | --- |
| R0 | Source inventory and reconciliation | Local planning evidence recorded; historical full-scope GATE-00 remains unresolved |
| R1 | Svelte package, projection/profile validation, tokens and motion contract | Merged and locally verified |
| R2 | Four proof surfaces and explicitly simulated showcase | Implemented with automated browser proof; human screen-reader review pending |
| R3 | Bounded HUD presentation adapters | Implemented with two source contracts and two skins; no live store bindings |
| R4 | SMITH and Forge Command operator pilots | Default-off read-only integrations implemented; SMITH local working/completed and Command stale states observed; source reconciliation, human screen-reader and rollout acceptance pending |
| R5 | AuthorForge creator proof and reviewer profile | Planned, not implemented |
| R6 | Regression evidence and bounded rollout | Planned, not implemented |
| R7 | Remaining backend, evidence, fatigue, multi-context and CLI work | Planned, not implemented |

Tarcie target selection gates its live integration. The missing `status-indicators.ts`
source gates migration of that helper. Neither prevents the standalone package proof.
Distribution/versioning and refreshed source baselines are required before live
consumer adoption. Prefix and repository-map admission remain central follow-up work.

The old roadmaps' component/test counts are targets or historical estimates, not
present repository metrics. Preserve deferred obligations until implemented or
explicitly amended; never mark the full toolkit complete after the first primitives.
