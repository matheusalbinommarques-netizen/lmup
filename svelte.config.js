// svelte.config.js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  compilerOptions: {
    runes: true,
  },

  kit: {
    adapter: adapter(),
    prerender: {
      entries: ['*'],
    },
    // CORREÇÃO: Alias para Services (o jeito SvelteKit)
    alias: {
      $services: './src/services',
      '$services/*': './src/services/*',
    },
  },
};

export default config;
