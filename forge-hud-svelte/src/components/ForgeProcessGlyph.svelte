<script lang="ts">
  import type { DisplayModel } from '../grammar/types.js';
  import ForgeBackendActivity from './ForgeBackendActivity.svelte';
  import type { BackendActivity } from '../adapters/activity.js';
  let { model, activity = null }: { model: DisplayModel; activity?: BackendActivity | null } = $props();
</script>
<span class="forge-ui forge-glyph" data-role={model.role} data-motion={model.profile?.motion}>
  {#if activity}<ForgeBackendActivity {model} {activity} />{:else}
  <span class="forge-motion" aria-hidden="true" data-forge-motion={model.motion.kind}
    style:animation-duration={`${model.motion.durationMs}ms`}
    style:animation-iteration-count={model.motion.iterations === 'continuous' ? 'infinite' : model.motion.iterations}></span>
  <span aria-hidden="true">{model.symbol}</span><span>{model.label}</span>
  {/if}
</span>
