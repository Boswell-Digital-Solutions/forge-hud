## 3. Repository structure and tooling

| Path | Purpose |
| --- | --- |
| `README.md` | Repository entrypoint and documentation contract |
| `doc/system/` | Canonical, editable repository system-reference chapters |
| `doc/fhdSYSTEM.md` | Generated assembled reference; do not edit directly |
| `doc/documentation-manifest.json` | Local documentation identity and central-registration status |
| `docs/plans/` | Planned work and local plan index; not implemented-system evidence |
| `docs/plans/forge-ui-grammar/evidence/` | Earlier source-lock and reference metadata |
| `scripts/check_docs.py` | Shape, index, relative-link and assembled-output checks |

Documentation requires Bash, standard Unix tools and Python 3. No dependency install
is needed. Svelte 5/TypeScript and a possible later Rust/Tauri integration are planned
technology choices, not installed runtime dependencies.

There are no runtime environment variables, service ports, startup commands or
credential requirements. Do not create placeholder operational configuration merely
to make a planned toolkit resemble a deployed service.

The source manifest was captured from other repositories at recorded revisions.
Its snapshot paths refer to the originating task's evidence packet. They are not
missing source files in this repo and must not be treated as locally executable code.
