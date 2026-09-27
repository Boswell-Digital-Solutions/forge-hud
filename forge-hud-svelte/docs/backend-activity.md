# Backend activity indicators

`ForgeBackendActivity` adds the approved five-bee Yellowjacket formation and
NeuroForge instrument rotor. The provider icon stays stationary. The bees retain
fixed spacing and have no visible circular track. Shape identifies the backend;
outer color and a text label communicate status. Provider icons never acquire
status colors.

Pass optional producer-owned metadata to the existing HUD adapter:

```ts
const hud = projectHud({
  snapshot, mapping, profile,
  activity: { backend: 'yellowjacket', provider: 'openai', model: 'producer-model-id' }
});
```

`backend` is `yellowjacket` or `neuroforge`; `provider` is `openai`, `anthropic`,
`grok`, `gemini`, `deepseek`, or null; `model` is nonempty text up to 120 characters
or null. All three fields are required when activity is supplied. Unknown IDs,
arbitrary asset URLs, and extra fields are rejected. Invalid adapter metadata
suppresses the action list. Identity never grants authority or changes role mapping.

The footer, rail and Next Action surfaces consume `hud.activity`. Lower-level
`ForgeProcessGlyph` and `ForgeStatusCapsule` accept optional `activity` directly.
Without it, existing presentations remain unchanged. `ForgeBackendActivity`
accepts `model`, `activity`, optional `size` (`compact`/`large`) and `showStatus`.

| State | Treatment |
| --- | --- |
| Working, scanning, verifying, orchestrating | Amber; animate while current/aging and valid |
| Awaiting authority, primed | Blue; static |
| Complete | Green; static; no evidence claim |
| Blocked, degraded or attention/blocked severity | Orange; static |
| Failed, halted or critical severity | Red; static |
| Idle | Neutral; static; last reported provider |
| Stale or unknown freshness | Neutral; static; explicit freshness text and last reported provider |
| Invalid model | Inert, unavailable presentation |

Halt/failure/critical remain red even if freshness is stale. Other uncertain updates
never imply active work or successful completion through animation/color. Profile
and OS reduced-motion preferences stop animation. Status and identity remain text
accessible; animation frames and the elapsed timer do not create announcements.

The producer must supply the actual routed provider/model for each snapshot,
including fallbacks. The package does not infer providers from backend names,
perform requests, count agents from bees, or establish a live telemetry connection.
Multiple simultaneous backends require separate models/indicators; the five bees
are a brand treatment, not a measured count of workers.

Visit `/adapters.html` to select either backend, any provider, or every canonical
role plus stale/unknown freshness. All preview values are synthetic and actions
remain disabled. Consumer repositories still require a separate vendor update.

Icon provenance and pending release permissions are recorded in
[the asset notice](../src/assets/providers/NOTICE.md). Do not treat inclusion here
as trademark clearance.
