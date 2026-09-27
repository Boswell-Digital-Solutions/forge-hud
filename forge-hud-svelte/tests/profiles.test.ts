import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { projectState, validateMapping, validateProfile } from '../src/index.js';
const fixture = (name: string) => JSON.parse(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), 'utf8'));
const smith = fixture('smith');

describe('profile isolation', () => {
  it.each(['smith', 'forge-command', 'authorforge', 'reviewer-simulated'])('validates the %s fixture without claiming live authority', name => {
    const f = fixture(name);
    expect(validateProfile(f.profile).ok).toBe(true);
    expect(validateMapping(f.mapping).ok).toBe(true);
    expect(projectState(f.snapshot, f.mapping, f.profile)).toMatchObject({ valid: true, simulation: true, actionsDisabled: true });
  });
  it('skin changes cannot remap semantic roles or channels', () => {
    const other = fixture('authorforge').profile;
    const first = projectState(smith.snapshot, smith.mapping, smith.profile);
    const second = projectState(smith.snapshot, smith.mapping, other);
    for (const key of ['role', 'severity', 'authority', 'evidence', 'freshness', 'locked', 'source'])
      expect(first[key as keyof typeof first]).toEqual(second[key as keyof typeof second]);
  });
  it.each([{ role: 'complete' }, { labels: { blocked: 'Success' } }, { actions: ['approve'] }, { severityColor: '#00ff00' }, { mapping: {} }])('rejects semantic override %j', patch => {
    const profile = { ...smith.profile, ...patch };
    expect(validateProfile(profile).ok).toBe(false);
    expect(projectState(smith.snapshot, smith.mapping, profile)).toMatchObject({ valid: false, role: 'unavailable' });
  });
  it('source accent is an independent slot and never changes severity', () => {
    const view = projectState(smith.snapshot, smith.mapping, { ...smith.profile, sourceAccent: '#ff0000' });
    expect(view).toMatchObject({ valid: true, severity: 'neutral', sourceAccent: '#ff0000' });
  });
  it.each(['url(https://example.com/a)', 'red;display:none', '#fff', ''])('rejects unbounded source accent %s', sourceAccent => {
    expect(validateProfile({ ...smith.profile, sourceAccent }).ok).toBe(false);
  });
  it('rejects invalid density/motion and missing required fields', () => {
    expect(validateProfile({ ...smith.profile, density: 'hidden' }).ok).toBe(false);
    expect(validateProfile({ ...smith.profile, motion: 'flash' }).ok).toBe(false);
    expect(validateProfile({ id: 'empty' }).ok).toBe(false);
  });
  it('rejects duplicate mapping keys instead of taking the first match', () => {
    const mapping = structuredClone(smith.mapping);
    mapping.mappings.push({ ...mapping.mappings[0], role: 'complete' });
    expect(validateMapping(mapping)).toMatchObject({ ok: false, issues: expect.arrayContaining([expect.objectContaining({ code: 'duplicate' })]) });
  });
  it('keys are tuples, not delimiter-concatenated strings', () => {
    const mappings = [
      { source: 'a:b', context: 'c', nativeState: 'd', role: 'idle' },
      { source: 'a', context: 'b:c', nativeState: 'd', role: 'working' },
    ];
    expect(validateMapping({ version: 1, owner: 'fixture', mappings }).ok).toBe(true);
  });
  it('rejects unknown roles and contract versions', () => {
    expect(validateMapping({ ...smith.mapping, version: 2 }).ok).toBe(false);
    expect(validateMapping({ ...smith.mapping, mappings: [{ ...smith.mapping.mappings[0], role: 'success-ish' }] }).ok).toBe(false);
  });
  it('prototype names cannot impersonate profile fields or state mappings', () => {
    expect(validateProfile(Object.create(smith.profile)).ok).toBe(false);
    expect(projectState({ ...smith.snapshot, nativeState: '__proto__' }, smith.mapping, smith.profile).valid).toBe(false);
  });
});
