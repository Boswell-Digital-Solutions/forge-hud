import { mount } from 'svelte';
import Stream from './Stream.svelte';
import '../src/theme/grammar.css';
import './workspace.css';
mount(Stream, { target: document.getElementById('app')! });
