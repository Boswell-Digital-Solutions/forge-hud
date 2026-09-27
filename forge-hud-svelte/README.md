# ForgeHUD Svelte package — R3 HUD adapters

Private package `@forgehud/svelte`, version 0.1.0. This is a TypeScript presentation
foundation plus four Svelte 5 presentation components and a simulated showcase.
Live application integration remains deferred. The name is reserved locally by this private package;
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
packing or importing the package. Svelte components and their declarations are packaged by `svelte-package`.
Consumers need a Svelte-aware bundler; these are not precompiled DOM modules.

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

## Components and simulator

Import `ForgeProcessGlyph`, `ForgeStatusCapsule`, `ForgeEvidenceSeal`, and
`ForgeAuthorityGate` from `@forgehud/svelte`, plus `@forgehud/svelte/theme.css`.
All accept a `model` returned by `projectState`; do not construct or mutate models
manually. The status capsule includes the process glyph. Supply `elapsed` as a
formatted string; it stays outside the announcement region. When multiple capsules
show the same process, set `announce={false}` on duplicates.

The authority gate accepts application-owned `actions: { id, label }[]` and an
`onrequest(id)` callback. Only IDs retained by the model can request the callback;
missing handlers and suppressed states render disabled native buttons. The callback
must revalidate authorization in the existing application backend. It is not an
approval event, grant, evidence receipt or new action resolver.

Run `npm run dev` for the simulated SMITH, Forge Command, AuthorForge and reviewer
profiles. All showcase actions remain disabled. The isolated browser-test fixture
uses synthetic non-simulation inputs solely to exercise a local counter callback;
it has no backend connection.

Run `npx playwright install chromium` once if Chromium is unavailable, then
`npm run test:browser`. Committed Linux Chromium screenshots cover operator/plain
profiles. Deliberate visual changes require reviewing regenerated baselines using
`npm run test:browser -- --update-snapshots`. Automated accessibility checks do not
replace a human screen-reader review, which remains open before live adoption.

## HUD composition

R3 adds `projectHud`, `ForgeHudFooter`, `ForgeHudRail`, `ForgeLockIndicator` and
`ForgeNextAction`. See the [adapter contract](docs/hud-adapters.md). Run `npm run dev`
and open `/adapters.html` for the two-contract, two-skin proof. These are portable
presentation interfaces; no live application bindings are included.

## Backend activity

Optional producer-owned `activity` metadata adds Yellowjacket's five-bee formation
or NeuroForge's rotor, a stationary provider icon and status color treatments to
HUD surfaces. See [backend activity](docs/backend-activity.md) for the contract,
state precedence, reduced-motion behavior and provider asset provenance.
The workspace preview at `/adapters.html` includes backend, provider and state
controls. These are simulated; no backend telemetry or consumer rollout is implied.

## Origin-aware observation boundary

The [origin activity contract](docs/origin-activity.md) covers SMITH, Command,
Hephaestus, Beta, tarcie-reviewer, Author-Forge and other origins. Validated,
scoped observations can project into existing HUD surfaces through
`projectObservation`. Ordering guards are provided separately. This is a display
adapter proposal; authenticated feeds, producer adoption and live acceptance
remain open. Client scope checks do not implement tenant authorization.
