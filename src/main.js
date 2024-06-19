import App from './App.svelte';
import { getAsset } from './utils/prepareAssets.js';
import './Tailwind.svelte';
getAsset('pdfjsLib');
const app = new App({
  target: document.body,
});

export default app;
