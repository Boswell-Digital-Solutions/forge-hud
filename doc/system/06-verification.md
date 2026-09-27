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
