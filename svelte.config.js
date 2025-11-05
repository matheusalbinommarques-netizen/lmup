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
      // isso diz "tenta prerender tudo"
      entries: ['*'],
    },
  },
};

export default config;
