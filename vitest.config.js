import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitest.dev/config/
export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    // Configura o Vitest para rodar no 'jsdom'
    // Isso simula um ambiente de navegador
    environment: 'jsdom',
    // Inclui arquivos que terminam com .test.js
    include: ['src/**/*.{test,spec}.js'],
    // Configura os globals (describe, it, expect)
    globals: true,
  },
});
