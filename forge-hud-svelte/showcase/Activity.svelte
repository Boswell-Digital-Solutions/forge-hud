<script lang="ts">
  import { onMount } from 'svelte';
  import { createActivitySession, ForgeActivityList } from '../src/index.js';
  import type { ActivityObservation, ActivityScope, ActivitySessionStatus } from '../src/index.js';
  const profile = { id: 'origin-preview', language: 'operator', density: 'standard', contrast: 'standard', motion: 'standard', sourceAccent: '#56616E' };
  let selected = $state('business');
  let scope = $state<ActivityScope>({ plane: 'business-local', scopeId: 'demo-operator' });
  let session = createActivitySession({ plane: 'business-local', scopeId: 'demo-operator' });
  let connection = session.begin();
  let observations = $state<ActivityObservation[]>([]);
  let status = $state<ActivitySessionStatus>('synchronizing');
  let nowMs = $state(Date.now());
  // This is an in-memory simulated producer. Revisions are fixture data, not a network cursor.
  let feed = $state<ActivityObservation[]>([]);
  let revision = 0;
  function publish() { observations = session.observations(); status = session.status; nowMs = Date.now(); }
  function reset() {
    session.revoke();
    scope = selected === 'business' ? { plane: 'business-local', scopeId: 'demo-operator' }
      : { plane: 'public-app', scopeId: `demo-${selected}-session` };
    session = createActivitySession(scope);
    connection = session.begin();
    const apps = selected === 'business' ? ['forge-smithy', 'ForgeCommand'] : selected === 'review' ? ['tarcie-reviewer'] : ['Author-Forge'];
    feed = apps.map((appId, index) => ({ version: 1, scope: { ...scope }, origin: { appId, taskId: `task-${index + 1}` },
      requestId: `request-${index + 1}`, attemptId: '1', backend: index === 0 && selected === 'business' ? 'yellowjacket' : 'neuroforge',
      sequence: 0, observedAt: new Date().toISOString(), phase: index ? 'routed' : 'executing',
      provider: index ? 'google' : selected === 'review' ? 'deepseek' : 'anthropic', model: null, simulation: true }));
    revision = 0; connection.snapshot(feed, revision); publish();
  }
  function advance() {
    feed = feed.map(event => ({ ...event, sequence: event.sequence + 1, observedAt: new Date().toISOString(),
      phase: event.phase === 'routed' ? 'executing' : 'completed' }));
    for (const event of feed) connection.update(event, ++revision);
    publish();
  }
  function reconnect() { connection = session.begin(); connection.snapshot(feed, revision); publish(); }
  function disconnect() { connection.disconnect(); publish(); }
  function gap() { revision += 2; connection.update(feed[0], revision); publish(); }
  function revoke() { session.revoke(); feed = []; publish(); }
  onMount(() => { reset(); const timer = setInterval(() => nowMs = Date.now(), 1000); return () => { clearInterval(timer); session.revoke(); }; });
</script>

<div class="wrap">
  <header class="mast"><div class="brand">ForgeHUD <span>origin activity</span></div><div class="sim">Simulated preview. No live connection. Actions disabled.</div></header>
  <main>
    <section class="intro"><h1>Every task has an origin.</h1><p>See which app started the work, which backend is working, and which provider it reports.</p></section>
    <section class="activity-controls" aria-label="Simulation controls">
      <label>Preview audience<select bind:value={selected} onchange={reset}><option value="business">Business operator</option><option value="author">Author-Forge session</option><option value="review">Assigned review</option></select></label>
      <div class="tools">
        <button class="btn" onclick={advance} disabled={status !== 'connected' || feed.every(event => event.phase === 'completed')}>Advance simulated work</button>
        <button class="btn" onclick={disconnect} disabled={status !== 'connected'}>Disconnect feed</button>
        <button class="btn" onclick={reconnect} disabled={status === 'revoked' || status === 'connected'}>Reconnect snapshot</button>
        <button class="btn" onclick={gap} disabled={status !== 'connected'}>Simulate missed update</button>
        <button class="btn" onclick={revoke} disabled={status === 'revoked'}>Revoke audience</button>
        <button class="btn" onclick={reset}>Reset simulation</button>
      </div>
    </section>
    <p class="hint">Synthetic reports expire after 15 seconds without an update. Switching audience clears the previous session. These controls only change this preview.</p>
    <ForgeActivityList {observations} {scope} {status} {profile} {nowMs} staleAfterMs={15000} />
    <p class="hint"><a href="/adapters.html">Return to workspace preview</a></p>
  </main>
</div>
<style>a{color:var(--t-attention)}</style>
