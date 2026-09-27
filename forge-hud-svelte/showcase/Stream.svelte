<script lang="ts">
  import { onMount } from 'svelte';
  import { createNeuroForgeStream, ForgeNeuroForgeStream } from '../src/index.js';
  import type { NeuroForgeStreamReport, NeuroForgeStreamStatus } from '../src/index.js';
  const profile = { id: 'request-stream', language: 'operator', density: 'standard', contrast: 'standard', motion: 'standard', sourceAccent: '#56616E' };
  const binding = { scope: { plane: 'public-app' as const, scopeId: 'fixture-session' }, origin: { appId: 'Author-Forge', taskId: 'fixture-task' }, requestId: 'fixture-request', attemptId: '1' };
  let stream = createNeuroForgeStream(binding);
  let report = $state<NeuroForgeStreamReport | null>(null);
  let status = $state<NeuroForgeStreamStatus>('waiting');
  let nowMs = $state(Date.now());
  function publish() { report = stream.report(); status = stream.status; nowMs = Date.now(); }
  function send(kind: string, sequence: number, fields: Record<string, unknown>) {
    stream.accept(kind, { ...fields, activity_context: { version: 1, execution_id: 'exec_012345abcdef', sequence, observed_at: new Date().toISOString() } }); publish();
  }
  function reset() { stream.revoke(); stream = createNeuroForgeStream(binding); send('started', 0, { execution_id: 'exec_012345abcdef' }); }
  function route() { send('model_selected', 1, { provider: 'openai', model: 'requested-model' }); }
  function finish(mode: string) { send('completed', 2, { execution_id: 'exec_012345abcdef', success: true, provider: 'openai', model: 'requested-model', execution_provenance: { mode, provider: mode === 'provider' ? 'deepseek' : null, model: mode === 'provider' ? 'reported-model' : null } }); }
  function disconnect() { stream.close(); publish(); }
  function revoke() { stream.revoke(); publish(); }
  onMount(() => { reset(); const timer = setInterval(() => nowMs = Date.now(), 1000); return () => { clearInterval(timer); stream.revoke(); }; });
</script>
<div class="wrap">
  <header class="mast"><div class="brand">ForgeHUD <span>request stream</span></div><div class="sim">Fixture replay. No live request. Actions disabled.</div></header>
  <main>
    <section class="intro"><h1>Selection is not execution.</h1><p>Replay NeuroForge’s lifecycle payload shape through the real consumer adapter. Every result below is a fixture, including the provider-mode example.</p></section>
    <div class="controls" aria-label="Fixture controls">
      <button class="btn" onclick={route} disabled={status !== 'receiving' || report?.phase !== 'queued'}>Select route</button>
      <button class="btn" onclick={() => finish('provider')} disabled={status !== 'receiving' || report?.phase !== 'routed'}>Report provider result</button>
      <button class="btn" onclick={() => finish('simulated')} disabled={status !== 'receiving' || report?.phase !== 'routed'}>Report simulation</button>
      <button class="btn" onclick={() => finish('unknown')} disabled={status !== 'receiving' || report?.phase !== 'routed'}>Report unknown result</button>
      <button class="btn" onclick={disconnect} disabled={status !== 'receiving'}>Disconnect stream</button>
      <button class="btn" onclick={revoke} disabled={status === 'revoked'}>Revoke access</button>
      <button class="btn" onclick={reset}>Reset replay</button>
    </div>
    <ForgeNeuroForgeStream {report} {status} {profile} {nowMs} staleAfterMs={15000} />
    <p class="hint">No provider-start event exists in this stream. This view never animates inference from route selection. Reports expire after 15 seconds in this fixture replay.</p>
    <p><a href="/activity.html">Origin activity preview</a> · <a href="/adapters.html">Workspace preview</a></p>
  </main>
</div>
<style>a{color:var(--t-attention)}</style>
