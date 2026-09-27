# Backend activity implementation — 2026-09-27

The approved motion study is implemented in the shared Svelte HUD: Yellowjacket
uses five bees rotating with fixed spacing and no drawn circle; NeuroForge uses
an instrument rotor. An unmodified provider icon remains stationary at the center.
OpenAI, Anthropic, Grok, Gemini and DeepSeek are supported, plus unknown-provider
fallback. Color and explicit text encode status separately from provider identity.

The optional adapter metadata is documented in
[the package contract](../../../forge-hud-svelte/docs/backend-activity.md).
The new component is used by the footer, rail, Next Action and workspace preview.
Existing consumers without activity metadata retain their original presentation.
No consumer repository was vendored forward and no live producer was connected.

All canonical roles have a preview, alongside stale/unknown freshness. Halt and
failure retain critical treatment, stale updates stop motion, and reduced-motion
preferences retain static identity. Completion never manufactures a receipt.
Malformed activity metadata cannot leave a partially usable action list.

Provider SVGs are pinned local third-party representations with an included MIT
license. The user will request necessary provider permissions. The asset notice
tracks pending release reviews; this implementation does not claim trademark
approval or that these are official provider-supplied release assets.

Verification: 116 unit/contract tests, Svelte check, package build, documentation
checker, and browser coverage for identity changes, all canonical state previews,
halt precedence, stale/unknown behavior, local icon loading, mobile layout,
reduced motion, keyboard controls, accessibility and visual regressions.
