<div align="center">

  <img src="assets/forge-hud-banner.svg" alt="ForgeHUD Avionics Banner" width="100%">

  <br/>

  [![Stage: R2 Proof](https://img.shields.io/badge/Stage-R2%20Proof-ea580c?style=flat-square&logo=target)](#unified-delivery-sequence)
  [![Framework](https://img.shields.io/badge/UI-Svelte%205-ff3e00?style=flat-square&logo=svelte)](#package-and-contracts)
  [![License: MIT](https://img.shields.io/badge/License-MIT-0284c7?style=flat-square)](#)
  [![Master Caution](https://img.shields.io/badge/Emergency%20Halt-Authoritative-22c55e?style=flat-square)](#)

  <h3>Tactical Heads-Up Display &amp; UI Grammar for the Forge Ecosystem</h3>

  <p align="center">
    A props-driven, high-contrast visual projection engine built for operators and creators.<br/>
    Strictly separates presentation roles from backend authority.
  </p>

  <p align="center">
    <a href="#decision">Architecture Decision</a> •
    <a href="#unified-delivery-sequence">Delivery Roadmap (R0–R7)</a> •
    <a href="#resolved-conflicts">Authority Contracts</a> •
    <a href="#initial-r1-file-allowlist">R1 Allowlist</a>
  </p>

</div>

---
# ForgeHUD

Repository: `Boswell-Digital-Solutions/forge-hud`.

ForgeHUD is a shared governance-presentation library for Forge applications.
Current code snapshot — 2026-09-27: the private [Svelte package](forge-hud-svelte/README.md)
implements validated contracts, four Svelte presentation surfaces and a clearly
simulated showcase. Live application integration remains planned.

## Documentation Contract

- **Role:** library/toolkit repository; this README is the entrypoint overview.
- **Boundary:** ForgeHUD owns portable presentation. Existing applications/backends
  retain state, readiness, allowed actions and authorization authority.
- **Doc authority:** [doc/system/_index.md](doc/system/_index.md) and its generated
  [doc/fhdSYSTEM.md](doc/fhdSYSTEM.md) are the repository's canonical deep reference.
  Edit the modular chapters; never edit the generated aggregate directly.
- **Truth-class note:** dated status and measurements are snapshots. Planned
  capabilities are not implementation claims.

## Build and verify documentation

```bash
bash doc/system/BUILD.sh
python3 scripts/check_docs.py
```

Documentation needs no package installation. For the package, run `npm ci --ignore-scripts`,
`npm run check`, `npm test` and `npm run build` in `forge-hud-svelte/`.
Run `npm run dev` for the simulator and `npm run test:browser` for Chromium proof.
Prefix `fhd` and the documentation surface await central Forge registry admission;
local documentation checks do not claim ecosystem-wide certification.

## Implementation planning

- [Reconciled ForgeHUD and UI Grammar plan](docs/plans/forge-ui-grammar/RECONCILED-PLAN.md)
- [R2 results](docs/plans/forge-ui-grammar/R2-RESULT.md)
- [R2 file scope](docs/plans/forge-ui-grammar/r2-scope.json)
- [R1 file scope](docs/plans/forge-ui-grammar/r1-scope.json)
- [Source evidence manifest](docs/plans/forge-ui-grammar/evidence/source-lock.json)
- [Documentation metadata](doc/documentation-manifest.json)

The first contract delivery is `forge-hud-svelte`; see the [R1 results](docs/plans/forge-ui-grammar/R1-RESULT.md). Backend extraction,
receipt signing and advanced fatigue work remain later roadmap slices. Source
snapshot paths in the evidence manifest refer to the originating task-local CP0
packet, not source code shipped by this repository.
