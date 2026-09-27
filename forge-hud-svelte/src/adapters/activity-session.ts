import { acceptObservation, observationKey, parseObservation, projectObservation } from './observations.js';
import type { ActivityObservation, ActivityScope } from './observations.js';

/** In-memory consumer only. Server authorization and replay revisions belong to the transport. */
export function createActivitySession(scope: ActivityScope, maxEntries = 128) {
  if (!scope || !['business-local', 'public-app'].includes(scope.plane) || typeof scope.scopeId !== 'string' || !scope.scopeId.trim()
    || scope.scopeId.trim() !== scope.scopeId || scope.scopeId.length > 120 || /[\u0000-\u001f\u007f]/.test(scope.scopeId)
    || !Number.isSafeInteger(maxEntries) || maxEntries < 1 || maxEntries > 4096) throw new Error('Invalid activity session configuration.');
  const audience = { ...scope };
  let entries = new Map<string, ActivityObservation>();
  let revision = -1;
  let generation = 0;
  let status: 'disconnected' | 'synchronizing' | 'connected' | 'resync-required' | 'revoked' = 'disconnected';
  const validRevision = (value: number) => Number.isSafeInteger(value) && value >= 0;
  const detach = (event: ActivityObservation) => parseObservation(event)!;
  const same = (a: ActivityObservation, b: ActivityObservation) => observationKey(a) === observationKey(b)
    && a.sequence === b.sequence && a.observedAt === b.observedAt && a.phase === b.phase
    && a.provider === b.provider && a.model === b.model && a.simulation === b.simulation;
  function check(input: unknown, previous: ActivityObservation | null) {
    const event = acceptObservation(null, input, audience);
    if (!event) return null;
    // Exact replay in an authoritative snapshot is harmless; changed same-sequence data is not.
    if (previous && event.sequence === previous.sequence) {
      return same(event, previous) ? event : null;
    }
    return acceptObservation(previous, event, audience);
  }
  return {
    get status() { return status; },
    get revision() { return revision; },
    observations() { return [...entries.values()].map(detach); },
    project(profile: unknown, nowMs: number, staleAfterMs: number) {
      return [...entries.values()].map(event => ({ key: observationKey(event), hud: projectObservation(event, audience, profile, {
        nowMs, staleAfterMs, connected: status === 'connected',
      }) }));
    },
    /** Call when attaching/re-attaching one authorized snapshot-plus-update subscription. */
    begin() {
      if (status === 'revoked') throw new Error('Activity session was revoked. Create a new scoped session.');
      const token = ++generation;
      status = 'synchronizing';
      const active = () => token === generation && status !== 'revoked' && status !== 'disconnected' && status !== 'resync-required';
      const reject = () => { if (token === generation && status !== 'revoked') status = 'resync-required'; return false; };
      return {
        snapshot(input: unknown, nextRevision: number): boolean {
          if (!active() || status !== 'synchronizing') return false;
          if (!validRevision(nextRevision) || nextRevision < revision || !Array.isArray(input) || input.length > maxEntries) return reject();
          const next = new Map<string, ActivityObservation>();
          for (const raw of input) {
            const parsed = acceptObservation(null, raw, audience);
            if (!parsed) return reject();
            const key = observationKey(parsed);
            const event = check(parsed, entries.get(key) ?? null);
            if (!event || next.has(key)) return reject();
            next.set(key, event);
          }
          // Same feed revision must describe the same complete snapshot, including removals.
          if (nextRevision === revision && (next.size !== entries.size || [...next].some(([key, event]) => !entries.has(key) || !same(event, entries.get(key)!)))) return reject();
          entries = next; revision = nextRevision; status = 'connected'; return true;
        },
        update(input: unknown, nextRevision: number): boolean {
          if (!active() || status !== 'connected') return false;
          if (!validRevision(nextRevision)) return reject();
          if (nextRevision <= revision) return false;
          if (nextRevision !== revision + 1) return reject();
          const parsed = acceptObservation(null, input, audience);
          if (!parsed) return reject();
          const key = observationKey(parsed);
          const event = acceptObservation(entries.get(key) ?? null, parsed, audience);
          if (!event || !entries.has(key) && entries.size >= maxEntries) return reject();
          entries.set(key, event); revision = nextRevision; return true;
        },
        disconnect() { if (token === generation && status !== 'revoked') { status = 'disconnected'; generation++; } },
      };
    },
    /** Logout, scope revocation or scope switch: erase activity and invalidate every callback. */
    revoke() { entries.clear(); status = 'revoked'; generation++; revision = -1; },
  };
}
