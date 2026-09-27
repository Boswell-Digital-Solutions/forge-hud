## 5. Interface and safety contract

No public runtime API is implemented yet. The following rules govern the planned
interface and do not certify that enforcement code exists.

- Components receive data and callbacks through props; no application-store imports.
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
