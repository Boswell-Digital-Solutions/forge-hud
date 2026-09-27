# Workspace reference implementation — 2026-09-27

The user-supplied `ForgeHUD workspace preview.html` is the visual reference for
`forge-hud-svelte/showcase/adapters.html`: light industrial surfaces, variable
Archivo typography, one dominant process readout, a step track, two supporting
panels and a docked footer. The preview also respects OS dark mode and reduced
motion. Archivo is bundled locally with its SIL Open Font License.

Three synthetic scenarios demonstrate an application contract, SMITH pipeline and
Forge Command decision. Existing `projectState` validation owns the role, label,
severity, authority, lock and announcement semantics. Scenario controls only
advance the preview; all application actions remain disabled. Completion does not
claim signed evidence or real release authority. A halt persists across scenario
switches and its reset affects only the simulation. Session time stays outside the
live region and is explicitly separate from snapshot freshness.

This is a showcase implementation, not a replacement of the exported components
or an update to the pinned consumer pilots. The lower-level component playground
remains at `/`; the reference workspace is at `/adapters.html`.

Verification: Svelte check, 99 contract tests, package build, documentation checks,
and 13 Chromium browser tests. Browser coverage includes scenario progression,
halt precedence, keyboard tabs, disclosure, quiet timer, reduced motion, mobile
width, and axe checks plus visual baselines in light operator/plain and dark mode.
