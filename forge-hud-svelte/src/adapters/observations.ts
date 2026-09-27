import { projectHud } from './hud.js';
import type { HudPresentation } from './hud.js';
import type { ProviderId } from './activity.js';

export interface ActivityScope {
  plane: 'business-local' | 'public-app';
  /** Opaque audience identifier resolved by the authenticated transport. */
  scopeId: string;
}
export const ACTIVITY_PHASES = ['queued', 'routed', 'executing', 'waiting', 'blocked', 'completed', 'failed', 'halted'] as const;
export type ActivityPhase = typeof ACTIVITY_PHASES[number];
/** Proposed display boundary. Not an upstream execution or authorization schema. */
export interface ActivityObservation {
  version: 1;
  scope: ActivityScope;
  origin: { appId: string; taskId: string };
  requestId: string;
  attemptId: string;
  backend: 'yellowjacket' | 'neuroforge';
  sequence: number;
  observedAt: string;
  phase: ActivityPhase;
  provider: string | null;
  model: string | null;
  simulation: boolean;
}
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const keys = (value: Record<string, unknown>, expected: string[]) => Object.keys(value).length === expected.length && expected.every(key => Object.hasOwn(value, key));
const text = (value: unknown): value is string => typeof value === 'string' && value.trim() === value && value.length > 0 && value.length <= 120 && !/[\u0000-\u001f\u007f]/.test(value);
const nullableText = (value: unknown) => value === null || text(value);
function validScope(value: unknown): value is ActivityScope {
  return object(value) && keys(value, ['plane', 'scopeId']) && ['business-local', 'public-app'].includes(value.plane as string) && text(value.scopeId);
}
/** Reject extra fields so prompts, output and arbitrary error payloads cannot enter this boundary. */
export function parseObservation(value: unknown): ActivityObservation | null {
  if (!object(value) || !keys(value, ['version', 'scope', 'origin', 'requestId', 'attemptId', 'backend', 'sequence', 'observedAt', 'phase', 'provider', 'model', 'simulation'])
    || value.version !== 1 || !validScope(value.scope) || !object(value.origin)
    || !keys(value.origin, ['appId', 'taskId']) || !text(value.origin.appId) || !text(value.origin.taskId)
    || !text(value.requestId) || !text(value.attemptId) || !['yellowjacket', 'neuroforge'].includes(value.backend as string)
    || !Number.isSafeInteger(value.sequence) || (value.sequence as number) < 0
    || !text(value.observedAt) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value.observedAt)
    || !Number.isFinite(Date.parse(value.observedAt)) || new Date(value.observedAt).toISOString() !== value.observedAt
    || !ACTIVITY_PHASES.includes(value.phase as ActivityPhase) || !nullableText(value.provider) || !nullableText(value.model)
    || typeof value.simulation !== 'boolean') return null;
  // Return a detached record; callers cannot mutate an accepted scope through the input.
  return { ...value, scope: { ...value.scope }, origin: { ...value.origin } } as unknown as ActivityObservation;
}
export function observationKey(event: ActivityObservation): string {
  return JSON.stringify([event.scope.plane, event.scope.scopeId, event.origin.appId, event.origin.taskId, event.requestId, event.attemptId, event.backend]);
}
/** Per-attempt guard. Consumer keeps separate entries; this is not an authorization check. */
export function acceptObservation(previous: ActivityObservation | null, input: unknown, expected: ActivityScope): ActivityObservation | null {
  const event = parseObservation(input);
  if (!event || !validScope(expected) || event.scope.plane !== expected.plane || event.scope.scopeId !== expected.scopeId) return null;
  if (previous) {
    const prior = parseObservation(previous);
    if (!prior || observationKey(prior) !== observationKey(event) || event.sequence <= prior.sequence) return null;
    if (['completed', 'failed', 'halted'].includes(prior.phase) && (event.phase !== prior.phase || event.provider !== prior.provider || event.model !== prior.model || event.simulation !== prior.simulation)) return null;
    if (Date.parse(event.observedAt) < Date.parse(prior.observedAt)) return null;
  }
  return event;
}
const aliases: Record<string, ProviderId> = { openai: 'openai', anthropic: 'anthropic', google: 'gemini', gemini: 'gemini', xai: 'grok', grok: 'grok', deepseek: 'deepseek' };
const roles = { queued: 'idle', routed: 'primed', executing: 'working', waiting: 'awaiting_authority', blocked: 'blocked', completed: 'complete', failed: 'failed', halted: 'halted' } as const;
/** Time and connection posture are supplied by the consumer, never inferred from a spinner. */
export function projectObservation(input: unknown, expected: ActivityScope, profile: unknown, clock: { nowMs: number; staleAfterMs: number; connected: boolean }): HudPresentation | null {
  const event = acceptObservation(null, input, expected);
  if (!event || !Number.isFinite(clock.nowMs) || !Number.isFinite(clock.staleAfterMs) || clock.staleAfterMs <= 0 || typeof clock.connected !== 'boolean') return null;
  const age = clock.nowMs - Date.parse(event.observedAt);
  const freshness = age < 0 ? 'unknown' : !clock.connected || age >= clock.staleAfterMs ? 'stale' : 'current';
  const role = roles[event.phase];
  const provider = event.provider && Object.hasOwn(aliases, event.provider) ? aliases[event.provider]! : null;
  return projectHud({
    snapshot: { source: event.backend, context: event.origin.appId, nativeState: event.phase, observedAt: event.observedAt,
      severity: event.phase === 'halted' ? 'critical' : ['blocked', 'failed'].includes(event.phase) ? 'blocked' : 'neutral',
      authority: event.phase === 'waiting' ? 'human-required' : 'automatic', evidence: 'unverified', freshness,
      locked: !['queued', 'completed'].includes(event.phase), simulation: event.simulation,
      reason: `Producer-reported ${event.phase} for task ${event.origin.taskId}.`, allowedActionIds: [],
      ...(event.phase === 'routed' ? { anticipatedAction: 'Provider selected; execution not yet observed.' } : {}),
      ...(event.phase === 'halted' ? { emergencyHalt: { source: event.backend, reason: 'Producer-reported halt.' } } : {}),
    },
    mapping: { version: 1, owner: 'origin-activity-adapter', mappings: [{ source: event.backend, context: event.origin.appId, nativeState: event.phase, role }] },
    profile, sessionLabel: `${event.origin.appId} · ${event.origin.taskId}`,
    activity: { backend: event.backend, provider, model: event.model },
  });
}
