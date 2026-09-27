import { parseObservation, projectObservation } from './observations.js';
import type { ActivityObservation, ActivityScope } from './observations.js';

export interface NeuroForgeStreamBinding {
  scope: ActivityScope;
  origin: { appId: string; taskId: string };
  requestId: string;
  attemptId: string;
}
export interface NeuroForgeStreamReport {
  binding: NeuroForgeStreamBinding;
  executionId: string;
  sequence: number;
  observedAt: string;
  phase: 'queued' | 'routed' | 'completed' | 'failed';
  selection: { provider: string; model: string } | null;
  provenance: { mode: 'unknown' | 'provider' | 'simulated'; provider: string | null; model: string | null };
}
export type NeuroForgeStreamStatus = 'waiting' | 'receiving' | 'finished' | 'disconnected' | 'invalid' | 'revoked';
const object = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const exact = (x: Record<string, unknown>, fields: string[]) => Object.keys(x).length === fields.length && fields.every(key => Object.hasOwn(x, key));
const text = (x: unknown): x is string => typeof x === 'string' && x.length > 0 && x.length <= 120 && x.trim() === x && !/[\u0000-\u001f\u007f]/.test(x);
const stamp = (x: unknown): x is string => text(x) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(x) && Number.isFinite(Date.parse(x)) && new Date(x).toISOString() === x;
const unknownProvenance = (): NeuroForgeStreamReport['provenance'] => ({ mode: 'unknown', provider: null, model: null });
function provenance(raw: unknown): NeuroForgeStreamReport['provenance'] | null {
  if (!object(raw) || !exact(raw, ['mode', 'provider', 'model'])) return null;
  if (raw.mode === 'unknown' || raw.mode === 'simulated') return raw.provider === null && raw.model === null ? { mode: raw.mode, provider: null, model: null } : null;
  if (raw.mode !== 'provider' || !['openai', 'anthropic', 'google', 'xai', 'deepseek', 'ollama'].includes(raw.provider as string)
    || !(raw.model === null || text(raw.model) && /^[A-Za-z0-9][A-Za-z0-9._:/@+\-]{0,119}$/.test(raw.model))) return null;
  return { mode: 'provider', provider: raw.provider as string, model: raw.model as string | null };
}
/** One already-authorized request stream. No fetch, replay, scope feed or authority. */
export function createNeuroForgeStream(binding: NeuroForgeStreamBinding) {
  // Reuse the strict origin/scope identifier boundary without changing its v1 schema.
  const seed = parseObservation({ version: 1, ...binding, backend: 'neuroforge', sequence: 0,
    observedAt: '2000-01-01T00:00:00.000Z', phase: 'queued', provider: null, model: null, simulation: false });
  if (!seed) throw new Error('Invalid NeuroForge stream binding.');
  const bound = { scope: seed.scope, origin: seed.origin, requestId: seed.requestId, attemptId: seed.attemptId };
  let current: NeuroForgeStreamReport | null = null;
  let status: NeuroForgeStreamStatus = 'waiting';
  const terminal = () => current?.phase === 'completed' || current?.phase === 'failed';
  const reject = () => { status = 'invalid'; return false; };
  return {
    get status() { return status; },
    report(): NeuroForgeStreamReport | null { return current ? structuredClone(current) : null; },
    /** Decoded SSE event name and JSON; caller bounds frame bytes before decoding. */
    accept(kind: string, data: unknown): boolean {
      if (['disconnected', 'invalid', 'revoked', 'finished'].includes(status)) return false;
      // Do not inspect, retain, stringify or log generated output/metrics.
      if (kind === 'chunk' || kind === 'metrics') return false;
      if (!['started', 'model_selected', 'completed', 'error'].includes(kind) || !object(data)) return reject();
      const ctx = data.activity_context;
      if (!object(ctx) || !exact(ctx, ['version', 'execution_id', 'sequence', 'observed_at']) || ctx.version !== 1
        || !text(ctx.execution_id) || !/^exec_[a-f0-9]{12}$/.test(ctx.execution_id) || !Number.isSafeInteger(ctx.sequence)
        || (ctx.sequence as number) < 0 || !stamp(ctx.observed_at)) return reject();
      if (current && ctx.execution_id !== current.executionId) return reject();
      if (current && (ctx.sequence as number) <= current.sequence) return false;
      if (ctx.sequence !== (current ? current.sequence + 1 : 0) || current && ctx.observed_at < current.observedAt) return reject();
      if (!current ? kind !== 'started' : kind === 'started' || terminal()) return reject();
      if ((kind === 'started' || kind === 'completed') && data.execution_id !== ctx.execution_id) return reject();
      if (kind === 'model_selected' && (current?.phase !== 'queued' || !text(data.provider) || !text(data.model))) return reject();
      if (kind === 'completed' && (current?.phase !== 'routed' || data.success !== true)) return reject();
      const identity = kind === 'completed' || kind === 'error' ? provenance(data.execution_provenance) : unknownProvenance();
      if (!identity) return reject();
      current = {
        binding: structuredClone(bound), executionId: ctx.execution_id, sequence: ctx.sequence as number, observedAt: ctx.observed_at,
        phase: kind === 'started' ? 'queued' : kind === 'model_selected' ? 'routed' : kind === 'completed' ? 'completed' : 'failed',
        selection: kind === 'model_selected' ? { provider: data.provider as string, model: data.model as string } : current?.selection ?? null,
        provenance: identity,
      };
      status = terminal() ? 'finished' : 'receiving';
      return true;
    },
    /** EOF/errors never reconnect by repeating the generation POST. */
    close() { if (status === 'waiting' || status === 'receiving') status = 'disconnected'; },
    revoke() { current = null; status = 'revoked'; },
  };
}
/** Unknown provenance is deliberately not coerced into v1's boolean simulation. */
export function projectNeuroForgeReport(report: NeuroForgeStreamReport, status: NeuroForgeStreamStatus, profile: unknown, nowMs: number, staleAfterMs: number) {
  if (status === 'revoked' || report.provenance.mode === 'unknown') return null;
  const observation: ActivityObservation = { version: 1, ...report.binding, backend: 'neuroforge',
    sequence: report.sequence, observedAt: report.observedAt, phase: report.phase,
    provider: report.provenance.provider, model: report.provenance.model, simulation: report.provenance.mode === 'simulated' };
  return projectObservation(observation, report.binding.scope, profile, {
    nowMs, staleAfterMs, connected: status === 'receiving' || status === 'finished',
  });
}
