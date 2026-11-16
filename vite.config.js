import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// SvelteKit 3: a configuração que vivia em svelte.config.js passa para o plugin.
export default defineConfig({
  plugins: [
    sveltekit({
      preprocess: vitePreprocess(),

      compilerOptions: {
        runes: true,
      },

      // IDs de projetos são locais: o host deve servir este fallback nas URLs internas.
      adapter: adapter({
        fallback: '200.html',
        ...(process.env.VITE_CAMP_PREVIEW === 'true' &&
        process.env.LMU_CAMP_OUTPUT
          ? {
              pages: process.env.LMU_CAMP_OUTPUT,
              assets: process.env.LMU_CAMP_OUTPUT,
            }
          : {}),
      }),
      prerender: {
        entries: ['*'],
      },
      // Mantém o comportamento do SvelteKit 2: o PWA cuida das atualizações.
      version: {
        pollInterval: 0,
      },
      // `alias` está obsoleto no SvelteKit 3 (preferem-se subpath imports),
      // mas continua suportado; migrar $lib/$services é um passo à parte.
      alias: {
        $lib: './src/lib',
        '$lib/*': './src/lib/*',
        $services: './src/services',
        '$services/*': './src/services/*',
      },
    }),
  ],
});
