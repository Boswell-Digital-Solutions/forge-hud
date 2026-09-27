# R4 — default-off operator pilot integrations

Snapshot: 2026-09-27. R3 merge verified at `514481a`.
[Scope](r4-scope.json) · [Consumer revisions and source hashes](r4-consumers.json).

## Implemented

- [Forge Command PR #365](https://github.com/Boswell-Digital-Solutions/Forge_Command/pull/365):
  one decision-status capsule inside the existing Cockpit slice, bound to
  `getDecisionsLaneState`. Existing Work navigation and approval controls remain.
- [SMITH PR #145](https://github.com/Boswell-Digital-Solutions/forge-smithy/pull/145):
  one pipeline-status capsule inside the Next Action card, bound to existing
  pipeline/readiness stores. Existing UGA and remediation callbacks remain.

Both are off unless `VITE_FORGE_HUD_PILOT=true` at build/dev time. Neither produces
allowed action IDs, changes authority rules, polls independently, or issues receipts.
Command decision `halt` remains awaiting approval; stale queues remain degraded.
SMITH locked execution remains working, with separate readiness severity. Unknown
or contradictory native states remain unavailable. Observation time is renderer
projection time; unknown backend freshness is explicitly retained.

## Distribution

Both consumers include 16 unchanged ForgeHUD source files pinned to the R3 merge,
with per-file SHA-256 provenance. This internal pilot distribution avoids an
unpublished package dependency and leaves package locks unchanged. Sources must not
be edited downstream. `scripts/check_pilot_vendor.py` compares every source byte
and hash against the pinned Git commit. Both consumers pass this check.

## Verification

| Check | Command | SMITH |
| --- | --- | --- |
| Focused and existing regression tests | 26 pass: pilot, HUD lanes, CockpitContent | 34 pass: pilot, pipeline authority, UGA config |
| Full Svelte check | 0 errors, 0 warnings | 0 errors, 0 warnings |
| Pilot-enabled production build | Pass | Pass |
| Chromium integration fixture | 1 pass | 1 pass |
| Screenshot inspection | Persistent degradation | Locked working |

The Chromium tests mount the actual consumer pilot components with clearly marked
producer doubles. They prove reactive state wiring and fail-closed presentation,
not backend connectivity or native acceptance. The test-only SMITH Vite configuration
uses an ESNext dependency target for current Chromium after its default optimizer
target failed against the existing cache. Production build configuration is unchanged.

Existing local dependencies were reused. Command used Node 22.21.1 for validation;
its declared deployment engine is Node 24, so Node 24 CI remains required. SMITH
used Node 20.19.6. No Rust changes were made or native qualification claimed.

![Command fixture: persistent degradation](r4-persistent-degradation.png)

![SMITH fixture: locked execution](r4-locked-working.png)

## Acceptance still open

R4 is implemented for opt-in evaluation, not fully accepted for rollout. Human
screen-reader review, live/native operator verification and CI review remain open.
Keep both defaults off until accepted. No source provides a new authenticated
emergency-halt feed in this slice. R5 creator work remains separate; it must not be
used to mark these acceptance items complete.
