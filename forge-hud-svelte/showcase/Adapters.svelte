<script lang="ts">
  import { onMount } from 'svelte';
  import { projectState, ForgeBackendActivity, PROVIDERS, activityState, ROLES } from '../src/index.js';
  import type { BackendActivity, ProviderId } from '../src/index.js';
  let backend = $state<BackendActivity['backend']>('yellowjacket');
  let provider = $state<ProviderId | ''>('openai');
  let status = $state('scenario');
  const activity = $derived({ backend, provider: provider || null, model: null } satisfies BackendActivity);
  const scenarios = [
    { id: 'contract', name: 'Application contract', source: 'forge_contract_core', context: 'contracts', steps: [
      { role: 'scanning', step: 'Check', reason: "Comparing this application's requests against its registered contract." },
      { role: 'blocked', step: 'Mismatch', reason: "Two fields don't match the registered schema. This simulated release is held for review." },
      { role: 'complete', step: 'Satisfied', reason: 'The simulated check is complete. No real release gate has changed.' },
    ] },
    { id: 'smith', name: 'SMITH pipeline', source: 'smith', context: 'pipeline', steps: [
      { role: 'idle', step: 'Queued', reason: 'Waiting for a runner to pick up this simulated pipeline.' },
      { role: 'working', step: 'Working', reason: 'Execution is underway. Changes are locked until this step finishes.' },
      { role: 'awaiting_authority', step: 'Decision', reason: 'The pipeline is holding for your decision before continuing.' },
      { role: 'complete', step: 'Complete', reason: 'The simulated pipeline has finished. No changes were applied to a live system.' },
    ] },
    { id: 'command', name: 'Forge Command decision', source: 'forge_command', context: 'decisions', steps: [
      { role: 'awaiting_authority', step: 'Decision', reason: 'A plan is ready for review and needs your authorization.' },
      { role: 'working', step: 'Working', reason: 'The simulated plan is in progress. Changes are locked during execution.' },
      { role: 'complete', step: 'Recorded', reason: 'The simulated decision sequence is complete. No live decision was recorded.' },
    ] },
  ];
  let selected = $state(1);
  let phase = $state(1);
  let plain = $state(false);
  let halt = $state(false);
  let details = $state(false);
  let elapsed = $state(0);
  const scenario = $derived(scenarios[selected]!);
  const current = $derived(scenario.steps[phase]!);
  const role = $derived(status === 'scenario' ? current.role : status === 'stale' || status === 'unknown' ? 'working' : status);
  const model = $derived(projectState({
    source: scenario.source, context: scenario.context, nativeState: role,
    observedAt: '2026-09-27T12:00:00.000Z', severity: ['blocked', 'failed'].includes(role) ? 'blocked' : role === 'degraded' ? 'attention' : 'neutral',
    authority: role === 'awaiting_authority' ? 'human-required' : 'automatic', evidence: role === 'verifying' ? 'verifying' : 'unverified',
    freshness: status === 'stale' ? 'stale' : status === 'unknown' ? 'unknown' : 'current', locked: ['working', 'scanning', 'verifying', 'orchestrating', 'blocked', 'halted'].includes(role), simulation: true,
    reason: status === 'scenario' ? current.reason : `Synthetic ${status} preview. No live backend connection.`, allowedActionIds: [],
    ...(role === 'primed' ? { anticipatedAction: 'Next simulated pipeline step' } : {}),
    ...(halt || role === 'halted' ? { emergencyHalt: { source: 'simulator', reason: 'Explicit synthetic emergency stop.' } } : {}),
  }, { version: 1, owner: scenario.source, mappings: ROLES.map(role => ({
    source: scenario.source, context: scenario.context, nativeState: role, role,
  })) }, { id: 'workspace-preview', language: plain ? 'plain' : 'operator', density: 'standard', contrast: 'standard', motion: 'standard', sourceAccent: '#56616E' }));
  const visual = $derived(activityState(model));
  const tone = $derived(visual.tone);
  const time = $derived(`${Math.floor(elapsed / 60).toString().padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')}`);
  onMount(() => { const timer = setInterval(() => elapsed += 1, 1000); return () => clearInterval(timer); });
  function select(index: number) { selected = index; phase = 0; status = 'scenario'; }
  function tabKey(event: KeyboardEvent, index: number) {
    const next = event.key === 'ArrowRight' ? (index + 1) % scenarios.length : event.key === 'ArrowLeft' ? (index + scenarios.length - 1) % scenarios.length : event.key === 'Home' ? 0 : event.key === 'End' ? scenarios.length - 1 : null;
    if (next !== null) { event.preventDefault(); select(next); document.getElementById(`tab-${next}`)?.focus(); }
  }
</script>

