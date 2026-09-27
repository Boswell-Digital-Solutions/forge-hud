# ForgeHUD — System Documentation

> Shared governance presentation toolkit; R1 presentation contracts implemented; rendered UI remains planned.

Protocol: BDS Documentation Protocol v2.0. Document version: 0.1.
Last updated: 2026-09-27.

This is the canonical repository-local deep reference. Ownership and invariants are
normative; dated observations are snapshots; R1 data contracts are implemented; UI and consumer integrations remain
planned, not implemented. This library has no resident service or startup endpoint.

Generated output: `doc/fhdSYSTEM.md`. Prefix `fhd` is locally selected; central
registration is pending. Edit source chapters, not the assembled artifact.

| Part | File | Contents |
| --- | --- | --- |
| §1 | `01-overview-philosophy.md` | Overview and philosophy |
| §2 | `02-architecture-authority.md` | Architecture and authority boundaries |
| §3 | `03-repository-structure.md` | Repository structure and tooling |
| §4 | `04-delivery-status.md` | Delivery status and plan relationship |
| §5 | `05-interfaces-safety.md` | Interface and safety contract |
| §6 | `06-verification.md` | Verification and evidence |
| §7 | `07-handover-maintenance.md` | Handover and documentation maintenance |

## Quick Assembly

```bash
bash doc/system/BUILD.sh
python3 scripts/check_docs.py
```

Planning companion: `docs/plans/forge-ui-grammar/RECONCILED-PLAN.md` from repository
root. Plans describe intended work; they do not supersede observed delivery status.
