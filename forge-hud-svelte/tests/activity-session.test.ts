import { expect, it } from 'vitest';
import { createActivitySession } from '../src/adapters/activity-session.js';
import type { ActivityObservation } from '../src/adapters/observations.js';
import smith from './fixtures/smith.json';
const scope = { plane: 'public-app', scopeId: 'audience-1' } as const;
const event: ActivityObservation = { version: 1, scope, origin: { appId: 'Author-Forge', taskId: 'task-1' }, requestId: 'request-1', attemptId: 'attempt-1', backend: 'neuroforge', sequence: 1, observedAt: '2026-09-27T12:00:00.000Z', phase: 'executing', provider: 'openai', model: null, simulation: false };
const next = { ...event, sequence: 2, phase: 'completed' as const };
it('loads concurrent attempts atomically then projects real statuses without action authority', () => {
 const session = createActivitySession(scope); const connection = session.begin();
 expect(connection.update(event, 1)).toBe(false);
 expect(connection.snapshot([event, { ...event, backend: 'yellowjacket', attemptId: 'other' }], 4)).toBe(true);
 expect(session.observations()).toHaveLength(2);
 expect(connection.update(next, 5)).toBe(true);
 expect(session.project(smith.profile, Date.parse(event.observedAt), 30000).map(x => x.hud?.model.role)).toEqual(['complete', 'working']);
 expect(session.project(smith.profile, Date.parse(event.observedAt), 30000).every(x => x.hud?.model.actionsDisabled)).toBe(true);
});
it('disconnect stops current posture; old callbacks cannot revive or pollute a reconnect', () => {
 const s = createActivitySession(scope); const old = s.begin(); old.snapshot([event], 1); old.disconnect();
 expect(s.project(smith.profile, Date.parse(event.observedAt), 30000)[0]?.hud?.model.freshness).toBe('stale');
 const fresh = s.begin(); expect(old.update(next, 2)).toBe(false); old.disconnect(); expect(s.status).toBe('synchronizing');
 expect(fresh.snapshot([next], 2)).toBe(true); expect(s.status).toBe('connected');
});
it('requires resync on sequence gaps and preserves the last complete snapshot', () => {
 const s = createActivitySession(scope); const c = s.begin(); c.snapshot([event], 1);
 expect(c.update(next, 3)).toBe(false); expect(s.status).toBe('resync-required');
 expect(c.update(next, 2)).toBe(false); expect(s.observations()[0]?.phase).toBe('executing');
 expect(s.begin().snapshot([next], 3)).toBe(true);
});
it('rejects cross-audience snapshots atomically and clears everything on revocation', () => {
 const s = createActivitySession(scope); const c = s.begin();
 expect(c.snapshot([event, { ...event, scope: { ...scope, scopeId: 'someone-else' } }], 1)).toBe(false);
 expect(s.observations()).toEqual([]);
 const fresh = s.begin(); fresh.snapshot([event], 2); s.revoke();
 expect(fresh.update(next, 3)).toBe(false); expect(fresh.snapshot([event], 4)).toBe(false);
 expect(s.observations()).toEqual([]); expect(() => s.begin()).toThrow();
});
it('rejects stale snapshots, conflicting same-revision snapshots and terminal restarts', () => {
 const s = createActivitySession(scope); s.begin().snapshot([next], 5);
 expect(s.begin().snapshot([event], 4)).toBe(false);
 expect(s.begin().snapshot([], 5)).toBe(false);
 expect(s.begin().snapshot([{ ...event, sequence: 3 }], 6)).toBe(false);
 expect(s.begin().snapshot([next], 5)).toBe(true);
});
it('bounds memory without silently evicting active work', () => {
 const s = createActivitySession(scope, 1); const c = s.begin(); c.snapshot([event], 1);
 expect(c.update({ ...event, attemptId: 'other' }, 2)).toBe(false);
 expect(s.status).toBe('resync-required'); expect(s.observations()).toHaveLength(1);
});
it('does not expose mutable state or accept old feed revisions', () => {
 const s = createActivitySession(scope); const c = s.begin(); c.snapshot([event], 1);
 s.observations()[0]!.scope.scopeId = 'changed';
 expect(c.update(next, 1)).toBe(false); expect(c.update(next, 2)).toBe(true);
 expect(s.observations()[0]!.scope.scopeId).toBe(scope.scopeId);
});
it('rejects invalid configuration', () => {
 expect(() => createActivitySession(scope, 0)).toThrow();
 expect(() => createActivitySession({ ...scope, scopeId: '' })).toThrow();
});
it('accepts exact snapshot replay independently of JSON field order', () => {
 const s = createActivitySession(scope); s.begin().snapshot([event], 1);
 const reordered = Object.fromEntries(Object.entries(event).reverse());
 expect(s.begin().snapshot([reordered], 1)).toBe(true);
});
