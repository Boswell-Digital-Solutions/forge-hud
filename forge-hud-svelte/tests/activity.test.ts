import { describe, expect, it } from 'vitest';
import { activityState, parseActivity } from '../src/adapters/activity.js';
import { projectHud } from '../src/adapters/hud.js';
import smith from './fixtures/smith.json';
const base = projectHud(smith).model;
describe('backend activity trust boundaries', () => {
  it('accepts a producer identity without changing authority', () => {
    const hud = projectHud({ ...smith, activity: { backend: 'yellowjacket', provider: 'openai', model: 'model-from-producer' } });
    expect(hud.activity?.provider).toBe('openai');
    expect(hud.model).toEqual(base);
    expect(hud.model.actionsDisabled).toBe(true);
  });
  it.each(['constructor', 'not-a-provider', 'https://untrusted/logo.svg'])('rejects unrecognized provider %s', provider => {
    expect(parseActivity({ backend: 'neuroforge', provider, model: null })).toBeNull();
    const hud = projectHud({ ...smith, activity: { backend: 'neuroforge', provider, model: null }, actions: [{ id: 'review', label: 'Review' }] });
    expect(hud.configurationIssues).not.toEqual([]);
    expect(hud.actions).toEqual([]);
  });
  it.each(['idle', 'awaiting_authority', 'primed', 'complete', 'blocked', 'degraded', 'failed', 'halted', 'unavailable'] as const)('%s does not imply active execution', role => {
    expect(activityState({ ...base, role }).moving).toBe(false);
  });
  it.each(['stale', 'unknown'] as const)('stops stale/unknown activity (%s)', freshness => {
    const state = activityState({ ...base, freshness });
    expect(state.moving).toBe(false);
    expect(state.lastReported).toBe(true);
    expect(state.tone).toBe('neutral');
  });
  it('halt remains critical even when stale', () => {
    expect(activityState({ ...base, role: 'halted', freshness: 'stale' })).toMatchObject({ tone: 'critical', moving: false });
  });
  it('respects profile motion and fail-closed models', () => {
    expect(activityState(base).moving).toBe(true);
    expect(activityState({ ...base, valid: false }).moving).toBe(false);
    expect(activityState({ ...base, profile: { ...smith.profile, motion: 'reduced' } as typeof base.profile }).moving).toBe(false);
  });
});
