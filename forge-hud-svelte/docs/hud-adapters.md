# Single-context HUD adapters

R3 supplies presentation interfaces, not application-store bindings. Call `projectHud`
with the application's `snapshot`, native `mapping`, cosmetic `profile`, optional
`sessionLabel`, and optional `actions: { id, label }[]`. Snapshot/mapping/profile
validation remains the R1 `projectState` boundary. Session and action labels are
bounded display metadata; malformed metadata suppresses the entire action list and
returns `configurationIssues`. It cannot erase an explicit emergency halt.

```svelte
<script lang="ts">
  import { projectHud, ForgeHudFooter, ForgeHudRail, ForgeNextAction } from '@forgehud/svelte';
  import '@forgehud/svelte/theme.css';
  // Define snapshot, mapping, profile and action labels in the consuming app.
  // Recompute this projection whenever producer state changes.
  let hud = $derived(projectHud({ snapshot, mapping, profile, actions }));
</script>

<ForgeHudFooter {hud} elapsed="00:12" />
<ForgeHudRail {hud} announce={false} />
<ForgeNextAction {hud} announce={false} onrequest={requestExistingApplicationAction} />
```

The snippet illustrates consumer wiring; application variables and the callback must
be supplied by the consuming app. The callback revalidates the current request
through its existing NextAction/UGA/backend authority path. Shared code never selects
a remediation, calls an app store, grants permission or clears a halt.

- `ForgeHudFooter`: wrapping status strip, session label, lock, separate elapsed text,
  and keyboard-operable native details. No global keyboard shortcut or fixed placement.
- `ForgeHudRail`: one context's status, lock and evidence. No context arbitration,
  stacking, polling or session selection.
- `ForgeLockIndicator`: interaction constraint only. Working plus locked stays working;
  unlocked does not mean authorized.
- `ForgeNextAction`: existing status and authority primitives composed with the
  application's labels and callback. The authority gate checks current model IDs and
  suppression conditions at invocation. An absent callback leaves buttons disabled.

Choose one announcement owner when rendering the same context in several places;
all three containers default `announce` to true for standalone use. Timers belong
outside the live region. Simulation is visibly labeled and action-disabled. The proof
page at `/adapters.html` uses synthetic SMITH and Command fixtures. Both operator and
plain skins retain semantics; Command's decision-lane `halt` maps to awaiting approval,
while an explicit `emergencyHalt` overrides the ordinary role.

Read-only source observations are recorded in
[the R3 baseline](../../docs/plans/forge-ui-grammar/r3-source-baseline.json).
These are local commit/file hashes, not refreshed remote production contracts.
Application-owned mapping fixtures demonstrate the seam; no source application was
modified. R4 must refresh the selected app baseline and bind real producer data.

No legacy token migration is performed in R3. Existing application `--hud-*` variables
remain untouched. Shared primitives use `--forge-ui-*`; any compatibility aliases
must be explicitly reviewed against the chosen consumer before migration. Numeric
trust/readiness metrics, UGA remediation selection, backend resume clearance,
multi-context stacking and missing `status-indicators.ts` extraction remain deferred.
