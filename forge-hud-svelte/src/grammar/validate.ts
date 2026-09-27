import { AUTHORITIES, EVIDENCE, FRESHNESS, SEVERITIES, LABELS, SYMBOLS } from './roles.js';
import type { DisplayRole } from './roles.js';
import type { DisplayModel, Issue, Result, Snapshot, Profile } from './types.js';
import { record, text, member, shape, validateMapping, validateProfile } from './profiles.js';
import { motionFor } from './motion.js';

function validHalt(input: unknown): input is NonNullable<Snapshot['emergencyHalt']> {
  return shape(input, ['source', 'reason'], [], 'emergencyHalt').length === 0
    && record(input) && text(input.source) && text(input.reason);
}
export function validateSnapshot(input: unknown): Result<Snapshot> {
  const issues = shape(input, ['source', 'context', 'nativeState', 'observedAt', 'severity', 'authority',
    'evidence', 'freshness', 'locked', 'simulation', 'reason', 'allowedActionIds'], ['emergencyHalt', 'anticipatedAction'], 'snapshot');
  if (!record(input)) return { ok: false, issues };
  for (const field of ['source', 'context', 'nativeState', 'reason']) {
    if (!text(input[field])) issues.push({ code: 'value', path: `snapshot.${field}`, message: 'Expected nonempty text.' });
  }
  const stamp = input.observedAt;
  if (typeof stamp !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(stamp)
      || !Number.isFinite(Date.parse(stamp)) || new Date(stamp).toISOString() !== stamp) {
    issues.push({ code: 'value', path: 'snapshot.observedAt', message: 'Expected a real UTC ISO timestamp with milliseconds.' });
  }
  if (!member(SEVERITIES, input.severity) || !member(AUTHORITIES, input.authority)
      || !member(EVIDENCE, input.evidence) || !member(FRESHNESS, input.freshness)
      || typeof input.locked !== 'boolean' || typeof input.simulation !== 'boolean') {
    issues.push({ code: 'value', path: 'snapshot', message: 'Invalid semantic channel or boolean.' });
  }
  if (!Array.isArray(input.allowedActionIds) || input.allowedActionIds.length > 32
      || !input.allowedActionIds.every(text) || new Set(input.allowedActionIds).size !== input.allowedActionIds.length) {
    issues.push({ code: 'value', path: 'snapshot.allowedActionIds', message: 'Expected up to 32 unique action IDs.' });
  }
  if (Object.hasOwn(input, 'emergencyHalt') && !validHalt(input.emergencyHalt))
    issues.push({ code: 'value', path: 'snapshot.emergencyHalt', message: 'Halt requires a source and reason.' });
  if (Object.hasOwn(input, 'anticipatedAction') && !text(input.anticipatedAction))
    issues.push({ code: 'value', path: 'snapshot.anticipatedAction', message: 'Expected producer-provided anticipation text.' });
  if (issues.length) return { ok: false, issues };
  // Copy nested data: callers must not mutate a validated snapshot indirectly.
  const value = { ...input, allowedActionIds: [...input.allowedActionIds as string[]] } as unknown as Snapshot;
  if (value.emergencyHalt) value.emergencyHalt = { ...value.emergencyHalt };
  return { ok: true, value };
}
function unavailable(issues: Issue[], input: unknown): DisplayModel {
  // A separately well-formed explicit halt is never erased by a bad skin/mapping.
  const halt = record(input) && validHalt(input.emergencyHalt) ? { ...input.emergencyHalt } : null;
  const halted = halt !== null;
  const role = halted ? 'halted' : 'unavailable';
  const simulation = record(input) && input.simulation === true;
  return { valid: false, role, label: LABELS[role][0], symbol: SYMBOLS[role],
    severity: halted ? 'critical' : 'attention', authority: 'unavailable', evidence: 'unverified', freshness: 'unknown',
    locked: true, simulation, simulationLabel: simulation ? 'SIMULATED STATE' : null,
    source: null, sourceAccent: null, reason: halt?.reason ?? 'Projection unavailable: inspect validation issues.',
    emergencyHalt: halt, anticipatedAction: null,
    actionsDisabled: true, allowedActionIds: [], profile: null, motion: motionFor(role),
    announcement: { politeness: halted ? 'assertive' : 'polite', text: `${simulation ? 'Simulated. ' : ''}${LABELS[role][0]}. ${halt?.reason ?? 'Projection unavailable.'}`, announceElapsed: false }, issues };
}
function contradictions(s: Snapshot, role: DisplayRole): Issue[] {
  const errors: string[] = [];
  if (role === 'halted' && !s.emergencyHalt) errors.push('Halted requires an explicit emergency source.');
  if (role === 'awaiting_authority' && s.authority !== 'human-required') errors.push('Awaiting authority requires human-required authority.');
  if (role === 'primed' && (!s.anticipatedAction || s.allowedActionIds.length > 0 || s.authority === 'backend-cleared')) errors.push('Primed requires anticipation, no enabled action and no claimed backend clearance.');
  if (role === 'blocked' && !['blocked', 'critical'].includes(s.severity)) errors.push('Blocked requires blocked or critical severity.');
  if (role === 'degraded' && !['attention', 'blocked', 'critical'].includes(s.severity)) errors.push('Degraded cannot present neutral or healthy severity.');
  if (role === 'failed' && !['blocked', 'critical'].includes(s.severity)) errors.push('Failed requires blocked or critical severity.');
  if (role === 'complete' && ['blocked', 'critical'].includes(s.severity)) errors.push('Complete conflicts with blocked or critical severity.');
  if (role === 'verifying' && s.evidence !== 'verifying') errors.push('Verification requires the verifying evidence channel.');
  return errors.map(message => ({ code: 'contradiction', path: 'snapshot', message }));
}
/** Pure projection. The result is never an authorization token or action executor. */
export function projectState(snapshot: unknown, mapping: unknown, profile: unknown): DisplayModel {
  const s = validateSnapshot(snapshot);
  const m = validateMapping(mapping);
  const p = validateProfile(profile);
  const issues: Issue[] = [...(!s.ok ? s.issues : []), ...(!m.ok ? m.issues : []), ...(!p.ok ? p.issues : [])];
  if (!s.ok || !m.ok || !p.ok) return unavailable(issues, snapshot);
  const value = s.value;
  const mapped = m.value.mappings.find(entry => entry.source === value.source && entry.context === value.context && entry.nativeState === value.nativeState);
  // Emergency halt outranks the current workflow role, including unmapped state.
  const role = value.emergencyHalt ? 'halted' : mapped?.role;
  if (!role) return unavailable([{ code: 'unmapped', path: 'snapshot.nativeState', message: 'No exact source/context/native-state mapping.' }], value);
  const errors = value.emergencyHalt ? [] : contradictions(value, role);
  if (errors.length) return unavailable(errors, value);
  const disabled = value.simulation || role === 'halted' || role === 'primed' || value.locked
    || value.authority === 'unavailable' || value.freshness !== 'current'
    || ['stale', 'conflicted', 'invalid'].includes(value.evidence);
  return display(value, role, p.value, disabled);
}
function display(s: Snapshot, role: DisplayRole, profile: Profile, disabled: boolean): DisplayModel {
  const label = LABELS[role][profile.language === 'plain' ? 1 : 0];
  const severity = role === 'halted' ? 'critical' : s.severity;
  const reason = s.emergencyHalt?.reason ?? s.reason;
  const summary = `Source: ${s.source}/${s.context}. ${label}. ${reason}${role === 'primed' ? ` Upcoming: ${s.anticipatedAction}.` : ''} Severity: ${severity}. Authority: ${s.authority}. Evidence: ${s.evidence}. Freshness: ${s.freshness}.`;
  return { valid: true, role, label, symbol: SYMBOLS[role], severity,
    authority: s.authority, evidence: s.evidence, freshness: s.freshness,
    locked: s.locked || role === 'halted', simulation: s.simulation,
    simulationLabel: s.simulation ? 'SIMULATED STATE' : null,
    source: { id: s.source, context: s.context, nativeState: s.nativeState, observedAt: s.observedAt },
    sourceAccent: profile.sourceAccent, reason, emergencyHalt: s.emergencyHalt ? { ...s.emergencyHalt } : null,
    anticipatedAction: role === 'primed' ? s.anticipatedAction ?? null : null, actionsDisabled: disabled || s.allowedActionIds.length === 0,
    allowedActionIds: disabled ? [] : [...s.allowedActionIds], profile: { ...profile },
    motion: motionFor(role, profile.motion === 'reduced', severity === 'critical'),
    announcement: { politeness: role === 'halted' ? 'assertive' : 'polite', text: `${s.simulation ? 'Simulated. ' : ''}${summary}`, announceElapsed: false }, issues: [] };
}
/** Consumers use a dedicated status live region; timer renders do not change it. */
export function announcementChanged(previous: DisplayModel | null, next: DisplayModel): boolean {
  return previous?.announcement.text !== next.announcement.text || previous?.announcement.politeness !== next.announcement.politeness;
}
