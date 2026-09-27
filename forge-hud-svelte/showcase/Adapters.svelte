<script lang="ts">
  import { onMount } from 'svelte';
  import { projectState } from '../src/index.js';
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
  const model = $derived(projectState({
    source: scenario.source, context: scenario.context, nativeState: current.role,
    observedAt: '2026-09-27T12:00:00.000Z', severity: current.role === 'blocked' ? 'blocked' : 'neutral',
    authority: current.role === 'awaiting_authority' ? 'human-required' : 'automatic', evidence: 'unverified',
    freshness: 'current', locked: ['working', 'scanning', 'blocked'].includes(current.role), simulation: true,
    reason: current.reason, allowedActionIds: [],
    ...(halt ? { emergencyHalt: { source: 'simulator', reason: 'Explicit synthetic emergency stop.' } } : {}),
  }, { version: 1, owner: scenario.source, mappings: scenario.steps.map(step => ({
    source: scenario.source, context: scenario.context, nativeState: step.role, role: step.role,
  })) }, { id: 'workspace-preview', language: plain ? 'plain' : 'operator', density: 'standard', contrast: 'standard', motion: 'standard', sourceAccent: '#56616E' }));
  const tone = $derived(({ working: 'working', scanning: 'working', awaiting_authority: 'attention', blocked: 'warning', complete: 'success', halted: 'critical' } as Record<string,string>)[model.role] ?? 'neutral');
  const time = $derived(`${Math.floor(elapsed / 60).toString().padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')}`);
  onMount(() => { const timer = setInterval(() => elapsed += 1, 1000); return () => clearInterval(timer); });
  function select(index: number) { selected = index; phase = 0; }
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
      <button class="btn" disabled={halt || phase === scenario.steps.length - 1} onclick={() => phase += 1}>Step forward</button>
      <button class="btn halt" aria-pressed={halt} onclick={() => halt = !halt}>{halt ? 'Reset simulated halt' : 'Emergency halt'}</button>
    </div>
  </div>
    <div role="tabpanel" id="scenario-panel" aria-labelledby={`tab-${selected}`} tabindex="0">
      <section class="readout" style={`--tone:var(--t-${tone})`} aria-labelledby="state-text" data-role={model.role}>
        <p class="src">{scenario.source} / {scenario.context}</p>
        <h2 class="state" class:spin={model.role === 'working'}><span class="glyph" aria-hidden="true">{model.symbol}</span><span id="state-text">{model.label}</span></h2>
        <p class="desc">{halt ? 'This simulated workflow is stopped. Reset the preview halt to resume exploring.' : model.reason}</p>
        <ol class="track" aria-label="Steps">
          {#each scenario.steps as step, index}<li class:done={index < phase} class:now={index === phase} aria-current={index === phase ? 'step' : undefined}><div class="bar"></div><span class="lbl">{step.step}</span></li>{/each}
        </ol>
      </section>
      <div class="grid">
        <section class="panel" aria-labelledby="evidence-heading">
          <h2 id="evidence-heading">Status &amp; evidence</h2>
          <dl><dt>{plain ? 'How serious' : 'Severity'}</dt><dd>{model.severity}</dd><dt>{plain ? 'Proof' : 'Evidence'}</dt><dd>{plain ? 'Not yet confirmed' : 'Unverified'}</dd><dt>{plain ? 'Last update' : 'Freshness'}</dt><dd>Current simulated snapshot</dd><dt>{plain ? 'Editing' : 'Changes'}</dt><dd>{model.locked ? 'Locked' : 'Unlocked'} · actions disabled</dd></dl>
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
<div class="sr-only" aria-live="polite" aria-atomic="true">{model.announcement.text}</div>
<footer class="statusbar" aria-label="HUD footer" style={`--tone:var(--t-${tone})`}>
  <div class="row"><span class="seg sb-sim">Simulated</span><span class="seg">{scenario.source}</span><span class="seg strong">{model.label}</span><span class="seg">{model.locked ? 'Locked' : 'Unlocked'}</span><span class="seg">Unverified</span><span class="seg">Session {time}</span><button class="details" aria-expanded={details} aria-controls="drawer" onclick={() => details = !details}>Details</button></div>
  <div class="drawer" id="drawer" hidden={!details}>Synthetic source: {scenario.source} / {scenario.context}. {model.reason} No live authority, release, or signed receipt. Session time is preview time, not evidence freshness.</div>
</footer>
