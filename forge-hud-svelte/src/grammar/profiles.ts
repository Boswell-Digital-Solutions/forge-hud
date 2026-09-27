import type { Issue, Profile, Result, MappingContract, StateMapping } from './types.js';
import { ROLES } from './roles.js';

/** The boundary accepts JSON-shaped records, not component instances or arrays. */
export function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}
export function text(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0 && value.length <= 1000; }
export function member<T extends string>(values: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && values.includes(value as T);
}
export function shape(value: unknown, required: string[], optional: string[], path: string): Issue[] {
  if (!record(value)) return [{ code: 'shape', path, message: 'Expected a JSON object.' }];
  const issues: Issue[] = [];
  for (const key of required) if (!Object.hasOwn(value, key)) issues.push({ code: 'shape', path: `${path}.${key}`, message: 'Required field is missing.' });
  for (const key of Object.keys(value)) if (![...required, ...optional].includes(key)) issues.push({ code: 'shape', path: `${path}.${key}`, message: 'Unsupported field.' });
  return issues;
}
export function validateProfile(input: unknown): Result<Profile> {
  const issues = shape(input, ['id', 'language', 'density', 'contrast', 'motion', 'sourceAccent'], [], 'profile');
  if (!record(input)) return { ok: false, issues };
  const valid = text(input.id) && member(['operator', 'plain'], input.language)
    && member(['compact', 'standard', 'calm'], input.density) && member(['standard', 'high'], input.contrast)
    && member(['standard', 'reduced'], input.motion) && typeof input.sourceAccent === 'string' && /^#[0-9a-f]{6}$/i.test(input.sourceAccent);
  if (!valid) issues.push({ code: 'value', path: 'profile', message: 'Invalid profile value.' });
  if (issues.length) return { ok: false, issues };
  return { ok: true, value: { ...input } as unknown as Profile };
}
export function validateMapping(input: unknown): Result<MappingContract> {
  const issues = shape(input, ['version', 'owner', 'mappings'], [], 'mapping');
  if (!record(input)) return { ok: false, issues };
  if (input.version !== 1 || !text(input.owner) || !Array.isArray(input.mappings) || input.mappings.length === 0 || input.mappings.length > 512) {
    issues.push({ code: 'value', path: 'mapping', message: 'Expected version 1, an owner and 1–512 mappings.' });
    return { ok: false, issues };
  }
  const keys = new Set<string>();
  const mappings: StateMapping[] = [];
  for (const [i, item] of input.mappings.entries()) {
    const path = `mapping.mappings[${i}]`;
    issues.push(...shape(item, ['source', 'context', 'nativeState', 'role'], [], path));
    if (!record(item) || !text(item.source) || !text(item.context) || !text(item.nativeState) || !member(ROLES, item.role)) {
      issues.push({ code: 'value', path, message: 'Invalid source-qualified mapping.' });
      continue;
    }
    const key = JSON.stringify([item.source, item.context, item.nativeState]);
    if (keys.has(key)) issues.push({ code: 'duplicate', path, message: 'Ambiguous duplicate native-state mapping.' });
    keys.add(key);
    mappings.push({ source: item.source, context: item.context, nativeState: item.nativeState, role: item.role });
  }
  return issues.length ? { ok: false, issues } : { ok: true, value: { version: 1, owner: input.owner as string, mappings } };
}
