# ForgeHUD — System Documentation

> Shared governance presentation toolkit; R1–R3 components and default-off R4 consumer pilots implemented.

Protocol: BDS Documentation Protocol v2.0. Document version: 0.1.
Last updated: 2026-09-30.

This is the canonical repository-local deep reference. Ownership and invariants are
normative; dated observations are snapshots. The Svelte package and default-off
SMITH/Forge Command consumer pilots are implemented; rollout acceptance remains
open. This library has no resident service or startup endpoint.

Generated output: `doc/fhdSYSTEM.md`. Prefix `fhd` is locally selected; central
registration is pending. Edit source chapters, not the assembled artifact.

| Part | File | Contents |
| --- | --- | --- |
| §1 | `01-overview-philosophy.md` | Overview and philosophy |
| §2 | `02-architecture-authority.md` | Architecture and authority boundaries |
| §3 | `03-repository-structure.md` | Repository structure and tooling |
| §4 | `04-delivery-status.md` | Delivery status and plan relationship |
| §5 | `05-interfaces-safety.md` | Interface and safety contract |
| §6 | `06-verification.md` | Verification and evidence |
| §7 | `07-handover-maintenance.md` | Handover and documentation maintenance |

## Quick Assembly

```bash
bash doc/system/BUILD.sh
python3 scripts/check_docs.py
```

Planning companion: `docs/plans/forge-ui-grammar/RECONCILED-PLAN.md` from repository
root. Plans describe intended work; they do not supersede observed delivery status.

---

## 1. Overview and philosophy

ForgeHUD is the shared governance-presentation toolkit owned by
`Boswell-Digital-Solutions/forge-hud`. Its intended consumers are Forge applications
with existing operational state and governed user actions.

Current code snapshot — 2026-09-27: this repository contains documentation,
planning evidence and the private `forge-hud-svelte` R1 TypeScript package. It provides
projection/profile validation, display models, motion contracts and scoped CSS.
No Svelte components, Rust crate, CLI, live application integration or published artifact
exists yet.

The repository owns the portable presentation contract. It does not own application
business state, approval authority, canonical operational memory or evidence signing.
Visual state must reflect reported truth. A profile may change wording and density,
but must never turn blocked into success or human-required into automatic.

The initial package is `forge-hud-svelte`. UI Grammar is part of that package,
not a competing toolkit. Later Rust and CLI work remains planned, not implemented.

---

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

---

## 3. Repository structure and tooling

| Path | Purpose |
| --- | --- |
| `README.md` | Repository entrypoint and documentation contract |
| `doc/system/` | Canonical, editable repository system-reference chapters |
| `doc/fhdSYSTEM.md` | Generated assembled reference; do not edit directly |
| `doc/documentation-manifest.json` | Local documentation identity and central-registration status |
| `docs/plans/` | Planned work and local plan index; not implemented-system evidence |
| `docs/plans/forge-ui-grammar/evidence/` | Earlier source-lock and reference metadata |
| `scripts/check_docs.py` | Shape, index, relative-link and assembled-output checks |
| `forge-hud-svelte/` | Private R1 package, tests, fixtures and developer docs |

Documentation requires Bash, standard Unix tools and Python 3. The R1 package uses
TypeScript, Svelte 5 peer compatibility, Vite and Vitest; Node 20.19+ and npm are
required for its checks/build. The lockfile pins resolved dependencies. Rust/Tauri
implementation remains later work. Build products live in ignored `dist/` folders.

There are no runtime environment variables, service ports, startup commands or
credential requirements. Do not create placeholder operational configuration merely
to make a planned toolkit resemble a deployed service.

The source manifest was captured from other repositories at recorded revisions.
Its snapshot paths refer to the originating task's evidence packet. They are not
missing source files in this repo and must not be treated as locally executable code.

---

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

---

## 5. Interface and safety contract

The private R1 package exports `projectState`, `validateSnapshot`, `validateMapping`,
`validateProfile`, `motionFor`, `announcementChanged`, and types/constants. It validates
JSON-shaped data, not arbitrary classes or executable objects. Detailed API guidance
is in `forge-hud-svelte/README.md`. The rules below combine implemented data contracts
with rendering requirements that remain to be verified in R2.

