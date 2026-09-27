# ForgeHUD Svelte package — R1 contracts

Private package `@forgehud/svelte`, version 0.1.0. This is a TypeScript presentation
foundation for Svelte 5 consumers. **No Svelte components or live application
integration are included yet.** The name is reserved locally by this private package;
no npm publication or registry ownership is claimed.

## Build and check

Requires Node 20.19+ and npm. From this directory:

```bash
npm ci --ignore-scripts
npm run check
npm test
npm run build
```

The build emits ESM and declarations to `dist/`, plus scoped CSS exported as
`@forgehud/svelte/theme.css`. `dist/` is generated and not committed. Build before
packing or importing the package. `svelte.config.js` is a placeholder configuration
for the next component slice; no Svelte compilation is required by R1.

## Projection boundary

```ts
import { projectState, announcementChanged } from '@forgehud/svelte';

// Application-owned mappings are not part of a cosmetic skin.
const mapping = {
  version: 1,
  owner: 'my-app',
  mappings: [{ source: 'jobs', context: 'build', nativeState: 'RUNNING', role: 'working' }],
};
const skin = {
  id: 'operator', language: 'operator', density: 'compact',
  contrast: 'standard', motion: 'standard', sourceAccent: '#38bdf8',
};
const view = projectState({
  source: 'jobs', context: 'build', nativeState: 'RUNNING',
  observedAt: '2026-09-27T12:00:00.000Z',
  severity: 'neutral', authority: 'automatic', evidence: 'unverified',
  freshness: 'current', locked: true, simulation: true,
  reason: 'Example build activity; not live system state.', allowedActionIds: [],
}, mapping, skin);
// Render view.label and view.symbol, preserve view.simulationLabel and provenance.
// Do not execute actions from this model; use existing application-owned handlers.
const shouldAnnounce = announcementChanged(null, view);
```

`projectState` returns a display model for valid JSON-shaped inputs or a visible,
action-disabled fallback with structured issues. It does not silently coerce unknown
native states. A malformed skin cannot erase a separately well-formed explicit halt.
The fallback still has `valid: false`; halt preservation is conservative display,
not proof that its sender is authentic.

Public exports: `projectState`, `validateSnapshot`, `validateMapping`,
`validateProfile`, `motionFor`, `announcementChanged`, role/channel constants, labels,
symbols and TypeScript types. Validators return `{ ok, value }` or `{ ok, issues }`.
The boundary is JSON data, not arbitrary class instances, proxies or hostile getters.

- Mapping keys match source + context + nativeState exactly. No case folding or default.
- Snapshots require all channels and UTC ISO timestamps with milliseconds. Freshness
  is supplied by the producer; this package does not own polling, a clock or stale-age policy.
- `emergencyHalt: { source, reason }` overrides ordinary mappings and suppresses actions.
- `anticipatedAction` is a producer forecast, required for primed; primed has no enabled
  actions and cannot claim backend clearance.
- Invalid, stale or conflicted evidence, non-current freshness, unavailable authority,
  a lock, priming, a halt, or simulation suppress action IDs. This is conservative
  display eligibility only; backend authorization must still be checked at invocation.
- Completion does not manufacture verified evidence. Channels retain producer facts.
- Built-in operator/plain wording and density may differ; skins cannot supply role,
  action, severity or label overrides. Source accent is a separate, hex-only slot.

See [authority boundaries](docs/authority-boundary.md) and the
[accessibility matrix](docs/accessibility-matrix.md). Source-grounded fixtures are
synthetic and explicitly marked; the reviewer fixture has no bound Tarcie runtime.
