// vitest.config.js
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],

  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts}'], // pega .js e .ts

    // ✅ Vitest server options (não é o server do Vite)
    server: {
      deps: {
        // inline módulos que precisam passar pelo Vite (ex.: Dexie)
        inline: ['dexie'],
        // se quiser, poderia externalizar algo com: external: ['react']
      },
    },
  },

  // (opcional) garante que o alias funcione nos testes também
  resolve: {
    alias: {
      $services: '/src/services',
    },
  },
});
