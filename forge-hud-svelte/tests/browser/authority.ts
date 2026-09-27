import { mount } from 'svelte';
import AuthorityHarness from './AuthorityHarness.svelte';
import '../../src/theme/grammar.css';
mount(AuthorityHarness, { target: document.getElementById('test')! });
