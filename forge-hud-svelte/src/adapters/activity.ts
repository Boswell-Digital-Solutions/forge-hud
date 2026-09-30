import type { DisplayModel } from '../grammar/types.js';
export const PROVIDERS = {
  openai: { label: 'OpenAI', icon: new URL('../assets/providers/openai.svg', import.meta.url).href },
  anthropic: { label: 'Anthropic', icon: new URL('../assets/providers/anthropic.svg', import.meta.url).href },
  grok: { label: 'Grok', icon: new URL('../assets/providers/grok.svg', import.meta.url).href },
  gemini: { label: 'Gemini', icon: new URL('../assets/providers/gemini-color.svg', import.meta.url).href },
  deepseek: { label: 'DeepSeek', icon: new URL('../assets/providers/deepseek-color.svg', import.meta.url).href },
  local: { label: 'Local model', icon: null },
} as const;
export type ProviderId = keyof typeof PROVIDERS;
/** Supplied by the producer for this snapshot, never inferred from source or role. */
export interface BackendActivity {
  backend: 'yellowjacket' | 'neuroforge';
  provider: ProviderId | null;
  model: string | null;
}
export function parseActivity(value: unknown): BackendActivity | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some(key => !['backend', 'provider', 'model'].includes(key))
    || !['yellowjacket', 'neuroforge'].includes(data.backend as string)
    || !(data.provider === null || typeof data.provider === 'string' && Object.hasOwn(PROVIDERS, data.provider))
    || !(data.model === null || typeof data.model === 'string' && data.model.trim().length > 0 && data.model.length <= 120)) return null;
  return { backend: data.backend as BackendActivity['backend'], provider: data.provider as BackendActivity['provider'], model: data.model as BackendActivity['model'] };
}
export function activityState(model: DisplayModel) {
  const uncertain = model.freshness === 'stale' || model.freshness === 'unknown';
  const danger = model.role === 'halted' || model.role === 'failed' || model.severity === 'critical';
  const warning = ['blocked', 'degraded'].includes(model.role) || ['blocked', 'attention'].includes(model.severity);
  const active = ['working', 'scanning', 'verifying', 'orchestrating'].includes(model.role);
  const tone = danger ? 'critical' : !model.valid || uncertain ? 'neutral' : warning ? 'warning'
    : model.role === 'complete' ? 'success' : ['awaiting_authority', 'primed'].includes(model.role) ? 'attention'
    : active ? 'working' : 'neutral';
  const moving = model.valid && !danger && !warning && !uncertain && active && model.profile?.motion !== 'reduced';
  const label = !danger && uncertain ? `${model.freshness === 'stale' ? 'Stale update' : 'Freshness unknown'} · ${model.label}` : model.label;
  return { tone, moving, label, lastReported: uncertain || model.role === 'idle' };
}
