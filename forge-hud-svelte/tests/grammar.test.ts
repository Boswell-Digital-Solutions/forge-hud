import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { ROLES, LABELS, announcementChanged, motionFor, projectState, validateSnapshot } from '../src/index.js';
const fixture = (name: string) => JSON.parse(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), 'utf8'));
const smith = fixture('smith');
const command = fixture('forge-command');
const project = (changes = {}, profile = smith.profile, mapping = smith.mapping) =>
  projectState({ ...smith.snapshot, ...changes }, mapping, profile);
const live = { simulation: false, locked: false, allowedActionIds: ['review'] };

describe('source-qualified projection', () => {
  it('locked execution remains working, not an approval request', () => {
    const result = project();
    expect(result).toMatchObject({ valid: true, role: 'working', locked: true, actionsDisabled: true, simulationLabel: 'SIMULATED STATE' });
  });
  it('Command pending-decision halt means human approval, not emergency halt', () => {
    expect(projectState(command.snapshot, command.mapping, command.profile)).toMatchObject({ valid: true, role: 'awaiting_authority', authority: 'human-required' });
  });
  it('identical native names in another context do not inherit a mapping', () => {
    const result = projectState({ ...command.snapshot, context: 'registry' }, command.mapping, command.profile);
    expect(result).toMatchObject({ valid: false, role: 'unavailable', allowedActionIds: [] });
  });
  it('does not match another producer or lowercase a native state', () => {
    expect(project({ source: 'another-app' }).valid).toBe(false);
    expect(project({ nativeState: 'executing' }).valid).toBe(false);
  });
  it('preserves provenance, evidence and freshness independently', () => {
    const result = project({ ...live, evidence: 'verified', freshness: 'stale' });
    expect(result.source).toEqual({ id: 'smith', context: 'pipeline', nativeState: 'EXECUTING', observedAt: smith.snapshot.observedAt });
    expect(result).toMatchObject({ role: 'working', evidence: 'verified', freshness: 'stale', actionsDisabled: true });
  });
  it('keeps a current allowed application action without manufacturing others', () => {
    expect(project(live)).toMatchObject({ valid: true, actionsDisabled: false, allowedActionIds: ['review'] });
    expect(project({ ...live, allowedActionIds: [] })).toMatchObject({ actionsDisabled: true, allowedActionIds: [] });
  });
  it.each(['stale', 'aging', 'unknown'])('suppresses actions on %s freshness', freshness => {
    expect(project({ ...live, freshness }).allowedActionIds).toEqual([]);
  });
  it.each(['invalid', 'conflicted', 'stale'])('suppresses actions on %s evidence', evidence => {
    expect(project({ ...live, evidence }).allowedActionIds).toEqual([]);
  });
  it('does not permit simulated actions or unavailable authority', () => {
    expect(project({ ...live, simulation: true }).allowedActionIds).toEqual([]);
    expect(project({ ...live, authority: 'unavailable' }).allowedActionIds).toEqual([]);
  });
  it('caller mutations cannot change validated action IDs', () => {
    const input = { ...smith.snapshot, ...live };
    const result = projectState(input, smith.mapping, smith.profile);
    input.allowedActionIds.push('injected');
    expect(result.allowedActionIds).toEqual(['review']);
  });
});