- Planned components receive data and callbacks through props; R1 has no application-store imports.
- Profiles preserve semantic meaning across operator, creator and reviewer skins.
- Source identity and severity occupy separate channels even when colors coincide.
- Toasts describe events; persistent status describes current truth.
- Ordinary updates use polite announcements; elapsed timers do not repeatedly announce.
- Blocked and critical states are static and remain understandable without color.
- Reduced-motion and high-contrast modes preserve state meaning.
- Priming is advisory; frontend time/progress heuristics never grant authority.
- Evidence seals display underlying evidence state, not fabricated verification.
- Simulators are visibly marked and cannot emit authority-bearing receipts.

Backend command transport, receipt signing, emergency halt sources and resume
clearance remain owned by existing systems until separately migrated and verified.
No new network grants, telemetry collection, biometrics or cloud fallback is introduced
by the documentation or initial presentation scope.

---

## 6. Verification and evidence

Run from the repository root:

```bash
bash doc/system/BUILD.sh
python3 scripts/check_docs.py
```

The builder is deterministic: `_index.md` first, then flat numbered Markdown chapters
in lexical order with fixed separators. It writes only `doc/fhdSYSTEM.md` and includes
no generated timestamp. The checker rejects stale assembled output, malformed chapter
names, missing TOC entries and broken relative Markdown links in repository documents.

Package verification (run in `forge-hud-svelte/`):

```bash
npm ci --ignore-scripts
npm run check
npm test
npm run build
npm run test:browser
```

R1 has behavior-focused contract tests and a built-package import check. Further proof
includes unknown inputs, locked-but-working, approval versus emergency halt, persistent
degradation, source/severity separation, timer suppression, keyboard/focus behavior,
reduced motion, high contrast and equivalent meaning across skins.

R1 validation results are recorded in `docs/plans/forge-ui-grammar/R1-RESULT.md`.
R2 results are recorded in `docs/plans/forge-ui-grammar/R2-RESULT.md`, including
8 Chromium tests and operator/plain screenshots. No human screen-reader proof or
live application integration is claimed. Source-lock checks in the planning evidence describe earlier
application-source observations only.

Central documentation registry admission is pending. Local verification does not
claim a passed ecosystem-wide compliance gate.

R3 adapter results and refreshed local source hashes are recorded under
`docs/plans/forge-ui-grammar/`. The suite now includes 99 contract tests and 12
Chromium tests; R3 adds two-contract meaning, halt precedence, single announcement
ownership, footer keyboard details, mobile layout and two adapter visual baselines.

R4 consumer evidence is recorded in `docs/plans/forge-ui-grammar/R4-RESULT.md`.
The original pilot checks covered both consumers with focused tests and Chromium
producer doubles. A later disposable native run observed SMITH's idle pilot and
Command's stale decision pilot on the actual application routes. A later live
SMITH run observed the local pilot working and completing while the governed
ledger remained idle; the distinct sources are now explicit in SMITH draft PR
#156. These checks establish native mounting and selected renderer states, not
governed-ledger equivalence or screen-reader acceptance.
`python3 scripts/check_pilot_vendor.py /path/to/consumer` verifies the source
distribution against its pinned upstream Git commit.

---

## 7. Handover and documentation maintenance

Edit the numbered chapters and `_index.md`; rebuild the generated reference in the
same change. Add each new chapter to the index. Keep chapters flat and numbered
`01` through `99`; do not add numbered subdirectories or hand-edit the aggregate.

Canonical facts state ownership and boundaries. Snapshot facts carry an observation
date. Planned capabilities say they are not implemented. Change delivery status only
when code and relevant verification support the claim.

R1 contracts are implemented; read the reconciliation, package API and result before R2. Before editing a consumer, refresh
its baseline and read its own agent instructions. Preserve existing UGA/NextAction
logic, source provenance and backend clearance. No application runtime can currently
be launched from this repository.

The documentation prefix `fhd` was checked against the available central prefix
registry and found unused. It is a local selection pending central registration, not
an ecosystem admission claim. Record the prefix, repository topology and documentation
surface in the Forge workspace registries through their governed intake process.
Do not invent an ecosystem mount from the task-local checkout location.

Protocol sources used: Forge workspace `doc/BDS_DOCUMENTATION_PROTOCOL_v2.md` for
shape/build requirements; `docs/canonical/documentation_protocol_v1.md` for truth
classes and README contract; `doc/PREFIX_REGISTRY.md` for the prefix conflict check.
The three-character requirement in the current prefix registry takes precedence over
legacy two-character examples in the protocol. No central protocol files were changed.

---
