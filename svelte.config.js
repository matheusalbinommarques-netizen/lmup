import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // --- CORREÇÃO AQUI ---
  // De volta ao nível raiz, onde ele pertence.
  compilerOptions: {
    runes: true, // Ativa o modo Svelte 5
  },
  // --------------------

  preprocess: [vitePreprocess()],

  kit: {
    adapter: adapter(),
    // Removemos o compilerOptions daqui de dentro
  },
};

export default config;
