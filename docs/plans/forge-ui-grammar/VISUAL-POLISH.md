# ForgeHUD visual polish — 2026-09-27

Scope: [presentation allowlist](visual-polish-scope.json).

The shared components and both showcase pages now use a smaller page header,
compact control panel, clearer process typography, quieter channel details and
consistent card spacing. Disabled actions use a dashed border and muted treatment;
keyboard focus and enabled-action behavior are preserved. Simulation marking stays
visible on standalone surfaces. Evidence wording is shorter without implying an
authenticated receipt. The context rail no longer repeats the lock indicator already
present in its status capsule.

Showcase header/footer rules are now scoped to the page shell. Previously the global
footer rule also constrained the reusable HUD footer to 700px and added page-footer
spacing; it now spans the available container width.

Validation: 99 contract tests, 12 Chromium tests, full Svelte check and package build
pass. Operator/plain visual baselines for both pages were regenerated; screenshots
were inspected and a normal comparison run passed. Axe reports no violations in
the four baseline scenarios. Existing motion, focus, semantic announcement and
callback-suppression tests remain passing. Human assistive-technology qualification
remains open.

This changes the ForgeHUD library and showcase only. Consumer applications retain
their pinned R3 source snapshots until a separately reviewed vendor update; this
visual pass does not silently alter the merged operator pilots or enable them.
