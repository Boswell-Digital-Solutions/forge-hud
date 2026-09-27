<script lang="ts">
  import { ForgeStatusCapsule, ForgeEvidenceSeal, ForgeAuthorityGate, ROLES, projectState } from '../src/index.js';
  import type { Profile, Snapshot, Role } from '../src/index.js';
  let skin = $state('smith');
  let role = $state<Role | 'unavailable'>('working');
  let reduced = $state(false);
  let high = $state(false);
  let elapsed = $state('00:12');
  let evidence = $state<Snapshot['evidence']>('unverified');
  let freshness = $state<Snapshot['freshness']>('current');
  let locked = $state(false);
  let profile: Profile = $derived({ id: skin, language: ['smith','forge-command'].includes(skin) ? 'operator' : 'plain', density: ['smith','forge-command'].includes(skin) ? 'compact' : 'calm', contrast: high ? 'high' : 'standard', motion: reduced ? 'reduced' : 'standard', sourceAccent: skin === 'authorforge' ? '#c4b5fd' : '#38bdf8' });
  let snapshot: Snapshot = $derived({ source: skin, context: 'component-proof', nativeState: role, observedAt: '2026-09-27T12:00:00.000Z', severity: role === 'halted' ? 'critical' : ['blocked','failed'].includes(role) ? 'blocked' : role === 'degraded' ? 'attention' : 'neutral', authority: role === 'awaiting_authority' ? 'human-required' : 'automatic', evidence: role === 'verifying' ? 'verifying' : evidence, freshness, locked, simulation: true, reason: role === 'unavailable' ? 'Unmapped producer state.' : 'Synthetic scenario for presentation verification.', allowedActionIds: role === 'primed' ? [] : ['review'], ...(role === 'halted' ? { emergencyHalt: { source: 'simulator', reason: 'Synthetic emergency stop.' } } : {}), ...(role === 'primed' ? { anticipatedAction: 'Review next stage' } : {}) });
  let model = $derived(projectState(snapshot, { version: 1, owner: 'simulator', mappings: ROLES.map(r => ({ source: skin, context: 'component-proof', nativeState: r, role: r })) }, profile));
</script>
<main>
  <header><div class="eyebrow">BOSWELL DIGITAL SOLUTIONS / FORGEHUD</div><h1>Every state, clearly.</h1><p>Explore how progress, evidence, and authority appear across your workspace.</p><strong class="simulation">SIMULATED · NO LIVE CONNECTION · ACTIONS DISABLED</strong></header>
  <section class="controls" aria-label="Simulator controls">
    <label>Profile<select bind:value={skin}><option value="smith">SMITH · Operator</option><option value="forge-command">Forge Command · Operator</option><option value="authorforge">AuthorForge · Creator</option><option value="reviewer-simulated">Reviewer · Simulated</option></select></label>
    <label>Process state<select bind:value={role}>{#each [...ROLES, 'unavailable'] as value}<option>{value}</option>{/each}</select></label>
    <label>Evidence<select bind:value={evidence}>{#each ['unverified','verifying','verified','stale','conflicted','invalid'] as value}<option>{value}</option>{/each}</select></label>
    <label>Freshness<select bind:value={freshness}>{#each ['current','aging','stale','unknown'] as value}<option>{value}</option>{/each}</select></label>
    <label class="toggle"><input type="checkbox" bind:checked={reduced}>Reduced motion</label><label class="toggle"><input type="checkbox" bind:checked={high}>High contrast</label><label class="toggle"><input type="checkbox" bind:checked={locked}>Lock interaction</label>
    <button onclick={() => elapsed = elapsed === '00:12' ? '00:13' : '00:12'}>Advance timer</button>
  </section>
  <div class="proof"><section><h2>01 / Process & status</h2><ForgeStatusCapsule {model} {elapsed}/></section><section><h2>02 / Evidence</h2><ForgeEvidenceSeal {model}/></section><section class="authority"><h2>03 / Authority</h2><ForgeAuthorityGate {model} actions={[{ id: 'review', label: 'Request review' }]} /></section></div>
  <footer>Presentation proof · R2<br>Source identity, severity, evidence and authority remain separate. No backend authorization or evidence receipt is produced.</footer>
</main>
