# Accessibility and motion contract

R2 renders four proof surfaces. Chromium checks cover keyboard focus, reduced
motion, live-region timer exclusion, high contrast, forced colors, and two visual
baselines. Human screen-reader review remains outstanding.

| Role | Standard motion | Reduced motion | Required non-motion meaning |
| --- | --- | --- | --- |
| idle | none | none | label and neutral symbol |
| working | rotation, 1600ms | none | Working label and activity symbol |
| scanning | sweep, 2200ms | none | Scanning label |
| verifying | sweep, 2800ms | none | Verifying label and evidence channel |
| orchestrating | convergence, 2400ms | none | Coordinating label and symbol |
| awaiting_authority | pulse, 3600ms | none | Human approval wording and authority channel |
| primed | breath, 4000ms | none | Not yet available, producer preview, actions disabled |
| blocked | none | none | Blocked label, reason and distinct symbol |
| degraded | none | none | Persistent reduced-capability label |
| complete | arrival, 180ms, once | none | Static Complete label and check |
| failed | none | none | Failure label, reason and cross |
| halted | none | none | Critical stop label, halt source/reason and disabled actions |
| unavailable | none | none | Explicit missing/invalid status and validation issues |

Critical severity suppresses motion regardless of operational role. Motion helpers
return copies; renderers cannot mutate future motion decisions through a returned object.
CSS is scoped to `.forge-ui`; source accent and semantic colors have separate tokens.
Consumers set `data-density`, `data-motion` and `data-contrast` from validated profiles.
Forced-colors uses system surfaces/text. Axe reports no violations for the rendered operator and plain baseline scenarios.
This is bounded evidence, not full compliance certification.

The model requests polite ordinary announcements and assertive explicit emergency
halts. `announcementChanged` compares semantic text/politeness, not observation time.
Announcements include role, reason, severity, authority, evidence and freshness.
Elapsed time is intentionally excluded from this contract (`announceElapsed: false`).
Keep a visual timer outside the status live region and do not embed a changing timer
in the producer's reason. The helper cannot recognize arbitrary timer text in prose.

R2 acceptance: label plus icon/shape, static critical states, reduced-motion meaning,
focus visibility, keyboard controls, high-contrast/forced-colors rendering, no focus
stealing, timer quietness in a real live region, and screen-reader review. Any details
control must be a separately focusable element; status capsules are not implicitly
clickable. Bind animation only to elements marked `data-forge-motion`; keep semantic
labels outside that animation hook. Simulation marking must remain visible and spoken.

Simulated halts use polite live announcements; only non-simulated explicit halts
use assertive announcements. Status owns the shared live region; evidence and
authority panels retain readable labels without duplicate live announcements.
