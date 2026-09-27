import type { Role, DisplayRole, SEVERITIES, AUTHORITIES, EVIDENCE, FRESHNESS } from './roles.js';
import type { MotionSpec } from './motion.js';
export type Severity = typeof SEVERITIES[number];
export type Authority = typeof AUTHORITIES[number];
export type Evidence = typeof EVIDENCE[number];
export type Freshness = typeof FRESHNESS[number];
export interface Issue { code: 'shape' | 'value' | 'duplicate' | 'unmapped' | 'contradiction'; path: string; message: string }
export type Result<T> = { ok: true; value: T } | { ok: false; issues: Issue[] };
export interface Profile {
  id: string;
  language: 'operator' | 'plain';
  density: 'compact' | 'standard' | 'calm';
  contrast: 'standard' | 'high';
  motion: 'standard' | 'reduced';
  /** Source identity slot only; never the severity color. */
  sourceAccent: string;
}
export interface StateMapping { source: string; context: string; nativeState: string; role: Role }
export interface MappingContract { version: 1; owner: string; mappings: StateMapping[] }
export interface Snapshot {
  source: string;
  context: string;
  nativeState: string;
  /** UTC ISO timestamp with milliseconds, supplied by the state producer. */
  observedAt: string;
  severity: Severity;
  authority: Authority;
  evidence: Evidence;
  freshness: Freshness;
  locked: boolean;
  simulation: boolean;
  reason: string;
  /** IDs only. Labels and execution belong to the consuming application. */
  allowedActionIds: string[];
  emergencyHalt?: { source: string; reason: string };
  /** Producer-provided forecast. Presence does not grant an action. */
  anticipatedAction?: string;
}
export interface DisplayModel {
  valid: boolean;
  role: DisplayRole;
  label: string;
  symbol: string;
  severity: Severity;
  authority: Authority;
  evidence: Evidence;
  freshness: Freshness;
  locked: boolean;
  simulation: boolean;
  simulationLabel: string | null;
  source: { id: string; context: string; nativeState: string; observedAt: string } | null;
  sourceAccent: string | null;
  reason: string;
  /** Display eligibility only; never backend authorization. */
  emergencyHalt: { source: string; reason: string } | null;
  anticipatedAction: string | null;
  actionsDisabled: boolean;
  allowedActionIds: string[];
  profile: Profile | null;
  motion: MotionSpec;
  announcement: { politeness: 'polite' | 'assertive'; text: string; announceElapsed: false };
  issues: Issue[];
}
