<script lang="ts">
  import type { HudPresentation } from '../adapters/hud.js';
  import ForgeStatusCapsule from './ForgeStatusCapsule.svelte';
  import ForgeAuthorityGate from './ForgeAuthorityGate.svelte';
  let { hud, announce = true, onrequest }: {
    hud: HudPresentation; announce?: boolean; onrequest?: (id: string) => void;
  } = $props();
</script>
<section class="forge-ui forge-next-action" aria-label="Next action">
  <ForgeStatusCapsule model={hud.model} {announce} accessibleLabel="Next action process status" />
  {#each hud.configurationIssues as issue}<p>{issue}</p>{/each}
  <ForgeAuthorityGate model={hud.model} actions={hud.actions} {...(onrequest ? { onrequest } : {})} />
</section>
