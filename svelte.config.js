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
    // IDs de projetos são locais: o host deve servir este fallback nas URLs internas.
    adapter: adapter({ fallback: '200.html' }),
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
