<script lang="ts">
  import ForgeBackendActivity from './ForgeBackendActivity.svelte';
  import { projectNeuroForgeReport } from '../adapters/neuroforge-stream.js';
  import type { NeuroForgeStreamReport, NeuroForgeStreamStatus } from '../adapters/neuroforge-stream.js';
  let { report, status, profile, nowMs, staleAfterMs }: {
    report: NeuroForgeStreamReport | null; status: NeuroForgeStreamStatus; profile: unknown; nowMs: number; staleAfterMs: number;
  } = $props();
  const visible = $derived(status === 'revoked' ? null : report);
  const hud = $derived(visible ? projectNeuroForgeReport(visible, status, profile, nowMs, staleAfterMs) : null);
  const freshness = $derived(!visible || !Number.isFinite(nowMs) || !Number.isFinite(staleAfterMs) || staleAfterMs <= 0 || nowMs < Date.parse(visible.observedAt) ? 'unknown'
    : !['receiving', 'finished'].includes(status) || nowMs - Date.parse(visible.observedAt) >= staleAfterMs ? 'stale' : 'current');
</script>
<section aria-label="NeuroForge request activity" class="stream-report">
  <p role="status" aria-live="polite" aria-atomic="true">Stream: {status}. {visible ? `Reported ${visible.phase}. Provenance ${visible.provenance.mode}. ${freshness}.` : 'No activity report available.'}</p>
  {#if visible}
    <h2>{visible.binding.origin.appId} · {visible.binding.origin.taskId}</h2>
    {#if hud?.activity}<ForgeBackendActivity model={hud.model} activity={hud.activity} />
    {:else}<p class="unknown">NeuroForge · Execution provenance unknown. No provider execution confirmed.</p>{/if}
    <p>{visible.provenance.mode === 'simulated' ? 'Simulated execution' : visible.provenance.mode === 'provider' ? 'Producer-reported provider execution' : 'Real or simulated execution not established'} · evidence unverified · actions disabled.</p>
    {#if visible.selection}<p>Selected route: {visible.selection.provider} · {visible.selection.model}. Selection does not prove execution.</p>{/if}
    <dl><dt>Request / attempt</dt><dd>{visible.binding.requestId} / {visible.binding.attemptId}</dd><dt>Execution</dt><dd>{visible.executionId}</dd><dt>Reported at</dt><dd><time datetime={visible.observedAt}>{visible.observedAt}</time></dd></dl>
  {:else}<p>{status === 'revoked' ? 'Access ended; reports cleared.' : 'Waiting for a report does not establish that the backend is idle.'}</p>{/if}
</section>
<style>
  .stream-report{background:var(--panel,#111418);color:var(--ink,#e7ebef);padding:1.25rem;border:1px solid var(--rule,#56616e);border-radius:.75rem;overflow-wrap:anywhere}
  h2{font-size:1.15rem}p,dl{font-size:.875rem}.unknown{font-weight:600}dl{display:grid;grid-template-columns:auto minmax(0,1fr);gap:.5rem 1rem}dt{color:var(--muted,#cbd5e1)}dd{margin:0}
  @media(max-width:40rem){dl{grid-template-columns:minmax(0,1fr)}}
</style>
