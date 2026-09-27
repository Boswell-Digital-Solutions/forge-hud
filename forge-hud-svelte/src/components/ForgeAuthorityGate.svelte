<script lang="ts">
  import type { DisplayModel } from '../grammar/types.js';
  let { model, actions = [], onrequest }: {
    model: DisplayModel;
    actions?: ReadonlyArray<{ id: string; label: string }>;
    /** Request only: consumer must revalidate through its existing authority backend. */
    onrequest?: (id: string) => void;
  } = $props();
  let eligible = $derived(model.valid && !model.simulation && !model.actionsDisabled && !model.locked && model.role !== 'halted' && model.role !== 'primed' && model.freshness === 'current' && model.authority !== 'unavailable' && !['stale','conflicted','invalid'].includes(model.evidence));
  function request(id: string) {
    if (eligible && model.allowedActionIds.includes(id)) onrequest?.(id);
  }
</script>
<section class="forge-ui forge-surface forge-authority" data-density={model.profile?.density} data-contrast={model.profile?.contrast} aria-label="Authority status">
  {#if model.simulation}<strong class="forge-simulation">Simulated · actions disabled</strong>{/if}
  <strong class="forge-channel-title">Authority: {model.authority}</strong>
  <p>{model.locked ? 'Interaction locked.' : model.simulation ? 'Actions are unavailable in this simulation.' : 'Requests use the application’s existing authority checks.'}</p>
  {#if model.emergencyHalt}<p>Stopped by {model.emergencyHalt.source}: {model.emergencyHalt.reason}</p>{/if}
  <div class="forge-actions">
    {#each actions as action}
      <button type="button" disabled={!eligible || !onrequest || !model.allowedActionIds.includes(action.id)} onclick={() => request(action.id)}>{action.label}</button>
    {/each}
  </div>
</section>
