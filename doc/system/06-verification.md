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
```

R1 has behavior-focused contract tests and a built-package import check. Further proof
includes unknown inputs, locked-but-working, approval versus emergency halt, persistent
degradation, source/severity separation, timer suppression, keyboard/focus behavior,
reduced motion, high contrast and equivalent meaning across skins.

R1 validation results are recorded in `docs/plans/forge-ui-grammar/R1-RESULT.md`.
No screen-reader proof, rendered visual regression matrix or live application
integration is claimed. Source-lock checks in the planning evidence describe earlier
application-source observations only.

Central documentation registry admission is pending. Local verification does not
claim a passed ecosystem-wide compliance gate.