describe('visible failure instead of silent readiness', () => {
  it.each([null, undefined, [], 'working', 42, true])('rejects non-object snapshot %j', input => {
    const result = projectState(input, smith.mapping, smith.profile);
    expect(result).toMatchObject({ valid: false, role: 'unavailable', actionsDisabled: true, allowedActionIds: [] });
  });
  it.each(['nativeState', 'source', 'observedAt', 'freshness', 'severity', 'authority', 'allowedActionIds', 'simulation'])('rejects missing %s', field => {
    const input = { ...smith.snapshot };
    delete input[field];
    expect(projectState(input, smith.mapping, smith.profile).valid).toBe(false);
  });
  it('rejects unknown channels, unrecognized states, extra permission fields and duplicate IDs', () => {
    for (const change of [{ severity: 'success' }, { authority: 'approved-by-ui' }, { evidence: 'probably-ok' }, { nativeState: 'NEW_STATE' }, { canApprove: true }, { allowedActionIds: ['a', 'a'] }]) {
      expect(project(change)).toMatchObject({ valid: false, role: 'unavailable', allowedActionIds: [] });
    }
  });
  it.each(['2026-02-30T00:00:00.000Z', 'yesterday', '2026-09-27', '2026-09-27T12:00:00+00:00'])('rejects malformed/noncanonical timestamps %s', observedAt => {
    expect(validateSnapshot({ ...smith.snapshot, observedAt }).ok).toBe(false);
  });
  it('rejects role/channel contradictions', () => {
    for (const change of [
      { nativeState: 'AWAITING_AUTH', authority: 'automatic' },
      { nativeState: 'ERROR', severity: 'healthy' },
      { nativeState: 'DONE', severity: 'critical' },
      { nativeState: 'VERIFYING_EVIDENCE', evidence: 'verified' },
    ]) expect(project(change).valid).toBe(false);
  });
});

describe('emergency priority and priming', () => {
  const emergencyHalt = { source: 'backend-emergency', reason: 'Operator halt active' };
  it('explicit halt overrides work and unmapped workflow states', () => {
    expect(project({ ...live, nativeState: 'UNMAPPED', emergencyHalt })).toMatchObject({ valid: true, role: 'halted', severity: 'critical', actionsDisabled: true, allowedActionIds: [], motion: { kind: 'none' } });
  });
  it('bad profiles or maps cannot erase an explicit halt', () => {
    for (const [profile, map] of [[{}, smith.mapping], [smith.profile, null]]) {
      expect(project({ emergencyHalt }, profile, map)).toMatchObject({ valid: false, role: 'halted', actionsDisabled: true });
    }
  });
  it('rejects malformed halt claims', () => {
    expect(project({ emergencyHalt: { reason: 'Missing source' } })).toMatchObject({ valid: false, role: 'unavailable' });
  });
  it('mapping a state to halted cannot create emergency authority', () => {
    const map = { ...smith.mapping, mappings: [{ source: 'smith', context: 'pipeline', nativeState: 'EXECUTING', role: 'halted' }] };
    expect(project({}, smith.profile, map).valid).toBe(false);
  });
  it('primed needs a producer forecast and cannot enable an action', () => {
    const map = { version: 1, owner: 'fixture', mappings: [{ source: 'smith', context: 'pipeline', nativeState: 'EXECUTING', role: 'primed' }] };
    expect(project({}, smith.profile, map).valid).toBe(false);
    expect(project({ anticipatedAction: 'Review soon' }, smith.profile, map)).toMatchObject({ valid: true, role: 'primed', actionsDisabled: true });
    expect(project({ anticipatedAction: 'Review soon', allowedActionIds: ['approve'] }, smith.profile, map).valid).toBe(false);
  });
});

describe('motion and announcement contract', () => {
  it.each(['idle', 'blocked', 'failed', 'halted', 'degraded', 'unavailable'] as const)('%s is static', role => {
    expect(motionFor(role)).toEqual({ kind: 'none', durationMs: 0, iterations: 0 });
  });
  it('completion arrives once; reduced motion and critical severity are static', () => {
    expect(motionFor('complete')).toEqual({ kind: 'arrival', durationMs: 180, iterations: 1 });
    expect(motionFor('working', true).kind).toBe('none');
    expect(project({ severity: 'critical' }).motion.kind).toBe('none');
  });
  it('reduced motion preserves all semantics and labels', () => {
    const normal = project();
    const reduced = project({}, { ...smith.profile, motion: 'reduced' });
    for (const key of ['role', 'label', 'symbol', 'authority', 'evidence', 'freshness', 'allowedActionIds'])
      expect(reduced[key as keyof typeof reduced]).toEqual(normal[key as keyof typeof normal]);
    expect(reduced.motion.kind).toBe('none');
  });
  it('poll timestamps do not trigger repeated status announcements', () => {
    const before = project();
    const after = project({ observedAt: '2026-09-27T12:00:01.000Z' });
    expect(announcementChanged(before, after)).toBe(false);
    expect(after.announcement.announceElapsed).toBe(false);
    expect(announcementChanged(before, project({ nativeState: 'DONE' }))).toBe(true);
  });
  it('ordinary status is polite; explicit halt is assertive and simulation is spoken', () => {
    expect(project().announcement).toMatchObject({ politeness: 'polite' });
    const halted = project({ emergencyHalt: { source: 'backend', reason: 'Stop' } });
    expect(halted.announcement.politeness).toBe('assertive');
    expect(halted.announcement.text).toContain('Simulated.');
  });
  it('degraded is persistent input, independent of whether a toast exists', () => {
    const input = { ...command.snapshot, context: 'registry', nativeState: 'attention', authority: 'automatic' };
    expect(projectState(input, command.mapping, command.profile).role).toBe('degraded');
    expect(projectState({ ...input, observedAt: '2026-09-27T12:01:00.000Z' }, command.mapping, command.profile).role).toBe('degraded');
  });
});

