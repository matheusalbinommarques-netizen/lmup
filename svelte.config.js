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
    adapter: adapter({
      fallback: 'index.html',
      strict: false,
    }),

    // ainda pode deixar o prerender entries, o adapter não vai mais quebrar
    prerender: {
      entries: ['*'],
    },

    // Alias para services
    alias: {
      $services: './src/services',
      '$services/*': './src/services/*',
    },
  },
};

export default config;
