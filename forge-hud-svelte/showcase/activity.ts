import { mount } from 'svelte';
import Activity from './Activity.svelte';
import '../src/theme/grammar.css';
import './workspace.css';
mount(Activity, { target: document.getElementById('app')! });
