import { mount } from 'svelte';
import App from './App.svelte';
import '../src/theme/grammar.css';
import './style.css';
mount(App, { target: document.getElementById('app')! });
