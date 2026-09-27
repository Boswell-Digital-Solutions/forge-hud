<script lang="ts">
  import type { DisplayModel } from '../grammar/types.js';
  let { model }: { model: DisplayModel } = $props();
  const symbols = { unverified: '○', verifying: '◇', verified: '✓', stale: '◷', conflicted: '△', invalid: '✕' };
</script>
<section class="forge-ui forge-surface" data-density={model.profile?.density} data-contrast={model.profile?.contrast} aria-label="Evidence status">
  {#if model.simulation}<strong class="forge-simulation">Simulated evidence</strong>{/if}
  <strong><span aria-hidden="true">{symbols[model.evidence]}</span> Evidence: {model.evidence}</strong>
  <p>Freshness: {model.freshness}</p>
  <p class="forge-meta">Producer-reported status. This display does not issue or authenticate a receipt.</p>
</section>
