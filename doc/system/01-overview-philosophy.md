## 1. Overview and philosophy

ForgeHUD is the shared governance-presentation toolkit owned by
`Boswell-Digital-Solutions/forge-hud`. Its intended consumers are Forge applications
with existing operational state and governed user actions.

Current code snapshot — 2026-09-27: this repository contains documentation,
implementation planning and source-evidence metadata. No Svelte package, Rust crate,
CLI, runtime service or published artifact exists in this checkout.

The repository owns the portable presentation contract. It does not own application
business state, approval authority, canonical operational memory or evidence signing.
Visual state must reflect reported truth. A profile may change wording and density,
but must never turn blocked into success or human-required into automatic.

The initial planned package is `forge-hud-svelte`. UI Grammar is part of that package,
not a competing toolkit. Later Rust and CLI work remains planned, not implemented.
