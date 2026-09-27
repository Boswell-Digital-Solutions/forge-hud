import { describe, it, expect } from 'vitest';
import { createNeuroForgeStream, projectNeuroForgeReport } from '../src/adapters/neuroforge-stream.js';
import { activityState } from '../src/adapters/activity.js';
const binding = { scope: { plane: 'public-app' as const, scopeId: 'authorized-session' }, origin: { appId: 'Author-Forge', taskId: 'task' }, requestId: 'request', attemptId: '1' };
const profile = { id: 'test', language: 'operator', density: 'standard', contrast: 'standard', motion: 'standard', sourceAccent: '#56616E' };
const time = '2026-09-27T12:00:00.000Z';
const id = 'exec_012345abcdef';
const context = (sequence: number, execution_id = id) => ({ version: 1, execution_id, sequence, observed_at: time });
function start() { const s = createNeuroForgeStream(binding); expect(s.accept('started', { execution_id: id, activity_context: context(0) })).toBe(true); return s; }
function routed() { const s = start(); expect(s.accept('model_selected', { provider: 'openai', model: 'requested', activity_context: context(1) })).toBe(true); return s; }
const completed = (mode = 'provider') => ({ activity_context: context(2), execution_id: id, success: true, model: 'requested', provider: 'openai', execution_provenance: { mode, provider: mode === 'provider' ? 'deepseek' : null, model: mode === 'provider' ? 'reported' : null } });
const project = (s: ReturnType<typeof start>, offset = 0) => projectNeuroForgeReport(s.report()!, s.status, profile, Date.parse(time) + offset, 1000);

describe('existing NeuroForge request stream', () => {
  it('keeps unknown provenance separate from selected identity', () => {
    const s = routed(); expect(s.report()!.selection!.provider).toBe('openai');
    expect(s.report()!.provenance.mode).toBe('unknown'); expect(project(s)).toBeNull();
  });
  it('uses terminal reported identity and never enables actions or animation', () => {
    const s = routed(); expect(s.accept('completed', completed())).toBe(true);
    const hud = project(s)!; expect(hud.activity!.provider).toBe('deepseek'); expect(hud.activity!.model).toBe('reported');
    expect(hud.model.actionsDisabled).toBe(true); expect(activityState(hud.model).moving).toBe(false);
    s.close(); expect(s.status).toBe('finished'); expect(project(s, 1000)!.model.freshness).toBe('stale');
  });
  it('does not turn unknown completion into real or simulated execution', () => {
    const s = routed(); s.accept('completed', completed('unknown'));
    expect(s.report()!.phase).toBe('completed'); expect(project(s)).toBeNull();
  });
  it('marks simulation without the selected company icon', () => {
    const s = routed(); s.accept('completed', completed('simulated'));
    expect(project(s)!.model.simulation).toBe(true); expect(project(s)!.activity!.provider).toBeNull();
  });
  it('drops output and metrics without accessing their payload', () => {
    const s = routed(); const payload = new Proxy({}, { get() { throw new Error('must not inspect'); } });
    expect(s.accept('chunk', payload)).toBe(false); expect(s.accept('metrics', payload)).toBe(false);
    const data = { ...completed(), content: 'SECRET OUTPUT', error: 'SECRET ERROR', prompt: 'SECRET PROMPT', scope: { scopeId: 'attacker' } };
    s.accept('completed', data); expect(JSON.stringify(s.report())).not.toContain('SECRET');
    expect(s.report()!.binding.scope.scopeId).toBe('authorized-session');
  });
  it('isolates concurrent bindings and detaches returned reports', () => {
    const a = start(); const copy = structuredClone(binding); copy.scope.scopeId = 'another-session';
    const b = createNeuroForgeStream(copy); copy.scope.scopeId = 'mutated';
    b.accept('started', { execution_id: 'exec_abcdef012345', activity_context: context(0, 'exec_abcdef012345') });
    b.report()!.binding.scope.scopeId = 'changed';
    expect(b.report()!.binding.scope.scopeId).toBe('another-session'); expect(a.report()!.binding.scope.scopeId).toBe('authorized-session');
  });
  it.each(['gap', 'wrong-id', 'backward-time', 'missing-context', 'bad-root-id', 'bad-provenance'])('fails closed on %s', failure => {
    const s = routed(); const data = completed();
    if (failure === 'gap') data.activity_context.sequence = 3;
    if (failure === 'wrong-id') data.activity_context.execution_id = 'exec_abcdef012345';
    if (failure === 'backward-time') data.activity_context.observed_at = '2026-09-26T12:00:00.000Z';
    if (failure === 'missing-context') delete (data as Partial<typeof data>).activity_context;
    if (failure === 'bad-root-id') data.execution_id = 'exec_abcdef012345';
    if (failure === 'bad-provenance') data.execution_provenance.mode = 'guessed';
    expect(s.accept('completed', data)).toBe(false); expect(s.status).toBe('invalid');
    expect(s.report()!.phase).toBe('routed'); expect(s.accept('completed', completed())).toBe(false);
  });
  it('ignores old sequence and refuses terminal mutation', () => {
    const s = routed(); expect(s.accept('model_selected', { activity_context: context(1), provider: 'xai', model: 'other' })).toBe(false);
    expect(s.report()!.selection!.provider).toBe('openai'); s.accept('completed', completed());
    expect(s.accept('error', { activity_context: context(3), execution_provenance: completed('unknown').execution_provenance })).toBe(false);
    expect(s.report()!.phase).toBe('completed');
  });
  it('accepts selection failure but never infers provenance from error text', () => {
    const s = start(); expect(s.accept('error', { activity_context: context(1), error: 'PRIVATE', execution_provenance: completed('unknown').execution_provenance })).toBe(true);
    expect(s.report()!.phase).toBe('failed'); expect(JSON.stringify(s.report())).not.toContain('PRIVATE');
  });
  it('disconnect and revoke invalidate callbacks without a replay path', () => {
    const s = routed(); s.close(); expect(s.status).toBe('disconnected'); expect(s.accept('completed', completed())).toBe(false);
    s.revoke(); expect(s.report()).toBeNull(); expect(s.accept('started', { execution_id: id, activity_context: context(0) })).toBe(false);
  });
  it('rejects invalid trusted binding and out-of-order initial lifecycle', () => {
    expect(() => createNeuroForgeStream({ ...binding, requestId: '' })).toThrow();
    const s = createNeuroForgeStream(binding); expect(s.accept('completed', completed())).toBe(false); expect(s.status).toBe('invalid');
  });
});
