<script lang="ts">
  import type { DisplayModel } from '../grammar/types.js';
  import ForgeProcessGlyph from './ForgeProcessGlyph.svelte';
  let { model, elapsed = '', announce = true, accessibleLabel = 'Process status' }: { model: DisplayModel; elapsed?: string; announce?: boolean; accessibleLabel?: string } = $props();
</script>
<section class="forge-ui forge-surface forge-status" data-density={model.profile?.density} data-contrast={model.profile?.contrast} data-motion={model.profile?.motion} data-severity={model.severity} aria-label={accessibleLabel}>
  {#if model.simulation}<strong class="forge-simulation">Simulated</strong>{/if}
  <div class="forge-source"><span class="forge-source-dot" style:background={model.sourceAccent ?? undefined} aria-hidden="true"></span>{model.source?.id ?? 'Unknown source'} · {model.source?.context ?? 'Unknown context'}</div>
  <ForgeProcessGlyph {model} />
  <p class="forge-reason">{model.reason}</p>
  <p class="forge-meta forge-channel-row">Severity: {model.severity} · Freshness: {model.freshness}{model.locked ? ' · Interaction locked' : ''}</p>
  {#if model.anticipatedAction}<p>Upcoming: {model.anticipatedAction} — not yet available</p>{/if}
  {#if elapsed}<span class="forge-meta" aria-live="off">Elapsed: {elapsed}</span>{/if}
  {#if announce}<span class="forge-sr-only" aria-live={model.simulation ? 'polite' : model.announcement.politeness} aria-atomic="true">{model.announcement.text}</span>{/if}
</section>
