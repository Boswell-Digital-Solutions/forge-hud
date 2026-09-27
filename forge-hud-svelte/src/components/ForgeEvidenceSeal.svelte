<script lang="ts">
  import type { DisplayModel } from '../grammar/types.js';
  let { model }: { model: DisplayModel } = $props();
  const symbols = { unverified: '○', verifying: '◇', verified: '✓', stale: '◷', conflicted: '△', invalid: '✕' };
</script>
<section class="forge-ui forge-surface forge-evidence" data-density={model.profile?.density} data-contrast={model.profile?.contrast} aria-label="Evidence status">
  {#if model.simulation}<strong class="forge-simulation">Simulated</strong>{/if}
  <strong class="forge-channel-title"><span aria-hidden="true">{symbols[model.evidence]}</span> Evidence: {model.evidence}</strong>
  <p>Freshness: {model.freshness}</p>
  <p class="forge-meta">Producer-reported · not an authenticated receipt.</p>
</section>
