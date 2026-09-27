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
