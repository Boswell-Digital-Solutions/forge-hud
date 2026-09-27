<script lang="ts">
  import type { HudPresentation } from '../adapters/hud.js';
  import ForgeProcessGlyph from './ForgeProcessGlyph.svelte';
  import ForgeLockIndicator from './ForgeLockIndicator.svelte';
  let { hud, elapsed = '', announce = true }: {
    hud: HudPresentation; elapsed?: string; announce?: boolean;
  } = $props();
</script>
<footer class="forge-ui forge-surface forge-hud-footer" data-density={hud.model.profile?.density}
  data-contrast={hud.model.profile?.contrast} data-motion={hud.model.profile?.motion}
  data-severity={hud.model.severity} aria-label="HUD footer">
  {#if hud.model.simulation}<strong class="forge-simulation">Simulated — no live connection</strong>{/if}
  <span>{hud.model.source?.id ?? 'Unknown source'} / {hud.model.source?.context ?? 'Unknown context'}</span>
  <ForgeProcessGlyph model={hud.model} />
  <ForgeLockIndicator model={hud.model} />
  <span>Severity: {hud.model.severity}</span>
  <span>Evidence: {hud.model.evidence} · Freshness: {hud.model.freshness}</span>
  {#if hud.sessionLabel}<span>Session: {hud.sessionLabel}</span>{/if}
  {#if elapsed}<span aria-live="off">Elapsed: {elapsed}</span>{/if}
  <details><summary>Status details</summary><p>{hud.model.reason}</p>
    {#if hud.model.anticipatedAction}<p>Upcoming: {hud.model.anticipatedAction} — not yet available</p>{/if}
    {#if hud.model.emergencyHalt}<p>Stopped by {hud.model.emergencyHalt.source}: {hud.model.emergencyHalt.reason}</p>{/if}
    {#each hud.configurationIssues as issue}<p>{issue}</p>{/each}
  </details>
  {#if announce}<span class="forge-sr-only" aria-live={hud.model.simulation ? 'polite' : hud.model.announcement.politeness} aria-atomic="true">{hud.model.announcement.text}</span>{/if}
</footer>