<div class="wrap">
  <header class="mast"><div class="brand">ForgeHUD <span>workspace preview</span></div><div class="sim">Simulated preview. No live connection. Actions disabled.</div></header>
  <main>
  <section class="intro"><h1>Your work, at a glance.</h1><p>Track progress, inspect evidence, and see what needs you, all in one place.</p></section>
  <div class="controls">
    <div class="tabs" role="tablist" aria-label="Scenario">
      {#each scenarios as item, index}
        <button role="tab" id={`tab-${index}`} aria-selected={selected === index} aria-controls="scenario-panel" tabindex={selected === index ? 0 : -1} onclick={() => select(index)} onkeydown={event => tabKey(event, index)}>{item.name}</button>
      {/each}
    </div>
    <div class="tools">
      <label class="switch"><input type="checkbox" bind:checked={plain}> Plain language</label>
      <button class="btn" disabled={halt || status !== 'scenario' || phase === scenario.steps.length - 1} onclick={() => phase += 1}>Step forward</button>
      <button class="btn halt" aria-pressed={halt} onclick={() => halt = !halt}>{halt ? 'Reset simulated halt' : 'Emergency halt'}</button>
    </div>
  </div>
    <section class="activity-controls" aria-label="Backend preview controls">
      <label>Backend<select aria-label="Backend" bind:value={backend}><option value="yellowjacket">Yellowjacket</option><option value="neuroforge">NeuroForge</option></select></label>
      <label>LLM provider<select aria-label="LLM provider" bind:value={provider}>{#each Object.entries(PROVIDERS) as [id, item]}<option value={id}>{item.label}</option>{/each}<option value="">Unknown provider</option></select></label>
      <label>Activity state<select aria-label="Activity state" bind:value={status}><option value="scenario">Follow scenario</option>{#each ROLES as role}<option value={role}>{role.replaceAll('_', ' ')}</option>{/each}<option value="stale">Stale update</option><option value="unknown">Freshness unknown</option></select></label>
    </section>
    <div role="tabpanel" id="scenario-panel" aria-labelledby={`tab-${selected}`} tabindex="0">
      <section class="readout" style={`--tone:var(--t-${tone})`} aria-labelledby="state-text" data-role={model.role}>
        <p class="src">{scenario.source} / {scenario.context}</p>
        <div class="activity-readout"><ForgeBackendActivity {model} {activity} size="large" showStatus={false} /><h2 class="state"><span id="state-text">{visual.label}</span></h2></div>
        <p class="desc">{halt ? 'This simulated workflow is stopped. Reset the preview halt to resume exploring.' : model.reason}</p>
        <ol class="track" aria-label="Steps">
          {#each scenario.steps as step, index}<li class:done={index < phase} class:now={index === phase} aria-current={index === phase ? 'step' : undefined}><div class="bar"></div><span class="lbl">{step.step}</span></li>{/each}
        </ol>
      </section>
      <div class="grid">
        <section class="panel" aria-labelledby="evidence-heading">
          <h2 id="evidence-heading">Status &amp; evidence</h2>
          <dl><dt>{plain ? 'How serious' : 'Severity'}</dt><dd>{model.severity}</dd><dt>{plain ? 'Proof' : 'Evidence'}</dt><dd>{plain && model.evidence === 'unverified' ? 'Not yet confirmed' : model.evidence === 'unverified' ? 'Unverified' : model.evidence}</dd><dt>{plain ? 'Last update' : 'Freshness'}</dt><dd>{model.freshness} · simulated snapshot</dd><dt>{plain ? 'Editing' : 'Changes'}</dt><dd>{model.locked ? 'Locked' : 'Unlocked'} · actions disabled</dd></dl>
          <p class="note">{plain ? "This is sample data. Nothing has been independently confirmed." : 'Producer-reported simulation. No authenticated receipt is produced by this preview.'}</p>
        </section>
        <section class="panel" aria-labelledby="action-heading">
          <h2 id="action-heading">Next action</h2>
          <dl style="margin-bottom:1rem"><dt>{plain ? 'Who decides' : 'Authority'}</dt><dd>{model.authority === 'human-required' ? 'Your decision required' : model.authority}</dd></dl>
          <p class="next">{halt ? 'Review the simulated stop before continuing.' : model.role === 'awaiting_authority' ? 'Review the plan before authorizing the next step.' : model.role === 'blocked' ? 'Inspect the mismatch report and resolve the affected fields.' : model.role === 'complete' ? 'Nothing to do. This preview sequence is complete.' : 'Nothing to do yet. Results appear when this step finishes.'}</p>
          <button class="primary" disabled>Request decision review</button><span class="why">Disabled in this preview.</span>
        </section>
      </div>
    </div>
    <p class="hint">Switch scenarios, step through them, or trigger an emergency halt to see how the display responds.</p>
  </main>
</div>
<div class="sr-only" aria-live="polite" aria-atomic="true">{model.announcement.text} {backend}. {provider ? PROVIDERS[provider].label : 'Unknown provider'}.</div>
<footer class="statusbar" aria-label="HUD footer" style={`--tone:var(--t-${tone})`}>
  <div class="row"><span class="seg sb-sim">Simulated</span><span class="seg">{scenario.source}</span><span class="seg strong"><ForgeBackendActivity {model} {activity} /></span><span class="seg">{model.locked ? 'Locked' : 'Unlocked'}</span><span class="seg">Unverified</span><span class="seg">Session {time}</span><button class="details" aria-expanded={details} aria-controls="drawer" onclick={() => details = !details}>Details</button></div>
  <div class="drawer" id="drawer" hidden={!details}><a href="/activity.html" style="color:var(--t-attention)">Explore origin activity</a>. Synthetic source: {scenario.source} / {scenario.context}. {model.reason} No live authority, release, or signed receipt. Session time is preview time, not evidence freshness.</div>
</footer>
