import { describe, expect, it } from 'vitest';
import { acceptObservation, parseObservation, projectObservation, observationKey } from '../src/adapters/observations.js';
import type { ActivityObservation } from '../src/adapters/observations.js';
import smith from './fixtures/smith.json';
const scope = { plane: 'public-app', scopeId: 'audience-a' } as const;
const event: ActivityObservation = { version: 1, scope, origin: { appId: 'Author-Forge', taskId: 'task-1' }, requestId: 'request-1', attemptId: 'attempt-1', backend: 'neuroforge', sequence: 1, observedAt: '2026-09-27T12:00:00.000Z', phase: 'executing', provider: 'google', model: 'producer-model', simulation: false };
const clock = { nowMs: Date.parse(event.observedAt), staleAfterMs: 30000, connected: true };
describe('scoped activity display boundary', () => {
  it.each(['Author-Forge', 'tarcie-reviewer', 'forge-smithy', 'ForgeCommand', 'hephaestus', 'beta'])('preserves origin %s without inferring a backend', appId => {
    const hud = projectObservation({ ...event, origin: { ...event.origin, appId } }, scope, smith.profile, clock)!;
    expect(hud.model.valid).toBe(true);
    expect(hud.model.source?.context).toBe(appId);
    expect(hud.activity?.backend).toBe('neuroforge');
    expect(hud.activity?.provider).toBe('gemini');
    expect(hud.model.allowedActionIds).toEqual([]);
  });
  it('rejects mismatched planes and audiences', () => {
    expect(projectObservation(event, { ...scope, scopeId: 'audience-b' }, smith.profile, clock)).toBeNull();
    expect(projectObservation(event, { ...scope, plane: 'business-local' }, smith.profile, clock)).toBeNull();
  });
  it('rejects extra payload fields, malformed timestamps and invalid sequences', () => {
    for (const patch of [{ prompt: 'sensitive' }, { observedAt: '2026-02-30T12:00:00.000Z' }, { sequence: -1 }, { sequence: 1.5 }, { scope: { ...scope, token: 'secret' } }]) expect(parseObservation({ ...event, ...patch })).toBeNull();
  });
  it('isolates concurrent attempts and rejects duplicate/out-of-order observations', () => {
    expect(acceptObservation(event, event, scope)).toBeNull();
    expect(acceptObservation(event, { ...event, sequence: 0 }, scope)).toBeNull();
    expect(acceptObservation(event, { ...event, sequence: 2, attemptId: 'other' }, scope)).toBeNull();
    expect(observationKey(event)).not.toBe(observationKey({ ...event, attemptId: 'other' }));
    expect(acceptObservation(event, { ...event, sequence: 2, provider: 'xai' }, scope)?.provider).toBe('xai');
  });
  it.each(['completed', 'failed', 'halted'] as const)('does not restart a terminal %s attempt', phase => {
    expect(acceptObservation({ ...event, phase }, { ...event, sequence: 2 }, scope)).toBeNull();
  });
  it('routed is primed, completion unverified and disconnect stale', () => {
    const routed = projectObservation({ ...event, phase: 'routed' }, scope, smith.profile, clock)!;
    expect(routed.model).toMatchObject({ valid: true, role: 'primed', actionsDisabled: true });
    expect(projectObservation({ ...event, phase: 'completed' }, scope, smith.profile, clock)!.model.evidence).toBe('unverified');
    expect(projectObservation(event, scope, smith.profile, { ...clock, connected: false })!.model.freshness).toBe('stale');
    expect(projectObservation(event, scope, smith.profile, { ...clock, nowMs: clock.nowMs + 30000 })!.model.freshness).toBe('stale');
    expect(projectObservation(event, scope, smith.profile, { ...clock, nowMs: clock.nowMs - 1 })!.model.freshness).toBe('unknown');
  });
  it('does not assign a familiar logo to an unknown or local provider', () => {
    expect(projectObservation({ ...event, provider: 'ollama' }, scope, smith.profile, clock)!.activity?.provider).toBeNull();
  });
  it('returns a detached scope and origin', () => {
    const copy = parseObservation(event)!;
    copy.scope.scopeId = 'changed'; copy.origin.appId = 'changed';
    expect(event.scope.scopeId).toBe('audience-a'); expect(event.origin.appId).toBe('Author-Forge');
  });
});
