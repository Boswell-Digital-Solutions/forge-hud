import type { DisplayRole } from './roles.js';
export interface MotionSpec {
  kind: 'none' | 'rotation' | 'sweep' | 'convergence' | 'pulse' | 'breath' | 'arrival';
  durationMs: number;
  iterations: number | 'continuous';
}
const NONE: Readonly<MotionSpec> = { kind: 'none', durationMs: 0, iterations: 0 };
const MOTION: Readonly<Record<DisplayRole, Readonly<MotionSpec>>> = {
  idle: NONE, blocked: NONE, failed: NONE, halted: NONE, degraded: NONE, unavailable: NONE,
  working: { kind: 'rotation', durationMs: 1600, iterations: 'continuous' },
  scanning: { kind: 'sweep', durationMs: 2200, iterations: 'continuous' },
  verifying: { kind: 'sweep', durationMs: 2800, iterations: 'continuous' },
  orchestrating: { kind: 'convergence', durationMs: 2400, iterations: 'continuous' },
  awaiting_authority: { kind: 'pulse', durationMs: 3600, iterations: 'continuous' },
  primed: { kind: 'breath', durationMs: 4000, iterations: 'continuous' },
  complete: { kind: 'arrival', durationMs: 180, iterations: 1 },
};
/** Unknown roles are inert even when callers bypass TypeScript. */
export function motionFor(role: DisplayRole, reduced = false, critical = false): MotionSpec {
  return { ...(reduced || critical ? NONE : Object.hasOwn(MOTION, role) ? MOTION[role] : NONE) };
}
