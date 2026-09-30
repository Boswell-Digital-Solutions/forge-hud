<script lang="ts">
  import type { DisplayModel } from '../grammar/types.js';
  import { activityState, parseActivity, PROVIDERS } from '../adapters/activity.js';
  import type { BackendActivity } from '../adapters/activity.js';
  let { model, activity, size = 'compact', showStatus = true }: {
    model: DisplayModel; activity: BackendActivity; size?: 'compact' | 'large'; showStatus?: boolean;
  } = $props();
  const identity = $derived(parseActivity(activity));
  const state = $derived(activityState(model));
  const provider = $derived(identity?.provider ? PROVIDERS[identity.provider] : null);
  const backend = $derived(identity?.backend === 'yellowjacket' ? 'Yellowjacket' : identity?.backend === 'neuroforge' ? 'NeuroForge' : 'Unknown backend');
</script>
<span class="backend-activity" data-size={size} data-tone={state.tone} data-moving={state.moving && !!identity} data-backend={identity?.backend ?? 'unknown'} data-contrast={model.profile?.contrast}>
  <span class="device" aria-hidden="true">
    {#if identity?.backend === 'yellowjacket'}
      <span class="flight">
        {#each [0,72,144,216,288] as angle}
          <span class="position" style={`--angle:${angle}deg`}><span class="bee"><i class="wing"></i><i class="wing right"></i><i class="body"></i></span></span>
        {/each}
      </span>
    {:else if identity?.backend === 'neuroforge'}
      <span class="ticks"></span><span class="sweep"></span>
    {/if}
    <span class="provider-icon">{#if provider?.icon}<img src={provider.icon} alt="" />{:else if identity?.provider === 'local'}<span aria-hidden="true">⌂</span>{:else}<span>?</span>{/if}</span>
  </span>
  <span class="identity">
    {#if showStatus}<strong>{state.label}</strong>{/if}
    <span>{backend}</span>
    <span class="provider-label">{state.lastReported ? 'Last reported: ' : ''}{provider?.label ?? 'Unknown provider'}{identity?.model ? ` · ${identity.model}` : ''}</span>
  </span>
</span>
<style>
  .backend-activity{--activity-tone:var(--t-neutral,#9aa6b2);display:inline-flex;gap:.65rem;align-items:center;max-width:100%;font-family:inherit;font-size:.8rem;line-height:1.4;font-weight:400;font-variation-settings:'wdth' 100;color:var(--activity-tone)}
  .backend-activity[data-tone='working']{--activity-tone:var(--t-working,#e3a24c)}
  .backend-activity[data-tone='attention']{--activity-tone:var(--t-attention,#86a8ea)}
  .backend-activity[data-tone='success']{--activity-tone:var(--t-success,#6dc49b)}
  .backend-activity[data-tone='warning']{--activity-tone:var(--t-warning,#e0a23a)}
  .backend-activity[data-tone='critical']{--activity-tone:var(--t-critical,#f0736a)}
  .identity{display:grid;min-width:0;overflow-wrap:anywhere;color:var(--ink,var(--forge-ui-text-primary,#e7ebef))}.identity strong{color:var(--activity-tone)}.provider-label{font-size:.75rem;color:var(--muted,var(--forge-ui-text-secondary,#cbd5e1))}
  .device{position:relative;display:inline-block;width:4.5rem;height:4.5rem;flex-shrink:0;container-type:inline-size}
  [data-size='large'] .device{width:8rem;height:8rem}[data-size='large']{gap:1rem}
  .flight{position:absolute;inset:0;animation:orbit 6s linear infinite}
  .position{position:absolute;inset:10%;transform:rotate(var(--angle))}
  .bee{position:absolute;left:calc(50% - 6cqw);top:-4cqw;width:12cqw;height:17cqw;transform:rotate(90deg)}
  .body{position:absolute;inset:15% 12% 5%;background:repeating-linear-gradient(to bottom,currentColor 0 3cqw,var(--panel,var(--forge-ui-surface-base,#111418)) 3cqw 4.5cqw);border:1px solid currentColor;border-radius:48%;z-index:2}
  .body:before{content:'';position:absolute;left:20%;top:-30%;width:3cqw;height:3cqw;background:currentColor;border-radius:50%}
  .wing{position:absolute;top:10%;width:7cqw;height:9cqw;border:1px solid currentColor;border-radius:70% 70% 40% 60%;background:var(--panel,var(--forge-ui-surface-base,#111418));left:-35%;transform:rotate(-35deg);animation:flutter .2s ease-in-out infinite alternate}
  .wing.right{left:auto;right:-35%;transform:rotate(35deg);animation-direction:alternate-reverse}
  .ticks,.sweep{position:absolute;inset:8%;border-radius:50%;mask:radial-gradient(circle,transparent 61%,#000 63%)}
  .ticks{background:repeating-conic-gradient(currentColor 0deg 18deg,transparent 18deg 30deg);opacity:.3}
  .sweep{background:conic-gradient(transparent 0deg 210deg,currentColor 320deg 360deg);animation:orbit 2.4s steps(12) infinite}
  .provider-icon{position:absolute;inset:34%;display:grid;place-items:center;background:white;color:#17212c;border-radius:15%;font-size:1rem}
  .provider-icon img{width:70%;height:70%;object-fit:contain}
  [data-moving='false'] .flight,[data-moving='false'] .wing,[data-moving='false'] .sweep{animation-play-state:paused}
  [data-tone='neutral'] .sweep{opacity:0}
  [data-contrast='high'] .ticks{opacity:.7}
  @keyframes orbit{to{transform:rotate(360deg)}}@keyframes flutter{to{scale:.75 1}}
  @media(prefers-reduced-motion:reduce){.flight,.wing,.sweep{animation:none!important}}
  @media(forced-colors:active){.backend-activity{--activity-tone:CanvasText!important}.provider-icon{forced-color-adjust:none}.ticks,.sweep,.body{forced-color-adjust:none}}
</style>
