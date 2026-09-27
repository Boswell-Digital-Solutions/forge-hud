<script lang="ts">
 import { ForgeNextAction, ForgeStatusCapsule, projectState } from '../../src/index.js';
 let locked = $state(false);
 let simulation = $state(false);
 let halt = $state(false);
 let requests = $state(0);
 let model = $derived(projectState({source:'isolated-test',context:'fixture',nativeState:'WAIT',observedAt:'2026-09-27T12:00:00.000Z',severity:'attention',authority:'human-required',evidence:'unverified',freshness:'current',locked,simulation,reason:'Synthetic component test; callback only increments a local counter.',allowedActionIds:['review'],...(halt ? {emergencyHalt:{source:'test',reason:'Synthetic halt'}} : {})}, {version:1,owner:'test',mappings:[{source:'isolated-test',context:'fixture',nativeState:'WAIT',role:'awaiting_authority'}]}, {id:'test',language:'operator',density:'standard',motion:'reduced',contrast:'standard',sourceAccent:'#38bdf8'}));
</script>
<h1>Isolated synthetic test — no backend</h1>
<label><input type="checkbox" bind:checked={locked}>Lock</label>
<label><input type="checkbox" bind:checked={simulation}>Simulation flag</label>
<label><input type="checkbox" bind:checked={halt}>Halt</label>
<ForgeStatusCapsule {model}/>
<ForgeNextAction announce={false} hud={{model, sessionLabel:null, configurationIssues:[], actions:[{id:'review',label:'Request review'},{id:'unknown',label:'Unlisted action'}]}} onrequest={() => requests++}/>
<p>Requests: {requests}</p>
