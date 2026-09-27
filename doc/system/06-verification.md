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

For an implementation slice, add behavior-focused tests with its code. Planned proof
includes unknown inputs, locked-but-working, approval versus emergency halt, persistent
degradation, source/severity separation, timer suppression, keyboard/focus behavior,
reduced motion, high contrast and equivalent meaning across skins.

No runtime tests, screen-reader proof, visual regression matrix, release build or
package-size measurement has been executed for ForgeHUD. Source-lock checks in the
planning evidence describe earlier application-source observations only.

Central documentation registry admission is pending. Local verification does not
claim a passed ecosystem-wide compliance gate.
