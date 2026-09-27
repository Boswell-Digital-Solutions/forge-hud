import { parseActivity } from './activity.js';
import type { BackendActivity } from './activity.js';
import { projectState } from '../grammar/validate.js';
import type { DisplayModel } from '../grammar/types.js';

export interface HudAction { id: string; label: string }
export interface HudInput {
  snapshot: unknown;
  mapping: unknown;
  profile: unknown;
  /** Display metadata only, never used to select actions or authorize requests. */
  sessionLabel?: unknown;
  actions?: unknown;
  activity?: unknown;
}
export interface HudPresentation {
  model: DisplayModel;
  activity?: BackendActivity | null;
  sessionLabel: string | null;
  actions: HudAction[];
  configurationIssues: string[];
}
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= 1000;

/** Application-owned native mapping in, shared presentation out. No store or resolver. */
export function projectHud(input: HudInput): HudPresentation {
  const model = projectState(input.snapshot, input.mapping, input.profile);
  const configurationIssues: string[] = [];
  let sessionLabel: string | null = null;
  if (input.sessionLabel !== undefined && input.sessionLabel !== null) {
    if (text(input.sessionLabel)) sessionLabel = input.sessionLabel;
    else configurationIssues.push('Session label must be nonempty text.');
  }
  const activity = input.activity == null ? null : parseActivity(input.activity);
  if (input.activity != null && !activity) configurationIssues.push('Invalid backend activity metadata.');
  const actions: HudAction[] = [];
  const ids = new Set<string>();
  if (input.actions !== undefined) {
    if (!Array.isArray(input.actions) || input.actions.length > 32) {
      configurationIssues.push('Actions must be an array of at most 32 labels and IDs.');
    } else {
      for (const action of input.actions) {
        if (!action || typeof action !== 'object' || Array.isArray(action)
          || Object.keys(action).some(key => !['id', 'label'].includes(key))
          || !text(action.id) || !text(action.label) || ids.has(action.id)) {
          configurationIssues.push('Action IDs and labels must be nonempty and IDs unique.');
          break;
        }
        ids.add(action.id);
        actions.push({ id: action.id, label: action.label });
      }
    }
  }
  // Malformed display metadata cannot leave a partially usable action list.
  return { model, activity, sessionLabel, actions: configurationIssues.length ? [] : actions, configurationIssues };
}