it('public vocabularies and nested labels cannot be mutated to redefine semantics', () => {
  expect(Object.isFrozen(ROLES)).toBe(true);
  expect(Object.isFrozen(LABELS.blocked)).toBe(true);
  expect(() => { (ROLES as unknown as string[]).push('fake'); }).toThrow();
});
it('halt provenance survives an invalid profile', () => {
  const emergencyHalt = { source: 'backend', reason: 'Emergency stop' };
  const result = project({ emergencyHalt }, {});
  expect(result.emergencyHalt).toEqual(emergencyHalt);
  expect(result.announcement.text).toContain('Emergency stop');
});
it('priming preserves the producer preview without implying clearance', () => {
  const mapping = { version: 1, owner: 'fixture', mappings: [{ source: 'smith', context: 'pipeline', nativeState: 'EXECUTING', role: 'primed' }] };
  expect(project({ anticipatedAction: 'Review evidence' }, smith.profile, mapping)).toMatchObject({ anticipatedAction: 'Review evidence', actionsDisabled: true });
  expect(project({ anticipatedAction: 'Review evidence', authority: 'backend-cleared' }, smith.profile, mapping).valid).toBe(false);
});

it.each([
  ['idle', 'neutral', 'automatic', 'unverified'],
  ['working', 'neutral', 'automatic', 'unverified'],
  ['scanning', 'neutral', 'automatic', 'unverified'],
  ['verifying', 'neutral', 'automatic', 'verifying'],
  ['orchestrating', 'neutral', 'automatic', 'unverified'],
  ['awaiting_authority', 'attention', 'human-required', 'unverified'],
  ['primed', 'attention', 'human-required', 'unverified'],
  ['blocked', 'blocked', 'human-required', 'unverified'],
  ['degraded', 'attention', 'automatic', 'unverified'],
  ['complete', 'healthy', 'automatic', 'verified'],
  ['failed', 'critical', 'unavailable', 'invalid'],
  ['halted', 'critical', 'unavailable', 'unverified'],
])('supports the explicit %s presentation fixture', (role, severity, authority, evidence) => {
  const mapping = { version: 1, owner: 'simulated-matrix', mappings: [{ source: 'smith', context: 'pipeline', nativeState: 'EXECUTING', role }] };
  const change = { severity, authority, evidence,
    ...(role === 'primed' ? { anticipatedAction: 'Review the next result' } : {}),
    ...(role === 'halted' ? { emergencyHalt: { source: 'fixture', reason: 'Simulated stop' } } : {}),
  };
  const view = project(change, smith.profile, mapping);
  expect(view).toMatchObject({ valid: true, role, severity, authority, evidence, simulation: true, actionsDisabled: true });
  expect(view.label.length).toBeGreaterThan(0);
  expect(view.symbol.length).toBeGreaterThan(0);
});
it('severity and authority changes are announced, but source age ticks are not', () => {
  const before = project();
  expect(announcementChanged(before, project({ severity: 'attention' }))).toBe(true);
  expect(announcementChanged(before, project({ authority: 'human-required' }))).toBe(true);
});
