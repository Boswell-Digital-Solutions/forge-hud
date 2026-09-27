<script lang="ts">
  import type { DisplayModel } from '../grammar/types.js';
  let { model }: { model: DisplayModel } = $props();
</script>
<span class="forge-lock">
  <span aria-hidden="true">{model.locked ? '⊘' : '○'}</span>
  {model.role === 'halted' ? 'System halted — interaction locked' : model.locked ? 'Interaction locked' : 'Interaction unlocked'}
</span>
