# R1 — package and presentation contracts

Observed 2026-09-27. Status: implemented and locally verified; R2 components and
application integrations have not started. This result does not close the original
full-scope GATE-00 or the complete ForgeHUD roadmap.

## Delivered

The private `forge-hud-svelte` package provides strict JSON-shaped snapshot, profile
and source-qualified mapping validation; all twelve presentation roles plus a visible
unavailable fallback; independent semantic channels; provenance; conservative action
suppression; explicit halt precedence; producer-supplied priming; stable labels and
symbols; motion descriptors; scoped tokens; and announcement-change detection.

Application mappings are separate from skins. The first fixture set covers pinned
SMITH and Forge Command vocabularies, an AuthorForge halt source and a synthetic
reviewer profile. All fixtures are simulated. No new backend authority, live state
adapter, approval resolver, network transport or evidence receipt is introduced.

The exact R1 source allowlist was used. Repository `.gitignore`, canonical status
documentation, the generated aggregate and this result were maintained alongside it;
these maintenance paths are recorded in `r1-scope.json`.

## Verification evidence

| Check | Observed result |
| --- | --- |
| `npm run check` | TypeScript strict check passed |
| `npm test` | 86 tests passed in 2 files, Vitest 4.1.11 |
| `npm run build` | ESM, declarations and CSS produced |
| Built public export import | `@forgehud/svelte` produced the expected working/locked fixture model |
| CSS export resolution | `@forgehud/svelte/theme.css` resolved to built token CSS |
| Svelte 5 consumer compile | Runes-based consumer compiled with no warnings |
| `npm pack --json --cache /tmp/forge-hud-npm-cache --pack-destination /tmp/forge-hud-r1-pack` | Local archive produced: 17 entries; 10,629 bytes compressed, 32,719 bytes unpacked |
| Dependency installation audit | Patched Vitest/Vite toolchain: zero reported vulnerabilities |

Archive sizes are observations of this R1 package, not the full toolkit's <200KB
bundle acceptance proof. No package was published. The initial pack attempt used an
unwritable default npm cache; rerunning with a writable temporary cache succeeded.
The initially selected Vitest 3 toolchain reported a moderate mocker advisory and was
replaced by patched Vitest 4.1.11 before final verification.

Tests exercise known role/channel contradictions, unknown and malformed inputs,
source/context collisions, frozen vocabularies, locked execution, pending-decision
versus emergency halt, halt survival through invalid profiles, priming without action
permission, stale/invalid evidence suppression, simulated action suppression, profile
isolation, persistent degradation, one-shot completion and quiet timestamp updates.

## Limits and next slice

This is a headless data-contract library compatible with Svelte 5. It has no rendered
components. The accessibility matrix defines R2 obligations; keyboard, focus, visual
regression, high-contrast measurements and screen-reader behavior are not proven yet.

The validator cannot authenticate a source or establish an application's business
semantics. Live mappings must be reviewed with the source owner; action handlers must
recheck permission at execution. Freshness comes from the producer; the library does
not own a stale-age policy. A reason containing a ticking timer can still cause noisy
announcements, so consuming applications must keep timers outside status prose.

R2 should implement the bounded proof surfaces and marked showcase using these
contracts, with a specific component/test allowlist and the required browser proof.
Central prefix admission, Tarcie target selection and the historical helper source
remain scoped follow-up work.
