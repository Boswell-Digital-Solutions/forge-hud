# R3 — single-context HUD adapters

Snapshot: 2026-09-27. Base: merged R2 at `cd3a71a`.
Scope: [R3 allowlist](r3-scope.json). Source observations:
[local source baseline](r3-source-baseline.json).

## Delivered

`projectHud` validates presentation metadata around the existing state projection.
Four reusable Svelte adapters expose footer, context rail, lock and Next Action
interfaces. They preserve locked-but-working, source-qualified Command decision
halts, and explicit emergency precedence. Actions remain application-owned IDs,
labels and callbacks through the existing authority gate. Malformed metadata cannot
leave a partial action list. Shared code imports no app store and owns no resolver.

A separate `/adapters.html` proof uses the existing synthetic SMITH and Command
contract fixtures with operator/plain skins. The footer owns announcements while
rail and Next Action copies are quiet. Timers remain outside live announcements.
Status regions accept contextual accessible labels to avoid duplicate landmark
names in composed interfaces. The existing callback harness now exercises the
Next Action wrapper and its underlying authority gate.

## Verification

- 99 contract tests pass, including 13 adapter cases.
- 12 Chromium tests pass, including two-contract semantics, emergency precedence,
  timer exclusion, one announcement owner, keyboard-operable footer details,
  callback forwarding/suppression, and mobile overflow checks.
- Axe reports zero violations in both adapter skin baseline scenarios, as well as
  the existing R2 scenarios. The first run exposed duplicate status landmark names;
  contextual labels fixed that composition issue.
- Operator/plain adapter screenshots were visually inspected and then compared
  in a normal regression run. Existing R2 baselines remain unchanged.
- Svelte check: zero errors and warnings. Package build succeeds.
- Canonical documentation build, link check and file-scope check pass.

## Boundaries and next work

This is presentation extraction, not live application integration. Baseline hashes
record read-only local checkout files and their commits, not a remote freshness
claim. No application repository was changed. No legacy CSS token migration,
numeric governance metric extraction, context stacking, backend halt clearance or
new authority resolution is included. Application `--hud-*` variables are untouched;
compatibility aliases await review against an actual consumer.

Human screen-reader review remains open before live adoption. Automated checks are
bounded Chromium evidence, not comprehensive accessibility certification. Next:
R4 bounded SMITH and Forge Command pilots, with refreshed consumer baselines,
explicit file scope and distribution/versioning decisions before live adoption.
