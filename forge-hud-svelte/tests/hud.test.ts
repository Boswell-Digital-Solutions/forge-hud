import { describe, expect, it } from 'vitest';
import { projectHud } from '../src/adapters/hud.js';
import smith from './fixtures/smith.json';
import command from './fixtures/forge-command.json';

const actions = [{ id: 'review-decision', label: 'Request review' }];
describe('single-context HUD projection', () => {
  it('preserves locked-but-working without calling it blocked', () => {
    const hud = projectHud({ ...smith, sessionLabel: 'Run 12' });
    expect(hud.model.role).toBe('working');
    expect(hud.model.locked).toBe(true);
    expect(hud.sessionLabel).toBe('Run 12');
  });
  it('keeps decision halt distinct from an emergency halt', () => {
    const hud = projectHud({ ...command, actions });
    expect(hud.model.role).toBe('awaiting_authority');
    expect(hud.model.emergencyHalt).toBeNull();
    expect(hud.model.actionsDisabled).toBe(true);
  });
  it.each([smith, command])('explicit halt overrides the application state', fixture => {
    const hud = projectHud({ ...fixture, actions, snapshot: {
      ...fixture.snapshot, emergencyHalt: { source: 'test', reason: 'Stop' },
    } });
    expect(hud.model.role).toBe('halted');
    expect(hud.model.allowedActionIds).toEqual([]);
    expect(hud.model.motion.kind).toBe('none');
  });
  it('cannot enable an ID just by labeling it', () => {
    const hud = projectHud({ ...command, snapshot: { ...command.snapshot, simulation: false },
      actions: [...actions, { id: 'invented', label: 'Proceed' }] });
    expect(hud.model.allowedActionIds).toEqual(['review-decision']);
  });
  it.each([null, 'review', [{id:'a',label:'Go',execute:'anything'}],
    [{id:'a',label:'Go'},{id:'a',label:'Again'}], [{id:'',label:'Go'}]])('rejects malformed labels without a partial action list (%j)', value => {
    const hud = projectHud({ ...command, actions: value });
    expect(hud.actions).toEqual([]);
    expect(hud.configurationIssues.length).toBeGreaterThan(0);
  });
  it('copies labels and rejects malformed session metadata', () => {
    const hud = projectHud({ ...command, actions });
    hud.actions[0]!.label = 'Changed';
    expect(actions[0]!.label).toBe('Request review');
    expect(projectHud({ ...command, actions, sessionLabel: {} }).actions).toEqual([]);
  });
  it('preserves unavailable fallback and separately valid halt on invalid skin', () => {
    expect(projectHud({ ...smith, mapping: {} }).model.role).toBe('unavailable');
    const hud = projectHud({ ...smith, profile: {}, snapshot: {
      ...smith.snapshot, emergencyHalt: { source: 'test', reason: 'Stop' },
    } });
    expect(hud.model.valid).toBe(false);
    expect(hud.model.role).toBe('halted');
  });
  it('does not let skin language change state or action eligibility', () => {
    const operator = projectHud(command);
    const plain = projectHud({ ...command, profile: { ...command.profile, language: 'plain', density: 'calm' } });
    expect(plain.model.role).toBe(operator.model.role);
    expect(plain.model.allowedActionIds).toEqual(operator.model.allowedActionIds);
    expect(plain.model.label).not.toBe(operator.model.label);
  });
});
