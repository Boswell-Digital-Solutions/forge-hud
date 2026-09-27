<script lang="ts">
  import ForgeBackendActivity from './ForgeBackendActivity.svelte';
  import { acceptObservation, observationKey, projectObservation } from '../adapters/observations.js';
  import type { ActivityScope } from '../adapters/observations.js';
  import type { ActivitySessionStatus } from '../adapters/activity-session.js';
  let { observations, scope, status, profile, nowMs, staleAfterMs }: {
    observations: unknown[]; scope: ActivityScope; status: ActivitySessionStatus;
    profile: unknown; nowMs: number; staleAfterMs: number;
  } = $props();
  const messages: Record<ActivitySessionStatus, string> = {
    connected: 'Activity feed connected', synchronizing: 'Synchronizing activity; previous reports may be stale',
    disconnected: 'Activity feed disconnected; showing last reports',
    'resync-required': 'Activity feed needs a fresh snapshot; showing last reports',
    revoked: 'Activity access ended; reports cleared',
  };
  const rows = $derived.by(() => {
    if (status === 'revoked') return [];
    const seen = new Set<string>();
    return observations.flatMap(raw => {
      const event = acceptObservation(null, raw, scope);
      if (!event) return [];
      const key = observationKey(event);
      if (seen.has(key)) return [];
      seen.add(key);
      const hud = projectObservation(event, scope, profile, { nowMs, staleAfterMs, connected: status === 'connected' });
      return hud?.activity ? [{ key, event, hud }] : [];
    });
  });
</script>

<section class="activity-list" aria-label="Origin activity">
  <p role="status" aria-live="polite" aria-atomic="true">{messages[status] ?? 'Activity feed unavailable'}. {rows.length} reports.</p>
  {#if rows.length}
    <ul>
      {#each rows as { key, event, hud } (key)}
        <li data-origin={event.origin.appId} data-phase={event.phase} data-freshness={hud.model.freshness}>
          <div class="origin"><strong>{event.origin.appId}</strong><span>Task {event.origin.taskId}</span><small>{event.simulation ? 'Simulated' : 'Producer reported'} · evidence unverified</small></div>
          <ForgeBackendActivity model={hud.model} activity={hud.activity!} />
          <div class="report"><span>{hud.model.freshness === 'current' ? 'Reported' : 'Last reported'}: {event.phase}</span><span>Provider ID: {event.provider ?? 'unknown'}</span><small>Request {event.requestId} · attempt {event.attemptId}</small><time datetime={event.observedAt}>{event.observedAt}</time></div>
          {#if event.phase === 'routed'}<p class="routing">Provider selected; execution not yet observed.</p>{/if}
        </li>
      {/each}
    </ul>
  {:else}
    <p>No activity reports available. This does not establish that the backend is idle.</p>
  {/if}
</section>

<style>
  .activity-list{color:var(--ink,var(--forge-ui-text-primary,#e7ebef));font-family:inherit}
  ul{list-style:none;padding:0;margin:1rem 0;display:grid;gap:.75rem}
  li{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr);gap:1rem;align-items:center;padding:1.25rem;border:1px solid var(--rule,#56616e);border-radius:.75rem;background:var(--panel,#111418);overflow-wrap:anywhere}
  .origin,.report{display:grid;gap:.25rem;min-width:0}.origin strong{font-size:1.1rem}.origin small,.report{color:var(--muted,#cbd5e1);font-size:.8rem}.report time{font-size:.75rem}.routing{grid-column:1/-1;margin:0;font-size:.85rem}
  @media(max-width:45rem){li{grid-template-columns:minmax(0,1fr)}.report{border-top:1px solid var(--rule,#56616e);padding-top:.75rem}}
</style>
