# ForgeHUD + Forge UI Grammar — reconciled implementation plan

Reconciliation date: 2026-09-27. Status: local implementation planning amendment.
This document resolves the sequencing of the two roadmaps for this task. It does
not certify implementation, change the canonical repository map, or amend the
source Google Doc. Original references and the CP0 observations remain preserved in the task-local CP0 packet. Repository evidence includes the source manifest and reference metadata; source snapshots remain in that packet and are not duplicated here.

## Decision

Build **one ForgeHUD toolkit with UI Grammar inside its Svelte package**.
`forge-hud-svelte` is a planned deliverable, not an installed dependency that the
user must locate. Establish a minimal package, profile validation and presentation
contract first; then prove a few primitives against existing application state.
Extract additional components and backend capabilities only after that proof.

The old requirement to finish Rust core, all stores, compliance and predictive
fatigue before profiles and migration is replaced for the initial delivery.
Those capabilities remain on the full ForgeHUD roadmap. They are not prerequisites
for a props-driven renderer consuming existing authoritative application state.

## Sources and precedence

| Source | Role in this reconciliation |
| --- | --- |
| [UI Grammar canonical plan](https://docs.google.com/document/d/1NBaOmZn2KIntRpvmW0awWiqnLvRx8N5zZOWB_7d1zlg/edit), especially §§5, 9, 14, 16–24 | Current presentation scope, first proof set, authority boundaries and bounded rollout |
| [ForgeHUD v1.1 enhanced specification](https://drive.google.com/file/d/1_Ts2CRCVCW2LgGxZQQK_yrbccVYRO44a/view), §§3–18 and appended roadmap tables | Full toolkit destination, emergency behavior, extraction strategy, later capabilities |
| [Portable ForgeHUD specification](https://drive.google.com/file/d/1yuH_rSm38WeKtqXuYn2qHAa-gJC_58S8/view), §§12–17 | Original extraction phases and proposed package structure |
| `evidence/source-lock.json` and task-local source snapshots | What was observed in application code; not evidence that the portable package exists |

For the initial visual delivery, apply UI Grammar's narrower rules when an older
feature would introduce new authority or conflict with its motion/accessibility
rules. Preserve the conflicting older feature as an explicitly deferred or revised
requirement below. Do not treat reconciliation as proof of source-spec completion.

## Ownership and package shape

Logical owner: ForgeHUD. UI Grammar is a module of ForgeHUD, not another HUD engine.
Application adapters remain owned by SMITH, Forge Command and AuthorForge.
Forge workspace remains the owner of cross-repository planning and topology.

Repository owner: `Boswell-Digital-Solutions/forge-hud`, explicitly supplied by
the user during reconciliation. Remote:
`https://github.com/Boswell-Digital-Solutions/forge-hud.git`. A successful clone
found an empty repository with no source commit yet. Place `forge-hud-svelte` in
this repository, with `forge-hud-core` and a CLI added when their slices begin.
Repository selection is resolved; ecosystem-map admission remains separate.

The repository is cloned locally; the initial package path is:

`/home/charlie/.codex/.chatgpt-projects/g-p-69e940d828448191a0e48c14122df12d/forge-hud-implementation/forge-hud-svelte/`

This checkout allows implementation without editing application checkouts or
inventing a canonical ecosystem mount. Before live integration, confirm package
naming, distribution/versioning and consumer dependency mechanism. Repository
creation is no longer pending. Publishing packages and deployment remain separate.

The initial package owns presentation roles, projection validation, tokens, motion,
accessibility behavior, primitives and a simulated showcase. It does not own
business-state transitions, readiness truth, allowed actions, approval resolution,
evidence signing, backend commands or ecosystem halt authority.

Application adapters supply native state and validated display projections through
props. Actions are callbacks into the existing application workflow. Profile labels
may use calmer wording, but cannot change operational, authority or evidence meaning.

## Resolved conflicts

| Conflict | Reconciled rule |
| --- | --- |
| Grammar assumes an existing Svelte package; older spec plans its creation | Add package establishment to the first implementation slice. Missing package is a deliverable, not a global blocker |
| Rust P1 precedes everything in older roadmap | Existing application backends supply truth for the first proof. Shared Rust extraction remains a later, independently verified migration |
| Profile P7 depends on fatigue/compliance | Minimal presentation profiles and validation move to the beginning; advanced profile fields arrive with their capabilities |
| New ForgeAuthorityGate versus existing UGA/NextAction | First proof applies a presentation contract to existing action surfaces; no second action resolver |
| SMITH locked includes execution and verification | Lock is an interaction constraint. It does not override a valid working/verifying operational role or imply human approval |
| Command halt means pending decisions or service down | Source-qualified adapters distinguish awaiting_authority, degraded/unavailable and an explicit emergency halt. Never map by name alone |
| Unknown and cold-start defaults can appear quiet | Missing/invalid projection renders visibly unavailable with actions disabled; it never invents idle, ready or success |
| Predictive priming uses 90%/60-second heuristics | First proof supports a simulated primed fixture. Live priming requires an authoritative prediction/eligibility input; elapsed time or frontend percentages never grant permission |
| CDI heartbeat versus stable motion vocabulary | Blocked/critical remain static. Any later fatigue cue is separate, optional and reduced-motion compatible; no heartbeat overrides role meaning |
| Transient rails versus persistent truth | Separate notification events from persistent state. Reuse SMITH's existing persistent degradation handling |
| --hud-* versus --forge-ui-* | Preserve --hud-* compatibility at adapter/profile boundary; grammar primitives consume --forge-ui-* aliases. Migrate only reviewed tokens; no global rename |
| Signed Governance Receipts versus evidence seals | Seal displays an existing evidence record. Receipt creation/signing stays backend-owned and is a later capability. Simulator emits no authority-bearing receipts |
| 280/350 test counts and 1,550 existing tests | Preserve these as historical estimates. Gates require current behavior coverage and regression evidence, not reaching a numerical quota |
| Tarcie capture donor versus reviewer UI | First real creator proof is AuthorForge. Tarcie gets a simulated review profile now; live Tarcie adoption waits for target selection and product-contract reconciliation |
| Missing status-indicators.ts | Keep its migration explicitly unresolved. It does not block new standalone primitives or independently inspected adapters |

## Unified delivery sequence

These stages supplement the original CP identifiers rather than silently reusing
them with different meanings. Tests and documentation accompany each stage.

| Stage | Work and source alignment | Exit evidence |
| --- | --- | --- |
| R0 — Reconcile and lock | Grammar CP0/WP00; ForgeHUD extraction inventory. Preserve observed commits and reuse rulings; record package creation and source-specific open items | This amendment, scoped allowlist, conflict decisions and pinned initial fixtures. Historical GATE-00 remains unresolved as a whole; do not relabel it passed |
| R1 — Package and contracts | Grammar CP1/WP01–02 plus minimal ForgeHUD P2/P3/P7. Establish Svelte package, strict projection/profile validation, role/channel types, motion and token contracts | Standalone import/build/type check; runtime unknown/missing/contradictory-input tests; source-qualified SMITH and Command fixture mappings; accessibility/motion matrix |
| R2 — Four-surface proof and simulator | Grammar CP2/WP03–04. ProcessGlyph, StatusCapsule, EvidenceSeal and authority visual contract; simulated SMITH, Command, AuthorForge and reviewer skins | All roles including visible projection errors; two-skin equivalence; keyboard/focus, reduced-motion, high-contrast, label/icon, timer-suppression and visual regression evidence; conspicuous simulation marking |
| R3 — HUD adapter extraction | Grammar CP3/WP05; bounded portions of ForgeHUD P2–P4/P7. Wire reusable presentation into footer/rail/lock/NextAction interfaces | Two application contract fixtures and two skins; emergency halt presentation overrides ordinary state; no app-store imports inside shared package; actions stay callbacks |
| R4 — Operator pilot | Grammar CP4/WP06; bounded ForgeHUD P8. One Command status/approval slice and one SMITH status/NextAction slice | Real-state integration, persistent degradation, provenance and allowed-action fidelity; current baseline tests and focused browser evidence; reversible per-surface adoption |
| R5 — Creator and reviewer proof | Grammar CP5/WP07. One AuthorForge slice with live data; reviewer skin fixtures | Equivalent meaning with calmer wording/density; provenance retained. Tarcie live integration remains deferred until its product/repository target is resolved |
| R6 — Regression and bounded rollout | Grammar CP6–7/WP08–09; bounded ForgeHUD P10–P11 | Matrix across adopted surfaces; no silent unknowns or source/severity collisions; accessibility/manual review; migration evidence and docs for actually delivered behavior |
| R7 — Remaining ForgeHUD capability tracks | Remaining backend, compliance, fatigue, multi-context and developer-tool work | Separate acceptance per capability; full ForgeHUD specification is complete only after retained obligations below are verified or explicitly amended |

R1/R2 can run on pinned fixtures without a live backend, brand PDF, Tarcie target
or the missing historical status helper. Those gaps still block their affected
fidelity/integration claims. Before R4/R5, refresh selected application revisions
and read their current governing instructions; old snapshots are not current HEAD.

## Full-roadmap preservation

| Older obligation | Disposition and dependency |
| --- | --- |
| Rust pipeline/guard/readiness core and Tauri commands (P1/E1) | Retained in R7 backend extraction. Compare current implementations first; migrate existing authority explicitly, never install a second source of truth |
| Emergency overlay, halt and backend-cleared resume | Visual projection and disabled-action proof required in R2/R3. Backend signal/clearance unification retained in R7; frontend cannot clear a halt |
| Tier 1 chevrons, pipeline, lock and session components | Extract only necessary adapters in R3; remaining reusable component coverage tracked in R7 |
| Nine stores and all component inventory | Minimal local/derived display state first. Remaining stores/components retained in R7; no empty stubs counted as delivery |
| Full UGA resolution and semantic blocker ordering | Existing application resolver reused initially. Portable resolver extraction, if needed, is a separate R7 equivalence proof |
| Compliance maps, GRL and delta/time-travel views | Retained in R7 evidence/compliance track; consume real evidence and freshness |
| Cryptographically signed governance receipts | Retained in R7 backend evidence track; separate from visual evidence state and simulation |
| CDI/fatigue, cooldown and MAID | Existing application behavior preserved. Shared extraction retained in R7 safety track; clearance remains backend-owned |
| ONNX prediction and optional biometric signals | Retained as later evaluated capability; >70% forecast accuracy needs a defined metric, dataset, consent/privacy boundary and measured evidence |
| Haptic/audio cues | Later optional accessibility-aware capability; revised so it cannot contradict static blocked/critical semantics |
| Multi-context stacking and anchoring | R3 interfaces may allow contexts; full stacking/sparklines retained in R7 after single-context proof |
| Contract debugger and shadow transitions | Deterministic marked fixtures in R2; actual contract hot reload and graph tooling retained in R7 |
| CLI validate/check/diagram/test | Local validation tests in R1; distributable CLI retained in R7. “100% invalid profiles” must be bounded to a specified schema/domain and tested cases, not claimed universally |
| AI inspector and forecasts | Retained as advisory later work; no authority delegation. Research accuracy claims in source are not adopted as implementation evidence |
| Mobile/native plugins and notifications | Deferred until target platform and capabilities are specified; no broad permissions added by UI work |
| Marketplace, contract migration utilities, optional formal verification and telemetry | Separate later roadmap items. Public marketplace remains outside UI Grammar v0.1 scope |
| Reference profiles including TradeForge and Leopold | Later profiles; initial proof uses SMITH, Command, AuthorForge and a simulated reviewer skin |
| Bundle <200KB | Retained budget; define compression mode and dependency accounting before measuring package artifact |
| Integration guide/API/profile cookbook | Incremental docs per slice; full coverage and <30-minute onboarding target validated at full-toolkit closeout |

## Initial R1 file allowlist

All paths are relative to the local implementation root stated above. This is an
exact proposed first-slice boundary, not evidence that these files exist or pass.
Dependency installation may generate the selected package manager's lockfile,
listed here as `package-lock.json`; use one package manager for this new workspace.

```text
package.json
package-lock.json
tsconfig.json
svelte.config.js
vite.config.ts
src/index.ts
src/grammar/roles.ts
src/grammar/types.ts
src/grammar/validate.ts
src/grammar/motion.ts
src/grammar/profiles.ts
src/theme/grammar.css
tests/fixtures/smith.json
tests/fixtures/forge-command.json
tests/fixtures/authorforge.json
tests/fixtures/reviewer-simulated.json
tests/grammar.test.ts
tests/profiles.test.ts
docs/authority-boundary.md
docs/accessibility-matrix.md
README.md
```

R1 does not implement components, business-state engines, application migrations,
Rust code, receipt signing or package publication. R2 gets a fresh component/test
allowlist once R1 establishes public types and validation behavior. App integration
allowlists name actual refreshed source files at their own stage.

## Completion and open decisions

There are two completion claims:

- **UI Grammar first delivery:** R1–R6 proven for bounded operator and creator
  surfaces, with Tarcie live adoption explicitly recorded as remaining scope if
  unresolved. Do not claim all original plan obligations closed while that work remains.
- **Full ForgeHUD toolkit:** retained R7 obligations individually reconciled and
  verified; a four-primitive proof is not completion of the 22-component roadmap.

Resolved here: logical package ownership, package creation as work, minimal
dependency order, action reuse, semantic conflict policy and scoped deferrals.

Still needed at the appropriate stage: distribution and canonical mount admission
before live dependency adoption; exact Tarcie target before Tarcie integration;
status-indicators source before its migration; brand/source-table fidelity before
claiming exact visual compliance; measured datasets/toolchains for advanced features.
None of those requires pretending that a planned package already exists.

Next implementation action: establish the standalone R1 package and validate the
projection/profile contract against the pinned SMITH and Command fixtures.
