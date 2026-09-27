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
    snapshot: { ...fixture.snapshot, ...(halt ? { emergencyHalt: { source: 'simulator', reason: 'Explicit synthetic emergency stop.' } } : {}) },
    mapping: fixture.mapping,
    profile: { ...fixture.profile, language: plain ? 'plain' : 'operator', density: plain ? 'calm' : 'compact', motion: 'reduced' },
    sessionLabel: 'Synthetic session',
    actions: [{ id: 'review-decision', label: 'Request decision review' }],
  }));
</script>
<main>
  <header><div class="eyebrow">FORGEHUD / R3 ADAPTER PROOF</div><h1>One context. Consistent meaning.</h1><p>Footer, rail, lock and Next Action share the same projection.</p><strong class="simulation">SIMULATED · NO LIVE CONNECTION · ACTIONS DISABLED</strong></header>
  <section class="controls" aria-label="Adapter controls">
    <label>Application contract<select bind:value={source}><option value="smith">SMITH pipeline</option><option value="command">Forge Command decisions</option></select></label>
    <label class="toggle"><input type="checkbox" bind:checked={plain}>Plain-language skin</label>
    <label class="toggle"><input type="checkbox" bind:checked={halt}>Emergency halt</label>
    <button onclick={() => elapsed = elapsed === '00:12' ? '00:13' : '00:12'}>Advance timer</button>
  </section>
  <h2>Persistent footer</h2><ForgeHudFooter {hud} {elapsed} />
  <div class="proof"><section><h2>Context rail</h2><ForgeHudRail {hud} announce={false} /></section>
    <section><h2>Next Action interface</h2><ForgeNextAction {hud} announce={false} /></section></div>
  <footer>Application-owned contracts · No shared store, action resolver or backend clearance.<br>One live announcement owner; duplicate surfaces are quiet.</footer>
</main>
