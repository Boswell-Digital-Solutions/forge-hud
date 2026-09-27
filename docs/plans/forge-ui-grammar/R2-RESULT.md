# R2 — presentation component proof

Snapshot: 2026-09-27. Based on merged R1 at `87e25e3`.
Scope: [R2 allowlist](r2-scope.json). This is a standalone presentation proof;
R3 adapters and live application migration are not included.

## Delivered

- `ForgeProcessGlyph`: fixed role label/symbol plus separate decorative motion.
- `ForgeStatusCapsule`: source, role, reason, severity, freshness, lock, forecast,
  simulation marking and one semantic live region. Elapsed text is outside it.
- `ForgeEvidenceSeal`: producer evidence and freshness labels; no receipt issuance.
- `ForgeAuthorityGate`: native buttons constrained by validated model IDs and current
  suppression conditions; callback requests only, no resolver or backend grants.
- Explicitly simulated SMITH, Forge Command, AuthorForge and reviewer showcase.
  All showcase actions are disabled. The separate authority test harness only
  increments an in-memory counter, with no network/backend action.
- Svelte-aware packaging with declarations and scoped CSS, plus Linux Chromium
  visual baselines for compact operator and calm plain-language profiles.

## Verification

- `npm run check`: zero errors and warnings.
- `npm test`: 86 contract tests pass.
- `npm run build`: Svelte package output succeeds.
- `npm run test:browser`: 8 tests pass, including all roles in all four profiles,
  evidence/freshness states, unavailable fallback, quiet timers, static critical
  states, OS/profile reduced motion, one-shot completion, high contrast,
  forced-colors visibility, keyboard focus and 375px layout.
- Callback harness verifies Enter-key activation and current-model suppression;
  unlisted action IDs remain disabled. Explicit non-simulated halt uses assertive
  announcement markup; simulated halt stays polite.
- Axe: zero violations in the operator/plain baseline scenarios. Both committed
  screenshots were visually inspected and then compared in a normal test run.
- Local `npm pack`: 25 files, including all four Svelte components and declarations.
  No registry publication.
- Dependency installation audit: zero reported vulnerabilities.
- Canonical documentation rebuilt and relative links checked.

## Open acceptance and limits

Human screen-reader review is still required; DOM/live-region checks do not prove
actual assistive-technology speech. Browser evidence is Chromium on Linux, not a
cross-browser or full accessibility certification. Two baseline screenshots are a
bounded regression sample, not every state/profile combination. Real consumers
must use a Svelte-aware bundler and revalidate callback requests through their
existing authority backend. No live source bindings, authenticated receipts, source
identity authentication, package publication or ecosystem admission are claimed.

Next code slice: R3 bounded presentation adapters, with a fresh file allowlist and
source baseline before any live consumer migration. Keep the human screen-reader
acceptance item open through that work.
