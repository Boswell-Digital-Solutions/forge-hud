<script lang="ts">
  import type { HudPresentation } from '../adapters/hud.js';
  import ForgeStatusCapsule from './ForgeStatusCapsule.svelte';
  import ForgeEvidenceSeal from './ForgeEvidenceSeal.svelte';
  import ForgeLockIndicator from './ForgeLockIndicator.svelte';
  let { hud, announce = true }: { hud: HudPresentation; announce?: boolean } = $props();
</script>
<aside class="forge-ui forge-hud-rail" data-contrast={hud.model.profile?.contrast} aria-label="HUD rail">
  {#if hud.sessionLabel}<p>Session: {hud.sessionLabel}</p>{/if}
  <ForgeStatusCapsule model={hud.model} {announce} accessibleLabel="Rail process status" />
  <ForgeLockIndicator model={hud.model} />
  <ForgeEvidenceSeal model={hud.model} />
</aside>
