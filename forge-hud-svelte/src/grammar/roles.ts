/** Presentation roles, never a universal business-state enum. */
export const ROLES = Object.freeze(['idle', 'working', 'scanning', 'verifying', 'orchestrating',
  'awaiting_authority', 'primed', 'blocked', 'degraded', 'complete', 'failed', 'halted'] as const);
export type Role = typeof ROLES[number];
export type DisplayRole = Role | 'unavailable';
export const SEVERITIES = Object.freeze(['neutral', 'healthy', 'attention', 'blocked', 'critical'] as const);
export const AUTHORITIES = Object.freeze(['automatic', 'human-required', 'backend-cleared', 'unavailable'] as const);
export const EVIDENCE = Object.freeze(['unverified', 'verifying', 'verified', 'stale', 'conflicted', 'invalid'] as const);
export const FRESHNESS = Object.freeze(['current', 'aging', 'stale', 'unknown'] as const);
export const LABELS: Readonly<Record<DisplayRole, readonly [string, string]>> = Object.freeze({
  idle: ['Idle', 'Not running'], working: ['Working', 'Working'], scanning: ['Scanning', 'Checking sources'],
  verifying: ['Verifying', 'Checking evidence'], orchestrating: ['Orchestrating', 'Coordinating work'],
  awaiting_authority: ['Awaiting authority', 'Waiting for your approval'], primed: ['Primed', 'Upcoming action — not yet available'],
  blocked: ['Blocked', 'Needs attention before continuing'], degraded: ['Degraded', 'Running with reduced capability'],
  complete: ['Complete', 'Complete'], failed: ['Failed', 'Could not finish'], halted: ['System halted', 'System stopped'],
  unavailable: ['Status unavailable', 'Status unavailable'],
});
export const SYMBOLS: Readonly<Record<DisplayRole, string>> = Object.freeze({
  idle: '○', working: '↻', scanning: '⌕', verifying: '◇', orchestrating: '⇄',
  awaiting_authority: '⌛', primed: '◌', blocked: '⊘', degraded: '△', complete: '✓', failed: '✕', halted: '■', unavailable: '?',
});

// Freeze nested label pairs as well as the public vocabulary containers.
for (const labels of Object.values(LABELS)) Object.freeze(labels);
