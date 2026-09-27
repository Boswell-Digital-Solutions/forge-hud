<script lang="ts">
  import type { DisplayModel } from '../grammar/types.js';
  import ForgeProcessGlyph from './ForgeProcessGlyph.svelte';
  let { model, elapsed = '', announce = true }: { model: DisplayModel; elapsed?: string; announce?: boolean } = $props();
</script>
<section class="forge-ui forge-surface" data-density={model.profile?.density} data-contrast={model.profile?.contrast} data-motion={model.profile?.motion} data-severity={model.severity} aria-label="Process status">
  {#if model.simulation}<strong class="forge-simulation">Simulated — no live connection</strong>{/if}
  <div class="forge-source"><span class="forge-source-dot" style:background={model.sourceAccent ?? undefined} aria-hidden="true"></span>{model.source?.id ?? 'Unknown source'} · {model.source?.context ?? 'Unknown context'}</div>
  <ForgeProcessGlyph {model} />
  <p>{model.reason}</p>
  <p class="forge-meta">Severity: {model.severity} · Freshness: {model.freshness}{model.locked ? ' · Interaction locked' : ''}</p>
  {#if model.anticipatedAction}<p>Upcoming: {model.anticipatedAction} — not yet available</p>{/if}
  {#if elapsed}<span class="forge-meta" aria-live="off">Elapsed: {elapsed}</span>{/if}
  {#if announce}<span class="forge-sr-only" aria-live={model.simulation ? 'polite' : model.announcement.politeness} aria-atomic="true">{model.announcement.text}</span>{/if}
</section>
