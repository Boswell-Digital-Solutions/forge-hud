import { mount } from 'svelte';
import Adapters from './Adapters.svelte';
import '../src/theme/grammar.css';
import './workspace.css';
mount(Adapters, { target: document.getElementById('app')! });
