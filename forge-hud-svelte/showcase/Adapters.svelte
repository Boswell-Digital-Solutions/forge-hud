<script lang="ts">
  import { projectHud, ForgeHudFooter, ForgeHudRail, ForgeNextAction } from '../src/index.js';
  import smith from '../tests/fixtures/smith.json';
  import command from '../tests/fixtures/forge-command.json';
  let source = $state('smith');
  let plain = $state(false);
  let halt = $state(false);
  let elapsed = $state('00:12');
  let fixture = $derived(source === 'smith' ? smith : command);
  let hud = $derived(projectHud({
    snapshot: { ...fixture.snapshot, reason: source === 'smith' ? 'Execution is underway. Changes are locked until this step finishes.' : 'A decision is waiting for review in Forge Command.', ...(halt ? { emergencyHalt: { source: 'simulator', reason: 'Explicit synthetic emergency stop.' } } : {}) },
    mapping: fixture.mapping,
    profile: { ...fixture.profile, language: plain ? 'plain' : 'operator', density: plain ? 'calm' : 'compact', motion: 'reduced' },
    sessionLabel: 'Synthetic session',
    actions: [{ id: 'review-decision', label: 'Request decision review' }],
  }));
</script>
<main>
  <header><div class="eyebrow">FORGEHUD / WORKSPACE PREVIEW</div><h1>Your work, at a glance.</h1><p>Follow progress, inspect evidence, and see what needs your attention.</p><strong class="simulation">SIMULATED · NO LIVE CONNECTION · ACTIONS DISABLED</strong></header>
  <section class="controls" aria-label="Adapter controls">
    <label>Application contract<select bind:value={source}><option value="smith">SMITH pipeline</option><option value="command">Forge Command decisions</option></select></label>
    <label class="toggle"><input type="checkbox" bind:checked={plain}>Plain-language skin</label>
    <label class="toggle"><input type="checkbox" bind:checked={halt}>Emergency halt</label>
    <button onclick={() => elapsed = elapsed === '00:12' ? '00:13' : '00:12'}>Advance timer</button>
  </section>
  <h2>Persistent footer</h2><ForgeHudFooter {hud} {elapsed} />
  <div class="proof"><section><h2>Status & evidence</h2><ForgeHudRail {hud} announce={false} /></section>
    <section><h2>Next action</h2><ForgeNextAction {hud} announce={false} /></section></div>
  <footer>Interactive preview · Select an application or try an emergency halt to compare the displays.</footer>
</main>
